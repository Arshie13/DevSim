-- Rename the logical project reference to match the scenario table it identifies.
ALTER TABLE "user_project_access"
  RENAME COLUMN "project_id" TO "scenario_id";

ALTER INDEX "user_project_access_project_id_idx"
  RENAME TO "user_project_access_scenario_id_idx";

ALTER INDEX "user_project_access_user_id_project_id_source_key"
  RENAME TO "user_project_access_user_id_scenario_id_source_key";

ALTER TABLE "user_project_access"
  ADD CONSTRAINT "user_project_access_scenario_id_fkey"
  FOREIGN KEY ("scenario_id") REFERENCES "scenarios"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;