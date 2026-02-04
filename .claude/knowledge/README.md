# MergeMatch Knowledge Base

This directory contains authoritative documentation for MergeMatch development.

**IMPORTANT**: Read the relevant docs below BEFORE making changes to related code.

## Quick Reference

| Task | Read First |
|------|------------|
| Modifying matching logic | `matching/operator-logic.md`, `matching/algorithms.md` |
| Changing API endpoints | `api/endpoints.md`, `api/authentication.md` |
| Modifying TypeScript types | `integration/frontend-backend.md` |
| Database schema changes | `data-structures/database-schema.md` |
| Understanding merge flow | `data-structures/merges.md` |
| **Resuming testing** | `testing/test-plan.md` |

## Critical Invariants

These rules MUST be followed in all code:

1. **Multi-tenancy**: All tables have `tenant_id` and `location_id`. Always filter by these.
2. **RLS Enabled**: Row-Level Security is on for all tables. Never bypass.
3. **Auth**: All routes use JWT authentication via `get_current_user_flexible`.
4. **Threshold Conversion**: Backend stores 0.0-1.0, frontend displays 0-100%.
5. **Type Sync**: Database schema → Backend Pydantic → Frontend TypeScript must match.

## Directory Contents

```
knowledge/
├── README.md                 # You are here
├── api/
│   ├── endpoints.md          # All API routes with request/response
│   └── authentication.md     # OAuth flow, JWT handling
├── data-structures/
│   ├── database-schema.md    # All tables and relationships
│   ├── match-rules.md        # MatchRule structure and fields
│   ├── match-pairs.md        # MatchPair lifecycle (pending→approved→merged)
│   └── merges.md             # Merge execution and rollback
├── matching/
│   ├── algorithms.md         # exact, fuzzy, phone, email_domain, etc.
│   ├── operator-logic.md     # How AND/OR conditions work
│   └── scoring.md            # Confidence score calculation
├── integration/
│   ├── frontend-backend.md   # Type alignment checklist
│   └── error-handling.md     # Error codes and patterns
└── testing/
    └── test-plan.md          # Test scenarios T01-T44, test data, progress
```

## Updating This Knowledge Base

When you make changes that affect documented behavior:

1. Update the relevant doc file
2. If adding a new concept, create a new `.md` file in the appropriate directory
3. Update this README if adding new files

## See Also

- `docs/` — Product requirements and design specs (PRD, technical design)
- `TODO.md` — Current task list and future enhancements
- `CLAUDE.md` — Quick reference and deployment commands
