from fastapi import APIRouter, HTTPException, Query, Depends
from typing import Optional
import logging

from app.core.ghl.client import GHLClient
from app.core.deps import get_auth_context, AuthContext

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/")
async def list_companies(
    ctx: AuthContext = Depends(get_auth_context),
):
    """
    Fetch all companies (businesses) from GHL for the given location.
    Note: GHL API doesn't support pagination for this endpoint.
    """
    logger.info(f"[COMPANIES] Request for location: {ctx.ghl_location_id}")

    async with GHLClient(ctx.access_token, ctx.ghl_location_id) as client:
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
            raise HTTPException(status_code=500, detail="Failed to fetch companies")


@router.get("/{company_id}")
async def get_company(
    company_id: str,
    ctx: AuthContext = Depends(get_auth_context),
):
    """
    Get a single company from GHL.
    """
    async with GHLClient(ctx.access_token, ctx.ghl_location_id) as client:
        try:
            result = await client.get_company(company_id)
            return result.get("business", result)
        except Exception as e:
            raise HTTPException(status_code=500, detail="Failed to fetch company")
