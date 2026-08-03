import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/client';
import { SCENARIO_3_IDS } from '$lib/utils/reward-constants';
import { getRewardUnlockIds } from '$lib/server/learnerPassRewards';

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

      const start = enrollment.started_at ?? now;
      const daysSinceStart = Math.floor((now.getTime() - start.getTime()) / ONE_DAY_MS) + 1;
      const currentDay = Math.min(30, Math.max(1, daysSinceStart));

      // Guard: block claiming rewards for future pass days.
      // dayNumber is a pass day (1–30), keyed to calendar days since started_at.
      if (dayNumber > daysSinceStart) {
        throw error(400, 'Cannot claim rewards for future days');
      }

      if (dayNumber > currentDay) {
        throw error(400, 'Can only claim up to the current day');
      }

      if (enrollment.claimed_day_numbers.includes(dayNumber)) {
        throw error(409, 'Reward already claimed for this day');
      }

      const reward = await tx.learner_pass_reward.findUnique({
        where: { reward_index: dayNumber },
      });

      if (!reward) {
        throw error(500, 'Reward not configured');
      }

      const isConsecutive = enrollment.last_claimed_at
        ? new Date(enrollment.last_claimed_at).toDateString() ===
          new Date(now.getTime() - ONE_DAY_MS).toDateString()
        : true;

      const newStreak = isConsecutive ? enrollment.streak + 1 : 1;
      const newClaimedDays = [...enrollment.claimed_day_numbers, dayNumber];

      const updatedEnrollment = await tx.learner_pass_enrollment.update({
        where: { id: enrollment.id },
        data: {
          last_claimed_at: now,
          streak: newStreak,
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
        reward,
        projectGrants,
        pendingUnlocks,
        currentDay,
      };
    });

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
      streak: result.updatedEnrollment.streak,
      totalClaimedDays: result.updatedEnrollment.claimed_day_numbers.length,
      currentDay: result.currentDay,
    });
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }
    console.error('Claim error:', err);
    throw error(500, 'Failed to claim reward');
  }
};
