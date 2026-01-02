# backend/app/core/security.py
"""
JWT-based authentication and security utilities.
Replaces insecure query parameter authentication with signed tokens.
"""
from datetime import datetime, timedelta
from typing import Optional
import hmac
import hashlib
import base64
import json
import time
import secrets

from jose import jwt, JWTError
from fastapi import HTTPException, Header, Depends
from pydantic import BaseModel

from app.config import settings


# JWT Configuration
ALGORITHM = "HS256"


class TokenPayload(BaseModel):
    """JWT token payload structure."""
    location_id: str  # Internal UUID
    ghl_location_id: str  # GHL's location ID
    tenant_id: str
    plan: str = "free"
    exp: Optional[datetime] = None
    iat: Optional[datetime] = None
    type: str = "access"  # "access" or "refresh"


class AuthenticatedUser(BaseModel):
    """Represents the authenticated user/location context."""
    location_id: str
    ghl_location_id: str
    tenant_id: str
    plan: str


def get_secret_key() -> str:
    """Get the secret key, validating it's properly set."""
    if not settings.SECRET_KEY or settings.SECRET_KEY == "change-me-in-production":
        if settings.ENVIRONMENT == "production":
            raise RuntimeError("SECRET_KEY must be set to a secure value in production!")
        # In development, use a consistent but insecure key
        return "dev-secret-key-not-for-production-use"
    return settings.SECRET_KEY


