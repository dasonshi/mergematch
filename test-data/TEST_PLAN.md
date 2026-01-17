# MergeMatch Test Plan

## Overview
This test plan validates:
- Standard contact/company duplicate merging
- Custom object duplicate merging
- Merge strategies (standard and custom logic)
- Related record handling (notes, tasks, opportunities)
- Custom logic conditions (AND/OR, value thresholds, pipeline stages)

---

## Test Dataset

Import the contacts from `test-contacts.csv` into your GHL location. The dataset includes:
- 6 pairs of duplicate contacts (12 contacts total)
- Each pair tests different scenarios

### Contact Pairs

| Pair | Contact A | Contact B | Test Scenario |
|------|-----------|-----------|---------------|
| 1 | John Smith (john@acme.com) | John A Smith (john@acme.com) | Exact email match, different names |
| 2 | Sarah Johnson (sarah.j@company.com) | Sara Johnson (sarah.johnson@company.com) | Fuzzy name match, similar emails |
| 3 | Mike Wilson (mike@startup.io) | Michael Wilson (mike@startup.io) | Notes on A only, Tasks on B only |
| 4 | Emily Davis (emily@bigcorp.com) | Emily R Davis (emily@bigcorp.com) | Both have opportunities (different values) |
| 5 | David Brown (david.brown@agency.co) | Dave Brown (david.brown@agency.co) | Opps in different pipeline stages |
| 6 | Lisa Chen (lisa@techfirm.com) | Lisa M Chen (lisa@techfirm.com) | Multiple opps, mixed values & stages |

---

## Test Scenarios

### Scenario 1: Basic Merge (No Related Records)
**Pair:** John Smith / John A Smith

**Match Rule:**
- Field: Email (Exact Match)
- Related Records: All set to "Don't copy"

**Expected Result:**
- Contacts merge successfully
- Master retains its data
- No related records transferred

---

### Scenario 2: Copy Notes & Tasks to Master
**Pair:** Mike Wilson / Michael Wilson

**Setup Required:**
- Add 2 notes to Mike Wilson (Contact A)
- Add 2 tasks to Michael Wilson (Contact B)

**Match Rule:**
- Field: Email (Exact Match)
- Notes: Copy all to master
- Tasks: Copy all to master
- Opportunities: Keep from master only

**Expected Result:**
- If A is master: A keeps notes, gains B's tasks
- If B is master: B keeps tasks, gains A's notes

---

### Scenario 3: Opportunities - Keep All From Both
**Pair:** Emily Davis / Emily R Davis

**Setup Required:**
- Add opportunity to Emily Davis: "Website Redesign" - $5,000
- Add opportunity to Emily R Davis: "SEO Package" - $2,500

**Match Rule:**
- Field: Email (Exact Match)
- Opportunities: Keep all from both records

**Expected Result:**
- Master contact has both opportunities
- Total opportunity value: $7,500

---

### Scenario 4: Opportunities - Keep Highest Value
**Pair:** Emily Davis / Emily R Davis (same pair, different strategy)

**Match Rule:**
- Field: Email (Exact Match)
- Opportunities: Keep highest monetary value

**Expected Result:**
- Only "Website Redesign" ($5,000) remains
- "SEO Package" ($2,500) is NOT transferred

---

### Scenario 5: Opportunities - Custom Logic (Value Threshold)
**Pair:** Lisa Chen / Lisa M Chen

**Setup Required:**
- Lisa Chen opportunities:
  - "Enterprise Deal" - $15,000 (Stage: Proposal)
  - "Small Project" - $500 (Stage: Qualified)
- Lisa M Chen opportunities:
  - "Medium Contract" - $3,000 (Stage: Won)
  - "Tiny Task" - $200 (Stage: Lost)

**Match Rule:**
- Field: Email (Exact Match)
- Opportunities: Custom logic
- Condition: `monetaryValue >= 1000`

**Expected Result:**
- Only opportunities >= $1,000 are kept:
  - "Enterprise Deal" ($15,000) ✓
  - "Medium Contract" ($3,000) ✓
- Excluded:
  - "Small Project" ($500) ✗
  - "Tiny Task" ($200) ✗

---

### Scenario 6: Opportunities - Custom Logic (Pipeline Stage)
**Pair:** David Brown / Dave Brown

