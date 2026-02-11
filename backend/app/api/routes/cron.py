"""
Secure cron endpoints for scheduled job processing.
Only accessible via secret header from Render Cron Jobs.
"""
from fastapi import APIRouter, HTTPException, Header
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, Tuple
import logging
import uuid

from app.config import settings
from app.db.supabase import get_supabase
from app.services.matching_service import run_scan
from app.services.auth_service import get_location_tokens_with_refresh
from app.services.billing_service import get_plan_features
from app.services.bulk_merge_service import compute_merge_selections
from app.services.merge_service import execute_merge

router = APIRouter()
logger = logging.getLogger(__name__)


def verify_cron_secret(x_cron_secret: Optional[str]) -> bool:
    """Verify the cron job is from our Render deployment."""
    expected = settings.CRON_SECRET
    if not expected:
        # Allow in development if no secret set
        if settings.ENVIRONMENT == "development":
            return True
        raise HTTPException(status_code=401, detail="Cron secret not configured")
    if not x_cron_secret or x_cron_secret != expected:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return True


def should_run_now(
    schedule_frequency: str,
    last_scan_at: Optional[str],
    schedule_time: Optional[str] = None,
    schedule_day: Optional[str] = None,
) -> bool:
    """
    Determine if a rule should run based on its schedule.

    - hourly: run if last scan > 1 hour ago
    - daily: run if last scan > 24 hours ago
    - weekly: run if last scan > 7 days ago, on configured weekday/time
    - biweekly: run if last scan > 14 days ago, on configured weekday/time
    - monthly: run on configured day-of-month/time, after ~1 month elapsed
    """
    if schedule_frequency == "manual":
        return False

    now = datetime.utcnow()

    if not last_scan_at:
        return True  # Never run, should run now

    # Parse last scan time
    try:
        last_scan_str = last_scan_at.replace("Z", "").replace("+00:00", "")
        last_scan = datetime.fromisoformat(last_scan_str)
    except Exception:
        return True  # Invalid date, run now

    elapsed = now - last_scan

    def _matches_scheduled_hour() -> bool:
        if not schedule_time:
            return True
        try:
            target_hour = int(schedule_time.split(":")[0])
            return now.hour == target_hour
        except Exception:
            return True

    def _scheduled_weekday() -> Optional[int]:
        """Convert schedule_day to Python weekday (Mon=0..Sun=6)."""
        if not schedule_day:
            return None

        try:
            raw_day = int(schedule_day)
            # Frontend sends 0=Sunday..6=Saturday.
            if 0 <= raw_day <= 6:
                return (raw_day + 6) % 7
        except ValueError:
            pass

        day_map = {
            "monday": 0, "tuesday": 1, "wednesday": 2,
            "thursday": 3, "friday": 4, "saturday": 5, "sunday": 6
        }
        return day_map.get(str(schedule_day).lower())

    if schedule_frequency == "hourly":
        return elapsed >= timedelta(hours=1)

    elif schedule_frequency == "daily":
        if elapsed < timedelta(hours=23):  # Give 1 hour buffer
            return False
        return _matches_scheduled_hour()

    elif schedule_frequency == "weekly":
        if elapsed < timedelta(days=6, hours=23):
            return False
        target_weekday = _scheduled_weekday()
        if target_weekday is not None and now.weekday() != target_weekday:
            return False
        return _matches_scheduled_hour()

    elif schedule_frequency == "biweekly":
        if elapsed < timedelta(days=13, hours=23):
            return False
        target_weekday = _scheduled_weekday()
        if target_weekday is not None and now.weekday() != target_weekday:
            return False
        return _matches_scheduled_hour()

    elif schedule_frequency == "monthly":
        # Use 27-day floor so short months can still run near intended cadence.
        if elapsed < timedelta(days=27):
            return False
        if schedule_day:
            try:
                target_dom = int(schedule_day)
                if now.day != target_dom:
                    return False
            except ValueError:
                pass
        return _matches_scheduled_hour()

    return False


def _normalized_auto_threshold(rule: Dict[str, Any]) -> float:
    """Return auto-merge threshold as a 0-1 decimal."""
    threshold_raw = float(rule.get("auto_merge_threshold", 0.95))
    return threshold_raw / 100 if threshold_raw > 1 else threshold_raw


async def _auto_merge_high_confidence_matches(
    *,
    rule: Dict[str, Any],
    access_token: str,
    ghl_location_id: str,
    tenant_id: str,
    internal_location_id: str,
) -> Tuple[int, int]:
    """
    Auto-merge pending matches for a rule above its threshold.
    Returns (merged_count, failed_count).
    """
    supabase = get_supabase()
    rule_id = rule["id"]
    source_object = rule.get("source_object", "contacts")
    merge_strategy = rule.get("merge_strategy", "standard")
    merge_settings = rule.get("merge_settings") or {}
    overwrite_blanks = bool(merge_settings.get("overwrite_blanks", False))

    preservation = merge_settings.get("field_preservation") or {}
    preserve_alternates = bool(preservation.get("enabled"))
    field_preservation_mappings = preservation.get("mappings") or []
    if not preserve_alternates:
        field_preservation_mappings = None

    auto_threshold = _normalized_auto_threshold(rule)

    matches_result = (
        supabase.table("match_pairs")
        .select("id, record_a_data, record_b_data")
        .eq("location_id", internal_location_id)
        .eq("rule_id", rule_id)
        .eq("status", "pending")
        .gte("confidence_score", auto_threshold)
        .order("confidence_score", desc=True)
        .execute()
    )

    matches = matches_result.data or []
    if not matches:
        return 0, 0

    merged_count = 0
    failed_count = 0

    for match in matches:
        record_a = match.get("record_a_data") or {}
        record_b = match.get("record_b_data") or {}
        match_id = match["id"]

        master_id, selections = compute_merge_selections(
            record_a,
            record_b,
            merge_strategy,
            overwrite_blanks,
            source_object,
        )

        try:
            await execute_merge(
                match_id=match_id,
                master_record_id=master_id,
                field_selections=selections,
                access_token=access_token,
                ghl_location_id=ghl_location_id,
                tenant_id=tenant_id,
                internal_location_id=internal_location_id,
                preserve_alternates=preserve_alternates,
                field_preservation_mappings=field_preservation_mappings,
            )
            merged_count += 1
        except Exception as e:
            failed_count += 1
            logger.warning(f"Auto-merge skipped for match {match_id}: {e}")

    return merged_count, failed_count


