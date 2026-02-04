# MergeMatch - Product Requirements Document & Scoping Specification

**Version**: 1.0
**Last Updated**: December 17, 2024
**Product**: MergeMatch - LeanData for GoHighLevel
**Document Type**: Comprehensive PRD with Technical Scoping

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Vision & Goals](#2-product-vision--goals)
3. [User Personas & Journey Maps](#3-user-personas--journey-maps)
4. [Feature Specifications](#4-feature-specifications)
5. [Phase 1: Foundation](#5-phase-1-foundation)
6. [Phase 2: Core Matching Engine](#6-phase-2-core-matching-engine)
7. [Phase 3: Merge & Restore System](#7-phase-3-merge--restore-system)
8. [Phase 4: Job Scheduling & Automation](#8-phase-4-job-scheduling--automation)
9. [Phase 5: Multi-Object Support](#9-phase-5-multi-object-support)
10. [Phase 6: Frontend MVP](#10-phase-6-frontend-mvp)
11. [Phase 7: White-Label & Launch](#11-phase-7-white-label--launch)
12. [Data Architecture](#12-data-architecture)
13. [API Specifications](#13-api-specifications)
14. [Database Schema Details](#14-database-schema-details)
15. [Testing Strategy](#15-testing-strategy)
16. [Security & Compliance](#16-security--compliance)
17. [Monitoring & Observability](#17-monitoring--observability)
18. [Risk Register](#18-risk-register)
19. [Success Metrics & KPIs](#19-success-metrics--kpis)
20. [Glossary](#20-glossary)

---

## 1. Executive Summary

### 1.1 Product Overview

**MergeMatch** is a white-label data matching and deduplication platform designed specifically for the GoHighLevel (GHL) ecosystem. It enables agencies to provide their SMB clients with enterprise-grade duplicate detection, intelligent matching, and data quality management - capabilities previously only available in Salesforce through tools like LeanData.

### 1.2 Business Case

| Metric | Value |
|--------|-------|
| **Target Market** | 60,000+ GHL agencies with B2B clients |
| **Competitor Revenue** | LeanData: ~$36.4M ARR (Salesforce only) |
| **Market Gap** | Zero RevOps/matching tools for GHL (existing competitor "Prime Contact" has 7.6k installs but is non-functional) |
| **Pricing Model** | Freemium with 4 tiers (Free / $39 / $59 / $89 per location/month) |
| **Billing** | GHL Marketplace internal billing (0% commission, agency resale enabled) |
| **Year 1 Target** | 500 paid locations @ $59 avg = $354K ARR |

### 1.3 Pricing Tiers

MergeMatch uses a **freemium model** via GHL Marketplace internal billing. Users install free, experience value (see duplicates), then upgrade to unlock merge capabilities.

#### Tier Overview

| Tier | Price | Target User | Value Prop |
|------|-------|-------------|------------|
| **Free** | $0/mo | Evaluators | See duplicates, try 3 merges free |
| **Starter** | $39/mo | SMB owners | Unlimited merges with manual review |
| **Pro** | $59/mo | Busy teams | Automate everything |
| **Agency** | $89/mo | White-label resellers | Brand as your own |

#### Detailed Feature Matrix

| Feature | Free | Starter $39 | Pro $59 | Agency $89 |
|---------|:----:|:-----------:|:-------:|:----------:|
| **Rule Configuration** | | | | |
| Basic fields (name, email, phone) | ✅ | ✅ | ✅ | ✅ |
| All fields + custom fields | 🔒 | ✅ | ✅ | ✅ |
| Configurable match thresholds | 🔒 | ✅ | ✅ | ✅ |
| Master record selection rules | 🔒 | ✅ | ✅ | ✅ |
| Per-field merge rules | 🔒 | ✅ | ✅ | ✅ |
| **Matching Algorithms** | | | | |
| Exact match | ✅ | ✅ | ✅ | ✅ |
| Fuzzy match (Jaro-Winkler) | 🔒 | ✅ | ✅ | ✅ |
| Phone normalization | 🔒 | ✅ | ✅ | ✅ |
| Email domain matching | 🔒 | ✅ | ✅ | ✅ |
| Phonetic matching (Soundex/Metaphone) | 🔒 | 🔒 | ✅ | ✅ |
| **Scanning** | | | | |
| Manual scan trigger | ✅ 1/day | ✅ Unlimited | ✅ Unlimited | ✅ Unlimited |
| View matched duplicates | ✅ 10 preview | ✅ All | ✅ All | ✅ All |
| Scheduled scans | 🔒 | 🔒 | ✅ Hourly | ✅ Hourly |
| Real-time webhook detection | 🔒 | 🔒 | ✅ | ✅ |
| **Merging** | | | | |
| Execute merge | ✅ 3 total | ✅ Unlimited | ✅ Unlimited | ✅ Unlimited |
| Auto-merge high-confidence (≥95%) | 🔒 | 🔒 | ✅ | ✅ |
| **Object Types** | | | | |
| Contacts | ✅ | ✅ | ✅ | ✅ |
| Companies | 🔒 | ✅ | ✅ | ✅ |
| Opportunities | 🔒 | 🔒 | ✅ | ✅ |
| Custom Objects | 🔒 | 🔒 | ✅ | ✅ |
| Cross-object matching | 🔒 | 🔒 | 🔒 | 🔒 (Post-MVP) |
| **Safety & Compliance** | | | | |
| Rollback/undo merges | 🔒 | ✅ 7 days | ✅ 30 days | ✅ 30 days |
| Audit log | 🔒 | ✅ | ✅ | ✅ |
| Pre-merge snapshots | 🔒 | ✅ | ✅ | ✅ |
| **Branding & Support** | | | | |
| MergeMatch branding | ✅ | ✅ | ✅ | Removable |
| White-label (your logo/colors) | 🔒 | 🔒 | 🔒 | ✅ |
| Custom domain | 🔒 | 🔒 | 🔒 | ✅ |
| Priority support | 🔒 | 🔒 | 🔒 | ✅ |
| **Usage Limits** | | | | |
| Max contacts per location | 5,000 | 25,000 | 100,000 | 250,000 |
| Max scan frequency | 1/day | Daily | Hourly | Hourly |
| Scan timeout | 30 sec | 2 min | 5 min | 10 min |

> **Note**: For locations exceeding 250,000 contacts, contact sales for Enterprise pricing. Limits are per-location, not per-agency.

#### Freemium Conversion Strategy

**Free tier hook**: Users can configure basic matching rules, run 1 scan per day, and see a preview of 10 matched duplicates. They experience the "aha moment" of seeing their duplicate problem but cannot fix it without upgrading.

**Paywall trigger**: Merge execution. The value is proven before payment is required.

```
┌─────────────────────────────────────────────────────────┐
│  MergeMatch - Duplicate Scanner                          │
├─────────────────────────────────────────────────────────┤
│  ✅ Scan Complete - 47 duplicates found                 │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ John Smith          │ John Smth           │ 94% │   │
│  │ john@acme.com       │ jsmith@acme.com     │     │   │
│  ├─────────────────────────────────────────────────┤   │
│  │ Jane Doe            │ Jane D.             │ 87% │   │
│  │ (555) 123-4567      │ 555-123-4567        │     │   │
│  ├─────────────────────────────────────────────────┤   │
│  │ ... and 45 more                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  🔒 Merge these duplicates                      │   │
│  │                                                 │   │
│  │  Upgrade to Starter ($39/mo) to:               │   │
│  │  • Merge duplicates with one click             │   │
│  │  • Schedule automatic daily scans              │   │
│  │  • Rollback mistakes for 7 days                │   │
│  │                                                 │   │
│  │  [ Upgrade Now ]                               │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 1.4 Scope Summary

**MVP Includes:**
- Duplicate detection across Contacts, Companies, Opportunities, Custom Objects
- Configurable matching rules (user-defined thresholds, master selection, per-field merge rules)
- Merge execution with full audit trail
- Historical snapshots with 30-day rollback
- Scheduled deduplication jobs
- Real-time webhook detection (Pro tier)
- Embedded GHL app with review queue
- White-label support for agencies (Agency tier)
- Freemium model with 4 pricing tiers

**MVP Excludes:**
- Lead-to-company matching (cross-object) - adds UI complexity, deferred to post-MVP
- Visual routing/flow builder (Phase 2 product)
- Territory-based lead assignment
- Buying group detection
- ML-based matching improvements
- Self-hosted deployment option

### 1.5 Timeline Overview

| Phase | Duration | Key Deliverable |
|-------|----------|-----------------|
| Phase 1: Foundation | 3 weeks | GHL OAuth, API client, project scaffolding |
| Phase 2: Matching Engine | 3 weeks | Configurable matching rules, scoring pipeline |
| Phase 3: Merge & Restore | 2 weeks | Merge execution, snapshots, rollback |
| Phase 4: Job Scheduling | 2 weeks | Celery workers, scheduled scans |
| Phase 5: Multi-Object | 2 weeks | Companies, Opportunities, Custom Objects |
| Phase 6: Frontend MVP | 4 weeks | Full embedded GHL app |
| Phase 7: Launch | 2 weeks | White-label, marketplace submission |
| **Total** | **18 weeks** | Production-ready MVP |

---

## 2. Product Vision & Goals

### 2.1 Vision Statement

> Enable every GHL agency to deliver enterprise-grade data quality to their SMB clients, eliminating duplicate records and ensuring clean, actionable CRM data.

### 2.2 Strategic Goals

| Goal | Description | Success Metric |
|------|-------------|----------------|
| **G1** | Eliminate duplicate data pain | <5% duplicate rate post-implementation |
| **G2** | Automate manual dedup work | 40%+ matches auto-merged without review |
| **G3** | Provide enterprise features at SMB prices | $79/mo vs $500+/mo for LeanData |
| **G4** | Enable agency differentiation | 100+ agencies white-labeling |
| **G5** | Maintain data integrity | 99%+ merge accuracy, <1% rollback rate |

### 2.3 Non-Goals (Explicitly Out of Scope)

- Real-time lead routing/assignment
- Pipeline/deal routing logic
- Marketing attribution
- Intent data integration
- AI-powered lead scoring
- Data enrichment services

---

## 3. User Personas & Journey Maps

### 3.1 Primary Personas

#### Persona 1: Agency Operations Manager (Buyer)

| Attribute | Detail |
|-----------|--------|
| **Name** | Sarah, 35 |
| **Role** | Operations Manager at digital marketing agency |
| **Agency Size** | 50-200 sub-accounts (SMB clients) |
| **Pain Points** | Clients complain about duplicate leads, manual cleanup takes hours, no native GHL solution |
| **Goals** | Automate data cleanup, reduce support tickets, add value to client offering |
| **Technical Level** | Medium - can configure tools but not code |
| **Budget Authority** | $500-2000/mo for tools |

**User Story:**
> As an agency operations manager, I want to automatically detect and merge duplicate contacts across my clients' GHL accounts so that my team spends less time on manual data cleanup and clients have cleaner CRM data.

#### Persona 2: SMB Business Owner (End User)

| Attribute | Detail |
|-----------|--------|
| **Name** | Mike, 42 |
| **Role** | Owner of local HVAC company |
| **Team Size** | 5-10 employees using GHL |
| **Pain Points** | Same leads appearing multiple times, sales reps calling same person twice, messy reports |
| **Goals** | Clean contact list, accurate reporting, efficient sales process |
| **Technical Level** | Low - needs simple interface |
| **Decision Process** | Trusts agency recommendations |

**User Story:**
> As an SMB business owner, I want to see a single, complete record for each customer so that my team doesn't waste time on duplicate outreach and our reports are accurate.

#### Persona 3: Agency Developer/Admin

| Attribute | Detail |
|-----------|--------|
| **Name** | Jake, 28 |
| **Role** | Technical admin managing GHL for agency |
| **Responsibilities** | Set up automations, configure integrations, troubleshoot issues |
| **Pain Points** | Complex matching rules, API rate limits, debugging failed merges |
| **Goals** | Configure once, run reliably, easy troubleshooting |
| **Technical Level** | High - comfortable with APIs and webhooks |

**User Story:**
> As an agency technical admin, I want to configure matching rules with precise control over thresholds and field weights so that I can tune the system for each client's specific data quality needs.

### 3.2 User Journey Maps

#### Journey 1: First-Time Setup

```
┌────────────────────────────────────────────────────────────────────────┐
│                    FIRST-TIME SETUP JOURNEY                            │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  STAGE        │ DISCOVER    │ INSTALL     │ CONFIGURE  │ VALIDATE    │
│  ─────────────┼─────────────┼─────────────┼────────────┼─────────────│
│  Actions      │ Find in GHL │ OAuth flow  │ Set up     │ Run test    │
│               │ marketplace │ Connect     │ first rule │ scan        │
│               │             │ location    │            │             │
│  ─────────────┼─────────────┼─────────────┼────────────┼─────────────│
│  Touchpoints  │ Marketplace │ MergeMatch   │ Rule       │ Dashboard   │
│               │ listing     │ OAuth       │ editor     │ results     │
│  ─────────────┼─────────────┼─────────────┼────────────┼─────────────│
│  Emotions     │ Hopeful     │ Cautious    │ Focused    │ Excited/    │
│               │             │             │            │ Relieved    │
│  ─────────────┼─────────────┼─────────────┼────────────┼─────────────│
│  Pain Points  │ Which app   │ OAuth       │ What       │ False       │
│               │ to choose?  │ permissions │ thresholds?│ positives?  │
│  ─────────────┼─────────────┼─────────────┼────────────┼─────────────│
│  Solutions    │ Clear value │ Explain     │ Smart      │ Preview     │
│               │ proposition │ why needed  │ defaults   │ before run  │
│                                                                        │
│  TIME: ~15 minutes total                                               │
└────────────────────────────────────────────────────────────────────────┘
```

#### Journey 2: Daily Operations

```
┌────────────────────────────────────────────────────────────────────────┐
│                    DAILY OPERATIONS JOURNEY                            │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  7:00 AM  │ Scheduled job runs automatically                           │
│           │ → Scans 5,000 contacts                                     │
│           │ → Detects 23 potential duplicates                          │
│           │ → Auto-merges 15 (≥95% confidence)                         │
│           │ → Queues 8 for human review                                │
│  ─────────┼────────────────────────────────────────────────────────────│
│  9:00 AM  │ User opens dashboard                                       │
│           │ → Sees 8 pending reviews                                   │
│           │ → Reviews confidence scores                                │
│           │ → Approves 6, rejects 2 (not duplicates)                   │
│  ─────────┼────────────────────────────────────────────────────────────│
│  9:15 AM  │ Merge execution                                            │
│           │ → 6 merges execute                                         │
│           │ → Snapshots stored for rollback                            │
│           │ → Audit log updated                                        │
│  ─────────┼────────────────────────────────────────────────────────────│
│  2:00 PM  │ User realizes merge error                                  │
│           │ → Opens merge history                                      │
│           │ → Clicks "Undo" on wrong merge                             │
│           │ → Records restored                                         │
│  ─────────┼────────────────────────────────────────────────────────────│
│  6:00 PM  │ User reviews daily summary                                 │
│           │ → 21 total merges today                                    │
│           │ → 99% accuracy (1 rollback)                                │
│           │ → Database cleaner by 0.4%                                 │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Feature Specifications

### 4.1 Feature Hierarchy

```
MergeMatch MVP
├── F1: Authentication & Multi-Tenancy
│   ├── F1.1: GHL OAuth Integration
│   ├── F1.2: Tenant Management
│   └── F1.3: Location Management
│
├── F2: Matching Engine
│   ├── F2.1: Match Rule Configuration
│   ├── F2.2: Field Comparators
│   ├── F2.3: Blocking Strategies
│   ├── F2.4: Composite Scoring
│   └── F2.5: Confidence Classification
│
├── F3: Duplicate Detection
│   ├── F3.1: Real-time Detection (Webhooks)
│   ├── F3.2: Batch Detection (Jobs)
│   └── F3.3: Manual Scan Trigger
│
├── F4: Merge Operations
│   ├── F4.1: Master Record Selection
│   ├── F4.2: Field-Level Merge
│   ├── F4.3: Association Transfer
│   ├── F4.4: Merge Execution
│   └── F4.5: Merge Validation
│
├── F5: History & Restore
│   ├── F5.1: Pre-Merge Snapshots
│   ├── F5.2: Merge History
│   ├── F5.3: Rollback Execution
│   └── F5.4: Audit Logging
│
├── F6: Job Scheduling
│   ├── F6.1: Schedule Configuration
│   ├── F6.2: Job Execution
│   ├── F6.3: Job Monitoring
│   └── F6.4: Job History
│
├── F7: Multi-Object Support
│   ├── F7.1: Contact Matching
│   ├── F7.2: Company Matching
│   ├── F7.3: Opportunity Matching
│   ├── F7.4: Custom Object Matching
│   └── F7.5: Cross-Object Matching
│
├── F8: User Interface
│   ├── F8.1: Dashboard
│   ├── F8.2: Duplicate Review Queue
│   ├── F8.3: Merge Preview
│   ├── F8.4: Rule Configuration
│   ├── F8.5: Job Management
│   ├── F8.6: Merge History
│   └── F8.7: Settings
│
└── F9: White-Label & Distribution
    ├── F9.1: Agency Branding
    ├── F9.2: GHL Marketplace Integration
    └── F9.3: Billing Integration
```

### 4.2 Feature Prioritization (MoSCoW)

| Feature | Must Have | Should Have | Could Have | Won't Have (MVP) |
|---------|-----------|-------------|------------|------------------|
| F1: Auth & Multi-Tenancy | ✓ | | | |
| F2: Matching Engine | ✓ | | | |
| F3: Duplicate Detection | ✓ | | | |
| F4: Merge Operations | ✓ | | | |
| F5: History & Restore | ✓ | | | |
| F6: Job Scheduling | ✓ | | | |
| F7.1-7.2: Contact/Company | ✓ | | | |
| F7.3: Opportunity | | ✓ | | |
| F7.4: Custom Objects | | ✓ | | |
| F7.5: Cross-Object | | | ✓ | |
| F8.1-8.3: Core UI | ✓ | | | |
| F8.4-8.7: Config UI | | ✓ | | |
| F9.1: White-Label | ✓ | | | |
| F9.2: Marketplace | ✓ | | | |
| Visual Flow Builder | | | | ✓ |
| Lead Routing | | | | ✓ |
| ML Matching | | | | ✓ |

---

## 5. Phase 1: Foundation

### 5.1 Phase Overview

| Attribute | Value |
|-----------|-------|
| **Duration** | 3 weeks |
| **Team** | 1-2 Backend Engineers |
| **Dependencies** | GHL Developer Account, Supabase Account, Render Account |
| **Exit Criteria** | OAuth working, can CRUD contacts via API |

### 5.2 Stage 1.1: Project Infrastructure (Week 1)

#### 5.2.1 Deliverables

| Deliverable | Description | Acceptance Criteria |
|-------------|-------------|---------------------|
| D1.1.1 | Repository setup | Git repo with branch protection, CI/CD pipeline |
| D1.1.2 | Docker configuration | docker-compose.yml with all services running locally |
| D1.1.3 | FastAPI scaffolding | Health endpoint responding at /health |
| D1.1.4 | Supabase setup | Database connected, can query from app |
| D1.1.5 | Redis setup | Redis running, can set/get keys |
| D1.1.6 | Environment config | .env.example documented, secrets management |

#### 5.2.2 Technical Specifications

**Docker Compose Services:**

> **Note**: Database is Supabase (cloud) from day 1 - no local PostgreSQL container.

```yaml
services:
  api:
    build: ./backend
    ports: ["8000:8000"]
    environment:
      - DATABASE_URL=${DATABASE_URL}  # Supabase connection string
      - REDIS_URL=redis://redis:6379
    depends_on: [redis]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  celery_worker:
    build: ./backend
    command: celery -A app.tasks worker
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=redis://redis:6379
    depends_on: [redis]

  celery_beat:
    build: ./backend
    command: celery -A app.tasks beat
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=redis://redis:6379
    depends_on: [redis]
```

**FastAPI Project Structure:**
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py           # FastAPI app factory
│   ├── config.py         # Pydantic settings
│   └── dependencies.py   # Dependency injection
├── requirements.txt
├── Dockerfile
└── pyproject.toml
```

#### 5.2.3 Tasks Breakdown

| Task ID | Task | Estimate | Dependencies |
|---------|------|----------|--------------|
| T1.1.1 | Create GitHub repo with branch rules | 2h | None |
| T1.1.2 | Set up GitHub Actions CI pipeline | 4h | T1.1.1 |
| T1.1.3 | Create Dockerfile for backend | 2h | None |
| T1.1.4 | Create docker-compose.yml | 3h | T1.1.3 |
| T1.1.5 | Scaffold FastAPI project | 4h | None |
| T1.1.6 | Add health check endpoint | 1h | T1.1.5 |
| T1.1.7 | Configure PostgreSQL connection | 3h | T1.1.4, T1.1.5 |
| T1.1.8 | Configure Redis connection | 2h | T1.1.4, T1.1.5 |
| T1.1.9 | Set up Alembic migrations | 3h | T1.1.7 |
| T1.1.10 | Create environment config | 2h | T1.1.5 |
| T1.1.11 | Write README with setup instructions | 2h | All above |
| **Total** | | **28h** | |

### 5.3 Stage 1.2: Database Schema (Week 1-2)

#### 5.3.1 Deliverables

| Deliverable | Description | Acceptance Criteria |
|-------------|-------------|---------------------|
| D1.2.1 | Core tables migration | All tables created with indexes |
| D1.2.2 | Row-level security | Policies active, tested |
| D1.2.3 | SQLAlchemy models | All models mapped to tables |
| D1.2.4 | Pydantic schemas | Request/response schemas defined |

#### 5.3.2 Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐
│     tenants     │───1:N─│    locations    │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ ghl_company_id  │       │ tenant_id (FK)  │
│ name            │       │ ghl_location_id │
│ branding        │       │ name            │
│ plan            │       │ settings        │
│ oauth_tokens    │       │ oauth_tokens    │
└─────────────────┘       └────────┬────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
                    ▼              ▼              ▼
          ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
          │   match_rules   │ │   match_pairs   │ │   dedup_jobs    │
          ├─────────────────┤ ├─────────────────┤ ├─────────────────┤
          │ id (PK)         │ │ id (PK)         │ │ id (PK)         │
          │ tenant_id (FK)  │ │ tenant_id (FK)  │ │ tenant_id (FK)  │
          │ location_id(FK) │ │ location_id(FK) │ │ location_id(FK) │
          │ name            │ │ match_rule_id   │ │ name            │
          │ source_object   │ │ record_a_id     │ │ job_type        │
          │ target_object   │ │ record_b_id     │ │ schedule_cron   │
          │ match_fields    │ │ confidence      │ │ next_run_at     │
          │ thresholds      │ │ status          │ │ status          │
          └─────────────────┘ │ merge_id (FK)   │ └────────┬────────┘
                              └────────┬────────┘          │
                                       │                   │
                                       ▼                   ▼
                              ┌─────────────────┐ ┌─────────────────┐
                              │     merges      │ │ dedup_job_runs  │
                              ├─────────────────┤ ├─────────────────┤
                              │ id (PK)         │ │ id (PK)         │
                              │ tenant_id (FK)  │ │ job_id (FK)     │
                              │ location_id(FK) │ │ tenant_id (FK)  │
                              │ match_pair_id   │ │ started_at      │
                              │ master_record   │ │ completed_at    │
                              │ merged_records  │ │ records_scanned │
                              │ field_selections│ │ matches_found   │
                              │ status          │ │ status          │
                              │ rollback_expires│ └─────────────────┘
                              └────────┬────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │ merge_snapshots │
                              ├─────────────────┤
                              │ id (PK)         │
                              │ merge_id (FK)   │
                              │ record_id       │
                              │ snapshot_data   │
                              │ is_master       │
                              └─────────────────┘
```

#### 5.3.3 Tasks Breakdown

| Task ID | Task | Estimate | Dependencies |
|---------|------|----------|--------------|
| T1.2.1 | Create tenants table migration | 2h | T1.1.9 |
| T1.2.2 | Create locations table migration | 2h | T1.2.1 |
| T1.2.3 | Create match_rules table migration | 3h | T1.2.2 |
| T1.2.4 | Create match_pairs table migration | 3h | T1.2.3 |
| T1.2.5 | Create merges table migration | 3h | T1.2.4 |
| T1.2.6 | Create merge_snapshots table migration | 2h | T1.2.5 |
| T1.2.7 | Create dedup_jobs table migration | 2h | T1.2.2 |
| T1.2.8 | Create dedup_job_runs table migration | 2h | T1.2.7 |
| T1.2.9 | Create audit_events partitioned table | 4h | T1.2.2 |
| T1.2.10 | Enable RLS and create policies | 4h | All tables |
| T1.2.11 | Create SQLAlchemy models | 6h | All tables |
| T1.2.12 | Create Pydantic schemas | 4h | T1.2.11 |
| T1.2.13 | Write model unit tests | 4h | T1.2.11 |
| **Total** | | **41h** | |

### 5.4 Stage 1.3: GHL OAuth Integration (Week 2-3)

#### 5.4.1 Deliverables

| Deliverable | Description | Acceptance Criteria |
|-------------|-------------|---------------------|
| D1.3.1 | OAuth flow implementation | Can complete OAuth dance, store tokens |
| D1.3.2 | Token refresh mechanism | Tokens refresh before expiry |
| D1.3.3 | Tenant/location provisioning | New install creates records |
| D1.3.4 | Token encryption | Tokens encrypted at rest |

#### 5.4.2 OAuth Flow Specification

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         GHL OAUTH FLOW                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1. INSTALL INITIATION                                                  │
│     ┌──────────────┐                      ┌──────────────┐              │
│     │  GHL User    │ ───── Clicks ─────▶  │  Marketplace │              │
│     │              │       Install        │  Listing     │              │
│     └──────────────┘                      └──────┬───────┘              │
│                                                  │                      │
│  2. AUTHORIZATION REQUEST                        ▼                      │
│     ┌──────────────┐                      ┌──────────────┐              │
│     │  MergeMatch   │ ◀── Redirect ───────│  GHL OAuth   │              │
│     │  /auth/init  │     with code        │  Server      │              │
│     └──────┬───────┘                      └──────────────┘              │
│            │                                                            │
│  3. TOKEN EXCHANGE                                                      │
│            │ POST /oauth/token                                          │
│            │ { code, client_id, client_secret }                         │
│            ▼                                                            │
│     ┌──────────────┐                      ┌──────────────┐              │
│     │  MergeMatch   │ ◀── Response ───────│  GHL OAuth   │              │
│     │  Backend     │     { access_token,  │  Server      │              │
│     │              │       refresh_token, │              │              │
│     │              │       locationId }   │              │              │
│     └──────┬───────┘                      └──────────────┘              │
│            │                                                            │
│  4. PROVISIONING                                                        │
│            │                                                            │
│            ├─▶ Create/update tenant (by companyId)                      │
│            ├─▶ Create/update location (by locationId)                   │
│            ├─▶ Encrypt and store tokens                                 │
│            └─▶ Redirect to MergeMatch dashboard                          │
│                                                                         │
│  5. TOKEN REFRESH (Background)                                          │
│     ┌──────────────┐                      ┌──────────────┐              │
│     │  Celery Beat │ ─── Every 30min ───▶│  Check       │              │
│     │              │                      │  Expiring    │              │
│     └──────────────┘                      │  Tokens      │              │
│                                           └──────┬───────┘              │
│                                                  │                      │
│                                           POST /oauth/token             │
│                                           { grant_type: refresh_token } │
│                                                  │                      │
│                                           ┌──────▼───────┐              │
│                                           │  Update DB   │              │
│                                           │  with new    │              │
│                                           │  tokens      │              │
│                                           └──────────────┘              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

#### 5.4.3 OAuth Scopes Required

| Scope | Purpose |
|-------|---------|
| `contacts.readonly` | Read contact records for matching |
| `contacts.write` | Update/delete contacts for merging |
| `businesses.readonly` | Read company records |
| `businesses.write` | Update/delete companies |
| `opportunities.readonly` | Read opportunity records |
| `opportunities.write` | Update/delete opportunities |
| `custom-objects.readonly` | Read custom object records |
| `custom-objects.write` | Update/delete custom objects |
| `oauth.readonly` | Generate location tokens |
| `oauth.write` | Token management |

#### 5.4.4 Tasks Breakdown

| Task ID | Task | Estimate | Dependencies |
|---------|------|----------|--------------|
| T1.3.1 | Register MergeMatch in GHL Developer Portal | 2h | None |
| T1.3.2 | Implement /auth/init endpoint | 3h | T1.1.5 |
| T1.3.3 | Implement /auth/callback endpoint | 4h | T1.3.2 |
| T1.3.4 | Implement token exchange logic | 3h | T1.3.3 |
| T1.3.5 | Implement tenant provisioning | 3h | T1.2.11, T1.3.4 |
| T1.3.6 | Implement location provisioning | 3h | T1.3.5 |
| T1.3.7 | Add token encryption (Fernet) | 3h | T1.3.4 |
| T1.3.8 | Create token refresh Celery task | 4h | T1.3.4 |
| T1.3.9 | Add token refresh scheduling | 2h | T1.3.8 |
| T1.3.10 | Handle OAuth errors gracefully | 2h | T1.3.3 |
| T1.3.11 | Write OAuth integration tests | 4h | All above |
| **Total** | | **33h** | |

### 5.5 Stage 1.4: GHL API Client (Week 3)

#### 5.5.1 Deliverables

| Deliverable | Description | Acceptance Criteria |
|-------------|-------------|---------------------|
| D1.4.1 | Base API client | Rate limiting, retries, error handling |
| D1.4.2 | Contacts API wrapper | CRUD operations working |
| D1.4.3 | Companies API wrapper | CRUD operations working |
| D1.4.4 | Webhook receiver | Can receive contact events |

#### 5.5.2 API Client Architecture

```python
# Pseudo-code structure

class GHLClient:
    """Base client with rate limiting and retries."""

    def __init__(self, location_id: str, access_token: str):
        self.base_url = "https://services.leadconnectorhq.com"
        self.rate_limiter = RateLimiter(
            max_requests=100,
            time_window=10  # seconds
        )
        self.retry_strategy = ExponentialBackoff(
            max_retries=3,
            base_delay=1.0
        )

    async def request(self, method: str, endpoint: str, **kwargs):
        await self.rate_limiter.acquire()
        try:
            response = await self._make_request(method, endpoint, **kwargs)
            self._track_rate_limit_headers(response)
            return response.json()
        except RateLimitExceeded:
            await self._handle_rate_limit()
            return await self.request(method, endpoint, **kwargs)


class ContactsClient(GHLClient):
    """Contacts-specific API operations."""

    async def get_contact(self, contact_id: str) -> Contact: ...
    async def search_contacts(self, filters: dict) -> List[Contact]: ...
    async def update_contact(self, contact_id: str, data: dict) -> Contact: ...
    async def delete_contact(self, contact_id: str) -> bool: ...
    async def list_contacts(self, limit: int = 100, offset: int = 0) -> List[Contact]: ...


class CompaniesClient(GHLClient):
    """Companies-specific API operations."""

    async def get_company(self, company_id: str) -> Company: ...
    async def search_companies(self, filters: dict) -> List[Company]: ...
    async def update_company(self, company_id: str, data: dict) -> Company: ...
    async def delete_company(self, company_id: str) -> bool: ...
```

#### 5.5.3 Rate Limit Handling

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      RATE LIMIT HANDLING                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  GHL LIMITS:                                                            │
│  • Burst: 100 requests / 10 seconds / location                          │
│  • Daily: 200,000 requests / day / location                             │
│                                                                         │
│  STRATEGY:                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  1. Token Bucket Algorithm                                         │ │
│  │     • Bucket capacity: 100 tokens                                  │ │
│  │     • Refill rate: 10 tokens/second                                │ │
│  │     • Each request consumes 1 token                                │ │
│  │                                                                    │ │
│  │  2. Response Header Tracking                                       │ │
│  │     • X-RateLimit-Remaining → tokens left                          │ │
│  │     • X-RateLimit-Max → bucket capacity                            │ │
│  │     • Adjust bucket based on headers                               │ │
│  │                                                                    │ │
│  │  3. 429 Response Handling                                          │ │
│  │     • Extract Retry-After header                                   │ │
│  │     • Wait specified duration                                      │ │
│  │     • Exponential backoff if no header                             │ │
│  │                                                                    │ │
│  │  4. Daily Limit Tracking                                           │ │
│  │     • Track X-RateLimit-Daily-Remaining                            │ │
│  │     • Alert at 10% remaining                                       │ │
│  │     • Pause non-critical operations at 5%                          │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

#### 5.5.4 Tasks Breakdown

| Task ID | Task | Estimate | Dependencies |
|---------|------|----------|--------------|
| T1.4.1 | Create base GHLClient class | 4h | T1.3.4 |
| T1.4.2 | Implement token bucket rate limiter | 4h | T1.4.1 |
| T1.4.3 | Add exponential backoff retry logic | 3h | T1.4.1 |
| T1.4.4 | Implement response header tracking | 2h | T1.4.1 |
| T1.4.5 | Create ContactsClient | 4h | T1.4.1 |
| T1.4.6 | Create CompaniesClient | 3h | T1.4.1 |
| T1.4.7 | Set up webhook endpoint | 3h | T1.1.5 |
| T1.4.8 | Implement contact.created webhook handler | 3h | T1.4.7 |
| T1.4.9 | Implement contact.updated webhook handler | 2h | T1.4.7 |
| T1.4.10 | Add webhook signature verification | 2h | T1.4.7 |
| T1.4.11 | Write API client unit tests | 4h | All above |
| T1.4.12 | Write webhook integration tests | 3h | T1.4.8, T1.4.9 |
| **Total** | | **37h** | |

### 5.6 Phase 1 Summary

| Stage | Estimated Hours | Calendar Time |
|-------|-----------------|---------------|
| 1.1: Project Infrastructure | 28h | 1 week |
| 1.2: Database Schema | 41h | 1 week |
| 1.3: GHL OAuth | 33h | 1 week |
| 1.4: GHL API Client | 37h | 1 week |
| **Total** | **139h** | **3 weeks** |

**Phase 1 Exit Criteria:**
- [ ] Local development environment running with Docker
- [ ] All database tables created with RLS policies
- [ ] OAuth flow completes successfully
- [ ] Can read/write contacts via GHL API
- [ ] Webhook endpoint receiving events
- [ ] 80%+ unit test coverage

---

## 6. Phase 2: Core Matching Engine

### 6.1 Phase Overview

| Attribute | Value |
|-----------|-------|
| **Duration** | 3 weeks |
| **Team** | 1-2 Backend Engineers |
| **Dependencies** | Phase 1 complete |
| **Exit Criteria** | Can detect duplicates with configurable rules |

### 6.2 Stage 2.1: Match Rule Configuration (Week 4)

#### 6.2.1 Deliverables

| Deliverable | Description | Acceptance Criteria |
|-------------|-------------|---------------------|
| D2.1.1 | Match rule CRUD API | Can create, read, update, delete rules |
| D2.1.2 | Default rule templates | Pre-configured rules for common cases |
| D2.1.3 | Rule validation | Invalid rules rejected with clear errors |

#### 6.2.2 Match Rule Schema

```json
{
  "id": "uuid",
  "name": "Contact Deduplication",
  "description": "Standard contact duplicate detection",
  "source_object": "contact",
  "target_object": "contact",
  "is_active": true,
  "priority": 10,

  "match_fields": [
    {
      "source_field": "email",
      "target_field": "email",
      "match_type": "exact_normalized",
      "weight": 0.40,
      "required": true,
      "config": {
        "normalize": ["lowercase", "trim"]
      }
    },
    {
      "source_field": "firstName",
      "target_field": "firstName",
      "match_type": "fuzzy",
      "weight": 0.20,
      "required": false,
      "config": {
        "algorithm": "jaro_winkler",
        "threshold": 0.85
      }
    },
    {
      "source_field": "lastName",
      "target_field": "lastName",
      "match_type": "fuzzy",
      "weight": 0.20,
      "required": false,
      "config": {
        "algorithm": "jaro_winkler",
        "threshold": 0.85
      }
    },
    {
      "source_field": "phone",
      "target_field": "phone",
      "match_type": "phone_normalized",
      "weight": 0.20,
      "required": false,
      "config": {
        "country_code": "US"
      }
    }
  ],

  "thresholds": {
    "auto_merge": 0.95,
    "review": 0.70,
    "reject": 0.50
  },

  "master_selection": {
    "strategy": "most_complete",
    "tiebreaker": "oldest",
    "custom_rules": null
  }
}
```

#### 6.2.3 Default Rule Templates

| Template | Source → Target | Key Fields | Auto-Merge | Review |
|----------|-----------------|------------|------------|--------|
| Contact Dedup | Contact → Contact | email, name, phone | 95% | 70% |
| Company Dedup | Company → Company | name, domain, address | 90% | 75% |
| Lead-to-Company | Contact → Company | email_domain, company_name | 85% | 70% |
| Opportunity Dedup | Opportunity → Opportunity | name, contact, value | 90% | 80% |

#### 6.2.4 Tasks Breakdown

| Task ID | Task | Estimate | Dependencies |
|---------|------|----------|--------------|
| T2.1.1 | Define match rule JSON schema | 3h | None |
| T2.1.2 | Implement rule validation logic | 4h | T2.1.1 |
| T2.1.3 | Create rules CRUD endpoints | 4h | T2.1.2 |
| T2.1.4 | Create default rule templates | 3h | T2.1.1 |
| T2.1.5 | Add template cloning endpoint | 2h | T2.1.3, T2.1.4 |
| T2.1.6 | Write rule API tests | 3h | All above |
| **Total** | | **19h** | |

### 6.3 Stage 2.2: Field Comparators (Week 4-5)

#### 6.3.1 Deliverables

| Deliverable | Description | Acceptance Criteria |
|-------------|-------------|---------------------|
| D2.2.1 | Exact comparator | Returns 1.0 for match, 0.0 for mismatch |
| D2.2.2 | Fuzzy comparators | Jaro-Winkler, Levenshtein working |
| D2.2.3 | Domain comparator | Extracts and compares email domains |
| D2.2.4 | Phonetic comparator | Soundex/Metaphone matching |
| D2.2.5 | Phone comparator | Normalized phone comparison |
| D2.2.6 | Comparator registry | Dynamic comparator loading |

#### 6.3.2 Comparator Specifications

```python
# Comparator interface

from abc import ABC, abstractmethod
from typing import Any, Dict

class BaseComparator(ABC):
    """Base class for all field comparators."""

    name: str  # e.g., "exact", "fuzzy", "domain"

    @abstractmethod
    def compare(
        self,
        value_a: Any,
        value_b: Any,
        config: Dict = None
    ) -> float:
        """
        Compare two values and return similarity score.

        Returns:
            float: Score between 0.0 (no match) and 1.0 (exact match)
        """
        pass

    def preprocess(self, value: Any, config: Dict = None) -> Any:
        """Optional preprocessing before comparison."""
        return value


class ExactComparator(BaseComparator):
    name = "exact"

    def compare(self, value_a, value_b, config=None) -> float:
        return 1.0 if value_a == value_b else 0.0


class ExactNormalizedComparator(BaseComparator):
    name = "exact_normalized"

    def preprocess(self, value, config=None) -> str:
        if value is None:
            return ""
        result = str(value).strip()
        if config and "lowercase" in config.get("normalize", []):
            result = result.lower()
        return result

    def compare(self, value_a, value_b, config=None) -> float:
        a = self.preprocess(value_a, config)
        b = self.preprocess(value_b, config)
        return 1.0 if a == b else 0.0


class FuzzyComparator(BaseComparator):
    name = "fuzzy"

    def compare(self, value_a, value_b, config=None) -> float:
        import jellyfish

        if not value_a or not value_b:
            return 0.0

        a, b = str(value_a), str(value_b)
        algorithm = (config or {}).get("algorithm", "jaro_winkler")

        if algorithm == "jaro_winkler":
            return jellyfish.jaro_winkler_similarity(a, b)
        elif algorithm == "levenshtein":
            max_len = max(len(a), len(b))
            if max_len == 0:
                return 1.0
            distance = jellyfish.levenshtein_distance(a, b)
            return 1.0 - (distance / max_len)
        else:
            raise ValueError(f"Unknown algorithm: {algorithm}")


class DomainComparator(BaseComparator):
    name = "domain"

    def extract_domain(self, email: str) -> str:
        if not email or "@" not in email:
            return ""
        return email.split("@")[-1].lower().strip()

    def compare(self, value_a, value_b, config=None) -> float:
        domain_a = self.extract_domain(value_a)
        domain_b = self.extract_domain(value_b)

        if not domain_a or not domain_b:
            return 0.0

        return 1.0 if domain_a == domain_b else 0.0


class PhoneComparator(BaseComparator):
    name = "phone_normalized"

    def normalize(self, phone: str) -> str:
        import re
        if not phone:
            return ""
        # Remove all non-digits
        return re.sub(r'\D', '', str(phone))

    def compare(self, value_a, value_b, config=None) -> float:
        a = self.normalize(value_a)
        b = self.normalize(value_b)

        if not a or not b:
            return 0.0

        # Handle with/without country code
        if len(a) != len(b):
            # Try matching last 10 digits (US)
            a = a[-10:] if len(a) >= 10 else a
            b = b[-10:] if len(b) >= 10 else b

        return 1.0 if a == b else 0.0


class PhoneticComparator(BaseComparator):
    name = "phonetic"

    def compare(self, value_a, value_b, config=None) -> float:
        import jellyfish

        if not value_a or not value_b:
            return 0.0

        algorithm = (config or {}).get("algorithm", "soundex")

        if algorithm == "soundex":
            code_a = jellyfish.soundex(str(value_a))
            code_b = jellyfish.soundex(str(value_b))
        elif algorithm == "metaphone":
            code_a = jellyfish.metaphone(str(value_a))
            code_b = jellyfish.metaphone(str(value_b))
        else:
            raise ValueError(f"Unknown algorithm: {algorithm}")

        return 1.0 if code_a == code_b else 0.0
```

#### 6.3.3 Comparator Test Cases

| Comparator | Input A | Input B | Expected Score |
|------------|---------|---------|----------------|
| exact | "john@acme.com" | "john@acme.com" | 1.0 |
| exact | "john@acme.com" | "JOHN@ACME.COM" | 0.0 |
| exact_normalized | "john@acme.com" | "JOHN@ACME.COM" | 1.0 |
| exact_normalized | "  john@acme.com  " | "john@acme.com" | 1.0 |
| fuzzy (jaro_winkler) | "John Smith" | "Jon Smith" | ~0.93 |
| fuzzy (jaro_winkler) | "John Smith" | "Jane Doe" | ~0.45 |
| fuzzy (levenshtein) | "Acme Inc" | "Acme Inc." | ~0.89 |
| domain | "john@acme.com" | "jane@acme.com" | 1.0 |
| domain | "john@acme.com" | "john@example.com" | 0.0 |
| phone_normalized | "(555) 123-4567" | "5551234567" | 1.0 |
| phone_normalized | "+1-555-123-4567" | "555-123-4567" | 1.0 |
| phonetic (soundex) | "Smith" | "Smyth" | 1.0 |
| phonetic (soundex) | "John" | "Jon" | 1.0 |

#### 6.3.4 Tasks Breakdown

| Task ID | Task | Estimate | Dependencies |
|---------|------|----------|--------------|
| T2.2.1 | Create BaseComparator abstract class | 2h | None |
| T2.2.2 | Implement ExactComparator | 1h | T2.2.1 |
| T2.2.3 | Implement ExactNormalizedComparator | 2h | T2.2.1 |
| T2.2.4 | Implement FuzzyComparator (Jaro-Winkler) | 3h | T2.2.1 |
| T2.2.5 | Implement FuzzyComparator (Levenshtein) | 2h | T2.2.4 |
| T2.2.6 | Implement DomainComparator | 2h | T2.2.1 |
| T2.2.7 | Implement PhoneComparator | 3h | T2.2.1 |
| T2.2.8 | Implement PhoneticComparator | 3h | T2.2.1 |
| T2.2.9 | Create comparator registry | 2h | All comparators |
| T2.2.10 | Write comprehensive comparator tests | 6h | All above |
| **Total** | | **26h** | |

### 6.4 Stage 2.3: Blocking Strategies (Week 5)

#### 6.4.1 Purpose

Blocking reduces the number of record pairs to compare. Without blocking, comparing N records requires N*(N-1)/2 comparisons. For 10,000 contacts, that's 49,995,000 comparisons!

Blocking groups records by a key (e.g., first 3 letters of name), so only records in the same block are compared.

#### 6.4.2 Deliverables

| Deliverable | Description | Acceptance Criteria |
|-------------|-------------|---------------------|
| D2.3.1 | Standard blocking | Block by exact field value |
| D2.3.2 | Sorted neighborhood | Block by sorted key prefix |
| D2.3.3 | Phonetic blocking | Block by Soundex code |
| D2.3.4 | Composite blocking | Multiple blocking keys |

#### 6.4.3 Blocking Specifications

```python
# Blocking implementation

from abc import ABC, abstractmethod
from typing import List, Dict, Tuple, Any
import pandas as pd

class BlockingStrategy(ABC):
    """Base class for blocking strategies."""

    @abstractmethod
    def generate_key(self, record: Dict) -> str:
        """Generate blocking key for a record."""
        pass

    def create_blocks(self, records: List[Dict]) -> Dict[str, List[Dict]]:
        """Group records into blocks by key."""
        blocks = {}
        for record in records:
            key = self.generate_key(record)
            if key:
                if key not in blocks:
                    blocks[key] = []
                blocks[key].append(record)
        return blocks


class ExactBlocker(BlockingStrategy):
    """Block by exact field value."""

    def __init__(self, field: str):
        self.field = field

    def generate_key(self, record: Dict) -> str:
        value = record.get(self.field)
        return str(value).lower().strip() if value else None


class PrefixBlocker(BlockingStrategy):
    """Block by first N characters of a field."""

    def __init__(self, field: str, length: int = 3):
        self.field = field
        self.length = length

    def generate_key(self, record: Dict) -> str:
        value = record.get(self.field)
        if not value:
            return None
        clean = str(value).lower().strip()
        return clean[:self.length] if len(clean) >= self.length else clean


class DomainBlocker(BlockingStrategy):
    """Block by email domain."""

    def __init__(self, field: str = "email"):
        self.field = field

    def generate_key(self, record: Dict) -> str:
        email = record.get(self.field)
        if not email or "@" not in email:
            return None
        return email.split("@")[-1].lower().strip()


class PhoneticBlocker(BlockingStrategy):
    """Block by phonetic encoding of a field."""

    def __init__(self, field: str, algorithm: str = "soundex"):
        self.field = field
        self.algorithm = algorithm

    def generate_key(self, record: Dict) -> str:
        import jellyfish

        value = record.get(self.field)
        if not value:
            return None

        if self.algorithm == "soundex":
            return jellyfish.soundex(str(value))
        elif self.algorithm == "metaphone":
            return jellyfish.metaphone(str(value))
        return None


class CompositeBlocker(BlockingStrategy):
    """Combine multiple blocking strategies (OR logic)."""

    def __init__(self, blockers: List[BlockingStrategy]):
        self.blockers = blockers

    def create_blocks(self, records: List[Dict]) -> Dict[str, List[Dict]]:
        """Create blocks using all strategies, then combine."""
        all_blocks = {}

        for blocker in self.blockers:
            blocks = blocker.create_blocks(records)
            for key, block_records in blocks.items():
                prefixed_key = f"{blocker.__class__.__name__}:{key}"
                if prefixed_key not in all_blocks:
                    all_blocks[prefixed_key] = []
                all_blocks[prefixed_key].extend(block_records)

        # Deduplicate records within blocks
        for key in all_blocks:
            seen_ids = set()
            unique_records = []
            for record in all_blocks[key]:
                record_id = record.get("id")
                if record_id not in seen_ids:
                    seen_ids.add(record_id)
                    unique_records.append(record)
            all_blocks[key] = unique_records

        return all_blocks
```

#### 6.4.4 Blocking Effectiveness Analysis

| Strategy | 10K Records | Blocks | Avg Block Size | Comparisons | Reduction |
|----------|-------------|--------|----------------|-------------|-----------|
| None | 10,000 | 1 | 10,000 | 49,995,000 | 0% |
| Email Domain | 10,000 | 500 | 20 | 95,000 | 99.8% |
| Name Prefix (3) | 10,000 | 2,000 | 5 | 50,000 | 99.9% |
| Soundex Last Name | 10,000 | 800 | 12.5 | 62,500 | 99.9% |
| Composite (all) | 10,000 | 3,000 | 3.3 | 16,500 | 99.97% |

#### 6.4.5 Tasks Breakdown

| Task ID | Task | Estimate | Dependencies |
|---------|------|----------|--------------|
| T2.3.1 | Create BlockingStrategy base class | 2h | None |
| T2.3.2 | Implement ExactBlocker | 2h | T2.3.1 |
| T2.3.3 | Implement PrefixBlocker | 2h | T2.3.1 |
| T2.3.4 | Implement DomainBlocker | 2h | T2.3.1 |
| T2.3.5 | Implement PhoneticBlocker | 2h | T2.3.1 |
| T2.3.6 | Implement CompositeBlocker | 3h | All above |
| T2.3.7 | Benchmark blocking performance | 3h | T2.3.6 |
| T2.3.8 | Write blocking tests | 4h | All above |
| **Total** | | **20h** | |

### 6.5 Stage 2.4: Scoring Pipeline (Week 5-6)

#### 6.5.1 Deliverables

| Deliverable | Description | Acceptance Criteria |
|-------------|-------------|---------------------|
| D2.4.1 | Composite scorer | Weighted field scores → final score |
| D2.4.2 | Required field handling | Reject if required field doesn't match |
| D2.4.3 | Threshold classification | Auto-merge / Review / Reject buckets |
| D2.4.4 | Score breakdown | Per-field scores stored for UI |

#### 6.5.2 Scoring Algorithm

```python
# Scoring implementation

from dataclasses import dataclass
from typing import Dict, List, Optional
from enum import Enum

class MatchClassification(Enum):
    AUTO_MERGE = "auto_merge"
    REVIEW = "review"
    REJECT = "reject"


@dataclass
class FieldScore:
    field_name: str
    source_value: any
    target_value: any
    match_type: str
    score: float
    weight: float
    weighted_score: float


@dataclass
class MatchScore:
    record_a_id: str
    record_b_id: str
    confidence: float
    classification: MatchClassification
    field_scores: List[FieldScore]

    def to_dict(self) -> Dict:
        return {
            "record_a_id": self.record_a_id,
            "record_b_id": self.record_b_id,
            "confidence": self.confidence,
            "classification": self.classification.value,
            "field_scores": {
                fs.field_name: {
                    "source_value": fs.source_value,
                    "target_value": fs.target_value,
                    "match_type": fs.match_type,
                    "score": fs.score,
                    "weight": fs.weight,
                    "weighted_score": fs.weighted_score
                }
                for fs in self.field_scores
            }
        }


class ScoringPipeline:
    """Calculate match scores for record pairs."""

    def __init__(
        self,
        match_rule: MatchRule,
        comparator_registry: ComparatorRegistry
    ):
        self.match_rule = match_rule
        self.comparators = comparator_registry

    def score_pair(
        self,
        record_a: Dict,
        record_b: Dict
    ) -> Optional[MatchScore]:
        """
        Score a pair of records according to the match rule.

        Returns:
            MatchScore if all required fields match, None otherwise
        """
        field_scores = []
        total_weight = 0.0
        weighted_sum = 0.0

        for field_config in self.match_rule.match_fields:
            # Get field values
            source_value = record_a.get(field_config.source_field)
            target_value = record_b.get(field_config.target_field)

            # Get comparator
            comparator = self.comparators.get(field_config.match_type)

            # Calculate field score
            field_score = comparator.compare(
                source_value,
                target_value,
                field_config.config
            )

            # Check required field constraint
            if field_config.required and field_score < 0.8:
                # Required field doesn't match - reject pair
                return None

            # Calculate weighted score
            weight = field_config.weight
            weighted_score = field_score * weight

            field_scores.append(FieldScore(
                field_name=field_config.source_field,
                source_value=source_value,
                target_value=target_value,
                match_type=field_config.match_type,
                score=field_score,
                weight=weight,
                weighted_score=weighted_score
            ))

            total_weight += weight
            weighted_sum += weighted_score

        # Calculate final confidence
        confidence = weighted_sum / total_weight if total_weight > 0 else 0.0

        # Classify match
        thresholds = self.match_rule.thresholds
        if confidence >= thresholds.auto_merge:
            classification = MatchClassification.AUTO_MERGE
        elif confidence >= thresholds.review:
            classification = MatchClassification.REVIEW
        else:
            classification = MatchClassification.REJECT

        return MatchScore(
            record_a_id=record_a["id"],
            record_b_id=record_b["id"],
            confidence=round(confidence, 4),
            classification=classification,
            field_scores=field_scores
        )
```

#### 6.5.3 Scoring Example

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        SCORING EXAMPLE                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  RECORD A                         RECORD B                              │
│  ─────────────────────           ─────────────────────                  │
│  id: "contact_123"               id: "contact_456"                      │
│  email: "john@acme.com"          email: "john@acme.com"                 │
│  firstName: "John"               firstName: "Jon"                       │
│  lastName: "Smith"               lastName: "Smith"                      │
│  phone: "(555) 123-4567"         phone: "555-123-4567"                  │
│                                                                         │
│  ─────────────────────────────────────────────────────────────────────  │
│  FIELD SCORING                                                          │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                         │
│  Field      │ Match Type    │ Score │ Weight │ Weighted                 │
│  ───────────┼───────────────┼───────┼────────┼──────────                │
│  email      │ exact_norm    │ 1.00  │ 0.40   │ 0.40                     │
│  firstName  │ fuzzy (JW)    │ 0.93  │ 0.20   │ 0.186                    │
│  lastName   │ fuzzy (JW)    │ 1.00  │ 0.20   │ 0.20                     │
│  phone      │ phone_norm    │ 1.00  │ 0.20   │ 0.20                     │
│  ───────────┴───────────────┴───────┴────────┴──────────                │
│                                                                         │
│  FINAL CONFIDENCE: 0.986 (98.6%)                                        │
│                                                                         │
│  CLASSIFICATION: AUTO_MERGE (≥95%)                                      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

#### 6.5.4 Tasks Breakdown

| Task ID | Task | Estimate | Dependencies |
|---------|------|----------|--------------|
| T2.4.1 | Create FieldScore dataclass | 1h | None |
| T2.4.2 | Create MatchScore dataclass | 1h | T2.4.1 |
| T2.4.3 | Implement ScoringPipeline | 4h | T2.2.9, T2.4.2 |
| T2.4.4 | Add required field handling | 2h | T2.4.3 |
| T2.4.5 | Add threshold classification | 2h | T2.4.3 |
| T2.4.6 | Create score breakdown serialization | 2h | T2.4.2 |
| T2.4.7 | Write scoring tests | 4h | All above |
| **Total** | | **16h** | |

### 6.6 Stage 2.5: Matching Engine Orchestrator (Week 6)

#### 6.6.1 Deliverables

| Deliverable | Description | Acceptance Criteria |
|-------------|-------------|---------------------|
| D2.5.1 | MatchingEngine class | Orchestrates full matching flow |
| D2.5.2 | Match detection endpoint | API to trigger matching |
| D2.5.3 | Match pair storage | Detected pairs saved to database |
| D2.5.4 | Match statistics | Metrics on matches found |

#### 6.6.2 Matching Engine Architecture

```python
# Matching engine orchestrator

from typing import List, Dict, Optional
from dataclasses import dataclass
import asyncio

@dataclass
class MatchingResult:
    records_scanned: int
    pairs_compared: int
    matches_found: int
    auto_merge: int
    pending_review: int
    rejected: int
    processing_time_ms: int


class MatchingEngine:
    """Orchestrates the complete matching process."""

    def __init__(
        self,
        ghl_client: GHLClient,
        match_rule: MatchRule,
        blocker: BlockingStrategy,
        scorer: ScoringPipeline,
        match_pair_repo: MatchPairRepository
    ):
        self.ghl_client = ghl_client
        self.match_rule = match_rule
        self.blocker = blocker
        self.scorer = scorer
        self.match_pair_repo = match_pair_repo

    async def run(
        self,
        location_id: str,
        limit: Optional[int] = None,
        incremental: bool = False
    ) -> MatchingResult:
        """
        Execute matching for a location.

        Args:
            location_id: GHL location to scan
            limit: Max records to scan (None = all)
            incremental: Only scan new/updated records

        Returns:
            MatchingResult with statistics
        """
        start_time = time.time()

        # 1. Fetch records from GHL
        records = await self._fetch_records(location_id, limit, incremental)

        # 2. Create blocks
        blocks = self.blocker.create_blocks(records)

        # 3. Compare pairs within each block
        matches = []
        pairs_compared = 0

        for block_key, block_records in blocks.items():
            block_matches, block_comparisons = self._process_block(block_records)
            matches.extend(block_matches)
            pairs_compared += block_comparisons

        # 4. Deduplicate matches (same pair may appear in multiple blocks)
        unique_matches = self._deduplicate_matches(matches)

        # 5. Save match pairs to database
        auto_merge_count = 0
        review_count = 0
        rejected_count = 0

        for match in unique_matches:
            if match.classification == MatchClassification.AUTO_MERGE:
                auto_merge_count += 1
            elif match.classification == MatchClassification.REVIEW:
                review_count += 1
            else:
                rejected_count += 1

            # Only save non-rejected matches
            if match.classification != MatchClassification.REJECT:
                await self.match_pair_repo.create(
                    location_id=location_id,
                    match_rule_id=self.match_rule.id,
                    record_a_id=match.record_a_id,
                    record_a_type=self.match_rule.source_object,
                    record_b_id=match.record_b_id,
                    record_b_type=self.match_rule.target_object,
                    confidence_score=match.confidence,
                    field_scores=match.to_dict()["field_scores"],
                    status="pending" if match.classification == MatchClassification.REVIEW
                           else "auto_merge_pending"
                )

        processing_time = int((time.time() - start_time) * 1000)

        return MatchingResult(
            records_scanned=len(records),
            pairs_compared=pairs_compared,
            matches_found=len(unique_matches),
            auto_merge=auto_merge_count,
            pending_review=review_count,
            rejected=rejected_count,
            processing_time_ms=processing_time
        )

    def _process_block(
        self,
        records: List[Dict]
    ) -> tuple[List[MatchScore], int]:
        """Process all pairs within a block."""
        matches = []
        comparisons = 0

        for i, record_a in enumerate(records):
            for record_b in records[i + 1:]:
                comparisons += 1
                score = self.scorer.score_pair(record_a, record_b)
                if score and score.classification != MatchClassification.REJECT:
                    matches.append(score)

        return matches, comparisons

    async def _fetch_records(
        self,
        location_id: str,
        limit: Optional[int],
        incremental: bool
    ) -> List[Dict]:
        """Fetch records from GHL API with pagination."""
        records = []
        offset = 0
        page_size = 100

        while True:
            page = await self.ghl_client.list_contacts(
                limit=page_size,
                offset=offset
            )

            records.extend(page)

            if len(page) < page_size:
                break

            if limit and len(records) >= limit:
                records = records[:limit]
                break

            offset += page_size

        return records

    def _deduplicate_matches(
        self,
        matches: List[MatchScore]
    ) -> List[MatchScore]:
        """Remove duplicate matches (keep highest score)."""
        seen = {}

        for match in matches:
            # Create canonical pair key (sorted IDs)
            pair_key = tuple(sorted([match.record_a_id, match.record_b_id]))

            if pair_key not in seen or match.confidence > seen[pair_key].confidence:
                seen[pair_key] = match

        return list(seen.values())
```

#### 6.6.3 Tasks Breakdown

| Task ID | Task | Estimate | Dependencies |
|---------|------|----------|--------------|
| T2.5.1 | Create MatchingEngine class | 6h | All Stage 2.1-2.4 |
| T2.5.2 | Implement record fetching with pagination | 3h | T2.5.1 |
| T2.5.3 | Implement block processing | 3h | T2.5.1 |
| T2.5.4 | Implement match deduplication | 2h | T2.5.1 |
| T2.5.5 | Create match pair storage | 3h | T2.5.1 |
| T2.5.6 | Create matching API endpoint | 3h | T2.5.1 |
| T2.5.7 | Add matching statistics | 2h | T2.5.1 |
| T2.5.8 | Write integration tests | 6h | All above |
| **Total** | | **28h** | |

### 6.7 Phase 2 Summary

| Stage | Estimated Hours | Calendar Time |
|-------|-----------------|---------------|
| 2.1: Match Rule Configuration | 19h | 0.5 week |
| 2.2: Field Comparators | 26h | 0.5 week |
| 2.3: Blocking Strategies | 20h | 0.5 week |
| 2.4: Scoring Pipeline | 16h | 0.5 week |
| 2.5: Matching Engine | 28h | 1 week |
| **Total** | **109h** | **3 weeks** |

**Phase 2 Exit Criteria:**
- [ ] Match rules can be created and configured
- [ ] All comparators passing tests
- [ ] Blocking reduces comparisons by >99%
- [ ] Scoring produces accurate confidence scores
- [ ] Matches detected and stored in database
- [ ] API endpoint triggers matching
- [ ] 80%+ test coverage

---

## 7. Phase 3: Merge & Restore System

### 7.1 Phase Overview

| Attribute | Value |
|-----------|-------|
| **Duration** | 2 weeks |
| **Team** | 1-2 Backend Engineers |
| **Dependencies** | Phase 2 complete |
| **Exit Criteria** | Can merge records and rollback |

### 7.2 Stage 3.1: Master Record Selection (Week 7)

#### 7.2.1 Deliverables

| Deliverable | Description | Acceptance Criteria |
|-------------|-------------|---------------------|
| D3.1.1 | Selection strategies | All 5 strategies implemented |
| D3.1.2 | Custom rules engine | Field-based priority rules |
| D3.1.3 | Selection explanation | Reason for selection stored |

#### 7.2.2 Selection Strategy Specifications

```python
# Master record selection strategies

from abc import ABC, abstractmethod
from typing import List, Dict, Tuple
from dataclasses import dataclass

@dataclass
class SelectionResult:
    master_id: str
    reason: str
    scores: Dict[str, float]  # Record ID → selection score


class SelectionStrategy(ABC):
    """Base class for master record selection."""

    @abstractmethod
    def select(self, records: List[Dict]) -> SelectionResult:
        """Select master record from candidates."""
        pass


class MostCompleteStrategy(SelectionStrategy):
    """Select record with most populated fields."""

    def select(self, records: List[Dict]) -> SelectionResult:
        scores = {}

        for record in records:
            # Count non-null, non-empty fields
            score = sum(
                1 for v in record.values()
                if v is not None and v != "" and v != []
            )
            scores[record["id"]] = score

        master_id = max(scores, key=scores.get)
        return SelectionResult(
            master_id=master_id,
            reason=f"Most complete data ({scores[master_id]} fields populated)",
            scores=scores
        )


class OldestStrategy(SelectionStrategy):
    """Select oldest record by creation date."""

    def select(self, records: List[Dict]) -> SelectionResult:
        scores = {}

        for record in records:
            # Parse dateAdded (ISO format)
            date_str = record.get("dateAdded", "")
            try:
                date = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
                # Lower timestamp = older = higher score
                scores[record["id"]] = -date.timestamp()
            except:
                scores[record["id"]] = 0

        master_id = max(scores, key=scores.get)
        oldest_record = next(r for r in records if r["id"] == master_id)

        return SelectionResult(
            master_id=master_id,
            reason=f"Oldest record (created {oldest_record.get('dateAdded', 'unknown')})",
            scores={k: -v for k, v in scores.items()}  # Convert back to positive
        )


class NewestStrategy(SelectionStrategy):
    """Select most recently created record."""

    def select(self, records: List[Dict]) -> SelectionResult:
        scores = {}

        for record in records:
            date_str = record.get("dateAdded", "")
            try:
                date = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
                scores[record["id"]] = date.timestamp()
            except:
                scores[record["id"]] = 0

        master_id = max(scores, key=scores.get)
        newest_record = next(r for r in records if r["id"] == master_id)

        return SelectionResult(
            master_id=master_id,
            reason=f"Newest record (created {newest_record.get('dateAdded', 'unknown')})",
            scores=scores
        )


class MostRecentActivityStrategy(SelectionStrategy):
    """Select record with most recent update."""

    def select(self, records: List[Dict]) -> SelectionResult:
        scores = {}

        for record in records:
            date_str = record.get("dateUpdated", record.get("dateAdded", ""))
            try:
                date = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
                scores[record["id"]] = date.timestamp()
            except:
                scores[record["id"]] = 0

        master_id = max(scores, key=scores.get)

        return SelectionResult(
            master_id=master_id,
            reason="Most recent activity",
            scores=scores
        )


class CustomRulesStrategy(SelectionStrategy):
    """Select based on custom field-priority rules. (Pro/Agency tier only)"""

    def __init__(self, rules: List[Dict], tiebreaker: str = "oldest"):
        """
        Args:
            rules: List of rule dicts:
                {
                    "field": "source",
                    "prefer_values": ["referral", "organic"],
                    "weight": 3
                }
                or
                {
                    "field": "email",
                    "prefer": "not_null",
                    "weight": 2
                }
            tiebreaker: Strategy for ties ("oldest", "newest", "most_complete")
        """
        self.rules = rules
        self.tiebreaker = tiebreaker

    def select(self, records: List[Dict]) -> SelectionResult:
        scores = {r["id"]: 0 for r in records}

        for rule in self.rules:
            field = rule["field"]
            weight = rule.get("weight", 1)

            for record in records:
                value = record.get(field)

                if "prefer_values" in rule:
                    if value in rule["prefer_values"]:
                        # Earlier in list = higher priority
                        priority = len(rule["prefer_values"]) - rule["prefer_values"].index(value)
                        scores[record["id"]] += weight * priority

                elif rule.get("prefer") == "not_null":
                    if value is not None and value != "":
                        scores[record["id"]] += weight

                elif rule.get("prefer") == "oldest":
                    # Use tiebreaker for this
                    pass

        # Find max score
        max_score = max(scores.values())
        candidates = [rid for rid, score in scores.items() if score == max_score]

        # Break ties
        if len(candidates) > 1:
            candidate_records = [r for r in records if r["id"] in candidates]
            if self.tiebreaker == "oldest":
                tiebreak_result = OldestStrategy().select(candidate_records)
            elif self.tiebreaker == "newest":
                tiebreak_result = NewestStrategy().select(candidate_records)
            else:
                tiebreak_result = MostCompleteStrategy().select(candidate_records)
            master_id = tiebreak_result.master_id
            reason = f"Custom rules (score: {max_score}), tiebreaker: {tiebreak_result.reason}"
        else:
            master_id = candidates[0]
            reason = f"Custom rules (score: {max_score})"

        return SelectionResult(
            master_id=master_id,
            reason=reason,
            scores=scores
        )
```

#### 7.2.3 Tasks Breakdown

| Task ID | Task | Estimate | Dependencies |
|---------|------|----------|--------------|
| T3.1.1 | Create SelectionStrategy base class | 2h | None |
| T3.1.2 | Implement MostCompleteStrategy | 2h | T3.1.1 |
| T3.1.3 | Implement OldestStrategy | 2h | T3.1.1 |
| T3.1.4 | Implement NewestStrategy | 1h | T3.1.3 |
| T3.1.5 | Implement MostRecentActivityStrategy | 2h | T3.1.1 |
| T3.1.6 | Implement CustomRulesStrategy | 4h | T3.1.1 |
| T3.1.7 | Create strategy factory/registry | 2h | All above |
| T3.1.8 | Write selection tests | 4h | All above |
| **Total** | | **19h** | |

### 7.3 Stage 3.2: Merge Execution (Week 7-8)

#### 7.3.1 Deliverables

| Deliverable | Description | Acceptance Criteria |
|-------------|-------------|---------------------|
| D3.2.1 | Field merge logic | Best value selected per field |
| D3.2.2 | Snapshot creation | Full record state saved before merge |
| D3.2.3 | GHL merge execution | Master updated, duplicates deleted |
| D3.2.4 | Related records handling | Notes/tasks copied, opps per settings |
| D3.2.5 | Merge status tracking | Status updates through flow |

#### 7.3.2 Merge Execution Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       MERGE EXECUTION FLOW                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  INPUT: match_pair_id, user_field_selections (optional)                 │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ STEP 1: VALIDATE                                                  │  │
│  │                                                                   │  │
│  │  ✓ Match pair exists and status = 'approved' or 'auto_merge_...' │  │
│  │  ✓ No concurrent merge in progress for these records              │  │
│  │  ✓ Records still exist in GHL                                     │  │
│  │  ✓ User has permission for this location                          │  │
│  │                                                                   │  │
│  │  Status: pending → in_progress                                    │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                              │                                          │
│                              ▼                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ STEP 2: SNAPSHOT                                                  │  │
│  │                                                                   │  │
│  │  • Fetch complete record state for ALL records from GHL           │  │
│  │  • Store in merge_snapshots table                                 │  │
│  │  • Calculate rollback_expires_at (7 days Starter, 30 days Pro+)   │  │
│  │  • Mark which record is master                                    │  │
│  │                                                                   │  │
│  │  Records stored:                                                  │  │
│  │  ┌─────────────────────────────────────────────┐                  │  │
│  │  │ { merge_id, record_id, snapshot_data: {...},│                  │  │
│  │  │   is_master: true/false }                   │                  │  │
│  │  └─────────────────────────────────────────────┘                  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                              │                                          │
│                              ▼                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ STEP 3: CALCULATE FIELD VALUES                                    │  │
│  │                                                                   │  │
│  │  For each field:                                                  │  │
│  │  • If user selected value → use that                              │  │
│  │  • Else if master has value → use master's                        │  │
│  │  • Else if any merged record has value → use first non-null       │  │
│  │                                                                   │  │
│  │  Result: field_selections JSON                                    │  │
│  │  {                                                                │  │
│  │    "email": { "source": "master", "value": "john@acme.com" },     │  │
│  │    "phone": { "source": "merged_0", "value": "555-0123" },        │  │
│  │    "company": { "source": "user", "value": "Acme Inc" }           │  │
│  │  }                                                                │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                              │                                          │
│                              ▼                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ STEP 4: UPDATE MASTER RECORD                                      │  │
│  │                                                                   │  │
│  │  API: PUT /contacts/{master_id}                                   │  │
│  │  Body: merged field values                                        │  │
│  │                                                                   │  │
│  │  Handle rate limits: retry with backoff                           │  │
│  │  Handle 404: Record deleted externally → fail gracefully          │  │
│  │  Handle 400: Validation error → log and continue                  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                              │                                          │
│                              ▼                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ STEP 5: COPY RELATED RECORDS (per merge rule settings)            │  │
│  │                                                                   │  │
│  │  ⚠️ GHL API: Can't move records, but CAN create copies on master  │  │
│  │                                                                   │  │
│  │  MERGE SETTINGS (configured per rule, with defaults):             │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │  │
│  │  │ Notes:         ○ Copy all to master (default)  ○ Don't copy │  │  │
│  │  │ Tasks:         ○ Copy all to master (default)  ○ Don't copy │  │  │
│  │  │ Opportunities: ○ Keep all (default)                         │  │  │
│  │  │                ○ Keep from master only                      │  │  │
│  │  │                ○ Keep highest value                         │  │  │
│  │  └─────────────────────────────────────────────────────────────┘  │  │
│  │                                                                   │  │
│  │  Process:                                                         │  │
│  │  • Notes: POST /contacts/{master_id}/notes with copy of body      │  │
│  │  • Tasks: POST /contacts/{master_id}/tasks with copy of details   │  │
│  │  • Opps: Per setting (keep all = no action, others = delete)      │  │
│  │  • Associations: Recreate via Associations API                    │  │
│  │                                                                   │  │
│  │  ⚠️ Copied records have NEW IDs/timestamps (not originals)        │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                              │                                          │
│                              ▼                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ STEP 5b: PRE-DELETE CONFIRMATION (UI interstitial)                │  │
│  │                                                                   │  │
│  │  Show user before proceeding to delete:                           │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │  │
│  │  │ ⚠️ Confirm Merge                                            │  │  │
│  │  │                                                             │  │  │
│  │  │ Master record: John Smith (john@acme.com)                   │  │  │
│  │  │                                                             │  │  │
│  │  │ The following duplicate will be PERMANENTLY DELETED:        │  │  │
│  │  │ • Jon Smith (jon.smith@acme.com)                            │  │  │
│  │  │   └─ 3 notes, 2 tasks, 1 opportunity will be copied         │  │  │
│  │  │      (as new records with new IDs)                          │  │  │
│  │  │                                                             │  │  │
│  │  │ This action can be rolled back within X days.               │  │  │
│  │  │                                                             │  │  │
│  │  │ [Cancel]                        [Confirm & Merge]           │  │  │
│  │  └─────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                              │                                          │
│                              ▼                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ STEP 6: DELETE MERGED RECORDS                                     │  │
│  │                                                                   │  │
│  │  For each merged record (not master):                             │  │
│  │  • API: DELETE /contacts/{record_id}                              │  │
│  │  • Handle 404: Already deleted → continue                         │  │
│  │  • Handle rate limits: retry with backoff                         │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                              │                                          │
│                              ▼                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ STEP 7: VERIFY & RECORD                                           │  │
│  │                                                                   │  │
│  │  • Fetch master record → verify updated                           │  │
│  │  • Attempt fetch merged records → verify 404                      │  │
│  │  • Update merge.status = 'completed'                              │  │
│  │  • Update match_pair.status = 'merged'                            │  │
│  │  • Create audit_event                                             │  │
│  │                                                                   │  │
│  │  Status: in_progress → completed                                  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ERROR HANDLING:                                                        │
│  • Step 1-2 fail → Status: failed, no cleanup needed                   │
│  • Step 4 fails → Status: failed, no changes made                      │
│  • Step 5 fails → Log warning, continue (best effort)                  │
│  • Step 6 fails → Status: partial_failed, log which records remain     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

#### 7.3.3 Merge Executor Implementation

```python
# Merge execution implementation

from dataclasses import dataclass
from typing import List, Dict, Optional
from enum import Enum
import asyncio

class MergeStatus(Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    PARTIAL_FAILED = "partial_failed"
    ROLLED_BACK = "rolled_back"


@dataclass
class MergeResult:
    success: bool
    merge_id: str
    master_record_id: str
    merged_record_ids: List[str]
    status: MergeStatus
    error_message: Optional[str] = None
    warnings: List[str] = None


class MergeExecutor:
    """Executes merge operations with full audit trail."""

    def __init__(
        self,
        ghl_client: GHLClient,
        merge_repo: MergeRepository,
        snapshot_repo: MergeSnapshotRepository,
        audit_logger: AuditLogger
    ):
        self.ghl_client = ghl_client
        self.merge_repo = merge_repo
        self.snapshot_repo = snapshot_repo
        self.audit_logger = audit_logger

    async def execute(
        self,
        match_pair_id: str,
        user_field_selections: Optional[Dict] = None,
        executed_by: Optional[str] = None
    ) -> MergeResult:
        """
        Execute a merge for an approved match pair.

        Args:
            match_pair_id: ID of the approved match pair
            user_field_selections: Optional user overrides for field values
            executed_by: User ID or 'system' for auto-merge

        Returns:
            MergeResult with status and details
        """
        warnings = []

        try:
            # Step 1: Validate
            match_pair = await self._validate_match_pair(match_pair_id)

            # Create merge record
            merge = await self.merge_repo.create(
                match_pair_id=match_pair_id,
                status=MergeStatus.IN_PROGRESS,
                executed_by=executed_by
            )

            # Step 2: Snapshot
            records = await self._fetch_and_snapshot_records(
                merge.id,
                match_pair
            )

            # Step 3: Calculate field values
            master_id = match_pair.master_record_id or records[0]["id"]
            master_record = next(r for r in records if r["id"] == master_id)
            merged_records = [r for r in records if r["id"] != master_id]

            field_values = self._calculate_merged_values(
                master_record,
                merged_records,
                user_field_selections
            )

            # Step 4: Update master record
            await self._update_master_record(master_id, field_values)

            # Step 5: Transfer associations (best effort)
            transfer_warnings = await self._transfer_associations(
                master_id,
                [r["id"] for r in merged_records]
            )
            warnings.extend(transfer_warnings)

            # Step 6: Delete merged records
            delete_failures = await self._delete_merged_records(
                [r["id"] for r in merged_records]
            )

            # Step 7: Verify and record
            if delete_failures:
                status = MergeStatus.PARTIAL_FAILED
                warnings.append(f"Failed to delete: {delete_failures}")
            else:
                status = MergeStatus.COMPLETED

            await self.merge_repo.update(
                merge.id,
                status=status,
                field_selections=field_values,
                executed_at=datetime.utcnow(),
                # Rollback window: 7 days (Starter), 30 days (Pro/Agency)
                rollback_days = 30 if tenant.plan in ['pro', 'agency'] else 7
                rollback_expires_at=datetime.utcnow() + timedelta(days=rollback_days)
            )

            await self.audit_logger.log(
                event_type="merge_completed",
                entity_type="merge",
                entity_id=merge.id,
                event_data={
                    "master_record_id": master_id,
                    "merged_record_ids": [r["id"] for r in merged_records],
                    "status": status.value
                },
                actor_id=executed_by
            )

            return MergeResult(
                success=True,
                merge_id=merge.id,
                master_record_id=master_id,
                merged_record_ids=[r["id"] for r in merged_records],
                status=status,
                warnings=warnings
            )

        except Exception as e:
            # Update merge status to failed
            if 'merge' in locals():
                await self.merge_repo.update(
                    merge.id,
                    status=MergeStatus.FAILED,
                    error_message=str(e)
                )

            await self.audit_logger.log(
                event_type="merge_failed",
                entity_type="merge",
                entity_id=merge.id if 'merge' in locals() else None,
                event_data={"error": str(e)},
                actor_id=executed_by
            )

            return MergeResult(
                success=False,
                merge_id=merge.id if 'merge' in locals() else None,
                master_record_id=None,
                merged_record_ids=[],
                status=MergeStatus.FAILED,
                error_message=str(e)
            )

    def _calculate_merged_values(
        self,
        master: Dict,
        merged: List[Dict],
        user_selections: Optional[Dict]
    ) -> Dict:
        """Calculate final value for each field."""
        result = {}

        # Get all field names
        all_fields = set(master.keys())
        for record in merged:
            all_fields.update(record.keys())

        # Skip system fields
        skip_fields = {"id", "dateAdded", "dateUpdated", "locationId"}

        for field in all_fields:
            if field in skip_fields:
                continue

            # User selection takes priority
            if user_selections and field in user_selections:
                result[field] = {
                    "source": "user",
                    "value": user_selections[field]
                }
                continue

            # Master value if exists
            master_value = master.get(field)
            if master_value is not None and master_value != "":
                result[field] = {
                    "source": "master",
                    "value": master_value
                }
                continue

            # First non-null from merged records
            for i, record in enumerate(merged):
                value = record.get(field)
                if value is not None and value != "":
                    result[field] = {
                        "source": f"merged_{i}",
                        "value": value
                    }
                    break

        return result
```

#### 7.3.4 Tasks Breakdown

| Task ID | Task | Estimate | Dependencies |
|---------|------|----------|--------------|
| T3.2.1 | Create MergeExecutor class | 4h | T3.1.7 |
| T3.2.2 | Implement validation step | 2h | T3.2.1 |
| T3.2.3 | Implement snapshot creation | 3h | T3.2.1 |
| T3.2.4 | Implement field value calculation | 3h | T3.2.1 |
| T3.2.5 | Implement master record update | 3h | T3.2.1 |
| T3.2.6 | Implement association transfer | 4h | T3.2.1 |
| T3.2.7 | Implement merged record deletion | 3h | T3.2.1 |
| T3.2.8 | Implement verification step | 2h | T3.2.1 |
| T3.2.9 | Add error handling and status tracking | 3h | All above |
| T3.2.10 | Create merge API endpoint | 2h | T3.2.1 |
| T3.2.11 | Write merge integration tests | 6h | All above |
| **Total** | | **35h** | |

### 7.4 Stage 3.3: Rollback Mechanism (Week 8)

#### 7.4.1 Deliverables

| Deliverable | Description | Acceptance Criteria |
|-------------|-------------|---------------------|
| D3.3.1 | Rollback validation | Check within window, snapshots exist |
| D3.3.2 | Record restoration | Merged records recreated |
| D3.3.3 | Master restoration | Original master values restored |
| D3.3.4 | Rollback API | Endpoint to trigger rollback |

#### 7.4.2 Rollback Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        ROLLBACK FLOW                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  INPUT: merge_id                                                        │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ STEP 1: VALIDATE ROLLBACK                                         │  │
│  │                                                                   │  │
│  │  ✓ Merge exists and status = 'completed'                          │  │
│  │  ✓ Current time < rollback_expires_at                             │  │
│  │  ✓ Snapshots exist for all records                                │  │
│  │  ✓ Master record still exists in GHL                              │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                              │                                          │
│                              ▼                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ STEP 2: RECREATE MERGED RECORDS                                   │  │
│  │                                                                   │  │
│  │  For each non-master snapshot:                                    │  │
│  │  • Remove 'id' from snapshot_data                                 │  │
│  │  • POST /contacts with snapshot_data                              │  │
│  │  • Store new GHL ID for reference                                 │  │
│  │                                                                   │  │
│  │  Note: New IDs will differ from original                          │  │
│  │        Associations (notes, tasks) remain on master               │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                              │                                          │
│                              ▼                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ STEP 3: RESTORE MASTER TO ORIGINAL STATE                          │  │
│  │                                                                   │  │
│  │  • Get master snapshot                                            │  │
│  │  • PUT /contacts/{master_id} with original values                 │  │
│  │  • Fields that came from merged records are cleared/restored      │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                              │                                          │
│                              ▼                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ STEP 4: UPDATE RECORDS                                            │  │
│  │                                                                   │  │
│  │  • merge.status = 'rolled_back'                                   │  │
│  │  • merge.rolled_back_at = NOW()                                   │  │
│  │  • merge.rolled_back_by = user_id                                 │  │
│  │  • match_pair.status = 'pending' (re-enters queue)                │  │
│  │  • Create audit_event                                             │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ROLLBACK LIMITATIONS (show in UI):                                     │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ ⚠️ Rollback Limitations                                        │    │
│  │                                                                 │    │
│  │ • Duplicate contacts will be recreated with NEW GHL IDs        │    │
│  │ • Notes/tasks copied to master during merge will remain there  │    │
│  │   (may result in duplicates on master after rollback)          │    │
│  │ • Original note/task IDs and timestamps are not recoverable    │    │
│  │                                                                 │    │
│  │ [Cancel]                              [Confirm Rollback]        │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

#### 7.4.3 Tasks Breakdown

| Task ID | Task | Estimate | Dependencies |
|---------|------|----------|--------------|
| T3.3.1 | Create RollbackExecutor class | 3h | T3.2.11 |
| T3.3.2 | Implement rollback validation | 2h | T3.3.1 |
| T3.3.3 | Implement record recreation | 4h | T3.3.1 |
| T3.3.4 | Implement master restoration | 3h | T3.3.1 |
| T3.3.5 | Implement status updates | 2h | T3.3.1 |
| T3.3.6 | Create rollback API endpoint | 2h | T3.3.1 |
| T3.3.7 | Write rollback tests | 4h | All above |
| **Total** | | **20h** | |

### 7.5 Phase 3 Summary

| Stage | Estimated Hours | Calendar Time |
|-------|-----------------|---------------|
| 3.1: Master Record Selection | 19h | 0.5 week |
| 3.2: Merge Execution | 35h | 1 week |
| 3.3: Rollback Mechanism | 20h | 0.5 week |
| **Total** | **74h** | **2 weeks** |

**Phase 3 Exit Criteria:**
- [ ] All 5 selection strategies implemented
- [ ] Merges execute successfully via API
- [ ] Snapshots created before every merge
- [ ] Rollback restores records correctly
- [ ] Audit events logged for all operations
- [ ] 80%+ test coverage

---

## 8. Phase 4: Job Scheduling & Automation

### 8.1 Phase Overview

| Attribute | Value |
|-----------|-------|
| **Duration** | 2 weeks |
| **Team** | 1 Backend Engineer |
| **Dependencies** | Phase 1-3 complete |
| **Exit Criteria** | Scheduled jobs running, auto-merge working |

### 8.2 Job Types

| Job Type | Description | Trigger |
|----------|-------------|---------|
| **Scan Job** | Runs a Match Rule to find duplicates | Manual, Scheduled, Webhook |
| **Sync Job** | Pulls delta updates from GHL | Manual, Scheduled, Webhook |
| **Auto-Merge Job** | Merges high-confidence matches automatically | After Scan (if enabled) |

### 8.3 Job Scheduling by Tier

| Feature | Free | Starter | Pro | Agency |
|---------|------|---------|-----|--------|
| Manual scan trigger | ✅ 1/day | ✅ Unlimited | ✅ Unlimited | ✅ Unlimited |
| Scheduled scans | ❌ | ❌ | ✅ Hourly | ✅ Hourly |
| Auto-merge (≥95%) | ❌ | ❌ | ✅ | ✅ |
| Webhook triggers | ❌ | ❌ | ✅ | ✅ |

### 8.4 Schedule Configuration

Each Match Rule can have an independent schedule:

```typescript
interface MatchRuleSchedule {
  rule_id: string;
  enabled: boolean;
  frequency: 'manual' | 'daily' | 'hourly';

  // For daily frequency
  daily_time?: string;        // "06:00" (UTC or location timezone)

  // For hourly frequency
  hourly_minutes?: number;    // 0-59, minute of each hour to run

  // Auto-merge settings (Pro+ only)
  auto_merge_enabled: boolean;
  auto_merge_threshold: number;  // 95 default, range 90-100
}
```

**UI Configuration:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│  SCHEDULE                                                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Run this rule:  ( ) Manually only                                       │
│                  (●) On a schedule                                       │
│                                                                          │
│  Frequency:      [Daily ▾]                                               │
│                                                                          │
│  Time:           [6:00 AM ▾]  (America/New_York)                         │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────── │
│                                                                          │
│  AUTO-MERGE (Pro plan required)                                          │
│                                                                          │
│  ☐ Automatically merge high-confidence matches                          │
│                                                                          │
│  Threshold: [95%▾]  (Only matches at or above this score)                │
│                                                                          │
│  ⚠️ Auto-merged records can still be restored from History.             │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 8.5 Job Execution Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         JOB EXECUTION FLOW                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  TRIGGER                                                                 │
│  ├── Manual: User clicks [Scan Now]                                      │
│  ├── Scheduled: Cron job at configured time                              │
│  └── Webhook: GHL ContactCreate event (Pro+)                             │
│           │                                                              │
│           ▼                                                              │
│  ┌─────────────────────┐                                                 │
│  │  1. CHECK TIER      │  Verify user has permission for this trigger    │
│  └─────────────────────┘                                                 │
│           │                                                              │
│           ▼                                                              │
│  ┌─────────────────────┐                                                 │
│  │  2. DELTA SYNC      │  Fetch updated records from GHL (if stale)      │
│  └─────────────────────┘                                                 │
│           │                                                              │
│           ▼                                                              │
│  ┌─────────────────────┐                                                 │
│  │  3. RUN MATCHING    │  Execute match algorithm on cached records      │
│  └─────────────────────┘                                                 │
│           │                                                              │
│           ▼                                                              │
│  ┌─────────────────────┐                                                 │
│  │  4. SCORE & RANK    │  Calculate confidence scores, rank matches      │
│  └─────────────────────┘                                                 │
│           │                                                              │
│           ▼                                                              │
│  ┌─────────────────────┐                                                 │
│  │  5. STORE RESULTS   │  Save pending matches to DB                     │
│  └─────────────────────┘                                                 │
│           │                                                              │
│           ▼                                                              │
│  ┌─────────────────────┐                                                 │
│  │  6. AUTO-MERGE?     │  If enabled & score ≥ threshold                 │
│  └─────────────────────┘                                                 │
│           │                                                              │
│     ┌─────┴─────┐                                                        │
│     │           │                                                        │
│    Yes          No                                                       │
│     │           │                                                        │
│     ▼           ▼                                                        │
│  ┌─────────┐  ┌─────────────────┐                                        │
│  │ MERGE   │  │ AWAIT REVIEW    │                                        │
│  │ (auto)  │  │ (manual queue)  │                                        │
│  └─────────┘  └─────────────────┘                                        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 8.6 Job Status & History

**Job States:**

| State | Description |
|-------|-------------|
| `pending` | Queued, waiting to run |
| `running` | Currently executing |
| `completed` | Finished successfully |
| `failed` | Error occurred |
| `cancelled` | Manually cancelled |

**Job Record Schema:**

```sql
CREATE TABLE scan_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  rule_id UUID NOT NULL REFERENCES match_rules(id),

  -- Trigger info
  trigger_type TEXT NOT NULL,  -- 'manual', 'scheduled', 'webhook'
  triggered_by UUID,           -- user_id if manual

  -- Status
  status TEXT NOT NULL DEFAULT 'pending',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Results
  records_scanned INT DEFAULT 0,
  matches_found INT DEFAULT 0,
  auto_merged INT DEFAULT 0,

  -- Error handling
  error_message TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_scan_jobs_tenant_rule ON scan_jobs(tenant_id, rule_id);
CREATE INDEX idx_scan_jobs_status ON scan_jobs(status) WHERE status IN ('pending', 'running');
```

### 8.7 Webhook Integration (Pro+)

GHL sends inbound webhooks to MergeMatch when data changes. This enables real-time sync without polling.

**Webhook Configuration (one-time in Developer Portal):**

```
GHL Developer Portal (marketplace.gohighlevel.com)
└── My Apps → MergeMatch → Advanced Settings → Webhooks
    ├── Webhook URL: https://api.mergematch.app/webhooks/ghl
    ├── Subscribe to events:
    │   ├── ContactCreate, ContactUpdate, ContactDelete
    │   ├── OpportunityCreate, OpportunityUpdate, OpportunityDelete
    │   └── RecordCreate, RecordUpdate, RecordDelete
    └── Secret Key: (auto-generated, used for HMAC verification)
```

**Runtime Flow:**

```
┌─────────────────┐                    ┌─────────────────┐
│      GHL        │ ── HTTP POST ──>   │   MergeMatch    │
│ (source of truth)     webhook        │   (our app)     │
└─────────────────┘                    └─────────────────┘
        │                                      │
        └── X-HighLevel-Signature header       └── Verify HMAC → Update cache
```

**Supported GHL Webhooks:**

| Webhook | Action |
|---------|--------|
| `ContactCreate` | Add to cache, trigger match scan against existing records |
| `ContactUpdate` | Update cache, re-scan if matching fields changed |
| `ContactDelete` | Remove from cache, clean up any pending matches |
| `ContactDndUpdate` | Update cache (no scan triggered) |
| `ContactTagUpdate` | Update cache (no scan triggered) |

**Also available for other objects (Pro+):**

| Object | Webhooks |
|--------|----------|
| Opportunities | `OpportunityCreate`, `OpportunityUpdate`, `OpportunityDelete` |
| Custom Objects | `RecordCreate`, `RecordUpdate`, `RecordDelete` |

**Webhook Handler Flow:**

```
GHL Webhook → Render Backend → Validate → Update Cache → Queue Scan (if needed)
                                  │
                                  └── Verify:
                                      • Valid webhook signature
                                      • Tenant exists & active
                                      • Pro+ tier (webhooks gated)
                                      • Webhook type enabled for tenant
```

**Real-Time Matching (ContactCreate/Update):**

When a contact is created or updated:
1. Update local cache with new/changed data
2. Check if any matching-relevant fields changed (email, phone, name)
3. If yes, run match scan against existing contacts (not full scan)
4. If matches found, add to pending queue
5. If auto-merge enabled and score ≥ threshold, merge immediately

**Delta Sync Strategy by Tier:**

| Tier | Real-Time (Webhooks) | Scheduled (API Poll) |
|------|---------------------|---------------------|
| Free | ❌ | ❌ (initial sync only) |
| Starter | ❌ | ✅ Daily |
| Pro | ✅ All webhooks | ✅ Hourly (backup) |
| Agency | ✅ All webhooks | ✅ Hourly (backup) |

Pro+ keeps hourly polling as a backup in case webhooks are missed.

### 8.8 Queue System

Using **BullMQ** with Redis for job queue management:

```typescript
// Job queue configuration
const scanQueue = new Queue('scan-jobs', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: 100,  // Keep last 100 completed
    removeOnFail: 50,       // Keep last 50 failed
  },
});

// Worker processing
const worker = new Worker('scan-jobs', async (job) => {
  const { tenantId, ruleId, triggerType } = job.data;

  // Update status to running
  await updateJobStatus(job.id, 'running');

  // Execute scan
  const result = await executeScan(tenantId, ruleId);

  // Handle auto-merge if enabled
  if (result.autoMergeEnabled) {
    await processAutoMerge(result.highConfidenceMatches);
  }

  return result;
}, { connection: redis, concurrency: 5 });
```

### 8.9 Rate Limiting & Throttling

**Per-Tenant Limits:**

| Limit | Value | Rationale |
|-------|-------|-----------|
| Concurrent jobs | 2 per tenant | Prevent resource hogging |
| Manual scans (Free) | 1 per day | Encourage upgrade |
| Manual syncs (Free) | 1 per day | Encourage upgrade |
| API burst | 100 req/10s | GHL limit |

**Global Limits:**

| Limit | Value | Rationale |
|-------|-------|-----------|
| Total concurrent workers | 10 | Render resource limits |
| Queue depth alert | 100 | Monitor backlog |

### 8.10 Scheduled Job Runner

Using **node-cron** or Render Cron Jobs:

```typescript
// Daily job scheduler (runs every minute, checks for due jobs)
cron.schedule('* * * * *', async () => {
  const now = new Date();
  const currentHour = now.getUTCHours();
  const currentMinute = now.getUTCMinutes();

  // Find rules due to run
  const dueRules = await db.query(`
    SELECT r.*, s.daily_time, s.hourly_minutes, s.frequency
    FROM match_rules r
    JOIN match_rule_schedules s ON r.id = s.rule_id
    WHERE s.enabled = true
      AND (
        (s.frequency = 'hourly' AND s.hourly_minutes = $1)
        OR (s.frequency = 'daily' AND s.daily_time = $2)
      )
      AND r.last_run_at < now() - interval '30 minutes'
  `, [currentMinute, `${currentHour}:${currentMinute}`]);

  // Queue each job
  for (const rule of dueRules) {
    await scanQueue.add('scheduled-scan', {
      tenantId: rule.tenant_id,
      ruleId: rule.id,
      triggerType: 'scheduled',
    });
  }
});
```

### 8.11 Job Notifications

**In-App Notifications:**

| Event | Notification |
|-------|--------------|
| Scan complete | "Scan found 12 new matches" (toast) |
| Auto-merge complete | "Auto-merged 5 high-confidence duplicates" |
| Scan failed | "Scan failed: [error message]" (persistent) |

**Future: Email Notifications (Post-MVP)**

| Event | Email |
|-------|-------|
| Weekly summary | "This week: 47 duplicates found, 32 merged" |
| Scan failure | "Your scheduled scan failed" |

### 8.12 Effort Breakdown

| Task | Hours | Notes |
|------|-------|-------|
| Queue system setup (BullMQ + Redis) | 8h | |
| Scan job worker | 12h | Core matching execution |
| Scheduler service | 6h | Cron + due job detection |
| Auto-merge logic | 8h | Threshold check, batch merge |
| Webhook handler | 8h | GHL webhook processing |
| Rate limiting | 4h | Per-tenant throttling |
| Job status API | 6h | CRUD for job history |
| Error handling & retries | 4h | |
| Testing | 4h | |
| **Total** | **60h** | |

---

## 9. Phase 5: Multi-Object Support

### 9.1 Phase Overview

| Attribute | Value |
|-----------|-------|
| **Duration** | 2 weeks |
| **Team** | 1 Backend Engineer |
| **Dependencies** | Phase 1-4 complete |
| **Exit Criteria** | Companies, Opportunities, Custom Objects matching working |

### 9.2 Supported Object Types

| Object | GHL API | Tier | Matching Use Case |
|--------|---------|------|-------------------|
| **Contacts** | `/contacts` | All | Duplicate people |
| **Companies** | `/businesses` | Starter+ | Duplicate companies |
| **Opportunities** | `/opportunities` | Pro+ | Duplicate deals for same contact |
| **Custom Objects** | `/objects/records` | Pro+ | Any custom entity |

### 9.3 Object Schemas

#### Companies (Businesses)

```typescript
interface GHLBusiness {
  id: string;
  name: string;              // Primary matching field
  phone?: string;
  email?: string;            // Matching field
  website?: string;          // Domain matching
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  description?: string;
  locationId: string;
  createdAt: string;
  updatedAt: string;
}
```

**Recommended Matching Fields:**
| Field | Match Type | Weight |
|-------|------------|--------|
| `name` | Fuzzy (Jaro-Winkler) | High |
| `email` | Exact (normalized) | High |
| `website` | Domain extraction + exact | High |
| `phone` | Normalized | Medium |

#### Opportunities

```typescript
interface GHLOpportunity {
  id: string;
  name: string;              // Deal name
  monetaryValue?: number;
  pipelineId: string;
  pipelineStageId: string;
  status: 'open' | 'won' | 'lost' | 'abandoned';
  contactId?: string;        // Linked contact
  assignedTo?: string;
  source?: string;
  customFields?: CustomField[];
  locationId: string;
  createdAt: string;
  updatedAt: string;
}
```

**Matching Considerations:**
- Usually match within same `contactId` (find duplicate deals for same person)
- Or match by `name` + `monetaryValue` across contacts
- Pipeline/stage context matters

#### Custom Objects

```typescript
interface GHLCustomObject {
  id: string;
  objectKey: string;         // Schema identifier
  locationId: string;
  properties: Record<string, any>;  // Dynamic based on schema
  createdAt: string;
  updatedAt: string;
}
```

**Dynamic Schema Discovery:**
1. Fetch object schema via `/objects/schema/{key}`
2. Identify matchable fields (text, email, phone types)
3. Let user select which fields to match on

### 9.4 Matching Algorithm Adjustments

**Per-Object Match Field Presets:**

| Object | Default Matching Strategy |
|--------|---------------------------|
| Contacts | Email (exact) + Name (fuzzy) + Phone (normalized) |
| Companies | Name (fuzzy) + Domain (exact) + Phone (normalized) |
| Opportunities | Name (fuzzy) + Value (exact) within same Contact |
| Custom | User-selected fields based on schema |

**Company-Specific: Domain Extraction**

```typescript
function extractDomain(website: string): string {
  // "https://www.microsoft.com/products" → "microsoft.com"
  const url = new URL(website);
  return url.hostname.replace(/^www\./, '');
}

// Also check email domain
function emailDomain(email: string): string {
  // "john@microsoft.com" → "microsoft.com"
  return email.split('@')[1]?.toLowerCase();
}
```

### 9.5 Merge Strategy Differences

| Object | Related Records to Transfer | Special Handling |
|--------|----------------------------|------------------|
| **Contacts** | Notes, Tasks, Opportunities, Appointments | Workflows may reference contactId |
| **Companies** | Contacts (re-link), Notes | Contacts need businessId updated |
| **Opportunities** | Notes, Tasks | Check pipeline constraints |
| **Custom Objects** | Associations/Relations | Handle via Associations API |

**Company Merge - Contact Re-linking:**

When merging Company A ← Company B:
1. Find all contacts where `businessId = B`
2. Update each contact to `businessId = A`
3. Delete Company B

```typescript
async function mergeCompanies(masterId: string, duplicateId: string) {
  // 1. Get contacts linked to duplicate
  const linkedContacts = await ghl.getContactsByBusinessId(duplicateId);

  // 2. Re-link to master
  for (const contact of linkedContacts) {
    await ghl.updateContact(contact.id, { businessId: masterId });
  }

  // 3. Delete duplicate company
  await ghl.deleteBusiness(duplicateId);
}
```

### 9.6 API Endpoints by Object

| Object | List | Get | Update | Delete | Search |
|--------|------|-----|--------|--------|--------|
| Contacts | ✅ | ✅ | ✅ | ✅ | ✅ Advanced |
| Companies | ✅ | ✅ | ✅ | ✅ | ❌ (list only) |
| Opportunities | ✅ | ✅ | ✅ | ✅ | ✅ Advanced |
| Custom Objects | ✅ | ✅ | ✅ | ✅ | ✅ |

**Note:** Companies don't have advanced search - must fetch all and filter locally.

### 9.7 Cache Tables

```sql
-- Companies cache
CREATE TABLE company_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  ghl_business_id TEXT NOT NULL,
  location_id TEXT NOT NULL,
  data JSONB NOT NULL,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, ghl_business_id)
);

-- Opportunities cache
CREATE TABLE opportunity_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  ghl_opportunity_id TEXT NOT NULL,
  location_id TEXT NOT NULL,
  contact_id TEXT,  -- For filtering matches within same contact
  data JSONB NOT NULL,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, ghl_opportunity_id)
);

-- Custom objects cache (multi-schema)
CREATE TABLE custom_object_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  object_key TEXT NOT NULL,      -- Schema key (e.g., "vehicles", "properties")
  ghl_record_id TEXT NOT NULL,
  location_id TEXT NOT NULL,
  data JSONB NOT NULL,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, object_key, ghl_record_id)
);

-- Custom object schemas (cached)
CREATE TABLE custom_object_schemas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  object_key TEXT NOT NULL,
  schema JSONB NOT NULL,         -- Field definitions
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, object_key)
);
```

### 9.8 Match Rule Configuration Updates

Extend Match Rule to support object type:

```typescript
interface MatchRule {
  id: string;
  tenant_id: string;
  name: string;

  // NEW: Object type selector
  object_type: 'contact' | 'company' | 'opportunity' | 'custom';
  custom_object_key?: string;  // Required if object_type = 'custom'

  // Field configuration (dynamic based on object_type)
  match_fields: MatchField[];

  // Existing fields...
  merge_strategy_id: string;
  schedule: MatchRuleSchedule;
}
```

**UI: Object Type Selector**

```
┌─────────────────────────────────────────────────────────────────────────┐
│  CREATE MATCH RULE                                                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Rule Name:        [                                        ]            │
│                                                                          │
│  Object Type:      (●) Contacts                                          │
│                    ( ) Companies        (Starter+ required)              │
│                    ( ) Opportunities    (Pro+ required)                  │
│                    ( ) Custom Object    (Pro+ required)                  │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────── │
│                                                                          │
│  [Custom Object selected]                                                │
│                                                                          │
│  Select Object:    [Vehicles          ▾]                                 │
│                    [Properties        ▾]                                 │
│                    [Inventory Items   ▾]                                 │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 9.9 Webhooks by Object

| Object | Create | Update | Delete |
|--------|--------|--------|--------|
| Contacts | `ContactCreate` | `ContactUpdate` | `ContactDelete` |
| Companies | `RecordCreate` | `RecordUpdate` | `RecordDelete` |
| Opportunities | `OpportunityCreate` | `OpportunityUpdate` | `OpportunityDelete` |
| Custom Objects | `RecordCreate` | `RecordUpdate` | `RecordDelete` |

**Note:** Companies and Custom Objects share the `Record*` webhooks. The webhook payload includes a `type` field to distinguish between object types.

### 9.10 Tier Gating

```typescript
function canAccessObjectType(tier: Tier, objectType: ObjectType): boolean {
  const access = {
    contact: ['free', 'starter', 'pro', 'agency'],
    company: ['starter', 'pro', 'agency'],
    opportunity: ['pro', 'agency'],
    custom: ['pro', 'agency'],
  };
  return access[objectType].includes(tier);
}
```

### 9.11 Effort Breakdown

| Task | Hours | Notes |
|------|-------|-------|
| Company sync + cache | 6h | List API, no search |
| Company matching logic | 6h | Domain extraction, fuzzy name |
| Company merge (with contact re-link) | 6h | |
| Opportunity sync + cache | 6h | |
| Opportunity matching logic | 4h | Within-contact matching |
| Opportunity merge | 4h | Simpler than contacts |
| Custom Object schema discovery | 6h | Dynamic field detection |
| Custom Object sync + cache | 6h | |
| Custom Object matching | 4h | User-selected fields |
| Custom Object merge | 4h | Associations handling |
| Tier gating | 2h | |
| **Total** | **50h** | |

---

## 10. Phase 6: Frontend MVP

### 10.1 Phase Overview

| Attribute | Value |
|-----------|-------|
| **Duration** | 4 weeks |
| **Team** | 1-2 Frontend Engineers |
| **Dependencies** | Phase 1-5 backend complete |
| **Exit Criteria** | Full embedded GHL app working |

### 10.2 Frontend Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     FRONTEND ARCHITECTURE                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                         TECH STACK                                  ││
│  │                                                                     ││
│  │  • Framework: React 18 + TypeScript                                 ││
│  │  • Build: Vite                                                      ││
│  │  • Styling: Tailwind CSS + Shadcn/UI                                ││
│  │  • State: TanStack Query (server state) + Zustand (client state)    ││
│  │  • Tables: TanStack Table                                           ││
│  │  • Forms: React Hook Form + Zod                                     ││
│  │  • Routing: React Router v6                                         ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                       COMPONENT STRUCTURE                           ││
│  │                                                                     ││
│  │  src/                                                               ││
│  │  ├── components/                                                    ││
│  │  │   ├── ui/              # Shadcn components (button, input, etc) ││
│  │  │   ├── layout/          # Shell, sidebar, header                 ││
│  │  │   ├── dashboard/       # Overview widgets, charts               ││
│  │  │   ├── duplicates/      # Review queue, match cards              ││
│  │  │   ├── merge/           # Preview modal, field selector          ││
│  │  │   ├── rules/           # Rule list, rule editor                 ││
│  │  │   ├── jobs/            # Job list, job editor, history          ││
│  │  │   └── settings/        # Tenant settings, branding              ││
│  │  ├── hooks/               # Custom hooks                           ││
│  │  ├── lib/                 # Utilities                              ││
│  │  ├── services/            # API client                             ││
│  │  ├── stores/              # Zustand stores                         ││
│  │  ├── types/               # TypeScript types                       ││
│  │  └── pages/               # Route components                       ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                       GHL EMBEDDING                                 ││
│  │                                                                     ││
│  │  • App loads in iframe within GHL sidebar                           ││
│  │  • Receives locationId and access token via postMessage             ││
│  │  • Responsive design for GHL's embedded app dimensions              ││
│  │  • Dark mode support (match GHL theme)                              ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 10.3 Terminology

| Term | Definition | Example |
|------|------------|---------|
| **Match Rule** | Configuration for finding duplicates | "Email + Name Match" |
| **Merge Strategy** | Configuration for how to merge (attached to Match Rule) | "Most Complete Master, Copy Notes" |
| **Bulk Merge Job** | A scheduled/manual run of a Match Rule | "Daily 6am job" or "Run Now" |
| **Merge** | A single merge action (one master ← one or more duplicates) | "John Smith ← Jon Smith" |

### 10.4 Screen Specifications

#### 10.4.1 Dashboard (`/`)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  HEADER                                                                  │
│                                                                          │
│  Location: loc_abc123 • Acme Agency          ● Connected    [Feedback]  │
│                                                        [Starter] [Upgrade]│
│                                                                          │
│                                            [🔄 Refresh Data]             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  DATA SYNC                                           Last sync: 2 min ago│
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  ● Contacts: 12,847 synced    ● Companies: 1,204 synced   [Sync Now]││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  🔒 FREE TIER: 2 of 3 merges remaining. [Upgrade for unlimited →]       │
│                                                                          │
│  SUMMARY METRICS                                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  OBJECTS              RECORDS        MERGED (7d)    MERGED (all)    ││
│  │  ─────────────────────────────────────────────────────────────────  ││
│  │  ● Contacts           12,847              47             312        ││
│  │  ● Companies           1,204               3              18        ││
│  │  ○ Opportunities      (Pro plan)          -               -        ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ACTIVE MATCH RULES                                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                                                                     ││
│  │  Rule Name                    Next Run          Pending             ││
│  │  ───────────────────────────────────────────────────────────────── ││
│  │  Email + Name Match →         Tomorrow 6am         23               ││
│  │  Phone Number Match →         Tomorrow 6am         12               ││
│  │  Company Domain Match →       - (manual)            5               ││
│  │                                                                     ││
│  │  [+ Create Match Rule]                                              ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  RECENT MERGES                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                                                                     ││
│  │  Master Record              Merged From       When         Status   ││
│  │  ───────────────────────────────────────────────────────────────── ││
│  │  John Smith                 ← Jon Smith       2:34 PM      [View]  ││
│  │  jane@acme.com              ← jane.d@acme     1:12 PM      [View]  ││
│  │  Acme Corporation           ← 2 duplicates    Yesterday    [View]  ││
│  │  mike@test.com              ← mikey@test      Yesterday    [View]  ││
│  │  Sarah Johnson              ← S. Johnson      Dec 23       [View]  ││
│  │                                                                     ││
│  │  [View All History →]                                               ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Header Components:**

| Element | Description |
|---------|-------------|
| Location ID | `loc_abc123` - GHL location identifier |
| Subaccount Name | Whitelabeled agency/location name |
| Auth Status | ● Connected (green) / ● Reconnect Required (yellow) |
| Feedback Button | Opens embedded GHL form (hosted in agency subaccount) |
| Plan Badge | Current tier (Free/Starter/Pro/Agency) |
| Upgrade Button | Opens upgrade flow (hidden if on Agency plan) |
| Refresh Data | Legacy - replaced by DATA SYNC section below |

**Data Sync Section:**

| Element | Description |
|---------|-------------|
| Object counts | Shows synced record count per object type |
| Last sync | Relative time since last successful sync |
| [Sync Now] | Triggers delta sync (Free: 1/day, Paid: unlimited) |

**Sync States:**
- Idle: Shows last sync time
- Syncing: "Syncing... 45%" with progress bar
- Error: "Sync failed - [Retry]" with error details

**Free Tier Banner:**
- Shows remaining merges: "2 of 3 merges remaining"
- Visible only to Free tier users
- Links to upgrade flow
- Hidden once upgraded to paid tier

**Summary Metrics:**

| Column | Description |
|--------|-------------|
| Objects | Object type with status indicator (● active, ○ coming soon) |
| Records | Total records synced from GHL for this object |
| Merged (7d) | Merges completed in last 7 days |
| Merged (all) | All-time merge count |

**Active Match Rules:**

| Column | Description |
|--------|-------------|
| Rule Name → | Clickable link to Match Rule Detail page (`/match-rules/:id`) |
| Next Run | Next scheduled scan time, or "-" if manual only |
| Pending | Pending matches awaiting review/merge |

> **Note:** Click rule name to access all controls (scan, merge, review) on the Match Rule Detail page.

**Recent Merges:**

| Column | Description |
|--------|-------------|
| Master Record | Primary identifier of the surviving record |
| Merged From | Duplicate(s) that were merged in |
| When | Relative timestamp |
| Status | [View] opens Merge Detail screen |

**Merge Detail Screen (modal/slide-over):**

```
┌─────────────────────────────────────────────────────────────────────────┐
│  MERGE DETAIL                                              [✕ Close]   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Master Record: John Smith (john@acme.com)                               │
│  Merged: Dec 24, 2024 at 2:34 PM                                        │
│  Executed by: Auto-merge (95% confidence)                               │
│  Match Rule: Email + Name Match                                          │
│  Rollback expires: Dec 31, 2024                                         │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  MERGED RECORDS                                                     ││
│  │                                                                     ││
│  │  ┌─────────────────────────┐                                        ││
│  │  │ Jon Smith (deleted)     │                                        ││
│  │  │ jon.smith@acme.com      │                                        ││
│  │  │ +1 555-0123             │                                        ││
│  │  │ Created: Jan 15, 2024   │                                        ││
│  │  └─────────────────────────┘                                        ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  FIELD RESOLUTION                                                   ││
│  │                                                                     ││
│  │  Field           Master Value      Duplicate Value    Result        ││
│  │  ─────────────────────────────────────────────────────────────────  ││
│  │  First Name      John              Jon                John ✓        ││
│  │  Last Name       Smith             Smith              Smith ✓       ││
│  │  Email           john@acme.com     jon.smith@acme     john@acme ✓   ││
│  │  Phone           (empty)           +1 555-0123        +1 555-0123 ✓ ││
│  │  Company         Acme Inc          (empty)            Acme Inc ✓    ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  RELATED RECORDS TRANSFERRED                                        ││
│  │                                                                     ││
│  │  ✓ 3 notes copied to master                                         ││
│  │  ✓ 1 task copied to master                                          ││
│  │  ✓ 2 opportunities retained (from master)                           ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                                          [🔄 Restore This Merge]    ││
│  │                                                                     ││
│  │  ⚠️ Restoring will recreate the duplicate with a new GHL ID.       ││
│  │     Copied notes/tasks will remain on master (may cause duplicates).││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

#### 10.4.2 Match Rules List Page (`/match-rules`)

Overview page listing all Match Rules with quick stats. Click any rule to access the full detail page.

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Match Rules                                                             │
│                                                                          │
│  [+ New Match Rule]                           [View Merge Strategies]    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │ 📋 Email + Phone Match →                                            ││
│  │                                                                     ││
│  │ Object: Contacts  |  Strategy: Standard Contact Merge               ││
│  │ Schedule: Daily 6am  |  Last scan: 2h ago                           ││
│  │ Pending: 47 matches  |  Total merged: 312                           ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │ 📋 Company Domain Match →                                           ││
│  │                                                                     ││
│  │ Object: Companies  |  Strategy: Most Recent Wins                    ││
│  │ Schedule: Manual only  |  Last scan: 1d ago                         ││
│  │ Pending: 12 matches  |  Total merged: 45                            ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │ 📋 Phone Number Match →                                             ││
│  │                                                                     ││
│  │ Object: Contacts  |  Strategy: Standard Contact Merge               ││
│  │ Schedule: Daily 6am  |  Last scan: 2h ago                           ││
│  │ Pending: 5 matches  |  Total merged: 89                             ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Page Elements:**

| Element | Description |
|---------|-------------|
| [+ New Match Rule] | Opens Create Match Rule page (`/match-rules/new`) |
| [View Merge Strategies] | Opens Merge Strategies page (`/merge-strategies`) |
| Rule Card → | Clickable card - navigates to Match Rule Detail page (`/match-rules/:id`) |

---

#### 10.4.3 Merge Strategies Page (`/merge-strategies`)

Manages reusable merge configurations. Accessed from Match Rules page.

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ← Match Rules                                                           │
│                                                                          │
│  Merge Strategies                                 [+ New Merge Strategy] │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  CONTACTS                                                                │
│  ─────────────────────────────────────────────────────────────────────── │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │ Standard Contact Merge                                      [Edit]  ││
│  │                                                                     ││
│  │ Master: Most complete  |  Conflicts: Prefer master                  ││
│  │ Notes: Copy all  |  Tasks: Copy all  |  Opps: Keep all              ││
│  │                                                                     ││
│  │ Used by:                                                            ││
│  │ • Email + Phone Match                                               ││
│  │ • Name + Address Match                                              ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │ Most Recent Wins                                            [Edit]  ││
│  │                                                                     ││
│  │ Master: Most recent activity  |  Conflicts: Most recent             ││
│  │ Notes: Copy all  |  Tasks: Copy all  |  Opps: Keep all              ││
│  │                                                                     ││
│  │ Used by:                                                            ││
│  │ • (none)                                                    [Delete]││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  COMPANIES                                                               │
│  ─────────────────────────────────────────────────────────────────────── │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │ Company Standard                                            [Edit]  ││
│  │                                                                     ││
│  │ Master: Most complete  |  Conflicts: Prefer master                  ││
│  │                                                                     ││
│  │ Used by:                                                            ││
│  │ • Company Domain Match                                              ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────── │
│  No strategies for: Opportunities, Custom Objects                        │
│  (Create a Match Rule to add strategies for these objects)               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Page Elements:**

| Element | Description |
|---------|-------------|
| ← Match Rules | Back navigation to Match Rules page |
| [+ New Merge Strategy] | Opens Create Merge Strategy page |
| Object Groups | Strategies organized by object type |
| [Edit] | Opens Edit Merge Strategy page (`/merge-strategies/:id/edit`) |
| [Delete] | Only shown if strategy is not used by any Match Rules |
| Used by | List of Match Rules using this strategy (one-to-many) |

**Deletion Rules:**
- Strategies with "Used by" links cannot be deleted
- Show error: "Cannot delete: This strategy is used by X Match Rules"
- User must reassign or delete Match Rules first

---

#### 10.4.4 Create/Edit Match Rule (`/match-rules/new`, `/match-rules/:id/edit`)

Full-page form for creating or editing a Match Rule.

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ← Match Rules                                                           │
│                                                                          │
│  Create Match Rule                                                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  STEP 1: MATCHING CRITERIA                                               │
│  ─────────────────────────────────────────────────────────────────────── │
│                                                                          │
│  Rule Name:  [Email + Phone Match                              ]         │
│  Object:     [Contacts ▾]                                                │
│                                                                          │
│  Match Fields:                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  Field           │  Match Type    │  Threshold   │                  ││
│  │  ────────────────────────────────────────────────────────────────── ││
│  │  [email ▾]       │  [Exact ▾]     │  100%        │            [×]   ││
│  │  [phone ▾]       │  [Fuzzy ▾]     │  [  85% ]    │            [×]   ││
│  └─────────────────────────────────────────────────────────────────────┘│
│  [+ Add Field]                                                           │
│                                                                          │
│  Match Logic:  ● All fields must match (AND)                             │
│                ○ Any field can match (OR)                                │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────── │
│                                                                          │
│  STEP 2: MERGE STRATEGY                                                  │
│  ─────────────────────────────────────────────────────────────────────── │
│                                                                          │
│  Select Strategy: [Standard Contact Merge ▾]             [+ Create New]  │
│                   ├─ Standard Contact Merge                              │
│                   ├─ Most Recent Wins                                    │
│                   └─ + Create New...                                     │
│                                                                          │
│  Preview:                                                                │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │ Master: Most complete  |  Conflicts: Prefer master                  ││
│  │ Notes: Copy all  |  Tasks: Copy all  |  Opps: Keep all              ││
│  │                                                        [Edit Strategy]│
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────── │
│                                                                          │
│  STEP 3: SCHEDULE                                                        │
│  ─────────────────────────────────────────────────────────────────────── │
│                                                                          │
│  ● Manual only (run via [Scan for Matches] button)                       │
│  ○ Scheduled:  [Daily ▾] at [6:00 AM ▾]                                  │
│                                                                          │
│  💡 Scheduled scans require Starter plan or higher.                      │
│                                                                          │
│                                                                          │
│                                            [Cancel]    [Save Match Rule] │
└─────────────────────────────────────────────────────────────────────────┘
```

**Form Behavior:**

| Action | Behavior |
|--------|----------|
| [+ Create New] strategy | Navigates to `/merge-strategies/new?returnTo=/match-rules/new` |
| [Edit Strategy] | Navigates to `/merge-strategies/:strategyId/edit?returnTo=/match-rules/:id/edit` |
| Save Match Rule | Validates all fields, saves, returns to Match Rules page |
| Cancel | Returns to Match Rules page (confirm if unsaved changes) |

**Validation Rules:**
- Rule Name: Required, max 100 chars
- Object: Required
- At least one Match Field required
- Merge Strategy: Required

---

#### 10.4.5 Create/Edit Merge Strategy (`/merge-strategies/new`, `/merge-strategies/:id/edit`)

Full-page form for creating or editing a Merge Strategy. **This is a shared component** used both standalone and from within Match Rule creation flow.

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ← Back                                                                  │
│                                                                          │
│  Edit Merge Strategy                                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Strategy Name: [Standard Contact Merge                        ]         │
│  Object:        Contacts  (locked when editing)                          │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────── │
│                                                                          │
│  MASTER SELECTION                                                        │
│  How should the primary (surviving) record be chosen?                    │
│                                                                          │
│  ● Most complete record (most fields populated)                          │
│  ○ Most recent activity (last updated)                                   │
│  ○ Oldest created (original record)                                      │
│  ○ Manual selection (require review for each match)                      │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────── │
│                                                                          │
│  FIELD CONFLICTS                                                         │
│  When both records have different values for the same field:             │
│                                                                          │
│  ● Prefer master record values                                           │
│  ○ Prefer most recently updated value                                    │
│  ○ Require manual review                                                 │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────── │
│                                                                          │
│  RELATED RECORDS                                                         │
│  How should associated records be handled during merge?                  │
│                                                                          │
│  Notes:                                                                  │
│  ● Copy all to master    ○ Don't copy                                    │
│                                                                          │
│  Tasks:                                                                  │
│  ● Copy all to master    ○ Don't copy                                    │
│                                                                          │
│  Opportunities:                                                          │
│  ● Keep all from both records                                            │
│  ○ Keep from master only                                                 │
│  ○ Keep highest monetary value                                           │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────── │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │ ⚠️ This strategy is used by 2 Match Rules:                         ││
│  │    • Email + Phone Match                                            ││
│  │    • Name + Address Match                                           ││
│  │                                                                     ││
│  │    Changes will affect ALL rules using this strategy.               ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│                                                                          │
│                              [Save as New]    [Cancel]    [Save]         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Form Behavior:**

| Action | Behavior |
|--------|----------|
| [Save] (editing, used by others) | Show confirmation dialog: "This will affect X Match Rules. Continue?" |
| [Save as New] | Prompts for new name, creates copy, returns to previous page |
| [Cancel] | Returns to `returnTo` URL or Merge Strategies page |
| Object dropdown | Locked/disabled when editing existing strategy |

**Confirmation Dialog (on Save when used by other rules):**

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Confirm Changes                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  This strategy is used by 2 Match Rules:                                 │
│                                                                          │
│  • Email + Phone Match                                                   │
│  • Name + Address Match                                                  │
│                                                                          │
│  Changes will apply to ALL future merges using these rules.              │
│                                                                          │
│  Alternatively, use "Save as New" to create a copy.                      │
│                                                                          │
│                                            [Cancel]    [Save Changes]    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

#### 10.4.6 Match Rule Detail Page (`/match-rules/:id`)

**The primary working page** for a specific Match Rule. All scan, review, and merge actions happen here.

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ← Match Rules                                                           │
│                                                                          │
│  Email + Phone Match                                          [Edit Rule]│
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  RULE CONFIGURATION                                                      │
│  ─────────────────────────────────────────────────────────────────────── │
│  Object: Contacts                                                        │
│  Fields: email (exact), phone (fuzzy 85%)                                │
│  Logic: All fields must match (AND)                                      │
│                                                                          │
│  Merge Strategy: [Standard Contact Merge ▾]              [Edit Strategy] │
│                  ├─ Standard Contact Merge                               │
│                  ├─ Most Recent Wins                                     │
│                  └─ + Create New...                                      │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────── │
│                                                                          │
│  BULK ACTIONS                                                            │
│  ─────────────────────────────────────────────────────────────────────── │
│                                                                          │
│  [🔍 Scan Now]       [▶ Merge All]          Schedule: [Daily 6am ▾]      │
│                                                                          │
│  Last scan: 2h ago (found 47 matches)                                    │
│  Next scheduled: Tomorrow 6:00 AM                                        │
│                                                                          │
│  💡 Scheduled scans require Starter plan or higher.  [Upgrade]           │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────── │
│                                                                          │
│  PENDING MATCHES (47)                                                    │
│  ─────────────────────────────────────────────────────────────────────── │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  John Smith ← Jon Smith                             98% confidence  ││
│  │  ─────────────────────────────────────────────────────────────────  ││
│  │  john@acme.com        │ jon.smith@acme.com                          ││
│  │  +1 555-0123          │ +1 555-0123                                 ││
│  │  Acme Inc             │ (empty)                                     ││
│  │                                                                     ││
│  │                                              [Review]    [Merge]    ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  jane@test.com ← jane.t@test.com                    91% confidence  ││
│  │  ─────────────────────────────────────────────────────────────────  ││
│  │  Jane Doe             │ Jane T. Doe                                 ││
│  │  (empty)              │ +1 555-9999                                 ││
│  │                                                                     ││
│  │                                              [Review]    [Merge]    ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  Acme Corp ← ACME Corporation ← Acme Inc            87% confidence  ││
│  │  ─────────────────────────────────────────────────────────────────  ││
│  │  3 records in this match group                      [Review]        ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  Showing 3 of 47  │  [Load More]                                         │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────── │
│                                                                          │
│  MERGE HISTORY (312)                                                     │
│  ─────────────────────────────────────────────────────────────────────── │
│                                                                          │
│  │ Master              │ Merged From      │ When       │ Actions        │
│  │─────────────────────────────────────────────────────────────────────│
│  │ Mike Johnson        │ ← M. Johnson     │ 1h ago     │ [View][Restore]│
│  │ sarah@company.com   │ ← 2 duplicates   │ 3h ago     │ [View][Restore]│
│  │ Bob Wilson          │ ← Robert Wilson  │ Yesterday  │ [View][Restore]│
│  │ test@example.com    │ ← test2@example  │ Dec 23     │ [View][Restore]│
│                                                                          │
│  [View Full History →]                                                   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Page Elements:**

| Element | Description |
|---------|-------------|
| [Edit Rule] | Opens Edit Match Rule page (`/match-rules/:id/edit`) |
| Merge Strategy dropdown | Change linked strategy; [Edit Strategy] opens strategy editor |
| [🔍 Scan Now] | Runs a scan immediately (see §10.5.1) |
| [▶ Merge All] | Merges all pending matches (shows confirmation modal) |
| Schedule dropdown | Set scan schedule (locked for Free tier) |
| [Review] | Opens Match Review page for detailed field comparison |
| [Merge] | Merges this match immediately (shows confirmation modal) |
| [View] | Opens Match Review page in read-only mode (for history) |
| [Restore] | Restores the merge (shows restore confirmation modal) |

**Match Card Display:**
- 2-record matches: Show side-by-side field preview inline
- 3+ record matches: Show summary, require [Review] to see details

---

#### 10.4.7 Match Review Page (`/match-rules/:id/review/:matchId`)

Full-page detailed view for reviewing a match group before merge, or viewing a completed merge.

**Pre-Merge Review (pending match):**

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ← Email + Phone Match                                                   │
│                                                                          │
│  Review Match                                              98% confidence│
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  FIELD COMPARISON                                                        │
│  ─────────────────────────────────────────────────────────────────────── │
│                                                                          │
│  Click any cell to select it as the value to keep.                       │
│                                                                          │
│             │ ★ MASTER            │ DUPLICATE 1         │ RESULT        │
│             │ John Smith          │ Jon Smith           │               │
│  ───────────┼─────────────────────┼─────────────────────┼─────────────  │
│  First Name │ [John]  ✓           │  Jon                │ John          │
│  Last Name  │ [Smith] ✓           │  Smith              │ Smith         │
│  Email      │ [john@acme.com] ✓   │  jon.smith@acme     │ john@acme.com │
│  Phone      │  (empty)            │ [+1 555-0123] ✓     │ +1 555-0123   │
│  Company    │ [Acme Inc] ✓        │  (empty)            │ Acme Inc      │
│  Tags       │ [lead, hot] ✓       │  prospect           │ lead, hot     │
│  Created    │  Jan 15, 2024       │  Mar 22, 2024       │ (metadata)    │
│  Updated    │  Dec 20, 2024       │  Dec 24, 2024       │ (metadata)    │
│  ───────────┴─────────────────────┴─────────────────────┴─────────────  │
│                                                                          │
│  LEGEND:                                                                 │
│  [Value] ✓ = Selected (will be kept)     Value = Not selected            │
│  (empty) = No value in record            ★ = Master record               │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────── │
│                                                                          │
│  RELATED RECORDS                                                         │
│  ─────────────────────────────────────────────────────────────────────── │
│                                                                          │
│  From "Jon Smith" (will be copied to master):                            │
│  • 3 notes                                                               │
│  • 1 task (due tomorrow)                                                 │
│  • 2 opportunities ($5,400 total value)                                  │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────── │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │ ⚠️ MERGE WARNING                                                   ││
│  │                                                                     ││
│  │ "Jon Smith" will be PERMANENTLY DELETED from GoHighLevel.           ││
│  │ Notes/tasks will be copied to master with new IDs.                  ││
│  │                                                                     ││
│  │ ☐ Do not show this warning again                                    ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│                                                [Cancel]  [Confirm Merge] │
└─────────────────────────────────────────────────────────────────────────┘
```

**3+ Record Match (horizontal columns):**

```
│             │ ★ MASTER      │ DUPLICATE 1   │ DUPLICATE 2   │ RESULT     │
│             │ Acme Corp     │ ACME Corp.    │ Acme Inc      │            │
│  ───────────┼───────────────┼───────────────┼───────────────┼──────────  │
│  Name       │ [Acme Corp] ✓ │  ACME Corp.   │  Acme Inc     │ Acme Corp  │
│  Domain     │ [acme.com] ✓  │  acme.com     │  (empty)      │ acme.com   │
│  Phone      │  (empty)      │ [555-1234] ✓  │  555-1234     │ 555-1234   │
│  Address    │  (empty)      │  (empty)      │ [123 Main] ✓  │ 123 Main   │
```

**Post-Merge View (history):**

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ← Email + Phone Match                                                   │
│                                                                          │
│  Merge Details                                          Merged 1h ago    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ... (same field comparison table, but read-only) ...                    │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────── │
│                                                                          │
│  MERGE INFO                                                              │
│  ─────────────────────────────────────────────────────────────────────── │
│  Executed: Dec 24, 2024 at 2:34 PM                                       │
│  Method: Manual merge                                                    │
│  Match Rule: Email + Phone Match                                         │
│  Rollback expires: Dec 31, 2024                                          │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────── │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │ ⚠️ RESTORE LIMITATIONS                                             ││
│  │                                                                     ││
│  │ • Duplicate will be recreated with a NEW GHL ID                     ││
│  │ • Notes/tasks copied during merge will remain on master             ││
│  │ • Original timestamps cannot be recovered                           ││
│  │                                                                     ││
│  │ ☐ Do not show this warning again                                    ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│                                                  [Cancel]    [Restore]   │
└─────────────────────────────────────────────────────────────────────────┘
```

**Interaction Details:**

| Element | Behavior |
|---------|----------|
| Field cell click | Selects that cell's value for the RESULT column |
| ✓ indicator | Shows which cell is currently selected per field |
| Default selection | Based on Merge Strategy (most complete, most recent, etc.) |
| Master badge (★) | Indicates the surviving record |
| RESULT column | Live preview of final merged record |

---

#### 10.4.8 Confirmation Modals

**Individual Merge Confirmation:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Confirm Merge                                                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Merge "Jon Smith" into "John Smith"?                                    │
│                                                                          │
│  • 3 notes, 1 task will be copied to master                              │
│  • "Jon Smith" will be permanently deleted                               │
│                                                                          │
│  ☐ Do not warn me again for individual merges                            │
│                                                                          │
│                                              [Cancel]    [Confirm Merge] │
└─────────────────────────────────────────────────────────────────────────┘
```

**Bulk Merge Confirmation:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Merge All Pending Matches                                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Merge 47 match groups using "Standard Contact Merge" strategy?          │
│                                                                          │
│  This will:                                                              │
│  • Delete 52 duplicate records                                           │
│  • Copy associated notes/tasks to master records                         │
│                                                                          │
│  ⚠️ This action cannot be easily undone. Rollback has limitations.      │
│                                                                          │
│  ☐ Do not warn me again for bulk merges                                  │
│                                                                          │
│                                            [Cancel]    [Execute Merges]  │
└─────────────────────────────────────────────────────────────────────────┘
```

**Restore Confirmation:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Restore Merge                                                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Recreate "Jon Smith" as a separate contact?                             │
│                                                                          │
│  Limitations:                                                            │
│  • Will have a NEW GHL contact ID                                        │
│  • Notes/tasks copied during merge remain on master                      │
│  • Original timestamps cannot be recovered                               │
│                                                                          │
│  ☐ Do not warn me again for restores                                     │
│                                                                          │
│                                                [Cancel]    [Restore]     │
└─────────────────────────────────────────────────────────────────────────┘
```

**"Do Not Warn Again" Preferences:**

Stored per-user in Settings. Three separate toggles:
- `skip_individual_merge_warning`: boolean
- `skip_bulk_merge_warning`: boolean
- `skip_restore_warning`: boolean

Users can reset these in Settings → Preferences.

---

### 10.5 UX Flows

#### 10.5.1 Scan for Matches Flow

When user clicks [🔍 Scan Now] on Match Rule Detail page:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│  1. User clicks [🔍 Scan Now]                                            │
│                    ↓                                                     │
│  2. Button changes to [Scanning...] with spinner                         │
│     (Page remains usable, scan runs in background)                       │
│                    ↓                                                     │
│  3. When complete:                                                       │
│     ┌─────────────────────────────────────────────────────────────────┐  │
│     │ ✓ Scan complete                                                 │  │
│     │   Found 12 new matches (47 total pending)                       │  │
│     │   Scanned 12,847 records in 4.2 seconds                         │  │
│     │                                              [Dismiss]          │  │
│     └─────────────────────────────────────────────────────────────────┘  │
│                    ↓                                                     │
│  4. PENDING MATCHES section refreshes with new matches                   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

#### 10.5.2 Merge Flow (Individual)

When user clicks [Merge] on a match card:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│  1. User clicks [Merge]                                                  │
│                    ↓                                                     │
│  2. If warnings enabled: Show Individual Merge Confirmation modal        │
│     If warnings disabled: Skip to step 3                                 │
│                    ↓                                                     │
│  3. User clicks [Confirm Merge]                                          │
│                    ↓                                                     │
│  4. Button changes to [Merging...] with spinner                          │
│                    ↓                                                     │
│  5. API calls execute:                                                   │
│     a. Update master with merged field values                            │
│     b. Copy notes/tasks from duplicate to master                         │
│     c. Delete duplicate contact                                          │
│     d. Store rollback snapshot                                           │
│                    ↓                                                     │
│  6. Success toast:                                                       │
│     ┌─────────────────────────────────────────────────────────────────┐  │
│     │ ✓ Merge complete                                                │  │
│     │   "Jon Smith" merged into "John Smith"                          │  │
│     │                                       [View Details] [Dismiss]  │  │
│     └─────────────────────────────────────────────────────────────────┘  │
│                    ↓                                                     │
│  7. Match card moves from PENDING to MERGE HISTORY                       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

#### 10.5.3 Bulk Merge Flow

When user clicks [▶ Merge All]:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│  1. User clicks [▶ Merge All]                                            │
│                    ↓                                                     │
│  2. Show Bulk Merge Confirmation modal (unless disabled)                 │
│                    ↓                                                     │
│  3. User clicks [Execute Merges]                                         │
│                    ↓                                                     │
│  4. Progress indicator appears:                                          │
│     ┌─────────────────────────────────────────────────────────────────┐  │
│     │ Merging 47 match groups...                                      │  │
│     │ ████████████░░░░░░░░  24 of 47 complete                         │  │
│     │                                                        [Cancel] │  │
│     └─────────────────────────────────────────────────────────────────┘  │
│                    ↓                                                     │
│  5. On complete (or partial failure):                                    │
│     ┌─────────────────────────────────────────────────────────────────┐  │
│     │ ✓ Bulk merge complete                                           │  │
│     │   45 successful, 2 failed                                       │  │
│     │   52 duplicates deleted                                         │  │
│     │                                       [View Failures] [Dismiss] │  │
│     └─────────────────────────────────────────────────────────────────┘  │
│                    ↓                                                     │
│  6. PENDING MATCHES clears, MERGE HISTORY updates                        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

#### 10.4.9 History Page (`/history`)

Full merge history across all Match Rules. Same layout as Match Rule Detail history section, but includes rule column.

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Merge History                                                           │
│                                                                          │
│  Filter: [All Rules ▾]  [All Objects ▾]  [Last 30 days ▾]   [🔍 Search] │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  │ Master              │ Merged From    │ Rule           │ When   │     │
│  │─────────────────────────────────────────────────────────────────────│
│  │ John Smith          │ ← Jon Smith    │ Email+Phone →  │ 1h ago │[View][Restore]│
│  │ jane@test.com       │ ← jane.t@test  │ Email+Phone →  │ 2h ago │[View][Restore]│
│  │ Acme Corp           │ ← 2 duplicates │ Domain Match → │ 3h ago │[View][Restore]│
│  │ Mike Johnson        │ ← M. Johnson   │ Email+Phone →  │ 5h ago │[View][Restore]│
│  │ sarah@company.com   │ ← 2 duplicates │ Phone Match →  │ Yesterday │[View][Restore]│
│  │ Bob Wilson          │ ← Robert Wilson│ Email+Phone →  │ Yesterday │[View][Restore]│
│  │ test@example.com    │ ← test2@example│ Email+Phone →  │ Dec 23 │[View][Restore]│
│  │ Widget Inc          │ ← Widget LLC   │ Domain Match → │ Dec 23 │[View][Restore]│
│                                                                          │
│  Showing 8 of 312  │  [Load More]                                        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Page Elements:**

| Element | Description |
|---------|-------------|
| Rule filter | Dropdown to filter by specific Match Rule |
| Object filter | Filter by Contacts, Companies, etc. |
| Date filter | Last 7 days, 30 days, 90 days, All time |
| Search | Search by master/duplicate name or email |
| Rule → | Clickable link to Match Rule Detail page |
| [View] | Opens Match Review page (read-only, post-merge view) |
| [Restore] | Opens restore confirmation modal |

---

#### 10.4.10 Settings Page (`/settings`)

Account settings, preferences, and configuration.

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Settings                                                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  CONNECTION                                                              │
│  ─────────────────────────────────────────────────────────────────────── │
│                                                                          │
│  GoHighLevel Status:  ● Connected                                        │
│  Location ID:         loc_abc123                                         │
│  Location Name:       Acme Marketing Agency                              │
│  Connected Since:     December 15, 2024                                  │
│                                                                          │
│                                                    [Reconnect]           │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────── │
│                                                                          │
│  SUBSCRIPTION                                                            │
│  ─────────────────────────────────────────────────────────────────────── │
│                                                                          │
│  Current Plan:        Starter ($39/mo)                                   │
│  Billing:             Managed via GHL Marketplace                        │
│  Next Billing:        January 15, 2025                                   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │ 🚀 Upgrade to Pro ($59/mo)                                         ││
│  │    • Scheduled scans (hourly)                                       ││
│  │    • Auto-merge high-confidence matches                             ││
│  │    • Opportunities & Custom Objects                                 ││
│  │                                              [Upgrade Now]          ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────── │
│                                                                          │
│  NOTIFICATIONS                                                           │
│  ─────────────────────────────────────────────────────────────────────── │
│                                                                          │
│  Email Notifications:                                                    │
│  ☑ Daily summary of pending matches                                      │
│  ☑ Alert when new duplicates are found                                   │
│  ☑ Weekly merge activity report                                          │
│  ☐ Alert on auto-merge completion (Pro+ only)                            │
│                                                                          │
│  Notification Email: [user@agency.com          ]                         │
│                                                                          │
│                                       [Save Notification Settings]       │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────── │
│                                                                          │
│  PREFERENCES                                                             │
│  ─────────────────────────────────────────────────────────────────────── │
│                                                                          │
│  Merge Warnings:                                                         │
│  ☑ Show warning before individual merges                                 │
│  ☑ Show warning before bulk merges                                       │
│  ☑ Show warning before restoring merges                                  │
│                                                                          │
│  [Reset All Warnings]                                                    │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────── │
│                                                                          │
│  WHITE-LABEL (Agency Plan Only)                                          │
│  ─────────────────────────────────────────────────────────────────────── │
│                                                                          │
│  💡 Upgrade to Agency plan to customize branding for your clients.       │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │ Company Name:    [Acme Marketing Agency        ]  (from GHL)        ││
│  │ Logo URL:        [https://acme.com/logo.png    ]  (from GHL)        ││
│  │                                                                     ││
│  │ Custom CSS:      [                                                ] ││
│  │                  [                                                ] ││
│  │                  [                                                ] ││
│  │                                                                     ││
│  │ Preview:         [Open Preview →]                                   ││
│  │                                                                     ││
│  │                                                   [Save Branding]   ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────── │
│                                                                          │
│  DANGER ZONE                                                             │
│  ─────────────────────────────────────────────────────────────────────── │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │ 🔄 Force Full Resync                                                ││
│  │ Clear local cache and re-pull all records from GHL.                 ││
│  │ Use if data seems out of sync after a large GHL import.             ││
│  │                                              [Force Resync]         ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │ ⚠️ Delete All Data                                                 ││
│  │ Remove all match rules, merge history, and settings.                ││
│  │ Your GHL contacts will NOT be affected.                             ││
│  │                                              [Delete All Data]      ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │ ⚠️ Disconnect Account                                              ││
│  │ Revoke MergeMatch's access to this GHL location.                    ││
│  │ All data will be deleted. You can reinstall from Marketplace.       ││
│  │                                              [Disconnect]           ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Section Details:**

| Section | Description |
|---------|-------------|
| **Connection** | Shows GHL OAuth status, location info; [Reconnect] for re-auth |
| **Subscription** | Current plan, billing info (via GHL), upgrade CTA |
| **Preferences** | Warning toggle resets (checkboxes to re-enable warnings) |
| **White-Label** | Agency tier only; pulls name/logo from GHL API; custom CSS textarea |
| **Danger Zone** | Delete data (keeps GHL contacts), Disconnect (full removal) |

**White-Label Behavior:**
- Company Name and Logo auto-populated from GHL Agency Info API
- Users can override if needed (stored in MergeMatch DB)
- Custom CSS applied to app UI for branding
- Preview opens app in new tab with branding applied

---

#### 10.4.11 Help Page (`/help`)

In-app documentation and support resources.

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Help & Documentation                                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  GETTING STARTED                                                         │
│  ─────────────────────────────────────────────────────────────────────── │
│                                                                          │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌─────────────────┐│
│  │ 📖 Quick Start Guide │  │ 🎥 Video Tutorial    │  │ 💡 Best Practices││
│  │                      │  │                      │  │                 ││
│  │ Create your first    │  │ Watch a 3-minute    │  │ Tips for        ││
│  │ match rule in 5 min  │  │ walkthrough         │  │ accurate matches││
│  └──────────────────────┘  └──────────────────────┘  └─────────────────┘│
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────── │
│                                                                          │
│  DOCUMENTATION (collapsible sections)                                    │
│  ─────────────────────────────────────────────────────────────────────── │
│                                                                          │
│  ▸ Match Rules                                                           │
│  ▸ Merge Strategies                                                      │
│  ▸ Scheduling & Automation                                               │
│  ▸ Rollback & Recovery                                                   │
│  ▸ Object Types                                                          │
│  ▸ Plans & Billing                                                       │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────── │
│                                                                          │
│  FAQ (expandable)                                                        │
│  ─────────────────────────────────────────────────────────────────────── │
│                                                                          │
│  ▸ What happens to notes and tasks when I merge?                         │
│  ▸ Can I undo a merge?                                                   │
│  ▸ Why are some features locked?                                         │
│  ▸ What's the difference between Exact and Fuzzy matching?               │
│  ▸ How does auto-merge work?                                             │
│  ▸ What does the confidence score mean?                                  │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────── │
│                                                                          │
│  SUPPORT                                                                 │
│  ─────────────────────────────────────────────────────────────────────── │
│                                                                          │
│  📧 support@mergematch.app                                               │
│  Response time: Within 24 hours                                          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

##### Help Content: Getting Started

**Quick Start Guide (5 min)**
1. **Install MergeMatch** from GHL Marketplace
2. **Create a Match Rule** - e.g., "Email + Last Name" for contacts
3. **Attach a Merge Strategy** - choose master selection and field rules
4. **Run a Scan** - click [Scan Now] to find duplicates
5. **Review & Merge** - review matches, merge individually or in bulk

**Video Tutorial** - Embedded Loom/YouTube (3 min walkthrough)

**Best Practices**
- Start with high-confidence thresholds (85%+) and lower gradually
- Use exact match on email first, then add fuzzy rules
- Always review the first 10-20 merges manually before enabling auto-merge
- Keep rollback retention at 30 days until you trust your rules

---

##### Help Content: Documentation Sections

**Match Rules**
| Topic | Content |
|-------|---------|
| Creating a Match Rule | Name, object type, field selection, threshold config |
| Match Types | **Exact** - identical values. **Fuzzy (Jaro-Winkler)** - similar strings (typos, variations). **Phonetic (Soundex)** - sounds-alike matching. **Normalized** - phone/email standardization before compare |
| Match Thresholds | 0-100% confidence. Higher = stricter. Recommended: 75% minimum, 85% for auto-merge |
| Field Weighting | Assign importance to fields. Email=high, phone=medium, name=low (common names match too often) |

**Merge Strategies**
| Topic | Content |
|-------|---------|
| Master Selection | **Most Recent** - newest updated_at wins. **Oldest** - first created. **Most Complete** - fewest empty fields. **Most Engaged** - most notes/tasks/opps |
| Field Conflict Rules | **Keep Master** - always use master value. **Keep Newest** - most recent non-empty. **Keep Longest** - longest string (addresses). **Concatenate** - combine (tags) |
| Related Records | Notes, tasks, and opportunities are always moved to master (never deleted) |

**Scheduling & Automation**
| Topic | Content |
|-------|---------|
| Manual Scans | Free tier: 1/day. Paid: unlimited. Click [Scan Now] on any rule |
| Scheduled Scans | Starter: Daily at chosen time. Pro+: Hourly. Configure per-rule |
| Auto-Merge | Pro+ only. Automatically merge matches at ≥95% confidence. Enable per-rule |
| Real-Time Detection | Pro+ only. Webhook triggers scan on new contact creation |

**Rollback & Recovery**
| Topic | Content |
|-------|---------|
| How Rollback Works | We snapshot all records before merge. Restore recreates the deleted duplicate and removes transferred data from master |
| Rollback Window | Starter: 7 days. Pro/Agency: 30 days. After window, snapshots are deleted |
| Limitations | If master record was edited after merge, those edits are preserved. External changes (in GHL directly) may conflict |
| What Gets Restored | The duplicate contact + its original field values. Notes/tasks moved back to duplicate |

**Object Types**
| Object | Tier | Notes |
|--------|------|-------|
| Contacts | All | Core object. Includes custom fields |
| Companies | Starter+ | Match on domain, name, phone |
| Opportunities | Pro+ | Match within same contact or standalone |
| Custom Objects | Pro+ | Any GHL custom object with unique identifier fields |

**Plans & Billing**
| Topic | Content |
|-------|---------|
| Upgrading | Settings → Subscription → [Upgrade]. Billed via GHL Marketplace |
| Downgrading | Contact support. Active rules beyond tier limits will be paused |
| Agency Resale | Agency tier enables white-label resale to your clients |

---

##### Help Content: FAQ Answers

| Question | Answer |
|----------|--------|
| **What happens to notes and tasks when I merge?** | All notes, tasks, and opportunities from the duplicate are moved to the master record. Nothing is deleted - data is preserved and consolidated. |
| **Can I undo a merge?** | Yes! Click [Restore] on any merge in your History. This recreates the duplicate with its original data and moves notes/tasks back. Starter: 7-day window. Pro+: 30 days. |
| **Why are some features locked?** | MergeMatch uses a freemium model. Free tier lets you see duplicates. Upgrade to Starter ($39/mo) to merge. Pro ($59/mo) unlocks automation. See Settings → Subscription. |
| **What's the difference between Exact and Fuzzy matching?** | **Exact** requires identical values (case-insensitive). **Fuzzy** uses Jaro-Winkler algorithm to find similar strings - catches typos like "John Smith" vs "Jon Smith" or "john@acme.com" vs "john@acme.co". |
| **How does auto-merge work?** | When enabled (Pro+ only), matches at ≥95% confidence are automatically merged without review. Only high-confidence matches qualify. Lower confidence matches still require manual review. |
| **What does the confidence score mean?** | A 0-100% score based on how closely records match across your configured fields. 95%+ = near certain duplicates. 75-95% = likely duplicates, review recommended. Below 75% = possible matches, review carefully. |
| **Will merging affect my GHL workflows/automations?** | The master record keeps its ID, so existing workflow enrollments continue. The duplicate is deleted, which may trigger any "contact deleted" workflows you have configured. |
| **How do I match companies to contacts?** | Cross-object matching is on our roadmap. Currently, match within object types only (contacts to contacts, companies to companies). |

---

##### Help Content: Support

**Support Channels:**
- **Email:** support@mergematch.app (response within 24 hours)
- **In-App:** Submit a request from Help page (includes account context)

**What to Include in Support Requests:**
- Your GHL location ID
- Match Rule name (if applicable)
- Screenshot of the issue
- Steps to reproduce

**Status Page:** status.mergematch.app (uptime & incidents)

---

### 10.6 Navigation Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│  SIDEBAR NAVIGATION                                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  [Logo/App Name]                                                         │
│                                                                          │
│  ────────────────                                                        │
│                                                                          │
│  📊  Dashboard           /                                               │
│  📋  Match Rules         /match-rules                                    │
│  📜  History             /history                                        │
│  ⚙️  Settings            /settings                                       │
│  ❓  Help                /help                                           │
│                                                                          │
│  ────────────────                                                        │
│                                                                          │
│  [Starter Plan]                                                          │
│  [Upgrade →]                                                             │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Route Summary:**

| Route | Page | Description |
|-------|------|-------------|
| `/` | Dashboard | Overview metrics, quick links |
| `/match-rules` | Match Rules List | All rules with stats |
| `/match-rules/new` | Create Match Rule | Rule creation form |
| `/match-rules/:id` | Match Rule Detail | Main working page |
| `/match-rules/:id/edit` | Edit Match Rule | Rule editing form |
| `/match-rules/:id/review/:matchId` | Match Review | Field comparison view |
| `/merge-strategies` | Merge Strategies | Strategy list by object |
| `/merge-strategies/new` | Create Merge Strategy | Strategy creation form |
| `/merge-strategies/:id/edit` | Edit Merge Strategy | Strategy editing form |
| `/history` | History | All merges across rules |
| `/settings` | Settings | Preferences, subscription, white-label |
| `/help` | Help | Documentation, FAQ, support |

---

## 11. Phase 7: White-Label & Launch

### 11.1 Phase Overview

| Attribute | Value |
|-----------|-------|
| **Duration** | 2 weeks |
| **Team** | 1 Backend, 1 Frontend, Product |
| **Dependencies** | Phase 6 complete |
| **Exit Criteria** | App live on GHL Marketplace |

### 11.2 White-Label Configuration

Agency tier users can customize branding. Configuration is minimal:

```json
{
  "tenant_id": "uuid",
  "branding": {
    "company_name": "Acme Marketing Agency",  // from GHL API, can override
    "logo_url": "https://agency.com/logo.png", // from GHL API, can override
    "custom_css": "/* optional custom styles */"
  }
}
```

**Source of Defaults:**
- `company_name` and `logo_url` are auto-populated from GHL Location/Agency API
- Users can override in Settings if needed
- `custom_css` allows advanced styling (validated/sanitized before applying)

**What's NOT customizable:**
- App colors (use custom CSS if needed)
- Favicon (uses MergeMatch default)
- "Powered by" badge (always hidden for Agency tier)

---

### 11.3 Required OAuth Scopes

MergeMatch requires the following GHL OAuth scopes:

| Scope | Purpose | Tier |
|-------|---------|------|
| **contacts.readonly** | Read contacts, tasks, notes | All |
| **contacts.write** | Update/delete contacts, create notes/tasks | All |
| **businesses.readonly** | Read companies | Starter+ |
| **businesses.write** | Update/delete companies | Starter+ |
| **opportunities.readonly** | Read opportunities, pipelines | Pro+ |
| **opportunities.write** | Update/delete opportunities | Pro+ |
| **objects/schema.readonly** | Read custom object schemas | Pro+ |
| **objects/record.readonly** | Read custom object records | Pro+ |
| **objects/record.write** | Update/delete custom object records | Pro+ |
| **locations.readonly** | Read location info (for white-label) | All |
| **locations/customFields.readonly** | Read custom field definitions | All |
| **locations/tags.readonly** | Read available tags | All |

**Webhook Events (for real-time detection - Pro tier):**
- `ContactCreate` - Detect new contacts for immediate matching
- `ContactDelete` - Clean up match records when contacts deleted

**Token Type:** Sub-Account Token (location-level access)

---

### 11.4 GHL Marketplace Submission Checklist

| Requirement | Status | Notes |
|-------------|--------|-------|
| App registered in developer portal | ☐ | |
| OAuth scopes documented | ☐ | |
| App description (500 chars) | ☐ | |
| App screenshots (5 minimum) | ☐ | |
| Demo video | ☐ | 2-3 minutes |
| Pricing tiers configured | ☐ | |
| Support contact provided | ☐ | |
| Privacy policy URL | ☐ | |
| Terms of service URL | ☐ | |
| Testing checklist completed | ☐ | |
| Review submitted | ☐ | |

---

## 12. Data Architecture

### 12.1 Strategy: Cache + Incremental Sync

MergeMatch caches GHL records locally in Supabase rather than pulling fresh on every scan. This enables fast scans and good UX while keeping storage costs negligible.

| Data Type | Strategy | Rationale |
|-----------|----------|-----------|
| Contact/Company/Opp records | Cache + incremental sync | Storage is cheap; full pulls are slow |
| Match results | Store in DB | Persist pending matches between sessions |
| Pre-merge snapshots | Store in DB | Required for rollback |
| Field schemas & custom fields | Cache, refresh daily | Rarely change |

### 12.2 GHL API Limits

| Limit | Value | Notes |
|-------|-------|-------|
| Burst | 100 requests / 10 sec | Per location |
| Daily | 200,000 requests / day | Per location |
| Contacts per request | Max 100 | Default 20 |

### 12.3 Storage Cost Analysis

Using **1.5 KB average** per contact (typical SMB with 3-5 custom fields):

| Contacts | Storage Size | Monthly Cost (Supabase Pro) |
|----------|-------------|----------------------------|
| 10,000 | ~22 MB | $0 (in 8GB quota) |
| 100,000 | ~225 MB | $0 |
| 500,000 | ~1.1 GB | $0 |
| 1,000,000 | ~2.25 GB | $0 |
| 5,000,000 | ~11 GB | ~$0.07/mo overage |

**Conclusion:** Storage is essentially free for any realistic contact volume.

### 12.4 Sync Modes

#### Initial Sync (On Install)
- Full pull of all contacts for the location
- Progress indicator in UI: "Syncing contacts... 45,000 / 100,000"
- Runs in background; user can navigate away
- Estimated time: ~3 min per 100K contacts

#### Delta Sync (Ongoing)
- Fetches records where `dateUpdated > last_sync_at`
- Triggered by: scheduled job, manual button, or webhook

| Trigger | Tier | Frequency |
|---------|------|-----------|
| Manual [Sync Now] button | All | Free: 1/day, Paid: Unlimited |
| Scheduled delta sync | Starter+ | Daily (Starter), Hourly (Pro+) |
| Webhook (ContactCreate/Update/Delete) | Pro+ | Real-time |

#### Force Full Resync
- Available in Settings → Danger Zone
- Clears local cache and re-pulls everything
- Use case: suspected data corruption, major GHL import

### 12.5 Cache Schema

```sql
-- Per-tenant contact cache
CREATE TABLE contact_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  ghl_contact_id TEXT NOT NULL,
  location_id TEXT NOT NULL,
  data JSONB NOT NULL,           -- Full GHL contact record
  checksum TEXT,                 -- MD5 of data for change detection
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(tenant_id, ghl_contact_id)
);

-- Index for matching queries
CREATE INDEX idx_contact_cache_tenant_location
  ON contact_cache(tenant_id, location_id);
CREATE INDEX idx_contact_cache_synced
  ON contact_cache(tenant_id, synced_at);

-- Similar tables for companies, opportunities, custom objects
```

### 12.6 Sync Status in UI

**Dashboard shows:**
```
DATA SYNC
├── Contacts: 47,832 synced • Last sync: 2 min ago
├── Companies: 1,204 synced • Last sync: 2 min ago
└── [Sync Now]  (Syncing... 45% if in progress)
```

**Match Rule Detail shows:**
```
⚠️ Data last synced 4 hours ago  [Sync Now]
```
(Warning appears if sync > 1 hour old when user clicks Scan)

### 12.7 Sync by Tier

| Feature | Free | Starter | Pro | Agency |
|---------|------|---------|-----|--------|
| Initial sync | ✅ | ✅ | ✅ | ✅ |
| Manual [Sync Now] | ✅ 1/day | ✅ Unlimited | ✅ Unlimited | ✅ Unlimited |
| Scheduled sync | ❌ | ✅ Daily | ✅ Hourly | ✅ Hourly |
| Webhook real-time | ❌ | ❌ | ✅ | ✅ |
| Force full resync | ❌ | ✅ | ✅ | ✅ |
| **Merge limit** | **3 total** | ✅ Unlimited | ✅ Unlimited | ✅ Unlimited |

---

## 13. API Specifications

### 13.1 API Overview

MergeMatch exposes a RESTful API consumed by the frontend React app. All endpoints require authentication.

```
Base URL: https://api.mergematch.app/v1
Content-Type: application/json
Authorization: Bearer <session_token>
```

### 13.2 Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/ghl/callback` | OAuth callback from GHL (exchanges code for tokens) |
| `POST` | `/auth/refresh` | Refresh expired access token |
| `POST` | `/auth/logout` | Invalidate session |
| `GET` | `/auth/me` | Get current user/tenant info |

#### POST /auth/ghl/callback

```typescript
// Request (from GHL OAuth redirect)
{
  "code": "authorization_code_from_ghl",
  "state": "csrf_state_token"
}

// Response
{
  "session_token": "jwt_session_token",
  "tenant": {
    "id": "uuid",
    "location_id": "loc_abc123",
    "location_name": "Acme Agency",
    "tier": "starter"
  }
}
```

---

### 13.3 Sync Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/sync/trigger` | Trigger manual delta sync |
| `POST` | `/sync/force` | Force full resync (clears cache) |
| `GET` | `/sync/status` | Get current sync status |

#### POST /sync/trigger

```typescript
// Request
{
  "object_types": ["contacts", "companies"]  // optional, defaults to all
}

// Response
{
  "job_id": "sync_job_uuid",
  "status": "queued",
  "objects": ["contacts", "companies"]
}
```

#### GET /sync/status

```typescript
// Response
{
  "contacts": {
    "count": 47832,
    "last_sync": "2024-12-24T14:30:00Z",
    "status": "idle"  // idle | syncing | error
  },
  "companies": {
    "count": 1204,
    "last_sync": "2024-12-24T14:30:00Z",
    "status": "idle"
  },
  "syncs_today": 1,
  "sync_limit": 1  // null for paid tiers (unlimited)
}
```

---

### 13.4 Match Rule Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/match-rules` | List all match rules |
| `POST` | `/match-rules` | Create match rule |
| `GET` | `/match-rules/:id` | Get match rule details |
| `PUT` | `/match-rules/:id` | Update match rule |
| `DELETE` | `/match-rules/:id` | Delete match rule |
| `POST` | `/match-rules/:id/scan` | Trigger scan for this rule |
| `GET` | `/match-rules/:id/matches` | Get pending matches |
| `GET` | `/match-rules/:id/history` | Get merge history for rule |

#### POST /match-rules

```typescript
// Request
{
  "name": "Email + Phone Match",
  "object_type": "contacts",
  "match_fields": [
    { "field": "email", "match_type": "exact", "threshold": 100 },
    { "field": "phone", "match_type": "fuzzy", "threshold": 85 }
  ],
  "match_logic": "and",  // "and" | "or"
  "strategy_id": "strategy_uuid",
  "schedule": {
    "enabled": true,
    "frequency": "daily",  // "daily" | "hourly"
    "time": "06:00"
  }
}

// Response
{
  "id": "rule_uuid",
  "name": "Email + Phone Match",
  "object_type": "contacts",
  "match_fields": [...],
  "strategy_id": "strategy_uuid",
  "schedule": {...},
  "pending_count": 0,
  "total_merged": 0,
  "created_at": "2024-12-24T14:30:00Z"
}
```

#### POST /match-rules/:id/scan

```typescript
// Response
{
  "job_id": "scan_job_uuid",
  "status": "queued",
  "rule_id": "rule_uuid"
}

// Webhook/polling for completion:
{
  "job_id": "scan_job_uuid",
  "status": "completed",
  "new_matches": 12,
  "total_pending": 47,
  "records_scanned": 12847,
  "duration_ms": 4200
}
```

---

### 13.5 Merge Strategy Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/merge-strategies` | List all strategies |
| `POST` | `/merge-strategies` | Create strategy |
| `GET` | `/merge-strategies/:id` | Get strategy details |
| `PUT` | `/merge-strategies/:id` | Update strategy |
| `DELETE` | `/merge-strategies/:id` | Delete strategy (if unused) |

#### POST /merge-strategies

```typescript
// Request
{
  "name": "Standard Contact Merge",
  "object_type": "contacts",
  "master_selection": "most_complete",  // most_complete | most_recent | oldest | manual
  "conflict_resolution": "prefer_master",  // prefer_master | prefer_newest | require_review
  "related_records": {
    "notes": "copy_all",  // copy_all | skip
    "tasks": "copy_all",
    "opportunities": "keep_all"  // keep_all | master_only | highest_value
  }
}

// Response
{
  "id": "strategy_uuid",
  "name": "Standard Contact Merge",
  "object_type": "contacts",
  "master_selection": "most_complete",
  "conflict_resolution": "prefer_master",
  "related_records": {...},
  "used_by": [],  // rule IDs using this strategy
  "created_at": "2024-12-24T14:30:00Z"
}
```

---

### 13.6 Match & Merge Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/matches/:matchId` | Get match details (for review) |
| `POST` | `/matches/:matchId/merge` | Execute merge |
| `POST` | `/matches/:matchId/dismiss` | Dismiss match (not a duplicate) |
| `POST` | `/match-rules/:id/merge-all` | Bulk merge all pending |

#### GET /matches/:matchId

```typescript
// Response
{
  "id": "match_uuid",
  "rule_id": "rule_uuid",
  "confidence": 0.98,
  "records": [
    {
      "id": "ghl_contact_id_1",
      "is_master": true,
      "fields": {
        "firstName": "John",
        "lastName": "Smith",
        "email": "john@acme.com",
        "phone": null,
        "company": "Acme Inc"
      },
      "metadata": {
        "created_at": "2024-01-15T00:00:00Z",
        "updated_at": "2024-12-20T00:00:00Z"
      },
      "related": {
        "notes": 2,
        "tasks": 1,
        "opportunities": 2
      }
    },
    {
      "id": "ghl_contact_id_2",
      "is_master": false,
      "fields": {...},
      "metadata": {...},
      "related": {...}
    }
  ],
  "preview": {
    // Computed merge result based on strategy
    "master_id": "ghl_contact_id_1",
    "result_fields": {
      "firstName": { "value": "John", "source": "master" },
      "lastName": { "value": "Smith", "source": "master" },
      "email": { "value": "john@acme.com", "source": "master" },
      "phone": { "value": "+1 555-0123", "source": "duplicate" },
      "company": { "value": "Acme Inc", "source": "master" }
    }
  }
}
```

#### POST /matches/:matchId/merge

```typescript
// Request (optional overrides)
{
  "field_overrides": {
    "phone": "ghl_contact_id_2"  // Use value from this record
  }
}

// Response
{
  "merge_id": "merge_uuid",
  "status": "completed",
  "master_id": "ghl_contact_id_1",
  "deleted_ids": ["ghl_contact_id_2"],
  "rollback_expires": "2025-01-24T14:30:00Z"
}
```

---

### 13.7 History & Restore Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/history` | Get all merge history |
| `GET` | `/history/:mergeId` | Get specific merge details |
| `POST` | `/history/:mergeId/restore` | Restore a merge |

#### GET /history

```typescript
// Query params: ?rule_id=&object_type=&since=&limit=50&offset=0

// Response
{
  "items": [
    {
      "id": "merge_uuid",
      "rule_id": "rule_uuid",
      "rule_name": "Email + Phone Match",
      "object_type": "contacts",
      "master": {
        "id": "ghl_contact_id",
        "display_name": "John Smith"
      },
      "duplicates": [
        { "id": "ghl_contact_id_2", "display_name": "Jon Smith" }
      ],
      "merged_at": "2024-12-24T14:30:00Z",
      "can_restore": true,
      "rollback_expires": "2025-01-24T14:30:00Z"
    }
  ],
  "total": 312,
  "limit": 50,
  "offset": 0
}
```

#### POST /history/:mergeId/restore

```typescript
// Response
{
  "status": "completed",
  "restored_records": [
    {
      "original_id": "ghl_contact_id_2",
      "new_id": "ghl_contact_new_id",  // New GHL ID
      "display_name": "Jon Smith"
    }
  ],
  "warnings": [
    "Notes/tasks copied during merge remain on master record"
  ]
}
```

---

### 13.8 Dashboard & Stats Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/dashboard/stats` | Get summary metrics |
| `GET` | `/dashboard/recent-merges` | Get recent merge activity |

#### GET /dashboard/stats

```typescript
// Response
{
  "objects": [
    {
      "type": "contacts",
      "synced_count": 47832,
      "merged_7d": 47,
      "merged_total": 312,
      "available": true
    },
    {
      "type": "companies",
      "synced_count": 1204,
      "merged_7d": 3,
      "merged_total": 18,
      "available": true
    },
    {
      "type": "opportunities",
      "synced_count": 0,
      "merged_7d": 0,
      "merged_total": 0,
      "available": false,  // tier-locked
      "required_tier": "pro"
    }
  ],
  "active_rules": 3,
  "pending_matches": 40,
  "tier": "starter",
  "merges_remaining": null  // null = unlimited, number for free tier
}
```

---

### 13.9 Settings Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/settings` | Get tenant settings |
| `PUT` | `/settings` | Update settings |
| `GET` | `/settings/preferences` | Get user preferences |
| `PUT` | `/settings/preferences` | Update preferences |

#### GET /settings

```typescript
// Response
{
  "connection": {
    "status": "connected",
    "location_id": "loc_abc123",
    "location_name": "Acme Marketing Agency",
    "connected_since": "2024-12-15T00:00:00Z"
  },
  "subscription": {
    "tier": "starter",
    "price": 3900,  // cents
    "billing_managed_by": "ghl_marketplace",
    "next_billing": "2025-01-15T00:00:00Z"
  },
  "branding": {
    "company_name": "Acme Marketing Agency",
    "logo_url": "https://...",
    "custom_css": null
  }
}
```

#### PUT /settings/preferences

```typescript
// Request
{
  "skip_individual_merge_warning": true,
  "skip_bulk_merge_warning": false,
  "skip_restore_warning": false
}
```

---

### 13.10 Webhook Receiver Endpoint

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/webhooks/ghl` | Receive webhooks from GHL |

#### POST /webhooks/ghl

```typescript
// Request (from GHL)
Headers:
  X-GHL-Signature: hmac_sha256_signature
  X-GHL-Event-Type: ContactCreate

Body:
{
  "type": "ContactCreate",
  "locationId": "loc_abc123",
  "id": "contact_id",
  "timestamp": "2024-12-24T14:30:00Z",
  ...
}

// Response
{ "received": true }

// Processing:
// 1. Verify HMAC signature
// 2. Lookup tenant by locationId
// 3. Queue sync job for affected record
// 4. If Pro+ tier, trigger immediate match scan
```

---

### 13.11 Job Status Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/jobs/:jobId` | Get job status |
| `GET` | `/jobs` | List recent jobs |

#### GET /jobs/:jobId

```typescript
// Response
{
  "id": "job_uuid",
  "type": "scan",  // scan | sync | merge_bulk
  "status": "completed",  // queued | running | completed | failed
  "progress": {
    "current": 47,
    "total": 47,
    "percent": 100
  },
  "result": {
    "new_matches": 12,
    "total_pending": 47
  },
  "started_at": "2024-12-24T14:30:00Z",
  "completed_at": "2024-12-24T14:30:04Z",
  "error": null
}
```

---

### 13.12 Error Responses

All endpoints return consistent error format:

```typescript
// 4xx/5xx Response
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid match threshold",
    "details": {
      "field": "match_fields[0].threshold",
      "reason": "Must be between 0 and 100"
    }
  }
}
```

**Error Codes:**

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Tier doesn't allow this action |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `RATE_LIMITED` | 429 | Too many requests |
| `SYNC_LIMIT_REACHED` | 400 | Free tier daily sync limit |
| `MERGE_LIMIT_REACHED` | 400 | Free tier 3-merge limit |
| `GHL_API_ERROR` | 502 | GHL API returned error |
| `INTERNAL_ERROR` | 500 | Server error |

---

## 14. Database Schema

### 14.1 Overview

MergeMatch uses **Supabase (PostgreSQL)** as the primary database. Schema is designed for multi-tenancy with row-level security.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        DATABASE ARCHITECTURE                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────────────────────┐│
│  │   tenants   │────<│  match_rules│────<│      pending_matches        ││
│  └─────────────┘     └─────────────┘     └─────────────────────────────┘│
│         │                   │                                            │
│         │            ┌──────┴──────┐                                    │
│         │            │             │                                    │
│         ▼            ▼             ▼                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────────┐  │
│  │   tokens    │  │ strategies  │  │        merge_history            │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────────────┘  │
│         │                                       │                        │
│         ▼                                       ▼                        │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                      CACHE TABLES                                    ││
│  │  contact_cache | company_cache | opportunity_cache | object_cache   ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 14.2 Core Tables

#### tenants

Primary tenant/account table. One row per GHL location install.

```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- GHL identifiers
  location_id TEXT NOT NULL UNIQUE,
  location_name TEXT,
  company_id TEXT,                    -- GHL agency ID

  -- Subscription
  tier TEXT NOT NULL DEFAULT 'free',  -- free | starter | pro | agency
  tier_updated_at TIMESTAMPTZ,

  -- Usage tracking
  merges_used INTEGER NOT NULL DEFAULT 0,  -- For free tier limit (3 total)
  syncs_today INTEGER NOT NULL DEFAULT 0,
  syncs_reset_at DATE NOT NULL DEFAULT CURRENT_DATE,
  last_merged_at TIMESTAMPTZ,              -- For dashboard display

  -- Branding (Agency tier)
  branding JSONB DEFAULT '{}',
  /* {
    "company_name": "...",
    "logo_url": "...",
    "custom_css": "..."
  } */

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Soft delete
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_tenants_location ON tenants(location_id);
CREATE INDEX idx_tenants_company ON tenants(company_id);
```

---

#### tokens

OAuth tokens for GHL API access. Encrypted at rest.

```sql
CREATE TABLE tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Encrypted tokens (using pgcrypto)
  access_token_encrypted BYTEA NOT NULL,
  refresh_token_encrypted BYTEA NOT NULL,

  -- Previous token grace period (1 hour fallback on rotation)
  previous_refresh_token_encrypted BYTEA,
  previous_token_expires_at TIMESTAMPTZ,

  -- Metadata
  token_type TEXT NOT NULL DEFAULT 'Bearer',
  expires_at TIMESTAMPTZ NOT NULL,
  scopes TEXT[],

  -- Bulk installation support
  company_id TEXT,                      -- Agency ID if bulk install
  is_bulk_installation BOOLEAN NOT NULL DEFAULT false,
  is_agency_fallback BOOLEAN NOT NULL DEFAULT false,  -- Using agency token as fallback

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(tenant_id)
);
```

---

#### merge_strategies

Reusable merge configuration templates.

```sql
CREATE TABLE merge_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  object_type TEXT NOT NULL,  -- contacts | companies | opportunities | custom_object

  -- Strategy config
  master_selection TEXT NOT NULL DEFAULT 'most_complete',
    -- most_complete | most_recent | oldest | manual
  conflict_resolution TEXT NOT NULL DEFAULT 'prefer_master',
    -- prefer_master | prefer_newest | require_review

  -- Related records handling
  related_records JSONB NOT NULL DEFAULT '{
    "notes": "copy_all",
    "tasks": "copy_all",
    "opportunities": "keep_all"
  }',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(tenant_id, name, object_type)
);

CREATE INDEX idx_strategies_tenant ON merge_strategies(tenant_id);
```

---

#### match_rules

Match rule configurations. Links to a merge strategy.

```sql
CREATE TABLE match_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  strategy_id UUID NOT NULL REFERENCES merge_strategies(id),

  name TEXT NOT NULL,
  object_type TEXT NOT NULL,  -- contacts | companies | opportunities | custom_object
  custom_object_key TEXT,     -- GHL custom object key (if applicable)

  -- Match configuration
  match_fields JSONB NOT NULL,
  /* [
    { "field": "email", "match_type": "exact", "threshold": 100, "weight": 1.0 },
    { "field": "phone", "match_type": "fuzzy", "threshold": 85, "weight": 0.8 }
  ] */
  match_logic TEXT NOT NULL DEFAULT 'and',  -- and | or

  -- Automation
  schedule JSONB,
  /* {
    "enabled": true,
    "frequency": "daily",  -- daily | hourly
    "time": "06:00",
    "timezone": "America/New_York"
  } */
  auto_merge_enabled BOOLEAN NOT NULL DEFAULT false,
  auto_merge_threshold INTEGER DEFAULT 95,  -- Minimum confidence for auto-merge

  -- Stats
  pending_count INTEGER NOT NULL DEFAULT 0,
  total_merged INTEGER NOT NULL DEFAULT 0,
  last_scan_at TIMESTAMPTZ,

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(tenant_id, name)
);

CREATE INDEX idx_rules_tenant ON match_rules(tenant_id);
CREATE INDEX idx_rules_strategy ON match_rules(strategy_id);
CREATE INDEX idx_rules_schedule ON match_rules(tenant_id)
  WHERE schedule IS NOT NULL AND (schedule->>'enabled')::boolean = true;
```

---

#### pending_matches

Discovered duplicate matches awaiting review/merge.

```sql
CREATE TABLE pending_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  rule_id UUID NOT NULL REFERENCES match_rules(id) ON DELETE CASCADE,

  -- Match group
  confidence DECIMAL(5,4) NOT NULL,  -- 0.0000 to 1.0000
  record_ids TEXT[] NOT NULL,        -- GHL IDs of matched records
  master_id TEXT,                    -- Suggested master (can be overridden)

  -- Match details
  match_details JSONB NOT NULL,
  /* {
    "field_scores": {
      "email": { "score": 1.0, "values": ["john@acme.com", "john@acme.com"] },
      "phone": { "score": 0.92, "values": ["+15550123", "555-0123"] }
    },
    "computed_confidence": 0.96
  } */

  -- Status
  status TEXT NOT NULL DEFAULT 'pending',  -- pending | dismissed | merged
  dismissed_at TIMESTAMPTZ,
  dismissed_reason TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_matches_tenant_rule ON pending_matches(tenant_id, rule_id);
CREATE INDEX idx_matches_status ON pending_matches(tenant_id, status);
CREATE INDEX idx_matches_confidence ON pending_matches(confidence DESC);
```

---

#### merge_history

Completed merges with rollback snapshots.

```sql
CREATE TABLE merge_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  rule_id UUID REFERENCES match_rules(id) ON DELETE SET NULL,
  match_id UUID,  -- Original pending_match ID (may be deleted)

  -- Merge details
  object_type TEXT NOT NULL,
  master_id TEXT NOT NULL,           -- GHL ID of surviving record
  master_display_name TEXT,
  duplicate_ids TEXT[] NOT NULL,     -- GHL IDs of deleted records

  -- Rollback data (encrypted JSONB)
  rollback_snapshot JSONB NOT NULL,
  /* {
    "master_before": { ... full record ... },
    "duplicates": [
      { "id": "...", "data": { ... full record ... } }
    ],
    "related_moved": {
      "notes": ["note_id_1", "note_id_2"],
      "tasks": ["task_id_1"]
    }
  } */

  -- Field resolution log
  field_resolution JSONB NOT NULL,
  /* {
    "firstName": { "value": "John", "source": "master", "original_values": {...} },
    "phone": { "value": "+15550123", "source": "duplicate_1", "original_values": {...} }
  } */

  -- Execution info
  merged_by TEXT,  -- "auto" | "manual" | "bulk"
  confidence DECIMAL(5,4),

  -- Rollback
  rollback_expires_at TIMESTAMPTZ NOT NULL,
  restored_at TIMESTAMPTZ,
  restored_new_ids TEXT[],  -- New GHL IDs if restored

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_history_tenant ON merge_history(tenant_id);
CREATE INDEX idx_history_rule ON merge_history(rule_id);
CREATE INDEX idx_history_rollback ON merge_history(tenant_id, rollback_expires_at)
  WHERE restored_at IS NULL;
CREATE INDEX idx_history_created ON merge_history(tenant_id, created_at DESC);
```

---

### 14.3 Cache Tables

#### contact_cache

Cached GHL contacts for fast matching.

```sql
CREATE TABLE contact_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- GHL identifiers
  ghl_contact_id TEXT NOT NULL,
  location_id TEXT NOT NULL,

  -- Contact data
  data JSONB NOT NULL,
  /* Full GHL contact record:
  {
    "id": "...",
    "firstName": "John",
    "lastName": "Smith",
    "email": "john@acme.com",
    "phone": "+15550123",
    "tags": ["lead", "hot"],
    "customFields": [...],
    "dateAdded": "...",
    "dateUpdated": "..."
  } */

  -- Normalized fields for indexing
  email_normalized TEXT,       -- lowercase, trimmed
  phone_normalized TEXT,       -- digits only
  name_normalized TEXT,        -- "firstname lastname" lowercase
  business_name_normalized TEXT, -- company/business name lowercase

  -- Change detection
  checksum TEXT,               -- MD5 of data for delta detection

  -- Timestamps
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(tenant_id, ghl_contact_id)
);

-- Indexes for matching queries
CREATE INDEX idx_contact_cache_tenant ON contact_cache(tenant_id);
CREATE INDEX idx_contact_cache_email ON contact_cache(tenant_id, email_normalized);
CREATE INDEX idx_contact_cache_phone ON contact_cache(tenant_id, phone_normalized);
CREATE INDEX idx_contact_cache_name ON contact_cache(tenant_id, name_normalized);
CREATE INDEX idx_contact_cache_business ON contact_cache(tenant_id, business_name_normalized);
CREATE INDEX idx_contact_cache_synced ON contact_cache(tenant_id, synced_at);

-- GIN index for JSONB queries on custom fields
CREATE INDEX idx_contact_cache_data ON contact_cache USING GIN (data);
```

---

#### company_cache

Cached GHL companies/businesses.

```sql
CREATE TABLE company_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  ghl_business_id TEXT NOT NULL,
  location_id TEXT NOT NULL,

  data JSONB NOT NULL,

  -- Normalized fields
  name_normalized TEXT,
  domain_normalized TEXT,
  phone_normalized TEXT,

  checksum TEXT,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(tenant_id, ghl_business_id)
);

CREATE INDEX idx_company_cache_tenant ON company_cache(tenant_id);
CREATE INDEX idx_company_cache_domain ON company_cache(tenant_id, domain_normalized);
CREATE INDEX idx_company_cache_name ON company_cache(tenant_id, name_normalized);
```

---

#### opportunity_cache

Cached GHL opportunities.

```sql
CREATE TABLE opportunity_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  ghl_opportunity_id TEXT NOT NULL,
  location_id TEXT NOT NULL,
  pipeline_id TEXT,
  contact_id TEXT,           -- Linked contact (if any)

  data JSONB NOT NULL,

  -- Normalized fields
  name_normalized TEXT,

  checksum TEXT,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(tenant_id, ghl_opportunity_id)
);

CREATE INDEX idx_opp_cache_tenant ON opportunity_cache(tenant_id);
CREATE INDEX idx_opp_cache_contact ON opportunity_cache(tenant_id, contact_id);
```

---

#### custom_object_cache

Cached GHL custom object records.

```sql
CREATE TABLE custom_object_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  object_key TEXT NOT NULL,      -- GHL custom object key
  ghl_record_id TEXT NOT NULL,
  location_id TEXT NOT NULL,

  data JSONB NOT NULL,

  checksum TEXT,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(tenant_id, object_key, ghl_record_id)
);

CREATE INDEX idx_custom_cache_tenant_object ON custom_object_cache(tenant_id, object_key);
```

---

### 14.4 Job Tables

#### jobs

Background job tracking (BullMQ metadata in Redis, status in Postgres).

```sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Job details
  type TEXT NOT NULL,         -- sync | scan | merge_bulk | restore
  queue_job_id TEXT,          -- BullMQ job ID
  rule_id UUID REFERENCES match_rules(id),

  -- Status
  status TEXT NOT NULL DEFAULT 'queued',  -- queued | running | completed | failed
  progress JSONB DEFAULT '{"current": 0, "total": 0}',

  -- Result
  result JSONB,
  error_message TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_jobs_tenant ON jobs(tenant_id);
CREATE INDEX idx_jobs_status ON jobs(tenant_id, status);
CREATE INDEX idx_jobs_created ON jobs(tenant_id, created_at DESC);
```

---

#### scheduled_jobs

Cron-like job scheduling.

```sql
CREATE TABLE scheduled_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  rule_id UUID NOT NULL REFERENCES match_rules(id) ON DELETE CASCADE,

  -- Schedule
  frequency TEXT NOT NULL,      -- daily | hourly
  time_of_day TIME,             -- For daily jobs
  timezone TEXT DEFAULT 'UTC',

  -- Next run
  next_run_at TIMESTAMPTZ NOT NULL,
  last_run_at TIMESTAMPTZ,
  last_job_id UUID REFERENCES jobs(id),

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(rule_id)
);

CREATE INDEX idx_scheduled_next ON scheduled_jobs(next_run_at)
  WHERE is_active = true;
```

---

### 14.5 User Preferences

#### user_preferences

Per-user settings (warning toggles, etc.).

```sql
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,  -- GHL user ID

  -- Warning toggles
  skip_individual_merge_warning BOOLEAN NOT NULL DEFAULT false,
  skip_bulk_merge_warning BOOLEAN NOT NULL DEFAULT false,
  skip_restore_warning BOOLEAN NOT NULL DEFAULT false,

  -- Other preferences
  preferences JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(tenant_id, user_id)
);
```

---

### 14.6 Row-Level Security

Enable RLS for multi-tenant isolation:

```sql
-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE merge_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE merge_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_object_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Example policy (applied to all tables)
CREATE POLICY tenant_isolation ON match_rules
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Service role bypasses RLS for backend operations
-- Frontend API always sets current_tenant_id from JWT
```

---

### 14.7 Database Functions

#### update_timestamp()

Auto-update `updated_at` on row changes.

```sql
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_tenants_timestamp
  BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ... repeat for other tables
```

---

#### reset_daily_syncs()

Reset sync counters at midnight (called by cron job).

```sql
CREATE OR REPLACE FUNCTION reset_daily_syncs()
RETURNS void AS $$
BEGIN
  UPDATE tenants
  SET syncs_today = 0, syncs_reset_at = CURRENT_DATE
  WHERE syncs_reset_at < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;
```

---

### 14.8 Migrations Strategy

- Use **Supabase Migrations** for schema versioning
- All migrations are idempotent (can be re-run safely)
- Naming convention: `YYYYMMDDHHMMSS_description.sql`

```
supabase/migrations/
├── 20241217000000_initial_schema.sql
├── 20241218000000_add_cache_tables.sql
├── 20241219000000_add_job_tables.sql
└── 20241220000000_add_rls_policies.sql
```

---

## 15. Testing Strategy

### 15.1 Testing Pyramid

```
                    ┌─────────────────┐
                    │   E2E Tests     │  10%
                    │   (Playwright)  │
                    ├─────────────────┤
                    │  Integration    │  30%
                    │  (API + DB)     │
           ┌────────┴─────────────────┴────────┐
           │         Unit Tests                │  60%
           │     (Vitest / Jest)               │
           └───────────────────────────────────┘
```

### 15.2 Unit Tests

**Coverage Target:** 80%+

| Area | Focus | Tools |
|------|-------|-------|
| **Matching Algorithms** | Jaro-Winkler, Soundex, normalization | Vitest |
| **Merge Logic** | Master selection, field conflict resolution | Vitest |
| **API Validators** | Request schemas, business rules | Zod + Vitest |
| **React Components** | UI rendering, state management | React Testing Library |

**Example Test Cases:**

```typescript
// matching.test.ts
describe('Jaro-Winkler', () => {
  it('returns 1.0 for identical strings', () => {
    expect(jaroWinkler('john', 'john')).toBe(1.0);
  });

  it('handles common typos', () => {
    expect(jaroWinkler('john', 'jon')).toBeGreaterThan(0.9);
    expect(jaroWinkler('smith', 'smyth')).toBeGreaterThan(0.85);
  });

  it('returns low score for unrelated strings', () => {
    expect(jaroWinkler('john', 'maria')).toBeLessThan(0.5);
  });
});

// merge.test.ts
describe('Master Selection', () => {
  it('selects most complete record', () => {
    const records = [
      { id: '1', firstName: 'John', lastName: 'Smith', email: null },
      { id: '2', firstName: 'John', lastName: 'Smith', email: 'john@test.com' }
    ];
    expect(selectMaster(records, 'most_complete')).toBe('2');
  });
});
```

---

### 15.3 Integration Tests

**Focus:** API endpoints with real database

| Scenario | Description |
|----------|-------------|
| **Auth Flow** | OAuth callback, token refresh, session management |
| **Match Rule CRUD** | Create, read, update, delete rules |
| **Scan Flow** | Trigger scan, verify matches created |
| **Merge Flow** | Execute merge, verify GHL API calls mocked |
| **Restore Flow** | Restore merge, verify record recreation |
| **Tier Enforcement** | Free tier limits, feature gating |

**Test Setup:**

```typescript
// test/setup.ts
beforeEach(async () => {
  // Reset test database
  await db.query('TRUNCATE tenants CASCADE');

  // Seed test tenant
  await db.query(`
    INSERT INTO tenants (id, location_id, tier)
    VALUES ('test-tenant-id', 'loc_test', 'starter')
  `);
});

// Mock GHL API
const mockGhlApi = setupMockGhlApi();
```

---

### 15.4 End-to-End Tests

**Tools:** Playwright

**Critical Flows:**

| Flow | Steps |
|------|-------|
| **First-Time Setup** | Install → OAuth → Initial sync → Create first rule |
| **Scan & Merge** | Navigate → Scan → Review match → Confirm merge |
| **Bulk Operations** | Create rule → Scan → Merge All → Verify history |
| **Settings** | Change preferences → Force resync → Disconnect |

**Example E2E Test:**

```typescript
// e2e/merge-flow.spec.ts
test('complete merge flow', async ({ page }) => {
  // Login
  await page.goto('/');
  await expect(page.getByText('Dashboard')).toBeVisible();

  // Navigate to match rules
  await page.click('text=Match Rules');
  await page.click('text=Email + Phone Match');

  // Scan for matches
  await page.click('text=Scan Now');
  await expect(page.getByText('Scan complete')).toBeVisible({ timeout: 30000 });

  // Merge first match
  await page.click('text=Merge').first();
  await page.click('text=Confirm Merge');
  await expect(page.getByText('Merge complete')).toBeVisible();

  // Verify in history
  await page.click('text=History');
  await expect(page.getByText('John Smith')).toBeVisible();
});
```

---

### 15.5 GHL API Mocking

Mock all GHL API calls for testing:

```typescript
// test/mocks/ghl.ts
export const mockGhlContacts = [
  {
    id: 'contact_1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john@acme.com',
    phone: '+15550123'
  },
  {
    id: 'contact_2',
    firstName: 'Jon',
    lastName: 'Smith',
    email: 'jon.smith@acme.com',
    phone: '+15550123'
  }
];

export const setupMockGhlApi = () => {
  nock('https://services.leadconnectorhq.com')
    .get('/contacts/')
    .query(true)
    .reply(200, { contacts: mockGhlContacts, meta: { total: 2 } });

  nock('https://services.leadconnectorhq.com')
    .put(/\/contacts\/.*/)
    .reply(200, (uri, body) => ({ id: uri.split('/').pop(), ...body }));

  nock('https://services.leadconnectorhq.com')
    .delete(/\/contacts\/.*/)
    .reply(200, { succeded: true });
};
```

---

### 15.6 Test Data Management

**Fixtures:**

```
test/fixtures/
├── tenants.json        # Test tenant data
├── contacts.json       # Sample GHL contacts
├── match_rules.json    # Test rule configurations
└── merge_history.json  # Historical merge data
```

**Seeding:**

```bash
# Seed test database
npm run db:seed:test

# Reset to clean state
npm run db:reset:test
```

---

### 15.7 CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        options: --health-cmd pg_isready

      redis:
        image: redis:7
        options: --health-cmd "redis-cli ping"

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Run migrations
        run: npm run db:migrate:test

      - name: Run unit tests
        run: npm run test:unit

      - name: Run integration tests
        run: npm run test:integration

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## 16. Security & Compliance

### 16.1 Authentication & Authorization

#### Overview

| Layer | Implementation |
|-------|----------------|
| **OAuth 2.0** | GHL OAuth for user authentication |
| **Session Management** | Hybrid: JWT (API) + HTTP-only cookie (refresh token) |
| **Multi-Tenancy** | Row-Level Security (RLS) in PostgreSQL |
| **API Auth** | Bearer tokens validated on every request |

#### OAuth Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           GHL OAUTH FLOW                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. User clicks "Install" in GHL Marketplace                            │
│                    ↓                                                     │
│  2. Redirect to /oauth/install                                          │
│     - Generate state param (HMAC-signed, 10-min expiry)                 │
│     - Redirect to GHL chooselocation endpoint                           │
│                    ↓                                                     │
│  3. User authorizes, GHL redirects to /oauth/callback                   │
│     - Validate state (CSRF protection)                                  │
│     - Exchange code for tokens                                          │
│                    ↓                                                     │
│  4. Handle installation type:                                           │
│     ┌─────────────────────┬─────────────────────────────────────────┐   │
│     │ Single Location     │ Bulk (Agency) Install                   │   │
│     ├─────────────────────┼─────────────────────────────────────────┤   │
│     │ Store tokens for    │ Fetch installed locations via API       │   │
│     │ location directly   │ Exchange agency token → location tokens │   │
│     │                     │ Store each location's tokens            │   │
│     └─────────────────────┴─────────────────────────────────────────┘   │
│                    ↓                                                     │
│  5. Set HTTP-only cookie with refresh token                             │
│     Return JWT access token to frontend                                 │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Hybrid JWT + Cookie Strategy

Since MergeMatch runs in a GHL iframe, we use a hybrid approach:

| Token Type | Storage | Purpose |
|------------|---------|---------|
| **JWT Access Token** | Frontend memory only | API authentication (bypasses iframe cookie issues) |
| **Refresh Token** | HTTP-only cookie | Survives page refresh, secure from JS access |

```typescript
// On successful OAuth callback
const handleOAuthSuccess = (tokens: GhlTokens) => {
  // Store refresh token in HTTP-only cookie
  res.cookie('mm_refresh', encryptedRefreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    signed: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    partitioned: true  // CHIPS for Chrome
  });

  // Return JWT to frontend (stored in memory only)
  const jwt = signJwt({ tenantId, locationId }, { expiresIn: '1h' });
  res.json({ accessToken: jwt, expiresIn: 3600 });
};
```

#### Iframe Cookie Handling

**Chrome (Partitioned Cookies / CHIPS):**
```typescript
// Set partitioned cookie for Chrome's third-party cookie blocking
res.setHeader('Set-Cookie', [
  `mm_refresh=${token}; HttpOnly; Secure; SameSite=None; Partitioned`
]);
```

**Safari Detection & Workaround:**
```typescript
const isSafari = (userAgent: string): boolean => {
  return userAgent.includes('Safari') &&
         !userAgent.includes('Chrome') &&
         !userAgent.includes('Chromium');
};

// Safari blocks third-party cookies entirely
if (isSafari(req.headers['user-agent'])) {
  return res.status(403).json({
    error: {
      code: 'SAFARI_NOT_SUPPORTED',
      message: 'Safari blocks cookies in iframes. Please use Chrome, Firefox, or Edge.'
    }
  });
}
```

#### CSRF Protection

```typescript
// Generate signed state for OAuth
const generateState = (): string => {
  const timestamp = Date.now();
  const nonce = crypto.randomBytes(16).toString('hex');
  const data = `${timestamp}:${nonce}`;
  const signature = crypto
    .createHmac('sha256', process.env.APP_SECRET)
    .update(data)
    .digest('hex');
  return `${data}:${signature}`;
};

// Validate state (10-minute expiry)
const validateState = (state: string): boolean => {
  const [timestamp, nonce, signature] = state.split(':');
  const age = Date.now() - parseInt(timestamp);
  if (age > 10 * 60 * 1000) return false;  // Expired

  const expected = crypto
    .createHmac('sha256', process.env.APP_SECRET)
    .update(`${timestamp}:${nonce}`)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
};
```

---

### 16.2 GHL Token Management

#### Token Refresh Strategy

**Proactive Refresh:** Refresh tokens 5 minutes *before* expiry, not after failure.

```typescript
const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000; // 5 minutes

const isTokenExpiringSoon = (expiresAt: Date): boolean => {
  return Date.now() + TOKEN_REFRESH_BUFFER_MS >= expiresAt.getTime();
};

const withAccessToken = async (tenantId: string): Promise<string> => {
  const tokens = await getTokens(tenantId);

  if (isTokenExpiringSoon(tokens.expires_at)) {
    return await refreshToken(tenantId);
  }

  return decrypt(tokens.access_token_encrypted);
};
```

#### Retry with Exponential Backoff

```typescript
const refreshWithRetry = async (tenantId: string): Promise<string> => {
  const MAX_RETRIES = 3;
  let delay = 1000; // Start at 1 second

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await doRefresh(tenantId);
    } catch (error) {
      // Permanent failures - don't retry
      if (['invalid_grant', 'invalid_client'].includes(error.code)) {
        await markInstallationInvalid(tenantId);
        throw new AuthError('Authentication expired - please reconnect');
      }

      // Retryable errors
      if (attempt === MAX_RETRIES) throw error;

      await sleep(Math.min(delay, 30000)); // Cap at 30s
      delay *= 2; // Exponential backoff
    }
  }
};
```

#### Previous Token Grace Period

GHL may rotate refresh tokens. We store the previous token for 1 hour as fallback:

```typescript
// In tokens table (see Section 14)
interface TokenRecord {
  access_token_encrypted: Buffer;
  refresh_token_encrypted: Buffer;
  expires_at: Date;
  previous_refresh_token_encrypted: Buffer | null;  // Fallback
  previous_token_expires_at: Date | null;           // 1 hour after rotation
}

const refreshToken = async (tenantId: string): Promise<string> => {
  try {
    return await doRefresh(tenantId, 'current');
  } catch (error) {
    if (error.code === 'invalid_grant' && hasPreviousToken(tenantId)) {
      // Try previous refresh token
      return await doRefresh(tenantId, 'previous');
    }
    throw error;
  }
};
```

#### Bulk Installation Support

For agency-level installs, exchange agency token for location-specific tokens:

```typescript
const handleBulkInstall = async (agencyTokens: GhlTokens, companyId: string) => {
  // 1. Store agency tokens
  await storeAgencyTokens(companyId, agencyTokens);

  // 2. Fetch all installed locations
  const locations = await ghl.oauth.getInstalledLocations(agencyTokens.access_token);

  // 3. Exchange for location-specific tokens
  for (const location of locations) {
    try {
      const locationTokens = await ghl.oauth.getLocationToken(
        agencyTokens.access_token,
        location.id
      );
      await storeTokens(location.id, locationTokens);
    } catch (error) {
      // Fallback: use agency tokens for this location
      await storeTokens(location.id, agencyTokens, { isAgencyFallback: true });
    }
  }
};
```

---

### 16.3 Data Protection

#### Encryption

| Data | At Rest | In Transit |
|------|---------|------------|
| GHL OAuth Tokens | AES-256-GCM (pgcrypto) | TLS 1.3 |
| Contact Data | Supabase default encryption | TLS 1.3 |
| Rollback Snapshots | AES-256-GCM | TLS 1.3 |
| API Traffic | N/A | TLS 1.3 |

#### Token Encryption (Supabase/pgcrypto)

```sql
-- Encrypt token before storage
INSERT INTO tokens (tenant_id, access_token_encrypted, refresh_token_encrypted)
VALUES (
  $1,
  pgp_sym_encrypt($2, current_setting('app.encryption_key')),
  pgp_sym_encrypt($3, current_setting('app.encryption_key'))
);

-- Decrypt token for use
SELECT pgp_sym_decrypt(access_token_encrypted, current_setting('app.encryption_key'))
FROM tokens WHERE tenant_id = $1;
```

#### Production Secret Validation

```typescript
// On server startup
const validateSecrets = () => {
  const { APP_SECRET, GHL_CLIENT_SECRET, ENCRYPTION_KEY } = process.env;

  if (!APP_SECRET || APP_SECRET.length < 32) {
    console.error('FATAL: APP_SECRET must be at least 32 characters');
    process.exit(1);
  }

  if (APP_SECRET === 'your-secret-here' || APP_SECRET === 'changeme') {
    console.error('FATAL: APP_SECRET is using a default value');
    process.exit(1);
  }
};
```

---

### 16.4 Input Validation

All inputs validated before processing:

```typescript
// Zod schema validation
const matchRuleSchema = z.object({
  name: z.string().min(1).max(100),
  object_type: z.enum(['contacts', 'companies', 'opportunities', 'custom_object']),
  match_fields: z.array(z.object({
    field: z.string(),
    match_type: z.enum(['exact', 'fuzzy', 'phonetic', 'normalized']),
    threshold: z.number().min(0).max(100)
  })).min(1).max(10),
  match_logic: z.enum(['and', 'or'])
});

// Custom CSS sanitization (Agency tier)
const sanitizeCss = (css: string): string => {
  // Remove javascript: URLs, expressions, etc.
  return css
    .replace(/javascript:/gi, '')
    .replace(/expression\s*\(/gi, '')
    .replace(/@import/gi, '');
};
```

---

### 16.4 Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/auth/*` | 10 | 1 minute |
| `/sync/trigger` | Based on tier | Daily |
| `/match-rules/:id/scan` | 60 | 1 hour |
| `/matches/:id/merge` | 100 | 1 minute |
| `/webhooks/ghl` | 1000 | 1 minute |
| All other endpoints | 100 | 1 minute |

```typescript
// Rate limiter implementation
import { RateLimiterRedis } from 'rate-limiter-flexible';

const rateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'rl',
  points: 100,
  duration: 60
});

app.use(async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch {
    res.status(429).json({ error: { code: 'RATE_LIMITED' } });
  }
});
```

---

### 16.5 Webhook Security

GHL webhooks verified via HMAC (check both possible header names):

```typescript
const verifyGhlWebhook = (req: Request): boolean => {
  // GHL uses different header names in different contexts
  const signature = req.headers['x-ghl-signature'] ||
                    req.headers['x-webhook-signature'];

  if (!signature) {
    console.warn('Webhook received without signature header');
    return false;
  }

  const payload = JSON.stringify(req.body);
  const secret = process.env.GHL_CLIENT_SECRET;

  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  // Timing-safe comparison prevents timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(signature as string),
    Buffer.from(expected)
  );
};

// Middleware usage
app.post('/webhooks/ghl', (req, res) => {
  if (!verifyGhlWebhook(req)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  // Process webhook...
});
```

---

### 16.6 OWASP Top 10 Mitigations

| Vulnerability | Mitigation |
|---------------|------------|
| **Injection** | Parameterized queries, Zod validation |
| **Broken Auth** | OAuth 2.0, secure token storage |
| **Sensitive Data Exposure** | Encryption at rest/transit, no logs of PII |
| **XXE** | JSON-only API (no XML parsing) |
| **Broken Access Control** | RLS, tenant isolation, JWT validation |
| **Security Misconfiguration** | Hardened Render/Vercel configs, no debug in prod |
| **XSS** | React escaping, CSP headers, CSS sanitization |
| **Insecure Deserialization** | JSON schema validation |
| **Components with Vulns** | Dependabot, npm audit |
| **Insufficient Logging** | Structured logging, audit trail |

---

### 16.7 Compliance

| Standard | Status | Notes |
|----------|--------|-------|
| **GDPR** | Ready | Data deletion on disconnect, no EU data residency (Supabase US) |
| **SOC 2** | Via Supabase | Supabase is SOC 2 Type II certified |
| **Privacy Policy** | Required | Must be in place before Marketplace submission |
| **Terms of Service** | Required | Must be in place before Marketplace submission |

---

### 16.8 Audit Logging

All sensitive actions logged:

```typescript
interface AuditLog {
  timestamp: string;
  tenant_id: string;
  user_id: string;
  action: string;  // 'merge' | 'restore' | 'delete_data' | 'settings_change'
  resource_type: string;
  resource_id: string;
  details: object;
  ip_address: string;
}

// Stored in separate audit_logs table with 90-day retention
```

---

## 17. Monitoring & Observability

### 17.1 Logging

**Stack:** Structured JSON logs → Axiom (via pino-axiom transport)

```typescript
// Structured logging with Pino
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label })
  }
});

// Example log
logger.info({
  tenant_id: 'uuid',
  action: 'merge_completed',
  master_id: 'contact_123',
  duplicate_count: 2,
  duration_ms: 450
});
```

**Log Levels:**

| Level | Use Case |
|-------|----------|
| `error` | Exceptions, failed operations |
| `warn` | Degraded state, approaching limits |
| `info` | Business events (merges, syncs) |
| `debug` | Detailed flow tracing (dev only) |

---

### 17.2 Metrics

**Key Metrics:**

| Metric | Type | Description |
|--------|------|-------------|
| `merges_total` | Counter | Total merges executed |
| `syncs_total` | Counter | Total sync operations |
| `scan_duration_ms` | Histogram | Match scan duration |
| `merge_duration_ms` | Histogram | Merge execution time |
| `api_request_duration_ms` | Histogram | API response times |
| `pending_matches_count` | Gauge | Current pending matches |
| `active_tenants` | Gauge | Tenants with activity (7d) |
| `ghl_api_errors` | Counter | GHL API failures |

**Prometheus Format:**

```
# HELP merges_total Total merges executed
# TYPE merges_total counter
merges_total{tier="starter"} 1234

# HELP scan_duration_ms Match scan duration
# TYPE scan_duration_ms histogram
scan_duration_ms_bucket{le="1000"} 45
scan_duration_ms_bucket{le="5000"} 98
scan_duration_ms_bucket{le="+Inf"} 100
```

---

### 17.3 Health Checks

```typescript
// GET /health
{
  "status": "healthy",
  "version": "1.2.3",
  "checks": {
    "database": "ok",
    "redis": "ok",
    "ghl_api": "ok"
  },
  "timestamp": "2024-12-24T14:30:00Z"
}

// GET /health/ready (for Kubernetes/Render)
// Returns 200 if ready to accept traffic
// Returns 503 if database/redis not connected
```

---

### 17.4 Alerting

| Alert | Condition | Severity | Action |
|-------|-----------|----------|--------|
| **API Errors Spike** | 5xx rate > 1% for 5 min | High | Axiom Alert → Email |
| **GHL API Failures** | > 10 failures in 1 min | High | Axiom Alert → Email |
| **Slow Scans** | p95 > 30s for 10 min | Medium | Axiom Alert → Email |
| **Database Connection Pool** | > 80% utilized | Medium | Render Alert |
| **Redis Memory** | > 80% utilized | Medium | Render Alert |
| **Queue Backlog** | > 1000 jobs waiting | Medium | Axiom Alert → Email |

**Note:** Axiom provides built-in alerting with email/webhook notifications. Upgrade to PagerDuty when we have paying customers requiring on-call support.

---

### 17.5 Tracing

**Distributed Tracing:** OpenTelemetry (optional)

```typescript
// Trace context propagation
const tracer = trace.getTracer('mergematch-api');

app.use((req, res, next) => {
  const span = tracer.startSpan(`${req.method} ${req.path}`);
  span.setAttribute('tenant_id', req.tenantId);

  res.on('finish', () => {
    span.setAttribute('http.status_code', res.statusCode);
    span.end();
  });

  next();
});
```

---

### 17.6 Dashboard

**Render Dashboard** (built-in):
- CPU/Memory usage
- Request count
- Response times
- Error rates

**Axiom Dashboard**:
- Business metrics (merges/day, active tenants)
- GHL API health
- Error rates and latency
- Queue depth

---

## 18. Risk Register

### 18.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **GHL API Changes** | Medium | High | Version pinning, changelog monitoring, abstraction layer |
| **GHL API Rate Limits** | Medium | Medium | Queue-based processing, backoff, per-tenant tracking |
| **Data Loss on Merge** | Low | Critical | Pre-merge snapshots, rollback capability, 30-day retention |
| **Bulk Merge Corruption** | Low | Critical | See 18.5 Bulk Merge Safeguards below |
| **Delete API Failures** | Medium | High | Full record backup before ANY delete, verify backup saved before proceeding |
| **Performance at Scale** | Medium | Medium | Caching, pagination, background jobs, load testing |
| **Supabase Outage** | Low | High | Health monitoring, status page alerts |
| **OAuth Token Expiry** | Medium | Medium | Proactive refresh, graceful degradation UI |

---

### 18.2 Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Low Marketplace Adoption** | Medium | High | Strong demo video, testimonials, free tier for trial |
| **Competitor Launch** | Medium | Medium | Focus on GHL-native integration, speed to market |
| **Pricing Too High** | Low | Medium | Competitive analysis, adjust based on feedback |
| **Support Volume** | Medium | Medium | Self-service docs, FAQ, community forum |

---

### 18.3 Compliance Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Data Privacy Complaint** | Low | High | Clear privacy policy, data deletion on uninstall |
| **GHL Marketplace Rejection** | Low | Medium | Follow submission checklist, pre-review with GHL team |

---

### 18.4 Risk Response Plan

**Severity Levels:**

| Level | Response Time | Escalation |
|-------|---------------|------------|
| **Critical** (data loss, outage) | 15 min | Immediate email alert |
| **High** (degraded service) | 1 hour | Axiom alert |
| **Medium** (feature broken) | 4 hours | Next business day |
| **Low** (minor issue) | 24 hours | Backlog |

---

### 18.5 Bulk Merge Safeguards

Since we're using GHL's Delete API (which Custom Object Importer never used), extra precautions are critical:

#### Pre-Delete Requirements

```typescript
// NEVER delete without confirmed backup
const executeMerge = async (masterId: string, duplicateIds: string[]) => {
  // 1. Fetch FULL records for all duplicates
  const duplicateRecords = await Promise.all(
    duplicateIds.map(id => ghl.contacts.get(id))
  );

  // 2. Fetch master record (pre-merge state)
  const masterBefore = await ghl.contacts.get(masterId);

  // 3. Store backup in database FIRST
  const backup = await db.merge_history.create({
    master_id: masterId,
    rollback_snapshot: {
      master_before: masterBefore,
      duplicates: duplicateRecords.map(r => ({ id: r.id, data: r }))
    },
    rollback_expires_at: calculateExpiry(tenant.tier)
  });

  // 4. VERIFY backup was saved
  const savedBackup = await db.merge_history.findUnique({ id: backup.id });
  if (!savedBackup) {
    throw new Error('ABORT: Backup verification failed');
  }

  // 5. NOW proceed with merge/delete
  await performMerge(masterId, duplicateIds);
};
```

#### Bulk Merge Limits

| Safeguard | Implementation |
|-----------|----------------|
| **Max batch size** | 50 records per bulk merge (prevents massive accidents) |
| **Confirmation required** | Bulk merge always requires explicit confirmation |
| **Progress tracking** | Each merge in batch tracked individually |
| **Fail-fast** | Stop entire batch if any single backup fails |
| **Atomic logging** | Log each delete with GHL record ID before executing |

#### Recovery Guarantees

| Tier | Rollback Window | Related Records |
|------|-----------------|-----------------|
| Free | 24 hours | Notes, Tasks |
| Starter | 7 days | Notes, Tasks |
| Pro | 30 days | Notes, Tasks, Opportunities |
| Agency | 30 days | All + priority support |

#### Delete API Error Handling

```typescript
const deleteRecord = async (recordId: string, backupId: string) => {
  try {
    const result = await ghl.contacts.delete(recordId);

    // Log successful deletion
    await logDeletion(backupId, recordId, 'success');
    return result;

  } catch (error) {
    // Log failed deletion (record still exists in GHL)
    await logDeletion(backupId, recordId, 'failed', error.message);

    // Do NOT throw - continue with other records if bulk
    // Mark this record as "deletion_pending" for retry
    await markForRetry(backupId, recordId);

    return { success: false, error };
  }
};
```

---

## 19. Success Metrics

### 19.1 Product Metrics

| Metric | Target (Month 1) | Target (Month 6) | Stretch Goal |
|--------|------------------|------------------|--------------|
| **Installs** | 15 | 100 | 500 |
| **Active Users (WAU)** | 10 | 60 | 300 |
| **Paid Conversions** | 5% | 10% | 15% |
| **Merges Executed** | 200 | 5,000 | 50,000 |
| **Churn Rate** | < 15% | < 10% | < 5% |

*Based on Custom Object Importer benchmark: ~20 installs in 2 months*

---

### 19.2 Technical Metrics

| Metric | Target |
|--------|--------|
| **API Uptime** | 99.9% |
| **API p95 Latency** | < 500ms |
| **Scan p95 Duration** | < 10s (10K records) |
| **Merge Success Rate** | > 99% |
| **Rollback Success Rate** | > 95% |

---

### 19.3 User Satisfaction

| Metric | Target |
|--------|--------|
| **NPS Score** | > 40 |
| **Marketplace Rating** | > 4.5 stars |
| **Support Tickets/User** | < 0.5/month |
| **Feature Requests Implemented** | 2/month |

---

### 19.4 Business Metrics

| Metric | Target (Month 6) | Stretch Goal |
|--------|------------------|--------------|
| **MRR** | $500 | $5,000 |
| **Paying Customers** | 10 | 100 |
| **Customer Acquisition Cost** | < $50 | < $20 |
| **Lifetime Value** | > $300 | > $500 |
| **LTV:CAC Ratio** | > 6:1 | > 10:1 |

*Realistic: 10 paying customers × $50/month avg = $500 MRR*

---

## 20. Glossary

| Term | Definition |
|------|------------|
| **Contact** | A person record in GHL with name, email, phone, etc. |
| **Company/Business** | An organization record in GHL that can be linked to contacts |
| **Opportunity** | A deal/pipeline record in GHL representing potential revenue |
| **Custom Object** | User-defined record types in GHL |
| **Match Rule** | Configuration defining how to find duplicates (fields, thresholds) |
| **Merge Strategy** | Configuration defining how to combine duplicate records |
| **Master Record** | The surviving record after a merge |
| **Duplicate Record** | A record identified as matching another; deleted during merge |
| **Confidence Score** | 0-100% score indicating likelihood two records are duplicates |
| **Jaro-Winkler** | String similarity algorithm used for fuzzy matching |
| **Soundex** | Phonetic algorithm for matching names that sound alike |
| **Delta Sync** | Incremental sync of only changed records since last sync |
| **Rollback** | Restoring a merge by recreating the deleted duplicate |
| **Tenant** | A single GHL location installation (multi-tenant model) |
| **Location** | GHL's term for a sub-account under an agency |
| **Agency** | GHL's term for a company managing multiple locations |
| **Tier** | Subscription level: Free, Starter, Pro, Agency |
| **RLS** | Row-Level Security - PostgreSQL feature for tenant isolation |
| **BullMQ** | Redis-based job queue for background processing |
| **GHL API** | GoHighLevel's REST API for managing CRM data |
| **OAuth 2.0** | Authentication protocol used by GHL |
| **Webhook** | HTTP callback from GHL to notify of data changes |

---

## Appendix A: Effort Summary

| Phase | Duration | Backend Hours | Frontend Hours | Total Hours |
|-------|----------|---------------|----------------|-------------|
| Phase 1: Foundation | 3 weeks | 139h | 0h | 139h |
| Phase 2: Matching Engine | 3 weeks | 109h | 0h | 109h |
| Phase 3: Merge & Restore | 2 weeks | 74h | 0h | 74h |
| Phase 4: Job Scheduling | 2 weeks | 60h | 0h | 60h |
| Phase 5: Multi-Object | 2 weeks | 50h | 0h | 50h |
| Phase 6: Frontend MVP | 4 weeks | 20h | 140h | 160h |
| Phase 7: White-Label | 2 weeks | 20h | 20h | 40h |
| **Total** | **18 weeks** | **472h** | **160h** | **632h** |

---

## Appendix B: Dependencies & Prerequisites

| Dependency | Type | Owner | Due Date |
|------------|------|-------|----------|
| GHL Developer Account | External | Product | Week 0 |
| Vercel Account | External | DevOps | Week 0 |
| Render Account | External | DevOps | Week 0 |
| Supabase Project | External | DevOps | Week 0 |
| Domain (mergematch.app) | External | DevOps | Week 1 |
| Privacy Policy | Legal | Legal | Week 14 |
| Terms of Service | Legal | Legal | Week 14 |

**Note:** Billing is handled via GHL Marketplace internal billing (no Stripe needed).

---

## Appendix C: GHL API Index

Complete index of GHL API endpoints used by MergeMatch, organized by object type.

### Contacts

| Operation | Method | Endpoint | Scope | Phase |
|-----------|--------|----------|-------|-------|
| List contacts | `GET` | `/contacts/` | `contacts.readonly` | 1 |
| Get contact | `GET` | `/contacts/{contactId}` | `contacts.readonly` | 1 |
| Update contact | `PUT` | `/contacts/{contactId}` | `contacts.write` | 3 |
| Delete contact | `DELETE` | `/contacts/{contactId}` | `contacts.write` | 3 |
| Get contact by email | `GET` | `/contacts/lookup?email=` | `contacts.readonly` | 2 |
| Get contact by phone | `GET` | `/contacts/lookup?phone=` | `contacts.readonly` | 2 |

**Query Parameters (List):**
- `limit` (max 100, default 20)
- `startAfter` (cursor pagination)
- `startAfterId` (ID-based pagination)
- `query` (search string)

**Webhooks:**
- `ContactCreate` - New contact created
- `ContactUpdate` - Contact modified
- `ContactDelete` - Contact deleted

---

### Notes (Contact Related)

| Operation | Method | Endpoint | Scope | Phase |
|-----------|--------|----------|-------|-------|
| List notes | `GET` | `/contacts/{contactId}/notes` | `contacts.readonly` | 3 |
| Create note | `POST` | `/contacts/{contactId}/notes` | `contacts.write` | 3 |
| Get note | `GET` | `/contacts/{contactId}/notes/{noteId}` | `contacts.readonly` | 3 |
| Update note | `PUT` | `/contacts/{contactId}/notes/{noteId}` | `contacts.write` | 3 |
| Delete note | `DELETE` | `/contacts/{contactId}/notes/{noteId}` | `contacts.write` | 3 |

**Usage:** Copy notes from duplicate to master during merge.

---

### Tasks (Contact Related)

| Operation | Method | Endpoint | Scope | Phase |
|-----------|--------|----------|-------|-------|
| List tasks | `GET` | `/contacts/{contactId}/tasks` | `contacts.readonly` | 3 |
| Create task | `POST` | `/contacts/{contactId}/tasks` | `contacts.write` | 3 |
| Get task | `GET` | `/contacts/{contactId}/tasks/{taskId}` | `contacts.readonly` | 3 |
| Update task | `PUT` | `/contacts/{contactId}/tasks/{taskId}` | `contacts.write` | 3 |
| Delete task | `DELETE` | `/contacts/{contactId}/tasks/{taskId}` | `contacts.write` | 3 |

**Usage:** Copy tasks from duplicate to master during merge.

---

### Companies (Businesses)

| Operation | Method | Endpoint | Scope | Phase |
|-----------|--------|----------|-------|-------|
| List businesses | `GET` | `/businesses/` | `businesses.readonly` | 5 |
| Get business | `GET` | `/businesses/{businessId}` | `businesses.readonly` | 5 |
| Create business | `POST` | `/businesses/` | `businesses.write` | 5 |
| Update business | `PUT` | `/businesses/{businessId}` | `businesses.write` | 5 |
| Delete business | `DELETE` | `/businesses/{businessId}` | `businesses.write` | 5 |
| Get by contact | `GET` | `/businesses/search?contactId=` | `businesses.readonly` | 5 |

**Webhooks:**
- `RecordCreate` (type: business) - New business created
- `RecordUpdate` (type: business) - Business modified
- `RecordDelete` (type: business) - Business deleted

---

### Opportunities

| Operation | Method | Endpoint | Scope | Phase |
|-----------|--------|----------|-------|-------|
| List opportunities | `GET` | `/opportunities/search` | `opportunities.readonly` | 5 |
| Get opportunity | `GET` | `/opportunities/{opportunityId}` | `opportunities.readonly` | 5 |
| Create opportunity | `POST` | `/opportunities/` | `opportunities.write` | 5 |
| Update opportunity | `PUT` | `/opportunities/{opportunityId}` | `opportunities.write` | 5 |
| Delete opportunity | `DELETE` | `/opportunities/{opportunityId}` | `opportunities.write` | 5 |
| List pipelines | `GET` | `/opportunities/pipelines` | `opportunities.readonly` | 5 |

**Query Parameters:**
- `contact_id` - Filter by contact
- `pipeline_id` - Filter by pipeline
- `stage_id` - Filter by stage
- `status` - open/won/lost/abandoned

**Webhooks:**
- `OpportunityCreate` - New opportunity created
- `OpportunityUpdate` - Opportunity modified
- `OpportunityDelete` - Opportunity deleted
- `OpportunityStatusUpdate` - Opportunity status changed
- `OpportunityMonetaryValueUpdate` - Value changed
- `OpportunityStageUpdate` - Stage changed

---

### Custom Objects

| Operation | Method | Endpoint | Scope | Phase |
|-----------|--------|----------|-------|-------|
| List schemas | `GET` | `/objects/schemas` | `objects/schema.readonly` | 5 |
| Get schema | `GET` | `/objects/schemas/{schemaKey}` | `objects/schema.readonly` | 5 |
| List records | `GET` | `/objects/records` | `objects/record.readonly` | 5 |
| Get record | `GET` | `/objects/records/{recordId}` | `objects/record.readonly` | 5 |
| Create record | `POST` | `/objects/records` | `objects/record.write` | 5 |
| Update record | `PUT` | `/objects/records/{recordId}` | `objects/record.write` | 5 |
| Delete record | `DELETE` | `/objects/records/{recordId}` | `objects/record.write` | 5 |

**Query Parameters:**
- `schemaKey` - Filter by object type
- `limit` (max 100)

**Webhooks:**
- `RecordCreate` - New record created
- `RecordUpdate` - Record modified
- `RecordDelete` - Record deleted

---

### Custom Fields

| Operation | Method | Endpoint | Scope | Phase |
|-----------|--------|----------|-------|-------|
| List custom fields | `GET` | `/locations/{locationId}/customFields` | `locations/customFields.readonly` | 2 |
| Get custom field | `GET` | `/locations/{locationId}/customFields/{id}` | `locations/customFields.readonly` | 2 |

**Usage:** Fetch field definitions for matching configuration UI.

---

### Tags

| Operation | Method | Endpoint | Scope | Phase |
|-----------|--------|----------|-------|-------|
| List tags | `GET` | `/locations/{locationId}/tags` | `locations/tags.readonly` | 2 |
| Get tag | `GET` | `/locations/{locationId}/tags/{tagId}` | `locations/tags.readonly` | 2 |

**Usage:** Display available tags in matching/merge UI.

---

### Location Info

| Operation | Method | Endpoint | Scope | Phase |
|-----------|--------|----------|-------|-------|
| Get location | `GET` | `/locations/{locationId}` | `locations.readonly` | 1 |

**Usage:** Fetch location name and settings for display/white-label.

---

### OAuth & Marketplace Installation

| Operation | Method | Endpoint | Scope | Phase |
|-----------|--------|----------|-------|-------|
| Authorize | `GET` | `/oauth/chooselocation` | N/A | 1 |
| Token exchange | `POST` | `/oauth/token` | N/A | 1 |
| Get location token | `GET` | `/oauth/locationToken` | N/A | 1 |
| Get installed locations | `GET` | `/oauth/installedLocations` | N/A | 1 |
| Get installer details | `GET` | `/marketplace-installer-details` | `marketplace-installer-details.readonly` | 1 |

**Usage:**
- OAuth 2.0 flow for app installation
- Bulk/agency installs use `installedLocations` + `locationToken` exchange
- `marketplace-installer-details` provides user info for whitelabeling

---

### White-Label / Branding

| Operation | Method | Endpoint | Scope | Phase |
|-----------|--------|----------|-------|-------|
| Get company info | `GET` | `/companies/{companyId}` | `companies.readonly` | 7 |
| Get location branding | `GET` | `/locations/{locationId}` | `locations.readonly` | 7 |

**Usage:** Fetch agency/location branding for white-label display (logo, company name, colors).

---

### API Rate Limits

| Limit Type | Value | Scope |
|------------|-------|-------|
| **Burst** | 100 requests / 10 seconds | Per location |
| **Daily** | 200,000 requests / day | Per location |
| **Batch** | Max 100 records per request | List endpoints |

**Best Practices:**
- Use pagination (`startAfterId`) for large data sets
- Implement exponential backoff on 429 responses
- Cache field definitions (rarely change)
- Use webhooks instead of polling where available

---

### API Base URLs

| Environment | URL |
|-------------|-----|
| **Production** | `https://services.leadconnectorhq.com` |
| **OAuth** | `https://marketplace.leadconnectorhq.com/oauth` |
| **Webhooks** | Configured in Developer Portal |

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Dec 17, 2024 | AI | Initial draft |
| 2.0 | Dec 26, 2024 | AI | Complete PRD with all 20 sections + appendices |

