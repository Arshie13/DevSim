-- CreateTable
CREATE TABLE "pass_xp_log" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pass_xp_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reward_claim_log" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "reward_id" TEXT NOT NULL,
    "season_id" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reward_claim_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pass_xp_log_user_id_idx" ON "pass_xp_log"("user_id");

-- CreateIndex
CREATE INDEX "pass_xp_log_createdAt_idx" ON "pass_xp_log"("createdAt");

-- CreateIndex
CREATE INDEX "pass_xp_log_user_id_createdAt_idx" ON "pass_xp_log"("user_id", "createdAt");

-- CreateIndex
CREATE INDEX "reward_claim_log_user_id_idx" ON "reward_claim_log"("user_id");

-- CreateIndex
CREATE INDEX "reward_claim_log_reward_id_idx" ON "reward_claim_log"("reward_id");

-- CreateIndex
CREATE INDEX "reward_claim_log_season_id_idx" ON "reward_claim_log"("season_id");

-- CreateIndex
CREATE INDEX "reward_claim_log_createdAt_idx" ON "reward_claim_log"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "reward_claim_log_user_id_reward_id_key" ON "reward_claim_log"("user_id", "reward_id");

-- AddForeignKey
ALTER TABLE "pass_xp_log" ADD CONSTRAINT "pass_xp_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward_claim_log" ADD CONSTRAINT "reward_claim_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward_claim_log" ADD CONSTRAINT "reward_claim_log_reward_id_fkey" FOREIGN KEY ("reward_id") REFERENCES "pass_reward_track"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
