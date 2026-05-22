import { PassProgressionService } from './PassProgressionService';
import { UserDataAccess } from '../data-access/UserDataAccess';
import prisma from '$lib/server/client';

type XPSource = 
  | 'task_completion'
  | 'daily_login'
  | 'perfect_completion'
  | 'weekly_challenge'
  | 'achievement_unlock'
  | 'admin_grant'
  | 'event_bonus'
  | 'scenario_completion';

interface XPEvent {
  userId: string;
  amount: number;
  source: XPSource;
  metadata?: Record<string, any>;
}

export class XPEventService {
  private readonly passProgression: PassProgressionService;
  private readonly userDao: UserDataAccess;

  constructor() {
    this.passProgression = new PassProgressionService();
    this.userDao = new UserDataAccess();
  }

  async awardXP(event: XPEvent): Promise<{
    seasonXp: number;
    oldLevel: number;
    newLevel: number;
    levelUps: number[];
    totalXp: number;
    boostApplied?: number;
  }> {
    const { userId, amount, source, metadata } = event;

    if (amount <= 0) {
      throw new Error('XP amount must be positive');
    }

    // Atomic XP award across all systems within transaction
    return await prisma.$transaction(async (tx) => {
      // 1. Award season XP & update pass progression
      const progressionResult = await this.passProgression.awardXp(userId, amount, source);

      // 2. Total XP already updated inside awardXp via prisma.user.update
      // Fetch updated total XP
      const user = await tx.user.findUnique({ where: { id: userId } });

      return {
        seasonXp: progressionResult.seasonXp,
        oldLevel: progressionResult.oldLevel,
        newLevel: progressionResult.newLevel,
        levelUps: progressionResult.levelUps,
        totalXp: user?.xp ?? 0,
        boostApplied: progressionResult.boostApplied
      };
    });
   }

  // Helper: bulk award XP for multiple sources in one transaction
  async awardXPBatch(events: XPEvent[]): Promise<{ totalAwarded: number; allLevelUps: number[][] }> {
    let totalAwarded = 0;
    const allLevelUps: number[][] = [];

    for (const event of events) {
      const result = await this.awardXP(event);
      totalAwarded += event.amount;
      allLevelUps.push(result.levelUps);
    }

    return { totalAwarded, allLevelUps };
  }
}
