import prisma from '$lib/server/client';

export interface GetUserContainerRequest {
  id: string;
  userId: string;
  containerId: string;
}

// Maps tech IDs stored in Container.stacks to display names
const TECH_NAME_MAP: Record<string, string> = {
  react: 'React',
  nextjs: 'Next.js',
  vue: 'Vue.js',
  svelte: 'Svelte',
  angular: 'Angular',
  express: 'Express.js',
  fastify: 'Fastify',
  nestjs: 'NestJS',
  django: 'Django',
  flask: 'Flask',
  postgresql: 'PostgreSQL',
  mongodb: 'MongoDB',
  mysql: 'MySQL',
  sqlite: 'SQLite',
  redis: 'Redis',
  prisma: 'Prisma',
  supabase: 'Supabase',
  docker: 'Docker',
  graphql: 'GraphQL',
};

const TECH_ICON_MAP: Record<string, string> = {
  react: '⚛️',
  nextjs: '▲',
  vue: '💚',
  svelte: '🔥',
  angular: '🅰️',
  express: '🚂',
  fastify: '⚡',
  nestjs: '🐈',
  django: '🐍',
  flask: '🧪',
  postgresql: '🐘',
  mongodb: '🍃',
  mysql: '🐬',
  sqlite: '📄',
  redis: '🔴',
  prisma: '◆',
  supabase: '⚡',
  docker: '🐳',
  graphql: '◈',
};

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

export async function getArchivedContainers(userId: string) {
  return prisma.container.findMany({
    where: {
      userId,
      isArchived: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });
}