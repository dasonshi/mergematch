from datetime import datetime, timedelta
from typing import Optional
from cryptography.fernet import Fernet
import base64
import httpx
import logging

from app.config import settings
from app.db.supabase import get_supabase

logger = logging.getLogger(__name__)


def get_fernet() -> Fernet:
    """Get Fernet cipher for token encryption."""
    key = settings.TOKEN_ENCRYPTION_KEY
    # Ensure key is proper base64-encoded 32 bytes
    if len(key) < 32:
        key = base64.urlsafe_b64encode(key.encode().ljust(32)[:32]).decode()
    return Fernet(key.encode() if isinstance(key, str) else key)


def encrypt_token(token: str) -> str:
    """Encrypt a token for storage."""
    fernet = get_fernet()
    return fernet.encrypt(token.encode()).decode()


def decrypt_token(encrypted: str) -> str:
    """Decrypt a stored token."""
    fernet = get_fernet()
    return fernet.decrypt(encrypted.encode()).decode()


async def store_oauth_tokens(
    company_id: str,
    location_id: str,
    location_name: str,
    access_token: str,
    refresh_token: str,
    expires_in: int,
) -> dict:
    """
    Store OAuth tokens after successful authorization.
    Creates tenant and location if they don't exist.
    """
    supabase = get_supabase()

    # Calculate token expiry
    expires_at = datetime.utcnow() + timedelta(seconds=expires_in)

    # Encrypt tokens
    encrypted_access = encrypt_token(access_token)
    encrypted_refresh = encrypt_token(refresh_token)

    # Upsert tenant
    tenant_result = supabase.table("tenants").upsert({
        "ghl_company_id": company_id,
        "name": location_name,  # Use location name as tenant name initially
    }, on_conflict="ghl_company_id").execute()

    tenant = tenant_result.data[0] if tenant_result.data else None
    if not tenant:
        raise Exception("Failed to create/update tenant")

    # Upsert location
    location_result = supabase.table("locations").upsert({
        "tenant_id": tenant["id"],
        "ghl_location_id": location_id,
        "name": location_name,
        "access_token_encrypted": encrypted_access,
        "refresh_token_encrypted": encrypted_refresh,
        "token_expires_at": expires_at.isoformat(),
        "is_active": True,
    }, on_conflict="tenant_id,ghl_location_id").execute()

    location = location_result.data[0] if location_result.data else None
    if not location:
        raise Exception("Failed to create/update location")

    return {
        "tenant_id": tenant["id"],
        "location_id": location["id"],
        "ghl_location_id": location_id,
    }


async def get_location_tokens(location_id: str) -> Optional[dict]:
    """Get decrypted tokens for a location."""
    supabase = get_supabase()

    # Join with tenants to get plan info
    result = supabase.table("locations").select(
        "*, tenants(id, plan, billing_status)"
    ).eq("ghl_location_id", location_id).single().execute()

    if not result.data:
        return None

    location = result.data
    tenant = location.get("tenants", {})
    return {
        "access_token": decrypt_token(location["access_token_encrypted"]),
        "refresh_token": decrypt_token(location["refresh_token_encrypted"]),
        "expires_at": location["token_expires_at"],
        "tenant_id": location["tenant_id"],
        "location_id": location["id"],
        "location_name": location.get("name", "Unknown Location"),
        "plan": tenant.get("plan", "free"),
        "billing_status": tenant.get("billing_status", "active"),
        "is_on_trial": tenant.get("is_on_trial", False),
        "trial_ends_at": tenant.get("trial_ends_at"),
        "ghl_plan_id": tenant.get("ghl_plan_id"),
        "last_webhook_at": location.get("last_webhook_at"),
    }


async def update_tokens(
    location_id: str,
    access_token: str,
    refresh_token: str,
    expires_in: int,
) -> None:
    """Update tokens after refresh."""
    supabase = get_supabase()

    expires_at = datetime.utcnow() + timedelta(seconds=expires_in)

    supabase.table("locations").update({
        "access_token_encrypted": encrypt_token(access_token),
        "refresh_token_encrypted": encrypt_token(refresh_token),
        "token_expires_at": expires_at.isoformat(),
    }).eq("ghl_location_id", location_id).execute()


