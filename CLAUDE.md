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
