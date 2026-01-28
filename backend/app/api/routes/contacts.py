from fastapi import APIRouter, HTTPException, Query, Depends, Header, Request
from typing import Optional
import logging

from app.services.auth_service import get_location_tokens_with_refresh
from app.core.ghl.client import GHLClient
from app.core.security import get_current_user_flexible, AuthenticatedUser
from app.core.rate_limit import limiter

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/stats")
@limiter.limit("100/minute")
async def get_contacts_stats(
    request: Request,
    authorization: Optional[str] = Header(None, alias="Authorization"),
    location_id: Optional[str] = Query(None, description="GHL Location ID (legacy)"),
):
    """
    Get contact count for the location.
    Uses GET /contacts/ which returns a 'count' field.
    Supports JWT auth (preferred) or legacy query param.
    """
    user = await get_current_user_flexible(authorization=authorization, location_id=location_id)
    logger.info(f"[CONTACTS STATS] Request for location: {user.ghl_location_id}")

    tokens = await get_location_tokens_with_refresh(user.ghl_location_id)
    if not tokens:
        logger.error(f"[CONTACTS STATS] No tokens found for location: {user.ghl_location_id}")
        raise HTTPException(status_code=401, detail="Location not authenticated or token refresh failed")

    logger.info(f"[CONTACTS STATS] Token retrieved, expires: {tokens.get('expires_at')}")

    async with GHLClient(tokens["access_token"], user.ghl_location_id) as client:
        try:
            total = await client.get_contacts_count()
            logger.info(f"[CONTACTS STATS] Got count: {total}")
            return {"total": total}
        except Exception as e:
            logger.exception(f"[CONTACTS STATS] Failed: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to fetch contact stats: {str(e)}")


@router.get("/")
@limiter.limit("100/minute")
async def list_contacts(
    request: Request,
    authorization: Optional[str] = Header(None, alias="Authorization"),
    location_id: Optional[str] = Query(None, description="GHL Location ID (legacy)"),
    limit: int = Query(100, le=100),
    start_after_id: Optional[str] = Query(None, alias="startAfterId"),
    query: Optional[str] = Query(None, description="Search query"),
):
    """
    Fetch contacts from GHL for the given location.
    Supports JWT auth (preferred) or legacy query param.
    """
    user = await get_current_user_flexible(authorization=authorization, location_id=location_id)
    tokens = await get_location_tokens_with_refresh(user.ghl_location_id)
    if not tokens:
        raise HTTPException(status_code=401, detail="Location not authenticated or token refresh failed")

    async with GHLClient(tokens["access_token"], user.ghl_location_id) as client:
        try:
            result = await client.get_contacts(
                limit=limit,
                start_after_id=start_after_id,
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
    tokens = await get_location_tokens_with_refresh(user.ghl_location_id)
    if not tokens:
        raise HTTPException(status_code=401, detail="Location not authenticated or token refresh failed")

    async with GHLClient(tokens["access_token"], user.ghl_location_id) as client:
        try:
            result = await client.get_contact(contact_id)
            return result.get("contact", result)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to fetch contact: {str(e)}")
