"""
Dedupe check endpoint for real-time duplicate detection in GHL workflows.

This endpoint allows GHL workflows to check incoming contacts for duplicates
and optionally auto-merge them based on configured match rules.
"""
from fastapi import APIRouter, HTTPException, Header, Query, Request
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import uuid
import json
import logging

from app.db.supabase import get_supabase
from app.services.auth_service import get_location_tokens_with_refresh
from app.services.matching_service import check_single_contact
from app.services.merge_service import execute_merge
from app.core.security import get_current_user_flexible, AuthenticatedUser

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


async def authenticate_ghl_action(
    authorization: Optional[str] = None,
    ghl_location_id: Optional[str] = None,
) -> AuthenticatedUser:
    """
    Authenticate a GHL workflow action request.

    Tries JWT Bearer token first. Falls back to looking up the location
    by ghl_location_id in the database. This fallback is needed because
    GHL custom actions send {{action.extras.locationId}} but cannot
    include our JWT.

    Security:
    - Only installed, active locations exist in the DB
    - Plan is always verified from the database (not the JWT)
    - The ghl_location_id is injected by GHL itself (trusted source)
    """
    # Try JWT first (used by frontend / direct API calls)
    if authorization:
        try:
            return await get_current_user_flexible(authorization=authorization)
        except HTTPException:
            pass  # Fall through to location_id lookup

    # Fall back to DB lookup by GHL location ID (used by GHL workflow actions)
    if not ghl_location_id:
        raise HTTPException(
            status_code=401,
            detail="Authentication required. Provide Authorization header or location_id.",
        )

    supabase = get_supabase()
    result = supabase.table("locations").select(
        "id, tenant_id, ghl_location_id, is_active, uninstalled_at, tenants(plan)"
    ).eq("ghl_location_id", ghl_location_id).single().execute()

    if not result.data:
        logger.warning(f"GHL action auth failed: unknown location {ghl_location_id}")
        raise HTTPException(
            status_code=401,
            detail="Location not found. Is the app installed?",
        )

    loc = result.data

    # Verify the location is active and not uninstalled
    if not loc.get("is_active") or loc.get("uninstalled_at"):
        logger.warning(f"GHL action auth rejected: inactive location {ghl_location_id}")
        raise HTTPException(
            status_code=403,
            detail="App is not active for this location.",
        )

    plan = "free"
    if loc.get("tenants"):
        plan = loc["tenants"].get("plan", "free")

    logger.info(f"GHL action authenticated via location_id: {ghl_location_id}")

    return AuthenticatedUser(
        location_id=loc["id"],
        ghl_location_id=loc["ghl_location_id"],
        tenant_id=loc["tenant_id"],
        plan=plan,
    )


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
    # Authenticate: JWT or GHL location ID lookup
    user = await authenticate_ghl_action(
        authorization=authorization,
        ghl_location_id=location_id,
    )

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


# ---------------------------------------------------------------------------
# GHL Default payload models (sent when body mode = "Default")
# ---------------------------------------------------------------------------

class GhlActionBranch(BaseModel):
    """A branch definition from GHL's branches array."""
    id: str
    name: str
    fields: Optional[Dict[str, Any]] = None


class GhlActionData(BaseModel):
    """The data object inside the GHL default payload."""
    contact_id: str
    rule_id: Optional[str] = None
    auto_execute: Optional[Any] = True  # Toggle sends string "true"/"false"


class GhlActionExtras(BaseModel):
    """The extras object inside the GHL default payload."""
    locationId: Optional[str] = None
    contactId: Optional[str] = None
    workflowId: Optional[str] = None


