-- Give a Learner Pass milestone day a consolation reward when the user already owns its
-- scenario.
--
-- Milestone days (6/12/18/24/30) each grant exactly one SCENARIO_3 project, and an unlock
-- deliberately outlives the pass that granted it (see `hasProjectAccess`). So on a second
-- pass every milestone day paid nothing: `choose-unlock` detected the situation — it computed
-- `alreadyOwned` — and then ignored it, spending the day on a scenario the user already had.
--
-- `fallback_reward` records the choice actually taken: 'COINS' or 'AI_HELPS'. Like
-- `unlocked_scenario`, its presence is the per-day "choice already made" marker, which is what
-- `derivePendingUnlocks` reads to stop re-prompting. The two columns are mutually exclusive.
--
-- No amount column: the value is rolled into the existing `coins_awarded` /
-- `ai_helps_awarded` payout snapshot, so summing what a pass paid stays a single-column read
-- rather than a COALESCE over two shapes.

ALTER TABLE "learner_pass_claims" ADD COLUMN "fallback_reward" TEXT;
