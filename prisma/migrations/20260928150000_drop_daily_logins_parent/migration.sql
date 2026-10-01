-- Remove the `daily_logins` parent table and key claims directly on `user_id`.
--
-- `daily_logins` held exactly two data columns — `streak` and `last_claimed_at` —
-- and both were derivable from the claim rows it hung off:
--
--   * last_claimed_at = MAX(claimed_at)
--   * streak          = a fold over the claims ordered by claimed_at, resetting
--                       to 1 whenever a gap exceeds 48h
--
-- That made it pure denormalisation, and the invariant that kept it in sync (both
-- rows written in one transaction by the claim route) was held by convention, not
-- by the schema: any other writer would have silently desynced the streak from the
-- actual claim history. Same reasoning that removed the `achievements` table.
--
-- The surrogate `id` goes too — `(user_id, cycle_index, day_index)` is already the
-- natural key, matching `user_achievements`.
--
-- Hand-written rather than generated: the generated DDL adds `user_id` as
-- `NOT NULL`, which fails on any table that has rows.

-- ── 1. New column, nullable so existing rows can be backfilled ──────────────
ALTER TABLE "daily_login_claims"
  ADD COLUMN "user_id" TEXT;

-- ── 2. Backfill the owner from the parent table ─────────────────────────────
UPDATE "daily_login_claims" c
SET "user_id" = d."user_id"
FROM "daily_logins" d
WHERE c."daily_login_id" = d."id";

-- ── 3. Abort rather than leaving claims with no owner ───────────────────────
DO $$
DECLARE orphaned INTEGER;
BEGIN
  SELECT count(*) INTO orphaned
  FROM "daily_login_claims"
  WHERE "user_id" IS NULL OR "user_id" = '';

  IF orphaned > 0 THEN
    RAISE EXCEPTION
      '% daily_login_claim row(s) could not be traced to a user. Aborting before daily_logins is dropped.',
      orphaned;
  END IF;
END $$;

-- ── 4. Drop the old shape ───────────────────────────────────────────────────
ALTER TABLE "daily_login_claims"
  DROP CONSTRAINT IF EXISTS "daily_login_claims_daily_login_id_fkey",
  DROP CONSTRAINT IF EXISTS "daily_login_claims_pkey";

DROP INDEX IF EXISTS "daily_login_claims_daily_login_id_cycle_index_day_index_key";

ALTER TABLE "daily_login_claims"
  DROP COLUMN "daily_login_id",
  DROP COLUMN "id";

-- ── 5. Enforce the new shape ────────────────────────────────────────────────
ALTER TABLE "daily_login_claims"
  ALTER COLUMN "user_id" SET NOT NULL,
  ADD CONSTRAINT "daily_login_claims_pkey"
    PRIMARY KEY ("user_id", "cycle_index", "day_index");

ALTER TABLE "daily_login_claims"
  ADD CONSTRAINT "daily_login_claims_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Supports the streak fold and the MAX(claimed_at) cooldown anchor.
CREATE INDEX "daily_login_claims_user_id_claimed_at_idx"
  ON "daily_login_claims"("user_id", "claimed_at");

-- ── 6. The parent table is now redundant ────────────────────────────────────
DROP TABLE "daily_logins";
