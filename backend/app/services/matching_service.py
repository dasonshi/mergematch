"""
Matching engine for duplicate detection.
"""
from typing import List, Dict, Any, Optional
from difflib import SequenceMatcher
import re
import uuid

from app.core.ghl.client import GHLClient
from app.db.supabase import get_supabase


def normalize_phone(phone: str) -> str:
    """Normalize phone to digits only."""
    if not phone:
        return ""
    return re.sub(r"[^\d]", "", phone)


def normalize_email(email: str) -> str:
    """Normalize email to lowercase."""
    if not email:
        return ""
    return email.lower().strip()


def get_email_domain(email: str) -> str:
    """Extract domain from email."""
    if not email or "@" not in email:
        return ""
    return email.split("@")[1].lower()


def fuzzy_match(s1: str, s2: str, threshold: float = 0.85) -> tuple[bool, float]:
    """
    Fuzzy string matching using SequenceMatcher.
    Returns (is_match, similarity_score).
    """
    if not s1 or not s2:
        return False, 0.0

    s1_lower = s1.lower().strip()
    s2_lower = s2.lower().strip()

    ratio = SequenceMatcher(None, s1_lower, s2_lower).ratio()
    return ratio >= threshold, ratio


def exact_match(s1: str, s2: str) -> tuple[bool, float]:
    """Exact string match (case-insensitive)."""
    if not s1 or not s2:
        return False, 0.0

    is_match = s1.lower().strip() == s2.lower().strip()
    return is_match, 1.0 if is_match else 0.0


def phone_match(p1: str, p2: str) -> tuple[bool, float]:
    """Match phone numbers (normalized to digits)."""
    n1 = normalize_phone(p1)
    n2 = normalize_phone(p2)

    if not n1 or not n2:
        return False, 0.0

    # Handle phone numbers with/without country code
    if len(n1) != len(n2):
        # Try matching last 10 digits (US numbers)
        if n1[-10:] == n2[-10:] and len(n1) >= 10 and len(n2) >= 10:
            return True, 0.95

    is_match = n1 == n2
    return is_match, 1.0 if is_match else 0.0


def email_domain_match(e1: str, e2: str) -> tuple[bool, float]:
    """Match email domains."""
    d1 = get_email_domain(e1)
    d2 = get_email_domain(e2)

    if not d1 or not d2:
        return False, 0.0

    is_match = d1 == d2
    return is_match, 1.0 if is_match else 0.0


def get_field_value(record: dict, field: str) -> str:
    """Get field value from a record, handling nested fields and custom fields."""
    if not record:
        return ""

    # Special handling for emailDomain - extract domain from email
    if field == "emailDomain":
        email = record.get("email") or ""
        if isinstance(email, list) and len(email) > 0:
            email = email[0]
        if email and "@" in str(email):
            return str(email).lower().split("@")[1]
        return ""

    # Handle common GHL field mappings
    field_mappings = {
        "email": ["email", "emails"],
        "phone": ["phone", "phoneNumber"],
        "name": ["name", "contactName", "firstName"],
        "firstName": ["firstName", "name"],
        "lastName": ["lastName"],
        "company": ["companyName", "company"],
        "fullName": ["name", "contactName"],
    }

    # Try mapped fields first
    if field in field_mappings:
        for mapped_field in field_mappings[field]:
            value = record.get(mapped_field)
            if value:
                # Handle list fields (like emails)
                if isinstance(value, list) and len(value) > 0:
                    return str(value[0])
                return str(value)

    # Try direct field access
    value = record.get(field)
    if value:
        if isinstance(value, list) and len(value) > 0:
            return str(value[0])
        return str(value)

    # Handle custom fields - GHL stores them in customFields array
    # Each custom field has: {id: "xxx", value: "yyy"} or {key: "xxx", value: "yyy"}
    custom_fields = record.get("customFields", []) or record.get("customField", [])
    if custom_fields:
        # customFields can be a list of {id, value} objects
        if isinstance(custom_fields, list):
            for cf in custom_fields:
                if isinstance(cf, dict):
                    cf_id = cf.get("id") or cf.get("key") or cf.get("fieldKey")
                    if cf_id == field:
                        cf_value = cf.get("value") or cf.get("fieldValue")
                        if cf_value is not None:
                            return str(cf_value)
        # Or it could be a dict with field IDs as keys
        elif isinstance(custom_fields, dict):
            if field in custom_fields:
                return str(custom_fields[field])

    return ""


