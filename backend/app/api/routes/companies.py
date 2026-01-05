from fastapi import APIRouter, HTTPException, Query, Header
from typing import Optional

from app.services.auth_service import get_location_tokens
from app.core.ghl.client import GHLClient
from app.core.security import get_current_user_flexible

router = APIRouter()


@router.get("/")
async def list_companies(
    authorization: Optional[str] = Header(None, alias="Authorization"),
    location_id: Optional[str] = Query(None, description="GHL Location ID (legacy)"),
    limit: int = Query(100, le=100),
    skip: int = Query(0),
):
    """
    Fetch companies (businesses) from GHL for the given location.
    Supports JWT auth (preferred) or legacy query param.
    """
    user = await get_current_user_flexible(authorization=authorization, location_id=location_id)
    tokens = await get_location_tokens(user.ghl_location_id)
    if not tokens:
        raise HTTPException(status_code=401, detail="Location not authenticated")

    async with GHLClient(tokens["access_token"], user.ghl_location_id) as client:
        try:
            result = await client.get_companies(limit=limit, skip=skip)
            return {
                "companies": result.get("businesses", []),
                "total": result.get("total", 0),
            }
        except Exception as e:
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
    tokens = await get_location_tokens(user.ghl_location_id)
    if not tokens:
        raise HTTPException(status_code=401, detail="Location not authenticated")

    async with GHLClient(tokens["access_token"], user.ghl_location_id) as client:
        try:
            result = await client.get_company(company_id)
            return result.get("business", result)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to fetch company: {str(e)}")
