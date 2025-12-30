# MergeMatch Frontend - Lovable Prompts

**Version**: 2.0 (Corrected to match PRD)
**Created**: December 28, 2024
**Purpose**: Comprehensive prompts for building the MergeMatch frontend using Lovable.dev

> **IMPORTANT**: These prompts are derived directly from the PRD Section 10.4 Screen Specifications. Do not deviate from the wireframes.

---

## Table of Contents

1. [Project Setup & Navigation](#prompt-1-project-setup--navigation)
2. [Dashboard Page](#prompt-2-dashboard-page)
3. [Match Rules List Page](#prompt-3-match-rules-list-page)
4. [Create/Edit Match Rule Page](#prompt-4-createedit-match-rule-page)
5. [Match Rule Detail Page](#prompt-5-match-rule-detail-page)
6. [Match Review Page](#prompt-6-match-review-page)
7. [Merge Strategies Page](#prompt-7-merge-strategies-page)
8. [Create/Edit Merge Strategy Page](#prompt-8-createedit-merge-strategy-page)
9. [History Page](#prompt-9-history-page)
10. [Settings Page](#prompt-10-settings-page)
11. [Help Page](#prompt-11-help-page)
12. [Confirmation Modals](#prompt-12-confirmation-modals)
13. [Shared Components & States](#prompt-13-shared-components--states)

---

## Route Structure (from PRD 10.6)

| Route | Page | Description |
|-------|------|-------------|
| `/` | Dashboard | Overview metrics, quick links |
| `/match-rules` | Match Rules List | All rules with stats |
| `/match-rules/new` | Create Match Rule | Rule creation form |
| `/match-rules/:id` | Match Rule Detail | **Main working page** |
| `/match-rules/:id/edit` | Edit Match Rule | Rule editing form |
| `/match-rules/:id/review/:matchId` | Match Review | Field comparison view |
| `/merge-strategies` | Merge Strategies | Strategy list by object |
| `/merge-strategies/new` | Create Merge Strategy | Strategy creation form |
| `/merge-strategies/:id/edit` | Edit Merge Strategy | Strategy editing form |
| `/history` | History | All merges across rules |
| `/settings` | Settings | Preferences, subscription, white-label |
| `/help` | Help | Documentation, FAQ, support |

---

## Prompt 1: Project Setup & Navigation

```
Create a React + TypeScript project for "MergeMatch" - a duplicate detection and merge platform for GoHighLevel CRM. Follow these specifications EXACTLY.

TECH STACK:
- React 18 + TypeScript
- Vite for build
- Tailwind CSS
- Shadcn/UI components (Button, Card, Badge, Dialog, Select, Table, Tabs, Toast, Input, Checkbox, Progress)
- React Router v6
- Lucide React for icons

SIDEBAR NAVIGATION (from PRD 10.6):
Fixed left sidebar with:
- Logo/App Name at top: "MergeMatch"
- Divider line
- Navigation items (with icons):
  - 📊 Dashboard (/)
  - 📋 Match Rules (/match-rules)
  - 📜 History (/history)
  - ⚙️ Settings (/settings)
  - ❓ Help (/help)
- Divider line
- Plan badge at bottom: [Starter Plan]
- Upgrade link: [Upgrade →]

IMPORTANT: The sidebar has ONLY these 5 nav items. NO "Duplicates", "Jobs", or "Merge Strategies" in the sidebar. Merge Strategies is accessed FROM the Match Rules page.

LAYOUT:
- Sidebar: 240px fixed width
- Main content area: remaining width
- No top header bar - page titles are inside content area
- Mobile: Collapsible sidebar with hamburger

Create placeholder pages for each route that display the page name.
```

---

## Prompt 2: Dashboard Page

```
Build the Dashboard page for MergeMatch EXACTLY as specified. This is route "/".

HEADER SECTION:
- Line 1: "Location: loc_abc123 • Acme Agency" (left) | "● Connected" status dot (green) | [Feedback] button (right)
- Line 2: Plan badge [Starter] | [Upgrade] button (right side)
- Line 3: [🔄 Refresh Data] button (right aligned)

DATA SYNC SECTION:
- Row with: "● Contacts: 12,847 synced" | "● Companies: 1,204 synced" | [Sync Now] button
- Right side shows: "Last sync: 2 min ago"
- Use green dots for synced status

FREE TIER BANNER (conditional):
- Yellow/amber banner: "🔒 FREE TIER: 2 of 3 merges remaining. [Upgrade for unlimited →]"
- Only show for Free tier users

SUMMARY METRICS TABLE:
A table with columns: OBJECTS | RECORDS | MERGED (7d) | MERGED (all)
Rows:
- ● Contacts | 12,847 | 47 | 312
- ● Companies | 1,204 | 3 | 18
- ○ Opportunities | (Pro plan) | - | -
Use filled dots (●) for active objects, empty dots (○) for locked/unavailable

ACTIVE MATCH RULES SECTION:
- Section title: "ACTIVE MATCH RULES"
- Table with columns: Rule Name | Next Run | Pending
- Rows (clickable, link to /match-rules/:id):
  - Email + Name Match → | Tomorrow 6am | 23
  - Phone Number Match → | Tomorrow 6am | 12
  - Company Domain Match → | - (manual) | 5
- Footer: [+ Create Match Rule] button

RECENT MERGES SECTION:
- Section title: "RECENT MERGES"
- Table with columns: Master Record | Merged From | When | Status
- Sample rows:
  - John Smith | ← Jon Smith | 2:34 PM | [View]
  - jane@acme.com | ← jane.d@acme | 1:12 PM | [View]
  - Acme Corporation | ← 2 duplicates | Yesterday | [View]
  - mike@test.com | ← mikey@test | Yesterday | [View]
- Footer: [View All History →] link

Use the exact layout with sections separated by horizontal lines. No charts or graphs.
```

---

## Prompt 3: Match Rules List Page

```
Build the Match Rules List page for MergeMatch. This is route "/match-rules". Follow PRD 10.4.2 EXACTLY.

PAGE HEADER:
- Title: "Match Rules"
- Two buttons on the right: [+ New Match Rule] and [View Merge Strategies]

RULES AS CARDS:
Display each rule as a card. Each card contains:

Card structure:
┌─────────────────────────────────────────────────────────────────────┐
│ 📋 Email + Phone Match →                                            │
│                                                                     │
│ Object: Contacts  |  Strategy: Standard Contact Merge               │
│ Schedule: Daily 6am  |  Last scan: 2h ago                           │
│ Pending: 47 matches  |  Total merged: 312                           │
└─────────────────────────────────────────────────────────────────────┘

- The rule name is clickable (links to /match-rules/:id)
- Arrow (→) indicates clickable
- Show Object type, linked Strategy name
- Show Schedule (or "Manual only"), Last scan time
- Show Pending matches count, Total merged count

SAMPLE DATA (3 cards):
1. Email + Phone Match
   - Object: Contacts, Strategy: Standard Contact Merge
   - Schedule: Daily 6am, Last scan: 2h ago
   - Pending: 47, Total merged: 312

2. Company Domain Match
   - Object: Companies, Strategy: Most Recent Wins
   - Schedule: Manual only, Last scan: 1d ago
   - Pending: 12, Total merged: 45

3. Phone Number Match
   - Object: Contacts, Strategy: Standard Contact Merge
   - Schedule: Daily 6am, Last scan: 2h ago
   - Pending: 5, Total merged: 89

EMPTY STATE:
If no rules exist, show centered message:
- Icon: clipboard or document icon
- "No match rules configured"
- "Create your first match rule to start detecting duplicates."
- [Create Rule] button
```

---

## Prompt 4: Create/Edit Match Rule Page

```
Build the Create/Edit Match Rule page. Routes: "/match-rules/new" and "/match-rules/:id/edit". Follow PRD 10.4.4 EXACTLY.

PAGE HEADER:
- Back link: "← Match Rules"
- Title: "Create Match Rule" (or "Edit Match Rule" when editing)

FORM STRUCTURE - 3 STEPS:

STEP 1: MATCHING CRITERIA
─────────────────────────────────────────
Rule Name: [text input, e.g., "Email + Phone Match"]
Object: [dropdown: Contacts, Companies, Opportunities, Custom Objects]

Match Fields (repeatable section):
┌─────────────────────────────────────────────────────────────────────┐
│  Field         │  Match Type    │  Threshold   │                    │
│  ────────────────────────────────────────────────────────────────── │
│  [email ▾]     │  [Exact ▾]     │  100%        │            [×]     │
│  [phone ▾]     │  [Fuzzy ▾]     │  [  85% ]    │            [×]     │
└─────────────────────────────────────────────────────────────────────┘
[+ Add Field] button

Match Type options: Exact, Fuzzy, Phonetic, Normalized

Match Logic (radio buttons):
● All fields must match (AND)
○ Any field can match (OR)

STEP 2: MERGE STRATEGY
─────────────────────────────────────────
Select Strategy: [dropdown with existing strategies]
Options include: Standard Contact Merge, Most Recent Wins, + Create New...
[+ Create New] button links to /merge-strategies/new

Preview box showing selected strategy:
┌─────────────────────────────────────────────────────────────────────┐
│ Master: Most complete  |  Conflicts: Prefer master                  │
│ Notes: Copy all  |  Tasks: Copy all  |  Opps: Keep all              │
│                                                        [Edit Strategy]│
└─────────────────────────────────────────────────────────────────────┘

STEP 3: SCHEDULE
─────────────────────────────────────────
Radio options:
● Manual only (run via [Scan for Matches] button)
○ Scheduled: [Daily ▾] at [6:00 AM ▾]

Info note: "💡 Scheduled scans require Starter plan or higher."

FOOTER:
[Cancel] button (left) | [Save Match Rule] button (right, primary)

VALIDATION:
- Rule Name: required, max 100 chars
- Object: required
- At least one Match Field required
- Merge Strategy: required
---

## Prompt 5: Match Rule Detail Page

```
Build the Match Rule Detail page. This is route "/match-rules/:id". This is THE PRIMARY WORKING PAGE per PRD 10.4.6.

PAGE HEADER:
- Back link: "← Match Rules"
- Title: Rule name (e.g., "Email + Phone Match")
- [Edit Rule] button on the right

RULE CONFIGURATION SECTION:
─────────────────────────────────────────
Display read-only summary:
- Object: Contacts
- Fields: email (exact), phone (fuzzy 85%)
- Logic: All fields must match (AND)

Merge Strategy row:
- Label: "Merge Strategy:"
- Dropdown to change: [Standard Contact Merge ▾]
- Options: Standard Contact Merge, Most Recent Wins, + Create New...
- [Edit Strategy] button

BULK ACTIONS SECTION:
─────────────────────────────────────────
Three elements in a row:
[🔍 Scan Now] button | [▶ Merge All] button | Schedule: [Daily 6am ▾] dropdown

Below that:
- "Last scan: 2h ago (found 47 matches)"
- "Next scheduled: Tomorrow 6:00 AM"
- Tier gate note: "💡 Scheduled scans require Starter plan or higher. [Upgrade]"

PENDING MATCHES SECTION:
─────────────────────────────────────────
Title: "PENDING MATCHES (47)"

Match cards - each showing side-by-side preview:
┌─────────────────────────────────────────────────────────────────────┐
│  John Smith ← Jon Smith                             98% confidence  │
│  ─────────────────────────────────────────────────────────────────  │
│  john@acme.com        │ jon.smith@acme.com                          │
│  +1 555-0123          │ +1 555-0123                                 │
│  Acme Inc             │ (empty)                                     │
│                                                                     │
│                                              [Review]    [Merge]    │
└─────────────────────────────────────────────────────────────────────┘

For 3+ record matches, show condensed:
┌─────────────────────────────────────────────────────────────────────┐
│  Acme Corp ← ACME Corporation ← Acme Inc            87% confidence  │
│  ─────────────────────────────────────────────────────────────────  │
│  3 records in this match group                      [Review]        │
└─────────────────────────────────────────────────────────────────────┘

Footer: "Showing 3 of 47 | [Load More]"

MERGE HISTORY SECTION:
─────────────────────────────────────────
Title: "MERGE HISTORY (312)"

Table with columns: Master | Merged From | When | Actions
- Mike Johnson | ← M. Johnson | 1h ago | [View][Restore]
- sarah@company.com | ← 2 duplicates | 3h ago | [View][Restore]
- Bob Wilson | ← Robert Wilson | Yesterday | [View][Restore]
- test@example.com | ← test2@example | Dec 23 | [View][Restore]

Footer: [View Full History →] link
```

---

## Prompt 6: Match Review Page

```
Build the Match Review page. Route: "/match-rules/:id/review/:matchId". Follow PRD 10.4.7 EXACTLY.

PAGE HEADER:
- Back link: "← Email + Phone Match" (rule name)
- Title: "Review Match"
- Confidence badge on right: "98% confidence"

FIELD COMPARISON TABLE:
Instruction text: "Click any cell to select it as the value to keep."

Table structure:
│             │ ★ MASTER            │ DUPLICATE 1         │ RESULT        │
│             │ John Smith          │ Jon Smith           │               │
│  ───────────┼─────────────────────┼─────────────────────┼─────────────  │
│  First Name │ [John]  ✓           │  Jon                │ John          │
│  Last Name  │ [Smith] ✓           │  Smith              │ Smith         │
│  Email      │ [john@acme.com] ✓   │  jon.smith@acme     │ john@acme.com │
│  Phone      │  (empty)            │ [+1 555-0123] ✓     │ +1 555-0123   │
│  Company    │ [Acme Inc] ✓        │  (empty)            │ Acme Inc      │
│  Tags       │ [lead, hot] ✓       │  prospect           │ lead, hot     │
│  Created    │  Jan 15, 2024       │  Mar 22, 2024       │ (metadata)    │
│  Updated    │  Dec 20, 2024       │  Dec 24, 2024       │ (metadata)    │

KEY BEHAVIORS:
- Clicking a cell selects that value for the RESULT column
- Selected cells show [value] ✓ indicator
- RESULT column updates live as selections change
- ★ indicates the Master record
- (empty) shown for null/blank fields

LEGEND:
[Value] ✓ = Selected (will be kept)
Value = Not selected
(empty) = No value in record
★ = Master record

RELATED RECORDS SECTION:
─────────────────────────────────────────
Title: "RELATED RECORDS"
"From "Jon Smith" (will be copied to master):"
- 3 notes
- 1 task (due tomorrow)
- 2 opportunities ($5,400 total value)

MERGE WARNING BOX:
┌─────────────────────────────────────────────────────────────────────┐
│ ⚠️ MERGE WARNING                                                   │
│                                                                     │
│ "Jon Smith" will be PERMANENTLY DELETED from GoHighLevel.           │
│ Notes/tasks will be copied to master with new IDs.                  │
│                                                                     │
│ ☐ Do not show this warning again                                    │
└─────────────────────────────────────────────────────────────────────┘

FOOTER:
[Cancel] button (left) | [Confirm Merge] button (right, primary green)

FOR 3+ RECORDS:
Add additional columns for DUPLICATE 2, DUPLICATE 3, etc.
```

---

## Prompt 7: Merge Strategies Page

```
Build the Merge Strategies page. Route: "/merge-strategies". Follow PRD 10.4.3 EXACTLY.

PAGE HEADER:
- Back link: "← Match Rules"
- Title: "Merge Strategies"
- [+ New Merge Strategy] button on right

GROUPED BY OBJECT TYPE:

CONTACTS
─────────────────────────────────────────
Strategy cards:

┌─────────────────────────────────────────────────────────────────────┐
│ Standard Contact Merge                                      [Edit]  │
│                                                                     │
│ Master: Most complete  |  Conflicts: Prefer master                  │
│ Notes: Copy all  |  Tasks: Copy all  |  Opps: Keep all              │
│                                                                     │
│ Used by:                                                            │
│ • Email + Phone Match                                               │
│ • Name + Address Match                                              │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ Most Recent Wins                                            [Edit]  │
│                                                                     │
│ Master: Most recent activity  |  Conflicts: Most recent             │
│ Notes: Copy all  |  Tasks: Copy all  |  Opps: Keep all              │
│                                                                     │
│ Used by:                                                            │
│ • (none)                                                    [Delete]│
└─────────────────────────────────────────────────────────────────────┘

COMPANIES
─────────────────────────────────────────

┌─────────────────────────────────────────────────────────────────────┐
│ Company Standard                                            [Edit]  │
│                                                                     │
│ Master: Most complete  |  Conflicts: Prefer master                  │
│                                                                     │
│ Used by:                                                            │
│ • Company Domain Match                                              │
└─────────────────────────────────────────────────────────────────────┘

FOOTER NOTE:
─────────────────────────────────────────
"No strategies for: Opportunities, Custom Objects"
"(Create a Match Rule to add strategies for these objects)"

DELETION RULES:
- [Delete] button only shown if "Used by" is empty
- If user tries to delete a used strategy, show error: "Cannot delete: This strategy is used by X Match Rules"
```

---

## Prompt 8: Create/Edit Merge Strategy Page

```
Build the Create/Edit Merge Strategy page. Routes: "/merge-strategies/new" and "/merge-strategies/:id/edit". Follow PRD 10.4.5 EXACTLY.

PAGE HEADER:
- Back link: "← Back"
- Title: "Edit Merge Strategy" (or "Create Merge Strategy")

FORM FIELDS:

Strategy Name: [text input, e.g., "Standard Contact Merge"]
Object: [dropdown or locked text if editing] - "Contacts (locked when editing)"

MASTER SELECTION SECTION:
─────────────────────────────────────────
"How should the primary (surviving) record be chosen?"

Radio options:
● Most complete record (most fields populated)
○ Most recent activity (last updated)
○ Oldest created (original record)
○ Manual selection (require review for each match)

FIELD CONFLICTS SECTION:
─────────────────────────────────────────
"When both records have different values for the same field:"

Radio options:
● Prefer master record values
○ Prefer most recently updated value
○ Require manual review

RELATED RECORDS SECTION:
─────────────────────────────────────────
"How should associated records be handled during merge?"

Notes:
● Copy all to master    ○ Don't copy

Tasks:
● Copy all to master    ○ Don't copy

Opportunities:
● Keep all from both records
○ Keep from master only
○ Keep highest monetary value

WARNING BOX (only when editing a used strategy):
┌─────────────────────────────────────────────────────────────────────┐
│ ⚠️ This strategy is used by 2 Match Rules:                         │
│    • Email + Phone Match                                            │
│    • Name + Address Match                                           │
│                                                                     │
│    Changes will affect ALL rules using this strategy.               │
└─────────────────────────────────────────────────────────────────────┘

FOOTER:
[Save as New] button | [Cancel] button | [Save] button (primary)

SAVE BEHAVIOR:
- If editing a strategy used by other rules, show confirmation dialog before saving
- [Save as New] creates a copy with a new name (prompts for name)
---

## Prompt 9: History Page

```
Build the History page. Route: "/history". Follow PRD 10.4.9 EXACTLY.

PAGE HEADER:
- Title: "Merge History"

FILTERS ROW:
Filter: [All Rules ▾] | [All Objects ▾] | [Last 30 days ▾] | [🔍 Search]

- All Rules dropdown: lists all match rules + "All Rules" option
- All Objects dropdown: Contacts, Companies, All
- Date dropdown: Last 7 days, Last 30 days, Last 90 days, All time
- Search: text input to search by master/duplicate name or email

HISTORY TABLE:
Columns: Master | Merged From | Rule | When | Actions

Sample rows:
│ John Smith          │ ← Jon Smith    │ Email+Phone →  │ 1h ago    │[View][Restore]│
│ jane@test.com       │ ← jane.t@test  │ Email+Phone →  │ 2h ago    │[View][Restore]│
│ Acme Corp           │ ← 2 duplicates │ Domain Match → │ 3h ago    │[View][Restore]│
│ Mike Johnson        │ ← M. Johnson   │ Email+Phone →  │ 5h ago    │[View][Restore]│
│ sarah@company.com   │ ← 2 duplicates │ Phone Match →  │ Yesterday │[View][Restore]│
│ Bob Wilson          │ ← Robert Wilson│ Email+Phone →  │ Yesterday │[View][Restore]│
│ test@example.com    │ ← test2@example│ Email+Phone →  │ Dec 23    │[View][Restore]│
│ Widget Inc          │ ← Widget LLC   │ Domain Match → │ Dec 23    │[View][Restore]│

- Rule column is clickable (links to /match-rules/:id)
- [View] opens the Match Review page in read-only mode (post-merge view)
- [Restore] opens restore confirmation modal

FOOTER:
"Showing 8 of 312 | [Load More]"
```

---

## Prompt 10: Settings Page

```
Build the Settings page. Route: "/settings". Follow PRD 10.4.10 EXACTLY. Single page with sections (NOT tabs).

PAGE HEADER:
- Title: "Settings"

CONNECTION SECTION:
─────────────────────────────────────────
GoHighLevel Status: ● Connected (green dot)
Location ID: loc_abc123
Location Name: Acme Marketing Agency
Connected Since: December 15, 2024

[Reconnect] button on right

SUBSCRIPTION SECTION:
─────────────────────────────────────────
Current Plan: Starter ($39/mo)
Billing: Managed via GHL Marketplace
Next Billing: January 15, 2025

Upgrade CTA card:
┌─────────────────────────────────────────────────────────────────────┐
│ 🚀 Upgrade to Pro ($59/mo)                                         │
│    • Scheduled scans (hourly)                                       │
│    • Auto-merge high-confidence matches                             │
│    • Opportunities & Custom Objects                                 │
│                                              [Upgrade Now]          │
└─────────────────────────────────────────────────────────────────────┘

PREFERENCES SECTION:
─────────────────────────────────────────
Merge Warnings:
☑ Show warning before individual merges
☑ Show warning before bulk merges
☑ Show warning before restoring merges

[Reset All Warnings] button

WHITE-LABEL SECTION (Agency Plan Only):
─────────────────────────────────────────
Info note: "💡 Upgrade to Agency plan to customize branding for your clients."

If on Agency plan, show:
┌─────────────────────────────────────────────────────────────────────┐
│ Company Name:    [Acme Marketing Agency        ]  (from GHL)        │
│ Logo URL:        [https://acme.com/logo.png    ]  (from GHL)        │
│                                                                     │
│ Custom CSS:      [                                                ] │
│                  [                                                ] │
│                  [                                                ] │
│                                                                     │
│ Preview:         [Open Preview →]                                   │
│                                                                     │
│                                                   [Save Branding]   │
└─────────────────────────────────────────────────────────────────────┘

DANGER ZONE SECTION:
─────────────────────────────────────────
Three danger cards:

┌─────────────────────────────────────────────────────────────────────┐
│ 🔄 Force Full Resync                                                │
│ Clear local cache and re-pull all records from GHL.                 │
│ Use if data seems out of sync after a large GHL import.             │
│                                              [Force Resync]         │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ ⚠️ Delete All Data                                                 │
│ Remove all match rules, merge history, and settings.                │
│ Your GHL contacts will NOT be affected.                             │
│                                              [Delete All Data]      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ ⚠️ Disconnect Account                                              │
│ Revoke MergeMatch's access to this GHL location.                    │
│ All data will be deleted. You can reinstall from Marketplace.       │
│                                              [Disconnect]           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Prompt 11: Help Page

```
Build the Help page. Route: "/help". Follow PRD 10.4.11 EXACTLY.

PAGE HEADER:
- Title: "Help & Documentation"

GETTING STARTED SECTION:
─────────────────────────────────────────
Three cards in a row:

┌──────────────────────┐  ┌──────────────────────┐  ┌─────────────────┐
│ 📖 Quick Start Guide │  │ 🎥 Video Tutorial    │  │ 💡 Best Practices│
│                      │  │                      │  │                 │
│ Create your first    │  │ Watch a 3-minute    │  │ Tips for        │
│ match rule in 5 min  │  │ walkthrough         │  │ accurate matches│
└──────────────────────┘  └──────────────────────┘  └─────────────────┘

DOCUMENTATION SECTION:
─────────────────────────────────────────
Collapsible/expandable sections:
▸ Match Rules
▸ Merge Strategies
▸ Scheduling & Automation
▸ Rollback & Recovery
▸ Object Types
▸ Plans & Billing

FAQ SECTION:
─────────────────────────────────────────
Expandable accordion items:
▸ What happens to notes and tasks when I merge?
▸ Can I undo a merge?
▸ Why are some features locked?
▸ What's the difference between Exact and Fuzzy matching?
▸ How does auto-merge work?
▸ What does the confidence score mean?

SUPPORT SECTION:
─────────────────────────────────────────
📧 support@mergematch.app
Response time: Within 24 hours
```

---

## Prompt 12: Confirmation Modals

```
Build the confirmation modals from PRD 10.4.8 EXACTLY.

INDIVIDUAL MERGE CONFIRMATION:
┌─────────────────────────────────────────────────────────────────────┐
│  Confirm Merge                                                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Merge "Jon Smith" into "John Smith"?                                │
│                                                                      │
│  • 3 notes, 1 task will be copied to master                          │
│  • "Jon Smith" will be permanently deleted                           │
│                                                                      │
│  ☐ Do not warn me again for individual merges                        │
│                                                                      │
│                                              [Cancel]  [Confirm Merge]│
└─────────────────────────────────────────────────────────────────────┘

BULK MERGE CONFIRMATION:
┌─────────────────────────────────────────────────────────────────────┐
│  Merge All Pending Matches                                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Merge 47 match groups using "Standard Contact Merge" strategy?      │
│                                                                      │
│  This will:                                                          │
│  • Delete 52 duplicate records                                       │
│  • Copy associated notes/tasks to master records                     │
│                                                                      │
│  ⚠️ This action cannot be easily undone. Rollback has limitations.  │
│                                                                      │
│  ☐ Do not warn me again for bulk merges                              │
│                                                                      │
│                                          [Cancel]  [Execute Merges]  │
└─────────────────────────────────────────────────────────────────────┘

RESTORE CONFIRMATION:
┌─────────────────────────────────────────────────────────────────────┐
│  Restore Merge                                                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Recreate "Jon Smith" as a separate contact?                         │
│                                                                      │
│  Limitations:                                                        │
│  • Will have a NEW GHL contact ID                                    │
│  • Notes/tasks copied during merge remain on master                  │
│  • Original timestamps cannot be recovered                           │
│                                                                      │
│  ☐ Do not warn me again for restores                                 │
│                                                                      │
│                                                [Cancel]    [Restore] │
└─────────────────────────────────────────────────────────────────────┘

STRATEGY CHANGE CONFIRMATION (when editing a used strategy):
┌─────────────────────────────────────────────────────────────────────┐
│  Confirm Changes                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  This strategy is used by 2 Match Rules:                             │
│                                                                      │
│  • Email + Phone Match                                               │
│  • Name + Address Match                                              │
│                                                                      │
│  Changes will apply to ALL future merges using these rules.          │
│                                                                      │
│  Alternatively, use "Save as New" to create a copy.                  │
│                                                                      │
│                                            [Cancel]  [Save Changes]  │
└─────────────────────────────────────────────────────────────────────┘

"DO NOT WARN AGAIN" BEHAVIOR:
- Three separate user preferences stored:
  - skip_individual_merge_warning
  - skip_bulk_merge_warning
  - skip_restore_warning
- Can be reset in Settings → Preferences → [Reset All Warnings]
```

---

## Prompt 13: Shared Components & States

```
Build shared UI components and states from PRD Section 8.

EMPTY STATES:

No Duplicates:
┌─────────────────────────────────────────────────────────────────────┐
│                        ✓ (green checkmark icon)                      │
│                                                                      │
│                      No duplicates found                             │
│                                                                      │
│  Great news! We haven't detected any duplicate records in your data. │
│                                                                      │
│                        [Run Manual Scan]                             │
└─────────────────────────────────────────────────────────────────────┘

No Match Rules:
┌─────────────────────────────────────────────────────────────────────┐
│                        📋 (clipboard icon)                           │
│                                                                      │
│                   No match rules configured                          │
│                                                                      │
│       Create your first match rule to start detecting duplicates.    │
│                                                                      │
│                         [Create Rule]                                │
└─────────────────────────────────────────────────────────────────────┘

LOADING STATES:

Scan in Progress (from PRD 10.5.1):
- Button changes to [Scanning...] with spinner
- Page remains usable
- On complete, show toast:
  ┌─────────────────────────────────────────────────────────────────┐
  │ ✓ Scan complete                                                 │
  │   Found 12 new matches (47 total pending)                       │
  │   Scanned 12,847 records in 4.2 seconds                         │
  │                                              [Dismiss]          │
  └─────────────────────────────────────────────────────────────────┘

Merge in Progress:
- Button changes to [Merging...] with spinner
- On complete, show toast:
  ┌─────────────────────────────────────────────────────────────────┐
  │ ✓ Merge complete                                                │
  │   "Jon Smith" merged into "John Smith"                          │
  │                                       [View Details] [Dismiss]  │
  └─────────────────────────────────────────────────────────────────┘

Bulk Merge Progress (from PRD 10.5.3):
  ┌─────────────────────────────────────────────────────────────────┐
  │ Merging 47 match groups...                                      │
  │ ████████████░░░░░░░░  24 of 47 complete                         │
  │                                                        [Cancel] │
  └─────────────────────────────────────────────────────────────────┘

Bulk Merge Complete:
  ┌─────────────────────────────────────────────────────────────────┐
  │ ✓ Bulk merge complete                                           │
  │   45 successful, 2 failed                                       │
  │   52 duplicates deleted                                         │
  │                                       [View Failures] [Dismiss] │
  └─────────────────────────────────────────────────────────────────┘

ERROR STATES:

Error Toast:
- Red background
- Error icon
- Message + [Retry] button

Connection Error Banner:
- Yellow warning banner at top of page
- "GHL connection issue - some features may be unavailable"
- [Reconnect] button

SKELETON LOADING:
- Use animate-pulse effect
- Match shape of real content
- TableSkeleton: 5 rows with varying column widths
- CardSkeleton: Rectangle matching card dimensions
```

---

## Appendix: Tech Stack Reference

Based on the MergeMatch documentation, the frontend should use:

| Category | Technology |
|----------|------------|
| **Framework** | React 18 + TypeScript |
| **Build Tool** | Vite |
| **Styling** | Tailwind CSS |
| **Components** | Shadcn/UI |
| **Server State** | TanStack Query |
| **Client State** | Zustand |
| **Tables** | TanStack Table |
| **Forms** | React Hook Form + Zod |
| **Routing** | React Router v6 |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Animations** | Framer Motion (optional) |

## Appendix: Design System Quick Reference

### Colors
```
Primary:     #6366f1 (indigo-500)
Success:     #22c55e (green-500)
Warning:     #f59e0b (amber-500)
Danger:      #ef4444 (red-500)
Background:  #f8fafc (slate-50)
Card:        #ffffff
Text:        #0f172a (slate-900)
Muted:       #64748b (slate-500)
Border:      #e2e8f0 (slate-200)
```

### Spacing
```
xs: 4px
sm: 8px
md: 16px
lg: 24px
xl: 32px
2xl: 48px
```

### Typography
```
Heading 1: 2.25rem (36px), bold
Heading 2: 1.875rem (30px), semibold
Heading 3: 1.5rem (24px), semibold
Body: 1rem (16px), regular
Small: 0.875rem (14px), regular
Caption: 0.75rem (12px), regular
```

### Breakpoints
```
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

---

*Document generated for MergeMatch frontend development using Lovable.dev*
