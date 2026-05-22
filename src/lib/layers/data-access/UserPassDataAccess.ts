import prisma from '$lib/server/client';

export type UserSeasonProgressionRow = {
  id: string;
  user_id: string;
  season_id: string;
  currentLevel: number;
  premiumLevel: number | null;
  seasonXp: number;
  totalXp: number | null;
};

export type UserSeasonProgressionWithSeason = UserSeasonProgressionRow & {
  season: {
    id: string;
    name: string;
    slug: string;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
  };
};

export class UserPassDataAccess {
  async getUserProgression(userId: string, seasonId?: string) {
    const where = seasonId
      ? { user_id: userId, season_id: seasonId }
      : { user_id: userId };

    const progression = await prisma.user_season_progression.findFirst({
      where,
      include: {
        season: {
          select: {
            id: true,
            name: true,
            slug: true,
            startDate: true,
            endDate: true,
            isActive: true
          }
        }
      }
    });

    return progression as UserSeasonProgressionWithSeason | null;
  }

  async createOrInitProgression(userId: string, seasonId: string, baselineTotalXp?: number) {
    const existing = await prisma.user_season_progression.findFirst({
      where: { user_id: userId, season_id: seasonId }
    });

    if (existing) {
      return existing as UserSeasonProgressionRow;
    }

    const progression = await prisma.user_season_progression.create({
      data: {
        user_id: userId,
        season_id: seasonId,
        totalXp: baselineTotalXp ?? 0
      }
    });

    return progression as UserSeasonProgressionRow;
  }

  async updateSeasonXp(userId: string, seasonId: string, additionalXp: number) {
    const progression = await prisma.user_season_progression.update({
      where: { user_id_season_id: { user_id: userId, season_id: seasonId } },
      data: {
        seasonXp: { increment: additionalXp }
      }
    });
    return progression as UserSeasonProgressionRow;
  }

  async updateLevels(userId: string, seasonId: string, freeLevel: number, premiumLevel?: number) {
    const data: { currentLevel: number; premiumLevel?: number } = { currentLevel: freeLevel };
    if (premiumLevel !== undefined) data.premiumLevel = premiumLevel;

    const progression = await prisma.user_season_progression.update({
      where: { user_id_season_id: { user_id: userId, season_id: seasonId } },
      data
    });
    return progression as UserSeasonProgressionRow;
  }

  async getUserSeasonRank(userId: string, seasonId: string) {
    const userProgression = await prisma.user_season_progression.findFirst({
      where: { user_id: userId, season_id: seasonId }
    });

    if (!userProgression) return null;

    const rank = await prisma.user_season_progression.count({
      where: {
        season_id: seasonId,
        seasonXp: { gt: userProgression.seasonXp }
      }
    });

    return rank + 1;
  }

  async resetSeasonForUser(userId: string, oldSeasonId: string, newSeasonId: string, baselineTotalXp: number) {
    await prisma.user_season_progression.updateMany({
      where: { user_id: userId, season_id: oldSeasonId },
      data: { seasonXp: 0, currentLevel: 1, premiumLevel: null }
    });

    return this.createOrInitProgression(userId, newSeasonId, baselineTotalXp);
  }

  async ensureActiveSeasonProgression(userId: string) {
    const activeSeason = await prisma.season.findFirst({
      where: { isActive: true }
    });

    if (!activeSeason) return null;

    return this.createOrInitProgression(userId, activeSeason.id);
  }
}
