import { toast } from "./toast";

/**
 * Shape returned by `detectNewlyUnlockedAchievements` on the server.
 * Kept structural (not imported from server code) so it stays client-safe.
 */
export interface UnlockedAchievement {
  achievementId: string;
  name: string;
  icon: string;
  tier: string;
  tierDescription?: string;
  xpReward?: number;
  coinReward?: number;
}

// Tiers already announced this session — guards against an unlock being toasted
// twice when more than one trigger (submit, onboarding, layout) reports it before
// the next navigation. Server-side persistence dedupes across reloads; this
// dedupes within a single page session.
const announced = new Set<string>();

const MAX_TOASTS = 3;

function tierLabel(tier: string): string {
  return tier.charAt(0) + tier.slice(1).toLowerCase();
}

/**
 * Surface a toast for each newly-unlocked achievement. Safe to call from any
 * trigger with any (possibly empty / undefined) list — duplicates and already
 * announced tiers are ignored, and large batches are capped with a summary so a
 * first-time backfill can't spam the screen.
 */
export function notifyAchievementUnlocks(
  unlocks: UnlockedAchievement[] | undefined | null,
): void {
  if (!unlocks || unlocks.length === 0) return;

  const fresh = unlocks.filter((u) => {
    const key = `${u.achievementId}:${u.tier}`;
    if (announced.has(key)) return false;
    announced.add(key);
    return true;
  });
  if (fresh.length === 0) return;

  for (const u of fresh.slice(0, MAX_TOASTS)) {
    toast.success(`🏅 ${u.name} unlocked — ${tierLabel(u.tier)} tier!`, 6000);
  }

  const extra = fresh.length - MAX_TOASTS;
  if (extra > 0) {
    toast.success(
      `🏅 +${extra} more achievement${extra > 1 ? "s" : ""} unlocked!`,
      6000,
    );
  }
}
