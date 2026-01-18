# MergeMatch Test Data Setup - Agent Instructions

## Overview

You are setting up test data in GoHighLevel for MergeMatch testing. Your job is to create duplicate contact pairs with various related records (notes, tasks, opportunities) so the user can manually test merge functionality.

## Configuration

- **Location ID:** `wHb7koqaUqw8x8KoYjOj`
- **Test Email Domain:** `mergematch-test.com` (use this for all test contacts)
- **GHL API Base URL:** `https://services.leadconnectorhq.com`

## Before You Start

1. Get your GHL access token for the location
2. Fetch pipeline IDs: `GET /opportunities/pipelines?locationId={location_id}`
3. Note the stage IDs for: New, Qualified, Proposal, Won, Lost

## Your Tasks

Read `test-scenarios.json` and for each scenario:

1. **Create contacts** via `POST /contacts/`
2. **Create notes** via `POST /contacts/{id}/notes`
3. **Create tasks** via `POST /contacts/{id}/tasks`
4. **Create opportunities** via `POST /opportunities/`

## Execution Order

Execute scenarios in order (pair-01 through pair-06). For each:

```
1. Create Contact A
2. Create Contact B (duplicate)
3. Create notes (if any)
4. Create tasks (if any)
5. Create opportunities (if any)
6. Log the created IDs
```

## Important Notes

- All test contacts use `@mergematch-test.com` email domain
- Store created contact IDs - you'll need them for creating related records
- For opportunities, use the actual pipeline/stage IDs from your fetch
- The "stage" field in scenarios is a human-readable name - map it to actual stage IDs

## Success Criteria

After setup, the GHL location should have:
- 12 contacts (6 duplicate pairs)
- 5 notes total
- 4 tasks total
- 8 opportunities total

## API Reference

See `ghl-api-reference.md` for detailed endpoint documentation.

## Cleanup (Optional)

To reset for re-testing, delete all contacts with email containing `mergematch-test.com`:
```
GET /contacts/?locationId={location_id}&query=mergematch-test.com
DELETE /contacts/{id} for each
```
