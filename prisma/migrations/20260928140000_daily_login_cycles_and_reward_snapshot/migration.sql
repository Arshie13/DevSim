-- Make the daily-login reward ladder repeatable and self-contained.
--
--   * `cycle_index` joins the key so the ladder can be replayed. The old key
--     `(daily_login_id, day_index)` allowed each day exactly once *ever*, so
--     after 7 claims every request 409'd — the ladder dead-ended permanently
--     with no way to start again.
--   * the payout is snapshotted onto the claim row, so editing the ladder later
--     cannot rewrite what a past day was actually worth.
--   * the redundant `daily_login_id` index is dropped. It was already covered by
--     the old unique key, and the new key covers it too.
--
-- Hand-written rather than generated: the generated DDL adds the three snapshot
-- columns as `NOT NULL` with no default, which fails on any table with rows.

-- ── 1. `cycle_index` can be added NOT NULL directly — it has a default of 0 ──
ALTER TABLE "daily_login_claims"
  ADD COLUMN "cycle_index" INTEGER NOT NULL DEFAULT 0;

-- ── 2. Snapshot columns, nullable so existing rows can be backfilled ─────────
ALTER TABLE "daily_login_claims"
  ADD COLUMN "coins_awarded"    INTEGER,
  ADD COLUMN "xp_awarded"       INTEGER,
  ADD COLUMN "ai_helps_awarded" INTEGER;

-- ── 3. Backfill from the ladder as it stood at migration time ────────────────
-- Duplicated here deliberately: a migration is a historical record and must keep
-- the values that applied when it ran, independent of later edits to
-- `src/lib/server/dailyRewards/schedule.ts`.
UPDATE "daily_login_claims" c
SET "coins_awarded"    = r.coins,
    "xp_awarded"       = r.xp,
    "ai_helps_awarded" = r.ai_helps
FROM (VALUES
  (0,  50,  10,   1),
  (1,  75,  20,   1),
  (2, 100,  30,   2),
  (3, 150,  40,   2),
  (4, 200,  50,   2),
  (5, 300,  75,   3),
  (6, 500, 100,   5)
) AS r(day_index, coins, xp, ai_helps)
WHERE c."day_index" = r.day_index;

-- ── 4. Abort rather than leaving a claim with no recorded payout ────────────
DO $$
DECLARE unmapped INTEGER;
BEGIN
  SELECT count(*) INTO unmapped
  FROM "daily_login_claims"
  WHERE "coins_awarded" IS NULL
     OR "xp_awarded" IS NULL
     OR "ai_helps_awarded" IS NULL;

  IF unmapped > 0 THEN
    RAISE EXCEPTION
      '% daily_login_claim row(s) have a day_index outside the known ladder (0-6). Extend the VALUES list above and re-run.',
      unmapped;
  END IF;
END $$;

-- ── 5. Enforce, then swap the key ───────────────────────────────────────────
ALTER TABLE "daily_login_claims"
  ALTER COLUMN "coins_awarded"    SET NOT NULL,
  ALTER COLUMN "xp_awarded"       SET NOT NULL,
  ALTER COLUMN "ai_helps_awarded" SET NOT NULL;

DROP INDEX IF EXISTS "daily_login_claims_daily_login_id_idx";
DROP INDEX IF EXISTS "daily_login_claims_daily_login_id_day_index_key";

-- Existing rows are all cycle 0. A user who had already claimed all 7 now
-- derives to cycle 1 / day 0, so their ladder is playable again.
CREATE UNIQUE INDEX "daily_login_claims_daily_login_id_cycle_index_day_index_key"
  ON "daily_login_claims"("daily_login_id", "cycle_index", "day_index");
