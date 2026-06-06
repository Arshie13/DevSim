// src/lib/data/postassessmentConfigs.ts
//
// Each question carries a `bucket` — one of five shared skill keys used by BOTH
// the pretest and every post-test so pre/post improvement lines up per topic:
//
//   frontend     UI work: HTML/CSS, JS, React, Next.js pages, Tailwind, shadcn
//   backend      servers, routing, controllers, API routes, server actions, DI
//   database     Prisma schemas/migrations, Postgres modeling
//   integration  connecting frontend+backend, tracing data end-to-end
//   tooling      terminal/CLI, local env, running the stack
//
// Multiple questions in a stack can share a bucket; their scores are averaged
// into that bucket when stored (see postassessment +page.svelte / +server.ts).

export interface PostAssessmentQuestion {
  id: number;
  bucket: string;
  text: string;
}

export interface PostAssessmentTopic {
  id: string;
  name: string;
  concepts: string[];
}

export interface PostAssessmentConfig {
  title: string;
  questions: PostAssessmentQuestion[];
  topics?: PostAssessmentTopic[];
}

export const postAssessmentConfigs: Record<string, PostAssessmentConfig> = {
  "nextjs-postgres-prisma": {
    title: "Next.js + Postgres + Prisma Assessment",
    questions: [
      { id: 1, bucket: "frontend", text: "How well can you now structure pages and routes in a Next.js application?" },
      { id: 2, bucket: "frontend", text: "How would you rate your ability to build interactive UIs with React components inside Next.js?" },
      { id: 3, bucket: "database", text: "How comfortable are you now defining schemas and running migrations with Prisma?" },
      { id: 4, bucket: "database", text: "How well do you understand modeling relational data in PostgreSQL (tables, relations, indexes)?" },
      { id: 5, bucket: "backend", text: "How capable are you now in building backend logic using Next.js API routes or server actions?" },
      { id: 6, bucket: "integration", text: "How well can you trace data end-to-end — from a Postgres table, through Prisma, to a Next.js page?" },
      { id: 7, bucket: "tooling", text: "How comfortable are you running a Next.js + Prisma stack locally, including environment variables, migrations, and seeds?" },
    ],
  },
  "react-express-postgres-prisma": {
    title: "React + Express + Postgres + Prisma Assessment",
    questions: [
      { id: 1, bucket: "frontend", text: "How would you rate your ability to build interactive UIs with React components and hooks?" },
      { id: 2, bucket: "backend", text: "How well can you now design Express routes, middleware, and controllers?" },
      { id: 3, bucket: "database", text: "How comfortable are you now defining schemas and running migrations with Prisma?" },
      { id: 4, bucket: "database", text: "How well do you understand modeling relational data in PostgreSQL (tables, relations, indexes)?" },
      { id: 5, bucket: "integration", text: "How capable are you now in connecting a React frontend to an Express backend via REST (fetch/Axios)?" },
      { id: 6, bucket: "integration", text: "How well can you trace data end-to-end — from a Postgres table, through Prisma and Express, to the React UI?" },
      { id: 7, bucket: "tooling", text: "How comfortable are you running this stack locally, including environment variables, migrations, and seeds?" },
    ],
  },
  "react-express-mongodb": {
    title: "React + Express + MongoDB Assessment",
    questions: [
      { id: 1, bucket: "frontend", text: "How would you rate your ability to build interactive UIs with React components and hooks?" },
      { id: 2, bucket: "backend", text: "How well can you now design Express routes, middleware, and controllers?" },
      { id: 3, bucket: "database", text: "How comfortable are you now defining Mongoose schemas and models for MongoDB?" },
      { id: 4, bucket: "database", text: "How well do you understand modeling document data in MongoDB (collections, embedded vs. referenced documents, indexes)?" },
      { id: 5, bucket: "integration", text: "How capable are you now in connecting a React frontend to an Express backend via REST (fetch/Axios)?" },
      { id: 6, bucket: "integration", text: "How well can you trace data end-to-end — from a MongoDB collection, through Mongoose and Express, to the React UI?" },
      { id: 7, bucket: "tooling", text: "How comfortable are you running this stack locally, including environment variables, a MongoDB connection, and seeding data?" },
    ],
    topics: [
      { id: "level1", name: "Level 1: Environment Setup", concepts: ["The MERN stack (MongoDB, Express, React, Node)", "npm workspaces & package roots", "Environment variables & .env (MONGO_URI)", "Connecting to a MongoDB instance", "Seeding documents with Mongoose models", "Editing React layout components"] },
      { id: "level2", name: "Level 2: Client-Side Features", concepts: ["Building reusable React components", "Props & component composition", "Controlled inputs & live search filtering", "Deriving state from data", "Conditional rendering", "Tailwind utility styling"] },
      { id: "level3", name: "Level 3: Backend & Aggregation", concepts: ["Designing Express routes & controllers", "MongoDB aggregation pipelines", "Querying with Mongoose", "Shaping JSON API responses", "Tracing a data flow end-to-end", "Reading server logs"] },
      { id: "level4", name: "Level 4: Full-Stack Feature", concepts: ["Building a feature end-to-end", "Modeling relationships (references vs. embedding)", "Creating a Mongoose model & API endpoint", "The client service / fetch layer", "Optimistic UI updates", "Error handling across the stack"] },
      { id: "level5", name: "Level 5: Production Debugging", concepts: ["Debugging a production bug", "Unique indexes & preventing duplicate documents", "Keeping denormalized counters consistent", "UTC & timezone boundaries", "Writing regression tests", "Writing a postmortem"] },
    ],
  },
  "nextjs-shadcn-ui": {
    title: "Next.js + shadcn/ui Assessment",
    questions: [
      { id: 1, bucket: "frontend", text: "How well can you now structure pages and routes in a Next.js application?" },
      { id: 2, bucket: "frontend", text: "How would you rate your ability to compose React components in a Next.js project?" },
      { id: 3, bucket: "frontend", text: "How comfortable are you installing and customizing shadcn/ui components?" },
      { id: 4, bucket: "frontend", text: "How well can you now style components with Tailwind CSS utility classes?" },
      { id: 5, bucket: "frontend", text: "How capable are you now in theming a shadcn/ui app (design tokens, dark mode)?" },
      { id: 6, bucket: "frontend", text: "How well do you understand the accessibility patterns shadcn/ui inherits from Radix primitives?" },
      { id: 7, bucket: "tooling", text: "How comfortable are you running and iterating on a Next.js + shadcn/ui project locally?" },
    ],
  },
  "nestjs-postgres-prisma": {
    title: "NestJS + Postgres + Prisma Assessment",
    questions: [
      { id: 1, bucket: "backend", text: "How well can you now structure a NestJS app using modules, controllers, and providers?" },
      { id: 2, bucket: "backend", text: "How comfortable are you with NestJS dependency injection?" },
      { id: 3, bucket: "database", text: "How comfortable are you now defining schemas and running migrations with Prisma?" },
      { id: 4, bucket: "database", text: "How well do you understand modeling relational data in PostgreSQL (tables, relations, indexes)?" },
      { id: 5, bucket: "backend", text: "How capable are you now in building REST endpoints in NestJS that talk to a Prisma data layer?" },
      { id: 6, bucket: "integration", text: "How well can you trace data end-to-end — from a Postgres table, through Prisma, to a NestJS response?" },
      { id: 7, bucket: "tooling", text: "How comfortable are you running a NestJS + Prisma stack locally, including environment variables, migrations, and seeds?" },
    ],
    topics: [
      { id: "level1", name: "Level 1: Environment Setup", concepts: ["NestJS modules, controllers & providers", "Dependency injection", "Environment variables & .env", "Prisma migrate, generate & seed", "Extending the Prisma schema", "Running the Nest dev server"] },
      { id: "level2", name: "Level 2: Filtering & Service Logic", concepts: ["Query parameters & DTOs", "Pagination response shapes", "Composable filters in a service", "Soft-delete / active-record patterns", "Validating references belong to the user", "Fixing a service-layer bug"] },
      { id: "level3", name: "Level 3: Validation & Transactions", concepts: ["Input validation & guards", "Atomic writes with Prisma $transaction", "Deriving balances from data", "Enforcing business rules", "Descriptive error responses", "Budget-vs-actual calculations"] },
      { id: "level4", name: "Level 4: Reporting & Analytics", concepts: ["Aggregating time-series data", "Grouping & bucketing by month", "Computing percentages & breakdowns", "Sorting & ranking results", "Threshold-based alerts", "Designing report endpoints"] },
      { id: "level5", name: "Level 5: Production Debugging", concepts: ["Diagnosing a production incident", "Pessimistic locking & race conditions", "UTC & timezone boundaries", "Guarding against divide-by-zero (NaN/Infinity)", "Rounding money correctly", "Writing a postmortem"] },
    ],
  },
  "default": {
    title: "General Post Assessment",
    questions: [
      { id: 1, bucket: "frontend", text: "How would you rate your current skills in HTML and CSS for creating web page layouts?" },
      { id: 2, bucket: "frontend", text: "How well can you now use JavaScript to add interactivity to web pages?" },
      { id: 3, bucket: "backend", text: "How much do you know now about backend development concepts such as servers, routing, and middleware?" },
      { id: 4, bucket: "database", text: "How well do you understand databases and how data is stored and retrieved in web applications?" },
      { id: 5, bucket: "integration", text: "How capable are you now in making frontend and backend systems work together?" },
      { id: 6, bucket: "integration", text: "How strong is your understanding of APIs and how they are used to exchange data between systems?" },
      { id: 7, bucket: "tooling", text: "How comfortable are you now using the terminal or command line to run commands and manage files?" },
    ],
  },
};

