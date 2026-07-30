import type { TechCategory, TechOption, StackSelection } from "$types";

const DEFAULT_PREVIEW_IMAGES = ["/images/DevSim.svg"];

// Technology options for stack selection
export const FRONTEND_OPTIONS: TechOption[] = [
  {
    id: "react",
    name: "React",
    icon: "⚛️",
    description: "A JavaScript library for building user interfaces",
    color: "from-cyan-500 to-blue-600",
    previewImages: DEFAULT_PREVIEW_IMAGES,
    finalProjectDescription: "Build interactive user interfaces, single-page applications, and component-based UI systems",
    prerequisites: [
      "HTML & CSS fundamentals",
      "JavaScript ES6+ (arrow functions, destructuring, modules)",
      "DOM manipulation basics",
      "Basic understanding of how the web works (HTTP, client-server model)",
    ],
  },
  {
    id: "nextjs",
    name: "Next.js",
    icon: "▲",
    description: "The React framework for production",
    color: "from-zinc-700 to-zinc-900",
    previewImages: DEFAULT_PREVIEW_IMAGES,
    finalProjectDescription: "Create full-stack web applications with server-side rendering, API routes, and optimized routing",
    prerequisites: [
      "React fundamentals (components, props, state, hooks)",
      "JavaScript ES6+ and async/await",
      "Basic Node.js and npm/yarn knowledge",
      "Understanding of client-side vs server-side rendering",
    ],
  },
  {
    id: "svelte",
    name: "Svelte",
    icon: "🔥",
    description: "Cybernetically enhanced web apps",
    color: "from-orange-500 to-red-600",
    previewImages: DEFAULT_PREVIEW_IMAGES,
    finalProjectDescription: "Create high-performance web apps with Svelte's compiler-based approach and reactive stores",
    prerequisites: [
      "HTML & CSS fundamentals",
      "JavaScript ES6+ basics",
      "Basic understanding of reactivity and state management",
      "Familiarity with component-based architecture",
    ],
  },
];

export const BACKEND_OPTIONS: TechOption[] = [
  {
    id: "express",
    name: "Express.js",
    icon: "🚂",
    description: "Fast, unopinionated web framework for Node.js",
    color: "from-zinc-600 to-zinc-800",
    previewImages: DEFAULT_PREVIEW_IMAGES,
    finalProjectDescription: "Build RESTful APIs and server-side applications with Node.js and Express middleware",
    prerequisites: [
      "JavaScript ES6+ (callbacks, promises, async/await)",
      "Node.js fundamentals (modules, npm, file system)",
      "HTTP protocol basics (methods, status codes, headers)",
      "Basic understanding of REST API concepts",
    ],
  },
  {
    id: "nestjs",
    name: "NestJS",
    icon: "🐈",
    description: "Progressive Node.js framework",
    color: "from-red-600 to-pink-700",
    previewImages: DEFAULT_PREVIEW_IMAGES,
    finalProjectDescription: "Build scalable, testable enterprise applications with NestJS's modular architecture",
    prerequisites: [
      "TypeScript fundamentals (types, decorators, classes)",
      "JavaScript ES6+ and Node.js basics",
      "Understanding of dependency injection and modular architecture",
      "Basic knowledge of Express.js (NestJS is built on Express)",
    ],
  },
];

export const DATABASE_OPTIONS: TechOption[] = [
  {
    id: "postgresql",
    name: "PostgreSQL",
    icon: "🐘",
    description: "Advanced open-source relational database",
    color: "from-blue-600 to-indigo-700",
    previewImages: DEFAULT_PREVIEW_IMAGES,
    finalProjectDescription: "Design and manage relational data with PostgreSQL's advanced features and SQL capabilities",
    prerequisites: [
      "SQL fundamentals (SELECT, INSERT, UPDATE, DELETE, JOIN)",
      "Understanding of relational database concepts (tables, keys, relationships)",
      "Basic data modeling and normalization principles",
      "Familiarity with database clients (pgAdmin, DBeaver, or psql CLI)",
    ],
  },
  {
    id: "mongodb",
    name: "MongoDB",
    icon: "🍃",
    description: "Document-oriented NoSQL database",
    color: "from-green-600 to-emerald-700",
    previewImages: DEFAULT_PREVIEW_IMAGES,
    finalProjectDescription: "Store and query flexible JSON-like documents with MongoDB's document model",
    prerequisites: [
      "JSON fundamentals (objects, arrays, nested structures)",
      "Basic understanding of NoSQL concepts vs relational databases",
      "JavaScript basics (MongoDB uses JSON-like BSON documents)",
      "Understanding of when to use document-based storage",
    ],
  },
];

export const SERVICES_OPTIONS: TechOption[] = [
  {
    id: "prisma",
    name: "Prisma",
    icon: "◮",
    description: "Next-generation Node.js and TypeScript ORM",
    color: "from-indigo-600 to-purple-700",
    previewImages: DEFAULT_PREVIEW_IMAGES,
    finalProjectDescription: "Type-safely query and manage your database with Prisma's modern ORM approach",
    prerequisites: [
      "TypeScript or JavaScript fundamentals",
      "Basic understanding of ORM concepts",
      "SQL basics (Prisma generates SQL queries)",
      "Node.js and npm/yarn familiarity",
    ],
  },
  {
    id: "docker",
    name: "Docker",
    icon: "🐳",
    description: "Containerization platform",
    color: "from-blue-500 to-cyan-600",
    previewImages: DEFAULT_PREVIEW_IMAGES,
    finalProjectDescription: "Package and deploy applications in portable Docker containers",
    prerequisites: [
      "Command line basics (terminal, bash, PowerShell)",
      "Basic understanding of virtualization concepts",
      "Familiarity with application deployment concepts",
      "Understanding of processes and ports",
    ],
  },
  {
    id: "shadcn-ui",
    name: "shadcn/ui",
    icon: "🎨",
    description: "Beautifully designed component library for React",
    color: "from-zinc-600 to-zinc-800",
    previewImages: DEFAULT_PREVIEW_IMAGES,
    finalProjectDescription: "Build accessible, beautiful React UIs with shadcn/ui's copy-paste component library",
    prerequisites: [
      "React fundamentals (components, props, state, hooks)",
      "TypeScript basics (shadcn/ui is TypeScript-first)",
      "Understanding of component composition",
      "Basic CSS/Tailwind CSS familiarity",
    ],
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
    stackType: "fullstack",
    frontend: "react",
    backend: "express",
    database: "postgresql",
    services: "prisma",
  },
  {
    id: "nextjs-postgres-prisma",
    name: "Next.js + PostgreSQL + Prisma",
    stackType: "fullstack",
    frontend: "nextjs",
    backend: null,
    database: "postgresql",
    services: "prisma",
  },
  {
    id: "nestjs-postgres-prisma",
    name: "NestJS + PostgreSQL + Prisma",
    stackType: "backend",
    frontend: null,
    backend: "nestjs",
    database: "postgresql",
    services: "prisma",
  },
  {
    id: "nextjs-shadcn-ui",
    name: "Next.js + shadcn/ui",
    stackType: "frontend",
    frontend: "nextjs",
    backend: null,
    database: null,
    services: "shadcn-ui",
  },
  {
    id: "mern",
    name: "MERN Stack",
    stackType: "fullstack",
    frontend: "react",
    backend: "express",
    database: "mongodb",
    services: null,
  },
];
