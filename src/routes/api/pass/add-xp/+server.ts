import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { XPEventService } from '$lib/layers/service/XPEventService';
import prisma from '$lib/server/client';
import { checkRateLimit } from '$lib/server/ratelimit';

const xpEventService = new XPEventService();

// Rate limit: admins can award XP frequently, but still cap to prevent abuse
const ADMIN_XP_LIMIT = 100;
const ADMIN_XP_WINDOW_MS = 60 * 60_000; // 1 hour

export const POST: RequestHandler = async (event) => {
  const session = await event.locals.auth();
  if (!session?.user?.id) {
    throw error(401, 'Unauthorized');
  }

  // Admin-only: XP awards must come from server-validated sources
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });
  if (!user || user.role !== 'ADMIN') {
    throw error(403, 'Admin only');
  }

  // Rate limiting
  const rateLimitKey = `add-xp:${session.user.id}`;
  if (!checkRateLimit(rateLimitKey, ADMIN_XP_LIMIT, ADMIN_XP_WINDOW_MS)) {
    throw error(429, 'Too many XP award attempts. Please try again later.');
  }

  try {
    const body = await event.request.json();
    const { amount, source, userId } = body;

    // Optional: specify which user to award (admin can award others)
    const targetUserId = userId || session.user.id;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      throw error(400, 'Invalid XP amount');
    }

    if (!source || typeof source !== 'string') {
      throw error(400, 'Invalid XP source');
    }

    // Validate source is one of allowed types
    const allowedSources = ['task_completion', 'daily_login', 'perfect_completion', 'weekly_challenge', 'achievement_unlock', 'admin_grant', 'event_bonus', 'scenario_completion'] as const;
    if (!allowedSources.includes(source as any)) {
      throw error(400, 'Invalid XP source');
    }

    const result = await xpEventService.awardXP({
      userId: targetUserId,
      amount,
      source: source as any // safe due to check above
    });

    return json({
      success: true,
      seasonXp: result.seasonXp,
      oldLevel: result.oldLevel,
      newLevel: result.newLevel,
      levelUps: result.levelUps,
      boostApplied: result.boostApplied
    });
  } catch (err: any) {
    console.error('Error awarding XP:', err);
    if (err.message.includes('exceeds maximum') || err.message.includes('Invalid XP source')) {
      throw error(400, err.message);
    }
    throw error(500, 'Failed to award XP');
  }
};
