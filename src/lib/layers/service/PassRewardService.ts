import { UserPassDataAccess } from '../data-access/UserPassDataAccess';
import { PassRewardDataAccess } from '../data-access/PassRewardDataAccess';
import { RewardClaimLogDataAccess } from '../data-access/RewardClaimLogDataAccess';
import prisma from '$lib/server/client';
import type { PassType, RewardType } from '$prismaclient';

export class PassRewardService {
  private readonly userPassDao = new UserPassDataAccess();
  private readonly rewardDao = new PassRewardDataAccess();
  private readonly claimLogDao = new RewardClaimLogDataAccess();

  async claimReward(userId: string, rewardId: string, passType: PassType) {
    return await prisma.$transaction(async (tx) => {
      // 1. Fetch reward
      const reward = await tx.pass_reward_track.findFirst({
        where: { id: rewardId, passType },
        include: { season: true }
      });

      if (!reward) {
        throw new Error('Reward not found');
      }

      // 2. Get user's progression for this season
      const progression = await tx.user_season_progression.findFirst({
        where: { user_id: userId, season_id: reward.season_id }
      });

      if (!progression) {
        throw new Error('Progression not found for this season');
      }

      // 3. Validate level requirement
      const requiredLevel = passType === 'FREE' ? progression.currentLevel : progression.premiumLevel;
      if (!requiredLevel || requiredLevel < reward.level) {
        throw new Error('You have not reached the required level for this reward');
      }

      // 4. Check if reward is claimable (admin can disable)
      if (!reward.isClaimable) {
        throw new Error('This reward is not currently claimable');
      }

      // 5. Check if already claimed
      const existingClaim = await tx.user_reward_claim.findFirst({
        where: { user_id: userId, reward_id: rewardId }
      });

      if (existingClaim) {
        throw new Error('Reward already claimed');
      }

      // 5. Validate premium status for premium rewards (if needed)
      // Premium track rewards require premium pass - implicitly validated by progression.premiumLevel

      // 6. Grant the reward
      await this.grantReward(tx, userId, reward);

      // 7. Mark as claimed
      await tx.user_reward_claim.create({
        data: {
          user_id: userId,
          reward_id: rewardId,
          season_id: reward.season_id
        }
      });

      // 8. Audit log
      await this.claimLogDao.logClaim({
        userId,
        rewardId,
        seasonId: reward.season_id,
        success: true,
        error: null
      });

      return { success: true, reward };
    });
  }

   private async grantReward(tx: any, userId: string, reward: any) {
     const { rewardType, rewardValue } = reward;

     switch (rewardType) {
       case 'COINS': {
         const amount = rewardValue?.amount ?? rewardValue ?? 100;
         await tx.user.update({
           where: { id: userId },
           data: { coins: { increment: amount } }
         });
         break;
       }

       case 'AVATAR': {
         const avatarPath = rewardValue?.path;
         if (!avatarPath) throw new Error('Invalid avatar reward data');

         const user = await tx.user.findUnique({
           where: { id: userId },
           select: { owned_avatars: true }
         });

         if (!user.owned_avatars.includes(avatarPath)) {
           await tx.user.update({
             where: { id: userId },
             data: { owned_avatars: { push: avatarPath } }
           });
         }
         break;
       }

       case 'TITLE': {
         const title = rewardValue?.title ?? rewardValue?.name;
         if (!title) throw new Error('Invalid title reward data');

         await tx.user.update({
           where: { id: userId },
           data: { titles: { push: title } }
         });
         break;
       }

       case 'BADGE': {
         const badge = rewardValue?.badge ?? rewardValue?.id;
         if (!badge) throw new Error('Invalid badge reward data');

         await tx.user.update({
           where: { id: userId },
           data: { badges: { push: badge } }
         });
         break;
       }

       case 'BORDER': {
         const border = rewardValue?.border ?? rewardValue?.path;
         if (!border) throw new Error('Invalid border reward data');

         await tx.user.update({
           where: { id: userId },
           data: { borders: { push: border } }
         });
         break;
       }

       case 'AI_HELP_CREDITS': {
         const credits = rewardValue?.amount ?? 2;
         await tx.user.update({
           where: { id: userId },
           data: { aiHelpCredits: { increment: credits } }
         });
         break;
       }

       case 'XP_BOOST': {
         const percent = rewardValue?.percent ?? 50;
         const durationHours = rewardValue?.hours ?? 24;
         const expiresAt = new Date();
         expiresAt.setHours(expiresAt.getHours() + durationHours);

         await tx.user.update({
           where: { id: userId },
           data: {
             xpBoostPercent: percent,
             xpBoostExpiresAt: expiresAt
           }
         });
         break;
       }

       default:
         throw new Error(`Unknown reward type: ${rewardType}`);
     }
   }

  async getClaimedRewards(userId: string, seasonId: string) {
    const claims = await prisma.user_reward_claim.findMany({
      where: { user_id: userId, season_id: seasonId },
      include: {
        reward: {
          include: { season: true }
        }
      }
    });
    return claims.map(c => c.reward_id);
  }

  async getAvailableRewards(seasonId: string, passType: PassType, userLevel: number) {
    const allRewards = await this.rewardDao.getRewardsForSeason(seasonId, passType);
    const available = allRewards.filter(r => r.xpRequired <= userLevel && r.isClaimable);
    return available;
  }
}
