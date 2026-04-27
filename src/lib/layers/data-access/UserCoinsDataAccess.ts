import prisma from '$lib/server/client';

export class UserCoinsDataAccess {
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