**Setup Required:**
- David Brown opportunity: "Consulting" - $8,000 (Stage: Won)
- Dave Brown opportunity: "Training" - $4,000 (Stage: Lost)

**Match Rule:**
- Field: Email (Exact Match)
- Opportunities: Custom logic
- Condition: `pipelineStageId = [Won Stage ID]`

**Expected Result:**
- Only "Consulting" (Won) is kept
- "Training" (Lost) is NOT transferred

---

### Scenario 7: Opportunities - Custom Logic (AND conditions)
**Pair:** Lisa Chen / Lisa M Chen

**Match Rule:**
- Field: Email (Exact Match)
- Opportunities: Custom logic
- Conditions (ALL must match):
  - `monetaryValue >= 1000` AND
  - `pipelineStageId != [Lost Stage ID]`

**Expected Result:**
- "Enterprise Deal" ($15,000, Proposal) ✓
- "Medium Contract" ($3,000, Won) - depends on stage
- Excluded if Lost stage

---

## Validation Checklist

### Pre-Merge Checks
- [ ] Match rule created successfully
- [ ] Duplicate pairs detected in scan
- [ ] Related records config saved correctly

### Post-Merge Checks
- [ ] Duplicate contact deleted
- [ ] Master contact retained
- [ ] Notes transferred (if configured)
- [ ] Tasks transferred (if configured)
- [ ] Correct opportunities kept based on logic
- [ ] Merge history recorded

### Edge Cases
- [ ] What happens if both contacts have same note?
- [ ] What happens if opportunity has no monetary value?
- [ ] What happens if pipeline stage ID doesn't match any?

---

## Quick Reference: Custom Logic Operators

| Operator | Description | Works With |
|----------|-------------|------------|
| `=` | equals | all fields |
| `!=` | not equals | all fields |
| `>` | greater than | numbers, dates |
| `<` | less than | numbers, dates |
| `>=` | greater or equal | numbers, dates |
| `<=` | less or equal | numbers, dates |
| `contains` | contains text | text fields |
| `is_empty` | field is empty | all fields |
| `is_not_empty` | field has value | all fields |

---

---

# PART 2: Custom Object Merging

## Custom Object Test Dataset

If you have custom objects (e.g., "Transactions", "Projects", "Vehicles"), create test records.

### Example: Transactions Custom Object

| Pair | Record A | Record B | Test Scenario |
|------|----------|----------|---------------|
| CO-1 | TXN-001 (ref: ABC123) | TXN-001-DUP (ref: ABC123) | Exact field match |
| CO-2 | TXN-002 (amount: $5000) | TXN-002-B (amount: $5000) | Fuzzy name + exact amount |

---

### Scenario CO-1: Custom Object Exact Match
**Object:** Transactions (or your custom object)

**Match Rule:**
- Object Type: [Your Custom Object]
- Field: Reference Number (Exact Match)

**Expected Result:**
- Duplicates detected based on custom object field
- Merge combines records correctly

---

### Scenario CO-2: Custom Object with Related Associations
**Object:** Transactions linked to Contacts

**Match Rule:**
- Object Type: [Your Custom Object]
- Field: Transaction ID (Exact Match)

**Expected Result:**
- Custom object duplicates merge
- Associated contact relationships preserved

---

# PART 3: Custom Merge Strategies

Custom merge strategies define HOW fields are merged, not just which duplicates to find.

---

### Scenario MS-1: Field Preservation - Keep Non-Empty
**Pair:** John Smith / John A Smith

**Merge Strategy Config:**
```json
{
  "field_rules": {
    "phone": "keep_non_empty",
    "companyName": "keep_non_empty",
    "address1": "keep_longer"
  }
}
```

**Setup:**
- John Smith: phone = "555-0101", companyName = "", address = "123 Main St"
- John A Smith: phone = "", companyName = "Acme Corp", address = "123 Main Street, Suite 100"

**Expected Result:**
- Master gets: phone = "555-0101", companyName = "Acme Corp", address = "123 Main Street, Suite 100"

---

### Scenario MS-2: Field Preservation - Always Prefer Master
**Pair:** Sarah Johnson / Sara Johnson

**Merge Strategy Config:**
```json
{
  "field_rules": {
    "all": "prefer_master"
  }
}
```

**Expected Result:**
- All fields from master retained
- Duplicate fields ignored even if more complete

---

### Scenario MS-3: Field Preservation - Prefer Most Recent
**Pair:** Any pair with different updatedAt timestamps

