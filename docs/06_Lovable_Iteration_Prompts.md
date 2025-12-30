# MergeMatch - Lovable Iteration Prompts (Round 2)

**Version**: 1.0
**Created**: December 28, 2024
**Purpose**: Fix issues from initial Lovable build

---

## Issue Summary

| # | Issue | Page |
|---|-------|------|
| 1 | Add Email Notifications section | Settings |
| 2 | Match rules need custom name field | Create/Edit Rule |
| 3 | Edit Rule page not built | Match Rules |
| 4 | Review button doesn't work on pending matches | Match Rule Detail |
| 5 | Filters don't work on merge history | History |
| 6 | Dashboard needs friendlier design | Dashboard |

---

## Iteration 1: Settings - Add Email Notifications

```
Update the Settings page to add a NOTIFICATIONS section. Place it BEFORE the Preferences section.

NOTIFICATIONS SECTION:
─────────────────────────────────────────
Email Notifications:
☑ Daily summary of pending matches
☑ Alert when new duplicates are found
☑ Weekly merge activity report
☐ Alert on auto-merge completion (Pro+ only - show disabled/grayed)

Notification Email: [user@agency.com] (text input, prefilled if available)

[Save Notification Settings] button

STYLING:
- Use checkboxes for each notification type
- The "auto-merge completion" option should be visually disabled (grayed out) with "(Pro+ only)" label for non-Pro users
- Email input should have validation for email format
- Show success toast on save: "Notification settings saved"

DO NOT add any API key fields. Authentication is handled via GHL OAuth.
```

---

## Iteration 2: Match Rules - Custom Names

```
On the Create/Edit Match Rule page, ensure the Rule Name field is prominent and working:

1. Rule Name should be the FIRST field in the form
2. It should be a required text input with placeholder: "e.g., Email + Phone Match"
3. Max length: 100 characters
4. Show character count: "23/100"

When viewing Match Rules list, the rule name should be:
- The main title of each card (large, bold)
- Clickable to navigate to the rule detail page

When viewing Match Rule Detail page:
- Rule name is the page title
- [Edit Rule] button navigates to /match-rules/:id/edit where the name can be changed

Ensure names are NOT auto-generated from field selections. Users choose their own name.
```

---

## Iteration 3: Edit Rule Page

```
Create the Edit Match Rule page at route: /match-rules/:id/edit

This should be the SAME layout as Create Match Rule (/match-rules/new), but:

1. PRE-POPULATED with existing rule data:
   - Rule Name (editable)
   - Object Type (LOCKED - show as disabled dropdown or plain text with lock icon)
   - Match Fields (editable - can add/remove/modify)
   - Match Logic (editable)
   - Merge Strategy (editable)
   - Schedule (editable)

2. Page title: "Edit Match Rule" (not "Create Match Rule")

3. Back link: "← [Rule Name]" (links to /match-rules/:id)

4. Footer buttons:
   - [Cancel] - returns to rule detail page
   - [Save Changes] - saves and returns to rule detail page

5. Object Type is LOCKED because changing it would invalidate all existing matches. Show tooltip: "Object type cannot be changed. Create a new rule for a different object."

6. Navigation flow:
   - Match Rule Detail → [Edit Rule] button → Edit page
   - Edit page → [Save] or [Cancel] → Back to Match Rule Detail
```

---

## Iteration 4: Review Button on Pending Matches

```
Fix the [Review] button on pending match cards in Match Rule Detail page.

CURRENT ISSUE: The Review button doesn't navigate anywhere.

FIX:
1. [Review] button should navigate to: /match-rules/:ruleId/review/:matchId
2. Each pending match card needs a unique matchId
3. The route should open the Match Review page (Prompt 6)

CARD STRUCTURE (for reference):
┌─────────────────────────────────────────────────────────────────────┐
│  John Smith ← Jon Smith                             98% confidence  │
│  ─────────────────────────────────────────────────────────────────  │
│  john@acme.com        │ jon.smith@acme.com                          │
│  +1 555-0123          │ +1 555-0123                                 │
│                                              [Review]    [Merge]    │
└─────────────────────────────────────────────────────────────────────┘

BUTTON BEHAVIORS:
- [Review] → Navigate to /match-rules/{ruleId}/review/{matchId}
- [Merge] → Open merge confirmation modal, then execute merge

For now, use mock matchIds like "match-1", "match-2", etc. for the demo data.

Also ensure the Match Review page has a working back link:
- "← [Rule Name]" that returns to /match-rules/:ruleId
```

---

## Iteration 5: History Page Filters

