# MergeMatch TODO

## Services to Implement

- [ ] **Email Notification Service** - Settings page has email notification toggles but no backend service exists yet
  - Backend: Create email service (SendGrid/Resend/SES)
  - Triggers: match found, auto-merge completed, scheduled scan results
  - User preferences stored in `locations.settings` JSONB field

## Pages to Review

### Dashboard
- [ ] **Index.tsx** - Main dashboard with stats, recent activity, quick actions
  - Shows: total contacts, duplicates found, merges completed
  - Rule summary cards with strategy, last scan, next run

### Match Rules
- [ ] **MatchRules.tsx** - List of all match rules (table layout)
  - Columns: Name, Object, Strategy, Status, Last Scan, Schedule, Pending, Thresholds
  - Plan-gated "View Merge Strategies" button

- [ ] **MatchRuleDetail.tsx** - Single rule view with pending matches
  - Summary card with rule config
  - Collapsible/scrollable pending matches table
  - Merge history section
  - Actions: Scan Now, Merge All, Edit Rule, New Strategy (plan-gated)

- [ ] **MatchRuleForm.tsx** - Create/edit match rule
  - Fields: name, source object, match fields, thresholds, schedule

- [ ] **MatchReview.tsx** - Review a single pending match
  - Side-by-side field comparison
  - Field-by-field selection (A vs B)
  - Actions: Merge, Reject, Skip

### Merge Strategies
- [ ] **MergeStrategies.tsx** - List of merge strategies (plan-gated)
  - Custom field priority rules

- [ ] **MergeStrategyForm.tsx** - Create/edit strategy (plan-gated)

### History
- [ ] **History.tsx** - Merge history table
  - Columns: Rule, Master Record, Duplicate, Status, When, Actions
  - Links to GHL contacts
  - Rollback functionality

- [ ] **MergeDetail.tsx** - Historical merge detail view
  - Shows field selections made
  - Master/duplicate snapshots
  - Rollback option

### Settings
- [ ] **Settings.tsx** - App settings
  - Email notifications (toggles exist, service needed)
  - Default merge behavior
  - API settings

### Other
- [ ] **Help.tsx** - Help/documentation page
- [ ] **NotFound.tsx** - 404 page

## Backend APIs to Review

- [ ] `/auth/*` - OAuth flow, token refresh, /me endpoint (returns plan)
- [ ] `/rules/*` - CRUD for match rules, scan endpoint
- [ ] `/matches/*` - List matches, update status
- [ ] `/merges/*` - Execute merge, rollback, history
- [ ] `/webhooks/*` - GHL webhook handlers

## Database Schema

- [ ] Review `tenants` table - plan, billing_status
- [ ] Review `locations` table - settings JSONB
- [ ] Review `match_rules` table - all fields
- [ ] Review `match_pairs` table - status flow
- [ ] Review `merges` table - snapshots, rollback
- [ ] Review `snapshots` table - rollback data
- [ ] Review `scheduled_jobs` table - cron scheduling

## Future Enhancements

- [ ] Bulk operations (merge all with confirmation)
- [ ] Scheduled scan execution (cron/background jobs)
- [ ] Audit log for all actions
- [ ] Export merge history to CSV
- [ ] GHL custom field mapping
