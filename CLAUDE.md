# MergeMatch

> Duplicate detection & merge platform for GoHighLevel
> **Domain**: [mergematch.app](https://mergematch.app)

## Knowledge Base

**BEFORE making changes, read the relevant docs:**

```
.claude/knowledge/
├── README.md                 # START HERE - index and critical invariants
├── api/endpoints.md          # All API routes
├── matching/operator-logic.md # How AND/OR conditions work
├── matching/algorithms.md    # Match algorithms (exact, fuzzy, phone, etc.)
├── matching/scoring.md       # Confidence calculation
├── integration/frontend-backend.md # Type alignment checklist
└── data-structures/          # Database schema docs
```

**Quick lookup:**
| Task | Read First |
|------|------------|
| Matching logic changes | `matching/operator-logic.md`, `matching/algorithms.md` |
| API changes | `api/endpoints.md` |
| Type changes | `integration/frontend-backend.md` |
| Database changes | `data-structures/database-schema.md` |
| **Resume testing** | `testing/test-plan.md` |
| Backend changes | Run `test_core_flows_integration` and `test_rollback_safety_integration` |

## Critical Invariants

1. **Multi-tenancy**: All tables have `tenant_id` + `location_id`. Always filter.
2. **Threshold format**: Backend stores 0.0-1.0, frontend displays 0-100%.
3. **Type sync**: Database → Backend Pydantic → Frontend TypeScript must match.
4. **Auth**: All routes use JWT via `get_current_user_flexible`.

## Directory Structure

| Path | Contents |
|------|----------|
| `.claude/knowledge/` | Technical reference docs (read first!) |
| `docs/` | Product requirements and design specs |
| `backend/` | FastAPI backend |
| `src/` | React/TypeScript frontend |
| `ghl-docs/` | GoHighLevel API reference |

## Testing

**Run tests after any backend changes:**

```bash
# All integration tests (rules, scanning, merging, rollback for all record types)
cd backend/tests && ../.venv/bin/python -m unittest test_core_flows_integration -v

# Rollback safety tests (association restore logic)
cd backend/tests && ../.venv/bin/python -m unittest test_rollback_safety_integration -v

# Run both
cd backend/tests && ../.venv/bin/python -m unittest test_core_flows_integration test_rollback_safety_integration -v
```

| Test File | Coverage |
|-----------|----------|
| `backend/tests/test_core_flows_integration.py` | Rule CRUD, scan, merge, and rollback for contacts, companies, opportunities, custom objects |
| `backend/tests/test_rollback_safety_integration.py` | Association restore safety during rollback (ensures only related associations are restored) |

Tests use in-memory fakes (no external services needed). All tests must pass before pushing.

## Quick Commands

```bash
# Backend
cd backend && uvicorn app.main:app --reload

# Frontend
npm run dev

# Build & Deploy Frontend
npm run build && npx vercel --prod

# Backend auto-deploys on push to main
```

## Deployment

| Service | Platform | URL |
|---------|----------|-----|
| Frontend | Vercel | https://merge-match.vercel.app |
| Backend | Render | https://mergematch.onrender.com |
| Database | Supabase | (via MCP) |

## Observability & Logs

**Render service:** `mergematch` (ID: `srv-d59j6c0gjchc73ap4q00`)

**Access logs via CLI:**
```bash
# Recent logs
render logs -r srv-d59j6c0gjchc73ap4q00 --limit 50 --output json

# Search for specific text
render logs -r srv-d59j6c0gjchc73ap4q00 --text "scan,merge,error" --limit 100 --output json

# App logs only (excludes HTTP request logs)
render logs -r srv-d59j6c0gjchc73ap4q00 --type app --limit 50 --output json

# Filter by log level
render logs -r srv-d59j6c0gjchc73ap4q00 --level error --limit 50 --output json
```

**Axiom:** Logs drain to `custom-object-importer` dataset (shared across projects).
- Hostname: `mergematch` for app logs, `mergematch.onrender.com` for HTTP request logs
```bash
# Query Axiom
axiom query "['custom-object-importer'] | where hostname == 'mergematch' | take 50" -f table --start-time "2026-02-01T00:00:00Z"
```

**Axiom Monitors** (email → david@savvysales.ai):
- `nbKcKKvkVSJeHQBBm7` → "MergeMatch — New Install" (triggers on `NEW INSTALL` log)
- `MmgmKWRwt3N04frXBg` → "MergeMatch — Uninstall" (triggers on `UNINSTALL` log)
- Notifier: `oCCzANvP6FvANXUVU7`

**Note:** If `render` CLI shows "token expired", run `render login` to re-authenticate.

### Deploy Process

**Frontend:**
```bash
npm run build && npx vercel --prod
```

**Backend:** Auto-deploys on push to `main` branch (Render).

### After Every Change

**Bug fixes and completed features should be deployed immediately:**

1. Build and verify: `npm run build`
2. Deploy to production: `npx vercel --prod`
3. Commit changes: `git add <files> && git commit -m "message"`
4. Push to remote: `git push origin main`

This ensures users get fixes quickly and backend auto-deploys stay in sync.

## MCP Tools

**Only use `mcp__supabase-mergematch__*` tools for database operations. Never use `mcp__supabase-peaceful__*`.**

## Code Conventions

### Backend (Python/FastAPI)
- Async everywhere (`async def`)
- Pydantic for validation
- Supabase client for DB (not SQLAlchemy)

### Frontend (Vite/React/TypeScript)
- TanStack Query for data fetching
- Tailwind CSS + shadcn/ui for styling
- Types in `src/lib/api.ts`

### Database
- All tables have `tenant_id` for multi-tenancy
- RLS policies enabled
- Soft deletes where applicable

## Task Tracking

See **[TODO.md](./TODO.md)** for current tasks and future enhancements.
