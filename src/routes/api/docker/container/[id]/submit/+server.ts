/**
 * POST /api/docker/container/[id]/submit
 *
 * Marks a container as "completed" and awards XP + coins to the user.
 * This is called as the first step in the Submit Sprint flow, before archiving.
 *
 * Auth: session required, must own the container.
 * Params: [id] = Prisma Container.id (NOT the Docker container ID).
 * Returns: { success, rewards: { xp, coins } }
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/client';

// Default rewards — used when a linked Level record is unavailable.
const DEFAULT_XP_REWARD = 500;
const DEFAULT_COIN_REWARD = 200;

export const POST: RequestHandler = async ({ params, locals }) => {
	// --- Auth check ---
	const session = await locals.auth();
	if (!session?.user?.id) {
		return error(401, 'Unauthorized');
	}

	try {
		// --- Look up the Container record ---
		const record = await prisma.container.findUnique({
			where: { id: params.id }
		});

		console.log('[submit] DB record:', record);

		if (!record) {
			return error(404, 'Container not found.');
		}

		// --- Ownership check ---
		if (record.userId !== session.user.id) {
			return error(403, 'You do not own this container.');
		}

		// --- Prevent double-completion ---
		if (record.status === 'completed') {
			return error(409, 'Container is already completed.');
		}

		// --- Prisma transaction: mark complete + award rewards atomically ---
		await prisma.$transaction([
			// Mark the container as completed
			prisma.container.update({
				where: { id: params.id },
				data: {
					status: 'completed',
					stoppedAt: new Date()
				}
			}),

			// Increment user XP and coins
			prisma.user.update({
				where: { id: session.user.id },
				data: {
					xp: { increment: DEFAULT_XP_REWARD },
					coins: { increment: DEFAULT_COIN_REWARD }
				}
			}),

			// Mark any linked UserStackOptions entries as complete
			prisma.userStackOptions.updateMany({
				where: { containerId: params.id },
				data: { isComplete: true }
			})
		]);

		return json({
			success: true,
			rewards: {
				xp: DEFAULT_XP_REWARD,
				coins: DEFAULT_COIN_REWARD
			}
		});
	} catch (err) {
		console.error('Submit error:', err);
		return error(500, `Submit failed: ${String(err)}`);
	}
};
