import { AIHelpUsageDataAccess } from '../data-access/AIHelpUsageDataAccess';
import prisma from '$lib/server/client';

const FREE_DAILY_LIMIT = 5;
const PREMIUM_DAILY_LIMIT = 10;

export class AIHelpLimitService {
  private readonly usageDao = new AIHelpUsageDataAccess();

  async getRemainingHelps(userId: string): Promise<{
    freeRemaining: number;
    premiumRemaining: number;
    totalUsed: number;
    isPremium: boolean;
    limit: number;
  }> {
    const isPremium = await this.isUserPremium(userId);
    const dailyLimit = isPremium ? PREMIUM_DAILY_LIMIT : FREE_DAILY_LIMIT;
    const used = await this.usageDao.getDailyUsage(userId);
    const remaining = Math.max(0, dailyLimit - used);

    return {
      freeRemaining: isPremium ? PREMIUM_DAILY_LIMIT - used : FREE_DAILY_LIMIT - used,
      premiumRemaining: 0,
      totalUsed: used,
      isPremium,
      limit: dailyLimit
    };
  }

  async canUseAIToday(userId: string): Promise<boolean> {
    const { freeRemaining } = await this.getRemainingHelps(userId);
    return freeRemaining > 0;
  }

  async incrementUsage(userId: string): Promise<{ success: boolean; remaining: number; limit: number }> {
    const isPremium = await this.isUserPremium(userId);
    const dailyLimit = isPremium ? PREMIUM_DAILY_LIMIT : FREE_DAILY_LIMIT;
    const used = await this.usageDao.getDailyUsage(userId);

    if (used >= dailyLimit) {
      return { success: false, remaining: 0, limit: dailyLimit };
    }

    const newCount = await this.usageDao.incrementUsage(userId);
    const remaining = Math.max(0, dailyLimit - newCount);

    return { success: true, remaining, limit: dailyLimit };
  }

  /**
   * Consume one AI help, prioritizing bonus credits over daily limit.
   * Returns whether consumption succeeded and remaining counts.
   */
  async consumeHelp(userId: string): Promise<{
    consumed: boolean;
    isCredit: boolean;
    dailyRemaining: number;
    creditsRemaining: number;
    limit: number;
  }> {
    const isPremium = await this.isUserPremium(userId);
    const dailyLimit = isPremium ? PREMIUM_DAILY_LIMIT : FREE_DAILY_LIMIT;

    // Check bonus credits first
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { aiHelpCredits: true }
    });

    const credits = user?.aiHelpCredits ?? 0;
    if (credits > 0) {
      // Use a credit
      await prisma.user.update({
        where: { id: userId },
        data: { aiHelpCredits: { decrement: 1 } }
      });
      const dailyUsed = await this.usageDao.getDailyUsage(userId);
      return {
        consumed: true,
        isCredit: true,
        dailyRemaining: Math.max(0, dailyLimit - dailyUsed),
        creditsRemaining: credits - 1,
        limit: dailyLimit
      };
    }

    // No credits; use daily limit
    const used = await this.usageDao.getDailyUsage(userId);
    if (used >= dailyLimit) {
      return {
        consumed: false,
        isCredit: false,
        dailyRemaining: 0,
        creditsRemaining: 0,
        limit: dailyLimit
      };
    }

    const newCount = await this.usageDao.incrementUsage(userId);
    const remaining = Math.max(0, dailyLimit - newCount);

    return {
      consumed: true,
      isCredit: false,
      dailyRemaining: remaining,
      creditsRemaining: 0,
      limit: dailyLimit
    };
  }

  async resetDailyIfNeeded(userId: string): Promise<void> {
    const now = new Date();
    // In a real system, a cron job would reset daily. This method is for manual/lazy reset.
    // For MVP, we'll rely on date-based lookup: each day gets its own row automatically.
    // So no explicit reset needed — usage is tracked per-date.
  }

  private async isUserPremium(userId: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { premiumPassExpiresAt: true }
      });

      if (!user?.premiumPassExpiresAt) return false;

      const now = new Date();
      return user.premiumPassExpiresAt > now;
    } catch {
      return false;
    }
  }
}
