"""
Sync routes for MergeMatch.
Handles sync cooldown tracking and status.
"""
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from typing import Optional, List
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel
import logging

from app.core.security import AuthenticatedUser
from app.core.deps import get_user
from app.db.supabase import get_supabase
from app.services.auth_service import get_location_tokens
from app.services.matching_service import run_scan

router = APIRouter()
logger = logging.getLogger(__name__)

SYNC_COOLDOWN_SECONDS = 300  # 5 minutes


class SyncStatusResponse(BaseModel):
    can_sync: bool
    last_synced_at: Optional[str] = None
    cooldown_remaining: int = 0  # seconds


class SyncTriggerResponse(BaseModel):
    success: bool
    last_synced_at: str


class ForceResyncResponse(BaseModel):
    success: bool
    message: str
    rules_scanned: int = 0
    total_matches_found: int = 0
    total_records_scanned: int = 0


@router.get("/status", response_model=SyncStatusResponse)
async def get_sync_status(
    user: AuthenticatedUser = Depends(get_user),
):
    """
    Get current sync status including cooldown info.
    Returns whether sync is available and when it was last performed.
    """
    supabase = get_supabase()

    # Get location settings
    result = supabase.table("locations").select(
        "settings"
    ).eq("ghl_location_id", user.ghl_location_id).single().execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Location not found")

    settings = result.data.get("settings") or {}
    last_synced_at = settings.get("last_synced_at")

    can_sync = True
    cooldown_remaining = 0

    if last_synced_at:
        try:
            # Parse the timestamp
            last_synced_str = last_synced_at.replace("Z", "+00:00")
            last_sync_time = datetime.fromisoformat(last_synced_str)
            next_available = last_sync_time + timedelta(seconds=SYNC_COOLDOWN_SECONDS)
            now = datetime.now(timezone.utc)

            if now < next_available:
                can_sync = False
                cooldown_remaining = int((next_available - now).total_seconds())
        except Exception:
            pass  # If parsing fails, allow sync

    return SyncStatusResponse(
        can_sync=can_sync,
        last_synced_at=last_synced_at,
        cooldown_remaining=cooldown_remaining,
    )


@router.post("/trigger", response_model=SyncTriggerResponse)
async def trigger_sync(
    user: AuthenticatedUser = Depends(get_user),
):
    """
    Record a sync trigger and update the last_synced_at timestamp.
    Returns 429 if still in cooldown period.
    """
    supabase = get_supabase()

    # Get current location settings
    result = supabase.table("locations").select(
        "settings"
    ).eq("ghl_location_id", user.ghl_location_id).single().execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Location not found")

    settings = result.data.get("settings") or {}
    last_synced_at = settings.get("last_synced_at")

    # Check cooldown
    if last_synced_at:
        try:
            last_synced_str = last_synced_at.replace("Z", "+00:00")
            last_sync_time = datetime.fromisoformat(last_synced_str)
            next_available = last_sync_time + timedelta(seconds=SYNC_COOLDOWN_SECONDS)
            now = datetime.now(timezone.utc)

            if now < next_available:
                cooldown_remaining = int((next_available - now).total_seconds())
                raise HTTPException(
                    status_code=429,
                    detail=f"Sync cooldown active. Try again in {cooldown_remaining} seconds.",
                    headers={"Retry-After": str(cooldown_remaining)},
                )
        except HTTPException:
            raise
        except Exception:
            pass  # If parsing fails, allow sync

    # Update last_synced_at
    now = datetime.now(timezone.utc)
    settings["last_synced_at"] = now.isoformat()

    supabase.table("locations").update({
        "settings": settings,
        "updated_at": now.isoformat(),
    }).eq("ghl_location_id", user.ghl_location_id).execute()

    return SyncTriggerResponse(
        success=True,
        last_synced_at=settings["last_synced_at"],
    )


@router.post("/force-resync", response_model=ForceResyncResponse)
async def force_resync(
    user: AuthenticatedUser = Depends(get_user),
):
    """
    Force a full resync by fetching all data from GHL and running scans.
    Bypasses the normal cooldown period.
    """
    supabase = get_supabase()

    # Get GHL tokens for making API calls
    tokens = await get_location_tokens(user.ghl_location_id)
    if not tokens:
        raise HTTPException(status_code=401, detail="Location not authenticated")

    access_token = tokens.get("access_token")
    if not access_token:
        raise HTTPException(status_code=401, detail="No access token available")

    # Get internal location info
    location_result = supabase.table("locations").select(
        "id, tenant_id, settings"
    ).eq("ghl_location_id", user.ghl_location_id).single().execute()

    if not location_result.data:
        raise HTTPException(status_code=404, detail="Location not found")

    internal_location_id = str(location_result.data["id"])
    tenant_id = str(location_result.data["tenant_id"])

    # Get all active match rules for this location
    rules_result = supabase.table("match_rules").select("*").eq(
        "location_id", internal_location_id
    ).eq("is_active", True).execute()

    rules = rules_result.data or []

    if not rules:
        # No rules to scan, but still update the timestamp
        now = datetime.now(timezone.utc)
        settings = location_result.data.get("settings") or {}
        settings["last_synced_at"] = now.isoformat()
        supabase.table("locations").update({
            "settings": settings,
            "updated_at": now.isoformat(),
        }).eq("ghl_location_id", user.ghl_location_id).execute()

        return ForceResyncResponse(
            success=True,
            message="No active match rules to scan",
            rules_scanned=0,
            total_matches_found=0,
            total_records_scanned=0,
        )

    # Run scans for each active rule
    total_matches = 0
    total_records = 0
    rules_scanned = 0

    for rule in rules:
        try:
            logger.info(f"Force resync: scanning rule '{rule.get('name')}' (id: {rule['id']})")
            result = await run_scan(
                ghl_location_id=user.ghl_location_id,
                rule_id=rule["id"],
                access_token=access_token,
                tenant_id=tenant_id,
                internal_location_id=internal_location_id,
                plan=user.plan or "free",
            )

            if result.get("scan_aborted"):
                raise RuntimeError(result.get("message", "Scan aborted due to dataset size"))

            total_matches += result.get("matches_found", 0)
            total_records += result.get("records_scanned", 0)
            rules_scanned += 1

            # Update rule's last_scan_at
            supabase.table("match_rules").update({
                "last_scan_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }).eq("id", rule["id"]).execute()

            logger.info(f"Force resync: rule '{rule.get('name')}' found {result.get('matches_found', 0)} matches")

        except Exception as e:
            logger.error(f"Force resync: failed to scan rule '{rule.get('name')}': {e}")
            # Continue with other rules even if one fails

    # Update last_synced_at timestamp
    now = datetime.now(timezone.utc)
    settings = location_result.data.get("settings") or {}
    settings["last_synced_at"] = now.isoformat()

    supabase.table("locations").update({
        "settings": settings,
        "updated_at": now.isoformat(),
    }).eq("ghl_location_id", user.ghl_location_id).execute()

    return ForceResyncResponse(
        success=True,
        message=f"Scanned {rules_scanned} rule(s) and found {total_matches} potential matches",
        rules_scanned=rules_scanned,
        total_matches_found=total_matches,
        total_records_scanned=total_records,
    )
