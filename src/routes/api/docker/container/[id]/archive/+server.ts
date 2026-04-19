/**
 * POST /api/docker/container/[id]/archive
 *
 * Archives a completed container's workspace into a named Docker volume,
 * then stops and removes the original container.
 *
 * Auth: session required — must own the container.
 * Params: [id] = Docker container ID (containerId field in DB, NOT the Prisma ID).
 * Returns: { volumeName, dbContainerId }
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { archiveContainer } from '$lib/server/docker/user/archive-container';
import prisma from '$lib/server/client';

export const POST: RequestHandler = async ({ params, locals }) => {
	// --- Auth check ---
	const session = await locals.auth();
	if (!session?.user?.id) {
		return error(401, 'Unauthorized');
	}

	try {
		// Look up the container by Docker container ID (consistent with submit endpoint)
		const container = await prisma.workspace.findFirst({
			where: { container_id: params.id, user_id: session.user.id }
		});

		if (!container) {
			return error(404, 'Container not found.');
		}

		// Use the Prisma ID for the archive operation
		const result = await archiveContainer({
			dbContainerId: container.id,
			userId: session.user.id
		});

		return json({
			success: true,
			volumeName: result.volumeName,
			dbContainerId: result.dbContainerId
		});
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);

		// Map known validation errors to appropriate HTTP codes
		if (message.includes('not found')) return error(404, message);
		if (message.includes('do not own')) return error(403, message);
		if (message.includes('Only completed')) return error(400, message);
		if (message.includes('already archived')) return error(409, message);

		console.error('Archive error:', err);
		return error(500, `Archive failed: ${message}`);
	}
};
