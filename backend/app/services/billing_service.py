"""
Billing service for GHL Marketplace integration.
Handles plan mapping, tier features, and billing webhooks.
"""
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from pydantic import BaseModel

from app.config import settings
from app.db.supabase import get_supabase


# ============================================================================
# Plan Definitions
# ============================================================================

class PlanFeatures(BaseModel):
    """Features available for each plan tier."""
    name: str
    price: int  # monthly price in dollars
    max_scans_per_day: int
    max_matches_preview: int  # how many matches shown before paywall
    free_merges: int  # one-time free merges for trial
    unlimited_merges: bool
    auto_merge: bool
    scheduled_scans: bool
    company_matching: bool
    opportunity_matching: bool
    custom_object_matching: bool
    webhook_triggers: bool
    white_label: bool
    rollback_days: int
    priority_support: bool


# Feature matrix for each tier
PLAN_FEATURES: Dict[str, PlanFeatures] = {
    "free": PlanFeatures(
        name="Free",
        price=0,  # $0/mo
        max_scans_per_day=1,
        max_matches_preview=10,
        free_merges=3,
        unlimited_merges=False,
        auto_merge=False,
        scheduled_scans=False,
        company_matching=False,
        opportunity_matching=False,
        custom_object_matching=False,
        webhook_triggers=False,
        white_label=False,
        rollback_days=7,
        priority_support=False,
    ),
    "starter": PlanFeatures(
        name="Starter",
        price=14,  # $14/mo
        max_scans_per_day=10,
        max_matches_preview=999999,
        free_merges=999999,
        unlimited_merges=True,
        auto_merge=False,
        scheduled_scans=True,
        company_matching=True,
        opportunity_matching=False,
        custom_object_matching=False,
        webhook_triggers=False,
        white_label=False,
        rollback_days=7,
        priority_support=False,
    ),
    "pro": PlanFeatures(
        name="Pro",
        price=29,  # $29/mo
        max_scans_per_day=999999,
        max_matches_preview=999999,
        free_merges=999999,
        unlimited_merges=True,
        auto_merge=True,
        scheduled_scans=True,
        company_matching=True,
        opportunity_matching=True,
        custom_object_matching=True,
        webhook_triggers=True,
        white_label=False,
        rollback_days=30,
        priority_support=True,
    ),
    "agency": PlanFeatures(
        name="Agency",
        price=49,  # $49/mo
        max_scans_per_day=999999,
        max_matches_preview=999999,
        free_merges=999999,
        unlimited_merges=True,
        auto_merge=True,
        scheduled_scans=True,
        company_matching=True,
        opportunity_matching=True,
        custom_object_matching=True,
        webhook_triggers=True,
        white_label=True,
        rollback_days=30,
        priority_support=True,
    ),
}


def get_plan_features(plan: str) -> PlanFeatures:
    """Get features for a plan tier."""
    return PLAN_FEATURES.get(plan, PLAN_FEATURES["free"])


# ============================================================================
# Plan ID Mapping
# ============================================================================

def get_plan_id_mapping() -> Dict[str, str]:
    """
    Parse GHL_PLAN_MAPPING env var into dict.
    Format: "plan_id:tier,plan_id:tier"
    Returns: {ghl_plan_id: tier_name}
    """
    mapping = {}
    if not settings.GHL_PLAN_MAPPING:
        return mapping

    for pair in settings.GHL_PLAN_MAPPING.split(","):
        pair = pair.strip()
        if ":" in pair:
            plan_id, tier = pair.split(":", 1)
            mapping[plan_id.strip()] = tier.strip()

    return mapping


def get_tier_from_plan_id(ghl_plan_id: Optional[str]) -> str:
    """
    Convert a GHL Marketplace plan ID to our internal tier name.
    Returns 'free' if plan ID is unknown or not set.
    """
    if not ghl_plan_id:
        return "free"

    mapping = get_plan_id_mapping()
    return mapping.get(ghl_plan_id, "free")


def get_plan_id_for_tier(tier: str) -> Optional[str]:
    """Get the GHL plan ID for a tier (reverse lookup)."""
    mapping = get_plan_id_mapping()
    for plan_id, tier_name in mapping.items():
        if tier_name == tier:
            return plan_id
    return None


# ============================================================================
# Billing Operations
# ============================================================================

