-- task_activity: record which scenario a completion happened in.
--
-- The table stored `level` alone, and `levels` has no global level number — only `order`
-- within a scenario — so `level: 3` meant "the third level of some scenario" and the row
-- could not be resolved back to a real level. The scenario was available at the write site
-- (`submitWork` already held `currentScenarioId`) and was never passed.
--
-- The unique key is also corrected here. The writer de-duplicated on `(user_id, task_name)`,
-- but task names are not globally unique in this data: "Prepare Development Environment"
-- appears in 12 of the 15 scenarios, so completing it in a second scenario recorded nothing
-- and the lifetime tasks-completed stat under-reported. The key now mirrors the task's own
-- identity, `(user_id, scenario_id, level, task_name)` — the same shape as
-- `level_task`'s `(level_id, task_name)` lifted to a per-user completion.

-- Abort guard: an existing row cannot be attributed to a scenario, because the old shape
-- never stored one and `level` is only an ordinal. `ADD COLUMN ... NOT NULL` would fail on
-- such rows anyway, but with an opaque error and no hint at the cause.
DO $$
DECLARE
  existing_rows int;
BEGIN
  SELECT count(*) INTO existing_rows FROM "task_activities";

  IF existing_rows > 0 THEN
    RAISE EXCEPTION
      'Aborting: % task_activity row(s) exist and cannot be attributed to a scenario (the old shape never recorded one, and `level` is only a per-scenario ordinal). Classify or delete them, then rerun.',
      existing_rows;
  END IF;
END $$;

-- AlterTable
ALTER TABLE "task_activities" ADD COLUMN "scenario_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "task_activities_scenario_id_idx" ON "task_activities"("scenario_id");

-- CreateIndex
CREATE UNIQUE INDEX "task_activities_user_id_scenario_id_level_task_name_key" ON "task_activities"("user_id", "scenario_id", "level", "task_name");

-- AddForeignKey
ALTER TABLE "task_activities" ADD CONSTRAINT "task_activities_scenario_id_fkey" FOREIGN KEY ("scenario_id") REFERENCES "scenarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
