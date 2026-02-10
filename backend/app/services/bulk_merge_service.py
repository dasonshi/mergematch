"""
Bulk merge service for server-side parallel merge execution.
"""
import asyncio
import logging
from typing import List, Dict, Optional
from datetime import datetime

from app.db.supabase import get_supabase
from app.services.merge_service import execute_merge
from app.services.billing_service import check_merge_quota
from app.services.auth_service import get_location_tokens, refresh_ghl_token

logger = logging.getLogger(__name__)

# Concurrency settings
MAX_CONCURRENT_MERGES = 5  # Limit parallel merges to avoid rate limiting


async def create_bulk_job(
    tenant_id: str,
    location_id: str,
    rule_id: Optional[str],
    match_ids: List[str],
) -> Dict:
    """Create a new bulk job record."""
    supabase = get_supabase()

    job_data = {
        "tenant_id": tenant_id,
        "location_id": location_id,
        "rule_id": rule_id,
        "match_ids": match_ids,
        "total_count": len(match_ids),
        "status": "pending",
    }

    result = supabase.table("bulk_jobs").insert(job_data).execute()
    return result.data[0] if result.data else None


async def get_bulk_job(job_id: str, location_id: str) -> Optional[Dict]:
    """Get bulk job by ID."""
    supabase = get_supabase()
    result = (
        supabase.table("bulk_jobs")
        .select("*")
        .eq("id", job_id)
        .eq("location_id", location_id)
        .single()
        .execute()
    )
    return result.data


async def update_bulk_job(job_id: str, updates: Dict) -> Dict:
    """Update bulk job record."""
    supabase = get_supabase()
    result = (
        supabase.table("bulk_jobs")
        .update(updates)
        .eq("id", job_id)
        .execute()
    )
    return result.data[0] if result.data else None


async def request_cancellation(job_id: str, location_id: str) -> bool:
    """Request job cancellation."""
    supabase = get_supabase()
    result = (
        supabase.table("bulk_jobs")
        .update({"cancel_requested": True})
        .eq("id", job_id)
        .eq("location_id", location_id)
        .execute()
    )
    return bool(result.data)


async def is_cancellation_requested(job_id: str) -> bool:
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


def compute_merge_selections(
    record_a: Dict,
    record_b: Dict,
    strategy: str,
    overwrite_blanks: bool = False,
    source_object: str = "contacts",
) -> tuple[str, Dict[str, str]]:
    """
    Compute master record ID and field selections based on merge strategy.
    Returns (master_id, field_selections).
    """
    if source_object == "contacts":
        fields = [
            "firstName", "lastName", "email", "phone", "tags",
            "address1", "city", "state", "postalCode", "companyName",
        ]
    else:
        # Non-contact merges (companies/opportunities/custom objects) should use dynamic fields.
        internal_fields = {
            "id", "_raw", "dateAdded", "dateUpdated", "createdAt", "updatedAt",
            "locationId", "location_id", "contact", "pipeline", "contacts",
            "opportunities", "relationships",
        }
        all_fields = set(record_a.keys()) | set(record_b.keys())
        fields = [f for f in all_fields if f not in internal_fields and not f.startswith("_")]

    id_a = record_a.get("id", "")
    id_b = record_b.get("id", "")

    # Determine master based on strategy
    if strategy == "recent":
        # Most recently created/updated is master
        date_a = record_a.get("dateUpdated") or record_a.get("dateAdded") or ""
        date_b = record_b.get("dateUpdated") or record_b.get("dateAdded") or ""
        master_id = id_a if date_a >= date_b else id_b
    elif strategy == "standard":
        # Record with more filled fields is master
        def count_filled(record: Dict) -> int:
            return sum(1 for f in fields if record.get(f))
        master_id = id_a if count_filled(record_a) >= count_filled(record_b) else id_b
    elif strategy == "oldest":
        # Oldest record is master
        date_a = record_a.get("dateAdded") or ""
        date_b = record_b.get("dateAdded") or ""
        master_id = id_a if date_a <= date_b else id_b
    else:
        # Default: standard - first record is master
        master_id = id_a

    # Compute field selections
    master = record_a if master_id == id_a else record_b
    duplicate = record_b if master_id == id_a else record_a

    selections = {}
    for field in fields:
        master_val = master.get(field)
        dup_val = duplicate.get(field)

        # Normalize empty values
        master_empty = master_val is None or master_val == "" or master_val == []
        dup_empty = dup_val is None or dup_val == "" or dup_val == []

        if master_empty and not dup_empty and not overwrite_blanks:
            # Fill blank master field from duplicate
            selections[field] = "b" if master_id == id_a else "a"
        else:
            # Keep master value
            selections[field] = "a" if master_id == id_a else "b"

    return master_id, selections


