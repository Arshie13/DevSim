export interface TechMeta {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  category: 'frontend' | 'backend' | 'database' | 'service';
  finalProjectDescription: string;
}

const REGISTRY: Record<string, TechMeta> = {
  // Frontends
  react: {
    id: 'react', name: 'React', icon: '⚛️',
    description: 'A JavaScript library for building user interfaces',
    color: 'from-cyan-500 to-blue-600',
    category: 'frontend',
    finalProjectDescription: 'Build interactive user interfaces, single-page applications, and component-based UI systems',
  },
  nextjs: {
    id: 'nextjs', name: 'Next.js', icon: '▲',
    description: 'The React framework for production',
    color: 'from-zinc-700 to-zinc-900',
    category: 'frontend',
    finalProjectDescription: 'Create full-stack web applications with server-side rendering, API routes, and optimized routing',
  },
  svelte: {
    id: 'svelte', name: 'Svelte', icon: '🔥',
    description: 'Cybernetically enhanced web apps',
    color: 'from-orange-500 to-red-600',
    category: 'frontend',
    finalProjectDescription: 'Create high-performance web apps with Svelte\'s compiler-based approach and reactive stores',
  },
  vue: {
    id: 'vue', name: 'Vue.js', icon: '💚',
    description: 'The progressive JavaScript framework',
    color: 'from-emerald-500 to-green-600',
    category: 'frontend',
    finalProjectDescription: 'Build reactive single-page applications with Vue\'s intuitive composition API and templates',
  },
  angular: {
    id: 'angular', name: 'Angular', icon: '🅰️',
    description: 'Platform for building mobile and desktop apps',
    color: 'from-red-500 to-pink-600',
    category: 'frontend',
    finalProjectDescription: 'Build enterprise-scale applications with TypeScript, dependency injection, and modular architecture',
  },
  // Backends
  express: {
    id: 'express', name: 'Express.js', icon: '🚂',
    description: 'Fast, unopinionated web framework for Node.js',
    color: 'from-zinc-600 to-zinc-800',
    category: 'backend',
    finalProjectDescription: 'Build RESTful APIs and server-side applications with Node.js and Express middleware',
  },
  fastify: {
    id: 'fastify', name: 'Fastify', icon: '⚡',
    description: 'Fast and low overhead web framework',
    color: 'from-zinc-500 to-zinc-700',
    category: 'backend',
    finalProjectDescription: 'Create high-performance web services with Fastify\'s schema-based approach and low overhead',
  },
  nestjs: {
    id: 'nestjs', name: 'NestJS', icon: '🐈',
    description: 'Progressive Node.js framework',
    color: 'from-red-600 to-pink-700',
    category: 'backend',
    finalProjectDescription: 'Build scalable, testable enterprise applications with NestJS\'s modular architecture',
  },
  django: {
    id: 'django', name: 'Django', icon: '🐍',
    description: 'High-level Python web framework',
    color: 'from-green-700 to-emerald-800',
    category: 'backend',
    finalProjectDescription: 'Create full-stack Python web applications with Django\'s batteries-included approach',
  },
  flask: {
    id: 'flask', name: 'Flask', icon: '🧪',
    description: 'Lightweight WSGI web application framework',
    color: 'from-zinc-600 to-zinc-800',
    category: 'backend',
    finalProjectDescription: 'Build lightweight Python APIs and web applications with Flask\'s flexible micro-framework',
  },
  // Databases
  postgresql: {
    id: 'postgresql', name: 'PostgreSQL', icon: '🐘',
    description: 'Advanced open-source relational database',
    color: 'from-blue-600 to-indigo-700',
    category: 'database',
    finalProjectDescription: 'Design and manage relational data with PostgreSQL\'s advanced features and SQL capabilities',
  },
  mongodb: {
    id: 'mongodb', name: 'MongoDB', icon: '🍃',
    description: 'Document-oriented NoSQL database',
    color: 'from-green-600 to-emerald-700',
    category: 'database',
    finalProjectDescription: 'Store and query flexible JSON-like documents with MongoDB\'s document model',
  },
  mysql: {
    id: 'mysql', name: 'MySQL', icon: '🐬',
    description: 'World\'s most popular open source database',
    color: 'from-orange-500 to-amber-600',
    category: 'database',
    finalProjectDescription: 'Build reliable relational database solutions with MySQL\'s widely-used architecture',
  },
  sqlite: {
    id: 'sqlite', name: 'SQLite', icon: '📦',
    description: 'Self-contained SQL database engine',
    color: 'from-sky-500 to-blue-600',
    category: 'database',
    finalProjectDescription: 'Create lightweight, embedded database solutions with SQLite\'s serverless architecture',
  },
  redis: {
    id: 'redis', name: 'Redis', icon: '🔴',
    description: 'In-memory data structure store',
    color: 'from-red-600 to-rose-700',
    category: 'database',
    finalProjectDescription: 'Implement caching, session storage, and real-time data with Redis in-memory structures',
  },
  // Services
  prisma: {
    id: 'prisma', name: 'Prisma', icon: '◮',
    description: 'Next-generation Node.js and TypeScript ORM',
    color: 'from-indigo-600 to-purple-700',
    category: 'service',
    finalProjectDescription: 'Type-safely query and manage your database with Prisma\'s modern ORM approach',
  },
  drizzle: {
    id: 'drizzle', name: 'Drizzle', icon: '🌧️',
    description: 'TypeScript ORM with SQL-like API',
    color: 'from-emerald-500 to-teal-600',
    category: 'service',
    finalProjectDescription: 'Build type-safe database queries with Drizzle\'s SQL-like API and schema management',
  },
  firebase: {
    id: 'firebase', name: 'Firebase', icon: '🔥',
    description: 'Google\'s app development platform',
    color: 'from-amber-500 to-orange-600',
    category: 'service',
    finalProjectDescription: 'Build serverless applications with Firebase\'s authentication, database, and cloud functions',
  },
  supabase: {
    id: 'supabase', name: 'Supabase', icon: '⚡',
    description: 'Open source Firebase alternative',
    color: 'from-emerald-500 to-green-600',
    category: 'service',
    finalProjectDescription: 'Create open-source backend solutions with Supabase\'s PostgreSQL, auth, and real-time features',
  },
  docker: {
    id: 'docker', name: 'Docker', icon: '🐳',
    description: 'Containerization platform',
    color: 'from-blue-500 to-cyan-600',
    category: 'service',
    finalProjectDescription: 'Package and deploy applications in portable Docker containers',
  },
  graphql: {
    id: 'graphql', name: 'GraphQL', icon: '◈',
    description: 'Query language for your API',
    color: 'from-pink-500 to-fuchsia-600',
    category: 'service',
    finalProjectDescription: 'Build flexible, type-safe APIs with GraphQL\'s query language and schema definition',
  },
  'shadcn-ui': {
    id: 'shadcn-ui', name: 'shadcn/ui', icon: '🎨',
    description: 'Beautifully designed component library for React',
    color: 'from-zinc-600 to-zinc-800',
    category: 'service',
    finalProjectDescription: 'Build accessible, beautiful React UIs with shadcn/ui\'s copy-paste component library',
  },
};

