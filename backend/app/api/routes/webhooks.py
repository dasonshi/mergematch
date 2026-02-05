from fastapi import APIRouter, Request, HTTPException, Header
import asyncio
import hmac
import hashlib
import time
import uuid
import logging
from datetime import datetime, timedelta

from app.config import settings
from app.db.supabase import get_supabase
from app.services.billing_service import (
    handle_app_install,
    handle_app_uninstall,
    handle_plan_change,
    get_plan_features,
)
from app.services.matching_service import compare_records, run_scan
from app.services.auth_service import get_location_tokens_with_refresh
from app.core.rate_limit import limiter, RATE_LIMIT_WEBHOOK

logger = logging.getLogger(__name__)
router = APIRouter()

# Maximum age for webhook timestamps (5 minutes)
MAX_WEBHOOK_AGE_SECONDS = 300

# Cooldown between webhook-triggered scans per location (5 minutes)
WEBHOOK_SCAN_COOLDOWN_SECONDS = 300

# Events grouped by action type
_CREATE_EVENTS = {
    "ContactCreate", "contact.created",
    "RecordCreate", "company.created",
    "OpportunityCreate",
}
_UPDATE_EVENTS = {
    "ContactUpdate", "contact.updated",
    "ContactDndUpdate", "ContactTagUpdate",
    "RecordUpdate", "company.updated",
    "OpportunityUpdate", "OpportunityStatusUpdate",
    "OpportunityStageUpdate", "OpportunityMonetaryValueUpdate",
    "OpportunityAssignedToUpdate",
}
_DELETE_EVENTS = {
    "ContactDelete",
    "RecordDelete",
    "OpportunityDelete",
}
_TRACKING_ONLY_EVENTS = {
    "NoteCreate", "NoteUpdate", "NoteDelete",
    "TaskCreate", "TaskDelete", "TaskComplete",
    "RelationCreate", "RelationDelete",
}

# Map event types to their source_object for auto-scan
_EVENT_SOURCE_OBJECT = {
    "ContactCreate": "contacts", "contact.created": "contacts",
    "RecordCreate": "companies", "company.created": "companies",
    "OpportunityCreate": "opportunities",
}


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


def verify_webhook_timestamp(timestamp_value) -> bool:
    """Verify webhook timestamp is within acceptable range to prevent replay attacks.

    Args:
        timestamp_value: Unix timestamp in milliseconds (int) or ISO 8601 string

    Returns:
        True if timestamp is within MAX_WEBHOOK_AGE_SECONDS, False otherwise
    """
    if not timestamp_value:
        # If no timestamp provided, allow (GHL may not always include it)
        return True

    # Convert to epoch seconds depending on type
    if isinstance(timestamp_value, str):
        try:
            from datetime import datetime as _dt
            ts = _dt.fromisoformat(timestamp_value.replace("Z", "+00:00"))
            age_seconds = time.time() - ts.timestamp()
        except (ValueError, TypeError):
            # Can't parse — allow through rather than block
            return True
    else:
        current_time_ms = int(time.time() * 1000)
        age_seconds = (current_time_ms - int(timestamp_value)) / 1000

    if age_seconds > MAX_WEBHOOK_AGE_SECONDS:
        logger.warning(f"Webhook timestamp too old: {age_seconds:.0f}s (max {MAX_WEBHOOK_AGE_SECONDS}s)")
        return False

    if age_seconds < -60:  # Allow 1 minute clock skew in the future
        logger.warning(f"Webhook timestamp in future: {age_seconds:.0f}s")
        return False

    return True


def _extract_record_id_and_data(payload: dict) -> tuple:
    """Extract record ID and full record data from a webhook payload.

    GHL webhook payloads vary by type:
    - Contact events: record data at top level with 'id'
    - Record/Opportunity events: may have data nested or at top level
    Returns (record_id, record_data) or (None, None) if not found.
    """
    # Try top-level id first (most common for contacts)
    record_id = payload.get("id")
    if record_id:
        return record_id, payload

    # Try nested in 'data'
    data = payload.get("data", {})
    if isinstance(data, dict):
        record_id = data.get("id")
        if record_id:
            return record_id, data

    # Try contactId for contact-related events
    record_id = payload.get("contactId") or (data.get("contactId") if isinstance(data, dict) else None)
    if record_id:
        return record_id, data if isinstance(data, dict) and data.get("id") else payload

    return None, None


