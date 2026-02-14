from fastapi import APIRouter, HTTPException, Query, Header, Request, Depends
from pydantic import BaseModel
from typing import Any, Dict, Optional, List, Set, Tuple
from datetime import datetime, timedelta
from collections import defaultdict
import asyncio
import time
import uuid
import logging

from app.db.supabase import get_supabase
from app.services.merge_service import execute_merge, rollback_merge, _build_record_name
from app.services.billing_service import check_merge_quota, get_plan_features
from app.core.security import AuthenticatedUser
from app.core.deps import get_user, get_auth_context, AuthContext
from app.core.rate_limit import limiter, RATE_LIMIT_MERGE
from app.core.ghl.client import GHLClient
from app.services.auth_service import get_location_tokens_with_refresh

logger = logging.getLogger(__name__)

router = APIRouter()

CUSTOM_OBJECT_METADATA_TTL_SECONDS = 300
CUSTOM_OBJECT_METADATA_MAX_LOCATIONS = 256
MERGE_STATS_PAGE_SIZE = 10000

_custom_object_display_cache: Dict[str, Tuple[float, Dict[str, str]]] = {}
_custom_object_cache_lock = asyncio.Lock()


def _count_merges(
    supabase,
    location_id: str,
    status: Optional[str] = None,
) -> int:
    """Count merges for a location with optional status filter."""
    query = supabase.table("merges").select("id", count="exact").eq("location_id", location_id)
    if status:
        query = query.eq("status", status)
    result = query.limit(1).execute()
    return result.count if result.count is not None else 0


async def _get_custom_display_fields_for_sources(
    ghl_location_id: str,
    custom_sources: Set[str],
) -> Dict[str, str]:
    """
    Resolve custom object display fields with a short-lived location cache.
    This avoids token refresh + list_objects calls on every list_merges request.
    """
    if not custom_sources:
        return {}

    now = time.monotonic()
    cached_entry = _custom_object_display_cache.get(ghl_location_id)
    if cached_entry and cached_entry[0] > now:
        cached_fields = cached_entry[1]
        return {k: v for k, v in cached_fields.items() if k in custom_sources}

    stale_fields = cached_entry[1] if cached_entry else {}

    async with _custom_object_cache_lock:
        now = time.monotonic()
        cached_entry = _custom_object_display_cache.get(ghl_location_id)
        if cached_entry and cached_entry[0] > now:
            cached_fields = cached_entry[1]
            return {k: v for k, v in cached_fields.items() if k in custom_sources}

        try:
            tokens = await get_location_tokens_with_refresh(ghl_location_id)
            if not tokens or not tokens.get("access_token"):
                raise ValueError("No valid GHL token available")

            async with GHLClient(tokens["access_token"], ghl_location_id) as client:
                object_defs = await client.list_objects()

            fresh_fields: Dict[str, str] = {}
            for obj in object_defs or []:
                key = obj.get("key")
                if not isinstance(key, str) or not key:
                    continue

                normalized_key = key if key.startswith("custom_objects.") else f"custom_objects.{key}"
                primary_display = obj.get("primaryDisplayProperty") or ""
                display_field = _extract_custom_object_field_key(primary_display)
                if display_field:
                    fresh_fields[normalized_key] = display_field

            _custom_object_display_cache[ghl_location_id] = (
                time.monotonic() + CUSTOM_OBJECT_METADATA_TTL_SECONDS,
                fresh_fields,
            )
            while len(_custom_object_display_cache) > CUSTOM_OBJECT_METADATA_MAX_LOCATIONS:
                _custom_object_display_cache.pop(next(iter(_custom_object_display_cache)))

            return {k: v for k, v in fresh_fields.items() if k in custom_sources}
        except Exception as e:
            if stale_fields:
                logger.warning(
                    "Failed to refresh custom object display field cache for %s, using stale data: %s",
                    ghl_location_id,
                    e,
                )
                return {k: v for k, v in stale_fields.items() if k in custom_sources}

            logger.warning(f"Failed to resolve custom object display fields for merge history: {e}")
            return {}


