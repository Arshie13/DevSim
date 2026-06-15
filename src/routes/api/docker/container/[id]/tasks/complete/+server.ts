import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { WorkspaceService } from '$lib/layers/service/WorkspaceService';

interface CompleteTaskRequest {
	taskName: string;
}

// Records a single task the moment its test passes on the board, so it shows up
// in the dashboard "Weekly Activity" immediately — not only after a full Submit
// Sprint. Idempotent server-side, so re-running a passing test is a no-op.
export const POST: RequestHandler = async ({ params, locals, request }) => {
	const session = await locals.auth();

	if (!session?.user?.id) {
		return error(401, 'Unauthorized');
	}

	try {
		const body: CompleteTaskRequest = await request.json();
		const { taskName } = body;

		if (!taskName) {
			return error(400, 'Missing taskName');
		}

		const workspaceService = new WorkspaceService();
		const result = await workspaceService.recordTaskCompletion({
			taskName,
			containerId: params.id,
			userId: session.user.id
		});

		if (!result.success) {
			console.error('Record task failed:', result.error);
			return error(result.status ?? 500, `Failed to record task: ${String(result.error)}`);
		}

		return json(result);
	} catch (err) {
		console.error('Record task error:', err);
		return error(500, `Failed to record task: ${String(err)}`);
	}
};