def compare_records(
    record_a: dict,
    record_b: dict,
    match_fields: List[dict],
) -> tuple[bool, float, dict]:
    """
    Compare two records using the specified match fields.
    Returns (is_match, confidence_score, field_scores).
    """
    field_scores = {}
    total_weight = 0.0
    weighted_score = 0.0
    all_and_fields_match = True
    any_or_field_matches = False

    for field_config in match_fields:
        field = field_config.get("field", "")
        algorithm = field_config.get("algorithm", "exact")
        weight = float(field_config.get("weight", 1.0))
        operator = field_config.get("operator", "AND")
        negate = bool(field_config.get("negate", False))
        match_against = field_config.get("match_against", None)

        val_a = get_field_value(record_a, field)
        # Cross-field matching: compare field on record_a vs match_against on record_b
        val_b = get_field_value(record_b, match_against if match_against else field)

        # Score key for cross-field matching
        score_key = f"{field}_vs_{match_against}" if match_against else field

        # Skip if either value is empty (can't confirm match or NOT match without data)
        if not val_a or not val_b:
            field_scores[score_key] = {"match": False, "score": 0.0, "skipped": True}
            if operator == "AND":
                all_and_fields_match = False
            continue

        # Apply matching algorithm
        if algorithm == "exact":
            is_match, score = exact_match(val_a, val_b)
        elif algorithm == "fuzzy":
            is_match, score = fuzzy_match(val_a, val_b)
        elif algorithm == "fuzzy90":
            is_match, score = fuzzy_match(val_a, val_b, threshold=0.90)
        elif algorithm == "phone":
            is_match, score = phone_match(val_a, val_b)
        elif algorithm == "email_domain":
            is_match, score = email_domain_match(val_a, val_b)
        else:
            # Default to exact
            is_match, score = exact_match(val_a, val_b)

        # Apply negation: flip match result and invert score (backward compat)
        if negate:
            is_match = not is_match
            score = 1.0 - score

        field_scores[score_key] = {"match": is_match, "score": score}

        # Track AND/OR logic
        if operator == "AND":
            if not is_match:
                all_and_fields_match = False
        else:  # OR
            if is_match:
                any_or_field_matches = True

        # Accumulate weighted score
        total_weight += weight
        weighted_score += score * weight

    # Calculate overall confidence
    confidence = (weighted_score / total_weight * 100) if total_weight > 0 else 0.0

    # Determine if it's a match based on logic
    # For now: all AND fields must match, OR any OR field matches
    has_and_fields = any(f.get("operator", "AND") == "AND" for f in match_fields)
    has_or_fields = any(f.get("operator", "AND") == "OR" for f in match_fields)

    if has_and_fields and has_or_fields:
        is_overall_match = all_and_fields_match or any_or_field_matches
    elif has_or_fields:
        is_overall_match = any_or_field_matches
    else:
        is_overall_match = all_and_fields_match

    return is_overall_match, confidence, field_scores


