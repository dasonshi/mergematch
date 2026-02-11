"""
Celery worker entry point.
Run with: celery -A worker.celery_app worker --loglevel=info
"""
import logging
from datetime import datetime, timezone

from app.core.celery_app import celery_app
from app.db.supabase import get_supabase

# Import tasks to register them
from app.tasks import merge_tasks  # noqa: F401

logger = logging.getLogger(__name__)


def cleanup_stale_jobs():
    """Mark any bulk jobs stuck in running/pending as failed on startup.
    If the worker restarted, those jobs are dead."""
    try:
        supabase = get_supabase()
        stale_result = (
            supabase.table("bulk_jobs")
            .select("id")
            .in_("status", ["running", "pending"])
            .execute()
        )
        stale_jobs = stale_result.data or []
        for job in stale_jobs:
            supabase.table("bulk_jobs").update({
                "status": "failed",
                "completed_at": datetime.now(timezone.utc).isoformat(),
                "failed_items": [{"error": "Job interrupted by worker restart. Please retry."}],
            }).eq("id", job["id"]).execute()
        if stale_jobs:
            logger.info(f"Cleaned up {len(stale_jobs)} stale bulk jobs on startup")
    except Exception as e:
        logger.warning(f"Stale job cleanup failed: {e}")


# Run cleanup before accepting new tasks
cleanup_stale_jobs()

if __name__ == "__main__":
    celery_app.start()
