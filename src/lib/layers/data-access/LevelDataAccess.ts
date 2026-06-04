import prisma from '$lib/server/client';

export class LevelDataAccess {
  private levelCache: Map<number, { title: string; tasks: string[] }> = new Map();

  async getLevelInfo(level: number): Promise<{ title: string; tasks: string[] } | null> {
    if (this.levelCache.has(level)) {
      return this.levelCache.get(level) || null;
    }

    const levelInfo = await prisma.level.findFirst({
      where: { order: level },
      include: {
        tasks: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (levelInfo) {
      const result = { 
        title: levelInfo.title, 
        tasks: levelInfo.tasks.map(t => t.task_name) 
      };
      this.levelCache.set(level, result);
      return result;
    }

    return null;
  }

  async getLevelByOrder(level: number) {
    try {
      const data = await prisma.level.findFirst({
        where: { order: level },
        include: {
          tasks: {
            orderBy: { order: 'asc' }
          }
        }
      });
  
      return {
        id: data?.id,
        title: data?.title,
        subtitle: data?.subtitle,
        order: data?.order,
        sprintNumber: data?.sprint_number,
        deadline: data?.deadline,
        levelDescription: data?.level_description,
        xpReward: data?.xp_reward,
        coinReward: data?.coin_reward,
        keyTakeaways: data?.key_takeaways,
        epicId: data?.epic_id ?? null,
        scenarioId: data?.scenario_id,
        tasks: data?.tasks.map((task) => ({
          id: task.id,
          order: task.order,
          epicId: task.epic_id,
          levelId: task.level_id,
          taskName: task.task_name,
          userStory: task.user_story,
          isComplete: task.is_complete,
          testType: task.test_type
        }))
      }
    } catch (error) {
      return {
        success: false,
        status: 500,
        error: error
      }
    }

  }

  async getHighestLevelOrder(): Promise<number> {
    const level = await prisma.level.findFirst({
      orderBy: { order: 'desc' },
      select: { order: true }
    });
    return level?.order || 1;
  }
}
