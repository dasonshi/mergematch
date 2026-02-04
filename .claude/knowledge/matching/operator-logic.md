# AND/OR Operator Logic

## Overview

Match rules combine multiple field conditions using AND/OR operators. This document explains exactly how they work.

## UI Representation

The rule builder shows operators BETWEEN conditions:

```
┌─────────────────────────────────┐
│ Email        │ Exact Match     │
├─────────────────────────────────┤
│     [AND] [OR]  "Both must match"
├─────────────────────────────────┤
│ Phone        │ Phone Match     │
└─────────────────────────────────┘
```

The toggle between fields controls how those fields relate.

## Data Structure

Internally, the operator is stored ON each field (attached to the field above the toggle):

```typescript
// Frontend state
fields: [
  { name: "email", matchType: "exact", operator: "AND" },
  { name: "phone", matchType: "phone", operator: "AND" }  // Last field's operator is unused
]

// API payload
match_fields: [
  { field: "email", algorithm: "exact", operator: "AND", weight: 1.0 },
  { field: "phone", algorithm: "phone", operator: "AND", weight: 1.0 }
]
```

**Key insight**: `field[i].operator` defines the relationship between `field[i]` and `field[i+1]`.

## Backend Evaluation Logic

**File**: `backend/app/services/matching_service.py`, function `compare_records()`

The backend evaluates fields by GROUPING them by operator type:

```python
# Pseudocode
and_result = all fields with operator="AND" match
or_result = any field with operator="OR" matches

# Final match determination
if has_and_fields and has_or_fields:
    is_match = and_result OR or_result
elif has_or_fields:
    is_match = or_result
else:
    is_match = and_result
```

## Examples

### Example 1: Two AND Fields
```
Email (AND) + Phone
```
- Both must match
- Match if: Email matches AND Phone matches

### Example 2: Two OR Fields
```
Email (OR) + Phone
```
- Either can match
- Match if: Email matches OR Phone matches

### Example 3: Mixed (3 fields)
```
Email (AND) + Name (OR) + Phone
```
- UI preview shows: `Email AND Name OR Phone`
- Backend groups by type:
  - AND fields: Email, Phone
  - OR fields: Name
- Match if: (Email AND Phone) OR Name

**Note**: This may differ from left-to-right interpretation `(Email AND Name) OR Phone`. The current behavior groups by operator type, not by position.

## Confidence Calculation

When a match is found, confidence is calculated based on which "path" succeeded:

**AND path succeeded** (all AND fields matched):
- Confidence = weighted average of all AND fields + any matching OR fields

**OR path succeeded** (AND fields failed, but OR field matched):
- Confidence = score of matching OR field(s) only
- Failed AND fields do NOT penalize the score

This prevents the scenario where a phone-only match gets 50% confidence because email didn't match.

## Threshold Application

- `review_threshold`: Minimum confidence to show as pending match (default: 70%)
- `auto_merge_threshold`: Minimum confidence for auto-merge (default: 95%)

Both are stored as decimals (0.0-1.0) in the database but displayed as percentages (0-100) in the UI.

## Code References

| Component | File | Lines |
|-----------|------|-------|
| UI toggle | `src/pages/MatchRuleForm.tsx` | ~982-1008 |
| Logic preview | `src/pages/MatchRuleForm.tsx` | ~404-432 |
| Backend evaluation | `backend/app/services/matching_service.py` | ~151-252 |
| Confidence calculation | `backend/app/services/matching_service.py` | ~225-238 |
