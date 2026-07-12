import prisma from '$lib/server/client';

export class UserDataAccess {
  async findUserById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true }
    });
  }

  async updateUserXpAndCoins(userId: string, xp: number, coins: number, incrementLevel: boolean) {
    try {

      if (!incrementLevel) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            xp: { increment: xp },
            coins: { increment: coins }
          }
        });
      } else {
        await prisma.user.update({
          where: { id: userId },
          data: {
            xp: { increment: xp },
            coins: { increment: coins }
          }
        });
      }

      return { success: true }
    } catch (error) {
      console.error('Error updating user XP and coins:', error);
      return { success: false, error: error }
    }
  }

  async isAdmin(userId: string) {
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!dbUser || dbUser.role !== 'ADMIN') {
      return false;
    }

    return true;
  }

  async getUserCoins(userId: string) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      return { success: true, coins: user?.coins ?? 0, user };
    } catch (error) {
      console.error('Error fetching user coins:', error);
      return { success: false, error };
    }
  }

  async addUserCoins(userId: string, amount: number) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { coins: { increment: amount } }
      });
      return { success: true, coins: user.coins };
    } catch (error) {
      console.error('Error adding coins:', error);
      return { success: false, error };
    }
  }

  async deductCoins(userId: string, amount: number) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { coins: { decrement: amount } }
      });
      return { success: true, coins: user.coins };
    } catch (error) {
      console.error('Error deducting coins:', error);
      return { success: false, error };
    }
  }

  async refundCoins(userId: string, amount: number) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { coins: { increment: amount } }
      });
      return { success: true, coins: user.coins };
    } catch (error) {
      console.error('Error refunding coins:', error);
      return { success: false, error };
    }
  }

  /** Spend AI help credits, returning the user's new credit balance. */
  async consumeAiHelpCredits(userId: string, count: number): Promise<number> {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { ai_help_credits: { decrement: count } },
        select: { ai_help_credits: true }
      });
      return user.ai_help_credits;
    } catch (error) {
      console.error('Error consuming AI help credits:', error);
      throw error;
    }
  }

  /**
   * Convert coins into AI help credits in one atomic update.
   * Charges nothing if the user can't afford the full coin cost.
   */
  async convertCoinsToAiHelpCredits(userId: string, credits: number, coinCost: number) {
    try {
      const result = await prisma.user.updateMany({
        where: { id: userId, coins: { gte: coinCost } },
        data: {
          coins: { decrement: coinCost },
          ai_help_credits: { increment: credits }
        }
      });

      if (result.count === 0) {
        return { success: false, error: 'Insufficient coins' };
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { coins: true, ai_help_credits: true }
      });
      return { success: true, coins: user?.coins ?? 0, ai_help_credits: user?.ai_help_credits ?? 0 };
    } catch (error) {
      console.error('Error converting coins to AI help credits:', error);
      return { success: false, error: 'Failed to convert coins' };
    }
  }
}
