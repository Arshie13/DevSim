-- Fix user_achievement unique constraint to include user_id,
-- allowing multiple users to earn the same achievement tier.

-- Drop the old constraint (achievement_id, tier) that prevented multiple users
-- from having the same achievement.
DROP INDEX IF EXISTS "user_achievement_achievement_id_tier_key";

-- Create the correct constraint scoped per user.
CREATE UNIQUE INDEX "user_achievement_user_id_achievement_id_tier_key"
  ON "user_achievement_tiers"("user_id", "achievement_id", "tier");
