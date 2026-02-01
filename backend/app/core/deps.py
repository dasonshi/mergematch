"""
FastAPI dependencies for authentication and authorization.
Provides reusable auth patterns to eliminate boilerplate across routes.
"""
from dataclasses import dataclass
from typing import Optional
import logging

from fastapi import Depends, HTTPException, Header, Query, Request

from app.core.security import get_current_user_flexible, AuthenticatedUser
from app.services.auth_service import get_location_tokens_with_refresh

logger = logging.getLogger(__name__)


@dataclass
class AuthContext:
    """
    Combined auth context with user info and GHL tokens.

    Use this for routes that need to make GHL API calls.
    Provides convenient properties for common auth values.
    """
    user: AuthenticatedUser
    access_token: str

    @property
    def location_id(self) -> str:
        """Internal location UUID."""
        return self.user.location_id

    @property
    def ghl_location_id(self) -> str:
        """GHL's location ID (used for API calls)."""
        return self.user.ghl_location_id

    @property
    def tenant_id(self) -> str:
        """Tenant UUID."""
        return self.user.tenant_id

    @property
    def plan(self) -> str:
        """Subscription plan (free, starter, pro, agency)."""
        return self.user.plan


async def get_auth_context(
    request: Request,
    authorization: Optional[str] = Header(None, alias="Authorization"),
    location_id: Optional[str] = Query(None, description="GHL Location ID (legacy)"),
) -> AuthContext:
    """
    FastAPI dependency that provides authenticated user + valid GHL tokens.

    Use this for any route that needs to make GHL API calls.
    Handles token refresh automatically.

    Usage:
        @router.get("/something")
        async def my_route(ctx: AuthContext = Depends(get_auth_context)):
            # ctx.access_token - GHL API token
            # ctx.location_id - internal location UUID
            # ctx.ghl_location_id - GHL's location ID
            # ctx.tenant_id - tenant UUID
            # ctx.plan - subscription plan

    Raises:
        HTTPException 401: If not authenticated or token refresh fails
    """
    user = await get_current_user_flexible(
        authorization=authorization,
        location_id=location_id
    )

    try:
        tokens = await get_location_tokens_with_refresh(user.ghl_location_id)
    except Exception as e:
        logger.error(f"Token retrieval failed for location {user.ghl_location_id}: {str(e)}")
        raise HTTPException(
            status_code=401,
            detail="Token retrieval failed. Please try reconnecting."
        )

    if not tokens:
        raise HTTPException(
            status_code=401,
            detail="Location not authenticated or token refresh failed"
        )

    return AuthContext(
        user=user,
        access_token=tokens["access_token"],
    )


async def get_user(
    authorization: Optional[str] = Header(None, alias="Authorization"),
    location_id: Optional[str] = Query(None, description="GHL Location ID (legacy)"),
) -> AuthenticatedUser:
    """
    FastAPI dependency for routes that only need user auth (no GHL tokens).

    Use this for routes that only access local database and don't call GHL API.
    Faster than get_auth_context since it skips token retrieval.

    Usage:
        @router.get("/local-only")
        async def my_route(user: AuthenticatedUser = Depends(get_user)):
            # user.location_id, user.tenant_id, user.plan available
    """
    return await get_current_user_flexible(
        authorization=authorization,
        location_id=location_id
    )
