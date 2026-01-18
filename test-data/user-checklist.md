# MergeMatch Manual Test Checklist

## Prerequisites
- [ ] Plan set to "pro" in database
- [ ] Agent has created all test data (12 contacts, notes, tasks, opportunities)
- [ ] Logged into MergeMatch at https://merge-match.vercel.app

---

## Test 1: Basic Exact Match (No Related Records)
**Test Data:** John Smith / John A Smith (pair-01)

### Steps:
1. [ ] Go to Dashboard → Create Match Rule
2. [ ] Name: "Test 1 - Basic Exact Match"
3. [ ] Object Type: Contacts
4. [ ] Add condition: Email = Exact Match
5. [ ] Step 3 (Strategy): Leave defaults (don't copy anything)
6. [ ] Click "Create Rule & Scan for Duplicates"

### Expected:
- [ ] 1 match found (John Smith pair)
- [ ] Click on match to view details
- [ ] Select "John Smith" as master
- [ ] Click Merge

### Verify:
- [ ] "John A Smith" no longer exists in GHL
- [ ] "John Smith" still exists with original data
- [ ] Check History page shows the merge

---

## Test 2: Notes Copy to Master
**Test Data:** Mike Wilson / Michael Wilson (pair-02)
- Mike has 2 notes
- Michael has 1 note

### Steps:
1. [ ] Create new rule: "Test 2 - Notes Copy"
2. [ ] Email = Exact Match
3. [ ] Step 3: Notes = "Copy all to master"
4. [ ] Create & Scan

### Expected:
- [ ] 1 match found

### Merge & Verify:
1. [ ] Select "Mike Wilson" as master
2. [ ] Click Merge
3. [ ] Go to GHL → Mike Wilson → Notes
4. [ ] **Should have 3 notes total** (2 original + 1 from Michael)

---

## Test 3: Tasks Copy to Master
**Test Data:** Sarah Johnson / Sara Johnson (pair-03)
- Sarah has 1 task
- Sara has 2 tasks

### Steps:
1. [ ] Create new rule: "Test 3 - Tasks Copy"
2. [ ] Email = Exact Match
3. [ ] Step 3: Tasks = "Copy all to master"
4. [ ] Create & Scan

### Merge & Verify:
1. [ ] Select "Sarah Johnson" as master
2. [ ] Merge
3. [ ] Go to GHL → Sarah Johnson → Tasks
4. [ ] **Should have 3 tasks total**

---

## Test 4: Opportunities - Keep All
**Test Data:** Emily Davis / Emily R Davis (pair-04)
- Emily has: Website Redesign ($5,000)
- Emily R has: SEO Package ($2,500)

### Steps:
1. [ ] Create new rule: "Test 4 - Opps Keep All"
2. [ ] Email = Exact Match
3. [ ] Step 3: Opportunities = "Keep all from both records"
4. [ ] Create & Scan

### Merge & Verify:
1. [ ] Select "Emily Davis" as master
2. [ ] Merge
3. [ ] Go to GHL → Emily Davis → Opportunities
4. [ ] **Should have 2 opportunities**
5. [ ] **Total value: $7,500**

---

## Test 5: Opportunities - Keep Highest Value
**Test Data:** Recreate Emily pair OR use different rule on same data

### Steps:
1. [ ] Create new rule: "Test 5 - Opps Highest"
2. [ ] Email = Exact Match
3. [ ] Step 3: Opportunities = "Keep highest monetary value"
4. [ ] Create & Scan

### Merge & Verify:
1. [ ] Merge the pair
2. [ ] **Only $5,000 opportunity should remain**
3. [ ] $2,500 opportunity should NOT be transferred

---

## Test 6: Custom Logic - Value >= $1,000
**Test Data:** Lisa Chen / Lisa M Chen (pair-06)

Opportunities:
- Lisa: Enterprise ($15k), Small ($500)
- Lisa M: Medium ($3k), Tiny ($200)

### Steps:
1. [ ] Create new rule: "Test 6 - Custom Value Threshold"
2. [ ] Email = Exact Match
3. [ ] Step 3: Opportunities = "Custom logic"
4. [ ] Add condition: Monetary Value >= 1000
5. [ ] Create & Scan

### Merge & Verify:
1. [ ] Select "Lisa Chen" as master
2. [ ] Merge
3. [ ] Check opportunities on master:
   - [ ] **Enterprise ($15,000) - KEPT**
   - [ ] **Medium ($3,000) - KEPT**
   - [ ] Small ($500) - NOT transferred
   - [ ] Tiny ($200) - NOT transferred
4. [ ] **Total: 2 opportunities, $18,000**

---

## Test 7: Custom Logic - NOT Lost Stage
**Test Data:** David Brown / Dave Brown (pair-05)

Opportunities:
- David: Consulting ($8k, Won)
- Dave: Training ($4k, Lost)

### Steps:
1. [ ] Create new rule: "Test 7 - Not Lost Stage"
2. [ ] Email = Exact Match
3. [ ] Step 3: Opportunities = "Custom logic"
4. [ ] Add condition: Pipeline Stage != [Lost stage]
5. [ ] Create & Scan

### Merge & Verify:
1. [ ] Select "David Brown" as master
2. [ ] Merge
3. [ ] Check opportunities:
   - [ ] **Consulting ($8,000, Won) - KEPT**
   - [ ] Training ($4,000, Lost) - NOT transferred
4. [ ] **Total: 1 opportunity, $8,000**

---

## Test 8: Custom Logic - AND Conditions
**Test Data:** Lisa Chen pair (recreate if needed)

### Steps:
1. [ ] Create new rule: "Test 8 - AND Conditions"
2. [ ] Email = Exact Match
3. [ ] Step 3: Opportunities = "Custom logic"
4. [ ] Set to match ALL conditions
5. [ ] Condition 1: Monetary Value >= 1000
6. [ ] Condition 2: Pipeline Stage != [Lost stage]
7. [ ] Create & Scan

### Expected Outcome:
| Opportunity | Value | Stage | Kept? |
|-------------|-------|-------|-------|
| Enterprise | $15,000 | Proposal | ✅ Yes |
| Medium | $3,000 | Won | ✅ Yes |
| Small | $500 | Qualified | ❌ No (value) |
| Tiny | $200 | Lost | ❌ No (both) |

---

## Test 9: Recovery/Undo Test

### Steps:
1. [ ] Go to History page
2. [ ] Find any recent merge
3. [ ] Click "Undo" or "Restore"
4. [ ] Confirm the action

### Verify:
- [ ] Duplicate contact is restored in GHL
- [ ] Opportunities are restored to original contact
- [ ] Match status changes back to "pending"

---

## Test Results Summary

| Test | Status | Notes |
|------|--------|-------|
| 1. Basic Match | ⬜ | |
| 2. Notes Copy | ⬜ | |
| 3. Tasks Copy | ⬜ | |
| 4. Opps Keep All | ⬜ | |
| 5. Opps Highest | ⬜ | |
| 6. Custom Value | ⬜ | |
| 7. Custom Stage | ⬜ | |
| 8. AND Conditions | ⬜ | |
| 9. Recovery | ⬜ | |

---

## Troubleshooting

### Match not found
- Check contacts exist in GHL
- Verify emails match exactly
- Run scan again

### Merge fails
- Check browser console for errors
- Verify GHL token is valid
- Ask Claude to check backend logs

### Related records not transferred
- Verify merge_settings saved correctly (ask Claude to check DB)
- Check GHL API permissions
