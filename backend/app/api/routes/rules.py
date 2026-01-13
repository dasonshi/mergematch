from fastapi import APIRouter, HTTPException, Query, Header
from pydantic import BaseModel
from typing import List, Optional
import uuid
import logging

from app.db.supabase import get_supabase
from app.services.auth_service import get_location_tokens_with_refresh
from app.services.matching_service import run_scan
from app.core.security import get_current_user_flexible

logger = logging.getLogger(__name__)

router = APIRouter()


class MatchField(BaseModel):
    field: str
    algorithm: str  # exact, fuzzy, phone, email_domain, phonetic
    weight: float = 1.0
    operator: str = "AND"


class FieldPreservationMapping(BaseModel):
    source: str  # e.g., "email", "phone"
    target: str  # custom field ID or name


class FieldPreservationSettings(BaseModel):
    enabled: bool = False
    mappings: List[FieldPreservationMapping] = []


class MergeSettings(BaseModel):
    field_preservation: FieldPreservationSettings = FieldPreservationSettings()


class MatchRuleCreate(BaseModel):
    name: str
    source_object: str  # contacts, companies, opportunities
    match_fields: List[MatchField]
    auto_merge_threshold: float = 95.0
    review_threshold: float = 70.0
    merge_strategy: str = "standard"
    schedule_frequency: str = "manual"
    is_active: bool = True
    merge_settings: MergeSettings = MergeSettings()


@router.get("/")
async def list_rules(
    authorization: Optional[str] = Header(None, alias="Authorization"),
    location_id: Optional[str] = Query(None, description="GHL Location ID (legacy)"),
):
    """List all match rules for the current tenant."""
    user = await get_current_user_flexible(authorization=authorization, location_id=location_id)

    supabase = get_supabase()
    result = supabase.table("match_rules").select("*").eq("location_id", user.location_id).execute()

    return {"data": result.data, "total": len(result.data)}


@router.post("/")
async def create_rule(
    rule: MatchRuleCreate,
    authorization: Optional[str] = Header(None, alias="Authorization"),
    location_id: Optional[str] = Query(None, description="GHL Location ID (legacy)"),
):
    """Create a new match rule."""
    user = await get_current_user_flexible(authorization=authorization, location_id=location_id)

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
        "is_active": rule.is_active,
        "merge_settings": rule.merge_settings.model_dump(),
    }

    result = supabase.table("match_rules").insert(rule_data).execute()
    created_rule = result.data[0] if result.data else rule_data

    # Auto-trigger initial scan after rule creation
    initial_scan = None
    try:
        tokens = await get_location_tokens_with_refresh(user.ghl_location_id)
        if tokens:
            # Plan-based scan limits
            plan_limits = {
                "free": 1000,
                "starter": 99999,
                "pro": 99999,
                "agency": 99999,
            }
            scan_limit = plan_limits.get(user.plan, 1000)

            initial_scan = await run_scan(
                ghl_location_id=user.ghl_location_id,
                rule_id=rule_id,
                access_token=tokens["access_token"],
                tenant_id=user.tenant_id,
                internal_location_id=user.location_id,
                limit=scan_limit,
                plan=user.plan,
            )
            logger.info(f"Initial scan for rule {rule_id}: {initial_scan}")

            # Update last_scan_at
            supabase.table("match_rules").update({
                "last_scan_at": "now()"
            }).eq("id", rule_id).execute()
    except Exception as e:
        # Don't fail rule creation if scan fails
        logger.warning(f"Initial scan failed for rule {rule_id}: {e}")

    return {**created_rule, "initial_scan": initial_scan}


@router.get("/{rule_id}")
async def get_rule(
    rule_id: str,
    authorization: Optional[str] = Header(None, alias="Authorization"),
    location_id: Optional[str] = Query(None, description="GHL Location ID (legacy)"),
):
    """Get a specific match rule."""
    user = await get_current_user_flexible(authorization=authorization, location_id=location_id)

    supabase = get_supabase()
    result = supabase.table("match_rules").select("*").eq("id", rule_id).eq("location_id", user.location_id).single().execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Rule not found")

    return result.data


