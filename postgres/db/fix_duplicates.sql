-- Fix duplicate history entries
-- This script removes duplicate entries, keeping only the most recent one for each (site_id, recorded_date)

-- Step 1: Delete duplicates, keeping only the most recent history_id for each (site_id, recorded_date)
DELETE FROM sites_history
WHERE history_id NOT IN (
  SELECT DISTINCT ON (site_id, recorded_date) history_id
  FROM sites_history
  ORDER BY site_id, recorded_date, history_id DESC
);

-- Step 2: Ensure the unique constraint exists (it should already exist, but this ensures it)
-- The constraint should already be there from init.sql, but let's verify and add if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'uq_site_date' 
    AND conrelid = 'sites_history'::regclass
  ) THEN
    ALTER TABLE sites_history 
    ADD CONSTRAINT uq_site_date UNIQUE (site_id, recorded_date);
  END IF;
END $$;

-- Step 3: Verify no duplicates remain
SELECT 
  site_id, 
  recorded_date, 
  COUNT(*) as count
FROM sites_history
GROUP BY site_id, recorded_date
HAVING COUNT(*) > 1;

-- If the above query returns rows, there are still duplicates (should return 0 rows)

