"""
Matching engine for duplicate detection.
"""
from typing import List, Dict, Any, Optional, Set, Tuple
from difflib import SequenceMatcher
import re
import unicodedata
import uuid

from app.core.ghl.client import GHLClient
from app.db.supabase import get_supabase
from app.services.blocking_service import (
    populate_contact_blocks,
    get_candidate_pairs_sql,
    should_use_blocking,
    clear_contact_blocks,
    stream_contacts_to_blocks,
)


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


def strip_accents(s: str) -> str:
    """Remove diacritics/accents from a string (e.g. José → Jose, Muñoz → Munoz)."""
    nfkd = unicodedata.normalize("NFKD", s)
    return "".join(c for c in nfkd if not unicodedata.combining(c))


def fuzzy_match(s1: str, s2: str, threshold: float = 0.85) -> tuple[bool, float]:
    """
    Fuzzy string matching using SequenceMatcher.
    Returns (is_match, similarity_score).
    """
    if not s1 or not s2:
        return False, 0.0

    s1_norm = strip_accents(s1.lower().strip())
    s2_norm = strip_accents(s2.lower().strip())

    ratio = SequenceMatcher(None, s1_norm, s2_norm).ratio()
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
    all_and_fields_match = True
    any_or_field_matches = False

    # First pass: evaluate all fields
    evaluated_fields = []
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

        evaluated_fields.append({
            "operator": operator,
            "weight": weight,
            "score": score,
            "match": is_match,
        })

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

    # Calculate confidence based on which path determined the match.
    # When a mixed AND+OR match is found via the OR path (AND fields failed),
    # failed AND fields should NOT penalize confidence — they aren't why
    # we consider this a match.
    matched_via_and = has_and_fields and all_and_fields_match
    total_weight = 0.0
    weighted_score = 0.0
    for ef in evaluated_fields:
        if ef["operator"] == "AND":
            if matched_via_and:
                # AND fields contributed to the match — include them
                total_weight += ef["weight"]
                weighted_score += ef["score"] * ef["weight"]
            # If match was via OR path, skip failed AND fields
        else:  # OR
            if ef["match"]:
                total_weight += ef["weight"]
                weighted_score += ef["score"] * ef["weight"]

    confidence = (weighted_score / total_weight * 100) if total_weight > 0 else 0.0

    return is_overall_match, confidence, field_scores


