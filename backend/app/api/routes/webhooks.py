from fastapi import APIRouter, Request, HTTPException, Header
import hmac
import hashlib
import time
import logging

from app.config import settings
from app.db.supabase import get_supabase
from app.services.billing_service import (
    handle_app_install,
    handle_app_uninstall,
    handle_plan_change,
)
from app.core.rate_limit import limiter, RATE_LIMIT_WEBHOOK

logger = logging.getLogger(__name__)
router = APIRouter()

# Maximum age for webhook timestamps (5 minutes)
MAX_WEBHOOK_AGE_SECONDS = 300


async def update_last_webhook_at(location_id: str):
    """Update the last_webhook_at timestamp for a location."""
    if not location_id:
        return
    try:
        supabase = get_supabase()
        supabase.table("locations").update({
            "last_webhook_at": "now()"
        }).eq("ghl_location_id", location_id).execute()
    except Exception as e:
        logger.warning(f"Failed to update last_webhook_at: {e}")


def verify_webhook_signature(payload: bytes, signature: str) -> bool:
    """Verify GHL webhook signature using HMAC-SHA256.

    Security: Fail closed - returns False if secret is not configured.
    """
    if not settings.GHL_WEBHOOK_SECRET:
        # SECURITY: Fail closed - do not accept webhooks without secret
        logger.error("GHL_WEBHOOK_SECRET not configured - rejecting webhook")
        return False

    expected = hmac.new(
        settings.GHL_WEBHOOK_SECRET.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(signature, expected)


def verify_webhook_timestamp(timestamp_ms: int) -> bool:
    """Verify webhook timestamp is within acceptable range to prevent replay attacks.

    Args:
        timestamp_ms: Unix timestamp in milliseconds from webhook payload

    Returns:
        True if timestamp is within MAX_WEBHOOK_AGE_SECONDS, False otherwise
    """
    if not timestamp_ms:
        # If no timestamp provided, allow (GHL may not always include it)
        return True

    current_time_ms = int(time.time() * 1000)
    age_seconds = (current_time_ms - timestamp_ms) / 1000

    if age_seconds > MAX_WEBHOOK_AGE_SECONDS:
        logger.warning(f"Webhook timestamp too old: {age_seconds:.0f}s (max {MAX_WEBHOOK_AGE_SECONDS}s)")
        return False

    if age_seconds < -60:  # Allow 1 minute clock skew in the future
        logger.warning(f"Webhook timestamp in future: {age_seconds:.0f}s")
        return False

    return True


@router.post("/ghl")
@limiter.limit(RATE_LIMIT_WEBHOOK)
async def ghl_webhook(
    request: Request,
    x_ghl_signature: str = Header(None),
):
    """
    Receive webhooks from GoHighLevel.

    Handles both:
    - Data webhooks: contact.created, company.created, etc.
    - Marketplace webhooks: INSTALL, UNINSTALL, PLAN_CHANGE
    """
    body = await request.body()

    # Verify signature in production
    if settings.ENVIRONMENT == "production":
        if not x_ghl_signature or not verify_webhook_signature(body, x_ghl_signature):
            raise HTTPException(status_code=401, detail="Invalid signature")

    payload = await request.json()
    event_type = payload.get("type")
    data = payload.get("data", {})

    print(f"📨 GHL webhook: {event_type}")

    # Handle marketplace lifecycle events
    if event_type == "INSTALL":
        result = await handle_app_install(
            location_id=payload.get("locationId"),
            company_id=payload.get("companyId"),
            plan_id=payload.get("planId"),
            trial_info=payload.get("trial"),
            whitelabel_details=payload.get("whitelabelDetails"),
            company_name=payload.get("companyName"),
        )
        print(f"   ✅ Install processed: {result}")
        return {"received": True, "event": event_type, "result": result}

    elif event_type == "UNINSTALL":
        result = await handle_app_uninstall(
            location_id=payload.get("locationId"),
            company_id=payload.get("companyId"),
        )
        print(f"   ✅ Uninstall processed: {result}")
        return {"received": True, "event": event_type, "result": result}

    elif event_type == "PLAN_CHANGE":
        result = await handle_plan_change(
            location_id=payload.get("locationId"),
            company_id=payload.get("companyId"),
            current_plan_id=payload.get("currentPlanId"),
            new_plan_id=payload.get("newPlanId"),
        )
        print(f"   ✅ Plan change processed: {result}")
        return {"received": True, "event": event_type, "result": result}

    # Handle data webhooks (contact/company updates)
    elif event_type in ["contact.created", "contact.updated", "ContactCreate", "ContactUpdate"]:
        location_id = payload.get("locationId") or data.get("locationId")
        await update_last_webhook_at(location_id)
        # TODO: Queue real-time duplicate check
        return {"received": True, "event": event_type, "location_id": location_id}

    elif event_type in ["company.created", "company.updated", "RecordCreate", "RecordUpdate"]:
        location_id = payload.get("locationId") or data.get("locationId")
        await update_last_webhook_at(location_id)
        # TODO: Queue company duplicate check
        return {"received": True, "event": event_type, "location_id": location_id}

    return {"received": True, "event": event_type}


@router.post("/marketplace")
async def marketplace_webhook(
    request: Request,
    x_ghl_signature: str = Header(None),
):
    """
    Receive GHL Marketplace app lifecycle webhooks.

    Events:
    - INSTALL: App installed (includes plan info)
    - UNINSTALL: App uninstalled
    - PLAN_CHANGE: User changed subscription plan
    """
    body = await request.body()

    # Verify signature in production
    if settings.ENVIRONMENT == "production":
        if not x_ghl_signature or not verify_webhook_signature(body, x_ghl_signature):
            raise HTTPException(status_code=401, detail="Invalid signature")

    payload = await request.json()
    event_type = payload.get("type")

    print(f"📦 Marketplace webhook: {event_type}")
    print(f"   Payload: {payload}")

    try:
        if event_type == "INSTALL":
            result = await handle_app_install(
                location_id=payload.get("locationId"),
                company_id=payload.get("companyId"),
                plan_id=payload.get("planId"),
                trial_info=payload.get("trial"),
                whitelabel_details=payload.get("whitelabelDetails"),
                company_name=payload.get("companyName"),
            )
            print(f"   ✅ Install processed: {result}")
            return {"received": True, "event": event_type, "result": result}

        elif event_type == "UNINSTALL":
            result = await handle_app_uninstall(
                location_id=payload.get("locationId"),
                company_id=payload.get("companyId"),
            )
            print(f"   ✅ Uninstall processed: {result}")
            return {"received": True, "event": event_type, "result": result}

        elif event_type == "PLAN_CHANGE":
            result = await handle_plan_change(
                location_id=payload.get("locationId"),
                company_id=payload.get("companyId"),
                current_plan_id=payload.get("currentPlanId"),
                new_plan_id=payload.get("newPlanId"),
            )
            print(f"   ✅ Plan change processed: {result}")
            return {"received": True, "event": event_type, "result": result}

        else:
            print(f"   ⚠️ Unknown marketplace event: {event_type}")
            return {"received": True, "event": event_type, "handled": False}

    except Exception as e:
        print(f"   ❌ Error processing {event_type}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
