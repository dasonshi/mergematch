# MergeMatch TODO

## Production URLs & Config

| Service | URL |
|---------|-----|
| Frontend | https://merge-match.vercel.app |
| Backend | https://mergematch.onrender.com |
| Webhooks | https://mergematch.onrender.com/webhooks/ghl |

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
       -H "X-Cron-Secret: $CRON_SECRET"
     ```

**Note:** Scheduled scans only run for Pro/Agency tier users.

---

## Pre-Launch Checklist

### Security (COMPLETED)
- [x] Remove insecure default SECRET_KEY
- [x] Add rate limiting to critical endpoints (auth, merges, webhooks)
- [x] Add authentication to jobs routes
- [x] Remove legacy query param auth (JWT-only)
- [ ] Implement POST redirect flow for JWT tokens (tokens currently in URL)

### White-labeling (IN PROGRESS)
Files with GHL/GoHighLevel mentions to update:

- [x] `index.html` - Title/meta updated to MergeMatch
- [x] `Settings.tsx` - Replace GHL with CRM
- [x] `empty-state.tsx` - Updated
- [x] `ConnectionErrorBanner.tsx` - Updated
- [x] `RestoreConfirmationModal.tsx` - Updated
- [x] `History.tsx` - Partial (function renamed, labels pending)
- [x] `MergeDetail.tsx` - Partial
- [ ] `Index.tsx` - "View in GHL", "Connect to GoHighLevel"
- [ ] `Help.tsx` - GoHighLevel mentions in help text
- [ ] `MatchRuleDetail.tsx` - Dialog text
- [ ] `MatchReview.tsx` - Dialog text

### UI Cleanup
- [ ] Remove email notification toggles from Settings (use in-app only)
- [ ] Add crmBaseUrl to LocationContext for whitelabel support

### Testing Required
- [ ] Test each subscription tier (Free, Starter, Pro, Agency)
- [ ] Verify feature gates work correctly
- [ ] Test merge/restore/rollback flow
- [ ] Test scheduled scans with Render cron job

---

## App Description (Marketplace)

**Short (150 chars):**
```
Find and merge duplicate contacts automatically. Clean data, better CRM.
```

**Full:**
```
MergeMatch automatically finds duplicate contacts in your CRM and helps you merge them safely.

Key Features:
• Smart duplicate detection using exact, fuzzy, and phonetic matching
• Side-by-side comparison to choose which data to keep
• Safe rollback if you make a mistake
• Scheduled scans to catch new duplicates automatically
• Complete merge history with audit trail

How it works:
1. Create a match rule (e.g., match on email + phone)
2. Scan your contacts to find duplicates
3. Review matches or auto-merge high-confidence pairs
4. Duplicates merged, data cleaned!

Plans:
• Free: Find duplicates, merge up to 3
• Starter: Unlimited merges, more matching options
• Pro: Scheduled scans, auto-merge
• Agency: White-label for your clients
```

---

## Future Enhancements

- [ ] Bulk operations improvements
- [ ] Audit log for all actions
- [ ] Export merge history to CSV
- [ ] Custom field mapping
