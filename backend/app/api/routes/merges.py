from fastapi import APIRouter, HTTPException, Query, Header, Request, Depends
from pydantic import BaseModel
from typing import Any, Dict, Optional, List
from datetime import datetime, timedelta
from collections import defaultdict
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

    # Get counts by status
    all_merges = supabase.table("merges").select("status").eq("location_id", user.location_id).execute()

    stats = {"completed": 0, "failed": 0, "rolled_back": 0, "total": 0}
    for merge in all_merges.data:
        status = merge.get("status", "unknown")
        if status in stats:
            stats[status] += 1
        stats["total"] += 1

    return stats


@router.get("/stats/detailed")
@limiter.limit("100/minute")
async def get_detailed_merge_stats(
    request: Request,
    user: AuthenticatedUser = Depends(get_user),
    days: int = Query(30, description="Number of days to include in time series"),
):
    """Get detailed merge statistics including time series data."""
    supabase = get_supabase()

    # Get all merges with timestamps and rule info
    all_merges = supabase.table("merges").select(
        "id, status, created_at, match_pairs(rule_id, match_rules(id, name))"
    ).eq("location_id", user.location_id).execute()

    # Calculate date range
    end_date = datetime.utcnow().date()
    start_date = end_date - timedelta(days=days - 1)

    # Initialize daily counts
    daily_data: Dict[str, Dict[str, int]] = {}
    current = start_date
    while current <= end_date:
        date_str = current.isoformat()
        daily_data[date_str] = {"completed": 0, "failed": 0, "rolled_back": 0}
        current += timedelta(days=1)

    # Calculate stats
    stats = {"completed": 0, "failed": 0, "rolled_back": 0, "total": 0}
    merges_by_rule: Dict[str, Dict] = defaultdict(lambda: {"name": "", "completed": 0, "failed": 0, "rolled_back": 0})

    for merge in all_merges.data:
        status = merge.get("status", "unknown")
        created_at = merge.get("created_at")

        # Count total stats
        if status in stats:
            stats[status] += 1
        stats["total"] += 1

        # Parse date and add to daily data if within range
        if created_at:
            try:
                merge_date = datetime.fromisoformat(created_at.replace("Z", "+00:00")).date()
                date_str = merge_date.isoformat()
                if date_str in daily_data and status in daily_data[date_str]:
                    daily_data[date_str][status] += 1
            except (ValueError, AttributeError):
                pass

        # Count by rule
        match_pair = merge.get("match_pairs")
        if match_pair and match_pair.get("match_rules"):
            rule_id = match_pair["match_rules"]["id"]
            rule_name = match_pair["match_rules"]["name"]
            merges_by_rule[rule_id]["name"] = rule_name
            if status in merges_by_rule[rule_id]:
                merges_by_rule[rule_id][status] += 1

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
    status: Optional[str] = Query(None, description="Filter by status (completed, failed, rolled_back)"),
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
        try:
            tokens = await get_location_tokens_with_refresh(user.ghl_location_id)
            if not tokens or not tokens.get("access_token"):
                raise ValueError("No valid GHL token available")

            async with GHLClient(tokens["access_token"], user.ghl_location_id) as client:
                object_defs = await client.list_objects()

            for obj in object_defs:
                key = obj.get("key")
                if not isinstance(key, str) or not key:
                    continue

                normalized_key = key if key.startswith("custom_objects.") else f"custom_objects.{key}"
                if normalized_key not in custom_sources:
                    continue

                primary_display = obj.get("primaryDisplayProperty") or ""
                display_field = _extract_custom_object_field_key(primary_display)
                if display_field:
                    custom_display_field_by_object[normalized_key] = display_field
        except Exception as e:
            logger.warning(f"Failed to resolve custom object display fields for merge history: {e}")

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
            mappings_dicts = [{"source": m.source, "target": m.target} for m in body.field_preservation_mappings]

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
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Merge failed for match {body.match_id}: {str(e)}")
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
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Rollback failed for merge {merge_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Rollback failed. Please try again.")