**Merge Strategy Config:**
```json
{
  "field_rules": {
    "all": "prefer_recent"
  }
}
```

**Expected Result:**
- Fields from more recently updated record are kept

---

### Scenario MS-4: Custom Field Mapping (Preserve to Secondary)
**Purpose:** Move duplicate's email to a secondary email field

**Merge Strategy Config:**
```json
{
  "field_preservation": {
    "enabled": true,
    "mappings": [
      {"source": "email", "target": "secondary_email_custom_field_id"}
    ]
  }
}
```

**Expected Result:**
- Master keeps its email
- Duplicate's email saved to custom field on master

---

# PART 4: Related Records - All Scenarios

## Standard Options

### Scenario RR-1: Notes - Copy All to Master
**Config:** `notes: "copy_to_master"`

| Before Merge | After Merge |
|--------------|-------------|
| Master: 2 notes | Master: 4 notes (2 original + 2 from dup) |
| Duplicate: 2 notes | Duplicate: deleted |

---

### Scenario RR-2: Notes - Don't Copy
**Config:** `notes: "dont_copy"`

| Before Merge | After Merge |
|--------------|-------------|
| Master: 2 notes | Master: 2 notes (unchanged) |
| Duplicate: 2 notes | Duplicate: deleted (notes lost) |

---

### Scenario RR-3: Tasks - Copy All to Master
**Config:** `tasks: "copy_to_master"`

| Before Merge | After Merge |
|--------------|-------------|
| Master: 1 task | Master: 3 tasks |
| Duplicate: 2 tasks | Duplicate: deleted |

---

### Scenario RR-4: Tasks - Don't Copy
**Config:** `tasks: "dont_copy"`

| Before Merge | After Merge |
|--------------|-------------|
| Master: 1 task | Master: 1 task |
| Duplicate: 2 tasks | Duplicate: deleted (tasks lost) |

---

## Opportunities - Standard Options

### Scenario RR-5: Keep All From Both Records
**Config:** `opportunities: "keep_all"`

| Before | After |
|--------|-------|
| Master: Opp A ($5k) | Master: Opp A ($5k), Opp B ($3k) |
| Duplicate: Opp B ($3k) | Deleted |

---

### Scenario RR-6: Keep From Master Only
**Config:** `opportunities: "keep_master_only"`

| Before | After |
|--------|-------|
| Master: Opp A ($5k) | Master: Opp A ($5k) |
| Duplicate: Opp B ($3k) | Deleted (Opp B lost) |

---

### Scenario RR-7: Keep Highest Monetary Value
**Config:** `opportunities: "keep_highest_value"`

| Before | After |
|--------|-------|
| Master: Opp A ($2k) | Master: Opp B ($8k) only |
| Duplicate: Opp B ($8k) | Deleted |

---

## Opportunities - Custom Logic

### Scenario RR-8: Custom Logic - Value >= $1,000
**Config:**
```json
{
  "opportunities": "custom_logic",
  "opportunities_custom_logic": {
    "operator": "AND",
    "conditions": [
      {"field": "monetaryValue", "operator": ">=", "value": "1000"}
    ]
  }
}
```

| Before | Kept? |
|--------|-------|
| Opp: $15,000 | ✅ Yes |
| Opp: $3,000 | ✅ Yes |
| Opp: $500 | ❌ No |
| Opp: $200 | ❌ No |

---

### Scenario RR-9: Custom Logic - Specific Pipeline Stage
**Config:**
```json
{
  "opportunities": "custom_logic",
  "opportunities_custom_logic": {
    "operator": "AND",
    "conditions": [
      {"field": "pipelineStageId", "operator": "=", "value": "[WON_STAGE_ID]"}
    ]
  }
}
```

| Before | Stage | Kept? |
|--------|-------|-------|
| Opp A | Won | ✅ Yes |
| Opp B | Lost | ❌ No |
| Opp C | Proposal | ❌ No |

---

### Scenario RR-10: Custom Logic - NOT Lost Stage
**Config:**
```json
{
  "opportunities": "custom_logic",
  "opportunities_custom_logic": {
    "operator": "AND",
    "conditions": [
      {"field": "pipelineStageId", "operator": "!=", "value": "[LOST_STAGE_ID]"}
    ]
  }
}
```

