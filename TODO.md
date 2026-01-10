# MergeMatch TODO

## Production URLs & Config

| Service | URL |
|---------|-----|
| Frontend | https://merge-match.vercel.app |
| Backend | https://mergematch.onrender.com |
| GHL Webhooks | https://mergematch.onrender.com/webhooks/ghl |

### Supabase

```
SUPABASE_URL=https://kgmtjsmjbbjvtgvzymof.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtnbXRqc21qYmJqdnRndnp5bW9mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzAwNDM2MywiZXhwIjoyMDgyNTgwMzYzfQ.oe9pdM8h7eYUCQd7meJ-x28vbToJhTSd8C-HrMhhaeU
PROJECT_REF=kgmtjsmjbbjvtgvzymof
```

### Render Env Vars (GHL Marketplace)

```
GHL_APP_ID=69527a942cc51c7766fe9927
GHL_PLAN_MAPPING=6957cf22476864bd99d6a09c:free,6957cf775d95882a1bda4d6c:starter,6957cfe65d9588c6bbda4ebf:pro,6957d036476864bb8fd6a1cd:agency
GHL_APP_SHARED_SECRET=616c0f6a-f8dc-4666-8e50-3a19c93463f5
```

### Render Cron Job (Scheduled Scans)

**To enable scheduled scans:**

1. **Add environment variable in Render:**
   ```
   CRON_SECRET=<generate-with: openssl rand -hex 32>
   ```

2. **Create Cron Job in Render Dashboard:**
   - Go to your web service → "Cron Jobs" tab → Create new
   - Name: `process-scheduled-scans`
   - Schedule: `0 * * * *` (every hour at minute 0)
   - Command:
     ```bash
     curl -X POST https://mergematch.onrender.com/cron/process-scheduled-scans \
       -H "X-Cron-Secret: $CRON_SECRET" \
       -H "Content-Type: application/json"
     ```

**Note:** Scheduled scans only run for Pro/Agency tier users.

---

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

## Testing: Merge Strategy Configurations

Test each merge strategy configuration option with CSV test data.

### Master Selection Options
| Option | Description | Test CSV |
|--------|-------------|----------|
| most-complete | Most fields populated wins | TBD |
| most-recent | Last updated wins | TBD |
| oldest | First created wins | TBD |
| manual | Require review each time | TBD |

### Conflict Resolution Options
| Option | Description | Test CSV |
|--------|-------------|----------|
| prefer-master | Master record values win | TBD |
| prefer-recent | Most recently updated value wins | TBD |
| require-review | Manual review for conflicts | TBD |

### Related Records Options
| Option | Description | Test CSV |
|--------|-------------|----------|
| Notes: copy-all | Copy all notes to master | TBD |
| Notes: dont-copy | Don't copy notes | TBD |
| Tasks: copy-all | Copy all tasks to master | TBD |
| Tasks: dont-copy | Don't copy tasks | TBD |
| Opportunities: keep-all | Keep all from both | TBD |
| Opportunities: keep-master | Keep from master only | TBD |
| Opportunities: keep-highest | Keep highest value | TBD |

### Test Scenarios
- [ ] Create test CSV with duplicate pairs for each master selection method
- [ ] Create test CSV with conflicting field values
- [ ] Create test CSV with related records (notes, tasks, opportunities)
- [ ] Verify each configuration produces expected merge result

---

## Testing: Paid Tier Functionality

Verify each plan tier correctly gates/enables features.

### Plan Tiers
| Tier | Plan ID | Features to Test |
|------|---------|------------------|
| Free | 6957cf22476864bd99d6a09c | Basic match rules, limited scans |
| Starter | 6957cf775d95882a1bda4d6c | Custom merge strategies, more rules |
| Pro | 6957cfe65d9588c6bbda4ebf | Scheduled scans, priority support |
| Agency | 6957d036476864bb8fd6a1cd | Multi-location, white-label |

### Feature Tests
- [ ] **Free Tier**
  - Confirm merge strategies page locked
  - Confirm rule limit enforced
  - Confirm scheduled scans disabled

- [ ] **Starter Tier**
  - Confirm merge strategies page unlocked
  - Confirm rule limit increased
  - Confirm scheduled scans still disabled

- [ ] **Pro Tier**
  - All Starter features
  - Confirm scheduled scans enabled
  - Confirm auto-merge enabled

- [ ] **Agency Tier**
  - All Pro features
  - Confirm multi-location access
  - Confirm white-label options (if applicable)

### Testing Method
1. Use GHL sandbox with each plan tier assigned
2. Verify UI correctly shows/hides features
3. Verify API correctly enforces limits
4. Document any discrepancies

---

## Future Enhancements

- [ ] Bulk operations (merge all with confirmation)
- [ ] Scheduled scan execution (cron/background jobs)
- [ ] Audit log for all actions
- [ ] Export merge history to CSV
- [ ] GHL custom field mapping