```
Make the filter dropdowns on the History page functional.

FILTER ROW:
[All Rules ▾] | [All Objects ▾] | [Last 30 days ▾] | [🔍 Search]

IMPLEMENTATION:

1. ALL RULES DROPDOWN:
   - Options: "All Rules", "Email + Phone Match", "Company Domain Match", "Phone Number Match"
   - When selected, filter table to only show merges from that rule
   - Use React state to track selection

2. ALL OBJECTS DROPDOWN:
   - Options: "All Objects", "Contacts", "Companies"
   - When selected, filter table by object type

3. DATE RANGE DROPDOWN:
   - Options: "Last 7 days", "Last 30 days", "Last 90 days", "All time"
   - When selected, filter table by date
   - Use current date to calculate ranges

4. SEARCH INPUT:
   - Filter table rows where master OR merged name/email contains search text
   - Debounce input (300ms)
   - Clear button (X) when text is present

5. COMBINED FILTERS:
   - All filters should work together (AND logic)
   - If no results, show: "No merges found matching your filters" with [Clear Filters] button

6. RESULTS COUNT:
   - Update the footer: "Showing X of Y" to reflect filtered results

For the demo, filter the mock data in the frontend. The real API integration will come later.
```

---

## Iteration 6: Dashboard Redesign

```
Completely redesign the Dashboard to be more user-friendly and visually appealing. The current design looks too technical. Make it feel like a modern SaaS product that non-technical users would enjoy using.

DESIGN PRINCIPLES:
- Clean, spacious layout with generous whitespace
- Friendly, welcoming tone
- Visual hierarchy that guides the eye
- Icons and subtle color to add warmth
- Cards with soft shadows instead of dense tables

NEW LAYOUT:

HEADER:
┌─────────────────────────────────────────────────────────────────────┐
│  Welcome back! 👋                                                    │
│  Acme Agency • loc_abc123                     ● Connected   [Sync]  │
└─────────────────────────────────────────────────────────────────────┘

QUICK STATS (3 cards in a row):
┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│  📊 Pending Review   │  │  ✅ Merged This Week │  │  📁 Total Records    │
│                      │  │                      │  │                      │
│  40 matches          │  │  53 duplicates       │  │  14,051              │
│  across 3 rules      │  │  removed             │  │  synced              │
│                      │  │                      │  │                      │
│  [Review Now →]      │  │  [View History →]    │  │  Contacts: 12,847    │
│                      │  │                      │  │  Companies: 1,204    │
└──────────────────────┘  └──────────────────────┘  └──────────────────────┘

YOUR MATCH RULES:
┌─────────────────────────────────────────────────────────────────────┐
│  YOUR MATCH RULES                                     [+ New Rule]  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 📋 Email + Phone Match                           23 pending → │  │
│  │    Contacts • Runs daily at 6am • Last: 2h ago               │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 🏢 Company Domain Match                          12 pending → │  │
│  │    Companies • Manual only • Last: 1d ago                    │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 📞 Phone Number Match                             5 pending → │  │
│  │    Contacts • Runs daily at 6am • Last: 2h ago               │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

RECENT ACTIVITY:
┌─────────────────────────────────────────────────────────────────────┐
│  RECENT ACTIVITY                                  [View All →]      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ✓  Merged John Smith ← Jon Smith              2:34 PM    [View]   │
│  ✓  Merged jane@acme.com ← jane.d@acme         1:12 PM    [View]   │
│  ✓  Merged Acme Corp ← 2 duplicates            Yesterday  [View]   │
│  ✓  Merged mike@test.com ← mikey@test          Yesterday  [View]   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

STYLING NOTES:
- Use soft card shadows (shadow-sm or shadow-md)
- Rounded corners (rounded-lg)
- Primary color for CTAs and important numbers
- Green checkmarks for completed merges
- Hover states on clickable cards
- Subtle background (bg-slate-50 or bg-gray-50)
- Clean sans-serif typography
- Adequate padding inside cards (p-6)
- The "pending" count should be a badge/pill style
- Make rule cards clickable (entire card, not just arrow)

REMOVE:
- Dense summary metrics table format
- Technical jargon
- Cluttered appearance
- The upgrade banner (move to sidebar or settings)

This should feel like a dashboard for Notion, Linear, or Stripe - polished and approachable.
```

---

## Order of Operations

Apply these prompts in order:

1. **Iteration 6** (Dashboard) - Most visible, sets the tone
2. **Iteration 1** (Settings notifications) - Quick win
3. **Iteration 3** (Edit Rule page) - Core functionality
4. **Iteration 2** (Custom names) - May already work, verify
5. **Iteration 4** (Review button) - Routing fix
6. **Iteration 5** (History filters) - State management

---

*Document generated for MergeMatch frontend iteration using Lovable.dev*
