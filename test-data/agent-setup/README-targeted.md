# Targeted Test Data Setup - Agent Instructions

## Overview

Create 18 test contacts (9 pairs) with notes, tasks, and opportunities for 4 specific test scenarios.

## Configuration

- **Location ID:** `wHb7koqaUqw8x8KoYjOj`
- **Test Email Domain:** `mmtarget.io`
- **GHL API Base:** `https://services.leadconnectorhq.com`

## Pre-Setup: Custom Field

**Scenario 1 requires a custom field.** Before creating contacts:

1. List custom fields:
   ```
   GET /locations/wHb7koqaUqw8x8KoYjOj/customFields
   ```

2. Find a TEXT type custom field you can use, or note the field ID of one like "Account ID" or similar.

3. Record the custom field ID - you'll need it when creating contacts.

## Data File

Read `targeted-test-data.json` which contains:
- 18 contacts (9 pairs across 4 scenarios)
- 14 notes
- 11 tasks
- 19 opportunities

## Execution Order

### Scenario 1: Custom Field Match (6 contacts)

Create contacts cf01-cf06 WITH custom field values:

```json
POST /contacts/
{
  "firstName": "Alice",
  "lastName": "Thompson",
  "email": "alice1@mmtarget.io",
  "phone": "555-9001",
  "companyName": "TechCorp",
  "locationId": "wHb7koqaUqw8x8KoYjOj",
  "customFields": [
    {"id": "YOUR_CUSTOM_FIELD_ID", "value": "ACCT-001"}
  ]
}
```

Custom field values:
- cf01, cf02: `ACCT-001`
- cf03, cf04: `ACCT-002`
- cf05, cf06: `ACCT-003`

### Scenario 2: Custom Merge Strategy (4 contacts, 8 opps)

1. Create contacts cm01-cm04 (standard fields only)
2. Fetch pipeline/stage IDs
3. Create 8 opportunities with varied values and stages

### Scenario 3: Combined Rules (4 contacts, 6 notes, 5 tasks, 8 opps)

1. Create contacts cb01-cb04
2. Create 6 notes distributed across contacts
3. Create 5 tasks distributed across contacts
4. Create 8 opportunities with varied values and stages

### Scenario 4: Restore Test (2 contacts, 4 notes, 3 tasks, 3 opps)

1. Create contacts rs01-rs02
2. Create 4 notes (2 on each contact)
3. Create 3 tasks (1 on rs01, 2 on rs02)
4. Create 3 opportunities (1 on rs01, 2 on rs02)

## API Reference

### Create Contact with Custom Field
```
POST /contacts/
{
  "firstName": "...",
  "lastName": "...",
  "email": "...",
  "phone": "...",
  "companyName": "...",
  "locationId": "wHb7koqaUqw8x8KoYjOj",
  "customFields": [
    {"id": "FIELD_ID", "value": "FIELD_VALUE"}
  ]
}
```

### Create Note
```
POST /contacts/{contactId}/notes
{"body": "..."}
```

### Create Task
```
POST /contacts/{contactId}/tasks
{
  "title": "...",
  "body": "...",
  "dueDate": "2025-02-15"
}
```

### Create Opportunity
```
POST /opportunities/
{
  "name": "...",
  "pipelineId": "{pipeline_id}",
  "pipelineStageId": "{stage_id}",
  "monetaryValue": 50000,
  "status": "open|won|lost",
  "contactId": "{contact_id}",
  "locationId": "wHb7koqaUqw8x8KoYjOj"
}
```

## Success Criteria

After setup, GHL should have:
- 18 contacts with email domain `mmtarget.io`
- 6 contacts with custom field "Account ID" values
- 14 notes distributed across contacts
- 11 tasks distributed across contacts
- 19 opportunities with varied values ($1,500 to $100,000) and stages

## ID Mapping

Store and report the mapping of local IDs to GHL IDs:

```
cf01 -> GHL_ID_1
cf02 -> GHL_ID_2
...
rs02 -> GHL_ID_18
```

This helps verify the correct contacts are being matched.
