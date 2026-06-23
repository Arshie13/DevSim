export const scenarios = [
  {
    id: "pern-lb-scenario-1",
    name: "BookWise Library Management System",
    description:
      "Build a full-featured web-based Library Management System to manage books, members, and borrowing workflows using React, Express, PostgreSQL, and Prisma.",
    difficulty: "expert",
  },
];

export const levels = [
    {
      id: "pern-lb-level-1",
      title: "Getting Familiar with the Codebase",
      subtitle:
        "Set up the development environment and make a minor UI change.",
      order: 1,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      level_description:
        "Mission Briefing: The library has onboarded a new developer and needs the system running locally. Set up the PERN (Postgres, Express, React, NodeJs) stack, configure the database, and make minor UI tweaks to get the application running properly in your local machine.",
      xp_reward: 100,
      coin_reward: 50,
      key_takeaways:
        "Mastering React + Express + PostgreSQL + Prisma development environments requires understanding package management (npm/pnpm), environment variables for securing database connections, and Prisma migrations to keep PostgreSQL schemas synchronized. This setup ensures consistent development across team members and reliable deployments. Every React frontend with Express backend and Prisma + PostgreSQL database starts with this crucial foundation.\n\nReact component props enable parent-to-child data flow, creating dynamic UIs that display data from Express APIs. Understanding component hierarchy and prop passing is essential for building maintainable React applications that consume Prisma-fetched PostgreSQL data. This component architecture is fundamental to all React applications integrated with Express backends.",
      scenario_id: "pern-lb-scenario-1",
      tasks: {
        create: [
          {
            task_name: "Prepare Development Environment",
            test_type: "client",
            user_story:
              "As a developer, I want to set up my development environment so that I can start working on the project.",
            learning_sections: {
              create: [
                {
                  title: "Overview\nSetting Up a PERN Stack Project",
                  content:
                    "This section introduces the crash course for preparing a PERN stack development environment. It provides a high-level view of the setup flow, required tools, and key concepts you need before starting the hands-on tasks.",
                  order: 1,
                },
                {
                  title: "What is the PERN Stack?",
                  content:
                    "PERN stands for PostgreSQL, Express, React, Node.js — four technologies that work together to build full-stack web apps.\n\nPostgreSQL — the database that stores your data\nExpress — a Node.js framework that handles your server and API routes\nReact — the frontend library that builds your user interface\nNode.js — the JavaScript runtime that runs your server code",
                  order: 2,
                },
                {
                  title: "How a PERN App is Structured",
                  content:
                    "A typical PERN project has three parts:\nroot/ ← workspace root (shared config, scripts)\n    ├── client/ ← React frontend\n    └── server/ ← Express backend\nEach part has its own package.json, which means you need to install dependencies in all three locations.",
                  order: 3,
                },
                {
                  title: "Package Management 101",
                  content:
                    "Package management is the process of managing external code dependencies a project relies on. A package manager (like pnpm or npm) handles installing, updating, and removing dependencies, ensuring the right versions are available.\n\nFor example: when you join an existing project, dependencies are not installed yet, so you run pnpm install (or npm install) to download all packages listed in package.json.",
                  order: 4,
                },
                {
                  title: "Change Directory (cd) Basics",
                  content:
                    "In development, you must run commands in the correct folder. Use cd (change directory) to move between root, client, and server before running installs or scripts.\n\nCommon commands:\ncd client → move from root to frontend folder\ncd ../server → move from client to server\ncd .. → move up one folder\n\nAlways check your current location before running a command, because package management commands affect the folder you are currently in.",
                  order: 5,
                },
                {
                  title: "Practice Lab: cd Navigation",
                  content:
                    "Practice navigating folders with cd. Use `ls` to list files/folders in your current directory and `pwd` to print your current path when you want to verify where you are.",
                  section_type: "INTERACTIVE" as const,
                  interactive_mode: "TERMINAL_CD" as const,
                  interactive_config: {
                    instructions:
                      "Goal: navigate to /workspace/client, then to /workspace/server, then back to /workspace. Tip: `ls` lists current directory contents and `pwd` prints your current path.",
                    initial_directory: "/workspace",
                    expected_commands: ["cd client", "cd ../server", "cd .."],
                    directory_tree: {
                      "/workspace": ["client", "server", "README.md"],
                      "/workspace/client": ["src", "package.json"],
                      "/workspace/server": ["src", "package.json"],
                    },
                  },
                  order: 6,
                },
                {
                  title: "Environment Variables",
                  content:
                    'Sensitive config (like database credentials) is stored in .env files — never hardcoded in source code. DATABASE_URL="postgresql://user:password@localhost:5432/mydb"\nPORT=3000\n The dotenv package reads these files and makes them available as process.env.DATABASE_URL in your code. ⚠️ .env files are listed in .gitignore intentionally — they contain secrets that should never be committed to version control. \n\n Note:\nIn this project, environment variables setup will be provided by us, so no need to set it up',
                  order: 7,
                },
                {
                  title: "What is Prisma?",
                  content:
                    "Prisma is a next-generation ORM (Object-Relational Mapper) for Node.js and TypeScript.  Its importance lies in giving developers compile-time type safety and autocomplete when working with databases, preventing the runtime errors common with raw SQL or traditional ORMs.\n\n It provides three main tools: Prisma Client (type-safe database access), Prisma Migrate (database schema evolution), and Prisma Studio (visual data browser).",
                  order: 8,
                },
                {
                  title: "Prisma Migrations",
                  content:
                    "A migration is a recorded change to your database schema (tables, columns, relationships). It generates and applies SQL migration files from changes made to the Prisma schema. Each migration file records the exact SQL needed to transition between schema versions, enabling version-controlled, reproducible database changes.\n\nMigrations are important because they keep all team members' databases synchronized. Without migrations, each developer would need to manually run SQL scripts against their local database, leading to inconsistencies and errors.",
                  order: 9,
                },
                {
                  title: "Key Takeaway",
                  content:
                    "Setting up a project isn't just installing packages — it's aligning your local environment (dependencies, env vars, database schema) so the app runs the same way for every developer on the team.",
                  order: 10,
                },
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
            acceptance_criteria: {
              create: [
                {
                  description:
                    "Dependencies installed for the root, client, and server without errors",
                  is_required: true,
                  order: 1,
                },
                {
                  description: "Prisma migrations executed successfully",
                  is_required: true,
                  order: 2,
                },
                {
                  description: "Both client and server running without errors",
                  is_required: true,
                  order: 3,
                },
              ],
            },
          },
          {
            task_name: "Update Brand Subtitle",
            test_type: "client",
            user_story:
              "As a user, I want to see the updated brand subtitle on the website so that the interface reflects the library identity.",
            learning_sections: {
              create: [
                {
                  title: "Overview\nReact Components and the UI Layer",
                  content:
                    "This section introduces the crash course for understanding React components and the UI layer. It gives a broad view of how interface elements are structured and where to make safe, task-focused UI updates.",
                  order: 1,
                },
                {
                  title: "What is a React Component?",
                  content:
                    "A React component is a reusable piece of UI — like a header, a button, or a card. Components are just JavaScript functions that return HTML-like syntax called JSX.",
                  order: 2,
                },
                {
                  title: "Layout Components",
                  content:
                    "In most React apps, elements like the header and footer live in layout components — shared wrappers used across multiple pages. This way, you change the header text in one place and it updates everywhere.\n\nA typical layout structure:\ncomponents/\n    └── layout/\n          ├── Header.tsx ← top navigation bar\n          ├── Sidebar.tsx ← side menu\n          └── Footer.tsx ← bottom bar",
                  order: 3,
                },
                {
                  title: "How to Find What to Change",
                  content:
                    "When you need to update something you see in the browser, ask:\nWhat element is it? (header, footer, sidebar?)\nWhich component renders it? (trace it to a file)\nIs the text hardcoded or coming from props/state? For a subtitle in the header, you'd look inside the layout's header component for a hardcoded string like \"Public Library\" or similar.",
                  order: 4,
                },
                {
                  title: "JSX Text Content",
                  content:
                    'Changing text in JSX is straightforward — it\'s just like editing HTML:\n// Before\n<p className="subtitle">Old Subtitle</p>\n// After\n<p className="subtitle">BookWise Public Library</p>',
                  order: 5,
                },
                {
                  title: "Verifying Your Change",
                  content:
                    "After editing, save the file and check the browser. React's dev server (via Vite or CRA) supports Hot Module Replacement (HMR) — meaning the page updates instantly without a full refresh when you save a file.",
                  order: 6,
                },
                {
                  title: "Practice Lab: Update Heading Text",
                  content:
                    "Practice a simple UI change by editing the text inside a heading element.",
                  section_type: "INTERACTIVE" as const,
                  interactive_mode: "CODE_EDITOR" as const,
                  interactive_config: {
                    instructions:
                      'Update the function output from "Hello World" to "Welcome Back".',
                    language: "tsx",
                    starter_code:
                      'export function getUpdatedHeadingText() {\n  return "Hello World";\n}\n',
                    editable_regions: [
                      {
                        placeholder: "Hello World",
                        case_sensitive: true,
                      },
                    ],
                    entry_point: "getUpdatedHeadingText",
                    test_cases: [
                      {
                        input: [],
                        expected: "Welcome Back",
                        label: "updated heading text",
                      },
                    ],
                  },
                  order: 7,
                },
                {
                  title: "Key Takeaway",
                  content:
                    "UI changes in React always trace back to a component file. Layout components are the first place to look for global elements like headers. Find the component, find the text, change it.",
                  order: 8,
                },
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
            acceptance_criteria: {
              create: [
                {
                  description:
                    'Header subtitle is exactly "BookWise Public Library"',
                  is_required: true,
                  order: 1,
                },
                {
                  description:
                    "Subtitle renders correctly on desktop and mobile layouts",
                  is_required: true,
                  order: 2,
                },
              ],
            },
          },
        ],
      },
    },
    {
      id: "pern-lb-level-2",
      title: "Client-Side Exploration",
      subtitle: "Investigate Client-Side Borrowing Logic and UI Helpers",
      order: 2,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      level_description:
        "Mission Briefing: Members report they cannot borrow books even when copies are available. Your task is to investigate the client-side availability logic and create a reusable helper function to ensure consistent borrow decisions across the React UI.",
      xp_reward: 25,
      coin_reward: 125,
      key_takeaways:
        "Pure functions in React applications that process Prisma query results from PostgreSQL are easier to test and debug. Centralizing business logic ensures consistent data handling across React components that consume Express API responses. This functional programming approach is essential for reliable React + Express + Prisma applications.\n\nClient-side utility functions in React ensure consistent logic when processing data from Express APIs powered by Prisma and PostgreSQL. When the same availability logic exists in multiple React components, shared utilities prevent inconsistencies and simplify maintenance. This approach ensures reliable data handling in React applications consuming Express + Prisma + PostgreSQL backends.",
      scenario_id: "pern-lb-scenario-1",
      tasks: {
        create: [
          {
            task_name: "Add Borrow Availability Helper",
            test_type: "client",
            user_story:
              "As a developer, I want a reusable availability helper, So that borrow decisions stay correct and consistent.",
            learning_sections: {
              create: [
                {
                  title:
                    "Overview\nPure Functions and Utility Helpers in React",
                  content:
                    "This section introduces the crash course for pure functions and reusable utility helpers in React. It outlines why centralized logic improves consistency, testability, and maintainability across related task workflows.",
                  order: 1,
                },
                {
                  title: "What is a Pure Function?",
                  content:
                    "A pure function is a function that:\n - Always returns the same output for the same input\n - Has no side effects (doesn't modify anything outside itself) \n// Pure function ✅\nfunction isBookAvailable(availableCopies: number): boolean { \n return availableCopies > 0; \n} \n// NOT pure ❌ — reads external state\n // depends on outside variable\nfunction isBookAvailable(): boolean {\n return globalBookCount > 0;\n}\n Pure functions are predictable, easy to test, and safe to reuse anywhere.",
                  order: 2,
                },
                {
                  title: "Why Centralize Logic in a Helper?",
                  content:
                    'Imagine the same availability check scattered across 5 different components: \n // In Books.tsx\nif (book.availableCopies > 0) { ... } \n // In BorrowRecords.tsx\nif (book.copies !== 0) { ... }  ← slightly different!\n // In Dashboard.tsx\nif (book.availableCopies >= 1) { ... } \n Each variation is a bug waiting to happen. If the rule changes (e.g., "reserve 1 copy for walk-ins"), you\'d need to update every file. With a centralized helper, every component imports uses the same logic.\nOne change = consistent behavior everywhere.',
                  order: 3,
                },
                {
                  title: "Where to Put Helpers",
                  content:
                    "In React projects, shared utility functions live in a utils/ folder: \nclient/\n    src/\n        └── utils/\n              └── helpers.ts ← shared helper functions go here",
                  order: 4,
                },
                {
                  title: "Boundary Conditions",
                  content:
                    "When writing availability logic, you need to handle edge cases — inputs at or near the boundary of expected values: \n| 5 | true (available) |\n| 1 | true (available) |\n| 0 | false (unavailable) |\n| -1 | false (unavailable — defensive) | \nThe 0 boundary is the most important: \na book with 0 copies is not available, even though 0 is technically a valid number.",
                  order: 5,
                },
                {
                  title: "Exporting from a Module",
                  content:
                    "To use your helper in other files, you must export it: \n// utils/helpers.ts\nexport function formatDate(dateString: string): string { \nreturn new Date(dateString).toLocaleDateString();\n} \nAnd import it where needed:\nimport { formatDate } from '../utils/formatters';",
                  order: 6,
                },
                {
                  title: "Practice Lab: Next Copy Counter",
                  content:
                    "Practice writing a very simple number utility before doing the real workspace task.",
                  section_type: "INTERACTIVE" as const,
                  interactive_mode: "CODE_EDITOR" as const,
                  interactive_config: {
                    instructions:
                      "Create getNextCopyCount(currentCopies) that returns currentCopies + 1.",
                    language: "javascript",
                    starter_code:
                      "export function getNextCopyCount(currentCopies) {\n  // TODO\n}\n",
                    editable_regions: [
                      {
                        placeholder: "// TODO",
                        case_sensitive: true,
                      },
                    ],
                    entry_point: "getNextCopyCount",
                    test_cases: [
                      { input: [0], expected: 1, label: "zero copies" },
                      { input: [1], expected: 2, label: "one copy" },
                      { input: [5], expected: 6, label: "five copies" },
                    ],
                  },
                  order: 7,
                },
                {
                  title: "Key Takeaway",
                  content:
                    "Small, focused pure functions are the building blocks of reliable code. By centralizing decision logic in a shared helper, you write it once, test it once, and trust it everywhere.",
                  order: 8,
                },
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
            acceptance_criteria: {
              create: [
                {
                  description:
                    "A helper is implemented and exported as `isBookAvailable` from `client/src/utils/helpers.ts`",
                  is_required: true,
                  order: 1,
                },
                {
                  description:
                    "The helper returns `false` when `availableCopies <= 0`",
                  is_required: true,
                  order: 2,
                },
                {
                  description:
                    "The helper returns `true` when `availableCopies > 0`",
                  is_required: true,
                  order: 3,
                },
                {
                  description:
                    "Borrow-availability decisions remain consistent for mixed copy counts (positive, zero, negative)",
                  is_required: true,
                  order: 4,
                },
                {
                  description:
                    "Repeated calls with the same input return the same output",
                  is_required: true,
                  order: 5,
                },
                {
                  description:
                    "Tests validate behavior and contract rather than enforcing one exact implementation style",
                  is_required: true,
                  order: 6,
                },
              ],
            },
          },
          {
            task_name: "Reuse Availability Logic",
            test_type: "client",
            user_story:
              "As a developer, I want BorrowRecords to use the shared availability helper, So that the logic stays consistent across views.",
            learning_sections: {
              create: [
                {
                  title:
                    "Overview\nRefactoring: Replacing Inline Logic with Shared Helpers",
                  content:
                    "This section introduces the crash course for refactoring inline checks into shared helpers. It provides a high-level guide for reducing duplication while keeping behavior stable across the task flow.",
                  order: 1,
                },
                {
                  title: "What is Refactoring?",
                  content:
                    "Refactoring means improving the structure of existing code without changing what it does. The behavior stays the same — but the code becomes cleaner, more consistent, and easier to maintain.",
                  order: 2,
                },
                {
                  title: "The Problem: Duplicated Logic",
                  content:
                    'When the same decision appears in multiple components with slight differences, bugs creep in:\n // Members.tsx\nconst showBadge = member.yearsActive >= 1;\n // Dashboard.tsx\nconst showBadge = member.activeYears > 0; ← different threshold!\nThese two checks look similar but behave differently at edge cases (e.g., someone with 11 months). If the membership criteria change, you\'d need to hunt down every inline check.',
                  order: 3,
                },
                {
                  title: "The Fix: Import and Reuse",
                  content:
                    "Replace the inline condition with the shared helper: \n// Before — inline logic\nconst showBadge = member.activeYears > 0;\n // After — shared helper\nimport { isEligibleForBadge } from '../utils/membership';\nconst showBadge = isEligibleForBadge(member.yearsActive); \nThe behavior is driven by the helper now. If the helper's rule ever changes, all components update automatically.",
                  order: 4,
                },
                {
                  title: "Finding Inline Checks to Replace",
                  content:
                    "When refactoring, search the codebase for patterns that mirror the logic you're centralizing. In this case, look for:\n - Direct comparisons involving member activity duration\n - Conditions used to show/hide member badges\n - Any boolean derived from years or membership metadata",
                  order: 5,
                },
                {
                  title:
                    "Non-Regression: Making Sure You Didn't Break Anything",
                  content:
                    'After refactoring, verify the feature still works the same way:\nMembers with 1+ active years → badge shown\nMembers with less than 1 year → badge hidden\nThe profile and member list pages both behave consistently\nRefactoring should be invisible to the user — same behavior, better code.',
                  order: 6,
                },
                {
                  title: "Practice Lab: Refactor Status Badge Rule",
                  content:
                    "Practice extracting an inline UI badge rule into a helper call.",
                  section_type: "INTERACTIVE" as const,
                  interactive_mode: "CODE_EDITOR" as const,
                  interactive_config: {
                    instructions:
                      "Refactor the page logic to use the helper. The helper is shown below for reference as if it came from another file, and this section represents the page where you should import and use it.",
                    language: "javascript",
                    starter_code:
                      '// helper file (shown for context; this lives in another file)\nfunction getBorrowBadgeLabel(record) {\n  if (record.returnedAt) return "Returned";\n  return "Active";\n}\n\n// page file section (this is where you refactor)\nimport { getBorrowBadgeLabel } from \'../utils/helpers\';\n\nexport function getBadgeForRecord(record) {\n  return record.returnedAt ? "Returned" : "Active";\n}\n',
                    required_code_includes: [
                      "return getBorrowBadgeLabel(record)",
                    ],
                    editable_regions: [
                      {
                        placeholder:
                          'record.returnedAt ? "Returned" : "Active"',
                        case_sensitive: true,
                      },
                    ],
                    entry_point: "getBadgeForRecord",
                    test_cases: [
                      {
                        input: [{ returnedAt: null }],
                        expected: "Active",
                        label: "active record badge output",
                      },
                      {
                        input: [{ returnedAt: "2026-01-10T00:00:00.000Z" }],
                        expected: "Returned",
                        label: "returned record badge output",
                      },
                    ],
                  },
                  order: 7,
                },
                {
                  title: "Key Takeaway",
                  content:
                    "Refactoring is a professional habit. Replace scattered inline conditions with centralized helpers to make your codebase consistent and easier to change safely in the future.",
                  order: 8,
                },
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
            acceptance_criteria: {
              create: [
                {
                  description:
                    "`BorrowRecords.tsx` uses `isBookAvailable` from `client/src/utils/helpers.ts` for availability filtering",
                  is_required: true,
                  order: 1,
                },
                {
                  description:
                    "Inline availability checks in `BorrowRecords.tsx` are replaced by helper usage",
                  is_required: true,
                  order: 2,
                },
                {
                  description:
                    "Availability filtering follows helper output, even when helper logic changes",
                  is_required: true,
                  order: 3,
                },
                {
                  description:
                    "Validation is outcome-based and allows different coding styles, as long as requirements are met",
                  is_required: true,
                  order: 4,
                },
                {
                  description:
                    "Borrow/Issue behavior remains correct after refactor",
                  is_required: true,
                  order: 5,
                },
                {
                  description:
                    "Only books with available copies are selectable in Issue Book flow after refactor",
                  is_required: true,
                  order: 6,
                },
                {
                  description:
                    "No regressions appear in related components using borrow flow",
                  is_required: true,
                  order: 7,
                },
                {
                  description:
                    "Tests should verify behavior/contract, not enforce one exact line-by-line implementation",
                  is_required: true,
                  order: 8,
                },
              ],
            },
          },
        ],
      },
    },
    {
      id: "pern-lb-level-3",
      title: "Debugging and Stabilizing the Backend",
      subtitle:
        "Trace return-flow issues and enforce transactional consistency.",
      order: 3,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      level_description:
        "Mission Briefing: Returning books occasionally causes negative available copy counts. Your mission is to debug the return flow, identify why the copy counts are going negative, and implement a fix to ensure the library's inventory stays accurate.",
      xp_reward: 40,
      coin_reward: 200,
      key_takeaways:
        "Prisma migrations synchronize your PostgreSQL database schema with your Express + React application code changes. They prevent schema drift between development, staging, and production environments, ensuring database consistency across the entire React + Express + Prisma stack. Migrations are essential for maintaining data integrity in production PostgreSQL databases.\n\nDatabase transactions in Prisma ensure atomic operations when updating related PostgreSQL records through Express APIs. They prevent partial updates that could leave your database inconsistent, which is critical for React applications handling financial and inventory data. Always wrap related database operations in transactions to maintain data integrity in Express + Prisma + PostgreSQL applications.",
      scenario_id: "pern-lb-scenario-1",
      tasks: {
        create: [
          {
            task_name: "Diagnose Return Flow",
            test_type: "server",
            user_story:
              "As a backend developer, I want to trace the return flow in the server, So that I can identify why available copy counts can become invalid.",
            learning_sections: {
              create: [
                {
                  title:
                    "Overview\nDebugging Backend Logic: Tracing a Data Flow",
                  content:
                    "This section introduces the crash course for tracing backend data flow during debugging. It gives an overview of how to inspect write sequences, isolate failure points, and identify the root cause of inconsistent task outcomes.",
                  order: 1,
                },
                {
                  title: 'What Does "Debugging" Mean Here?',
                  content:
                    "Debugging isn't just fixing errors — sometimes it means understanding why a system produces wrong data. In this case, the symptom is a record saying an action happened but a related value not reflecting it. Your job is to trace the code path that causes the mismatch.",
                  order: 2,
                },
                {
                  title: "A Two-Step Operation",
                  content:
                    "Consider a system that processes membership renewals:\n\nThe member's expiration date is extended by one year\nA payment transaction record is created\n\nBoth changes need to happen for the renewal to be valid — but what if only one of them does? The member thinks they renewed, but there's no payment record.",
                  order: 3,
                },
                {
                  title: "The Problem: Separate Writes",
                  content:
                    "If these two database updates are made in separate Prisma calls:\n\n// Step 1\nawait prisma.member.update({\n  where: { id },\n  data: { membershipExpires: newNextYear() }\n});\n\n// Step 2 — what if this crashes or the server restarts here?\nawait prisma.payment.create({\n  data: { memberId, amount, type: 'RENEWAL' }\n});\n\n...then a failure between Step 1 and Step 2 leaves the database in a partial state:\n\nThe member's expiry was extended ✅\nBut no payment was recorded ❌\n\nOver time, with repeated partial failures, records become unreliable and revenue tracking breaks.",
                  order: 4,
                },
                {
                  title: "How to Trace a Flow",
                  content:
                    'Open the controller responsible for processing renewals\nFind every prisma call inside the renewal function\nAsk: "What happens if the second write fails after the first succeeds?"\nLook for any conditional logic that might skip the payment record creation',
                  order: 5,
                },
                {
                  title: "Identifying the Root Cause",
                  content:
                    "Document what you find:\nWhich line does the member expiry update?\nWhich line does the payment record creation?\nAre they in the same operation, or separate?\nWhat scenario makes one succeed and the other fail? This kind of analysis — reading code to understand failure paths — is called root cause analysis and is a core backend engineering skill.",
                  order: 6,
                },
                {
                  title: "Practice Lab: Add Debug Checkpoints",
                  content:
                    "Practice adding structured debug checkpoints to trace a backend flow.",
                  section_type: "INTERACTIVE" as const,
                  interactive_mode: "CODE_EDITOR" as const,
                  interactive_config: {
                    instructions:
                      "Add three log checkpoints: before update, after first write, and after second write.",
                    language: "typescript",
                    starter_code:
                      "async function updateBorrowRecord() {\n  return true;\n}\n\nasync function updateInventory() {\n  return true;\n}\n\nexport async function returnBookFlow() {\n  // TODO: log \"before update\"\n  await updateBorrowRecord();\n  // TODO: log \"after first write\"\n  await updateInventory();\n  // TODO: log \"after second write\"\n}\n",
                    editable_regions: [
                      {
                        placeholder: "// TODO: log \"before update\"",
                        case_sensitive: false,
                      },
                      {
                        placeholder: "// TODO: log \"after first write\"",
                        case_sensitive: false,
                      },
                      {
                        placeholder: "// TODO: log \"after second write\"",
                        case_sensitive: false,
                      },
                    ],
                    entry_point: "returnBookFlow",
                    test_cases: [
                      {
                        input: [],
                        console_output:
                          "before update\nafter first write\nafter second write",
                        label: "checkpoint log order and content",
                      },
                    ],
                  },
                  order: 7,
                },
                {
                  title: "Key Takeaway",
                  content:
                    'When data becomes inconsistent, the bug is usually in a write sequence that can be interrupted. Trace every write in the flow, and ask: "What breaks if this step fails in isolation?"',
                  order: 8,
                },
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
            acceptance_criteria: {
              create: [
                {
                  description:
                    "A reproducible case for negative stock is documented",
                  is_required: true,
                  order: 1,
                },
                {
                  description:
                    "Problematic backend logic path is identified with evidence",
                  is_required: true,
                  order: 2,
                },
                {
                  description: "Backend controller/service flow is validated",
                  is_required: true,
                  order: 3,
                },
                {
                  description: "Prisma query sequence is validated",
                  is_required: true,
                  order: 4,
                },
              ],
            },
          },
          {
            task_name: "Enforce Transaction Safety",
            test_type: "server",
            user_story:
              "As a backend engineer, I want the borrow and return flows in `server/src/controllers/borrow.controller.ts` to run atomically, So that concurrent requests cannot corrupt `availableCopies` and partial writes are never persisted.",
            learning_sections: {
              create: [
                {
                  title:
                    "Overview\nDatabase Transactions and Atomic Operations",
                  content:
                    "This section introduces the crash course for database transactions and atomic operations. It explains the core idea behind all-or-nothing updates and why transaction safety is essential for reliable task behavior.",
                  order: 1,
                },
                {
                  title: "What is a Transaction?",
                  content:
                    "A database transaction is a group of operations that either all succeed or all fail together. There's no in-between.\n\nThink of it like a bank transfer:\nDeduct $100 from Account A\nAdd $100 to Account B\n\nIf step 2 fails after step 1, the money disappears. A transaction prevents this — it rolls back step 1 if step 2 fails.",
                  order: 2,
                },
                {
                  title: "Atomicity: All or Nothing",
                  content:
                    "The key property of transactions is atomicity — the entire group of writes is treated as one indivisible unit. Without transaction:\nWrite 1 succeeds ✅\nWrite 2 fails ❌ ← partial state remains in DB With transaction:\nWrite 1 succeeds ✅\nWrite 2 fails ❌ ← transaction rolls back Write 1 too\nResult: DB unchanged, consistent state preserved ✅",
                  order: 3,
                },
                {
                  title: "Prisma Transactions",
                  content:
                    "Prisma provides prisma.$transaction() to wrap multiple writes atomically:\n\nawait prisma.$transaction([\n  prisma.member.update({\n    where: { id },\n    data: { membershipTier: 'PREMIUM' }\n  }),\n  prisma.benefit.create({\n    data: { memberId, type: 'PRIORITY_SUPPORT' }\n  }),\n]);\n\nBoth writes succeed together, or neither is committed.",
                  order: 4,
                },
                {
                  title: "The Concurrency Problem",
                  content:
                    "Even with correct logic, concurrent requests can corrupt data.\n\nTimeline (no protection):\nRequest A checks event capacity = 10\nRequest B checks event capacity = 10\nRequest A registers → sets to 9\nRequest B registers → sets to 9 ← should have been rejected!\n\nResult: 2 registrations, but only 1 spot was available — the event is now over capacity.",
                  order: 5,
                },
                {
                  title: "Guard Conditions",
                  content:
                    "A conditional update prevents this by including a safety check in the update itself:\n\nprisma.event.updateMany({\n  where: {\n    id: eventId,\n    capacity: { gt: 0 } // only update if spots remain\n  },\n  data: {\n    capacity: { decrement: 1 }\n  },\n});\n\nIf 0 rows are updated, the registration is rejected — the event is already full.",
                  order: 6,
                },
                {
                  title: "Practice Lab: Atomic Transfer",
                  content:
                    "Implement an atomic transfer between two accounts. If there are sufficient funds, deduct from the sender and credit the recipient. If not, return the original balances unchanged — no partial state.",
                  section_type: "INTERACTIVE" as const,
                  interactive_mode: "CODE_EDITOR" as const,
                  interactive_config: {
                    instructions:
                      "Given senderBalance, receiverBalance, and amount, return [newSender, newReceiver]. Deduct and credit atomically — if sender has insufficient funds, return the original balances untouched.",
                    language: "javascript",
                    starter_code:
                      "function atomicTransfer(senderBalance, receiverBalance, amount) {\n  // TODO\n}\n",
                    editable_regions: [
                      {
                        placeholder: "// TODO",
                        case_sensitive: true,
                      },
                    ],
                    entry_point: "atomicTransfer",
                    test_cases: [
                      {
                        input: [100, 50, 30],
                        expected: [70, 80],
                        label: "sufficient funds — both accounts updated",
                      },
                      {
                        input: [10, 50, 30],
                        expected: [10, 50],
                        label: "insufficient funds — no change, no partial state",
                      },
                      {
                        input: [30, 20, 30],
                        expected: [0, 50],
                        label: "exact funds — full transfer completes",
                      },
                      {
                        input: [0, 100, 1],
                        expected: [0, 100],
                        label: "zero balance — transfer rejected atomically",
                      },
                    ],
                  },
                  order: 7,
                },
                {
                  title: "Key Takeaway",
                  content:
                    "Transactions protect against partial writes. Guard conditions protect against race conditions. Together, they ensure your data stays accurate even under concurrent load.",
                  order: 8,
                },
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
            acceptance_criteria: {
              create: [
                {
                  description:
                    "Return flow updates (`BorrowRecord` + `Book.availableCopies`) run in one Prisma transaction",
                  is_required: true,
                  order: 1,
                },
                {
                  description:
                    "If one write fails, no partial state is persisted",
                  is_required: true,
                  order: 2,
                },
                {
                  description:
                    "Concurrent borrow requests never reduce `availableCopies` below zero",
                  is_required: true,
                  order: 3,
                },
                {
                  description:
                    "Only valid borrow/return outcomes are committed under concurrent access",
                  is_required: true,
                  order: 4,
                },
              ],
            },
          },
        ],
      },
    },
    {
      id: "pern-lb-level-4",
      title: "Starting my Full-Stack Journey",
      subtitle: "Implement Reservation Queue and Lifecycle Management",
      order: 4,
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      level_description:
        "Mission Briefing: The Library is implementing a reservation system for popular books. Your task is to build a reservation feature that allows users to reserve a book when all copies are borrowed and receive notifications when the book becomes available.",
      xp_reward: 60,
      coin_reward: 300,
      key_takeaways:
        "Input validation and sanitization are critical for Express API security and PostgreSQL data integrity in React applications. They prevent malicious input from corrupting your database and protect against attacks. Always validate and sanitize user inputs in Express routes before they reach Prisma and PostgreSQL. This creates secure, reliable APIs that safely handle React frontend data submissions.\n\nProper error handling in Express APIs and React components creates better user experiences in full-stack applications. Clear error messages help users understand issues, while graceful error handling prevents React app crashes. Implement comprehensive error boundaries in React and meaningful error responses in Express routes. This ensures reliable, user-friendly React + Express + PostgreSQL + Prisma applications.",
      scenario_id: "pern-lb-scenario-1",
      tasks: {
        create: [
          {
            task_name: "Reserve an Unavailable Book",
            test_type: "both",
            user_story:
              "As a library member, I want to reserve a book when all copies are borrowed, So that I can claim it when it becomes available.",
            learning_sections: {
              create: [
                {
                  title:
                    "Overview\nFull-Stack Queue Management Systems",
                  content:
                    "Queue-based reservation systems are common across many domains — event ticketing, restaurant waitlists, customer support triage, and inventory allocation. This section introduces the full-stack patterns used to build them: server-side position tracking, conditional client presentation, and error handling for concurrent requests.",
                  order: 1,
                },
                {
                  title: "Full-Stack Architecture",
                  content:
                    "Full-stack architecture describes systems where a single feature spans three layers: a database for persistent state, an API server for business logic and data access, and a client for user interaction. Each layer has distinct responsibilities and communicates through well-defined contracts. The database owns the source of truth — queue position, status transitions, and constraints. The server enforces rules — who can join, what positions they get, and when state changes. The client presents the current state and triggers actions through the server.",
                  order: 2,
                },
                {
                  title: "Queue Systems",
                  content:
                    "A busy restaurant uses a waitlist when all tables are occupied. New parties are added to the end of the list. When a table opens, the party at the front is seated. Each entry records the party name, size, arrival time, and current status — WAITING, SEATED, or CANCELLED. The position in line is determined by arrival order and calculated by the host, not estimated by the customers. This same pattern — a FIFO queue with server-assigned positions and tracked states — appears in reservation systems across different industries.",
                  order: 3,
                },
                {
                  title: "Server-Side Queue Management",
                  content:
                    "In any queue system, position tracking and state transitions belong on the server. The server is the single authority — it reads the current queue count, assigns the next position, and validates entry conditions before inserting a new entry. In a restaurant, the host checks: is the restaurant at capacity? Is this party already on the list? Then they write the party name at the bottom of the waitlist. Position is calculated as the number of active entries plus one. This ensures every party gets a unique, sequential position regardless of how many hosts are managing the list simultaneously.",
                  order: 4,
                },
                {
                  title: "Client-Server Communication Pattern",
                  content:
                    "A dedicated communication layer sits between the client interface and the server. In a restaurant, the waiter relays orders from the customer to the kitchen and brings back the result. The customer never talks directly to the kitchen. Similarly, a client service layer abstracts API calls — it formats requests, sends them to the correct endpoint, and returns parsed responses to the UI. This separation keeps network concerns isolated from presentation logic and allows the API contract to change without affecting component code.",
                  order: 5,
                },
                {
                  title: "Conditional Presentation",
                  content:
                    "A restaurant display board near the entrance shows different information depending on current conditions. When tables are available, it reads \"Walk-ins Welcome — No Wait.\" When full, it shows \"Current Wait: 45 minutes — Join the List.\" After a party joins, their name appears with an estimated wait. This same pattern applies in queue interfaces: the UI reads state from the server response and renders the appropriate view — an action to join the queue, a confirmation with position, or an error message explaining why the action failed.",
                  order: 6,
                },
                {
                  title: "Error Handling in Queue Systems",
                  content:
                    "Queue systems have predictable failure modes. A party cannot join a waitlist twice — the host checks for duplicates before adding. An invalid party size (too large for any table) is rejected before reaching the queue. A restaurant at full capacity for the night may stop accepting new entries entirely. Each failure has a distinct response: already-registered, invalid-request, or service-unavailable. The same categories apply to digital queue systems — the server returns a specific error, and the client displays an appropriate message rather than a generic failure.",
                  order: 7,
                },
                {
                  title: "Practice Lab: Reservation Payload Validator",
                  content:
                    "Practice writing request-payload validation for reservation creation input.",
                  section_type: "INTERACTIVE" as const,
                  interactive_mode: "CODE_EDITOR" as const,
                  interactive_config: {
                    instructions:
                      "Validate required fields and return early errors before calling database logic.",
                    language: "javascript",
                    starter_code:
                      "function validateReservationPayload(body) {\n  // return true only when both IDs are positive numbers\n}\n",
                    editable_regions: [
                      {
                        placeholder:
                          "// return true only when both IDs are positive numbers",
                        case_sensitive: true,
                      },
                    ],
                    entry_point: "validateReservationPayload",
                    test_cases: [
                      {
                        input: [{ bookId: 4, memberId: 2 }],
                        expected: true,
                        label: "valid numeric IDs",
                      },
                      {
                        input: [{ bookId: 0, memberId: 2 }],
                        expected: false,
                        label: "zero bookId",
                      },
                      {
                        input: [{ bookId: 9, memberId: -1 }],
                        expected: false,
                        label: "negative memberId",
                      },
                      {
                        input: [{ bookId: "9", memberId: 2 }],
                        expected: false,
                        label: "string bookId",
                      },
                    ],
                  },
                  order: 8,
                },
                {
                  title: "Key Takeaway",
                  content:
                    "Queue management systems share a common architecture regardless of domain. The server owns position assignment and validation rules. The service layer decouples network communication from presentation. The client reads server state and renders the appropriate view. Error responses map to specific failure modes so the user receives clear, actionable information.",
                  order: 9,
                },
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
            acceptance_criteria: {
              create: [
                {
                  description:
                    "`POST /api/reservations` returns HTTP `201` with `{ success: true, data: Reservation }` for valid requests",
                  is_required: true,
                  order: 1,
                },
                {
                  description: "Request body includes `bookId` and `memberId`",
                  is_required: true,
                  order: 2,
                },
                {
                  description:
                    "Reservation create is allowed only when target book has `availableCopies === 0`",
                  is_required: true,
                  order: 3,
                },
                {
                  description:
                    "Duplicate active reservation for the same member and book returns HTTP `400`",
                  is_required: true,
                  order: 4,
                },
                {
                  description:
                    "Required implementation names are exact and case-sensitive: `createReservation` in `server/src/controllers/reservation.controller.ts`, `createReservation` in `client/src/services/libraryService.ts`, Route path is `/api/reservations` in `server/src/routes/reservation.routes.ts`",
                  is_required: true,
                  order: 5,
                },
                {
                  description:
                    "`GET /api/reservations?bookId=<id>` returns HTTP `200` with `{ success: true, data: ReservationQueueRow[] }`",
                  is_required: true,
                  order: 6,
                },
                {
                  description:
                    "Each queue row includes `id`, `bookId`, `memberId`, `queuePosition`, `status`, `createdAt`",
                  is_required: true,
                  order: 7,
                },
                {
                  description:
                    "Each queue row includes display-ready relation data: `member.name` and `book.title`",
                  is_required: true,
                  order: 8,
                },
                {
                  description:
                    "Queue response is ordered by `queuePosition` ascending",
                  is_required: true,
                  order: 9,
                },
                {
                  description:
                    "`client/src/pages/Books.tsx` renders `Reserve Book` only when `availableCopies` is `0`",
                  is_required: true,
                  order: 10,
                },
                {
                  description:
                    "Borrow action stays primary when `availableCopies` is greater than `0`",
                  is_required: true,
                  order: 11,
                },
                {
                  description:
                    "Reserve action triggers `createReservation(...)` from `client/src/services/libraryService.ts`",
                  is_required: true,
                  order: 12,
                },
                {
                  description:
                    "Reservation errors (book available, duplicate reservation, invalid member) are shown in UI",
                  is_required: true,
                  order: 13,
                },
                {
                  description:
                    "After successful reservation, UI confirms queue position (for example: `You are #3 in line.`)",
                  is_required: true,
                  order: 14,
                },
                {
                  description:
                    "Queue length and position display are based on backend response, not hard-coded client math",
                  is_required: true,
                  order: 15,
                },
                {
                  description:
                    "Empty queue state for a book displays `No active reservations.`",
                  is_required: true,
                  order: 16,
                },
              ],
            },
          },
          {
            task_name: "Fulfill and Manage Reservation Lifecycle",
            test_type: "both",
            user_story:
              "As a librarian, I want reservation fulfillment and cancellation to update queue order automatically, So that members always see accurate reservation status and position.",
            learning_sections: {
              create: [
                {
                  title: "Overview\nState Machines in Queue Systems",
                  content:
                    "State machines are a formal model for tracking the status of entities that move through predictable phases. Queue systems use state machines to manage entries as they progress from waiting to fulfillment or cancellation. This section covers state transitions, automatic promotion rules, and reindexing — patterns that appear in airport standby lists, hospital triage queues, and service ticket systems.",
                  order: 1,
                },
                {
                  title: "State Machines",
                  content:
                    "A state machine defines every state an entity can occupy and the valid transitions between them. An airport upgrade list has three states:\n\nPENDING → UPGRADED → (seat assigned, complete)\n             ↓\n         CANCELLED\n\nPENDING — passenger is on the upgrade waitlist, awaiting an available premium seat.\nUPGRADED — a premium seat opened and was assigned to this passenger.\nCANCELLED — the passenger withdrew from the upgrade list before being called.\n\nEach transition is explicit, and no state can skip a step — a PENDING entry cannot go directly to CANCELLED without a cancellation event. This predictability is what makes state machines reliable for queue management across different industries.",
                  order: 2,
                },
                {
                  title: "Transitions: Promotion and Cancellation",
                  content:
                    "When a premium seat opens on a flight, the airport system checks the upgrade list and promotes the first PENDING passenger (lowest position) to UPGRADED. This happens atomically — the seat is marked as assigned and the passenger record is updated together. No partial state should exist where a seat appears available but a passenger has already been assigned it.\n\nWhen a passenger cancels their upgrade request, the system marks that entry as CANCELLED and reindexes the remaining PENDING entries so positions stay continuous. If position 2 cancels:\n\nBefore:\nPosition 1 → Passenger A (PENDING)\nPosition 2 → Passenger B (PENDING) [cancel request]\nPosition 3 → Passenger C (PENDING)\n\nAfter reindex:\nPosition 1 → Passenger A\nPosition 2 → Passenger C ← was 3, now 2\n\nContinuous positions ensure passengers always see accurate queue numbers. Gaps would make the list unreliable for display and downstream processing.",
                  order: 3,
                },
                {
                  title: "Atomic Queue Mutations",
                  content:
                    "Both promotion and reindexing involve multiple writes — updating one record's status, reading remaining entries, updating their positions — that must succeed or fail together. A database transaction groups these writes into a single atomic unit. If the cancellation write succeeds but the reindexing fails partway through, the transaction rolls back both, leaving the queue in its original state. This prevents corrupted positions or orphaned upgrades. Atomicity is what ensures the queue stays consistent even when multiple passengers or staff members trigger changes simultaneously.",
                  order: 4,
                },
                {
                  title: "Displaying Queue State",
                  content:
                    "An airport departure screen shows each upgrade request with the passenger name, current position, and status — PENDING entries appear in the queue with their position, while UPGRADED entries show a confirmation message and CANCELLED entries are removed from the list. The screen also provides an action to cancel a pending request. All display data comes from the server — position numbers are calculated and stored server-side, not estimated or derived on the display board. This ensures every screen shows the same accurate queue state regardless of when it was last refreshed.",
                  order: 5,
                },
                {
                  title: "Practice Lab: Queue Snapshot Formatter",
                  content:
                    "Practice building a queue summary formatter for UI display.",
                  section_type: "INTERACTIVE" as const,
                  interactive_mode: "CODE_EDITOR" as const,
                  interactive_config: {
                    instructions:
                      "Map reservation rows into readable summary lines with position + member + status.",
                    language: "javascript",
                    starter_code:
                      'function formatQueueSnapshot(rows) {\n  // Return one summary string joined by " | "\n}\n',
                    editable_regions: [
                      {
                        placeholder:
                          '// Return one summary string joined by " | "',
                        case_sensitive: true,
                      },
                    ],
                    entry_point: "formatQueueSnapshot",
                    test_cases: [
                      {
                        input: [
                          [
                            {
                              queuePosition: 1,
                              memberName: "Ari",
                              status: "RESERVED",
                            },
                            {
                              queuePosition: 2,
                              memberName: "Bea",
                              status: "READY_FOR_PICKUP",
                            },
                          ],
                        ],
                        expected:
                          "#1 Ari [RESERVED] | #2 Bea [READY_FOR_PICKUP]",
                        label: "two-row queue",
                      },
                      {
                        input: [[]],
                        expected: "(empty queue)",
                        label: "empty queue",
                      },
                    ],
                  },
                  order: 6,
                },
                {
                  title: "Key Takeaway",
                  content:
                    "State machines provide a reliable framework for queue lifecycle management. Explicit states with defined transitions prevent invalid operations. Atomic transactions protect multi-step mutations from partial failures. Server-side position and status ownership ensures consistency across all clients. These principles apply to any queue system regardless of domain.",
                  order: 7,
                },
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
            acceptance_criteria: {
              create: [
                {
                  description:
                    "In `returnBook` flow, when a returned book has active reservations and stock becomes available, first queue entry is updated to `READY_FOR_PICKUP`",
                  is_required: true,
                  order: 1,
                },
                {
                  description:
                    "Queue progression updates happen in the same transactional boundary as return updates",
                  is_required: true,
                  order: 2,
                },
                {
                  description:
                    "Required implementation names are exact and case-sensitive: `returnBook` in `server/src/controllers/borrow.controller.ts`, `promoteNextReservation` in `server/src/controllers/reservation.controller.ts`",
                  is_required: true,
                  order: 3,
                },
                {
                  description:
                    "`DELETE /api/reservations/:id` (or equivalent cancel endpoint) marks reservation as `CANCELLED`",
                  is_required: true,
                  order: 4,
                },
                {
                  description:
                    "Cancellation triggers queue reindex so remaining active reservations have continuous positions (`1..n`)",
                  is_required: true,
                  order: 5,
                },
                {
                  description:
                    "Cancelling an already cancelled or fulfilled reservation returns HTTP `400`",
                  is_required: true,
                  order: 6,
                },
                {
                  description:
                    "Required implementation names are exact and case-sensitive: `cancelReservation` in `server/src/controllers/reservation.controller.ts`, `cancelReservation` in `client/src/services/libraryService.ts`",
                  is_required: true,
                  order: 7,
                },
                {
                  description:
                    "Client provides a reservation list view for the member showing `book.title`, `queuePosition`, and `status`",
                  is_required: true,
                  order: 8,
                },
                {
                  description:
                    "Rows with `READY_FOR_PICKUP` are visually distinct from `RESERVED`",
                  is_required: true,
                  order: 9,
                },
                {
                  description: "Empty state displays `No reservations found.`",
                  is_required: true,
                  order: 10,
                },
                {
                  description:
                    "On successful cancellation, UI confirms: `Reservation cancelled.`",
                  is_required: true,
                  order: 11,
                },
                {
                  description:
                    "On queue updates, affected members see updated position values from backend response",
                  is_required: true,
                  order: 12,
                },
                {
                  description:
                    "UI never computes lifecycle status from local assumptions; it uses server status output",
                  is_required: true,
                  order: 13,
                },
              ],
            },
          },
        ],
      },
    },
    {
      id: "pern-lb-level-5",
      title: "The Production Struggle",
      subtitle: "Investigate and fix a critical production issue.",
      order: 5,
      deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      level_description:
        "Mission Briefing: Congratulations! The project is in production, but a critical issue has been reported by the client. Your mission is to investigate the problem, identify the root cause, and deliver a fix as soon as possible to maintain system reliability.",
      xp_reward: 75,
      coin_reward: 375,
      key_takeaways:
        "Pagination is essential for handling large datasets in React applications consuming Express APIs with PostgreSQL. It improves frontend performance and user experience by loading data incrementally instead of overwhelming the React UI with massive datasets. Implement proper pagination with clear navigation controls and loading states for scalable React + Express + PostgreSQL applications.\n\nAutomated testing is crucial for maintaining code quality in React + Express + Prisma + PostgreSQL applications. Tests ensure that React component changes, Express API modifications, and Prisma database operations work correctly together and prevent regressions. Always write tests for critical business logic and user interactions to maintain reliable full-stack applications.",
      scenario_id: "pern-lb-scenario-1",
      tasks: {
        create: [
          {
            task_name: "Stabilize Overdue Report Classification",
            test_type: "server",
            user_story:
              "As a developer, I want the overdue report to classify records by source-of-truth fields, So that client-visible overdue output remains correct even with stale status data.",
            learning_sections: {
              create: [
                {
                  title:
                    "Overview\nSource of Truth vs. Derived State",
                  content:
                    "Software systems often store both source-of-truth fields — set once by a real-world event and never changed — alongside derived fields computed from that source data. When the derivation logic fails or is skipped, the derived field becomes stale while the source field remains accurate. Identifying which fields are authoritative is a core debugging skill across inventory, booking, and financial systems.",
                  order: 1,
                },
                {
                  title: "Stale State in Production",
                  content:
                    "A hotel management system reports a room as 'occupied' even after the guest has checked out and left. This is a stale-data classification bug — the system is relying on a room status field (OCCUPIED, VACANT, DIRTY) that was not updated when the checkout occurred. The actual checkout time was recorded correctly, but the derived status field never transitioned from OCCUPIED to VACANT. The bug manifests as incorrect reports — cleaning staff are not dispatched to the room, and the front desk cannot reassign it.",
                  order: 2,
                },
                {
                  title: "Source of Truth vs. Derived Fields",
                  content:
                    "Most database tables contain two kinds of fields. A source-of-truth field is written exactly once by a real-world event and never changed afterward — a checkout timestamp is set when the guest actually leaves. A derived field like room status (OCCUPIED, VACANT) is computed from source data and updated as a secondary step. If the update script is skipped due to a network error, a process crash, or a code path that forgets the update, the derived field becomes stale while the source field remains correct.\n\nA booking record might show:\nRoom status: OCCUPIED (stale — never updated)\nActual checkout: 2024-01-10 09:13 UTC (source of truth — guest definitely left)\n\nThe room status says occupied, but the checkout timestamp proves the guest is gone. The source-of-truth field is the reliable one.",
                  order: 3,
                },
                {
                  title: "Querying by Source of Truth",
                  content:
                    "The fix is to query using the field that cannot lie. Instead of filtering records by derived status — which may be stale — the query should use the source-of-truth timestamp. Rooms with an actual checkout timestamp set are vacant regardless of what their status field says. Rooms with no checkout timestamp and a scheduled departure date in the past are overstaying — these are the records that should appear in the report. This approach is immune to stale status values because the source field is only written when the real event occurs.",
                  order: 4,
                },
                {
                  title: "Time Boundaries in Classifications",
                  content:
                    "Any classification that depends on time is sensitive to boundary conditions. A guest who checked out at midnight should be classified the same way whether the query runs at 23:59 or 00:01. Using fixed UTC timestamps eliminates timezone ambiguity — the boundary between 'still here' and 'overstaying' is the same regardless of where the server or client is located. Deterministic timestamps also make bugs reproducible: if a test passes at 2 PM but fails at midnight, the likely cause is a timezone-relative comparison rather than a logic error.",
                  order: 5,
                },
                {
                  title: "Regression Tests for Classification Bugs",
                  content:
                    "A regression test is written specifically to reproduce an identified bug so the same issue cannot re-enter the system undetected. The test creates a record with the stale-state scenario — a checkout timestamp set but the derived status still showing as occupied — and asserts that the corrected query excludes it. Once the fix is applied and the test passes, any future code change that reintroduces the stale-state bug will cause the test to fail. This creates a permanent safety net for classification logic.",
                  order: 6,
                },
                {
                  title: "Practice Lab: Overdue Label Helper",
                  content:
                    "Practice writing a small helper that labels records as overdue/not overdue.",
                  section_type: "INTERACTIVE" as const,
                  interactive_mode: "CODE_EDITOR" as const,
                  interactive_config: {
                    instructions:
                      'Create a helper that returns "OVERDUE" or "ON_TIME" from dueDate + returnedAt.',
                    language: "javascript",
                    starter_code:
                      "function getOverdueLabel(dueDate, returnedAt) {\n  // TODO\n}\n",
                    editable_regions: [
                      {
                        placeholder: "// TODO",
                        case_sensitive: true,
                      },
                    ],
                    entry_point: "getOverdueLabel",
                    test_cases: [
                      {
                        input: ["2024-01-01T00:00:00.000Z", null],
                        expected: "OVERDUE",
                        label: "past due and not returned",
                      },
                      {
                        input: ["3024-01-01T00:00:00.000Z", null],
                        expected: "ON_TIME",
                        label: "future due and not returned",
                      },
                      {
                        input: [
                          "2024-01-01T00:00:00.000Z",
                          "2024-01-02T00:00:00.000Z",
                        ],
                        expected: "ON_TIME",
                        label: "already returned",
                      },
                    ],
                  },
                  order: 7,
                },
                {
                  title: "Key Takeaway",
                  content:
                    "Source-of-truth fields — those set directly by a real-world event — are the authoritative basis for classification queries. Derived fields computed from source data can become stale when update pathways fail. Queries built around source fields produce correct results regardless of stale derived state. Regression tests capture the specific stale-state scenario so the classification logic stays reliable across code changes.",
                  order: 8,
                },
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
            acceptance_criteria: {
              create: [
                {
                  description:
                    "`/api/borrow-records/overdue` excludes any record with `returnedAt != null` regardless of status value",
                  is_required: true,
                  order: 1,
                },
                {
                  description:
                    "`/api/borrow-records/overdue` includes past-due unreturned records",
                  is_required: true,
                  order: 2,
                },
                {
                  description:
                    "A stale-status discrepancy case is reproducible and covered by tests",
                  is_required: true,
                  order: 3,
                },
                {
                  description:
                    "A UTC midnight boundary case is covered by deterministic test data",
                  is_required: true,
                  order: 4,
                },
              ],
            },
          },
          {
            task_name: "Deliver Permanent Fix and Documentation",
            test_type: "server",
            user_story:
              "As a developer, I want to fix overdue mismatches and document the root cause, So that the client can trust overdue reports.",
            learning_sections: {
              create: [
                {
                  title:
                    "Overview\nDurable Production Fixes",
                  content:
                    "Fixing a production bug involves more than patching the immediate symptom. A durable fix follows three phases: a regression test that reproduces the bug, a code change that addresses the root cause, and documentation that prevents recurrence. This pattern applies across all software domains — e-commerce, logistics, finance, and booking systems alike.",
                  order: 1,
                },
                {
                  title: "The Fix Workflow",
                  content:
                    "A production fix follows a sequence of four steps. First, a regression test is written that reproduces the bug — the test fails, confirming the issue exists in the current code. Second, the root cause is addressed in the code. Third, the test is run again — a pass confirms the fix works. Fourth, the corrected logic is centralized into a shared utility so the same pattern is used everywhere, preventing future drift. This workflow ensures the fix is verifiable and permanent rather than a one-off patch.",
                  order: 2,
                },
                {
                  title: "Regression Test First",
                  content:
                    "Writing the test before the fix is a verification tool. The failing test proves the bug is reproducible and the current code is incorrect. After the fix, the passing test proves the fix addresses the specific case. If future changes reintroduce the same stale-state scenario, the test fails again. For example, an e-commerce system with an order status bug would create an order record where the shipment timestamp is set but the status still shows PROCESSING, then assert that the order does not appear in the shipped report. The same test construct works for any classified data — create the stale scenario, run the query, verify the record is correctly included or excluded based on source fields rather than derived status.",
                  order: 3,
                },
                {
                  title: "Centralizing Shared Logic",
                  content:
                    "When the same classification logic appears in multiple places — a query filter, a display helper, a notification trigger — each copy can drift independently. A shared utility function that encapsulates the condition ensures every part of the system makes the same decision. The function takes the relevant source-of-truth fields as parameters and returns a boolean. All code paths that need the classification call this single function instead of reimplementing the condition. This prevents the original class of bug — where one code path used source fields while another used derived status — from recurring.",
                  order: 4,
                },
                {
                  title: "Incident Postmortem Structure",
                  content:
                    "A postmortem is a short document written after a production incident. It is not about assigning responsibility — it is a technical record that captures what happened and how to prevent it from happening again. A postmortem has four sections. Symptom describes what the user or system observed. Root Cause identifies the technical reason — for example, a query filtering by derived status instead of source-of-truth timestamp. Fix documents what was changed and where. Prevention describes what guardrails — regression tests, centralized utilities, or process changes — now exist to stop the same issue from recurring.",
                  order: 5,
                },
                {
                  title: "Practice Lab: Incident Timeline Note",
                  content:
                    "Practice drafting a concise incident timeline separate from the full postmortem.",
                  section_type: "INTERACTIVE" as const,
                  interactive_mode: "CODE_EDITOR" as const,
                  interactive_config: {
                    instructions:
                      "Write a 4-line timeline: detection, impact window, mitigation, and final verification.",
                    language: "javascript",
                    starter_code:
                      'export function formatIncidentTimeline() {\n  return [\n    "- Detection: [detection detail]",\n    "- Impact Window: [impact window]",\n    "- Mitigation: [mitigation step]",\n    "- Verification: [verification result]",\n  ].join("\\n");\n}\n',
                    editable_regions: [
                      {
                        placeholder: "[detection detail]",
                        case_sensitive: false,
                      },
                      {
                        placeholder: "[impact window]",
                        case_sensitive: false,
                      },
                      {
                        placeholder: "[mitigation step]",
                        case_sensitive: false,
                      },
                      {
                        placeholder: "[verification result]",
                        case_sensitive: false,
                      },
                    ],
                    entry_point: "formatIncidentTimeline",
                    test_cases: [
                      {
                        input: [],
                        expected:
                          "- Detection: Alert from overdue report\n- Impact Window: 09:00-11:00 UTC\n- Mitigation: query patched\n- Verification: regression test passed",
                        label: "required incident timeline output",
                      },
                    ],
                  },
                  order: 6,
                },
                {
                  title: "Key Takeaway",
                  content:
                    "A durable production fix combines three elements: a regression test that reproduces and guards against the bug, a centralized utility that ensures consistent classification logic across all code paths, and a postmortem that documents the root cause and prevention measures. This triad prevents the same issue from recurring regardless of which developer touches the code in the future.",
                  order: 7,
                },
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
            acceptance_criteria: {
              create: [
                {
                  description: "Incorrect overdue markings are resolved",
                  is_required: true,
                  order: 1,
                },
                {
                  description: "Returned items are no longer listed overdue",
                  is_required: true,
                  order: 2,
                },
                {
                  description:
                    "Overdue reports match source borrowing and return records",
                  is_required: true,
                  order: 3,
                },
                {
                  description: "Spot checks confirm data consistency",
                  is_required: true,
                  order: 4,
                },
                {
                  description: "Root cause is documented",
                  is_required: true,
                  order: 5,
                },
                {
                  description:
                    "Fix approach and validation steps are documented",
                  is_required: true,
                  order: 6,
                },
              ],
            },
          },
        ],
      },
    },
];
