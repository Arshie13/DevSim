/**
 * POST /api/docker/container/[id]/restore
 *
 * Restores an archived container from its saved Docker volume into a new
 * running container, and deducts the restore cost from the user's coins.
 *
 * Auth: session required — must own the container.
 * Params: [id] = Prisma Container.id of the ARCHIVED container.
 * Returns: { newContainerId, newDbContainerId, coinsDeducted, restoreCost }
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { restoreContainer } from '$lib/server/docker/user/restore-container';

export const POST: RequestHandler = async ({ params, locals }) => {
	// --- Auth check ---
	const session = await locals.auth();
	if (!session?.user?.id) {
		return error(401, 'Unauthorized');
	}

	try {
		const result = await restoreContainer({
			dbContainerId: params.id,
			userId: session.user.id
		});

		return json({
			success: true,
			newContainerId: result.dbContainerId, // same DB id — redirect target for /workspace/[id]
			newDockerContainerId: result.newDockerContainerId,
			coinsDeducted: result.coinsDeducted,
			restoreCost: result.restoreCost
		});
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);

		if (message.includes('not found')) return error(404, message);
		if (message.includes('do not own')) return error(403, message);
		if (message.includes('not archived')) return error(400, message);
		if (message.includes('Insufficient coins')) return error(402, message);

		console.error('Restore error:', err);
		return error(500, `Restore failed: ${message}`);
	}
};
