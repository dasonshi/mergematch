from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Dict, Optional
import uuid

from app.db.supabase import get_supabase
from app.services.auth_service import get_location_tokens
from app.services.merge_service import execute_merge, rollback_merge

router = APIRouter()


class MergeRequest(BaseModel):
    match_id: str
    master_record_id: str
    field_selections: Dict[str, str]  # field -> "a" or "b"


@router.get("/")
async def list_merges(
    location_id: str = Query(..., description="GHL Location ID"),
    limit: int = 50,
    offset: int = 0,
):
    """List merge history with rule info."""
    tokens = await get_location_tokens(location_id)
    if not tokens:
        raise HTTPException(status_code=401, detail="Location not authenticated")

    internal_location_id = tokens["location_id"]

    supabase = get_supabase()

    # Get merges with rule info through match_pairs
    result = supabase.table("merges").select(
        "*, match_pairs(rule_id, match_rules(id, name))"
    ).eq("location_id", internal_location_id).order("created_at", desc=True).range(offset, offset + limit - 1).execute()

    # Flatten the rule info for easier frontend consumption
    data = []
    for merge in result.data:
        merge_data = {**merge}
        match_pair = merge_data.pop("match_pairs", None)
        if match_pair and match_pair.get("match_rules"):
            merge_data["rule_id"] = match_pair["match_rules"]["id"]
            merge_data["rule_name"] = match_pair["match_rules"]["name"]
        data.append(merge_data)

    return {"data": data, "total": len(data)}


@router.post("/")
async def execute_merge_route(
    request: MergeRequest,
    location_id: str = Query(..., description="GHL Location ID"),
):
    """Execute a merge operation."""
    tokens = await get_location_tokens(location_id)
    if not tokens:
        raise HTTPException(status_code=401, detail="Location not authenticated")

    try:
        result = await execute_merge(
            match_id=request.match_id,
            master_record_id=request.master_record_id,
            field_selections=request.field_selections,
            access_token=tokens["access_token"],
            ghl_location_id=location_id,
            tenant_id=tokens["tenant_id"],
            internal_location_id=tokens["location_id"],
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Merge failed: {str(e)}")


@router.get("/{merge_id}")
async def get_merge(
    merge_id: str,
    location_id: str = Query(..., description="GHL Location ID"),
):
    """Get merge details including field selections and snapshots."""
    tokens = await get_location_tokens(location_id)
    if not tokens:
        raise HTTPException(status_code=401, detail="Location not authenticated")

    internal_location_id = tokens["location_id"]

    supabase = get_supabase()

    # Get merge record
    result = supabase.table("merges").select("*").eq("id", merge_id).eq("location_id", internal_location_id).single().execute()

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
    merge_data["ghl_location_id"] = location_id

    return merge_data


@router.post("/{merge_id}/rollback")
async def rollback_merge_route(
    merge_id: str,
    location_id: str = Query(..., description="GHL Location ID"),
):
    """Rollback a merge (restore deleted record)."""
    tokens = await get_location_tokens(location_id)
    if not tokens:
        raise HTTPException(status_code=401, detail="Location not authenticated")

    try:
        result = await rollback_merge(
            merge_id=merge_id,
            access_token=tokens["access_token"],
            ghl_location_id=location_id,
            internal_location_id=tokens["location_id"],
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Rollback failed: {str(e)}")
