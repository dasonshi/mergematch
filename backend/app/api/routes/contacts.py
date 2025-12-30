from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from app.services.auth_service import get_location_tokens
from app.core.ghl.client import GHLClient

router = APIRouter()


@router.get("/")
async def list_contacts(
    location_id: str = Query(..., description="GHL Location ID"),
    limit: int = Query(100, le=100),
    start_after: Optional[str] = Query(None),
    query: Optional[str] = Query(None, description="Search query"),
):
    """
    Fetch contacts from GHL for the given location.
    """
    # Get tokens for this location
    tokens = await get_location_tokens(location_id)
    if not tokens:
        raise HTTPException(status_code=401, detail="Location not authenticated")

    # Fetch from GHL
    async with GHLClient(tokens["access_token"], location_id) as client:
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
    location_id: str = Query(..., description="GHL Location ID"),
):
    """
    Get a single contact from GHL.
    """
    tokens = await get_location_tokens(location_id)
    if not tokens:
        raise HTTPException(status_code=401, detail="Location not authenticated")

    async with GHLClient(tokens["access_token"], location_id) as client:
        try:
            result = await client.get_contact(contact_id)
            return result.get("contact", result)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to fetch contact: {str(e)}")
