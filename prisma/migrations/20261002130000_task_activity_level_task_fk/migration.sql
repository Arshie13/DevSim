-- task_activity: reference the task by level_task_id instead of by (scenario_id, level, task_name).
--
-- The old shape identified a task by its *name* plus the scenario and level `order`. That
-- mirrors `level_task`'s natural key, but it is a free-text reference with no FK: a rename or
-- typo silently detaches a completion from its task, and joins had to re-derive the row.
--
-- This migration resolves every existing row to its `level_task`, then drops the text columns.
-- The FK is ON DELETE RESTRICT (matching the old `scenario_id` FK): logged activity is a
-- durable ledger, so a task a user has completed cannot be deleted out from under it. Deleting
-- a level/scenario that has activity is therefore blocked, same as before.

-- 1. Guard: every existing row must resolve to exactly one level_task. Abort loudly otherwise
--    rather than dropping history (mirrors the scenario_id migration's approach).
DO $$
DECLARE
  unresolvable INTEGER;
BEGIN
  SELECT count(*) INTO unresolvable
  FROM "task_activities" ta
  WHERE NOT EXISTS (
    SELECT 1
    FROM "levels" l
    JOIN "level_tasks" lt ON lt.level_id = l.id
    WHERE l.scenario_id = ta.scenario_id
      AND l."order" = ta.level
      AND lt.task_name = ta.task_name
  );

  IF unresolvable > 0 THEN
    RAISE EXCEPTION 'Aborting: % task_activity row(s) cannot be resolved to a level_task via (scenario_id, level order, task_name). Classify or delete them, then rerun.', unresolvable;
  END IF;
END $$;

-- 2. Add the new column (nullable for the backfill) and populate it.
ALTER TABLE "task_activities" ADD COLUMN "level_task_id" TEXT;

UPDATE "task_activities" ta
SET "level_task_id" = lt.id
FROM "levels" l
JOIN "level_tasks" lt ON lt.level_id = l.id
WHERE l.scenario_id = ta.scenario_id
  AND l."order" = ta.level
  AND lt.task_name = ta.task_name;

-- 3. Every row is now populated.
ALTER TABLE "task_activities" ALTER COLUMN "level_task_id" SET NOT NULL;

-- 4. Drop the old text-based key, index and FK, then the columns themselves.
DROP INDEX "task_activities_user_id_scenario_id_level_task_name_key";
DROP INDEX "task_activities_scenario_id_idx";
ALTER TABLE "task_activities" DROP CONSTRAINT "task_activities_scenario_id_fkey";
ALTER TABLE "task_activities" DROP COLUMN "task_name";
ALTER TABLE "task_activities" DROP COLUMN "scenario_id";
ALTER TABLE "task_activities" DROP COLUMN "level";

-- 5. New key, index and FK.
CREATE INDEX "task_activities_level_task_id_idx" ON "task_activities"("level_task_id");
CREATE UNIQUE INDEX "task_activities_user_id_level_task_id_key" ON "task_activities"("user_id", "level_task_id");
ALTER TABLE "task_activities" ADD CONSTRAINT "task_activities_level_task_id_fkey"
  FOREIGN KEY ("level_task_id") REFERENCES "level_tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
