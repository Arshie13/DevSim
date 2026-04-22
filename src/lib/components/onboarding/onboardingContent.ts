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
      'A practical stack for shipping web apps with modern routing and typed database queries.',
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
      'A proven setup for building and iterating quickly across frontend and backend.',
    missionIntro: "You're building a real feature — frontend and backend working together.",
    successLabel: 'A React UI that fetches and displays data from your own Express API.',
    icon: '⚛',
    accentColor: '#61dafb',
  },
  'nestjs-postgres': {
    stackName: 'NestJS + PostgreSQL',
    tagline: 'Enterprise-grade Node.js backend with TypeScript',
    realWorldUse:
      'Great for structured APIs, service modules, and long-term maintainability.',
    missionIntro: "You're building a structured, production-ready REST API from scratch.",
    successLabel: 'A NestJS module with controller, service, and working database integration.',
    icon: '🐈',
    accentColor: '#e0234e',
  },
  'nextjs-shadcn': {
    stackName: 'Next.js + shadcn/ui',
    tagline: 'Next.js with a beautifully accessible component library',
    realWorldUse:
      'Focused on building polished, accessible interfaces with reusable components.',
    missionIntro: "You're building a polished UI using accessible, composable components.",
    successLabel: 'A pixel-perfect, accessible page built with shadcn/ui components.',
    icon: '◈',
    accentColor: '#ffffff',
  },
  'react-express-postgres': {
    stackName: 'React + Express + PostgreSQL',
    tagline: 'Full-stack CRUD app with a relational database',
    realWorldUse:
      'A practical architecture for production-style CRUD features and relational data workflows.',
    missionIntro: "You're building end-to-end: from database schema all the way to the React UI.",
    successLabel: 'A working CRUD feature connecting React, Express, and PostgreSQL.',
    icon: '⚡',
    accentColor: '#07a5c9',
  },
  'nextjs-postgres-supabase': {
    stackName: 'Next.js + Supabase',
    tagline: 'Serverless full-stack with a managed Postgres backend',
    realWorldUse:
      'Useful for rapid full-stack development with database, auth, and storage in one platform.',
    missionIntro: "You're building a modern full-stack app powered by Supabase and Next.js.",
    successLabel: 'A live Next.js app reading and writing data through Supabase.',
    icon: '▲',
    accentColor: '#3ecf8e',
  },
  pern: {
    stackName: 'PERN',
    tagline: 'PostgreSQL + Express + React + Node.js',
    realWorldUse:
      'A common full-stack JavaScript architecture for APIs, relational data, and modern web UI.',
    missionIntro: "You're building across database, API, and frontend in one sprint.",
    successLabel: 'A working feature implemented end-to-end across the PERN stack.',
    icon: '⚙',
    accentColor: '#00c2ff',
  },
};

export function getStackKey(stack: string): string {
  const s = stack.toLowerCase().replace(/[\s·]/g, '-').replace(/\++/g, '-').replace(/-+/g, '-');
  if (s.includes('next') && (s.includes('prisma') || s.includes('postgres')) && !s.includes('supabase')) return 'nextjs-prisma';
  if (s.includes('next') && s.includes('shadcn')) return 'nextjs-shadcn';
  if (s.includes('next') && s.includes('supabase')) return 'nextjs-postgres-supabase';
  if (s.includes('pern') || (s.includes('postgres') && s.includes('express') && s.includes('react') && s.includes('node'))) return 'pern';
  if (s.includes('nest') && (s.includes('postgres') || s.includes('mysql'))) return 'nestjs-postgres';
  if (s.includes('react') && s.includes('express') && s.includes('postgres')) return 'react-express-postgres';
  if (s.includes('react') && s.includes('express')) return 'react-express';
  if (s.includes('next')) return 'nextjs-prisma';
  return 'generic';
}

export function getStackContent(stack: string): StackContent {
  const key = getStackKey(stack);
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
  /** If set, the tour will request a BoardPanel sub-tab switch before measuring. */
  boardSubTab?: 'scenario' | 'board';
  /** If true, the tour requests BoardPanel to open the first task modal. */
  openBoardTaskModal?: boolean;
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
      'Toggle between the Code Editor, Terminal, Live Preview, and Board views here. Each view gives you different tools to work with your code and project.',
    target: 'workspace-tabs',
  },
  {
    id: 'workspace-action-buttons',
    title: 'Run, Demo, And Test',
    description:
      'Use these action buttons during development: Run starts your app, Demo opens preview, and Test validates your tasks.',
    target: 'workspace-action-buttons',
    preferSide: 'bottom',
  },
    {
    id: 'editor-area',
    title: 'Code Editor',
    description:
      'Write and edit your code here. The highlighted area includes the Editor tab button and the editing pane.',
    target: 'editor-workspace',
    switchTab: 'editor',
    preferSide: 'top',
  },
  {
    id: 'board-panel',
    title: 'Board Workspace',
    description:
      'This board keeps sprint context and task progress in one place. You will use it for both planning and execution.',
    target: 'board-panel',
    switchTab: 'board',
    preferSide: 'top',
  },
  {
    id: 'board-sections',
    title: 'Scenario And Kanban Sections',
    description:
      'The board is split into two sections: Scenario shows the sprint brief and backlog summary, while Kanban shows drag-and-drop task flow.',
    target: 'board-subtab-toggle',
    switchTab: 'board',
    boardSubTab: 'scenario',
    preferSide: 'bottom',
  },
  {
    id: 'board-kanban',
    title: 'Kanban Flow',
    description:
      'This is the Kanban section. Move tasks between Backlog, In Progress, In Review, and Done as work advances.',
    target: 'board-kanban-lanes',
    switchTab: 'board',
    boardSubTab: 'board',
    preferSide: 'top',
  },
  {
    id: 'board-ticket',
    title: 'Task Tickets',
    description:
      'Each task card is clickable. Open a ticket to inspect the user story and implementation details before coding.',
    target: 'board-task-ticket',
    switchTab: 'board',
    boardSubTab: 'board',
    preferSide: 'left',
  },
  {
    id: 'board-ac',
    title: 'Acceptance Criteria',
    description:
      'In the task modal, review acceptance criteria to verify exactly what must be delivered for this task.',
    target: 'board-task-ac',
    switchTab: 'board',
    boardSubTab: 'board',
    openBoardTaskModal: true,
    preferSide: 'left',
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