async def process_single_merge(
    match_id: str,
    rules_cache: Dict[str, Dict],
    access_token: str,
    ghl_location_id: str,
    tenant_id: str,
    internal_location_id: str,
    semaphore: asyncio.Semaphore,
) -> Dict:
    """Process a single merge operation with rate limiting."""
    async with semaphore:
        supabase = get_supabase()

        try:
            # Fetch match details
            match_result = (
                supabase.table("match_pairs")
                .select("*")
                .eq("id", match_id)
                .eq("location_id", internal_location_id)
                .single()
                .execute()
            )

            if not match_result.data:
                return {"match_id": match_id, "success": False, "error": "Match not found"}

            match = match_result.data

            # Skip if already merged or not pending
            if match.get("status") != "pending":
                return {"match_id": match_id, "success": False, "error": f"Match status is {match.get('status')}"}

            # Look up rule for this specific match
            match_rule_id = match.get("rule_id")
            if match_rule_id and match_rule_id not in rules_cache:
                rule_result = (
                    supabase.table("match_rules")
                    .select("*")
                    .eq("id", match_rule_id)
                    .single()
                    .execute()
                )
                rules_cache[match_rule_id] = rule_result.data if rule_result.data else {}

            rule = rules_cache.get(match_rule_id, {}) if match_rule_id else {}

            record_a = match.get("record_a_data", {})
            record_b = match.get("record_b_data", {})

            strategy = rule.get("merge_strategy", "standard")
            overwrite_blanks = rule.get("merge_settings", {}).get("overwrite_blanks", False)

            # Check if this is a custom object merge
            source_object = rule.get("source_object", "contacts")

            # Compute merge parameters
            master_id, selections = compute_merge_selections(
                record_a, record_b, strategy, overwrite_blanks, source_object
            )

            # Get field preservation mappings from rule if available
            mappings = None
            field_preservation = rule.get("merge_settings", {}).get("field_preservation", {})
            if field_preservation.get("enabled"):
                mappings = field_preservation.get("mappings", [])

            # Execute the merge
            result = await execute_merge(
                match_id=match_id,
                master_record_id=master_id,
                field_selections=selections,
                access_token=access_token,
                ghl_location_id=ghl_location_id,
                tenant_id=tenant_id,
                internal_location_id=internal_location_id,
                preserve_alternates=field_preservation.get("enabled", False),
                field_preservation_mappings=mappings,
            )

            return {"match_id": match_id, "success": True, "merge_id": result.get("id")}

        except Exception as e:
            logger.error(f"Merge failed for match {match_id}: {str(e)}")
            return {"match_id": match_id, "success": False, "error": str(e)}


