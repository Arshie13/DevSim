// ── Stack-specific onboarding content ──────────────────────────────────────

export interface StackContent {
  stackName: string;
  tagline: string;
  realWorldUse: string;
  missionIntro: string;
  successLabel: string;
  icon: string;
  accentColor: string;
}

const STACK_MAP: Record<string, StackContent> = {
  'nextjs-prisma': {
    stackName: 'Next.js + Prisma',
    tagline: 'Full-stack React with a type-safe database layer',
    realWorldUse:
      'Next.js powers apps at Netflix, TikTok, and Vercel itself. Prisma brings fully-typed database queries — no raw SQL, no runtime surprises.',
    missionIntro:
      "You're stepping into a real development sprint. Read the tasks, write the code, and submit when done.",
    successLabel: 'A working API route that reads real data from a PostgreSQL database.',
    icon: '▲',
    accentColor: '#07a5c9',
  },
  'react-express': {
    stackName: 'React + Express',
    tagline: 'Classic React frontend paired with an Express REST API',
    realWorldUse:
      'This combo ships production apps at Airbnb, Uber, and LinkedIn — one of the most battle-tested full-stack setups.',
    missionIntro: "You're building a real feature — frontend and backend working together.",
    successLabel: 'A React UI that fetches and displays data from your own Express API.',
    icon: '⚛',
    accentColor: '#61dafb',
  },
  'nestjs-postgres': {
    stackName: 'NestJS + PostgreSQL',
    tagline: 'Enterprise-grade Node.js backend with TypeScript',
    realWorldUse:
      'NestJS is trusted at Roche, Adidas, and Capgemini for scalable, maintainable microservices.',
    missionIntro: "You're building a structured, production-ready REST API from scratch.",
    successLabel: 'A NestJS module with controller, service, and working database integration.',
    icon: '🐈',
    accentColor: '#e0234e',
  },
  'nextjs-shadcn': {
    stackName: 'Next.js + shadcn/ui',
    tagline: 'Next.js with a beautifully accessible component library',
    realWorldUse:
      'shadcn/ui has rapidly become the standard UI toolkit for Next.js apps in production — accessible, composable, and customizable.',
    missionIntro: "You're building a polished UI using accessible, composable components.",
    successLabel: 'A pixel-perfect, accessible page built with shadcn/ui components.',
    icon: '◈',
    accentColor: '#ffffff',
  },
  'react-express-postgres': {
    stackName: 'React + Express + PostgreSQL',
    tagline: 'Full-stack CRUD app with a relational database',
    realWorldUse:
      'A tried-and-true architecture used by thousands of production apps worldwide — from startups to Fortune 500 companies.',
    missionIntro: "You're building end-to-end: from database schema all the way to the React UI.",
    successLabel: 'A working CRUD feature connecting React, Express, and PostgreSQL.',
    icon: '⚡',
    accentColor: '#07a5c9',
  },
  'nextjs-postgres-supabase': {
    stackName: 'Next.js + Supabase',
    tagline: 'Serverless full-stack with a managed Postgres backend',
    realWorldUse:
      'Supabase gives you a real Postgres database, auth, and storage — used by thousands of production apps worldwide.',
    missionIntro: "You're building a modern full-stack app powered by Supabase and Next.js.",
    successLabel: 'A live Next.js app reading and writing data through Supabase.',
    icon: '▲',
    accentColor: '#3ecf8e',
  },
};

function normalizeStackKey(stack: string): string {
  const s = stack.toLowerCase().replace(/[\s·]/g, '-').replace(/\++/g, '-').replace(/-+/g, '-');
  if (s.includes('next') && (s.includes('prisma') || s.includes('postgres')) && !s.includes('supabase')) return 'nextjs-prisma';
  if (s.includes('next') && s.includes('shadcn')) return 'nextjs-shadcn';
  if (s.includes('next') && s.includes('supabase')) return 'nextjs-postgres-supabase';
  if (s.includes('nest') && (s.includes('postgres') || s.includes('mysql'))) return 'nestjs-postgres';
  if (s.includes('react') && s.includes('express') && s.includes('postgres')) return 'react-express-postgres';
  if (s.includes('react') && s.includes('express')) return 'react-express';
  if (s.includes('next')) return 'nextjs-prisma';
  return 'nextjs-prisma';
}

export function getStackContent(stack: string): StackContent {
  const key = normalizeStackKey(stack);
  return (
    STACK_MAP[key] ?? {
      stackName: stack,
      tagline: `Real-world ${stack} simulation`,
      realWorldUse: `${stack} powers production applications at leading companies worldwide.`,
      missionIntro: "You're stepping into a real development sprint.",
      successLabel: 'A working implementation that completes all the sprint tasks.',
      icon: '⚡',
      accentColor: '#07a5c9',
    }
  );
}

// ── Tour step definitions ──────────────────────────────────────────────────

export interface TourStep {
  id: string;
  title: string;
  description: string;
  /** Matches the value of the data-tour attribute on the target DOM element. */
  target: string;
  /**
   * Which side the callout should appear on relative to the target.
   * 'right'  → callout to LEFT of target, arrow points right
   * 'left'   → callout to RIGHT of target, arrow points left
   * 'top'    → callout BELOW target, arrow points up
   * 'bottom' → callout ABOVE target, arrow points down
   * Defaults to 'auto' (pick side with most space).
   */
  preferSide?: 'auto' | 'top' | 'bottom' | 'left' | 'right';
  /** If set, the tour will request a tab switch to this value before measuring. */
  switchTab?: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'sidebar',
    title: 'File Explorer',
    description:
      'Browse and manage your project files here. Click any file to open it in the editor, or right-click for more options.',
    target: 'sidebar',
  },
  {
    id: 'workspace-tabs',
    title: 'View Switcher',
    description:
      'Toggle between the Code Editor, Terminal, and Live Preview using these tabs.',
    target: 'workspace-tabs',
  },
  {
    id: 'editor-area',
    title: 'Code Editor',
    description:
      'Write and edit your code here. Full IntelliSense, syntax highlighting, and Ctrl+S to save.',
    target: 'editor-area',
    switchTab: 'editor',
    preferSide: 'top',
  },
  {
    id: 'ai-toggle',
    title: 'AI Hints',
    description:
      "Stuck on a task? Click this button to open AI-powered hints tailored to your current sprint.",
    target: 'ai-toggle',
    preferSide: 'top',
  },
];
