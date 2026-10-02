-- Remove the per-scenario Learner Pass unlock.
--
-- Scenario access used to be recorded on the claim itself: milestone days (6/12/18/24/30)
-- granted a permanent unlock via `unlocked_scenario`, with `fallback_reward` marking a
-- milestone day whose scenario the user already owned. That is gone. Access to a locked
-- scenario is now derived purely from whether the user holds an *active* pass
-- (see `src/lib/server/access/hasProjectAccess.ts`), so it is granted for the pass's
-- lifetime and revoked when it expires.
--
-- `unlocked_scenario` was the last record of a permanent premium access grant. Dropping it
-- deliberately revokes any access it still carried — that is the intent of the change.

-- DropForeignKey
ALTER TABLE "learner_pass_claims" DROP CONSTRAINT IF EXISTS "learner_pass_claims_unlocked_scenario_fkey";

-- DropIndex
DROP INDEX IF EXISTS "learner_pass_claims_unlocked_scenario_idx";

-- AlterTable
ALTER TABLE "learner_pass_claims" DROP COLUMN IF EXISTS "unlocked_scenario";
ALTER TABLE "learner_pass_claims" DROP COLUMN IF EXISTS "unlocked_at";
ALTER TABLE "learner_pass_claims" DROP COLUMN IF EXISTS "fallback_reward";
