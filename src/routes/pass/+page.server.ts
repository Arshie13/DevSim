import type { PageServerLoad } from './$types';
import prisma from '$lib/server/client';
import { computeLevel } from '$lib/utils/level';
import type { PassState } from '$lib/server/learnerPass/schedule';
import {
  PASS_LADDER,
  derivePassState,
  derivePendingUnlocks,
  toClaimRefs,
  toRewardPayload,
} from '$lib/server/learnerPass/schedule';

export const load: PageServerLoad = async (event) => {
  const session = await event.locals.auth();

  if (!session?.user?.id) {
    return {
      user: null,
      enrollment: null,
      rewards: [],
    };
  }

  const userId = session.user.id;

  const [dbUser, enrollment] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        image: true,
        coins: true,
        xp: true,
        owned_avatars: true,
        has_completed_tutorial: true,
      },
    }),
    prisma.learner_pass_enrollment.findFirst({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    }),
  ]);

  // The User model has no level column: level is derived from xp (same mapping as /profile).
  const levelData = computeLevel(dbUser?.xp ?? 0);

  // Ladder comes from code now, emitted in the field names pass/+page.svelte already reads.
  const rewards = PASS_LADDER.map(toRewardPayload);

  let state: PassState | null = null;
  let pendingUnlocks: { day: number; available: string[] }[] = [];

  if (enrollment) {
    const claims = await prisma.learner_pass_claim.findMany({
      where: { enrollment_id: enrollment.id },
      select: { day_number: true, claimed_at: true, unlocked_scenario: true },
    });

    state = derivePassState(enrollment, toClaimRefs(claims), new Date());

    // The claim's choice IS the grant now that `user_project_access` is gone.
    const alreadyUnlocked = new Set(
      claims
        .map((c) => c.unlocked_scenario)
        .filter((id): id is string => typeof id === 'string'),
    );

    pendingUnlocks = derivePendingUnlocks(state.claimedDays, alreadyUnlocked);
  }

  return {
    user: {
      ...session.user,
      name: dbUser?.name ?? session.user.name ?? null,
      email: dbUser?.email ?? session.user.email ?? null,
      // Override session image with live DB value so avatar changes are
      // reflected immediately without requiring a re-login.
      image: dbUser?.image ?? session.user.image ?? null,
      avatar: dbUser?.image ?? session.user.avatar ?? null,
      coins: dbUser?.coins ?? 0,
      xp: dbUser?.xp ?? 0,
      level: levelData.level,
      ownedAvatars: dbUser?.owned_avatars ?? [],
      hasCompletedTutorial: dbUser?.has_completed_tutorial ?? false,
    },
    enrollment:
      enrollment && state
        ? {
            status: state.status,
            currentDay: state.currentDay,
            streak: state.streak,
            totalClaimedDays: state.totalClaimedDays,
            lastClaimedAt: state.lastClaimedAt?.toISOString() ?? null,
            expiresAt: enrollment.expires_at.toISOString(),
            claimedDayNumbers: state.claimedDays,
            // Sent rather than re-derived client-side, so the reset rule has one definition.
            canClaimNow: state.canClaimNow,
            nextAvailableAt: state.nextAvailableAt?.toISOString() ?? null,
          }
        : null,
    rewards,
    currentAvatar: dbUser?.image ?? null,
    pendingUnlocks,
  };
};
