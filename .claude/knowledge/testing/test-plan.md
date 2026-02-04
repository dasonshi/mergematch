# MergeMatch Test Plan

## Overview

Comprehensive test plan covering matching algorithms, merge logic, related records, rollback, field preservation, plan restrictions, and edge cases.

## Test Data Created

Test contacts follow naming convention: `{name} T{XX}-{A/B} {lastname}` where:
- `T{XX}` = test scenario number
- `A` = first contact of pair (often "master")
- `B` = second contact of pair (often "duplicate")

### Test Contacts (56 total)

| Test | Contact A | Email A | Phone A | Contact B | Email B | Phone B |
|------|-----------|---------|---------|-----------|---------|---------|
| T01 | John T01-A Smith | john.t01@mmtest2.io | +15550101 | Johnny T01-B Smith | john.t01@mmtest2.io | +15550102 |
| T02 | Mary T02-A Jones | mary.t02@mmtest2.io | — | Maria T02-B Jones | mary.t02@mmtest2.io | — |
| T03 | Robert T03-A Brown | robert.t03@mmtest2.io | +15550301 | Bob T03-B Brown | bobby.t03@mmtest2.io | +15550302 |
| T04 | Sarah T04-A Wilson | sarah.t04@mmtest2.io | +15550401 | Sara T04-B Wilson | sara.t04@mmtest2.io | +15550402 |
| T05 | Lisa T05-A Chen | lisa.t05@mmtest2.io | +15551234567 | Liz T05-B Chen | liz.t05@mmtest2.io | +15551234567 |
| T06 | David T06-A Lee | david.t06@mmtest2.io | +15559876543 | Dave T06-B Lee | dave.t06@mmtest2.io | +15559876543 |
| T07 | Mike T07-A Garcia | mike.t07@mmtest2.io | +15550701 | Michael T07-B Garcia | michael.t07@mmtest2.io | +15550702 |
| T08 | Amy T08-A Martinez | amy.t08@mmtest2.io | +15550801 | Amy T08-B Martinez | amy.t08@mmtest2.io | +15550802 |
| T09 | Emma T09-A Davis | emma.t09@mmtest2.io | +15550909 | Emma T09-B Davis | emma.t09@mmtest2.io | +15550910 |
| T10 | Frank T10-A Miller | frank.t10@mmtest2.io | +15551010 | Frank T10-B Miller | frankm.t10@mmtest2.io | +15551010 |
| T11 | Grace T11-A Taylor | grace.t11@mmtest2.io | +15551111 | Gracie T11-B Taylor | gracie.t11@mmtest2.io | +15551111 |
| T12 | Henry T12-A White | henry.t12@mmtest2.io | +15551212 | Henry T12-B White | henry.t12@mmtest2.io | +15551212 |
| T13 | Ivy T13-A Clark | ivy.t13@mmtest2.io | +15551313 | Ivy T13-B Clark | ivy.t13@mmtest2.io | +15551314 |
| T14 | Ivy T14-A Clark | ivy.t14@mmtest2.io | — | Ivy T14-B Clark | ivy.t14@mmtest2.io | — |
| T15 | Jack T15-A Adams | jack.t15@mmtest2.io | — | Jack T15-B Adams | jack.t15@mmtest2.io | — |
| T16 | Kate T16-A Robinson | kate.t16@mmtest2.io | — | Kate T16-B Robinson | kate.t16@mmtest2.io | — |
| T17 | Leo T17-A Harris | leo.t17@mmtest2.io | — | Leo T17-B Harris | leo.t17@mmtest2.io | — |
| T18 | Mia T18-A King | mia.t18@mmtest2.io | — | Mia T18-B King | mia.t18@mmtest2.io | — |
| T19 | Noah T19-A Scott | noah.t19@mmtest2.io | — | Noah T19-B Scott | noah.t19@mmtest2.io | — |
| T20 | Olivia T20-A Wright | olivia.t20@mmtest2.io | — | Olivia T20-B Wright | olivia.t20@mmtest2.io | — |
| T21 | Paul T21-A Lopez | paul.t21@mmtest2.io | — | Paul T21-B Lopez | paul.t21@mmtest2.io | — |
| T22-T25 | (Use T14-T17 contacts for rollback tests) |
| T26 | Quinn T26-A Hall | quinn.a@mmtest2.io | +15552626 | Quinn T26-B Hall | quinn.b@mmtest2.io | +15552626 |
| T27 | Rose T27-A Young | rose.t27@mmtest2.io | +15552727 | Rose T27-B Young | rose.t27@mmtest2.io | +15552728 |
| T33 | Sam T33-A Green | — | +15553333 | Sam T33-B Green | — | +15553333 |
| T34-T36 | (Unicode/special character tests - create as needed) |
| T37 | Christopher-Alexander T37-A Test | chris.t37@mmtest2.io | — | Christopher-Alex T37-B Test | chris.t37@mmtest2.io | — |
| T38 | Duplicate T38-A Record | dup.t38@mmtest2.io | — | Duplicate T38-B Record | dup.t38@mmtest2.io | — |
| T39 | Victor T39-A Cruz | victor.t39@mmtest2.io | +442079460958 | Victor T39-B Cruz | vic.t39@mmtest2.io | +1442079460958 |

