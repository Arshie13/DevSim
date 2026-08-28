import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { WorkspaceLaunchConflict, WorkspaceService } from "$lib/layers/service/WorkspaceService";
import prisma from "$lib/server/client";
import { resolveScenarioId } from "$lib/utils/scenario-mapping";
import { hasProjectAccess } from "$lib/server/access/hasProjectAccess";

export const POST: RequestHandler = async ({ locals, request }) => {
  try {
    const session = await locals.auth();

    if (!session || !session.user || !session.user.id) {
      return error(401, "Unauthorized");
    }

    const userId = session.user.id;
    const req = await request.json();
    const {
      stackName,
      level,
      stacks,
      scenarioId,
      projectFolder,
      scenarioTitle,
      mode,
    } = req;

    console.log("[docker create] mode: ", mode);

    // Paywall check — per-scenario
    if (scenarioId) {
      const dbId = resolveScenarioId(stackName, scenarioId);
      const scenario = await prisma.scenario.findUnique({
        where: { id: dbId },
        select: { is_paywalled: true }
      });
      if (scenario?.is_paywalled) {
        const hasAccess = await hasProjectAccess(userId, dbId, false);
        if (!hasAccess) {
          return json(
            { success: false, error: 'This scenario requires an active Learner Pass.', locked: true },
            { status: 403 }
          );
        }
      }
    }

    const service = new WorkspaceService();
    const result = await service.createOrReuseWorkspace({
      userId,
      stackName,
      level,
      stacks,
      scenarioId: scenarioId || undefined,
      projectFolder: projectFolder || undefined,
      scenarioTitle: scenarioTitle || "",
      mode: mode === "tutorial" ? "tutorial" : "workspace",
    });

    return json({ success: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Error handling container request:", err);

    if (err instanceof WorkspaceLaunchConflict) {
      return json(
        { success: false, error: message, code: 'WORKSPACE_IN_PROGRESS', workspace: err.workspace },
        { status: 409 },
      );
    }

    // FK violation — stale session whose userId no longer exists in the DB
    if (
      message.includes("not found in database") ||
      message.includes("session")
    ) {
      return json({ success: false, error: message }, { status: 401 });
    }

    return json({ success: false, error: message }, { status: 500 });
  }
};
