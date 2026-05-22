import { UserPassDataAccess } from '../data-access/UserPassDataAccess';
import { PassRewardDataAccess } from '../data-access/PassRewardDataAccess';
import { PassXpLogDataAccess } from '../data-access/PassXpLogDataAccess';
import prisma from '$lib/server/client';
import type { PassType, RewardType } from '$prismaclient';

const XP_PER_LEVEL_TABLE: Record<number, number> = {
  1: 0,
  2: 100,
  3: 250,
  4: 450,
  5: 700,
  6: 1000,
  7: 1350,
  8: 1750,
  9: 2200,
  10: 2700,
  11: 3250,
  12: 3850,
  13: 4500,
  14: 5200,
  15: 5950,
  16: 6750,
  17: 7600,
  18: 8500,
  19: 9450,
  20: 10450
};

// Maximum XP allowed per source (anti-inflation)
const XP_CAPS: Record<string, number> = {
  task_completion: 100,
  daily_login: 100,
  perfect_completion: 50,
  weekly_challenge: 300,
  achievement_unlock: 200,
  scenario_completion: 100,
  admin_grant: 999999, // unlimited
  event_bonus: 500
};

export class PassProgressionService {
  private readonly userPassDao = new UserPassDataAccess();
  private readonly rewardDao = new PassRewardDataAccess();
  private readonly xpLogDao = new PassXpLogDataAccess();

   async awardXp(userId: string, amount: number, source: string): Promise<{
     seasonXp: number;
     oldLevel: number;
     newLevel: number;
     levelUps: number[];
     boostApplied?: number;
   }> {
     if (amount <= 0) throw new Error('XP amount must be positive');

     // Validate source
     if (!source || !(source in XP_CAPS)) {
       throw new Error(`Invalid XP source: ${source}`);
     }

     // Enforce maximum XP per source (anti-inflation)
     const cap = XP_CAPS[source];
     if (amount > cap) {
       throw new Error(`XP amount ${amount} exceeds maximum allowed (${cap}) for source ${source}`);
     }

     // At the start of the transaction
     return await prisma.$transaction(async (tx) => {
       const activeProgression = await this.userPassDao.ensureActiveSeasonProgression(userId);
       if (!activeProgression) throw new Error('No active season progression found');

       const seasonId = activeProgression.season_id;
       const oldLevel = activeProgression.currentLevel;
       const oldSeasonXp = activeProgression.seasonXp;

       // Check for active XP boost
       const user = await tx.user.findUnique({
         where: { id: userId },
         select: { xpBoostPercent: true, xpBoostExpiresAt: true }
       });

       let effectiveAmount = amount;
       let boostApplied = 0;
       const now = new Date();

       if (user?.xpBoostPercent && user.xpBoostPercent > 0 && user.xpBoostExpiresAt && user.xpBoostExpiresAt > now) {
         boostApplied = Math.floor(amount * (user.xpBoostPercent / 100));
         effectiveAmount = amount + boostApplied;
       }

       const newSeasonXp = oldSeasonXp + effectiveAmount;

       // Update season XP
       await this.userPassDao.updateSeasonXp(userId, seasonId, effectiveAmount);

       // Also update total XP in user table (permanent)
       await tx.user.update({
         where: { id: userId },
         data: { xp: { increment: effectiveAmount } }
       });

       // Audit log: record XP award
       await this.xpLogDao.logXpAward({
         userId,
         amount: effectiveAmount,
         source,
         metadata: {
           baseAmount: amount,
           boostApplied,
           seasonId,
           oldLevel,
           newLevel: this.calculateLevelFromXp(newSeasonXp).level
         }
       });

       // Calculate new level
       const levelInfo = this.calculateLevelFromXp(newSeasonXp);
       const newLevel = levelInfo.level;

       // Update level if increased
       if (newLevel > oldLevel) {
         await this.userPassDao.updateLevels(userId, seasonId, newLevel);
       }

       return {
         seasonXp: newSeasonXp,
         oldLevel,
         newLevel,
         levelUps: newLevel > oldLevel ? Array.from({ length: newLevel - oldLevel }, (_, i) => oldLevel + i + 1) : [],
         boostApplied
       };
     });
   }

  calculateLevelFromXp(seasonXp: number): { level: number; xpToNext: number; isMaxLevel: boolean } {
    let level = 1;
    for (let l = 20; l >= 1; l--) {
      const threshold = XP_PER_LEVEL_TABLE[l];
      if (threshold !== undefined && seasonXp >= threshold) {
        level = l;
        break;
      }
    }

    const isMaxLevel = level >= 20;
    const nextThreshold = XP_PER_LEVEL_TABLE[level + 1];
    const xpToNext = nextThreshold ? nextThreshold - seasonXp : 0;

    return { level, xpToNext, isMaxLevel };
  }

   async getUserProgress(userId: string, seasonId?: string) {
     const progression = await this.userPassDao.getUserProgression(userId, seasonId);
     if (!progression) return null;

     const levelInfo = this.calculateLevelFromXp(progression.seasonXp);

     const freeRewards = await this.rewardDao.getRewardsForSeason(progression.season.id, 'FREE');
     const premiumRewards = await this.rewardDao.getRewardsForSeason(progression.season.id, 'PREMIUM');

     const currentFreeReward = freeRewards.find(r => r.level === progression.currentLevel);
     const currentPremiumReward = progression.premiumLevel
       ? premiumRewards.find(r => r.level === progression.premiumLevel)
       : null;

     // Check premium pass status for this season
     const now = new Date();
     const premiumPass = await prisma.user_premium_pass.findFirst({
       where: {
         user_id: userId,
         season_id: progression.season.id,
         isActive: true,
         expiresAt: { gt: now }
       }
     });

     const premiumStatus = premiumPass
       ? { hasPremium: true, expiresAt: premiumPass.expiresAt }
       : { hasPremium: false, expiresAt: null };

     return {
       season: {
         id: progression.season.id,
         name: progression.season.name,
         slug: progression.season.slug,
         startDate: progression.season.startDate,
         endDate: progression.season.endDate,
         isActive: progression.season.isActive
       },
       progression: {
         seasonXp: progression.seasonXp,
         freeTrackLevel: progression.currentLevel,
         premiumTrackLevel: progression.premiumLevel,
         levelInfo
       },
        availableRewards: {
          free: freeRewards.map(r => ({
            id: r.id,
            level: r.level,
            rewardType: r.rewardType,
            rewardValue: r.rewardValue,
            xpRequired: r.xpRequired,
            isClaimable: r.isClaimable && progression.seasonXp >= r.xpRequired,
            isUnlocked: progression.seasonXp >= r.xpRequired,
            claimed: false, // will be filled later
            requiresPremium: false
          })),
          premium: premiumRewards.map(r => ({
            id: r.id,
            level: r.level,
            rewardType: r.rewardType,
            rewardValue: r.rewardValue,
            xpRequired: r.xpRequired,
            isClaimable: r.isClaimable && progression.seasonXp >= r.xpRequired,
            isUnlocked: progression.seasonXp >= r.xpRequired,
            claimed: false,
            requiresPremium: true
          }))
        },
        premium: premiumStatus
      };
    }

  async getRewardsForPass(seasonId: string, passType: PassType) {
    return await this.rewardDao.getRewardsForSeason(seasonId, passType);
  }
}
