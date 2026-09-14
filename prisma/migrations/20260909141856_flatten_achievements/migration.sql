-- Flatten achievement_tiers into achievements while preserving tier IDs and unlock history.
ALTER TABLE "achievement_tiers" DROP CONSTRAINT "achievement_tiers_achievement_id_fkey";
ALTER TABLE "user_achievements" DROP CONSTRAINT "user_achievements_achievement_tier_id_fkey";

DROP INDEX "achievements_name_key";
DROP INDEX "user_achievements_achievement_tier_id_idx";
DROP INDEX "user_achievements_user_id_achievement_tier_id_key";

ALTER TABLE "achievements"
  ADD COLUMN "criteria" JSONB,
  ADD COLUMN "tier" TEXT,
  ADD COLUMN "tier_description" TEXT,
  ADD COLUMN "xp_reward" INTEGER NOT NULL DEFAULT 100,
  ADD COLUMN "coin_reward" INTEGER NOT NULL DEFAULT 50;

INSERT INTO "achievements" (
  "id", "name", "description", "icon", "category", "tier",
  "tier_description", "criteria", "xp_reward", "coin_reward",
  "created_at", "updated_at"
)
SELECT
  t."id", a."name", a."description", a."icon", a."category", t."tier",
  t."description", t."criteria", t."xp_reward", t."coin_reward",
  t."created_at", t."updated_at"
FROM "achievement_tiers" t
JOIN "achievements" a ON a."id" = t."achievement_id";

ALTER TABLE "user_achievements" RENAME COLUMN "achievement_tier_id" TO "achievement_id";

DELETE FROM "achievements" a
WHERE NOT EXISTS (
  SELECT 1 FROM "achievement_tiers" t WHERE t."id" = a."id"
);

ALTER TABLE "achievements"
  ALTER COLUMN "criteria" SET NOT NULL,
  ALTER COLUMN "tier" SET NOT NULL,
  ALTER COLUMN "tier_description" SET NOT NULL;

DROP TABLE "achievement_tiers";

CREATE UNIQUE INDEX "achievements_name_tier_key" ON "achievements"("name", "tier");
CREATE INDEX "user_achievements_achievement_id_idx" ON "user_achievements"("achievement_id");
CREATE UNIQUE INDEX "user_achievements_user_id_achievement_id_key" ON "user_achievements"("user_id", "achievement_id");

ALTER TABLE "user_achievements"
  ADD CONSTRAINT "user_achievements_achievement_id_fkey"
  FOREIGN KEY ("achievement_id") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
