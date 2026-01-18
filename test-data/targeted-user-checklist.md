# Targeted Test Checklist

## Test Scenarios

| # | Scenario | What's Being Tested |
|---|----------|---------------------|
| 1 | Custom Field Match | Match rule using custom contact field |
| 2 | Custom Merge Strategy | Custom logic for opportunity filtering |
| 3 | Combined Rules | Standard (notes/tasks) + Custom (opps) together |
| 4 | Restore with Related Records | Undo merge that moved notes/tasks/opps |

---

## Scenario 1: Custom Field Matching

**Contacts:** Alice Thompson, Bob Martinez, Carol Johnson (6 contacts, 3 pairs)
**Custom Field:** `Account ID` with values ACCT-001, ACCT-002, ACCT-003

### Create Rule:
1. Name: "Test - Custom Field Match"
2. Object: Contacts
3. Match Field: **[Your Custom Field]** = Exact Match

### Expected:
- [ ] 3 matches found (pairs share same Account ID)
- [ ] Different emails don't prevent match (only custom field matters)

### Verify:
- [ ] Alice Thompson pair matched (both have ACCT-001)
- [ ] Bob Martinez pair matched (both have ACCT-002)
- [ ] Carol Johnson pair matched (both have ACCT-003)

---

## Scenario 2: Custom Merge Strategy (Opportunities)

**Contacts:** Diana Ross, Edward King (4 contacts, 2 pairs)
**Opportunities:** 8 total with varied values and stages

### Create Rule:
1. Name: "Test - Custom Opp Logic"
2. Object: Contacts
3. Match Field: Email = Exact Match
4. Merge Strategy → Opportunities: **Custom logic**
5. Custom Logic:
   - Match: **ALL** conditions
   - Condition 1: `Monetary Value >= 5000`
   - Condition 2: `Status != lost`

### Expected Matches: 2

### Diana Ross Merge Test (cm01 + cm02):

| Opportunity | Value | Status | Expected |
|-------------|-------|--------|----------|
| Enterprise License | $50,000 | open | **KEPT** |
| Support Package | $3,000 | won | FILTERED (< $5k) |
| Consulting Project | $25,000 | open | **KEPT** |
| Small Add-on | $1,500 | lost | FILTERED (< $5k, lost) |

**After merge:** Master has 2 opps, $75,000 total

### Edward King Merge Test (cm03 + cm04):

| Opportunity | Value | Status | Expected |
|-------------|-------|--------|----------|
| Platform Deal | $100,000 | open | **KEPT** |
| Training | $8,000 | won | **KEPT** |
| Hardware Bundle | $15,000 | lost | FILTERED (lost) |
| Maintenance | $2,000 | open | FILTERED (< $5k) |

**After merge:** Master has 2 opps, $108,000 total

---

## Scenario 3: Combined Standard + Custom Rules

**Contacts:** Frank Miller, Grace Lee (4 contacts, 2 pairs)
**Related Records:** 6 notes, 5 tasks, 8 opportunities

### Create Rule:
1. Name: "Test - Combined Rules"
2. Object: Contacts
3. Match Field: Email = Exact Match
4. Merge Strategy:
   - Notes: **Copy all to master**
   - Tasks: **Copy all to master**
   - Opportunities: **Custom logic**
5. Custom Logic (for opps):
   - Match: **ANY** condition (OR logic)
   - Condition 1: `Monetary Value >= 10000`
   - Condition 2: `Status = won`

### Expected Matches: 2

### Frank Miller Merge Test (cb01 + cb02):

**Notes (all copy):**
- cb01: 2 notes → Master
- cb02: 1 note → Copied to Master
- **Result: 3 notes on master**

**Tasks (all copy):**
- cb01: 1 task → Master
- cb02: 1 task → Copied to Master
- **Result: 2 tasks on master**

**Opportunities (custom - ANY: >=10k OR won):**

