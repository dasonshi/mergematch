from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from app.services.auth_service import get_location_tokens
from app.core.ghl.client import GHLClient

router = APIRouter()


@router.get("/")
async def list_companies(
    location_id: str = Query(..., description="GHL Location ID"),
    limit: int = Query(100, le=100),
    skip: int = Query(0),
):
    """
    Fetch companies (businesses) from GHL for the given location.
    """
    tokens = await get_location_tokens(location_id)
    if not tokens:
        raise HTTPException(status_code=401, detail="Location not authenticated")

    async with GHLClient(tokens["access_token"], location_id) as client:
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
    location_id: str = Query(..., description="GHL Location ID"),
):
    """
    Get a single company from GHL.
    """
    tokens = await get_location_tokens(location_id)
    if not tokens:
        raise HTTPException(status_code=401, detail="Location not authenticated")

    async with GHLClient(tokens["access_token"], location_id) as client:
        try:
            result = await client.get_company(company_id)
            return result.get("business", result)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to fetch company: {str(e)}")
