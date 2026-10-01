-- Replace the composite `achievement_key` string with the two parts it encoded:
-- `family` (open identity, owned by the code catalog) and `tier` (closed ordinal
-- domain, owned by the schema as a native enum).
--
-- Payoffs: the database now rejects any tier outside ROOKIE/AMATEUR/PRO, `tier`
-- becomes directly comparable and groupable in SQL, and the old delimiter
-- invariant (a family key containing `:` silently broke lookups) is gone.
--
-- Hand-written rather than generated: the generated DDL adds `family` and `tier`
-- as `NOT NULL` directly, which fails on any table that already has rows.

-- ── 1. The enum ─────────────────────────────────────────────────────────────
CREATE TYPE "achievement_tier" AS ENUM ('ROOKIE', 'AMATEUR', 'PRO');

-- ── 2. New columns, nullable so existing rows can be backfilled ─────────────
ALTER TABLE "user_achievements"
  ADD COLUMN "family" TEXT,
  ADD COLUMN "tier"   "achievement_tier";

-- ── 3. Split the composite key ──────────────────────────────────────────────
-- A malformed key raises here — an invalid enum label, or an empty tier when the
-- delimiter is missing — rather than silently writing a row nothing resolves.
UPDATE "user_achievements"
SET "family" = split_part("achievement_key", ':', 1),
    "tier"   = split_part("achievement_key", ':', 2)::"achievement_tier";

-- ── 4. Abort rather than orphan unlock history ──────────────────────────────
DO $$
DECLARE unmapped INTEGER;
BEGIN
  SELECT count(*) INTO unmapped
  FROM "user_achievements"
  WHERE "family" IS NULL OR "family" = '' OR "tier" IS NULL;

  IF unmapped > 0 THEN
    RAISE EXCEPTION
      '% user_achievements row(s) could not be split from achievement_key. Aborting before the old column is dropped.',
      unmapped;
  END IF;
END $$;

-- ── 5. Swap the key ─────────────────────────────────────────────────────────
ALTER TABLE "user_achievements" DROP CONSTRAINT "user_achievements_pkey";
DROP INDEX IF EXISTS "user_achievements_achievement_key_idx";
ALTER TABLE "user_achievements" DROP COLUMN "achievement_key";

ALTER TABLE "user_achievements"
  ALTER COLUMN "family" SET NOT NULL,
  ALTER COLUMN "tier"   SET NOT NULL,
  ADD CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("user_id", "family", "tier");

-- Reverse lookups ("who unlocked PRO?"). Nothing queries this yet — drop it if
-- that need never materialises.
CREATE INDEX "user_achievements_family_tier_idx"
  ON "user_achievements"("family", "tier");
