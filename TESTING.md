# MergeMatch Testing Checklist

> Pre-launch testing guide for QA validation

## Test Environment

| Environment | URL |
|-------------|-----|
| Frontend | https://merge-match.vercel.app |
| Backend | Render (auto-deploy from main) |
| Database | Supabase |

---

## 1. Authentication & OAuth

### 1.1 Fresh Install Flow
- [ ] Visit app without auth - shows disconnected state
- [ ] Click install/connect - redirects to GHL OAuth
- [ ] Complete OAuth - redirects back with tokens
- [ ] Dashboard loads with location name displayed

### 1.2 SSO Flow (iframe)
- [ ] App loads inside GHL custom page
- [ ] SSO auto-authenticates using encrypted user data
- [ ] No manual login required

### 1.3 Token Refresh
- [ ] After 1 hour, API calls still work (token auto-refreshes)
- [ ] If refresh fails, shows "Token Expired" and reconnect button

---

## 2. Free Tier Restrictions

### 2.1 Rule Limits
- [ ] Free account can create 1 match rule
- [ ] Attempting to create 2nd rule shows upgrade prompt (403 error)
- [ ] Free account CANNOT edit existing rule (403 error)
- [ ] Free account CANNOT delete existing rule (403 error)

### 2.2 Object Type Restrictions
- [ ] Contacts: Available for free
- [ ] Companies: Shows lock icon, requires Starter+
- [ ] Opportunities: Shows lock icon, requires Pro+
- [ ] Custom Objects: Shows lock icon + "Custom" badge, requires Pro+

### 2.3 Feature Restrictions
- [ ] Scheduled scans: Manual only for free
- [ ] Auto-merge: Disabled for free (all matches require review)
- [ ] Custom strategies: Shows lock, requires Pro+

---

## 3. Match Rule Creation

### 3.1 Basic Creation
- [ ] Enter rule name (max 100 chars)
- [ ] Select object type (Contacts for free)
- [ ] Add match fields (e.g., email exact, name fuzzy)
- [ ] Select merge strategy
- [ ] Click "Create Rule"
- [ ] Button shows "Creating & Scanning..."
- [ ] Toast shows "Rule created. Scanned X records, found Y duplicates."

### 3.2 Auto-Scan on Creation
- [ ] Initial scan runs automatically after rule creation
- [ ] Scan results displayed in success toast
- [ ] Matches appear on rule detail page immediately

### 3.3 Match Field Logic
- [ ] AND conditions: Both must match
- [ ] OR conditions: Either can match
- [ ] Logic preview shows correct expression

---

## 4. Match Rule Detail Page

### 4.1 Rule Summary Card
- [ ] Shows object type, strategy, status, fields
- [ ] Shows thresholds (Auto/Review percentages)
- [ ] Shows schedule frequency
- [ ] Shows last scan timestamp

### 4.2 Pending Matches Display
- [ ] **Matches table shows:**
  - [ ] Record A (name, email/phone)
  - [ ] Record B (name, email/phone)
  - [ ] Confidence score with color coding
  - [ ] Review and Merge buttons
- [ ] Matches count in header is accurate
- [ ] Clicking "Review" goes to match review page
- [ ] Clicking "Merge" performs quick merge

### 4.3 Scan Functionality
- [ ] "Scan Now" button triggers scan
- [ ] Shows scanning state while running
- [ ] Toast shows results (matches found, records scanned)
- [ ] Matches list updates after scan

### 4.4 Bulk Merge
- [ ] "Merge All" validates matches first
- [ ] Shows progress during bulk merge
- [ ] "Abort" button stops mid-merge
- [ ] Completion toast shows success/fail counts

---

## 5. Match Review Page

### 5.1 Record Comparison
- [ ] Shows both records side-by-side
- [ ] Confidence badge with correct color
- [ ] All fields displayed with values

### 5.2 Field Selection
- [ ] Click cells to select values
- [ ] Selected values highlighted with checkmark
- [ ] Result column shows selected values

### 5.3 Master Record Selection
- [ ] Toggle between Record A and Record B as master
- [ ] Star icon shows on selected master
- [ ] Warning shows which record will be deleted

