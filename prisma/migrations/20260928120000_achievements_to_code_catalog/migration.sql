-- Move the achievement catalog out of the database and into application code.
--
-- The catalog now lives in `src/lib/server/achievements/definitions.ts`. It is
-- static reference data, so the table only ever bought an admin UI — at the cost
-- of joins, per-environment drift, unvalidated JSON criteria, and an ON DELETE
-- CASCADE that destroyed unlock history whenever a catalog row was removed.
--
-- `achievements` is dropped. `user_achievements` is rebuilt to store a stable
-- code-defined key (`<family_key>:<TIER>`, e.g. `stack_master:PRO`) plus a
-- snapshot of the payout that was actually granted, so editing a reward constant
-- in code can never silently rewrite what a user was given historically.
--
-- Hand-written rather than generated: the generated DDL adds `achievement_key`
-- and `xp_awarded` as `NOT NULL` directly, which fails on any table with rows.

-- ── 1. New columns, nullable so existing rows can be backfilled ──────────────
ALTER TABLE "user_achievements"
  ADD COLUMN "achievement_key" TEXT,
  ADD COLUMN "coins_awarded"   INTEGER,
  ADD COLUMN "xp_awarded"      INTEGER,
  ADD COLUMN "earned_at"       TIMESTAMP(3);

-- ── 2. Backfill from the old catalog ────────────────────────────────────────
-- The new key is derived from (family name, tier) so no cuid has to be
-- hardcoded. The payout is snapshotted from the tier's reward columns as they
-- stood at migration time — the best available approximation of what was
-- granted when the row was written.
UPDATE "user_achievements" ua
SET "achievement_key" = m.family_key || ':' || a."tier",
    "xp_awarded"      = a."xp_reward",
    "coins_awarded"   = a."coin_reward",
    "earned_at"       = ua."created_at"
FROM "achievements" a
JOIN (VALUES
  ('Stack Master',   'stack_master'),
  ('Level Climber',  'level_climber'),
  ('Task Slayer',    'task_slayer'),
  ('Stack Explorer', 'stack_explorer'),
  ('Scenario Nomad', 'scenario_nomad'),
  ('Daily Driver',   'daily_driver'),
  ('Code Committer', 'code_committer'),
  ('XP Grinder',     'xp_grinder'),
  ('Coin Collector', 'coin_collector'),
  ('Quiz Whiz',      'quiz_whiz'),
  ('First Boot',     'first_boot')
) AS m(name, family_key) ON m.name = a."name"
WHERE ua."achievement_id" = a."id";

-- ── 3. Abort rather than silently orphaning unlock history ──────────────────
-- If any row failed to map, the family is missing from the VALUES list above.
-- Failing here leaves the old catalog intact so the mapping can be corrected.
DO $$
DECLARE unmapped INTEGER;
BEGIN
  SELECT count(*) INTO unmapped
  FROM "user_achievements"
  WHERE "achievement_key" IS NULL
     OR "xp_awarded"      IS NULL
     OR "coins_awarded"   IS NULL
     OR "earned_at"       IS NULL;

  IF unmapped > 0 THEN
    RAISE EXCEPTION
      '% user_achievements row(s) could not be mapped to a code-defined key. Aborting before the old catalog is dropped — add the missing family to the VALUES list above and re-run.',
      unmapped;
  END IF;
END $$;

-- ── 4. Drop the old shape ───────────────────────────────────────────────────
ALTER TABLE "user_achievements"
  DROP CONSTRAINT IF EXISTS "user_achievements_achievement_id_fkey",
  DROP CONSTRAINT IF EXISTS "user_achievements_pkey";

DROP INDEX IF EXISTS "user_achievements_user_id_idx";
DROP INDEX IF EXISTS "user_achievements_achievement_id_idx";
DROP INDEX IF EXISTS "user_achievements_user_id_achievement_id_key";

ALTER TABLE "user_achievements"
  DROP COLUMN "achievement_id",
  DROP COLUMN "created_at",
  DROP COLUMN "id",
  DROP COLUMN "updated_at";

-- ── 5. Enforce the new shape ────────────────────────────────────────────────
-- No surrogate `id`: (user_id, achievement_key) is already the natural key.
-- No `updated_at`: unlocks are immutable once written.
ALTER TABLE "user_achievements"
  ALTER COLUMN "achievement_key" SET NOT NULL,
  ALTER COLUMN "coins_awarded"   SET NOT NULL,
  ALTER COLUMN "xp_awarded"      SET NOT NULL,
  ALTER COLUMN "earned_at"       SET NOT NULL,
  ALTER COLUMN "earned_at"       SET DEFAULT CURRENT_TIMESTAMP,
  ADD CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("user_id", "achievement_key");

-- Supports reverse lookups ("who unlocked this?") used by the rivals views.
CREATE INDEX "user_achievements_achievement_key_idx"
  ON "user_achievements"("achievement_key");

-- ── 6. The catalog is now code ──────────────────────────────────────────────
DROP TABLE "achievements";
