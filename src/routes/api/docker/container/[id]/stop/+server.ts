import { json, type RequestHandler } from "@sveltejs/kit";
import { error } from "@sveltejs/kit";
import { WorkspaceService } from "$lib/layers/service/WorkspaceService";

const workspaceService = new WorkspaceService();

export const POST: RequestHandler = async ({ params, locals }) => {
    // --- Auth check ---
    const session = await locals.auth();
    if (!session?.user?.id) {
        return error(401, 'Unauthorized');
    }
    const { id } = params;

    const res = await workspaceService.stopWorkspace(id)
    return json({ success: true, data: res });
}
