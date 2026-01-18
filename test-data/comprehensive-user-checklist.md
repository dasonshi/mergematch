# MergeMatch Comprehensive Test Checklist

## Test Dataset Overview

| Rule | Match Type | Contact Range | Expected Matches | Merge Strategy |
|------|------------|---------------|------------------|----------------|
| 1 | Exact Email | c001-c030 | 15 pairs | Standard |
| 2 | Exact Phone | c031-c050 | 10 pairs | Notes copy |
| 3 | Name + Company | c051-c070 | 10 pairs | Tasks copy |
| 4 | Email (opps test) | c071-c086 | 8 pairs | Keep all opps |
| 5 | Email (custom) | c087-c100 | 7 pairs | Custom logic |

---

## Test 1: Exact Email Match (15 pairs)

**Contacts:** John Smith through Steve Walker (c001-c030)

### Create Rule:
1. Name: "Test 1 - Exact Email"
2. Object: Contacts
3. Match Field: Email = Exact Match
4. Merge Strategy: Standard (no related records settings)

### Expected:
- [ ] 15 matches found
- [ ] All pairs have 100% confidence score

### Merge Test:
- [ ] Merge 2-3 pairs
- [ ] Verify duplicates deleted in GHL
- [ ] Verify masters retained

---

## Test 2: Exact Phone Match (10 pairs)

**Contacts:** Tom Hall through Steph Hill (c031-c050)
**Notes:** 10 notes distributed across these contacts

### Create Rule:
1. Name: "Test 2 - Phone Match + Notes"
2. Object: Contacts
3. Match Field: Phone = Exact Match
4. Merge Strategy: Notes = "Copy all to master"

### Expected:
- [ ] 10 matches found

### Merge Test:
- [ ] Merge Tom Hall pair (c031-c032)
- [ ] Master should have 2 notes total
- [ ] Merge another pair with notes
- [ ] Verify notes copied correctly

---

## Test 3: Name + Company Match (10 pairs)

**Contacts:** Bill Baker through Sam Evans (c051-c070)
**Tasks:** 10 tasks distributed across these contacts

### Create Rule:
1. Name: "Test 3 - Name Company + Tasks"
2. Object: Contacts
3. Match Fields:
   - First Name = Fuzzy Match (40% weight)
   - Last Name = Exact Match (30% weight)
   - Company = Exact Match (30% weight)
4. Merge Strategy: Tasks = "Copy all to master"

### Expected:
- [ ] 10 matches found
- [ ] Confidence scores vary based on name similarity

### Merge Test:
- [ ] Merge Bill Baker pair (c051-c052)
- [ ] Master should have 2 tasks total
- [ ] Verify task details preserved

---

## Test 4: Keep All Opportunities (8 pairs)

**Contacts:** Alex Morgan through Ave Torres (c071-c086)
**Opportunities:** 16 opportunities across these contacts

### Create Rule:
1. Name: "Test 4 - Keep All Opps"
2. Object: Contacts
3. Match Field: Email = Exact Match
4. Merge Strategy: Opportunities = "Keep all from both records"

### Expected:
- [ ] 8 matches found

### Merge Test (Alex Morgan - c071/c072):
- [ ] c071 has: Website Project ($5,000)
- [ ] c072 has: SEO Package ($2,500)
- [ ] After merge: Master has BOTH opps ($7,500 total)

### Additional Verifications:
- [ ] Merge Casey Reed pair - should have App Dev ($15k) + Maintenance ($3k)
- [ ] Merge Jordan Cooper pair - should have Social Media ($8k) + Content ($4.5k)
- [ ] Total value after all 8 merges: ~$249,300

---

## Test 5: Custom Logic Opportunities (7 pairs)

**Contacts:** Parker Peterson through Fin Bennett (c087-c100)
**Opportunities:** 20 opportunities with mixed values and stages

### Create Rule:
1. Name: "Test 5 - Custom Opp Logic"
2. Object: Contacts
3. Match Field: Email = Exact Match
4. Merge Strategy:
   - Notes = "Copy all to master"
   - Tasks = "Copy all to master"
   - Opportunities = "Custom logic"
5. Custom Logic:
   - Match: ALL conditions
   - Condition 1: Monetary Value >= 1000
   - Condition 2: Status != lost

### Expected:
- [ ] 7 matches found

### Merge Test (Parker Peterson - c087/c088):
| Opportunity | Value | Stage | Expected |
|-------------|-------|-------|----------|
| VR Experience - Enterprise | $75,000 | Proposal | KEPT |
| VR Demo Kit | $500 | Qualified | FILTERED |
| VR Training Module | $15,000 | Won | KEPT |
| VR Accessories | $300 | Lost | FILTERED |

After merge: Master should have 2 opps totaling $90,000

### More Custom Logic Tests:

**Charlie Gray pair (c089-c090):**
| Opp | Value | Stage | Expected |
|-----|-------|-------|----------|
| Drone Fleet | $45,000 | Proposal | KEPT |
| Pilot Training | $8,000 | Qualified | KEPT |
| Drone Repair | $400 | Lost | FILTERED |

Result: 2 opps, $53,000

**Jamie James pair (c093-c094):**
| Opp | Value | Stage | Expected |
|-----|-------|-------|----------|
| Satellite Project | $250,000 | Proposal | KEPT |
| Research Grant | $50,000 | Lost | FILTERED |

Result: 1 opp, $250,000 (the $50k lost one is filtered!)

---

## Test 6: Recovery/Undo Test

### Steps:
1. [ ] Go to History page
2. [ ] Find a recent merge
3. [ ] Click "Undo" / "Restore"
4. [ ] Confirm action

### Verify:
- [ ] Duplicate contact is recreated in GHL
- [ ] All opportunities restored to original contacts
- [ ] Match pair status changes back to "pending"
- [ ] Can re-merge the same pair

---

## Summary Checklist

| Test | Rule Created | Matches Found | Merges Tested | Verified |
|------|--------------|---------------|---------------|----------|
| 1. Exact Email | [ ] | [ ] 15 | [ ] | [ ] |
| 2. Phone + Notes | [ ] | [ ] 10 | [ ] | [ ] |
| 3. Name/Company + Tasks | [ ] | [ ] 10 | [ ] | [ ] |
| 4. Keep All Opps | [ ] | [ ] 8 | [ ] | [ ] |
| 5. Custom Logic | [ ] | [ ] 7 | [ ] | [ ] |
| 6. Recovery | N/A | N/A | [ ] | [ ] |

**Total Expected Matches:** 50 pairs

---

## After Testing

Ask Claude to run validation queries:
1. Confirm all rules created with correct settings
2. Verify match counts per rule
3. Check merge history for completed merges
4. Validate rollback records if any
