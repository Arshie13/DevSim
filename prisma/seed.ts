/**
 * Prisma Seed Script
 *
 * Seeds the database with Level and Scenario data for learning DevOps and full-stack development.
 *
 * Usage:
 *   npx tsx prisma/seed.ts
 *
 * Make sure to run `npx prisma generate` first to generate the client.
 *
 * Task type values:
 *   "client" — only a client-side test exists
 *   "server" — only a server-side test exists
 *   "both"   — both client and server tests exist
 *   "none"   — no automated test (setup/manual tasks)
 */

// @ts-ignore - Prisma client path
import { PrismaClient } from "$prismaclient";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? "",
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting database seed...\n");

  // Clear existing data
  await prisma.completedTask.deleteMany();
  await prisma.containerStack.deleteMany();
  await prisma.userFileChanges.deleteMany();
  await prisma.container.deleteMany();
  await prisma.acceptanceCriteria.deleteMany();
  await prisma.hint.deleteMany();
  await prisma.learningSection.deleteMany();
  await prisma.levelTask.deleteMany();
  await prisma.level.deleteMany();
  await prisma.scenario.deleteMany();

  console.log("🗑️  Cleared existing data\n");

  // Define scenarios for each tech stack
  const scenarios = [
    {
      id: "scenario-1",
      name: "BookWise Library Management System",
      description:
        "Build a full-featured web-based Library Management System to manage books, members, and borrowing workflows using React, Express, PostgreSQL, and Prisma.",
      difficulty: "expert",
    },
  ];

  // Define levels with progressive difficulty
  const levels = [
    {
      id: "level-1",
      title: "Getting Familiar with the Codebase",
      subtitle:
        "Set up the development environment and make a minor UI change.",
      order: 1,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      levelDescription:
        "Mission Briefing: The library has onboarded a new developer and needs the system running locally. Set up the PERN (Postgres, Express, React, NodeJs) stack, configure the database, and make minor UI tweaks to get the application running properly in your local machine.",
      xpReward: 100,
      coinReward: 50,
      keyTakeaways:
        "Mastering React + Express + PostgreSQL + Prisma development environments requires understanding package management (npm/pnpm), environment variables for securing database connections, and Prisma migrations to keep PostgreSQL schemas synchronized. This setup ensures consistent development across team members and reliable deployments. Every React frontend with Express backend and Prisma + PostgreSQL database starts with this crucial foundation.\n\nReact component props enable parent-to-child data flow, creating dynamic UIs that display data from Express APIs. Understanding component hierarchy and prop passing is essential for building maintainable React applications that consume Prisma-fetched PostgreSQL data. This component architecture is fundamental to all React applications integrated with Express backends.",
      scenarioId: "scenario-1",
      tasks: {
        create: [
          {
            taskName: "Prepare Development Environment",
            testType: "client",
            userStory:
              "As a developer, I want to set up my development environment so that I can start working on the project.",
            learningSections: {
              create: [
                { title: "Overview\nSetting Up a PERN Stack Project", content: "This section introduces the crash course for preparing a PERN stack development environment. It provides a high-level view of the setup flow, required tools, and key concepts you need before starting the hands-on tasks.", order: 1 },
                { title: "What is the PERN Stack?", content: "PERN stands for PostgreSQL, Express, React, Node.js — four technologies that work together to build full-stack web apps.\n\nPostgreSQL — the database that stores your data\nExpress — a Node.js framework that handles your server and API routes\nReact — the frontend library that builds your user interface\nNode.js — the JavaScript runtime that runs your server code", order: 2 },
                { title: "How a PERN App is Structured", content: "A typical PERN project has three parts:\nroot/ ← workspace root (shared config, scripts)\n    ├── client/ ← React frontend\n    └── server/ ← Express backend\nEach part has its own package.json, which means you need to install dependencies in all three locations.", order: 3 },
                { title: "Package Management 101", content: "When you start a project, no dependencies are installed yet. You need to run npm install (or pnpm install) in each folder that has a package.json.\n\nWhy separate installs? Each folder is its own isolated module. The client uses React libraries, the server uses Express libraries — they don't share the same node_modules.", order: 4 },
                { title: "Change Directory (cd) Basics", content: "In development, you must run commands in the correct folder. Use cd (change directory) to move between root, client, and server before running installs or scripts.\n\nCommon commands:\ncd client → move into the frontend folder\ncd ../server → move from client to server\ncd .. → move up one folder\n\nAlways check your current location before running a command, because npm install and npm run commands affect the folder you are currently in.", order: 5 },
                {
                  title: "Practice Lab: cd Navigation",
                  content: "Practice navigating folders with cd. Use `ls` to list files/folders in your current directory and `pwd` to print your current path when you want to verify where you are.",
                  sectionType: "INTERACTIVE" as const,
                  interactiveMode: "TERMINAL_CD" as const,
                  interactiveConfig: {
                    instructions: "Goal: navigate to /workspace/client, then to /workspace/server, then back to /workspace. Tip: `ls` lists current directory contents and `pwd` prints your current path.",
                    initialDirectory: "/workspace",
                    expectedCommands: ["cd client", "cd ../server", "cd .."],
                    directoryTree: {
                      "/workspace": ["client", "server", "README.md"],
                      "/workspace/client": ["src", "package.json"],
                      "/workspace/server": ["src", "package.json"],
                    },
                  },
                  order: 6,
                },
                { title: "Environment Variables", content: "Sensitive config (like database credentials) is stored in .env files — never hardcoded in source code. DATABASE_URL=\"postgresql://user:password@localhost:5432/mydb\"\nPORT=3000\n The dotenv package reads these files and makes them available as process.env.DATABASE_URL in your code. ⚠️ .env files are listed in .gitignore intentionally — they contain secrets that should never be committed to version control. \n\n Note:\nIn this project, some environment variables will be provided by us, so no need to set it up", order: 7 },
                { title: "What is Prisma?", content: "Prisma is an ORM (Object-Relational Mapper) — a tool that lets you interact with your database using JavaScript/TypeScript instead of raw SQL. Instead of writing:\nSELECT * FROM books WHERE id = 1;\n You write:\nawait prisma.book.findUnique({ where: { id: 1 } });", order: 8 },
                { title: "Prisma Migrations", content: "A migration is a recorded change to your database schema (tables, columns, relationships). When you run npx prisma migrate dev, Prisma reads your schema.prisma file, compares it with the current state of the database, and then generates and executes the necessary SQL to synchronize them. This process ensures that every developer’s database remains consistent and follows the same structure.", order: 9 },
                { title: "Key Takeaway", content: "Setting up a project isn't just installing packages — it's aligning your local environment (dependencies, env vars, database schema) so the app runs the same way for every developer on the team.", order: 10 },
              ],
            },
            hints: {
              create: [
                {
                  description:
                    "The project has three separate folders that each need their own dependencies installed — check which folders contain a `package.json` file.",
                  order: 1,
                },
                {
                  description:
                    "The README contains setup instructions specific to this project — look for sections about environment configuration and required files.",
                  order: 2,
                },
                {
                  description:
                    "Prisma needs a migration command to create your database tables — look for a Prisma CLI command that applies schema changes to a local database.",
                  order: 3,
                },
              ],
            },
            order: 1,
            acceptanceCriteria: {
              create: [
                {
                  description:
                    "Dependencies installed for the root, client, and server without errors",
                  isRequired: true,
                  order: 1,
                },
                {
                  description: "Prisma migrations executed successfully",
                  isRequired: true,
                  order: 2,
                },
                {
                  description: "Both client and server running without errors",
                  isRequired: true,
                  order: 3,
                },
              ],
            },
          },
          {
            taskName: "Update Brand Subtitle",
            testType: "client",
            userStory:
              "As a user, I want to see the updated brand subtitle on the website so that the interface reflects the library identity.",
            learningSections: {
              create: [
                { title: "Overview\nReact Components and the UI Layer", content: "This section introduces the crash course for understanding React components and the UI layer. It gives a broad view of how interface elements are structured and where to make safe, task-focused UI updates.", order: 1 },
                { title: "What is a React Component?", content: "A React component is a reusable piece of UI — like a header, a button, or a card. Components are just JavaScript functions that return HTML-like syntax called JSX.", order: 2 },
                { title: "Layout Components", content: "In most React apps, elements like the header and footer live in layout components — shared wrappers used across multiple pages. This way, you change the header text in one place and it updates everywhere.\n\nA typical layout structure:\ncomponents/\n    └── layout/\n          ├── Header.tsx ← top navigation bar\n          ├── Sidebar.tsx ← side menu\n          └── Footer.tsx ← bottom bar", order: 3 },
                { title: "How to Find What to Change", content: "When you need to update something you see in the browser, ask:\nWhat element is it? (header, footer, sidebar?)\nWhich component renders it? (trace it to a file)\nIs the text hardcoded or coming from props/state? For a subtitle in the header, you'd look inside the layout's header component for a hardcoded string like \"Public Library\" or similar.", order: 4 },
                { title: "JSX Text Content", content: "Changing text in JSX is straightforward — it's just like editing HTML:\n// Before\n<p className=\"subtitle\">Old Subtitle</p>\n// After\n<p className=\"subtitle\">BookWise Public Library</p>", order: 5 },
                { title: "Verifying Your Change", content: "After editing, save the file and check the browser. React's dev server (via Vite or CRA) supports Hot Module Replacement (HMR) — meaning the page updates instantly without a full refresh when you save a file.", order: 6 },
                { title: "Key Takeaway", content: "UI changes in React always trace back to a component file. Layout components are the first place to look for global elements like headers. Find the component, find the text, change it.", order: 7 },
              ],
            },
            hints: {
              create: [
                {
                  description:
                    "The header is a layout-level element — look inside the layout components folder for a file that renders the top navigation or brand area.",
                  order: 1,
                },
                {
                  description:
                    "After saving your change, open the running client in the browser to visually confirm the subtitle updated correctly on both desktop and mobile widths.",
                  order: 2,
                },
                {
                  description:
                    "The acceptance criteria specifies the exact subtitle text — make sure your change matches it character for character, including spacing and capitalization.",
                  order: 3,
                },
              ],
            },
            order: 2,
            acceptanceCriteria: {
              create: [
                {
                  description:
                    'Header subtitle is exactly "BookWise Public Library"',
                  isRequired: true,
                  order: 1,
                },
                {
                  description:
                    "Subtitle renders correctly on desktop and mobile layouts",
                  isRequired: true,
                  order: 2,
                },
              ],
            },
          },
        ],
      },
    },
    {
      id: "level-2",
      title: "Client-Side Exploration",
      subtitle: "Investigate Client-Side Borrowing Logic and UI Helpers",
      order: 2,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      levelDescription:
        "Mission Briefing: Members report they cannot borrow books even when copies are available. Your task is to investigate the client-side availability logic and create a reusable helper function to ensure consistent borrow decisions across the React UI.",
      xpReward: 25,
      coinReward: 125,
      keyTakeaways:
        "Pure functions in React applications that process Prisma query results from PostgreSQL are easier to test and debug. Centralizing business logic ensures consistent data handling across React components that consume Express API responses. This functional programming approach is essential for reliable React + Express + Prisma applications.\n\nClient-side utility functions in React ensure consistent logic when processing data from Express APIs powered by Prisma and PostgreSQL. When the same availability logic exists in multiple React components, shared utilities prevent inconsistencies and simplify maintenance. This approach ensures reliable data handling in React applications consuming Express + Prisma + PostgreSQL backends.",
      scenarioId: "scenario-1",
      tasks: {
        create: [
          {
            taskName: "Add Borrow Availability Helper",
            testType: "client",
            userStory:
              "As a developer, I want a reusable availability helper, So that borrow decisions stay correct and consistent.",
            learningSections: {
              create: [
                { title: "Overview\nPure Functions and Utility Helpers in React", content: "This section introduces the crash course for pure functions and reusable utility helpers in React. It outlines why centralized logic improves consistency, testability, and maintainability across related task workflows.", order: 1 },
                { title: "What is a Pure Function?", content: "A pure function is a function that:\n - Always returns the same output for the same input\n - Has no side effects (doesn't modify anything outside itself) \n// Pure function ✅\nfunction isBookAvailable(availableCopies: number): boolean { \n return availableCopies > 0; \n} \n// NOT pure ❌ — reads external state\n // depends on outside variable\nfunction isBookAvailable(): boolean {\n return globalBookCount > 0;\n}\n Pure functions are predictable, easy to test, and safe to reuse anywhere.", order: 2 },
                { title: "Why Centralize Logic in a Helper?", content: "Imagine the same availability check scattered across 5 different components: \n // In Books.tsx\nif (book.availableCopies > 0) { ... } \n // In BorrowRecords.tsx\nif (book.copies !== 0) { ... }  ← slightly different!\n // In Dashboard.tsx\nif (book.availableCopies >= 1) { ... } \n Each variation is a bug waiting to happen. If the rule changes (e.g., \"reserve 1 copy for walk-ins\"), you'd need to update every file. With a centralized helper, every component imports uses the same logic.\nOne change = consistent behavior everywhere.", order: 3 },
                { title: "Where to Put Helpers", content: "In React projects, shared utility functions live in a utils/ folder: \nclient/\n    src/\n        └── utils/\n              └── helpers.ts ← shared helper functions go here", order: 4 },
                { title: "Boundary Conditions", content: "When writing availability logic, you need to handle edge cases — inputs at or near the boundary of expected values: \n| 5 | true (available) |\n| 1 | true (available) |\n| 0 | false (unavailable) |\n| -1 | false (unavailable — defensive) | \nThe 0 boundary is the most important: \na book with 0 copies is not available, even though 0 is technically a valid number.", order: 5 },
                { title: "Exporting from a Module", content: "To use your helper in other files, you must export it: \n// utils/helpers.ts\nexport function isBookAvailable(availableCopies: number): boolean { \nreturn availableCopies > 0;\n} \nAnd import it where needed:\nimport { isBookAvailable } from '../utils/helpers';", order: 6 },
                {
                  title: "Practice Lab: Write isBookAvailable",
                  content: "Use the mini editor to draft `isBookAvailable` so it returns true only when copies are greater than zero.",
                  sectionType: "INTERACTIVE" as const,
                  interactiveMode: "CODE_EDITOR" as const,
                  interactiveConfig: {
                    instructions: "Create a function named isBookAvailable that accepts availableCopies and returns a boolean.",
                    language: "typescript",
                    starterCode: "export function isBookAvailable(availableCopies: number): boolean {\n  // TODO\n}\n",
                    requiredSnippets: ["isBookAvailable", "availableCopies", "return"],
                  },
                  order: 7,
                },
                { title: "Key Takeaway", content: "Small, focused pure functions are the building blocks of reliable UIs. By centralizing decision logic in a shared helper, you write it once, test it once, and trust it everywhere.", order: 8 },
              ],
            },
            hints: {
              create: [
                {
                  description:
                    "The function must be exported from a specific file path — check the acceptance criteria for the exact filename and export name you need to use.",
                  order: 1,
                },
                {
                  description:
                    "Think carefully about what value of `availableCopies` represents the exact boundary between available and unavailable — test your logic at that exact value.",
                  order: 2,
                },
                {
                  description:
                    "The helper should do one thing only: receive a number and return a boolean. Keep it simple and avoid adding any logic unrelated to availability.",
                  order: 3,
                },
              ],
            },
            order: 1,
            acceptanceCriteria: {
              create: [
                {
                  description:
                    "A helper is implemented and exported as `isBookAvailable` from `client/src/utils/helpers.ts`",
                  isRequired: true,
                  order: 1,
                },
                {
                  description:
                    "The helper returns `false` when `availableCopies <= 0`",
                  isRequired: true,
                  order: 2,
                },
                {
                  description:
                    "The helper returns `true` when `availableCopies > 0`",
                  isRequired: true,
                  order: 3,
                },
                {
                  description:
                    "Borrow-availability decisions remain consistent for mixed copy counts (positive, zero, negative)",
                  isRequired: true,
                  order: 4,
                },
                {
                  description:
                    "Repeated calls with the same input return the same output",
                  isRequired: true,
                  order: 5,
                },
                {
                  description:
                    "Tests validate behavior and contract rather than enforcing one exact implementation style",
                  isRequired: true,
                  order: 6,
                },
              ],
            },
          },
          {
            taskName: "Reuse Availability Logic",
            testType: "client",
            userStory:
              "As a developer, I want BorrowRecords to use the shared availability helper, So that the logic stays consistent across views.",
            learningSections: {
              create: [
                { title: "Overview\nRefactoring: Replacing Inline Logic with Shared Helpers", content: "This section introduces the crash course for refactoring inline checks into shared helpers. It provides a high-level guide for reducing duplication while keeping behavior stable across the task flow.", order: 1 },
                { title: "What is Refactoring?", content: "Refactoring means improving the structure of existing code without changing what it does. The behavior stays the same — but the code becomes cleaner, more consistent, and easier to maintain.", order: 2 },
                { title: "The Problem: Duplicated Logic", content: "When the same decision appears in multiple components with slight differences, bugs creep in:\n // Books.tsx\nconst canBorrow = book.availableCopies > 0;\n // BorrowRecords.tsx\nconst canBorrow = book.copies !== 0; ← different condition! These two checks look similar but behave differently at edge cases (e.g., negative copies). If a librarian borrows the last copy and copies somehow go negative, one check says \"unavailable\" and the other says \"available.\"", order: 3 },
                { title: "The Fix: Import and Reuse", content: "Replace the inline condition with the shared helper: \n// Before — inline logic\nconst showBorrowButton = book.availableCopies !== 0;\n // After — shared helper\nimport { isBookAvailable } from '../utils/helpers';\nconst showBorrowButton = isBookAvailable(book.availableCopies); \nThe behavior is driven by the helper now. If the helper's rule ever changes, all components update automatically.", order: 4 },
                { title: "Finding Inline Checks to Replace", content: "When refactoring, search the codebase for patterns that mirror the logic you're centralizing. In this case, look for:\n - Direct comparisons involving availableCopies\n - Conditions used to show/hide borrow UI elements\n - Any boolean derived from copy count", order: 5 },
                { title: "Non-Regression: Making Sure You Didn't Break Anything", content: "After refactoring, verify the feature still works the same way:\nBooks with copies available → borrow button shown\nBooks with 0 copies → borrow button hidden\nThe \"Issue Book\" flow works end-to-end Refactoring should be invisible to the user — same behavior, better code.", order: 6 },
                { title: "Key Takeaway", content: "Refactoring is a professional habit. Replace scattered inline conditions with centralized helpers to make your codebase consistent and easier to change safely in the future.", order: 7 },
              ],
            },
            hints: {
              create: [
                {
                  description:
                    "Search `BorrowRecords.tsx` for any condition that checks copy count or availability — that's the inline logic you need to replace with the helper.",
                  order: 1,
                },
                {
                  description:
                    "After importing the helper, pass the book's available copy count into it — the helper handles the decision, so the component just uses the returned boolean.",
                  order: 2,
                },
                {
                  description:
                    "Manually test the borrow flow after your refactor — the UI should behave identically to before, just driven by the shared helper now.",
                  order: 3,
                },
              ],
            },
            order: 2,
            acceptanceCriteria: {
              create: [
                {
                  description:
                    "`BorrowRecords.tsx` uses `isBookAvailable` from `client/src/utils/helpers.ts` for availability filtering",
                  isRequired: true,
                  order: 1,
                },
                {
                  description:
                    "Inline availability checks in `BorrowRecords.tsx` are replaced by helper usage",
                  isRequired: true,
                  order: 2,
                },
                {
                  description:
                    "Availability filtering follows helper output, even when helper logic changes",
                  isRequired: true,
                  order: 3,
                },
                {
                  description:
                    "Validation is outcome-based and allows different coding styles, as long as requirements are met",
                  isRequired: true,
                  order: 4,
                },
                {
                  description:
                    "Borrow/Issue behavior remains correct after refactor",
                  isRequired: true,
                  order: 5,
                },
                {
                  description:
                    "Only books with available copies are selectable in Issue Book flow after refactor",
                  isRequired: true,
                  order: 6,
                },
                {
                  description:
                    "No regressions appear in related components using borrow flow",
                  isRequired: true,
                  order: 7,
                },
                {
                  description:
                    "Tests should verify behavior/contract, not enforce one exact line-by-line implementation",
                  isRequired: true,
                  order: 8,
                },
              ],
            },
          },
        ],
      },
    },
    {
      id: "level-3",
      title: "Debugging and Stabilizing the Backend",
      subtitle:
        "Trace return-flow issues and enforce transactional consistency.",
      order: 3,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      levelDescription:
        "Mission Briefing: Returning books occasionally causes negative available copy counts. Your mission is to debug the return flow, identify why the copy counts are going negative, and implement a fix to ensure the library's inventory stays accurate.",
      xpReward: 40,
      coinReward: 200,
      keyTakeaways:
        "Prisma migrations synchronize your PostgreSQL database schema with your Express + React application code changes. They prevent schema drift between development, staging, and production environments, ensuring database consistency across the entire React + Express + Prisma stack. Migrations are essential for maintaining data integrity in production PostgreSQL databases.\n\nDatabase transactions in Prisma ensure atomic operations when updating related PostgreSQL records through Express APIs. They prevent partial updates that could leave your database inconsistent, which is critical for React applications handling financial and inventory data. Always wrap related database operations in transactions to maintain data integrity in Express + Prisma + PostgreSQL applications.",
      scenarioId: "scenario-1",
      tasks: {
        create: [
          {
            taskName: "Diagnose Return Flow",
            testType: "server",
            userStory:
              "As a backend developer, I want to trace the return flow in the server, So that I can identify why available copy counts can become invalid.",
            learningSections: {
              create: [
                { title: "Overview\nDebugging Backend Logic: Tracing a Data Flow", content: "This section introduces the crash course for tracing backend data flow during debugging. It gives an overview of how to inspect write sequences, isolate failure points, and identify the root cause of inconsistent task outcomes.", order: 1 },
                { title: "What Does \"Debugging\" Mean Here?", content: "Debugging isn't just fixing errors — sometimes it means understanding why a system produces wrong data. In this case, the symptom is availableCopies going negative. Your job is to trace the code path that causes it.", order: 2 },
                { title: "The Return Flow", content: "When a member returns a book, two things should happen:\n\nThe BorrowRecord is updated (e.g., returnedAt set, status changed)\nThe Book's availableCopies is incremented by 1\n\nBoth changes need to happen — but what if only one of them does?", order: 3 },
                { title: "The Problem: Separate Writes", content: "If these two database updates are made in separate Prisma calls:\n\n// Step 1\nawait prisma.borrowRecord.update({\n  where: { id },\n  data: { returnedAt: new Date() }\n});\n\n// Step 2 — what if this crashes or the server restarts here?\nawait prisma.book.update({\n  where: { id: bookId },\n  data: { availableCopies: { increment: 1 } }\n});\n\n...then a failure between Step 1 and Step 2 leaves the database in a partial state:\n\nThe record says the book was returned ✅\nBut the inventory never updated ❌\n\nOver time, with repeated partial failures, counts drift and can go negative.", order: 4 },
                { title: "How to Trace a Flow", content: "Open the controller responsible for returning books\nFind every prisma. call inside the return function\nAsk: \"What happens if the second write fails after the first succeeds?\"\nLook for any conditional logic that might skip the inventory update", order: 5 },
                { title: "Identifying the Root Cause", content: "Document what you find:\nWhich line does the borrow record update?\nWhich line does the copy count update?\nAre they in the same operation, or separate?\nWhat scenario makes one succeed and the other fail? This kind of analysis — reading code to understand failure paths — is called root cause analysis and is a core backend engineering skill.", order: 6 },
                { title: "Key Takeaway", content: "When data becomes inconsistent, the bug is usually in a write sequence that can be interrupted. Trace every write in the flow, and ask: \"What breaks if this step fails in isolation?\"", order: 7 },
              ],
            },
            hints: {
              create: [
                {
                  description:
                    "Open the borrow controller and locate the `returnBook` function — read through every database write it makes and note the order they happen in.",
                  order: 1,
                },
                {
                  description:
                    "Count the number of separate `prisma.` calls inside the return flow — if there's more than one, consider what would happen if the process stopped between them.",
                  order: 2,
                },
                {
                  description:
                    "Write down a concrete scenario: what sequence of events (e.g., a crash, a timeout, a concurrent request) could cause one write to succeed while the other doesn't?",
                  order: 3,
                },
              ],
            },
            order: 1,
            acceptanceCriteria: {
              create: [
                {
                  description:
                    "A reproducible case for negative stock is documented",
                  isRequired: true,
                  order: 1,
                },
                {
                  description:
                    "Problematic backend logic path is identified with evidence",
                  isRequired: true,
                  order: 2,
                },
                {
                  description: "Backend controller/service flow is validated",
                  isRequired: true,
                  order: 3,
                },
                {
                  description: "Prisma query sequence is validated",
                  isRequired: true,
                  order: 4,
                },
              ],
            },
          },
          {
            taskName: "Enforce Transaction Safety",
            testType: "server",
            userStory:
              "As a backend engineer, I want the borrow and return flows in `server/src/controllers/borrow.controller.ts` to run atomically, So that concurrent requests cannot corrupt `availableCopies` and partial writes are never persisted.",
            learningSections: {
              create: [
                { title: "Overview\nDatabase Transactions and Atomic Operations", content: "This section introduces the crash course for database transactions and atomic operations. It explains the core idea behind all-or-nothing updates and why transaction safety is essential for reliable task behavior.", order: 1 },
                { title: "What is a Transaction?", content: "A database transaction is a group of operations that either all succeed or all fail together. There's no in-between.\n\nThink of it like a bank transfer:\nDeduct $100 from Account A\nAdd $100 to Account B\n\nIf step 2 fails after step 1, the money disappears. A transaction prevents this — it rolls back step 1 if step 2 fails.", order: 2 },
                { title: "Atomicity: All or Nothing", content: "The key property of transactions is atomicity — the entire group of writes is treated as one indivisible unit. Without transaction:\nWrite 1 succeeds ✅\nWrite 2 fails ❌ ← partial state remains in DB With transaction:\nWrite 1 succeeds ✅\nWrite 2 fails ❌ ← transaction rolls back Write 1 too\nResult: DB unchanged, consistent state preserved ✅", order: 3 },
                { title: "Prisma Transactions", content: "Prisma provides prisma.$transaction() to wrap multiple writes atomically:\n\nawait prisma.$transaction([\n  prisma.borrowRecord.update({\n    where: { id },\n    data: { returnedAt: new Date() }\n  }),\n  prisma.book.update({\n    where: { id: bookId },\n    data: { availableCopies: { increment: 1 } }\n  }),\n]);\n\nBoth writes succeed together, or neither is committed.", order: 4 },
                { title: "The Concurrency Problem", content: "Even with correct logic, concurrent requests can corrupt data.\n\nTimeline (no protection):\nRequest A reads availableCopies = 1\nRequest B reads availableCopies = 1\nRequest A borrows → sets to 0\nRequest B borrows → sets to 0 ← should have been rejected!\n\nResult: 2 borrows, 0 copies (should be -1 if no guard)", order: 5 },
                { title: "Guard Conditions", content: "A conditional update prevents this by including a safety check in the update itself:\n\nprisma.book.updateMany({\n  where: {\n    id: bookId,\n    availableCopies: { gt: 0 } // only update if copies > 0\n  },\n  data: {\n    availableCopies: { decrement: 1 }\n  },\n});\n\nIf 0 rows are updated, the borrow is rejected — the book is already gone.", order: 6 },
                { title: "Key Takeaway", content: "Transactions protect against partial writes. Guard conditions protect against race conditions. Together, they ensure your inventory data stays accurate even under concurrent load.", order: 7 },
              ],
            },
            hints: {
              create: [
                {
                  description:
                    "Look up Prisma's `$transaction` API — it accepts an array of Prisma operations and runs them as a single atomic unit.",
                  order: 1,
                },
                {
                  description:
                    "For the borrow decrement, consider adding a `where` condition that prevents the update from running if `availableCopies` is already at or below zero.",
                  order: 2,
                },
                {
                  description:
                    "After implementing the transaction, write a test that simulates two simultaneous borrow requests for a book with one copy — only one should succeed.",
                  order: 3,
                },
              ],
            },
            order: 2,
            acceptanceCriteria: {
              create: [
                {
                  description:
                    "Return flow updates (`BorrowRecord` + `Book.availableCopies`) run in one Prisma transaction",
                  isRequired: true,
                  order: 1,
                },
                {
                  description:
                    "If one write fails, no partial state is persisted",
                  isRequired: true,
                  order: 2,
                },
                {
                  description:
                    "Concurrent borrow requests never reduce `availableCopies` below zero",
                  isRequired: true,
                  order: 3,
                },
                {
                  description:
                    "Only valid borrow/return outcomes are committed under concurrent access",
                  isRequired: true,
                  order: 4,
                },
              ],
            },
          },
        ],
      },
    },
    {
      id: "level-4",
      title: "Starting my Full-Stack Journey",
      subtitle: "Implement Reservation Queue and Lifecycle Management",
      order: 4,
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      levelDescription:
        "Mission Briefing: The Library is implementing a reservation system for popular books. Your task is to build a reservation feature that allows users to reserve a book when all copies are borrowed and receive notifications when the book becomes available.",
      xpReward: 60,
      coinReward: 300,
      keyTakeaways:
        "Input validation and sanitization are critical for Express API security and PostgreSQL data integrity in React applications. They prevent malicious input from corrupting your database and protect against attacks. Always validate and sanitize user inputs in Express routes before they reach Prisma and PostgreSQL. This creates secure, reliable APIs that safely handle React frontend data submissions.\n\nProper error handling in Express APIs and React components creates better user experiences in full-stack applications. Clear error messages help users understand issues, while graceful error handling prevents React app crashes. Implement comprehensive error boundaries in React and meaningful error responses in Express routes. This ensures reliable, user-friendly React + Express + PostgreSQL + Prisma applications.",
      scenarioId: "scenario-1",
      tasks: {
        create: [
          {
            taskName: "Reserve an Unavailable Book",
            testType: "both",
            userStory:
              "As a library member, I want to reserve a book when all copies are borrowed, So that I can claim it when it becomes available.",
            learningSections: {
              create: [
                { title: "Overview\nBuilding a Full-Stack Feature: Reservation Creation", content: "This section introduces the crash course for implementing reservation creation as a full-stack feature. It summarizes the end-to-end task flow between API logic, data validation, and user-facing interactions.", order: 1 },
                { title: "What Does \"Full-Stack\" Mean for This Task?", content: "A full-stack feature touches both the server (API logic, database) and the client (UI, service calls). You'll build both ends and make them talk to each other.", order: 2 },
                { title: "The Feature: Reservation Queue", content: "When all copies of a book are borrowed, a member should be able to join a queue. The queue determines who gets the book next when a copy becomes available.\n\n### Data Model Concept\nReservation {\n  id\n  bookId        ← which book\n  memberId      ← who reserved it\n  queuePosition ← their place in line (1 = first)\n  status        ← RESERVED | READY_FOR_PICKUP | CANCELLED\n  createdAt\n}", order: 3 },
                { title: "Server Side: The API Endpoint", content: "### POST /api/reservations\nCreates a new reservation. Before inserting, the server must validate:\n- The book exists\n- availableCopies === 0 (reserving available books makes no sense)\n- The member doesn't already have an active reservation for this book\n\nAssigning Queue Position\nQueue position is calculated server-side — count active reservations and add 1:\n\nconst existingCount = await prisma.reservation.count({\n  where: { bookId, status: 'RESERVED' }\n});\nconst queuePosition = existingCount + 1;\n\n### GET /api/reservations?bookId=<id>\nReturns the reservation queue for a book, ordered by position. Each row includes member and book details so the UI doesn't need extra requests.", order: 4 },
                { title: "Client Side: The Service Layer", content: "In a well-structured React app, API calls live in a service layer — not directly in components:\n\nclient/src/\n    └── services/\n          └── libraryService.ts  ← all API calls live here\n\nYour createReservation function in this file calls POST /api/reservations and returns the result.", order: 5 },
                { title: "Client Side: The UI", content: "The Books.tsx page needs conditional rendering:\nIf availableCopies > 0 → show Borrow button\nIf availableCopies === 0 → show Reserve button\n\nAfter a successful reservation, show the member their queue position:\n\"You are #3 in line.\"\n\nThis number must come from the server response — not calculated on the client.", order: 6 },
                { title: "Error Handling", content: "The UI should handle and display:\n\"Book is available — no reservation needed\"\n\"You already have an active reservation for this book\"\nGeneric server errors", order: 7 },
                { title: "Key Takeaway", content: "Full-stack features require you to think in two layers: the API contract (what endpoints exist, what they accept, what they return) and the UI contract (what the user sees and does). Build the server first, then connect the client to it.", order: 8 },
              ],
            },
            hints: {
              create: [
                {
                  description:
                    "Before inserting a reservation, query the database to check the book's `availableCopies` — the reservation should only be allowed when that value is exactly `0`.",
                  order: 1,
                },
                {
                  description:
                    "Queue position should be calculated by counting how many active reservations already exist for that book, then adding 1 — do this in the server before the insert.",
                  order: 2,
                },
                {
                  description:
                    "The GET queue endpoint needs to include related `member` and `book` fields in the response — use Prisma's `include` option to join those relations.",
                  order: 3,
                },
                {
                  description:
                    "In `Books.tsx`, check `availableCopies` to decide which button to show — the Reserve button should only appear when copies are `0`, and it should call the service function, not the API directly.",
                  order: 4,
                },
              ],
            },
            order: 1,
            acceptanceCriteria: {
              create: [
                {
                  description:
                    "`POST /api/reservations` returns HTTP `201` with `{ success: true, data: Reservation }` for valid requests",
                  isRequired: true,
                  order: 1,
                },
                {
                  description: "Request body includes `bookId` and `memberId`",
                  isRequired: true,
                  order: 2,
                },
                {
                  description:
                    "Reservation create is allowed only when target book has `availableCopies === 0`",
                  isRequired: true,
                  order: 3,
                },
                {
                  description:
                    "Duplicate active reservation for the same member and book returns HTTP `400`",
                  isRequired: true,
                  order: 4,
                },
                {
                  description:
                    "Required implementation names are exact and case-sensitive: `createReservation` in `server/src/controllers/reservation.controller.ts`, `createReservation` in `client/src/services/libraryService.ts`, Route path is `/api/reservations` in `server/src/routes/reservation.routes.ts`",
                  isRequired: true,
                  order: 5,
                },
                {
                  description:
                    "`GET /api/reservations?bookId=<id>` returns HTTP `200` with `{ success: true, data: ReservationQueueRow[] }`",
                  isRequired: true,
                  order: 6,
                },
                {
                  description:
                    "Each queue row includes `id`, `bookId`, `memberId`, `queuePosition`, `status`, `createdAt`",
                  isRequired: true,
                  order: 7,
                },
                {
                  description:
                    "Each queue row includes display-ready relation data: `member.name` and `book.title`",
                  isRequired: true,
                  order: 8,
                },
                {
                  description:
                    "Queue response is ordered by `queuePosition` ascending",
                  isRequired: true,
                  order: 9,
                },
                {
                  description:
                    "`client/src/pages/Books.tsx` renders `Reserve Book` only when `availableCopies` is `0`",
                  isRequired: true,
                  order: 10,
                },
                {
                  description:
                    "Borrow action stays primary when `availableCopies` is greater than `0`",
                  isRequired: true,
                  order: 11,
                },
                {
                  description:
                    "Reserve action triggers `createReservation(...)` from `client/src/services/libraryService.ts`",
                  isRequired: true,
                  order: 12,
                },
                {
                  description:
                    "Reservation errors (book available, duplicate reservation, invalid member) are shown in UI",
                  isRequired: true,
                  order: 13,
                },
                {
                  description:
                    "After successful reservation, UI confirms queue position (for example: `You are #3 in line.`)",
                  isRequired: true,
                  order: 14,
                },
                {
                  description:
                    "Queue length and position display are based on backend response, not hard-coded client math",
                  isRequired: true,
                  order: 15,
                },
                {
                  description:
                    "Empty queue state for a book displays `No active reservations.`",
                  isRequired: true,
                  order: 16,
                },
              ],
            },
          },
          {
            taskName: "Fulfill and Manage Reservation Lifecycle",
            testType: "both",
            userStory:
              "As a librarian, I want reservation fulfillment and cancellation to update queue order automatically, So that members always see accurate reservation status and position.",
            learningSections: {
              create: [
                { title: "Overview\nState Machines and Queue Management", content: "This section introduces the crash course for reservation lifecycle states and queue management. It provides a high-level view of status transitions, ordering rules, and consistent state handling throughout the task.", order: 1 },
                { title: "What is a Lifecycle?", content: "A lifecycle describes all the states a thing can be in and how it moves between them. For a reservation, the lifecycle looks like this:\n\nRESERVED → READY_FOR_PICKUP → (borrowed, reservation complete)\n                     ↓\n                 CANCELLED\n\nEach state has meaning:\nRESERVED — in the queue, waiting\nREADY_FOR_PICKUP — a copy is available, this member is next\nCANCELLED — member withdrew from the queue", order: 2 },
                { title: "State Transitions: When and How", content: "### RESERVED → READY_FOR_PICKUP\nThis happens automatically when a book is returned. The return flow should:\nMark the borrow record as returned\nIncrement availableCopies\nCheck if any active reservations exist for this book\nIf yes, promote the first one (lowest queuePosition) to READY_FOR_PICKUP\n\nAll of this happens inside one transaction — it's one atomic action.\n\n### RESERVED → CANCELLED\nTriggered by the member. The cancellation flow should:\nMark the reservation as CANCELLED\nReindex the remaining active reservations so positions stay continuous\n\n### Reindexing the Queue\nWhen reservation #2 is cancelled, the queue looks like this:\nPosition 1 → Member A (RESERVED)\nPosition 2 → CANCELLED\nPosition 3 → Member C (RESERVED)\n\nAfter reindex:\nPosition 1 → Member A\nPosition 2 → Member C ← was 3, now 2\n\nReindexing ensures members always see accurate \"You are #N in line\" numbers.", order: 3 },
                { title: "Transactional Queue Mutations", content: "Both promotion and reindexing must happen inside a transaction:\n\nawait prisma.$transaction(async (tx) => {\n  // cancel the reservation\n  await tx.reservation.update({\n    where: { id },\n    data: { status: 'CANCELLED' }\n  });\n\n  // reindex remaining reservations\n  const remaining = await tx.reservation.findMany({\n    where: { bookId, status: 'RESERVED' },\n    orderBy: { createdAt: 'asc' }\n  });\n\n  for (let i = 0; i < remaining.length; i++) {\n    await tx.reservation.update({\n      where: { id: remaining[i].id },\n      data: { queuePosition: i + 1 }\n    });\n  }\n});", order: 4 },
                { title: "Client Side: Reservation List View", content: "The UI should show each reservation with:\nBook title\nCurrent queue position\nStatus (visually distinct for READY_FOR_PICKUP vs RESERVED)\nA cancel button (only for active reservations)\n\nAlways render based on server data — never compute lifecycle status on the client.", order: 5 },
                { title: "Key Takeaway", content: "Lifecycle management is about controlling state transitions carefully. Use explicit states, handle transitions in the right place (server), keep mutations atomic, and always let the backend be the source of truth.", order: 6 },
              ],
            },
            hints: {
              create: [
                {
                  description:
                    "Inside the `returnBook` function, after incrementing `availableCopies`, query for the reservation with the lowest `queuePosition` and status `RESERVED` — that's the one to promote.",
                  order: 1,
                },
                {
                  description:
                    "The promotion and return updates should all be inside the same `prisma.$transaction` — if any part fails, none of the changes should persist.",
                  order: 2,
                },
                {
                  description:
                    "After cancelling a reservation, fetch the remaining active reservations for that book ordered by `createdAt`, then loop through them and reassign positions starting from 1.",
                  order: 3,
                },
                {
                  description:
                    "In the reservation list UI, use the `status` field from the API response to decide how to style each row — don't derive or guess status on the client side.",
                  order: 4,
                },
              ],
            },
            order: 2,
            acceptanceCriteria: {
              create: [
                {
                  description:
                    "In `returnBook` flow, when a returned book has active reservations and stock becomes available, first queue entry is updated to `READY_FOR_PICKUP`",
                  isRequired: true,
                  order: 1,
                },
                {
                  description:
                    "Queue progression updates happen in the same transactional boundary as return updates",
                  isRequired: true,
                  order: 2,
                },
                {
                  description:
                    "Required implementation names are exact and case-sensitive: `returnBook` in `server/src/controllers/borrow.controller.ts`, `promoteNextReservation` in `server/src/controllers/reservation.controller.ts`",
                  isRequired: true,
                  order: 3,
                },
                {
                  description:
                    "`DELETE /api/reservations/:id` (or equivalent cancel endpoint) marks reservation as `CANCELLED`",
                  isRequired: true,
                  order: 4,
                },
                {
                  description:
                    "Cancellation triggers queue reindex so remaining active reservations have continuous positions (`1..n`)",
                  isRequired: true,
                  order: 5,
                },
                {
                  description:
                    "Cancelling an already cancelled or fulfilled reservation returns HTTP `400`",
                  isRequired: true,
                  order: 6,
                },
                {
                  description:
                    "Required implementation names are exact and case-sensitive: `cancelReservation` in `server/src/controllers/reservation.controller.ts`, `cancelReservation` in `client/src/services/libraryService.ts`",
                  isRequired: true,
                  order: 7,
                },
                {
                  description:
                    "Client provides a reservation list view for the member showing `book.title`, `queuePosition`, and `status`",
                  isRequired: true,
                  order: 8,
                },
                {
                  description:
                    "Rows with `READY_FOR_PICKUP` are visually distinct from `RESERVED`",
                  isRequired: true,
                  order: 9,
                },
                {
                  description: "Empty state displays `No reservations found.`",
                  isRequired: true,
                  order: 10,
                },
                {
                  description:
                    "On successful cancellation, UI confirms: `Reservation cancelled.`",
                  isRequired: true,
                  order: 11,
                },
                {
                  description:
                    "On queue updates, affected members see updated position values from backend response",
                  isRequired: true,
                  order: 12,
                },
                {
                  description:
                    "UI never computes lifecycle status from local assumptions; it uses server status output",
                  isRequired: true,
                  order: 13,
                },
              ],
            },
          },
        ],
      },
    },
    {
      id: "level-5",
      title: "The Production Struggle",
      subtitle: "Investigate and fix a critical production issue.",
      order: 5,
      deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      levelDescription:
        "Mission Briefing: Congratulations! The project is in production, but a critical issue has been reported by the client. Your mission is to investigate the problem, identify the root cause, and deliver a fix as soon as possible to maintain system reliability.",
      xpReward: 75,
      coinReward: 375,
      keyTakeaways:
        "Pagination is essential for handling large datasets in React applications consuming Express APIs with PostgreSQL. It improves frontend performance and user experience by loading data incrementally instead of overwhelming the React UI with massive datasets. Implement proper pagination with clear navigation controls and loading states for scalable React + Express + PostgreSQL applications.\n\nAutomated testing is crucial for maintaining code quality in React + Express + Prisma + PostgreSQL applications. Tests ensure that React component changes, Express API modifications, and Prisma database operations work correctly together and prevent regressions. Always write tests for critical business logic and user interactions to maintain reliable full-stack applications.",
      scenarioId: "scenario-1",
      tasks: {
        create: [
          {
            taskName: "Stabilize Overdue Report Classification",
            testType: "server",
            userStory:
              "As a developer, I want the overdue report to classify records by source-of-truth fields, So that client-visible overdue output remains correct even with stale status data.",
            learningSections: {
              create: [
                { title: "Overview\nDebugging Production Data: Source of Truth vs. Stale State", content: "This section introduces the crash course for debugging production data using source-of-truth fields. It explains how to evaluate stale-state risks and classify records accurately within the task context.", order: 1 },
                { title: "The Production Bug", content: "The overdue report is showing books as overdue even when they've already been returned. This is a stale data classification bug — the system is trusting a status field that may not reflect reality.", order: 2 },
                { title: "Why Does Stale Status Happen?", content: "In a database, you often have:\n\nA computed/derived field — like status (BORROWED, OVERDUE, RETURNED) that gets set at specific points in time\nA source-of-truth field — like returnedAt which is only ever set when an actual return happens\n\nThe problem: status can become stale. If the code that updates status to RETURNED fails or is skipped, the record still has status = 'OVERDUE' even though returnedAt has a value.\n\nRecord:\n{ status: 'OVERDUE', returnedAt: '2024-01-10', dueDate: '2024-01-05' }\n↑ stale!\n↑ source of truth: book WAS returned", order: 3 },
                { title: "The Fix: Trust Source-of-Truth Fields", content: "Instead of filtering overdue records by status:\n\n// ❌ Unreliable — status can be stale\nwhere: { status: 'OVERDUE' }\n\nFilter by the fields that cannot lie:\n\n// ✅ Reliable — returnedAt is only set when a return actually happened\nwhere: {\n  returnedAt: null, // not returned yet\n  dueDate: { lt: new Date() } // past due date\n}\n\nA record with returnedAt != null was returned — full stop. No status value can override that fact.", order: 4 },
                { title: "UTC and Timezone Boundaries", content: "Overdue logic is time-sensitive. Bugs often appear at midnight boundaries due to timezone differences. Always use UTC timestamps in tests:\n\nconst yesterday = new Date('2024-01-09T23:59:59Z'); // just before midnight UTC\nconst today = new Date('2024-01-10T00:00:01Z'); // just after midnight UTC\n\nUsing fixed, deterministic timestamps makes bugs reproducible — especially at edge cases.", order: 5 },
                { title: "What is a Regression Test?", content: "A regression test captures a bug so it can never silently return. You write it to reproduce the current broken behavior, then fix the code until the test passes. If the bug ever comes back, the test fails again — alerting you immediately.", order: 6 },
                { title: "Key Takeaway", content: "In production debugging, always identify the source-of-truth field — the field that is set directly from a real-world event, not derived or computed. Build your queries around those fields, not cached status values.", order: 7 },
              ],
            },
            hints: {
              create: [
                {
                  description:
                    "Look at the overdue query in the borrow controller — check whether it filters by `status` or by `returnedAt` and `dueDate`, and think about which is more reliable.",
                  order: 1,
                },
                {
                  description:
                    "Create a test record that has `returnedAt` set to a real date but `status` still showing as `OVERDUE` — this is your stale-status reproduction case.",
                  order: 2,
                },
                {
                  description:
                    "Use fixed UTC timestamps close to midnight in your test data to ensure the boundary between overdue and not-overdue is deterministic and reproducible.",
                  order: 3,
                },
              ],
            },
            order: 1,
            acceptanceCriteria: {
              create: [
                {
                  description:
                    "`/api/borrow-records/overdue` excludes any record with `returnedAt != null` regardless of status value",
                  isRequired: true,
                  order: 1,
                },
                {
                  description:
                    "`/api/borrow-records/overdue` includes past-due unreturned records",
                  isRequired: true,
                  order: 2,
                },
                {
                  description:
                    "A stale-status discrepancy case is reproducible and covered by tests",
                  isRequired: true,
                  order: 3,
                },
                {
                  description:
                    "A UTC midnight boundary case is covered by deterministic test data",
                  isRequired: true,
                  order: 4,
                },
              ],
            },
          },
          {
            taskName: "Deliver Permanent Fix and Documentation",
            testType: "server",
            userStory:
              "As a developer, I want to fix overdue mismatches and document the root cause, So that the client can trust overdue reports.",
            learningSections: {
              create: [
                { title: "Overview\nProduction Fixes: Regression Tests, Shared Utilities, and Postmortems", content: "This section introduces the crash course for delivering a durable production fix. It outlines the high-level task approach for using regression tests, shared logic, and documentation to prevent recurrence.", order: 1 },
                { title: "The Professional Fix Workflow", content: "In production, a proper fix isn't just \"change the code and redeploy.\" It follows this pattern: Write a failing test that reproduces the bug\nImplement the fix\nConfirm the test now passes\nCentralize the logic to prevent future drift\nWrite a postmortem document", order: 2 },
                { title: "Step 1: Regression Tests First", content: "Write the test before fixing the code. This proves:\nThe bug exists (test fails before fix)\nYour fix works (test passes after fix)\nThe bug can never silently return (test will catch it)\n\nit('should not list returned books as overdue even with stale OVERDUE status', async () => {\n  // create a record that has returnedAt set but status = 'OVERDUE'\n  // call /api/borrow-records/overdue\n  // assert: this record is NOT in the response\n});", order: 3 },
                { title: "Step 2: Centralize the Date Logic", content: "Overdue determination logic (returnedAt === null && dueDate < now) should live in one shared utility:\n\n// utils/overdueUtils.ts\nexport function isOverdue(returnedAt: Date | null, dueDate: Date): boolean {\n  return returnedAt === null && dueDate < new Date();\n}\n\nThis prevents the same logic from being written differently in multiple places (the original cause of the bug).", order: 4 },
                { title: "Step 3: Writing a Postmortem", content: "A postmortem is a short document written after a production incident. It's not about blame — it's about learning and preventing recurrence. A good postmortem includes:\n\n### Symptom\nWhat the user/client observed:\n\"Overdue report shows returned books as overdue\"\n\n### Root Cause\nThe technical reason it happened:\n\"The overdue query filtered by status field which can become stale when the return flow fails mid-way. Books with returnedAt set but status = 'OVERDUE' were incorrectly included.\"\n\n### Fix\nWhat you changed:\n\"Replaced status-based filter with returnedAt IS NULL AND dueDate < NOW() in the Prisma query. Centralized this logic in overdueUtils.ts.\"\n\n### Prevention\nHow to stop it from happening again:\n\"Added regression test coverage. Added code comment warning against using status for overdue classification.\"", order: 5 },
                { title: "Key Takeaway", content: "A permanent fix includes tests, centralized logic, and documentation. Tests prevent regression. Shared utilities prevent drift. Postmortems prevent the same mistake from being made again by the next developer.", order: 6 },
              ],
            },
            hints: {
              create: [
                {
                  description:
                    "Write your test to create a record with \`returnedAt\` set but \`status\` still as \`OVERDUE\`, then assert it does NOT appear in the overdue endpoint response — this confirms the bug exists before you fix it.",
                  order: 1,
                },
                {
                  description:
                    "Extract the overdue check condition into a standalone utility function — the controller should call that function rather than duplicating the logic inline.",
                  order: 2,
                },
                {
                  description:
                    "Your postmortem should be a short markdown or text file covering: what the symptom was, what caused it technically, what you changed, and what would prevent similar bugs in the future.",
                  order: 3,
                },
              ],
            },
            order: 2,
            acceptanceCriteria: {
              create: [
                {
                  description: "Incorrect overdue markings are resolved",
                  isRequired: true,
                  order: 1,
                },
                {
                  description: "Returned items are no longer listed overdue",
                  isRequired: true,
                  order: 2,
                },
                {
                  description:
                    "Overdue reports match source borrowing and return records",
                  isRequired: true,
                  order: 3,
                },
                {
                  description: "Spot checks confirm data consistency",
                  isRequired: true,
                  order: 4,
                },
                {
                  description: "Root cause is documented",
                  isRequired: true,
                  order: 5,
                },
                {
                  description:
                    "Fix approach and validation steps are documented",
                  isRequired: true,
                  order: 6,
                },
              ],
            },
          },
        ],
      },
    },
  ];

  // Insert scenarios first
  console.log("\n📦 Creating scenarios...\n");
  for (const scenario of scenarios) {
    await prisma.scenario.create({ data: scenario });
    console.log(`✅ Created scenario: ${scenario.name}`);
  }

  // Insert levels
  console.log("\n🎯 Creating levels...\n");
  for (const level of levels) {
    await prisma.level.create({ data: level });
    console.log(`✅ Created level: ${level.title}`);
  }

  console.log("\n🎉 Database seeded successfully!\n");

  // Summary
  console.log("📊 Summary:");
  console.log(`   Levels: ${levels.length}`);
  console.log(`   Scenarios: ${scenarios.length}`);
  console.log("\n📋 Difficulty breakdown:");
  const difficultyCount = scenarios.reduce(
    (acc, s) => {
      acc[s.difficulty] = (acc[s.difficulty] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  Object.entries(difficultyCount).forEach(([diff, count]) => {
    console.log(`   ${diff}: ${count}`);
  });
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });