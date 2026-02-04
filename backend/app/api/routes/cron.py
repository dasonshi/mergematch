"""
Secure cron endpoints for scheduled job processing.
Only accessible via secret header from Render Cron Jobs.
"""
from fastapi import APIRouter, HTTPException, Header
from datetime import datetime, timedelta
from typing import Optional
import logging

from app.config import settings
from app.db.supabase import get_supabase
from app.services.matching_service import run_scan
from app.services.auth_service import get_location_tokens_with_refresh
from app.services.billing_service import get_plan_features

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
    - weekly: run if last scan > 7 days ago AND correct day
    - monthly: run if last scan > 30 days ago
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

    if schedule_frequency == "hourly":
        return elapsed >= timedelta(hours=1)

    elif schedule_frequency == "daily":
        if elapsed < timedelta(hours=23):  # Give 1 hour buffer
            return False
        # Optionally check schedule_time (HH:MM)
        if schedule_time:
            try:
                target_hour = int(schedule_time.split(":")[0])
                if now.hour != target_hour:
                    return False
            except Exception:
                pass
        return True

    elif schedule_frequency == "weekly":
        if elapsed < timedelta(days=6, hours=23):
            return False
        # Check schedule_day (0=Monday, 6=Sunday or day name)
        if schedule_day:
            try:
                # Try parsing as int first
                target_day = int(schedule_day)
                if now.weekday() != target_day:
                    return False
            except ValueError:
                # Try parsing as day name
                day_map = {
                    "monday": 0, "tuesday": 1, "wednesday": 2,
                    "thursday": 3, "friday": 4, "saturday": 5, "sunday": 6
                }
                target_day = day_map.get(schedule_day.lower())
                if target_day is not None and now.weekday() != target_day:
                    return False
        return True

    elif schedule_frequency == "biweekly":
        return elapsed >= timedelta(days=14)

    elif schedule_frequency == "monthly":
        return elapsed >= timedelta(days=30)

    return False


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

        # Run the scan
        try:
            result = await run_scan(
                ghl_location_id=ghl_location_id,
                rule_id=rule_id,
                access_token=tokens["access_token"],
                tenant_id=tenant_id,
                internal_location_id=internal_location_id,
                limit=500,  # Higher limit for scheduled scans
            )

            # Update last_scan_at
            supabase.table("match_rules").update({
                "last_scan_at": datetime.utcnow().isoformat()
            }).eq("id", rule_id).execute()

            processed.append({
                "rule_id": rule_id,
                "rule_name": rule_name,
                "matches_found": result.get("matches_found", 0),
                "records_scanned": result.get("records_scanned", 0),
            })

            logger.info(f"Completed scheduled scan for rule '{rule_name}': {result}")

        except Exception as e:
            logger.error(f"Scan failed for rule '{rule_name}': {e}")
            errors.append({
                "rule_id": rule_id,
                "rule_name": rule_name,
                "error": str(e)
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
