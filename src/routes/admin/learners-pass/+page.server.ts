import type { PageServerLoad, Actions } from './$types';
import { requireAdmin } from '$lib/server/admin';
import { PASS_LADDER, toRewardPayload } from '$lib/server/learnerPass/schedule';
import { AppSettingsDataAccess } from '$lib/layers/data-access/AppSettingsDataAccess';

export const load: PageServerLoad = async ({ locals }) => {
  await requireAdmin(locals);

  const appSettings = new AppSettingsDataAccess();
  const settings = await appSettings.getAllAppSettings();

  return {
    rewards: PASS_LADDER.map(toRewardPayload).map((r) => ({
      id: r.id,
      rewardIndex: r.reward_index,
      coins: r.coins,
      xp: r.xp,
      aiHelps: r.ai_helps,
      displayType: r.display_type,
      displayValue: r.display_value,
    })),
    config: {
      price: settings.learner_pass_price as number,
      durationDays: settings.learner_pass_duration_days as number,
    },
  };
};

export const actions: Actions = {
  updateConfig: async ({ request, locals }) => {
    await requireAdmin(locals);

    const formData = await request.formData();
    const price = parseInt(formData.get('price') as string) || 999;
    const durationDays = parseInt(formData.get('durationDays') as string) || 30;

    const appSettings = new AppSettingsDataAccess();
    await appSettings.setAppSetting('learner_pass_price', price);
    await appSettings.setAppSetting('learner_pass_duration_days', durationDays);

    return { success: true };
  },
};
