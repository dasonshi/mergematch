from fastapi import APIRouter, Request, HTTPException, Header
import hmac
import hashlib

from app.config import settings

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
async def ghl_webhook(
    request: Request,
    x_ghl_signature: str = Header(None),
):
    """
    Receive webhooks from GoHighLevel.

    Events we care about:
    - contact.created
    - contact.updated
    - company.created
    - company.updated
    - opportunity.created
    - opportunity.updated
    """
    body = await request.body()

    # Verify signature in production
    if settings.ENVIRONMENT == "production":
        if not x_ghl_signature or not verify_webhook_signature(body, x_ghl_signature):
            raise HTTPException(status_code=401, detail="Invalid signature")

    payload = await request.json()
    event_type = payload.get("type")
    data = payload.get("data", {})

    # Route based on event type
    if event_type in ["contact.created", "contact.updated"]:
        # TODO: Queue real-time duplicate check
        pass
    elif event_type in ["company.created", "company.updated"]:
        # TODO: Queue company duplicate check
        pass

    return {"received": True, "event": event_type}
