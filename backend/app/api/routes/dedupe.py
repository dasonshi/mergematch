"""
Dedupe check endpoint for real-time duplicate detection in GHL workflows.

This endpoint allows GHL workflows to check incoming contacts for duplicates
and optionally auto-merge them based on configured match rules.
"""
from fastapi import APIRouter, HTTPException, Header, Query
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import uuid
import logging

from app.db.supabase import get_supabase
from app.services.auth_service import get_location_tokens_with_refresh
from app.services.matching_service import check_single_contact
from app.services.merge_service import execute_merge
from app.core.security import get_current_user_flexible

logger = logging.getLogger(__name__)

router = APIRouter()


async def get_current_plan_from_db(location_id: str) -> str:
    """Get the current plan from database instead of relying on JWT.

    SECURITY: JWT plan field could be stale if user downgraded.
    Always verify plan from database for sensitive operations.
    """
    supabase = get_supabase()
    result = supabase.table("locations").select(
        "tenants(plan)"
    ).eq("id", location_id).single().execute()

    if result.data and result.data.get("tenants"):
        return result.data["tenants"].get("plan", "free")
    return "free"


class RuleOption(BaseModel):
    """Single option for rule dropdown."""
    label: str
    value: str


class RuleOptionsResponse(BaseModel):
    """Response format for GHL External API dropdown."""
    options: List[RuleOption]


@router.get("/rules/options", response_model=RuleOptionsResponse)
async def get_rule_options(
    authorization: Optional[str] = Header(None, alias="Authorization"),
    location_id: Optional[str] = Query(None, description="GHL Location ID"),
):
    """
    Get available match rules for dropdown in GHL workflow action.
    Returns rules in GHL External API format for Select field.
    """
    # Authenticate user
    user = await get_current_user_flexible(authorization=authorization, location_id=location_id)

    supabase = get_supabase()

    # Get active contact rules for this location
    rules_result = supabase.table("match_rules").select(
        "id, name"
    ).eq("location_id", user.location_id).eq("is_active", True).eq(
        "source_object", "contacts"
    ).execute()

    options = [
        RuleOption(label="All Active Rules", value="")
    ]

    for rule in rules_result.data or []:
        options.append(RuleOption(
            label=rule["name"],
            value=rule["id"]
        ))

    return RuleOptionsResponse(options=options)


class DedupeCheckRequest(BaseModel):
    """Request body for dedupe check."""
    contact_id: str
    rule_id: Optional[str] = None  # Optional: specific rule to use
    auto_execute: bool = True  # If true, merge immediately when threshold met
    location_id: Optional[str] = None  # GHL location ID (from workflow context)


class DedupeCheckResponse(BaseModel):
    """Response for dedupe check."""
    status: str  # "merged", "unique", "pending_review"
    branchId: str  # GHL workflow branching - matches status
    is_duplicate: bool
    matched_contact_id: Optional[str] = None
    confidence_score: Optional[float] = None
    action_taken: str  # "auto_merged", "queued_for_review", "none"
    master_record_id: Optional[str] = None
    merge_id: Optional[str] = None
    contact_checked: Optional[Dict[str, Any]] = None
    contacts_scanned: int = 0


