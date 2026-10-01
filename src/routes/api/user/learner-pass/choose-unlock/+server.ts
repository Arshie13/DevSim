import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/client';
import {
  SPECIAL_UNLOCK_DAYS,
  fallbackAmount,
  getSpecialUnlocksForDay,
  type FallbackKind,
} from '$lib/server/learnerPass/schedule';

const FALLBACK_KINDS: readonly FallbackKind[] = ['COINS', 'AI_HELPS'];

export const POST: RequestHandler = async (event) => {
  const session = await event.locals.auth();
  if (!session?.user?.id) throw error(401, 'Unauthorized');

  const userId = session.user.id;
  const body = await event.request.json().catch(() => null);
  const dayNumber = body?.dayNumber;
  const scenarioId = body?.scenarioId;
  const fallback = body?.fallback;

  if (typeof dayNumber !== 'number') {
    throw error(400, 'Invalid request');
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const enrollment = await tx.learner_pass_enrollment.findFirst({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
      });

      if (!enrollment) throw error(400, 'No active pass');

      const now = new Date();

      if (now > enrollment.expires_at) throw error(410, 'Pass expired');

      // The claim row *is* the record that the day was claimed.
      const claim = await tx.learner_pass_claim.findUnique({
        where: {
          enrollment_id_day_number: {
            enrollment_id: enrollment.id,
            day_number: dayNumber,
          },
        },
      });

      if (!claim) throw error(400, 'Day not claimed');

      if (!SPECIAL_UNLOCK_DAYS.includes(dayNumber)) throw error(400, 'Not a special unlock day');

      // Scoped to this day's claim, not a global list — each special day gets its own
      // choice, which the old flat `unlock_choices` array could not express. Guarding on both
      // outcomes keeps the fallback path idempotent too, since it leaves `unlocked_scenario`
      // null.
      if (claim.unlocked_scenario || claim.fallback_reward) {
        throw error(409, 'Choice already made for this day');
      }

      // Ownership is source-agnostic and spans every pass the user has ever had: an unlock
      // outlives the pass that granted it, so one bought on an earlier pass still counts.
      const ownedRows = await tx.learner_pass_claim.findMany({
        where: { enrollment: { user_id: userId }, unlocked_scenario: { not: null } },
        select: { unlocked_scenario: true },
      });
      const owned = new Set(ownedRows.map((r) => r.unlocked_scenario as string));

      const offers = getSpecialUnlocksForDay(dayNumber);
      const stillAvailable = offers.filter((id) => !owned.has(id));

      if (fallback !== undefined) {
        if (typeof fallback !== 'string' || !FALLBACK_KINDS.includes(fallback as FallbackKind)) {
          throw error(400, 'Invalid fallback reward');
        }

        // The fallback exists so a milestone day is never a dead reward — not so an ordinary
        // player can skip the unlock — so it is only on the table once nothing is left.
        if (stillAvailable.length > 0) {
          throw error(400, 'You do not own this scenario yet — unlock it instead');
        }

        const kind = fallback as FallbackKind;
        const amount = fallbackAmount(dayNumber, kind);

        if (amount === undefined) throw error(400, 'No fallback for this day');

        const updatedUser = await tx.user.update({
          where: { id: userId },
          data:
            kind === 'COINS'
              ? { coins: { increment: amount } }
              : { ai_help_credits: { increment: amount } },
          select: { coins: true, ai_help_credits: true },
        });

        // Fold the payout into the snapshot columns rather than adding a third amount column,
        // so "what did this day pay" stays one read. `fallback_reward` marks the day resolved.
        await tx.learner_pass_claim.update({
          where: { id: claim.id },
          data:
            kind === 'COINS'
              ? { fallback_reward: kind, coins_awarded: { increment: amount } }
              : { fallback_reward: kind, ai_helps_awarded: { increment: amount } },
        });

        return Response.json({
          success: true,
          choice: kind,
          amount,
          newCoins: updatedUser.coins,
          newAiHelpCredits: updatedUser.ai_help_credits,
        });
      }

      if (typeof scenarioId !== 'string') throw error(400, 'Invalid request');
      if (!offers.includes(scenarioId)) throw error(400, 'Invalid scenario for this day');

      // Already owned — the client should have offered the fallback. Rejecting here is the
      // whole point: the old path wrote the grant anyway and silently wasted the day.
      if (owned.has(scenarioId)) {
        throw error(409, 'You already own this scenario — choose a reward instead');
      }

      // The claim row IS the grant. `unlocked_at` records when the choice was made, which is
      // often well after the day was claimed.
      await tx.learner_pass_claim.update({
        where: { id: claim.id },
        data: { unlocked_scenario: scenarioId, unlocked_at: now },
      });

      return Response.json({
        success: true,
        choice: 'SCENARIO',
        scenarioId,
        grantedProjectId: scenarioId,
      });
    });
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err) throw err;
    console.error('choose-unlock error:', err);
    throw error(500, 'Failed to choose unlock');
  }
};
