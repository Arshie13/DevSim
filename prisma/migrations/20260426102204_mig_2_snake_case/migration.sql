/*
  Warnings:

  - You are about to drop the column `createdAt` on the `achievement` table. All the data in the column will be lost.
  - You are about to drop the column `criteria` on the `achievement` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `achievement` table. All the data in the column will be lost.
  - You are about to drop the column `completedAt` on the `completed_task` table. All the data in the column will be lost.
  - You are about to drop the column `prerequisites` on the `level` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `workspace` table. All the data in the column will be lost.
  - You are about to drop the column `startedAt` on the `workspace` table. All the data in the column will be lost.
  - You are about to drop the column `stoppedAt` on the `workspace` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `workspace` table. All the data in the column will be lost.
  - You are about to drop the column `stackName` on the `workspace_stack` table. All the data in the column will be lost.
  - You are about to drop the column `stackVersion` on the `workspace_stack` table. All the data in the column will be lost.
  - You are about to drop the `user_achievement` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updated_at` to the `achievement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `workspace` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stack_name` to the `workspace_stack` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "LearningSectionType" AS ENUM ('PLAIN_TEXT', 'INTERACTIVE');

-- CreateEnum
CREATE TYPE "LearningInteractiveMode" AS ENUM ('TERMINAL_CD', 'CODE_EDITOR');

-- CreateEnum
CREATE TYPE "achievement_tier_level" AS ENUM ('ROOKIE', 'AMATEUR', 'PRO');

-- DropForeignKey
ALTER TABLE "user_achievement" DROP CONSTRAINT "user_achievement_achievementId_fkey";

-- DropForeignKey
ALTER TABLE "user_achievement" DROP CONSTRAINT "user_achievement_user_id_fkey";

-- AlterTable
ALTER TABLE "achievement" DROP COLUMN "createdAt",
DROP COLUMN "criteria",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "completed_task" DROP COLUMN "completedAt",
ADD COLUMN     "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "level" DROP COLUMN "prerequisites";

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "hasCompletedTutorial" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'USER';

-- AlterTable
ALTER TABLE "workspace" DROP COLUMN "createdAt",
DROP COLUMN "startedAt",
DROP COLUMN "stoppedAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "stopped_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "workspace_stack" DROP COLUMN "stackName",
DROP COLUMN "stackVersion",
ADD COLUMN     "stack_name" TEXT NOT NULL,
ADD COLUMN     "stack_version" TEXT;

-- DropTable
DROP TABLE "user_achievement";

-- CreateTable
CREATE TABLE "learning_section" (
    "id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "section_type" "LearningSectionType" NOT NULL DEFAULT 'PLAIN_TEXT',
    "interactive_mode" "LearningInteractiveMode",
    "interactive_config" JSONB,

    CONSTRAINT "learning_section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievement_tiers" (
    "id" TEXT NOT NULL,
    "achievement_id" TEXT NOT NULL,
    "tier" "achievement_tier_level" NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT,
    "criteria" JSONB NOT NULL,
    "xp_reward" INTEGER NOT NULL DEFAULT 100,
    "coin_reward" INTEGER NOT NULL DEFAULT 50,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "achievement_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_achievement_tiers" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "achievement_id" TEXT NOT NULL,
    "tier" "achievement_tier_level" NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT,
    "criteria" JSONB NOT NULL,
    "xp_reward" INTEGER NOT NULL DEFAULT 100,
    "coin_reward" INTEGER NOT NULL DEFAULT 50,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_achievement_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_setting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'boolean',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_setting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_userTouser_achievement" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_userTouser_achievement_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "learning_section_task_id_idx" ON "learning_section"("task_id");

-- CreateIndex
CREATE INDEX "achievement_tiers_achievement_id_idx" ON "achievement_tiers"("achievement_id");

-- CreateIndex
CREATE UNIQUE INDEX "achievement_tiers_achievement_id_tier_key" ON "achievement_tiers"("achievement_id", "tier");

-- CreateIndex
CREATE INDEX "user_achievement_achievement_id_idx" ON "user_achievement_tiers"("achievement_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_achievement_achievement_id_tier_key" ON "user_achievement_tiers"("achievement_id", "tier");

-- CreateIndex
CREATE UNIQUE INDEX "app_setting_key_key" ON "app_setting"("key");

-- CreateIndex
CREATE INDEX "_userTouser_achievement_B_index" ON "_userTouser_achievement"("B");

-- AddForeignKey
ALTER TABLE "learning_section" ADD CONSTRAINT "learning_section_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "level_task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "achievement_tiers" ADD CONSTRAINT "achievement_tiers_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievement_tiers" ADD CONSTRAINT "user_achievement_tiers_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_userTouser_achievement" ADD CONSTRAINT "_userTouser_achievement_A_fkey" FOREIGN KEY ("A") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_userTouser_achievement" ADD CONSTRAINT "_userTouser_achievement_B_fkey" FOREIGN KEY ("B") REFERENCES "user_achievement_tiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