async def run_scan(
    ghl_location_id: str,
    rule_id: str,
    access_token: str,
    tenant_id: str,
    internal_location_id: str,
    plan: str = "free",
) -> dict:
    """
    Run a duplicate scan for a given rule.
    Memory-optimized: processes contacts page-by-page and stores matches immediately.

    Returns dict with matches_found, records_scanned, and match details.
    """
    import logging
    import gc
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
    review_threshold = float(rule.get("review_threshold", 0.70)) * 100
    auto_merge_threshold = float(rule.get("auto_merge_threshold", 0.95)) * 100

    # Extract which fields we need for comparison
    needed_fields = {"id"}
    for field_config in match_fields:
        field = field_config.get("field", "")
        if field:
            needed_fields.add(field)
    # Always include common fields for display
    needed_fields.update(["email", "phone", "firstName", "lastName", "name", "companyName"])

    # Track stats
    records_scanned = 0
    matches_found = 0
    matches_stored = 0
    high_confidence_count = 0
    stale_count = 0
    compared_pairs = set()
    valid_contact_ids = set()

    # Check if blocking can be used before fetching
    use_blocking = should_use_blocking(match_fields)

    # Store all contacts with full data for matching and storage
    # We need full data to store in match_pairs for later merge operations
    all_contacts = []

    # If using blocking, clear and prepare for streaming inserts
    if use_blocking:
        clear_contact_blocks(internal_location_id)

    try:
        async with GHLClient(access_token, ghl_location_id) as client:
            if source_object == "contacts":
                start_after_id = None
                page_num = 0
                while True:
                    result = await client.get_contacts(limit=100, start_after_id=start_after_id)
                    page_records = result.get("contacts", [])
                    if not page_records:
                        break

                    page_num += 1
                    records_scanned += len(page_records)

                    for record in page_records:
                        record_id = record.get("id")
                        if record_id:
                            valid_contact_ids.add(record_id)
                            all_contacts.append(record)

                    # Stream to blocking table during fetch if blocking is enabled
                    if use_blocking:
                        stream_contacts_to_blocks(internal_location_id, page_records)

                    logger.info(f"Fetched page {page_num}: {len(page_records)} contacts (total: {records_scanned})")

                    # Periodic GC during fetch to manage memory
                    if page_num % 10 == 0:
                        gc.collect()

                    # Use last contact ID as the startAfterId for next page
                    # GHL API doesn't return meta.startAfterId - we use last record's ID
                    last_contact = page_records[-1] if page_records else None
                    start_after_id = last_contact.get("id") if last_contact else None
                    logger.info(f"Page {page_num} last contact ID: {start_after_id}")
                    if not start_after_id or len(page_records) < 100:
                        break

            elif source_object == "companies":
                result = await client.get_companies()
                page_records = result.get("businesses", [])
                records_scanned = len(page_records)
                for record in page_records:
                    record_id = record.get("id")
                    if record_id:
                        valid_contact_ids.add(record_id)
                        all_contacts.append(record)

                # Stream to blocking table if blocking is enabled
                if use_blocking:
                    stream_contacts_to_blocks(internal_location_id, page_records)

    except Exception as e:
        error_msg = str(e)
        if hasattr(e, 'last_attempt') and e.last_attempt.exception():
            inner_error = e.last_attempt.exception()
            if hasattr(inner_error, 'response'):
                error_msg = f"GHL API error {inner_error.response.status_code}: {inner_error.response.text[:200]}"
            else:
                error_msg = str(inner_error)
        logger.error(f"Failed to fetch {source_object} from GHL: {error_msg}")
        raise Exception(f"GHL API call failed: {error_msg}")

    logger.info(f"Scan: Fetched {len(all_contacts)} {source_object} total")

    if all_contacts:
        sample = all_contacts[0]
        logger.info(f"Sample record keys: {list(sample.keys())[:10]}...")
        logger.info(f"Sample email: {sample.get('email')}, phone: {sample.get('phone')}")

    # Proactively clean up stale pending match_pairs that reference deleted contacts
    existing_pending = supabase.table("match_pairs").select(
        "id, record_a_id, record_b_id"
    ).eq("rule_id", rule_id).eq("location_id", internal_location_id).eq("status", "pending").execute()

    for match in existing_pending.data:
        record_a_exists = match["record_a_id"] in valid_contact_ids
        record_b_exists = match["record_b_id"] in valid_contact_ids

        if not record_a_exists or not record_b_exists:
            supabase.table("match_pairs").update({"status": "stale"}).eq("id", match["id"]).execute()
            stale_count += 1
            logger.info(f"Marked match {match['id']} as stale - contact(s) no longer exist in GHL")

    if stale_count > 0:
        logger.info(f"Cleaned up {stale_count} stale match pairs during scan")

    if len(all_contacts) < 2:
        return {
            "matches_found": 0,
            "matches_stored": 0,
            "stale_cleaned": stale_count,
            "records_scanned": records_scanned,
            "message": "Not enough records to compare"
        }

    # Build lookup dict for full record data (needed for storing matches)
    contacts_by_id = {c.get("id"): c for c in all_contacts}
    total_contacts = len(all_contacts)

    # Determine if we can use blocking optimization
    use_blocking = should_use_blocking(match_fields)

    if use_blocking:
        # BLOCKING-BASED SCAN: O(n) instead of O(n^2)
        logger.info(f"Using blocking optimization for {total_contacts} contacts")

        # Blocking keys already populated during fetch, get candidate pairs
        candidate_pairs = get_candidate_pairs_sql(internal_location_id, match_fields)
        total_pairs = len(candidate_pairs)

        logger.info(f"Blocking reduced pairs from {total_contacts * (total_contacts - 1) // 2} to {total_pairs}")

        # Process candidate pairs in chunks for memory efficiency
        CHUNK_SIZE = 500
        comparison_count = 0

        for chunk_start in range(0, total_pairs, CHUNK_SIZE):
            chunk_end = min(chunk_start + CHUNK_SIZE, total_pairs)
            chunk = candidate_pairs[chunk_start:chunk_end]

            # Process each pair in the chunk
            for id_a, id_b in chunk:
                record_a = contacts_by_id.get(id_a)
                record_b = contacts_by_id.get(id_b)

                if not record_a or not record_b:
                    continue

                # Skip already compared pairs
                pair_key = (id_a, id_b)
                if pair_key in compared_pairs:
                    continue
                compared_pairs.add(pair_key)
                comparison_count += 1

                is_match, confidence, field_scores = compare_records(
                    record_a, record_b, match_fields
                )

                # Log first few comparisons for debugging
                if comparison_count <= 5:
                    logger.info(f"Comparison {comparison_count}: is_match={is_match}, confidence={confidence:.1f}%, threshold={review_threshold}")
                    logger.info(f"  Field scores: {field_scores}")

                if is_match and confidence >= review_threshold:
                    matches_found += 1
                    is_high_confidence = confidence >= auto_merge_threshold
                    if is_high_confidence:
                        high_confidence_count += 1

                    # Store match immediately
                    match_id = str(uuid.uuid4())
                    match_data = {
                        "id": match_id,
                        "tenant_id": tenant_id,
                        "location_id": internal_location_id,
                        "rule_id": rule_id,
                        "record_a_id": id_a,
                        "record_a_type": source_object[:-1],
                        "record_a_data": record_a,
                        "record_b_id": id_b,
                        "record_b_type": source_object[:-1],
                        "record_b_data": record_b,
                        "confidence_score": round(confidence, 2) / 100,
                        "field_scores": field_scores,
                        "status": "pending",
                    }

                    try:
                        result = supabase.table("match_pairs").insert(match_data).execute()
                        if result.data:
                            matches_stored += 1
                    except Exception as e:
                        logger.debug(f"Skipped duplicate match: {e}")

            # Explicit GC after each chunk
            gc.collect()
            logger.info(f"Processed chunk {chunk_start // CHUNK_SIZE + 1}/{(total_pairs + CHUNK_SIZE - 1) // CHUNK_SIZE}, {matches_found} matches found")

    else:
        # FULL SCAN: Compare all pairs (O(n^2)) - required for complex rules
        logger.info(f"Using full scan for {total_contacts} contacts (blocking not applicable)")

        comparison_count = 0
        for i in range(total_contacts):
            record_a = all_contacts[i]
            id_a = record_a.get("id")
            if not id_a:
                continue

            for j in range(i + 1, total_contacts):
                record_b = all_contacts[j]
                id_b = record_b.get("id")
                if not id_b:
                    continue

                # Skip already compared pairs (use IDs only to save memory)
                pair_key = (min(id_a, id_b), max(id_a, id_b))
                if pair_key in compared_pairs:
                    continue
                compared_pairs.add(pair_key)
                comparison_count += 1

                is_match, confidence, field_scores = compare_records(
                    record_a, record_b, match_fields
                )

                # Log first few comparisons for debugging
                if comparison_count <= 5:
                    logger.info(f"Comparison {comparison_count}: is_match={is_match}, confidence={confidence:.1f}%, threshold={review_threshold}")
                    logger.info(f"  Field scores: {field_scores}")

                if is_match and confidence >= review_threshold:
                    matches_found += 1
                    is_high_confidence = confidence >= auto_merge_threshold
                    if is_high_confidence:
                        high_confidence_count += 1

                    # Store match immediately to avoid accumulating in memory
                    match_id = str(uuid.uuid4())
                    match_data = {
                        "id": match_id,
                        "tenant_id": tenant_id,
                        "location_id": internal_location_id,
                        "rule_id": rule_id,
                        "record_a_id": id_a,
                        "record_a_type": source_object[:-1],
                        "record_a_data": contacts_by_id.get(id_a, record_a),
                        "record_b_id": id_b,
                        "record_b_type": source_object[:-1],
                        "record_b_data": contacts_by_id.get(id_b, record_b),
                        "confidence_score": round(confidence, 2) / 100,
                        "field_scores": field_scores,
                        "status": "pending",
                    }

                    try:
                        result = supabase.table("match_pairs").insert(match_data).execute()
                        if result.data:
                            matches_stored += 1
                    except Exception as e:
                        # Skip duplicates (same record pair already matched)
                        logger.debug(f"Skipped duplicate match: {e}")

            # Periodic memory cleanup every 500 records processed
            if i > 0 and i % 500 == 0:
                gc.collect()
                logger.info(f"Processed {i}/{total_contacts} records, {matches_found} matches found so far")

    # Final cleanup
    del all_contacts
    del contacts_by_id
    gc.collect()

    return {
        "matches_found": matches_found,
        "matches_stored": matches_stored,
        "stale_cleaned": stale_count,
        "records_scanned": records_scanned,
        "high_confidence": high_confidence_count,
    }