/**
 * Normalize a stack identifier into a `postAssessmentConfigs` key.
 *
 * Handles the two slug differences between how stacks are stored and how the
 * configs are keyed:
 *   - a trailing scenario number ("react-express-mongodb-1" → "react-express-mongodb")
 *   - the raw "postgresql" slug vs. the config's "postgres" ("…-postgresql-…" → "…-postgres-…")
 *
 * Note: a generic id like "scenario-1" normalizes to "scenario", which is not a
 * config key — callers should treat a missing config as "not this source" and
 * fall back (e.g. to the workspace stack slug).
 */
export function resolveConfigKey(stackName: string): string {
  return stackName.replace(/-\d+$/, "").replace(/\bpostgresql\b/g, "postgres");
}

/** Returns the post-assessment config for a stack identifier, or the default. */
export function getPostAssessmentConfig(stackName: string): PostAssessmentConfig {
  return postAssessmentConfigs[resolveConfigKey(stackName)] ?? postAssessmentConfigs.default;
}

/**
 * Pick the stack identifier that should drive the post-assessment, from a priority
 * list of candidates (e.g. [scenario.id, workspace stack slug]). Returns the first
 * candidate that maps to a real config, else the fallback.
 *
 * This is what lets a generic scenario id like "scenario-1" (which resolves to the
 * non-config key "scenario") fall through to the workspace stack the user actually
 * chose, instead of silently landing on the default screen.
 */
export function selectStackForConfig(
  candidates: Array<string | null | undefined>,
  fallback = "react-express-postgres-prisma",
): string {
  return (
    candidates.find((s): s is string => !!s && !!postAssessmentConfigs[resolveConfigKey(s)]) ??
    fallback
  );
}
