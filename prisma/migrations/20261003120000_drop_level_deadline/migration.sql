-- Drop the unused `levels.deadline` column.
--
-- It was written by the seed and the admin scenarios CRUD, and plumbed through
-- `LevelDataAccess.getLevelByOrder`, but nothing ever consumed it: the learner
-- workspace always rendered the `LEVEL_CONFIG` mock value. No index or FK
-- references it, so it can be dropped directly.
ALTER TABLE "levels" DROP COLUMN "deadline";