async def _update_match_pair_snapshots(record_id: str, fresh_data: dict) -> list:
    """Update snapshot data in pending match_pairs that reference this record.

    Returns list of affected pair IDs for re-validation.
    """
    if not record_id or not fresh_data:
        return []

    supabase = get_supabase()
    affected_pair_ids = []

    try:
        # Find pending pairs where this record is record_a
        pairs_a = supabase.table("match_pairs").select("id").eq(
            "record_a_id", record_id
        ).eq("status", "pending").execute()

        for pair in (pairs_a.data or []):
            supabase.table("match_pairs").update({
                "record_a_data": fresh_data,
                "updated_at": datetime.utcnow().isoformat(),
            }).eq("id", pair["id"]).execute()
            affected_pair_ids.append(pair["id"])

        # Find pending pairs where this record is record_b
        pairs_b = supabase.table("match_pairs").select("id").eq(
            "record_b_id", record_id
        ).eq("status", "pending").execute()

        for pair in (pairs_b.data or []):
            supabase.table("match_pairs").update({
                "record_b_data": fresh_data,
                "updated_at": datetime.utcnow().isoformat(),
            }).eq("id", pair["id"]).execute()
            affected_pair_ids.append(pair["id"])

        if affected_pair_ids:
            logger.info(f"Updated snapshots for {len(affected_pair_ids)} match pairs (record {record_id})")

    except Exception as e:
        logger.warning(f"Failed to update match pair snapshots for {record_id}: {e}")

    return affected_pair_ids


async def _mark_pairs_stale(record_id: str) -> int:
    """Mark all pending match_pairs referencing this record as stale.

    Used when a record is deleted.
    Returns count of pairs marked stale.
    """
    if not record_id:
        return 0

    supabase = get_supabase()
    stale_count = 0

    try:
        stale_a = supabase.table("match_pairs").update({
            "status": "stale",
        }).eq("record_a_id", record_id).eq("status", "pending").execute()
        stale_count += len(stale_a.data or [])

        stale_b = supabase.table("match_pairs").update({
            "status": "stale",
        }).eq("record_b_id", record_id).eq("status", "pending").execute()
        stale_count += len(stale_b.data or [])

        if stale_count > 0:
            logger.info(f"Marked {stale_count} match pairs as stale (record {record_id} deleted)")

    except Exception as e:
        logger.warning(f"Failed to mark pairs stale for {record_id}: {e}")

    return stale_count


async def _revalidate_pairs(pair_ids: list):
    """Re-validate match pairs using their now-fresh snapshot data.

    If a pair no longer matches above the rule's review_threshold, mark it stale.
    If it still matches, update the confidence_score.
    """
    if not pair_ids:
        return

    supabase = get_supabase()

    for pair_id in pair_ids:
        try:
            # Fetch the pair with its current data
            pair_result = supabase.table("match_pairs").select(
                "id, record_a_data, record_b_data, rule_id, confidence_score"
            ).eq("id", pair_id).eq("status", "pending").single().execute()

            if not pair_result.data:
                continue

            pair = pair_result.data
            rule_id = pair.get("rule_id")
            if not rule_id:
                continue

            # Fetch the rule's match_fields and thresholds
            rule_result = supabase.table("match_rules").select(
                "match_fields, review_threshold"
            ).eq("id", rule_id).single().execute()

            if not rule_result.data:
                continue

            rule = rule_result.data
            match_fields = rule.get("match_fields", [])
            review_threshold = float(rule.get("review_threshold", 0.70)) * 100

            if not match_fields:
                continue

            record_a_data = pair.get("record_a_data", {})
            record_b_data = pair.get("record_b_data", {})

            if not record_a_data or not record_b_data:
                continue

            # Re-compare using the fresh data
            is_match, confidence, field_scores = compare_records(
                record_a_data, record_b_data, match_fields
            )

            if not is_match or confidence < review_threshold:
                # No longer matches — mark stale
                supabase.table("match_pairs").update({
                    "status": "stale",
                    "updated_at": datetime.utcnow().isoformat(),
                }).eq("id", pair_id).execute()
                logger.info(
                    f"Pair {pair_id} no longer matches after revalidation "
                    f"(confidence={confidence:.1f}%, threshold={review_threshold}%) — marked stale"
                )
            else:
                # Still matches — update confidence and field scores
                supabase.table("match_pairs").update({
                    "confidence_score": confidence / 100,  # Store as 0.0-1.0
                    "field_scores": field_scores,
                    "updated_at": datetime.utcnow().isoformat(),
                }).eq("id", pair_id).execute()
                logger.info(
                    f"Pair {pair_id} revalidated — confidence updated to {confidence:.1f}%"
                )

        except Exception as e:
            logger.warning(f"Failed to revalidate pair {pair_id}: {e}")


