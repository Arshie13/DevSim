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
        "Mission Briefing: The library has onboarded a new developer and needs the system running locally. Set up the PERN (Postgres, Express, React, NodeJs) stack, configure the database, and make minor UI tweaks to get the application running properly in a local development environment.",
      xp_reward: 100,
      coin_reward: 50,
      key_takeaways:
        "Setting up a PERN development environment requires understanding package management (pnpm), environment variables for securing database connections, and Prisma migrations to synchronize PostgreSQL schemas. This ensures consistent development across team members and reliable deployments.\n\nReact component props enable parent-to-child data flow, creating dynamic UIs that display data from Express APIs. Understanding component hierarchy and prop passing is essential for building maintainable React applications that consume Prisma-fetched PostgreSQL data. This component architecture is fundamental to all React applications integrated with Express backends.",
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
                    "This section introduces the crash course for preparing a PERN stack development environment. It provides a high-level view of the setup flow, required tools, and foundational concepts relevant to the setup process.",
                  order: 1,
                },
                {
                  title: "What is the PERN Stack?",
                  content:
                    "PERN stands for PostgreSQL, Express, React, Node.js — four technologies that work together to build full-stack web applications.\n\nPostgreSQL — a relational database management system for persistent data storage\nExpress — a Node.js framework for handling server logic and API routing\nReact — a frontend library for building component-based user interfaces\nNode.js — a JavaScript runtime for executing server-side code",
                  order: 2,
                },
                {
                  title: "How a PERN App is Structured",
                  content:
                    "A PERN project is divided into three directories:\nroot/ ← workspace root (shared config, scripts)\n    ├── client/ ← React frontend\n    └── server/ ← Express backend\nEach directory contains its own package.json, meaning dependency installation must be performed in all three locations.",
                  order: 3,
                },
                {
                  title: "Package Management 101",
                  content:
                    "Package management is the process of managing external code dependencies a project relies on. A package manager (such as pnpm) handles installing, updating, and removing dependencies, ensuring the correct versions are available.\n\nIn an existing project with a package.json file, running pnpm install downloads all listed dependencies. This must be done for each directory that contains a package.json — root, client, and server.",
                  order: 4,
                },
                {
                  title: "Change Directory (cd) Basics",
                  content:
                    "Terminal commands are executed relative to the current working directory. The cd (change directory) command moves between directories before running installs or scripts.\n\nCommon commands:\ncd client → move from root to the frontend folder\ncd ../server → move from client to server\ncd .. → move up one folder\n\nThe current directory determines which package.json a package manager reads, so commands must be run from the correct location.",
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
                    'Sensitive configuration such as database credentials is stored in .env files rather than hardcoded in source code. DATABASE_URL="postgresql://user:password@localhost:5432/mydb"\nPORT=3000\nThe dotenv package reads these files and provides the values via process.env in Node.js. .env files are listed in .gitignore because they contain secrets that should not be committed to version control.\n\nNote: Environment variables in this project are pre-configured.',
                  order: 7,
                },
                {
                  title: "What is Prisma?",
                  content:
                    "Prisma is an ORM (Object-Relational Mapper) for Node.js and TypeScript. It provides compile-time type safety and autocomplete when working with databases, helping prevent runtime errors during database access.\n\nPrisma provides three main tools: Prisma Client (type-safe database access), Prisma Migrate (database schema evolution), and Prisma Studio (visual data browser).",
                  order: 8,
                },
                {
                  title: "Prisma Migrations",
                  content:
                    "A migration is a recorded change to a database schema — tables, columns, and relationships. It generates SQL migration files from changes made to the Prisma schema and applies them to the database. Each migration file records the exact SQL needed to transition between schema versions, enabling version-controlled, reproducible database changes.\n\nMigrations keep all team members' database schemas synchronized. When the schema is updated and a migration is created, every developer applies the same migration to their local database, ensuring consistency across environments.",
                  order: 9,
                },
                {
                  title: "Key Takeaway",
                  content:
                    "Setting up a project involves aligning the local environment — dependencies, environment variables, and database schema — so the application runs consistently for every developer on the team.",
                  order: 10,
                },
              ],
            },
            hints: {
              create: [
                {
                  description:
                    "Run `pnpm install` three times, one per directory that has a `package.json`: first at the project root, then inside `client/`, then inside `server/`. The root `node_modules` must contain `concurrently`, `client/node_modules` must contain `react`, and `server/node_modules` must contain both `express` and `@prisma/client`. Run each install from the correct directory so its own `node_modules` is populated.",
                  order: 1,
                },
                {
                  description:
                    "From the `server` directory, run `pnpm exec tsx scripts/db-check.ts`. It runs `SELECT 1` through Prisma, prints `DB_OK`, and must exit 0.",
                  order: 2,
                },
                {
                  description:
                    "Apply the schema with `pnpm exec prisma migrate deploy --schema prisma/schema.prisma`, then run `prisma migrate status` and confirm the output says `Database schema is up to date`.",
                  order: 3,
                },
                {
                  description:
                    "Start the backend and confirm the health endpoint responds. The `/health` route (not `/api/health`) must return HTTP 200 with `ok` in the body.",
                  order: 4,
                },
                {
                  description:
                    "The frontend must render its React root into an element whose id is exactly `root` — the served HTML must contain `<div id=\"root\">`. If the mount node uses a different id the client check never passes.",
                  order: 5,
                },
              ],
            },
            order: 1,
            acceptance_criteria: {
              create: [
                {
                  description:
                    "`<projectRoot>/node_modules` exists and contains the `concurrently` package",
                  is_required: true,
                  order: 1,
                },
                {
                  description:
                    "`client/node_modules` exists and contains the `react` package",
                  is_required: true,
                  order: 2,
                },
                {
                  description:
                    "`server/node_modules` exists and contains both `express` and `@prisma/client`",
                  is_required: true,
                  order: 3,
                },
                {
                  description:
                    "`pnpm exec tsx scripts/db-check.ts` run from `server` exits with code 0 and its stdout contains `DB_OK`, proving the `DATABASE_URL` connection actually reaches PostgreSQL",
                  is_required: true,
                  order: 4,
                },
                {
                  description:
                    "`pnpm exec prisma migrate deploy --schema prisma/schema.prisma` exits with code 0 and a follow-up `prisma migrate status` exits 0 with output containing `Database schema is up to date`",
                  is_required: true,
                  order: 5,
                },
                {
                  description:
                    "`pnpm run dev` in `server` with `PORT=5051` serves `GET /health`, which returns HTTP 200 with `ok` in the response body",
                  is_required: true,
                  order: 6,
                },
                {
                  description:
                    "`pnpm run dev` in `client` with `PORT=3000` serves `GET http://127.0.0.1:3000`, which returns HTTP 200 with an HTML body containing `<div id=\"root\">`",
                  is_required: true,
                  order: 7,
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
                    "To locate the source of a UI element visible in the browser:\nWhat element is it? (header, footer, sidebar?)\nWhich component renders it? (trace it to a file)\nIs the text hardcoded or coming from props/state? For a subtitle in the header, the hardcoded string is located inside the layout's header component, such as \"Public Library\" or a similar label.",
                  order: 4,
                },
                {
                  title: "JSX Text Content",
                  content:
                    'Changing text in JSX is straightforward — it\'s just like editing HTML:\n// Before\n<p className="subtitle">Old Subtitle</p>\n// After\n<p className="subtitle">BookWise Public Library</p>',
                  order: 5,
                },
                {
                  title: "Verifying the Change",
                  content:
                    "After editing a component file, saving triggers the dev server to update the browser. React's dev server via Vite supports Hot Module Replacement (HMR) — the page updates instantly without a full refresh when a file is saved.",
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
                      "Update the function to return \"Welcome Back\" instead of \"Hello World\". Return type: string.",
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
                  
                    hints: [
                      "Simple text change. Find the current string and swap it.",
                      "The return statement has \"Hello World\". Replace it with \"Welcome Back\".",
                      "return \"___\" — what string?"
                    ],
                  },
                  order: 7,
                },
                {
                  title: "Key Takeaway",
                  content:
                    "UI changes in React trace back to a component file. Layout components are the primary location for global elements such as headers. The source text is found inside the component and modified there.",
                  order: 8,
                },
              ],
            },
            hints: {
              create: [
                {
                  description:
                    "The subtitle lives in the default-exported `Sidebar` component, which is rendered on its own with no props — the component itself must render the new brand text.",
                  order: 1,
                },
                {
                  description:
                    "Put `BookWise Public Library` on its own element rather than concatenating it with other words, so the text matches exactly.",
                  order: 2,
                },
                {
                  description:
                    "The old `Library Management System` text must be gone from the rendered output — remove it entirely rather than leaving it as a comment.",
                  order: 3,
                },
                {
                  description:
                    "The element must be visible — do not hide it with `hidden`, `display: none`, `visibility: hidden`, `opacity: 0`, or an `sr-only` clip.",
                  order: 4,
                },
                {
                  description:
                    "The component is already wrapped in `MemoryRouter` and `AuthProvider`, so do not add a second `BrowserRouter` inside it.",
                  order: 5,
                },
              ],
            },
            order: 2,
            acceptance_criteria: {
              create: [
                {
                  description:
                    "`client/src/components/layout/Sidebar.tsx` exports `Sidebar`, and rendering it displays the exact text `BookWise Public Library` (exact casing, single space between the words)",
                  is_required: true,
                  order: 1,
                },
                {
                  description:
                    "The old subtitle `Library Management System` does not appear anywhere in the rendered `Sidebar` output",
                  is_required: true,
                  order: 2,
                },
                {
                  description:
                    "The `BookWise Public Library` element is visible when rendered (`toBeVisible()`) - not `hidden`, `display:none`, `visibility:hidden`, `opacity:0`, or visually clipped",
                  is_required: true,
                  order: 3,
                },
                {
                  description:
                    "`Sidebar` renders without throwing when wrapped only in `MemoryRouter` and `AuthProvider`, with no layout or route wrapper and no props",
                  is_required: true,
                  order: 4,
                },
                {
                  description:
                    "The new subtitle lives on its own element, so `getByText('BookWise Public Library')` matches exactly one node",
                  is_required: true,
                  order: 5,
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
                      "Implement getNextCopyCount(currentCopies) that returns the next copy count as a number.\n\nExamples:\n  getNextCopyCount(0) → 1\n  getNextCopyCount(1) → 2\n  getNextCopyCount(5) → 6\n\nA single arithmetic expression.",
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
                  
                    hints: [
                      "Add 1 to the input.",
                      "Think step by step about what operation transforms your input into the output you need. Break it down into smaller sub-problems and solve each one.",
                      "return currentCopies + ___;"
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
                    "Create `client/src/utils/helpers.ts` and export a named `isBookAvailable` function — a default export or unexported const will not work.",
                  order: 1,
                },
                {
                  description:
                    "Return `true` when `availableCopies > 0`, `false` otherwise. The boundary is `0`: `isBookAvailable(0)` and `isBookAvailable(-1)` must be `false`; `isBookAvailable(1)` and `isBookAvailable(2)` must be `true`.",
                  order: 2,
                },
                {
                  description:
                    "Do not round the input. Values like `0.0001` must return `true` — any rounding collapses them to `0` and wrongly returns `false`.",
                  order: 3,
                },
                {
                  description:
                    "The function must be pure: same input always returns the same output, with no caching or side effects.",
                  order: 4,
                },
                {
                  description:
                    "The function takes a single `number` argument and returns `boolean`. An object or `book` parameter would receive `undefined` and fail.",
                  order: 5,
                },
              ],
            },
            order: 1,
            acceptance_criteria: {
              create: [
                {
                  description:
                    "Importing `client/src/utils/helpers` yields a module whose `isBookAvailable` property is a function (named export, exact name and casing)",
                  is_required: true,
                  order: 1,
                },
                {
                  description:
                    "`isBookAvailable(0)` and `isBookAvailable(-1)` both return `false`",
                  is_required: true,
                  order: 2,
                },
                {
                  description:
                    "`isBookAvailable(1)` and `isBookAvailable(2)` both return `true`",
                  is_required: true,
                  order: 3,
                },
                {
                  description:
                    "Mapping the mixed list `[3, 1, 0, -2]` through the helper yields exactly `[true, true, false, false]`",
                  is_required: true,
                  order: 4,
                },
                {
                  description:
                    "Repeated calls with the same input return the same value (`0`, `1`, `-5` and `5` are each checked twice and must agree) - the helper is pure",
                  is_required: true,
                  order: 5,
                },
                {
                  description:
                    "`isBookAvailable(Number.EPSILON)` returns `true` and `isBookAvailable(0.0001)` returns `true`, so no rounding, truncation, or `>= 1` threshold is used",
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
                    'When the same decision logic appears in multiple components with slight differences, bugs can appear:\n // Members.tsx\nconst showBadge = member.yearsActive >= 1;\n // Dashboard.tsx\nconst showBadge = member.activeYears > 0; ← different threshold!\nThese two checks look similar but behave differently at edge cases such as someone with 11 months of activity. When membership criteria change, every inline check must be located and updated individually.',
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
                    "During refactoring, patterns that mirror the centralized logic are searched for in the codebase. These include:\n - Direct comparisons involving the same field\n - Conditions used to show or hide UI elements\n - Any boolean derived from related data",
                  order: 5,
                },
                {
                  title:
                    "Non-Regression: Confirming Behavior Is Preserved",
                  content:
                    'After refactoring, the feature should be verified to work the same way:\nMembers with 1+ active years → badge shown\nMembers with less than 1 year → badge hidden\nThe profile and member list pages both behave consistently\nRefactoring should be invisible to the user — same behavior, better code structure.',
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
                      "Refactor to call getBorrowBadgeLabel helper instead of reimplementing. Do not reimplement — call the existing function.",
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
                  
                    hints: [
                      "Pass the record to getBorrowBadgeLabel.",
                      "Think step by step about what operation transforms your input into the output you need. Break it down into smaller sub-problems and solve each one.",
                      "return ___(record);"
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
                    "In `BorrowRecords`, read `books`, `members`, `loading`, `borrowBookMember`, `getBorrowerName`, `error`, and `clearError` from a single `useLibrary()` call — do not import anything else from that context.",
                  order: 1,
                },
                {
                  description:
                    "Import `isBookAvailable` from `client/src/utils/helpers` (not a local copy) and keep any other exports in `helpers.ts` intact.",
                  order: 2,
                },
                {
                  description:
                    "Call `isBookAvailable` for each book when filtering — an inline `availableCopies > 0` check will not invoke the helper.",
                  order: 3,
                },
                {
                  description:
                    "Option labels must be exactly `` `${book.title} (${book.availableCopies} available)` `` — use `availableCopies`, not `totalCopies`, and avoid extra words.",
                  order: 4,
                },
                {
                  description:
                    "The select must have a placeholder option `Select a book` and an accessible name (label or aria-label) so it can be found.",
                  order: 5,
                },
                {
                  description:
                    "The trigger button must be reachable by `+ Issue Book` and the dismiss by `Cancel`. Closing the modal must clear the selected book so reopening produces the same option list.",
                  order: 6,
                },
              ],
            },
            order: 2,
            acceptance_criteria: {
              create: [
                {
                  description:
                    "`client/src/pages/BorrowRecords.tsx` exports `BorrowRecords` and renders an Issue Book button whose accessible name matches `/\\+ Issue Book/i`; clicking it opens a modal containing a `<select>`",
                  is_required: true,
                  order: 1,
                },
                {
                  description:
                    "That `<select>` always contains a first option labelled exactly `Select a book` as the placeholder",
                  is_required: true,
                  order: 2,
                },
                {
                  description:
                    "`isBookAvailable` from `client/src/utils/helpers` is invoked once per candidate book with that book's `availableCopies` - for a book list with `availableCopies` of 1, 0 and 2 the helper is called with `1`, `0` and `2` (asserted via `toHaveBeenCalledWith`); no inline `availableCopies > 0` check may replace the call",
                  is_required: true,
                  order: 3,
                },
                {
                  description:
                    "Every non-placeholder `<option>` label is exactly `\"<book title> (<availableCopies> available)\"`, e.g. `Available A (2 available)`, `Boundary Above (0.0001 available)`",
                  is_required: true,
                  order: 4,
                },
                {
                  description:
                    "Only books the helper approves are offered: a book with 0 or negative copies never appears as `Unavailable Zero (0 available)` or `Negative (-1 available)`",
                  is_required: true,
                  order: 5,
                },
                {
                  description:
                    "The offered list follows the helper's verdict rather than a hard-coded `> 0` rule - when the helper is stubbed to approve only even copy counts, only the even books are listed, and when it is stubbed as `> Number.EPSILON`, `0.0001` is listed while `Number.EPSILON` is not",
                  is_required: true,
                  order: 6,
                },
                {
                  description:
                    "When the helper returns `false` for every book, the select's only option is the `Select a book` placeholder",
                  is_required: true,
                  order: 7,
                },
                {
                  description:
                    "The option list is identical across repeated open -> `Cancel` -> open cycles of the Issue Book modal (no accumulating options and no residual selection)",
                  is_required: true,
                  order: 8,
                },
                {
                  description:
                    "`BorrowRecords` reads its data from `useLibrary()` in `client/src/context/LibraryContext` and issues borrows through the context's `borrowBookMember`, so the component renders correctly with only the values the context provides",
                  is_required: true,
                  order: 9,
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
                    hints: [
                      "Break this into smaller steps and think about what each piece of your input becomes in the output.",
                      "Focus on the transformation itself — what operation changes your input value into the form the test expects?",
                      "You are close — look at the examples again. What pattern do you see in how the input maps to the expected output?"
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
                    "Start at the `PUT /api/borrow-records/:id/return` route and trace every Prisma call the handler makes.",
                  order: 1,
                },
                {
                  description:
                    "The negative-stock bug is a two-write flow with no transaction: the `BorrowRecord` is marked returned and `Book.availableCopies` is incremented. Sending the same return request twice increments again, pushing `availableCopies` past `totalCopies`.",
                  order: 2,
                },
                {
                  description:
                    "Wrap both writes in a single `prisma.$transaction` callback so they commit or roll back together.",
                  order: 3,
                },
                {
                  description:
                    "Inside the transaction, re-read the record and reject with HTTP 400 if it is already returned — this also prevents double-increment under concurrent requests.",
                  order: 4,
                },
                {
                  description:
                    "If the `Book` update fails, the `BorrowRecord` write must roll back with it — let the rejection propagate so the error handler returns 500.",
                  order: 5,
                },
              ],
            },
            order: 1,
            acceptance_criteria: {
              create: [
                {
                  description:
                    "`PUT /api/borrow-records/:id/return` responds HTTP 200 for a valid unreturned record, and the return mutation runs inside `prisma.$transaction` called exactly once",
                  is_required: true,
                  order: 1,
                },
                {
                  description:
                    "Sending the same return request twice in a row never leaves `Book.availableCopies` greater than `Book.totalCopies`",
                  is_required: true,
                  order: 2,
                },
                {
                  description:
                    "When the `Book` update fails, the endpoint responds HTTP 500 and the `BorrowRecord` is unchanged - `status` is still `BORROWED` and `returnedAt` is still `null`, so no partial write persists",
                  is_required: true,
                  order: 3,
                },
                {
                  description:
                    "The first return for a record succeeds with HTTP 200 and the second return of that same record is rejected with HTTP 400",
                  is_required: true,
                  order: 4,
                },
                {
                  description:
                    "Both the `BorrowRecord` update and the `Book.availableCopies` increment are issued through the transaction client, so the two writes commit or roll back together",
                  is_required: true,
                  order: 5,
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
                      "Implement atomicTransfer(senderBalance, receiverBalance, amount) that returns [newSender, newReceiver].\n\nIf sender has insufficient funds, return original balances unchanged.\n\nExamples:\n  atomicTransfer(100, 50, 30) → [70, 80]\n  atomicTransfer(10, 50, 30) → [10, 50]   (insufficient)",
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
                  
                    hints: [
                      "Check if sender has enough funds. If not, return unchanged.",
                      "For each field, you need to ask two questions: is it the right type, and is its value above the minimum? Both checks must pass for each field.",
                      "if (senderBalance < ___) return [senderBalance, receiverBalance]; return [senderBalance - ___, receiverBalance + ___];"
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
                    "Both the return and member borrow flows live in the borrow controller. The return route is `PUT /api/borrow-records/:id/return`; the member borrow route is `POST /api/borrow-records/member` with body `{ bookId, memberId, dueDate }`.",
                  order: 1,
                },
                {
                  description:
                    "Concurrent return requests must produce exactly one success and one client error (400–499). Re-read the record inside the transaction and throw if already returned so the second request rolls back.",
                  order: 2,
                },
                {
                  description:
                    "Guard the increment with a conditional update (e.g. `updateMany` where `availableCopies < totalCopies`) and treat zero affected rows as a rejection.",
                  order: 3,
                },
                {
                  description:
                    "Concurrent borrow requests must produce exactly one 201 and never drop `availableCopies` below zero. Guard the decrement the same way: conditional update where `availableCopies > 0`.",
                  order: 4,
                },
                {
                  description:
                    "Use the interactive `prisma.$transaction(async (tx) => ...)` form — it lets you read, decide, and write atomically.",
                  order: 5,
                },
              ],
            },
            order: 2,
            acceptance_criteria: {
              create: [
                {
                  description:
                    "Two concurrent `PUT /api/borrow-records/:id/return` requests on the same record produce exactly one HTTP 200 and one HTTP status between 400 and 499, and `Book.availableCopies` goes from 0 to exactly 1 (incremented once, not twice)",
                  is_required: true,
                  order: 1,
                },
                {
                  description:
                    "Two concurrent `POST /api/borrow-records/member` requests for a book with one available copy produce exactly one HTTP 201, exactly one `BorrowRecord` row for that book, and `availableCopies` never drops below 0",
                  is_required: true,
                  order: 2,
                },
                {
                  description:
                    "The return flow executes through `prisma.$transaction`, called exactly once for a successful return (verified by spying on the method)",
                  is_required: true,
                  order: 3,
                },
                {
                  description:
                    "A second sequential return of the same record returns HTTP 400 and leaves `availableCopies` unchanged at 1 - no double increment",
                  is_required: true,
                  order: 4,
                },
                {
                  description:
                    "Both the borrow decrement and the return increment use a conditional update whose `where` clause prevents the write when `availableCopies` has already reached 0 (or `totalCopies`), and a zero-row result is treated as a rejection",
                  is_required: true,
                  order: 5,
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
                      "Implement validateReservationPayload(body) returning boolean. True only when both bookId and memberId are positive numbers — not zero, negative, or string.\n\nExamples:\n  validateReservationPayload({ bookId: 4, memberId: 2 }) → true\n  validateReservationPayload({ bookId: 0, memberId: 2 }) → false\n  validateReservationPayload({ bookId: \"9\", memberId: 2 }) → false",
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
                  
                    hints: [
                      "Check typeof and > 0 for both fields.",
                      "typeof body.bookId === \"number\" && body.bookId > 0 && typeof body.memberId === \"number\" && body.memberId > 0;",
                      "return typeof body.___ === \"number\" && body.___ > 0 && ..."
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
                    "Add `createReservation` and `getReservationQueue` to the library service. `createReservation` takes `bookId` and `memberId` and posts to `/reservations`. `getReservationQueue` takes `bookId` and builds the query `?bookId=${bookId}`.",
                  order: 1,
                },
                {
                  description:
                    "In the Books page, show a `Reserve Book` action only when `availableCopies === 0` and call `createReservation`.",
                  order: 2,
                },
                {
                  description:
                    "Display a queue-position confirmation matching `You are #`, `in line`, or `queue position`, and the exact empty state `No active reservations.`.",
                  order: 3,
                },
                {
                  description:
                    "Surface the server's duplicate-reservation error (`already reserved`, `duplicate reservation`, or `already has an active reservation`) to the member.",
                  order: 4,
                },
                {
                  description:
                    "On the server, create a reservation controller with `createReservation` returning 201 with `queuePosition`, and 400 on duplicate active reservation.",
                  order: 5,
                },
                {
                  description:
                    "The queue endpoint `GET /api/reservations?bookId=<id>` returns rows with `queuePosition`, nested `member`, and nested `book`, sorted by position. Validate `bookId`: empty or unknown returns 400; valid with no reservations returns 200 with empty array.",
                  order: 6,
                },
                {
                  description:
                    "Reserve is only offered for books with `availableCopies === 0`.",
                  order: 7,
                },
              ],
            },
            order: 1,
            acceptance_criteria: {
              create: [
                {
                  description:
                    "`client/src/services/libraryService.ts` defines `async createReservation(...)` taking `bookId` and `memberId` and targeting the `'/reservations'` endpoint",
                  is_required: true,
                  order: 1,
                },
                {
                  description:
                    "`client/src/services/libraryService.ts` defines `async getReservationQueue(bookId)` and builds its request with the literal query `` ?bookId=${bookId} ``",
                  is_required: true,
                  order: 2,
                },
                {
                  description:
                    "`client/src/pages/Books.tsx` renders a `Reserve Book` action guarded by `availableCopies === 0` and calls `createReservation(...)` from the library service",
                  is_required: true,
                  order: 3,
                },
                {
                  description:
                    "`client/src/pages/Books.tsx` outputs a queue-position confirmation (matching `You are #`, `in line`, or `queue position`) and the exact empty-state string `No active reservations.`",
                  is_required: true,
                  order: 4,
                },
                {
                  description:
                    "`client/src/pages/Books.tsx` handles the duplicate-reservation failure case, matching `already reserved`, `duplicate reservation`, or `already has an active reservation`",
                  is_required: true,
                  order: 5,
                },
                {
                  description:
                    "`server/src/routes/reservation.routes.ts` exports a router containing `createReservation` in `server/src/controllers/reservation.controller.ts`, and `POST /api/reservations` with `{ bookId, memberId }` returns HTTP 201 with `{ success: true, data }` where `data` includes `queuePosition`",
                  is_required: true,
                  order: 6,
                },
                {
                  description:
                    "A second `POST /api/reservations` for the same member and book is rejected with HTTP 400",
                  is_required: true,
                  order: 7,
                },
                {
                  description:
                    "`GET /api/reservations?bookId=<id>` returns HTTP 200 with `{ success: true, data: [...] }` where each row has `queuePosition`, a nested `member` object, and a nested `book` object, and the rows are ordered by `queuePosition` ascending",
                  is_required: true,
                  order: 8,
                },
                {
                  description:
                    "`GET /api/reservations?bookId=<validId>` for a book with no reservations returns HTTP 200 with `success: true` and `data` equal to an empty array",
                  is_required: true,
                  order: 9,
                },
                {
                  description:
                    "An invalid queue query (`?bookId=` empty, or an id that does not exist) returns HTTP 400",
                  is_required: true,
                  order: 10,
                },
                {
                  description:
                    "Reserving a book whose `availableCopies` is `0` is accepted; the reserve entry point in `Books.tsx` is only offered for those books",
                  is_required: true,
                  order: 11,
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
                      "Implement formatQueueSnapshot(rows) returning a string. Each row: \"#POSITION NAME [STATUS]\". Join with \" | \". Empty → \"(empty queue)\".\n\nExamples:\n  formatQueueSnapshot([{ queuePosition: 1, memberName: \"Ari\", status: \"RESERVED\" }]) → \"#1 Ari [RESERVED]\"\n  formatQueueSnapshot([]) → \"(empty queue)\"",
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
                  
                    hints: [
                      "Map each row, join with \" | \". Handle empty first.",
                      "if (rows.length === 0) return \"(empty queue)\"; return rows.map(r => `#${r.queuePosition} ${r.memberName} [${r.status}]`).join(\" | \");",
                      "if (rows.length === 0) return \"___\"; return rows.map(...).join(\"___\");"
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
                    "The borrow controller must have `returnBook`; the reservation controller must have `promoteNextReservation` and `cancelReservation` — keep these exact names.",
                  order: 1,
                },
                {
                  description:
                    "After a successful return, promote the first active reservation (lowest `queuePosition`) to `READY_FOR_PICKUP` inside the same transaction.",
                  order: 2,
                },
                {
                  description:
                    "Cancelling a reservation marks it cancelled and renumbers the remaining active reservations from 1 in order.",
                  order: 3,
                },
                {
                  description:
                    "Invalid IDs (non-existent reservation or unknown `bookId`) must return 400 — validate up front rather than letting Prisma throw 500.",
                  order: 4,
                },
                {
                  description:
                    "Add `cancelReservation(reservationId)` to the library service, keeping `createReservation` and `getReservationQueue`.",
                  order: 5,
                },
                {
                  description:
                    "The member view must display `RESERVED`, `READY_FOR_PICKUP`, `CANCELLED`, `queuePosition`, the empty state `No reservations found.`, and the confirmation `Reservation cancelled.`. Wire the Reservations page into the app.",
                  order: 6,
                },
              ],
            },
            order: 2,
            acceptance_criteria: {
              create: [
                {
                  description:
                    "`server/src/controllers/borrow.controller.ts` contains `returnBook` and `server/src/controllers/reservation.controller.ts` contains `promoteNextReservation` and `cancelReservation` (exact names, case-sensitive)",
                  is_required: true,
                  order: 1,
                },
                {
                  description:
                    "After `PUT /api/borrow-records/:id/return` returns HTTP 200 on a book that has queued reservations, the first row of `GET /api/reservations?bookId=<id>` has `status: 'READY_FOR_PICKUP'`",
                  is_required: true,
                  order: 2,
                },
                {
                  description:
                    "The promotion happens in the same transactional unit as the return's record update and stock increment, so a failure leaves neither applied",
                  is_required: true,
                  order: 3,
                },
                {
                  description:
                    "`DELETE /api/reservations/<id>` returns HTTP 200 and cancels the reservation, and the first row of the subsequent `GET /api/reservations?bookId=<id>` has `queuePosition` 1 (remaining queue reindexed to continuous positions)",
                  is_required: true,
                  order: 4,
                },
                {
                  description:
                    "Cancelling a reservation that is not active (including a non-existent id) returns HTTP 400",
                  is_required: true,
                  order: 5,
                },
                {
                  description:
                    "`GET /api/reservations?bookId=missing-id` (an invalid or unknown bookId) returns HTTP 400",
                  is_required: true,
                  order: 6,
                },
                {
                  description:
                    "`client/src/services/libraryService.ts` defines `async cancelReservation(reservationId)` targeting `/reservations`, and the same file still defines `createReservation` and `getReservationQueue`",
                  is_required: true,
                  order: 7,
                },
                {
                  description:
                    "The client source (`client/src/pages/Books.tsx`, `client/src/pages/Reservations.tsx`, `client/src/App.tsx`) contains the lifecycle statuses `RESERVED`, `READY_FOR_PICKUP` and `CANCELLED`, reads `queuePosition`, renders the exact empty state `No reservations found.`, and confirms a successful cancel with the exact text `Reservation cancelled.`",
                  is_required: true,
                  order: 8,
                },
                {
                  description:
                    "The member reservation view is reachable from the client (a `Reservations` page wired into `client/src/App.tsx` or another client source file the test reads) and shows `queuePosition` and the server-provided `status` for each entry",
                  is_required: true,
                  order: 9,
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
                      "Implement getOverdueLabel(dueDate, returnedAt) returning \"OVERDUE\" or \"ON_TIME\".\n\nTwo cases:\n  1. returnedAt is NOT null → \"ON_TIME\" (already returned)\n  2. returnedAt IS null → past dueDate → \"OVERDUE\", future → \"ON_TIME\"\n\nExamples:\n  getOverdueLabel(\"2024-01-01\", null) → \"OVERDUE\"\n  getOverdueLabel(\"2024-01-01\", \"2024-01-02\") → \"ON_TIME\"",
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
                  
                    hints: [
                      "Check returnedAt first. If not null, ON_TIME. Otherwise compare dates.",
                      "if (returnedAt != null) return \"ON_TIME\"; if (new Date(dueDate) < new Date()) return \"OVERDUE\"; return \"ON_TIME\";",
                      "if (returnedAt != ___) return \"___\"; if (new Date(dueDate) < new Date()) return \"___\"; return \"___\";"
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
                    "The overdue endpoint must return only unreturned records past their due date. Filtering on the derived `status` field includes stale records and misses genuinely overdue ones.",
                  order: 1,
                },
                {
                  description:
                    "Filter on source-of-truth fields: `returnedAt` is null and `dueDate` is before now. A record with `returnedAt` set is never overdue, regardless of its status.",
                  order: 2,
                },
                {
                  description:
                    "A returned record with a stale `OVERDUE` status must not appear in the report. Only genuinely unreturned, past-due records belong there.",
                  order: 3,
                },
                {
                  description:
                    "Read the current time inside the request handler so the boundary respects a frozen clock. Capturing time at module load ignores the frozen time.",
                  order: 4,
                },
                {
                  description:
                    "At the boundary, a record due one second before the clock is overdue; one due five seconds after is not. A record returned exactly at the clock is not overdue. Compare as UTC instants.",
                  order: 5,
                },
                {
                  description:
                    "The response must include each record's `id` so membership can be verified. Include `book` and `member` for the report but keep the flat `id` intact.",
                  order: 6,
                },
              ],
            },
            order: 1,
            acceptance_criteria: {
              create: [
                {
                  description:
                    "`GET /api/borrow-records/overdue` returns HTTP 200 with a body of `{ success: true, data: [...] }` where each row is a `BorrowRecord` carrying its `id`",
                  is_required: true,
                  order: 1,
                },
                {
                  description:
                    "A record with `returnedAt` set is excluded from `data` even when its stored `status` is `BORROWED`",
                  is_required: true,
                  order: 2,
                },
                {
                  description:
                    "A record with `returnedAt` set is excluded from `data` even when its stored `status` is `OVERDUE` (the stale-status case)",
                  is_required: true,
                  order: 3,
                },
                {
                  description:
                    "A record that is past its `dueDate` with `returnedAt == null` is included, even when its stored `status` is still `BORROWED`",
                  is_required: true,
                  order: 4,
                },
                {
                  description:
                    "Classification is driven by `returnedAt` and `dueDate` only; the stored `status` value is never used as the filter condition",
                  is_required: true,
                  order: 5,
                },
                {
                  description:
                    "With the clock fixed at `2025-03-02T00:00:01Z`, a record due `2025-03-01T23:59:59Z` and unreturned is included",
                  is_required: true,
                  order: 6,
                },
                {
                  description:
                    "With the same frozen clock, a record due `2025-03-02T00:00:05Z` and unreturned is excluded (not yet due), and a record returned at exactly `2025-03-02T00:00:00Z` is excluded",
                  is_required: true,
                  order: 7,
                },
                {
                  description:
                    "The overdue comparison reads the current time inside the request handler (respecting the frozen system clock) and evaluates the boundary in UTC, so the same records always classify the same way",
                  is_required: true,
                  order: 8,
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
                      "Implement formatIncidentTimeline() returning a 4-line timeline string. Each line: \"- Section: detail\" joined by \\n.",
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
                  
                    hints: [
                      "Build 4 strings, join with \\n.",
                      "[\"- Detection: ...\", \"- Impact Window: ...\", \"- Mitigation: ...\", \"- Verification: ...\"].join(\"\\n\");",
                      "return [\"- Detection: ___\", \"- Impact Window: ___\", \"- Mitigation: ___\", \"- Verification: ___\"].join(\"___\");"
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
                    "A returned record with a stale `OVERDUE` status must not appear in the report. Only genuinely unreturned, past-due records belong there.",
                  order: 1,
                },
                {
                  description:
                    "The endpoint must also correct stale `BORROWED` status to `OVERDUE` for past-due unreturned records, but never rewrite a returned record's status.",
                  order: 2,
                },
                {
                  description:
                    "Returned records must stay untouched — `status: 'RETURNED'` and `returnedAt` non-null must persist unchanged.",
                  order: 3,
                },
                {
                  description:
                    "A record that is unreturned but not yet due (due date in the future) must stay out of the report. Overdue means `dueDate` strictly in the past, evaluated at request time.",
                  order: 4,
                },
                {
                  description:
                    "Centralize the overdue rule so the read filter, status update, and any notification path cannot drift apart.",
                  order: 5,
                },
                {
                  description:
                    "Root cause: the query filtered on the derived `status` field instead of the source-of-truth `returnedAt`/`dueDate` fields, so a return that did not update `status` left the record permanently reported as overdue.",
                  order: 6,
                },
              ],
            },
            order: 2,
            acceptance_criteria: {
              create: [
                {
                  description:
                    "`GET /api/borrow-records/overdue` returns HTTP 200 with `{ success: true, data: [...] }`",
                  is_required: true,
                  order: 1,
                },
                {
                  description:
                    "A record with `returnedAt` set and a stale `status: 'OVERDUE'` is not in the response",
                  is_required: true,
                  order: 2,
                },
                {
                  description:
                    "A record that is past due, unreturned, and stored as `status: 'OVERDUE'` is in the response",
                  is_required: true,
                  order: 3,
                },
                {
                  description:
                    "A record that is past due and unreturned but still stored as `status: 'BORROWED'` is in the response",
                  is_required: true,
                  order: 4,
                },
                {
                  description:
                    "A record that is unreturned and not yet due (due date in the future) is not in the response",
                  is_required: true,
                  order: 5,
                },
                {
                  description:
                    "No record whose `returnedAt` is non-null appears in the report, regardless of its stored `status`",
                  is_required: true,
                  order: 6,
                },
                {
                  description:
                    "After the request, the past-due unreturned record's stored `status` is `OVERDUE` in the database, so the incorrect `BORROWED` marking is actually corrected",
                  is_required: true,
                  order: 7,
                },
                {
                  description:
                    "After the request, a returned record still has `status: 'RETURNED'` and a non-null `returnedAt` - the fix never rewrites a returned record",
                  is_required: true,
                  order: 8,
                },
                {
                  description:
                    "The overdue condition is centralized in a single shared helper keyed on `returnedAt` and `dueDate`, and the controller calls it rather than duplicating the comparison inline",
                  is_required: true,
                  order: 9,
                },
              ],
            },
          },
        ],
      },
    },
];
