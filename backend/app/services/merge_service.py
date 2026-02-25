"""
Merge service for executing contact merges via GHL API.
"""
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import asyncio
import uuid
import logging
import httpx
import gc

from app.core.ghl.client import GHLClient
from app.db.supabase import get_supabase
from app.services.matching_service import compare_records
from app.services.billing_service import get_plan_features

logger = logging.getLogger(__name__)

# Standard fields used in merge operations
MERGE_FIELDS = [
    "firstName", "lastName", "email", "phone", "tags",
    "address1", "city", "state", "postalCode",
]

DISPLAY_OBJECT_KEYS = (
    "displayName",
    "display_name",
    "name",
    "label",
    "title",
    "text",
    "value",
    "amount",
    "email",
    "phone",
    "url",
    "id",
)

CURRENCY_OBJECT_KEYS = (
    "currency",
    "currencyCode",
    "currency_code",
    "symbol",
    "currencySymbol",
)

CONTACT_ALLOWED_UPDATE_FIELDS = {
    "firstName", "lastName", "name", "email", "phone",
    "address1", "city", "state", "postalCode", "website", "timezone",
    "dnd", "dndSettings", "inboundDndSettings", "tags", "customFields",
    "source", "country", "assignedTo",
}

CONTACT_ALLOWED_CREATE_FIELDS = {
    "firstName", "lastName", "name", "email", "gender", "phone",
    "address1", "city", "state", "postalCode", "website", "timezone",
    "dnd", "dndSettings", "inboundDndSettings", "tags", "customFields",
    "source", "country", "companyName", "assignedTo", "dateOfBirth",
}

# These are the core business/opportunity fields surfaced in field selectors.
COMPANY_ALLOWED_FIELDS = {
    "name", "email", "phone", "website", "address", "address1", "address2", "city", "state",
    "postalCode", "country", "industry", "description", "logoUrl",
    "customFields", "tags", "additionalEmails",
}

OPPORTUNITY_ALLOWED_FIELDS = {
    "name", "title", "status", "monetaryValue", "pipelineId", "pipelineStageId",
    "contactId", "assignedTo", "source", "customFields", "lostReasonId",
    "followers",
}

# Common read-only/metadata keys that should never be sent in update/create payloads.
NON_MUTABLE_RECORD_FIELDS = {
    "id", "_raw", "dateAdded", "dateUpdated", "createdAt", "updatedAt",
    "createdBy", "updatedBy", "locationId", "location_id",
}

NON_CONTACT_DYNAMIC_EXCLUDE_FIELDS = NON_MUTABLE_RECORD_FIELDS | {
    "contact", "pipeline", "contacts", "opportunities", "relationships",
}


def _normalize_source_object(source_object: Any) -> Optional[str]:
    """Normalize source object values to canonical merge object keys."""
    if not isinstance(source_object, str):
        return None

    value = source_object.strip()
    if not value:
        return None

    lowered = value.lower()
    if lowered in ("contact", "contacts"):
        return "contacts"
    if lowered in ("company", "companies", "business"):
        return "companies"
    if lowered in ("opportunity", "opportunities"):
        return "opportunities"
    if lowered.startswith("custom_objects."):
        suffix = value.split(".", 1)[1] if "." in value else ""
        if suffix:
            return f"custom_objects.{suffix}"
    return None


def _extract_id_from_response(
    payload: Dict[str, Any],
    candidate_paths: List[tuple[str, ...]],
) -> Optional[str]:
    """Extract a record ID from an API response using known response shapes."""
    for path in candidate_paths:
        current: Any = payload
        for key in path:
            if not isinstance(current, dict):
                current = None
                break
            current = current.get(key)
        if isinstance(current, str) and current:
            return current
    return None


def _remap_record_payload_id(
    record_data: Any,
    *,
    old_id: str,
    new_id: str,
) -> bool:
    """Update known ID fields inside cached match payload snapshots."""
    if not isinstance(record_data, dict):
        return False

    changed = False
    if record_data.get("id") == old_id:
        record_data["id"] = new_id
        changed = True
    if record_data.get("recordId") == old_id:
        record_data["recordId"] = new_id
        changed = True

    raw_data = record_data.get("_raw")
    if isinstance(raw_data, dict):
        if raw_data.get("id") == old_id:
            raw_data["id"] = new_id
            changed = True
        if raw_data.get("recordId") == old_id:
            raw_data["recordId"] = new_id
            changed = True

        raw_record = raw_data.get("record")
        if isinstance(raw_record, dict):
            if raw_record.get("id") == old_id:
                raw_record["id"] = new_id
                changed = True
            if raw_record.get("recordId") == old_id:
                raw_record["recordId"] = new_id
                changed = True

    return changed


def _extract_custom_object_field_key(field_key: str) -> Optional[str]:
    """Extract custom object property key from schema field path."""
    if not field_key:
        return None

    if field_key.startswith("custom_objects."):
        parts = field_key.split(".")
        if len(parts) >= 3:
            return ".".join(parts[2:])

    return field_key


def _derive_dynamic_fields(record_a: dict, record_b: dict, exclude_fields: set[str]) -> List[str]:
    """Derive mergeable fields from two records, excluding metadata."""
    all_fields = set((record_a or {}).keys()) | set((record_b or {}).keys())
    return sorted(field for field in all_fields if field not in exclude_fields and not field.startswith("_"))


def _normalize_update_value(value: Any, overwrite_blanks: bool) -> Any:
    """Normalize selected field values before sending to GHL."""
    if overwrite_blanks:
        return "" if value is None else value

    if value is None:
        return None
    if isinstance(value, (list, dict, str)) and len(value) == 0:
        return None
    return value


def _build_payload(
    merged_fields: Dict[str, Any],
    *,
    overwrite_blanks: bool,
    allowed_fields: Optional[set[str]] = None,
    excluded_fields: Optional[set[str]] = None,
) -> Dict[str, Any]:
    """Build a filtered payload from merged fields."""
    payload: Dict[str, Any] = {}
    excluded = excluded_fields or set()

    for field, raw_value in merged_fields.items():
        if allowed_fields is not None and field not in allowed_fields:
            continue
        if field in excluded or field.startswith("_"):
            continue

        value = _normalize_update_value(raw_value, overwrite_blanks)
        if value is None:
            continue
        payload[field] = value

    return payload