async def run_scan(
    ghl_location_id: str,
    rule_id: str,
    access_token: str,
    tenant_id: str,
    internal_location_id: str,
    limit: int = 1000,
    plan: str = "free",
) -> dict:
    """
    Run a duplicate scan for a given rule.

    Returns dict with matches_found, records_scanned, and match details.
    """
    import logging
    logger = logging.getLogger(__name__)

    supabase = get_supabase()

    # Get the rule configuration
    rule_result = supabase.table("match_rules").select("*").eq(
        "id", rule_id
    ).eq("location_id", internal_location_id).single().execute()

    if not rule_result.data:
        return {"error": "Rule not found", "matches_found": 0, "records_scanned": 0}

    rule = rule_result.data
    match_fields = rule.get("match_fields", [])
    source_object = rule.get("source_object", "contacts")
    review_threshold = float(rule.get("review_threshold", 0.70)) * 100  # Convert to percentage
    auto_merge_threshold = float(rule.get("auto_merge_threshold", 0.95)) * 100

    # Fetch records from GHL
    records = []
    try:
        async with GHLClient(access_token, ghl_location_id) as client:
            if source_object == "contacts":
                result = await client.get_contacts(limit=limit)
                records = result.get("contacts", [])
            elif source_object == "companies":
                result = await client.search_companies(limit=limit)
                records = result.get("companies", [])
    except Exception as e:
        # Extract actual error from RetryError if present
        error_msg = str(e)
        if hasattr(e, 'last_attempt') and e.last_attempt.exception():
            inner_error = e.last_attempt.exception()
            if hasattr(inner_error, 'response'):
                error_msg = f"GHL API error {inner_error.response.status_code}: {inner_error.response.text[:200]}"
            else:
                error_msg = str(inner_error)
        logger.error(f"Failed to fetch {source_object} from GHL: {error_msg}")
        raise Exception(f"GHL API call failed: {error_msg}")

    logger.info(f"Scan: Fetched {len(records)} {source_object}")
    if records:
        # Log sample record structure
        sample = records[0]
        logger.info(f"Sample record keys: {list(sample.keys())}")
        logger.info(f"Sample email field: {sample.get('email')}")
        logger.info(f"Sample phone field: {sample.get('phone')}")

    # Build set of valid contact IDs from GHL response
    valid_contact_ids = {record.get("id") for record in records if record.get("id")}

    # Proactively clean up stale pending match_pairs that reference deleted contacts
    existing_pending = supabase.table("match_pairs").select(
        "id, record_a_id, record_b_id"
    ).eq("rule_id", rule_id).eq("location_id", internal_location_id).eq("status", "pending").execute()

    stale_count = 0
    for match in existing_pending.data:
        record_a_exists = match["record_a_id"] in valid_contact_ids
        record_b_exists = match["record_b_id"] in valid_contact_ids

        if not record_a_exists or not record_b_exists:
            supabase.table("match_pairs").update({"status": "stale"}).eq("id", match["id"]).execute()
            stale_count += 1
            logger.info(f"Marked match {match['id']} as stale - contact(s) no longer exist in GHL")

    if stale_count > 0:
        logger.info(f"Cleaned up {stale_count} stale match pairs during scan")

    if len(records) < 2:
        return {
            "matches_found": 0,
            "matches_stored": 0,
            "stale_cleaned": stale_count,
            "records_scanned": len(records),
            "message": "Not enough records to compare"
        }

    # Compare all pairs
    matches_found = []
    compared_pairs = set()

    for i, record_a in enumerate(records):
        for j, record_b in enumerate(records):
            if i >= j:
                continue

            # Skip already compared pairs
            pair_key = tuple(sorted([record_a.get("id", i), record_b.get("id", j)]))
            if pair_key in compared_pairs:
                continue
            compared_pairs.add(pair_key)

            is_match, confidence, field_scores = compare_records(
                record_a, record_b, match_fields
            )

            # Log some comparisons for debugging
            if len(compared_pairs) <= 5:
                logger.info(f"Comparison {len(compared_pairs)}: is_match={is_match}, confidence={confidence:.1f}%, threshold={review_threshold}")
                logger.info(f"  Field scores: {field_scores}")

            if is_match and confidence >= review_threshold:
                matches_found.append({
                    "record_a": record_a,
                    "record_b": record_b,
                    "confidence": round(confidence, 2),
                    "field_scores": field_scores,
                    "auto_merge": confidence >= auto_merge_threshold,
                })

    # Store matches in database
    stored_matches = []
    for match in matches_found:
        match_id = str(uuid.uuid4())

        match_data = {
            "id": match_id,
            "tenant_id": tenant_id,
            "location_id": internal_location_id,
            "rule_id": rule_id,
            "record_a_id": match["record_a"].get("id", ""),
            "record_a_type": source_object[:-1],  # contacts -> contact
            "record_a_data": match["record_a"],
            "record_b_id": match["record_b"].get("id", ""),
            "record_b_type": source_object[:-1],
            "record_b_data": match["record_b"],
            "confidence_score": match["confidence"] / 100,  # Store as decimal
            "field_scores": match["field_scores"],
            "status": "pending",
        }

        try:
            result = supabase.table("match_pairs").insert(match_data).execute()
            if result.data:
                stored_matches.append(result.data[0])
        except Exception as e:
            # Skip duplicates (same record pair already matched)
            print(f"Error storing match: {e}")

    return {
        "matches_found": len(matches_found),
        "matches_stored": len(stored_matches),
        "stale_cleaned": stale_count,
        "records_scanned": len(records),
        "high_confidence": sum(1 for m in matches_found if m["auto_merge"]),  # Above auto-merge threshold
    }


