# Frontend/Backend Type Alignment

## Overview

Data flows through three layers that MUST stay synchronized:
1. **Database** — Supabase PostgreSQL tables
2. **Backend** — FastAPI Pydantic models
3. **Frontend** — TypeScript interfaces

When adding or modifying fields, update ALL THREE.

## Type Alignment Checklist

### MatchPair

| Database Column | Backend Response | Frontend Type | Notes |
|-----------------|------------------|---------------|-------|
| id | id | id: string | UUID |
| tenant_id | tenant_id | tenant_id?: string | Multi-tenancy |
| location_id | location_id | location_id?: string | Location scope |
| rule_id | rule_id | rule_id: string | Foreign key |
| record_a_id | record_a_id | record_a_id: string | GHL contact ID |
| record_b_id | record_b_id | record_b_id: string | GHL contact ID |
| record_a_type | record_a_type | record_a_type?: string | "contact", "company" |
| record_b_type | record_b_type | record_b_type?: string | "contact", "company" |
| record_a_data | record_a_data | record_a_data?: Record | Full GHL record |
| record_b_data | record_b_data | record_b_data?: Record | Full GHL record |
| confidence_score | confidence_score | confidence_score: number | 0.0-1.0 |
| field_scores | field_scores | field_scores?: Record | Per-field scores |
| status | status | status: string | pending/approved/rejected/merged/stale |
| reviewed_by | reviewed_by | reviewed_by?: string | User UUID |
| reviewed_at | reviewed_at | reviewed_at?: string | ISO timestamp |
| rejection_reason | rejection_reason | rejection_reason?: string | Text |
| created_at | created_at | created_at: string | ISO timestamp |
| updated_at | updated_at | updated_at?: string | ISO timestamp |

**Frontend file**: `src/lib/api.ts`, interface `MatchPair` (~line 460)

### Merge

| Database Column | Backend Response | Frontend Type | Notes |
|-----------------|------------------|---------------|-------|
| id | id | id: string | UUID |
| tenant_id | tenant_id | tenant_id?: string | Multi-tenancy |
| location_id | location_id | location_id?: string | Location scope |
| match_pair_id | match_pair_id | match_pair_id?: string | Source match |
| master_record_id | master_record_id | master_record_id: string | Surviving contact |
| duplicate_record_id | duplicate_record_id | duplicate_record_id: string | Deleted contact |
| master_snapshot | master_snapshot | master_snapshot?: Record | Pre-merge state |
| duplicate_snapshot | duplicate_snapshot | duplicate_snapshot?: Record | Pre-merge state |
| field_selections | field_selections | field_selections?: Record | Which fields from which record |
| status | status | status: string | completed/rolled_back |
| merged_by | merged_by | merged_by?: string | User UUID |
| completed_at | completed_at | completed_at?: string | ISO timestamp |
| rolled_back_at | rolled_back_at | rolled_back_at?: string | ISO timestamp |
| restored_record_id | restored_record_id | restored_record_id?: string | After rollback |
| created_at | created_at | created_at: string | ISO timestamp |

**Frontend file**: `src/lib/api.ts`, interface `Merge` (~line 472)

### MatchRule

| Database Column | Backend Response | Frontend Type | Notes |
|-----------------|------------------|---------------|-------|
| id | id | id: string | UUID |
| tenant_id | tenant_id | tenant_id?: string | |
| location_id | location_id | location_id?: string | |
| name | name | name: string | Rule display name |
| source_object | source_object | source_object: string | contacts/companies |
| match_fields | match_fields | match_fields: MatchField[] | Array of conditions |
| review_threshold | review_threshold | review_threshold: number | 0.0-1.0 |
| auto_merge_threshold | auto_merge_threshold | auto_merge_threshold: number | 0.0-1.0 |
| is_active | is_active | is_active: boolean | Enable/disable |
| merge_strategy | merge_strategy | merge_strategy?: string | standard/most_recent/etc |
| merge_settings | merge_settings | merge_settings?: object | Additional settings |
| created_at | created_at | created_at: string | |
| updated_at | updated_at | updated_at?: string | |

**Frontend file**: `src/lib/api.ts`, interface `MatchRule` (~line 445)

## Field Preservation Settings

Field preservation can be set at TWO levels:

1. **Location-level** (Settings page)
   - Endpoint: `PUT /v1/settings/merge-strategy`
   - Applies to all rules as default

2. **Rule-level** (Rule edit page)
   - Stored in `match_rules.merge_settings`
   - Overrides location-level when present

**Precedence**: Rule-level > Location-level > System defaults

## Threshold Conversion

| Layer | Format | Example |
|-------|--------|---------|
| Database | Decimal 0.0-1.0 | 0.70 |
| Backend API | Decimal 0.0-1.0 | 0.70 |
| Frontend Display | Percentage 0-100 | 70% |
| Frontend Input | Percentage 0-100 | 70 |

**Conversion on save**: `value / 100`
**Conversion on load**: `value * 100`

## Adding New Fields

When adding a new field:

1. **Database**: Add column via migration in `backend/migrations/`
2. **Backend**: Add to Pydantic model in `backend/app/api/routes/`
3. **Frontend**: Add to TypeScript interface in `src/lib/api.ts`
4. **Docs**: Update this file

## Common Mistakes

1. **Forgetting optional fields**: If DB column is nullable, make frontend type optional (`?`)
2. **Threshold format**: Remember to convert between decimal and percentage
3. **Timestamp format**: Always use ISO 8601 strings, not Date objects
4. **Missing in response**: Backend may not return all fields; check route handler
