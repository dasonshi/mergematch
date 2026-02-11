from fastapi import APIRouter, HTTPException, Query, Header, Request, Depends
from pydantic import BaseModel, Field
from typing import Optional, List
import httpx
import logging
import gc
import asyncio

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
    search: Optional[str] = Query(None, description="Search term to filter by record data"),
    limit: int = Query(50, le=1000),
    offset: int = Query(0),
):
    """List match pairs for the current location."""
    supabase = get_supabase()

    # Get the true total count (not limited by pagination)
    count_query = (
        supabase.table("match_pairs")
        .select("id", count="exact")
        .eq("location_id", user.location_id)
    )
    if status:
        count_query = count_query.eq("status", status)
    if rule_id:
        count_query = count_query.eq("rule_id", rule_id)
    if search:
        # Search both record snapshots using JSONB text search (case-insensitive)
        # Escape ILIKE wildcards so literal % and _ in search terms don't act as wildcards
        search_term = search.lower().replace("%", "\\%").replace("_", "\\_")
        count_query = count_query.or_(
            f"record_a_data::text.ilike.%{search_term}%,"
            f"record_b_data::text.ilike.%{search_term}%"
        )
    count_result = count_query.limit(1).execute()
    true_total = count_result.count if count_result.count is not None else 0

    # Count unique contacts using optimized SQL function when available.
    unique_contact_count = 0
    use_paginated_fallback = bool(search)
    if not use_paginated_fallback:
        try:
            stats_result = supabase.rpc(
                "get_match_pair_stats",
                {
                    "p_location_id": user.location_id,
                    "p_status": status,
                    "p_rule_id": rule_id,
                }
            ).execute()
            if stats_result.data and len(stats_result.data) > 0:
                unique_contact_count = stats_result.data[0].get("unique_contact_count", 0)
            else:
                use_paginated_fallback = true_total > 0
        except Exception as e:
            logger.warning(f"get_match_pair_stats RPC failed in list_matches, falling back: {e}")
            use_paginated_fallback = True

    if use_paginated_fallback:
        # Fall back to pagination for search queries or when RPC is unavailable.
        unique_contacts = set()
        page_offset = 0
        page_size = 1000
        while True:
            ids_query = supabase.table("match_pairs").select("record_a_id, record_b_id").eq("location_id", user.location_id)
            if status:
                ids_query = ids_query.eq("status", status)
            if rule_id:
                ids_query = ids_query.eq("rule_id", rule_id)
            if search:
                search_term = search.lower().replace("%", "\\%").replace("_", "\\_")
                ids_query = ids_query.or_(
                    f"record_a_data::text.ilike.%{search_term}%,"
                    f"record_b_data::text.ilike.%{search_term}%"
                )
            ids_result = ids_query.range(page_offset, page_offset + page_size - 1).execute()
            for row in ids_result.data:
                unique_contacts.add(row["record_a_id"])
                unique_contacts.add(row["record_b_id"])
            if len(ids_result.data) < page_size:
                break
            page_offset += page_size
        unique_contact_count = len(unique_contacts)

    # Fetch paginated data
    query = supabase.table("match_pairs").select("*").eq("location_id", user.location_id)
    if status:
        query = query.eq("status", status)
    if rule_id:
        query = query.eq("rule_id", rule_id)
    if search:
        search_term = search.lower().replace("%", "\\%").replace("_", "\\_")
        query = query.or_(
            f"record_a_data::text.ilike.%{search_term}%,"
            f"record_b_data::text.ilike.%{search_term}%"
        )

    # Deterministic ordering prevents duplicate/missing rows across pages.
    query = query.order("created_at", desc=True).order("id", desc=True).range(offset, offset + limit - 1)
    result = query.execute()

    return {
        "data": result.data,
        "total": true_total,
        "unique_contacts": unique_contact_count,
        "limit": limit,
        "offset": offset,
    }