async def _trigger_webhook_scan(ghl_location_id: str, source_object: str):
    """Trigger an auto-scan for a location if allowed by plan and cooldown.

    Pro+ only. 5-minute cooldown per location to avoid excessive scanning.
    Runs in the background — errors are logged, not raised.
    """
    if not ghl_location_id:
        return

    try:
        # Get location tokens (includes plan info)
        tokens = await get_location_tokens_with_refresh(ghl_location_id)
        if not tokens:
            logger.debug(f"No tokens for location {ghl_location_id}, skipping webhook scan")
            return

        plan = tokens.get("plan", "free")
        features = get_plan_features(plan)

        # Gate: webhook_triggers must be enabled (Pro+ only)
        if not features.webhook_triggers:
            logger.debug(f"Webhook triggers not enabled for plan '{plan}', skipping auto-scan")
            return

        tenant_id = tokens["tenant_id"]
        internal_location_id = tokens["location_id"]
        access_token = tokens["access_token"]

        supabase = get_supabase()

        # Check cooldown: look for recent webhook-triggered job for this location
        cooldown_cutoff = (datetime.utcnow() - timedelta(seconds=WEBHOOK_SCAN_COOLDOWN_SECONDS)).isoformat()
        recent_jobs = supabase.table("job_executions").select("id").eq(
            "location_id", internal_location_id
        ).eq("trigger_type", "webhook").gte(
            "started_at", cooldown_cutoff
        ).limit(1).execute()

        if recent_jobs.data:
            logger.debug(f"Webhook scan cooldown active for location {ghl_location_id}, skipping")
            return

        # Find active rules matching this source_object
        rules = supabase.table("match_rules").select("id, name, source_object").eq(
            "location_id", internal_location_id
        ).eq("is_active", True).execute()

        matching_rules = [
            r for r in (rules.data or [])
            if r.get("source_object") == source_object
        ]

        if not matching_rules:
            logger.debug(f"No active rules for source_object '{source_object}' at location {ghl_location_id}")
            return

        for rule in matching_rules:
            rule_id = rule["id"]
            rule_name = rule.get("name", "Unknown")

            # Create job execution record
            job_id = str(uuid.uuid4())
            job_data = {
                "id": job_id,
                "tenant_id": tenant_id,
                "location_id": internal_location_id,
                "rule_id": rule_id,
                "status": "running",
                "trigger_type": "webhook",
                "started_at": datetime.utcnow().isoformat(),
            }
            supabase.table("job_executions").insert(job_data).execute()

            try:
                result = await run_scan(
                    ghl_location_id=ghl_location_id,
                    rule_id=rule_id,
                    access_token=access_token,
                    tenant_id=tenant_id,
                    internal_location_id=internal_location_id,
                    plan=plan,
                )

                supabase.table("job_executions").update({
                    "status": "completed",
                    "completed_at": datetime.utcnow().isoformat(),
                    "records_scanned": result.get("records_scanned", 0),
                    "matches_found": result.get("matches_found", 0),
                    "matches_stored": result.get("matches_stored", 0),
                    "auto_merged": result.get("auto_merged", 0),
                }).eq("id", job_id).execute()

                # Update last_scan_at on the rule
                supabase.table("match_rules").update({
                    "last_scan_at": datetime.utcnow().isoformat()
                }).eq("id", rule_id).execute()

                logger.info(
                    f"Webhook-triggered scan completed for rule '{rule_name}': "
                    f"{result.get('matches_found', 0)} matches found"
                )

            except Exception as e:
                error_msg = str(e)[:500]
                supabase.table("job_executions").update({
                    "status": "failed",
                    "completed_at": datetime.utcnow().isoformat(),
                    "error_message": error_msg,
                }).eq("id", job_id).execute()
                logger.error(f"Webhook-triggered scan failed for rule '{rule_name}': {e}")

    except Exception as e:
        logger.error(f"Failed to trigger webhook scan for {ghl_location_id}: {e}")


