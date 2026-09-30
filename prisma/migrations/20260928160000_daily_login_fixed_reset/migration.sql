-- Switch daily-login availability from a rolling 24h window to a fixed daily reset.
--
-- Reset is 16:00 UTC+8 == 08:00 UTC, so a reward day runs 08:00 -> 08:00 UTC.
-- `claimed_on` stores the reset-shifted reward day, which makes the primary key
-- `(user_id, claimed_on)` literally the "one reward per day" rule — enforced by the
-- database rather than by application arithmetic.
--
-- This also fixes a real bug: with a 24h cooldown and a 48h streak-break threshold,
-- claiming Mon 23:00 then Wed 21:00 (a 46h gap) kept the streak even though Tuesday
-- was never claimed. A date-based streak cannot do that, because there is no
-- threshold left to get wrong.
--
-- The `(user_id, claimed_at)` index is dropped: it existed to order the timestamp
-- fold, and the new primary key's leading `user_id` already serves the ordered
-- `claimed_on` scan.
--
-- Hand-written rather than generated: the generated DDL adds `claimed_on` as
-- `NOT NULL`, which fails on any table that has rows.

-- ── 1. New column, nullable so existing rows can be backfilled ──────────────
ALTER TABLE "daily_login_claims"
  ADD COLUMN "claimed_on" DATE;

-- ── 2. Backfill the reset-shifted reward day ────────────────────────────────
-- `claimed_at` is a naive UTC timestamp (Prisma normalises to UTC), so shifting it
-- down by the 8h reset offset and taking the date is exact. Doing the arithmetic in
-- the naive domain avoids a session-timezone-dependent `::date` cast.
UPDATE "daily_login_claims"
SET "claimed_on" = ("claimed_at" - INTERVAL '8 hours')::date;

-- ── 3. Abort rather than lose a row through the new primary key ─────────────
DO $$
DECLARE
  unmapped INTEGER;
  duplicates INTEGER;
BEGIN
  SELECT count(*) INTO unmapped FROM "daily_login_claims" WHERE "claimed_on" IS NULL;
  IF unmapped > 0 THEN
    RAISE EXCEPTION '% row(s) could not be mapped to a reward day. Aborting.', unmapped;
  END IF;

  -- A 24h cooldown should make this impossible (consecutive claims were always
  -- >= 24h apart), but two claims collapsing onto one reward day would be silently
  -- dropped by the new key, so verify first.
  SELECT count(*) INTO duplicates FROM (
    SELECT "user_id", "claimed_on"
    FROM "daily_login_claims"
    GROUP BY "user_id", "claimed_on"
    HAVING count(*) > 1
  ) d;

  IF duplicates > 0 THEN
    RAISE EXCEPTION
      '% user/reward-day pair(s) already hold more than one claim. Resolve them before applying this migration — the new primary key cannot store both.',
      duplicates;
  END IF;
END $$;

-- ── 4. Swap the key ─────────────────────────────────────────────────────────
ALTER TABLE "daily_login_claims"
  DROP CONSTRAINT IF EXISTS "daily_login_claims_pkey";

DROP INDEX IF EXISTS "daily_login_claims_user_id_claimed_at_idx";

ALTER TABLE "daily_login_claims"
  ALTER COLUMN "claimed_on" SET NOT NULL,
  ADD CONSTRAINT "daily_login_claims_pkey" PRIMARY KEY ("user_id", "claimed_on");
