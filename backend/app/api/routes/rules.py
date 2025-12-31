from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
import uuid

from app.db.supabase import get_supabase
from app.services.auth_service import get_location_tokens
from app.services.matching_service import run_scan

router = APIRouter()


class MatchField(BaseModel):
    field: str
    algorithm: str  # exact, fuzzy, phone, email_domain, phonetic
    weight: float = 1.0
    operator: str = "AND"


class MatchRuleCreate(BaseModel):
    name: str
    source_object: str  # contacts, companies, opportunities
    match_fields: List[MatchField]
    auto_merge_threshold: float = 95.0
    review_threshold: float = 70.0
    merge_strategy: str = "standard"
    schedule_frequency: str = "manual"
    is_active: bool = True


@router.get("/")
async def list_rules(location_id: str = Query(..., description="GHL Location ID")):
    """List all match rules for the current tenant."""
    tokens = await get_location_tokens(location_id)
    if not tokens:
        raise HTTPException(status_code=401, detail="Location not authenticated")

    # Use internal UUID location_id from tokens lookup
    internal_location_id = tokens["location_id"]

    supabase = get_supabase()
    result = supabase.table("match_rules").select("*").eq("location_id", internal_location_id).execute()

    return {"data": result.data, "total": len(result.data)}


@router.post("/")
async def create_rule(
    rule: MatchRuleCreate,
    location_id: str = Query(..., description="GHL Location ID"),
):
    """Create a new match rule."""
    tokens = await get_location_tokens(location_id)
    if not tokens:
        raise HTTPException(status_code=401, detail="Location not authenticated")

    # Use internal IDs from tokens lookup
    internal_location_id = tokens["location_id"]
    tenant_id = tokens["tenant_id"]

    supabase = get_supabase()

    rule_id = str(uuid.uuid4())
    # Convert percentage thresholds to decimals if > 1 (e.g., 95 -> 0.95)
    auto_threshold = rule.auto_merge_threshold / 100 if rule.auto_merge_threshold > 1 else rule.auto_merge_threshold
    review_threshold = rule.review_threshold / 100 if rule.review_threshold > 1 else rule.review_threshold

    rule_data = {
        "id": rule_id,
        "tenant_id": tenant_id,
        "location_id": internal_location_id,
        "name": rule.name,
        "source_object": rule.source_object,
        "match_fields": [f.model_dump() for f in rule.match_fields],
        "auto_merge_threshold": auto_threshold,
        "review_threshold": review_threshold,
        "merge_strategy": rule.merge_strategy,
        "schedule_frequency": rule.schedule_frequency,
        "is_active": rule.is_active,
    }

    result = supabase.table("match_rules").insert(rule_data).execute()

    return result.data[0] if result.data else rule_data


@router.get("/{rule_id}")
async def get_rule(
    rule_id: str,
    location_id: str = Query(..., description="GHL Location ID"),
):
    """Get a specific match rule."""
    tokens = await get_location_tokens(location_id)
    if not tokens:
        raise HTTPException(status_code=401, detail="Location not authenticated")

    internal_location_id = tokens["location_id"]

    supabase = get_supabase()
    result = supabase.table("match_rules").select("*").eq("id", rule_id).eq("location_id", internal_location_id).single().execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Rule not found")

    return result.data


@router.put("/{rule_id}")
async def update_rule(
    rule_id: str,
    rule: MatchRuleCreate,
    location_id: str = Query(..., description="GHL Location ID"),
):
    """Update a match rule."""
    tokens = await get_location_tokens(location_id)
    if not tokens:
        raise HTTPException(status_code=401, detail="Location not authenticated")

    internal_location_id = tokens["location_id"]

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
    }

    result = supabase.table("match_rules").update(update_data).eq("id", rule_id).eq("location_id", internal_location_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Rule not found")

    return result.data[0]


@router.delete("/{rule_id}")
async def delete_rule(
    rule_id: str,
    location_id: str = Query(..., description="GHL Location ID"),
):
    """Delete a match rule."""
    tokens = await get_location_tokens(location_id)
    if not tokens:
        raise HTTPException(status_code=401, detail="Location not authenticated")

    internal_location_id = tokens["location_id"]

    supabase = get_supabase()
    supabase.table("match_rules").delete().eq("id", rule_id).eq("location_id", internal_location_id).execute()

    return {"deleted": True}


@router.post("/{rule_id}/scan")
async def scan_rule(
    rule_id: str,
    location_id: str = Query(..., description="GHL Location ID"),
    limit: int = Query(100, le=500, description="Max records to scan"),
):
    """Run a duplicate scan for this rule."""
    tokens = await get_location_tokens(location_id)
    if not tokens:
        raise HTTPException(status_code=401, detail="Location not authenticated")

    internal_location_id = tokens["location_id"]
    tenant_id = tokens["tenant_id"]

    try:
        result = await run_scan(
            ghl_location_id=location_id,
            rule_id=rule_id,
            access_token=tokens["access_token"],
            tenant_id=tenant_id,
            internal_location_id=internal_location_id,
            limit=limit,
        )

        # Update last_scan_at on the rule
        supabase = get_supabase()
        supabase.table("match_rules").update({
            "last_scan_at": "now()"
        }).eq("id", rule_id).execute()

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scan failed: {str(e)}")