def create_access_token(
    location_id: str,
    ghl_location_id: str,
    tenant_id: str,
    plan: str = "free",
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create a signed JWT access token.

    Args:
        location_id: Internal UUID for the location
        ghl_location_id: GHL's location ID (used for API calls)
        tenant_id: Tenant UUID
        plan: Subscription plan
        expires_delta: Custom expiration time

    Returns:
        Signed JWT string
    """
    now = datetime.utcnow()
    expire = now + (expires_delta or timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES))

    payload = {
        "location_id": str(location_id),
        "ghl_location_id": ghl_location_id,
        "tenant_id": str(tenant_id),
        "plan": plan,
        "type": "access",
        "iat": now,
        "exp": expire,
    }

    return jwt.encode(payload, get_secret_key(), algorithm=ALGORITHM)


def create_refresh_token(
    location_id: str,
    ghl_location_id: str,
    tenant_id: str,
) -> str:
    """
    Create a signed JWT refresh token.
    Refresh tokens are longer-lived and used to obtain new access tokens.
    """
    now = datetime.utcnow()
    expire = now + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)

    payload = {
        "location_id": str(location_id),
        "ghl_location_id": ghl_location_id,
        "tenant_id": str(tenant_id),
        "type": "refresh",
        "iat": now,
        "exp": expire,
    }

    return jwt.encode(payload, get_secret_key(), algorithm=ALGORITHM)


def verify_token(token: str, token_type: str = "access") -> TokenPayload:
    """
    Verify and decode a JWT token.

    Args:
        token: The JWT string
        token_type: Expected token type ("access" or "refresh")

    Returns:
        Decoded token payload

    Raises:
        HTTPException: If token is invalid, expired, or wrong type
    """
    try:
        payload = jwt.decode(token, get_secret_key(), algorithms=[ALGORITHM])

        # Validate token type
        if payload.get("type") != token_type:
            raise HTTPException(
                status_code=401,
                detail=f"Invalid token type. Expected {token_type}."
            )

        return TokenPayload(**payload)

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except JWTError as e:
        raise HTTPException(
            status_code=401,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(
    authorization: Optional[str] = Header(None, alias="Authorization")
) -> AuthenticatedUser:
    """
    FastAPI dependency to extract and validate the current user from JWT.

    Usage:
        @router.get("/protected")
        async def protected_route(user: AuthenticatedUser = Depends(get_current_user)):
            return {"location_id": user.location_id}
    """
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authorization header required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Extract token from "Bearer <token>" format
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization header format. Use: Bearer <token>",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = parts[1]
    payload = verify_token(token, token_type="access")

    return AuthenticatedUser(
        location_id=payload.location_id,
        ghl_location_id=payload.ghl_location_id,
        tenant_id=payload.tenant_id,
        plan=payload.plan,
    )


async def get_current_user_flexible(
    authorization: Optional[str] = Header(None, alias="Authorization"),
    location_id: Optional[str] = None,  # Query param fallback
) -> AuthenticatedUser:
    """
    Flexible auth dependency that supports BOTH JWT and legacy query param.

    Priority:
    1. JWT Bearer token (preferred, secure)
    2. Query param location_id (legacy, deprecated)

    This allows gradual migration from query params to JWT.
    """
    # Try JWT first (preferred method)
    if authorization:
        parts = authorization.split()
        if len(parts) == 2 and parts[0].lower() == "bearer":
            token = parts[1]
            try:
                payload = verify_token(token, token_type="access")
                return AuthenticatedUser(
                    location_id=payload.location_id,
                    ghl_location_id=payload.ghl_location_id,
                    tenant_id=payload.tenant_id,
                    plan=payload.plan,
                )
            except HTTPException:
                pass  # Fall through to legacy method

    # Legacy fallback: query param (deprecated, but supported for transition)
    if location_id:
        # Import here to avoid circular imports
        from app.services.auth_service import get_location_tokens

        tokens = await get_location_tokens(location_id)
        if tokens:
            return AuthenticatedUser(
                location_id=str(tokens["location_id"]),
                ghl_location_id=location_id,
                tenant_id=str(tokens["tenant_id"]),
                plan=tokens.get("plan", "free"),
            )

    # No valid auth provided
    raise HTTPException(
        status_code=401,
        detail="Authentication required. Provide Authorization: Bearer <token> header.",
        headers={"WWW-Authenticate": "Bearer"},
    )


# ============================================================================
# OAuth State Security (CSRF Protection)
# ============================================================================

def create_secure_state() -> str:
    """
    Create a cryptographically secure OAuth state parameter.
    Prevents CSRF attacks during OAuth flow.

    Format: base64(payload).base64(hmac_signature)
    Payload contains timestamp and nonce for verification.
    """
    payload = {
        "timestamp": int(time.time() * 1000),
        "nonce": secrets.token_hex(16)
    }

    data = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode()
    signature = hmac.new(
        get_secret_key().encode(),
        data.encode(),
        hashlib.sha256
    ).digest()
    sig_b64 = base64.urlsafe_b64encode(signature).decode().rstrip("=")

    return f"{data}.{sig_b64}"


def verify_secure_state(state: str, max_age_ms: int = 600000) -> dict:
    """
    Verify an OAuth state parameter.

    Args:
        state: The state string from OAuth callback
        max_age_ms: Maximum age in milliseconds (default: 10 minutes)

    Returns:
        Decoded payload if valid

    Raises:
        ValueError: If state is invalid, tampered, or expired
    """
    if not state or not isinstance(state, str):
        raise ValueError("Missing or invalid state parameter")

    parts = state.split(".")
    if len(parts) != 2:
        raise ValueError("Invalid state format")

    data, signature = parts

    # Pad signature if needed for base64 decoding
    sig_padded = signature + "=" * (4 - len(signature) % 4) if len(signature) % 4 else signature

    # Verify HMAC signature
    expected_sig = hmac.new(
        get_secret_key().encode(),
        data.encode(),
        hashlib.sha256
    ).digest()
    expected_b64 = base64.urlsafe_b64encode(expected_sig).decode().rstrip("=")

    if not hmac.compare_digest(signature, expected_b64):
        raise ValueError("Invalid state signature")

    # Decode and validate payload
    try:
        payload = json.loads(base64.urlsafe_b64decode(data))
    except Exception:
        raise ValueError("Invalid state payload")

    # Check expiration
    age = int(time.time() * 1000) - payload.get("timestamp", 0)

    if age > max_age_ms:
        raise ValueError("State parameter expired")

    if age < 0:
        raise ValueError("State parameter from future (clock skew)")

    return payload


# ============================================================================
# Webhook Signature Verification
# ============================================================================

def verify_webhook_signature(payload: bytes, signature: str, secret: str) -> bool:
    """
    Verify GHL webhook signature using timing-safe comparison.

    Args:
        payload: Raw request body bytes
        signature: Signature from X-GHL-Signature header
        secret: Webhook secret

    Returns:
        True if signature is valid
    """
    if not signature or not secret:
        return False

    expected = hmac.new(
        secret.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()

    # Timing-safe comparison prevents timing attacks
    return hmac.compare_digest(signature, expected)


# ============================================================================
# Startup Validation
# ============================================================================

def validate_security_config():
    """
    Validate security configuration on startup.
    Exits the process if critical security settings are missing in production.
    """
    import sys

    if settings.ENVIRONMENT == "production":
        errors = []

        if not settings.SECRET_KEY or settings.SECRET_KEY == "change-me-in-production":
            errors.append("SECRET_KEY must be set to a secure random value")
        elif len(settings.SECRET_KEY) < 32:
            errors.append("SECRET_KEY should be at least 32 characters")

        if not settings.TOKEN_ENCRYPTION_KEY:
            errors.append("TOKEN_ENCRYPTION_KEY must be set")
        elif len(settings.TOKEN_ENCRYPTION_KEY) < 32:
            errors.append("TOKEN_ENCRYPTION_KEY should be at least 32 characters")

        if not settings.GHL_CLIENT_ID or not settings.GHL_CLIENT_SECRET:
            errors.append("GHL_CLIENT_ID and GHL_CLIENT_SECRET must be set")

        if errors:
            for error in errors:
                print(f"❌ Security Error: {error}")
            print("\n⚠️  Refusing to start with insecure configuration in production!")
            sys.exit(1)
    else:
        # Development warnings
        if not settings.SECRET_KEY or settings.SECRET_KEY == "change-me-in-production":
            print("⚠️  Warning: Using insecure default SECRET_KEY (OK for development)")
        if not settings.TOKEN_ENCRYPTION_KEY:
            print("⚠️  Warning: TOKEN_ENCRYPTION_KEY not set (OK for development)")
