import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import prisma from '$lib/server/client';
import { docker } from '$lib/server/docker/client';
import { WorkspaceService } from '$lib/layers/service/WorkspaceService';

const INACTIVE_AFTER_MS = 5 * 60_000;

export const load: PageServerLoad = async ({ locals }) => {
  const session = await locals.auth();

  if (!session?.user) {
    throw redirect(303, '/login');
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!dbUser || dbUser.role !== 'ADMIN') {
    throw redirect(303, '/');
  }

  const [workspaces, dockerResult] = await Promise.all([
    prisma.workspace.findMany({
      where: { is_archived: false },
      include: {
        user: {
          select: { id: true, name: true, email: true, username: true, last_seen_at: true },
        },
        scenario: { select: { name: true } },
      },
      orderBy: { updated_at: 'desc' },
    }),
    (async () => {
      try {
        const list = await docker.listContainers({ all: true });
        const map = new Map<string, string>();
        for (const c of list) {
          if (c.State === 'running') map.set(c.Id, c.Status ?? 'running');
        }
        return { map, error: false as const };
      } catch {
        return { map: new Map<string, string>(), error: true as const };
      }
    })(),
  ]);

  const runningMap = dockerResult.map;
  const dockerError = dockerResult.error;

  const rows = workspaces
    .map((ws) => {
      const lastSeen = ws.user.last_seen_at?.getTime() ?? 0;
      const isInactive = lastSeen === 0 || Date.now() - lastSeen > INACTIVE_AFTER_MS;
      const dockerRunning = runningMap.has(ws.container_id);
      const dockerState = runningMap.get(ws.container_id) ?? null;

      let lastSeenLabel = 'Never';
      if (ws.user.last_seen_at) {
        const diff = Date.now() - ws.user.last_seen_at.getTime();
        const minutes = Math.floor(diff / 60_000);
        if (minutes < 1) lastSeenLabel = 'Just now';
        else if (minutes < 60) lastSeenLabel = `${minutes}m ago`;
        else {
          const hours = Math.floor(minutes / 60);
          if (hours < 24) lastSeenLabel = `${hours}h ago`;
          else {
            const days = Math.floor(hours / 24);
            if (days === 1) lastSeenLabel = 'Yesterday';
            else if (days < 7) lastSeenLabel = `${days} days ago`;
            else lastSeenLabel = ws.user.last_seen_at.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          }
        }
      }

      return {
        workspaceId: ws.id,
        containerId: ws.container_id,
        status: ws.status,
        level: ws.level,
        stackName: ws.stack_name,
        scenarioName: ws.scenario?.name ?? '—',
        dockerState,
        dockerRunning,
        isInactive,
        presenceLabel: isInactive ? 'Inactive' : 'Active',
        lastSeenLabel,
        user: {
          id: ws.user.id,
          name: ws.user.name,
          email: ws.user.email,
          username: ws.user.username,
          lastSeenAt: ws.user.last_seen_at,
        },
      };
    })
    .sort((a, b) => {
      if (a.isInactive !== b.isInactive) return Number(b.isInactive) - Number(a.isInactive);
      return b.workspaceId.localeCompare(a.workspaceId);
    });

  return {
    rows,
    dockerError,
  };
};

export const actions: Actions = {
  stopContainer: async ({ locals, request }) => {
    const session = await locals.auth();

    if (!session?.user) {
      throw redirect(303, '/login');
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!dbUser || dbUser.role !== 'ADMIN') {
      throw redirect(303, '/');
    }

    const formData = await request.formData();
    const containerId = formData.get('containerId');

    if (!containerId || typeof containerId !== 'string') {
      return fail(400, { message: 'Missing containerId' });
    }

    const service = new WorkspaceService();
    const res = await service.stopWorkspace(containerId);

    if (res.success === false) {
      return fail(500, { message: res.error ?? 'Failed to stop container' });
    }

    return { success: true };
  },
};