# ============================================================================
# Targeted Candidate Generation (for real-time single-contact dedupe)
# ============================================================================

# Algorithms that guarantee exact matching (no false negatives with API search)
_EXACT_ALGORITHMS = {"exact", "phone"}
# Fields with reliable exact-match APIs in GHL
_EXACT_SEARCHABLE_FIELDS = {"email", "phone"}


def can_use_targeted_search(match_fields: List[dict]) -> bool:
    """
    Determine if targeted search can GUARANTEE finding all duplicates.

    Returns True ONLY if ALL match fields:
    1. Use exact-match algorithms (exact, phone) - NOT fuzzy
    2. Match on fields with exact-match GHL APIs (email, phone)
    3. Don't use cross-field matching

    If ANY field uses fuzzy matching, emailDomain, custom fields, or
    cross-field logic, we MUST fall back to full scan to avoid false negatives.
    """
    if not match_fields:
        return False

    for field_config in match_fields:
        field = field_config.get("field", "")
        algorithm = field_config.get("algorithm", "exact")
        match_against = field_config.get("match_against")

        # Cross-field matching requires full scan
        if match_against and match_against != field:
            return False

        # Fuzzy algorithms can miss matches via API search
        if algorithm not in _EXACT_ALGORITHMS:
            return False

        # Field must have an exact-match GHL API
        if field not in _EXACT_SEARCHABLE_FIELDS:
            return False

    return True


