-- MergeMatch DB Validation Queries
-- Location ID: wHb7koqaUqw8x8KoYjOj
-- Run these queries to validate test results

-- ============================================
-- 1. CHECK MATCH RULES CREATED
-- ============================================

-- List all rules for the test location
SELECT
    id,
    name,
    source_object,
    match_fields,
    merge_settings,
    is_active,
    created_at
FROM match_rules
WHERE location_id = 'wHb7koqaUqw8x8KoYjOj'
ORDER BY created_at DESC;

-- Check specific merge_settings structure
SELECT
    id,
    name,
    merge_settings->'related_records' as related_records_config,
    merge_settings->'related_records'->'notes' as notes_handling,
    merge_settings->'related_records'->'tasks' as tasks_handling,
    merge_settings->'related_records'->'opportunities' as opportunities_handling,
    merge_settings->'related_records'->'opportunities_custom_logic' as custom_logic
FROM match_rules
WHERE location_id = 'wHb7koqaUqw8x8KoYjOj'
ORDER BY created_at DESC;


-- ============================================
-- 2. CHECK MATCHES FOUND
-- ============================================

-- List all matches for the location
SELECT
    mp.id,
    mr.name as rule_name,
    mp.record_a_id,
    mp.record_b_id,
    mp.status,
    mp.match_score,
    mp.master_record_id,
    mp.merged_at,
    mp.created_at
FROM match_pairs mp
JOIN match_rules mr ON mp.rule_id = mr.id
WHERE mr.location_id = 'wHb7koqaUqw8x8KoYjOj'
ORDER BY mp.created_at DESC;

-- Count matches by status
SELECT
    mp.status,
    COUNT(*) as count
FROM match_pairs mp
JOIN match_rules mr ON mp.rule_id = mr.id
WHERE mr.location_id = 'wHb7koqaUqw8x8KoYjOj'
GROUP BY mp.status;


-- ============================================
-- 3. CHECK MERGE HISTORY
-- ============================================

-- List all merges performed
SELECT
    mh.id,
    mh.match_pair_id,
    mh.master_record_id,
    mh.duplicate_record_id,
    mh.status,
    mh.created_at,
    mh.merge_data
FROM merge_history mh
WHERE mh.location_id = 'wHb7koqaUqw8x8KoYjOj'
ORDER BY mh.created_at DESC;

-- Check merge_data for a specific merge (replace ID)
SELECT
    id,
    master_record_id,
    duplicate_record_id,
    merge_data->'master_before' as master_before,
    merge_data->'duplicate_before' as duplicate_before,
    merge_data->'related_records_moved' as related_records_moved
FROM merge_history
WHERE location_id = 'wHb7koqaUqw8x8KoYjOj'
ORDER BY created_at DESC
LIMIT 1;


-- ============================================
-- 4. VALIDATION CHECKS
-- ============================================

-- Check if custom logic rules are stored correctly
SELECT
    id,
    name,
    jsonb_pretty(merge_settings->'related_records'->'opportunities_custom_logic') as custom_logic_config
FROM match_rules
WHERE location_id = 'wHb7koqaUqw8x8KoYjOj'
AND merge_settings->'related_records'->'opportunities' = '"custom_logic"';

-- Check rules with notes/tasks copy enabled
SELECT
    id,
    name,
    merge_settings->'related_records'->'notes' as notes,
    merge_settings->'related_records'->'tasks' as tasks
FROM match_rules
WHERE location_id = 'wHb7koqaUqw8x8KoYjOj'
AND (
    merge_settings->'related_records'->'notes' = '"copy_to_master"'
    OR merge_settings->'related_records'->'tasks' = '"copy_to_master"'
);


-- ============================================
-- 5. CLEANUP QUERIES (USE WITH CAUTION)
-- ============================================

-- Delete all test rules (commented out for safety)
-- DELETE FROM match_rules WHERE location_id = 'wHb7koqaUqw8x8KoYjOj' AND name LIKE 'Test%';

-- Delete all match pairs for test rules (commented out for safety)
-- DELETE FROM match_pairs WHERE rule_id IN (
--     SELECT id FROM match_rules WHERE location_id = 'wHb7koqaUqw8x8KoYjOj' AND name LIKE 'Test%'
-- );


-- ============================================
-- 6. QUICK SUMMARY
-- ============================================

-- Overview of test location data
SELECT
    'Rules' as type, COUNT(*) as count
FROM match_rules WHERE location_id = 'wHb7koqaUqw8x8KoYjOj'
UNION ALL
SELECT
    'Matches' as type, COUNT(*) as count
FROM match_pairs mp
JOIN match_rules mr ON mp.rule_id = mr.id
WHERE mr.location_id = 'wHb7koqaUqw8x8KoYjOj'
UNION ALL
SELECT
    'Merged' as type, COUNT(*) as count
FROM match_pairs mp
JOIN match_rules mr ON mp.rule_id = mr.id
WHERE mr.location_id = 'wHb7koqaUqw8x8KoYjOj' AND mp.status = 'merged'
UNION ALL
SELECT
    'Merge History' as type, COUNT(*) as count
FROM merge_history WHERE location_id = 'wHb7koqaUqw8x8KoYjOj';
