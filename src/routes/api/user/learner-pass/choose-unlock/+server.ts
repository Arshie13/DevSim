import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/client';
import { SPECIAL_UNLOCK_DAYS, getSpecialUnlocksForDay } from '$lib/server/learnerPass/schedule';

export const POST: RequestHandler = async (event) => {
  const session = await event.locals.auth();
  if (!session?.user?.id) throw error(401, 'Unauthorized');

  const userId = session.user.id;
  const body = await event.request.json().catch(() => null);
  const dayNumber = body?.dayNumber;
  const scenarioId = body?.scenarioId;

  if (typeof dayNumber !== 'number' || typeof scenarioId !== 'string') {
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
      // choice, which the old flat `unlock_choices` array could not express.
      if (claim.unlocked_scenario) throw error(409, 'Choice already made for this day');

      const available = getSpecialUnlocksForDay(dayNumber);
      if (!available.includes(scenarioId)) throw error(400, 'Invalid scenario for this day');

      // Already owned, possibly via an earlier pass. Source-agnostic by design: the unlock is
      // the fact, whoever granted it — and only a claim can grant it now.
      const existing = await tx.learner_pass_claim.findFirst({
        where: {
          unlocked_scenario: scenarioId,
          enrollment: { user_id: userId },
        },
        select: { id: true },
      });

      // The claim row IS the grant. `unlocked_at` records when the choice was made, which is
      // often well after the day was claimed.
      await tx.learner_pass_claim.update({
        where: { id: claim.id },
        data: { unlocked_scenario: scenarioId, unlocked_at: now },
      });

      return Response.json({
        success: true,
        grantedProjectId: scenarioId,
        alreadyOwned: !!existing,
      });
    });
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err) throw err;
    console.error('choose-unlock error:', err);
    throw error(500, 'Failed to choose unlock');
  }
};
