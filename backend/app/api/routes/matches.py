from fastapi import APIRouter, HTTPException, Query, Header, Request, Depends
from pydantic import BaseModel, Field
from typing import Optional, List
import httpx
import logging
import gc

from app.db.supabase import get_supabase
from app.services.auth_service import get_location_tokens
from app.core.security import AuthenticatedUser
from app.core.deps import get_user, get_auth_context, AuthContext
from app.core.ghl.client import GHLClient
from app.core.rate_limit import limiter

logger = logging.getLogger(__name__)

router = APIRouter()


class RejectRequest(BaseModel):
    reason: Optional[str] = Field(None, max_length=1000)


class CleanupRequest(BaseModel):
    match_ids: List[str]


# ==================== STATIC ROUTES (must come before dynamic routes) ====================

@router.get("/")
@limiter.limit("100/minute")
async def list_matches(
    request: Request,
    user: AuthenticatedUser = Depends(get_user),
    status: Optional[str] = Query(None, description="Filter by status: pending, approved, rejected, merged"),
    rule_id: Optional[str] = Query(None, description="Filter by match rule ID"),
    limit: int = Query(50, le=1000),
    offset: int = Query(0),
):
    """List match pairs for the current location."""
    supabase = get_supabase()

    # Get the true total count (not limited by pagination)
    count_query = (
        supabase.table("match_pairs")
        .select("*", count="exact")
        .eq("location_id", user.location_id)
    )
    if status:
        count_query = count_query.eq("status", status)
    if rule_id:
        count_query = count_query.eq("rule_id", rule_id)
    count_result = count_query.limit(1).execute()
    true_total = count_result.count if count_result.count is not None else 0

    # Count unique contacts involved in matches (deduplicated across rules)
    # A contact appearing in 10 pairs across 5 rules is still just 1 contact
    # Paginate to handle >1000 rows (Supabase default limit)
    unique_contacts = set()
    page_offset = 0
    page_size = 1000
    while True:
        ids_query = supabase.table("match_pairs").select("record_a_id, record_b_id").eq("location_id", user.location_id)
        if status:
            ids_query = ids_query.eq("status", status)
        if rule_id:
            ids_query = ids_query.eq("rule_id", rule_id)
        ids_result = ids_query.range(page_offset, page_offset + page_size - 1).execute()
        for row in ids_result.data:
            unique_contacts.add(row["record_a_id"])
            unique_contacts.add(row["record_b_id"])
        if len(ids_result.data) < page_size:
            break
        page_offset += page_size

    # Fetch paginated data
    query = supabase.table("match_pairs").select("*").eq("location_id", user.location_id)
    if status:
        query = query.eq("status", status)
    if rule_id:
        query = query.eq("rule_id", rule_id)

    query = query.range(offset, offset + limit - 1)
    result = query.execute()

    return {
        "data": result.data,
        "total": true_total,
        "unique_contacts": len(unique_contacts),
        "limit": limit,
        "offset": offset,
    }


@router.post("/validate")
async def validate_matches(
    rule_id: str = Query(..., description="Match rule ID"),
    ctx: AuthContext = Depends(get_auth_context),
):
    """
    Validate match pairs - check if contacts still exist in GHL.
    Returns list of valid and stale match IDs.
    """
    supabase = get_supabase()

    # Get pending matches for this rule
    matches = (
        supabase.table("match_pairs")
        .select("id, record_a_id, record_b_id")
        .eq("rule_id", rule_id)
        .eq("status", "pending")
        .eq("location_id", ctx.location_id)
        .execute()
    )

    if not matches.data:
        return {"valid": [], "stale": []}

    # Get all unique contact IDs
    contact_ids = set()
    for m in matches.data:
        contact_ids.add(m["record_a_id"])
        contact_ids.add(m["record_b_id"])

    logger.info(f"Validating {len(contact_ids)} unique contacts for {len(matches.data)} match pairs")

    # Check which contacts exist in GHL
    async with GHLClient(ctx.access_token, ctx.ghl_location_id) as client:
        existing_ids = set()
        for contact_id in contact_ids:
            try:
                await client.get_contact(contact_id)
                existing_ids.add(contact_id)
            except httpx.HTTPStatusError as e:
                # GHL returns 404 OR 400 with "Contact not found" for deleted contacts
                if e.response.status_code == 404:
                    logger.info(f"Contact {contact_id} not found in GHL (404)")
                elif e.response.status_code == 400:
                    # Check if it's a "Contact not found" error
                    try:
                        error_body = e.response.json()
                        if "not found" in error_body.get("message", "").lower():
                            logger.info(f"Contact {contact_id} not found in GHL (400: {error_body.get('message')})")
                        else:
                            # Other 400 error - assume exists
                            existing_ids.add(contact_id)
                            logger.warning(f"Contact {contact_id} check failed with 400: {error_body}, assuming exists")
                    except Exception:
                        # Can't parse response, treat as not found to be safe
                        logger.info(f"Contact {contact_id} returned 400, treating as not found")
                else:
                    # Other errors (5xx, etc) - assume exists
                    existing_ids.add(contact_id)
                    logger.warning(f"Contact {contact_id} check failed with {e.response.status_code}, assuming exists")
            except Exception as e:
                # Assume exists on other errors
                existing_ids.add(contact_id)
                logger.warning(f"Contact {contact_id} check error: {e}, assuming exists")

    # Categorize matches and mark stale ones in DB
    valid = []
    stale = []
    for m in matches.data:
        if m["record_a_id"] in existing_ids and m["record_b_id"] in existing_ids:
            valid.append(m["id"])
        else:
            # Mark as stale directly in DB
            supabase.table("match_pairs").update({"status": "stale"}).eq("id", m["id"]).execute()
            stale.append(m["id"])
            logger.info(f"Marked match {m['id']} as stale - contact(s) no longer exist in GHL")

    logger.info(f"Validation result: {len(valid)} valid, {len(stale)} stale (auto-cleaned)")

    # Force garbage collection after processing many API responses
    gc.collect()

    return {"valid": valid, "stale": stale, "stale_cleaned": len(stale)}


