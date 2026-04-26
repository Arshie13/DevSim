import prisma from '$lib/server/client';

export class LevelDataAccess {
  async getLevelByOrder(order: number) {
    const level = await prisma.level.findFirst({
      where: { order },
      orderBy: { order: 'asc' },
      include: {
        tasks: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!level) return null;

    return {
      id: level.id,
      title: level.title,
      subtitle: level.subtitle,
      order: level.order,
      sprintNumber: level.sprint_number,
      deadline: level.deadline,
      levelDescription: level.level_description,
      xpReward: level.xp_reward,
      coinReward: level.coin_reward,
      keyTakeaways: level.key_takeaways,
      // prerequisites: level.prerequisites,
      epicId: level.epic_id,
      scenarioId: level.scenario_id,
      tasks: level.tasks.map(task => ({
        id: task.id,
        order: task.order,
        epicId: task.epic_id,
        levelId: task.level_id,
        taskName: task.task_name,
        userStory: task.user_story,
        isComplete: task.is_complete,
        testType: task.test_type
      }))
    };
  }

  async getHighestLevelOrder() {
    const highestLevel = await prisma.level.findFirst({
      orderBy: { order: 'desc' },
      select: { order: true }
    });
    return highestLevel?.order ?? 0;
  }
}
