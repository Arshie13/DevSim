export const scenarios = [
  {
    id: "pern-pos-scenario-3",
    name: "IPPO POS System",
    description:
      "Build and debug a production-grade Point-of-Sale system for IPPO Software Solutions using React 18, Express, Prisma, and PostgreSQL. Progress from environment setup through cashier UI helpers, transactional inventory/void flows, a full-stack promo-code feature, and a critical revenue-reporting bug.",
    difficulty: "expert",
    is_paywalled: true,
  },
];

export const levels = [
    {
      id: "pern-pos-level-1",
      title: "Getting Familiar with the Codebase",
      subtitle: "Set up the POS environment and align the sidebar brand.",
      order: 1,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      level_description:
        "Mission Briefing: IPPO has just onboarded a new cashier-support engineer. Get the PERN POS stack running locally — install in all three package roots, run Prisma migrations, start both dev servers, and update the sidebar subtitle to match the company's official style guide.",
      xp_reward: 100,
      coin_reward: 50,
      key_takeaways:
        "A PERN POS project needs pnpm install in root, client/, and server/. Prisma migrations keep Postgres aligned with schema.prisma. React layout components (Sidebar) are the single source of truth for brand text — update them once and every page reflects the change.",
      scenario_id: "pern-pos-scenario-3",
      tasks: {
        create: [
          {
            task_name: "Prepare Development Environment",
            test_type: "client",
            user_story:
              "As an engineer, I want to set up my local PERN environment so that I can run the IPPO POS app and start contributing.",
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
                    "Practice navigating between the three project directories.",
                  section_type: "INTERACTIVE" as const,
                  interactive_mode: "TERMINAL_CD" as const,
                  interactive_config: {
                    instructions:
                      "Navigate from /workspace to /workspace/client, then to /workspace/server, then back to /workspace.",
                    initial_directory: "/workspace",
                    expected_commands: ["cd client", "cd ../server", "cd .."],
                    directory_tree: {
                      "/workspace": ["client", "server", "package.json"],
                      "/workspace/client": ["src", "package.json"],
                      "/workspace/server": ["src", "prisma", "package.json"],
                    },
                  },
                  order: 6,
                },
                {
                  title: "Environment Variables",
                  content:
                    'Sensitive configuration such as database credentials is stored in .env files rather than hardcoded in source code.\nDATABASE_URL="postgresql://user:password@localhost:5432/pos_system"\nPORT=5000\nThe dotenv package reads these files and provides the values via process.env in Node.js. .env files are listed in .gitignore because they contain secrets that should not be committed to version control.\n\nNote: Environment variables in this project are pre-configured.',
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
                    "Run `pnpm install` in the project root, then in `client/`, then in `server/`. Each directory has its own `node_modules`.",
                  order: 1,
                },
                {
                  description:
                    "`cd server && pnpm exec tsx scripts/db-check.ts` runs `SELECT 1` and prints `DB_OK`. If it exits non-zero, your `DATABASE_URL` is wrong or Postgres is not running.",
                  order: 2,
                },
                {
                  description:
                    "Migration verification uses `pnpm exec prisma migrate deploy --schema prisma/schema.prisma` followed by `pnpm exec prisma migrate status`. Status must print `Database schema is up to date`.",
                  order: 3,
                },
                {
                  description:
                    "Health is checked at `/api/health` (not `/health`) — it must return HTTP 200 with a JSON body containing `ok`. The client is checked at the site root, whose HTML must contain `<div id=\"root\">`.",
                  order: 4,
                },
              ],
            },
            order: 1,
            acceptance_criteria: {
              create: [
                {
                  description:
                    "Root workspace is installed: node_modules/ exists at the project root and contains the concurrently package",
                  is_required: true,
                  order: 1,
                },
                {
                  description:
                    "Client workspace is installed: client/node_modules/ exists and contains the react package",
                  is_required: true,
                  order: 2,
                },
                {
                  description:
                    "Server workspace is installed: server/node_modules/ exists and contains both express and @prisma/client",
                  is_required: true,
                  order: 3,
                },
                {
                  description:
                    "Database is reachable: `pnpm exec tsx scripts/db-check.ts` in server/ exits with code 0 and its stdout contains DB_OK",
                  is_required: true,
                  order: 4,
                },
                {
                  description:
                    "Migrations are applied: `prisma migrate deploy --schema prisma/schema.prisma` in server/ exits 0, and `prisma migrate status` exits 0 with output containing \"Database schema is up to date\"",
                  is_required: true,
                  order: 5,
                },
                {
                  description:
                    "Backend starts with `pnpm run dev` in server/ and GET /api/health returns HTTP 200 with a body containing ok",
                  is_required: true,
                  order: 6,
                },
                {
                  description:
                    "Frontend starts with `pnpm run dev` in client/ and GET / on the dev server returns HTTP 200 with HTML containing the literal <div id=\"root\"> mount point",
                  is_required: true,
                  order: 7,
                },
              ],
            },
          },
          {
            task_name: "Update Brand Identity in Sidebar",
            test_type: "client",
            user_story:
              "As a user, I want the sidebar to show the full official brand name so the POS matches IPPO's marketing style guide.",
            learning_sections: {
              create: [
                {
                  title: "Overview\nEditing React Layout Components",
                  content:
                    "This section introduces the crash course for understanding React components and the UI layer. It gives a broad view of how interface elements are structured and where to make safe, focused UI updates.",
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
                    "In most React apps, elements like the header and footer live in layout components — shared wrappers used across multiple pages. Changing text in the layout updates it across all pages.\n\nA typical layout structure:\ncomponents/\n    └── layout/\n          ├── Navbar.tsx ← top navigation bar\n          ├── Sidebar.tsx ← side menu\n          └── Footer.tsx ← bottom bar",
                  order: 3,
                },
                {
                  title: "How to Find What to Change",
                  content:
                    "To locate the source of a UI element visible in the browser:\nWhat element is it? (navbar, footer, sidebar?)\nWhich component renders it? (trace it to a file)\nIs the text hardcoded or coming from props/state? For brand text, the hardcoded string is located inside the layout component.",
                  order: 4,
                },
                {
                  title: "JSX Text Content",
                  content:
                    'Changing text in JSX is straightforward:\n// Before\n<span className="font-bold">Old Brand</span>\n// After\n<span className="font-bold">New Brand Name</span>',
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
                      'Update the function output from "Hello" to "Welcome".',
                    language: "tsx",
                    starter_code:
                      'export function getUpdatedText() {\n  return "Hello";\n}\n',
                    editable_regions: [
                      {
                        placeholder: "Hello",
                        case_sensitive: true,
                      },
                    ],
                    entry_point: "getUpdatedText",
                    test_cases: [
                      {
                        input: [],
                        expected: "Welcome",
                        label: "updated text",
                      },
                    ],
                    hints: [
                      "This is a simple text replacement — locate the returned string and change it to match the expected output.",
                      "Look at the return statement. The string inside the quotes is what the test sees. What word did the instructions say to output instead?",
                      'return "___" — what word should replace "Hello"?'
                    ],
                  },
                  order: 7,
                },
                {
                  title: "Key Takeaway",
                  content:
                    "UI changes in React trace back to a component file. Layout components are the primary location for global elements such as headers and navbars. The source text is found inside the component and modified there.",
                  order: 8,
                },
              ],
            },
            hints: {
              create: [
                {
                  description:
                    "Open `client/src/components/layout/Sidebar.tsx` and find the subtitle string rendered directly under the brand heading in the JSX.",
                  order: 1,
                },
                {
                  description:
                    "The exact new string is `IPPO Software Solutions` — capital I and P, capital S in Software and Solutions, single spaces.",
                  order: 2,
                },
                {
                  description:
                    "Put the string in live JSX (for example inside the `<p>` under the `<h1>`). A commented-out line does not count.",
                  order: 3,
                },
                {
                  description:
                    "Replace the old subtitle rather than keeping it in a comment — the test removes every occurrence of the new string and then fails if `IPPO Solutions` is still present anywhere in the file.",
                  order: 4,
                },
              ],
            },
            order: 2,
            acceptance_criteria: {
              create: [
                {
                  description:
                    "client/src/components/layout/Sidebar.tsx exists",
                  is_required: true,
                  order: 1,
                },
                {
                  description:
                    "The file text contains the exact brand subtitle IPPO Software Solutions",
                  is_required: true,
                  order: 2,
                },
                {
                  description:
                    "IPPO Software Solutions still appears after all `//` line comments and all `/* ... */` block comments are stripped from Sidebar.tsx",
                  is_required: true,
                  order: 3,
                },
                {
                  description:
                    "After every occurrence of IPPO Software Solutions is removed from Sidebar.tsx, the remaining text no longer contains the string IPPO Solutions",
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
      id: "pern-pos-level-2",
      title: "Client-Side Exploration",
      subtitle:
        "Build a per-product stock classifier and adopt it across POS + Inventory pages.",
      order: 2,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      level_description:
        "Mission Briefing: POS and Inventory pages each repeat inline stock checks. Create a pure getStockLevel(quantity, threshold) helper that returns a 3-state union, refactor both pages to use it, and add a cashier-facing 'Hide out-of-stock items' toggle on the POS page.",
      xp_reward: 150,
      coin_reward: 125,
      key_takeaways:
        "Pure two-argument classifiers return richer information than booleans. Per-product thresholds let each SKU set its own LOW_STOCK boundary. Centralising the logic eliminates drift between the POS grid and the Inventory table, and a visible toggle proves the abstraction reaches the user.",
      scenario_id: "pern-pos-scenario-3",
      tasks: {
        create: [
          {
            task_name: "Add Stock Level Classifier Helper",
            test_type: "client",
            user_story:
              "As a developer, I want a getStockLevel(quantity, threshold) helper in formatters.ts so stock-level decisions are consistent and testable across the POS and Inventory pages.",
            learning_sections: {
              create: [
                {
                  title: "Overview\nPure Functions and Utility Helpers in React",
                  content:
                    "This section introduces the crash course for pure functions and reusable utility helpers in React. It outlines why centralized logic improves consistency, testability, and maintainability.",
                  order: 1,
                },
                {
                  title: "What is a Pure Function?",
                  content:
                    "A pure function is a function that:\n - Always returns the same output for the same input\n - Has no side effects (doesn't modify anything outside itself)\n\n// Pure function ✅\nfunction getDiscount(price: number, rate: number): number {\n  return price * rate;\n}\n\n// NOT pure ❌ — reads external state\nfunction getDiscount(): number {\n  return currentPrice * 0.1; // currentPrice is external\n}\n\nPure functions are predictable, easy to test, and safe to reuse anywhere.",
                  order: 2,
                },
                {
                  title: "Why Centralize Logic in a Helper?",
                  content:
                    "Imagine the same decision logic scattered across 3 different components:\n\n// In ComponentA.tsx\nif (score > 85) { showGoldBadge(); }\n\n// In ComponentB.tsx\nif (score >= 85) { showGoldBadge(); } // slightly different!\n\n// In ComponentC.tsx\nif (score > 90) { showGoldBadge(); } // also different!\n\nEach variation is a bug waiting to happen. If the thresholds change, you'd need to update every file. With a centralized helper, every component imports and uses the same logic.",
                  order: 3,
                },
                {
                  title: "Where to Put Helpers",
                  content:
                    "In React projects, shared utility functions live in a utils/ folder:\n\nclient/\n    src/\n        └── utils/\n              └── formatters.ts ← shared helper functions go here",
                  order: 4,
                },
                {
                  title: "Boundary Conditions",
                  content:
                    "When writing threshold-based logic, you need to handle edge cases — inputs at or near the boundary of expected values:\n\n| score | result      |\n|  85   | GOLD        |\n|  70   | SILVER      |\n|  50   | BRONZE      |\n|  0    | NONE        |\n\nThe 0 boundary is the most important: a score of 0 should always map to the lowest tier, even though 0 is technically a valid number.",
                  order: 5,
                },
                {
                  title: "Exporting from a Module",
                  content:
                    "To use your helper in other files, you must export it:\n\n// utils/formatters.ts\nexport function getScoreTier(score: number): string {\n  if (score <= 0) return 'NONE';\n  if (score <= 50) return 'BRONZE';\n  if (score <= 80) return 'SILVER';\n  return 'GOLD';\n}\n\nAnd import it where needed:\nimport { getScoreTier } from '../utils/formatters';",
                  order: 6,
                },
                {
                  title: "Practice Lab: Order Total Calculator",
                  content:
                    "Practice writing a very simple number utility before doing the real workspace task.",
                  section_type: "INTERACTIVE" as const,
                  interactive_mode: "CODE_EDITOR" as const,
                  interactive_config: {
                    instructions:
                      "Implement calculateTotal(price, quantity) returning product as number.",
                    language: "javascript",
                    starter_code:
                      "export function calculateTotal(price, quantity) {\n  // TODO\n}\n",
                    editable_regions: [
                      {
                        placeholder: "// TODO",
                        case_sensitive: true,
                      },
                    ],
                    entry_point: "calculateTotal",
                    test_cases: [
                      {
                        input: [10, 3],
                        expected: 30,
                        label: "three items",
                      },
                      {
                        input: [5, 2],
                        expected: 10,
                        label: "two items",
                      },
                      {
                        input: [0, 5],
                        expected: 0,
                        label: "zero price",
                      },
                    ],
                  
                    hints: [
    "Multiply.",
    "Combine the two numbers using the right mathematical operator. What symbol means multiplication in JavaScript?",
    "return price ___ quantity;"
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
                    "Add `export function getStockLevel(quantity: number, threshold: number)` to `client/src/utils/formatters.ts` (create or extend).",
                  order: 1,
                },
                {
                  description:
                    "Check `quantity <= 0` first — otherwise `getStockLevel(0, 0)` falls into `LOW_STOCK`. The threshold is inclusive: `getStockLevel(10, 10)` is `LOW_STOCK`; only strictly greater is `IN_STOCK`.",
                  order: 2,
                },
                {
                  description:
                    "The function takes the threshold as its second parameter — never read a module-level constant. Keep it pure: no imports, DOM, network, or caching.",
                  order: 3,
                },
              ],
            },
            order: 1,
            acceptance_criteria: {
              create: [
                {
                  description:
                    "client/src/utils/formatters.ts exports getStockLevel as a named export, and importing that module yields a function",
                  is_required: true,
                  order: 1,
                },
                {
                  description:
                    "getStockLevel(0, 10) returns the string 'OUT_OF_STOCK'",
                  is_required: true,
                  order: 2,
                },
                {
                  description:
                    "Negative quantities are also out of stock: getStockLevel(-1, 10) and getStockLevel(-100, 10) both return 'OUT_OF_STOCK'",
                  is_required: true,
                  order: 3,
                },
                {
                  description:
                    "getStockLevel(1, 10) returns 'LOW_STOCK' — the smallest quantity above zero is low stock, not in stock",
                  is_required: true,
                  order: 4,
                },
                {
                  description:
                    "The threshold boundary is inclusive: getStockLevel(10, 10) and getStockLevel(5, 5) both return 'LOW_STOCK'",
                  is_required: true,
                  order: 5,
                },
                {
                  description:
                    "getStockLevel(11, 10) and getStockLevel(100, 10) return 'IN_STOCK' — only quantities strictly greater than the threshold are in stock",
                  is_required: true,
                  order: 6,
                },
                {
                  description:
                    "The threshold is honoured per product: getStockLevel(8, 10) returns 'LOW_STOCK' while getStockLevel(8, 5) returns 'IN_STOCK' — the same quantity classifies differently under different thresholds",
                  is_required: true,
                  order: 7,
                },
                {
                  description:
                    "The function is pure — repeated calls with identical arguments (0,10), (3,10) and (50,10) each return an identical result",
                  is_required: true,
                  order: 8,
                },
              ],
            },
          },
          {
            task_name: "Adopt Stock Helper in POS Grid + Inventory Page",
            test_type: "client",
            user_story:
              "As a cashier, I want the POS grid to clearly mark out-of-stock items and let me hide them, so I don't waste time trying to ring up unavailable products.",
            learning_sections: {
              create: [
                {
                  title:
                    "Overview\nRefactoring: Replacing Inline Logic with Shared Helpers",
                  content:
                    "This section introduces the crash course for refactoring inline checks into shared helpers. It provides a high-level guide for reducing duplication while keeping behavior stable across components.",
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
                    "When the same decision appears in multiple components with slight differences, bugs creep in:\n\n// ComponentA.tsx\nconst isEligible = player.level >= 10;\n\n// ComponentB.tsx\nconst isEligible = player.level > 10; // slightly different!\n\nThese two checks look similar but behave differently at the level === 10 boundary. If the eligibility rule ever changes, you must hunt down every inline check.",
                  order: 3,
                },
                {
                  title: "The Fix: Import and Reuse",
                  content:
                    "Replace the inline condition with the shared helper:\n\n// Before — inline logic\nconst isEligible = player.level >= 10;\n\n// After — shared helper\nimport { getPlayerTier } from '../utils/formatters';\nconst tier = getPlayerTier(player.level);\nconst isEligible = tier === 'ADVANCED';\n\nThe behavior is driven by the helper now. If the helper's rule ever changes, all components update automatically.",
                  order: 4,
                },
                {
                  title: "Finding Inline Checks to Replace",
                  content:
                    "When refactoring, search the codebase for patterns that mirror the logic you're centralizing. Look for:\n- Direct comparisons involving the same field\n- Conditions used to show badges, overlays, or disable elements\n- Any UI branch derived from a repeating calculation",
                  order: 5,
                },
                {
                  title:
                    "Non-Regression: Making Sure You Didn't Break Anything",
                  content:
                    "After refactoring, verify the feature still works the same way. The same inputs should produce the same outputs — just through a shared helper instead of scattered inline checks. Refactoring should be invisible to the user.",
                  order: 6,
                },
                {
                  title: "Practice Lab: Filter Array by Tier",
                  content:
                    "Practice filtering an array using a helper function.",
                  section_type: "INTERACTIVE" as const,
                  interactive_mode: "CODE_EDITOR" as const,
                  interactive_config: {
                    instructions:
                      "Implement filterByTier(players, minTier) returning players with tier rank >= minTier. Use tierRank lookup.",
                    language: "javascript",
                    starter_code:
                      "export function filterByTier(players, minTier) {\n  const tierRank = { NONE: 0, BRONZE: 1, SILVER: 2, GOLD: 3 };\n  // TODO: filter players whose tierRank[tier] >= tierRank[minTier]\n}\n",
                    editable_regions: [
                      {
                        placeholder:
                          "// TODO: filter players whose tierRank[tier] >= tierRank[minTier]",
                        case_sensitive: false,
                      },
                    ],
                    entry_point: "filterByTier",
                    test_cases: [
                      {
                        input: [
                          [
                            { name: "A", tier: "GOLD" },
                            { name: "B", tier: "BRONZE" },
                            { name: "C", tier: "SILVER" },
                          ],
                          "SILVER",
                        ],
                        expected: [
                          { name: "A", tier: "GOLD" },
                          { name: "C", tier: "SILVER" },
                        ],
                        label: "filters below SILVER",
                      },
                      {
                        input: [
                          [
                            { name: "A", tier: "GOLD" },
                            { name: "B", tier: "NONE" },
                          ],
                          "BRONZE",
                        ],
                        expected: [{ name: "A", tier: "GOLD" }],
                        label: "filters NONE and BRONZE",
                      },
                    ],
                  
                    hints: [
                      "Compare ranks.",
                      "Think step by step about what operation transforms your input into the output you need. Break it down into smaller sub-problems and solve each one.",
                      "return players.filter(p => tierRank[p.___] >= tierRank[___]);"
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
                    "In `POSPage.tsx`, import `getStockLevel` from `'../../utils/formatters'`, add a `hideOutOfStock` boolean state, and derive the stock level per product with `getStockLevel(product.inventory.quantity, product.inventory.lowStock)`.",
                  order: 1,
                },
                {
                  description:
                    "Render a visible control with the words `Hide out-of-stock items` in the markup.",
                  order: 2,
                },
                {
                  description:
                    "Filter products using the helper's return value — e.g. keep where `hideOutOfStock ? level !== 'OUT_OF_STOCK' : true` — not by comparing raw quantities.",
                  order: 3,
                },
                {
                  description:
                    "In `InventoryPage.tsx`, replace all `quantity === 0` and `quantity <= lowStock` comparisons (including the Remove button's `disabled` prop) with `getStockLevel(quantity, lowStock)` calls.",
                  order: 4,
                },
              ],
            },
            order: 2,
            acceptance_criteria: {
              create: [
                {
                  description:
                    "client/src/pages/pos/POSPage.tsx contains an import statement that pulls in getStockLevel from the formatters utils module",
                  is_required: true,
                  order: 1,
                },
                {
                  description:
                    "POSPage.tsx calls getStockLevel and uses its result to drive the product badge and the disabled state of the add-to-cart button",
                  is_required: true,
                  order: 2,
                },
                {
                  description:
                    "POSPage.tsx declares an out-of-stock toggle state named hideOutOfStock or showOutOfStock",
                  is_required: true,
                  order: 3,
                },
                {
                  description:
                    "POSPage.tsx filters the product grid using getStockLevel and the literal string OUT_OF_STOCK, so toggling removes out-of-stock products from the visible list",
                  is_required: true,
                  order: 4,
                },
                {
                  description:
                    "POSPage.tsx renders a visible label containing the words \"hide out-of-stock\" next to the toggle control",
                  is_required: true,
                  order: 5,
                },
                {
                  description:
                    "client/src/pages/inventory/InventoryPage.tsx contains an import statement that pulls in getStockLevel from the formatters utils module",
                  is_required: true,
                  order: 6,
                },
                {
                  description:
                    "InventoryPage.tsx calls getStockLevel to determine the Out of Stock / Low Stock / In Stock badge shown in the Stock Status column",
                  is_required: true,
                  order: 7,
                },
                {
                  description:
                    "InventoryPage.tsx contains no raw inline comparison of the form `quantity === 0` — including the Remove button's disabled prop, which must be driven by the helper result instead",
                  is_required: true,
                  order: 8,
                },
                {
                  description:
                    "InventoryPage.tsx contains no raw inline comparison of the form `quantity <= lowStock && quantity > 0` — that classification must come from getStockLevel",
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
      id: "pern-pos-level-3",
      title: "Backend: Introduce Void Flow + Concurrency Guard",
      subtitle:
        "Diagnose the oversell race, then ship an atomic void endpoint and oversell-safe checkout.",
      order: 3,
      deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      level_description:
        "Mission Briefing: The POS has two structural gaps — the existing checkout reads inventory then decrements later (two cashiers can both sell the last unit), and there is no way to void a mistaken sale. Diagnose both, then add an OrderStatus enum + voidedAt column, an atomic voidOrder controller, and an oversell-safe checkout using updateMany + gte guard.",
      xp_reward: 200,
      coin_reward: 200,
      key_takeaways:
        "Read-then-write is unsafe under concurrency. Prisma's updateMany with a gte guard + a count check is the textbook atomic fix. Multi-table transactions (Order + OrderItem + Inventory) must share a single prisma.$transaction to guarantee rollback. Source-of-truth timestamps (voidedAt) are safer than mutable status fields.",
      scenario_id: "pern-pos-scenario-3",
      tasks: {
        create: [
          {
            task_name: "Diagnose Oversell Race & Missing Void Flow",
            test_type: "server",
            user_story:
              "As an engineer, I want to document the oversell race and the absence of a void flow so that the team can prioritize the fix.",
            learning_sections: {
              create: [
                {
                  title: "Overview\nData Integrity and State Consistency",
                  content:
                    "This section introduces the crash course for data integrity and state consistency. It explains why operations that change one record often require coordinated updates to related records, and how to trace missing writes.",
                  order: 1,
                },
                {
                  title: "What is Data Integrity?",
                  content:
                    "When data spans multiple tables, an update to one record often requires a corresponding update to related records. A user changes their email — the old verification token becomes invalid. A seat is booked — capacity must decrement. A member registers — the event capacity must decrease.\n\nData integrity means that after any operation, all related records are in a consistent state. If one side effect is missed, the data becomes incorrect — and that error compounds with every subsequent operation.",
                  order: 2,
                },
                {
                  title: "State Transitions Require Side Effects",
                  content:
                    "Every state change (CANCELLED, SHIPPED, COMPLETED) is a transition that may require side effects — writes to other records to keep the system consistent.\n\nA cancelled flight reservation must restore the seat count. A deleted user account should archive their posts, not just remove the user row. A rescheduled event should invalidate cached calendar views.\n\nWhen you see a state transition, always ask: what else depends on this state? A status change in isolation is often a bug.",
                  order: 3,
                },
                {
                  title: "Tracing Operation Flows",
                  content:
                    "To find a missing side effect, trace the full operation path:\n\n1. Find the entry point (a specific API route or function)\n2. List every database write it performs\n3. Ask: are there related records that also need updating?\n4. If a write is missing, that is your data leak.\n\nThis method works across any domain — the question is always the same: what else must change when this record changes?",
                  order: 4,
                },
                {
                  title: "Practice Lab: Spot the Missing Write",
                  content:
                    "Practice identifying missing side effects in a state transition.",
                  section_type: "INTERACTIVE" as const,
                  interactive_mode: "CODE_EDITOR" as const,
                  interactive_config: {
                    instructions:
                      "Implement findMissingSteps(actions) returning required actions NOT present.",
                    language: "javascript",
                    starter_code:
                      "export function findMissingSteps(actions) {\n  const required = ['SET enrolledCourseId', 'ADD to roster', 'INCREMENT course.count'];\n  // TODO: Return array of required actions that are NOT present in the actions array\n}\n",
                    editable_regions: [
                      {
                        placeholder:
                          "// TODO: Return array of required actions that are NOT present in the actions array",
                        case_sensitive: false,
                      },
                    ],
                    entry_point: "findMissingSteps",
                    test_cases: [
                      {
                        input: [["SET enrolledCourseId"]],
                        expected: ["ADD to roster", "INCREMENT course.count"],
                        label: "enrollment alone — missing roster and count",
                      },
                      {
                        input: [["SET enrolledCourseId", "ADD to roster"]],
                        expected: ["INCREMENT course.count"],
                        label: "enrollment and roster — missing count",
                      },
                      {
                        input: [
                          [
                            "SET enrolledCourseId",
                            "ADD to roster",
                            "INCREMENT course.count",
                          ],
                        ],
                        expected: [],
                        label: "all steps present — no issues",
                      },
                    ],
                  
                    hints: [
                      ".filter() on required.",
                      "Walk through the array and build a new one keeping only the items that pass your check. What method lets you test each item against a condition?",
                      "return required.filter(item => !actions.___(item));"
                      ],
                  },
                  order: 5,
                },
                {
                  title: "Key Takeaway",
                  content:
                    "A state transition that updates one record without updating its dependents is a data leak. To find it, trace the full operation path and list every required write — if one is missing, that is the bug.",
                  order: 6,
                },
              ],
            },
            hints: {
              create: [
                {
                  description:
                    "Create `server/src/controllers/order.controller.ts` exporting a `voidOrder` function.",
                  order: 1,
                },
                {
                  description:
                    "Inside `voidOrder`, read the order with its items, guard that its status is `COMPLETED`, and stamp `voidedAt: new Date()` on the update.",
                  order: 2,
                },
                {
                  description:
                    "Restore stock by looping the order's items and running an inventory update with `quantity: { increment: item.quantity }`.",
                  order: 3,
                },
                {
                  description:
                    "Add the route in `server/src/routes/orders.ts` as `router.post('/:id/void', authenticate, voidOrderHandler)` — the literal path segment `/:id/void` must appear in the file.",
                  order: 4,
                },
                {
                  description:
                    "Wrap every write in a single `prisma.$transaction` callback so the status flip, the `voidedAt` stamp, and the stock restore commit or roll back together.",
                  order: 5,
                },
              ],
            },
            order: 1,
            acceptance_criteria: {
              create: [
                {
                  description:
                    "server/src/controllers/order.controller.ts exists and can be imported",
                  is_required: true,
                  order: 1,
                },
                {
                  description:
                    "order.controller.ts exports a function named voidOrder",
                  is_required: true,
                  order: 2,
                },
                {
                  description:
                    "order.controller.ts references the field name voidedAt to record when the order was voided",
                  is_required: true,
                  order: 3,
                },
                {
                  description:
                    "server/prisma/schema.prisma declares the voidedAt field inside the Order model",
                  is_required: true,
                  order: 4,
                },
                {
                  description:
                    "server/src/routes/orders.ts registers the void endpoint on the literal path /:id/void (POST), served as POST /api/orders/:id/void",
                  is_required: true,
                  order: 5,
                },
              ],
            },
          },
          {
            task_name: "Atomic Void + Oversell-Safe Checkout",
            test_type: "server",
            user_story:
              "As a cashier, I want to void a mistaken sale so that inventory is restored and the order is marked voided — and I need checkout to never oversell under concurrent use.",
            learning_sections: {
              create: [
                {
                  title: "Overview\nDatabase Transactions and Atomic Operations",
                  content:
                    "This section introduces the crash course for database transactions and atomic operations. It explains the core idea behind all-or-nothing updates and why transaction safety is essential for reliable system behavior.",
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
                    "The key property of transactions is atomicity — the entire group of writes is treated as one indivisible unit. Without transaction:\nWrite 1 succeeds ✅\nWrite 2 fails ❌ ← partial state remains in DB\n\nWith transaction:\nWrite 1 succeeds ✅\nWrite 2 fails ❌ ← transaction rolls back Write 1 too\nResult: DB unchanged, consistent state preserved ✅",
                  order: 3,
                },
                {
                  title: "Prisma Transactions",
                  content:
                    "Prisma provides prisma.$transaction() to wrap multiple writes atomically:\n\nawait prisma.$transaction([\n  prisma.seat.update({\n    where: { id },\n    data: { status: 'BOOKED' }\n  }),\n  prisma.booking.create({\n    data: { userId, seatId, status: 'CONFIRMED' }\n  }),\n]);\n\nBoth writes succeed together, or neither is committed.",
                  order: 4,
                },
                {
                  title: "The Concurrency Problem",
                  content:
                    "Even with correct logic, concurrent requests can corrupt data.\n\nTimeline (no protection):\nRequest A checks seat count = 10\nRequest B checks seat count = 10\nRequest A books → sets to 9\nRequest B books → sets to 9 ← should have been rejected!\n\nResult: 2 bookings, but only 1 spot was available — the event is now over capacity.",
                  order: 5,
                },
                {
                  title: "Guard Conditions",
                  content:
                    "A conditional update prevents this by including a safety check in the update itself:\n\nprisma.event.updateMany({\n  where: {\n    id: eventId,\n    capacity: { gt: 0 } // only update if spots remain\n  },\n  data: {\n    capacity: { decrement: 1 }\n  },\n});\n\nIf 0 rows are updated, the booking is rejected — the event is already full.",
                  order: 6,
                },
                {
                  title: "Practice Lab: Atomic Transfer",
                  content:
                    "Implement an atomic transfer between two accounts.",
                  section_type: "INTERACTIVE" as const,
                  interactive_mode: "CODE_EDITOR" as const,
                  interactive_config: {
                    instructions:
                      "Implement atomicTransfer returning [newSender, newReceiver]. Insufficient → unchanged.",
                    language: "javascript",
                    starter_code:
                      "function atomicTransfer(senderBalance, receiverBalance, amount) {\n  // TODO\n}\n",
                    editable_regions: [
                      { placeholder: "// TODO", case_sensitive: true },
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
                        label: "insufficient funds — no change returned",
                      },
                      {
                        input: [30, 20, 30],
                        expected: [0, 50],
                        label: "exact funds — full transfer completes",
                      },
                    ],
                  
                    hints: [
                      "Check sender balance.",
                      "An atomic transfer either fully completes or does nothing at all. If the sender doesn't have enough, return both accounts unchanged. Otherwise, subtract from sender and add to receiver.",
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
                    "In `schema.prisma`, add `enum OrderStatus { COMPLETED VOIDED }`, then on the Order model add `status OrderStatus @default(COMPLETED)` and `voidedAt DateTime?`.",
                  order: 1,
                },
                {
                  description:
                    "Create `server/src/controllers/order.controller.ts` and export `voidOrder(orderId)`. Wrap the body in `prisma.$transaction(async (tx) => { ... })`.",
                  order: 2,
                },
                {
                  description:
                    "Inside the transaction: reject unless `order.status === 'COMPLETED'`, loop items restoring stock with `tx.inventory.update({ ..., data: { quantity: { increment: item.quantity } } })`, then update the order with `status: 'VOIDED'` and `voidedAt: new Date()`.",
                  order: 3,
                },
                {
                  description:
                    "In the checkout route, replace read-then-decrement with a guarded update: `tx.inventory.updateMany({ where: { productId, quantity: { gte: item.quantity } }, data: { quantity: { decrement: item.quantity } } })`, then throw when `result.count !== 1` so the transaction rolls back.",
                  order: 4,
                },
                {
                  description:
                    "Wire the endpoint in `server/src/routes/orders.ts` as `router.post('/:id/void', authenticate, voidOrderHandler)`.",
                  order: 5,
                },
              ],
            },
            order: 2,
            acceptance_criteria: {
              create: [
                {
                  description:
                    "server/prisma/schema.prisma declares `voidedAt DateTime?` inside the Order model — optional DateTime, so the exact `voidedAt` + `DateTime?` pairing must be present",
                  is_required: true,
                  order: 1,
                },
                {
                  description:
                    "server/prisma/schema.prisma declares `enum OrderStatus` and that enum contains both COMPLETED and VOIDED",
                  is_required: true,
                  order: 2,
                },
                {
                  description:
                    "The Order model in schema.prisma declares `status OrderStatus` with the attribute `@default(COMPLETED)`",
                  is_required: true,
                  order: 3,
                },
                {
                  description:
                    "server/src/controllers/order.controller.ts exists and exports a function named voidOrder",
                  is_required: true,
                  order: 4,
                },
                {
                  description:
                    "voidOrder performs its writes inside prisma.$transaction so the status flip, the voidedAt stamp and the stock restore are atomic",
                  is_required: true,
                  order: 5,
                },
                {
                  description:
                    "voidOrder writes the void timestamp as `voidedAt: new Date()`",
                  is_required: true,
                  order: 6,
                },
                {
                  description:
                    "voidOrder restores stock by using an increment operation against the inventory records for each OrderItem on the order",
                  is_required: true,
                  order: 7,
                },
                {
                  description:
                    "voidOrder guards on the COMPLETED status so an order that is not COMPLETED cannot be voided",
                  is_required: true,
                  order: 8,
                },
                {
                  description:
                    "The checkout handler in server/src/routes/orders.ts uses prisma's updateMany with a `gte` stock guard instead of read-then-write",
                  is_required: true,
                  order: 9,
                },
                {
                  description:
                    "The checkout handler checks the updateMany result count (for example `if (result.count !== 1)`) and throws so the transaction rolls back when the stock guard fails",
                  is_required: true,
                  order: 10,
                },
              ],
            },
          },
        ],
      },
    },
    {
      id: "pern-pos-level-4",
      title: "Full-Stack Feature: Promo Codes",
      subtitle:
        "Ship end-to-end validate-apply-redeem promo code flow with admin observability.",
      order: 4,
      deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
      level_description:
        "Mission Briefing: Marketing wants reusable promo codes the cashier can apply at checkout. Add a PromoCode model, POST /api/promos/validate, GET /api/promos (admin), wire the order create path to apply + atomically increment usedCount, hook voidOrder to decrement on reversal, and build the cashier UI + admin observability panel.",
      xp_reward: 250,
      coin_reward: 300,
      key_takeaways:
        "Validation endpoints can share business rules with transactional endpoints when both read the same source-of-truth row. Atomic counter updates with updateMany prevent two concurrent sales from consuming the same last slot. Admin observability panels make a feature operable from day one — cashiers and accountants shouldn't have to ask engineering what's happening.",
      scenario_id: "pern-pos-scenario-3",
      tasks: {
        create: [
          {
            task_name: "Validate & Apply Promo Code at POS Checkout",
            test_type: "both",
            user_story:
              "As a cashier, I want to enter a promo code at checkout and see an applied discount so that customers get the promotions marketing is running.",
            learning_sections: {
              create: [
                {
                  title:
                    "Overview\nFull-Stack Feature Patterns: Validation, Service Layer, and State-Driven UI",
                  content:
                    "Full-stack features span three layers — database, server, and client — each with distinct responsibilities. This section introduces the crash course for building a time-limited offer system: modeling constraints in the database, validating on the server, extending existing operations, and presenting state-driven UI responses.",
                  order: 1,
                },
                {
                  title: "Data Modeling for Time-Limited Offers",
                  content:
                    "Time-limited offers require tracking both a validity window and a consumption limit. The data model records the offer details (code, discount amount), its constraints (when it expires, how many times it can be used), and a toggle for manual deactivation. A used counter with a maxUses ceiling enforces supply limits. An isActive boolean allows operators to pull offers without deleting them. Each field encodes a distinct business rule in the schema.",
                  order: 2,
                },
                {
                  title: "Validation Endpoint Architecture",
                  content:
                    "A dedicated validation endpoint accepts the input to check and returns either a success with the computed result or a specific error. This keeps validation logic in one place rather than duplicating it across every code path. The server performs all checks inside a single read — existence, activity, expiry, and remaining capacity — then returns the discount amount and adjusted total, or an error code explaining exactly why validation failed.",
                  order: 3,
                },
                {
                  title: "Augmenting Existing Operations",
                  content:
                    "When a new feature needs data from an existing flow, the existing operation is extended — not duplicated. The order creation flow already handles stock decrement and payment within a transaction. Adding offer logic means inserting the re-validation, discount application, and usage counter increment into that same transaction. This keeps all related writes atomic under the same commit-or-rollback guarantee.",
                  order: 4,
                },
                {
                  title: "The Service Layer Pattern",
                  content:
                    "A service layer sits between UI components and the API. It abstracts network calls — each exported function corresponds to one API endpoint and returns the parsed response. Components call service functions instead of making raw HTTP requests. This isolates API contract changes from presentation logic: if an endpoint URL or response shape changes, only the service layer needs updating.",
                  order: 5,
                },
                {
                  title: "State-Driven UI",
                  content:
                    "Interactive features have multiple states depending on user action and server response: idle, loading, success, and various error states. Each state maps to a distinct view — an input field, a spinner, a confirmation display, or an error message. The component reads a local state variable and conditionally renders the appropriate UI. This pattern keeps the interface predictable and responsive across all interaction outcomes.",
                  order: 6,
                },
                {
                  title: "Practice Lab: Coupon Validator",
                  content: "Practice writing a coupon validation function.",
                  section_type: "INTERACTIVE" as const,
                  interactive_mode: "CODE_EDITOR" as const,
                  interactive_config: {
                    instructions:
                      "Implement isCouponValid(coupon, now) returning boolean: isActive && expiresAt > now && usedCount < maxUses.",
                    language: "javascript",
                    starter_code:
                      "export function isCouponValid(coupon, now) {\n  // isActive, not expired, has remaining uses\n}\n",
                    editable_regions: [
                      {
                        placeholder:
                          "// isActive, not expired, has remaining uses",
                        case_sensitive: false,
                      },
                    ],
                    entry_point: "isCouponValid",
                    test_cases: [
                      {
                        input: [
                          {
                            isActive: true,
                            expiresAt: new Date(9999, 0, 1),
                            usedCount: 0,
                            maxUses: 10,
                          },
                          new Date(),
                        ],
                        expected: true,
                        label: "valid coupon",
                      },
                      {
                        input: [
                          {
                            isActive: false,
                            expiresAt: new Date(9999, 0, 1),
                            usedCount: 0,
                            maxUses: 10,
                          },
                          new Date(),
                        ],
                        expected: false,
                        label: "inactive coupon",
                      },
                      {
                        input: [
                          {
                            isActive: true,
                            expiresAt: new Date(2000, 0, 1),
                            usedCount: 0,
                            maxUses: 10,
                          },
                          new Date(),
                        ],
                        expected: false,
                        label: "expired coupon",
                      },
                      {
                        input: [
                          {
                            isActive: true,
                            expiresAt: new Date(9999, 0, 1),
                            usedCount: 10,
                            maxUses: 10,
                          },
                          new Date(),
                        ],
                        expected: false,
                        label: "exhausted coupon",
                      },
                    ],
                    hints: [
                      "Combine with &&.",
                      "A coupon is valid only when ALL three conditions are true: it's active, it hasn't expired yet, and there are still uses remaining. Use the logical AND operator to join them.",
                      "return coupon.isActive ___ coupon.expiresAt > now ___ coupon.usedCount < coupon.maxUses;"
                    ],
                  },
                  order: 7,
                },
                {
                  title: "Key Takeaway",
                  content:
                    "Full-stack features follow a consistent pattern: model constraints in the database, validate on the server, extend existing transactions atomically, abstract network calls in a service layer, and let the server response drive the UI state.",
                  order: 8,
                },
              ],
            },
            hints: {
              create: [
                {
                  description:
                    "Add `model PromoCode` to `schema.prisma` with fields: `code String @unique`, `discountPercent Int`, `maxUses Int`, `usedCount Int @default(0)`, `expiresAt DateTime`, `isActive Boolean @default(true)`. Add optional `promoCodeId Int?` + relation to Order, then migrate.",
                  order: 1,
                },
                {
                  description:
                    "Create a promo controller exporting `validatePromo` (helper) and `validatePromoHandler` (Express handler). `validatePromo` returns a discriminated union with `ok: true`/`ok: false` branches and reason codes `NOT_FOUND | INACTIVE | EXPIRED | EXHAUSTED`.",
                  order: 2,
                },
                {
                  description:
                    "Create a promos route with `router.post('/validate', authenticate, validatePromoHandler)` and mount it in `index.ts` as `app.use('/api/promos', promoRoutes)`.",
                  order: 3,
                },
                {
                  description:
                    "In the `POST /api/orders` handler, destructure an optional `promoCode`, apply the discount, and inside the transaction bump the counter with `updateMany` using `usedCount: { increment: 1 }`.",
                  order: 4,
                },
                {
                  description:
                    "Create a promo service with `validatePromo` that calls `api.post('/promos/validate', ...)`.",
                  order: 5,
                },
                {
                  description:
                    "In `POSPage.tsx`, import the promo service, add a Promo Code input and Apply button in the checkout modal, and render the applied state using the returned `discountPercent`.",
                  order: 6,
                },
              ],
            },
            order: 1,
            acceptance_criteria: {
              create: [
                {
                  description:
                    "server/prisma/schema.prisma declares `model PromoCode`",
                  is_required: true,
                  order: 1,
                },
                {
                  description:
                    "PromoCode declares `code String @unique`",
                  is_required: true,
                  order: 2,
                },
                {
                  description:
                    "PromoCode declares discountPercent as Int, maxUses as Int, usedCount as Int with @default(0), expiresAt as DateTime, and isActive as Boolean with @default(true)",
                  is_required: true,
                  order: 3,
                },
                {
                  description:
                    "server/src/controllers/promo.controller.ts exists and exports both a function named validatePromo and a function named validatePromoHandler",
                  is_required: true,
                  order: 4,
                },
                {
                  description:
                    "validatePromo returns a discriminated union: the source contains both an `ok: true` branch and an `ok: false` branch, and the failure branch uses one of the reason codes NOT_FOUND, INACTIVE, EXPIRED or EXHAUSTED",
                  is_required: true,
                  order: 5,
                },
                {
                  description:
                    "server/src/routes/promos.ts exists and registers the literal route `router.post('/validate', ...)`",
                  is_required: true,
                  order: 6,
                },
                {
                  description:
                    "server/src/index.ts mounts the promo router at the path /api/promos",
                  is_required: true,
                  order: 7,
                },
                {
                  description:
                    "The checkout handler in server/src/routes/orders.ts accepts an optional promoCode from the request body",
                  is_required: true,
                  order: 8,
                },
                {
                  description:
                    "Inside the checkout transaction, PromoCode.usedCount is raised with an increment operation",
                  is_required: true,
                  order: 9,
                },
                {
                  description:
                    "client/src/services/promoService.ts exists and exposes a validatePromo function",
                  is_required: true,
                  order: 10,
                },
                {
                  description:
                    "promoService posts the code to the /promos/validate endpoint path",
                  is_required: true,
                  order: 11,
                },
                {
                  description:
                    "client/src/pages/pos/POSPage.tsx imports from a module path ending in promoService and uses promoService or validatePromo",
                  is_required: true,
                  order: 12,
                },
                {
                  description:
                    "The POSPage checkout modal renders a Promo Code labelled input together with an Apply control",
                  is_required: true,
                  order: 13,
                },
                {
                  description:
                    "POSPage renders the applied-discount state using the returned discountPercent value",
                  is_required: true,
                  order: 14,
                },
              ],
            },
          },
          {
            task_name: "Promo Lifecycle + Usage Integrity",
            test_type: "both",
            user_story:
              "As an admin, I want to see each promo's remaining uses and I want voiding a promo order to return its use to the pool — otherwise promotions become impossible to reconcile.",
            learning_sections: {
              create: [
                {
                  title:
                    "Overview\nAtomic Counters, Reversal Propagation, and Admin Observability",
                  content:
                    "This section introduces the crash course for managing limited-supply resources atomically, propagating reversals through dependent systems, and providing administrative visibility into resource usage.",
                  order: 1,
                },
                {
                  title: "Atomic Counter Guards",
                  content:
                    "A counter with a maximum ceiling (usedCount < maxUses) is vulnerable to race conditions — two concurrent requests can both read the counter before either increments it, and both pass. The guard is a conditional write: include the ceiling check inside the update's where clause so the database itself enforces the limit atomically. If zero rows match the combined condition (id + counter under limit), the resource is exhausted and the operation is rejected. This is the same guard-condition pattern that prevents overselling seats at an event.",
                  order: 2,
                },
                {
                  title: "Pre-Check vs. Atomic Check",
                  content:
                    "A pre-check reads state and makes a decision before writing — but between the read and write, another request can change the state. An atomic check combines the read and write into one operation. For counters with limits, always use the atomic approach: include the limit condition in the update's where clause rather than checking it in a separate query.",
                  order: 3,
                },
                {
                  title: "Admin Observability Endpoints",
                  content:
                    "Admin endpoints expose internal state for operations teams. They list resources with their current usage statistics — remaining capacity, expiry dates, and activity status. These endpoints are read-only and require elevated access. They provide the data needed for business decisions without exposing write capabilities to non-admin clients.",
                  order: 4,
                },
                {
                  title: "Reversal Propagation",
                  content:
                    "When an operation is reversed (an order cancelled, a reservation released), any counters that were incremented during the forward operation must be decremented. This keeps resource counts accurate over time. Without reversal propagation, cancelled operations permanently consume capacity — the resource slots they held are never freed for other users. The reversal must happen inside the same transaction as the cancellation so both the status change and the counter update commit or roll back together.",
                  order: 5,
                },
                {
                  title: "Admin Visibility into Resource State",
                  content:
                    "Administrative interfaces display resource usage data — remaining capacity, consumption rates, and expiry status. They consume the admin endpoint data and render it in a readable format. This gives operators the information they need to make decisions: when to add capacity, when to extend an offer, or when to retire a resource entirely.",
                  order: 6,
                },
                {
                  title: "Practice Lab: Counter Guard",
                  content: "Practice writing an atomic counter guard.",
                  section_type: "INTERACTIVE" as const,
                  interactive_mode: "CODE_EDITOR" as const,
                  interactive_config: {
                    instructions:
                      "Implement canUseCoupon(usedCount, maxUses) returning boolean: strict <.",
                    language: "javascript",
                    starter_code:
                      "export function canUseCoupon(usedCount, maxUses) {\n  // TODO\n}\n",
                    editable_regions: [
                      { placeholder: "// TODO", case_sensitive: false },
                    ],
                    entry_point: "canUseCoupon",
                    test_cases: [
                      {
                        input: [0, 10],
                        expected: true,
                        label: "has remaining uses",
                      },
                      {
                        input: [10, 10],
                        expected: false,
                        label: "exactly exhausted",
                      },
                      { input: [11, 10], expected: false, label: "over limit" },
                    ],
                  
                    hints: [
    "Strict less-than.",
    "Break this into smaller steps. What is the first transformation your input needs to become the output? Apply it, then think about the next step.",
    "return usedCount ___ maxUses;"
  ],
                  },
                  order: 7,
                },
                {
                  title: "Key Takeaway",
                  content:
                    "Counters with limits need atomic guards on increment and automatic decrement on reversal. Without both, resource slots leak — consumed on forward, never freed on reverse.",
                  order: 8,
                },
              ],
            },
            hints: {
              create: [
                {
                  description:
                    "In the checkout handler, make the redemption counter a single conditional `updateMany` inside the transaction with `where: { id, isActive: true, expiresAt: { gt: new Date() }, usedCount: { lt: promo.maxUses } }` and `data: { usedCount: { increment: 1 } }`, then throw when `promoUpdate.count !== 1`.",
                  order: 1,
                },
                {
                  description:
                    "Do not rely on a pre-read of `usedCount`/`maxUses`. The ceiling belongs in the `where` clause.",
                  order: 2,
                },
                {
                  description:
                    "Add `router.get('/', authenticate, authorize('ADMIN'), listPromosHandler)` to the promos route — the literal path is `/`.",
                  order: 3,
                },
                {
                  description:
                    "In the promo controller, add `listPromosHandler` and map each row to include a derived `remainingUses` field (e.g. `maxUses - usedCount`).",
                  order: 4,
                },
                {
                  description:
                    "In `voidOrder`, inside the same transaction as the stock restore, guard on `order.promoCodeId` and issue a `usedCount: { decrement: 1 }` update to return the use to the pool.",
                  order: 5,
                },
                {
                  description:
                    "Add `listPromos` to the promo service calling the `/promos` endpoint, then load it in `SettingsPage.tsx` and render a table with `code`, `discountPercent`, `remainingUses`, and `expiresAt` columns.",
                  order: 6,
                },
              ],
            },
            order: 2,
            acceptance_criteria: {
              create: [
                {
                  description:
                    "The checkout handler in server/src/routes/orders.ts enforces the usage ceiling atomically: the source references usedCount together with maxUses or an `lt` guard in the same conditional update",
                  is_required: true,
                  order: 1,
                },
                {
                  description:
                    "The checkout handler validates the promo's expiry inside the redemption path by comparing expiresAt against the current time (expiresAt must be greater than now, not less)",
                  is_required: true,
                  order: 2,
                },
                {
                  description:
                    "server/src/routes/promos.ts exposes an admin listing route registered on the literal path '/' and guarded by authorize('ADMIN')",
                  is_required: true,
                  order: 3,
                },
                {
                  description:
                    "server/src/controllers/promo.controller.ts contains listPromosHandler and that handler's response exposes a remainingUses value per promo",
                  is_required: true,
                  order: 4,
                },
                {
                  description:
                    "voidOrder in server/src/controllers/order.controller.ts checks the order's promoCode / promoCodeId and decrements PromoCode.usedCount when a promo was applied",
                  is_required: true,
                  order: 5,
                },
                {
                  description:
                    "client/src/services/promoService.ts exists and exposes a listPromos function that calls the /promos endpoint",
                  is_required: true,
                  order: 6,
                },
                {
                  description:
                    "client/src/pages/settings/SettingsPage.tsx imports from a module path ending in promoService",
                  is_required: true,
                  order: 7,
                },
                {
                  description:
                    "SettingsPage renders an admin promo panel that shows code, discountPercent, remainingUses and expiresAt for each promo",
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
      id: "pern-pos-level-5",
      title: "The Production Struggle: Sales Revenue Bug",
      subtitle:
        "Voided sales are inflating the Reports page — fix the source-of-truth predicate and centralize it.",
      order: 5,
      deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
      level_description:
        "Mission Briefing: Finance escalated — the Reports page total revenue doesn't match the cash drawer. Voided orders are still being counted, and worse, admins with edit access can flip status back to COMPLETED while voidedAt still holds the truth. Fix the predicate, centralize it, and write a postmortem so this never happens again.",
      xp_reward: 300,
      coin_reward: 400,
      key_takeaways:
        "Timestamp columns are write-once when set inside a transaction — that makes them source-of-truth for historical questions. Status enums are mutable and unreliable for financial reporting. Centralizing a Prisma where-clause builder + writing a postmortem converts a one-time fix into durable institutional knowledge.",
      scenario_id: "pern-pos-scenario-3",
      tasks: {
        create: [
          {
            task_name: "Stabilize Revenue Classification",
            test_type: "server",
            user_story:
              "As the finance lead, I want the Reports page revenue to exclude voided orders — including ones whose status has been manually flipped back to COMPLETED — so I can close the books.",
            learning_sections: {
              create: [
                {
                  title: "Overview\nSource-of-Truth Fields vs. Stale Status",
                  content:
                    "This crash course explains why mutable status fields are unreliable for financial queries and how timestamp fields provide an immutable source of truth.",
                  order: 1,
                },
                {
                  title: "Mutable State in Production",
                  content:
                    "A status field that any admin action can change is not a reliable filter for financial queries. A subscription that was cancelled (canceledAt set) but later had its status manually changed back to ACTIVE would pass a status-based filter — and its revenue would be counted. The mutable field tells you what someone last set it to, not what actually happened. Financial reporting must use fields that record the real-world event and never change afterwards.",
                  order: 2,
                },
                {
                  title: "Why status Is Unreliable",
                  content:
                    "status is a mutable field — any admin action can change it. A subscription can have:\nstatus: 'ACTIVE'     — because an admin fat-fingered it\ncanceledAt: <date>   — the immutable proof it was actually canceled\n\nThe canceledAt timestamp is set once and never changed. It is the source of truth.",
                  order: 3,
                },
                {
                  title: "Source-of-Truth Filters",
                  content:
                    "Instead of filtering by what a status field says, filter by the immutable timestamp field that records the real-world event. A subscription with canceledAt set — regardless of its current status — was canceled and must be excluded from revenue. The filter condition becomes a check on the timestamp field rather than the status field. This is reliable even when other parts of the system have inconsistent data.",
                  order: 4,
                },
                {
                  title: "Designing Tests for Stale State",
                  content:
                    "The key test case is a record where the mutable status contradicts the immutable timestamp: status='ACTIVE' but canceledAt set. A query filtering by status alone would include it (wrong). A query filtering by canceledAt would exclude it (correct). Tests should cover all four combinations: canceled with matching status, canceled with conflicting status, active with matching status, and active with no timestamp. The stale-status case — where the two fields disagree — is the one that catches the bug.",
                  order: 5,
                },
                {
                  title: "Practice Lab: Active Subscription Filter",
                  content:
                    "Practice writing a filter that trusts canceledAt over status.",
                  section_type: "INTERACTIVE" as const,
                  interactive_mode: "CODE_EDITOR" as const,
                  interactive_config: {
                    instructions:
                      "Implement getActiveSubscriptions(subscriptions) returning subs where canceledAt is null. Do NOT filter by status.",
                    language: "javascript",
                    starter_code:
                      "export function getActiveSubscriptions(subscriptions) {\n  // TODO: return only subscriptions where canceledAt is null\n}\n",
                    editable_regions: [
                      {
                        placeholder:
                          "// TODO: return only subscriptions where canceledAt is null",
                        case_sensitive: false,
                      },
                    ],
                    entry_point: "getActiveSubscriptions",
                    test_cases: [
                      {
                        input: [
                          [
                            { name: "Basic", canceledAt: null },
                            { name: "Premium", canceledAt: new Date() },
                          ],
                        ],
                        expected: [{ name: "Basic", canceledAt: null }],
                        label: "excludes canceled",
                      },
                      {
                        input: [
                          [
                            { name: "Pro", canceledAt: null, status: "ACTIVE" },
                            {
                              name: "Enterprise",
                              canceledAt: new Date(),
                              status: "ACTIVE",
                            },
                          ],
                        ],
                        expected: [
                          { name: "Pro", canceledAt: null, status: "ACTIVE" },
                        ],
                        label:
                          "excludes stale-status with canceledAt set",
                      },
                    ],
                  
                    hints: [
                      ".filter() checking the canceledAt field.",
                      "Walk through the array and build a new one keeping only the items that pass your check. Think about which field tells the truth — the immutable timestamp, not the mutable status.",
                      "return subscriptions.filter(s => s.___ === ___);"
                      ],
                  },
                  order: 6,
                },
                {
                  title: "Key Takeaway",
                  content:
                    "In financial reporting, never trust mutable status fields. Use the immutable timestamp that was set at the moment the real-world event occurred.",
                  order: 7,
                },
              ],
            },
            hints: {
              create: [
                {
                  description:
                    "The revenue predicate must check `voidedAt === null` and ignore `status` entirely — a stale COMPLETED order with `voidedAt` set must be excluded.",
                  order: 1,
                },
                {
                  description:
                    "The predicate is called with plain objects `{ id, status, voidedAt }` — accept a loose type and read only `voidedAt`.",
                  order: 2,
                },
                {
                  description:
                    "In the daily revenue query, add `voidedAt: null` to the where clause alongside the `createdAt` range.",
                  order: 3,
                },
                {
                  description:
                    "A stale-status regression case is a voided order whose status was flipped back to COMPLETED. Only the `voidedAt` timestamp distinguishes it.",
                  order: 4,
                },
              ],
            },
            order: 1,
            acceptance_criteria: {
              create: [
                {
                  description:
                    "server/src/utils/revenueUtils.ts exists",
                  is_required: true,
                  order: 1,
                },
                {
                  description:
                    "revenueUtils exports a function named isRevenueEligibleOrder",
                  is_required: true,
                  order: 2,
                },
                {
                  description:
                    "isRevenueEligibleOrder returns false for a stale-status voided order — an order with status COMPLETED but voidedAt set to a Date must be excluded",
                  is_required: true,
                  order: 3,
                },
                {
                  description:
                    "isRevenueEligibleOrder returns true for a genuine completed order — status COMPLETED with voidedAt null must still count as revenue",
                  is_required: true,
                  order: 4,
                },
                {
                  description:
                    "isRevenueEligibleOrder returns false for an order with status VOIDED and voidedAt set to a Date",
                  is_required: true,
                  order: 5,
                },
                {
                  description:
                    "The daily revenue query in server/src/routes/orders.ts filters on the literal predicate `voidedAt: null`",
                  is_required: true,
                  order: 6,
                },
                {
                  description:
                    "The revenue filter in orders.ts is not a status-only filter — there must be no `status: 'COMPLETED'` line marked as the revenue filter",
                  is_required: true,
                  order: 7,
                },
              ],
            },
          },
          {
            task_name: "Permanent Fix + Centralization + Postmortem",
            test_type: "server",
            user_story:
              "As an engineer, I want the revenue predicate centralized into a utility and a postmortem written so the next person inheriting this code doesn't re-introduce the bug.",
            learning_sections: {
              create: [
                {
                  title:
                    "Overview\nShared Utilities, Regression Tests, and Postmortems",
                  content:
                    "This section introduces the crash course for extracting business predicates into reusable pure functions, designing regression test suites that cover stale-state scenarios, and writing structured incident postmortems.",
                  order: 1,
                },
                {
                  title: "Why Centralise the Revenue Predicate?",
                  content:
                    "If the same canceledAt: null filter is copied into three report endpoints and one of them is updated while the others are forgotten, the bug returns. A single isEligibleForRevenue function is the single point of change.",
                  order: 2,
                },
                {
                  title: "Pure Functions for Shared Logic",
                  content:
                    "A predicate function that checks a business rule (is this subscription eligible for revenue reporting?) takes a record and returns a boolean. It is a pure function — same input always produces the same output, and it has no side effects. This makes it testable without a database: instantiate an object with known fields, pass it to the function, and assert the result. Pure predicate functions are the foundation of reliable reporting logic because they can be unit-tested in isolation.",
                  order: 3,
                },
                {
                  title: "Regression Test Cases",
                  content:
                    "Test all four meaningful scenarios:\n1. canceledAt set, status CANCELED → false (normal cancel)\n2. canceledAt set, status ACTIVE   → false (stale status!)\n3. canceledAt null, status ACTIVE  → true (active sub)\n4. canceledAt null, status EXPIRED → true (expired sub was never canceled)",
                  order: 4,
                },
                {
                  title: "Structured Incident Documentation",
                  content:
                    "A postmortem documents what went wrong and how to prevent recurrence. It has four parts: the symptom (what the user or system observed), the root cause (why the code was incorrect), the fix (what changed), and the prevention step (what process or test will catch this in the future). The value is not in the document itself but in the discipline of tracing the full chain from symptom to systemic fix.",
                  order: 5,
                },
                {
                  title: "Practice Lab: Eligibility Check",
                  content:
                    "Practice writing a predicate that filters subscriptions by a source-of-truth field.",
                  section_type: "INTERACTIVE" as const,
                  interactive_mode: "CODE_EDITOR" as const,
                  interactive_config: {
                    instructions:
                      "Implement isEligibleForRevenue(sub) returning boolean: canceledAt === null. Do NOT check status.",
                    language: "javascript",
                    starter_code:
                      "export function isEligibleForRevenue(sub) {\n  // Return true if subscription was never canceled\n}\n",
                    editable_regions: [
                      {
                        placeholder:
                          "// Return true if subscription was never canceled",
                        case_sensitive: false,
                      },
                    ],
                    entry_point: "isEligibleForRevenue",
                    test_cases: [
                      {
                        input: [
                          { amount: 100, canceledAt: null, status: "ACTIVE" },
                        ],
                        expected: true,
                        label: "active — eligible",
                      },
                      {
                        input: [
                          {
                            amount: 50,
                            canceledAt: new Date("2026-01-01"),
                            status: "CANCELED",
                          },
                        ],
                        expected: false,
                        label: "canceled — not eligible",
                      },
                      {
                        input: [
                          {
                            amount: 75,
                            canceledAt: new Date("2026-01-01"),
                            status: "ACTIVE",
                          },
                        ],
                        expected: false,
                        label: "stale status canceled — not eligible",
                      },
                    ],
                  
                    hints: [
                      "Check canceledAt only.",
                      "Ignore the status field entirely — it can lie. The only field that tells you whether a subscription was actually canceled is the timestamp that was set at the moment of cancellation.",
                      "return sub.___ === ___;"
                      ],
                  },
                  order: 6,
                },
                {
                  title: "Key Takeaway",
                  content:
                    "A production fix is only complete when there are tests that would have caught the bug, shared logic that prevents drift, and documentation that teaches the next developer why the filter is the way it is.",
                  order: 7,
                },
              ],
            },
            hints: {
              create: [
                {
                  description:
                    "Add a `revenueWhereClause` utility that returns `{ voidedAt: null, ...extra }`.",
                  order: 1,
                },
                {
                  description:
                    "Import `revenueWhereClause` in the orders route and replace every hand-written `{ voidedAt: null }` where clause with a call to it.",
                  order: 2,
                },
                {
                  description:
                    "Confirm the regression case still holds: a voided order with status COMPLETED must be excluded after the refactor.",
                  order: 3,
                },
                {
                  description:
                    "Write a postmortem with level-2 headings: Symptom, Root Cause, Fix, Prevention.",
                  order: 4,
                },
              ],
            },
            order: 2,
            acceptance_criteria: {
              create: [
                {
                  description:
                    "server/src/utils/revenueUtils.ts exports a function named revenueWhereClause alongside isRevenueEligibleOrder",
                  is_required: true,
                  order: 1,
                },
                {
                  description:
                    "revenueWhereClause() called with no arguments returns an object whose voidedAt property is null",
                  is_required: true,
                  order: 2,
                },
                {
                  description:
                    "revenueWhereClause(extra) merges the caller's predicates into the result while still keeping voidedAt: null — passing { createdAt: { gte: <date> } } must return both a voidedAt and a createdAt key",
                  is_required: true,
                  order: 3,
                },
                {
                  description:
                    "server/src/routes/orders.ts contains an import statement whose module path ends in revenueUtils and binds revenueWhereClause",
                  is_required: true,
                  order: 4,
                },
                {
                  description:
                    "orders.ts actually uses revenueWhereClause in its stats/reports queries instead of duplicating the predicate inline",
                  is_required: true,
                  order: 5,
                },
                {
                  description:
                    "Regression holds after centralisation: isRevenueEligibleOrder returns false for an order with status COMPLETED and voidedAt set (the stale-status voided order)",
                  is_required: true,
                  order: 6,
                },
                {
                  description:
                    "server/POSTMORTEM_REVENUE.md exists at that exact path",
                  is_required: true,
                  order: 7,
                },
                {
                  description:
                    "POSTMORTEM_REVENUE.md contains the four level-2 headings `## Symptom`, `## Root Cause`, `## Fix` and `## Prevention` (case-insensitive heading match)",
                  is_required: true,
                  order: 8,
                },
              ],
            },
          },
        ],
      },
    },
];
