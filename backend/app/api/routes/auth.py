from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import RedirectResponse
import secrets

from app.config import settings
from app.core.ghl.oauth import GHLOAuth
from app.services.auth_service import store_oauth_tokens, get_location_tokens, update_tokens

router = APIRouter()
ghl_oauth = GHLOAuth()

# Store states temporarily (in production, use Redis)
pending_states: dict = {}


@router.get("/install")
async def install():
    """
    Start the GHL OAuth flow.
    Redirects to GHL to authorize the app.
    """
    state = secrets.token_urlsafe(32)
    pending_states[state] = True

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
    Exchanges authorization code for access tokens and stores them.
    """
    if error:
        raise HTTPException(status_code=400, detail=f"OAuth error: {error}")

    if not code or not state:
        raise HTTPException(status_code=400, detail="Missing code or state")

    # Validate state (skip in dev for easier testing)
    if settings.ENVIRONMENT == "production" and state not in pending_states:
        raise HTTPException(status_code=400, detail="Invalid state")
    pending_states.pop(state, None)

    # Exchange code for tokens
    try:
        tokens = await ghl_oauth.exchange_code(code)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Token exchange failed: {str(e)}")

    # Extract token data
    access_token = tokens.get("access_token")
    refresh_token = tokens.get("refresh_token")
    expires_in = tokens.get("expires_in", 86400)  # Default 24 hours
    location_id = tokens.get("locationId")
    company_id = tokens.get("companyId", location_id)  # Fallback to location if no company
    user_type = tokens.get("userType", "Location")

    if not access_token or not location_id:
        raise HTTPException(status_code=400, detail="Invalid token response from GHL")

    # Store tokens in database
    try:
        result = await store_oauth_tokens(
            company_id=company_id,
            location_id=location_id,
            location_name=f"Location {location_id[:8]}",  # Placeholder name
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=expires_in,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to store tokens: {str(e)}")

    # Redirect to frontend with location context
    frontend_url = f"{settings.FRONTEND_URL}?installed=true&location_id={location_id}"
    return RedirectResponse(url=frontend_url)


@router.post("/refresh")
async def refresh_token_endpoint(location_id: str):
    """
    Refresh an expired access token.
    """
    # Get current tokens
    tokens = await get_location_tokens(location_id)
    if not tokens:
        raise HTTPException(status_code=404, detail="Location not found")

    # Refresh with GHL
    try:
        new_tokens = await ghl_oauth.refresh_token(tokens["refresh_token"])
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Token refresh failed: {str(e)}")

    # Update stored tokens
    await update_tokens(
        location_id=location_id,
        access_token=new_tokens["access_token"],
        refresh_token=new_tokens.get("refresh_token", tokens["refresh_token"]),
        expires_in=new_tokens.get("expires_in", 86400),
    )

    return {"success": True, "message": "Tokens refreshed"}


@router.get("/me")
async def get_current_location(location_id: str = Query(...)):
    """
    Get current location info (check if authenticated).
    """
    tokens = await get_location_tokens(location_id)
    if not tokens:
        raise HTTPException(status_code=404, detail="Location not found or not authenticated")

    return {
        "location_id": location_id,
        "tenant_id": str(tokens["tenant_id"]),
        "authenticated": True,
        "plan": tokens.get("plan", "free"),
        "billing_status": tokens.get("billing_status", "active"),
    }
