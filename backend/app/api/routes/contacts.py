from fastapi import APIRouter, HTTPException, Query, Depends, Header, Request
from typing import Optional
import logging

from app.core.ghl.client import GHLClient
from app.core.deps import get_auth_context, AuthContext
from app.core.rate_limit import limiter

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/stats")
@limiter.limit("100/minute")
async def get_contacts_stats(
    request: Request,
    ctx: AuthContext = Depends(get_auth_context),
):
    """
    Get contact count for the location.
    Uses GET /contacts/ which returns a 'count' field.
    """
    logger.info(f"[CONTACTS STATS] Request for location: {ctx.ghl_location_id}")

    async with GHLClient(ctx.access_token, ctx.ghl_location_id) as client:
        try:
            total = await client.get_contacts_count()
            logger.info(f"[CONTACTS STATS] Got count: {total}")
            return {"total": total}
        except Exception as e:
            logger.exception(f"[CONTACTS STATS] Failed: {e}")
            raise HTTPException(status_code=500, detail="Failed to fetch contact stats")


@router.get("/")
@limiter.limit("100/minute")
async def list_contacts(
    request: Request,
    ctx: AuthContext = Depends(get_auth_context),
    limit: int = Query(100, le=100),
    start_after_id: Optional[str] = Query(None, alias="startAfterId"),
    query: Optional[str] = Query(None, description="Search query"),
):
    """
    Fetch contacts from GHL for the given location.
    """
    async with GHLClient(ctx.access_token, ctx.ghl_location_id) as client:
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
            raise HTTPException(status_code=500, detail="Failed to fetch contacts")


@router.get("/{contact_id}")
async def get_contact(
    contact_id: str,
    ctx: AuthContext = Depends(get_auth_context),
):
    """
    Get a single contact from GHL.
    """
    async with GHLClient(ctx.access_token, ctx.ghl_location_id) as client:
        try:
            result = await client.get_contact(contact_id)
            return result.get("contact", result)
        except Exception as e:
            raise HTTPException(status_code=500, detail="Failed to fetch contact")
