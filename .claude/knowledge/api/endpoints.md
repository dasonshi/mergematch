# API Endpoints

## Base URL

- **Production**: `https://mergematch-backend.onrender.com`
- **Local**: `http://localhost:8000`

All endpoints require authentication (JWT in Authorization header).

## Authentication

### OAuth Flow
```
POST /auth/install          # GHL marketplace install
GET  /auth/callback         # OAuth callback
POST /auth/refresh          # Refresh access token
GET  /auth/me               # Get current user info
POST /auth/logout           # Clear session
```

## Match Rules

```
GET    /v1/rules/                    # List rules for location
POST   /v1/rules/                    # Create new rule
GET    /v1/rules/{id}                # Get rule details
PUT    /v1/rules/{id}                # Update rule
DELETE /v1/rules/{id}                # Delete rule
POST   /v1/rules/{id}/scan           # Run duplicate scan
```

### Create/Update Rule Body
```json
{
  "name": "Email + Phone Match",
  "source_object": "contacts",
  "match_fields": [
    {
      "field": "email",
      "algorithm": "exact",
      "operator": "AND",
      "weight": 1.0
    }
  ],
  "review_threshold": 0.70,
  "auto_merge_threshold": 0.95,
  "is_active": true,
  "merge_strategy": "standard",
  "merge_settings": {}
}
```

## Matches

```
GET  /v1/matches/                    # List matches (paginated)
GET  /v1/matches/{id}                # Get match details
POST /v1/matches/{id}/approve        # Approve match
POST /v1/matches/{id}/reject         # Reject match
POST /v1/matches/validate            # Validate matches still exist in GHL
POST /v1/matches/cleanup-stale       # Remove stale matches
```

### Query Parameters for List
- `status`: pending, approved, rejected, merged, stale
- `rule_id`: Filter by rule UUID
- `limit`: Max results (default: 50, max: 1000)
- `offset`: Pagination offset

### Response
```json
{
  "data": [...],
  "total": 150,
  "unique_contacts": 89,
  "limit": 50,
  "offset": 0
}
```

## Merges

```
GET  /v1/merges/                     # List merges (with history)
GET  /v1/merges/{id}                 # Get merge details with snapshots
POST /v1/merges/                     # Execute merge
POST /v1/merges/{id}/rollback        # Rollback merge (restore deleted contact)
```

### Execute Merge Body
```json
{
  "match_pair_id": "uuid",
  "master_record_id": "ghl_contact_id",
  "field_selections": {
    "firstName": "master",
    "lastName": "duplicate",
    "email": "master"
  }
}
```

## Settings

```
GET  /v1/settings/merge-strategy     # Get location merge settings
PUT  /v1/settings/merge-strategy     # Update merge settings
```

## Fields (Metadata)

```
GET  /v1/fields/                     # List available objects
GET  /v1/fields/{object}             # Get fields for object type
GET  /v1/fields/pipelines            # Get GHL pipelines and stages
```

## Contacts

```
GET  /v1/contacts/stats              # Get contact count from GHL
```

## Notifications

```
GET    /v1/notifications/            # List notifications
GET    /v1/notifications/unread-count # Get unread count
POST   /v1/notifications/            # Create notification
PUT    /v1/notifications/{id}/read   # Mark as read
DELETE /v1/notifications/{id}        # Delete notification
```

## Rate Limits

Most endpoints: 100 requests/minute per location

Scan endpoint: 10 requests/minute (heavy operation)

## Error Responses

```json
{
  "detail": "Error message here"
}
```

Common status codes:
- 400: Bad request (validation error)
- 401: Unauthorized (invalid/expired token)
- 403: Forbidden (wrong location)
- 404: Not found
- 429: Rate limited
- 500: Server error

## Code Reference

**Backend routes**: `backend/app/api/routes/`
- `auth.py` - Authentication
- `rules.py` - Match rules
- `matches.py` - Match pairs
- `merges.py` - Merge execution
- `settings.py` - Location settings
- `fields.py` - Field metadata
- `contacts.py` - Contact stats
- `notifications.py` - In-app notifications