def _extract_custom_object_properties(snapshot: dict) -> Dict[str, Any]:
    """Extract custom object properties from snapshot data."""
    raw_data = (snapshot or {}).get("_raw")
    if raw_data:
        return raw_data.get("properties") or {}

    return {
        k: v for k, v in (snapshot or {}).items()
        if k not in ("id", "dateAdded", "dateUpdated", "_raw") and v is not None
    }


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


def _stringify_value(
    value: Any,
    depth: int = 0,
    seen: Optional[set[int]] = None,
) -> str:
    """Convert a record value to a displayable string."""
    if seen is None:
        seen = set()

    if value is None:
        return ""
    if isinstance(value, str):
        return value.strip()
    if isinstance(value, bool):
        return "Yes" if value else "No"
    if isinstance(value, (int, float)):
        return str(value)

    if isinstance(value, list):
        if depth > 2:
            return ""
        if not value:
            return ""
        normalized = [_stringify_value(item, depth + 1, seen) for item in value]
        return ", ".join(part for part in normalized if part)

    if isinstance(value, dict):
        if depth > 2:
            return ""

        value_id = id(value)
        if value_id in seen:
            return ""
        seen.add(value_id)

        amount_raw = value.get("amount", value.get("value"))
        currency_raw = None
        for currency_key in CURRENCY_OBJECT_KEYS:
            if value.get(currency_key) is not None:
                currency_raw = value.get(currency_key)
                break

        amount_text = _stringify_value(amount_raw, depth + 1, seen)
        currency_text = _stringify_value(currency_raw, depth + 1, seen)
        if amount_text and currency_text:
            return f"{amount_text} {currency_text}"

        for key in DISPLAY_OBJECT_KEYS:
            text = _stringify_value(value.get(key), depth + 1, seen)
            if text:
                return text

        summarized: List[tuple[str, str]] = []
        for key, raw in value.items():
            text = _stringify_value(raw, depth + 1, seen)
            if text:
                summarized.append((key, text))

        if len(summarized) == 1:
            return summarized[0][1]
        if len(summarized) > 1:
            return ", ".join(f"{key}: {text}" for key, text in summarized[:2])

    return str(value)


def _get_nested_value(record: dict, field_path: str) -> Any:
    keys = field_path.split(".")
    current: Any = record
    for key in keys:
        if not isinstance(current, dict):
            return None
        current = current.get(key)
    return current


def _get_custom_field_value(record: dict, field: str) -> Any:
    custom_fields = record.get("customFields") or record.get("customField")
    if custom_fields is None:
        return None

    if isinstance(custom_fields, list):
        for item in custom_fields:
            if not isinstance(item, dict):
                continue

            identifier = item.get("id") or item.get("key") or item.get("fieldKey")
            if not isinstance(identifier, str):
                continue

            normalized_identifier = identifier.removeprefix("customField.")
            if normalized_identifier != field and not normalized_identifier.endswith(f".{field}"):
                continue

            if "value" in item:
                return item.get("value")
            if "fieldValue" in item:
                return item.get("fieldValue")
            if "field_value" in item:
                return item.get("field_value")
        return None

    if isinstance(custom_fields, dict):
        if field in custom_fields:
            return custom_fields.get(field)

        for key, value in custom_fields.items():
            if key.endswith(f".{field}"):
                return value

    return None


def _get_field_value(record: dict, field: str) -> Any:
    if not record or not field:
        return None

    candidates: List[Any] = []
    if field.startswith("customField."):
        custom_key = field.replace("customField.", "", 1)
        candidates.append(_get_custom_field_value(record, custom_key))
        candidates.append(record.get(custom_key))
        candidates.append(_get_nested_value(record, custom_key))
    else:
        candidates.append(record.get(field))
        candidates.append(_get_custom_field_value(record, field))
        if "." in field:
            candidates.append(_get_nested_value(record, field))

    for candidate in candidates:
        if candidate is not None:
            return candidate

    return None


def _build_record_name(
    record: dict,
    record_id: str,
    match_fields: Optional[List[dict]] = None,
    display_field: Optional[str] = None,
) -> str:
    """Build a display name for a record using common fields and match fields."""
    logger.debug("Building record display name")

    if display_field:
        value = _stringify_value(_get_field_value(record, display_field))
        if value:
            return value

    first_name = record.get("firstName")
    last_name = record.get("lastName")
    if first_name or last_name:
        return f"{first_name or ''} {last_name or ''}".strip()

    for key in ("name", "title", "label", "displayName", "vin"):
        value = _stringify_value(_get_field_value(record, key))
        if value:
            return value

    email = _stringify_value(_get_field_value(record, "email"))
    if email:
        return email

    if match_fields:
        for field_config in match_fields:
            field = field_config.get("field")
            if not field:
                continue
            value = _stringify_value(_get_field_value(record, field))
            if value:
                return value

    return record_id or "Unknown"


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


