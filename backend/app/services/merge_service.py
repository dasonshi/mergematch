"""
Merge service for executing contact merges via GHL API.
"""
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import uuid
import logging
import httpx

from app.core.ghl.client import GHLClient
from app.db.supabase import get_supabase
from app.services.matching_service import compare_records

logger = logging.getLogger(__name__)

# Standard fields used in merge operations
MERGE_FIELDS = [
    "firstName", "lastName", "email", "phone", "tags",
    "address1", "city", "state", "postalCode",
]


def _is_blank(value: Any) -> bool:
    """Check if a value is considered blank."""
    if value is None:
        return True
    if isinstance(value, str) and value == "":
        return True
    if isinstance(value, list) and len(value) == 0:
        return True
    return False


def _count_non_blank(record: dict, fields: List[str]) -> int:
    """Count non-blank fields on a record."""
    return sum(1 for f in fields if not _is_blank(record.get(f)))


def _parse_date(value: Any) -> float:
    """Parse an ISO date string to a timestamp. Returns 0 on failure."""
    if not value:
        return 0
    try:
        return datetime.fromisoformat(str(value).replace("Z", "+00:00")).timestamp()
    except (ValueError, TypeError):
        return 0


def compute_strategy_selections(
    strategy: str,
    record_a: dict,
    record_b: dict,
    overwrite_blanks: bool = False,
    fields: Optional[List[str]] = None,
) -> Dict[str, str]:
    """
    Server-side equivalent of the frontend computeStrategySelections.
    Returns a dict mapping field -> "a" or "b".
    """
    resolved_fields = fields or MERGE_FIELDS

    if strategy == "manual":
        return {}

    # Determine the winner
    winner_is_a = True  # default tie-break

    if strategy == "standard":
        count_a = _count_non_blank(record_a, resolved_fields)
        count_b = _count_non_blank(record_b, resolved_fields)
        winner_is_a = count_a >= count_b
    elif strategy == "recent":
        date_a = _parse_date(record_a.get("dateUpdated"))
        date_b = _parse_date(record_b.get("dateUpdated"))
        winner_is_a = date_a >= date_b
    elif strategy == "oldest":
        date_a = _parse_date(record_a.get("dateAdded"))
        date_b = _parse_date(record_b.get("dateAdded"))
        winner_is_a = date_a <= date_b

    winner = "a" if winner_is_a else "b"
    loser = "b" if winner_is_a else "a"
    winner_record = record_a if winner_is_a else record_b
    loser_record = record_b if winner_is_a else record_a

    selections: Dict[str, str] = {}
    for field in resolved_fields:
        winner_val = winner_record.get(field)
        loser_val = loser_record.get(field)

        if _is_blank(winner_val) and not _is_blank(loser_val) and not overwrite_blanks:
            # Fallback: winner blank, loser has value -> use loser
            selections[field] = loser
        else:
            selections[field] = winner

    return selections


def evaluate_condition(record: dict, condition: dict) -> bool:
    """Evaluate a single condition against a record."""
    field = condition.get("field", "")
    operator = condition.get("operator", "=")
    value = condition.get("value", "")

    record_value = record.get(field)

    # Handle empty checks
    if operator == "is_empty":
        return record_value is None or record_value == "" or record_value == []
    if operator == "is_not_empty":
        return record_value is not None and record_value != "" and record_value != []

    # Convert values for comparison
    if record_value is None:
        return False

    # Numeric comparisons
    try:
        if operator in (">", "<", ">=", "<="):
            record_num = float(record_value) if record_value else 0
            compare_num = float(value) if value else 0

            if operator == ">":
                return record_num > compare_num
            elif operator == "<":
                return record_num < compare_num
            elif operator == ">=":
                return record_num >= compare_num
            elif operator == "<=":
                return record_num <= compare_num
    except (ValueError, TypeError):
        return False

    # String comparisons
    record_str = str(record_value).lower() if record_value else ""
    value_str = str(value).lower() if value else ""

    if operator == "=":
        return record_str == value_str
    elif operator == "!=":
        return record_str != value_str
    elif operator == "contains":
        return value_str in record_str
    elif operator == "not_contains":
        return value_str not in record_str
    elif operator == "starts_with":
        return record_str.startswith(value_str)
    elif operator == "ends_with":
        return record_str.endswith(value_str)

    return False