| Opportunity | Value | Status | Expected |
|-------------|-------|--------|----------|
| Annual Contract | $50,000 | open | **KEPT** (>= $10k) |
| Add-on Services | $5,000 | won | **KEPT** (won) |
| Pilot Program | $2,000 | open | FILTERED |
| Full Deployment | $75,000 | open | **KEPT** (>= $10k) |

**Result: 3 opps, $130,000**

### Grace Lee Merge Test (cb03 + cb04):

**Notes:** 3 total after merge
**Tasks:** 3 total after merge
**Opportunities:**

| Opportunity | Value | Status | Expected |
|-------------|-------|--------|----------|
| Marketing Suite | $30,000 | open | **KEPT** (>= $10k) |
| Quick Start | $1,500 | won | **KEPT** (won) |
| Analytics Add-on | $8,000 | lost | FILTERED |
| Data Migration | $12,000 | won | **KEPT** (both conditions!) |

**Result: 3 opps, $43,500**

---

## Scenario 4: Restore/Undo with Related Records

**Contacts:** Henry Adams / Hank Adams (1 pair)
**Related Records:** 4 notes, 3 tasks, 3 opportunities

### Create Rule:
1. Name: "Test - Restore Related Records"
2. Object: Contacts
3. Match Field: Email = Exact Match
4. Merge Strategy:
   - Notes: **Copy all to master**
   - Tasks: **Copy all to master**
   - Opportunities: **Keep all**

### Before Merge State:

| Contact | Notes | Tasks | Opps | Opp Value |
|---------|-------|-------|------|-----------|
| Henry (rs01) | 2 | 1 | 1 | $25,000 |
| Hank (rs02) | 2 | 2 | 2 | $20,000 |

### Step 1: Merge

- [ ] Select Henry as master
- [ ] Click Merge
- [ ] Verify Hank deleted from GHL

### After Merge State:

| Contact | Notes | Tasks | Opps | Opp Value |
|---------|-------|-------|------|-----------|
| Henry (master) | 4 | 3 | 3 | $45,000 |

Verify in GHL:
- [ ] Henry has 4 notes (2 original + 2 from Hank)
- [ ] Henry has 3 tasks (1 original + 2 from Hank)
- [ ] Henry has 3 opportunities ($25k + $15k + $5k = $45k)

### Step 2: Restore/Undo

- [ ] Go to History page in MergeMatch
- [ ] Find the Henry/Hank merge entry
- [ ] Click **Undo** or **Restore**
- [ ] Confirm the action

### After Restore State:

| Contact | Notes | Tasks | Opps | Opp Value |
|---------|-------|-------|------|-----------|
| Henry | 2 | 1 | 1 | $25,000 |
| Hank (restored) | 2 | 2 | 2 | $20,000 |

Verify in GHL:
- [ ] Hank contact exists again
- [ ] Henry back to original 2 notes
- [ ] Henry back to original 1 task
- [ ] Henry back to original 1 opp ($25k)
- [ ] Hank has his original 2 notes
- [ ] Hank has his original 2 tasks
- [ ] Hank has his original 2 opps ($15k + $5k)

---

## Summary Checklist

| Scenario | Rule Created | Matches | Merge Tested | Verified |
|----------|--------------|---------|--------------|----------|
| 1. Custom Field | [ ] | [ ] 3 | [ ] | [ ] |
| 2. Custom Merge Strategy | [ ] | [ ] 2 | [ ] | [ ] |
| 3. Combined Rules | [ ] | [ ] 2 | [ ] | [ ] |
| 4. Restore Test | [ ] | [ ] 1 | [ ] Merge | [ ] |
| 4. Restore Test | N/A | N/A | [ ] Undo | [ ] |

---

## After Testing

Ask Claude to validate:
1. Rules created with correct `merge_settings` structure
2. Match counts per rule
3. Merge history entries
4. Restore/rollback records