@router.post("/check", response_model=DedupeCheckResponse)
async def check_duplicate(
    body: DedupeCheckRequest,
    authorization: Optional[str] = Header(None, alias="Authorization"),
    location_id: Optional[str] = Query(None, description="GHL Location ID (legacy)"),
):
    """
    Check a contact for duplicates and optionally auto-merge.

    This endpoint is designed to be called from GHL workflows via webhook.
    It checks the given contact against existing contacts using configured
    match rules, and can automatically merge duplicates if above threshold.

    **Request:**
    - contact_id: The GHL contact ID to check
    - rule_id: (optional) Specific rule to use, otherwise all active rules
    - auto_execute: If true (default), automatically merge when above threshold
    - location_id: (optional) GHL location ID from workflow context

    **Response:**
    - status: "merged" | "unique" | "pending_review"
    - is_duplicate: Whether a duplicate was found
    - matched_contact_id: The ID of the matched contact (if duplicate)
    - confidence_score: Match confidence as percentage (0-100)
    - action_taken: What action was taken
    - master_record_id: If merged, which record survived
    """
    # Use location_id from body if not in query params
    effective_location_id = location_id or body.location_id

    # Authenticate user
    user = await get_current_user_flexible(authorization=authorization, location_id=effective_location_id)

    # SECURITY: Verify plan from database, not JWT (JWT could be stale after downgrade)
    current_plan = await get_current_plan_from_db(user.location_id)
    if current_plan not in ("pro", "agency"):
        raise HTTPException(
            status_code=403,
            detail="Dedupe check endpoint requires Pro or Agency plan. Upgrade to access this feature."
        )

    # Get GHL tokens for API calls
    tokens = await get_location_tokens_with_refresh(user.ghl_location_id)
    if not tokens:
        raise HTTPException(
            status_code=401,
            detail="Location not authenticated or token refresh failed"
        )

    # Check for duplicates
    try:
        check_result = await check_single_contact(
            contact_id=body.contact_id,
            ghl_location_id=user.ghl_location_id,
            access_token=tokens["access_token"],
            tenant_id=user.tenant_id,
            internal_location_id=user.location_id,
            rule_id=body.rule_id,
            plan=user.plan,
        )
    except Exception as e:
        logger.error(f"Dedupe check failed: {e}")
        raise HTTPException(status_code=500, detail=f"Dedupe check failed: {str(e)}")

    # Handle error response
    if check_result.get("error"):
        raise HTTPException(status_code=404, detail=check_result["error"])

    # No duplicates found
    if not check_result.get("is_duplicate"):
        return DedupeCheckResponse(
            status="unique",
            branchId="unique",
            is_duplicate=False,
            action_taken="none",
            contact_checked=check_result.get("contact_checked"),
            contacts_scanned=check_result.get("contacts_scanned", 0),
        )

    best_match = check_result.get("best_match")

    # Check if we should auto-merge
    if best_match and best_match.get("auto_merge_eligible") and body.auto_execute:
        # Create match pair record first (required for merge service)
        supabase = get_supabase()
        match_id = str(uuid.uuid4())

        # Get the new contact data (full data for merge)
        new_contact_data = check_result.get("contact_data", {})
        contact_checked = check_result.get("contact_checked", {})

        # Determine master record: existing contact is master, new contact is duplicate
        master_id = best_match["matched_contact_id"]
        duplicate_id = body.contact_id

        match_data = {
            "id": match_id,
            "tenant_id": user.tenant_id,
            "location_id": user.location_id,
            "rule_id": best_match["rule_id"],
            "record_a_id": master_id,
            "record_a_type": "contact",
            "record_a_data": best_match["matched_contact_data"],
            "record_b_id": duplicate_id,
            "record_b_type": "contact",
            "record_b_data": new_contact_data,  # Full contact data for merge
            "confidence_score": best_match["confidence_score"] / 100,
            "field_scores": best_match["field_scores"],
            "status": "auto_approved",
        }

        try:
            supabase.table("match_pairs").insert(match_data).execute()
        except Exception as e:
            logger.warning(f"Failed to insert match pair: {e}")
            # Continue anyway - merge can still work

        # Build field selections: prefer existing (master) record values
        # For auto-merge, we keep master's data and only fill in gaps from duplicate
        field_selections = {}
        master_data = best_match["matched_contact_data"]

        # Common merge fields
        merge_fields = [
            "firstName", "lastName", "email", "phone",
            "address1", "city", "state", "postalCode", "country",
            "website", "companyName", "tags"
        ]

        for field in merge_fields:
            # Prefer master (existing) record, fall back to duplicate (new) if master is empty
            if master_data.get(field):
                field_selections[field] = "a"  # a = master
            elif new_contact_data.get(field):
                field_selections[field] = "b"  # b = duplicate

        try:
            merge_result = await execute_merge(
                match_id=match_id,
                master_record_id=master_id,
                field_selections=field_selections,
                access_token=tokens["access_token"],
                ghl_location_id=user.ghl_location_id,
                tenant_id=user.tenant_id,
                internal_location_id=user.location_id,
            )

            logger.info(f"Auto-merged duplicate: {duplicate_id} into {master_id}")

            return DedupeCheckResponse(
                status="merged",
                branchId="merged",
                is_duplicate=True,
                matched_contact_id=master_id,
                confidence_score=best_match["confidence_score"],
                action_taken="auto_merged",
                master_record_id=master_id,
                merge_id=merge_result.get("id"),
                contact_checked=contact_checked,
                contacts_scanned=check_result.get("contacts_scanned", 0),
            )

        except Exception as e:
            logger.error(f"Auto-merge failed: {e}")
            # Fall through to pending_review status
            return DedupeCheckResponse(
                status="pending_review",
                branchId="pending_review",
                is_duplicate=True,
                matched_contact_id=best_match["matched_contact_id"],
                confidence_score=best_match["confidence_score"],
                action_taken="queued_for_review",
                contact_checked=contact_checked,
                contacts_scanned=check_result.get("contacts_scanned", 0),
            )

    # Duplicate found but below auto-merge threshold or auto_execute=False
    # Store for manual review
    if best_match:
        supabase = get_supabase()
        match_id = str(uuid.uuid4())
        new_contact_data = check_result.get("contact_data", {})
        contact_checked = check_result.get("contact_checked", {})

        match_data = {
            "id": match_id,
            "tenant_id": user.tenant_id,
            "location_id": user.location_id,
            "rule_id": best_match["rule_id"],
            "record_a_id": best_match["matched_contact_id"],
            "record_a_type": "contact",
            "record_a_data": best_match["matched_contact_data"],
            "record_b_id": body.contact_id,
            "record_b_type": "contact",
            "record_b_data": new_contact_data,  # Full contact data for merge
            "confidence_score": best_match["confidence_score"] / 100,
            "field_scores": best_match["field_scores"],
            "status": "pending",
        }

        try:
            supabase.table("match_pairs").insert(match_data).execute()
        except Exception as e:
            logger.warning(f"Failed to store match for review: {e}")

        return DedupeCheckResponse(
            status="pending_review",
            branchId="pending_review",
            is_duplicate=True,
            matched_contact_id=best_match["matched_contact_id"],
            confidence_score=best_match["confidence_score"],
            action_taken="queued_for_review",
            contact_checked=contact_checked,
            contacts_scanned=check_result.get("contacts_scanned", 0),
        )

    # Shouldn't reach here, but handle edge case
    return DedupeCheckResponse(
        status="unique",
        branchId="unique",
        is_duplicate=False,
        action_taken="none",
        contacts_scanned=check_result.get("contacts_scanned", 0),
    )
