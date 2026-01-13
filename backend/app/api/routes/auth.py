"""
Authentication routes for MergeMatch.
Handles OAuth flow with GHL and JWT token management.
"""
from fastapi import APIRouter, HTTPException, Query, Depends, Header, Request
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import base64
import hashlib
import json
import secrets

from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend

from app.config import settings
from app.core.rate_limit import limiter, RATE_LIMIT_AUTH
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
    store_exchange_code,
    get_and_use_exchange_code,
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
@limiter.limit(RATE_LIMIT_AUTH)
async def install(request: Request):
    """
    Start the GHL OAuth flow.
    Generates a secure state parameter for CSRF protection.
    Redirects to GHL to authorize the app.
    """
    state = create_secure_state()
    auth_url = ghl_oauth.get_authorization_url(state)
    return RedirectResponse(url=auth_url)


@router.get("/callback")
@limiter.limit(RATE_LIMIT_AUTH)
async def callback(
    request: Request,
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

    # Generate one-time exchange code (tokens never in URL for security)
    exchange_code = secrets.token_urlsafe(32)

    # Store exchange code with tokens (5-min expiry)
    try:
        await store_exchange_code(
            code=exchange_code,
            location_id=str(result["location_id"]),
            ghl_location_id=ghl_location_id,
            jwt_access_token=jwt_access_token,
            jwt_refresh_token=jwt_refresh_token,
        )
    except Exception as e:
        print(f"❌ Failed to store exchange code: {e}")
        frontend_url = f"{settings.FRONTEND_URL}?error=storage_failed"
        return RedirectResponse(url=frontend_url)

    # Redirect with code only (no tokens in URL)
    # If GHL custom page link is configured, redirect back to GHL iframe
    if settings.GHL_CUSTOM_PAGE_LINK_ID:
        redirect_url = (
            f"https://app.gohighlevel.com/v2/location/{ghl_location_id}"
            f"/custom-page-link/{settings.GHL_CUSTOM_PAGE_LINK_ID}"
            f"?installed=true&code={exchange_code}"
        )
    else:
        # Fallback to standalone frontend
        redirect_url = f"{settings.FRONTEND_URL}?installed=true&code={exchange_code}"

    return RedirectResponse(url=redirect_url)


@router.post("/refresh", response_model=TokenResponse)
@limiter.limit(RATE_LIMIT_AUTH)
async def refresh_tokens(request: Request, body: RefreshRequest):
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


class ExchangeCodeRequest(BaseModel):
    """Request body for code exchange."""
    code: str


class ExchangeCodeResponse(BaseModel):
    """Response for code exchange."""
    access_token: str
    refresh_token: str
    location_id: str


@router.post("/exchange-code", response_model=ExchangeCodeResponse)
@limiter.limit(RATE_LIMIT_AUTH)
async def exchange_code(request: Request, body: ExchangeCodeRequest):
    """
    Exchange a one-time code for JWT tokens.

    This is part of the secure POST redirect flow:
    1. OAuth callback generates a one-time code (not tokens)
    2. Frontend receives code in URL (safe - not sensitive)
    3. Frontend POSTs code here to get tokens in response body
    4. Tokens never appear in URL, logs, or browser history
    """
    # Find and validate code
    result = await get_and_use_exchange_code(body.code)

    if not result:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired code. Please try authenticating again."
        )

    return ExchangeCodeResponse(
        access_token=result["jwt_access_token"],
        refresh_token=result["jwt_refresh_token"],
        location_id=result["ghl_location_id"],
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


def decrypt_ghl_sso_data(encrypted_data: str, secret: str) -> dict:
    """
    Decrypt GHL SSO encrypted data (CryptoJS AES compatible).
    CryptoJS uses OpenSSL-compatible format with EVP_BytesToKey for key derivation.
    """
    try:
        # Decode base64
        raw = base64.b64decode(encrypted_data)

        # Check for "Salted__" prefix (OpenSSL format)
        if raw[:8] == b"Salted__":
            salt = raw[8:16]
            ciphertext = raw[16:]
        else:
            # No salt prefix - use raw data
            salt = b""
            ciphertext = raw

        # Derive key and IV using EVP_BytesToKey (OpenSSL compatible)
        # CryptoJS default: AES-256-CBC with MD5-based key derivation
        def evp_bytes_to_key(password: bytes, salt: bytes, key_len: int = 32, iv_len: int = 16) -> tuple:
            dtot = b""
            d = b""
            while len(dtot) < key_len + iv_len:
                d = hashlib.md5(d + password + salt).digest()
                dtot += d
            return dtot[:key_len], dtot[key_len:key_len + iv_len]

        key, iv = evp_bytes_to_key(secret.encode("utf-8"), salt)

        # Decrypt using AES-256-CBC
        cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
        decryptor = cipher.decryptor()
        decrypted = decryptor.update(ciphertext) + decryptor.finalize()

        # Remove PKCS7 padding
        padding_len = decrypted[-1]
        decrypted = decrypted[:-padding_len]

        # Parse JSON
        return json.loads(decrypted.decode("utf-8"))
    except Exception as e:
        print(f"❌ SSO decrypt failed: {e}")
        raise ValueError(f"Failed to decrypt SSO data: {e}")


class AppContextRequest(BaseModel):
    """Request body for app-context endpoint."""
    encryptedData: str = ""
    locationId: Optional[str] = None


@router.post("/app-context")
@limiter.limit(RATE_LIMIT_AUTH)
async def app_context(request: Request, body: AppContextRequest):
    """
    GHL SSO app context endpoint.
    Decrypts user data from GHL iframe postMessage and validates authentication.
    """
    encrypted_data = body.encryptedData
    target_location_id = body.locationId

    user = None

    # Try to decrypt SSO data if provided
    if encrypted_data and encrypted_data.strip():
        if not settings.GHL_APP_SHARED_SECRET:
            print("⚠️ GHL_APP_SHARED_SECRET not configured")
            raise HTTPException(status_code=500, detail="SSO not configured")

        try:
            user = decrypt_ghl_sso_data(encrypted_data, settings.GHL_APP_SHARED_SECRET)
            print(f"✅ SSO user decrypted: companyId={user.get('companyId')}, location={user.get('activeLocation')}")
        except ValueError as e:
            print(f"❌ SSO decrypt failed: {e}")
            # Continue without user data - might have locationId

    # Determine location ID from user data or request
    location_id = None
    if user and user.get("activeLocation"):
        location_id = user["activeLocation"]
    elif target_location_id:
        location_id = target_location_id

    if not location_id:
        raise HTTPException(
            status_code=401,
            detail="No location ID found. Please install the app from GHL Marketplace."
        )

    # Check if location has tokens stored
    tokens = await get_location_tokens(location_id)

    if not tokens:
        raise HTTPException(
            status_code=422,
            detail={
                "error": "app_not_installed",
                "message": f"App not installed for location {location_id}",
                "redirectUrl": "/auth/install"
            }
        )

    # Get plan info
    plan = tokens.get("plan", "free")
    features = get_plan_features(plan)

    # Generate JWT tokens for the frontend
    # Note: tokens["location_id"] is the internal UUID from the locations table
    jwt_access_token = create_access_token(
        location_id=str(tokens.get("location_id", "")),
        ghl_location_id=location_id,
        tenant_id=str(tokens.get("tenant_id", "")),
        plan=plan,
    )

    jwt_refresh_token = create_refresh_token(
        location_id=str(tokens.get("location_id", "")),
        ghl_location_id=location_id,
        tenant_id=str(tokens.get("tenant_id", "")),
    )

    return {
        "user": {
            "companyId": user.get("companyId") if user else None,
            "userId": user.get("userId") if user else None,
            "email": user.get("email") if user else None,
            "type": user.get("type") if user else "location",
        } if user else None,
        "location": {
            "id": location_id,
            "name": tokens.get("location_name", "Unknown Location"),
        },
        "authenticated": True,
        "plan": plan,
        "features": {
            "unlimited_merges": features.unlimited_merges,
            "auto_merge": features.auto_merge,
            "scheduled_scans": features.scheduled_scans,
            "company_matching": features.company_matching,
            "white_label": features.white_label,
        },
        "access_token": jwt_access_token,
        "refresh_token": jwt_refresh_token,
        "is_on_trial": tokens.get("is_on_trial", False),
        "trial_ends_at": tokens.get("trial_ends_at"),
        "upgrade_url": get_upgrade_url(location_id),
    }
