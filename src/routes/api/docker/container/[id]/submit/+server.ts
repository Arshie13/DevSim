import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { WorkspaceService } from '$lib/layers/service/WorkspaceService';

// Default rewards — used when a linked Level record is unavailable.
const DEFAULT_XP_REWARD = 100;
const DEFAULT_COIN_REWARD = 50;

interface SubmitRequest {
  taskName: string;
  advanceLevel?: boolean; // If true, will advance level when all tasks complete
}

export const POST: RequestHandler = async ({ params, locals, request }) => {
	// --- Auth check ---
	const session = await locals.auth();

	if (!session?.user?.id) {
		return error(401, 'Unauthorized');
	}

	try {
		const body: SubmitRequest = await request.json();
		const { taskName, advanceLevel } = body

		if (!taskName) {
			return error(400, 'Missing taskName');
		}

		const workspaceService = new WorkspaceService();
		const result = await workspaceService.submitWork({
			taskName,
			containerId: params.id,
			userId: session.user.id,
			advanceLevel
		});

		if (!result.success || result.error) {
			console.error('Submit failed:', result.error);
			return error(result.status ? result.status : 500, `Submit failed: ${String(result.error)}`);
		}

		return json(result);
	} catch (err) {
		console.error('Submit error:', err);
		return error(500, `Submit failed: ${String(err)}`);
	}
};