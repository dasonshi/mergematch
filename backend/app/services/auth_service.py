from datetime import datetime, timedelta
from typing import Optional
from cryptography.fernet import Fernet
import base64

from app.config import settings
from app.db.supabase import get_supabase


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

    result = supabase.table("locations").select("*").eq(
        "ghl_location_id", location_id
    ).single().execute()

    if not result.data:
        return None

    location = result.data
    return {
        "access_token": decrypt_token(location["access_token_encrypted"]),
        "refresh_token": decrypt_token(location["refresh_token_encrypted"]),
        "expires_at": location["token_expires_at"],
        "tenant_id": location["tenant_id"],
        "location_id": location["id"],
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
