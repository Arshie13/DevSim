import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/client';

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
        where: { user_id: userId, status: 'ACTIVE' },
        orderBy: { created_at: 'desc' },
      });

      // Get the reward for this day
      const reward = await tx.learner_pass_reward.findUnique({
        where: { day_number: dayNumber },
      });

      if (!reward) {
        throw error(500, 'Reward not configured');
      }

      const claimType = enrollment ? 'PREMIUM' : 'FREE';

      // Check if user already claimed this specific type for this day
      const existingClaim = await tx.learner_pass_day_claim.findFirst({
        where: {
          user_id: userId,
          day_number: dayNumber,
          claim_type: claimType
        },
      });

      if (existingClaim) {
        throw error(409, `${claimType} reward already claimed for this day`);
      }

      const now = new Date();

      // If user has no enrollment, allow free reward claim
      if (!enrollment) {
        const claim = await tx.learner_pass_day_claim.create({
          data: {
            user_id: userId,
            day_number: dayNumber,
            claimed_at: now,
            enrollment_id: null,
            claim_type: 'FREE',
          },
        });

        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: {
            coins: { increment: reward.coins_reward },
            xp: { increment: reward.xp_reward },
          },
          select: { coins: true, xp: true },
        });

        return {
          claim,
          updatedUser,
          updatedEnrollment: null,
          reward,
          projectGrants: [],
        };
      }

      // User has enrollment - check pass status
      if (enrollment.expires_at && now > enrollment.expires_at) {
        await tx.learner_pass_enrollment.update({
          where: { id: enrollment.id },
          data: { status: 'EXPIRED' },
        });
        throw error(410, 'Pass has expired');
      }

      if (dayNumber !== enrollment.current_day) {
        throw error(400, 'Can only claim the current day');
      }

      if (enrollment.last_claimed_at) {
        const lastClaimDate = new Date(enrollment.last_claimed_at);
        const today = new Date();

        if (lastClaimDate.toDateString() === today.toDateString()) {
          throw error(429, 'Already claimed today');
        }
      }

      const claim = await tx.learner_pass_day_claim.create({
        data: {
          enrollment_id: enrollment.id,
          user_id: userId,
          day_number: dayNumber,
          claimed_at: now,
          claim_type: 'PREMIUM',
        },
      });

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          coins: { increment: reward.coins_reward },
          xp: { increment: reward.xp_reward },
        },
        select: { coins: true, xp: true },
      });

      const isConsecutive = enrollment.last_claimed_at
        ? new Date(enrollment.last_claimed_at).toDateString() ===
          new Date(now.getTime() - ONE_DAY_MS).toDateString()
        : true;

      const newStreak = isConsecutive ? enrollment.streak + 1 : 1;
      const newTotalClaimed = enrollment.total_claimed_days + 1;
      const nextDay = dayNumber >= 30 ? 31 : dayNumber + 1;

      let newStatus = enrollment.status;
      if (dayNumber >= 30) {
        newStatus = 'COMPLETED';
      }

      const updatedEnrollment = await tx.learner_pass_enrollment.update({
        where: { id: enrollment.id },
        data: {
          last_claimed_at: now,
          current_day: nextDay,
          streak: newStreak,
          total_claimed_days: newTotalClaimed,
          status: newStatus,
        },
      });

      const projectGrants = [];
      if (reward.unlock_project_ids && reward.unlock_project_ids.length > 0) {
        for (const projectId of reward.unlock_project_ids) {
          const existingAccess = await tx.user_project_access.findFirst({
            where: {
              user_id: userId,
              project_id: projectId,
              source: 'LEARNER_PASS',
            },
          });

          if (!existingAccess) {
            const grant = await tx.user_project_access.create({
              data: {
                user_id: userId,
                project_id: projectId,
                source: 'LEARNER_PASS',
                source_ref_id: enrollment.id,
                granted_at: now,
              },
            });
            projectGrants.push(grant.project_id);
          }
        }
      }

      return {
        claim,
        updatedUser,
        updatedEnrollment,
        reward,
        projectGrants,
      };
    });

    return Response.json({
      success: true,
      day: dayNumber,
      claimType: result.claim.claim_type,
      reward: {
        coins: result.reward.coins_reward,
        xp: result.reward.xp_reward,
        unlocks: result.projectGrants,
      },
      newCoins: result.updatedUser.coins,
      newXp: result.updatedUser.xp,
      streak: result.updatedEnrollment?.streak || 0,
      totalClaimedDays: result.updatedEnrollment?.total_claimed_days || 0,
      currentDay: result.updatedEnrollment?.current_day || dayNumber,
      status: result.updatedEnrollment?.status || 'NO_PASS',
      nextAvailableAt: new Date(
        new Date().getTime() + ONE_DAY_MS,
      ).toISOString(),
    });
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }
    console.error('Claim error:', err);
    throw error(500, 'Failed to claim reward');
  }
};