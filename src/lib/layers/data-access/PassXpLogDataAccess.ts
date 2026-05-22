import prisma from '$lib/server/client';

export class PassXpLogDataAccess {
  async logXpAward(data: {
    userId: string;
    amount: number;
    source: string;
    metadata?: Record<string, any>;
  }) {
    return await prisma.pass_xp_log.create({
      data: {
        user_id: data.userId,
        amount: data.amount,
        source: data.source,
        metadata: data.metadata
      }
    });
  }

  async getXpHistory(userId: string, limit = 50) {
    return await prisma.pass_xp_log.findMany({
      where: { user_id: userId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }

  async getXpBySource(userId: string, source: string, startDate?: Date, endDate?: Date) {
    const where: any = { user_id: userId, source };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) (where.createdAt as any).gte = startDate;
      if (endDate) (where.createdAt as any).lte = endDate;
    }

    return await prisma.pass_xp_log.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
  }
}
