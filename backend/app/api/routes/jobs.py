from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter()


class JobCreate(BaseModel):
    name: str
    rule_ids: Optional[List[str]] = None  # None = all rules
    schedule_type: str  # manual, daily, weekly
    schedule_time: Optional[str] = None  # HH:MM
    schedule_day: Optional[int] = None  # 0-6 for weekly


@router.get("/")
async def list_jobs():
    """List scheduled dedup jobs."""
    return {"data": [], "total": 0}


@router.post("/")
async def create_job(job: JobCreate):
    """Create a scheduled job."""
    return {"id": "job-id", **job.model_dump()}


@router.get("/{job_id}")
async def get_job(job_id: str):
    """Get job details and run history."""
    return {"id": job_id, "runs": []}


@router.post("/{job_id}/run")
async def trigger_job(job_id: str):
    """Manually trigger a job run."""
    # TODO: Queue Celery task
    return {"id": job_id, "run_id": "run-id", "status": "queued"}


@router.delete("/{job_id}")
async def delete_job(job_id: str):
    """Delete a scheduled job."""
    return {"deleted": True}


@router.get("/{job_id}/runs")
async def list_job_runs(job_id: str, limit: int = 10):
    """List run history for a job."""
    return {"data": [], "total": 0}
