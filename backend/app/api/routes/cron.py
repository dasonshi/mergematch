"""
Secure cron endpoints for scheduled job processing.
Only accessible via secret header from Render Cron Jobs.
"""
from fastapi import APIRouter, HTTPException, Header
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, Tuple
import logging
import uuid
import calendar
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from app.config import settings
from app.db.supabase import get_supabase
from app.services.matching_service import run_scan
from app.services.auth_service import get_location_tokens_with_refresh
from app.services.billing_service import get_plan_features
from app.services.bulk_merge_service import compute_merge_selections
from app.services.merge_service import execute_merge

router = APIRouter()
logger = logging.getLogger(__name__)
UTC = timezone.utc
SUNDAY_BASED_WEEKDAY_MAP = {
    "monday": 0,
    "tuesday": 1,
    "wednesday": 2,
    "thursday": 3,
    "friday": 4,
    "saturday": 5,
    "sunday": 6,
}
LOCATION_TIMEZONE_KEYS = (
    "schedule_timezone",
    "timezone",
    "time_zone",
    "timeZone",
    "iana_timezone",
    "ianaTimeZone",
)


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


def _utc_now() -> datetime:
    """Return timezone-aware UTC now."""
    return datetime.now(UTC)


def _parse_iso_datetime(value: Optional[str]) -> Optional[datetime]:
    """Parse ISO timestamp into timezone-aware UTC datetime."""
    if not value:
        return None
    try:
        normalized = value.strip()
        if normalized.endswith("Z"):
            normalized = normalized[:-1] + "+00:00"
        dt = datetime.fromisoformat(normalized)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=UTC)
        return dt.astimezone(UTC)
    except Exception:
        return None


def _parse_schedule_time(schedule_time: Optional[str]) -> Tuple[int, int]:
    """Parse HH:MM schedule time. Defaults to 00:00 when unset/invalid."""
    if not schedule_time:
        return 0, 0
    try:
        hour, minute = map(int, schedule_time.split(":"))
        if 0 <= hour <= 23 and 0 <= minute <= 59:
            return hour, minute
    except Exception:
        pass
    return 0, 0


def _scheduled_weekday(schedule_day: Optional[str]) -> Optional[int]:
    """Convert schedule_day to Python weekday (Mon=0..Sun=6)."""
    if schedule_day is None:
        return None

    day_text = str(schedule_day).strip().lower()
    if day_text in SUNDAY_BASED_WEEKDAY_MAP:
        return SUNDAY_BASED_WEEKDAY_MAP[day_text]

    try:
        raw_day = int(day_text)
        # Frontend sends 0=Sunday..6=Saturday.
        if 0 <= raw_day <= 6:
            return (raw_day + 6) % 7
    except ValueError:
        return None

    return None


def _scheduled_day_of_month(schedule_day: Optional[str]) -> Optional[int]:
    """Convert schedule_day to monthly day-of-month (1..28)."""
    if schedule_day is None:
        return None
    try:
        day = int(str(schedule_day).strip())
        if 1 <= day <= 28:
            return day
    except Exception:
        return None
    return None


def _daily_slot_on_or_before(dt: datetime, hour: int, minute: int) -> datetime:
    candidate = dt.replace(hour=hour, minute=minute, second=0, microsecond=0)
    if dt < candidate:
        candidate -= timedelta(days=1)
    return candidate


def _daily_slot_on_or_after(dt: datetime, hour: int, minute: int) -> datetime:
    candidate = dt.replace(hour=hour, minute=minute, second=0, microsecond=0)
    if dt > candidate:
        candidate += timedelta(days=1)
    return candidate


def _weekly_slot_on_or_before(dt: datetime, weekday: int, hour: int, minute: int) -> datetime:
    days_back = (dt.weekday() - weekday) % 7
    candidate = (dt - timedelta(days=days_back)).replace(
        hour=hour,
        minute=minute,
        second=0,
        microsecond=0,
    )
    if dt < candidate:
        candidate -= timedelta(days=7)
    return candidate


def _weekly_slot_on_or_after(dt: datetime, weekday: int, hour: int, minute: int) -> datetime:
    days_ahead = (weekday - dt.weekday()) % 7
    candidate = (dt + timedelta(days=days_ahead)).replace(
        hour=hour,
        minute=minute,
        second=0,
        microsecond=0,
    )
    if dt > candidate:
        candidate += timedelta(days=7)
    return candidate


