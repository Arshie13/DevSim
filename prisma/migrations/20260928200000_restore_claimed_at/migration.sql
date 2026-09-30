-- Re-add `claimed_at`: the exact instant of the claim, for audit/display.
--
-- ⚠️ This does NOT restore the data that `20260928180000_drop_claimed_at` discarded.
-- Those instants are gone and cannot be recovered. Existing rows are backfilled with
-- the *start of their reward day* (the reset instant) — the earliest moment the claim
-- could have occurred. That is an explicit lower bound, NOT a recovered value: do
-- not read it as the time the user actually claimed.
--
-- New rows get an accurate `now()`. Note also that `claimed_at` is informational
-- only — the availability rule and the streak are date-based and never read it, and
-- it is deliberately not part of any key (a timestamp can't enforce one-per-day).

-- ── 1. Add it nullable so the existing rows can be filled deliberately ──────
ALTER TABLE "daily_login_claims"
  ADD COLUMN "claimed_at" TIMESTAMP(3);

-- ── 2. Backfill with the reset instant that opened each claim's reward day ──
-- Deterministic and derivable from data we still have: `claimed_on + 8h` is exactly
-- the moment that reward day began.
UPDATE "daily_login_claims"
SET "claimed_at" = ("claimed_on" + INTERVAL '8 hours')::timestamp
WHERE "claimed_at" IS NULL;

-- ── 3. Abort rather than leaving an unfilled row ────────────────────────────
DO $$
DECLARE missing INTEGER;
BEGIN
  SELECT count(*) INTO missing FROM "daily_login_claims" WHERE "claimed_at" IS NULL;
  IF missing > 0 THEN
    RAISE EXCEPTION '% daily_login_claim row(s) left without claimed_at. Aborting.', missing;
  END IF;
END $$;

-- ── 4. Enforce NOT NULL + default, matching the original column definition ──
ALTER TABLE "daily_login_claims"
  ALTER COLUMN "claimed_at" SET NOT NULL,
  ALTER COLUMN "claimed_at" SET DEFAULT CURRENT_TIMESTAMP;
