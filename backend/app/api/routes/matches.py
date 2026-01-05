from fastapi import APIRouter, HTTPException, Query, Header
from pydantic import BaseModel
from typing import Optional

from app.db.supabase import get_supabase
from app.services.auth_service import get_location_tokens
from app.core.security import get_current_user_flexible

router = APIRouter()


class RejectRequest(BaseModel):
    reason: Optional[str] = None


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
