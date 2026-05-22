-- AddForeignKey
ALTER TABLE "user_reward_claim" ADD CONSTRAINT "user_reward_claim_reward_id_fkey" FOREIGN KEY ("reward_id") REFERENCES "pass_reward_track"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