### Related Records Created

**Notes** (on T13-A contact):
- Note 1: "Important client note"
- Note 2: "Follow up required"
- Note 3: "Meeting scheduled"

**Tasks** (on T13-A contact):
- Task 1: "Call client" (due in 7 days)
- Task 2: "Send proposal" (due in 14 days)
- Task 3: "Schedule demo" (due in 21 days)

**Opportunities** (linked to various contacts):
- 17 opportunities across test contacts for pipeline testing

---

## Test Scenarios

### Phase 1: Basic Matching (T01-T12)

| ID | Name | Rule Config | Expected | Status |
|----|------|-------------|----------|--------|
| T01 | Email Exact Match | Email=Exact, AND | John/Johnny match at 100% | PASS |
| T02 | Fuzzy Name Match | Name=Fuzzy, AND | Mary/Maria match ~94% | PASS |
| T03 | No Match - Different Email | Email=Exact, AND | Robert/Bob NO match | PASS |
| T04 | Fuzzy Name Below Threshold | Name=Fuzzy90, AND | Sarah/Sara NO match (<90%) | PASS |
| T05 | Phone Exact Match | Phone=Phone, AND | Lisa/Liz match | PASS |
| T06 | Phone + Name Fuzzy | Phone=Phone AND Name=Fuzzy | David/Dave match | PASS |
| T07 | Different Phone No Match | Phone=Phone, AND | Mike/Michael NO match | PASS |
| T08 | Same Email Different Phone | Email=Exact, AND | Amy/Amy match (phone ignored) | PASS |
| T09 | AND Logic - Both Required | Email=Exact AND Phone=Phone | Emma match only if BOTH | PASS |
| T10 | OR Logic - Either Sufficient | Email=Exact OR Phone=Phone | Frank match via phone | PASS |
| T11 | Mixed AND+OR | Email=AND, Phone=OR | Grace match via phone (OR path) | PASS |
| T12 | All Fields Match | Email=Exact AND Phone=Phone | Henry 100% match | PASS |

**Note**: Related records tests (T13-T17) require the rule to have `merge_settings.related_records` configured (e.g., T10 OR rule has this).

### Phase 2: Merge & Related Records (T13-T21)

| ID | Name | Test | Expected | Status |
|----|------|------|----------|--------|
| T13 | Basic Merge | Merge T13-A into T13-B | T13-B deleted, data merged to T13-A | PASS |
| T14 | Notes Reassigned | Merge with notes | Notes move to master | PASS |
| T15 | Tasks Reassigned | Merge with tasks | Tasks move to master | PASS |
| T16 | Opportunities Reassigned | Merge with opportunities | Opps move to master | PASS |
| T17 | All Related Records | Merge with all types | All records reassigned | SKIP (covered by T14-T16) |
| T18 | Snapshot Created | Check merge snapshot | Pre-merge state saved | — |
| T19 | Field Selection | Choose fields from each | Correct fields merged | — |
| T20 | Master Selection | Test master strategies | Correct record survives | — |
| T21 | Merge History | Check merge record | History shows details | — |

### Phase 3: Undo/Rollback (T22-T25)

| ID | Name | Test | Expected | Status |
|----|------|------|----------|--------|
| T22 | Basic Rollback | Undo T14 merge | Duplicate restored | PASS |
| T23 | Related Records Restored | Check notes after rollback | Notes back on original | — |

**Note**: On rollback, notes/tasks are RECREATED (duplicated on both contacts), but opportunities are REASSIGNED (moved back).
| T24 | Rollback Window | Try rollback after 30 days | Should fail | — |
| T25 | Multiple Rollbacks | Rollback several merges | All restore correctly | — |

### Phase 4: Field Preservation (T26-T27)

