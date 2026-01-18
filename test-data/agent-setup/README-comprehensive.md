# Comprehensive Test Data Setup - Agent Instructions

## Overview

Create 100 test contacts (50 duplicate pairs) in GoHighLevel with associated notes, tasks, and opportunities. This tests 5 different match rule scenarios.

## Configuration

- **Location ID:** `wHb7koqaUqw8x8KoYjOj`
- **Test Email Domain:** `mmtest.io`
- **GHL API Base:** `https://services.leadconnectorhq.com`

## Pre-Setup

1. **Get access token** for the location
2. **Fetch pipelines:** `GET /opportunities/pipelines?locationId=wHb7koqaUqw8x8KoYjOj`
3. **Map stage names to IDs:**
   - New
   - Qualified
   - Proposal
   - Won
   - Lost

## Data File

Read `comprehensive-test-data.json` which contains:
- 100 contacts (50 duplicate pairs)
- 19 notes
- 15 tasks
- 38 opportunities

## Execution Steps

### Step 1: Create All Contacts

```
POST /contacts/
{
  "firstName": "...",
  "lastName": "...",
  "email": "...",
  "phone": "...",
  "companyName": "...",
  "locationId": "wHb7koqaUqw8x8KoYjOj"
}
```

Create all 100 contacts and store the mapping of local IDs (c001, c002, etc.) to GHL contact IDs.

### Step 2: Create Notes

For each note in the `notes` array:
```
POST /contacts/{ghl_contact_id}/notes
{
  "body": "..."
}
```

### Step 3: Create Tasks

For each task in the `tasks` array:
```
POST /contacts/{ghl_contact_id}/tasks
{
  "title": "...",
  "body": "...",
  "dueDate": "..."
}
```

### Step 4: Create Opportunities

For each opportunity in the `opportunities` array:
```
POST /opportunities/
{
  "name": "...",
  "pipelineId": "{your_pipeline_id}",
  "pipelineStageId": "{mapped_stage_id}",
  "monetaryValue": ...,
  "status": "...",
  "contactId": "{ghl_contact_id}",
  "locationId": "wHb7koqaUqw8x8KoYjOj"
}
```

## Expected Test Scenarios

After data creation, user will create these 5 match rules in MergeMatch:

| Rule | Match Criteria | Expected Pairs | Merge Strategy |
|------|----------------|----------------|----------------|
| Rule 1 | Exact Email | 15 | Standard |
| Rule 2 | Exact Phone | 10 | Notes copy to master |
| Rule 3 | Name + Company | 10 | Tasks copy to master |
| Rule 4 | Email (with opps) | 8 | Opportunities keep all |
| Rule 5 | Email (custom logic) | 7 | Custom: $1000+ and not lost |

## Validation

After user runs merges, the DB Claude will verify:

### Rule 1 (Exact Email - contacts c001-c030)
- 15 matches detected
- Standard merge (no related records)

### Rule 2 (Exact Phone - contacts c031-c050)
- 10 matches detected
- Notes copied to master records

### Rule 3 (Name + Company - contacts c051-c070)
- 10 matches detected
- Tasks copied to master records

### Rule 4 (Email with Opportunities - contacts c071-c086)
- 8 matches detected
- All 16 opportunities kept on master records
- Total value: ~$249,300

### Rule 5 (Custom Logic - contacts c087-c100)
- 7 matches detected
- Custom logic: `monetaryValue >= 1000 AND status != 'lost'`
- 14 opportunities kept
- 6 opportunities filtered out

## Cleanup

To reset for re-testing:
```
GET /contacts/?locationId=wHb7koqaUqw8x8KoYjOj&query=mmtest.io
DELETE /contacts/{id} for each result
```

## Success Criteria

After setup, GHL should have:
- 100 contacts with email domain `mmtest.io`
- 19 notes distributed across contacts
- 15 tasks distributed across contacts
- 38 opportunities distributed across contacts