async def execute_bulk_merge(
    job_id: str,
    tenant_id: str,
    location_id: str,
    rule_id: Optional[str],
    match_ids: List[str],
    access_token: str,
    ghl_location_id: str,
    plan: str,
) -> None:
    """
    Execute bulk merge operation with parallel processing.
    Updates job progress in database for frontend polling.
    """
    supabase = get_supabase()

    # Mark job as running
    await update_bulk_job(job_id, {
        "status": "running",
        "started_at": datetime.utcnow().isoformat(),
    })

    # Fetch fresh tokens to avoid stale token issues in background task
    try:
        tokens = await get_location_tokens(ghl_location_id)
        if tokens:
            access_token = tokens["access_token"]
            logger.info(f"Bulk job {job_id}: Using fresh token for {ghl_location_id}")
        else:
            # Try refreshing the token
            refreshed = await refresh_ghl_token(ghl_location_id)
            if refreshed:
                access_token = refreshed["access_token"]
                logger.info(f"Bulk job {job_id}: Refreshed token for {ghl_location_id}")
            else:
                await update_bulk_job(job_id, {
                    "status": "failed",
                    "completed_at": datetime.utcnow().isoformat(),
                    "failed_items": [{"error": "Failed to get valid access token"}],
                })
                logger.error(f"Bulk job {job_id}: Could not get valid token")
                return
    except Exception as e:
        logger.warning(f"Bulk job {job_id}: Token fetch error ({e}), using provided token")

    # Create shared rules cache for per-match rule lookup
    # If a specific rule_id was provided, pre-populate the cache with it
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

    # Create semaphore for rate limiting
    semaphore = asyncio.Semaphore(MAX_CONCURRENT_MERGES)

    success_count = 0
    failed_count = 0
    failed_items = []
    processed_count = 0

    # Process in chunks to allow progress updates and cancellation checks
    CHUNK_SIZE = 10

    try:
        for i in range(0, len(match_ids), CHUNK_SIZE):
            # Check for cancellation
            try:
                if await is_cancellation_requested(job_id):
                    await update_bulk_job(job_id, {
                        "status": "cancelled",
                        "completed_at": datetime.utcnow().isoformat(),
                        "processed_count": processed_count,
                        "success_count": success_count,
                        "failed_count": failed_count,
                        "failed_items": failed_items,
                    })
                    logger.info(f"Bulk job {job_id} cancelled after {processed_count} merges")
                    return
            except Exception as e:
                logger.warning(f"Bulk job {job_id}: cancellation check failed: {e}")

            # Check merge quota (with error handling)
            try:
                quota = await check_merge_quota(location_id, plan)
                if not quota["allowed"]:
                    await update_bulk_job(job_id, {
                        "status": "failed",
                        "completed_at": datetime.utcnow().isoformat(),
                        "processed_count": processed_count,
                        "success_count": success_count,
                        "failed_count": failed_count,
                        "failed_items": [{"error": "Merge quota exceeded"}] + failed_items,
                    })
                    logger.warning(f"Bulk job {job_id} stopped - merge quota exceeded")
                    return
            except Exception as e:
                logger.warning(f"Bulk job {job_id}: quota check failed ({e}), continuing")

            # Refresh token every 50 merges to avoid expiration during long operations
            if processed_count > 0 and processed_count % 50 == 0:
                try:
                    tokens = await get_location_tokens(ghl_location_id)
                    if tokens:
                        access_token = tokens["access_token"]
                except Exception:
                    pass  # Continue with current token

            chunk = match_ids[i:i + CHUNK_SIZE]

            # Process chunk in parallel
            tasks = [
                process_single_merge(
                    match_id=mid,
                    rules_cache=rules_cache,
                    access_token=access_token,
                    ghl_location_id=ghl_location_id,
                    tenant_id=tenant_id,
                    internal_location_id=location_id,
                    semaphore=semaphore,
                )
                for mid in chunk
            ]

            results = await asyncio.gather(*tasks, return_exceptions=True)

            # Process results
            for result in results:
                processed_count += 1

                if isinstance(result, Exception):
                    failed_count += 1
                    failed_items.append({"error": str(result)})
                elif result.get("success"):
                    success_count += 1
                else:
                    failed_count += 1
                    failed_items.append({
                        "match_id": result.get("match_id"),
                        "error": result.get("error"),
                    })

            # Update progress in database
            try:
                await update_bulk_job(job_id, {
                    "processed_count": processed_count,
                    "success_count": success_count,
                    "failed_count": failed_count,
                })
            except Exception as e:
                logger.error(f"Bulk job {job_id}: failed to update progress: {e}")

            logger.info(f"Bulk job {job_id}: processed {processed_count}/{len(match_ids)}")

    except Exception as e:
        logger.error(f"Bulk job {job_id} failed with error: {e}")
        try:
            await update_bulk_job(job_id, {
                "status": "failed",
                "completed_at": datetime.utcnow().isoformat(),
                "processed_count": processed_count,
                "success_count": success_count,
                "failed_count": failed_count,
                "failed_items": [{"error": f"Job failed: {str(e)}"}] + failed_items,
            })
        except Exception as update_error:
            logger.error(f"Bulk job {job_id}: failed to update status after error: {update_error}")
        return

    # Mark job as completed
    await update_bulk_job(job_id, {
        "status": "completed",
        "completed_at": datetime.utcnow().isoformat(),
        "processed_count": processed_count,
        "success_count": success_count,
        "failed_count": failed_count,
        "failed_items": failed_items,
    })

    logger.info(f"Bulk job {job_id} completed: {success_count} success, {failed_count} failed")
