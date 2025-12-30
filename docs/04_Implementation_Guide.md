# MergeMatch: Step-by-Step Implementation Guide

> **Purpose**: Actionable development guide for building MergeMatch in an orderly, best-practice fashion
> **Related Docs**: PRD (01), Gap Specifications (02), Technical Design (03)
> **Last Updated**: 2025-12-22

---

## Table of Contents

1. [Prerequisites & Environment Setup](#1-prerequisites--environment-setup)
2. [Sprint 0: Project Scaffolding](#2-sprint-0-project-scaffolding)
3. [Phase 1: Foundation](#3-phase-1-foundation)
4. [Phase 2: Matching Engine](#4-phase-2-matching-engine)
5. [Phase 3: Merge & Restore System](#5-phase-3-merge--restore-system)
6. [Phase 4: Job Scheduling & Automation](#6-phase-4-job-scheduling--automation)
7. [Phase 5: Multi-Object Support](#7-phase-5-multi-object-support)
8. [Phase 6: Frontend MVP](#8-phase-6-frontend-mvp)
9. [Phase 7: White-Label & Launch](#9-phase-7-white-label--launch)
10. [Appendix: Checklists & Templates](#10-appendix-checklists--templates)

---

# 1. Prerequisites & Environment Setup

## 1.1 Required Accounts

Before starting development, ensure you have:

| Account | Purpose | How to Get |
|---------|---------|-----------|
| **GHL Developer Account** | API access, sandbox testing | https://marketplace.gohighlevel.com/developer |
| **GHL Sandbox Location** | Test environment | Create via developer portal |
| **AWS Account** | Production infrastructure | https://aws.amazon.com |
| **GitHub/GitLab** | Source control | Create organization repo |
| **Stripe Account** | Billing integration | https://stripe.com |

## 1.2 GHL Developer Setup Steps

```markdown
1. Go to https://marketplace.gohighlevel.com/developer
2. Create a new app:
   - App Name: MergeMatch (or your white-label name)
   - App Type: Sub-Account (Location)
   - Scopes required:
     - contacts.readonly, contacts.write
     - companies.readonly, companies.write
     - opportunities.readonly, opportunities.write
     - custom-objects.readonly, custom-objects.write
     - webhooks.readonly, webhooks.write
     - locations.readonly
3. Save credentials:
   - Client ID → .env
   - Client Secret → .env (or secrets manager)
4. Set OAuth Redirect URI:
   - Development: http://localhost:3000/api/auth/callback
   - Staging: https://staging.flowmatch.io/api/auth/callback
   - Production: https://app.flowmatch.io/api/auth/callback
```

## 1.3 Local Development Environment

### Required Software

| Tool | Version | Installation |
|------|---------|-------------|
| Docker Desktop | 4.x+ | https://docker.com/products/docker-desktop |
| Node.js | 20 LTS | `nvm install 20` |
| Python | 3.11+ | `pyenv install 3.11` |
| pnpm | 8+ | `npm install -g pnpm` |
| PostgreSQL Client | 15+ | `brew install libpq` (for psql CLI) |

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "ms-python.python",
    "ms-python.vscode-pylance",
    "charliermarsh.ruff",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "ms-azuretools.vscode-docker"
  ]
}
```

## 1.4 Environment Variables Template

Create `.env.example` with all required variables:

```bash
# ===============================
# FLOWMATCH ENVIRONMENT VARIABLES
# ===============================

# Application
ENVIRONMENT=development  # development | staging | production
DEBUG=true
SECRET_KEY=generate-with-openssl-rand-hex-32

# Database
DATABASE_URL=postgresql://flowmatch:password@localhost:5432/flowmatch

# Redis
REDIS_URL=redis://localhost:6379

# GoHighLevel OAuth
GHL_CLIENT_ID=your-client-id
GHL_CLIENT_SECRET=your-client-secret
GHL_REDIRECT_URI=http://localhost:3000/api/auth/callback
GHL_WEBHOOK_SECRET=generate-random-secret

# Encryption (for token storage)
TOKEN_ENCRYPTION_KEY=generate-32-byte-key-base64

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=MergeMatch

# Stripe (optional for dev)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Monitoring (optional for dev)
SENTRY_DSN=
POSTHOG_API_KEY=
```

---

# 2. Sprint 0: Project Scaffolding

**Duration**: 1 week
**Goal**: Set up repository, CI/CD, and local dev environment

## 2.1 Repository Structure

Create the monorepo structure:

```bash
flowmatch/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── deploy-staging.yml
│   │   └── deploy-production.yml
│   ├── pull_request_template.md
│   └── ISSUE_TEMPLATE/
├── backend/                    # Python FastAPI
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── routes/
│   │   ├── core/
│   │   │   ├── security.py
│   │   │   ├── ghl_client.py
│   │   │   └── matching/
│   │   ├── db/
│   │   │   ├── models.py
│   │   │   └── session.py
│   │   └── services/
│   ├── migrations/
│   ├── tests/
│   ├── requirements.txt
│   ├── requirements-dev.txt
│   ├── Dockerfile
│   └── pyproject.toml
├── frontend/                   # Next.js React
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── styles/
│   ├── public/
│   ├── package.json
│   ├── Dockerfile
│   └── next.config.js
├── infra/                      # Terraform
│   ├── modules/
│   ├── environments/
│   │   ├── staging/
│   │   └── production/
│   └── main.tf
├── docker-compose.yml
├── docker-compose.test.yml
├── .env.example
├── .pre-commit-config.yaml
├── README.md
└── Makefile
```

## 2.2 Docker Compose for Development

```yaml
# docker-compose.yml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: flowmatch
      POSTGRES_USER: flowmatch
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U flowmatch"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://flowmatch:password@db:5432/flowmatch
      - REDIS_URL=redis://redis:6379
    env_file:
      - .env
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./backend:/app
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  worker:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      - DATABASE_URL=postgresql://flowmatch:password@db:5432/flowmatch
      - REDIS_URL=redis://redis:6379
    env_file:
      - .env
    depends_on:
      - db
      - redis
    volumes:
      - ./backend:/app
    command: celery -A app.worker worker --loglevel=info

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
    env_file:
      - .env
    volumes:
      - ./frontend:/app
      - /app/node_modules
    command: pnpm dev

volumes:
  postgres_data:
```

## 2.3 CI/CD Pipeline Setup

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  PYTHON_VERSION: '3.11'
  NODE_VERSION: '20'

jobs:
  lint-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: ${{ env.PYTHON_VERSION }}
      - name: Install dependencies
        run: |
          pip install ruff
          pip install -r backend/requirements-dev.txt
      - name: Run Ruff
        run: ruff check backend/

  lint-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
          cache-dependency-path: frontend/pnpm-lock.yaml
      - name: Install dependencies
        run: cd frontend && pnpm install
      - name: Run ESLint
        run: cd frontend && pnpm lint

  test-backend:
    runs-on: ubuntu-latest
    needs: lint-backend
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      redis:
        image: redis:7
        ports:
          - 6379:6379
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: ${{ env.PYTHON_VERSION }}
      - name: Install dependencies
        run: pip install -r backend/requirements-dev.txt
      - name: Run tests
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/test
          REDIS_URL: redis://localhost:6379
        run: |
          cd backend
          pytest --cov=app --cov-report=xml
      - name: Upload coverage
        uses: codecov/codecov-action@v4

  test-frontend:
    runs-on: ubuntu-latest
    needs: lint-frontend
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
          cache-dependency-path: frontend/pnpm-lock.yaml
      - name: Install dependencies
        run: cd frontend && pnpm install
      - name: Run tests
        run: cd frontend && pnpm test

  build:
    runs-on: ubuntu-latest
    needs: [test-backend, test-frontend]
    steps:
      - uses: actions/checkout@v4
      - name: Build backend image
        run: docker build -t flowmatch/api:${{ github.sha }} backend/
      - name: Build frontend image
        run: docker build -t flowmatch/web:${{ github.sha }} frontend/
```

## 2.4 Sprint 0 Checklist

```markdown
## Sprint 0: Project Scaffolding Checklist

### Repository Setup
- [ ] Create GitHub repository with branch protection
- [ ] Set up monorepo structure (backend/, frontend/, infra/)
- [ ] Add .gitignore, .editorconfig
- [ ] Create .env.example with all variables documented

### Development Environment
- [ ] Docker Compose working (db, redis, api, frontend)
- [ ] Pre-commit hooks installed (ruff, eslint, prettier)
- [ ] VS Code workspace configured

### CI/CD
- [ ] GitHub Actions workflow passing
- [ ] Linting jobs (ruff, eslint)
- [ ] Test jobs with coverage
- [ ] Docker build jobs

### Documentation
- [ ] README.md with setup instructions
- [ ] CONTRIBUTING.md
- [ ] PR template added

### Definition of Done
- [ ] `docker-compose up` starts all services
- [ ] API responds at http://localhost:8000/health
- [ ] Frontend loads at http://localhost:3000
- [ ] All CI checks passing
```

---

# 3. Phase 1: Foundation

**Duration**: 3 weeks
**Goal**: GHL OAuth, API client, multi-tenant database

## 3.1 Week 1: Database & Migrations

### Step 1: Set up Alembic migrations

```bash
cd backend
alembic init migrations
```

### Step 2: Create initial migration

```python
# backend/app/db/models.py
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.db.base import Base

class Tenant(Base):
    __tablename__ = "tenants"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ghl_company_id = Column(String(50), unique=True, nullable=False)
    name = Column(String(255))
    branding = Column(JSON, default={})
    plan = Column(String(50), default="starter")
    billing_status = Column(String(20), default="active")
    ghl_access_token_encrypted = Column(Text)
    ghl_refresh_token_encrypted = Column(Text)
    token_expires_at = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    locations = relationship("Location", back_populates="tenant", cascade="all, delete-orphan")


class Location(Base):
    __tablename__ = "locations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    ghl_location_id = Column(String(50), nullable=False)
    name = Column(String(255))
    settings = Column(JSON, default={})
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    tenant = relationship("Tenant", back_populates="locations")
```

### Step 3: Enable Row-Level Security

```sql
-- migrations/versions/002_enable_rls.sql
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_pairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE merges ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION current_tenant_id() RETURNS UUID AS $$
BEGIN
    RETURN current_setting('app.current_tenant_id', true)::UUID;
EXCEPTION
    WHEN OTHERS THEN RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY tenant_isolation ON locations
    FOR ALL USING (tenant_id = current_tenant_id());
```

## 3.2 Week 2: GHL OAuth & API Client

### Step 1: OAuth Flow Implementation

```python
# backend/app/core/ghl_oauth.py
from httpx import AsyncClient
from app.config import settings

class GHLOAuth:
    AUTH_URL = "https://marketplace.gohighlevel.com/oauth/chooselocation"
    TOKEN_URL = "https://services.leadconnectorhq.com/oauth/token"

    def get_authorization_url(self, state: str) -> str:
        params = {
            "response_type": "code",
            "client_id": settings.GHL_CLIENT_ID,
            "redirect_uri": settings.GHL_REDIRECT_URI,
            "scope": " ".join([
                "contacts.readonly", "contacts.write",
                "companies.readonly", "companies.write",
                "opportunities.readonly", "opportunities.write",
                "locations.readonly",
            ]),
            "state": state,
        }
        return f"{self.AUTH_URL}?{urlencode(params)}"

    async def exchange_code(self, code: str) -> dict:
        async with AsyncClient() as client:
            response = await client.post(
                self.TOKEN_URL,
                data={
                    "grant_type": "authorization_code",
                    "code": code,
                    "client_id": settings.GHL_CLIENT_ID,
                    "client_secret": settings.GHL_CLIENT_SECRET,
                    "redirect_uri": settings.GHL_REDIRECT_URI,
                }
            )
            response.raise_for_status()
            return response.json()
```

### Step 2: GHL API Client with Retry

```python
# backend/app/core/ghl_client.py
import httpx
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

class GHLClient:
    BASE_URL = "https://services.leadconnectorhq.com"

    def __init__(self, access_token: str, location_id: str):
        self.access_token = access_token
        self.location_id = location_id
        self._client = httpx.AsyncClient(
            base_url=self.BASE_URL,
            headers={
                "Authorization": f"Bearer {access_token}",
                "Version": "2021-07-28",
            },
            timeout=30.0,
        )

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        retry=retry_if_exception_type((httpx.HTTPStatusError, httpx.TimeoutException)),
    )
    async def get_contacts(self, limit: int = 100, offset: int = 0) -> dict:
        response = await self._client.get(
            f"/contacts/",
            params={"locationId": self.location_id, "limit": limit, "startAfter": offset}
        )
        response.raise_for_status()
        return response.json()

    async def get_contact(self, contact_id: str) -> dict:
        response = await self._client.get(f"/contacts/{contact_id}")
        response.raise_for_status()
        return response.json()

    async def update_contact(self, contact_id: str, data: dict) -> dict:
        response = await self._client.put(f"/contacts/{contact_id}", json=data)
        response.raise_for_status()
        return response.json()

    async def delete_contact(self, contact_id: str) -> None:
        response = await self._client.delete(f"/contacts/{contact_id}")
        response.raise_for_status()
```

## 3.3 Week 3: API Routes & Health Checks

### Step 1: Basic API Structure

```python
# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import auth, health, matches, merges, rules, jobs

app = FastAPI(
    title="MergeMatch API",
    version="1.0.0",
    docs_url="/api/docs",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.gohighlevel.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, tags=["Health"])
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(matches.router, prefix="/v1/matches", tags=["Matches"])
app.include_router(merges.router, prefix="/v1/merges", tags=["Merges"])
app.include_router(rules.router, prefix="/v1/rules", tags=["Rules"])
app.include_router(jobs.router, prefix="/v1/jobs", tags=["Jobs"])
```

### Step 2: Health Check Endpoint

```python
# backend/app/api/routes/health.py
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db

router = APIRouter()

@router.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    # Check database
    try:
        await db.execute("SELECT 1")
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "checks": {
            "database": db_status,
        }
    }
```

## 3.4 Phase 1 Checklist

```markdown
## Phase 1: Foundation Checklist

### Week 1: Database
- [ ] Alembic configured with async support
- [ ] Core tables created (tenants, locations)
- [ ] RLS policies enabled and tested
- [ ] Indexes on tenant_id columns

### Week 2: GHL Integration
- [ ] OAuth flow working end-to-end
- [ ] Token storage with encryption
- [ ] Token refresh automation
- [ ] GHL API client with retry logic
- [ ] Rate limit handling

### Week 3: API Foundation
- [ ] FastAPI app structure complete
- [ ] Health check endpoint with DB check
- [ ] CORS configured for GHL domains
- [ ] Authentication middleware
- [ ] Tenant context middleware (sets RLS)

### Testing
- [ ] Unit tests for OAuth flow
- [ ] Integration tests for GHL client (mocked)
- [ ] Database migration tests

### Definition of Done
- [ ] OAuth flow: Install from GHL → redirect → tokens stored
- [ ] API responds with tenant context
- [ ] Health check shows all systems green
```

---

# 4. Phase 2: Matching Engine

**Duration**: 3 weeks
**Goal**: Configurable matching rules, scoring pipeline, blocking strategies

## 4.1 Week 4: Match Rule Configuration

### Step 1: Match Rule Schema

```python
# backend/app/db/models.py (add to existing)

class MatchRule(Base):
    __tablename__ = "match_rules"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    name = Column(String(255), nullable=False)
    source_object = Column(String(50), nullable=False)  # contact, company, opportunity
    is_active = Column(Boolean, default=True)
    match_fields = Column(JSON, nullable=False)  # [{field, algorithm, weight, required}]
    blocking_strategy = Column(JSON, default={})  # {field, function}
    auto_merge_threshold = Column(Float, default=0.95)
    review_threshold = Column(Float, default=0.70)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
```

### Step 2: Match Rule API

```python
# backend/app/api/routes/rules.py
from fastapi import APIRouter, Depends, HTTPException
from app.schemas.rules import MatchRuleCreate, MatchRuleUpdate, MatchRuleResponse

router = APIRouter()

@router.post("/", response_model=MatchRuleResponse)
async def create_rule(
    rule: MatchRuleCreate,
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    # Validate weights sum to 1.0
    total_weight = sum(f.weight for f in rule.match_fields)
    if abs(total_weight - 1.0) > 0.01:
        raise HTTPException(400, "Field weights must sum to 1.0")

    db_rule = MatchRule(tenant_id=tenant.id, **rule.dict())
    db.add(db_rule)
    await db.commit()
    return db_rule
```

## 4.2 Week 5: Scoring Pipeline

### Step 1: Matching Algorithms

```python
# backend/app/core/matching/algorithms.py
from rapidfuzz import fuzz
from phonetics import metaphone
import re

class MatchingAlgorithms:
    @staticmethod
    def exact_match(a: str, b: str) -> float:
        if not a or not b:
            return 0.0
        return 1.0 if a.lower().strip() == b.lower().strip() else 0.0

    @staticmethod
    def fuzzy_match(a: str, b: str) -> float:
        if not a or not b:
            return 0.0
        return fuzz.ratio(a.lower(), b.lower()) / 100.0

    @staticmethod
    def phone_match(a: str, b: str) -> float:
        def normalize(phone: str) -> str:
            return re.sub(r'[^\d]', '', phone or '')[-10:]  # Last 10 digits

        norm_a, norm_b = normalize(a), normalize(b)
        if not norm_a or not norm_b:
            return 0.0
        return 1.0 if norm_a == norm_b else 0.0

    @staticmethod
    def email_domain_match(a: str, b: str) -> float:
        def get_domain(email: str) -> str:
            if not email or '@' not in email:
                return ''
            return email.lower().split('@')[1]

        domain_a, domain_b = get_domain(a), get_domain(b)
        if not domain_a or not domain_b:
            return 0.0
        return 1.0 if domain_a == domain_b else 0.0

    @staticmethod
    def phonetic_match(a: str, b: str) -> float:
        if not a or not b:
            return 0.0
        return 1.0 if metaphone(a) == metaphone(b) else 0.0
```

### Step 2: Scoring Engine

```python
# backend/app/core/matching/scorer.py
from typing import List, Dict, Any
from app.core.matching.algorithms import MatchingAlgorithms

ALGORITHM_MAP = {
    "exact": MatchingAlgorithms.exact_match,
    "fuzzy": MatchingAlgorithms.fuzzy_match,
    "phone": MatchingAlgorithms.phone_match,
    "email_domain": MatchingAlgorithms.email_domain_match,
    "phonetic": MatchingAlgorithms.phonetic_match,
}

class MatchScorer:
    def __init__(self, rule: MatchRule):
        self.rule = rule
        self.match_fields = rule.match_fields

    def score(self, record_a: dict, record_b: dict) -> dict:
        field_scores = []
        total_weight = 0.0
        weighted_score = 0.0

        for field_config in self.match_fields:
            field_name = field_config["field"]
            algorithm = field_config["algorithm"]
            weight = field_config["weight"]
            required = field_config.get("required", False)

            value_a = record_a.get(field_name)
            value_b = record_b.get(field_name)

            # Skip if both null
            if not value_a and not value_b:
                continue

            # Calculate score
            match_fn = ALGORITHM_MAP.get(algorithm, MatchingAlgorithms.exact_match)
            score = match_fn(str(value_a or ""), str(value_b or ""))

            # If required field doesn't match, overall score is 0
            if required and score < 0.9:
                return {
                    "total_score": 0.0,
                    "field_scores": [],
                    "failed_required": field_name,
                }

            field_scores.append({
                "field": field_name,
                "algorithm": algorithm,
                "value_a": value_a,
                "value_b": value_b,
                "score": score,
                "weight": weight,
            })

            total_weight += weight
            weighted_score += score * weight

        # Normalize if weights don't sum to 1 (due to skipped nulls)
        final_score = weighted_score / total_weight if total_weight > 0 else 0.0

        return {
            "total_score": round(final_score, 4),
            "field_scores": field_scores,
        }
```

## 4.3 Week 6: Blocking & Match Pair Storage

### Step 1: Blocking Strategy

```python
# backend/app/core/matching/blocker.py
from typing import List, Dict, Callable
import hashlib

class BlockingStrategies:
    @staticmethod
    def email_domain(record: dict) -> str:
        email = record.get("email", "")
        if not email or "@" not in email:
            return ""
        return email.lower().split("@")[1]

    @staticmethod
    def phone_area_code(record: dict) -> str:
        phone = record.get("phone", "")
        digits = ''.join(c for c in phone if c.isdigit())
        return digits[:3] if len(digits) >= 3 else ""

    @staticmethod
    def first_letter_last_name(record: dict) -> str:
        name = record.get("lastName", "")
        return name[0].upper() if name else ""

    @staticmethod
    def soundex_name(record: dict) -> str:
        # Simplified soundex for blocking
        name = record.get("firstName", "") + record.get("lastName", "")
        return hashlib.md5(name.lower().encode()).hexdigest()[:4]


def create_blocks(records: List[dict], strategy: str) -> Dict[str, List[dict]]:
    """Group records into blocks for comparison."""
    blocks = {}
    strategy_fn = getattr(BlockingStrategies, strategy, BlockingStrategies.email_domain)

    for record in records:
        key = strategy_fn(record)
        if key:
            if key not in blocks:
                blocks[key] = []
            blocks[key].append(record)

    return blocks
```

### Step 2: Match Pair Storage

```python
# backend/app/db/models.py (add)

class MatchPair(Base):
    __tablename__ = "match_pairs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    location_id = Column(UUID(as_uuid=True), ForeignKey("locations.id"), nullable=False)
    rule_id = Column(UUID(as_uuid=True), ForeignKey("match_rules.id"))

    record_a_id = Column(String(50), nullable=False)  # GHL Contact ID
    record_a_type = Column(String(50), nullable=False)
    record_b_id = Column(String(50), nullable=False)
    record_b_type = Column(String(50), nullable=False)

    confidence_score = Column(Float, nullable=False)
    field_scores = Column(JSON)  # Detailed breakdown

    status = Column(String(20), default="pending")  # pending, approved, rejected, merged
    reviewed_by = Column(UUID(as_uuid=True))
    reviewed_at = Column(DateTime)
    rejection_reason = Column(Text)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
```

## 4.4 Phase 2 Checklist

```markdown
## Phase 2: Matching Engine Checklist

### Week 4: Match Rules
- [ ] MatchRule model with JSON field config
- [ ] CRUD API for match rules
- [ ] Weight validation (sum to 1.0)
- [ ] Default rule templates

### Week 5: Scoring
- [ ] Exact, fuzzy, phone, email algorithms
- [ ] Phonetic matching (Metaphone)
- [ ] Weighted composite scoring
- [ ] Required field handling

### Week 6: Blocking & Storage
- [ ] Blocking strategies implemented
- [ ] Block comparison logic (O(n²) within block)
- [ ] MatchPair storage with scores
- [ ] Status transitions (pending → approved/rejected/merged)

### Testing
- [ ] Algorithm unit tests with edge cases
- [ ] Scoring tests with weight redistribution
- [ ] Blocking efficiency tests
- [ ] Integration: scan → store matches

### Definition of Done
- [ ] Create rule with 3+ fields
- [ ] Scan 1000 contacts, find duplicates
- [ ] Matches stored with confidence scores
- [ ] Review queue shows pending matches
```

---

# 5. Phase 3: Merge & Restore System

**Duration**: 2 weeks
**Goal**: Safe merge execution with full rollback capability

## 5.1 Week 7: Snapshot System

```python
# backend/app/core/merging/snapshot.py
from datetime import datetime
import json

class SnapshotService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_snapshot(
        self,
        record_id: str,
        record_type: str,
        record_data: dict,
        merge_id: UUID,
    ) -> Snapshot:
        snapshot = Snapshot(
            merge_id=merge_id,
            record_id=record_id,
            record_type=record_type,
            data=json.dumps(record_data),
            created_at=datetime.utcnow(),
        )
        self.db.add(snapshot)
        await self.db.flush()
        return snapshot

    async def restore_snapshot(self, snapshot: Snapshot, ghl_client: GHLClient) -> dict:
        """Restore a record from snapshot."""
        data = json.loads(snapshot.data)

        if snapshot.record_type == "contact":
            return await ghl_client.create_contact(data)
        elif snapshot.record_type == "company":
            return await ghl_client.create_company(data)
        # etc.
```

## 5.2 Week 8: Merge Execution

```python
# backend/app/core/merging/executor.py
from typing import Dict, Any
from app.core.ghl_client import GHLClient

class MergeExecutor:
    def __init__(self, ghl_client: GHLClient, db: AsyncSession):
        self.ghl = ghl_client
        self.db = db
        self.snapshot_service = SnapshotService(db)

    async def execute_merge(
        self,
        match_pair: MatchPair,
        master_id: str,
        field_selections: Dict[str, str],  # field -> "a" or "b"
    ) -> Merge:
        duplicate_id = match_pair.record_a_id if master_id == match_pair.record_b_id else match_pair.record_b_id

        # Create merge record
        merge = Merge(
            tenant_id=match_pair.tenant_id,
            match_pair_id=match_pair.id,
            master_record_id=master_id,
            duplicate_record_id=duplicate_id,
            status="in_progress",
        )
        self.db.add(merge)
        await self.db.flush()

        try:
            # 1. Fetch both records
            master = await self.ghl.get_contact(master_id)
            duplicate = await self.ghl.get_contact(duplicate_id)

            # 2. Create snapshots
            await self.snapshot_service.create_snapshot(
                master_id, "contact", master, merge.id
            )
            await self.snapshot_service.create_snapshot(
                duplicate_id, "contact", duplicate, merge.id
            )

            # 3. Compute merged values
            merged_data = self._compute_merged_values(master, duplicate, field_selections)

            # 4. Update master with merged data
            await self.ghl.update_contact(master_id, merged_data)

            # 5. Reassign related records (notes, tasks, opportunities)
            await self._reassign_related_records(duplicate_id, master_id)

            # 6. Delete duplicate
            await self.ghl.delete_contact(duplicate_id)

            # 7. Update merge status
            merge.status = "completed"
            merge.completed_at = datetime.utcnow()
            match_pair.status = "merged"

            await self.db.commit()
            return merge

        except Exception as e:
            merge.status = "failed"
            merge.error_message = str(e)
            await self.db.commit()
            raise

    def _compute_merged_values(
        self,
        master: dict,
        duplicate: dict,
        field_selections: Dict[str, str],
    ) -> dict:
        merged = master.copy()

        for field, source in field_selections.items():
            if source == "b":
                merged[field] = duplicate.get(field, master.get(field))

        return merged
```

## 5.3 Phase 3 Checklist

```markdown
## Phase 3: Merge & Restore Checklist

### Week 7: Snapshots
- [ ] Snapshot model (stores full record JSON)
- [ ] Create snapshot before any modification
- [ ] Snapshot retrieval by merge ID
- [ ] Data encryption at rest

### Week 8: Merge Execution
- [ ] Merge executor with transaction safety
- [ ] Field selection support
- [ ] Related record reassignment
- [ ] Duplicate deletion
- [ ] Rollback within 30 days
- [ ] Merge audit log

### Testing
- [ ] Merge creates correct snapshots
- [ ] Rollback restores exact state
- [ ] Failed merge doesn't corrupt data
- [ ] Concurrent merge handling

### Definition of Done
- [ ] Approve match → Execute merge → Duplicate gone
- [ ] Undo merge within 30 days → Duplicate restored
- [ ] Full audit trail visible
```

---

# 6. Phase 4: Job Scheduling & Automation

**Duration**: 2 weeks
**Goal**: Background scanning, scheduled jobs, Celery integration

## 6.1 Week 9: Celery Setup

```python
# backend/app/worker.py
from celery import Celery
from app.config import settings

celery_app = Celery(
    "flowmatch",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_routes={
        "app.tasks.scan.*": {"queue": "scans"},
        "app.tasks.merge.*": {"queue": "merges"},
    },
)
```

```python
# backend/app/tasks/scan.py
from app.worker import celery_app
from app.core.matching.scanner import DuplicateScanner

@celery_app.task(bind=True, max_retries=3)
def run_duplicate_scan(self, location_id: str, rule_id: str):
    try:
        scanner = DuplicateScanner(location_id, rule_id)
        result = scanner.run()
        return {"matches_found": result.matches_found, "records_scanned": result.records_scanned}
    except Exception as e:
        self.retry(exc=e, countdown=60)
```

## 6.2 Week 10: Scheduled Jobs

```python
# backend/app/tasks/scheduler.py
from celery.schedules import crontab
from app.worker import celery_app

celery_app.conf.beat_schedule = {
    "refresh-tokens-hourly": {
        "task": "app.tasks.maintenance.refresh_expiring_tokens",
        "schedule": crontab(minute=0),  # Every hour
    },
    "cleanup-old-snapshots": {
        "task": "app.tasks.maintenance.cleanup_old_snapshots",
        "schedule": crontab(hour=3, minute=0),  # Daily at 3 AM
    },
}

# Per-location scheduled scans stored in DB
@celery_app.task
def process_scheduled_scans():
    """Check for and execute scheduled scans."""
    jobs = DedupJob.query.filter(
        DedupJob.next_run <= datetime.utcnow(),
        DedupJob.is_active == True,
    ).all()

    for job in jobs:
        run_duplicate_scan.delay(job.location_id, job.rule_id)
        job.last_run = datetime.utcnow()
        job.next_run = calculate_next_run(job.schedule)
```

---

# 7. Phase 5: Multi-Object Support

**Duration**: 2 weeks
**Goal**: Companies, Opportunities, Custom Objects

## 7.1 Week 11: Companies & Opportunities

Extend matching to work with:
- `/companies/` endpoint
- `/opportunities/` endpoint

Key changes:
- Add `object_type` to MatchRule
- Update GHLClient with company/opportunity methods
- Add cross-object matching (lead-to-company)

## 7.2 Week 12: Custom Objects

```python
# backend/app/core/ghl_client.py (add)

async def get_custom_objects(self, schema_key: str, limit: int = 100) -> dict:
    response = await self._client.get(
        f"/custom-objects/{schema_key}/records",
        params={"locationId": self.location_id, "limit": limit}
    )
    response.raise_for_status()
    return response.json()
```

---

# 8. Phase 6: Frontend MVP

**Duration**: 4 weeks
**Goal**: Full embedded GHL app

## 8.1 Week 13: React Scaffolding

```bash
cd frontend
pnpm create next-app . --typescript --tailwind --app
pnpm add @tanstack/react-query axios zustand
pnpm add -D @types/node
```

## 8.2 Week 14: GHL Embedded Integration

```typescript
// frontend/src/lib/ghl-sdk.ts
import Postmate from 'postmate';

export async function initGHLEmbed() {
  const handshake = new Postmate.Model({
    // Expose methods to parent (GHL)
    getHeight: () => document.body.scrollHeight,
  });

  const parent = await handshake;

  // Get context from GHL
  parent.emit('getContext');

  return parent;
}
```

## 8.3 Weeks 15-16: Core UI Components

Build components from Gap Specifications Section 8:
- Match list with filters
- Side-by-side comparison
- Field selector for merge
- Merge confirmation modal
- Undo toast

---

# 9. Phase 7: White-Label & Launch

**Duration**: 2 weeks
**Goal**: Marketplace submission, production deployment

## 9.1 Week 17: White-Label Configuration

- Tenant branding settings (logo, colors, app name)
- Custom domain support (optional)
- White-label email templates

## 9.2 Week 18: Marketplace Submission

```markdown
## GHL Marketplace Submission Checklist

- [ ] App name and description finalized
- [ ] Screenshots (5+ required)
- [ ] Video demo (recommended)
- [ ] Privacy policy URL
- [ ] Terms of service URL
- [ ] Support email configured
- [ ] OAuth scopes justified
- [ ] Webhook endpoints secured
- [ ] Rate limit handling verified
- [ ] Pricing tiers configured
```

---

# 10. Appendix: Checklists & Templates

## 10.1 Per-Sprint Checklist Template

```markdown
## Sprint [X] Checklist

### Planning
- [ ] Sprint goal defined
- [ ] Stories estimated and assigned
- [ ] Dependencies identified

### Development
- [ ] Feature branches created
- [ ] Code reviewed before merge
- [ ] Tests written for new code
- [ ] Documentation updated

### Quality
- [ ] All tests passing
- [ ] Coverage maintained (80%+)
- [ ] No critical security issues
- [ ] Performance benchmarks met

### Deployment
- [ ] Staging deployment successful
- [ ] QA sign-off received
- [ ] Release notes drafted
```

## 10.2 Definition of Done

```markdown
## Definition of Done

A story is "Done" when:

1. **Code Complete**
   - Feature implemented per acceptance criteria
   - Code reviewed by at least 1 team member
   - No linting errors or warnings

2. **Tested**
   - Unit tests written and passing
   - Integration tests for API endpoints
   - Manual QA in staging environment

3. **Documented**
   - API changes reflected in OpenAPI spec
   - README updated if needed
   - In-code comments for complex logic

4. **Deployed**
   - Merged to main branch
   - CI/CD pipeline passed
   - Deployed to staging

5. **Verified**
   - Product owner reviewed in staging
   - Acceptance criteria met
```

## 10.3 PR Template

```markdown
## Summary
<!-- Brief description of changes -->

## Changes
-
-

## Type
- [ ] Feature
- [ ] Bug fix
- [ ] Refactoring
- [ ] Documentation

## Testing
- [ ] Unit tests added
- [ ] Manual testing done

## Checklist
- [ ] Code follows style guide
- [ ] Self-reviewed
- [ ] Tests passing
- [ ] Docs updated

## Screenshots
<!-- If UI changes -->
```

---

## Quick Reference: Key Commands

```bash
# Start development environment
docker-compose up -d

# Run backend tests
docker-compose exec api pytest

# Run frontend tests
cd frontend && pnpm test

# Create database migration
docker-compose exec api alembic revision --autogenerate -m "description"

# Apply migrations
docker-compose exec api alembic upgrade head

# Run Celery worker
docker-compose exec worker celery -A app.worker worker --loglevel=info

# Run Celery beat (scheduler)
docker-compose exec worker celery -A app.worker beat --loglevel=info

# Deploy to staging
git push origin main  # Triggers CI/CD

# View logs
docker-compose logs -f api
```

---

> **Next Steps**: Start with Sprint 0 checklist, then proceed phase by phase. Each phase builds on the previous, so complete phases in order.
