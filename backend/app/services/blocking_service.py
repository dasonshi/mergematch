"""
Blocking service for scan optimization.
Implements blocking keys to reduce O(n^2) comparisons to O(n).
"""
import re
import logging
from typing import List, Dict, Set, Tuple, Optional

from app.db.supabase import get_supabase

logger = logging.getLogger(__name__)


def soundex(name: str) -> str:
    """
    Simple Soundex implementation for phonetic matching.
    Converts a name to a 4-character code based on how it sounds.
    """
    if not name:
        return ""

    # Normalize: uppercase, remove non-alpha
    name = re.sub(r'[^A-Za-z]', '', name.upper())
    if not name:
        return ""

    # Keep first letter
    first_letter = name[0]

    # Soundex mapping
    mapping = {
        'B': '1', 'F': '1', 'P': '1', 'V': '1',
        'C': '2', 'G': '2', 'J': '2', 'K': '2', 'Q': '2', 'S': '2', 'X': '2', 'Z': '2',
        'D': '3', 'T': '3',
        'L': '4',
        'M': '5', 'N': '5',
        'R': '6',
        'A': '0', 'E': '0', 'I': '0', 'O': '0', 'U': '0', 'H': '0', 'W': '0', 'Y': '0',
    }

    # Convert remaining letters
    codes = []
    prev_code = mapping.get(first_letter, '0')
    for char in name[1:]:
        code = mapping.get(char, '0')
        # Skip if same as previous (avoid duplicates)
        if code != '0' and code != prev_code:
            codes.append(code)
        prev_code = code

    # Combine: first letter + codes, padded/truncated to 4 chars
    result = first_letter + ''.join(codes)
    return (result + '000')[:4]


def normalize_phone(phone: str) -> str:
    """Normalize phone to last 10 digits only."""
    if not phone:
        return ""
    digits = re.sub(r'[^\d]', '', phone)
    # Take last 10 digits for US normalization
    return digits[-10:] if len(digits) >= 10 else digits


def normalize_email(email: str) -> str:
    """Normalize email to lowercase, strip whitespace."""
    if not email:
        return ""
    return email.lower().strip()


def normalize_name(name: str) -> str:
    """Normalize name: lowercase, remove special chars."""
    if not name:
        return ""
    return re.sub(r'[^a-z]', '', name.lower())


def compute_blocking_keys(contact: Dict) -> Dict:
    """
    Compute blocking keys for a contact.
    Returns dict with normalized values for blocking.
    """
    first_name = str(contact.get("firstName", "") or "")
    last_name = str(contact.get("lastName", "") or "")
    display_name = str(
        contact.get("name")
        or contact.get("contactName")
        or contact.get("companyName")
        or contact.get("company")
        or ""
    )
    email = str(contact.get("email", "") or "")
    phone = str(contact.get("phone", "") or "")

    # Combined name for soundex. Fall back to generic display/name fields
    # so companies/custom objects with a single "name" property can use blocking.
    full_name = f"{first_name} {last_name}".strip()
    if not full_name:
        full_name = display_name

    # Normalized name prefix (first 3 chars)
    normalized_name = normalize_name(full_name)
    name_prefix = normalized_name[:3] if normalized_name else ""

    return {
        "email_normalized": normalize_email(email) or None,
        "phone_normalized": normalize_phone(phone) or None,
        "name_soundex": soundex(full_name) or None,
        "name_prefix": name_prefix or None,
        "first_name": first_name or None,
        "last_name": last_name or None,
    }


def clear_contact_blocks(location_id: str) -> None:
    """Clear all blocking keys for a location before starting a new scan."""
    supabase = get_supabase()
    supabase.table("contact_blocks").delete().eq("location_id", location_id).execute()
    logger.info(f"Cleared contact blocks for location {location_id}")


def stream_contacts_to_blocks(
    location_id: str,
    contacts: List[Dict],
) -> int:
    """
    Stream a batch of contacts to the blocking table.
    Called per-page during fetch to avoid accumulating all contacts in memory.
    Returns number of records inserted.
    """
    supabase = get_supabase()

    records = []
    for contact in contacts:
        contact_id = contact.get("id")
        if not contact_id:
            continue

        keys = compute_blocking_keys(contact)
        records.append({
            "location_id": location_id,
            "contact_id": contact_id,
            **keys,
        })

    if records:
        try:
            # Use upsert to handle any duplicate contacts gracefully
            supabase.table("contact_blocks").upsert(
                records,
                on_conflict="location_id,contact_id"
            ).execute()
            return len(records)
        except Exception as e:
            logger.error(f"Failed to stream blocking records: {e}")
            return 0

    return 0


