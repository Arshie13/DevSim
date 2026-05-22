import prisma from '$lib/server/client';
import type { PassType, RewardType } from '$prismaclient';

export type PassRewardRow = {
  id: string;
  season_id: string;
  passType: PassType;
  level: number;
  rewardType: RewardType;
  rewardValue: any;
  xpRequired: number;
  isClaimable: boolean;
};

export class PassRewardDataAccess {
  async getRewardsForSeason(seasonId: string, passType: PassType) {
    const rewards = await prisma.pass_reward_track.findMany({
      where: { season_id: seasonId, passType },
      orderBy: { level: 'asc' }
    });
    return rewards as PassRewardRow[];
  }

  async getRewardsAtLevel(seasonId: string, passType: PassType, level: number) {
    const reward = await prisma.pass_reward_track.findFirst({
      where: { season_id: seasonId, passType, level }
    });
    return reward as PassRewardRow | null;
  }

  async getNextReward(seasonId: string, passType: PassType, currentLevel: number) {
    const reward = await prisma.pass_reward_track.findFirst({
      where: {
        season_id: seasonId,
        passType,
        level: { gt: currentLevel },
        isClaimable: true
      },
      orderBy: { level: 'asc' }
    });
    return reward as PassRewardRow | null;
  }

  async createReward(data: {
    season_id: string;
    passType: PassType;
    level: number;
    rewardType: RewardType;
    rewardValue: any;
    xpRequired: number;
    isClaimable?: boolean;
  }) {
    const reward = await prisma.pass_reward_track.create({
      data
    });
    return reward as PassRewardRow;
  }

  async bulkCreateRewards(rewards: Array<{
    season_id: string;
    passType: PassType;
    level: number;
    rewardType: RewardType;
    rewardValue: any;
    xpRequired: number;
  }>) {
    const created = await prisma.pass_reward_track.createMany({
      data: rewards
    });
    return created.count;
  }

  async getRewardById(rewardId: string) {
    const reward = await prisma.pass_reward_track.findUnique({
      where: { id: rewardId }
    });
    return reward as PassRewardRow | null;
  }
}
