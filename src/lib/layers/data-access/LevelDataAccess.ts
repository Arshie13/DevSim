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

  async getLevelByOrder(level: number, scenarioId?: string) {
    try {
      // Level `order` repeats across scenarios, so scope by scenarioId when
      // known. Without it findFirst can return a different stack's level (and
      // its task names), which breaks the "all tasks completed" check on submit
      // and leaves the final level stuck out of "completed" status.
      const data = await prisma.level.findFirst({
        where: {
          order: level,
          ...(scenarioId ? { scenario_id: scenarioId } : {}),
        },
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

  /**
   * Highest level `order` for a scenario. Level orders repeat across every
   * scenario, so a scenarioId MUST be supplied to find the real last level of
   * the stack the user is playing — without it this returns the global max
   * across all scenarios, so a 5-level scenario never registers level 5 as the
   * last level (which leaves the workspace stuck out of "completed" status and
   * blocks the post-assessment).
   */
  async getHighestLevelOrder(scenarioId?: string): Promise<number> {
    const level = await prisma.level.findFirst({
      where: scenarioId ? { scenario_id: scenarioId } : undefined,
      orderBy: { order: 'desc' },
      select: { order: true }
    });
    return level?.order || 1;
  }
}