async def check_single_contact(
    contact_id: str,
    ghl_location_id: str,
    access_token: str,
    tenant_id: str,
    internal_location_id: str,
    rule_id: Optional[str] = None,
    plan: str = "free",
) -> dict:
    """
    Check a single contact for duplicates against all existing contacts.
    Used for real-time duplicate detection in workflows.

    Returns dict with:
        - is_duplicate: bool
        - matches: List of matched contacts with scores
        - best_match: The highest confidence match (if any)
    """
    import logging
    logger = logging.getLogger(__name__)

    supabase = get_supabase()

    # Get rules to check against
    rules_query = supabase.table("match_rules").select("*").eq(
        "location_id", internal_location_id
    ).eq("is_active", True).eq("source_object", "contacts")

    if rule_id:
        rules_query = rules_query.eq("id", rule_id)

    rules_result = rules_query.execute()

    if not rules_result.data:
        return {
            "is_duplicate": False,
            "matches": [],
            "best_match": None,
            "message": "No active rules found for contacts"
        }

    # Fetch the new contact from GHL (fresh data)
    async with GHLClient(access_token, ghl_location_id) as client:
        try:
            new_contact_result = await client.get_contact(contact_id)
            new_contact = new_contact_result.get("contact", new_contact_result)
        except Exception as e:
            logger.error(f"Failed to fetch contact {contact_id}: {e}")
            return {
                "is_duplicate": False,
                "matches": [],
                "best_match": None,
                "error": f"Contact not found: {contact_id}"
            }

        # Fetch ALL existing contacts from GHL (fresh data for consecutive duplicate handling)
        all_contacts_result = await client.get_contacts(limit=10000)
        all_contacts = all_contacts_result.get("contacts", [])

    logger.info(f"Checking contact {contact_id} against {len(all_contacts)} existing contacts")

    # Filter out the new contact itself
    existing_contacts = [c for c in all_contacts if c.get("id") != contact_id]

    all_matches = []

    # Check against each rule
    for rule in rules_result.data:
        match_fields = rule.get("match_fields", [])
        review_threshold = float(rule.get("review_threshold", 0.70)) * 100
        auto_merge_threshold = float(rule.get("auto_merge_threshold", 0.95)) * 100

        # Compare new contact against each existing contact
        for existing in existing_contacts:
            is_match, confidence, field_scores = compare_records(
                new_contact, existing, match_fields
            )

            if is_match and confidence >= review_threshold:
                all_matches.append({
                    "matched_contact_id": existing.get("id"),
                    "matched_contact_data": existing,
                    "confidence_score": round(confidence, 2),
                    "field_scores": field_scores,
                    "auto_merge_eligible": confidence >= auto_merge_threshold and plan != "free",
                    "rule_id": rule["id"],
                    "rule_name": rule.get("name", "Unknown Rule"),
                })

    # Sort by confidence score (highest first)
    all_matches.sort(key=lambda x: x["confidence_score"], reverse=True)

    # Get the best match
    best_match = all_matches[0] if all_matches else None

    return {
        "is_duplicate": len(all_matches) > 0,
        "matches": all_matches,
        "best_match": best_match,
        "contact_data": new_contact,  # Full contact data for merge
        "contact_checked": {
            "id": contact_id,
            "email": new_contact.get("email"),
            "phone": new_contact.get("phone"),
            "name": f"{new_contact.get('firstName', '')} {new_contact.get('lastName', '')}".strip(),
        },
        "contacts_scanned": len(existing_contacts),
    }