class DedupeCheckRequest(BaseModel):
    """
    Request body for dedupe check.

    Accepts GHL Default payload format:
      { "data": {...}, "extras": {...}, "branches": [...] }

    Also accepts flat format for direct API / testing:
      { "contact_id": "...", "location_id": "..." }
    """
    # GHL Default payload fields
    data: Optional[GhlActionData] = None
    extras: Optional[GhlActionExtras] = None
    branches: Optional[List[GhlActionBranch]] = None

    # Flat fields (for direct API calls / testing)
    contact_id: Optional[str] = None
    rule_id: Optional[str] = None
    auto_execute: Optional[Any] = True
    location_id: Optional[str] = None

    def get_contact_id(self) -> str:
        """Resolve contact_id from nested or flat format."""
        if self.data and self.data.contact_id:
            return self.data.contact_id
        if self.contact_id:
            return self.contact_id
        raise ValueError("contact_id is required")

    def get_rule_id(self) -> Optional[str]:
        """Resolve rule_id from nested or flat format."""
        if self.data and self.data.rule_id:
            return self.data.rule_id
        return self.rule_id

    def get_auto_execute(self) -> bool:
        """Resolve auto_execute, handling string 'true'/'false' from GHL toggles."""
        val = self.data.auto_execute if self.data else self.auto_execute
        if isinstance(val, bool):
            return val
        if isinstance(val, str):
            return val.lower() in ("true", "1", "yes")
        return bool(val)

    def get_location_id(self) -> Optional[str]:
        """Resolve GHL location ID from nested or flat format."""
        if self.extras and self.extras.locationId:
            return self.extras.locationId
        return self.location_id

    def resolve_branch_id(self, status: str) -> str:
        """
        Map a status string to the GHL branch UUID.

        GHL assigns UUIDs to predefined branches. The branches array
        is included in the Default payload. We match by branch name.
        Falls back to the status string if no branches are provided
        (e.g. during testing or direct API calls).
        """
        if not self.branches:
            return status

        # Map our internal status to the expected branch name
        STATUS_TO_BRANCH_NAME = {
            "unique": "No Duplicate",
            "merged": "Auto-Merged",
            "pending_review": "Needs Review",
        }

        target_name = STATUS_TO_BRANCH_NAME.get(status, status)

        for branch in self.branches:
            if branch.name.lower() == target_name.lower():
                return branch.id

        # Fallback: return status string (works for testing)
        logger.warning(
            f"No branch found for status '{status}' (expected name: '{target_name}'). "
            f"Available branches: {[b.name for b in self.branches]}"
        )
        return status


class DedupeCheckResponse(BaseModel):
    """Response for dedupe check."""
    status: str  # "merged", "unique", "pending_review"
    branchId: str  # GHL workflow branching - UUID from predefined branches
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
    request: Request,
    body: DedupeCheckRequest,
    authorization: Optional[str] = Header(None, alias="Authorization"),
    location_id: Optional[str] = Query(None, alias="locationId", description="GHL Location ID"),
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
    # DEBUG: Log raw request to understand GHL test panel payload
    raw_body = await request.body()
    logger.info(f"Dedupe check raw body: {raw_body.decode('utf-8', errors='replace')}")
    logger.info(f"Dedupe check headers: Authorization={'present' if authorization else 'missing'}, query location_id={location_id}")
    logger.info(f"Dedupe check parsed: data={body.data}, extras={body.extras}, branches={body.branches}, flat contact_id={body.contact_id}, flat location_id={body.location_id}")

    # Resolve fields from GHL Default or flat payload
    try:
        contact_id_val = body.get_contact_id()
    except ValueError:
        raise HTTPException(status_code=422, detail="contact_id is required")

    rule_id_val = body.get_rule_id()
    auto_execute_val = body.get_auto_execute()
    ghl_loc_id = location_id or body.get_location_id()

    # Authenticate: JWT if available, otherwise DB lookup by GHL location ID
    user = await authenticate_ghl_action(
        authorization=authorization,
        ghl_location_id=ghl_loc_id,
    )

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
            contact_id=contact_id_val,
            ghl_location_id=user.ghl_location_id,
            access_token=tokens["access_token"],
            tenant_id=user.tenant_id,
            internal_location_id=user.location_id,
            rule_id=rule_id_val,
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
            branchId=body.resolve_branch_id("unique"),
            is_duplicate=False,
            action_taken="none",
            contact_checked=check_result.get("contact_checked"),
            contacts_scanned=check_result.get("contacts_scanned", 0),
        )

    best_match = check_result.get("best_match")

    # Check if we should auto-merge
    if best_match and best_match.get("auto_merge_eligible") and auto_execute_val:
        # Create match pair record first (required for merge service)
        supabase = get_supabase()
        match_id = str(uuid.uuid4())

        # Get the new contact data (full data for merge)
        new_contact_data = check_result.get("contact_data", {})
        contact_checked = check_result.get("contact_checked", {})

        # Determine master record: existing contact is master, new contact is duplicate
        master_id = best_match["matched_contact_id"]
        duplicate_id = contact_id_val

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
                branchId=body.resolve_branch_id("merged"),
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
                branchId=body.resolve_branch_id("pending_review"),
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
            "record_b_id": contact_id_val,
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
            branchId=body.resolve_branch_id("pending_review"),
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
        branchId=body.resolve_branch_id("unique"),
        is_duplicate=False,
        action_taken="none",
        contacts_scanned=check_result.get("contacts_scanned", 0),
    )