def _shift_month(dt: datetime, months: int) -> datetime:
    month_index = dt.month - 1 + months
    year = dt.year + month_index // 12
    month = month_index % 12 + 1
    last_day = calendar.monthrange(year, month)[1]
    day = min(dt.day, last_day)
    return dt.replace(year=year, month=month, day=day)


def _monthly_datetime(dt: datetime, day_of_month: int, hour: int, minute: int) -> datetime:
    last_day = calendar.monthrange(dt.year, dt.month)[1]
    safe_day = min(day_of_month, last_day)
    return dt.replace(day=safe_day, hour=hour, minute=minute, second=0, microsecond=0)


def _monthly_slot_on_or_before(dt: datetime, day_of_month: int, hour: int, minute: int) -> datetime:
    candidate = _monthly_datetime(dt, day_of_month, hour, minute)
    if dt < candidate:
        candidate = _shift_month(candidate, -1)
    return candidate


def _monthly_slot_on_or_after(dt: datetime, day_of_month: int, hour: int, minute: int) -> datetime:
    candidate = _monthly_datetime(dt, day_of_month, hour, minute)
    if dt > candidate:
        candidate = _shift_month(candidate, 1)
    return candidate


def _next_slot_on_or_after(
    frequency: str,
    anchor_local: datetime,
    *,
    hour: int,
    minute: int,
    target_weekday: Optional[int],
    target_dom: Optional[int],
) -> datetime:
    if frequency == "daily":
        return _daily_slot_on_or_after(anchor_local, hour, minute)

    if frequency in {"weekly", "biweekly"}:
        weekday = target_weekday if target_weekday is not None else anchor_local.weekday()
        return _weekly_slot_on_or_after(anchor_local, weekday, hour, minute)

    if frequency == "monthly":
        day_of_month = target_dom if target_dom is not None else anchor_local.day
        return _monthly_slot_on_or_after(anchor_local, day_of_month, hour, minute)

    return anchor_local


def _resolve_schedule_timezone(rule: Dict[str, Any], location: Dict[str, Any]) -> str:
    """Resolve schedule timezone (rule-level first, then location settings, then UTC)."""
    candidates = []

    direct_rule_tz = rule.get("schedule_timezone")
    if isinstance(direct_rule_tz, str) and direct_rule_tz.strip():
        candidates.append(direct_rule_tz.strip())

    merge_settings = rule.get("merge_settings")
    if isinstance(merge_settings, dict):
        merged_rule_tz = merge_settings.get("schedule_timezone")
        if isinstance(merged_rule_tz, str) and merged_rule_tz.strip():
            candidates.append(merged_rule_tz.strip())

    location_settings = location.get("settings")
    if isinstance(location_settings, dict):
        for key in LOCATION_TIMEZONE_KEYS:
            location_tz = location_settings.get(key)
            if isinstance(location_tz, str) and location_tz.strip():
                candidates.append(location_tz.strip())

    for candidate in candidates:
        try:
            ZoneInfo(candidate)
            return candidate
        except ZoneInfoNotFoundError:
            logger.warning(f"Ignoring invalid schedule timezone '{candidate}'")

    return "UTC"


