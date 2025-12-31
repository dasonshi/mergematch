"""
Merge service for executing contact merges via GHL API.
"""
from typing import Dict, Any
import uuid
import logging

from app.core.ghl.client import GHLClient
from app.db.supabase import get_supabase

logger = logging.getLogger(__name__)


async def execute_merge(
    match_id: str,
    master_record_id: str,
    field_selections: Dict[str, str],
    access_token: str,
    ghl_location_id: str,
    tenant_id: str,
    internal_location_id: str,
) -> Dict[str, Any]:
    """
    Execute a merge operation:
    1. Store snapshots of both records for rollback
    2. Update master record with selected fields from duplicate
    3. Delete the duplicate record from GHL
    4. Update database records
    """
    supabase = get_supabase()

    # Get the match pair
    match = supabase.table("match_pairs").select("*").eq("id", match_id).single().execute()
    if not match.data:
        raise ValueError("Match not found")

    record_a_data = match.data.get("record_a_data", {})
    record_b_data = match.data.get("record_b_data", {})
    record_a_id = match.data["record_a_id"]
    record_b_id = match.data["record_b_id"]

    # Determine master and duplicate
    if master_record_id == record_a_id:
        master_data = record_a_data
        duplicate_data = record_b_data
        duplicate_id = record_b_id
    else:
        master_data = record_b_data
        duplicate_data = record_a_data
        duplicate_id = record_a_id

    # Build the merged data based on field selections
    merged_fields = {}
    for field, source in field_selections.items():
        if source == "a":
            value = record_a_data.get(field)
        elif source == "b":
            value = record_b_data.get(field)
        else:
            continue

        if value is not None:
            merged_fields[field] = value

    logger.info(f"Merging {duplicate_id} into {master_record_id}")
    logger.info(f"Field selections: {field_selections}")
    logger.info(f"Merged fields to apply: {merged_fields}")

    # Create merge record BEFORE making changes
    merge_id = str(uuid.uuid4())
    merge_data = {
        "id": merge_id,
        "tenant_id": tenant_id,
        "location_id": internal_location_id,
        "match_pair_id": match_id,
        "master_record_id": master_record_id,
        "master_record_type": match.data.get("record_a_type", "contact"),
        "duplicate_record_id": duplicate_id,
        "field_selections": field_selections,
        "status": "pending",
    }

    supabase.table("merges").insert(merge_data).execute()

    # Store snapshots in the snapshots table for rollback
    snapshots_data = [
        {
            "id": str(uuid.uuid4()),
            "merge_id": merge_id,
            "record_id": master_record_id,
            "record_type": "master",
            "data": master_data,
        },
        {
            "id": str(uuid.uuid4()),
            "merge_id": merge_id,
            "record_id": duplicate_id,
            "record_type": "duplicate",
            "data": duplicate_data,
        }
    ]
    supabase.table("snapshots").insert(snapshots_data).execute()

    try:
        async with GHLClient(access_token, ghl_location_id) as client:
            # Update master record with merged fields (only non-empty fields)
            update_payload = {}
            for field, value in merged_fields.items():
                if value and field not in ["id", "locationId", "dateAdded", "dateUpdated"]:
                    update_payload[field] = value

            if update_payload:
                logger.info(f"Updating master contact {master_record_id} with: {update_payload}")
                await client.update_contact(master_record_id, update_payload)

            # Delete the duplicate record
            logger.info(f"Deleting duplicate contact {duplicate_id}")
            await client.delete_contact(duplicate_id)

        # Update merge status to completed
        supabase.table("merges").update({"status": "completed"}).eq("id", merge_id).execute()

        # Update match status to merged
        supabase.table("match_pairs").update({"status": "merged"}).eq("id", match_id).execute()

        logger.info(f"Merge {merge_id} completed successfully")

        return {
            "id": merge_id,
            "status": "completed",
            "master_record_id": master_record_id,
            "duplicate_record_id": duplicate_id,
            "fields_merged": list(merged_fields.keys()),
        }

    except Exception as e:
        logger.error(f"Merge failed: {e}")
        # Update merge status to failed
        supabase.table("merges").update({
            "status": "failed",
            "error_message": str(e)
        }).eq("id", merge_id).execute()
        raise


# Fields that GHL accepts for contact creation
ALLOWED_CREATE_FIELDS = {
    "firstName", "lastName", "name", "email", "gender", "phone",
    "address1", "city", "state", "postalCode", "website", "timezone",
    "dnd", "dndSettings", "inboundDndSettings", "tags", "customFields",
    "source", "country", "companyName", "assignedTo", "dateOfBirth",
}


async def rollback_merge(
    merge_id: str,
    access_token: str,
    ghl_location_id: str,
    internal_location_id: str,
) -> Dict[str, Any]:
    """
    Rollback a merge operation:
    1. Recreate the deleted duplicate from snapshot
    2. Optionally restore master to original state
    """
    supabase = get_supabase()

    # Get the merge record
    merge = supabase.table("merges").select("*").eq("id", merge_id).single().execute()
    if not merge.data:
        raise ValueError("Merge not found")

    if merge.data["status"] == "rolled_back":
        raise ValueError("Merge already rolled back")

    # Get the duplicate snapshot from the snapshots table
    snapshots = supabase.table("snapshots").select("*").eq("merge_id", merge_id).execute()
    duplicate_snapshot = None
    for snapshot in snapshots.data or []:
        if snapshot.get("record_type") == "duplicate":
            duplicate_snapshot = snapshot.get("data")
            break

    if not duplicate_snapshot:
        raise ValueError("No snapshot available for rollback")

    logger.info(f"Rolling back merge {merge_id}")
    logger.info(f"Restoring duplicate contact from snapshot")

    try:
        async with GHLClient(access_token, ghl_location_id) as client:
            # Only include fields that GHL accepts for contact creation
            restore_data = {
                k: v for k, v in duplicate_snapshot.items()
                if k in ALLOWED_CREATE_FIELDS and v is not None
            }

            # locationId is required and must be added
            restore_data["locationId"] = ghl_location_id

            logger.info(f"Creating contact with data: {restore_data}")
            restored_contact = await client.create_contact(restore_data)
            restored_id = restored_contact.get("contact", {}).get("id")

            logger.info(f"Restored contact created with ID: {restored_id}")

        # Update merge status and store the new restored record ID
        supabase.table("merges").update({
            "status": "rolled_back",
            "rolled_back_at": "now()",
            "restored_record_id": restored_id,
        }).eq("id", merge_id).execute()

        # Update match pair status back to pending
        match_pair_id = merge.data.get("match_pair_id")
        if match_pair_id:
            supabase.table("match_pairs").update({"status": "pending"}).eq("id", match_pair_id).execute()

        logger.info(f"Rollback {merge_id} completed successfully")

        return {
            "id": merge_id,
            "status": "rolled_back",
            "restored_record_id": restored_id,
        }

    except Exception as e:
        logger.error(f"Rollback failed: {e}")
        raise
