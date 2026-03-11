import type { TechCategory, TechOption, StackSelection } from "$types";

// Mix-and-match technology options
export const FRONTEND_OPTIONS: TechOption[] = [
  {
    id: "react",
    name: "React",
    icon: "⚛️",
    description: "A JavaScript library for building user interfaces",
    color: "from-cyan-500 to-blue-600",
  },
  {
    id: "nextjs",
    name: "Next.js",
    icon: "▲",
    description: "The React framework for production",
    color: "from-zinc-700 to-zinc-900",
  },
  {
    id: "vue",
    name: "Vue.js",
    icon: "💚",
    description: "The progressive JavaScript framework",
    color: "from-emerald-500 to-green-600",
  },
  {
    id: "svelte",
    name: "Svelte",
    icon: "🔥",
    description: "Cybernetically enhanced web apps",
    color: "from-orange-500 to-red-600",
  },
  {
    id: "angular",
    name: "Angular",
    icon: "🅰️",
    description: "Platform for building mobile and desktop apps",
    color: "from-red-500 to-pink-600",
  },
];

export const BACKEND_OPTIONS: TechOption[] = [
  {
    id: "express",
    name: "Express.js",
    icon: "🚂",
    description: "Fast, unopinionated web framework for Node.js",
    color: "from-zinc-600 to-zinc-800",
  },
  {
    id: "fastify",
    name: "Fastify",
    icon: "⚡",
    description: "Fast and low overhead web framework",
    color: "from-zinc-500 to-zinc-700",
  },
  {
    id: "nestjs",
    name: "NestJS",
    icon: "🐈",
    description: "Progressive Node.js framework",
    color: "from-red-600 to-pink-700",
  },
  {
    id: "django",
    name: "Django",
    icon: "🐍",
    description: "High-level Python web framework",
    color: "from-green-700 to-emerald-800",
  },
  {
    id: "flask",
    name: "Flask",
    icon: "🧪",
    description: "Lightweight WSGI web application framework",
    color: "from-zinc-600 to-zinc-800",
  },
];

export const DATABASE_OPTIONS: TechOption[] = [
  {
    id: "postgresql",
    name: "PostgreSQL",
    icon: "🐘",
    description: "Advanced open-source relational database",
    color: "from-blue-600 to-indigo-700",
  },
  {
    id: "mongodb",
    name: "MongoDB",
    icon: "🍃",
    description: "Document-oriented NoSQL database",
    color: "from-green-600 to-emerald-700",
  },
  {
    id: "mysql",
    name: "MySQL",
    icon: "🐬",
    description: "World's most popular open source database",
    color: "from-orange-500 to-amber-600",
  },
  {
    id: "sqlite",
    name: "SQLite",
    icon: "📦",
    description: "Self-contained SQL database engine",
    color: "from-sky-500 to-blue-600",
  },
  {
    id: "redis",
    name: "Redis",
    icon: "🔴",
    description: "In-memory data structure store",
    color: "from-red-600 to-rose-700",
  },
];

export const SERVICES_OPTIONS: TechOption[] = [
  {
    id: "prisma",
    name: "Prisma",
    icon: "◮",
    description: "Next-generation Node.js and TypeScript ORM",
    color: "from-indigo-600 to-purple-700",
  },
  {
    id: "firebase",
    name: "Firebase",
    icon: "🔥",
    description: "Google's app development platform",
    color: "from-amber-500 to-orange-600",
  },
  {
    id: "supabase",
    name: "Supabase",
    icon: "⚡",
    description: "Open source Firebase alternative",
    color: "from-emerald-500 to-green-600",
  },
  {
    id: "docker",
    name: "Docker",
    icon: "🐳",
    description: "Containerization platform",
    color: "from-blue-500 to-cyan-600",
  },
  {
    id: "graphql",
    name: "GraphQL",
    icon: "◈",
    description: "Query language for your API",
    color: "from-pink-500 to-fuchsia-600",
  },
  {
    id: "shadcn-ui",
    name: "shadcn/ui",
    icon: "🎨",
    description: "Beautifully designed component library for React",
    color: "from-zinc-600 to-zinc-800",
  },
];

export const TECH_CATEGORIES: TechCategory[] = [
  {
    id: "frontend",
    name: "Frontend",
    description: "Choose your UI framework",
    icon: "🎨",
    options: FRONTEND_OPTIONS,
  },
  {
    id: "backend",
    name: "Backend",
    description: "Choose your server framework",
    icon: "⚙️",
    options: BACKEND_OPTIONS,
  },
  {
    id: "database",
    name: "Database",
    description: "Choose your data storage",
    icon: "🗄️",
    options: DATABASE_OPTIONS,
  },
  {
    id: "services",
    name: "Services",
    description: "Choose additional tools",
    icon: "🔧",
    options: SERVICES_OPTIONS,
  },
];

// Predefined popular combinations (optional presets)
export const POPULAR_COMBOS: StackSelection[] = [
  {
    id: "pern",
    name: "PERN Stack",
    frontend: "react",
    backend: "express",
    database: "postgresql",
    services: "prisma",
  },
  {
    id: "next-supabase",
    name: "Next.js + Supabase",
    frontend: "nextjs",
    backend: null,
    database: "postgresql",
    services: "supabase",
  },
  {
    id: "nestjs-postgres-prisma",
    name: "NestJS + PostgreSQL",
    frontend: null,
    backend: "nestjs",
    database: "postgresql",
    services: "prisma",
  },
  {
    id: "nextjs-shadcn-ui",
    name: "Next.js + shadcn/ui",
    frontend: "nextjs",
    backend: null,
    database: null,
    services: "shadcn-ui",
  },
];
