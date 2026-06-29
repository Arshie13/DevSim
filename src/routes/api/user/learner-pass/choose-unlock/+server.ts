import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/client';
import { SPECIAL_UNLOCK_DAYS, getSpecialUnlocksForDay } from '$lib/utils/reward-constants';

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

      if (!enrollment || enrollment.status !== 'ACTIVE') throw error(400, 'No active pass');

      if (enrollment.expires_at && new Date() > enrollment.expires_at) throw error(410, 'Pass expired');

      if (!enrollment.claimed_days.includes(dayNumber)) throw error(400, 'Day not claimed');

      if (!SPECIAL_UNLOCK_DAYS.includes(dayNumber)) throw error(400, 'Not a special unlock day');

      const choices = (enrollment.unlock_choices as any[]) || [];
      if (choices.some((c: any) => c.dayNumber === dayNumber)) throw error(409, 'Choice already made for this day');

      const available = getSpecialUnlocksForDay(dayNumber);
      if (!available.includes(scenarioId)) throw error(400, 'Invalid scenario for this day');

      const existing = await tx.user_project_access.findFirst({
        where: { user_id: userId, project_id: scenarioId },
      });
      if (existing) throw error(409, 'Scenario already unlocked');

      await tx.user_project_access.create({
        data: {
          user_id: userId,
          project_id: scenarioId,
          source: 'LEARNER_PASS',
          source_ref_id: enrollment.id,
          granted_at: new Date(),
        },
      });

      const newChoices = [...choices, { dayNumber, scenarioId, grantedAt: new Date().toISOString() }];
      await tx.learner_pass_enrollment.update({
        where: { id: enrollment.id },
        data: { unlock_choices: newChoices },
      });

      return Response.json({ success: true, grantedProjectId: scenarioId });
    });
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err) throw err;
    console.error('choose-unlock error:', err);
    throw error(500, 'Failed to choose unlock');
  }
};
