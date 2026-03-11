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

/** Returns an acronym label (e.g. "PERN — PostgreSQL, Express, React, Node.js")
 *  when the stack matches a known pattern, otherwise a comma-joined display name list. */
export function parseStackName(stacks: string[]): string {
  if (!stacks?.length) return 'Unknown Stack';
  const set = new Set(stacks);
  for (const { test, label, full } of STACK_ACRONYMS) {
    if (test(set)) return `${label} — ${full}`;
  }
  return stacks.map((s) => TECH_NAME_MAP[s] ?? s).join(', ');
}
