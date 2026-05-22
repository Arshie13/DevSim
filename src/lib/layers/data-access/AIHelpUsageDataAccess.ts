import prisma from '$lib/server/client';

export class AIHelpUsageDataAccess {
  async getDailyUsage(userId: string, date?: Date) {
    const targetDate = date ?? new Date();
    const dateOnly = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());

    const record = await prisma.ai_help_daily_usage.findFirst({
      where: {
        user_id: userId,
        date: dateOnly
      }
    });

    return record?.count ?? 0;
  }

  async incrementUsage(userId: string, date?: Date) {
    const targetDate = date ?? new Date();
    const dateOnly = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());

    const record = await prisma.ai_help_daily_usage.upsert({
      where: {
        user_id_date: {
          user_id: userId,
          date: dateOnly
        }
      },
      update: {
        count: { increment: 1 }
      },
      create: {
        user_id: userId,
        date: dateOnly,
        count: 1
      }
    });

    return record.count;
  }

  async setUsage(userId: string, count: number, date?: Date) {
    const targetDate = date ?? new Date();
    const dateOnly = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());

    const record = await prisma.ai_help_daily_usage.upsert({
      where: {
        user_id_date: {
          user_id: userId,
          date: dateOnly
        }
      },
      update: { count },
      create: {
        user_id: userId,
        date: dateOnly,
        count
      }
    });

    return record.count;
  }

  async resetUsage(userId: string, date?: Date) {
    const targetDate = date ?? new Date();
    const dateOnly = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());

    await prisma.ai_help_daily_usage.upsert({
      where: {
        user_id_date: {
          user_id: userId,
          date: dateOnly
        }
      },
      update: { count: 0 },
      create: {
        user_id: userId,
        date: dateOnly,
        count: 0
      }
    });
  }

  async getUsageHistory(userId: string, days: number = 7) {
    const dates: Date[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
    }

    const records = await prisma.ai_help_daily_usage.findMany({
      where: {
        user_id: userId,
        date: { in: dates }
      },
      orderBy: { date: 'desc' }
    });

    return records;
  }
}
