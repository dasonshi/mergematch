from fastapi import APIRouter, HTTPException, Header, Request, Depends
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid
import logging
import re
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from app.db.supabase import get_supabase
from app.services.matching_service import run_scan
from app.services.billing_service import get_plan_features
from app.core.security import AuthenticatedUser
from app.core.deps import get_user, get_auth_context, AuthContext
from app.core.rate_limit import limiter

logger = logging.getLogger(__name__)

router = APIRouter()
MERGEABLE_OBJECTS = {"contacts", "companies", "opportunities"}
SCHEDULE_FREQUENCIES = {"manual", "hourly", "daily", "weekly", "biweekly", "monthly"}
TIME_PATTERN = re.compile(r"^\d{2}:\d{2}$")


class MatchField(BaseModel):
    field: str
    algorithm: str  # exact, fuzzy, fuzzy90, phone, email_domain, phonetic
    weight: float = 1.0
    operator: str = "AND"
    match_against: Optional[str] = None  # Cross-field matching: compare field vs match_against


class FieldPreservationMapping(BaseModel):
    source: str  # e.g., "email", "phone"
    target: str  # custom field ID or name


class FieldPreservationSettings(BaseModel):
    enabled: bool = False
    mappings: List[FieldPreservationMapping] = []


class CustomLogicCondition(BaseModel):
    id: str
    field: str
    operator: str
    value: str
    valueType: str = "static"
    parentValue: Optional[str] = None  # For cascading dropdowns


class CustomLogicConfig(BaseModel):
    operator: str = "AND"
    conditions: List[CustomLogicCondition] = []


class RelatedRecordsSettings(BaseModel):
    notes: Optional[str] = "copy_to_master"  # copy_to_master, dont_copy
    tasks: Optional[str] = "copy_to_master"
    opportunities: Optional[str] = "keep_all"  # keep_all, keep_master_only, keep_highest_value, custom_logic
    opportunities_custom_logic: Optional[CustomLogicConfig] = None


class MergeSettings(BaseModel):
    overwrite_blanks: Optional[bool] = False
    field_preservation: Optional[FieldPreservationSettings] = None
    related_records: Optional[RelatedRecordsSettings] = None
    # Stored in merge_settings for backward-compatible persistence without schema changes.
    schedule_timezone: Optional[str] = None


class MatchRuleCreate(BaseModel):
    name: str = Field(..., max_length=200)
    source_object: str = Field(..., max_length=50)  # contacts, companies, opportunities, custom_objects.*
    match_fields: List[MatchField]
    auto_merge_threshold: float = 95.0
    review_threshold: float = 70.0
    merge_strategy: str = Field("oldest", max_length=50)
    schedule_frequency: str = Field("manual", max_length=50)
    schedule_time: Optional[str] = None  # HH:MM format (e.g., "06:00")
    schedule_day: Optional[str] = None   # Day of week (0-6) or day of month (1-28)
    schedule_timezone: Optional[str] = None  # IANA timezone (e.g., "America/New_York")
    is_active: bool = True
    merge_settings: Optional[MergeSettings] = None


def _validate_rule_access(rule: MatchRuleCreate, user: AuthenticatedUser) -> None:
    """Enforce plan-based feature gates on the backend."""
    features = get_plan_features(user.plan)
    is_custom_object = rule.source_object.startswith("custom_objects.")

    if rule.source_object == "companies" and not features.company_matching:
        raise HTTPException(status_code=403, detail="Upgrade required for company matching.")
    if rule.source_object == "opportunities" and not features.opportunity_matching:
        raise HTTPException(status_code=403, detail="Upgrade required for opportunity matching.")
    if is_custom_object and not features.custom_object_matching:
        raise HTTPException(status_code=403, detail="Upgrade required for custom object matching.")
    if rule.schedule_frequency != "manual" and not features.scheduled_scans:
        raise HTTPException(status_code=403, detail="Upgrade required for scheduled scans.")


