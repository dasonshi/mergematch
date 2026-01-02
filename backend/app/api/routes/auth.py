"""
Authentication routes for MergeMatch.
Handles OAuth flow with GHL and JWT token management.
"""
from fastapi import APIRouter, HTTPException, Query, Depends, Header
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from app.config import settings
from app.core.ghl.oauth import GHLOAuth
from app.core.security import (
    create_access_token,
    create_refresh_token,
    create_secure_state,
    verify_secure_state,
    verify_token,
    get_current_user_flexible,
    AuthenticatedUser,
)
from app.services.auth_service import (
    store_oauth_tokens,
    get_location_tokens,
    update_tokens,
)
from app.services.billing_service import get_plan_features, get_upgrade_url

router = APIRouter()
ghl_oauth = GHLOAuth()


class TokenResponse(BaseModel):
    """Response for token endpoints."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60  # seconds


class RefreshRequest(BaseModel):
    """Request body for token refresh."""
    refresh_token: str


@router.get("/install")
async def install():
    """
    Start the GHL OAuth flow.
    Generates a secure state parameter for CSRF protection.
    Redirects to GHL to authorize the app.
    """
    state = create_secure_state()
    auth_url = ghl_oauth.get_authorization_url(state)
    return RedirectResponse(url=auth_url)


@router.get("/callback")
async def callback(
    code: str = Query(None),
    state: str = Query(None),
    error: str = Query(None),
):
    """
    GHL OAuth callback.
    Exchanges authorization code for access tokens, stores them,
    and redirects to frontend with JWT tokens.
    """
    if error:
        frontend_url = f"{settings.FRONTEND_URL}?error={error}"
        return RedirectResponse(url=frontend_url)

    if not code:
        raise HTTPException(status_code=400, detail="Missing authorization code")

    # Validate state parameter (CSRF protection)
    # Allow missing state for GHL Marketplace installs (they don't include it)
    if state:
        try:
            verify_secure_state(state)
        except ValueError as e:
            print(f"🚨 OAuth state validation failed: {e}")
            frontend_url = f"{settings.FRONTEND_URL}?error=invalid_state"
            return RedirectResponse(url=frontend_url)

    # Exchange code for tokens
    try:
        tokens = await ghl_oauth.exchange_code(code)
    except Exception as e:
        print(f"❌ Token exchange failed: {e}")
        frontend_url = f"{settings.FRONTEND_URL}?error=token_exchange_failed"
        return RedirectResponse(url=frontend_url)

    # Extract token data
    access_token = tokens.get("access_token")
    refresh_token = tokens.get("refresh_token")
    expires_in = tokens.get("expires_in", 86400)
    ghl_location_id = tokens.get("locationId")
    company_id = tokens.get("companyId", ghl_location_id)

    if not access_token or not ghl_location_id:
        frontend_url = f"{settings.FRONTEND_URL}?error=invalid_token_response"
        return RedirectResponse(url=frontend_url)

    # Store GHL tokens in database (encrypted)
    try:
        result = await store_oauth_tokens(
            company_id=company_id,
            location_id=ghl_location_id,
            location_name=f"Location {ghl_location_id[:8]}",
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=expires_in,
        )
    except Exception as e:
        print(f"❌ Failed to store tokens: {e}")
        frontend_url = f"{settings.FRONTEND_URL}?error=storage_failed"
        return RedirectResponse(url=frontend_url)

    # Get plan info
    location_tokens = await get_location_tokens(ghl_location_id)
    plan = location_tokens.get("plan", "free") if location_tokens else "free"

    # Generate JWT tokens for frontend
    jwt_access_token = create_access_token(
        location_id=str(result["location_id"]),
        ghl_location_id=ghl_location_id,
        tenant_id=str(result["tenant_id"]),
        plan=plan,
    )

    jwt_refresh_token = create_refresh_token(
        location_id=str(result["location_id"]),
        ghl_location_id=ghl_location_id,
        tenant_id=str(result["tenant_id"]),
    )

    # Redirect with both JWT tokens AND legacy location_id for backward compatibility
    frontend_url = (
        f"{settings.FRONTEND_URL}"
        f"?installed=true"
        f"&location_id={ghl_location_id}"  # Legacy - for backward compat
        f"&access_token={jwt_access_token}"
        f"&refresh_token={jwt_refresh_token}"
    )
    return RedirectResponse(url=frontend_url)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_tokens(body: RefreshRequest):
    """
    Refresh an expired access token using a refresh token.
    """
    # Verify the refresh token
    try:
        payload = verify_token(body.refresh_token, token_type="refresh")
    except HTTPException:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    # Get current GHL tokens
    ghl_tokens = await get_location_tokens(payload.ghl_location_id)
    if not ghl_tokens:
        raise HTTPException(status_code=401, detail="Location not found. Please re-authenticate.")

    # Check if GHL token needs refresh (within 5 min buffer)
    token_expires = ghl_tokens.get("expires_at")
    if token_expires:
        try:
            expires_dt = datetime.fromisoformat(str(token_expires).replace("Z", "+00:00"))
            time_until_expiry = (expires_dt - datetime.utcnow()).total_seconds()

            if time_until_expiry < 300:  # 5 minutes
                try:
                    new_ghl_tokens = await ghl_oauth.refresh_token(ghl_tokens["refresh_token"])
                    await update_tokens(
                        location_id=payload.ghl_location_id,
                        access_token=new_ghl_tokens["access_token"],
                        refresh_token=new_ghl_tokens.get("refresh_token", ghl_tokens["refresh_token"]),
                        expires_in=new_ghl_tokens.get("expires_in", 86400),
                    )
                except Exception as e:
                    print(f"⚠️ GHL token refresh failed: {e}")
        except Exception:
            pass

    # Get updated plan info
    updated_tokens = await get_location_tokens(payload.ghl_location_id)
    plan = updated_tokens.get("plan", "free") if updated_tokens else payload.plan

    # Generate new JWT tokens
    new_access_token = create_access_token(
        location_id=payload.location_id,
        ghl_location_id=payload.ghl_location_id,
        tenant_id=payload.tenant_id,
        plan=plan,
    )

    new_refresh_token = create_refresh_token(
        location_id=payload.location_id,
        ghl_location_id=payload.ghl_location_id,
        tenant_id=payload.tenant_id,
    )

    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
    )


@router.get("/me")
async def get_current_location(
    # Flexible auth: accepts JWT OR legacy query param
    authorization: Optional[str] = Header(None, alias="Authorization"),
    location_id: str = Query(None, description="GHL Location ID (legacy, use JWT instead)"),
):
    """
    Get current authenticated location info.

    Supports both:
    - JWT: Authorization: Bearer <token> (preferred)
    - Legacy: ?location_id=xxx (deprecated, for backward compatibility)
    """
    # Try to authenticate
    user = await get_current_user_flexible(
        authorization=authorization,
        location_id=location_id,
    )

    # Get additional info from database
    tokens = await get_location_tokens(user.ghl_location_id)

    if not tokens:
        raise HTTPException(status_code=404, detail="Location not found")

    plan = tokens.get("plan", user.plan)
    features = get_plan_features(plan)

    return {
        "location_id": user.ghl_location_id,
        "location_name": tokens.get("location_name", "Unknown Location"),
        "tenant_id": user.tenant_id,
        "authenticated": True,
        "plan": plan,
        "billing_status": tokens.get("billing_status", "active"),
        "is_on_trial": tokens.get("is_on_trial", False),
        "trial_ends_at": tokens.get("trial_ends_at"),
        "upgrade_url": get_upgrade_url(user.ghl_location_id),
        "features": {
            "unlimited_merges": features.unlimited_merges,
            "auto_merge": features.auto_merge,
            "scheduled_scans": features.scheduled_scans,
            "company_matching": features.company_matching,
            "white_label": features.white_label,
        },
    }


@router.post("/logout")
async def logout(
    authorization: Optional[str] = Header(None, alias="Authorization"),
    location_id: str = Query(None),
):
    """
    Logout endpoint.
    With JWT, logout is primarily client-side (discard tokens).
    """
    # Authenticate to verify the request is valid
    await get_current_user_flexible(authorization=authorization, location_id=location_id)

    return {"success": True, "message": "Logged out successfully"}