def _extract_custom_object_field_key(field_key: str) -> Optional[str]:
    """Extract custom object property key from a schema field path."""
    if not field_key:
        return None
    if field_key.startswith("custom_objects."):
        parts = field_key.split(".")
        if len(parts) >= 3:
            return ".".join(parts[2:])
    return field_key


def _extract_pipeline_id(snapshot: Optional[Dict[str, Any]]) -> Optional[str]:
    if not snapshot:
        return None

    direct_pipeline = snapshot.get("pipelineId")
    if isinstance(direct_pipeline, str) and direct_pipeline:
        return direct_pipeline

    pipeline_obj = snapshot.get("pipeline")
    if isinstance(pipeline_obj, dict):
        pipeline_id = pipeline_obj.get("id")
        if isinstance(pipeline_id, str) and pipeline_id:
            return pipeline_id

    raw = snapshot.get("_raw")
    if isinstance(raw, dict):
        raw_pipeline = raw.get("pipelineId")
        if isinstance(raw_pipeline, str) and raw_pipeline:
            return raw_pipeline

        raw_pipeline_obj = raw.get("pipeline")
        if isinstance(raw_pipeline_obj, dict):
            raw_pipeline_id = raw_pipeline_obj.get("id")
            if isinstance(raw_pipeline_id, str) and raw_pipeline_id:
                return raw_pipeline_id

    return None


class FieldPreservationMapping(BaseModel):
    source: str
    target: str
    value: Optional[str] = None


class MergeRequest(BaseModel):
    match_id: str
    master_record_id: str
    field_selections: Dict[str, str] = {}  # field -> "a" or "b"; empty = auto-compute from strategy
    preserve_alternates: bool = False  # Save alternate values to custom fields
    field_preservation_mappings: Optional[List[FieldPreservationMapping]] = None  # Per-merge override of rule mappings


@router.get("/stats")
@limiter.limit("100/minute")
async def get_merge_stats(
    request: Request,
    user: AuthenticatedUser = Depends(get_user),
):
    """Get merge statistics by status."""
    supabase = get_supabase()

    completed = _count_merges(supabase, user.location_id, "completed")
    failed = _count_merges(supabase, user.location_id, "failed")
    rolled_back = _count_merges(supabase, user.location_id, "rolled_back")
    rolled_back_partial = _count_merges(supabase, user.location_id, "rolled_back_partial")
    total = _count_merges(supabase, user.location_id)

    return {
        "completed": completed,
        "failed": failed,
        "rolled_back": rolled_back,
        "rolled_back_partial": rolled_back_partial,
        "total": total,
    }


