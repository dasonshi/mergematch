# MergeMatch: LeanData for GoHighLevel - Technical Design Document

## Executive Summary

**Product**: MergeMatch - A white-label data matching and deduplication platform for GoHighLevel
**Target**: Agencies white-labeling to SMB clients
**MVP Scope**: Match + Dedup (no routing) with full multi-object support
**Pricing**: Per-location flat fee
**Deployment**: Cloud SaaS (hosted)
**UI**: Embedded within GHL

---

## 1. DATA ARCHITECTURE

### 1.1 Multi-Tenant Model

**Pattern**: Shared Database with Row-Level Security (Pool Model)

```
┌─────────────────────────────────────────────────────────────────┐
│                        FLOWMATCH CLOUD                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │  Agency A   │    │  Agency B   │    │  Agency C   │         │
│  │  (Tenant)   │    │  (Tenant)   │    │  (Tenant)   │         │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘         │
│         │                  │                  │                 │
│  ┌──────┴──────┐    ┌──────┴──────┐    ┌──────┴──────┐         │
│  │ Location 1  │    │ Location 1  │    │ Location 1  │         │
│  │ Location 2  │    │ Location 2  │    │ Location 2  │         │
│  │ Location 3  │    │ Location 3  │    │ ...         │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┤
│  │              SHARED PostgreSQL DATABASE                      │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │  │ tenants │ │locations│ │ matches │ │ merges  │           │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
│  │  Row-Level Security: WHERE tenant_id = current_tenant()     │
│  └─────────────────────────────────────────────────────────────┤
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Core Database Schema

```sql
-- =============================================
-- TENANT & LOCATION MANAGEMENT
-- =============================================

CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ghl_company_id VARCHAR(50) UNIQUE NOT NULL,  -- GHL Agency ID
    name VARCHAR(255),

    -- White-label settings
    branding JSONB DEFAULT '{}',  -- logo_url, primary_color, app_name

    -- Subscription
    plan VARCHAR(50) DEFAULT 'starter',  -- starter, pro, enterprise
    billing_status VARCHAR(20) DEFAULT 'active',

    -- OAuth tokens (encrypted)
    ghl_access_token_encrypted TEXT,
    ghl_refresh_token_encrypted TEXT,
    token_expires_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    ghl_location_id VARCHAR(50) NOT NULL,
    name VARCHAR(255),

    -- Per-location OAuth (if using location-level tokens)
    ghl_access_token_encrypted TEXT,
    ghl_refresh_token_encrypted TEXT,
    token_expires_at TIMESTAMP,

    -- Location-specific settings
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(tenant_id, ghl_location_id)
);

-- =============================================
-- MATCHING RULES CONFIGURATION
-- =============================================

CREATE TABLE match_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,  -- NULL = tenant-wide default

    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- What objects this rule applies to
    source_object VARCHAR(50) NOT NULL,  -- 'contact', 'company', 'opportunity', 'custom:vehicle'
    target_object VARCHAR(50),           -- For cross-object matching (contact -> company)

    -- Matching configuration
    match_fields JSONB NOT NULL,  -- Array of field matching configs
    /*
    [
        {
            "source_field": "email",
            "target_field": "email",
            "match_type": "exact",      -- exact, fuzzy, domain, phonetic
            "weight": 0.4,
            "required": true
        },
        {
            "source_field": "company_name",
            "target_field": "name",
            "match_type": "fuzzy",
            "threshold": 0.85,
            "weight": 0.3,
            "required": false
        }
    ]
    */

    -- Scoring thresholds
    auto_merge_threshold DECIMAL(3,2) DEFAULT 0.95,  -- 95%+ = auto-merge
    review_threshold DECIMAL(3,2) DEFAULT 0.70,       -- 70-95% = human review

    -- Master record selection
    master_selection_strategy VARCHAR(50) DEFAULT 'most_complete',
    /* Options:
       - 'most_complete': Record with most populated fields
       - 'oldest': First created record
       - 'newest': Most recently created record
       - 'most_recent_activity': Most recently updated
       - 'custom': Use master_selection_rules
    */
    master_selection_rules JSONB,  -- Custom field-based rules

    is_active BOOLEAN DEFAULT true,
    priority INT DEFAULT 0,  -- Higher = runs first

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- MATCH DETECTION & HISTORY
-- =============================================

CREATE TABLE match_pairs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,

    -- Match rule that detected this
    match_rule_id UUID REFERENCES match_rules(id),

    -- The two records being compared
    record_a_id VARCHAR(100) NOT NULL,      -- GHL record ID
    record_a_type VARCHAR(50) NOT NULL,      -- contact, company, opportunity, custom:X
    record_b_id VARCHAR(100) NOT NULL,
    record_b_type VARCHAR(50) NOT NULL,

    -- Match scoring
    confidence_score DECIMAL(3,2) NOT NULL,  -- 0.00 - 1.00
    field_scores JSONB,  -- Per-field breakdown
    /*
    {
        "email": { "score": 1.0, "match_type": "exact", "values": ["john@acme.com", "john@acme.com"] },
        "company_name": { "score": 0.92, "match_type": "fuzzy", "values": ["Acme Inc", "Acme Incorporated"] }
    }
    */

    -- Status tracking
    status VARCHAR(30) DEFAULT 'pending',
    /* Status values:
       - 'pending': Detected, awaiting review
       - 'approved': Confirmed as duplicate
       - 'rejected': Confirmed as NOT duplicate
       - 'merged': Successfully merged
       - 'merge_failed': Merge attempted but failed
       - 'auto_merged': Merged automatically (high confidence)
    */

    -- Resolution
    reviewed_by UUID,
    reviewed_at TIMESTAMP,
    merge_id UUID,  -- Links to merges table if merged

    -- Detection metadata
    detected_by VARCHAR(30),  -- 'webhook', 'scheduled_job', 'manual_scan'
    job_id UUID,              -- Links to dedup_jobs if from scheduled job

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Prevent duplicate pair entries
    UNIQUE(location_id, record_a_id, record_b_id)
);

CREATE INDEX idx_match_pairs_status ON match_pairs(tenant_id, location_id, status);
CREATE INDEX idx_match_pairs_confidence ON match_pairs(confidence_score DESC);

-- =============================================
-- MERGE OPERATIONS & SNAPSHOTS (FOR RESTORE)
-- =============================================