def _normalize_schedule_fields(rule: MatchRuleCreate) -> tuple[Optional[str], Optional[str], Optional[str]]:
    """Validate and normalize schedule fields for storage."""
    frequency = rule.schedule_frequency
    schedule_time = rule.schedule_time
    schedule_day = rule.schedule_day
    schedule_timezone = (
        rule.schedule_timezone
        or (rule.merge_settings.schedule_timezone if rule.merge_settings else None)
    )
    if schedule_timezone is not None:
        schedule_timezone = schedule_timezone.strip() or None

    if frequency not in SCHEDULE_FREQUENCIES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid schedule frequency '{frequency}'. Supported values: {', '.join(sorted(SCHEDULE_FREQUENCIES))}",
        )

    if frequency == "manual":
        return None, None, None

    if schedule_timezone:
        try:
            ZoneInfo(schedule_timezone)
        except ZoneInfoNotFoundError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid schedule_timezone '{schedule_timezone}'. Use a valid IANA timezone.",
            )

    if schedule_time:
        if not TIME_PATTERN.match(schedule_time):
            raise HTTPException(status_code=400, detail="schedule_time must be HH:MM format.")
        try:
            hour, minute = map(int, schedule_time.split(":"))
            from datetime import time as dt_time
            dt_time(hour, minute)  # Validates ranges inherently
        except (ValueError, TypeError):
            raise HTTPException(status_code=400, detail="schedule_time must be a valid time.")

        # Scheduled scans run on hourly cron boundaries, so persist top-of-hour values.
        schedule_time = f"{hour:02d}:00"

    if frequency in {"hourly", "daily"}:
        return schedule_time, None, schedule_timezone

    if frequency in {"weekly", "biweekly"}:
        if schedule_day:
            day = schedule_day.strip().lower()
            day_map = {
                "monday", "tuesday", "wednesday",
                "thursday", "friday", "saturday", "sunday",
            }
            if day in day_map:
                pass
            else:
                try:
                    day_int = int(schedule_day)
                    if not (0 <= day_int <= 6):
                        raise ValueError
                except Exception:
                    raise HTTPException(
                        status_code=400,
                        detail="schedule_day for weekly/biweekly must be 0-6 (Sunday=0) or day name.",
                    )
        return schedule_time, schedule_day, schedule_timezone

    # monthly
    if schedule_day:
        try:
            day_int = int(schedule_day)
            if not (1 <= day_int <= 28):
                raise ValueError
        except Exception:
            raise HTTPException(
                status_code=400,
                detail="schedule_day for monthly schedules must be 1-28.",
            )
    return schedule_time, schedule_day, schedule_timezone


def _build_merge_settings_payload(rule: MatchRuleCreate, schedule_timezone: Optional[str]) -> Dict[str, Any]:
    merge_settings_payload = rule.merge_settings.model_dump() if rule.merge_settings else {}
    if schedule_timezone:
        merge_settings_payload["schedule_timezone"] = schedule_timezone
    else:
        merge_settings_payload.pop("schedule_timezone", None)
    return merge_settings_payload


@router.get("/")
@limiter.limit("100/minute")
async def list_rules(
    request: Request,
    user: AuthenticatedUser = Depends(get_user),
):
    """List all match rules for the current tenant."""
    supabase = get_supabase()
    result = supabase.table("match_rules").select("*").eq("location_id", user.location_id).order("created_at", desc=True).execute()

    return {"data": result.data, "total": len(result.data)}


@router.post("/")
async def create_rule(
    rule: MatchRuleCreate,
    user: AuthenticatedUser = Depends(get_user),
):
    """Create a new match rule."""
    # Validate source_object
    is_custom_object = rule.source_object.startswith("custom_objects.")

    if not is_custom_object and rule.source_object not in MERGEABLE_OBJECTS:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Cannot create rule for '{rule.source_object}'. "
                "Supported types: contacts, companies, opportunities, custom_objects.*"
            ),
        )
    _validate_rule_access(rule, user)
    schedule_time, schedule_day, schedule_timezone = _normalize_schedule_fields(rule)

    supabase = get_supabase()

    # Free tier: limit to 1 rule
    if user.plan == "free":
        existing_rules = supabase.table("match_rules").select("id").eq("location_id", user.location_id).execute()
        if len(existing_rules.data) >= 1:
            raise HTTPException(
                status_code=403,
                detail="Free plan is limited to 1 match rule. Upgrade to create more rules."
            )

    rule_id = str(uuid.uuid4())
    # Convert percentage thresholds to decimals if > 1 (e.g., 95 -> 0.95)
    auto_threshold = rule.auto_merge_threshold / 100 if rule.auto_merge_threshold > 1 else rule.auto_merge_threshold
    review_threshold = rule.review_threshold / 100 if rule.review_threshold > 1 else rule.review_threshold
    merge_settings_payload = _build_merge_settings_payload(rule, schedule_timezone)

    rule_data = {
        "id": rule_id,
        "tenant_id": user.tenant_id,
        "location_id": user.location_id,
        "name": rule.name,
        "source_object": rule.source_object,
        "match_fields": [f.model_dump() for f in rule.match_fields],
        "auto_merge_threshold": auto_threshold,
        "review_threshold": review_threshold,
        "merge_strategy": rule.merge_strategy,
        "schedule_frequency": rule.schedule_frequency,
        "schedule_time": schedule_time,
        "schedule_day": schedule_day,
        "is_active": rule.is_active,
        "merge_settings": merge_settings_payload,
    }

    result = supabase.table("match_rules").insert(rule_data).execute()
    created_rule = result.data[0] if result.data else rule_data
    logger.info(f"Rule {rule_id} created successfully")

    # Return immediately - frontend will trigger initial scan via separate endpoint
    # This avoids timeout issues and matches the manual scan flow
    return {**created_rule, "scan_pending": True}


