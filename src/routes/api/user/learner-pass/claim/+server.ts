import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/client';
import { SCENARIO_3_IDS } from '$lib/utils/reward-constants';
import { getRewardUnlockIds } from '$lib/server/learnerPassRewards';
import { computeStreak } from '$lib/utils/learnerPassStreak';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export const POST: RequestHandler = async (event) => {
  const session = await event.locals.auth();

  if (!session?.user?.id) {
    throw error(401, 'Unauthorized');
  }

  const userId = session.user.id;
  const body = await event.request.json().catch(() => null);
  const dayNumber = body?.dayNumber;

  if (typeof dayNumber !== 'number' || dayNumber < 1 || dayNumber > 30) {
    throw error(400, 'Invalid day number');
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const enrollment = await tx.learner_pass_enrollment.findFirst({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
      });

      const now = new Date();

      if (!enrollment || !enrollment.started_at) {
        throw error(400, 'No active learner pass');
      }

      if (enrollment.expires_at && now > enrollment.expires_at) {
        throw error(410, 'Pass has expired');
      }

      const daysSinceStart =
        Math.floor((now.getTime() - enrollment.started_at.getTime()) / ONE_DAY_MS) + 1;
      const currentDay = Math.min(30, Math.max(1, daysSinceStart));

      if (dayNumber > daysSinceStart) {
        throw error(400, 'Cannot claim rewards for future days');
      }

      if (dayNumber > currentDay) {
        throw error(400, 'Can only claim up to the current day');
      }

      // Use a Set to deduplicate and check — guards against legacy duplicate entries.
      const uniqueClaimed = new Set(enrollment.claimed_day_numbers);

      if (uniqueClaimed.has(dayNumber)) {
        throw error(409, 'Reward already claimed for this day');
      }

      const reward = await tx.learner_pass_reward.findUnique({
        where: { reward_index: dayNumber },
      });

      if (!reward) {
        throw error(500, 'Reward not configured');
      }

      const newClaimedDays = [...uniqueClaimed, dayNumber];

      const updatedEnrollment = await tx.learner_pass_enrollment.update({
        where: { id: enrollment.id },
        data: {
          last_claimed_at: now,
          claimed_day_numbers: newClaimedDays,
        },
      });

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          coins: { increment: reward.coins },
          xp: { increment: reward.xp },
          ai_help_credits: { increment: reward.ai_helps },
        },
        select: { coins: true, xp: true, ai_help_credits: true },
      });

      const projectGrants: string[] = [];
      const pendingUnlocks: { day: number; available: string[] }[] = [];
      const rewardUnlocks = getRewardUnlockIds(reward);

      if (rewardUnlocks.length > 0) {
        const normalUnlocks = rewardUnlocks.filter((id) => !SCENARIO_3_IDS.has(id));
        const specialUnlocks = rewardUnlocks.filter((id) => SCENARIO_3_IDS.has(id));

        for (const projectId of normalUnlocks) {
          const existingAccess = await tx.user_project_access.findFirst({
            where: { user_id: userId, project_id: projectId, source: 'LEARNER_PASS' },
          });

          if (!existingAccess) {
            await tx.user_project_access.create({
              data: {
                user_id: userId,
                project_id: projectId,
                source: 'LEARNER_PASS',
                learner_pass_enrollment_id: enrollment.id,
                granted_at: now,
              },
            });
            projectGrants.push(projectId);
          }
        }

        if (specialUnlocks.length > 0) {
          pendingUnlocks.push({ day: dayNumber, available: specialUnlocks });
        }
      }

      return {
        updatedUser,
        updatedEnrollment,
        newClaimedDays,
        reward,
        projectGrants,
        pendingUnlocks,
        currentDay,
      };
    });

    // Derive streak from the updated claimed days — no stored counter needed.
    const streak = computeStreak(result.newClaimedDays);

    return Response.json({
      success: true,
      day: dayNumber,
      reward: {
        coins: result.reward.coins,
        xp: result.reward.xp,
        aiHelps: result.reward.ai_helps,
        unlocks: result.projectGrants,
      },
      pendingUnlocks: result.pendingUnlocks,
      newCoins: result.updatedUser.coins,
      newXp: result.updatedUser.xp,
      newAiHelpCredits: result.updatedUser.ai_help_credits,
      streak,
      totalClaimedDays: result.newClaimedDays.length,
      currentDay: result.currentDay,
    });
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err) throw err;
    console.error('Claim error:', err);
    throw error(500, 'Failed to claim reward');
  }
};
