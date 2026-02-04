# Confidence Scoring

## Overview

When two records match, a confidence score (0-100%) indicates how strong the match is.

## Calculation Method

Confidence is a weighted average of matching field scores.

### Basic Formula

```
confidence = (sum of (score * weight) for included fields) / (sum of weights) * 100
```

### Which Fields Are Included

The fields included in the calculation depend on HOW the match was determined:

**Match via AND path** (all AND fields matched):
- Include: All AND fields (matching or not) + matching OR fields
- Rationale: AND fields are required, so their scores matter

**Match via OR path** (AND fields failed, OR field matched):
- Include: Only matching OR fields
- Rationale: Failed AND fields shouldn't penalize a valid OR match

### Example

Rule: Email (AND) + Phone (OR)

**Scenario 1**: Email matches (100%), Phone matches (100%)
- Path: AND (email matched)
- Included: Email + Phone
- Confidence: (1.0 + 1.0) / 2 * 100 = 100%

**Scenario 2**: Email doesn't match (0%), Phone matches (100%)
- Path: OR (phone matched)
- Included: Phone only (email excluded because match came from OR path)
- Confidence: 1.0 / 1 * 100 = 100%

**Scenario 3**: Email matches (100%), Phone doesn't match (0%)
- Path: AND (email matched)
- Included: Email + (Phone excluded because OR and didn't match)
- Confidence: 1.0 / 1 * 100 = 100%

## Weights

Each field has a weight (default: 1.0). Higher weights make that field more important.

```json
{
  "field": "email",
  "algorithm": "exact",
  "weight": 2.0  // Counts double
}
```

## Thresholds

Two thresholds control what happens to matches:

### review_threshold (default: 0.70)
- Matches below this are discarded (not stored)
- Matches at or above appear as "pending" for review

### auto_merge_threshold (default: 0.95)
- Matches at or above this are flagged for auto-merge
- Only applies if plan allows auto-merge

## Storage Format

| Context | Format | Example |
|---------|--------|---------|
| Database | Decimal 0.0-1.0 | 0.85 |
| API Response | Decimal 0.0-1.0 | 0.85 |
| Frontend Display | Percentage | 85% |

## Field Scores

Individual field scores are stored in `match_pairs.field_scores`:

```json
{
  "email": {
    "match": true,
    "score": 1.0
  },
  "phone": {
    "match": true,
    "score": 0.95
  },
  "name": {
    "match": true,
    "score": 0.87
  }
}
```

This allows the UI to show which fields matched and how well.

## Code Reference

**File**: `backend/app/services/matching_service.py`

- Confidence calculation: lines ~225-238
- Threshold application: lines ~372 in `run_scan()`