async def handle_app_install(
    location_id: str,
    company_id: str,
    plan_id: Optional[str],
    trial_info: Optional[Dict[str, Any]] = None,
    whitelabel_details: Optional[Dict[str, Any]] = None,
    company_name: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Handle GHL Marketplace app install webhook.
    Creates or updates tenant/location with billing info.
    """
    supabase = get_supabase()
    tier = get_tier_from_plan_id(plan_id)

    # Calculate trial end date if on trial
    trial_ends_at = None
    is_on_trial = False
    if trial_info and trial_info.get("onTrial"):
        is_on_trial = True
        trial_duration = trial_info.get("trialDuration", 14)
        trial_start = trial_info.get("trialStartDate")
        if trial_start:
            start_dt = datetime.fromisoformat(trial_start.replace("Z", "+00:00"))
            trial_ends_at = start_dt + timedelta(days=trial_duration)
        else:
            trial_ends_at = datetime.utcnow() + timedelta(days=trial_duration)

    # Upsert tenant
    tenant_data = {
        "ghl_company_id": company_id,
        "name": company_name or f"Company {company_id[:8]}",
        "plan": tier,
        "ghl_plan_id": plan_id,
        "billing_status": "active",
        "is_on_trial": is_on_trial,
        "trial_ends_at": trial_ends_at.isoformat() if trial_ends_at else None,
        "uninstalled_at": None,  # Clear any previous uninstall
    }

    tenant_result = supabase.table("tenants").upsert(
        tenant_data,
        on_conflict="ghl_company_id"
    ).execute()

    tenant = tenant_result.data[0] if tenant_result.data else None
    if not tenant:
        raise Exception("Failed to create/update tenant")

    # Upsert location if location_id provided
    location = None
    if location_id:
        location_data = {
            "tenant_id": tenant["id"],
            "ghl_location_id": location_id,
            "name": f"Location {location_id[:8]}",
            "ghl_plan_id": plan_id,
            "is_on_trial": is_on_trial,
            "trial_ends_at": trial_ends_at.isoformat() if trial_ends_at else None,
            "is_active": True,
            "uninstalled_at": None,
        }

        location_result = supabase.table("locations").upsert(
            location_data,
            on_conflict="tenant_id,ghl_location_id"
        ).execute()

        location = location_result.data[0] if location_result.data else None

    return {
        "tenant_id": tenant["id"],
        "location_id": location["id"] if location else None,
        "plan": tier,
        "is_on_trial": is_on_trial,
        "trial_ends_at": trial_ends_at.isoformat() if trial_ends_at else None,
    }


async def handle_app_uninstall(
    location_id: Optional[str] = None,
    company_id: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Handle GHL Marketplace app uninstall webhook.
    Soft-deletes the location or tenant.
    """
    supabase = get_supabase()
    now = datetime.utcnow().isoformat()

    if location_id:
        # Location-level uninstall
        supabase.table("locations").update({
            "is_active": False,
            "uninstalled_at": now,
        }).eq("ghl_location_id", location_id).execute()

        return {"uninstalled": "location", "location_id": location_id}

    elif company_id:
        # Agency-level uninstall - deactivate all locations
        supabase.table("tenants").update({
            "billing_status": "cancelled",
            "uninstalled_at": now,
        }).eq("ghl_company_id", company_id).execute()

        # Also deactivate all locations for this tenant
        tenant = supabase.table("tenants").select("id").eq(
            "ghl_company_id", company_id
        ).single().execute()

        if tenant.data:
            supabase.table("locations").update({
                "is_active": False,
                "uninstalled_at": now,
            }).eq("tenant_id", tenant.data["id"]).execute()

        return {"uninstalled": "company", "company_id": company_id}

    return {"uninstalled": None}


async def handle_plan_change(
    location_id: str,
    company_id: str,
    current_plan_id: str,
    new_plan_id: str,
) -> Dict[str, Any]:
    """
    Handle GHL Marketplace plan change webhook.
    Updates the tier for the location/tenant.
    """
    supabase = get_supabase()
    old_tier = get_tier_from_plan_id(current_plan_id)
    new_tier = get_tier_from_plan_id(new_plan_id)

    # Update tenant
    supabase.table("tenants").update({
        "plan": new_tier,
        "ghl_plan_id": new_plan_id,
        "is_on_trial": False,  # Plan change ends trial
        "trial_ends_at": None,
    }).eq("ghl_company_id", company_id).execute()

    # Update location if specified
    if location_id:
        supabase.table("locations").update({
            "ghl_plan_id": new_plan_id,
            "is_on_trial": False,
            "trial_ends_at": None,
        }).eq("ghl_location_id", location_id).execute()

    return {
        "location_id": location_id,
        "company_id": company_id,
        "old_plan": old_tier,
        "new_plan": new_tier,
    }


async def check_feature_access(
    location_id: str,
    feature: str,
) -> bool:
    """
    Check if a location has access to a specific feature.
    Used for gating features by plan.
    """
    supabase = get_supabase()

    result = supabase.table("locations").select(
        "*, tenants(plan, is_on_trial, trial_ends_at)"
    ).eq("ghl_location_id", location_id).single().execute()

    if not result.data:
        return False

    tenant = result.data.get("tenants", {})
    plan = tenant.get("plan", "free")

    # Check if trial has expired
    is_on_trial = tenant.get("is_on_trial", False)
    if is_on_trial:
        trial_ends = tenant.get("trial_ends_at")
        if trial_ends:
            trial_end_dt = datetime.fromisoformat(trial_ends.replace("Z", "+00:00"))
            if datetime.utcnow() > trial_end_dt:
                # Trial expired, revert to free
                plan = "free"

    features = get_plan_features(plan)
    return getattr(features, feature, False)


def get_upgrade_url(location_id: str) -> str:
    """
    Get the GHL Marketplace URL for upgrading the plan.
    """
    app_id = settings.GHL_APP_ID
    if app_id:
        return f"https://marketplace.gohighlevel.com/app/{app_id}?locationId={location_id}"
    return "https://marketplace.gohighlevel.com"


async def check_merge_quota(location_id: str, plan: str) -> Dict[str, Any]:
    """
    Check if location has remaining merge quota.
    Returns: {"allowed": bool, "used": int, "limit": int, "remaining": int}
    """
    # Normalize plan to lowercase (DB may store "Free" but PLAN_FEATURES uses "free")
    features = get_plan_features(plan.lower() if plan else "free")

    # Unlimited plans always allowed
    if features.unlimited_merges:
        return {"allowed": True, "used": 0, "limit": -1, "remaining": -1}

    # Count completed merges for this location
    supabase = get_supabase()
    result = supabase.table("merges").select("id", count="exact").eq(
        "location_id", location_id
    ).eq("status", "completed").execute()

    used = result.count or 0
    limit = features.free_merges
    remaining = max(0, limit - used)

    return {
        "allowed": used < limit,
        "used": used,
        "limit": limit,
        "remaining": remaining
    }