async def fetch_all_contacts(client, contact_id: str) -> List[dict]:
    """Fetch all contacts via pagination (fallback for complex rules)."""
    import logging
    logger = logging.getLogger(__name__)

    all_contacts = []
    start_after_id = None

    while True:
        try:
            page_result = await client.get_contacts(limit=100, start_after_id=start_after_id)
            page_contacts = page_result.get("contacts", [])
            if not page_contacts:
                break

            for c in page_contacts:
                if isinstance(c, dict) and c.get("id") and c["id"] != contact_id:
                    all_contacts.append(c)

            # Use last contact ID as the startAfterId for next page
            last_contact = page_contacts[-1] if page_contacts else None
            start_after_id = last_contact.get("id") if last_contact else None
            if not start_after_id or len(page_contacts) < 100:
                break
        except Exception as e:
            logger.error(f"Failed to fetch contacts page: {e}")
            break

    return all_contacts


async def generate_candidates(
    client,
    new_contact: dict,
    match_fields: List[dict],
    contact_id: str,
) -> tuple:
    """
    Generate candidate contacts for duplicate checking.

    IMPORTANT: To guarantee zero false negatives, targeted search is ONLY used
    when ALL match fields use exact algorithms on email/phone. Any fuzzy matching,
    emailDomain, custom fields, or cross-field logic triggers a full scan.

    Returns (candidates_list, used_full_scan).
    """
    import logging
    logger = logging.getLogger(__name__)

    # Check if we can safely use targeted search
    if not can_use_targeted_search(match_fields):
        # Fall back to full scan - this rule has fields that can't be
        # reliably searched via GHL API (fuzzy, emailDomain, custom, etc.)
        logger.info(
            "Rule requires full scan (has fuzzy matching, unsearchable fields, "
            "or cross-field logic)"
        )
        candidates = await fetch_all_contacts(client, contact_id)
        logger.info(f"Full scan: {len(candidates)} contacts fetched")
        return candidates, True

    # Safe to use targeted search - all fields are exact email/phone
    candidates_by_id: Dict[str, dict] = {}

    for field_config in match_fields:
        field = field_config.get("field", "")
        val = get_field_value(new_contact, field)
        if not val:
            continue

        email_param = val if field == "email" else None
        number_param = val if field == "phone" else None

        try:
            result = await client.search_duplicate_contact(
                email=email_param, number=number_param,
            )
            # Handle single contact response
            contact = result.get("contact")
            if contact and isinstance(contact, dict) and contact.get("id"):
                if contact["id"] != contact_id:
                    candidates_by_id[contact["id"]] = contact
            # Handle array response
            for c in result.get("contacts", []):
                if isinstance(c, dict) and c.get("id") and c["id"] != contact_id:
                    candidates_by_id[c["id"]] = c
        except Exception as e:
            logger.warning(f"Duplicate API search failed for {field}={val}: {e}")

    candidates = list(candidates_by_id.values())
    logger.info(f"Targeted search: {len(candidates)} candidates (email/phone exact match)")
    return candidates, False


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

        all_matches = []
        total_candidates = 0

        # Check against each rule using targeted candidate generation
        for rule in rules_result.data:
            match_fields = rule.get("match_fields", [])
            review_threshold = float(rule.get("review_threshold", 0.70)) * 100
            auto_merge_threshold = float(rule.get("auto_merge_threshold", 0.95)) * 100

            # Generate candidates targeted to this rule's fields
            candidates, used_full_scan = await generate_candidates(
                client=client,
                new_contact=new_contact,
                match_fields=match_fields,
                contact_id=contact_id,
            )
            total_candidates += len(candidates)

            logger.info(
                f"Rule '{rule.get('name')}': checking {contact_id} against "
                f"{len(candidates)} candidates (full_scan={used_full_scan})"
            )

            # Compare new contact against each candidate
            for existing in candidates:
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
        "contacts_scanned": total_candidates,
    }
