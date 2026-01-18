-- Comprehensive Test Validation Queries
-- Location UUID: 226e689a-ee3c-486b-8c4c-3964ed166dd4
-- GHL Location ID: wHb7koqaUqw8x8KoYjOj

-- ============================================
-- OVERVIEW STATS
-- ============================================

SELECT
  'Match Rules' as type, COUNT(*) as count
FROM match_rules WHERE location_id = '226e689a-ee3c-486b-8c4c-3964ed166dd4'
UNION ALL
SELECT
  'Pending Matches' as type, COUNT(*) as count
FROM match_pairs WHERE location_id = '226e689a-ee3c-486b-8c4c-3964ed166dd4' AND status = 'pending'
UNION ALL
SELECT
  'Merged Pairs' as type, COUNT(*) as count
FROM match_pairs WHERE location_id = '226e689a-ee3c-486b-8c4c-3964ed166dd4' AND status = 'merged'
UNION ALL
SELECT
  'Total Merges' as type, COUNT(*) as count
FROM merges WHERE location_id = '226e689a-ee3c-486b-8c4c-3964ed166dd4';

-- ============================================
-- MATCH RULES DETAIL
-- ============================================

SELECT
  id,
  name,
  source_object,
  match_fields,
  merge_strategy,
  merge_settings->'related_records' as related_records_config,
  created_at
FROM match_rules
WHERE location_id = '226e689a-ee3c-486b-8c4c-3964ed166dd4'
ORDER BY created_at DESC;

-- ============================================
-- MATCHES BY RULE
-- ============================================

SELECT
  mr.name as rule_name,
  mp.status,
  COUNT(*) as count
FROM match_pairs mp
JOIN match_rules mr ON mp.rule_id = mr.id
WHERE mp.location_id = '226e689a-ee3c-486b-8c4c-3964ed166dd4'
GROUP BY mr.name, mp.status
ORDER BY mr.name, mp.status;

-- ============================================
-- RULE 1 VALIDATION: Exact Email (15 expected)
-- ============================================

SELECT
  mr.name,
  COUNT(*) as matches_found,
  15 as expected
FROM match_pairs mp
JOIN match_rules mr ON mp.rule_id = mr.id
WHERE mp.location_id = '226e689a-ee3c-486b-8c4c-3964ed166dd4'
AND mr.name LIKE '%Email%'
AND mr.match_fields::text LIKE '%exact%'
GROUP BY mr.name;

-- ============================================
-- RULE 2 VALIDATION: Exact Phone (10 expected)
-- ============================================

SELECT
  mr.name,
  COUNT(*) as matches_found,
  10 as expected,
  mr.merge_settings->'related_records'->'notes' as notes_config
FROM match_pairs mp
JOIN match_rules mr ON mp.rule_id = mr.id
WHERE mp.location_id = '226e689a-ee3c-486b-8c4c-3964ed166dd4'
AND mr.name LIKE '%Phone%'
GROUP BY mr.name, mr.merge_settings;

-- ============================================
-- RULE 3 VALIDATION: Name + Company (10 expected)
-- ============================================

SELECT
  mr.name,
  COUNT(*) as matches_found,
  10 as expected,
  mr.merge_settings->'related_records'->'tasks' as tasks_config
FROM match_pairs mp
JOIN match_rules mr ON mp.rule_id = mr.id
WHERE mp.location_id = '226e689a-ee3c-486b-8c4c-3964ed166dd4'
AND (mr.name LIKE '%Name%' OR mr.name LIKE '%Company%')
GROUP BY mr.name, mr.merge_settings;

-- ============================================
-- RULE 4 VALIDATION: Keep All Opps (8 expected)
-- ============================================

SELECT
  mr.name,
  COUNT(*) as matches_found,
  8 as expected,
  mr.merge_settings->'related_records'->'opportunities' as opps_config
FROM match_pairs mp
JOIN match_rules mr ON mp.rule_id = mr.id
WHERE mp.location_id = '226e689a-ee3c-486b-8c4c-3964ed166dd4'
AND mr.merge_settings->'related_records'->'opportunities' = '"keep_all"'
GROUP BY mr.name, mr.merge_settings;

-- ============================================
-- RULE 5 VALIDATION: Custom Logic (7 expected)
-- ============================================

SELECT
  mr.name,
  COUNT(*) as matches_found,
  7 as expected,
  mr.merge_settings->'related_records'->'opportunities' as opps_config,
  mr.merge_settings->'related_records'->'opportunities_custom_logic' as custom_logic
FROM match_pairs mp
JOIN match_rules mr ON mp.rule_id = mr.id
WHERE mp.location_id = '226e689a-ee3c-486b-8c4c-3964ed166dd4'
AND mr.merge_settings->'related_records'->'opportunities' = '"custom_logic"'
GROUP BY mr.name, mr.merge_settings;

-- ============================================
-- MERGE HISTORY SUMMARY
-- ============================================

SELECT
  mr.name as rule_name,
  m.status,
  COUNT(*) as merge_count
FROM merges m
JOIN match_pairs mp ON m.match_pair_id = mp.id
JOIN match_rules mr ON mp.rule_id = mr.id
WHERE m.location_id = '226e689a-ee3c-486b-8c4c-3964ed166dd4'
GROUP BY mr.name, m.status
ORDER BY mr.name;

-- ============================================
-- RECENT MERGES DETAIL
-- ============================================

SELECT
  m.id,
  mr.name as rule_name,
  m.master_record_id,
  m.duplicate_record_id,
  m.status,
  m.created_at
FROM merges m
JOIN match_pairs mp ON m.match_pair_id = mp.id
JOIN match_rules mr ON mp.rule_id = mr.id
WHERE m.location_id = '226e689a-ee3c-486b-8c4c-3964ed166dd4'
ORDER BY m.created_at DESC
LIMIT 20;

-- ============================================
-- ROLLBACK/RECOVERY CHECK
-- ============================================

SELECT
  id,
  master_record_id,
  duplicate_record_id,
  restored_record_id,
  status,
  rolled_back_at,
  created_at
FROM merges
WHERE location_id = '226e689a-ee3c-486b-8c4c-3964ed166dd4'
AND rolled_back_at IS NOT NULL
ORDER BY rolled_back_at DESC;