def compute_merge_selections(
    record_a: Dict[str, Any],
    record_b: Dict[str, Any],
    strategy: str,
    overwrite_blanks: bool = False,
    source_object: str = "contacts",
) -> tuple[str, Dict[str, str]]:
    """
    Compute master record ID and field selections based on merge strategy.
    Returns (master_id, field_selections) tuple.
    """
    if source_object == "contacts":
        fields = [
            "firstName", "lastName", "email", "phone", "tags",
            "address1", "city", "state", "postalCode", "companyName",
        ]
    else:
        internal_fields = {
            "id", "_raw", "dateAdded", "dateUpdated", "createdAt", "updatedAt",
            "locationId", "location_id", "contact", "pipeline", "contacts",
            "opportunities", "relationships",
        }
        all_fields = set(record_a.keys()) | set(record_b.keys())
        fields = [f for f in all_fields if f not in internal_fields and not f.startswith("_")]

    id_a = record_a.get("id", "")
    id_b = record_b.get("id", "")

    if strategy == "recent":
        date_a = record_a.get("dateUpdated") or record_a.get("dateAdded") or ""
        date_b = record_b.get("dateUpdated") or record_b.get("dateAdded") or ""
        master_id = id_a if date_a >= date_b else id_b
    elif strategy == "standard":
        def count_filled(record: Dict) -> int:
            return sum(1 for f in fields if record.get(f))
        master_id = id_a if count_filled(record_a) >= count_filled(record_b) else id_b
    elif strategy == "oldest":
        date_a = record_a.get("dateAdded") or ""
        date_b = record_b.get("dateAdded") or ""
        master_id = id_a if date_a <= date_b else id_b
    else:
        master_id = id_a

    master = record_a if master_id == id_a else record_b
    duplicate = record_b if master_id == id_a else record_a

    selections = {}
    for field in fields:
        master_val = master.get(field)
        dup_val = duplicate.get(field)
        master_empty = _is_blank(master_val)
        dup_empty = _is_blank(dup_val)

        if master_empty and not dup_empty and not overwrite_blanks:
            selections[field] = "b" if master_id == id_a else "a"
        else:
            selections[field] = "a" if master_id == id_a else "b"

    return master_id, selections


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
            except Exception:
                logger.warning("Failed to reassign opportunity")

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
    plan: str = "free",
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

    # Determine source object type from rule
    source_object = "contacts"  # default
    is_custom_object = False
    is_company = False
    is_opportunity = False
    schema_key = None
    source_display_field: Optional[str] = None
    if rule_id:
        rule_check = supabase.table("match_rules").select("source_object").eq("id", rule_id).single().execute()
        if rule_check.data:
            source_object = _normalize_source_object(rule_check.data.get("source_object")) or "contacts"
            if source_object.startswith("custom_objects."):
                is_custom_object = True
                schema_key = source_object  # Use full key
            elif source_object == "companies":
                is_company = True
            elif source_object == "opportunities":
                is_opportunity = True

    is_contact = source_object == "contacts"
    is_non_contact_object = is_custom_object or is_company or is_opportunity
    logger.info(
        f"Merge source_object: {source_object}, "
        f"is_custom_object={is_custom_object}, is_company={is_company}, is_opportunity={is_opportunity}"
    )

    # Block truly unsupported object types
    if not (is_contact or is_non_contact_object):
        raise ValueError(
            f"Merging '{source_object}' is not supported. "
            "Supported types: contacts, companies, opportunities, custom_objects.*"
        )

    # ── Re-fetch both records from GHL as a safety net ────────────────────
    # This ensures we merge using the latest data, not a stale snapshot.
    try:
        async with GHLClient(access_token, ghl_location_id) as prefetch_client:
            fresh_a = None
            fresh_b = None

            if is_custom_object:
                try:
                    schema = await prefetch_client.get_object_schema(schema_key, fetch_properties=False)
                    primary_display = schema.get("primaryDisplayProperty") or ""
                    source_display_field = _extract_custom_object_field_key(primary_display)
                    if source_display_field:
                        logger.info(f"Resolved custom object display field: {source_display_field}")
                except Exception:
                    logger.warning("Could not resolve custom object display field")

                # Fetch custom object records
                try:
                    fresh_a_resp = await prefetch_client.get_custom_object_record(schema_key, record_a_id)
                    record_data = fresh_a_resp.get("record", fresh_a_resp)
                    props = record_data.get("properties") or {}
                    fresh_a = {
                        "id": record_data.get("id"),
                        "dateAdded": record_data.get("createdAt"),
                        "dateUpdated": record_data.get("updatedAt"),
                        "_raw": record_data,
                        **props,
                    }
                except httpx.HTTPStatusError as e:
                    if e.response.status_code == 404:
                        supabase.table("match_pairs").update({"status": "stale"}).eq("id", match_id).execute()
                        raise ValueError(
                            f"Custom object record {record_a_id} no longer exists in your CRM. "
                            "The match has been marked as stale."
                        )
                    raise

                try:
                    fresh_b_resp = await prefetch_client.get_custom_object_record(schema_key, record_b_id)
                    record_data = fresh_b_resp.get("record", fresh_b_resp)
                    props = record_data.get("properties") or {}
                    fresh_b = {
                        "id": record_data.get("id"),
                        "dateAdded": record_data.get("createdAt"),
                        "dateUpdated": record_data.get("updatedAt"),
                        "_raw": record_data,
                        **props,
                    }
                except httpx.HTTPStatusError as e:
                    if e.response.status_code == 404:
                        supabase.table("match_pairs").update({"status": "stale"}).eq("id", match_id).execute()
                        raise ValueError(
                            f"Custom object record {record_b_id} no longer exists in your CRM. "
                            "The match has been marked as stale."
                        )
                    raise
            elif is_company:
                try:
                    fresh_a_resp = await prefetch_client.get_company(record_a_id)
                    fresh_a = fresh_a_resp.get("business", fresh_a_resp)
                except httpx.HTTPStatusError as e:
                    if e.response.status_code == 404:
                        supabase.table("match_pairs").update({"status": "stale"}).eq("id", match_id).execute()
                        raise ValueError(
                            f"Company {record_a_id} no longer exists in your CRM. "
                            "The match has been marked as stale."
                        )
                    raise

                try:
                    fresh_b_resp = await prefetch_client.get_company(record_b_id)
                    fresh_b = fresh_b_resp.get("business", fresh_b_resp)
                except httpx.HTTPStatusError as e:
                    if e.response.status_code == 404:
                        supabase.table("match_pairs").update({"status": "stale"}).eq("id", match_id).execute()
                        raise ValueError(
                            f"Company {record_b_id} no longer exists in your CRM. "
                            "The match has been marked as stale."
                        )
                    raise
            elif is_opportunity:
                try:
                    fresh_a_resp = await prefetch_client.get_opportunity(record_a_id)
                    fresh_a = fresh_a_resp.get("opportunity", fresh_a_resp)
                except httpx.HTTPStatusError as e:
                    if e.response.status_code == 404:
                        supabase.table("match_pairs").update({"status": "stale"}).eq("id", match_id).execute()
                        raise ValueError(
                            f"Opportunity {record_a_id} no longer exists in your CRM. "
                            "The match has been marked as stale."
                        )
                    raise

                try:
                    fresh_b_resp = await prefetch_client.get_opportunity(record_b_id)
                    fresh_b = fresh_b_resp.get("opportunity", fresh_b_resp)
                except httpx.HTTPStatusError as e:
                    if e.response.status_code == 404:
                        supabase.table("match_pairs").update({"status": "stale"}).eq("id", match_id).execute()
                        raise ValueError(
                            f"Opportunity {record_b_id} no longer exists in your CRM. "
                            "The match has been marked as stale."
                        )
                    raise
            else:
                # Fetch contacts
                try:
                    fresh_a_resp = await prefetch_client.get_contact(record_a_id)
                    fresh_a = fresh_a_resp.get("contact", fresh_a_resp)
                except httpx.HTTPStatusError as e:
                    if e.response.status_code == 404:
                        supabase.table("match_pairs").update({"status": "stale"}).eq("id", match_id).execute()
                        raise ValueError(
                            f"Contact {record_a_id} no longer exists in your CRM. "
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
                            f"Contact {record_b_id} no longer exists in your CRM. "
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
                logger.info("Refreshed both record snapshots from GHL before merge")

                # Re-validate the pair still matches
                if rule_id:
                    rule_check = supabase.table("match_rules").select(
                        "match_fields, review_threshold"
                    ).eq("id", rule_id).single().execute()

                    if rule_check.data:
                        match_fields = rule_check.data.get("match_fields", [])
                        review_threshold = float(rule_check.data.get("review_threshold", 0.70)) * 100

                        if match_fields:
                            # Skip re-validation if all match fields have empty field IDs
                            # (safety net for rules corrupted by the field selector bug)
                            usable_fields = [f for f in match_fields if f.get("field")]
                            if not usable_fields:
                                logger.warning(
                                    "Skipping re-validation: no usable field IDs in match_fields"
                                )
                            else:
                                logger.info(
                                    "Re-validating candidate pair before merge (fields=%d)",
                                    len(usable_fields),
                                )

                                is_match, confidence, _field_scores = compare_records(
                                    record_a_data, record_b_data, match_fields
                                )
                                logger.info(
                                    "Re-validation result: is_match=%s, confidence=%.1f",
                                    is_match,
                                    confidence,
                                )
                                if not is_match or confidence < review_threshold:
                                    supabase.table("match_pairs").update({
                                        "status": "stale",
                                        "confidence_score": confidence / 100,
                                    }).eq("id", match_id).execute()
                                    raise ValueError(
                                        f"These records no longer match after re-validation "
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
                logger.warning("Could not refresh record data from GHL, using stored snapshots")

    except ValueError:
        # Re-raise validation errors (stale, deleted, no longer matching)
        raise
    except Exception:
        # Non-critical: if the pre-fetch fails for other reasons, proceed with snapshots
        logger.warning("Pre-merge record refresh failed, using stored snapshots")
        record_a_data = match.data.get("record_a_data", {})
        record_b_data = match.data.get("record_b_data", {})

    # Fetch rule settings once (used for strategy auto-compute, field preservation, and related records)
    rule_merge_settings: dict = {}
    rule_merge_strategy = "standard"
    rule_match_fields: List[dict] = []
    if rule_id:
        rule_result = supabase.table("match_rules").select(
            "merge_settings, merge_strategy, match_fields"
        ).eq("id", rule_id).single().execute()
        if rule_result.data:
            rule_merge_settings = rule_result.data.get("merge_settings") or {}
            rule_merge_strategy = rule_result.data.get("merge_strategy") or "standard"
            rule_match_fields = rule_result.data.get("match_fields") or []

    overwrite_blanks = rule_merge_settings.get("overwrite_blanks", False)

    # Auto-compute field_selections from strategy if not provided
    if not field_selections:
        auto_fields = None
        if is_non_contact_object:
            auto_fields = _derive_dynamic_fields(
                record_a_data,
                record_b_data,
                NON_CONTACT_DYNAMIC_EXCLUDE_FIELDS if not is_custom_object else NON_MUTABLE_RECORD_FIELDS,
            )

        field_selections = compute_strategy_selections(
            strategy=rule_merge_strategy,
            record_a=record_a_data,
            record_b=record_b_data,
            overwrite_blanks=overwrite_blanks,
            fields=auto_fields,
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

    # Build master record name using the winning field values
    merged_name_data = {**master_data, **merged_fields}
    master_record_name = _build_record_name(
        merged_name_data,
        master_record_id,
        match_fields=rule_match_fields,
        display_field=source_display_field,
    )

    # For opportunities, translate "contact" selection into "contactId"
    if is_opportunity and "contact" in field_selections:
        contact_source = field_selections["contact"]
        if contact_source == "a":
            selected_contact_id = record_a_data.get("contactId")
        elif contact_source == "b":
            selected_contact_id = record_b_data.get("contactId")
        else:
            selected_contact_id = None
        if selected_contact_id:
            merged_fields["contactId"] = selected_contact_id
        merged_fields.pop("contact", None)

    # Company custom fields can't go through the business API (returns
    # "customFields not supported yet"), so we collect them here and send
    # them via the Objects API after the main company update.
    company_preserved_properties: dict = {}

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
            # For custom objects, fields are top-level properties, not in customFields array
            # For contacts/companies/opportunities, use the customFields array format
            if is_custom_object:
                for mapping in mappings:
                    source_field = mapping.get("source")
                    target_field = mapping.get("target")

                    if not source_field or not target_field:
                        continue

                    value_to_preserve = mapping.get("value")
                    if value_to_preserve is None:
                        value_to_preserve = duplicate_data.get(source_field)

                    if value_to_preserve:
                        merged_fields[target_field] = value_to_preserve
                        logger.info(
                            "Preserving alternate value mapping from '%s' to '%s'",
                            source_field,
                            target_field,
                        )
            elif is_company:
                # Companies don't support customFields on the business API;
                # collect for a separate Objects API call after the main update.
                for mapping in mappings:
                    source_field = mapping.get("source")
                    target_field = mapping.get("target")

                    if not source_field or not target_field:
                        continue

                    value_to_preserve = mapping.get("value")
                    if value_to_preserve is None:
                        value_to_preserve = duplicate_data.get(source_field)

                    if value_to_preserve:
                        company_preserved_properties[target_field] = value_to_preserve
                        logger.info(
                            "Preserving company custom field from '%s' to '%s' (via Objects API)",
                            source_field,
                            target_field,
                        )
            else:
                custom_fields = merged_fields.get("customFields", [])
                if not isinstance(custom_fields, list):
                    custom_fields = []

                for mapping in mappings:
                    source_field = mapping.get("source")
                    target_field = mapping.get("target")

                    if not source_field or not target_field:
                        continue

                    # Use provided value if available (computed based on field selections),
                    # otherwise fall back to duplicate's value for backwards compatibility
                    value_to_preserve = mapping.get("value")
                    if value_to_preserve is None:
                        value_to_preserve = duplicate_data.get(source_field)

                    # Only preserve if there's a non-empty value
                    if value_to_preserve:
                        # Contacts use GHL field IDs ("id"), while opportunities
                        # use property keys ("key") for custom field identification.
                        if is_contact:
                            custom_fields.append({
                                "id": target_field,
                                "field_value": value_to_preserve,
                            })
                        else:
                            custom_fields.append({
                                "key": target_field,
                                "field_value": value_to_preserve,
                            })
                        logger.info(
                            "Preserving alternate custom field mapping from '%s' to '%s'",
                            source_field,
                            target_field,
                        )

                if custom_fields:
                    merged_fields["customFields"] = custom_fields

    logger.info(f"Merging {duplicate_id} into {master_record_id}")
    logger.info(f"Field selections: {field_selections}")
    logger.info(
        "Merge payload prepared (selected_fields=%d, preserve_alternates=%s)",
        len(merged_fields),
        preserve_alternates,
    )

    # Create merge record BEFORE making changes
    merge_id = str(uuid.uuid4())
    merge_data = {
        "id": merge_id,
        "tenant_id": tenant_id,
        "location_id": internal_location_id,
        "match_pair_id": match_id,
        "master_record_id": master_record_id,
        "master_record_name": master_record_name,
        # Persist immutable object context for rollback.
        "master_record_type": source_object,
        "duplicate_record_id": duplicate_id,
        "field_selections": field_selections,
        "status": "pending",
    }

    supabase.table("merges").insert(merge_data).execute()

    # Store snapshots in the snapshots table for rollback (plan-based window)
    plan_features = get_plan_features(plan)
    expires_at = (datetime.utcnow() + timedelta(days=plan_features.rollback_days)).isoformat()
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

    # Get related records configuration from rule's merge_settings (already fetched above)
    related_records_config = rule_merge_settings.get("related_records", {})

    try:
        async with GHLClient(access_token, ghl_location_id) as client:
            # Snapshot related data before deleting duplicate:
            # - contacts: notes/tasks/opportunities/appointments
            # - companies/opportunities/custom objects: associations
            duplicate_notes = []
            duplicate_tasks = []
            duplicate_opps = []
            duplicate_appointments = []
            duplicate_associations = []

            if is_contact:
                try:
                    duplicate_notes = await client.get_contact_notes(duplicate_id)
                    logger.info(f"Snapshotted {len(duplicate_notes)} notes from duplicate")
                except Exception:
                    logger.warning("Failed to snapshot notes")

                try:
                    duplicate_tasks = await client.get_contact_tasks(duplicate_id)
                    logger.info(f"Snapshotted {len(duplicate_tasks)} tasks from duplicate")
                except Exception:
                    logger.warning("Failed to snapshot tasks")

                try:
                    duplicate_opps = await client.get_contact_opportunities(duplicate_id)
                    logger.info(f"Snapshotted {len(duplicate_opps)} opportunities from duplicate")
                except Exception:
                    logger.warning("Failed to snapshot opportunities")

                try:
                    duplicate_appointments = await client.get_contact_appointments(duplicate_id)
                    logger.info(f"Snapshotted {len(duplicate_appointments)} appointments from duplicate")
                except Exception:
                    logger.warning("Failed to snapshot appointments")
            else:
                try:
                    duplicate_associations = await client.get_relations_for_record(
                        duplicate_id,
                        fail_on_error=True,
                    )
                    if not isinstance(duplicate_associations, list):
                        raise ValueError("Associations snapshot payload was not a list")
                    logger.info(
                        f"Snapshotted {len(duplicate_associations)} associations from duplicate {source_object} record"
                    )
                except Exception:
                    # Non-contact rollback fidelity depends on association snapshots.
                    raise RuntimeError(
                        f"Failed to snapshot {source_object} associations for rollback safety."
                    )

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
            if duplicate_associations:
                related_snapshots.append({
                    "id": str(uuid.uuid4()),
                    "merge_id": merge_id,
                    "record_id": duplicate_id,
                    "record_type": "duplicate_associations",
                    "data": {"associations": duplicate_associations},
                    "expires_at": expires_at,
                })

            if related_snapshots:
                supabase.table("snapshots").insert(related_snapshots).execute()
                logger.info(f"Saved {len(related_snapshots)} related record snapshots")

            # Update master record with merged fields
            if is_custom_object:
                update_properties = _build_payload(
                    merged_fields,
                    overwrite_blanks=overwrite_blanks,
                    excluded_fields=NON_MUTABLE_RECORD_FIELDS,
                )

                if update_properties:
                    logger.info(
                        "Updating master custom object %s (%d fields)",
                        master_record_id,
                        len(update_properties),
                    )
                    await client.update_custom_object_record(schema_key, master_record_id, update_properties)
            elif is_company:
                update_payload = _build_payload(
                    merged_fields,
                    overwrite_blanks=overwrite_blanks,
                    excluded_fields=NON_MUTABLE_RECORD_FIELDS,
                )
                if update_payload:
                    logger.info(
                        "Updating master company %s (%d fields)",
                        master_record_id,
                        len(update_payload),
                    )
                    await client.update_company(master_record_id, update_payload)
                # Company custom fields must go through Objects API
                # (business API doesn't support them)
                if company_preserved_properties:
                    await client.update_custom_object_record(
                        "business", master_record_id, company_preserved_properties
                    )
                    logger.info(
                        "Preserved %d company custom field(s) via Objects API",
                        len(company_preserved_properties),
                    )
            elif is_opportunity:
                update_payload = _build_payload(
                    merged_fields,
                    overwrite_blanks=overwrite_blanks,
                    allowed_fields=OPPORTUNITY_ALLOWED_FIELDS,
                )
                if update_payload:
                    logger.info(
                        "Updating master opportunity %s (%d fields)",
                        master_record_id,
                        len(update_payload),
                    )
                    await client.update_opportunity(master_record_id, update_payload)
            else:
                update_payload = _build_payload(
                    merged_fields,
                    overwrite_blanks=overwrite_blanks,
                    allowed_fields=CONTACT_ALLOWED_UPDATE_FIELDS,
                )
                if update_payload:
                    logger.info(
                        "Updating master contact %s (%d fields)",
                        master_record_id,
                        len(update_payload),
                    )
                    await client.update_contact(master_record_id, update_payload)

            # Handle related records BEFORE deleting duplicate (contacts only)
            if is_contact and related_records_config:
                logger.info(f"Processing related records: {related_records_config}")

                # Handle Notes
                notes_handling = related_records_config.get("notes")
                if notes_handling == "copy_to_master":
                    try:
                        notes_copied = await client.reassign_contact_notes(duplicate_id, master_record_id)
                        logger.info(f"Copied {notes_copied} notes to master")
                    except Exception:
                        logger.warning("Failed to copy notes")

                # Handle Tasks
                tasks_handling = related_records_config.get("tasks")
                if tasks_handling == "copy_to_master":
                    try:
                        tasks_copied = await client.reassign_contact_tasks(duplicate_id, master_record_id)
                        logger.info(f"Copied {tasks_copied} tasks to master")
                    except Exception:
                        logger.warning("Failed to copy tasks")

                # Handle Opportunities
                opps_handling = related_records_config.get("opportunities")
                if opps_handling and opps_handling != "dont_copy":
                    try:
                        if opps_handling == "custom_logic":
                            custom_logic = related_records_config.get("opportunities_custom_logic", {})
                            opps_reassigned = await reassign_opportunities_with_custom_logic(
                                client, duplicate_id, master_record_id, custom_logic
                            )
                        else:
                            opps_reassigned = await client.reassign_contact_opportunities(
                                duplicate_id, master_record_id, handling=opps_handling
                            )
                        logger.info(f"Reassigned {opps_reassigned} opportunities to master")
                    except Exception:
                        logger.warning("Failed to reassign opportunities")

            # Delete the duplicate record
            if is_custom_object:
                logger.info(f"Deleting duplicate custom object {duplicate_id}")
                await client.delete_custom_object_record(schema_key, duplicate_id)
            elif is_company:
                logger.info(f"Deleting duplicate company {duplicate_id}")
                await client.delete_company(duplicate_id)
            elif is_opportunity:
                logger.info(f"Deleting duplicate opportunity {duplicate_id}")
                await client.delete_opportunity(duplicate_id)
            else:
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

        # Clean up OTHER match_pairs that reference the deleted duplicate record.
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
            logger.info(f"Marked {stale_count} other match_pairs as stale (referenced deleted record {duplicate_id})")

        logger.info(f"Merge {merge_id} completed successfully")

        # Force garbage collection to free memory after each merge
        gc.collect()

        return {
            "id": merge_id,
            "status": "completed",
            "master_record_id": master_record_id,
            "duplicate_record_id": duplicate_id,
            "fields_merged": list(merged_fields.keys()),
        }

    except httpx.HTTPStatusError as e:
        status_code = e.response.status_code if e.response is not None else "unknown"
        response_body = e.response.text[:500] if e.response is not None else "no response"
        logger.error("Merge failed due to upstream API error (status=%s): %s", status_code, response_body)
        supabase.table("merges").update({
            "status": "failed",
            "error_message": f"Upstream API error (status={status_code})",
        }).eq("id", merge_id).execute()
        raise
    except Exception:
        logger.error("Merge failed due to internal error")
        supabase.table("merges").update({
            "status": "failed",
            "error_message": "Internal merge error",
        }).eq("id", merge_id).execute()
        raise


# Backward-compatible alias used in rollback logic.
ALLOWED_CREATE_FIELDS = CONTACT_ALLOWED_CREATE_FIELDS


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

    merge_status = merge.data.get("status")
    if merge_status in ("rolled_back", "rolled_back_partial"):
        raise ValueError("Merge already rolled back")
    if merge_status != "completed":
        raise ValueError(
            f"Rollback is only allowed for completed merges. Current status: {merge_status}"
        )

    # Get all snapshots for this merge
    snapshots = supabase.table("snapshots").select("*").eq("merge_id", merge_id).execute()
    master_snapshot = None
    duplicate_snapshot = None
    notes_snapshot = None
    tasks_snapshot = None
    opps_snapshot = None
    appointments_snapshot = None
    associations_snapshot = None

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
        elif record_type == "duplicate_associations":
            association_data = snapshot.get("data", {})
            if isinstance(association_data, dict):
                associations_snapshot = association_data.get("associations", [])
            elif isinstance(association_data, list):
                # Backward compatibility if associations were stored as a raw list
                associations_snapshot = association_data

    if not duplicate_snapshot:
        raise ValueError("No snapshot available for rollback")

    # Check if rollback window has expired
    for snapshot in snapshots.data or []:
        expires_at = snapshot.get("expires_at")
        if expires_at:
            try:
                expiry_time = datetime.fromisoformat(expires_at.replace("Z", "+00:00"))
                if expiry_time < datetime.now(expiry_time.tzinfo):
                    raise ValueError("Rollback window has expired. Snapshots have been deleted.")
            except ValueError as e:
                error_text = e.args[0] if e.args else ""
                if isinstance(error_text, str) and "Rollback window" in error_text:
                    raise
                # Parse error - continue without expiration check
                pass
            break  # Only need to check one snapshot

    # Determine object type from immutable merge context. Fallback to rule only for legacy merges.
    match_pair_id = merge.data.get("match_pair_id")
    source_object = _normalize_source_object(merge.data.get("master_record_type"))
    if not source_object and match_pair_id:
        match_pair = supabase.table("match_pairs").select("rule_id").eq("id", match_pair_id).single().execute()
        if match_pair.data and match_pair.data.get("rule_id"):
            rule_check = supabase.table("match_rules").select("source_object").eq("id", match_pair.data["rule_id"]).single().execute()
            if rule_check.data:
                source_object = _normalize_source_object(rule_check.data.get("source_object"))
    if not source_object:
        raise ValueError("Rollback object context is missing; this merge cannot be safely rolled back.")

    is_custom_object = source_object.startswith("custom_objects.")
    is_company = source_object == "companies"
    is_opportunity = source_object == "opportunities"
    schema_key = source_object if is_custom_object else None

    is_contact = source_object == "contacts"
    is_non_contact_object = is_custom_object or is_company or is_opportunity

    logger.info(f"Rolling back merge {merge_id} (source_object: {source_object})")

    # Block truly unsupported object types
    if not (is_contact or is_non_contact_object):
        raise ValueError(
            f"Rolling back '{source_object}' merges is not supported. "
            "Supported types: contacts, companies, opportunities, custom_objects.*"
        )

    logger.info(f"Restoring duplicate record from snapshot")
    if is_contact:
        logger.info(f"Related records to restore: {len(notes_snapshot or [])} notes, {len(tasks_snapshot or [])} tasks, {len(opps_snapshot or [])} opportunities, {len(appointments_snapshot or [])} appointments")
    else:
        logger.info(f"Associations to restore: {len(associations_snapshot or [])}")

    try:
        partial_failures: List[str] = []

        async with GHLClient(access_token, ghl_location_id) as client:
            if is_custom_object:
                restore_properties = _extract_custom_object_properties(duplicate_snapshot)
                logger.info(
                    "Creating custom object record from snapshot (%d fields)",
                    len(restore_properties),
                )
                restored_record = await client.create_custom_object_record(schema_key, restore_properties)
                restored_id = _extract_id_from_response(
                    restored_record,
                    [
                        ("id",),
                        ("record", "id"),
                        ("customObjectRecord", "id"),
                        ("data", "id"),
                    ],
                )
                logger.info(f"Restored custom object record created with ID: {restored_id}")
            elif is_company:
                restore_data = _build_payload(
                    duplicate_snapshot,
                    overwrite_blanks=False,
                    allowed_fields=COMPANY_ALLOWED_FIELDS,
                    excluded_fields=NON_MUTABLE_RECORD_FIELDS | {"customFields"},
                )
                logger.info("Creating company from snapshot (%d fields)", len(restore_data))
                restored_company = await client.create_company(restore_data)
                restored_id = _extract_id_from_response(
                    restored_company,
                    [
                        ("id",),
                        ("business", "id"),
                        ("company", "id"),
                        ("record", "id"),
                    ],
                )
                logger.info(f"Restored company created with ID: {restored_id}")
                if restored_id:
                    dup_cf = (duplicate_snapshot or {}).get("customFields") or []
                    dup_custom_props = {
                        f["key"]: f.get("valueString", f.get("value"))
                        for f in dup_cf if f.get("key") and f.get("valueString", f.get("value")) is not None
                    }
                    if dup_custom_props:
                        try:
                            await client.update_custom_object_record("business", restored_id, dup_custom_props)
                            logger.info("Restored %d custom field(s) on duplicate company %s", len(dup_custom_props), restored_id)
                        except Exception:
                            partial_failures.append("Failed to restore custom fields on duplicate company.")
                            logger.warning("Failed to restore custom fields on duplicate company %s", restored_id)
            elif is_opportunity:
                restore_data = _build_payload(
                    duplicate_snapshot,
                    overwrite_blanks=False,
                    allowed_fields=OPPORTUNITY_ALLOWED_FIELDS,
                    excluded_fields=NON_CONTACT_DYNAMIC_EXCLUDE_FIELDS,
                )
                logger.info("Creating opportunity from snapshot (%d fields)", len(restore_data))
                restored_opportunity = await client.create_opportunity(restore_data)
                restored_id = _extract_id_from_response(
                    restored_opportunity,
                    [
                        ("id",),
                        ("opportunity", "id"),
                        ("record", "id"),
                        ("data", "id"),
                    ],
                )
                logger.info(f"Restored opportunity created with ID: {restored_id}")
            else:
                restore_data = _build_payload(
                    duplicate_snapshot,
                    overwrite_blanks=False,
                    allowed_fields=ALLOWED_CREATE_FIELDS,
                )
                restore_data["locationId"] = ghl_location_id

                logger.info("Creating contact from snapshot (%d fields)", len(restore_data))
                restored_contact = await client.create_contact(restore_data)
                restored_id = _extract_id_from_response(
                    restored_contact,
                    [
                        ("contact", "id"),
                        ("id",),
                        ("record", "id"),
                    ],
                )
                logger.info(f"Restored contact created with ID: {restored_id}")

            if not restored_id:
                raise ValueError("Rollback failed: CRM did not return a restored record ID.")

            # Restore related records on the recreated contact (contacts only)
            notes_restored = 0
            tasks_restored = 0
            opps_restored = 0
            appointments_restored = 0

            if is_contact:
                # Restore notes
                if notes_snapshot and restored_id:
                    for note in notes_snapshot:
                        body = note.get("body", "")
                        if body:
                            try:
                                await client.create_contact_note(restored_id, body)
                                notes_restored += 1
                            except Exception:
                                partial_failures.append("Failed to restore note.")
                                logger.warning("Failed to restore note")
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
                            except Exception:
                                partial_failures.append("Failed to restore task.")
                                logger.warning("Failed to restore task")
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
                            except Exception:
                                partial_failures.append("Failed to restore opportunity.")
                                logger.warning("Failed to restore opportunity")
                    logger.info(f"Restored {opps_restored}/{len(opps_snapshot)} opportunities")

                # Restore appointments by reassigning them back to restored contact
                if appointments_snapshot and restored_id:
                    for appt in appointments_snapshot:
                        appt_id = appt.get("id")
                        if appt_id:
                            try:
                                await client.update_appointment(appt_id, {"contactId": restored_id})
                                appointments_restored += 1
                            except Exception:
                                partial_failures.append("Failed to restore appointment.")
                                logger.warning("Failed to restore appointment")
                    logger.info(f"Restored {appointments_restored}/{len(appointments_snapshot)} appointments")
            else:
                if associations_snapshot is None:
                    logger.info("No duplicate_associations snapshot found; likely no associations existed at merge time.")

            if not is_contact and associations_snapshot and restored_id:
                relations_restored = 0
                old_duplicate_id = merge.data.get("duplicate_record_id")

                for relation in associations_snapshot:
                    if not isinstance(relation, dict):
                        partial_failures.append("Malformed association snapshot row skipped.")
                        logger.warning("Skipping malformed association snapshot row")
                        continue

                    source_object_key = relation.get("firstObjectKey") or relation.get("sourceObjectKey")
                    source_record_id = relation.get("firstRecordId") or relation.get("sourceRecordId")
                    target_object_key = relation.get("secondObjectKey") or relation.get("targetObjectKey")
                    target_record_id = relation.get("secondRecordId") or relation.get("targetRecordId")
                    association_id = relation.get("associationId")
                    pipeline_id = relation.get("pipelineId")

                    if old_duplicate_id:
                        if source_record_id == old_duplicate_id:
                            source_record_id = restored_id
                        if target_record_id == old_duplicate_id:
                            target_record_id = restored_id

                    # Safety check: only restore relations tied to the recreated duplicate
                    if restored_id not in (source_record_id, target_record_id):
                        partial_failures.append(
                            "Association restore skipped because restored duplicate ID was absent."
                        )
                        logger.warning("Skipping association restore: duplicate record not present")
                        continue

                    if not all(
                        [
                            source_object_key,
                            source_record_id,
                            target_object_key,
                            target_record_id,
                            association_id,
                        ]
                    ):
                        partial_failures.append("Association restore skipped due to missing required fields.")
                        logger.warning("Skipping association restore due to missing required fields")
                        continue

                    try:
                        await client.create_relation(
                            source_object_key=source_object_key,
                            source_record_id=source_record_id,
                            target_object_key=target_object_key,
                            target_record_id=target_record_id,
                            association_id=association_id,
                            pipeline_id=pipeline_id,
                        )
                        relations_restored += 1
                    except Exception as exc:
                        if "duplicate relation" in str(exc).lower():
                            relations_restored += 1
                            logger.info("Association already exists (duplicate); counting as restored")
                        else:
                            partial_failures.append("Failed to restore association.")
                            logger.warning("Failed to restore association")

                logger.info(f"Restored {relations_restored}/{len(associations_snapshot)} associations")

            # Restore master record to its original state
            if master_snapshot:
                master_record_id = merge.data.get("master_record_id")
                if master_record_id:
                    if is_custom_object:
                        restore_properties = _extract_custom_object_properties(master_snapshot)
                        if restore_properties:
                            master_restored = False
                            for attempt in range(2):
                                try:
                                    await client.update_custom_object_record(schema_key, master_record_id, restore_properties)
                                    logger.info(f"Restored master custom object {master_record_id} to original state")
                                    master_restored = True
                                    break
                                except Exception as exc:
                                    logger.warning("Master restore attempt %d failed: %s", attempt + 1, exc)
                                    if attempt < 1:
                                        await asyncio.sleep(2)
                            if not master_restored:
                                partial_failures.append("Failed to restore master custom object.")
                    elif is_company:
                        restore_master_data = _build_payload(
                            master_snapshot,
                            overwrite_blanks=False,
                            allowed_fields=COMPANY_ALLOWED_FIELDS,
                            excluded_fields=NON_MUTABLE_RECORD_FIELDS | {"customFields"},
                        )
                        if restore_master_data:
                            try:
                                await client.update_company(master_record_id, restore_master_data)
                                logger.info(f"Restored master company {master_record_id} to original state")
                            except Exception as exc:
                                partial_failures.append("Failed to restore master company.")
                                logger.warning("Failed to restore master record: %s", exc)
                        master_cf = (master_snapshot or {}).get("customFields") or []
                        master_custom_props = {
                            f["key"]: f.get("valueString", f.get("value"))
                            for f in master_cf if f.get("key") and f.get("valueString", f.get("value")) is not None
                        }
                        if master_custom_props:
                            try:
                                await client.update_custom_object_record("business", master_record_id, master_custom_props)
                                logger.info("Restored %d custom field(s) on master company %s", len(master_custom_props), master_record_id)
                            except Exception as exc:
                                partial_failures.append("Failed to restore master company custom fields.")
                                logger.warning("Failed to restore custom fields on master company %s: %s", master_record_id, exc)
                    elif is_opportunity:
                        restore_master_data = _build_payload(
                            master_snapshot,
                            overwrite_blanks=False,
                            allowed_fields=OPPORTUNITY_ALLOWED_FIELDS,
                            excluded_fields=NON_CONTACT_DYNAMIC_EXCLUDE_FIELDS,
                        )
                        if restore_master_data:
                            try:
                                await client.update_opportunity(master_record_id, restore_master_data)
                                logger.info(f"Restored master opportunity {master_record_id} to original state")
                            except Exception as exc:
                                partial_failures.append("Failed to restore master opportunity.")
                                logger.warning("Failed to restore master record: %s", exc)
                    else:
                        restore_master_data = _build_payload(
                            master_snapshot,
                            overwrite_blanks=False,
                            allowed_fields=CONTACT_ALLOWED_UPDATE_FIELDS,
                        )
                        if restore_master_data:
                            try:
                                await client.update_contact(master_record_id, restore_master_data)
                                logger.info(f"Restored master record {master_record_id} to original state")
                            except Exception as exc:
                                partial_failures.append("Failed to restore master contact.")
                                logger.warning("Failed to restore master record: %s", exc)
            else:
                partial_failures.append("Master snapshot missing; master record state was not restored.")

        final_status = "rolled_back" if not partial_failures else "rolled_back_partial"
        merge_update_payload: Dict[str, Any] = {
            "status": final_status,
            "rolled_back_at": datetime.utcnow().isoformat(),
            "restored_record_id": restored_id,
        }
        if partial_failures:
            preview = "; ".join(partial_failures[:5])
            if len(partial_failures) > 5:
                preview = f"{preview}; ... (+{len(partial_failures) - 5} more)"
            merge_update_payload["error_message"] = preview
        else:
            merge_update_payload["error_message"] = None

        # Update merge status and store restored ID.
        supabase.table("merges").update(merge_update_payload).eq("id", merge_id).execute()

        # Update match pairs that still reference the deleted duplicate ID.
        match_pair_id = merge.data.get("match_pair_id")
        old_duplicate_id = merge.data.get("duplicate_record_id")
        if old_duplicate_id and restored_id:
            related_pairs = (
                supabase.table("match_pairs")
                .select("id, status, record_a_id, record_b_id, record_a_data, record_b_data")
                .eq("location_id", internal_location_id)
                .or_(f"record_a_id.eq.{old_duplicate_id},record_b_id.eq.{old_duplicate_id}")
                .execute()
            )

            remapped_pairs = 0
            for pair in related_pairs.data or []:
                pair_id = pair.get("id")
                if not pair_id:
                    continue

                update_data: Dict[str, Any] = {}
                if pair.get("record_a_id") == old_duplicate_id:
                    update_data["record_a_id"] = restored_id
                    record_data = pair.get("record_a_data")
                    if isinstance(record_data, dict) and _remap_record_payload_id(
                        record_data,
                        old_id=old_duplicate_id,
                        new_id=restored_id,
                    ):
                        update_data["record_a_data"] = record_data

                if pair.get("record_b_id") == old_duplicate_id:
                    update_data["record_b_id"] = restored_id
                    record_data = pair.get("record_b_data")
                    if isinstance(record_data, dict) and _remap_record_payload_id(
                        record_data,
                        old_id=old_duplicate_id,
                        new_id=restored_id,
                    ):
                        update_data["record_b_data"] = record_data

                if pair_id == match_pair_id:
                    update_data["status"] = "pending"

                if update_data:
                    supabase.table("match_pairs").update(update_data).eq("id", pair_id).execute()
                    remapped_pairs += 1

            if remapped_pairs > 0:
                logger.info(
                    "Remapped restored record ID for %d match_pair(s): %s -> %s",
                    remapped_pairs,
                    old_duplicate_id,
                    restored_id,
                )

        logger.info("Rollback %s completed with status=%s", merge_id, final_status)

        return {
            "id": merge_id,
            "status": final_status,
            "restored_record_id": restored_id,
            "partial_failures": partial_failures,
        }

    except Exception:
        logger.error("Rollback failed")
        raise
