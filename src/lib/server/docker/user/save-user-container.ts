import prisma from '$lib/server/client';
import { Prisma } from '$prismaclient';

export interface UserContainerRequest {
  userId: string;
  containerId: string;
  stacks: string[];
  level: number;
  status: string;
  projectFolder?: string;
  scenarioTitle?: string;
}

/**
 * Upserts a Container DB record for the given Docker container.
 * Throws a clear error if the userId doesn't exist in the User table
 * (P2003 FK violation — usually caused by a stale session after a DB reset).
 */
export async function saveUserContainer(data: UserContainerRequest): Promise<{ dbContainerId: string }> {
  console.log('[saveUserContainer] Received data:', data);

  const isExisting = await prisma.container.findFirst({
    where: {
      AND: [
        { userId: data.userId },
        { containerId: data.containerId },
      ]
    }
  });

  try {
    if (isExisting) {
      await prisma.container.update({
        data: {
          userId: data.userId,
          containerId: data.containerId,
          stacks: data.stacks,
          level: data.level,
          status: data.status,
          projectFolder: data.projectFolder,
          scenarioTitle: data.scenarioTitle,
        },
        where: { id: isExisting.id }
      });
      return { dbContainerId: isExisting.id };
    }

    const created = await prisma.container.create({
      data: {
        userId: data.userId,
        containerId: data.containerId,
        stacks: data.stacks,
        level: data.level,
        status: data.status,
        projectFolder: data.projectFolder,
        scenarioTitle: data.scenarioTitle,
      },
      select: { id: true }
    });

    return { dbContainerId: created.id };
  } catch (err) {
    // P2003 = foreign key constraint — the userId doesn't exist in the User table.
    // This happens when a session is stale after a DB reset. Tell the caller clearly.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
      throw new Error(
        `User '${data.userId}' not found in database. Your session may be stale — please sign out and sign in again.`
      );
    }
    throw err;
  }

  // Unreachable but satisfies TypeScript
  throw new Error('Unexpected error in saveUserContainer');
}
