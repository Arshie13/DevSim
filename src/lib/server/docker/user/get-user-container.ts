import prisma from '$lib/server/client';

export interface GetUserContainerRequest {
  id: string;
  userId: string;
  containerId: string;
}

export async function getAllUserContainer(userId: string) {
  const userContainers = await prisma.workspace.findMany({
    where: {
      user_id: userId
    },
    include: {
      scenario: true,
    }
  });

  return userContainers.map((row) => ({
    id: row.id,
    containerId: row.container_id,
    status: row.status,
    level: row.level,
    scenario: row.scenario,
    stackName: row.stack_name,
    stackVersion: row.stack_version,
    isArchived: row.is_archived,
    volumeName: row.volume_name,
    updated_at: row.updated_at,
  }));
}

export async function getUserContainer(data: GetUserContainerRequest) {
  const userContainers = await prisma.workspace.findUnique({
    where: {
      id: data.id,
      AND: [
        { user_id: data.userId },
        { container_id: data.containerId }
      ]
    }
  });

  return userContainers;
}

export async function getArchivedContainers(userId: string) {
  const rows = await prisma.workspace.findMany({
    where: {
      user_id: userId,
      is_archived: true,
    },
    orderBy: {
      updated_at: 'desc',
    },
    include: {
      scenario: true,
    }
  });

  return rows.map((row) => ({
    ...row,
    containerId: row.container_id,
    isArchived: row.is_archived,
    volumeName: row.volume_name,
    stackName: row.stack_name,
    stackVersion: row.stack_version,
    stoppedAt: row.stopped_at,
    updatedAt: row.updated_at,
    createdAt: row.created_at,
  }));

}