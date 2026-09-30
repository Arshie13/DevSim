-- Constrain `learner_pass_claim.unlocked_scenario` to real scenarios.
--
-- This column is now the sole record of premium access (it took over from the dropped
-- `user_project_access`), so leaving it as an unvalidated string was a weaker position than it
-- looks: a typo, a renamed id, or a deleted scenario would silently revoke a user's unlock with
-- nothing anywhere reporting it. The application would just start saying "not unlocked".
--
-- `ON DELETE RESTRICT`, deliberately — not CASCADE and not SET NULL:
--   * CASCADE would delete the user's claim, destroying their coins/XP history.
--   * SET NULL would quietly revoke their unlock.
-- RESTRICT forces the deletion to fail until someone decides what should happen. This matches
-- `workspace.current_scenario_id` and the access table this replaced.

-- Abort guard: `ADD CONSTRAINT` rejects orphans anyway, but with an error that names neither
-- the column nor the offending values.
DO $$
DECLARE
  orphans int;
  sample  text;
BEGIN
  SELECT count(*) INTO orphans
  FROM "learner_pass_claims" c
  WHERE c."unlocked_scenario" IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM "scenarios" s WHERE s."id" = c."unlocked_scenario");

  IF orphans > 0 THEN
    SELECT string_agg(DISTINCT c."unlocked_scenario", ', ')
    INTO sample
    FROM "learner_pass_claims" c
    WHERE c."unlocked_scenario" IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM "scenarios" s WHERE s."id" = c."unlocked_scenario");

    RAISE EXCEPTION
      'Aborting: % learner_pass_claim row(s) reference a scenario that does not exist: %. Fix or clear those references first.',
      orphans, sample;
  END IF;
END $$;

-- AddForeignKey
ALTER TABLE "learner_pass_claims" ADD CONSTRAINT "learner_pass_claims_unlocked_scenario_fkey" FOREIGN KEY ("unlocked_scenario") REFERENCES "scenarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
