from fastapi import APIRouter, HTTPException, Query, Header
from pydantic import BaseModel
from typing import Optional, List
import httpx
import logging

from app.db.supabase import get_supabase
from app.services.auth_service import get_location_tokens
from app.core.security import get_current_user_flexible
from app.core.ghl.client import GHLClient

logger = logging.getLogger(__name__)

router = APIRouter()


class RejectRequest(BaseModel):
    reason: Optional[str] = None


class CleanupRequest(BaseModel):
    match_ids: List[str]


@router.get("/")
async def list_matches(
    authorization: Optional[str] = Header(None, alias="Authorization"),
    location_id: Optional[str] = Query(None, description="GHL Location ID (legacy)"),
    status: Optional[str] = Query(None, description="Filter by status: pending, approved, rejected, merged"),
    rule_id: Optional[str] = Query(None, description="Filter by match rule ID"),
    limit: int = Query(50, le=100),
    offset: int = Query(0),
):
    """List match pairs for the current location."""
    user = await get_current_user_flexible(authorization=authorization, location_id=location_id)

    supabase = get_supabase()
    query = supabase.table("match_pairs").select("*").eq("location_id", user.location_id)

    if status:
        query = query.eq("status", status)
    if rule_id:
        query = query.eq("rule_id", rule_id)

    query = query.range(offset, offset + limit - 1)
    result = query.execute()

    return {
        "data": result.data,
        "total": len(result.data),
        "limit": limit,
        "offset": offset,
    }


@router.get("/{match_id}")
async def get_match(
    match_id: str,
    authorization: Optional[str] = Header(None, alias="Authorization"),
    location_id: Optional[str] = Query(None, description="GHL Location ID (legacy)"),
):
    """Get details of a specific match pair."""
    user = await get_current_user_flexible(authorization=authorization, location_id=location_id)

    supabase = get_supabase()
    result = supabase.table("match_pairs").select("*").eq("id", match_id).eq("location_id", user.location_id).single().execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Match not found")

    return result.data


@router.post("/{match_id}/approve")
async def approve_match(
    match_id: str,
    authorization: Optional[str] = Header(None, alias="Authorization"),
    location_id: Optional[str] = Query(None, description="GHL Location ID (legacy)"),
):
    """Approve a match as a valid duplicate."""
    user = await get_current_user_flexible(authorization=authorization, location_id=location_id)

    supabase = get_supabase()
    result = supabase.table("match_pairs").update({"status": "approved"}).eq("id", match_id).eq("location_id", user.location_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Match not found")

    return result.data[0]


@router.post("/{match_id}/reject")
async def reject_match(
    match_id: str,
    authorization: Optional[str] = Header(None, alias="Authorization"),
    location_id: Optional[str] = Query(None, description="GHL Location ID (legacy)"),
    body: RejectRequest = None,
):
    """Reject a match - not a duplicate."""
    user = await get_current_user_flexible(authorization=authorization, location_id=location_id)

    supabase = get_supabase()
    update_data = {"status": "rejected"}
    if body and body.reason:
        update_data["rejection_reason"] = body.reason

    result = supabase.table("match_pairs").update(update_data).eq("id", match_id).eq("location_id", user.location_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Match not found")

    return result.data[0]


@router.post("/validate")
async def validate_matches(
    rule_id: str = Query(..., description="Match rule ID"),
    authorization: Optional[str] = Header(None, alias="Authorization"),
    location_id: Optional[str] = Query(None, description="GHL Location ID (legacy)"),
):
    """
    Validate match pairs - check if contacts still exist in GHL.
    Returns list of valid and stale match IDs.
    """
    user = await get_current_user_flexible(authorization=authorization, location_id=location_id)

    # Get GHL access token
    tokens = await get_location_tokens(user.location_id)
    if not tokens:
        raise HTTPException(status_code=401, detail="No access token available")

    supabase = get_supabase()

    # Get pending matches for this rule
    matches = (
        supabase.table("match_pairs")
        .select("id, record_a_id, record_b_id")
        .eq("rule_id", rule_id)
        .eq("status", "pending")
        .eq("location_id", user.location_id)
        .execute()
    )

    if not matches.data:
        return {"valid": [], "stale": []}

    # Get all unique contact IDs
    contact_ids = set()
    for m in matches.data:
        contact_ids.add(m["record_a_id"])
        contact_ids.add(m["record_b_id"])

    logger.info(f"Validating {len(contact_ids)} unique contacts for {len(matches.data)} match pairs")

    # Check which contacts exist in GHL
    async with GHLClient(tokens["access_token"], tokens["ghl_location_id"]) as client:
        existing_ids = set()
        for contact_id in contact_ids:
            try:
                await client.get_contact(contact_id)
                existing_ids.add(contact_id)
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 404:
                    logger.info(f"Contact {contact_id} not found in GHL (404)")
                else:
                    # Assume exists if error is not 404
                    existing_ids.add(contact_id)
                    logger.warning(f"Contact {contact_id} check failed with {e.response.status_code}, assuming exists")
            except Exception as e:
                # Assume exists on other errors
                existing_ids.add(contact_id)
                logger.warning(f"Contact {contact_id} check error: {e}, assuming exists")

    # Categorize matches
    valid = []
    stale = []
    for m in matches.data:
        if m["record_a_id"] in existing_ids and m["record_b_id"] in existing_ids:
            valid.append(m["id"])
        else:
            stale.append(m["id"])

    logger.info(f"Validation result: {len(valid)} valid, {len(stale)} stale")

    return {"valid": valid, "stale": stale}


@router.post("/cleanup-stale")
async def cleanup_stale_matches(
    body: CleanupRequest,
    authorization: Optional[str] = Header(None, alias="Authorization"),
    location_id: Optional[str] = Query(None, description="GHL Location ID (legacy)"),
):
    """Mark stale match pairs as 'stale' status."""
    user = await get_current_user_flexible(authorization=authorization, location_id=location_id)

    supabase = get_supabase()

    cleaned = 0
    for match_id in body.match_ids:
        result = (
            supabase.table("match_pairs")
            .update({"status": "stale"})
            .eq("id", match_id)
            .eq("location_id", user.location_id)
            .execute()
        )
        if result.data:
            cleaned += 1

    logger.info(f"Cleaned up {cleaned} stale match pairs")

    return {"cleaned": cleaned}
