export const scenarios = [
  {
    id: "pern-pos-scenario-3",
    name: "IPPO POS System",
    description:
      "Build and debug a production-grade Point-of-Sale system for IPPO Software Solutions using React 18, Express, Prisma, and PostgreSQL. Progress from environment setup through cashier UI helpers, transactional inventory/void flows, a full-stack promo-code feature, and a critical revenue-reporting bug.",
    difficulty: "expert",
    paywall: true,
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
                    "There are three directories that each contain a package.json — you must run pnpm install in all three (root, client/, server/).",
                  order: 1,
                },
                {
                  description:
                    "Check the README for the required environment variables and create a .env file inside server/ before running migrations.",
                  order: 2,
                },
                {
                  description:
                    "After installing server dependencies, run `pnpm db:migrate` inside the server/ directory to apply the schema.",
                  order: 3,
                },
              ],
            },
            order: 1,
            acceptance_criteria: {
              create: [
                {
                  description:
                    "Dependencies installed in root, client/, and server/ without errors",
                  is_required: true,
                  order: 1,
                },
                {
                  description:
                    "Prisma migrations applied successfully to PostgreSQL",
                  is_required: true,
                  order: 2,
                },
                {
                  description:
                    "Client (port 5173) and server (port 5000) start without errors",
                  is_required: true,
                  order: 3,
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
                    "Open client/src/components/layout/Sidebar.tsx and search for the current subtitle — it is a hardcoded string inside a <span> element near the brand logo.",
                  order: 1,
                },
                {
                  description:
                    "Copy the exact string from the acceptance criteria — including spaces and capitalisation.",
                  order: 2,
                },
                {
                  description:
                    "After saving, confirm the change appears in the running browser on both expanded and collapsed sidebar states.",
                  order: 3,
                },
              ],
            },
            order: 2,
            acceptance_criteria: {
              create: [
                {
                  description:
                    'Sidebar subtitle is exactly "IPPO Software Solutions"',
                  is_required: true,
                  order: 1,
                },
                {
                  description:
                    "Subtitle renders correctly across sidebar states",
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
],},
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
                    "Create client/src/utils/formatters.ts and export getStockLevel(quantity: number, threshold: number).",
                  order: 1,
                },
                {
                  description:
                    "Handle quantity <= 0 first — otherwise an OUT_OF_STOCK item with a threshold of 0 is misclassified as LOW_STOCK.",
                  order: 2,
                },
                {
                  description:
                    "The function must be pure — no imports, no DOM, no network. Just two numbers in, a string out.",
                  order: 3,
                },
              ],
            },
            order: 1,
            acceptance_criteria: {
              create: [
                {
                  description:
                    "formatters.ts exists at client/src/utils/formatters.ts",
                  is_required: true,
                  order: 1,
                },
                {
                  description: "getStockLevel is exported as a named export",
                  is_required: true,
                  order: 2,
                },
                {
                  description: "Returns 'OUT_OF_STOCK' when quantity <= 0",
                  is_required: true,
                  order: 3,
                },
                {
                  description:
                    "Returns 'LOW_STOCK' when 0 < quantity <= threshold",
                  is_required: true,
                  order: 4,
                },
                {
                  description: "Returns 'IN_STOCK' when quantity > threshold",
                  is_required: true,
                  order: 5,
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
                    ],},
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
                    "Import getStockLevel in POSPage.tsx and InventoryPage.tsx, then replace inline stock checks with the helper.",
                  order: 1,
                },
                {
                  description:
                    "Add a boolean state (hideOutOfStock) to POSPage and a checkbox labelled 'Hide out-of-stock items' that toggles it.",
                  order: 2,
                },
                {
                  description:
                    "When hideOutOfStock is true, filter OUT_OF_STOCK products out of the grid — don't just hide them with CSS.",
                  order: 3,
                },
                {
                  description:
                    "Always disable the add-to-cart button for OUT_OF_STOCK items so the cashier can't accidentally ring them up.",
                  order: 4,
                },
              ],
            },
            order: 2,
            acceptance_criteria: {
              create: [
                {
                  description:
                    "POSPage.tsx imports getStockLevel from formatters",
                  is_required: true,
                  order: 1,
                },
                {
                  description:
                    "InventoryPage.tsx imports getStockLevel from formatters",
                  is_required: true,
                  order: 2,
                },
                {
                  description:
                    "POSPage renders a 'Hide out-of-stock items' checkbox",
                  is_required: true,
                  order: 3,
                },
                {
                  description:
                    "Toggling the checkbox filters OUT_OF_STOCK items out of the product grid",
                  is_required: true,
                  order: 4,
                },
                {
                  description:
                    "OUT_OF_STOCK products are disabled (cannot be added to cart)",
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
                    ],},
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
                    "Open server/src/routes/orders.ts and locate the checkout handler — look for where inventory is read before it is decremented.",
                  order: 1,
                },
                {
                  description:
                    "Open server/prisma/schema.prisma and confirm that the Order model has no status or voidedAt columns today.",
                  order: 2,
                },
                {
                  description:
                    "Your test must exercise the schema and route as they exist today — the tests in tests/server/level-3/task-1 document the gaps that Level 3 Task 2 will fix.",
                  order: 3,
                },
              ],
            },
            order: 1,
            acceptance_criteria: {
              create: [
                {
                  description:
                    "tests/server/level-3/task-1 tests assert the current schema lacks OrderStatus + voidedAt",
                  is_required: true,
                  order: 1,
                },
                {
                  description:
                    "Tests assert that there is no voidOrder export today (it will be introduced in Task 2)",
                  is_required: true,
                  order: 2,
                },
                {
                  description:
                    "Tests assert that no POST /:id/void route is registered yet",
                  is_required: true,
                  order: 3,
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
                    ],},
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
                    "Add `enum OrderStatus { COMPLETED VOIDED }`, `status OrderStatus @default(COMPLETED)`, and `voidedAt DateTime?` to server/prisma/schema.prisma.",
                  order: 1,
                },
                {
                  description:
                    "Create server/src/controllers/order.controller.ts exporting voidOrder(orderId). Wrap every DB touch in prisma.$transaction.",
                  order: 2,
                },
                {
                  description:
                    "In checkout, replace the read-then-decrement pattern with `tx.inventory.updateMany({ where: { productId, quantity: { gte: item.quantity } }, data: { quantity: { decrement: item.quantity } } })` and throw when count !== 1.",
                  order: 3,
                },
                {
                  description:
                    "Wire POST /api/orders/:id/void to voidOrderHandler inside server/src/routes/orders.ts.",
                  order: 4,
                },
              ],
            },
            order: 2,
            acceptance_criteria: {
              create: [
                {
                  description:
                    "schema.prisma has OrderStatus enum with COMPLETED and VOIDED",
                  is_required: true,
                  order: 1,
                },
                {
                  description:
                    "schema.prisma Order model has voidedAt DateTime? field",
                  is_required: true,
                  order: 2,
                },
                {
                  description:
                    "order.controller.ts exports voidOrder which uses prisma.$transaction",
                  is_required: true,
                  order: 3,
                },
                {
                  description:
                    "voidOrder restores inventory via increment on each OrderItem",
                  is_required: true,
                  order: 4,
                },
                {
                  description:
                    "voidOrder stamps voidedAt = new Date() and flips status to VOIDED",
                  is_required: true,
                  order: 5,
                },
                {
                  description:
                    "Checkout uses updateMany with gte guard and throws when count !== 1",
                  is_required: true,
                  order: 6,
                },
                {
                  description: "POST /api/orders/:id/void route is registered",
                  is_required: true,
                  order: 7,
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
                    ],},
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
                    "Add the PromoCode model to schema.prisma and add optional promoCodeId to Order, then run pnpm db:migrate.",
                  order: 1,
                },
                {
                  description:
                    "Create server/src/controllers/promo.controller.ts with validatePromo (helper) + validatePromoHandler (Express handler).",
                  order: 2,
                },
                {
                  description:
                    "Create server/src/routes/promos.ts and mount it at /api/promos in server/src/index.ts.",
                  order: 3,
                },
                {
                  description:
                    "Create client/src/services/promoService.ts and call it from POSPage.tsx's checkout modal.",
                  order: 4,
                },
              ],
            },
            order: 1,
            acceptance_criteria: {
              create: [
                {
                  description:
                    "schema.prisma has PromoCode model with unique code field",
                  is_required: true,
                  order: 1,
                },
                {
                  description:
                    "POST /api/promos/validate returns discountPercent + finalTotal on success",
                  is_required: true,
                  order: 2,
                },
                {
                  description:
                    "POST /api/orders accepts optional promoCode and applies the discount",
                  is_required: true,
                  order: 3,
                },
                {
                  description:
                    "Order transaction increments PromoCode.usedCount atomically",
                  is_required: true,
                  order: 4,
                },
                {
                  description:
                    "POSPage checkout modal renders a Promo Code input + Apply button",
                  is_required: true,
                  order: 5,
                },
                {
                  description:
                    "POSPage renders applied / invalid / expired / exhausted states clearly",
                  is_required: true,
                  order: 6,
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
],},
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
                    "Inside POST /api/orders, after findUnique(promo), use updateMany with a usedCount: { lt: appliedPromo.maxUses } guard and check count === 1.",
                  order: 1,
                },
                {
                  description:
                    "In voidOrder, after flipping status, check if order.promoCodeId is set and decrement that row's usedCount inside the same transaction.",
                  order: 2,
                },
                {
                  description:
                    "GET /api/promos should be protected by authorize('ADMIN') and include remainingUses in the response shape.",
                  order: 3,
                },
                {
                  description:
                    "SettingsPage.tsx should load promoService.listPromos() on mount and render a table with code, discount, remainingUses, expiresAt, and isActive.",
                  order: 4,
                },
              ],
            },
            order: 2,
            acceptance_criteria: {
              create: [
                {
                  description:
                    "Order creation uses updateMany with usedCount: { lt: maxUses } guard",
                  is_required: true,
                  order: 1,
                },
                {
                  description:
                    "Order creation validates expiresAt and isActive inside the same transaction",
                  is_required: true,
                  order: 2,
                },
                {
                  description:
                    "voidOrder decrements PromoCode.usedCount when promoCodeId is set",
                  is_required: true,
                  order: 3,
                },
                {
                  description: "GET /api/promos is ADMIN-only",
                  is_required: true,
                  order: 4,
                },
                {
                  description:
                    "GET /api/promos returns remainingUses for each promo",
                  is_required: true,
                  order: 5,
                },
                {
                  description: "SettingsPage renders an admin promo-list panel",
                  is_required: true,
                  order: 6,
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
                    ],},
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
                    "Open server/src/routes/orders.ts and locate GET /reports/daily. Replace status-based filtering with voidedAt: null.",
                  order: 1,
                },
                {
                  description:
                    "Write a regression test at tests/server/level-5/task-1/revenue-classification.test.ts that asserts a stale-status order is excluded.",
                  order: 2,
                },
                {
                  description:
                    "Do not filter by status === 'COMPLETED' as a substitute — the bug is that status can be flipped back.",
                  order: 3,
                },
              ],
            },
            order: 1,
            acceptance_criteria: {
              create: [
                {
                  description: "Daily revenue query filters by voidedAt: null",
                  is_required: true,
                  order: 1,
                },
                {
                  description:
                    "Stale-status test (status COMPLETED, voidedAt set) fails without the fix and passes with it",
                  is_required: true,
                  order: 2,
                },
                {
                  description:
                    "Normal completed order (voidedAt null) is still included",
                  is_required: true,
                  order: 3,
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
                    ],},
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
                    "Create server/src/utils/revenueUtils.ts exporting isRevenueEligibleOrder and revenueWhereClause.",
                  order: 1,
                },
                {
                  description:
                    "Replace the ad-hoc `voidedAt: null` spreads in orders.ts with imports from revenueUtils.",
                  order: 2,
                },
                {
                  description:
                    "Create server/POSTMORTEM_REVENUE.md with the four required sections: Symptom, Root Cause, Fix, Prevention.",
                  order: 3,
                },
              ],
            },
            order: 2,
            acceptance_criteria: {
              create: [
                {
                  description:
                    "server/src/utils/revenueUtils.ts exists and exports isRevenueEligibleOrder + revenueWhereClause",
                  is_required: true,
                  order: 1,
                },
                {
                  description:
                    "revenueWhereClause() returns { voidedAt: null }",
                  is_required: true,
                  order: 2,
                },
                {
                  description:
                    "isRevenueEligibleOrder returns false for stale-status voided orders",
                  is_required: true,
                  order: 3,
                },
                {
                  description:
                    "orders.ts stats/reports endpoints import revenueWhereClause",
                  is_required: true,
                  order: 4,
                },
                {
                  description:
                    "POSTMORTEM_REVENUE.md exists with Symptom, Root Cause, Fix, and Prevention sections",
                  is_required: true,
                  order: 5,
                },
              ],
            },
          },
        ],
      },
    },
];
