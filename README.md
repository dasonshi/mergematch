# MergeMatch

> LeanData for GoHighLevel - Data matching and deduplication platform
>
> **Domain**: [mergematch.app](https://mergematch.app)

---

## Project Overview

MergeMatch is a white-label data matching and deduplication platform designed for GoHighLevel agencies. It enables agencies to provide their SMB clients with enterprise-grade duplicate detection, intelligent matching, and data quality management.

### Key Features

- Intelligent duplicate detection with configurable matching rules
- Side-by-side comparison and one-click merge
- Scheduled background scans
- Full audit trail with 30-day rollback capability
- White-label support for agencies
- Multi-object support (Contacts, Companies, Opportunities, Custom Objects)

---

## Documentation

| Document | Description |
|----------|-------------|
| [01_PRD_Scoping.md](docs/01_PRD_Scoping.md) | Product Requirements & Scoping Specification |
| [02_Gap_Specifications.md](docs/02_Gap_Specifications.md) | Detailed Technical Specifications |
| [03_Technical_Design.md](docs/03_Technical_Design.md) | Architecture & Database Schema |
| [04_Implementation_Guide.md](docs/04_Implementation_Guide.md) | Step-by-Step Development Guide |

### Reference Materials

| Folder | Contents |
|--------|----------|
| [ghl-docs/](ghl-docs/) | GoHighLevel API documentation & examples |

---

## Development Phases

| Phase | Duration | Focus Area | Status |
|-------|----------|------------|--------|
| Sprint 0 | 1 week | Project scaffolding, CI/CD | Not Started |
| Phase 1 | 3 weeks | Foundation (OAuth, API client, DB) | Not Started |
| Phase 2 | 3 weeks | Matching Engine (rules, scoring) | Not Started |
| Phase 3 | 2 weeks | Merge & Restore System | Not Started |
| Phase 4 | 2 weeks | Job Scheduling & Automation | Not Started |
| Phase 5 | 2 weeks | Multi-Object Support | Not Started |
| Phase 6 | 4 weeks | Frontend MVP | Not Started |
| Phase 7 | 2 weeks | White-Label & Launch | Not Started |

**Total**: ~18 weeks to production MVP

---

## Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL 15 with Row-Level Security
- **Cache/Queue**: Redis + Celery
- **ORM**: SQLAlchemy 2.0 (async)

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: TanStack Query + Zustand

### Infrastructure
- **Frontend Hosting**: Vercel
- **Backend Hosting**: Render
- **Database**: Supabase PostgreSQL (with RLS)
- **CI/CD**: GitHub Actions
- **Logging**: Axiom

---

## Quick Start

See [04_Implementation_Guide.md](docs/04_Implementation_Guide.md) for detailed setup instructions.

```bash
# Prerequisites
# - Docker Desktop
# - Node.js 20+
# - Python 3.11+

# Clone and setup
git clone https://github.com/your-org/mergematch.git
cd mergematch
cp .env.example .env

# Start development environment
docker-compose up -d

# Access
# - API: http://localhost:8000
# - Frontend: http://localhost:3000
# - API Docs: http://localhost:8000/api/docs
```

---

## Business Context

| Metric | Value |
|--------|-------|
| Target Market | 60,000+ GHL agencies |
| Pricing | Freemium: Free / $39 / $59 / $89 per location/month |
| Billing | GHL Marketplace internal (0% commission) |
| Year 1 Target | $354K ARR (500 paid locations @ $59 avg) |

---

## License

Proprietary - All rights reserved
