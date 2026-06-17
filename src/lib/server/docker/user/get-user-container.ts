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
  const userContainers = await prisma.workspace.findMany({
    where: {
      user_id: userId
    },
    include: {
      scenario: true,
      workspace_stacks: true,
    }
  });

  return userContainers
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
      workspace_stacks: true
    }
  });

  // The finished-stack UI (dashboard FinishedStacks + projects FinishedStacksList /
  // ProjectCard) reads camelCase IContainer fields, but Prisma returns snake_case
  // columns. Without these aliases `isArchived`/`volumeName` are undefined, so a
  // freshly archived stack shows "Not restorable" and its stacks render as
  // "Unknown Stack". Spread keeps the snake_case originals intact.
  return rows.map((row) => ({
    ...row,
    containerId: row.container_id,
    isArchived: row.is_archived,
    volumeName: row.volume_name,
    containerStacks: row.workspace_stacks,
    stoppedAt: row.stopped_at,
    updatedAt: row.updated_at,
    createdAt: row.created_at,
  }));

  // return containers.map((container) => {
  //   const stackNames = container.containerStacks.map(s => s.stackName);
  //   const [frontend, backend, database, services] = stackNames;
  //   const icon = TECH_ICON_MAP[frontend] ?? TECH_ICON_MAP[backend] ?? '📦';
  //   const name = stackNames
  //     .map((s) => TECH_NAME_MAP[s] ?? s)
  //     .join(' + ');

  //   const completedAt = (container.stoppedAt ?? container.updatedAt).toLocaleDateString('en-US', {
  //     year: 'numeric',
  //     month: 'short',
  //     day: 'numeric',
  //   });

  //   return {
  //     id: container.id,
  //     name,
  //     frontend: TECH_NAME_MAP[frontend] ?? frontend ?? '',
  //     backend: TECH_NAME_MAP[backend] ?? backend ?? '',
  //     database: TECH_NAME_MAP[database] ?? database ?? '',
  //     services: services ? (TECH_NAME_MAP[services] ?? services) : undefined,
  //     completedAt,
  //     xpEarned: 0,
  //     coinsEarned: 0,
  //     rating: 0,
  //     icon,
  //   } satisfies FinishedStack;
  // });
}