"""
Settings routes for MergeMatch.
Handles location-level settings including merge strategies.
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from app.core.security import get_current_user, AuthenticatedUser
from app.db.supabase import get_supabase
from app.services.auth_service import get_location_tokens_with_refresh
from app.core.ghl.client import GHLClient

router = APIRouter()


# ==================== MODELS ====================

class FieldPreservationMapping(BaseModel):
    """Mapping from source field to target custom field."""
    source: str  # email, phone, etc.
    target: str  # Custom field name (e.g., "Secondary Email")


class FieldPreservationSettings(BaseModel):
    """Settings for preserving alternate values during merge."""
    enabled: bool = False
    auto_create_fields: bool = False
    mappings: List[FieldPreservationMapping] = []


class MergeStrategySettings(BaseModel):
    """Complete merge strategy settings."""
    field_preservation: FieldPreservationSettings = FieldPreservationSettings()


# ==================== ENDPOINTS ====================

@router.get("/merge-strategy")
async def get_merge_strategy(
    user: AuthenticatedUser = Depends(get_current_user)
) -> MergeStrategySettings:
    """Get merge strategy settings for the location."""
    supabase = get_supabase()

    result = supabase.table("locations").select(
        "settings"
    ).eq("ghl_location_id", user.ghl_location_id).single().execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Location not found")

    settings = result.data.get("settings") or {}
    field_preservation = settings.get("field_preservation", {})

    return MergeStrategySettings(
        field_preservation=FieldPreservationSettings(
            enabled=field_preservation.get("enabled", False),
            auto_create_fields=field_preservation.get("auto_create_fields", False),
            mappings=[
                FieldPreservationMapping(**m)
                for m in field_preservation.get("mappings", [])
            ]
        )
    )


@router.put("/merge-strategy")
async def update_merge_strategy(
    body: MergeStrategySettings,
    user: AuthenticatedUser = Depends(get_current_user)
) -> MergeStrategySettings:
    """Update merge strategy settings for the location."""
    supabase = get_supabase()

    # Get current settings
    result = supabase.table("locations").select(
        "settings"
    ).eq("ghl_location_id", user.ghl_location_id).single().execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Location not found")

    # Merge with existing settings
    settings = result.data.get("settings") or {}
    settings["field_preservation"] = {
        "enabled": body.field_preservation.enabled,
        "auto_create_fields": body.field_preservation.auto_create_fields,
        "mappings": [m.model_dump() for m in body.field_preservation.mappings]
    }

    # Save updated settings
    supabase.table("locations").update({
        "settings": settings
    }).eq("ghl_location_id", user.ghl_location_id).execute()

    return body


# ==================== CUSTOM FIELDS ====================

@router.get("/custom-fields")
async def get_custom_fields(
    user: AuthenticatedUser = Depends(get_current_user)
) -> List[dict]:
    """Get all custom fields from GHL for the location."""
    tokens = await get_location_tokens_with_refresh(user.ghl_location_id)
    if not tokens:
        raise HTTPException(status_code=401, detail="Unable to get CRM tokens")

    async with GHLClient(tokens["access_token"], user.ghl_location_id) as client:
        fields = await client.get_custom_fields(model="contact")
        return fields


class CreateCustomFieldRequest(BaseModel):
    """Request to create a custom field."""
    name: str
    data_type: str = "TEXT"


@router.post("/custom-fields")
async def create_custom_field(
    body: CreateCustomFieldRequest,
    user: AuthenticatedUser = Depends(get_current_user)
) -> dict:
    """Create a new custom field in GHL."""
    tokens = await get_location_tokens_with_refresh(user.ghl_location_id)
    if not tokens:
        raise HTTPException(status_code=401, detail="Unable to get CRM tokens")

    async with GHLClient(tokens["access_token"], user.ghl_location_id) as client:
        result = await client.create_custom_field(
            name=body.name,
            data_type=body.data_type,
            model="contact"
        )
        return result
