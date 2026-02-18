import prisma from '$lib/server/client';

export interface UserContainerRequest {
  userId: string;
  containerId: string;
  stacks: string[];
  level: number;
  status: string;
}

export async function saveUserContainer(data: UserContainerRequest) {

  const isExisting = await prisma.container.findFirst({
    where: {
      AND: [
        { userId: data.userId },
        { containerId: data.containerId },
      ]
    }
  });

  if (isExisting) {
    await prisma.container.update({
      data: {
        userId: data.userId,
        containerId: data.containerId,
        stacks: data.stacks,
        level: data.level,
        status: data.status
      },
      where: { id: isExisting.id }
    });

    return 'updated container data!'
  }

  await prisma.container.create({
    data: {
      userId: data.userId,
      containerId: data.containerId,
      stacks: data.stacks,
      level: data.level,
      status: data.status
    }
  });

  return 'created container!'
}
