-- =============================================
-- MergeMatch Marketplace Billing Support
-- Adds columns for GHL Marketplace integration
-- =============================================

-- Add marketplace columns to tenants
ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS ghl_plan_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_on_trial BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS uninstalled_at TIMESTAMPTZ;

-- Add marketplace columns to locations
ALTER TABLE locations
ADD COLUMN IF NOT EXISTS ghl_plan_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_on_trial BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS uninstalled_at TIMESTAMPTZ;

-- Create index for plan lookups
CREATE INDEX IF NOT EXISTS idx_tenants_ghl_plan ON tenants(ghl_plan_id);
CREATE INDEX IF NOT EXISTS idx_locations_ghl_plan ON locations(ghl_plan_id);

-- Comments
COMMENT ON COLUMN tenants.ghl_plan_id IS 'GHL Marketplace plan ID';
COMMENT ON COLUMN tenants.trial_ends_at IS 'Trial period end date';
COMMENT ON COLUMN tenants.is_on_trial IS 'Whether currently on trial';
COMMENT ON COLUMN tenants.uninstalled_at IS 'When app was uninstalled (soft delete)';
