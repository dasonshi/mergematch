-- =============================================
-- MergeMatch Initial Database Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. TENANTS (GHL agencies/companies)
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ghl_company_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255),
    plan VARCHAR(50) DEFAULT 'free',
    billing_status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. LOCATIONS (GHL sub-accounts)
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    ghl_location_id VARCHAR(50) NOT NULL,
    name VARCHAR(255),
    access_token_encrypted TEXT,
    refresh_token_encrypted TEXT,
    token_expires_at TIMESTAMPTZ,
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, ghl_location_id)
);

-- 3. MATCH RULES
CREATE TABLE IF NOT EXISTS match_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    source_object VARCHAR(50) NOT NULL, -- contacts, companies, opportunities
    match_fields JSONB NOT NULL, -- [{field, algorithm, weight, operator}]
    auto_merge_threshold DECIMAL(3,2) DEFAULT 0.95,
    review_threshold DECIMAL(3,2) DEFAULT 0.70,
    merge_strategy VARCHAR(50) DEFAULT 'standard',
    schedule_frequency VARCHAR(20) DEFAULT 'manual',
    schedule_time VARCHAR(5),
    schedule_day VARCHAR(10),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MATCH PAIRS (found duplicates)
CREATE TABLE IF NOT EXISTS match_pairs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    rule_id UUID REFERENCES match_rules(id) ON DELETE SET NULL,
    record_a_id VARCHAR(50) NOT NULL,
    record_a_type VARCHAR(50) NOT NULL,
    record_a_data JSONB,
    record_b_id VARCHAR(50) NOT NULL,
    record_b_type VARCHAR(50) NOT NULL,
    record_b_data JSONB,
    confidence_score DECIMAL(5,4) NOT NULL,
    field_scores JSONB,
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, merged
    reviewed_by UUID,
    reviewed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MERGES (merge history)
CREATE TABLE IF NOT EXISTS merges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    match_pair_id UUID REFERENCES match_pairs(id) ON DELETE SET NULL,
    master_record_id VARCHAR(50) NOT NULL,
    master_record_type VARCHAR(50) NOT NULL,
    duplicate_record_id VARCHAR(50) NOT NULL,
    field_selections JSONB, -- which fields came from which record
    status VARCHAR(20) DEFAULT 'completed', -- in_progress, completed, failed, rolled_back
    error_message TEXT,
    merged_by UUID,
    completed_at TIMESTAMPTZ,
    rolled_back_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SNAPSHOTS (for rollback)
CREATE TABLE IF NOT EXISTS snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merge_id UUID REFERENCES merges(id) ON DELETE CASCADE,
    record_id VARCHAR(50) NOT NULL,
    record_type VARCHAR(50) NOT NULL,
    data JSONB NOT NULL, -- full record snapshot
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. SCHEDULED JOBS
CREATE TABLE IF NOT EXISTS scheduled_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    rule_id UUID REFERENCES match_rules(id) ON DELETE CASCADE,
    last_run TIMESTAMPTZ,
    next_run TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_locations_tenant ON locations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_locations_ghl_id ON locations(ghl_location_id);
CREATE INDEX IF NOT EXISTS idx_match_rules_location ON match_rules(location_id);
CREATE INDEX IF NOT EXISTS idx_match_pairs_location ON match_pairs(location_id);
CREATE INDEX IF NOT EXISTS idx_match_pairs_status ON match_pairs(status);
CREATE INDEX IF NOT EXISTS idx_merges_location ON merges(location_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_merge ON snapshots(merge_id);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_pairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE merges ENABLE ROW LEVEL SECURITY;
ALTER TABLE snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_jobs ENABLE ROW LEVEL SECURITY;

-- Service role can access all (for backend)
CREATE POLICY "Service role full access" ON tenants FOR ALL USING (true);
CREATE POLICY "Service role full access" ON locations FOR ALL USING (true);
CREATE POLICY "Service role full access" ON match_rules FOR ALL USING (true);
CREATE POLICY "Service role full access" ON match_pairs FOR ALL USING (true);
CREATE POLICY "Service role full access" ON merges FOR ALL USING (true);
CREATE POLICY "Service role full access" ON snapshots FOR ALL USING (true);
CREATE POLICY "Service role full access" ON scheduled_jobs FOR ALL USING (true);
