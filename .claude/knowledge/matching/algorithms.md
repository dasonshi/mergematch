# Matching Algorithms

## Overview

Each match field condition uses an algorithm to compare values between two records.

## Available Algorithms

### exact
Case-insensitive exact string match.

```python
is_match = value_a.lower().strip() == value_b.lower().strip()
score = 1.0 if match else 0.0
```

**Use for**: Email, IDs, codes

### fuzzy
Fuzzy string matching using SequenceMatcher (85% threshold).

```python
ratio = SequenceMatcher(None, value_a.lower(), value_b.lower()).ratio()
is_match = ratio >= 0.85
score = ratio
```

**Use for**: Names with typos, slight variations

### fuzzy90
Stricter fuzzy matching (90% threshold).

```python
ratio = SequenceMatcher(None, value_a.lower(), value_b.lower()).ratio()
is_match = ratio >= 0.90
score = ratio
```

**Use for**: Names where you want fewer false positives

### phone
Phone number matching with normalization.

```python
# Strip all non-digits
n1 = re.sub(r"[^\d]", "", phone_a)
n2 = re.sub(r"[^\d]", "", phone_b)

# Exact match
if n1 == n2:
    return True, 1.0

# Last 10 digits match (handles country code differences)
if len(n1) >= 10 and len(n2) >= 10 and n1[-10:] == n2[-10:]:
    return True, 0.95
```

**Use for**: Phone numbers in any format

### email_domain
Matches if email domains are the same.

```python
domain_a = email_a.split("@")[1].lower()
domain_b = email_b.split("@")[1].lower()
is_match = domain_a == domain_b
score = 1.0 if match else 0.0
```

**Use for**: Company matching, organization grouping

## Algorithm Selection Guide

| Field Type | Recommended Algorithm |
|------------|----------------------|
| Email | exact |
| Phone | phone |
| First Name | fuzzy |
| Last Name | fuzzy or fuzzy90 |
| Company Name | fuzzy |
| Address | fuzzy |
| State/Country | exact |
| Custom ID | exact |

## Negation

Any algorithm can be negated with the `negate` flag:

```python
if negate:
    is_match = not is_match
    score = 1.0 - score
```

**Use for**: "Different email" conditions, exclusion rules

## Cross-Field Matching

The `match_against` field allows comparing different fields:

```json
{
  "field": "email",
  "match_against": "secondary_email",
  "algorithm": "exact"
}
```

This compares `record_a.email` against `record_b.secondary_email`.

## Code Reference

**File**: `backend/app/services/matching_service.py`

| Function | Lines | Purpose |
|----------|-------|---------|
| `exact_match()` | ~49-55 | Exact string comparison |
| `fuzzy_match()` | ~34-46 | SequenceMatcher comparison |
| `phone_match()` | ~58-73 | Phone normalization and match |
| `email_domain_match()` | ~76-85 | Domain extraction and match |
| `get_field_value()` | ~88-148 | Field extraction with custom field support |
