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
