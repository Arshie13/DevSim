import type { PageServerLoad } from './$types';
import { getActiveFamilies } from '$lib/server/achievements/definitions';

/**
 * The achievement catalog is code-defined, so this page is read-only.
 *
 * See `src/lib/server/achievements/definitions.ts` — that file is the single
 * source of truth. To add, edit, or retire an achievement, change it and deploy;
 * there is no runtime mutation path and no `achievements` table to write to.
 */
export const load: PageServerLoad = async () => {
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
