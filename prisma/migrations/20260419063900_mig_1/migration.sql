-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "daily_login_id" TEXT,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "username" TEXT NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "coins" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "owned_avatars" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "has_completed_onboarding" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "container_id" TEXT NOT NULL,
    "current_scenario_id" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stoppedAt" TIMESTAMP(3),
    "volume_name" TEXT,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scenario" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,

    CONSTRAINT "scenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "epic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "scenario_id" TEXT NOT NULL,

    CONSTRAINT "epic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "level" (
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
    "prerequisites" JSONB,
    "epic_id" TEXT,
    "scenario_id" TEXT NOT NULL,

    CONSTRAINT "level_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "level_task" (
    "id" TEXT NOT NULL,
    "level_id" TEXT NOT NULL,
    "task_name" TEXT NOT NULL,
    "user_story" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_complete" BOOLEAN NOT NULL DEFAULT false,
    "test_type" TEXT NOT NULL DEFAULT 'none',
    "epic_id" TEXT,

    CONSTRAINT "level_task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "acceptance_criteria" (
    "id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "acceptance_criteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hint" (
    "id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "hint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_login" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "daily_login_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievement" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "criteria" JSONB NOT NULL,
    "xp_reward" INTEGER NOT NULL DEFAULT 100,
    "coin_reward" INTEGER NOT NULL DEFAULT 50,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_achievement" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_file_changes" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "old_path" TEXT,
    "content_hash" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_file_changes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "completed_task" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "task_name" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "completed_task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_stack" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "stackName" TEXT NOT NULL,
    "stackVersion" TEXT,

    CONSTRAINT "workspace_stack_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_daily_login_id_key" ON "user"("daily_login_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE INDEX "workspace_user_id_idx" ON "workspace"("user_id");

-- CreateIndex
CREATE INDEX "epic_scenario_id_idx" ON "epic"("scenario_id");

-- CreateIndex
CREATE INDEX "level_task_level_id_idx" ON "level_task"("level_id");

-- CreateIndex
CREATE UNIQUE INDEX "level_task_level_id_task_name_key" ON "level_task"("level_id", "task_name");

-- CreateIndex
CREATE INDEX "acceptance_criteria_task_id_idx" ON "acceptance_criteria"("task_id");

-- CreateIndex
CREATE INDEX "hint_task_id_idx" ON "hint"("task_id");

-- CreateIndex
CREATE UNIQUE INDEX "daily_login_user_id_key" ON "daily_login"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "achievement_name_key" ON "achievement"("name");

-- CreateIndex
CREATE INDEX "user_achievement_user_id_idx" ON "user_achievement"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_achievement_user_id_achievementId_key" ON "user_achievement"("user_id", "achievementId");

-- CreateIndex
CREATE INDEX "user_file_changes_workspace_id_timestamp_idx" ON "user_file_changes"("workspace_id", "timestamp");

-- CreateIndex
CREATE INDEX "completed_task_workspace_id_idx" ON "completed_task"("workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "completed_task_workspace_id_task_name_key" ON "completed_task"("workspace_id", "task_name");

-- CreateIndex
CREATE INDEX "workspace_stack_workspace_id_idx" ON "workspace_stack"("workspace_id");

-- AddForeignKey
ALTER TABLE "workspace" ADD CONSTRAINT "workspace_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace" ADD CONSTRAINT "workspace_current_scenario_id_fkey" FOREIGN KEY ("current_scenario_id") REFERENCES "scenario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "epic" ADD CONSTRAINT "epic_scenario_id_fkey" FOREIGN KEY ("scenario_id") REFERENCES "scenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "level" ADD CONSTRAINT "level_epic_id_fkey" FOREIGN KEY ("epic_id") REFERENCES "epic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "level" ADD CONSTRAINT "level_scenario_id_fkey" FOREIGN KEY ("scenario_id") REFERENCES "scenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "level_task" ADD CONSTRAINT "level_task_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "level"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acceptance_criteria" ADD CONSTRAINT "acceptance_criteria_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "level_task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hint" ADD CONSTRAINT "hint_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "level_task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_login" ADD CONSTRAINT "daily_login_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievement" ADD CONSTRAINT "user_achievement_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievement" ADD CONSTRAINT "user_achievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_file_changes" ADD CONSTRAINT "user_file_changes_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "completed_task" ADD CONSTRAINT "completed_task_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_stack" ADD CONSTRAINT "workspace_stack_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
