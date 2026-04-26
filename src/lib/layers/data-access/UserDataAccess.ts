import prisma from '$lib/server/client';

export class UserDataAccess {
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
}