| ID | Name | Test | Expected | Status |
|----|------|------|----------|--------|
| T26 | Preserve Email | Set email preservation | Email not overwritten | — |
| T27 | Preserve Phone | Set phone preservation | Phone not overwritten | — |

### Phase 5: Plan Restrictions (T28-T32)

| ID | Name | Test | Expected | Status |
|----|------|------|----------|--------|
| T28 | Free - 3 Merge Limit | Merge 4th time on Free | Blocked | — |
| T29 | Free - No Auto-Merge | Try auto-merge on Free | Blocked | — |
| T30 | Starter - Unlimited Merges | Merge many on Starter | Allowed | — |
| T31 | Pro - Scheduled Scans | Create scheduled scan | Allowed | — |
| T32 | Pro - Auto-Merge | Enable auto-merge | Allowed | — |

### Phase 6: Edge Cases (T33-T40)

| ID | Name | Test | Expected | Status |
|----|------|------|----------|--------|
| T33 | Phone Only Match | No email, same phone | Match found | PASS |
| T34 | Unicode Names | Names with accents | Match correctly | — |
| T35 | Empty Fields | Blank email/phone | Handled gracefully | — |
| T36 | Special Characters | Email with + or . | Normalized correctly | — |
| T37 | Long Names | 50+ character names | No truncation issues | PASS |
| T38 | Duplicate of Duplicate | A matches B matches C | Chain handled | — |
| T39 | International Phone | +44 vs +1 prefix | Match with normalization | PASS (95%) |
| T40 | Case Sensitivity | JOHN vs john | Case insensitive | — |

### Phase 7: Stress/Performance (T41-T44)

| ID | Name | Test | Expected | Status |
|----|------|------|----------|--------|
| T41 | 1000 Contacts Scan | Scan large dataset | Completes <30s | — |
| T42 | 100 Pending Matches | Load matches page | Renders smoothly | — |
| T43 | Bulk Merge 50 | Merge all at once | All complete | — |
| T44 | Concurrent Scans | 2 rules scanning | No conflicts | — |

---

## Current Progress

**Completed**:
- T01-T12 (Phase 1: Basic Matching) - ALL PASS
- T13 (Basic Merge) - PASS
- T14 (Notes Reassigned) - PASS (requires rule with `merge_settings.related_records.notes: "copy_to_master"`)
- T15 (Tasks Reassigned) - PASS
- T16 (Opportunities Reassigned) - PASS

**Bugs Found & Fixed During Testing**:
1. **OR confidence calculation** - Non-matching OR fields were penalizing confidence. Fixed in `matching_service.py`.
2. **Mixed AND+OR confidence** - Failed AND fields dragged down OR-path matches. Fixed to exclude failed AND fields when match is via OR path.
3. **Pagination limit** - Pending Matches page only showed 50 results. Fixed to fetch 1000.
4. **Dashboard unique contacts** - Was double-counting contacts across rules. Fixed to count unique contact IDs with pagination.

**Bugs Found - NOT YET FIXED**:
5. **Rollback doesn't auto-update matches** - When rollback restores a contact, GHL fires `contact.create` webhook but pending matches are not recalculated. User must manually scan. (Found during T13/T14 testing)

**Next Up**: T15-T17 (Tasks, Opportunities, All Related Records), then T22-T25 (Rollback tests)

---

## How to Resume Testing

1. **Read this document** to understand current state
2. **Check test data exists** in GHL - contacts should have T01-T39 naming
3. **Check existing rules** - some test rules may already exist
4. **Continue from current progress** - start at T12 or wherever marked incomplete
5. **Update Status column** as tests pass/fail
6. **Document any bugs** found in the "Bugs Found" section

---

## Test Rules Reference

Rules that should exist (or need to be created):

| Rule Name | Config | For Tests |
|-----------|--------|-----------|
| T01 - Email Exact | Email=Exact, AND | T01, T03 |
| T02 - Name Fuzzy | Name=Fuzzy, AND | T02 |
| T05 - Phone Match | Phone=Phone, AND | T05, T07 |
| T09 - AND Logic | Email=Exact AND Phone=Phone | T09 |
| T10 - OR Logic | Email=Exact OR Phone=Phone | T10 |
| T11 - Mixed AND OR | Email=AND, Phone=OR | T11 |
| T12 - All Match | Email=Exact AND Phone=Phone | T12 |

Note: The T10 rule currently has Email=AND, Phone=OR (mixed), which works for testing OR behavior because the OR path is used when AND fails.