@router.post("/cleanup-stale")
async def cleanup_stale_matches(
    body: CleanupRequest,
    user: AuthenticatedUser = Depends(get_user),
):
    """Mark stale match pairs as 'stale' status."""
    supabase = get_supabase()

    cleaned = 0
    for match_id in body.match_ids:
        result = (
            supabase.table("match_pairs")
            .update({"status": "stale"})
            .eq("id", match_id)
            .eq("location_id", user.location_id)
            .execute()
        )
        if result.data:
            cleaned += 1

    logger.info(f"Cleaned up {cleaned} stale match pairs")

    return {"cleaned": cleaned}


@router.get("/counts")
@limiter.limit("100/minute")
async def get_match_counts(
    request: Request,
    user: AuthenticatedUser = Depends(get_user),
    status: Optional[str] = Query(None, description="Filter by status: pending, approved, rejected, merged"),
):
    """Get lightweight counts of matches - no row data returned."""
    supabase = get_supabase()

    # Get the true total count
    count_query = (
        supabase.table("match_pairs")
        .select("*", count="exact")
        .eq("location_id", user.location_id)
    )
    if status:
        count_query = count_query.eq("status", status)
    count_result = count_query.limit(1).execute()
    total = count_result.count if count_result.count is not None else 0

    # Count unique contacts and per-rule counts in one paginated scan
    unique_contacts = set()
    by_rule = {}
    page_offset = 0
    page_size = 1000
    while True:
        ids_query = (
            supabase.table("match_pairs")
            .select("record_a_id, record_b_id, rule_id")
            .eq("location_id", user.location_id)
        )
        if status:
            ids_query = ids_query.eq("status", status)
        ids_result = ids_query.range(page_offset, page_offset + page_size - 1).execute()
        for row in ids_result.data:
            unique_contacts.add(row["record_a_id"])
            unique_contacts.add(row["record_b_id"])
            rule_id = row.get("rule_id")
            if rule_id:
                by_rule[rule_id] = by_rule.get(rule_id, 0) + 1
        if len(ids_result.data) < page_size:
            break
        page_offset += page_size

    return {
        "total": total,
        "unique_contacts": len(unique_contacts),
        "by_rule": by_rule,
    }


# ==================== DYNAMIC ROUTES (must come after static routes) ====================

@router.get("/{match_id}")
async def get_match(
    match_id: str,
    user: AuthenticatedUser = Depends(get_user),
):
    """Get details of a specific match pair."""
    supabase = get_supabase()
    result = supabase.table("match_pairs").select("*").eq("id", match_id).eq("location_id", user.location_id).single().execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Match not found")

    return result.data


@router.post("/{match_id}/approve")
async def approve_match(
    match_id: str,
    user: AuthenticatedUser = Depends(get_user),
):
    """Approve a match as a valid duplicate."""
    supabase = get_supabase()
    result = supabase.table("match_pairs").update({"status": "approved"}).eq("id", match_id).eq("location_id", user.location_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Match not found")

    return result.data[0]


@router.post("/{match_id}/reject")
async def reject_match(
    match_id: str,
    user: AuthenticatedUser = Depends(get_user),
    body: RejectRequest = None,
):
    """Reject a match - not a duplicate."""
    supabase = get_supabase()
    update_data = {"status": "rejected"}
    if body and body.reason:
        update_data["rejection_reason"] = body.reason

    result = supabase.table("match_pairs").update(update_data).eq("id", match_id).eq("location_id", user.location_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Match not found")

    return result.data[0]
