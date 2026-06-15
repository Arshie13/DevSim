import prisma from '$lib/server/client';
import { type StackSelection } from '$lib/types/techstack';
import { Prisma } from '$prismaclient';

export interface UserContainerRequest {
  userId: string;
  containerId: string;
  currentScenarioId: string;
  stacks: StackSelection;
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
    const stacks = [
      data.stacks.frontend && { stackName: data.stacks.frontend },
      data.stacks.backend && { stackName: data.stacks.backend },
      data.stacks.database && { stackName: data.stacks.database },
      data.stacks.services && { stackName: data.stacks.services }
    ].filter(Boolean);

    // normalize stack name by concatenating each name
    const stackName = stacks.map(stack => typeof stack === 'object' ? stack?.stackName : stack).join('-');

    if (isExisting && stacks && stacks.length > 0) {
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
      if (stacks && stacks.length > 0) {

        await prisma.workspace_stack.createMany({
          data: stacks.map(_ => ({
            workspace_id: isExisting.id,
            stack_name: stackName,
            stack_version: '1.0.0'
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
          create: stacks.map(_ => ({
            stack_name: stackName,
            stack_version: '1.0.0'
          }))
        }
      },
      select: { id: true }
    });

    return { dbContainerId: created.id };
  } catch (err) {
    console.log('Error in saveUserContainer:', err);
    // P2003 = foreign key constraint failed.
    // Determine which field caused the FK violation for an accurate error message.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
      const fieldName = (err.meta as { field_name?: string })?.field_name ?? '';
      if (fieldName.includes('user_id')) {
        throw new Error(
          `User '${data.userId}' not found in database. Your session may be stale — please sign out and sign in again.`
        );
      }
      if (fieldName.includes('current_scenario_id')) {
        throw new Error(
          `Scenario '${data.currentScenarioId}' not found in database. The database may have been reseeded — please refresh the page and try again.`
        );
      }
      throw new Error(
        `Foreign key constraint failed on field '${fieldName}'. Please sign out and sign in again.`
      );
    }
    throw err;
  }
}