@router.post("/ghl")
@limiter.limit(RATE_LIMIT_WEBHOOK)
async def ghl_webhook(
    request: Request,
    x_ghl_signature: str = Header(None),
):
    """
    Receive webhooks from GoHighLevel.

    Handles:
    - Marketplace webhooks: INSTALL, UNINSTALL, PLAN_CHANGE
    - Data webhooks: Contact/Record/Opportunity create/update/delete
    - Tracking webhooks: Note, Task, Association, Relation events
    """
    body = await request.body()
    payload = await request.json()
    event_type = payload.get("type")
    data = payload.get("data", {})

    # Determine if this is a marketplace lifecycle event
    _MARKETPLACE_EVENTS = {"INSTALL", "UNINSTALL", "PLAN_CHANGE"}
    is_marketplace_event = event_type in _MARKETPLACE_EVENTS

    if is_marketplace_event:
        # SECURITY: Marketplace events always require valid signature
        if not x_ghl_signature or not verify_webhook_signature(body, x_ghl_signature):
            logger.warning("Marketplace webhook signature verification failed")
            raise HTTPException(status_code=401, detail="Invalid signature")
    elif x_ghl_signature:
        # Data webhook with signature — verify it
        if not verify_webhook_signature(body, x_ghl_signature):
            logger.warning("Data webhook signature verification failed")
            raise HTTPException(status_code=401, detail="Invalid signature")
    else:
        # Data webhook without signature — validate locationId against our DB
        location_id_check = payload.get("locationId") or (
            data.get("locationId") if isinstance(data, dict) else None
        )
        if not location_id_check:
            logger.warning("Data webhook missing both signature and locationId")
            raise HTTPException(status_code=401, detail="Unverifiable webhook")

        supabase = get_supabase()
        loc_check = supabase.table("locations").select("id").eq(
            "ghl_location_id", location_id_check
        ).limit(1).execute()
        if not loc_check.data:
            logger.warning(f"Data webhook from unknown location: {location_id_check}")
            raise HTTPException(status_code=401, detail="Unknown location")

    # SECURITY: Verify timestamp to prevent replay attacks
    timestamp = payload.get("timestamp") or payload.get("createdAt")
    if timestamp and not verify_webhook_timestamp(timestamp):
        raise HTTPException(status_code=400, detail="Webhook timestamp expired")

    logger.info(f"GHL webhook received: {event_type}")

    # ── Marketplace lifecycle events ──────────────────────────────────────
    if event_type == "INSTALL":
        result = await handle_app_install(
            location_id=payload.get("locationId"),
            company_id=payload.get("companyId"),
            plan_id=payload.get("planId"),
            trial_info=payload.get("trial"),
            whitelabel_details=payload.get("whitelabelDetails"),
            company_name=payload.get("companyName"),
        )
        logger.info(f"Install processed for location {payload.get('locationId')}")
        return {"received": True, "event": event_type, "result": result}

    elif event_type == "UNINSTALL":
        result = await handle_app_uninstall(
            location_id=payload.get("locationId"),
            company_id=payload.get("companyId"),
        )
        logger.info(f"Uninstall processed for location {payload.get('locationId')}")
        return {"received": True, "event": event_type, "result": result}

    elif event_type == "PLAN_CHANGE":
        result = await handle_plan_change(
            location_id=payload.get("locationId"),
            company_id=payload.get("companyId"),
            current_plan_id=payload.get("currentPlanId"),
            new_plan_id=payload.get("newPlanId"),
        )
        logger.info(f"Plan change processed for location {payload.get('locationId')}")
        return {"received": True, "event": event_type, "result": result}

    # ── Data webhooks ─────────────────────────────────────────────────────
    location_id = payload.get("locationId") or (data.get("locationId") if isinstance(data, dict) else None)

    # CREATE events: update timestamp + trigger auto-scan
    if event_type in _CREATE_EVENTS:
        await update_last_webhook_at(location_id)
        source_object = _EVENT_SOURCE_OBJECT.get(event_type)
        if location_id and source_object:
            # Fire-and-forget background auto-scan
            asyncio.ensure_future(_trigger_webhook_scan(location_id, source_object))
        return {"received": True, "event": event_type, "location_id": location_id}

    # UPDATE events: update timestamp + refresh snapshots + revalidate pairs
    if event_type in _UPDATE_EVENTS:
        await update_last_webhook_at(location_id)
        record_id, record_data = _extract_record_id_and_data(payload)
        if record_id and record_data:
            affected_pair_ids = await _update_match_pair_snapshots(record_id, record_data)
            if affected_pair_ids:
                # Fire-and-forget background revalidation
                asyncio.ensure_future(_revalidate_pairs(affected_pair_ids))
        return {"received": True, "event": event_type, "location_id": location_id}

    # DELETE events: update timestamp + mark affected pairs stale
    if event_type in _DELETE_EVENTS:
        await update_last_webhook_at(location_id)
        record_id, _ = _extract_record_id_and_data(payload)
        if record_id:
            await _mark_pairs_stale(record_id)
        return {"received": True, "event": event_type, "location_id": location_id}

    # TRACKING-ONLY events: just update the timestamp
    if event_type in _TRACKING_ONLY_EVENTS:
        await update_last_webhook_at(location_id)
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

    # SECURITY: Always verify signature (fail closed)
    if not x_ghl_signature or not verify_webhook_signature(body, x_ghl_signature):
        logger.warning("Marketplace webhook signature verification failed")
        raise HTTPException(status_code=401, detail="Invalid signature")

    payload = await request.json()
    event_type = payload.get("type")

    # SECURITY: Verify timestamp to prevent replay attacks
    timestamp = payload.get("timestamp") or payload.get("createdAt")
    if timestamp and not verify_webhook_timestamp(timestamp):
        raise HTTPException(status_code=400, detail="Webhook timestamp expired")

    logger.info(f"Marketplace webhook received: {event_type}")

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
            logger.info(f"Marketplace install processed for location {payload.get('locationId')}")
            return {"received": True, "event": event_type, "result": result}

        elif event_type == "UNINSTALL":
            result = await handle_app_uninstall(
                location_id=payload.get("locationId"),
                company_id=payload.get("companyId"),
            )
            logger.info(f"Marketplace uninstall processed for location {payload.get('locationId')}")
            return {"received": True, "event": event_type, "result": result}

        elif event_type == "PLAN_CHANGE":
            result = await handle_plan_change(
                location_id=payload.get("locationId"),
                company_id=payload.get("companyId"),
                current_plan_id=payload.get("currentPlanId"),
                new_plan_id=payload.get("newPlanId"),
            )
            logger.info(f"Marketplace plan change processed for location {payload.get('locationId')}")
            return {"received": True, "event": event_type, "result": result}

        else:
            logger.warning(f"Unknown marketplace event: {event_type}")
            return {"received": True, "event": event_type, "handled": False}

    except Exception as e:
        logger.error(f"Error processing marketplace {event_type}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
