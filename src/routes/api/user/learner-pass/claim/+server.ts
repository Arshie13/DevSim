import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/client';
import type { RewardJson } from '$lib/types/reward-json';

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

      if (!enrollment || enrollment.status !== 'ACTIVE') {
        throw error(400, 'No active learner pass');
      }

      const now = new Date();

      if (enrollment.expires_at && now > enrollment.expires_at) {
        await tx.learner_pass_enrollment.update({
          where: { id: enrollment.id },
          data: { status: 'EXPIRED' },
        });
        throw error(410, 'Pass has expired');
      }

      const start = enrollment.started_at ?? now;
      const currentDay = Math.min(30, Math.floor((now.getTime() - start.getTime()) / ONE_DAY_MS) + 1);

      if (dayNumber > currentDay) {
        throw error(400, 'Can only claim up to the current day');
      }

      if (enrollment.claimed_days.includes(dayNumber)) {
        throw error(409, 'Reward already claimed for this day');
      }

      const reward = await tx.learner_pass_reward.findUnique({
        where: { day_number: dayNumber },
      });

      if (!reward) {
        throw error(500, 'Reward not configured');
      }

      const r = reward.rewards as RewardJson;

      const isConsecutive = enrollment.last_claimed_at
        ? new Date(enrollment.last_claimed_at).toDateString() ===
          new Date(now.getTime() - ONE_DAY_MS).toDateString()
        : true;

      const newStreak = isConsecutive ? enrollment.streak + 1 : 1;
      const newTotalClaimed = enrollment.total_claimed_days + 1;
      const newClaimedDays = [...enrollment.claimed_days, dayNumber];

      let newStatus = enrollment.status;
      if (dayNumber >= 30) {
        newStatus = 'COMPLETED';
      }

      const updatedEnrollment = await tx.learner_pass_enrollment.update({
        where: { id: enrollment.id },
        data: {
          last_claimed_at: now,
          streak: newStreak,
          total_claimed_days: newTotalClaimed,
          claimed_days: newClaimedDays,
          status: newStatus,
        },
      });

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          coins: { increment: r.coins ?? 0 },
          xp: { increment: r.xp ?? 0 },
          aiHelpCredits: { increment: r.aiHelps ?? 0 },
        },
        select: { coins: true, xp: true, aiHelpCredits: true },
      });

      const projectGrants: string[] = [];
      if (r.unlocks && r.unlocks.length > 0) {
        for (const projectId of r.unlocks) {
          const existingAccess = await tx.user_project_access.findFirst({
            where: {
              user_id: userId,
              project_id: projectId,
              source: 'LEARNER_PASS',
            },
          });

          if (!existingAccess) {
            await tx.user_project_access.create({
              data: {
                user_id: userId,
                project_id: projectId,
                source: 'LEARNER_PASS',
                source_ref_id: enrollment.id,
                granted_at: now,
              },
            });
            projectGrants.push(projectId);
          }
        }
      }

      return {
        updatedUser,
        updatedEnrollment,
        reward: r,
        projectGrants,
        currentDay,
      };
    });

    return Response.json({
      success: true,
      day: dayNumber,
      reward: {
        coins: result.reward.coins ?? 0,
        xp: result.reward.xp ?? 0,
        aiHelps: result.reward.aiHelps ?? 0,
        unlocks: result.projectGrants,
      },
      newCoins: result.updatedUser.coins,
      newXp: result.updatedUser.xp,
      newAiHelpCredits: result.updatedUser.aiHelpCredits,
      streak: result.updatedEnrollment.streak,
      totalClaimedDays: result.updatedEnrollment.total_claimed_days,
      currentDay: result.currentDay,
      status: result.updatedEnrollment.status,
    });
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }
    console.error('Claim error:', err);
    throw error(500, 'Failed to claim reward');
  }
};
