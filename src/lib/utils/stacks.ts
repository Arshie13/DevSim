export const TECH_NAME_MAP: Record<string, string> = {
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
  postgres: 'PostgreSQL',
  mongodb: 'MongoDB',
  mysql: 'MySQL',
  sqlite: 'SQLite',
  redis: 'Redis',
  prisma: 'Prisma',
  supabase: 'Supabase',
  docker: 'Docker',
  graphql: 'GraphQL',
};

interface StackAcronym {
  test: (s: Set<string>) => boolean;
  label: string;
  full: string;
}

export const STACK_ACRONYMS: StackAcronym[] = [
  {
    test: (s) => s.has('react') && s.has('express') && (s.has('postgresql') || s.has('postgres')),
    label: 'PERN',
    full: 'PostgreSQL, Express, React, Node.js',
  },
  {
    test: (s) => s.has('react') && s.has('express') && s.has('mongodb'),
    label: 'MERN',
    full: 'MongoDB, Express, React, Node.js',
  },
  {
    test: (s) => s.has('angular') && s.has('express') && s.has('mongodb'),
    label: 'MEAN',
    full: 'MongoDB, Express, Angular, Node.js',
  },
  {
    test: (s) => s.has('vue') && s.has('express') && s.has('mongodb'),
    label: 'MEVN',
    full: 'MongoDB, Express, Vue.js, Node.js',
  },
];

const ALL_BACKEND_IDS = ['express', 'fastify', 'nestjs', 'django', 'flask'];
const ALL_FRONTEND_IDS = ['react', 'nextjs', 'svelte', 'vue', 'angular'];

export function isBackendStack(stackName: string | null | undefined): boolean {
  if (!stackName) return false;
  const slugs = stackName.split('-').map((s) => s.trim().toLowerCase()).filter(Boolean);
  const hasBackend = slugs.some((s) => ALL_BACKEND_IDS.includes(s));
  const hasFrontend = slugs.some((s) => ALL_FRONTEND_IDS.includes(s));
  return hasBackend && !hasFrontend;
}

/** Returns an acronym label (e.g. "PERN — PostgreSQL, Express, React, Node.js")
 *  when the stack matches a known pattern, otherwise a comma-joined display name list.
 *  Accepts a single compound slug like "react-express-postgresql-prisma" or an array
 *  of objects with stackName or stack_name fields.
 *  The slug is split on "-" and each part is mapped individually. */
export function parseStackName(stacks: string | Array<{ stack_name?: string; stackName?: string }>): string {
  if (!stacks) return 'Unknown Stack';
  const rawNames: string[] = [];
  if (typeof stacks === 'string') {
    rawNames.push(stacks);
  } else if (stacks.length === 0) {
    return 'Unknown Stack';
  } else {
    for (const s of stacks) {
      const name = ('stackName' in s && s.stackName) || ('stack_name' in s && s.stack_name);
      if (name) rawNames.push(name);
    }
  }

  // Split compound slugs (e.g. "react-express-postgresql-prisma" → ["react", "express", ...])
  const slugs = [...new Set(rawNames.flatMap((name) => name.split('-').map((p) => p.trim().toLowerCase()).filter(Boolean)))];

  if (!slugs.length) return 'Unknown Stack';
  const set = new Set(slugs);
  for (const { test, label, full } of STACK_ACRONYMS) {
    if (test(set)) return `${label} — ${full}`;
  }
  return slugs.map((s) => TECH_NAME_MAP[s] ?? s).join(', ');
}