@router.get("/{rule_id}")
async def get_rule(
    rule_id: str,
    user: AuthenticatedUser = Depends(get_user),
):
    """Get a specific match rule."""
    supabase = get_supabase()
    result = supabase.table("match_rules").select("*").eq("id", rule_id).eq("location_id", user.location_id).single().execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Rule not found")

    return result.data


@router.put("/{rule_id}")
async def update_rule(
    rule_id: str,
    rule: MatchRuleCreate,
    user: AuthenticatedUser = Depends(get_user),
):
    """Update a match rule."""
    # Validate source_object
    is_custom_object = rule.source_object.startswith("custom_objects.")

    if not is_custom_object and rule.source_object not in MERGEABLE_OBJECTS:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Cannot update rule for '{rule.source_object}'. "
                "Supported types: contacts, companies, opportunities, custom_objects.*"
            ),
        )
    _validate_rule_access(rule, user)
    schedule_time, schedule_day, schedule_timezone = _normalize_schedule_fields(rule)

    # Free tier: cannot edit rules
    if user.plan == "free":
        raise HTTPException(
            status_code=403,
            detail="Upgrade to edit match rules."
        )

    supabase = get_supabase()

    # Fetch existing rule to compare matching criteria
    existing = supabase.table("match_rules").select(
        "match_fields, auto_merge_threshold, review_threshold, source_object"
    ).eq("id", rule_id).eq("location_id", user.location_id).single().execute()

    if not existing.data:
        raise HTTPException(status_code=404, detail="Rule not found")

    # Convert percentage thresholds to decimals if > 1
    auto_threshold = rule.auto_merge_threshold / 100 if rule.auto_merge_threshold > 1 else rule.auto_merge_threshold
    review_threshold = rule.review_threshold / 100 if rule.review_threshold > 1 else rule.review_threshold
    merge_settings_payload = _build_merge_settings_payload(rule, schedule_timezone)

    # Detect if matching criteria changed
    new_match_fields = [f.model_dump() for f in rule.match_fields]
    criteria_changed = (
        existing.data["match_fields"] != new_match_fields
        or existing.data["auto_merge_threshold"] != auto_threshold
        or existing.data["review_threshold"] != review_threshold
        or existing.data["source_object"] != rule.source_object
    )

    update_data = {
        "name": rule.name,
        "source_object": rule.source_object,
        "match_fields": new_match_fields,
        "auto_merge_threshold": auto_threshold,
        "review_threshold": review_threshold,
        "merge_strategy": rule.merge_strategy,
        "schedule_frequency": rule.schedule_frequency,
        "schedule_time": schedule_time,
        "schedule_day": schedule_day,
        "is_active": rule.is_active,
        "merge_settings": merge_settings_payload,
    }

    result = supabase.table("match_rules").update(update_data).eq("id", rule_id).eq("location_id", user.location_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Rule not found")

    # If matching criteria changed, delete pending match pairs
    deleted_count = 0
    if criteria_changed:
        delete_result = (
            supabase.table("match_pairs")
            .delete()
            .eq("rule_id", rule_id)
            .eq("location_id", user.location_id)
            .eq("status", "pending")
            .execute()
        )
        deleted_count = len(delete_result.data) if delete_result.data else 0
        logger.info(f"Rule {rule_id} criteria changed - deleted {deleted_count} pending matches")

    return {
        **result.data[0],
        "criteria_changed": criteria_changed,
        "deleted_matches": deleted_count,
    }


@router.delete("/{rule_id}")
async def delete_rule(
    rule_id: str,
    user: AuthenticatedUser = Depends(get_user),
):
    """Delete a match rule."""
    # Free tier: cannot delete rules
    if user.plan == "free":
        raise HTTPException(
            status_code=403,
            detail="Upgrade to delete match rules."
        )

    supabase = get_supabase()
    supabase.table("match_rules").delete().eq("id", rule_id).eq("location_id", user.location_id).execute()

    return {"deleted": True}


@router.patch("/{rule_id}/toggle")
async def toggle_rule_status(
    rule_id: str,
    user: AuthenticatedUser = Depends(get_user),
):
    """Toggle a rule's active status."""
    supabase = get_supabase()

    # Get current status
    current = supabase.table("match_rules").select("is_active").eq("id", rule_id).eq("location_id", user.location_id).single().execute()
    if not current.data:
        raise HTTPException(status_code=404, detail="Rule not found")

    new_status = not current.data["is_active"]

    result = supabase.table("match_rules").update({"is_active": new_status}).eq("id", rule_id).eq("location_id", user.location_id).execute()

    return {"id": rule_id, "is_active": new_status}


@router.post("/{rule_id}/scan")
async def scan_rule(
    rule_id: str,
    ctx: AuthContext = Depends(get_auth_context),
):
    """Run a duplicate scan for this rule. Scans all records."""
    try:
        result = await run_scan(
            ghl_location_id=ctx.ghl_location_id,
            rule_id=rule_id,
            access_token=ctx.access_token,
            tenant_id=ctx.tenant_id,
            internal_location_id=ctx.location_id,
            plan=ctx.plan,
        )

        if result.get("scan_aborted"):
            raise HTTPException(
                status_code=409,
                detail=result.get("message", "Scan aborted due to dataset size"),
            )

        # Update last_scan_at on the rule
        supabase = get_supabase()
        supabase.table("match_rules").update({
            "last_scan_at": datetime.utcnow().isoformat()
        }).eq("id", rule_id).execute()

        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Scan failed for rule {rule_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Scan failed. Please try again.")


@router.post("/{rule_id}/run")
async def run_rule_manually(
    rule_id: str,
    ctx: AuthContext = Depends(get_auth_context),
):
    """
    Manually trigger a duplicate scan for this rule with job tracking.
    Creates a job_execution record to track progress and results.
    """
    supabase = get_supabase()

    # Verify rule exists and belongs to this location
    rule_result = supabase.table("match_rules").select("id, name").eq(
        "id", rule_id
    ).eq("location_id", ctx.location_id).single().execute()

    if not rule_result.data:
        raise HTTPException(status_code=404, detail="Rule not found")

    # Create job execution record
    job_id = str(uuid.uuid4())
    job_data = {
        "id": job_id,
        "tenant_id": ctx.tenant_id,
        "location_id": ctx.location_id,
        "rule_id": rule_id,
        "status": "running",
        "trigger_type": "manual",
        "started_at": datetime.utcnow().isoformat(),
    }
    supabase.table("job_executions").insert(job_data).execute()

    try:
        result = await run_scan(
            ghl_location_id=ctx.ghl_location_id,
            rule_id=rule_id,
            access_token=ctx.access_token,
            tenant_id=ctx.tenant_id,
            internal_location_id=ctx.location_id,
            plan=ctx.plan,
        )

        # Handle aborted scans (dataset too large for full scan)
        if result.get("scan_aborted"):
            supabase.table("job_executions").update({
                "status": "failed",
                "completed_at": datetime.utcnow().isoformat(),
                "error_message": result.get("message", "Scan aborted due to dataset size"),
            }).eq("id", job_id).execute()

            return {
                "job_id": job_id,
                "status": "failed",
                **result,
            }

        # Update job execution with results
        supabase.table("job_executions").update({
            "status": "completed",
            "completed_at": datetime.utcnow().isoformat(),
            "records_scanned": result.get("records_scanned", 0),
            "matches_found": result.get("matches_found", 0),
            "matches_stored": result.get("matches_stored", 0),
            "auto_merged": result.get("auto_merged", 0),
        }).eq("id", job_id).execute()

        # Update last_scan_at on the rule
        supabase.table("match_rules").update({
            "last_scan_at": datetime.utcnow().isoformat()
        }).eq("id", rule_id).execute()

        return {
            "job_id": job_id,
            "status": "completed",
            **result,
        }

    except Exception as e:
        # Update job execution with error
        error_msg = str(e)[:500]  # Truncate long error messages
        supabase.table("job_executions").update({
            "status": "failed",
            "completed_at": datetime.utcnow().isoformat(),
            "error_message": error_msg,
        }).eq("id", job_id).execute()

        logger.error(f"Manual scan failed for rule {rule_id}: {error_msg}")
        raise HTTPException(status_code=500, detail="Scan failed. Please try again.")
