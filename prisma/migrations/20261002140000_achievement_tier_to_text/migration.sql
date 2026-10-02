-- user_achievement.tier: replace the `achievement_tier` enum with TEXT.
--
-- Tier values are already modelled in code by the `achievement_tier_level` union
-- (`$types`) and validated against the catalog in
-- `src/lib/server/achievements/definitions.ts`, so the database enum was redundant —
-- and it meant every new tier required a migration. `findTierDef` returns `undefined`
-- for an unknown value, so free text is safe at the boundary.
--
-- `enum -> text` has no implicit cast, so an explicit USING is required.

ALTER TABLE "user_achievements"
  ALTER COLUMN "tier" TYPE TEXT USING "tier"::text;

DROP TYPE "achievement_tier";
