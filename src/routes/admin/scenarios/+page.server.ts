import { redirect } from '@sveltejs/kit';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { Prisma } from '$prismaclient';
import prisma from '$lib/server/client';
import { resolveStackName, resolveScenarioId } from '$lib/utils/scenario-mapping';
import { docker } from '$lib/server/docker/client';

function getMappedId(imageTag: string): string | null {
  const parts = imageTag.split("-scenario-");
  if (parts.length < 2) return null;
  const stackName = parts[0];
  const scenarioNum = parts[1].split("-")[0];
  const folderId = `scenario-${scenarioNum}`;
  const resolved = resolveScenarioId(stackName, folderId);
  return resolved !== folderId ? resolved : null;
}

async function listDevsimImages(): Promise<string[]> {
  try {
    const images = await docker.listImages({ filters: { reference: ["devsim-project:*"] } });
    const tags: string[] = [];
    for (const img of images) {
      for (const tag of img.RepoTags ?? []) {
        if (tag.startsWith("devsim-project:")) {
          tags.push(tag.replace("devsim-project:", ""));
        }
      }
    }
    return tags.sort();
  } catch {
    return [];
  }
}

export const load: PageServerLoad = async () => {
  const [scenarios, availableImages] = await Promise.all([
    prisma.scenario.findMany({
      include: {
        levels: {
          orderBy: { order: 'asc' },
        include: {
          tasks: {
            orderBy: { order: 'asc' },
            include: {
              acceptance_criteria: { orderBy: { order: 'asc' } },
              learning_sections: { orderBy: { order: 'asc' } }
            }
          }
        }
        }
      },
      orderBy: { name: 'asc' }
    }),
    listDevsimImages()
  ]);

  const existingIds = new Set(scenarios.map(s => s.id));
  const unusedImages = availableImages
    .map(tag => ({ tag, mappedId: getMappedId(tag) }))
    .filter(img => !img.mappedId || !existingIds.has(img.mappedId));

  return {
    scenarios: scenarios.map(s => ({
      id: s.id,
      name: s.name,
      description: s.description,
      difficulty: s.difficulty,
      isPaywalled: s.is_paywalled,
      stackName: resolveStackName(s.id) ?? 'Unknown',
      levels: s.levels.map(l => ({
        id: l.id,
        title: l.title,
        subtitle: l.subtitle,
        order: l.order,
        sprintNumber: l.sprint_number,
        deadline: l.deadline.toISOString().split('T')[0],
        levelDescription: l.level_description,
        xpReward: l.xp_reward,
        coinReward: l.coin_reward,
        keyTakeaways: l.key_takeaways,
        scenarioId: l.scenario_id,
        tasks: l.tasks.map(t => ({
          id: t.id,
          taskName: t.task_name,
          userStory: t.user_story,
          order: t.order,
          isComplete: t.is_complete,
          testType: t.test_type,
          levelId: t.level_id,
          acceptanceCriteria: t.acceptance_criteria.map(ac => ({
            id: ac.id,
            description: ac.description,
            isRequired: ac.is_required,
            order: ac.order
          })),
          learningSections: t.learning_sections.map(ls => ({
            id: ls.id,
            taskId: ls.task_id,
            title: ls.title,
            content: ls.content,
            order: ls.order,
            sectionType: ls.section_type,
            interactiveMode: ls.interactive_mode,
            interactiveConfig: ls.interactive_config
          }))
        }))
      }))
    })),
    availableImages: unusedImages
  };
};

