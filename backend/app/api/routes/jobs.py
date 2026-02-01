from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional, List

from app.core.security import AuthenticatedUser
from app.core.deps import get_user

router = APIRouter()


class JobCreate(BaseModel):
    name: str
    rule_ids: Optional[List[str]] = None  # None = all rules
    schedule_type: str  # manual, daily, weekly
    schedule_time: Optional[str] = None  # HH:MM
    schedule_day: Optional[int] = None  # 0-6 for weekly


@router.get("/")
async def list_jobs(
    user: AuthenticatedUser = Depends(get_user),
):
    """List scheduled dedup jobs."""
    # TODO: Query jobs by user.location_id
    return {"data": [], "total": 0}


@router.post("/")
async def create_job(
    job: JobCreate,
    user: AuthenticatedUser = Depends(get_user),
):
    """Create a scheduled job."""
    # TODO: Create job for user.location_id
    return {"id": "job-id", "location_id": user.location_id, **job.model_dump()}


@router.get("/{job_id}")
async def get_job(
    job_id: str,
    user: AuthenticatedUser = Depends(get_user),
):
    """Get job details and run history."""
    # TODO: Verify job belongs to user.location_id
    return {"id": job_id, "location_id": user.location_id, "runs": []}


@router.post("/{job_id}/run")
async def trigger_job(
    job_id: str,
    user: AuthenticatedUser = Depends(get_user),
):
    """Manually trigger a job run."""
    # TODO: Queue Celery task for user.location_id
    return {"id": job_id, "run_id": "run-id", "status": "queued"}


@router.delete("/{job_id}")
async def delete_job(
    job_id: str,
    user: AuthenticatedUser = Depends(get_user),
):
    """Delete a scheduled job."""
    # TODO: Verify job belongs to user.location_id before deleting
    return {"deleted": True}


@router.get("/{job_id}/runs")
async def list_job_runs(
    job_id: str,
    limit: int = 10,
    user: AuthenticatedUser = Depends(get_user),
):
    """List run history for a job."""
    # TODO: Query runs for job, verify job belongs to user.location_id
    return {"data": [], "total": 0}
