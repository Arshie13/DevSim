import prisma from '$lib/server/client';
import { Prisma } from '$prismaclient';

export interface UserContainerRequest {
  userId: string;
  containerId: string;
  currentScenarioId: string;
  stacks: Array<{
    stackName: string;
    stackVersion?: string;
  }>;
  level: number;
  status: string;
}

/**
 * Upserts a Container DB record for the given Docker container.
 * Throws a clear error if the userId doesn't exist in the User table
 * (P2003 FK violation — usually caused by a stale session after a DB reset).
 */
export async function saveUserContainer(data: UserContainerRequest): Promise<{ dbContainerId: string }> {
  const isExisting = await prisma.workspace.findFirst({
    where: {
      AND: [
        { user_id: data.userId },
        { container_id: data.containerId },
      ]
    }
  });

  try {
    if (isExisting) {
      // Update existing container - delete old stacks and create new ones
      await prisma.workspace_stack.deleteMany({
        where: { workspace_id: isExisting.id }
      });

      await prisma.workspace.update({
        data: {
          user_id: data.userId,
          container_id: data.containerId,
          level: data.level,
          status: data.status,
        },
        where: { id: isExisting.id }
      });

      // Create new stack records
      if (data.stacks.length > 0) {
        await prisma.workspace_stack.createMany({
          data: data.stacks.map(stack => ({
            workspace_id: isExisting.id,
            stackName: stack.stackName,
            stackVersion: stack.stackVersion || null
          }))
        });
      }

      return { dbContainerId: isExisting.id };
    }

    const created = await prisma.workspace.create({
      data: {
        user_id: data.userId,
        container_id: data.containerId,
        current_scenario_id: data.currentScenarioId,
        level: data.level,
        status: data.status,
        workspace_stacks: {
          create: data.stacks.map(stack => ({
            stackName: stack.stackName,
            stackVersion: stack.stackVersion || null
          }))
        }
      },
      select: { id: true }
    });

    return { dbContainerId: created.id };
  } catch (err) {
    console.log('Error in saveUserContainer:', err);
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
