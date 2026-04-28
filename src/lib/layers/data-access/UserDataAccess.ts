import prisma from '$lib/server/client';

export class UserDataAccess {
  async findUserById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
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
            coins: { increment: coins },
            level: { increment: 1 }
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
}