@router.get("/stats/detailed")
@limiter.limit("100/minute")
async def get_detailed_merge_stats(
    request: Request,
    user: AuthenticatedUser = Depends(get_user),
    days: int = Query(30, description="Number of days to include in time series"),
):
    """Get detailed merge statistics including time series data."""
    supabase = get_supabase()

    # Calculate date range
    end_date = datetime.utcnow().date()
    start_date = end_date - timedelta(days=days - 1)
    window_start = f"{start_date.isoformat()}T00:00:00"
    window_end = f"{end_date.isoformat()}T23:59:59"

    # Initialize daily counts
    daily_data: Dict[str, Dict[str, int]] = {}
    current = start_date
    while current <= end_date:
        date_str = current.isoformat()
        daily_data[date_str] = {
            "completed": 0,
            "failed": 0,
            "rolled_back": 0,
            "rolled_back_partial": 0,
        }
        current += timedelta(days=1)

    # Summary counts are computed directly in DB to avoid loading all rows.
    stats = {
        "completed": _count_merges(supabase, user.location_id, "completed"),
        "failed": _count_merges(supabase, user.location_id, "failed"),
        "rolled_back": _count_merges(supabase, user.location_id, "rolled_back"),
        "rolled_back_partial": _count_merges(supabase, user.location_id, "rolled_back_partial"),
        "total": _count_merges(supabase, user.location_id),
    }

    # Time-series is constrained to the requested window.
    scanned_window_rows = 0
    page_offset = 0

    while True:
        page_result = (
            supabase.table("merges")
            .select("status, created_at")
            .eq("location_id", user.location_id)
            .gte("created_at", window_start)
            .lte("created_at", window_end)
            .order("created_at", desc=True)
            .range(page_offset, page_offset + MERGE_STATS_PAGE_SIZE - 1)
            .execute()
        )
        merge_rows = page_result.data or []
        if not merge_rows:
            break

        scanned_window_rows += len(merge_rows)
        for merge in merge_rows:
            status = merge.get("status", "unknown")
            created_at = merge.get("created_at")

            # Parse date and add to daily data if within range.
            if created_at:
                try:
                    merge_date = datetime.fromisoformat(created_at.replace("Z", "+00:00")).date()
                    date_str = merge_date.isoformat()
                    if date_str in daily_data and status in daily_data[date_str]:
                        daily_data[date_str][status] += 1
                except (ValueError, AttributeError):
                    pass

        if len(merge_rows) < MERGE_STATS_PAGE_SIZE:
            break
        page_offset += MERGE_STATS_PAGE_SIZE

    # Preserve previous behavior: by-rule counts are all-time for the location.
    merges_by_rule: Dict[str, Dict] = defaultdict(
        lambda: {
            "name": "",
            "completed": 0,
            "failed": 0,
            "rolled_back": 0,
            "rolled_back_partial": 0,
        }
    )
    scanned_rule_rows = 0
    page_offset = 0

    while True:
        page_result = (
            supabase.table("merges")
            .select("status, match_pairs(rule_id, match_rules(id, name))")
            .eq("location_id", user.location_id)
            .order("created_at", desc=True)
            .range(page_offset, page_offset + MERGE_STATS_PAGE_SIZE - 1)
            .execute()
        )
        merge_rows = page_result.data or []
        if not merge_rows:
            break

        scanned_rule_rows += len(merge_rows)
        for merge in merge_rows:
            status = merge.get("status", "unknown")
            match_pair = merge.get("match_pairs")
            if match_pair and match_pair.get("match_rules"):
                rule_id = match_pair["match_rules"]["id"]
                rule_name = match_pair["match_rules"]["name"]
                merges_by_rule[rule_id]["name"] = rule_name
                if status in merges_by_rule[rule_id]:
                    merges_by_rule[rule_id][status] += 1

        if len(merge_rows) < MERGE_STATS_PAGE_SIZE:
            break
        page_offset += MERGE_STATS_PAGE_SIZE

    logger.info(
        "Detailed merge stats for location %s scanned window_rows=%s and by_rule_rows=%s (days=%s)",
        user.location_id,
        scanned_window_rows,
        scanned_rule_rows,
        days,
    )

    # Convert daily data to sorted list
    time_series = [
        {"date": date, **counts}
        for date, counts in sorted(daily_data.items())
    ]

    # Convert rule stats to list
    by_rule = [
        {"rule_id": rule_id, **data}
        for rule_id, data in merges_by_rule.items()
    ]

    return {
        "summary": stats,
        "time_series": time_series,
        "by_rule": by_rule,
        "success_rate": round(
            (stats["completed"] / stats["total"] * 100) if stats["total"] > 0 else 100, 1
        ),
    }


@router.get("/quota")
@limiter.limit("100/minute")
async def get_merge_quota(
    request: Request,
    ctx: AuthContext = Depends(get_auth_context),
):
    """Get merge quota status for the current location."""
    quota = await check_merge_quota(ctx.location_id, ctx.plan)
    return quota


