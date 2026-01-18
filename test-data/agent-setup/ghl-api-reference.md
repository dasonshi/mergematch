# GHL API Reference for Test Data Setup

Base URL: `https://services.leadconnectorhq.com`

## Authentication

All requests require:
```
Authorization: Bearer {access_token}
Version: 2021-07-28
```

---

## Contacts

### Create Contact
```
POST /contacts/
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith",
  "email": "john@mergematch-test.com",
  "phone": "555-0101",
  "companyName": "Acme Corp",
  "locationId": "wHb7koqaUqw8x8KoYjOj"
}
```

Response:
```json
{
  "contact": {
    "id": "abc123...",
    "firstName": "John",
    ...
  }
}
```

### Get Contact
```
GET /contacts/{contactId}
```

### Delete Contact
```
DELETE /contacts/{contactId}
```

### Search Contacts
```
GET /contacts/?locationId={locationId}&query={searchTerm}
```

---

## Notes

### Create Note
```
POST /contacts/{contactId}/notes
Content-Type: application/json

{
  "body": "Note content here"
}
```

Response:
```json
{
  "note": {
    "id": "note123...",
    "body": "Note content here",
    "contactId": "abc123..."
  }
}
```

### Get Contact Notes
```
GET /contacts/{contactId}/notes
```

---

## Tasks

### Create Task
```
POST /contacts/{contactId}/tasks
Content-Type: application/json

{
  "title": "Task title",
  "body": "Task description",
  "dueDate": "2025-02-15",
  "completed": false
}
```

Response:
```json
{
  "task": {
    "id": "task123...",
    "title": "Task title",
    ...
  }
}
```

### Get Contact Tasks
```
GET /contacts/{contactId}/tasks
```

---

## Pipelines

### Get Pipelines (with stages)
```
GET /opportunities/pipelines?locationId={locationId}
```

Response:
```json
{
  "pipelines": [
    {
      "id": "pipeline123",
      "name": "Sales Pipeline",
      "stages": [
        {"id": "stage1", "name": "New"},
        {"id": "stage2", "name": "Qualified"},
        {"id": "stage3", "name": "Proposal"},
        {"id": "stage4", "name": "Won"},
        {"id": "stage5", "name": "Lost"}
      ]
    }
  ]
}
```

---

## Opportunities

### Create Opportunity
```
POST /opportunities/
Content-Type: application/json

{
  "name": "Deal Name",
  "pipelineId": "pipeline123",
  "pipelineStageId": "stage3",
  "monetaryValue": 5000,
  "status": "open",
  "contactId": "contact123",
  "locationId": "wHb7koqaUqw8x8KoYjOj"
}
```

Response:
```json
{
  "opportunity": {
    "id": "opp123...",
    "name": "Deal Name",
    ...
  }
}
```

### Search Opportunities
```
GET /opportunities/search?location_id={locationId}&contact_id={contactId}
```

### Get Opportunity
```
GET /opportunities/{opportunityId}
```

### Delete Opportunity
```
DELETE /opportunities/{opportunityId}
```

---

## Stage Name to ID Mapping

Before creating opportunities, fetch pipelines and create a mapping:

```javascript
// Example mapping (you'll get actual IDs from the API)
const stageMapping = {
  "New": "stage_abc",
  "Qualified": "stage_def",
  "Proposal": "stage_ghi",
  "Won": "stage_jkl",
  "Lost": "stage_mno"
};
```

Use this mapping when creating opportunities from test-scenarios.json.

---

## Error Handling

Common errors:
- `401 Unauthorized` - Invalid or expired token
- `422 Unprocessable Entity` - Validation error (check required fields)
- `404 Not Found` - Resource doesn't exist

Always check response status and log errors.
