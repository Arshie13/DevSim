-- CreateEnum
CREATE TYPE "PassType" AS ENUM ('FREE', 'PREMIUM');

-- CreateEnum
CREATE TYPE "RewardType" AS ENUM ('COINS', 'XP_BOOST', 'AI_HELP_CREDITS', 'AVATAR', 'TITLE', 'BORDER', 'BADGE');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "badges" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "borders" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "currentSeasonId" TEXT,
ADD COLUMN     "dailyAiHelpUsed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "premiumPassExpiresAt" TIMESTAMP(3),
ADD COLUMN     "titles" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "season" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "xpReset" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "season_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_premium_pass" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "season_id" TEXT NOT NULL,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "paymentId" TEXT,
    "paymentProvider" TEXT,

    CONSTRAINT "user_premium_pass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pass_reward_track" (
    "id" TEXT NOT NULL,
    "season_id" TEXT NOT NULL,
    "passType" "PassType" NOT NULL,
    "level" INTEGER NOT NULL,
    "rewardType" "RewardType" NOT NULL,
    "rewardValue" JSONB,
    "xpRequired" INTEGER NOT NULL,
    "isClaimable" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "pass_reward_track_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_season_progression" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "season_id" TEXT NOT NULL,
    "currentLevel" INTEGER NOT NULL DEFAULT 1,
    "premiumLevel" INTEGER DEFAULT 0,
    "seasonXp" INTEGER NOT NULL DEFAULT 0,
    "totalXp" INTEGER,

    CONSTRAINT "user_season_progression_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_reward_claim" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "reward_id" TEXT NOT NULL,
    "season_id" TEXT NOT NULL,
    "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_reward_claim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_help_daily_usage" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ai_help_daily_usage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "season_slug_key" ON "season"("slug");

-- CreateIndex
CREATE INDEX "season_isActive_idx" ON "season"("isActive");

-- CreateIndex
CREATE INDEX "season_startDate_endDate_idx" ON "season"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "user_premium_pass_user_id_idx" ON "user_premium_pass"("user_id");

-- CreateIndex
CREATE INDEX "user_premium_pass_expiresAt_idx" ON "user_premium_pass"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_premium_pass_user_id_season_id_key" ON "user_premium_pass"("user_id", "season_id");

-- CreateIndex
CREATE INDEX "pass_reward_track_season_id_idx" ON "pass_reward_track"("season_id");

-- CreateIndex
CREATE INDEX "pass_reward_track_xpRequired_idx" ON "pass_reward_track"("xpRequired");

-- CreateIndex
CREATE UNIQUE INDEX "pass_reward_track_season_id_passType_level_key" ON "pass_reward_track"("season_id", "passType", "level");

-- CreateIndex
CREATE INDEX "user_season_progression_user_id_idx" ON "user_season_progression"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_season_progression_user_id_season_id_key" ON "user_season_progression"("user_id", "season_id");

-- CreateIndex
CREATE INDEX "user_reward_claim_user_id_idx" ON "user_reward_claim"("user_id");

-- CreateIndex
CREATE INDEX "user_reward_claim_season_id_idx" ON "user_reward_claim"("season_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_reward_claim_user_id_reward_id_key" ON "user_reward_claim"("user_id", "reward_id");

-- CreateIndex
CREATE INDEX "ai_help_daily_usage_user_id_date_idx" ON "ai_help_daily_usage"("user_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "ai_help_daily_usage_user_id_date_key" ON "ai_help_daily_usage"("user_id", "date");

-- AddForeignKey
ALTER TABLE "user_premium_pass" ADD CONSTRAINT "user_premium_pass_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_premium_pass" ADD CONSTRAINT "user_premium_pass_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pass_reward_track" ADD CONSTRAINT "pass_reward_track_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_season_progression" ADD CONSTRAINT "user_season_progression_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_season_progression" ADD CONSTRAINT "user_season_progression_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_reward_claim" ADD CONSTRAINT "user_reward_claim_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_reward_claim" ADD CONSTRAINT "user_reward_claim_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_help_daily_usage" ADD CONSTRAINT "ai_help_daily_usage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
