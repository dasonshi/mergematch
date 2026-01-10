from fastapi import APIRouter, Header, Query
from pydantic import BaseModel
from typing import Optional, List

from app.core.security import get_current_user_flexible

router = APIRouter()


class JobCreate(BaseModel):
    name: str
    rule_ids: Optional[List[str]] = None  # None = all rules
    schedule_type: str  # manual, daily, weekly
    schedule_time: Optional[str] = None  # HH:MM
    schedule_day: Optional[int] = None  # 0-6 for weekly


@router.get("/")
async def list_jobs(
    authorization: Optional[str] = Header(None, alias="Authorization"),
    location_id: Optional[str] = Query(None, description="GHL Location ID (deprecated)"),
):
    """List scheduled dedup jobs."""
    user = await get_current_user_flexible(authorization=authorization, location_id=location_id)
    # TODO: Query jobs by user.location_id
    return {"data": [], "total": 0}


@router.post("/")
async def create_job(
    job: JobCreate,
    authorization: Optional[str] = Header(None, alias="Authorization"),
    location_id: Optional[str] = Query(None, description="GHL Location ID (deprecated)"),
):
    """Create a scheduled job."""
    user = await get_current_user_flexible(authorization=authorization, location_id=location_id)
    # TODO: Create job for user.location_id
    return {"id": "job-id", "location_id": user.location_id, **job.model_dump()}


@router.get("/{job_id}")
async def get_job(
    job_id: str,
    authorization: Optional[str] = Header(None, alias="Authorization"),
    location_id: Optional[str] = Query(None, description="GHL Location ID (deprecated)"),
):
    """Get job details and run history."""
    user = await get_current_user_flexible(authorization=authorization, location_id=location_id)
    # TODO: Verify job belongs to user.location_id
    return {"id": job_id, "location_id": user.location_id, "runs": []}


@router.post("/{job_id}/run")
async def trigger_job(
    job_id: str,
    authorization: Optional[str] = Header(None, alias="Authorization"),
    location_id: Optional[str] = Query(None, description="GHL Location ID (deprecated)"),
):
    """Manually trigger a job run."""
    user = await get_current_user_flexible(authorization=authorization, location_id=location_id)
    # TODO: Queue Celery task for user.location_id
    return {"id": job_id, "run_id": "run-id", "status": "queued"}


@router.delete("/{job_id}")
async def delete_job(
    job_id: str,
    authorization: Optional[str] = Header(None, alias="Authorization"),
    location_id: Optional[str] = Query(None, description="GHL Location ID (deprecated)"),
):
    """Delete a scheduled job."""
    user = await get_current_user_flexible(authorization=authorization, location_id=location_id)
    # TODO: Verify job belongs to user.location_id before deleting
    return {"deleted": True}


@router.get("/{job_id}/runs")
async def list_job_runs(
    job_id: str,
    limit: int = 10,
    authorization: Optional[str] = Header(None, alias="Authorization"),
    location_id: Optional[str] = Query(None, description="GHL Location ID (deprecated)"),
):
    """List run history for a job."""
    user = await get_current_user_flexible(authorization=authorization, location_id=location_id)
    # TODO: Query runs for job, verify job belongs to user.location_id
    return {"data": [], "total": 0}
