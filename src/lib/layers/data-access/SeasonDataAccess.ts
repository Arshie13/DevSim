import prisma from '$lib/server/client';

export type SeasonRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  xpReset: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export class SeasonDataAccess {
  async findActiveSeason() {
    const season = await prisma.season.findFirst({
      where: { isActive: true }
    });
    return season as SeasonRow | null;
  }

  async findSeasonById(seasonId: string) {
    const season = await prisma.season.findUnique({
      where: { id: seasonId }
    });
    return season as SeasonRow | null;
  }

  async findSeasonBySlug(slug: string) {
    const season = await prisma.season.findFirst({
      where: { slug }
    });
    return season as SeasonRow | null;
  }

  async createSeason(data: {
    name: string;
    slug: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    isActive?: boolean;
    xpReset?: boolean;
  }) {
    const season = await prisma.season.create({
      data
    });
    return season as SeasonRow;
  }

  async updateSeason(seasonId: string, data: Partial<SeasonRow>) {
    const season = await prisma.season.update({
      where: { id: seasonId },
      data
    });
    return season as SeasonRow;
  }

  async getAllSeasons() {
    const seasons = await prisma.season.findMany({
      orderBy: { startDate: 'desc' }
    });
    return seasons as SeasonRow[];
  }

  async getCurrentSeasonWithProgress() {
    const season = await prisma.season.findFirst({
      where: { isActive: true },
      include: {
        user_progression: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
                xp: true,
                level: true
              }
            }
          }
        }
      }
    });

    if (!season) return null;

    const seasonWithProgress = {
      ...season,
      user_progression: season.user_progression.map((up) => ({
        ...up,
        user: up.user
      }))
    };

    return seasonWithProgress;
  }
}