def evaluate_custom_logic(record: dict, logic_config: dict) -> bool:
    """Evaluate custom logic against a record."""
    conditions = logic_config.get("conditions", [])
    operator = logic_config.get("operator", "AND")

    if not conditions:
        return True  # No conditions = include all

    results = [evaluate_condition(record, c) for c in conditions]

    if operator == "AND":
        return all(results)
    else:  # OR
        return any(results)


async def reassign_opportunities_with_custom_logic(
    client,
    from_contact_id: str,
    to_contact_id: str,
    logic_config: dict,
) -> int:
    """
    Reassign opportunities that match custom logic conditions.

    Args:
        client: GHL client instance
        from_contact_id: Source contact (duplicate)
        to_contact_id: Target contact (master)
        logic_config: Custom logic configuration with conditions

    Returns count of opportunities reassigned.
    """
    opportunities = await client.get_contact_opportunities(from_contact_id)
    if not opportunities:
        return 0

    # Filter by custom logic
    matching_opps = [opp for opp in opportunities if evaluate_custom_logic(opp, logic_config)]
    logger.info(f"Custom logic matched {len(matching_opps)}/{len(opportunities)} opportunities")

    reassigned = 0
    for opp in matching_opps:
        opp_id = opp.get("id")
        if opp_id:
            try:
                await client.update_opportunity(opp_id, {"contactId": to_contact_id})
                reassigned += 1
            except Exception as e:
                logger.warning(f"Failed to reassign opportunity {opp_id}: {e}")

    return reassigned


