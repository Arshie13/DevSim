import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { WorkspaceService } from "$lib/layers/service/WorkspaceService";
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

    // Sandbox validation
    if (mode === "sandbox") {
      const sandboxSetting = await prisma.app_setting.findUnique({
        where: { key: 'sandbox_enabled' }
      });
      if (sandboxSetting?.value !== 'true') {
        return json({ success: false, error: 'Sandbox is currently disabled.' }, { status: 403 });
      }

      const access = await prisma.sandbox_access.findUnique({
        where: { user_id: userId }
      });
      if (!access) {
        return json({ success: false, error: 'Sandbox access not purchased.' }, { status: 403 });
      }
      if (access.expires_at < new Date()) {
        return json({ success: false, error: 'Sandbox access has expired. Purchase again to continue.' }, { status: 403 });
      }

      const existing = await prisma.workspace.findFirst({
        where: { user_id: userId, status: "sandbox", is_archived: false }
      });
      if (existing) {
        return json({ success: false, error: 'You already have an active sandbox. Archive it first.' }, { status: 409 });
      }
    }

    // Paywall check — per-scenario
    if (scenarioId && mode !== "sandbox") {
      const dbId = resolveScenarioId(stackName, scenarioId);
      const scenario = await prisma.scenario.findUnique({
        where: { id: dbId },
        select: { paywall: true }
      });
      if (scenario?.paywall) {
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
      scenarioId: mode === "sandbox" ? undefined : (scenarioId || undefined),
      projectFolder: mode === "sandbox" ? undefined : (projectFolder || undefined),
      scenarioTitle: mode === "sandbox" ? "" : (scenarioTitle || ""),
      mode: mode === "sandbox" ? "sandbox" : (mode === "tutorial" ? "tutorial" : "workspace"),
    });

    return json({ success: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Error handling container request:", err);

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