@router.put("/{rule_id}")
async def update_rule(
    rule_id: str,
    rule: MatchRuleCreate,
    authorization: Optional[str] = Header(None, alias="Authorization"),
    location_id: Optional[str] = Query(None, description="GHL Location ID (legacy)"),
):
    """Update a match rule."""
    user = await get_current_user_flexible(authorization=authorization, location_id=location_id)

    # Free tier: cannot edit rules
    if user.plan == "free":
        raise HTTPException(
            status_code=403,
            detail="Upgrade to edit match rules."
        )

    # Convert percentage thresholds to decimals if > 1
    auto_threshold = rule.auto_merge_threshold / 100 if rule.auto_merge_threshold > 1 else rule.auto_merge_threshold
    review_threshold = rule.review_threshold / 100 if rule.review_threshold > 1 else rule.review_threshold

    supabase = get_supabase()

    update_data = {
        "name": rule.name,
        "source_object": rule.source_object,
        "match_fields": [f.model_dump() for f in rule.match_fields],
        "auto_merge_threshold": auto_threshold,
        "review_threshold": review_threshold,
        "merge_strategy": rule.merge_strategy,
        "schedule_frequency": rule.schedule_frequency,
        "is_active": rule.is_active,
        "merge_settings": rule.merge_settings.model_dump(),
    }

    result = supabase.table("match_rules").update(update_data).eq("id", rule_id).eq("location_id", user.location_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Rule not found")

    return result.data[0]


@router.delete("/{rule_id}")
async def delete_rule(
    rule_id: str,
    authorization: Optional[str] = Header(None, alias="Authorization"),
    location_id: Optional[str] = Query(None, description="GHL Location ID (legacy)"),
):
    """Delete a match rule."""
    user = await get_current_user_flexible(authorization=authorization, location_id=location_id)

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
    authorization: Optional[str] = Header(None, alias="Authorization"),
    location_id: Optional[str] = Query(None, description="GHL Location ID (legacy)"),
):
    """Toggle a rule's active status."""
    user = await get_current_user_flexible(authorization=authorization, location_id=location_id)
    supabase = get_supabase()

    # Get current status
    current = supabase.table("match_rules").select("is_active").eq("id", rule_id).eq("location_id", user.location_id).single().execute()
    if not current.data:
        raise HTTPException(status_code=404, detail="Rule not found")

    new_status = not current.data["is_active"]

    result = supabase.table("match_rules").update({"is_active": new_status}).eq("id", rule_id).execute()

    return {"id": rule_id, "is_active": new_status}


@router.post("/{rule_id}/scan")
async def scan_rule(
    rule_id: str,
    authorization: Optional[str] = Header(None, alias="Authorization"),
    location_id: Optional[str] = Query(None, description="GHL Location ID (legacy)"),
    limit: int = Query(None, description="Max records to scan (defaults based on plan)"),
):
    """Run a duplicate scan for this rule."""
    user = await get_current_user_flexible(authorization=authorization, location_id=location_id)
    tokens = await get_location_tokens_with_refresh(user.ghl_location_id)
    if not tokens:
        raise HTTPException(status_code=401, detail="Location not authenticated or token refresh failed")

    # Plan-based scan limits
    plan_limits = {
        "free": 1000,
        "starter": 99999,
        "pro": 99999,
        "agency": 99999,
    }
    max_limit = plan_limits.get(user.plan, 1000)
    actual_limit = min(limit, max_limit) if limit else max_limit

    try:
        result = await run_scan(
            ghl_location_id=user.ghl_location_id,
            rule_id=rule_id,
            access_token=tokens["access_token"],
            tenant_id=user.tenant_id,
            internal_location_id=user.location_id,
            limit=actual_limit,
            plan=user.plan,  # Pass plan for auto_approve logic
        )

        # Update last_scan_at on the rule
        supabase = get_supabase()
        supabase.table("match_rules").update({
            "last_scan_at": "now()"
        }).eq("id", rule_id).execute()

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scan failed: {str(e)}")
