"""
Sync routes for MergeMatch.
Handles sync cooldown tracking and status.
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel

from app.core.security import AuthenticatedUser
from app.core.deps import get_user
from app.db.supabase import get_supabase

router = APIRouter()

SYNC_COOLDOWN_SECONDS = 300  # 5 minutes


class SyncStatusResponse(BaseModel):
    can_sync: bool
    last_synced_at: Optional[str] = None
    cooldown_remaining: int = 0  # seconds remaining


class SyncTriggerResponse(BaseModel):
    success: bool
    last_synced_at: str


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
