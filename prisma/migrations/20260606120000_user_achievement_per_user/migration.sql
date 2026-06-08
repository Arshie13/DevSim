-- Restore per-user achievement persistence.
--
-- The snake_case migration (mig_2) replaced the direct user -> user_achievement
-- foreign key with a many-to-many join table and dropped the per-user uniqueness,
-- leaving a `(achievement_id, tier)` unique that allows only ONE user globally to
-- hold each tier. App reads use the scalar `user_id`, so the join table was dead
-- weight and unlocks could never be written correctly. This restores the FK and a
-- proper `(user_id, achievement_id, tier)` uniqueness. Both tables are unused
-- (never written), so no data migration is required.

-- DropTable (dead many-to-many join table; cascades drop its FKs/indexes)
DROP TABLE IF EXISTS "_userTouser_achievement";

-- DropIndex (global per-tier unique — wrong for multi-user)
DROP INDEX IF EXISTS "user_achievement_achievement_id_tier_key";

-- CreateIndex (per-user uniqueness + lookup index)
CREATE UNIQUE INDEX "user_achievement_user_id_achievement_id_tier_key" ON "user_achievement_tiers"("user_id", "achievement_id", "tier");
CREATE INDEX "user_achievement_user_id_idx" ON "user_achievement_tiers"("user_id");

-- AddForeignKey (direct user relation, restored from mig_1)
ALTER TABLE "user_achievement_tiers" ADD CONSTRAINT "user_achievement_tiers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