async def refresh_ghl_token(ghl_location_id: str) -> Optional[dict]:
    """
    Refresh the GHL access token using the refresh token.
    Returns updated tokens or None if refresh fails.
    """
    supabase = get_supabase()

    # Get current tokens
    result = supabase.table("locations").select(
        "*, tenants(id, plan, billing_status)"
    ).eq("ghl_location_id", ghl_location_id).single().execute()

    if not result.data:
        logger.error(f"Location not found: {ghl_location_id}")
        return None

    location = result.data

    try:
        current_refresh_token = decrypt_token(location["refresh_token_encrypted"])
    except Exception as e:
        logger.error(f"Failed to decrypt refresh token: {e}")
        return None

    # Call GHL OAuth refresh endpoint
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://services.leadconnectorhq.com/oauth/token",
                headers={
                    "Accept": "application/json",
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                data={
                    "client_id": settings.GHL_CLIENT_ID,
                    "client_secret": settings.GHL_CLIENT_SECRET,
                    "grant_type": "refresh_token",
                    "refresh_token": current_refresh_token,
                    "user_type": "Location",
                    "redirect_uri": settings.GHL_REDIRECT_URI,
                },
                timeout=30.0,
            )

            if response.status_code != 200:
                logger.error(f"Token refresh failed: {response.status_code} - {response.text}")
                return None

            token_data = response.json()

            # Update tokens in database
            await update_tokens(
                location_id=ghl_location_id,
                access_token=token_data["access_token"],
                refresh_token=token_data["refresh_token"],
                expires_in=token_data.get("expires_in", 86400),
            )

            logger.info(f"Successfully refreshed token for location {ghl_location_id}")

            tenant = location.get("tenants", {})
            return {
                "access_token": token_data["access_token"],
                "refresh_token": token_data["refresh_token"],
                "expires_at": (datetime.utcnow() + timedelta(seconds=token_data.get("expires_in", 86400))).isoformat(),
                "tenant_id": location["tenant_id"],
                "location_id": location["id"],
                "location_name": location.get("name", "Unknown Location"),
                "plan": tenant.get("plan", "free"),
                "billing_status": tenant.get("billing_status", "active"),
            }

    except Exception as e:
        logger.error(f"Token refresh request failed: {e}")
        return None


async def get_location_tokens_with_refresh(ghl_location_id: str) -> Optional[dict]:
    """
    Get tokens for a location, automatically refreshing if expired.
    """
    supabase = get_supabase()

    # Get location with tokens
    result = supabase.table("locations").select(
        "*, tenants(id, plan, billing_status)"
    ).eq("ghl_location_id", ghl_location_id).single().execute()

    if not result.data:
        return None

    location = result.data
    tenant = location.get("tenants", {})

    # Check if token is expired (with 5 minute buffer)
    expires_at = location.get("token_expires_at")
    if expires_at:
        try:
            # Handle both ISO format with/without timezone
            expires_at_str = expires_at.replace("+00:00", "").replace("Z", "")
            expiry_time = datetime.fromisoformat(expires_at_str)
            if datetime.utcnow() >= (expiry_time - timedelta(minutes=5)):
                logger.info(f"Token expired for {ghl_location_id}, refreshing...")
                refreshed = await refresh_ghl_token(ghl_location_id)
                if refreshed:
                    return refreshed
                else:
                    logger.error(f"Token refresh failed for {ghl_location_id}")
                    return None
        except Exception as e:
            logger.warning(f"Could not parse token expiry: {e}")

    # Token still valid, return current tokens
    return {
        "access_token": decrypt_token(location["access_token_encrypted"]),
        "refresh_token": decrypt_token(location["refresh_token_encrypted"]),
        "expires_at": location["token_expires_at"],
        "tenant_id": location["tenant_id"],
        "location_id": location["id"],
        "location_name": location.get("name", "Unknown Location"),
        "plan": tenant.get("plan", "free"),
        "billing_status": tenant.get("billing_status", "active"),
        "is_on_trial": tenant.get("is_on_trial", False),
        "trial_ends_at": tenant.get("trial_ends_at"),
        "ghl_plan_id": tenant.get("ghl_plan_id"),
    }


# ============================================================================
# One-time Exchange Code functions (POST redirect flow for security)
# ============================================================================

async def store_exchange_code(
    code: str,
    location_id: str,
    ghl_location_id: str,
    jwt_access_token: str,
    jwt_refresh_token: str,
) -> None:
    """
    Store a one-time exchange code with JWT tokens.
    Code expires after 5 minutes and can only be used once.
    """
    supabase = get_supabase()

    supabase.table("auth_exchange_codes").insert({
        "code": code,
        "location_id": location_id,
        "ghl_location_id": ghl_location_id,
        "jwt_access_token": jwt_access_token,
        "jwt_refresh_token": jwt_refresh_token,
        # expires_at defaults to NOW() + 5 minutes in database
    }).execute()


async def get_and_use_exchange_code(code: str) -> Optional[dict]:
    """
    Get exchange code data and mark it as used (one-time use).
    Returns None if code is invalid, expired, or already used.
    """
    supabase = get_supabase()

    # Find unused, non-expired code
    result = supabase.table("auth_exchange_codes").select("*").eq(
        "code", code
    ).is_("used_at", "null").gte(
        "expires_at", datetime.utcnow().isoformat()
    ).single().execute()

    if not result.data:
        logger.warning(f"Invalid or expired exchange code attempted")
        return None

    exchange_data = result.data

    # Mark as used immediately (prevent replay attacks)
    supabase.table("auth_exchange_codes").update({
        "used_at": datetime.utcnow().isoformat()
    }).eq("id", exchange_data["id"]).execute()

    logger.info(f"Exchange code used for location {exchange_data['ghl_location_id']}")

    return {
        "jwt_access_token": exchange_data["jwt_access_token"],
        "jwt_refresh_token": exchange_data["jwt_refresh_token"],
        "ghl_location_id": exchange_data["ghl_location_id"],
        "location_id": exchange_data["location_id"],
    }