@router.post("/process-scheduled-scans")
async def process_scheduled_scans(
    x_cron_secret: Optional[str] = Header(None, alias="X-Cron-Secret")
):
    """
    Process all scheduled scans that are due to run.
    Called by Render Cron Job every hour.
    """
    verify_cron_secret(x_cron_secret)

    logger.info("Starting scheduled scan processing")
    supabase = get_supabase()

    # Get all active rules with schedules (not manual)
    # Join with locations to get ghl_location_id and tenant plan
    rules_result = supabase.table("match_rules").select(
        "*, locations!inner(id, ghl_location_id, tenant_id, tenants!inner(plan))"
    ).eq("is_active", True).neq("schedule_frequency", "manual").execute()

    rules = rules_result.data or []
    logger.info(f"Found {len(rules)} scheduled rules to check")

    processed = []
    skipped = []
    errors = []

    for rule in rules:
        rule_id = rule["id"]
        rule_name = rule.get("name", "Unnamed")
        location = rule.get("locations", {})
        ghl_location_id = location.get("ghl_location_id")
        internal_location_id = location.get("id")
        tenant = location.get("tenants", {})
        plan = tenant.get("plan", "free")
        tenant_id = location.get("tenant_id")

        if not ghl_location_id:
            errors.append({
                "rule_id": rule_id,
                "error": "No GHL location ID found"
            })
            continue

        # Check plan allows scheduled scans
        features = get_plan_features(plan)
        if not features.scheduled_scans:
            skipped.append({
                "rule_id": rule_id,
                "rule_name": rule_name,
                "reason": f"Plan '{plan}' does not support scheduled scans"
            })
            continue

        # Check if rule is due to run
        if not should_run_now(
            rule.get("schedule_frequency", "manual"),
            rule.get("last_scan_at"),
            rule.get("schedule_time"),
            rule.get("schedule_day"),
        ):
            skipped.append({
                "rule_id": rule_id,
                "rule_name": rule_name,
                "reason": "Not due to run yet"
            })
            continue

        # Get tokens for the location
        tokens = await get_location_tokens_with_refresh(ghl_location_id)
        if not tokens:
            errors.append({
                "rule_id": rule_id,
                "rule_name": rule_name,
                "error": "Could not get access tokens"
            })
            continue

        # Create job execution record for this scheduled scan
        job_id = str(uuid.uuid4())
        job_data = {
            "id": job_id,
            "tenant_id": tenant_id,
            "location_id": internal_location_id,
            "rule_id": rule_id,
            "status": "running",
            "trigger_type": "scheduled",
            "started_at": datetime.utcnow().isoformat(),
        }
        supabase.table("job_executions").insert(job_data).execute()

        # Run the scan
        try:
            result = await run_scan(
                ghl_location_id=ghl_location_id,
                rule_id=rule_id,
                access_token=tokens["access_token"],
                tenant_id=tenant_id,
                internal_location_id=internal_location_id,
                plan=plan,
            )

            auto_merged = 0
            auto_merge_failed = 0
            if features.auto_merge:
                auto_merged, auto_merge_failed = await _auto_merge_high_confidence_matches(
                    rule=rule,
                    access_token=tokens["access_token"],
                    ghl_location_id=ghl_location_id,
                    tenant_id=tenant_id,
                    internal_location_id=internal_location_id,
                )

            # Update job execution with results
            supabase.table("job_executions").update({
                "status": "completed",
                "completed_at": datetime.utcnow().isoformat(),
                "records_scanned": result.get("records_scanned", 0),
                "matches_found": result.get("matches_found", 0),
                "matches_stored": result.get("matches_stored", 0),
                "auto_merged": auto_merged,
            }).eq("id", job_id).execute()

            # Update last_scan_at
            supabase.table("match_rules").update({
                "last_scan_at": datetime.utcnow().isoformat()
            }).eq("id", rule_id).execute()

            processed.append({
                "rule_id": rule_id,
                "rule_name": rule_name,
                "job_id": job_id,
                "matches_found": result.get("matches_found", 0),
                "auto_merged": auto_merged,
                "auto_merge_failed": auto_merge_failed,
                "records_scanned": result.get("records_scanned", 0),
            })

            logger.info(f"Completed scheduled scan for rule '{rule_name}': {result}")

        except Exception as e:
            # Update job execution with error
            error_msg = str(e)[:500]
            supabase.table("job_executions").update({
                "status": "failed",
                "completed_at": datetime.utcnow().isoformat(),
                "error_message": error_msg,
            }).eq("id", job_id).execute()

            logger.error(f"Scan failed for rule '{rule_name}': {e}")
            errors.append({
                "rule_id": rule_id,
                "rule_name": rule_name,
                "job_id": job_id,
                "error": error_msg
            })

    summary = {
        "processed": len(processed),
        "skipped": len(skipped),
        "errors": len(errors),
        "timestamp": datetime.utcnow().isoformat(),
    }

    logger.info(f"Scheduled scan processing complete: {summary}")

    return {
        **summary,
        "details": {
            "processed": processed,
            "skipped": skipped,
            "errors": errors,
        }
    }


@router.post("/cleanup-expired-snapshots")
async def cleanup_expired_snapshots(
    x_cron_secret: Optional[str] = Header(None, alias="X-Cron-Secret")
):
    """
    Delete expired snapshots to free up storage.
    Called by Render Cron Job daily.

    Snapshots expire 30 days after the merge was completed.
    """
    verify_cron_secret(x_cron_secret)

    logger.info("Starting expired snapshot cleanup")
    supabase = get_supabase()

    now = datetime.utcnow().isoformat()

    # Delete all snapshots where expires_at is in the past
    result = supabase.table("snapshots").delete().lt("expires_at", now).execute()

    deleted_count = len(result.data) if result.data else 0
    logger.info(f"Cleaned up {deleted_count} expired snapshots")

    return {
        "deleted_count": deleted_count,
        "timestamp": now,
    }


@router.get("/health")
async def cron_health(
    x_cron_secret: Optional[str] = Header(None, alias="X-Cron-Secret")
):
    """Health check for cron system."""
    verify_cron_secret(x_cron_secret)
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}
