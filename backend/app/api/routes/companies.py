from fastapi import APIRouter, HTTPException, Query, Header
from typing import Optional
import logging

from app.services.auth_service import get_location_tokens_with_refresh
from app.core.ghl.client import GHLClient
from app.core.security import get_current_user_flexible

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/")
async def list_companies(
    authorization: Optional[str] = Header(None, alias="Authorization"),
    location_id: Optional[str] = Query(None, description="GHL Location ID (legacy)"),
):
    """
    Fetch all companies (businesses) from GHL for the given location.
    Note: GHL API doesn't support pagination for this endpoint.
    Supports JWT auth (preferred) or legacy query param.
    """
    user = await get_current_user_flexible(authorization=authorization, location_id=location_id)
    logger.info(f"[COMPANIES] Request for location: {user.ghl_location_id}")

    tokens = await get_location_tokens_with_refresh(user.ghl_location_id)
    if not tokens:
        logger.error(f"[COMPANIES] No tokens found for location: {user.ghl_location_id}")
        raise HTTPException(status_code=401, detail="Location not authenticated or token refresh failed")

    logger.info(f"[COMPANIES] Token retrieved, expires: {tokens.get('expires_at')}")

    async with GHLClient(tokens["access_token"], user.ghl_location_id) as client:
        try:
            result = await client.get_companies()
            businesses = result.get("businesses", [])
            logger.info(f"[COMPANIES] Got {len(businesses)} companies")
            return {
                "companies": businesses,
                "total": len(businesses),
            }
        except Exception as e:
            logger.exception(f"[COMPANIES] Failed: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to fetch companies: {str(e)}")


@router.get("/{company_id}")
async def get_company(
    company_id: str,
    authorization: Optional[str] = Header(None, alias="Authorization"),
    location_id: Optional[str] = Query(None, description="GHL Location ID (legacy)"),
):
    """
    Get a single company from GHL.
    Supports JWT auth (preferred) or legacy query param.
    """
    user = await get_current_user_flexible(authorization=authorization, location_id=location_id)
    tokens = await get_location_tokens_with_refresh(user.ghl_location_id)
    if not tokens:
        raise HTTPException(status_code=401, detail="Location not authenticated or token refresh failed")

    async with GHLClient(tokens["access_token"], user.ghl_location_id) as client:
        try:
            result = await client.get_company(company_id)
            return result.get("business", result)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to fetch company: {str(e)}")
