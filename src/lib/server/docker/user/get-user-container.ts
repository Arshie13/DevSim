import prisma from '$lib/server/client';

export interface GetUserContainerRequest {
  id: string;
  userId: string;
  containerId: string;
}

export async function getAllUserContainer(userId: string) {
  const userContainers = await prisma.container.findMany({
    where: {
      userId: userId
    }
  });

  return userContainers
}

export async function getUserContainer(data: GetUserContainerRequest) {
  const userContainers = await prisma.container.findUnique({
    where: {
      id: data.id,
      AND: [
        { userId: data.userId },
        { containerId: data.containerId }
      ]
    }
  });

  return userContainers
}