export const TECH_REGISTRY = REGISTRY;

export function getTechMeta(id: string): TechMeta | undefined {
  return REGISTRY[id];
}

export const ALL_FRONTEND_IDS = ['react', 'nextjs', 'svelte', 'vue', 'angular'];
export const ALL_BACKEND_IDS = ['express', 'fastify', 'nestjs', 'django', 'flask'];
export const ALL_DATABASE_IDS = ['postgresql', 'mongodb', 'mysql', 'sqlite', 'redis'];
export const ALL_SERVICE_IDS = ['prisma', 'drizzle', 'firebase', 'supabase', 'docker', 'graphql', 'shadcn-ui'];

// Maps folder-name segment → tech id (for parsing directory names).
// Database folders use shorthand (e.g. "postgres" instead of "postgresql").
// Multi-word techs like "shadcn-ui" are handled as a single token.
export const FOLDER_TO_TECH: Record<string, string> = {
  react: 'react',
  nextjs: 'nextjs',
  svelte: 'svelte',
  express: 'express',
  nestjs: 'nestjs',
  postgres: 'postgresql',
  mongodb: 'mongodb',
  prisma: 'prisma',
  // Multi-word techs normalized with underscore (handled in stack-scanner)
  shadcn_ui: 'shadcn-ui',
};

// Reverse of FOLDER_TO_TECH — maps tech id → folder-name segment.
// Used when constructing folder paths from stack selections.
export const TECH_TO_FOLDER: Record<string, string> = {
  react: 'react',
  nextjs: 'nextjs',
  svelte: 'svelte',
  express: 'express',
  nestjs: 'nestjs',
  postgresql: 'postgres',
  mongodb: 'mongodb',
  prisma: 'prisma',
  'shadcn-ui': 'shadcn_ui',
};

// Convert a compound stack slug (e.g. "nestjs-postgresql-prisma") to the
// corresponding folder name (e.g. "nestjs-postgres-prisma").
export function stackNameToFolder(stackName: string): string {
  return stackName.split('-').map(part => TECH_TO_FOLDER[part] || part).join('-');
}

export const MULTI_WORD_TECHS: Record<string, string> = {
  'shadcn-ui': 'shadcn_ui',
};
