from fastapi import APIRouter, HTTPException, Query, Depends, Header
from typing import Optional

from app.services.auth_service import get_location_tokens
from app.core.ghl.client import GHLClient
from app.core.security import get_current_user_flexible, AuthenticatedUser

router = APIRouter()


@router.get("/stats")
async def get_contacts_stats(
    authorization: Optional[str] = Header(None, alias="Authorization"),
    location_id: Optional[str] = Query(None, description="GHL Location ID (legacy)"),
):
    """
    Get contact count for the location.
    Uses GET /contacts/ which returns a 'count' field.
    Supports JWT auth (preferred) or legacy query param.
    """
    user = await get_current_user_flexible(authorization=authorization, location_id=location_id)
    tokens = await get_location_tokens(user.ghl_location_id)
    if not tokens:
        raise HTTPException(status_code=401, detail="Location not authenticated")

    async with GHLClient(tokens["access_token"], user.ghl_location_id) as client:
        try:
            total = await client.get_contacts_count()
            return {"total": total}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to fetch contact stats: {str(e)}")


@router.get("/")
async def list_contacts(
    authorization: Optional[str] = Header(None, alias="Authorization"),
    location_id: Optional[str] = Query(None, description="GHL Location ID (legacy)"),
    limit: int = Query(100, le=100),
    start_after: Optional[str] = Query(None),
    query: Optional[str] = Query(None, description="Search query"),
):
    """
    Fetch contacts from GHL for the given location.
    Supports JWT auth (preferred) or legacy query param.
    """
    user = await get_current_user_flexible(authorization=authorization, location_id=location_id)
    tokens = await get_location_tokens(user.ghl_location_id)
    if not tokens:
        raise HTTPException(status_code=401, detail="Location not authenticated")

    async with GHLClient(tokens["access_token"], user.ghl_location_id) as client:
        try:
            result = await client.get_contacts(
                limit=limit,
                start_after=start_after,
                query=query,
            )
            return {
                "contacts": result.get("contacts", []),
                "meta": result.get("meta", {}),
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to fetch contacts: {str(e)}")


@router.get("/{contact_id}")
async def get_contact(
    contact_id: str,
    authorization: Optional[str] = Header(None, alias="Authorization"),
    location_id: Optional[str] = Query(None, description="GHL Location ID (legacy)"),
):
    """
    Get a single contact from GHL.
    Supports JWT auth (preferred) or legacy query param.
    """
    user = await get_current_user_flexible(authorization=authorization, location_id=location_id)
    tokens = await get_location_tokens(user.ghl_location_id)
    if not tokens:
        raise HTTPException(status_code=401, detail="Location not authenticated")

    async with GHLClient(tokens["access_token"], user.ghl_location_id) as client:
        try:
            result = await client.get_contact(contact_id)
            return result.get("contact", result)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to fetch contact: {str(e)}")
