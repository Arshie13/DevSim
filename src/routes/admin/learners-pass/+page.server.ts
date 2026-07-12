import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import prisma from '$lib/server/client';
import { AppSettingsDataAccess } from '$lib/layers/data-access/AppSettingsDataAccess';

export const load: PageServerLoad = async () => {
  const rewards = await prisma.learner_pass_reward.findMany({
    orderBy: { reward_index: 'asc' }
  });

  const scenarios = await prisma.scenario.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true }
  });

  const appSettings = new AppSettingsDataAccess();
  const settings = await appSettings.getAllAppSettings();

  return {
    rewards: rewards.map(r => ({
      id: r.id,
      rewardIndex: r.reward_index,
      coins: r.coins,
      xp: r.xp,
      aiHelps: r.ai_helps,
      unlockedScenario: r.unlocked_scenario,
      displayType: r.display_type,
      displayValue: r.display_value
    })),
    scenarios,
    config: {
      price: settings.learner_pass_price as number,
      durationDays: settings.learner_pass_duration_days as number,
      specialUnlockDays: settings.learner_pass_special_unlock_days as number[],
      dayToScenario: settings.learner_pass_day_to_scenario as Record<string, string>,
    }
  };
};

export const actions: Actions = {
  updateReward: async ({ request }) => {
    const formData = await request.formData();
    const rewardId = formData.get('rewardId') as string;
    const coins = parseInt(formData.get('coins') as string) || 0;
    const xp = parseInt(formData.get('xp') as string) || 0;
    const aiHelps = parseInt(formData.get('aiHelps') as string) || 0;
    const unlockedScenario = formData.get('unlockedScenario') as string;
    const displayType = formData.get('displayType') as string;
    const displayValue = formData.get('displayValue') as string;

    if (!rewardId) {
      return fail(400, { message: 'Missing reward ID' });
    }

    await prisma.learner_pass_reward.update({
      where: { id: rewardId },
      data: {
        coins,
        xp,
        ai_helps: aiHelps,
        unlocked_scenario: unlockedScenario ? [unlockedScenario] : [],
        display_type: displayType,
        display_value: displayValue,
      }
    });

    return { success: true };
  },

  updateConfig: async ({ request }) => {
    const formData = await request.formData();
    const price = parseInt(formData.get('price') as string) || 999;
    const durationDays = parseInt(formData.get('durationDays') as string) || 30;

    let specialUnlockDays: number[];
    try {
      specialUnlockDays = JSON.parse(formData.get('specialUnlockDays') as string);
      if (!Array.isArray(specialUnlockDays)) throw new Error();
    } catch {
      return fail(400, { message: 'Special unlock days must be a JSON array of numbers' });
    }

    let dayToScenario: Record<string, string>;
    try {
      dayToScenario = JSON.parse(formData.get('dayToScenario') as string);
      if (typeof dayToScenario !== 'object' || Array.isArray(dayToScenario)) throw new Error();
    } catch {
      return fail(400, { message: 'Day-to-scenario mapping must be a JSON object' });
    }

    const appSettings = new AppSettingsDataAccess();
    await appSettings.setAppSetting('learner_pass_price', price);
    await appSettings.setAppSetting('learner_pass_duration_days', durationDays);
    await appSettings.setAppSetting('learner_pass_special_unlock_days', specialUnlockDays);
    await appSettings.setAppSetting('learner_pass_day_to_scenario', dayToScenario);

    return { success: true };
  }
};
