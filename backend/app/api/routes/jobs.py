"""
Jobs API - Job execution tracking and history.
"""
from fastapi import APIRouter, HTTPException, Query, Request, Depends
from typing import Optional
import logging

from app.db.supabase import get_supabase
from app.core.security import AuthenticatedUser
from app.core.deps import get_user
from app.core.rate_limit import limiter

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/")
@limiter.limit("100/minute")
async def list_jobs(
    request: Request,
    user: AuthenticatedUser = Depends(get_user),
    rule_id: Optional[str] = Query(None, description="Filter by rule ID"),
    status: Optional[str] = Query(None, description="Filter by status (running, completed, failed)"),
    limit: int = Query(20, ge=1, le=100, description="Maximum number of jobs to return"),
    offset: int = Query(0, ge=0, description="Number of jobs to skip"),
):
    """
    List job executions for the current location.
    Supports filtering by rule_id and status.
    """
    supabase = get_supabase()

    # Build query with rule name join
    query = supabase.table("job_executions").select(
        "*, match_rules(name)"
    ).eq("location_id", user.location_id)

    # Apply filters
    if rule_id:
        query = query.eq("rule_id", rule_id)
    if status:
        query = query.eq("status", status)

    # Order by most recent first and apply pagination
    query = query.order("started_at", desc=True).range(offset, offset + limit - 1)

    result = query.execute()

    # Get total count for pagination
    count_query = supabase.table("job_executions").select(
        "id", count="exact"
    ).eq("location_id", user.location_id)

    if rule_id:
        count_query = count_query.eq("rule_id", rule_id)
    if status:
        count_query = count_query.eq("status", status)

    count_result = count_query.execute()
    total = count_result.count if count_result.count is not None else len(result.data)

    return {
        "data": result.data,
        "total": total,
        "limit": limit,
        "offset": offset,
    }


@router.get("/{job_id}")
@limiter.limit("100/minute")
async def get_job(
    request: Request,
    job_id: str,
    user: AuthenticatedUser = Depends(get_user),
):
    """
    Get details of a specific job execution.
    """
    supabase = get_supabase()

    result = supabase.table("job_executions").select(
        "*, match_rules(name)"
    ).eq("id", job_id).eq("location_id", user.location_id).single().execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Job not found")

    return result.data
