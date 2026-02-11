"""
Celery tasks for bulk merge operations.
Provides reliable, retryable merge processing with progress tracking.
"""
import asyncio
import logging
from datetime import datetime
from typing import List, Dict, Optional

from celery.exceptions import SoftTimeLimitExceeded
import httpx

from app.core.celery_app import celery_app
from app.db.supabase import get_supabase
from app.services.bulk_merge_service import process_single_merge
from app.services.billing_service import check_merge_quota
from app.services.auth_service import get_location_tokens, refresh_ghl_token

logger = logging.getLogger(__name__)


def update_job_progress(job_id: str, updates: Dict) -> None:
    """Update bulk job record (sync version for Celery)."""
    supabase = get_supabase()
    supabase.table("bulk_jobs").update(updates).eq("id", job_id).execute()


def is_job_cancelled(job_id: str) -> bool:
    """Check if cancellation was requested for a job."""
    supabase = get_supabase()
    result = (
        supabase.table("bulk_jobs")
        .select("cancel_requested")
        .eq("id", job_id)
        .single()
        .execute()
    )
    return result.data.get("cancel_requested", False) if result.data else False


@celery_app.task(
    bind=True,
    max_retries=3,
    default_retry_delay=60,
    autoretry_for=(ConnectionError, TimeoutError, httpx.TransportError),
    retry_backoff=True,
)
def execute_bulk_merge_task(
    self,
    job_id: str,
    tenant_id: str,
    location_id: str,
    rule_id: Optional[str],
    match_ids: List[str],
    ghl_location_id: str,
    plan: str,
) -> Dict:
    """
    Celery task for bulk merge operations.

    Features:
    - Automatic retry on failure (up to 3 times)
    - Progress tracking in database
    - Cancellation support
    - Token refresh for long operations
    """
    logger.info(f"Starting bulk merge task {job_id} with {len(match_ids)} matches")

    # Mark job as running
    update_job_progress(job_id, {
        "status": "running",
        "started_at": datetime.utcnow().isoformat(),
    })

    supabase = get_supabase()

    # Get fresh access token
    try:
        tokens = asyncio.run(get_location_tokens(ghl_location_id))
        if tokens:
            access_token = tokens["access_token"]
            logger.info(f"Bulk job {job_id}: Got fresh token")
        else:
            # Try refreshing
            refreshed = asyncio.run(refresh_ghl_token(ghl_location_id))
            if refreshed:
                access_token = refreshed["access_token"]
            else:
                update_job_progress(job_id, {
                    "status": "failed",
                    "completed_at": datetime.utcnow().isoformat(),
                    "failed_items": [{"error": "Failed to get valid access token"}],
                })
                return {"status": "failed", "error": "No valid token"}
    except Exception as e:
        logger.error(f"Token fetch failed: {e}")
        update_job_progress(job_id, {
            "status": "failed",
            "completed_at": datetime.utcnow().isoformat(),
            "failed_items": [{"error": f"Token error: {str(e)}"}],
        })
        return {"status": "failed", "error": str(e)}

    # Shared per-match rules cache to match BackgroundTasks behavior.
    rules_cache: Dict[str, Dict] = {}
    if rule_id:
        rule_result = (
            supabase.table("match_rules")
            .select("*")
            .eq("id", rule_id)
            .eq("location_id", location_id)
            .single()
            .execute()
        )
        if rule_result.data:
            rules_cache[rule_id] = rule_result.data

    success_count = 0
    failed_count = 0
    failed_items = []
    processed_count = 0

    try:
        for i, match_id in enumerate(match_ids):
            # Check for cancellation every 10 items
            if i % 10 == 0 and is_job_cancelled(job_id):
                update_job_progress(job_id, {
                    "status": "cancelled",
                    "completed_at": datetime.utcnow().isoformat(),
                    "processed_count": processed_count,
                    "success_count": success_count,
                    "failed_count": failed_count,
                    "failed_items": failed_items,
                })
                logger.info(f"Bulk job {job_id} cancelled at {processed_count}/{len(match_ids)}")
                return {"status": "cancelled", "processed": processed_count}

            # Check quota every 10 items
            if i % 10 == 0:
                try:
                    quota = asyncio.run(check_merge_quota(location_id, plan))
                    if not quota["allowed"]:
                        update_job_progress(job_id, {
                            "status": "failed",
                            "completed_at": datetime.utcnow().isoformat(),
                            "processed_count": processed_count,
                            "success_count": success_count,
                            "failed_count": failed_count,
                            "failed_items": [{"error": "Merge quota exceeded"}] + failed_items,
                        })
                        return {"status": "failed", "error": "quota_exceeded"}
                except Exception as e:
                    logger.warning(f"Quota check failed: {e}")

            # Refresh token every 50 items
            if i > 0 and i % 50 == 0:
                try:
                    tokens = asyncio.run(get_location_tokens(ghl_location_id))
                    if tokens:
                        access_token = tokens["access_token"]
                except Exception:
                    pass

            # Process the merge
            try:
                result = asyncio.run(process_single_merge(
                    match_id=match_id,
                    rules_cache=rules_cache,
                    access_token=access_token,
                    ghl_location_id=ghl_location_id,
                    tenant_id=tenant_id,
                    internal_location_id=location_id,
                    semaphore=asyncio.Semaphore(1),
                    plan=plan,
                ))

                processed_count += 1

                if result.get("success"):
                    success_count += 1
                else:
                    failed_count += 1
                    failed_items.append({
                        "match_id": result.get("match_id"),
                        "error": result.get("error"),
                    })

            except Exception as e:
                processed_count += 1
                failed_count += 1
                failed_items.append({"match_id": match_id, "error": str(e)})

            # Update progress every 5 items
            if processed_count % 5 == 0:
                update_job_progress(job_id, {
                    "processed_count": processed_count,
                    "success_count": success_count,
                    "failed_count": failed_count,
                })
                logger.info(f"Bulk job {job_id}: {processed_count}/{len(match_ids)}")

    except SoftTimeLimitExceeded:
        logger.warning(f"Bulk job {job_id} hit time limit at {processed_count}/{len(match_ids)}")
        update_job_progress(job_id, {
            "status": "failed",
            "completed_at": datetime.utcnow().isoformat(),
            "processed_count": processed_count,
            "success_count": success_count,
            "failed_count": failed_count,
            "failed_items": [{"error": "Task time limit exceeded"}] + failed_items,
        })
        # Re-raise to trigger retry
        raise

    except Exception as e:
        logger.error(f"Bulk job {job_id} failed: {e}")
        update_job_progress(job_id, {
            "status": "failed",
            "completed_at": datetime.utcnow().isoformat(),
            "processed_count": processed_count,
            "success_count": success_count,
            "failed_count": failed_count,
            "failed_items": [{"error": str(e)}] + failed_items,
        })
        raise

    # Mark completed
    update_job_progress(job_id, {
        "status": "completed",
        "completed_at": datetime.utcnow().isoformat(),
        "processed_count": processed_count,
        "success_count": success_count,
        "failed_count": failed_count,
        "failed_items": failed_items,
    })

    logger.info(f"Bulk job {job_id} completed: {success_count} success, {failed_count} failed")

    return {
        "status": "completed",
        "processed": processed_count,
        "success": success_count,
        "failed": failed_count,
    }