| Before | Stage | Kept? |
|--------|-------|-------|
| Opp A | Won | ✅ Yes |
| Opp B | Proposal | ✅ Yes |
| Opp C | Lost | ❌ No |

---

### Scenario RR-11: Custom Logic - AND Conditions (Value + Stage)
**Config:**
```json
{
  "opportunities": "custom_logic",
  "opportunities_custom_logic": {
    "operator": "AND",
    "conditions": [
      {"field": "monetaryValue", "operator": ">=", "value": "1000"},
      {"field": "pipelineStageId", "operator": "!=", "value": "[LOST_STAGE_ID]"}
    ]
  }
}
```

| Opp | Value | Stage | Kept? |
|-----|-------|-------|-------|
| Enterprise Deal | $15,000 | Proposal | ✅ Yes (both match) |
| Medium Contract | $3,000 | Won | ✅ Yes (both match) |
| Small Project | $500 | Qualified | ❌ No (value too low) |
| Big Lost Deal | $10,000 | Lost | ❌ No (stage excluded) |

---

### Scenario RR-12: Custom Logic - OR Conditions
**Config:**
```json
{
  "opportunities": "custom_logic",
  "opportunities_custom_logic": {
    "operator": "OR",
    "conditions": [
      {"field": "monetaryValue", "operator": ">=", "value": "10000"},
      {"field": "pipelineStageId", "operator": "=", "value": "[WON_STAGE_ID]"}
    ]
  }
}
```

| Opp | Value | Stage | Kept? |
|-----|-------|-------|-------|
| Enterprise Deal | $15,000 | Proposal | ✅ Yes (value >= 10k) |
| Small Won | $500 | Won | ✅ Yes (stage = Won) |
| Medium Proposal | $3,000 | Proposal | ❌ No (neither match) |

---

### Scenario RR-13: Custom Logic - Name Contains
**Config:**
```json
{
  "opportunities": "custom_logic",
  "opportunities_custom_logic": {
    "operator": "AND",
    "conditions": [
      {"field": "name", "operator": "contains", "value": "Enterprise"}
    ]
  }
}
```

| Opp Name | Kept? |
|----------|-------|
| Enterprise Deal | ✅ Yes |
| Enterprise Contract | ✅ Yes |
| Small Project | ❌ No |

---

### Scenario RR-14: Custom Logic - Is Not Empty
**Config:**
```json
{
  "opportunities": "custom_logic",
  "opportunities_custom_logic": {
    "operator": "AND",
    "conditions": [
      {"field": "monetaryValue", "operator": "is_not_empty", "value": ""}
    ]
  }
}
```

| Opp | Value | Kept? |
|-----|-------|-------|
| Opp A | $5,000 | ✅ Yes |
| Opp B | $0 | ✅ Yes (0 is not empty) |
| Opp C | (null) | ❌ No |

---

# PART 5: Combined Scenarios

### Scenario COMBO-1: Full Contact Merge with All Related Records
**Pair:** Lisa Chen / Lisa M Chen

**Config:**
```json
{
  "notes": "copy_to_master",
  "tasks": "copy_to_master",
  "opportunities": "custom_logic",
  "opportunities_custom_logic": {
    "operator": "AND",
    "conditions": [
      {"field": "monetaryValue", "operator": ">=", "value": "1000"}
    ]
  }
}
```

**Expected Result:**
- All notes from both contacts on master
- All tasks from both contacts on master
- Only opportunities >= $1,000 kept

---

### Scenario COMBO-2: Conservative Merge (Minimal Data Loss)
**Config:**
```json
{
  "notes": "copy_to_master",
  "tasks": "copy_to_master",
  "opportunities": "keep_all"
}
```

**Expected Result:**
- All related records preserved
- Nothing lost in merge

---

### Scenario COMBO-3: Aggressive Merge (Master Only)
**Config:**
```json
{
  "notes": "dont_copy",
  "tasks": "dont_copy",
  "opportunities": "keep_master_only"
}
```

**Expected Result:**
- Only master's data kept
- All duplicate's related records lost

---

## Notes

1. **Set your plan to Pro** before testing custom logic features
2. **Pipeline Stage IDs** - Get actual IDs from your pipelines endpoint
3. **Create opportunities manually** in GHL before running merge tests
4. Run tests in order - some build on previous setups
5. **Custom Objects** - Requires your location to have custom objects defined in GHL