async def execute_merge(
    match_id: str,
    master_record_id: str,
    field_selections: Dict[str, str],
    access_token: str,
    ghl_location_id: str,
    tenant_id: str,
    internal_location_id: str,
    preserve_alternates: bool = False,
    field_preservation_mappings: Optional[List[Dict[str, str]]] = None,
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
    match = supabase.table("match_pairs").select("*").eq("id", match_id).eq("location_id", internal_location_id).single().execute()
    if not match.data:
        raise ValueError("Match not found")

    record_a_id = match.data["record_a_id"]
    record_b_id = match.data["record_b_id"]
    rule_id = match.data.get("rule_id")

    # ── Re-fetch both records from GHL as a safety net ────────────────────
    # This ensures we merge using the latest data, not a stale snapshot.
    try:
        async with GHLClient(access_token, ghl_location_id) as prefetch_client:
            fresh_a = None
            fresh_b = None

            try:
                fresh_a_resp = await prefetch_client.get_contact(record_a_id)
                fresh_a = fresh_a_resp.get("contact", fresh_a_resp)
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 404:
                    # Contact A was deleted — mark pair stale and abort
                    supabase.table("match_pairs").update({"status": "stale"}).eq("id", match_id).execute()
                    raise ValueError(
                        f"Contact {record_a_id} no longer exists in GHL. "
                        "The match has been marked as stale."
                    )
                raise

            try:
                fresh_b_resp = await prefetch_client.get_contact(record_b_id)
                fresh_b = fresh_b_resp.get("contact", fresh_b_resp)
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 404:
                    supabase.table("match_pairs").update({"status": "stale"}).eq("id", match_id).execute()
                    raise ValueError(
                        f"Contact {record_b_id} no longer exists in GHL. "
                        "The match has been marked as stale."
                    )
                raise

            # Update snapshots in the match_pair with fresh data
            if fresh_a and fresh_b:
                supabase.table("match_pairs").update({
                    "record_a_data": fresh_a,
                    "record_b_data": fresh_b,
                }).eq("id", match_id).execute()

                record_a_data = fresh_a
                record_b_data = fresh_b
                logger.info(f"Refreshed both contact snapshots from GHL before merge")

                # Re-validate the pair still matches
                if rule_id:
                    rule_check = supabase.table("match_rules").select(
                        "match_fields, review_threshold"
                    ).eq("id", rule_id).single().execute()

                    if rule_check.data:
                        match_fields = rule_check.data.get("match_fields", [])
                        review_threshold = float(rule_check.data.get("review_threshold", 0.70)) * 100

                        if match_fields:
                            is_match, confidence, _ = compare_records(
                                record_a_data, record_b_data, match_fields
                            )
                            if not is_match or confidence < review_threshold:
                                supabase.table("match_pairs").update({
                                    "status": "stale",
                                    "confidence_score": confidence / 100,
                                }).eq("id", match_id).execute()
                                raise ValueError(
                                    f"These contacts no longer match after re-validation "
                                    f"(confidence: {confidence:.0f}%, threshold: {review_threshold:.0f}%). "
                                    "The match has been marked as stale."
                                )
                            logger.info(
                                f"Re-validated pair before merge: confidence={confidence:.1f}%"
                            )
            else:
                # Couldn't fetch fresh data — proceed with stored snapshots
                record_a_data = match.data.get("record_a_data", {})
                record_b_data = match.data.get("record_b_data", {})
                logger.warning("Could not refresh contact data from GHL, using stored snapshots")

    except ValueError:
        # Re-raise validation errors (stale, deleted, no longer matching)
        raise
    except Exception as e:
        # Non-critical: if the pre-fetch fails for other reasons, proceed with snapshots
        logger.warning(f"Pre-merge contact refresh failed, using stored snapshots: {e}")
        record_a_data = match.data.get("record_a_data", {})
        record_b_data = match.data.get("record_b_data", {})

    # Fetch rule settings once (used for strategy auto-compute, field preservation, and related records)
    rule_merge_settings: dict = {}
    rule_merge_strategy = "standard"
    if rule_id:
        rule_result = supabase.table("match_rules").select(
            "merge_settings, merge_strategy"
        ).eq("id", rule_id).single().execute()
        if rule_result.data:
            rule_merge_settings = rule_result.data.get("merge_settings") or {}
            rule_merge_strategy = rule_result.data.get("merge_strategy") or "standard"

    overwrite_blanks = rule_merge_settings.get("overwrite_blanks", False)

    # Auto-compute field_selections from strategy if not provided
    if not field_selections:
        field_selections = compute_strategy_selections(
            strategy=rule_merge_strategy,
            record_a=record_a_data,
            record_b=record_b_data,
            overwrite_blanks=overwrite_blanks,
        )
        logger.info(f"Auto-computed field_selections from strategy '{rule_merge_strategy}': {field_selections}")

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

        # When overwrite_blanks is True, include None/empty values (they'll clear the field)
        if value is not None:
            merged_fields[field] = value
        elif overwrite_blanks:
            merged_fields[field] = ""

    # Apply field preservation if enabled
    if preserve_alternates:
        # Use per-merge mappings if provided, otherwise fall back to rule settings
        if field_preservation_mappings:
            mappings = field_preservation_mappings
            logger.info(f"Using per-merge field preservation mappings: {mappings}")
        else:
            preservation = rule_merge_settings.get("field_preservation", {})
            if preservation.get("enabled"):
                mappings = preservation.get("mappings", [])
            else:
                mappings = []

        if mappings:
            custom_fields = merged_fields.get("customFields", [])
            if not isinstance(custom_fields, list):
                custom_fields = []

            for mapping in mappings:
                source_field = mapping.get("source")
                target_field = mapping.get("target")

                if not source_field or not target_field:
                    continue

                # Always preserve from the duplicate (loser) record that will be deleted
                value_to_preserve = duplicate_data.get(source_field)

                # Only preserve if there's a non-empty value
                if value_to_preserve:
                    custom_fields.append({
                        "id": target_field,  # GHL API expects 'id' for custom field identifier
                        "field_value": value_to_preserve
                    })
                    logger.info(f"Preserving {source_field} value '{value_to_preserve}' from duplicate to custom field '{target_field}'")

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

    # Store snapshots in the snapshots table for rollback (30-day window)
    expires_at = (datetime.utcnow() + timedelta(days=30)).isoformat()
    snapshots_data = [
        {
            "id": str(uuid.uuid4()),
            "merge_id": merge_id,
            "record_id": master_record_id,
            "record_type": "master",
            "data": master_data,
            "expires_at": expires_at,
        },
        {
            "id": str(uuid.uuid4()),
            "merge_id": merge_id,
            "record_id": duplicate_id,
            "record_type": "duplicate",
            "data": duplicate_data,
            "expires_at": expires_at,
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

    # Get related records configuration from rule's merge_settings (already fetched above)
    related_records_config = rule_merge_settings.get("related_records", {})

    try:
        async with GHLClient(access_token, ghl_location_id) as client:
            # Fetch and snapshot duplicate's related records BEFORE any modifications
            duplicate_notes = []
            duplicate_tasks = []
            duplicate_opps = []

            try:
                duplicate_notes = await client.get_contact_notes(duplicate_id)
                logger.info(f"Snapshotted {len(duplicate_notes)} notes from duplicate")
            except Exception as e:
                logger.warning(f"Failed to snapshot notes: {e}")

            try:
                duplicate_tasks = await client.get_contact_tasks(duplicate_id)
                logger.info(f"Snapshotted {len(duplicate_tasks)} tasks from duplicate")
            except Exception as e:
                logger.warning(f"Failed to snapshot tasks: {e}")

            try:
                duplicate_opps = await client.get_contact_opportunities(duplicate_id)
                logger.info(f"Snapshotted {len(duplicate_opps)} opportunities from duplicate")
            except Exception as e:
                logger.warning(f"Failed to snapshot opportunities: {e}")

            # Snapshot appointments
            duplicate_appointments = []
            try:
                duplicate_appointments = await client.get_contact_appointments(duplicate_id)
                logger.info(f"Snapshotted {len(duplicate_appointments)} appointments from duplicate")
            except Exception as e:
                logger.warning(f"Failed to snapshot appointments: {e}")

            # Store related record snapshots (same 30-day expiration)
            related_snapshots = []
            if duplicate_notes:
                related_snapshots.append({
                    "id": str(uuid.uuid4()),
                    "merge_id": merge_id,
                    "record_id": duplicate_id,
                    "record_type": "duplicate_notes",
                    "data": {"notes": duplicate_notes},
                    "expires_at": expires_at,
                })
            if duplicate_tasks:
                related_snapshots.append({
                    "id": str(uuid.uuid4()),
                    "merge_id": merge_id,
                    "record_id": duplicate_id,
                    "record_type": "duplicate_tasks",
                    "data": {"tasks": duplicate_tasks},
                    "expires_at": expires_at,
                })
            if duplicate_opps:
                related_snapshots.append({
                    "id": str(uuid.uuid4()),
                    "merge_id": merge_id,
                    "record_id": duplicate_id,
                    "record_type": "duplicate_opportunities",
                    "data": {"opportunities": duplicate_opps},
                    "expires_at": expires_at,
                })
            if duplicate_appointments:
                related_snapshots.append({
                    "id": str(uuid.uuid4()),
                    "merge_id": merge_id,
                    "record_id": duplicate_id,
                    "record_type": "duplicate_appointments",
                    "data": {"appointments": duplicate_appointments},
                    "expires_at": expires_at,
                })

            if related_snapshots:
                supabase.table("snapshots").insert(related_snapshots).execute()
                logger.info(f"Saved {len(related_snapshots)} related record snapshots")

            # Update master record with merged fields (only allowed fields)
            update_payload = {}
            for field, value in merged_fields.items():
                if field not in ALLOWED_UPDATE_FIELDS:
                    continue
                if overwrite_blanks:
                    # When overwrite_blanks is enabled, include empty values to clear fields
                    if value is None:
                        update_payload[field] = ""
                    else:
                        update_payload[field] = value
                else:
                    # Skip empty/falsy values, but keep False for booleans
                    if value is None:
                        continue
                    if isinstance(value, (list, dict, str)) and len(value) == 0:
                        continue
                    update_payload[field] = value

            if update_payload:
                logger.info(f"Updating master contact {master_record_id} with: {update_payload}")
                await client.update_contact(master_record_id, update_payload)

            # Handle related records BEFORE deleting duplicate
            if related_records_config:
                logger.info(f"Processing related records: {related_records_config}")

                # Handle Notes
                notes_handling = related_records_config.get("notes")
                if notes_handling == "copy_to_master":
                    try:
                        notes_copied = await client.reassign_contact_notes(duplicate_id, master_record_id)
                        logger.info(f"Copied {notes_copied} notes to master")
                    except Exception as e:
                        logger.warning(f"Failed to copy notes: {e}")

                # Handle Tasks
                tasks_handling = related_records_config.get("tasks")
                if tasks_handling == "copy_to_master":
                    try:
                        tasks_copied = await client.reassign_contact_tasks(duplicate_id, master_record_id)
                        logger.info(f"Copied {tasks_copied} tasks to master")
                    except Exception as e:
                        logger.warning(f"Failed to copy tasks: {e}")

                # Handle Opportunities
                opps_handling = related_records_config.get("opportunities")
                if opps_handling and opps_handling != "dont_copy":
                    try:
                        if opps_handling == "custom_logic":
                            # Custom logic filtering
                            custom_logic = related_records_config.get("opportunities_custom_logic", {})
                            opps_reassigned = await reassign_opportunities_with_custom_logic(
                                client, duplicate_id, master_record_id, custom_logic
                            )
                        else:
                            opps_reassigned = await client.reassign_contact_opportunities(
                                duplicate_id, master_record_id, handling=opps_handling
                            )
                        logger.info(f"Reassigned {opps_reassigned} opportunities to master")
                    except Exception as e:
                        logger.warning(f"Failed to reassign opportunities: {e}")

            # Delete the duplicate record
            logger.info(f"Deleting duplicate contact {duplicate_id}")
            await client.delete_contact(duplicate_id)

        # Update merge status to completed
        supabase.table("merges").update({"status": "completed"}).eq("id", merge_id).execute()

        # Update match status to merged
        supabase.table("match_pairs").update({"status": "merged"}).eq("id", match_id).execute()

        # Update rule's last_merge_at timestamp
        if rule_id:
            supabase.table("match_rules").update(
                {"last_merge_at": datetime.utcnow().isoformat()}
            ).eq("id", rule_id).execute()

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
    merge = supabase.table("merges").select("*").eq("id", merge_id).eq("location_id", internal_location_id).single().execute()
    if not merge.data:
        raise ValueError("Merge not found")

    if merge.data["status"] == "rolled_back":
        raise ValueError("Merge already rolled back")

    # Get all snapshots for this merge
    snapshots = supabase.table("snapshots").select("*").eq("merge_id", merge_id).execute()
    master_snapshot = None
    duplicate_snapshot = None
    notes_snapshot = None
    tasks_snapshot = None
    opps_snapshot = None
    appointments_snapshot = None

    for snapshot in snapshots.data or []:
        record_type = snapshot.get("record_type")
        if record_type == "master":
            master_snapshot = snapshot.get("data")
        elif record_type == "duplicate":
            duplicate_snapshot = snapshot.get("data")
        elif record_type == "duplicate_notes":
            notes_snapshot = snapshot.get("data", {}).get("notes", [])
        elif record_type == "duplicate_tasks":
            tasks_snapshot = snapshot.get("data", {}).get("tasks", [])
        elif record_type == "duplicate_opportunities":
            opps_snapshot = snapshot.get("data", {}).get("opportunities", [])
        elif record_type == "duplicate_appointments":
            appointments_snapshot = snapshot.get("data", {}).get("appointments", [])

    if not duplicate_snapshot:
        raise ValueError("No snapshot available for rollback")

    # Check if rollback window has expired
    for snapshot in snapshots.data or []:
        expires_at = snapshot.get("expires_at")
        if expires_at:
            try:
                expiry_time = datetime.fromisoformat(expires_at.replace("Z", "+00:00"))
                if expiry_time < datetime.now(expiry_time.tzinfo):
                    raise ValueError("Rollback window has expired (30 days). Snapshots have been deleted.")
            except ValueError as e:
                if "Rollback window" in str(e):
                    raise
                # Parse error - continue without expiration check
                pass
            break  # Only need to check one snapshot

    logger.info(f"Rolling back merge {merge_id}")
    logger.info(f"Restoring duplicate contact from snapshot")
    logger.info(f"Related records to restore: {len(notes_snapshot or [])} notes, {len(tasks_snapshot or [])} tasks, {len(opps_snapshot or [])} opportunities, {len(appointments_snapshot or [])} appointments")

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

            # Restore related records on the recreated contact
            notes_restored = 0
            tasks_restored = 0
            opps_restored = 0

            # Restore notes
            if notes_snapshot and restored_id:
                for note in notes_snapshot:
                    body = note.get("body", "")
                    if body:
                        try:
                            await client.create_contact_note(restored_id, body)
                            notes_restored += 1
                        except Exception as e:
                            logger.warning(f"Failed to restore note: {e}")
                logger.info(f"Restored {notes_restored}/{len(notes_snapshot)} notes")

            # Restore tasks
            if tasks_snapshot and restored_id:
                for task in tasks_snapshot:
                    title = task.get("title", "")
                    if title:
                        try:
                            await client.create_contact_task(
                                restored_id,
                                title=title,
                                body=task.get("body"),
                                due_date=task.get("dueDate"),
                                completed=task.get("completed", False),
                            )
                            tasks_restored += 1
                        except Exception as e:
                            logger.warning(f"Failed to restore task: {e}")
                logger.info(f"Restored {tasks_restored}/{len(tasks_snapshot)} tasks")

            # Restore opportunities by reassigning them back from master
            if opps_snapshot and restored_id:
                master_record_id = merge.data.get("master_record_id")
                for opp in opps_snapshot:
                    opp_id = opp.get("id")
                    if opp_id:
                        try:
                            await client.update_opportunity(opp_id, {"contactId": restored_id})
                            opps_restored += 1
                        except Exception as e:
                            logger.warning(f"Failed to restore opportunity {opp_id}: {e}")
                logger.info(f"Restored {opps_restored}/{len(opps_snapshot)} opportunities")

            # Restore appointments by reassigning them back to restored contact
            appointments_restored = 0
            if appointments_snapshot and restored_id:
                for appt in appointments_snapshot:
                    appt_id = appt.get("id")
                    if appt_id:
                        try:
                            await client.update_appointment(appt_id, {"contactId": restored_id})
                            appointments_restored += 1
                        except Exception as e:
                            logger.warning(f"Failed to restore appointment {appt_id}: {e}")
                logger.info(f"Restored {appointments_restored}/{len(appointments_snapshot)} appointments")

            # Restore master record to its original state
            if master_snapshot:
                master_record_id = merge.data.get("master_record_id")
                if master_record_id:
                    # Filter to only fields GHL accepts for update
                    ALLOWED_UPDATE_FIELDS = {
                        "firstName", "lastName", "name", "email", "phone",
                        "address1", "city", "state", "postalCode", "website", "timezone",
                        "dnd", "dndSettings", "inboundDndSettings", "tags", "customFields",
                        "source", "country", "assignedTo",
                    }
                    restore_master_data = {
                        k: v for k, v in master_snapshot.items()
                        if k in ALLOWED_UPDATE_FIELDS and v is not None
                    }
                    if restore_master_data:
                        try:
                            await client.update_contact(master_record_id, restore_master_data)
                            logger.info(f"Restored master record {master_record_id} to original state")
                        except Exception as e:
                            logger.warning(f"Failed to restore master record: {e}")

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