CREATE TABLE merges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,

    -- Source match pair
    match_pair_id UUID REFERENCES match_pairs(id),

    -- Records involved
    master_record_id VARCHAR(100) NOT NULL,
    master_record_type VARCHAR(50) NOT NULL,
    merged_record_ids VARCHAR(100)[] NOT NULL,  -- Array of IDs that were merged into master

    -- Merge configuration used
    field_selections JSONB NOT NULL,  -- Which value was kept for each field
    /*
    {
        "email": { "source": "master", "value": "john@acme.com" },
        "phone": { "source": "merged_0", "value": "555-0123" },
        "company_name": { "source": "master", "value": "Acme Inc" }
    }
    */

    -- Execution details
    status VARCHAR(30) DEFAULT 'pending',
    /* Status values:
       - 'pending': Merge queued
       - 'in_progress': Currently executing
       - 'completed': Successfully merged
       - 'failed': Merge failed
       - 'rolled_back': Merge was undone
    */

    executed_at TIMESTAMP,
    executed_by UUID,  -- User or 'system' for auto-merge

    -- Error tracking
    error_message TEXT,
    retry_count INT DEFAULT 0,

    -- Rollback capability
    can_rollback BOOLEAN DEFAULT true,
    rollback_expires_at TIMESTAMP,  -- After this, rollback not possible
    rolled_back_at TIMESTAMP,
    rolled_back_by UUID,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE merge_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merge_id UUID NOT NULL REFERENCES merges(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Complete record state before merge
    record_id VARCHAR(100) NOT NULL,
    record_type VARCHAR(50) NOT NULL,
    snapshot_data JSONB NOT NULL,  -- Full record state from GHL API

    -- For restoration
    is_master BOOLEAN DEFAULT false,

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_merge_snapshots_merge ON merge_snapshots(merge_id);

-- =============================================
-- SCHEDULED JOB MANAGEMENT
-- =============================================

CREATE TABLE dedup_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,  -- NULL = all locations

    -- Job configuration
    name VARCHAR(255),
    job_type VARCHAR(30) NOT NULL,
    /* Job types:
       - 'full_scan': Scan all records
       - 'incremental': Only new/modified records since last run
       - 'object_scan': Scan specific object type
       - 'rule_test': Test match rules without executing
    */

    match_rule_ids UUID[],  -- Specific rules to run, NULL = all active rules
    object_types VARCHAR(50)[],  -- Specific objects to scan

    -- Scheduling
    schedule_type VARCHAR(30),  -- 'manual', 'hourly', 'daily', 'weekly'
    schedule_cron VARCHAR(100),  -- Cron expression for custom schedules
    next_run_at TIMESTAMP,
    last_run_at TIMESTAMP,

    -- Current execution state
    status VARCHAR(30) DEFAULT 'idle',
    /* Status values:
       - 'idle': Not running
       - 'queued': Waiting in job queue
       - 'running': Currently executing
       - 'paused': Temporarily paused
       - 'completed': Finished successfully
       - 'failed': Failed with error
       - 'cancelled': Manually cancelled
    */

    current_run_id UUID,  -- Links to dedup_job_runs

    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE dedup_job_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES dedup_jobs(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Execution timing
    started_at TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP,

    -- Progress tracking
    status VARCHAR(30) DEFAULT 'running',
    progress_percent INT DEFAULT 0,
    current_phase VARCHAR(50),  -- 'fetching_records', 'matching', 'scoring', 'saving'

    -- Results
    records_scanned INT DEFAULT 0,
    matches_found INT DEFAULT 0,
    auto_merges INT DEFAULT 0,
    pending_reviews INT DEFAULT 0,
    errors INT DEFAULT 0,

    -- Performance metrics
    processing_time_ms BIGINT,

    -- Error details
    error_log JSONB DEFAULT '[]',

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_job_runs_job ON dedup_job_runs(job_id, started_at DESC);

-- =============================================
-- AUDIT LOG (IMMUTABLE EVENT STORE)
-- =============================================

CREATE TABLE audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,  -- No FK for performance
    location_id UUID,

    -- Event identification
    event_type VARCHAR(50) NOT NULL,
    /* Event types:
       - 'match_detected'
       - 'match_approved'
       - 'match_rejected'
       - 'merge_started'
       - 'merge_completed'
       - 'merge_failed'
       - 'merge_rolled_back'
       - 'rule_created'
       - 'rule_updated'
       - 'job_started'
       - 'job_completed'
       - 'settings_changed'
    */

    -- Entity reference
    entity_type VARCHAR(50),
    entity_id VARCHAR(100),

    -- Event data
    event_data JSONB NOT NULL,

    -- Actor
    actor_type VARCHAR(30),  -- 'user', 'system', 'webhook'
    actor_id VARCHAR(100),

    -- Correlation for tracing
    correlation_id UUID,

    -- Timestamp (immutable)
    event_timestamp TIMESTAMP NOT NULL DEFAULT NOW(),

    -- Partitioning key
    event_date DATE NOT NULL DEFAULT CURRENT_DATE
) PARTITION BY RANGE (event_date);

-- Create monthly partitions
CREATE TABLE audit_events_2025_01 PARTITION OF audit_events
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
-- ... create more partitions as needed

CREATE INDEX idx_audit_tenant_time ON audit_events(tenant_id, event_timestamp DESC);
CREATE INDEX idx_audit_entity ON audit_events(entity_type, entity_id);

-- =============================================
-- ROW-LEVEL SECURITY
-- =============================================

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_pairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE merges ENABLE ROW LEVEL SECURITY;
ALTER TABLE merge_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE dedup_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE dedup_job_runs ENABLE ROW LEVEL SECURITY;

-- Create policies (example for match_pairs)
CREATE POLICY tenant_isolation_match_pairs ON match_pairs
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

---

## 2. FUNCTIONALITY SPECIFICATION

### 2.1 Core Matching Engine

```
┌────────────────────────────────────────────────────────────────┐
│                     MATCHING PIPELINE                          │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────┐                                              │
│  │   INGEST     │  ← Webhook (contact.created, form.submitted) │
│  │              │  ← Scheduled job (batch scan)                │
│  │              │  ← Manual trigger (single record)            │
│  └──────┬───────┘                                              │
│         │                                                      │
│         ▼                                                      │
│  ┌──────────────┐                                              │
│  │   BLOCKING   │  ← Reduce comparison space                   │
│  │              │    • First 3 chars of name                   │
│  │              │    • Email domain                            │
│  │              │    • Phone area code                         │
│  └──────┬───────┘                                              │
│         │                                                      │
│         ▼                                                      │
│  ┌──────────────┐                                              │
│  │   COMPARE    │  ← Apply match rules                         │
│  │              │    • Exact match                             │
│  │              │    • Fuzzy (Jaro-Winkler, Levenshtein)       │
│  │              │    • Domain extraction                       │
│  │              │    • Phonetic (Soundex, Metaphone)           │
│  └──────┬───────┘                                              │
│         │                                                      │
│         ▼                                                      │
│  ┌──────────────┐                                              │
│  │    SCORE     │  ← Weighted composite scoring                │
│  │              │    • Field weights from rule config          │
│  │              │    • Tiebreaker logic                        │
│  │              │    • Confidence classification               │
│  └──────┬───────┘                                              │
│         │                                                      │
│         ▼                                                      │
│  ┌──────────────┐                                              │
│  │   DECIDE     │  ← Route based on confidence                 │
│  │              │    • 95%+ → Auto-merge queue                 │
│  │              │    • 70-94% → Human review queue             │
│  │              │    • <70% → Discard or flag for research     │
│  └──────────────┘                                              │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### 2.2 Supported Match Types

| Match Type | Algorithm | Use Case | Example |
|------------|-----------|----------|---------|
| `exact` | String equality | Emails, IDs | `john@acme.com` = `john@acme.com` |
| `exact_normalized` | Lowercase, trim | Case-insensitive | `John@ACME.com` = `john@acme.com` |
| `fuzzy` | Jaro-Winkler | Names, company names | `Jon Smith` ≈ `John Smith` (0.92) |
| `fuzzy_levenshtein` | Levenshtein distance | Typos | `Acme Inc` ≈ `Acme In.` (0.88) |
| `domain` | Email domain extraction | Company matching | `john@acme.com` → `acme.com` |
| `phonetic` | Soundex/Metaphone | Name variations | `Smith` ≈ `Smyth` |
| `phone_normalized` | Strip formatting | Phone numbers | `(555) 123-4567` = `5551234567` |
| `address_normalized` | Standardize addresses | Locations | `123 Main St` = `123 Main Street` |

### 2.3 Object Support Matrix

| Object Type | GHL API | Match Fields | Cross-Object Match |
|-------------|---------|--------------|-------------------|
| **Contact** | `/contacts` | email, phone, name, company_name, custom fields | → Company (via domain/name) |
| **Company** | `/businesses` | name, website, domain, address, custom fields | ← Contact (association) |
| **Opportunity** | `/opportunities` | name, contact, company, value, pipeline | → Contact, Company |
| **Custom Objects** | `/custom-objects/{key}` | All custom fields | → Any object via config |

### 2.4 Master Record Selection

```python
# Master Selection Strategies

class MasterSelectionStrategy(Enum):
    MOST_COMPLETE = "most_complete"      # Record with most non-null fields
    OLDEST = "oldest"                     # First created (dateAdded)
    NEWEST = "newest"                     # Most recently created
    MOST_RECENT_ACTIVITY = "most_recent"  # Most recently updated
    HIGHEST_ENGAGEMENT = "engagement"     # Most activities/notes/tasks
    CUSTOM_RULES = "custom"               # Field-based priority rules

# Custom rule example:
{
    "strategy": "custom",
    "rules": [
        { "field": "source", "prefer_values": ["referral", "organic"], "weight": 3 },
        { "field": "email", "prefer": "not_null", "weight": 2 },
        { "field": "phone", "prefer": "not_null", "weight": 2 },
        { "field": "dateAdded", "prefer": "oldest", "weight": 1 }
    ],
    "tiebreaker": "oldest"
}
```

### 2.5 Merge Execution Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     MERGE EXECUTION                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. VALIDATE                                                │
│     ├─ Check records still exist in GHL                     │
│     ├─ Verify no concurrent merge in progress               │
│     └─ Confirm user has permission                          │
│                                                             │
│  2. SNAPSHOT                                                │
│     ├─ Fetch complete record state from GHL API             │
│     ├─ Store in merge_snapshots table                       │
│     └─ Calculate rollback_expires_at (default: 30 days)     │
│                                                             │
│  3. PREPARE                                                 │
│     ├─ Determine master record                              │
│     ├─ Calculate field selections (best value per field)    │
│     └─ Prepare GHL API update payload                       │
│                                                             │
│  4. EXECUTE                                                 │
│     ├─ Update master record with merged field values        │
│     ├─ Transfer associations (notes, tasks, opportunities)  │
│     ├─ Delete merged (non-master) records                   │
│     └─ Handle rate limits with exponential backoff          │
│                                                             │
│  5. VERIFY                                                  │
│     ├─ Confirm master record updated                        │
│     ├─ Confirm merged records deleted                       │
│     └─ Verify associations transferred                      │
│                                                             │
│  6. RECORD                                                  │
│     ├─ Update merge status = 'completed'                    │
│     ├─ Update match_pair status = 'merged'                  │
│     └─ Create audit_event                                   │
│                                                             │
│  ERROR HANDLING:                                            │
│     ├─ On API error → Retry with backoff (max 3)            │
│     ├─ On validation error → Mark failed, notify user       │
│     └─ On partial failure → Attempt rollback                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.6 Rollback/Restore Mechanism

```
ROLLBACK PROCESS:

1. User clicks "Undo Merge" within rollback window (30 days default)

2. System validates:
   - Merge is within rollback_expires_at
   - Master record still exists
   - Snapshots are available

3. For each merged record:
   a. Create new record in GHL with snapshot_data
   b. Get new GHL record ID
   c. Update any references (if trackable)

4. For master record:
   a. Restore original master snapshot_data
   b. Remove field values that came from merged records

5. Update records:
   - merge.status = 'rolled_back'
   - merge.rolled_back_at = NOW()
   - match_pair.status = 'pending' (re-enters review queue)

6. Create audit_event for rollback

NOTE: Associations (notes, tasks) cannot be fully restored to
      original records - they remain on master. User is warned.
```

### 2.7 Job Scheduling System

```
┌─────────────────────────────────────────────────────────────┐
│                    JOB SCHEDULER                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  CELERY BEAT (Scheduler)                                    │
│  └─ Checks dedup_jobs table every minute                    │
│     └─ For jobs where next_run_at <= NOW() AND is_active    │
│        └─ Queue task to CELERY WORKER                       │
│                                                             │
│  CELERY WORKER (Executor)                                   │
│  └─ Receives job task                                       │
│     ├─ Creates dedup_job_run record                         │
│     ├─ Fetches records from GHL API (with pagination)       │
│     ├─ Runs matching pipeline                               │
│     ├─ Saves match_pairs                                    │
│     ├─ Executes auto-merges (if confidence >= threshold)    │
│     ├─ Updates job_run with results                         │
│     └─ Calculates next_run_at based on schedule             │
│                                                             │
│  SCHEDULE TYPES:                                            │
│  ├─ manual: Only runs when triggered by user                │
│  ├─ hourly: Runs every hour (incremental scan)              │
│  ├─ daily: Runs once per day at specified time              │
│  ├─ weekly: Runs once per week on specified day             │
│  └─ custom: Cron expression for complex schedules           │
│                                                             │
│  RATE LIMIT HANDLING:                                       │
│  ├─ GHL limit: 100 requests / 10 seconds per location       │
│  ├─ Implement request throttling in worker                  │
│  ├─ Track X-RateLimit headers                               │
│  └─ Pause and resume on 429 responses                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. UI/UX DESIGN

### 3.1 GHL Embedded App Structure

```
┌─────────────────────────────────────────────────────────────┐
│  GHL SIDEBAR                                                │
│  ├─ Dashboard                                               │
│  ├─ Conversations                                           │
│  ├─ Contacts                                                │
│  ├─ ...                                                     │
│  ├─ ──────────────                                          │
│  └─ 🔗 MergeMatch  ← Embedded App Entry Point                │
│        ├─ Overview                                          │
│        ├─ Duplicates                                        │
│        ├─ Match Rules                                       │
│        ├─ Scheduled Jobs                                    │
│        └─ Settings                                          │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Screen Wireframes

#### 3.2.1 Overview Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│  MergeMatch Overview                              [Settings] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │     23      │  │      8      │  │    156      │         │
│  │  Pending    │  │  Auto-      │  │  Merged     │         │
│  │  Review     │  │  Merged     │  │  This Month │         │
│  │             │  │  Today      │  │             │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Recent Activity                                        ││
│  ├─────────────────────────────────────────────────────────┤│
│  │  🟢 Auto-merged: John Smith + Jon Smith (98%)    2m ago ││
│  │  🟡 Pending: Acme Inc + Acme LLC (87%)          15m ago ││
│  │  🟢 Auto-merged: jane@co.com + jane@co.io (96%) 1h ago  ││
│  │  🔵 Job completed: Daily Contact Scan            3h ago ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Match Confidence Distribution (Last 30 Days)           ││
│  │  ████████████████░░░░ 95-100% (auto-merge): 45%         ││
│  │  ████████░░░░░░░░░░░░ 70-94% (review): 35%              ││
│  │  ████░░░░░░░░░░░░░░░░ <70% (rejected): 20%              ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 3.2.2 Duplicates Review Queue

```
┌─────────────────────────────────────────────────────────────┐
│  Duplicates                    [Filter ▼] [Object ▼] [Scan]│
├─────────────────────────────────────────────────────────────┤
│  ☑ Select All (23)                     [Merge Selected]    │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ ☐  CONTACT  │  87% Confidence  │  Detected: 2h ago     ││
│  ├─────────────────────────────────────────────────────────┤│
│  │                                                         ││
│  │  ┌───────────────────┬───────────────────┐             ││
│  │  │   Record A        │    Record B       │             ││
│  │  ├───────────────────┼───────────────────┤             ││
│  │  │ John Smith        │ Jon Smith         │  ⚠ Fuzzy    ││
│  │  │ john@acme.com     │ john@acme.com     │  ✓ Exact    ││
│  │  │ (555) 123-4567    │ —                 │             ││
│  │  │ Acme Inc          │ Acme Incorporated │  ⚠ Fuzzy    ││
│  │  │ Created: Jan 5    │ Created: Mar 12   │             ││
│  │  └───────────────────┴───────────────────┘             ││
│  │                                                         ││
│  │  [View Details]  [Merge →]  [Not a Duplicate]          ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ ☐  COMPANY  │  92% Confidence  │  Detected: 5h ago     ││
│  │  ... similar layout ...                                 ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  [← Previous]  Page 1 of 3  [Next →]                        │
└─────────────────────────────────────────────────────────────┘
```

#### 3.2.3 Merge Preview Modal

```
┌─────────────────────────────────────────────────────────────┐
│  Merge Preview                                         [X]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Master Record: ○ Record A (Recommended)  ○ Record B       │
│  Reason: Most complete data, older record                   │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  FIELD           │ RECORD A      │ RECORD B     │ MERGED   │
│  ─────────────────────────────────────────────────────────  │
│  Name            │ ● John Smith  │ ○ Jon Smith  │ John S.. │
│  Email           │ ● john@acme.. │ ● john@acme..│ john@a.. │
│  Phone           │ ● (555) 123.. │ ○ —          │ (555)1.. │
│  Company         │ ○ Acme Inc    │ ● Acme Incor.│ Acme I.. │
│  Created         │ Jan 5, 2024   │ Mar 12, 2024 │          │
│  Last Activity   │ Dec 1, 2024   │ Dec 15, 2024 │          │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ⚠ Record B will be permanently deleted.                   │
│  ⚠ Associated notes, tasks, and opportunities will be      │
│    transferred to the master record.                        │
│                                                             │
│  ☐ I understand this action is reversible for 30 days      │
│                                                             │
│  [Cancel]                                   [Confirm Merge] │
└─────────────────────────────────────────────────────────────┘
```

#### 3.2.4 Match Rules Configuration

```
┌─────────────────────────────────────────────────────────────┐
│  Match Rules                                    [+ New Rule]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Contact Deduplication (Default)          🟢 Active      ││
│  │ Object: Contact → Contact                               ││
│  │ Auto-merge: ≥95%  |  Review: ≥70%                       ││
│  │ Fields: email (exact, 40%), name (fuzzy, 30%),          ││
│  │         company (fuzzy, 20%), phone (exact, 10%)        ││
│  │                                          [Edit] [Test]  ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Lead-to-Company Matching              🟢 Active         ││
│  │ Object: Contact → Company                               ││
│  │ Auto-merge: ≥90%  |  Review: ≥75%                       ││
│  │ Fields: email_domain → website (domain, 50%),           ││
│  │         company_name → name (fuzzy, 50%)                ││
│  │                                          [Edit] [Test]  ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Company Deduplication                 ⚪ Inactive        ││
│  │ ...                                                     ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 3.2.5 Rule Editor

```
┌─────────────────────────────────────────────────────────────┐
│  Edit Match Rule: Contact Deduplication            [Save]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Rule Name: [Contact Deduplication                    ]    │
│  Status:    ● Active  ○ Inactive                            │
│                                                             │
│  SOURCE OBJECT                  TARGET OBJECT               │
│  [Contact           ▼]    →    [Contact           ▼]       │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│  MATCHING FIELDS                                            │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Source: [email        ▼]  Target: [email        ▼]     ││
│  │ Match:  [Exact        ▼]  Weight: [====40%====    ]    ││
│  │ ☑ Required                                    [Remove] ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Source: [name         ▼]  Target: [name         ▼]     ││
│  │ Match:  [Fuzzy        ▼]  Threshold: [===85%===    ]   ││
│  │         Weight: [====30%====    ]                       ││
│  │ ☐ Required                                    [Remove] ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  [+ Add Field]                                              │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│  THRESHOLDS                                                 │
│  ─────────────────────────────────────────────────────────  │
│  Auto-merge when confidence ≥ [==95%==    ]                 │
│  Queue for review when ≥ [==70%==    ]                      │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│  MASTER RECORD SELECTION                                    │
│  ─────────────────────────────────────────────────────────  │
│  Strategy: [Most Complete Data  ▼]                          │
│  Tiebreaker: [Oldest Record     ▼]                          │
│                                                             │
│  [Cancel]  [Test Rule]                             [Save]   │
└─────────────────────────────────────────────────────────────┘
```

#### 3.2.6 Scheduled Jobs

```
┌─────────────────────────────────────────────────────────────┐
│  Scheduled Jobs                                 [+ New Job] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Daily Contact Scan                       🟢 Active      ││
│  │ Schedule: Every day at 2:00 AM                          ││
│  │ Objects: Contacts                                       ││
│  │ Last Run: Dec 17, 2:00 AM - 1,234 scanned, 23 matches   ││
│  │ Next Run: Dec 18, 2:00 AM                               ││
│  │                              [Run Now] [Edit] [Disable] ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Weekly Full Scan                         🟢 Active      ││
│  │ Schedule: Every Sunday at 3:00 AM                       ││
│  │ Objects: All (Contacts, Companies, Opportunities)       ││
│  │ Last Run: Dec 15, 3:00 AM - 5,678 scanned, 89 matches   ││
│  │ Next Run: Dec 22, 3:00 AM                               ││
│  │                              [Run Now] [Edit] [Disable] ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│  JOB HISTORY                                                │
│  ─────────────────────────────────────────────────────────  │
│  │ Dec 17, 2:00 AM │ Daily Contact Scan │ ✓ 1,234 │ 23 │  ││
│  │ Dec 16, 2:00 AM │ Daily Contact Scan │ ✓ 1,198 │ 18 │  ││
│  │ Dec 15, 3:00 AM │ Weekly Full Scan   │ ✓ 5,678 │ 89 │  ││
│  │ Dec 15, 2:00 AM │ Daily Contact Scan │ ✓ 1,156 │ 21 │  ││
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 3.2.7 Merge History (with Restore)

```
┌─────────────────────────────────────────────────────────────┐
│  Merge History                    [Filter ▼] [Export CSV]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  DATE        │ TYPE    │ RECORDS           │ CONF │ ACTION │
│  ─────────────────────────────────────────────────────────  │
│  Dec 17 2:15 │ Contact │ John S. + Jon S.  │ 98%  │ [Undo] │
│  Dec 17 2:00 │ Contact │ jane@ + jane@     │ 96%  │ [Undo] │
│  Dec 16 9:30 │ Company │ Acme + Acme LLC   │ 92%  │ [Undo] │
│  Dec 15 3:12 │ Contact │ Bob W. + Robert W │ 95%  │ [Undo] │
│  Nov 20 1:00 │ Contact │ Mike + Michael    │ 97%  │ Expired│
│                                                             │
│  [← Previous]  Page 1 of 12  [Next →]                       │
│                                                             │
│  ℹ Merges can be undone within 30 days of execution.       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. TECHNICAL STACK RECOMMENDATION

### 4.1 Recommended Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FLOWMATCH ARCHITECTURE                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    FRONTEND (React)                     ││
│  │  • Embedded iframe in GHL                               ││
│  │  • React + TypeScript                                   ││
│  │  • Shadcn/UI components                                 ││
│  │  • TanStack Query for data fetching                     ││
│  │  • TanStack Table for data grids                        ││
│  └─────────────────────────────────────────────────────────┘│
│                          │                                  │
│                          ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                   API LAYER (FastAPI)                   ││
│  │  • Python 3.11+                                         ││
│  │  • FastAPI for async REST API                           ││
│  │  • Pydantic for validation                              ││
│  │  • SQLAlchemy for ORM                                   ││
│  │  • JWT authentication (GHL OAuth tokens)                ││
│  └─────────────────────────────────────────────────────────┘│
│                          │                                  │
│           ┌──────────────┼──────────────┐                   │
│           ▼              ▼              ▼                   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ PostgreSQL  │ │   Redis     │ │   Celery    │           │
│  │             │ │             │ │   Workers   │           │
│  │ • Data      │ │ • Cache     │ │ • Matching  │           │
│  │ • Audit log │ │ • Sessions  │ │ • Jobs      │           │
│  │ • Snapshots │ │ • Rate limit│ │ • Merges    │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │               MATCHING ENGINE (Python)                  ││
│  │  • recordlinkage library for blocking & comparison      ││
│  │  • jellyfish for string similarity (Jaro-Winkler, etc) ││
│  │  • phonetics for Soundex/Metaphone                      ││
│  │  • Custom scoring pipeline                              ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                  GHL INTEGRATION                        ││
│  │  • OAuth token management with refresh                  ││
│  │  • Webhook receiver for real-time events                ││
│  │  • API client with rate limiting                        ││
│  │  • Retry logic with exponential backoff                 ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Technology Choices

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Frontend** | React + TypeScript | GHL embedded apps use iframes; React is standard |
| **UI Components** | Shadcn/UI | Modern, accessible, customizable for white-label |
| **API** | FastAPI (Python) | Async support, excellent for I/O-bound GHL API calls |
| **Database** | PostgreSQL 15+ | JSONB support, partitioning, row-level security |
| **Cache** | Redis | Token caching, rate limiting, session management |
| **Job Queue** | Celery + Redis | Industry standard for Python background jobs |
| **Matching** | recordlinkage + jellyfish | Best-in-class Python matching libraries |
| **Hosting** | AWS (ECS/RDS/ElastiCache) | Scalable, reliable, good GHL latency |

### 4.3 Key Libraries

```python
# requirements.txt

# API Framework
fastapi==0.109.0
uvicorn==0.27.0
pydantic==2.5.0

# Database
sqlalchemy==2.0.25
asyncpg==0.29.0
alembic==1.13.0

# Background Jobs
celery==5.3.6
redis==5.0.1
celery-beat==0.1.0

# Matching Engine
recordlinkage==0.16
jellyfish==1.0.3
phonetics==1.0.5
python-Levenshtein==0.23.0

# GHL Integration
httpx==0.26.0  # Async HTTP client
python-jose==3.3.0  # JWT handling
cryptography==41.0.7  # Token encryption

# Utilities
python-dateutil==2.8.2
orjson==3.9.10
structlog==24.1.0
```

---

## 5. IMPLEMENTATION PHASES

### Phase 1: Foundation (Weeks 1-3)

**Goals**: Core infrastructure, GHL integration, basic matching

| Task | Description | Priority |
|------|-------------|----------|
| Project setup | FastAPI project structure, Docker, CI/CD | P0 |
| Database schema | Implement core tables, migrations | P0 |
| GHL OAuth | OAuth flow, token management, refresh | P0 |
| GHL API client | Contacts, Companies API wrappers | P0 |
| Basic matching engine | Exact + fuzzy matching for contacts | P0 |
| Webhook receiver | contact.created, contact.updated events | P0 |

### Phase 2: Core Functionality (Weeks 4-6)

**Goals**: Full matching, merge execution, history

| Task | Description | Priority |
|------|-------------|----------|
| Match rules engine | Configurable rules with multiple fields | P0 |
| Scoring pipeline | Weighted composite scoring | P0 |
| Master selection | All strategies implemented | P0 |
| Merge execution | Full merge flow with GHL API | P0 |
| Snapshot storage | Pre-merge record capture | P0 |
| Rollback mechanism | Restore from snapshots | P0 |
| Audit logging | Immutable event store | P1 |

### Phase 3: Job Scheduling (Weeks 7-8)

**Goals**: Automated scanning, scheduled jobs

| Task | Description | Priority |
|------|-------------|----------|
| Celery setup | Workers, beat scheduler, monitoring | P0 |
| Job management | CRUD for scheduled jobs | P0 |
| Full scan job | Scan all records with rate limiting | P0 |
| Incremental scan | Only new/modified records | P1 |
| Job history | Track runs, results, errors | P0 |

### Phase 4: Multi-Object Support (Weeks 9-10)

**Goals**: Companies, Opportunities, Custom Objects

| Task | Description | Priority |
|------|-------------|----------|
| Company matching | Dedupe companies, domain matching | P0 |
| Opportunity matching | Deal deduplication | P1 |
| Custom Objects | Dynamic schema support | P1 |
| Cross-object matching | Contact → Company association | P1 |

### Phase 5: Frontend MVP (Weeks 11-14)

**Goals**: Embedded GHL app, full UI

| Task | Description | Priority |
|------|-------------|----------|
| React app setup | Vite, TypeScript, Shadcn | P0 |
| GHL embedding | iframe integration, SSO | P0 |
| Dashboard | Overview metrics, activity feed | P0 |
| Duplicates queue | Review, approve, reject | P0 |
| Merge preview | Side-by-side, field selection | P0 |
| Rule configuration | CRUD for match rules | P0 |
| Job management | Schedule, monitor, history | P1 |
| Merge history | View past merges, undo | P0 |
| Settings | Tenant/location config | P1 |

### Phase 6: White-Label & Launch (Weeks 15-16)

**Goals**: Agency branding, GHL Marketplace submission

| Task | Description | Priority |
|------|-------------|----------|
| White-label config | Agency branding (logo, colors, name) | P0 |
| Marketplace submission | GHL app review process | P0 |
| Billing integration | Per-location flat fee via Stripe | P0 |
| Documentation | User guides, API docs | P1 |
| Monitoring | Error tracking, alerting | P0 |

---

## 6. FILE STRUCTURE

```
flowmatch/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI app entry
│   │   ├── config.py               # Environment config
│   │   ├── dependencies.py         # Dependency injection
│   │   │
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── routes/
│   │   │   │   ├── auth.py         # OAuth, token refresh
│   │   │   │   ├── matches.py      # Match pairs endpoints
│   │   │   │   ├── merges.py       # Merge operations
│   │   │   │   ├── rules.py        # Match rules CRUD
│   │   │   │   ├── jobs.py         # Scheduled jobs
│   │   │   │   └── webhooks.py     # GHL webhook receiver
│   │   │   └── middleware/
│   │   │       ├── auth.py         # JWT validation
│   │   │       └── tenant.py       # Tenant context
│   │   │
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── matching/
│   │   │   │   ├── engine.py       # Main matching orchestrator
│   │   │   │   ├── comparators.py  # Field comparison functions
│   │   │   │   ├── blocking.py     # Blocking strategies
│   │   │   │   ├── scoring.py      # Composite scoring
│   │   │   │   └── master.py       # Master record selection
│   │   │   ├── merging/
│   │   │   │   ├── executor.py     # Merge execution
│   │   │   │   ├── snapshot.py     # Record snapshots
│   │   │   │   └── rollback.py     # Rollback logic
│   │   │   └── ghl/
│   │   │       ├── client.py       # GHL API client
│   │   │       ├── auth.py         # OAuth management
│   │   │       ├── contacts.py     # Contacts API
│   │   │       ├── companies.py    # Companies API
│   │   │       ├── opportunities.py
│   │   │       └── custom_objects.py
│   │   │
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── tenant.py
│   │   │   ├── location.py
│   │   │   ├── match_rule.py
│   │   │   ├── match_pair.py
│   │   │   ├── merge.py
│   │   │   └── job.py
│   │   │
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   └── *.py                # Pydantic schemas
│   │   │
│   │   └── tasks/
│   │       ├── __init__.py
│   │       ├── celery_app.py       # Celery configuration
│   │       ├── matching.py         # Matching tasks
│   │       ├── merging.py          # Merge tasks
│   │       └── jobs.py             # Scheduled job tasks
│   │
│   ├── migrations/                 # Alembic migrations
│   ├── tests/
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                 # Shadcn components
│   │   │   ├── dashboard/
│   │   │   ├── duplicates/
│   │   │   ├── rules/
│   │   │   ├── jobs/
│   │   │   └── settings/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── services/               # API clients
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 7. SUCCESS METRICS

| Metric | Target | Measurement |
|--------|--------|-------------|
| Match accuracy | >95% precision | Manual audit of 100 merges |
| Auto-merge rate | >40% of matches | High-confidence matches / total |
| Merge success rate | >99% | Completed merges / attempted |
| Job completion | >99.5% | Successful runs / total runs |
| API latency (p95) | <500ms | Monitoring |
| User rollback rate | <5% | Rollbacks / total merges |

---

## 8. RISKS & MITIGATIONS

| Risk | Impact | Mitigation |
|------|--------|------------|
| GHL API rate limits | Job delays | Aggressive caching, smart batching |
| False positive merges | Data loss | Conservative thresholds, mandatory review queue |
| GHL API changes | Breaking changes | Version pinning, integration tests, monitoring |
| Rollback data volume | Storage costs | 30-day retention, compression, archival |
| Multi-tenant data leakage | Security breach | Row-level security, audit logging, penetration testing |

---

## NEXT STEPS

1. **Validate GHL API access** - Test all required endpoints with real data
2. **Set up development environment** - Docker, PostgreSQL, Redis
3. **Implement OAuth flow** - Critical path for all functionality
4. **Build matching engine prototype** - Validate accuracy on sample data
5. **Create wireframe prototypes** - Validate UX with target users

---

## 9. CRITICAL REVIEW: GAPS FOR DEVELOPMENT TEAM

### Overview

This section identifies areas that a full development team would flag as incomplete or needing further specification before implementation can begin confidently. Items are categorized by severity:

- **BLOCKER**: Cannot start implementation without this
- **HIGH**: Will cause significant delays or rework if not addressed
- **MEDIUM**: Important for quality but can be refined during development
- **LOW**: Nice to have, can be deferred to later phases

---

### 9.1 API SPECIFICATION [BLOCKER]

**Current State:** No formal API specification exists.

**Required:**

| Gap | Severity | Impact |
|-----|----------|--------|
| No OpenAPI/Swagger specification | BLOCKER | Frontend team cannot begin parallel development |
| No endpoint URL patterns defined | BLOCKER | No contract between frontend and backend |
| No request/response schema definitions | HIGH | Inconsistent implementations |
| No error response format standardization | HIGH | Inconsistent error handling |
| No API versioning strategy | MEDIUM | Breaking changes will disrupt clients |
| No pagination standard | MEDIUM | Inconsistent list endpoints |
| No rate limiting response format | MEDIUM | Client retry logic undefined |

**Deliverable Needed:**
```yaml
# Example OpenAPI structure needed

openapi: 3.0.0
paths:
  /api/v1/matches:
    get:
      summary: List match pairs
      parameters:
        - name: status
          in: query
          schema:
            type: string
            enum: [pending, approved, rejected, merged]
        - name: limit
          in: query
          schema:
            type: integer
            default: 50
            maximum: 100
        - name: cursor
          in: query
          schema:
            type: string
      responses:
        200:
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/MatchPairList'
        401:
          $ref: '#/components/responses/Unauthorized'
        429:
          $ref: '#/components/responses/RateLimited'

components:
  schemas:
    MatchPair:
      type: object
      properties:
        id: { type: string, format: uuid }
        confidence_score: { type: number, minimum: 0, maximum: 1 }
        # ... full schema needed

  responses:
    Error:
      type: object
      required: [error]
      properties:
        error:
          type: object
          required: [code, message]
          properties:
            code: { type: string }
            message: { type: string }
            details: { type: object }
            request_id: { type: string }
```

---

### 9.2 TESTING STRATEGY [BLOCKER]

**Current State:** Testing mentioned in passing but no strategy defined.

**Required:**

| Gap | Severity | Impact |
|-----|----------|--------|
| No unit test coverage targets | BLOCKER | Quality standards undefined |
| No integration test plan | BLOCKER | Component interactions untested |
| No E2E test scenarios | HIGH | User flows unvalidated |
| No load/performance test plan | HIGH | Scalability issues undiscovered |
| No test data strategy | HIGH | Tests may be flaky or inconsistent |
| No mock strategy for GHL API | HIGH | Cannot test without live GHL |
| No regression test approach | MEDIUM | Bugs may reappear |

**Deliverable Needed:**
```
TESTING PYRAMID SPECIFICATION

┌─────────────────────────────────────────────────────────┐
│                    E2E TESTS (10%)                      │
│  • Critical user journeys only                          │
│  • Run on staging before deploy                         │
│  • Tools: Playwright                                    │
├─────────────────────────────────────────────────────────┤
│              INTEGRATION TESTS (30%)                    │
│  • API endpoints                                        │
│  • Database interactions                                │
│  • GHL API mocks                                        │
│  • Tools: pytest, httpx, testcontainers                 │
├─────────────────────────────────────────────────────────┤
│                 UNIT TESTS (60%)                        │
│  • Matching algorithms                                  │
│  • Scoring calculations                                 │
│  • Business logic                                       │
│  • Tools: pytest, pytest-cov                            │
└─────────────────────────────────────────────────────────┘

COVERAGE TARGETS:
• Overall: 80% minimum
• Core matching engine: 95% minimum
• Merge execution: 95% minimum
• API routes: 80% minimum

GHL API MOCK STRATEGY:
• Use VCR.py or responses library
• Record real API responses for replay
• Mock rate limiting scenarios
• Mock error responses (4xx, 5xx)
```

---

### 9.3 DEVOPS & INFRASTRUCTURE [HIGH]

**Current State:** Docker Compose for local dev only. No production infrastructure.

**Required:**

| Gap | Severity | Impact |
|-----|----------|--------|
| No deployment architecture diagram | HIGH | Unclear production topology |
| No CI/CD pipeline specification | HIGH | Manual deployments, human error |
| No environment strategy | HIGH | Config drift between envs |
| No infrastructure-as-code | MEDIUM | Non-reproducible infrastructure |
| No backup/recovery procedures | HIGH | Data loss risk |
| No disaster recovery plan | MEDIUM | Extended outages |
| No secrets management strategy | HIGH | Security vulnerabilities |

**Deliverable Needed:**
```
PRODUCTION ARCHITECTURE (AWS)

┌─────────────────────────────────────────────────────────────┐
│                         ROUTE 53                            │
│                           │                                 │
│                           ▼                                 │
│                    CLOUDFRONT CDN                           │
│                     (Frontend)                              │
│                           │                                 │
│         ┌─────────────────┴─────────────────┐               │
│         ▼                                   ▼               │
│  ┌─────────────────┐              ┌─────────────────┐       │
│  │   ALB (API)     │              │  S3 (Static)    │       │
│  └────────┬────────┘              └─────────────────┘       │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              ECS FARGATE CLUSTER                     │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │   │
│  │  │  API Task   │  │ Worker Task │  │  Beat Task  │  │   │
│  │  │  (3 inst)   │  │  (2 inst)   │  │  (1 inst)   │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
│           │                   │                             │
│           ▼                   ▼                             │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │   RDS Postgres  │  │  ElastiCache    │                   │
│  │   (Multi-AZ)    │  │  Redis Cluster  │                   │
│  └─────────────────┘  └─────────────────┘                   │
│                                                             │
│  ENVIRONMENTS: dev → staging → production                   │
│  DEPLOY: GitHub Actions → ECR → ECS                         │
│  SECRETS: AWS Secrets Manager                               │
│  MONITORING: CloudWatch + Datadog                           │
└─────────────────────────────────────────────────────────────┘
```

---

### 9.4 SECURITY SPECIFICATION [HIGH]

**Current State:** RLS mentioned. Token encryption mentioned. No comprehensive security design.

**Required:**

| Gap | Severity | Impact |
|-----|----------|--------|
| No OWASP compliance checklist | HIGH | Common vulnerabilities unaddressed |
| No encryption specification (at-rest) | HIGH | Data breach risk |
| No encryption specification (in-transit) | HIGH | MITM vulnerability |
| No authentication flow details | HIGH | Session hijacking risk |
| No authorization model (RBAC/ABAC) | HIGH | Privilege escalation |
| No penetration test plan | MEDIUM | Unknown vulnerabilities |
| No vulnerability scanning plan | MEDIUM | Outdated dependencies |
| No SOC2 considerations | MEDIUM | Enterprise sales blocked |

**Deliverable Needed:**
```
SECURITY SPECIFICATION

1. AUTHENTICATION
   • JWT tokens from GHL OAuth
   • Token validation on every request
   • Token refresh 24h before expiry
   • Refresh token rotation on use
   • Session invalidation on logout

2. AUTHORIZATION
   • Tenant isolation via RLS
   • Location-level permissions
   • Role-based access: admin, user, readonly
   • Permission checks at service layer

3. ENCRYPTION
   • At-rest: AES-256 for sensitive fields (tokens)
   • In-transit: TLS 1.3 minimum
   • Key rotation: 90-day cycle
   • Key storage: AWS KMS

4. INPUT VALIDATION
   • Pydantic strict mode
   • SQL injection: parameterized queries only
   • XSS: Content-Security-Policy headers
   • CSRF: SameSite cookies, origin checking

5. AUDIT LOGGING
   • All data access logged
   • All mutations logged
   • Log retention: 1 year
   • Log integrity: append-only

6. VULNERABILITY MANAGEMENT
   • Dependabot for dependencies
   • Snyk for container scanning
   • Weekly automated scans
   • 24h SLA for critical vulnerabilities
```

---

### 9.5 ERROR HANDLING & EDGE CASES [HIGH]

**Current State:** Basic error handling mentioned. No comprehensive catalog.

**Required:**

| Gap | Severity | Impact |
|-----|----------|--------|
| No error code catalog | HIGH | Inconsistent error handling |
| No retry policy specification | HIGH | Silent failures |
| No circuit breaker patterns | MEDIUM | Cascading failures |
| No dead letter queue strategy | MEDIUM | Lost messages |
| No partial failure handling | HIGH | Data inconsistency |
| No idempotency specification | HIGH | Duplicate operations |

**Deliverable Needed:**
```
ERROR CODE CATALOG

FM-1XXX: Authentication Errors
├── FM-1001: Token expired
├── FM-1002: Invalid token
├── FM-1003: Missing authorization header
├── FM-1004: Insufficient permissions
└── FM-1005: Token refresh failed

FM-2XXX: Validation Errors
├── FM-2001: Invalid request body
├── FM-2002: Missing required field
├── FM-2003: Field validation failed
├── FM-2004: Invalid object type
└── FM-2005: Invalid match rule configuration

FM-3XXX: GHL API Errors
├── FM-3001: GHL API rate limited
├── FM-3002: GHL API timeout
├── FM-3003: GHL API unauthorized
├── FM-3004: GHL record not found
└── FM-3005: GHL API unexpected error

FM-4XXX: Merge Errors
├── FM-4001: Record no longer exists
├── FM-4002: Concurrent merge in progress
├── FM-4003: Merge validation failed
├── FM-4004: Rollback expired
└── FM-4005: Partial merge failure

FM-5XXX: Job Errors
├── FM-5001: Job already running
├── FM-5002: Job timeout exceeded
├── FM-5003: Rate limit exhausted
└── FM-5004: Job cancelled

RETRY POLICIES:
• GHL API calls: 3 retries, exponential backoff (1s, 2s, 4s)
• Database operations: 3 retries, 100ms backoff
• Celery tasks: 3 retries, exponential backoff
• Webhook delivery: 5 retries over 24 hours

IDEMPOTENCY:
• Merge operations: idempotency key required
• Match creation: unique constraint on (location_id, record_a_id, record_b_id)
• Job runs: duplicate detection via job_id + started_at
```

---

### 9.6 MONITORING & OBSERVABILITY [HIGH]

**Current State:** Not specified.

**Required:**

| Gap | Severity | Impact |
|-----|----------|--------|
| No logging specification | HIGH | Debugging impossible |
| No metrics definition | HIGH | No visibility into health |
| No alerting rules | HIGH | Silent failures |
| No tracing setup | MEDIUM | Performance issues undiagnosed |
| No SLO/SLA definition | MEDIUM | No quality targets |
| No dashboard designs | MEDIUM | No operational visibility |
| No runbook templates | MEDIUM | Slow incident response |

**Deliverable Needed:**
```
OBSERVABILITY STACK

LOGGING:
• Format: JSON structured logs
• Fields: timestamp, level, request_id, tenant_id, location_id, message, context
• Levels: DEBUG (dev), INFO (staging), WARNING (prod)
• Storage: CloudWatch Logs → S3 archive
• Retention: 30 days hot, 1 year archive

METRICS (Datadog/Prometheus):
┌──────────────────────────────────────────────────────────────┐
│ BUSINESS METRICS                                             │
│ • matches_detected_total (counter, by location, confidence)  │
│ • merges_executed_total (counter, by location, status)       │
│ • rollbacks_total (counter, by location)                     │
│ • job_runs_total (counter, by job_type, status)              │
│ • records_scanned_total (counter, by location, object_type)  │
├──────────────────────────────────────────────────────────────┤
│ SYSTEM METRICS                                               │
│ • api_request_duration_seconds (histogram, by endpoint)      │
│ • api_requests_total (counter, by endpoint, status_code)     │
│ • ghl_api_calls_total (counter, by endpoint, status)         │
│ • ghl_api_duration_seconds (histogram)                       │
│ • celery_task_duration_seconds (histogram, by task)          │
│ • celery_queue_length (gauge, by queue)                      │
│ • db_connection_pool_size (gauge)                            │
│ • db_query_duration_seconds (histogram)                      │
└──────────────────────────────────────────────────────────────┘

ALERTING RULES:
• CRITICAL: API error rate > 5% for 5 minutes
• CRITICAL: Merge failure rate > 10% for 10 minutes
• WARNING: API latency p95 > 1s for 5 minutes
• WARNING: Celery queue depth > 1000 for 10 minutes
• WARNING: GHL rate limit errors > 10/min
• INFO: Daily job failed

SLOs:
• API availability: 99.9%
• API latency p95: <500ms
• Merge success rate: >99%
• Job completion rate: >99.5%

TRACING:
• Tool: OpenTelemetry → Datadog APM
• Trace: Request → API → Service → GHL API → Database
• Sample rate: 10% in prod, 100% in staging
```

---

### 9.7 MATCHING ENGINE EDGE CASES [HIGH]

**Current State:** Happy path defined. Edge cases unspecified.

**Required:**

| Gap | Severity | Impact |
|-----|----------|--------|
| International phone number handling | HIGH | False negatives for non-US |
| Unicode/special characters in names | HIGH | Matching failures |
| Email alias handling (john+tag@) | MEDIUM | Missed duplicates |
| Empty/null field handling | HIGH | Comparison errors |
| Very large datasets (100K+ records) | HIGH | Timeout/memory issues |
| Circular references in custom objects | MEDIUM | Infinite loops |
| Case sensitivity variations | HIGH | Inconsistent results |

**Deliverable Needed:**
```
EDGE CASE SPECIFICATIONS

1. PHONE NUMBER NORMALIZATION
   Input                    → Normalized
   "(555) 123-4567"         → "5551234567"
   "+1-555-123-4567"        → "15551234567"
   "555.123.4567"           → "5551234567"
   "+44 20 7946 0958"       → "442079460958"
   ""                       → null (skip comparison)
   "N/A"                    → null (skip comparison)

2. EMAIL HANDLING
   • john@acme.com = JOHN@ACME.COM (case-insensitive)
   • john+sales@gmail.com ≠ john+support@gmail.com (aliases differ)
   • For domain matching: john+tag@gmail.com → domain: gmail.com

3. NAME NORMALIZATION
   • Remove titles: "Dr. John Smith" → "John Smith"
   • Handle accents: "José" ≈ "Jose" (fuzzy match)
   • Handle CJK characters: Use Unicode normalization NFC
   • Handle emojis: Strip from comparison

4. NULL/EMPTY HANDLING
   • null vs null → score: 0.0 (can't determine)
   • null vs "value" → score: 0.0 (no match)
   • "" vs "" → score: 0.0 (treat as null)
   • Weight adjustment: If field is null, redistribute weight

5. LARGE DATASET HANDLING
   • Batch size: 1000 records per API fetch
   • Memory limit: Process in streaming fashion
   • Checkpoint: Save progress every 5000 records
   • Timeout: 30 minutes max per job run
   • Incremental: Only scan new/modified records

6. BLOCKING EDGE CASES
   • Very common names: Add secondary blocking key
   • Very common domains (gmail.com): Use composite blocking
   • Empty blocking key: Place in "overflow" block
```

---

### 9.8 FRONTEND SPECIFICATION [MEDIUM]

**Current State:** Wireframes exist but no detailed specs.

**Required:**

| Gap | Severity | Impact |
|-----|----------|--------|
| No component library spec | MEDIUM | Inconsistent UI |
| No accessibility requirements | MEDIUM | WCAG non-compliance |
| No responsive breakpoints | MEDIUM | Poor mobile experience |
| No state management patterns | MEDIUM | Inconsistent data flow |
| No error state designs | MEDIUM | Poor error UX |
| No loading state designs | MEDIUM | Poor perceived performance |
| No empty state designs | MEDIUM | Confusing empty screens |

**Deliverable Needed:**
```
FRONTEND SPECIFICATIONS

ACCESSIBILITY (WCAG 2.1 AA):
• All interactive elements keyboard accessible
• Focus indicators visible
• Color contrast ratio ≥ 4.5:1
• Form labels associated with inputs
• Error messages announced by screen readers
• Skip navigation link

RESPONSIVE BREAKPOINTS:
• Mobile: 320px - 767px (GHL mobile app)
• Tablet: 768px - 1023px
• Desktop: 1024px+ (GHL embedded sidebar)
• Default embedded width: 400px

STATE DESIGNS REQUIRED:
┌─────────────────────────────────────────────────────┐
│ SCREEN          │ LOADING │ EMPTY │ ERROR │ SUCCESS │
├─────────────────┼─────────┼───────┼───────┼─────────┤
│ Dashboard       │    ✓    │   ✓   │   ✓   │    -    │
│ Duplicates List │    ✓    │   ✓   │   ✓   │    -    │
│ Merge Preview   │    ✓    │   -   │   ✓   │    ✓    │
│ Rule Editor     │    ✓    │   -   │   ✓   │    ✓    │
│ Job History     │    ✓    │   ✓   │   ✓   │    -    │
│ Settings        │    ✓    │   -   │   ✓   │    ✓    │
└─────────────────┴─────────┴───────┴───────┴─────────┘

ERROR BOUNDARY:
• Catch unhandled errors
• Show friendly error message
• Offer "Try Again" action
• Log error to monitoring
```

---

### 9.9 BILLING & PRICING [MEDIUM]

**Current State:** "Stripe integration" mentioned. No details.

**Required:**

| Gap | Severity | Impact |
|-----|----------|--------|
| No pricing tier implementation | MEDIUM | Cannot charge customers |
| No usage tracking mechanism | MEDIUM | Cannot enforce limits |
| No invoice generation | MEDIUM | No payment records |
| No dunning process | MEDIUM | Failed payments unhandled |
| No upgrade/downgrade flows | MEDIUM | Customer friction |
| No free trial handling | LOW | Reduced conversions |

**Deliverable Needed:**
```
BILLING SPECIFICATION

PRICING TIERS:
┌──────────────────────────────────────────────────────────┐
│ Tier      │ Price/mo │ Locations │ Records │ Features   │
├───────────┼──────────┼───────────┼─────────┼────────────┤
│ Starter   │ $29      │ 1         │ 5,000   │ Basic      │
│ Pro       │ $79      │ 5         │ 25,000  │ + Scheduled│
│ Enterprise│ $149     │ Unlimited │ 100,000 │ + API      │
└───────────┴──────────┴───────────┴─────────┴────────────┘

STRIPE INTEGRATION:
• Product: MergeMatch
• Prices: price_starter, price_pro, price_enterprise
• Checkout: Stripe Checkout hosted page
• Billing: Monthly, auto-renew
• Webhook events: checkout.session.completed, invoice.paid,
                  invoice.payment_failed, customer.subscription.updated

DUNNING PROCESS:
• Payment failed → Retry after 3 days
• 2nd failure → Email warning
• 3rd failure → Suspend account (read-only)
• 7 days suspended → Cancel subscription

USAGE TRACKING:
• Track: records_scanned, merges_executed per billing period
• Soft limit warning at 80%
• Hard limit at 100% (block new scans)
• Overage: Not supported in MVP (upgrade required)
```

---

### 9.10 DATA MIGRATION & ONBOARDING [MEDIUM]

**Current State:** Not addressed.

**Required:**

| Gap | Severity | Impact |
|-----|----------|--------|
| No initial data seeding strategy | MEDIUM | Demo data missing |
| No existing duplicate detection flow | MEDIUM | New installs see empty dashboard |
| No onboarding wizard | MEDIUM | User confusion |
| No GHL sandbox testing approach | MEDIUM | Cannot QA without live data |

---

### 9.11 DOCUMENTATION [MEDIUM]

**Current State:** README mentioned. No documentation strategy.

**Required:**

| Gap | Severity | Impact |
|-----|----------|--------|
| No user documentation outline | MEDIUM | Support burden |
| No API documentation | HIGH | Integration difficulties |
| No developer onboarding guide | MEDIUM | Slow ramp-up |
| No architecture decision records | LOW | Context loss |

---

### 9.12 RELEASE STRATEGY [MEDIUM]

**Current State:** Not addressed.

**Required:**

| Gap | Severity | Impact |
|-----|----------|--------|
| No feature flag strategy | MEDIUM | Big bang releases |
| No beta testing plan | MEDIUM | Quality issues in production |
| No gradual rollout approach | MEDIUM | Risk of widespread failures |
| No rollback procedures | HIGH | Extended outages |
| No hotfix process | MEDIUM | Slow critical fixes |

---

## 10. PRIORITY ORDER FOR ADDRESSING GAPS

| Priority | Section | Owner | Estimated Effort |
|----------|---------|-------|------------------|
| 1 | 9.1 API Specification | Backend Lead | 2-3 days |
| 2 | 9.2 Testing Strategy | QA/Backend | 1-2 days |
| 3 | 9.4 Security Specification | Security/Backend | 1-2 days |
| 4 | 9.3 DevOps & Infrastructure | DevOps | 2-3 days |
| 5 | 9.5 Error Handling | Backend Lead | 1 day |
| 6 | 9.6 Monitoring & Observability | DevOps | 1-2 days |
| 7 | 9.7 Matching Edge Cases | Backend | 1 day |
| 8 | 9.8 Frontend Specification | Frontend Lead | 1-2 days |
| 9 | 9.9 Billing & Pricing | Product/Backend | 1 day |
| 10 | 9.10 Data Migration | Backend | 0.5 days |
| 11 | 9.11 Documentation | Tech Writer | Ongoing |
| 12 | 9.12 Release Strategy | DevOps/Product | 1 day |

**Total Additional Scoping Effort: ~15-20 days before development begins**

---

## 11. RECOMMENDED NEXT ACTIONS

### Immediate (This Week):
1. **Create OpenAPI specification** - Unblocks frontend development
2. **Define testing strategy** - Sets quality standards
3. **Document security requirements** - Required for enterprise sales

### Before Development Starts:
4. **Create infrastructure diagram** - Clarifies deployment model
5. **Define error code catalog** - Ensures consistent error handling
6. **Document edge cases** - Prevents matching failures

### During Sprint 1:
7. **Set up monitoring stack** - Visibility from day 1
8. **Create billing specification** - Unblocks marketplace submission
9. **Design onboarding flow** - Improves first-run experience
