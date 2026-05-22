import { SeasonDataAccess } from '../data-access/SeasonDataAccess';
import { UserPassDataAccess } from '../data-access/UserPassDataAccess';
import prisma from '$lib/server/client';

export class SeasonService {
  private readonly seasonDao = new SeasonDataAccess();
  private readonly userPassDao = new UserPassDataAccess();

  async getCurrentSeason() {
    return await this.seasonDao.findActiveSeason();
  }

  async getSeasonWithProgress(userId: string, seasonId?: string) {
    if (seasonId) {
      const season = await this.seasonDao.findSeasonById(seasonId);
      if (!season) return null;

      const progression = await this.userPassDao.getUserProgression(userId, seasonId);
      return { season, progression };
    }

    const activeSeason = await this.seasonDao.findActiveSeason();
    if (!activeSeason) return null;

    const progression = await this.userPassDao.getUserProgression(userId, activeSeason.id);
    return { season: activeSeason, progression };
  }

  async getDaysRemaining(seasonId: string) {
    const season = await this.seasonDao.findSeasonById(seasonId);
    if (!season) return 0;

    const now = new Date();
    const diffMs = season.endDate.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }

  async isSeasonActive(seasonId: string) {
    const season = await this.seasonDao.findSeasonById(seasonId);
    return season?.isActive ?? false;
  }

  async advanceToNextSeason(oldSeasonId: string, newSeasonData: {
    name: string;
    slug: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    xpReset?: boolean;
  }) {
    return await prisma.$transaction(async (tx) => {
      // 1. Deactivate old season
      await tx.season.update({
        where: { id: oldSeasonId },
        data: { isActive: false }
      });

      // 2. Create new season
      const newSeason = await tx.season.create({
        data: {
          ...newSeasonData,
          isActive: true
        }
      });

      // 3. Get all users with progression in old season
      const oldProgressions = await tx.user_season_progression.findMany({
        where: { season_id: oldSeasonId }
      });

      // 4. Reset each user's progression for new season
      for (const prog of oldProgressions) {
        await tx.user_season_progression.create({
          data: {
            user_id: prog.user_id,
            season_id: newSeason.id,
            totalXp: prog.totalXp,
            seasonXp: 0,
            currentLevel: 1,
            premiumLevel: null
          }
        });
      }

      return newSeason;
    });
  }

   async backfillExistingUsersToSeason(seasonId: string) {
     const users = await prisma.user.findMany({
       select: { id: true }
     });

     const existingProgressions = await prisma.user_season_progression.findMany({
       where: { season_id: seasonId },
       select: { user_id: true }
     });
     const existingUserIds = new Set(existingProgressions.map(p => p.user_id));

     const usersToBackfill = users.filter(u => !existingUserIds.has(u.id));

     for (const user of usersToBackfill) {
       const dbUser = await prisma.user.findUnique({
         where: { id: user.id },
         select: { xp: true }
       });

       await prisma.user_season_progression.create({
         data: {
           user_id: user.id,
           season_id: seasonId,
           totalXp: dbUser?.xp ?? 0,
           seasonXp: 0,
           currentLevel: 1,
           premiumLevel: null
         }
       });
     }

     return usersToBackfill.length;
   }

   /**
    * Checks if the active season has ended (endDate <= now).
    * If ended, creates a new season starting now (duration 60 days)
    * and transitions all user progressions.
    * Returns whether a transition occurred.
    */
   async advanceSeasonIfNeeded(): Promise<{
     transitioned: boolean;
     oldSeason?: any;
     newSeason?: any;
   }> {
     const activeSeason = await this.seasonDao.findActiveSeason();
     if (!activeSeason) {
       return { transitioned: false };
     }

     const now = new Date();
     if (activeSeason.endDate > now) {
       // Season still active
       return { transitioned: false };
     }

     // Season has ended — create next season
     const lastSeasonNumber = this.extractSeasonNumber(activeSeason.name);
     const nextSeasonNumber = lastSeasonNumber + 1;

     const startDate = new Date(now);
     startDate.setHours(0, 0, 0, 0); // midnight UTC today

     const endDate = new Date(startDate);
     endDate.setDate(endDate.getDate() + 60); // 60-day season

     const newSeasonData = {
       name: `Season ${nextSeasonNumber}: Rising Developer`,
       slug: `season-${nextSeasonNumber}-rising`,
       description: 'A new season begins! Earn exclusive rewards and climb the leaderboard.',
       startDate,
       endDate,
       isActive: true,
       xpReset: false
     };

     const newSeason = await this.advanceToNextSeason(activeSeason.id, newSeasonData);

     return { transitioned: true, oldSeason: activeSeason, newSeason };
   }

   /**
    * Admin-triggered season reset: deactivate current and start a fresh season.
    */
   async forceStartNewSeason(seasonName?: string) {
     const activeSeason = await this.seasonDao.findActiveSeason();
     const now = new Date();

     const slug = `season-manual-${now.toISOString().slice(0, 10)}`;
     const name = seasonName || `Season ${now.toLocaleDateString()}`;

     const newSeasonData = {
       name,
       slug,
       description: 'Manually started season',
       startDate: now,
       endDate: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
       isActive: true,
       xpReset: false
     };

     if (activeSeason) {
       await this.advanceToNextSeason(activeSeason.id, newSeasonData);
     } else {
       await this.seasonDao.createSeason(newSeasonData);
     }

     return this.seasonDao.findActiveSeason();
   }

   private extractSeasonNumber(seasonName: string): number {
     const match = seasonName.match(/Season\s+(\d+)/i);
     return match ? parseInt(match[1]) : 1;
   }
 }