export const actions: Actions = {
  createScenario: async ({ request }) => {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const difficulty = formData.get('difficulty') as string;
    const id = formData.get('id') as string;

    if (!name || !description) {
      return fail(400, { message: 'Name and description are required' });
    }

    await prisma.scenario.create({
      data: { id: id || undefined, name, description, difficulty: difficulty || 'Easy' }
    });

    return { success: true };
  },

  updateScenario: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const difficulty = formData.get('difficulty') as string;
    const isPaywalled = formData.get('isPaywalled') === 'true';

    if (!id || !name) {
      return fail(400, { message: 'ID and name are required' });
    }

    await prisma.scenario.update({
      where: { id },
      data: { name, description, difficulty, is_paywalled: isPaywalled }
    });

    return { success: true };
  },

  deleteScenario: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;

    if (!id) {
      return fail(400, { message: 'Missing scenario ID' });
    }

    await prisma.scenario.delete({ where: { id } });
    return { success: true };
  },

  createLevel: async ({ request }) => {
    const formData = await request.formData();
    const scenarioId = formData.get('scenarioId') as string;
    const title = formData.get('title') as string;
    const subtitle = formData.get('subtitle') as string;
    const order = parseInt(formData.get('order') as string) || 1;
    const sprintNumber = parseInt(formData.get('sprintNumber') as string) || 1;
    const deadline = formData.get('deadline') as string;
    const levelDescription = formData.get('levelDescription') as string;
    const xpReward = parseInt(formData.get('xpReward') as string) || 100;
    const coinReward = parseInt(formData.get('coinReward') as string) || 50;
    const keyTakeaways = formData.get('keyTakeaways') as string;

    if (!scenarioId || !title) {
      return fail(400, { message: 'Scenario ID and title are required' });
    }

    await prisma.level.create({
      data: {
        title,
        subtitle: subtitle || '',
        order,
        sprint_number: sprintNumber,
        deadline: deadline ? new Date(deadline) : new Date(),
        level_description: levelDescription || '',
        xp_reward: xpReward,
        coin_reward: coinReward,
        key_takeaways: keyTakeaways || '',
        scenario_id: scenarioId
      }
    });

    return { success: true };
  },

  updateLevel: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;
    const title = formData.get('title') as string;
    const subtitle = formData.get('subtitle') as string;
    const order = parseInt(formData.get('order') as string) || 1;
    const sprintNumber = parseInt(formData.get('sprintNumber') as string) || 1;
    const deadline = formData.get('deadline') as string;
    const levelDescription = formData.get('levelDescription') as string;
    const xpReward = parseInt(formData.get('xpReward') as string) || 100;
    const coinReward = parseInt(formData.get('coinReward') as string) || 50;
    const keyTakeaways = formData.get('keyTakeaways') as string;

    if (!id) {
      return fail(400, { message: 'Missing level ID' });
    }

    await prisma.level.update({
      where: { id },
      data: {
        title: title || undefined,
        subtitle: subtitle ?? undefined,
        order: order || undefined,
        sprint_number: sprintNumber || undefined,
        deadline: deadline ? new Date(deadline) : undefined,
        level_description: levelDescription ?? undefined,
        xp_reward: xpReward || undefined,
        coin_reward: coinReward || undefined,
        key_takeaways: keyTakeaways ?? undefined
      }
    });

    return { success: true };
  },

  deleteLevel: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;

    if (!id) {
      return fail(400, { message: 'Missing level ID' });
    }

    await prisma.level.delete({ where: { id } });
    return { success: true };
  },

  createTask: async ({ request }) => {
    const formData = await request.formData();
    const levelId = formData.get('levelId') as string;
    const taskName = formData.get('taskName') as string;
    const userStory = formData.get('userStory') as string;
    const order = parseInt(formData.get('order') as string) || 0;
    const testType = formData.get('testType') as string;
    const criteriaRaw = (formData.get('acceptanceCriteria') as string) || '';

    if (!levelId || !taskName) {
      return fail(400, { message: 'Level ID and task name are required' });
    }

    const criteriaLines = criteriaRaw.split('\n').map(s => s.trim()).filter(Boolean);

    await prisma.level_task.create({
      data: {
        level_id: levelId,
        task_name: taskName,
        user_story: userStory || '',
        order,
        test_type: testType || 'none',
        acceptance_criteria: criteriaLines.length > 0
          ? { create: criteriaLines.map((desc, i) => ({ description: desc, is_required: true, order: i + 1 })) }
          : undefined
      }
    });

    return { success: true };
  },

  updateTask: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;
    const taskName = formData.get('taskName') as string;
    const userStory = formData.get('userStory') as string;
    const order = parseInt(formData.get('order') as string) || 0;
    const testType = formData.get('testType') as string;
    const isComplete = formData.get('isComplete') === 'true';
    const criteriaRaw = (formData.get('acceptanceCriteria') as string) || '';

    if (!id) {
      return fail(400, { message: 'Missing task ID' });
    }

    const data: Record<string, unknown> = {};
    if (taskName) data.task_name = taskName;
    if (userStory !== null) data.user_story = userStory;
    if (order !== undefined) data.order = order;
    if (testType) data.test_type = testType;
    data.is_complete = isComplete;

    const criteriaLines = criteriaRaw.split('\n').map(s => s.trim()).filter(Boolean);
    if (criteriaLines.length > 0) {
      data.acceptance_criteria = {
        deleteMany: {},
        create: criteriaLines.map((desc, i) => ({ description: desc, is_required: true, order: i + 1 }))
      };
    }

    await prisma.level_task.update({ where: { id }, data });

    return { success: true };
  },

  deleteTask: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;

    if (!id) {
      return fail(400, { message: 'Missing task ID' });
    }

    await prisma.level_task.delete({ where: { id } });
    return { success: true };
  },

  createLearningSection: async ({ request }) => {
    const formData = await request.formData();
    const taskId = formData.get('taskId') as string;
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const order = parseInt(formData.get('order') as string) || 0;
    const sectionType = formData.get('sectionType') as string;
    const interactiveModeRaw = formData.get('interactiveMode') as string;
    const interactiveConfigRaw = formData.get('interactiveConfig') as string;

    if (!taskId || !title) {
      return fail(400, { message: 'Task ID and title are required' });
    }

    const interactiveMode = interactiveModeRaw || null;
    let interactiveConfig: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | null = null;

    if (interactiveConfigRaw) {
      try {
        interactiveConfig = JSON.parse(interactiveConfigRaw) as Prisma.InputJsonValue;
      } catch {
        return fail(400, { message: 'Invalid interactive config JSON' });
      }
    } else {
      interactiveConfig = Prisma.JsonNull;
    }

    await prisma.learning_section.create({
      data: {
        task_id: taskId,
        title,
        content: content || '',
        order,
        section_type: sectionType || 'PLAIN_TEXT',
        interactive_mode: interactiveMode,
        interactive_config: interactiveConfig
      }
    });

    return { success: true };
  },

  updateLearningSection: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const order = parseInt(formData.get('order') as string) || 0;
    const sectionType = formData.get('sectionType') as string;
    const interactiveModeRaw = formData.get('interactiveMode') as string;
    const interactiveConfigRaw = formData.get('interactiveConfig') as string;

    if (!id) {
      return fail(400, { message: 'Missing learning section ID' });
    }

    const data: Record<string, unknown> = {};
    if (title) data.title = title;
    if (content !== null) data.content = content;
    data.order = order;
    if (sectionType) data.section_type = sectionType;

    const interactiveMode = interactiveModeRaw || null;
    data.interactive_mode = interactiveMode;

    if (interactiveConfigRaw) {
      try {
        data.interactive_config = JSON.parse(interactiveConfigRaw) as Prisma.InputJsonValue;
      } catch {
        return fail(400, { message: 'Invalid interactive config JSON' });
      }
    } else {
      data.interactive_config = Prisma.JsonNull;
    }

    await prisma.learning_section.update({ where: { id }, data });
    return { success: true };
  },

  deleteLearningSection: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;

    if (!id) {
      return fail(400, { message: 'Missing learning section ID' });
    }

    await prisma.learning_section.delete({ where: { id } });
    return { success: true };
  }
};