@router.get("/")
@limiter.limit("100/minute")
async def list_merges(
    request: Request,
    user: AuthenticatedUser = Depends(get_user),
    limit: int = 50,
    offset: int = 0,
    status: Optional[str] = Query(
        None,
        description="Filter by status (completed, failed, rolled_back, rolled_back_partial)",
    ),
    rule_id: Optional[str] = Query(None, description="Filter by rule ID"),
    search: Optional[str] = Query(None, description="Search by master_record_name"),
    date_from: Optional[str] = Query(None, description="ISO date start filter"),
    date_to: Optional[str] = Query(None, description="ISO date end filter"),
):
    """List merge history with rule info."""
    supabase = get_supabase()

    # Use inner join when filtering by rule_id for accurate results
    if rule_id:
        select_str = "*, match_pairs!inner(rule_id, match_rules(id, name, source_object, match_fields))"
        count_select = "id, match_pairs!inner(rule_id)"
    else:
        select_str = "*, match_pairs(rule_id, match_rules(id, name, source_object, match_fields))"
        count_select = "id"

    query = supabase.table("merges").select(select_str).eq("location_id", user.location_id)
    count_query = supabase.table("merges").select(count_select, count="exact").eq("location_id", user.location_id)

    # Apply shared filters to both queries
    if status:
        query = query.eq("status", status)
        count_query = count_query.eq("status", status)

    if rule_id:
        query = query.eq("match_pairs.rule_id", rule_id)
        count_query = count_query.eq("match_pairs.rule_id", rule_id)

    if search:
        query = query.ilike("master_record_name", f"%{search}%")
        count_query = count_query.ilike("master_record_name", f"%{search}%")

    if date_from:
        query = query.gte("created_at", date_from)
        count_query = count_query.gte("created_at", date_from)

    if date_to:
        end = f"{date_to}T23:59:59"
        query = query.lte("created_at", end)
        count_query = count_query.lte("created_at", end)

    # Execute count query
    count_result = count_query.execute()
    total = count_result.count if count_result.count is not None else 0

    # Execute data query with pagination
    result = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
    merge_rows = result.data or []

    # Load master snapshots for current page so display names can be re-derived accurately.
    master_snapshot_by_merge: Dict[str, Dict[str, Any]] = {}
    merge_ids = [row.get("id") for row in merge_rows if row.get("id")]
    if merge_ids:
        snapshots_result = (
            supabase.table("snapshots")
            .select("merge_id, data")
            .eq("record_type", "master")
            .in_("merge_id", merge_ids)
            .execute()
        )
        for snapshot in snapshots_result.data or []:
            merge_id = snapshot.get("merge_id")
            if isinstance(merge_id, str):
                master_snapshot_by_merge[merge_id] = snapshot.get("data") or {}

    # Resolve custom object display fields (primary display property) from GHL metadata.
    custom_sources: set[str] = set()
    for merge in merge_rows:
        match_pair = merge.get("match_pairs")
        if not isinstance(match_pair, dict):
            continue
        match_rule = match_pair.get("match_rules")
        if not isinstance(match_rule, dict):
            continue
        source_object = match_rule.get("source_object")
        if isinstance(source_object, str) and source_object.startswith("custom_objects."):
            custom_sources.add(source_object)

    custom_display_field_by_object: Dict[str, str] = {}
    if custom_sources:
        custom_display_field_by_object = await _get_custom_display_fields_for_sources(
            user.ghl_location_id,
            custom_sources,
        )

    # Flatten the rule info for easier frontend consumption
    data = []
    for merge in merge_rows:
        merge_data = {**merge}
        match_pair = merge_data.pop("match_pairs", None)
        rule_match_fields: List[Dict[str, Any]] = []
        if match_pair and match_pair.get("match_rules"):
            match_rule = match_pair["match_rules"]
            merge_data["rule_id"] = match_rule["id"]
            merge_data["rule_name"] = match_rule["name"]
            merge_data["source_object"] = match_rule.get("source_object", "contacts")
            rule_match_fields = match_rule.get("match_fields") or []

        merge_id = merge_data.get("id")
        master_snapshot = (
            master_snapshot_by_merge.get(merge_id)
            if isinstance(merge_id, str)
            else None
        )
        if isinstance(master_snapshot, dict) and master_snapshot:
            source_object = merge_data.get("source_object")
            if not isinstance(source_object, str) or not source_object:
                raw = master_snapshot.get("_raw")
                if isinstance(raw, dict):
                    inferred_source = raw.get("objectKey")
                    if isinstance(inferred_source, str) and inferred_source:
                        merge_data["source_object"] = inferred_source
                        source_object = inferred_source

            display_field = (
                custom_display_field_by_object.get(source_object, "")
                if isinstance(source_object, str)
                else ""
            )
            computed_name = _build_record_name(
                master_snapshot,
                merge_data.get("master_record_id", ""),
                match_fields=rule_match_fields,
                display_field=display_field or None,
            )
            if computed_name:
                merge_data["master_record_display_name"] = computed_name

            pipeline_id = _extract_pipeline_id(master_snapshot)
            if pipeline_id:
                merge_data["master_pipeline_id"] = pipeline_id

        data.append(merge_data)

    return {"data": data, "total": total}


