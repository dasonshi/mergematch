from fastapi import APIRouter, HTTPException, Query, Header, Request, Depends
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
import logging

from app.db.supabase import get_supabase
from app.services.matching_service import run_scan
from app.core.security import AuthenticatedUser
from app.core.deps import get_user, get_auth_context, AuthContext
from app.core.rate_limit import limiter

logger = logging.getLogger(__name__)

router = APIRouter()


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


class MatchRuleCreate(BaseModel):
    name: str = Field(..., max_length=200)
    source_object: str = Field(..., max_length=50)  # contacts, companies, opportunities
    match_fields: List[MatchField]
    auto_merge_threshold: float = 95.0
    review_threshold: float = 70.0
    merge_strategy: str = Field("standard", max_length=50)
    schedule_frequency: str = Field("manual", max_length=50)
    is_active: bool = True
    merge_settings: Optional[MergeSettings] = None


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
        "merge_settings": rule.merge_settings.model_dump() if rule.merge_settings else {},
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
        "merge_settings": rule.merge_settings.model_dump() if rule.merge_settings else {},
    }

    result = supabase.table("match_rules").update(update_data).eq("id", rule_id).eq("location_id", user.location_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Rule not found")

    return result.data[0]


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
    limit: int = Query(None, description="Max records to scan (defaults based on plan)"),
):
    """Run a duplicate scan for this rule."""
    # Plan-based scan limits
    plan_limits = {
        "free": 1000,
        "starter": 99999,
        "pro": 99999,
        "agency": 99999,
    }
    max_limit = plan_limits.get(ctx.plan, 1000)
    actual_limit = min(limit, max_limit) if limit else max_limit

    try:
        result = await run_scan(
            ghl_location_id=ctx.ghl_location_id,
            rule_id=rule_id,
            access_token=ctx.access_token,
            tenant_id=ctx.tenant_id,
            internal_location_id=ctx.location_id,
            limit=actual_limit,
            plan=ctx.plan,  # Pass plan for auto_approve logic
        )

        # Update last_scan_at on the rule
        supabase = get_supabase()
        supabase.table("match_rules").update({
            "last_scan_at": "now()"
        }).eq("id", rule_id).execute()

        return result
    except Exception as e:
        logger.error(f"Scan failed for rule {rule_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Scan failed. Please try again.")
