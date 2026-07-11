/*
  Warnings:

  - The `section_type` column on the `learning_section` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `interactive_mode` column on the `learning_section` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `role` column on the `user` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `tier` on the `achievement_tiers` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `tier` on the `user_achievement_tiers` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "achievement_tiers" DROP COLUMN "tier",
ADD COLUMN     "tier" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "learning_section" DROP COLUMN "section_type",
ADD COLUMN     "section_type" TEXT NOT NULL DEFAULT 'PLAIN_TEXT',
DROP COLUMN "interactive_mode",
ADD COLUMN     "interactive_mode" TEXT;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "role",
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'USER';

-- AlterTable
ALTER TABLE "user_achievement_tiers" DROP COLUMN "tier",
ADD COLUMN     "tier" TEXT NOT NULL;

-- DropEnum
DROP TYPE "LearningInteractiveMode";

-- DropEnum
DROP TYPE "LearningSectionType";

-- DropEnum
DROP TYPE "UserRole";

-- DropEnum
DROP TYPE "achievement_tier_level";

-- CreateIndex
CREATE UNIQUE INDEX "achievement_tiers_achievement_id_tier_key" ON "achievement_tiers"("achievement_id", "tier");

-- CreateIndex
CREATE UNIQUE INDEX "user_achievement_user_id_achievement_id_tier_key" ON "user_achievement_tiers"("user_id", "achievement_id", "tier");
