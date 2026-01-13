"""
Merge service for executing contact merges via GHL API.
"""
from typing import Dict, Any
import uuid
import logging
import httpx

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
    preserve_alternates: bool = False,
) -> Dict[str, Any]:
    """
    Execute a merge operation:
    1. Store snapshots of both records for rollback
    2. Update master record with selected fields from duplicate
    3. Optionally preserve alternate values in custom fields
    4. Delete the duplicate record from GHL
    5. Update database records
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

    # Build master record name for display
    master_record_name = ""
    if master_data.get("firstName") or master_data.get("lastName"):
        first_name = master_data.get("firstName") or ""
        last_name = master_data.get("lastName") or ""
        master_record_name = f"{first_name} {last_name}".strip()
    elif master_data.get("name"):
        master_record_name = master_data.get("name")
    elif master_data.get("email"):
        master_record_name = master_data.get("email")
    else:
        master_record_name = "Unknown"

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

    # Apply field preservation if enabled
    if preserve_alternates:
        # Get rule's merge_settings for field preservation mappings
        rule_id = match.data.get("rule_id")
        preservation = {}

        if rule_id:
            rule_result = supabase.table("match_rules").select(
                "merge_settings"
            ).eq("id", rule_id).single().execute()

            if rule_result.data:
                merge_settings = rule_result.data.get("merge_settings") or {}
                preservation = merge_settings.get("field_preservation", {})

        if preservation.get("enabled"):
            mappings = preservation.get("mappings", [])
            custom_fields = merged_fields.get("customFields", [])
            if not isinstance(custom_fields, list):
                custom_fields = []

            for mapping in mappings:
                source_field = mapping.get("source")
                target_field = mapping.get("target")

                if not source_field or not target_field:
                    continue

                # Get which record was selected for this field
                selected = field_selections.get(source_field)
                if not selected:
                    continue

                # Get the NON-selected value (the alternate)
                if selected == "a":
                    alternate_value = record_b_data.get(source_field)
                else:
                    alternate_value = record_a_data.get(source_field)

                # Only preserve if there's an alternate value that differs from selected
                selected_value = merged_fields.get(source_field)
                if alternate_value and alternate_value != selected_value:
                    custom_fields.append({
                        "key": target_field,
                        "field_value": alternate_value
                    })
                    logger.info(f"Preserving alternate {source_field} value '{alternate_value}' to custom field '{target_field}'")

            if custom_fields:
                merged_fields["customFields"] = custom_fields

    logger.info(f"Merging {duplicate_id} into {master_record_id}")
    logger.info(f"Field selections: {field_selections}")
    logger.info(f"Merged fields to apply: {merged_fields}")
    logger.info(f"Preserve alternates: {preserve_alternates}")

    # Create merge record BEFORE making changes
    merge_id = str(uuid.uuid4())
    merge_data = {
        "id": merge_id,
        "tenant_id": tenant_id,
        "location_id": internal_location_id,
        "match_pair_id": match_id,
        "master_record_id": master_record_id,
        "master_record_name": master_record_name,
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

    # Fields that GHL accepts for contact UPDATE (from API docs)
    # Note: companyName is read-only (derived from linked business)
    ALLOWED_UPDATE_FIELDS = {
        "firstName", "lastName", "name", "email", "phone",
        "address1", "city", "state", "postalCode", "website", "timezone",
        "dnd", "dndSettings", "inboundDndSettings", "tags", "customFields",
        "source", "country", "assignedTo",
    }

    try:
        async with GHLClient(access_token, ghl_location_id) as client:
            # Update master record with merged fields (only allowed, non-empty fields)
            update_payload = {}
            for field, value in merged_fields.items():
                if field not in ALLOWED_UPDATE_FIELDS:
                    continue
                # Skip empty/falsy values, but keep False for booleans
                if value is None:
                    continue
                if isinstance(value, (list, dict, str)) and len(value) == 0:
                    continue
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

        # Clean up OTHER match_pairs that reference the deleted duplicate contact
        # Mark them as stale since the contact no longer exists
        stale_a = (
            supabase.table("match_pairs")
            .update({"status": "stale"})
            .eq("record_a_id", duplicate_id)
            .neq("id", match_id)
            .eq("status", "pending")
            .execute()
        )
        stale_b = (
            supabase.table("match_pairs")
            .update({"status": "stale"})
            .eq("record_b_id", duplicate_id)
            .neq("id", match_id)
            .eq("status", "pending")
            .execute()
        )
        stale_count = len(stale_a.data or []) + len(stale_b.data or [])
        if stale_count > 0:
            logger.info(f"Marked {stale_count} other match_pairs as stale (referenced deleted contact {duplicate_id})")

        logger.info(f"Merge {merge_id} completed successfully")

        return {
            "id": merge_id,
            "status": "completed",
            "master_record_id": master_record_id,
            "duplicate_record_id": duplicate_id,
            "fields_merged": list(merged_fields.keys()),
        }

    except httpx.HTTPStatusError as e:
        # Capture actual GHL API error response
        error_detail = str(e)
        try:
            error_body = e.response.json()
            error_detail = f"{e.response.status_code}: {error_body}"
        except Exception:
            error_detail = f"{e.response.status_code}: {e.response.text}"
        logger.error(f"Merge failed (HTTP): {error_detail}")
        supabase.table("merges").update({
            "status": "failed",
            "error_message": error_detail
        }).eq("id", merge_id).execute()
        raise
    except Exception as e:
        logger.error(f"Merge failed: {e}")
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

        # Update match pair: status back to pending AND update the record ID
        # The restored contact has a NEW ID, so we need to update the match_pair
        match_pair_id = merge.data.get("match_pair_id")
        old_duplicate_id = merge.data.get("duplicate_record_id")
        if match_pair_id and restored_id:
            # Get the match pair to check which record was the duplicate
            match_pair = supabase.table("match_pairs").select("record_a_id, record_b_id, record_a_data, record_b_data").eq("id", match_pair_id).single().execute()
            if match_pair.data:
                update_data = {"status": "pending"}
                # Update the correct record ID (a or b) with the new restored ID
                if match_pair.data["record_a_id"] == old_duplicate_id:
                    update_data["record_a_id"] = restored_id
                    # Also update the snapshot data with the new ID
                    record_data = match_pair.data.get("record_a_data", {})
                    if record_data:
                        record_data["id"] = restored_id
                        update_data["record_a_data"] = record_data
                elif match_pair.data["record_b_id"] == old_duplicate_id:
                    update_data["record_b_id"] = restored_id
                    record_data = match_pair.data.get("record_b_data", {})
                    if record_data:
                        record_data["id"] = restored_id
                        update_data["record_b_data"] = record_data

                supabase.table("match_pairs").update(update_data).eq("id", match_pair_id).execute()
                logger.info(f"Updated match_pair {match_pair_id}: old ID {old_duplicate_id} -> new ID {restored_id}")

        logger.info(f"Rollback {merge_id} completed successfully")

        return {
            "id": merge_id,
            "status": "rolled_back",
            "restored_record_id": restored_id,
        }

    except Exception as e:
        logger.error(f"Rollback failed: {e}")
        raise
