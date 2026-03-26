import type { PageServerLoad, Actions } from "./$types";
import { redirect } from "@sveltejs/kit";
import prisma from "$lib/server/client";

export const load: PageServerLoad = async (event) => {
  const session = await event.locals.auth();

  if (!session?.user) {
    throw redirect(303, '/')
  }

  // For now, check if user is admin (you may want to add an isAdmin field to User model)
  // const dbUser = await prisma.user.findUnique({ 
  //   where: { id: session.user.id },
  //   select: { isAdmin: true }
  // });
  
  // if (!dbUser?.isAdmin) {
  //   throw redirect(303, '/dashboard');
  // }

  // Get all scenarios from database
  const scenarios = await prisma.scenario.findMany({
    include: {
      levels: {
        orderBy: { order: 'asc' },
        include: {
          tasks: {
            orderBy: { order: 'asc' },
            include: {
              acceptanceCriteria: {
                orderBy: { order: 'asc' }
              },
              hints: {
                orderBy: { order: 'asc' }
              }
            }
          }
        }
      }
    },
    orderBy: { name: 'asc' }
  });

  return {
    scenarios,
    user: session.user
  };
};

export const actions: Actions = {
  // Scenario CRUD
  createScenario: async ({ request }) => {
    const data = await request.formData();
    const name = data.get('name') as string;
    const description = data.get('description') as string;
    const difficulty = data.get('difficulty') as string;

    await prisma.scenario.create({
      data: {
        name,
        description,
        difficulty
      }
    });
  },

  updateScenario: async ({ request }) => {
    const data = await request.formData();
    const id = data.get('id') as string;
    const name = data.get('name') as string;
    const description = data.get('description') as string;
    const difficulty = data.get('difficulty') as string;

    await prisma.scenario.update({
      where: { id },
      data: {
        name,
        description,
        difficulty
      }
    });
  },

  deleteScenario: async ({ request }) => {
    const data = await request.formData();
    const id = data.get('id') as string;

    await prisma.scenario.delete({
      where: { id }
    });
  },

  // Level CRUD
  createLevel: async ({ request }) => {
    const data = await request.formData();
    const scenarioId = data.get('scenarioId') as string;
    const title = data.get('title') as string;
    const order = parseInt(data.get('order') as string) || 0;

    await prisma.level.create({
      data: {
        scenarioId,
        title,
        subtitle: '',
        order,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days
        levelDescription: '',
        xpReward: 100,
        coinReward: 50
      }
    });
  },

  updateLevel: async ({ request }) => {
    const data = await request.formData();
    const id = data.get('id') as string;
    const title = data.get('title') as string;
    const subtitle = data.get('subtitle') as string;
    const order = parseInt(data.get('order') as string) || 0;
    const deadline = data.get('deadline') as string;
    const levelDescription = data.get('levelDescription') as string;
    const xpReward = parseInt(data.get('xpReward') as string) || 0;
    const coinReward = parseInt(data.get('coinReward') as string) || 0;

    await prisma.level.update({
      where: { id },
      data: {
        title,
        subtitle,
        order,
        deadline: deadline ? new Date(deadline) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        levelDescription,
        xpReward,
        coinReward
      }
    });
  },

  deleteLevel: async ({ request }) => {
    const data = await request.formData();
    const id = data.get('id') as string;

    await prisma.level.delete({
      where: { id }
    });
  },

  // Task CRUD
  createTask: async ({ request }) => {
    const data = await request.formData();
    const levelId = data.get('levelId') as string;
    const taskName = data.get('taskName') as string;
    const userStory = data.get('userStory') as string;
    const order = parseInt(data.get('order') as string) || 0;

    await prisma.levelTask.create({
      data: {
        levelId,
        taskName,
        userStory,
        order,
        testType: 'none'
      }
    });
  },

  updateTask: async ({ request }) => {
    const data = await request.formData();
    const id = data.get('id') as string;
    const taskName = data.get('taskName') as string;
    const userStory = data.get('userStory') as string;
    const order = parseInt(data.get('order') as string) || 0;
    const testType = data.get('testType') as string;

    await prisma.levelTask.update({
      where: { id },
      data: {
        taskName,
        userStory,
        order,
        testType
      }
    });
  },

  deleteTask: async ({ request }) => {
    const data = await request.formData();
    const id = data.get('id') as string;

    await prisma.levelTask.delete({
      where: { id }
    });
  },

  // Acceptance Criteria CRUD
  createAcceptanceCriteria: async ({ request }) => {
    const data = await request.formData();
    const taskId = data.get('taskId') as string;
    const description = data.get('description') as string;

    // Get current count for order
    const count = await prisma.acceptanceCriteria.count({ where: { taskId } });

    await prisma.acceptanceCriteria.create({
      data: {
        taskId,
        description,
        order: count,
        isRequired: false
      }
    });
  },

  deleteAcceptanceCriteria: async ({ request }) => {
    const data = await request.formData();
    const id = data.get('id') as string;

    await prisma.acceptanceCriteria.delete({
      where: { id }
    });
  },

  // Hints CRUD
  createHint: async ({ request }) => {
    const data = await request.formData();
    const taskId = data.get('taskId') as string;
    const description = data.get('description') as string;

    // Get current count for order
    const count = await prisma.hint.count({ where: { taskId } });

    await prisma.hint.create({
      data: {
        taskId,
        description,
        order: count
      }
    });
  },

  deleteHint: async ({ request }) => {
    const data = await request.formData();
    const id = data.get('id') as string;

    await prisma.hint.delete({
      where: { id }
    });
  }
};