from fastapi import APIRouter, Request, HTTPException, Header
import hmac
import hashlib

from app.config import settings
from app.services.billing_service import (
    handle_app_install,
    handle_app_uninstall,
    handle_plan_change,
)
from app.core.rate_limit import limiter, RATE_LIMIT_WEBHOOK

router = APIRouter()


def verify_webhook_signature(payload: bytes, signature: str) -> bool:
    """Verify GHL webhook signature."""
    if not settings.GHL_WEBHOOK_SECRET:
        return True  # Skip in development

    expected = hmac.new(
        settings.GHL_WEBHOOK_SECRET.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(signature, expected)


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

    # Handle data webhooks
    elif event_type in ["contact.created", "contact.updated", "ContactCreate", "ContactUpdate"]:
        # TODO: Queue real-time duplicate check
        pass
    elif event_type in ["company.created", "company.updated", "RecordCreate", "RecordUpdate"]:
        # TODO: Queue company duplicate check
        pass

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