def should_run_now(
    schedule_frequency: str,
    last_scan_at: Optional[str],
    schedule_time: Optional[str] = None,
    schedule_day: Optional[str] = None,
    *,
    schedule_timezone: Optional[str] = None,
    created_at: Optional[str] = None,
    now_utc: Optional[datetime] = None,
) -> bool:
    """
    Determine if a rule should run based on its schedule.

    - hourly: run if last scan > 1 hour ago
    - daily/weekly/biweekly/monthly: run when the next scheduled slot has passed
      and the rule has not run for that slot yet (supports catch-up after missed cron windows)
    """
    if schedule_frequency == "manual":
        return False

    if now_utc is None:
        now_utc = _utc_now()
    elif now_utc.tzinfo is None:
        now_utc = now_utc.replace(tzinfo=UTC)
    else:
        now_utc = now_utc.astimezone(UTC)

    if schedule_frequency == "hourly":
        last_scan = _parse_iso_datetime(last_scan_at)
        if last_scan is None:
            return True
        return (now_utc - last_scan) >= timedelta(hours=1)

    tz_name = schedule_timezone or "UTC"
    try:
        schedule_tz = ZoneInfo(tz_name)
    except ZoneInfoNotFoundError:
        logger.warning(f"Invalid schedule timezone '{tz_name}', defaulting to UTC")
        schedule_tz = ZoneInfo("UTC")

    now_local = now_utc.astimezone(schedule_tz)
    hour, minute = _parse_schedule_time(schedule_time)
    target_weekday = _scheduled_weekday(schedule_day)
    target_dom = _scheduled_day_of_month(schedule_day)

    last_scan = _parse_iso_datetime(last_scan_at)
    if last_scan is None:
        created_at_dt = _parse_iso_datetime(created_at) or now_utc
        anchor_local = created_at_dt.astimezone(schedule_tz)
        first_slot = _next_slot_on_or_after(
            schedule_frequency,
            anchor_local,
            hour=hour,
            minute=minute,
            target_weekday=target_weekday,
            target_dom=target_dom,
        )
        return now_local >= first_slot

    last_scan_local = last_scan.astimezone(schedule_tz)

    if schedule_frequency == "daily":
        last_slot = _daily_slot_on_or_before(last_scan_local, hour, minute)
        next_slot = last_slot + timedelta(days=1)
        return now_local >= next_slot

    if schedule_frequency == "weekly":
        weekday = target_weekday if target_weekday is not None else last_scan_local.weekday()
        last_slot = _weekly_slot_on_or_before(last_scan_local, weekday, hour, minute)
        next_slot = last_slot + timedelta(days=7)
        return now_local >= next_slot

    if schedule_frequency == "biweekly":
        weekday = target_weekday if target_weekday is not None else last_scan_local.weekday()
        last_slot = _weekly_slot_on_or_before(last_scan_local, weekday, hour, minute)
        next_slot = last_slot + timedelta(days=14)
        return now_local >= next_slot

    if schedule_frequency == "monthly":
        day_of_month = target_dom if target_dom is not None else last_scan_local.day
        last_slot = _monthly_slot_on_or_before(last_scan_local, day_of_month, hour, minute)
        next_slot = _shift_month(last_slot, 1)
        return now_local >= next_slot

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
    plan: str,
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
                plan=plan,
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
    evaluation_now_utc = _utc_now()

    # Get all active rules with schedules (not manual)
    # Join with locations to get ghl_location_id and tenant plan
    rules_result = supabase.table("match_rules").select(
        "*, locations!inner(id, ghl_location_id, tenant_id, settings, tenants!inner(plan))"
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
                "error": "No CRM location ID found"
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
        schedule_timezone = _resolve_schedule_timezone(rule, location)
        if not should_run_now(
            rule.get("schedule_frequency", "manual"),
            rule.get("last_scan_at"),
            rule.get("schedule_time"),
            rule.get("schedule_day"),
            schedule_timezone=schedule_timezone,
            created_at=rule.get("created_at"),
            now_utc=evaluation_now_utc,
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
            "started_at": _utc_now().isoformat(),
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

            # Handle aborted scans (dataset too large for full scan)
            if result.get("scan_aborted"):
                supabase.table("job_executions").update({
                    "status": "failed",
                    "completed_at": _utc_now().isoformat(),
                    "error_message": result.get("message", "Scan aborted due to dataset size"),
                }).eq("id", job_id).execute()

                errors.append({
                    "rule_id": rule_id,
                    "rule_name": rule_name,
                    "error": result.get("message", "Scan aborted"),
                })
                continue

            auto_merged = 0
            auto_merge_failed = 0
            if features.auto_merge:
                auto_merged, auto_merge_failed = await _auto_merge_high_confidence_matches(
                    rule=rule,
                    access_token=tokens["access_token"],
                    ghl_location_id=ghl_location_id,
                    tenant_id=tenant_id,
                    internal_location_id=internal_location_id,
                    plan=plan,
                )

            # Update job execution with results
            supabase.table("job_executions").update({
                "status": "completed",
                "completed_at": _utc_now().isoformat(),
                "records_scanned": result.get("records_scanned", 0),
                "matches_found": result.get("matches_found", 0),
                "matches_stored": result.get("matches_stored", 0),
                "auto_merged": auto_merged,
            }).eq("id", job_id).execute()

            # Update last_scan_at
            supabase.table("match_rules").update({
                "last_scan_at": _utc_now().isoformat()
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
                "completed_at": _utc_now().isoformat(),
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
        "timestamp": _utc_now().isoformat(),
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

    now = _utc_now().isoformat()

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
    return {"status": "ok", "timestamp": _utc_now().isoformat()}
