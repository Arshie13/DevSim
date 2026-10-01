-- Drop `user_project_access`.
--
-- The table held exactly one fact: "this user may open this scenario". Every row came from
-- the Learner Pass — `LEARNER_PASS` was the only `source` ever written, while `COIN_PURCHASE`
-- and `ADMIN_GRANT` had no writer or reader anywhere in the codebase — and a pass unlock is
-- precisely `learner_pass_claim.unlocked_scenario`. The table was a projection of the claims.
--
-- Access checks now read that column directly. The behaviour is unchanged: a choice grants
-- permanent access (the old rows were written with `expires_at = NULL`), and the pass
-- expiring never revoked it.
--
-- The one fact a claim did not hold was WHEN the choice was made, so `unlocked_at` is added
-- to preserve it. Note this is stricter than a raw projection: a claim's `claimed_at` is when
-- the day was CLAIMED, which can be days before its reward is SPENT.

-- Preserve the grant timestamp.
ALTER TABLE "learner_pass_claims" ADD COLUMN "unlocked_at" TIMESTAMP(3);

-- Backfill from the rows this migration removes. A no-op where the table is empty, but
-- correct wherever it is not.
UPDATE "learner_pass_claims" c
SET "unlocked_at" = upa."granted_at"
FROM "user_project_access" upa
WHERE upa."learner_pass_enrollment_id" = c."enrollment_id"
  AND upa."scenario_id" = c."unlocked_scenario"
  AND c."unlocked_at" IS NULL;

-- Abort guard: every condition below is a fact that dropping the table would silently lose.
DO $$
DECLARE
  unrepresentable int;
BEGIN
  SELECT count(*) INTO unrepresentable
  FROM "user_project_access" upa
  WHERE upa."source" <> 'LEARNER_PASS'           -- no other source is implemented
     OR upa."learner_pass_enrollment_id" IS NULL -- cannot be tied to a pass, hence no claim
     OR upa."expires_at" IS NOT NULL             -- a time-limited grant; claims have no expiry
     OR NOT EXISTS (
          SELECT 1
          FROM "learner_pass_claims" c
          WHERE c."enrollment_id" = upa."learner_pass_enrollment_id"
            AND c."unlocked_scenario" = upa."scenario_id"
        );

  IF unrepresentable > 0 THEN
    RAISE EXCEPTION
      'Aborting: % user_project_access row(s) cannot be represented by learner_pass_claim (wrong source, no pass link, a non-null expires_at, or no matching choice). Migrate them explicitly, or keep the table.',
      unrepresentable;
  END IF;
END $$;

-- DropForeignKey
ALTER TABLE "user_project_access" DROP CONSTRAINT "user_project_access_coin_purchase_id_fkey";

-- DropForeignKey
ALTER TABLE "user_project_access" DROP CONSTRAINT "user_project_access_learner_pass_enrollment_id_fkey";

-- DropForeignKey
ALTER TABLE "user_project_access" DROP CONSTRAINT "user_project_access_scenario_id_fkey";

-- DropForeignKey
ALTER TABLE "user_project_access" DROP CONSTRAINT "user_project_access_user_id_fkey";

-- DropTable
DROP TABLE "user_project_access";

-- CreateIndex: access checks ask "who has unlocked this scenario".
CREATE INDEX "learner_pass_claims_unlocked_scenario_idx" ON "learner_pass_claims"("unlocked_scenario");
