from fastapi import APIRouter, HTTPException, Query, Header, Request
from pydantic import BaseModel
from typing import Dict, Optional, List
from datetime import datetime, timedelta
from collections import defaultdict
import uuid

from app.db.supabase import get_supabase
from app.services.auth_service import get_location_tokens_with_refresh
from app.services.merge_service import execute_merge, rollback_merge
from app.core.security import get_current_user_flexible
from app.core.rate_limit import limiter, RATE_LIMIT_MERGE

router = APIRouter()


class MergeRequest(BaseModel):
    match_id: str
    master_record_id: str
    field_selections: Dict[str, str]  # field -> "a" or "b"
    preserve_alternates: bool = False  # Save alternate values to custom fields


@router.get("/stats")
@limiter.limit("100/minute")
async def get_merge_stats(
    request: Request,
    authorization: Optional[str] = Header(None, alias="Authorization"),
    location_id: Optional[str] = Query(None, description="GHL Location ID (legacy)"),
):
    """Get merge statistics by status."""
    user = await get_current_user_flexible(authorization=authorization, location_id=location_id)

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
    authorization: Optional[str] = Header(None, alias="Authorization"),
    location_id: Optional[str] = Query(None, description="GHL Location ID (legacy)"),
    days: int = Query(30, description="Number of days to include in time series"),
):
    """Get detailed merge statistics including time series data."""
    user = await get_current_user_flexible(authorization=authorization, location_id=location_id)

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


@router.get("/")
@limiter.limit("100/minute")
async def list_merges(
    request: Request,
    authorization: Optional[str] = Header(None, alias="Authorization"),
    location_id: Optional[str] = Query(None, description="GHL Location ID (legacy)"),
    limit: int = 50,
    offset: int = 0,
    status: Optional[str] = Query(None, description="Filter by status (completed, failed, rolled_back)"),
    rule_id: Optional[str] = Query(None, description="Filter by rule ID"),
):
    """List merge history with rule info."""
    user = await get_current_user_flexible(authorization=authorization, location_id=location_id)

    supabase = get_supabase()

    # Get merges with rule info through match_pairs
    query = supabase.table("merges").select(
        "*, match_pairs(rule_id, match_rules(id, name))"
    ).eq("location_id", user.location_id)

    # Apply status filter if provided
    if status:
        query = query.eq("status", status)

    # Apply rule_id filter through match_pairs join
    if rule_id:
        query = query.eq("match_pairs.rule_id", rule_id)

    result = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()

    # Flatten the rule info for easier frontend consumption
    data = []
    for merge in result.data:
        merge_data = {**merge}
        match_pair = merge_data.pop("match_pairs", None)
        if match_pair and match_pair.get("match_rules"):
            merge_data["rule_id"] = match_pair["match_rules"]["id"]
            merge_data["rule_name"] = match_pair["match_rules"]["name"]
        # Skip merges that don't match the rule_id filter (join may return nulls)
        if rule_id and merge_data.get("rule_id") != rule_id:
            continue
        data.append(merge_data)

    return {"data": data, "total": len(data)}


@router.post("/")
@limiter.limit(RATE_LIMIT_MERGE)
async def execute_merge_route(
    request: Request,
    body: MergeRequest,
    authorization: Optional[str] = Header(None, alias="Authorization"),
    location_id: Optional[str] = Query(None, description="GHL Location ID (legacy)"),
):
    """Execute a merge operation."""
    user = await get_current_user_flexible(authorization=authorization, location_id=location_id)

    # Get tokens with better error handling
    try:
        tokens = await get_location_tokens_with_refresh(user.ghl_location_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Token retrieval failed: {str(e)}")

    if not tokens:
        raise HTTPException(status_code=401, detail="Location not authenticated or token refresh failed")

    try:
        result = await execute_merge(
            match_id=body.match_id,
            master_record_id=body.master_record_id,
            field_selections=body.field_selections,
            access_token=tokens["access_token"],
            ghl_location_id=user.ghl_location_id,
            tenant_id=user.tenant_id,
            internal_location_id=user.location_id,
            preserve_alternates=body.preserve_alternates,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Merge failed: {str(e)}")


@router.get("/{merge_id}")
async def get_merge(
    merge_id: str,
    authorization: Optional[str] = Header(None, alias="Authorization"),
    location_id: Optional[str] = Query(None, description="GHL Location ID (legacy)"),
):
    """Get merge details including field selections and snapshots."""
    user = await get_current_user_flexible(authorization=authorization, location_id=location_id)

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

    return merge_data


@router.post("/{merge_id}/rollback")
async def rollback_merge_route(
    merge_id: str,
    authorization: Optional[str] = Header(None, alias="Authorization"),
    location_id: Optional[str] = Query(None, description="GHL Location ID (legacy)"),
):
    """Rollback a merge (restore deleted record)."""
    user = await get_current_user_flexible(authorization=authorization, location_id=location_id)
    tokens = await get_location_tokens_with_refresh(user.ghl_location_id)
    if not tokens:
        raise HTTPException(status_code=401, detail="Location not authenticated or token refresh failed")

    try:
        result = await rollback_merge(
            merge_id=merge_id,
            access_token=tokens["access_token"],
            ghl_location_id=user.ghl_location_id,
            internal_location_id=user.location_id,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Rollback failed: {str(e)}")
