import type { PageServerLoad, Actions } from './$types';
import { PASS_LADDER, SPECIAL_UNLOCK_DAYS, toRewardPayload } from '$lib/server/learnerPass/schedule';
import { AppSettingsDataAccess } from '$lib/layers/data-access/AppSettingsDataAccess';

/**
 * Read-only view of the Learner Pass ladder.
 *
 * Reward editing was removed when the ladder moved into
 * `$lib/server/learnerPass/schedule.ts`. The old editor wrote `learner_pass_rewards`
 * rows, and nothing about it was safe: it let an admin empty a day's payout, point a
 * day at an arbitrary scenario, or set a `display_type` the UI has no icon for — all
 * unvalidated, and all invisible to the hardcoded `reward-constants.ts` the server
 * actually used for the day → scenario mapping. The ladder is now reviewed in code.
 *
 * Price and duration remain editable; they are per-environment business settings rather
 * than content.
 */
export const load: PageServerLoad = async () => {
  const appSettings = new AppSettingsDataAccess();
  const settings = await appSettings.getAllAppSettings();

  const dayToScenario = Object.fromEntries(
    PASS_LADDER.flatMap((r) => r.unlockChoices.map((id) => [String(r.day), id])),
  );

  return {
    rewards: PASS_LADDER.map(toRewardPayload).map((r) => ({
      id: r.id,
      rewardIndex: r.reward_index,
      coins: r.coins,
      xp: r.xp,
      aiHelps: r.ai_helps,
      unlockedScenario: r.unlocked_scenario,
      displayType: r.display_type,
      displayValue: r.display_value,
    })),
    specialUnlockDays: SPECIAL_UNLOCK_DAYS,
    dayToScenario,
    config: {
      price: settings.learner_pass_price as number,
      durationDays: settings.learner_pass_duration_days as number,
    },
  };
};

export const actions: Actions = {
  updateConfig: async ({ request }) => {
    const formData = await request.formData();
    const price = parseInt(formData.get('price') as string) || 999;
    const durationDays = parseInt(formData.get('durationDays') as string) || 30;

    const appSettings = new AppSettingsDataAccess();
    await appSettings.setAppSetting('learner_pass_price', price);
    await appSettings.setAppSetting('learner_pass_duration_days', durationDays);

    return { success: true };
  },
};
