/*
  Warnings:

  - You are about to drop the `achievement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ai_help_daily_usage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `app_setting` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `assessment_topic_score` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `coin_purchase` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `completed_task` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `daily_login` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `epic` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `hint` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `learner_pass_enrollment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `learner_pass_reward` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `learning_section` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `level` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `level_task` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `scenario` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `task_activity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_achievement_tiers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_file_changes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `workspace` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "acceptance_criteria" DROP CONSTRAINT "acceptance_criteria_task_id_fkey";

-- DropForeignKey
ALTER TABLE "achievement_tiers" DROP CONSTRAINT "achievement_tiers_achievement_id_fkey";

-- DropForeignKey
ALTER TABLE "ai_help_daily_usage" DROP CONSTRAINT "ai_help_daily_usage_user_id_fkey";

-- DropForeignKey
ALTER TABLE "assessment_topic_score" DROP CONSTRAINT "assessment_topic_score_user_id_fkey";

-- DropForeignKey
ALTER TABLE "coin_purchase" DROP CONSTRAINT "coin_purchase_user_id_fkey";

-- DropForeignKey
ALTER TABLE "completed_task" DROP CONSTRAINT "completed_task_workspace_id_fkey";

-- DropForeignKey
ALTER TABLE "daily_login" DROP CONSTRAINT "daily_login_user_id_fkey";

-- DropForeignKey
ALTER TABLE "epic" DROP CONSTRAINT "epic_scenario_id_fkey";

-- DropForeignKey
ALTER TABLE "hint" DROP CONSTRAINT "hint_task_id_fkey";

-- DropForeignKey
ALTER TABLE "learner_pass_enrollment" DROP CONSTRAINT "learner_pass_enrollment_user_id_fkey";

-- DropForeignKey
ALTER TABLE "learning_section" DROP CONSTRAINT "learning_section_task_id_fkey";

-- DropForeignKey
ALTER TABLE "level" DROP CONSTRAINT "level_epic_id_fkey";

-- DropForeignKey
ALTER TABLE "level" DROP CONSTRAINT "level_scenario_id_fkey";

-- DropForeignKey
ALTER TABLE "level_task" DROP CONSTRAINT "level_task_level_id_fkey";

-- DropForeignKey
ALTER TABLE "task_activity" DROP CONSTRAINT "task_activity_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_achievement_tiers" DROP CONSTRAINT "user_achievement_tiers_achievement_id_fkey";

-- DropForeignKey
ALTER TABLE "user_achievement_tiers" DROP CONSTRAINT "user_achievement_tiers_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_file_changes" DROP CONSTRAINT "user_file_changes_workspace_id_fkey";

-- DropForeignKey
ALTER TABLE "user_project_access" DROP CONSTRAINT "user_project_access_user_id_fkey";

-- DropForeignKey
ALTER TABLE "workspace" DROP CONSTRAINT "workspace_current_scenario_id_fkey";

-- DropForeignKey
ALTER TABLE "workspace" DROP CONSTRAINT "workspace_user_id_fkey";

-- DropTable
DROP TABLE "achievement";

-- DropTable
DROP TABLE "ai_help_daily_usage";

-- DropTable
DROP TABLE "app_setting";

-- DropTable
DROP TABLE "assessment_topic_score";

-- DropTable
DROP TABLE "coin_purchase";

-- DropTable
DROP TABLE "completed_task";

-- DropTable
DROP TABLE "daily_login";

-- DropTable
DROP TABLE "epic";

-- DropTable
DROP TABLE "hint";

-- DropTable
DROP TABLE "learner_pass_enrollment";

-- DropTable
DROP TABLE "learner_pass_reward";

-- DropTable
DROP TABLE "learning_section";

-- DropTable
DROP TABLE "level";

-- DropTable
DROP TABLE "level_task";

-- DropTable
DROP TABLE "scenario";

-- DropTable
DROP TABLE "task_activity";

-- DropTable
DROP TABLE "user";

-- DropTable
DROP TABLE "user_achievement_tiers";

-- DropTable
DROP TABLE "user_file_changes";

-- DropTable
DROP TABLE "workspace";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "username" TEXT NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "coins" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "owned_avatars" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "titles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "has_completed_tutorial" BOOLEAN NOT NULL DEFAULT false,
    "trivia_correct_count" INTEGER NOT NULL DEFAULT 0,
    "has_seen_dashboard_onboarding" BOOLEAN NOT NULL DEFAULT false,
    "badges" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "borders" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "daily_ai_help_used" INTEGER NOT NULL DEFAULT 0,
    "premium_pass_expires_at" TIMESTAMP(3),
    "ai_help_credits" INTEGER NOT NULL DEFAULT 0,
    "xp_boost_expires_at" TIMESTAMP(3),
    "xp_boost_percent" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspaces" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "container_id" TEXT NOT NULL,
    "volume_name" TEXT,
    "current_scenario_id" TEXT NOT NULL,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stopped_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "stack_name" TEXT,
    "stack_version" TEXT,
    "completed_tasks" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scenarios" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "is_paywalled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "scenarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "levels" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "sprint_number" INTEGER NOT NULL DEFAULT 1,
    "deadline" TIMESTAMP(3) NOT NULL,
    "level_description" TEXT NOT NULL,
    "xp_reward" INTEGER NOT NULL,
    "coin_reward" INTEGER NOT NULL,
    "key_takeaways" TEXT NOT NULL,
    "scenario_id" TEXT NOT NULL,

    CONSTRAINT "levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "level_tasks" (
    "id" TEXT NOT NULL,
    "level_id" TEXT NOT NULL,
    "task_name" TEXT NOT NULL,
    "user_story" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_complete" BOOLEAN NOT NULL DEFAULT false,
    "test_type" TEXT NOT NULL DEFAULT 'none',

    CONSTRAINT "level_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_sections" (
    "id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "section_type" TEXT NOT NULL DEFAULT 'PLAIN_TEXT',
    "interactive_mode" TEXT,
    "interactive_config" JSONB,

    CONSTRAINT "learning_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hints" (
    "id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "hints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_logins" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "user_id" TEXT NOT NULL,
    "claimed_days" TIMESTAMP(3)[] DEFAULT ARRAY[]::TIMESTAMP(3)[],
    "current_day" INTEGER NOT NULL DEFAULT 1,
    "last_claimed_at" TIMESTAMP(3),

    CONSTRAINT "daily_logins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "xp_reward" INTEGER NOT NULL DEFAULT 100,
    "coin_reward" INTEGER NOT NULL DEFAULT 50,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_achievements" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "achievement_tier_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_changes" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "old_path" TEXT,
    "content_hash" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_changes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_activities" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "task_name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_topic_scores" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "pre_score" INTEGER,
    "post_score" INTEGER,
    "improvement" INTEGER,
    "assessed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assessment_topic_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learner_pass_enrollments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "started_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "streak" INTEGER NOT NULL DEFAULT 0,
    "claimed_days" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "last_claimed_at" TIMESTAMP(3),
    "total_claimed_days" INTEGER NOT NULL DEFAULT 0,
    "payment_id" TEXT,
    "payment_provider" TEXT NOT NULL DEFAULT 'stripe',
    "unlock_choices" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learner_pass_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learner_pass_rewards" (
    "id" TEXT NOT NULL,
    "reward_index" INTEGER NOT NULL,
    "coins" INTEGER NOT NULL DEFAULT 0,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "ai_helps" INTEGER NOT NULL DEFAULT 0,
    "unlocked_scenario" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "display_type" TEXT NOT NULL DEFAULT '',
    "display_value" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learner_pass_rewards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coin_purchases" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "payment_id" TEXT NOT NULL,
    "coin_amount" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coin_purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "workspaces_user_id_idx" ON "workspaces"("user_id");

-- CreateIndex
CREATE INDEX "workspaces_current_scenario_id_idx" ON "workspaces"("current_scenario_id");

-- CreateIndex
CREATE INDEX "levels_id_idx" ON "levels"("id");

-- CreateIndex
CREATE INDEX "levels_scenario_id_idx" ON "levels"("scenario_id");

-- CreateIndex
CREATE INDEX "level_tasks_level_id_idx" ON "level_tasks"("level_id");

-- CreateIndex
CREATE UNIQUE INDEX "level_tasks_level_id_task_name_key" ON "level_tasks"("level_id", "task_name");

-- CreateIndex
CREATE INDEX "learning_sections_task_id_idx" ON "learning_sections"("task_id");

-- CreateIndex
CREATE INDEX "hints_task_id_idx" ON "hints"("task_id");

-- CreateIndex
CREATE UNIQUE INDEX "daily_logins_user_id_key" ON "daily_logins"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "achievements_name_key" ON "achievements"("name");

-- CreateIndex
CREATE INDEX "user_achievements_user_id_idx" ON "user_achievements"("user_id");

-- CreateIndex
CREATE INDEX "user_achievements_achievement_tier_id_idx" ON "user_achievements"("achievement_tier_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_achievements_user_id_achievement_tier_id_key" ON "user_achievements"("user_id", "achievement_tier_id");

-- CreateIndex
CREATE INDEX "file_changes_workspace_id_timestamp_idx" ON "file_changes"("workspace_id", "timestamp");

-- CreateIndex
CREATE INDEX "task_activities_user_id_completed_at_idx" ON "task_activities"("user_id", "completed_at");

-- CreateIndex
CREATE INDEX "assessment_topic_scores_user_id_idx" ON "assessment_topic_scores"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_topic_scores_user_id_topic_key" ON "assessment_topic_scores"("user_id", "topic");

-- CreateIndex
CREATE UNIQUE INDEX "learner_pass_enrollments_payment_id_key" ON "learner_pass_enrollments"("payment_id");

-- CreateIndex
CREATE INDEX "learner_pass_enrollments_user_id_idx" ON "learner_pass_enrollments"("user_id");

-- CreateIndex
CREATE INDEX "learner_pass_enrollments_expires_at_idx" ON "learner_pass_enrollments"("expires_at");

-- CreateIndex
CREATE INDEX "learner_pass_enrollments_payment_id_idx" ON "learner_pass_enrollments"("payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "learner_pass_rewards_reward_index_key" ON "learner_pass_rewards"("reward_index");

-- CreateIndex
CREATE UNIQUE INDEX "coin_purchases_payment_id_key" ON "coin_purchases"("payment_id");

-- CreateIndex
CREATE INDEX "coin_purchases_user_id_idx" ON "coin_purchases"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "app_settings_key_key" ON "app_settings"("key");

-- AddForeignKey
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_current_scenario_id_fkey" FOREIGN KEY ("current_scenario_id") REFERENCES "scenarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "levels" ADD CONSTRAINT "levels_scenario_id_fkey" FOREIGN KEY ("scenario_id") REFERENCES "scenarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "level_tasks" ADD CONSTRAINT "level_tasks_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "levels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_sections" ADD CONSTRAINT "learning_sections_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "level_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acceptance_criteria" ADD CONSTRAINT "acceptance_criteria_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "level_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hints" ADD CONSTRAINT "hints_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "level_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_logins" ADD CONSTRAINT "daily_logins_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "achievement_tiers" ADD CONSTRAINT "achievement_tiers_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_tier_id_fkey" FOREIGN KEY ("achievement_tier_id") REFERENCES "achievement_tiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_changes" ADD CONSTRAINT "file_changes_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_activities" ADD CONSTRAINT "task_activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_topic_scores" ADD CONSTRAINT "assessment_topic_scores_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learner_pass_enrollments" ADD CONSTRAINT "learner_pass_enrollments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_project_access" ADD CONSTRAINT "user_project_access_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coin_purchases" ADD CONSTRAINT "coin_purchases_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