@router.post("/")
@limiter.limit(RATE_LIMIT_MERGE)
async def execute_merge_route(
    request: Request,
    body: MergeRequest,
    ctx: AuthContext = Depends(get_auth_context),
):
    """Execute a merge operation."""
    # Check merge quota before proceeding
    quota = await check_merge_quota(ctx.location_id, ctx.plan)
    if not quota["allowed"]:
        raise HTTPException(
            status_code=402,
            detail={
                "error": "merge_limit_exceeded",
                "message": f"Free plan allows {quota['limit']} merges. You've used {quota['used']}.",
                "used": quota["used"],
                "limit": quota["limit"],
            }
        )

    try:
        # Convert field_preservation_mappings to list of dicts if provided
        mappings_dicts = None
        if body.field_preservation_mappings:
            mappings_dicts = [
                {"source": m.source, "target": m.target, **({"value": m.value} if m.value is not None else {})}
                for m in body.field_preservation_mappings
            ]

        result = await execute_merge(
            match_id=body.match_id,
            master_record_id=body.master_record_id,
            field_selections=body.field_selections,
            access_token=ctx.access_token,
            ghl_location_id=ctx.ghl_location_id,
            tenant_id=ctx.tenant_id,
            internal_location_id=ctx.location_id,
            preserve_alternates=body.preserve_alternates,
            field_preservation_mappings=mappings_dicts,
            plan=ctx.plan,
        )
        return result
    except ValueError:
        logger.warning("Merge request rejected due to validation constraints")
        raise HTTPException(
            status_code=404,
            detail="Merge could not be completed for this match.",
        )
    except Exception:
        logger.error("Merge failed for match request")
        raise HTTPException(status_code=500, detail="Merge failed. Please try again.")


@router.get("/{merge_id}")
async def get_merge(
    merge_id: str,
    user: AuthenticatedUser = Depends(get_user),
):
    """Get merge details including field selections and snapshots."""
    supabase = get_supabase()

    # Get merge record
    result = supabase.table("merges").select("*").eq("id", merge_id).eq("location_id", user.location_id).single().execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Merge not found")

    merge_data = result.data

    # Get snapshots for this merge
    snapshots_result = supabase.table("snapshots").select("*").eq("merge_id", merge_id).execute()

    master_snapshot = None
    duplicate_snapshot = None

    for snapshot in snapshots_result.data:
        if snapshot.get("record_type") == "master":
            master_snapshot = snapshot.get("data")
        elif snapshot.get("record_type") == "duplicate":
            duplicate_snapshot = snapshot.get("data")

    merge_data["master_snapshot"] = master_snapshot
    merge_data["duplicate_snapshot"] = duplicate_snapshot
    merge_data["ghl_location_id"] = user.ghl_location_id

    # Get rule data via match_pair for field categorization
    if merge_data.get("match_pair_id"):
        match_pair = supabase.table("match_pairs").select("rule_id").eq("id", merge_data["match_pair_id"]).single().execute()
        if match_pair.data and match_pair.data.get("rule_id"):
            rule = supabase.table("match_rules").select("name, source_object, match_fields, merge_strategy, merge_settings").eq("id", match_pair.data["rule_id"]).single().execute()
            if rule.data:
                merge_data["rule"] = rule.data

    return merge_data


@router.post("/{merge_id}/rollback")
async def rollback_merge_route(
    merge_id: str,
    ctx: AuthContext = Depends(get_auth_context),
):
    """Rollback a merge (restore deleted record)."""
    try:
        result = await rollback_merge(
            merge_id=merge_id,
            access_token=ctx.access_token,
            ghl_location_id=ctx.ghl_location_id,
            internal_location_id=ctx.location_id,
        )
        return result
    except ValueError:
        logger.warning("Rollback request rejected due to validation constraints")
        raise HTTPException(
            status_code=400,
            detail="Rollback could not be completed for this merge.",
        )
    except Exception:
        logger.error("Rollback failed for merge request")
        raise HTTPException(status_code=500, detail="Rollback failed. Please try again.")
