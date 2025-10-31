-- Migration: Remove mediumText from all questions
-- This updates the passages table to remove the mediumText field from all questions
-- and ensures hardText is set (using text as fallback if needed)

-- Step 1: Remove mediumText field from all questions in all passages
UPDATE passages
SET questions = (
  SELECT jsonb_agg(
    question - 'mediumText'
  )
  FROM jsonb_array_elements(questions) AS question
)
WHERE is_active = true
  AND EXISTS (
    SELECT 1 
    FROM jsonb_array_elements(questions) q 
    WHERE q ? 'mediumText'
  );

-- Step 2: Ensure hardText is set for questions that don't have it (use text as fallback)
UPDATE passages
SET questions = (
  SELECT jsonb_agg(
    CASE 
      WHEN question ? 'hardText' THEN question
      ELSE question || jsonb_build_object('hardText', question->>'text')
    END
  )
  FROM jsonb_array_elements(questions) AS question
)
WHERE is_active = true
  AND EXISTS (
    SELECT 1 
    FROM jsonb_array_elements(questions) q 
    WHERE NOT (q ? 'hardText')
  );

-- Verify the migration
SELECT 
  id, 
  title,
  (SELECT COUNT(*) FROM jsonb_array_elements(questions) q WHERE q ? 'mediumText') as medium_count,
  (SELECT COUNT(*) FROM jsonb_array_elements(questions) q WHERE NOT (q ? 'hardText')) as missing_hard_count
FROM passages
WHERE is_active = true;

