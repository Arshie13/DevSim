import prisma from '$lib/server/client';

export class RewardClaimLogDataAccess {
  async logClaim(data: {
    userId: string;
    rewardId: string;
    seasonId: string;
    success: boolean;
    error?: string | null;
  }) {
    return await prisma.reward_claim_log.create({
      data: {
        user_id: data.userId,
        reward_id: data.rewardId,
        season_id: data.seasonId,
        success: data.success,
        error: data.error ?? null
      }
    });
  }

  async getClaimsForUser(userId: string, limit = 50) {
    return await prisma.reward_claim_log.findMany({
      where: { user_id: userId },
      include: {
        reward: {
          select: {
            id: true,
            level: true,
            rewardType: true,
            rewardValue: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }

  async getClaimsForReward(rewardId: string, limit = 50) {
    return await prisma.reward_claim_log.findMany({
      where: { reward_id: rewardId },
      include: {
        user: {
          select: { id: true, username: true, name: true, image: true }
        },
        reward: {
          select: {
            id: true,
            level: true,
            rewardType: true,
            xpRequired: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }

  async getFailedClaims(limit = 50) {
    return await prisma.reward_claim_log.findMany({
      where: { success: false },
      include: {
        user: {
          select: { id: true, username: true, name: true }
        },
        reward: true
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }
}