async def populate_contact_blocks(
    location_id: str,
    contacts: List[Dict],
) -> int:
    """
    Populate contact_blocks table with blocking keys for all contacts.
    Uses upsert to handle existing records.
    Returns number of records inserted/updated.
    """
    supabase = get_supabase()

    # Clear existing blocks for this location (full refresh)
    clear_contact_blocks(location_id)

    # Prepare batch inserts
    batch_size = 500
    total_inserted = 0

    for i in range(0, len(contacts), batch_size):
        batch = contacts[i:i + batch_size]
        total_inserted += stream_contacts_to_blocks(location_id, batch)

    logger.info(f"Populated {total_inserted} contact blocks for location {location_id}")
    return total_inserted


def get_candidate_pairs_sql(
    location_id: str,
    match_fields: List[Dict],
) -> List[Tuple[str, str]]:
    """
    Query candidate pairs using blocking keys.
    Returns list of (contact_id_a, contact_id_b) tuples.

    Blocking strategy:
    - For email matching: contacts must have same email_normalized
    - For phone matching: contacts must have same phone_normalized
    - For name matching: contacts must have same name_soundex OR name_prefix

    This dramatically reduces the number of pairs to compare.
    """
    supabase = get_supabase()

    # Determine which blocking keys to use based on match_fields
    uses_email = any(f.get("field") == "email" for f in match_fields)
    uses_phone = any(f.get("field") == "phone" for f in match_fields)
    uses_name = any(f.get("field") in ("firstName", "lastName", "name", "fullName") for f in match_fields)
    uses_fuzzy_name = any(
        f.get("field") in ("firstName", "lastName", "name", "fullName")
        and f.get("algorithm", "exact") in ("fuzzy", "fuzzy90")
        for f in match_fields
    )

    candidate_pairs: Set[Tuple[str, str]] = set()

    # Get all blocks for this location
    blocks_result = supabase.table("contact_blocks").select("*").eq("location_id", location_id).execute()
    blocks = blocks_result.data

    if not blocks:
        return []

    # Build lookup dictionaries for blocking
    by_email: Dict[str, List[Dict]] = {}
    by_phone: Dict[str, List[Dict]] = {}
    by_soundex: Dict[str, List[Dict]] = {}
    by_prefix: Dict[str, List[Dict]] = {}

    for block in blocks:
        email = block.get("email_normalized")
        phone = block.get("phone_normalized")
        soundex_val = block.get("name_soundex")
        prefix = block.get("name_prefix")

        if email:
            by_email.setdefault(email, []).append(block)
        if phone:
            by_phone.setdefault(phone, []).append(block)
        if soundex_val:
            by_soundex.setdefault(soundex_val, []).append(block)
        if prefix:
            by_prefix.setdefault(prefix, []).append(block)

    # Generate candidate pairs based on blocking strategy
    def add_pairs_from_group(group: List[Dict]):
        """Add all pairs from a group to candidate_pairs."""
        for i, a in enumerate(group):
            for b in group[i + 1:]:
                id_a = a["contact_id"]
                id_b = b["contact_id"]
                # Ensure consistent ordering
                pair = (min(id_a, id_b), max(id_a, id_b))
                candidate_pairs.add(pair)

    # Apply blocking based on match fields
    if uses_email:
        for group in by_email.values():
            if len(group) > 1:
                add_pairs_from_group(group)

    if uses_phone:
        for group in by_phone.values():
            if len(group) > 1:
                add_pairs_from_group(group)

    if uses_name:
        if uses_fuzzy_name:
            # Use BOTH Soundex and name prefix for fuzzy matching.
            # Soundex alone misses abbreviations (e.g., "Corp" vs "Inc" produce
            # different codes). Prefix blocking catches same-root variations.
            # candidate_pairs is a Set so duplicates are auto-deduplicated.
            for group in by_soundex.values():
                if len(group) > 1:
                    add_pairs_from_group(group)
            for group in by_prefix.values():
                if len(group) > 1:
                    add_pairs_from_group(group)
        else:
            for group in by_prefix.values():
                if len(group) > 1:
                    add_pairs_from_group(group)

    logger.info(f"Blocking generated {len(candidate_pairs)} candidate pairs from {len(blocks)} contacts")
    return list(candidate_pairs)


def should_use_blocking(match_fields: List[Dict]) -> bool:
    """
    Determine if blocking optimization can be safely used for this rule.

    Blocking is safe when:
    - Rule uses email, phone, or name fields
    - No cross-field matching (match_against)
    - No custom fields (blocking keys don't cover them)

    Returns True if blocking can be used, False if full scan required.
    """
    if not match_fields:
        return False

    supported_fields = {"email", "phone", "firstName", "lastName", "name", "fullName"}

    for field_config in match_fields:
        field = field_config.get("field", "")

        # Cross-field matching requires full scan
        match_against = field_config.get("match_against")
        if match_against and match_against != field:
            logger.info(f"Blocking disabled: cross-field matching ({field} vs {match_against})")
            return False

        # Unsupported fields require full scan
        if field not in supported_fields:
            logger.info(f"Blocking disabled: unsupported field '{field}'")
            return False

    return True
