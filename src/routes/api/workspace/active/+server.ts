import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/client';

export const GET: RequestHandler = async ({ locals, url }) => {
  try {
    const session = await locals.auth();
    if (!session?.user?.id) {
      return json({ hasActive: false, error: 'Unauthorized' }, { status: 401 });
    }

    const stackName = url.searchParams.get('stackName');
    const anyActive = url.searchParams.get('any') === 'true';

    if (!stackName && !anyActive) {
      return json({ hasActive: false, error: 'Missing stackName parameter' }, { status: 400 });
    }

    const whereClause: any = {
      user_id: session.user.id,
      is_archived: false,
      status: { not: 'completed' },
    };

    if (stackName && !anyActive) {
      whereClause.stack_name = stackName;
    }

    const activeWorkspace = await prisma.workspace.findFirst({
      where: whereClause,
      select: {
        id: true,
        stack_name: true,
        level: true,
        status: true,
        current_scenario_id: true,
        scenario: { select: { name: true } },
      },
    });

    return json({
      hasActive: !!activeWorkspace,
      workspace: activeWorkspace
        ? {
            id: activeWorkspace.id,
            stackName: activeWorkspace.stack_name,
            level: activeWorkspace.level,
            status: activeWorkspace.status,
            scenarioId: activeWorkspace.current_scenario_id,
            scenarioTitle: activeWorkspace.scenario.name,
          }
        : null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Error checking active workspace:', err);
    return json({ hasActive: false, error: message }, { status: 500 });
  }
};
