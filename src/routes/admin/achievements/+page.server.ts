import type { PageServerLoad } from './$types';
import { requireAdmin } from '$lib/server/admin';
import { getActiveFamilies } from '$lib/server/achievements/definitions';

export const load: PageServerLoad = async ({ locals }) => {
  await requireAdmin(locals);

  return {
    families: getActiveFamilies().map((family) => ({
      key: family.key,
      name: family.name,
      description: family.description,
      icon: family.icon,
      category: family.category,
      retired: family.retired ?? false,
      tiers: family.tiers.map((t) => ({
        tier: t.tier,
        description: t.description,
        criteria: JSON.stringify(t.criteria, null, 2),
        xpReward: t.xpReward,
        coinReward: t.coinReward,
      })),
    })),
    totalTiers: getActiveFamilies().reduce((sum, f) => sum + f.tiers.length, 0),
  };
};
