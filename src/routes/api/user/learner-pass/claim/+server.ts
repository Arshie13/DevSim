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
  const clientClaimType: string | undefined = body?.claimType;

  if (typeof dayNumber !== 'number' || dayNumber < 1 || dayNumber > 30) {
    throw error(400, 'Invalid day number');
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const enrollment = await tx.learner_pass_enrollment.findFirst({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
      });

      // Get the reward for this day
      const reward = await tx.learner_pass_reward.findUnique({
        where: { day_number: dayNumber },
      });

      if (!reward) {
        throw error(500, 'Reward not configured');
      }

      // Client sends which track; fallback for backward compat
      const claimType = clientClaimType === 'FREE' ? 'FREE' : (enrollment ? 'PREMIUM' : 'FREE');

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

      // --- FREE claim path (no enrollment, or free track while enrolled) ---
      if (claimType === 'FREE') {
        const claim = await tx.learner_pass_day_claim.create({
          data: {
            user_id: userId,
            day_number: dayNumber,
            claimed_at: now,
            enrollment_id: enrollment?.id ?? null,
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

        // ponytail: FREE claims also increment streak
        let updatedEnrollment = null;
        if (enrollment && enrollment.status === 'ACTIVE') {
          const isConsecutive = enrollment.last_claimed_at
            ? new Date(enrollment.last_claimed_at).toDateString() ===
              new Date(now.getTime() - ONE_DAY_MS).toDateString()
            : true;
          const newStreak = isConsecutive ? enrollment.streak + 1 : 1;
          const newTotalClaimed = enrollment.total_claimed_days + 1;

          updatedEnrollment = await tx.learner_pass_enrollment.update({
            where: { id: enrollment.id },
            data: {
              last_claimed_at: now,
              streak: newStreak,
              total_claimed_days: newTotalClaimed,
            },
          });
        }

        return {
          claim,
          updatedUser,
          updatedEnrollment,
          reward,
          projectGrants: [],
        };
      }

      // --- PREMIUM claim path (requires active enrollment) ---
      if (!enrollment || enrollment.status !== 'ACTIVE') {
        throw error(400, 'No active learner pass');
      }

      if (enrollment.expires_at && now > enrollment.expires_at) {
        await tx.learner_pass_enrollment.update({
          where: { id: enrollment.id },
          data: { status: 'EXPIRED' },
        });
        throw error(410, 'Pass has expired');
      }

      // ponytail: allow back-claiming missed days, not just the current day
      if (dayNumber > enrollment.current_day) {
        throw error(400, 'Can only claim up to the current day');
      }

      // ponytail: only block duplicate PREMIUM claims today (FREE claims don't gate PREMIUM)
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const alreadyClaimedPremiumToday = await tx.learner_pass_day_claim.findFirst({
        where: {
          user_id: userId,
          claim_type: 'PREMIUM',
          claimed_at: { gte: startOfToday },
        },
      });
      if (alreadyClaimedPremiumToday) {
        throw error(429, 'Already claimed premium today');
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
      // ponytail: only advance current_day if claiming the current day (not back-claims)
      const isCurrentDay = dayNumber === enrollment.current_day;
      const nextDay = isCurrentDay
        ? (dayNumber >= 30 ? 31 : dayNumber + 1)
        : enrollment.current_day;

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

    const baseResponse = {
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
      nextAvailableAt: new Date(
        new Date().getTime() + ONE_DAY_MS,
      ).toISOString(),
    };

    // ponytail: only include enrollment fields when actually updated
    if (result.updatedEnrollment) {
      return Response.json({
        ...baseResponse,
        streak: result.updatedEnrollment.streak,
        totalClaimedDays: result.updatedEnrollment.total_claimed_days,
        currentDay: result.updatedEnrollment.current_day,
        status: result.updatedEnrollment.status,
      });
    }

    return Response.json({ ...baseResponse, status: 'NO_PASS' });
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }
    console.error('Claim error:', err);
    throw error(500, 'Failed to claim reward');
  }
};