### 5.4 Field Preservation (if configured)
- [ ] Checkbox to preserve alternate values
- [ ] Only shows if rule has preservation configured

### 5.5 Merge Execution
- [ ] "Confirm Merge" executes merge
- [ ] Success redirects back to rule detail
- [ ] Merged contact removed from pending list

---

## 6. Merge History

### 6.1 History List
- [ ] Shows all past merges
- [ ] Status badges: Merged (green), Restored (amber), Failed (red)
- [ ] Shows master record name
- [ ] Shows timestamp

### 6.2 Merge Detail
- [ ] Shows full snapshots of both records
- [ ] Shows field selections made
- [ ] Shows metadata (who, when, rule)

### 6.3 Rollback
- [ ] "Restore" button on completed merges
- [ ] Confirmation dialog before restore
- [ ] Restores deleted contact in GHL
- [ ] Updates status to "Restored"

---

## 7. Scanning Limits

### 7.1 Plan-Based Limits
| Plan | Max Records | Expected Behavior |
|------|-------------|-------------------|
| Free | 1,000 | Scans up to 1,000 contacts |
| Starter | 99,999 | Scans all contacts |
| Pro | 99,999 | Scans all contacts |
| Agency | 99,999 | Scans all contacts |

### 7.2 Large Dataset Test
- [ ] Account with 10,000+ contacts
- [ ] Scan completes without timeout
- [ ] All matches found and displayed
- [ ] Performance acceptable (< 60 seconds)

---

## 8. Settings Page

### 8.1 Connection Section
- [ ] Shows CRM status (Connected/Disconnected)
- [ ] Shows Location ID
- [ ] Shows Location Name
- [ ] Reconnect button works

### 8.2 Subscription Section
- [ ] Shows current plan name
- [ ] Shows trial status if applicable
- [ ] **Upgrade button:**
  - [ ] Links to correct marketplace URL
  - [ ] Format: `https://marketplace.gohighlevel.com/app/{APP_ID}?locationId={LOCATION_ID}`
  - [ ] Opens in new tab

### 8.3 Danger Zone
- [ ] Force Resync confirmation dialog
- [ ] Delete All Data confirmation dialog
- [ ] Disconnect Account confirmation dialog

---

## 9. Notifications

### 9.1 Bell Icon
- [ ] Shows unread count badge
- [ ] Clicking opens notification dropdown
- [ ] Notifications list shows recent items

### 9.2 Bulk Merge Notifications
- [ ] After bulk merge, notification created
- [ ] Shows rule name, success/fail counts
- [ ] Clicking navigates to relevant page

### 9.3 Mark as Read
- [ ] Click notification marks as read
- [ ] "Mark all read" clears all

---

## 10. Error Handling

### 10.1 API Errors
- [ ] Network error shows toast
- [ ] 401 triggers token refresh or logout
- [ ] 403 shows upgrade/permission message
- [ ] 500 shows generic error message

### 10.2 Stale Data Handling
- [ ] Deleted contacts detected during validation
- [ ] Stale matches auto-cleaned
- [ ] User notified of cleaned matches

---

## 11. Edge Cases

### 11.1 Empty States
- [ ] No rules: Shows empty state with CTA
- [ ] No matches: Shows "No pending matches" message
- [ ] No history: Shows "No merges performed" message

### 11.2 Duplicate Prevention
- [ ] Same contact pair doesn't create duplicate match
- [ ] Re-scanning doesn't duplicate existing pending matches

### 11.3 Concurrent Operations
- [ ] Multiple browser tabs work correctly
- [ ] Data refreshes after operations in other tabs

---

## Known Issues / Workarounds

| Issue | Workaround | Status |
|-------|------------|--------|
| - | - | - |

---

## Test Results

| Tester | Date | Environment | Pass/Fail | Notes |
|--------|------|-------------|-----------|-------|
| | | | | |

---

## Sign-off

- [ ] All critical tests pass
- [ ] Free tier restrictions verified
- [ ] Paid tier features work (if testable)
- [ ] No blocking issues found

**Approved for launch:** ______________________ Date: __________
