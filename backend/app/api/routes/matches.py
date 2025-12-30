from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional

from app.db.supabase import get_supabase
from app.services.auth_service import get_location_tokens

router = APIRouter()


class RejectRequest(BaseModel):
    reason: Optional[str] = None


@router.get("/")
async def list_matches(
    location_id: str = Query(..., description="GHL Location ID"),
    status: Optional[str] = Query(None, description="Filter by status: pending, approved, rejected, merged"),
    rule_id: Optional[str] = Query(None, description="Filter by match rule ID"),
    limit: int = Query(50, le=100),
    offset: int = Query(0),
):
    """List match pairs for the current location."""
    tokens = await get_location_tokens(location_id)
    if not tokens:
        raise HTTPException(status_code=401, detail="Location not authenticated")

    internal_location_id = tokens["location_id"]

    supabase = get_supabase()
    query = supabase.table("match_pairs").select("*").eq("location_id", internal_location_id)

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
    location_id: str = Query(..., description="GHL Location ID"),
):
    """Get details of a specific match pair."""
    tokens = await get_location_tokens(location_id)
    if not tokens:
        raise HTTPException(status_code=401, detail="Location not authenticated")

    internal_location_id = tokens["location_id"]

    supabase = get_supabase()
    result = supabase.table("match_pairs").select("*").eq("id", match_id).eq("location_id", internal_location_id).single().execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Match not found")

    return result.data


@router.post("/{match_id}/approve")
async def approve_match(
    match_id: str,
    location_id: str = Query(..., description="GHL Location ID"),
):
    """Approve a match as a valid duplicate."""
    tokens = await get_location_tokens(location_id)
    if not tokens:
        raise HTTPException(status_code=401, detail="Location not authenticated")

    internal_location_id = tokens["location_id"]

    supabase = get_supabase()
    result = supabase.table("match_pairs").update({"status": "approved"}).eq("id", match_id).eq("location_id", internal_location_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Match not found")

    return result.data[0]


@router.post("/{match_id}/reject")
async def reject_match(
    match_id: str,
    location_id: str = Query(..., description="GHL Location ID"),
    body: RejectRequest = None,
):
    """Reject a match - not a duplicate."""
    tokens = await get_location_tokens(location_id)
    if not tokens:
        raise HTTPException(status_code=401, detail="Location not authenticated")

    internal_location_id = tokens["location_id"]

    supabase = get_supabase()
    update_data = {"status": "rejected"}
    if body and body.reason:
        update_data["rejection_reason"] = body.reason

    result = supabase.table("match_pairs").update(update_data).eq("id", match_id).eq("location_id", internal_location_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Match not found")

    return result.data[0]
