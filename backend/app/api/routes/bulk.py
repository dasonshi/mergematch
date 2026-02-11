"""
Bulk operations API routes.
Server-side bulk merge with progress tracking and cancellation support.
Uses Celery for reliable job queue processing when Redis is available.
"""
import os
import logging
from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, Request, Depends, BackgroundTasks

from app.core.deps import get_auth_context, AuthContext
from app.core.rate_limit import limiter
from app.services.bulk_merge_service import (
    create_bulk_job,
    get_bulk_job,
    request_cancellation,
    execute_bulk_merge,
)
from app.services.billing_service import check_merge_quota

logger = logging.getLogger(__name__)

router = APIRouter()

# Check if Celery/Redis is available
REDIS_URL = os.getenv("REDIS_URL")
USE_CELERY = bool(REDIS_URL)

if USE_CELERY:
    try:
        from app.tasks.merge_tasks import execute_bulk_merge_task
        logger.info("Celery task queue enabled (Redis available)")
    except ImportError as e:
        logger.warning(f"Celery import failed, using BackgroundTasks: {e}")
        USE_CELERY = False
else:
    logger.info("Celery disabled (no REDIS_URL), using BackgroundTasks")


class BulkMergeRequest(BaseModel):
    match_ids: List[str]
    rule_id: Optional[str] = None


class BulkJobResponse(BaseModel):
    job_id: str
    status: str
    total_count: int
    processed_count: int
    success_count: int
    failed_count: int
    cancel_requested: bool


@router.post("/merge")
@limiter.limit("10/minute")
async def start_bulk_merge(
    request: Request,
    body: BulkMergeRequest,
    background_tasks: BackgroundTasks,
    ctx: AuthContext = Depends(get_auth_context),
):
    """
    Start a server-side bulk merge operation.

    Returns immediately with a job_id that can be used to poll progress.
    Uses Celery for reliable processing when Redis is available,
    falls back to FastAPI BackgroundTasks otherwise.
    """
    if not body.match_ids:
        raise HTTPException(status_code=400, detail="No match IDs provided")

    if len(body.match_ids) > 10000:
        raise HTTPException(status_code=400, detail="Maximum 10000 matches per bulk operation")

    # Check merge quota before starting
    quota = await check_merge_quota(ctx.location_id, ctx.plan)
    if not quota["allowed"]:
        raise HTTPException(
            status_code=402,
            detail={
                "error": "merge_limit_exceeded",
                "message": f"Free plan allows {quota['limit']} merges. You've used {quota['used']}.",
                "used": quota["used"],
                "limit": quota["limit"],
            }
        )

    # Check if we have enough quota for all merges
    if quota["remaining"] < len(body.match_ids):
        logger.warning(
            f"Bulk merge may exceed quota: requesting {len(body.match_ids)}, "
            f"remaining {quota['remaining']}"
        )

    # Create bulk job record
    job = await create_bulk_job(
        tenant_id=ctx.tenant_id,
        location_id=ctx.location_id,
        rule_id=body.rule_id,
        match_ids=body.match_ids,
    )

    if not job:
        raise HTTPException(status_code=500, detail="Failed to create bulk job")

    # Start the merge job
    if USE_CELERY:
        # Use Celery task queue (reliable, retryable)
        execute_bulk_merge_task.delay(
            job_id=job["id"],
            tenant_id=ctx.tenant_id,
            location_id=ctx.location_id,
            rule_id=body.rule_id,
            match_ids=body.match_ids,
            ghl_location_id=ctx.ghl_location_id,
            plan=ctx.plan,
        )
        logger.info(f"Queued bulk merge job {job['id']} via Celery ({len(body.match_ids)} matches)")
    else:
        # Fallback to BackgroundTasks (less reliable)
        background_tasks.add_task(
            execute_bulk_merge,
            job_id=job["id"],
            tenant_id=ctx.tenant_id,
            location_id=ctx.location_id,
            rule_id=body.rule_id,
            match_ids=body.match_ids,
            access_token=ctx.access_token,
            ghl_location_id=ctx.ghl_location_id,
            plan=ctx.plan,
        )
        logger.info(f"Started bulk merge job {job['id']} via BackgroundTasks ({len(body.match_ids)} matches)")

    return {
        "job_id": job["id"],
        "status": "pending",
        "total_count": len(body.match_ids),
        "processed_count": 0,
        "success_count": 0,
        "failed_count": 0,
    }


@router.get("/{job_id}/status")
@limiter.limit("60/minute")
async def get_bulk_job_status(
    request: Request,
    job_id: str,
    ctx: AuthContext = Depends(get_auth_context),
):
    """
    Get the status and progress of a bulk merge job.

    Poll this endpoint to track progress of a running bulk merge.
    """
    job = await get_bulk_job(job_id, ctx.location_id)

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return {
        "job_id": job["id"],
        "status": job["status"],
        "total_count": job["total_count"],
        "processed_count": job["processed_count"],
        "success_count": job["success_count"],
        "failed_count": job["failed_count"],
        "cancel_requested": job["cancel_requested"],
        "started_at": job.get("started_at"),
        "completed_at": job.get("completed_at"),
        "failed_items": job.get("failed_items", []),
    }


@router.post("/{job_id}/cancel")
@limiter.limit("10/minute")
async def cancel_bulk_job(
    request: Request,
    job_id: str,
    ctx: AuthContext = Depends(get_auth_context),
):
    """
    Request cancellation of a running bulk merge job.

    The job will stop after completing the current batch of merges.
    Already completed merges will not be rolled back.
    """
    job = await get_bulk_job(job_id, ctx.location_id)

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if job["status"] not in ("pending", "running"):
        raise HTTPException(
            status_code=400,
            detail=f"Cannot cancel job with status: {job['status']}"
        )

    success = await request_cancellation(job_id, ctx.location_id)

    if not success:
        raise HTTPException(status_code=500, detail="Failed to request cancellation")

    logger.info(f"Cancellation requested for bulk job {job_id}")

    return {"message": "Cancellation requested", "job_id": job_id}
