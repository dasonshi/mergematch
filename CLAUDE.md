# MergeMatch

> Duplicate detection & merge platform for GoHighLevel
>
> **Domain**: [mergematch.app](https://mergematch.app)

## Directory Structure

| Path | Contents |
|------|----------|
| `docs/01_PRD_Scoping.md` | Product requirements, pricing, features, phases |
| `docs/02_Gap_Specifications.md` | Technical specs, security, UI copy |
| `docs/03_Technical_Design.md` | Architecture, database schema |
| `docs/04_Implementation_Guide.md` | Step-by-step build guide |
| `ghl-docs/out-md/` | GoHighLevel API documentation (scraped) |

## Code Conventions

### Backend (Python/FastAPI)
- Async everywhere (`async def`)
- Pydantic for validation
- SQLAlchemy 2.0 async ORM
- Alembic for migrations
- Ruff for linting
- Pytest for testing

### Frontend (Vite/React/TypeScript)
- Vite for build tooling
- React Router for routing
- TanStack Query for data fetching
- Tailwind CSS + shadcn/ui for styling

### Database
- All tables have `tenant_id` for multi-tenancy
- RLS policies on all tables
- Soft deletes where applicable
- Timestamps: `created_at`, `updated_at`

## Deployment

| Service | Platform | URL |
|---------|----------|-----|
| Frontend | Vercel | https://merge-match.vercel.app |
| Backend | Render | (auto-deploys from main branch) |
| Database | Supabase | (connected via MCP) |

**Deploy frontend:** `npm run build && npx vercel --prod`
**Deploy backend:** Push to main branch (Render auto-deploys)

## Development Commands

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend (from repo root)
npm install
npm run dev

# Build & Deploy
npm run build
npx vercel --prod
```

## Current Phase

**Active Development** - Core features implemented, in review/polish phase

## Task Tracking

See **[TODO.md](./TODO.md)** for:
- Services to implement (email notifications)
- Pages to review (with descriptions)
- Backend APIs to review
- Database schema review
- Future enhancements
