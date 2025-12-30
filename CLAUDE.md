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

### Frontend (Next.js/TypeScript)
- App Router (Next.js 14)
- Server Components by default
- TanStack Query for data fetching
- Zustand for client state
- Tailwind CSS for styling

### Database
- All tables have `tenant_id` for multi-tenancy
- RLS policies on all tables
- Soft deletes where applicable
- Timestamps: `created_at`, `updated_at`

## Development Commands

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev

# Docker (full stack)
docker-compose -f docker-compose.dev.yml up
```

## Current Phase

**Pre-Build**: Reviewing documentation before Sprint 0

**Next Steps**:
1. Complete PRD review (Sections 8-11 remaining)
2. Review Gap Specifications
3. Review Technical Design
4. Review Implementation Guide
5. Begin Sprint 0 scaffolding