@router.post("/validate")
async def validate_matches(
    rule_id: str = Query(..., description="Match rule ID"),
    ctx: AuthContext = Depends(get_auth_context),
):
    """
    Validate match pairs - check if records still exist in GHL.
    Uses parallel batched validation for 10x faster processing.
    Returns list of valid and stale match IDs.
    """
    supabase = get_supabase()

    rule_result = (
        supabase.table("match_rules")
        .select("source_object")
        .eq("id", rule_id)
        .eq("location_id", ctx.location_id)
        .single()
        .execute()
    )
    if not rule_result.data:
        raise HTTPException(status_code=404, detail="Match rule not found")

    source_object = rule_result.data.get("source_object", "contacts")
    is_custom_object = source_object.startswith("custom_objects.")
    is_company = source_object == "companies"
    is_opportunity = source_object == "opportunities"

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

    # Get all unique record IDs
    record_ids = set()
    for m in matches.data:
        record_ids.add(m["record_a_id"])
        record_ids.add(m["record_b_id"])

    record_ids_list = list(record_ids)
    logger.info(f"Validating {len(record_ids_list)} unique records for {len(matches.data)} match pairs")

    # Helper to check single record
    async def check_record(client, record_id: str) -> tuple[str, bool]:
        """Check if a record exists. Returns (record_id, exists)."""
        try:
            if is_custom_object:
                await client.get_custom_object_record(source_object, record_id)
            elif is_company:
                await client.get_company(record_id)
            elif is_opportunity:
                await client.get_opportunity(record_id)
            else:
                await client.get_contact(record_id)
            return (record_id, True)
        except httpx.HTTPStatusError as e:
            # GHL returns 404 OR 400 with "not found" for deleted records
            if e.response.status_code == 404:
                logger.debug(f"Record {record_id} not found (404)")
                return (record_id, False)
            elif e.response.status_code == 400:
                try:
                    error_body = e.response.json()
                    if "not found" in error_body.get("message", "").lower():
                        logger.debug(f"Record {record_id} not found (400)")
                        return (record_id, False)
                except Exception:
                    pass
                # Other 400 error - assume exists
                return (record_id, True)
            else:
                # Other errors (5xx, etc) - assume exists
                return (record_id, True)
        except Exception as e:
            # Assume exists on other errors
            logger.warning(f"Record {record_id} check error: {e}, assuming exists")
            return (record_id, True)

    # Parallel validation in batches of 10
    BATCH_SIZE = 10
    existing_ids = set()

    async with GHLClient(ctx.access_token, ctx.ghl_location_id) as client:
        for i in range(0, len(record_ids_list), BATCH_SIZE):
            batch = record_ids_list[i:i + BATCH_SIZE]

            # Check all records in this batch in parallel
            results = await asyncio.gather(
                *[check_record(client, rid) for rid in batch],
                return_exceptions=True
            )

            # Process results
            for result in results:
                if isinstance(result, Exception):
                    logger.warning(f"Batch check exception: {result}")
                elif result[1]:  # record exists
                    existing_ids.add(result[0])

            logger.debug(f"Validated batch {i // BATCH_SIZE + 1}, {len(existing_ids)} existing so far")

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
            logger.debug(f"Marked match {m['id']} as stale - record(s) no longer exist")

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
    """Get lightweight counts of matches using optimized SQL function."""
    supabase = get_supabase()

    try:
        result = supabase.rpc(
            "get_match_pair_stats",
            {
                "p_location_id": user.location_id,
                "p_status": status,
                "p_rule_id": None,
            }
        ).execute()

        if result.data and len(result.data) > 0:
            row = result.data[0]
            return {
                "total": row.get("total_count", 0),
                "unique_contacts": row.get("unique_contact_count", 0),
                "by_rule": row.get("by_rule", {}),
            }
    except Exception as e:
        logger.warning(f"get_match_pair_stats RPC failed in get_match_counts, falling back: {e}")

    # Fallback path if RPC is unavailable.
    count_query = (
        supabase.table("match_pairs")
        .select("id", count="exact")
        .eq("location_id", user.location_id)
    )
    if status:
        count_query = count_query.eq("status", status)
    count_result = count_query.limit(1).execute()
    total = count_result.count if count_result.count is not None else 0

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
            row_rule_id = row.get("rule_id")
            if row_rule_id:
                by_rule[row_rule_id] = by_rule.get(row_rule_id, 0) + 1
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
