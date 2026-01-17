# Setup Related Records for Testing

After importing `test-contacts.csv`, manually create these related records in GHL.

> **TIP:** Use the tags on each contact (e.g., `test-pair-3-notes`) to easily identify them.

---

## Quick Setup Checklist

| Contact | Notes | Tasks | Opportunities |
|---------|:-----:|:-----:|:-------------:|
| John Smith | - | - | - |
| John A Smith | - | - | - |
| Sarah Johnson | - | - | - |
| Sara Johnson | - | - | - |
| Mike Wilson | 2 | - | - |
| Michael Wilson | - | 2 | - |
| Emily Davis | - | - | 1 ($5,000) |
| Emily R Davis | - | - | 1 ($2,500) |
| David Brown | - | - | 1 ($8,000, Won) |
| Dave Brown | - | - | 1 ($4,000, Lost) |
| Lisa Chen | 1 | 1 | 2 ($15k + $500) |
| Lisa M Chen | 1 | 1 | 2 ($3k + $200) |

---

## Pair 3: Mike Wilson / Michael Wilson
**Purpose:** Test Notes & Tasks transfer

### Mike Wilson (mike@startup.io) - Add NOTES:
1. **Note 1:** "Initial consultation call completed. Client interested in premium package."
2. **Note 2:** "Follow-up email sent with pricing details."

### Michael Wilson (mike@startup.io) - Add TASKS:
1. **Task 1:** "Send proposal document" - Due: Tomorrow
2. **Task 2:** "Schedule demo call" - Due: Next week

---

## Pair 4: Emily Davis / Emily R Davis
**Purpose:** Test Opportunity merging (keep all / keep highest)

### Emily Davis (emily@bigcorp.com) - Add OPPORTUNITY:
- **Name:** Website Redesign
- **Value:** $5,000
- **Pipeline:** [Your main pipeline]
- **Stage:** Proposal Sent

### Emily R Davis (emily@bigcorp.com) - Add OPPORTUNITY:
- **Name:** SEO Package
- **Value:** $2,500
- **Pipeline:** [Your main pipeline]
- **Stage:** Qualified

---

## Pair 5: David Brown / Dave Brown
**Purpose:** Test Pipeline Stage custom logic

### David Brown (david.brown@agency.co) - Add OPPORTUNITY:
- **Name:** Consulting Engagement
- **Value:** $8,000
- **Pipeline:** [Your main pipeline]
- **Stage:** Won (Closed Won)

### Dave Brown (david.brown@agency.co) - Add OPPORTUNITY:
- **Name:** Training Program
- **Value:** $4,000
- **Pipeline:** [Your main pipeline]
- **Stage:** Lost (Closed Lost)

---

## Pair 6: Lisa Chen / Lisa M Chen
**Purpose:** Test multi-opportunity custom logic with value threshold

### Lisa Chen (lisa@techfirm.com) - Add OPPORTUNITIES:

1. **Opportunity 1:**
   - Name: Enterprise Deal
   - Value: $15,000
   - Stage: Proposal Sent

2. **Opportunity 2:**
   - Name: Small Project
   - Value: $500
   - Stage: Qualified

### Lisa M Chen (lisa@techfirm.com) - Add OPPORTUNITIES:

1. **Opportunity 1:**
   - Name: Medium Contract
   - Value: $3,000
   - Stage: Won

2. **Opportunity 2:**
   - Name: Tiny Task
   - Value: $200
   - Stage: Lost

---

## Summary Table

| Contact | Notes | Tasks | Opportunities |
|---------|-------|-------|---------------|
| John Smith | - | - | - |
| John A Smith | - | - | - |
| Sarah Johnson | - | - | - |
| Sara Johnson | - | - | - |
| Mike Wilson | 2 | - | - |
| Michael Wilson | - | 2 | - |
| Emily Davis | - | - | 1 ($5,000) |
| Emily R Davis | - | - | 1 ($2,500) |
| David Brown | - | - | 1 ($8,000, Won) |
| Dave Brown | - | - | 1 ($4,000, Lost) |
| Lisa Chen | - | - | 2 ($15,000 + $500) |
| Lisa M Chen | - | - | 2 ($3,000 + $200) |

---

---

## Pair 6: Lisa Chen / Lisa M Chen (FULL TEST)
**Purpose:** Comprehensive test with notes, tasks, and multiple opportunities

### Lisa Chen (lisa@techfirm.com):

**Add 1 Note:**
- "VIP client - handle with care. Prefers email communication."

**Add 1 Task:**
- "Quarterly business review" - Due: Next month

**Add 2 Opportunities:**
1. **Enterprise Deal**
   - Value: $15,000
   - Stage: Proposal Sent

2. **Small Project**
   - Value: $500
   - Stage: Qualified

### Lisa M Chen (lisa@techfirm.com):

**Add 1 Note:**
- "Referred by partner network. Interested in premium tier."

**Add 1 Task:**
- "Send case studies" - Due: This week

**Add 2 Opportunities:**
1. **Medium Contract**
   - Value: $3,000
   - Stage: Won (Closed Won)

2. **Tiny Task**
   - Value: $200
   - Stage: Lost (Closed Lost)

---

## Pipeline Stage IDs

Before testing custom logic with Pipeline Stage, get your stage IDs:

### Option 1: Via MergeMatch UI
1. Go to MergeMatch > Create Rule > Step 3
2. Select "Custom logic" for Opportunities
3. Add condition with "Pipeline Stage" field
4. Note the stage names in the dropdown (format: "Pipeline → Stage")

### Option 2: Via API
```
GET /v1/fields/pipelines
```

Returns:
```json
[
  {
    "id": "pipeline_abc123",
    "name": "Sales Pipeline",
    "stages": [
      {"id": "stage_001", "name": "New Lead"},
      {"id": "stage_002", "name": "Qualified"},
      {"id": "stage_003", "name": "Proposal Sent"},
      {"id": "stage_004", "name": "Won"},
      {"id": "stage_005", "name": "Lost"}
    ]
  }
]
```

### Common Stage Names to Note:
- **Won Stage ID:** `_______________` (fill in yours)
- **Lost Stage ID:** `_______________` (fill in yours)
- **Proposal Stage ID:** `_______________` (fill in yours)

---

## Test Execution Order

For best results, run tests in this order:

1. **Import contacts** - `test-contacts.csv`
2. **Add related records** - Follow sections above
3. **Verify in GHL** - Check all contacts have correct data
4. **Run Scenario 1-2** - Basic merges (no related records)
5. **Run Scenario 3** - Notes/Tasks transfer
6. **Run Scenario 4-7** - Opportunity standard options
7. **Run Scenario 8-14** - Opportunity custom logic
8. **Run Combo scenarios** - Full merge tests

---

## Resetting Test Data

To re-run tests, you'll need to:
1. Delete merged contacts
2. Re-import from CSV
3. Re-add related records

Consider keeping a backup of your test setup!
