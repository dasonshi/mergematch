-- =============================================
-- Match Pair Stats RPC Function
-- Adds optimized aggregate stats for /v1/matches endpoints
-- =============================================

CREATE OR REPLACE FUNCTION get_match_pair_stats(
    p_location_id UUID,
    p_status TEXT DEFAULT NULL,
    p_rule_id UUID DEFAULT NULL
)
RETURNS TABLE (
    total_count BIGINT,
    unique_contact_count BIGINT,
    by_rule JSONB
)
LANGUAGE sql
STABLE
AS $$
    WITH filtered AS (
        SELECT
            record_a_id,
            record_b_id,
            rule_id
        FROM match_pairs
        WHERE location_id = p_location_id
          AND (p_status IS NULL OR status = p_status)
          AND (p_rule_id IS NULL OR rule_id = p_rule_id)
    ),
    distinct_records AS (
        SELECT record_a_id AS record_id FROM filtered
        UNION
        SELECT record_b_id AS record_id FROM filtered
    ),
    rule_counts AS (
        SELECT
            rule_id::TEXT AS rule_key,
            COUNT(*)::BIGINT AS cnt
        FROM filtered
        WHERE rule_id IS NOT NULL
        GROUP BY rule_id
    )
    SELECT
        (SELECT COUNT(*) FROM filtered) AS total_count,
        (SELECT COUNT(*) FROM distinct_records) AS unique_contact_count,
        COALESCE(
            (SELECT jsonb_object_agg(rule_key, cnt) FROM rule_counts),
            '{}'::jsonb
        ) AS by_rule;
$$;

COMMENT ON FUNCTION get_match_pair_stats(UUID, TEXT, UUID)
IS 'Returns total matches, unique contacts, and per-rule counts for a location with optional status/rule filters.';
