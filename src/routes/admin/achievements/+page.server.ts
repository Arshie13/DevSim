import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import type { Prisma } from '$prismaclient';
import prisma from '$lib/server/client';

export const load: PageServerLoad = async () => {
  const achievements = await prisma.achievement.findMany({
    include: {
      tiers: { orderBy: { tier: 'asc' } }
    },
    orderBy: { created_at: 'asc' }
  });

  return {
    achievements: achievements.map(a => ({
      id: a.id,
      name: a.name,
      description: a.description,
      icon: a.icon,
      category: a.category,
      xpReward: a.xp_reward,
      coinReward: a.coin_reward,
      tiers: a.tiers.map(t => ({
        id: t.id,
        tier: t.tier,
        description: t.description,
        icon: t.icon,
        criteria: t.criteria,
        xpReward: t.xp_reward,
        coinReward: t.coin_reward,
      }))
    }))
  };
};

export const actions: Actions = {
  createAchievement: async ({ request }) => {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const icon = formData.get('icon') as string;
    const category = formData.get('category') as string;

    if (!name || !description) {
      return fail(400, { message: 'Name and description are required' });
    }

    const validCategories = ['progress', 'exploration', 'consistency', 'mastery'];
    if (!validCategories.includes(category)) {
      return fail(400, { message: `Category must be one of: ${validCategories.join(', ')}` });
    }

    const tiers: { tier: string; description: string; criteria: Prisma.InputJsonValue; xp_reward: number; coin_reward: number }[] = [];
    let tierIndex = 0;
    while (formData.has(`tier_${tierIndex}_tier`)) {
      const tier = formData.get(`tier_${tierIndex}_tier`) as string;
      const tierDesc = formData.get(`tier_${tierIndex}_description`) as string;
      const criteriaStr = formData.get(`tier_${tierIndex}_criteria`) as string;
      const tierXp = parseInt(formData.get(`tier_${tierIndex}_xp`) as string) || 100;
      const tierCoins = parseInt(formData.get(`tier_${tierIndex}_coins`) as string) || 50;

      let criteria: Prisma.InputJsonValue;
      try {
        criteria = JSON.parse(criteriaStr || '{}') as Prisma.InputJsonValue;
      } catch {
        return fail(400, { message: `Tier ${tierIndex + 1} criteria is not valid JSON` });
      }

      tiers.push({ tier: tier, description: tierDesc, criteria, xp_reward: tierXp, coin_reward: tierCoins });
      tierIndex++;
    }

    if (tiers.length === 0) {
      return fail(400, { message: 'At least one tier is required' });
    }

    try {
      await prisma.achievement.create({
        data: {
          name,
          description,
          icon,
          category,
          tiers: {
            create: tiers
          }
        }
      });
    } catch (e: unknown) {
      const err = e as { code?: string; meta?: { target?: string[] } };
      if (err.code === 'P2002') {
        return fail(400, { message: 'An achievement with this name already exists' });
      }
      throw e;
    }

    return { success: true };
  },

  updateAchievement: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const icon = formData.get('icon') as string;
    const category = formData.get('category') as string;

    if (!id || !name) {
      return fail(400, { message: 'ID and name are required' });
    }

    await prisma.achievement.update({
      where: { id },
      data: { name, description, icon, category }
    });

    return { success: true };
  },

  deleteAchievement: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;

    if (!id) {
      return fail(400, { message: 'Missing achievement ID' });
    }

    await prisma.achievement.delete({ where: { id } });
    return { success: true };
  },

  updateTier: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;
    const description = formData.get('description') as string;
    const icon = formData.get('icon') as string;
    const criteriaStr = formData.get('criteria') as string;
    const xpReward = parseInt(formData.get('xpReward') as string) || 100;
    const coinReward = parseInt(formData.get('coinReward') as string) || 50;

    if (!id) {
      return fail(400, { message: 'Missing tier ID' });
    }

    let criteria: Prisma.InputJsonValue;
    try {
      criteria = JSON.parse(criteriaStr || '{}') as Prisma.InputJsonValue;
    } catch {
      return fail(400, { message: 'Criteria is not valid JSON' });
    }

    await prisma.achievement_tier.update({
      where: { id },
      data: { description, icon, criteria, xp_reward: xpReward, coin_reward: coinReward }
    });

    return { success: true };
  },
};
