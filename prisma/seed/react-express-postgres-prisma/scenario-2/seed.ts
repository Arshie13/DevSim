export const scenarios = [
  {
    id: "pern-oe-scenario-2",
    name: "UrbanPottery Online Enterprise",
    description:
      "Build and debug a production-grade e-commerce platform for UrbanPottery ceramics using React 18, Express, Prisma, and PostgreSQL. Progress from environment setup through client helpers, backend transactions, full-stack features, and a critical revenue bug fix.",
    difficulty: "expert",
  },
];

export const levels = [
    {
      id: "pern-oe-level-1",
      title: "Getting Familiar with the Codebase",
      subtitle:
        "Set up the development environment and make a minor brand UI change.",
      order: 1,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      level_description:
        "Mission Briefing: UrbanPottery has just onboarded a new developer. Get the PERN stack running locally — install dependencies in all three package roots, run Prisma migrations, start both dev servers, and update the brand name in the Navbar to match the official style guide.",
      xp_reward: 100,
      coin_reward: 50,
      key_takeaways:
        "A PERN stack project requires separate pnpm install runs in the root, client/, and server/ directories. Prisma migrations keep the PostgreSQL schema in sync with your code. Environment variables (DATABASE_URL, PORT) are read by dotenv and must never be committed. React layout components like Navbar are the single place to update global brand text — change it once and it updates everywhere.",
      scenario_id: "pern-oe-scenario-2",
      tasks: {
        create: [
          {
            task_name: "Prepare Development Environment",
            test_type: "client",
            user_story:
              "As a developer, I want to set up my local PERN environment so that I can run the UrbanPottery app and start contributing.",
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
                    'Sensitive configuration such as database credentials is stored in .env files rather than hardcoded in source code.\nDATABASE_URL="postgresql://user:password@localhost:5432/urbanpottery"\nPORT=5000\nThe dotenv package reads these files and provides the values via process.env in Node.js. .env files are listed in .gitignore because they contain secrets that should not be committed to version control.\n\nNote: Environment variables in this project are pre-configured.',
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
                    "After installing server dependencies, run `pnpm exec prisma migrate dev` inside the server/ directory to apply the schema.",
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
                    "Prisma migrations executed successfully (schema applied to PostgreSQL)",
                  is_required: true,
                  order: 2,
                },
                {
                  description:
                    "Both client (port 5173) and server (port 5000) start without errors",
                  is_required: true,
                  order: 3,
                },
              ],
            },
          },
          {
            task_name: "Update Brand Identity in Navbar",
            test_type: "client",
            user_story:
              "As a user, I want the navbar to show the full official brand name so that the site matches the marketing style guide.",
            learning_sections: {
              create: [
                {
                  title: "Overview\nEditing React Layout Components",
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
                    "In most React apps, elements like the header and footer live in layout components — shared wrappers used across multiple pages. Changing text in the layout updates it across all pages.\n\nA typical layout structure:\ncomponents/\n    └── layout/\n          ├── Navbar.tsx ← top navigation bar\n          ├── Sidebar.tsx ← side menu\n          └── Footer.tsx ← bottom bar",
                  order: 3,
                },
                {
                  title: "How to Find What to Change",
                  content:
                    "To locate the source of a UI element visible in the browser:\nWhat element is it? (navbar, footer, sidebar?)\nWhich component renders it? (trace it to a file)\nIs the text hardcoded or coming from props/state? For brand text in the navbar, the hardcoded string is located inside the layout's navbar component, such as \"UrbanPottery\" or a similar label.",
                  order: 4,
                },
                {
                  title: "JSX Text Content",
                  content:
                    'Changing text in JSX is straightforward — it\'s just like editing HTML:\n// Before\n<span className="font-bold">Old Brand</span>\n// After\n<span className="font-bold">UrbanPottery Artisan Ceramics</span>',
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
                    "UI changes in React trace back to a component file. Layout components are the primary location for global elements such as headers and navbars. The source text is found inside the component and modified there.",
                  order: 8,
                },
              ],
            },
            hints: {
              create: [
                {
                  description:
                    "Open client/src/components/layout/Navbar.tsx and search for the current brand text — it is a hardcoded string inside a <span> element near the logo.",
                  order: 1,
                },
                {
                  description:
                    "The acceptance criteria specifies the exact string — copy it character-for-character including spaces and capitalisation.",
                  order: 2,
                },
                {
                  description:
                    "After saving, confirm the change appears in the running browser on both desktop and mobile viewport widths.",
                  order: 3,
                },
              ],
            },
            order: 2,
            acceptance_criteria: {
              create: [
                {
                  description:
                    'Navbar brand text is exactly "UrbanPottery Artisan Ceramics"',
                  is_required: true,
                  order: 1,
                },
                {
                  description:
                    "Brand renders correctly on desktop and mobile viewports",
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
      id: "pern-oe-level-2",
      title: "Client-Side Exploration",
      subtitle: "Build a stock status helper and adopt it across the UI.",
      order: 2,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      level_description:
        "Mission Briefing: The shop page uses duplicate inline stock checks scattered across components. Your job is to create a shared getStockStatus helper that returns a 3-state enum, then refactor ProductCard to use it and add a 'Hide out-of-stock' toggle on the Shop page.",
      xp_reward: 25,
      coin_reward: 125,
      key_takeaways:
        "Pure functions returning union types are more expressive than booleans when there are more than two meaningful states. Centralising threshold logic in a shared helper eliminates drift between components. A user-facing filter toggle driven by the helper proves the abstraction is working end-to-end.",
      scenario_id: "pern-oe-scenario-2",
      tasks: {
        create: [
          {
            task_name: "Add Stock Status Classifier Helper",
            test_type: "client",
            user_story:
              "As a developer, I want a getStockStatus helper in formatters.ts so that stock-level decisions are consistent and testable across all components.",
            learning_sections: {
              create: [
                {
                  title: "Overview\nPure Functions and Utility Helpers in React",
                  content:
                    "This section introduces the crash course for pure functions and reusable utility helpers in React. It outlines why centralized logic improves consistency, testability, and maintainability across the stock status workflow.",
                  order: 1,
                },
                {
                  title: "What is a Pure Function?",
                  content:
                    "A pure function is a function that:\n - Always returns the same output for the same input\n - Has no side effects (doesn't modify anything outside itself)\n\n// Pure function ✅\nfunction getStockStatus(stock: number): string {\n  if (stock <= 0) return 'OUT_OF_STOCK';\n  if (stock <= 5) return 'LOW_STOCK';\n  return 'IN_STOCK';\n}\n\n// NOT pure ❌ — reads external state\nfunction getStockStatus(): string {\n  if (globalStock <= 0) return 'OUT_OF_STOCK';\n  ...\n}\n\nPure functions are predictable, easy to test, and safe to reuse anywhere.",
                  order: 2,
                },
                {
                  title: "Why Centralize Logic in a Helper?",
                  content:
                    "Imagine the same stock check scattered across 3 different components:\n\n// In ProductCard.tsx\nif (product.stock === 0) { showOutOfStockOverlay(); }\n\n// In Shop.tsx\nif (product.stock <= 0) { hideFromGrid(); } // slightly different!\n\n// In Cart.tsx\nif (product.stock < 1) { disableCheckout(); } // also different!\n\nEach variation is a bug waiting to happen. If the stock thresholds change, you'd need to update every file. With a centralized helper, every component imports and uses the same logic.\n\nOne change = consistent behavior everywhere.",
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
                    "When writing stock status logic, you need to handle edge cases — inputs at or near the boundary of expected values:\n\n| stock | result          |\n|  5    | LOW_STOCK       |\n|  1    | LOW_STOCK       |\n|  0    | OUT_OF_STOCK    |\n| -1    | OUT_OF_STOCK    |\n\nThe 0 boundary is the most important: a product with 0 stock should always return OUT_OF_STOCK, even though 0 is technically a valid number.",
                  order: 5,
                },
                {
                  title: "Exporting from a Module",
                  content:
                    "To use your helper in other files, you must export it:\n\n// utils/formatters.ts\nexport function getStockStatus(stock: number): string {\n  if (stock <= 0) return 'OUT_OF_STOCK';\n  if (stock <= 5) return 'LOW_STOCK';\n  return 'IN_STOCK';\n}\n\nAnd import it where needed:\nimport { getStockStatus } from '../utils/formatters';",
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
                      "Implement calculateTotal(price, quantity) returning the product as a number.",
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
    "Multiply the two arguments.",
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
                    "Add the function to client/src/utils/formatters.ts and export it — you do not need a new file.",
                  order: 1,
                },
                {
                  description:
                    "Pay close attention to the boundary values: stock === 0 must be OUT_OF_STOCK, stock === 1 must be LOW_STOCK, stock === 5 must be LOW_STOCK, and stock === 6 must be IN_STOCK.",
                  order: 2,
                },
                {
                  description:
                    "Make sure the function is also re-exported from client/src/utils/index.ts so other files can import it via '../utils'.",
                  order: 3,
                },
              ],
            },
            order: 1,
            acceptance_criteria: {
              create: [
                {
                  description:
                    "getStockStatus is exported from client/src/utils/formatters.ts",
                  is_required: true,
                  order: 1,
                },
                {
                  description: "Returns 'OUT_OF_STOCK' for stock <= 0",
                  is_required: true,
                  order: 2,
                },
                {
                  description: "Returns 'LOW_STOCK' for stock 1..5 (inclusive)",
                  is_required: true,
                  order: 3,
                },
                {
                  description: "Returns 'IN_STOCK' for stock > 5",
                  is_required: true,
                  order: 4,
                },
                {
                  description:
                    "Boundary values 0, 1, 5, 6 all return the correct bucket",
                  is_required: true,
                  order: 5,
                },
                {
                  description:
                    "Function is pure — same input always returns same output",
                  is_required: true,
                  order: 6,
                },
              ],
            },
          },
          {
            task_name: "Adopt Stock Helper in ProductCard & Shop Filter",
            test_type: "client",
            user_story:
              "As a shopper, I want to toggle 'Hide out-of-stock' on the Shop page so I only see products I can actually buy.",
            learning_sections: {
              create: [
                {
                  title:
                    "Overview\nRefactoring: Replacing Inline Logic with Shared Helpers",
                  content:
                    "This section introduces the crash course for refactoring inline checks into shared helpers. It provides a high-level guide for reducing duplication while keeping behavior stable across the stock status workflow.",
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
                    "When the same stock decision appears in multiple components with slight differences, bugs creep in:\n\n// ProductCard.tsx\nconst isOutOfStock = product.stock === 0;\n\n// Shop.tsx\nconst isOutOfStock = inventory.stock <= 0; // slightly different!\n\nThese two checks look similar but behave differently at edge cases. If the stock thresholds change, you'd need to hunt down every inline check.",
                  order: 3,
                },
                {
                  title: "The Fix: Import and Reuse",
                  content:
                    "Replace the inline condition with the shared helper:\n\n// Before — inline logic\nconst isOutOfStock = product.stock <= 0;\n\n// After — shared helper\nimport { getStockStatus } from '../utils/formatters';\nconst status = getStockStatus(product.stock);\nconst isOutOfStock = status === 'OUT_OF_STOCK';\n\nThe behavior is driven by the helper now. If the helper's rule ever changes, all components update automatically.",
                  order: 4,
                },
                {
                  title: "Finding Inline Checks to Replace",
                  content:
                    "When refactoring, search the codebase for patterns that mirror the logic you're centralizing. In this case, look for:\n- Direct comparisons involving stock count\n- Conditions used to show out-of-stock overlays or low-stock badges\n- Any boolean or UI branch derived from product stock quantity",
                  order: 5,
                },
                {
                  title:
                    "Non-Regression: Making Sure You Didn't Break Anything",
                  content:
                    "After refactoring, verify the feature still works the same way:\nStock ≤ 0 → out-of-stock overlay shown\nStock 1-5 → low-stock badge shown\nStock > 5 → no stock warning\nThe ProductCard and Shop pages both behave consistently\n\nRefactoring should be invisible to the user — same behavior, better code.",
                  order: 6,
                },
                {
                  title: "Practice Lab: Refactor Product Badge Rule",
                  content:
                    "Practice extracting an inline UI badge rule into a helper call.",
                  section_type: "INTERACTIVE" as const,
                  interactive_mode: "CODE_EDITOR" as const,
                  interactive_config: {
                    instructions:
                      "Refactor to call getProductBadge helper instead of reimplementing. Do not reimplement.",
                    language: "javascript",
                    starter_code:
                      '// helper file (shown for context; this lives in another file)\nfunction getProductBadge(product) {\n  return product.isFeatured ? "Featured" : "Standard";\n}\n\n// page file section (this is where you refactor)\nimport { getProductBadge } from \'../utils/formatters\';\n\nexport function getBadgeForProduct(product) {\n  return product.isFeatured ? "Featured" : "Standard";\n}\n',
                    required_code_includes: [
                      "return getProductBadge(product)",
                    ],
                    editable_regions: [
                      {
                        placeholder:
                          'product.isFeatured ? "Featured" : "Standard"',
                        case_sensitive: true,
                      },
                    ],
                    entry_point: "getBadgeForProduct",
                    test_cases: [
                      {
                        input: [{ isFeatured: true }],
                        expected: "Featured",
                        label: "featured product badge",
                      },
                      {
                        input: [{ isFeatured: false }],
                        expected: "Standard",
                        label: "standard product badge",
                      },
                    ],
                  
                    hints: [
                      "Pass product to getProductBadge.",
                      "Think step by step about what operation transforms your input into the output you need. Break it down into smaller sub-problems and solve each one.",
                      "return ___(product);"
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
                    "In ProductCard.tsx, replace the two isOutOfStock and isLowStock const declarations with a single getStockStatus call, then derive the booleans from the returned status string.",
                  order: 1,
                },
                {
                  description:
                    "In Shop.tsx, add a useState for hideOutOfStock (default false), a filter step that calls getStockStatus, and a visible toggle button or checkbox in the filter card.",
                  order: 2,
                },
                {
                  description:
                    "Make sure importing getStockStatus in Shop.tsx comes from '../utils' (via the re-export) — not directly from '../utils/formatters'.",
                  order: 3,
                },
              ],
            },
            order: 2,
            acceptance_criteria: {
              create: [
                {
                  description:
                    "ProductCard.tsx imports and uses getStockStatus instead of inline comparisons",
                  is_required: true,
                  order: 1,
                },
                {
                  description:
                    "Shop.tsx imports and uses getStockStatus for the out-of-stock filter",
                  is_required: true,
                  order: 2,
                },
                {
                  description:
                    "A 'Hide out-of-stock' toggle is visible on the Shop page",
                  is_required: true,
                  order: 3,
                },
                {
                  description:
                    "Toggle filters OUT_OF_STOCK products from the grid when active",
                  is_required: true,
                  order: 4,
                },
                {
                  description:
                    "Existing search and category filters still work after refactor",
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
      id: "pern-oe-level-3",
      title: "Backend Debugging & Transactional Consistency",
      subtitle:
        "Diagnose the cancel-flow stock leak and enforce atomic operations.",
      order: 3,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      level_description:
        "Mission Briefing: Finance reports that cancelled orders are not restoring product stock — meaning the warehouse counts are wrong. Diagnose the missing restore in the PATCH /orders/:id/status route, then implement an atomic cancelOrder function with a new cancelledAt timestamp field and a concurrency guard at checkout.",
      xp_reward: 40,
      coin_reward: 200,
      key_takeaways:
        "The current PATCH /status route only flips the status field — it never restores stock. Extracting a dedicated cancelOrder controller function wrapped in prisma.$transaction ensures both the status flip and stock restoration happen atomically. Adding a cancelledAt DateTime? column creates a tamper-proof source of truth used by Level 5's revenue fix.",
      scenario_id: "pern-oe-scenario-2",
      tasks: {
        create: [
          {
            task_name: "Diagnose Cancelled-Order Stock Leak",
            test_type: "server",
            user_story:
              "As a backend developer, I want to trace the cancel flow and document why product stock is not restored when orders are cancelled.",
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
                    "When data spans multiple tables, an update to one record often requires a corresponding update to related records. A user changes their email — the old verification token becomes invalid. An order ships — inventory must decrement. A member registers — the event capacity must decrease.\n\nData integrity means that after any operation, all related records are in a consistent state. If one side effect is missed, the data becomes incorrect — and that error compounds with every subsequent operation.",
                  order: 2,
                },
                {
                  title: "State Transitions Require Side Effects",
                  content:
                    "Every state change (CANCELLED, SHIPPED, COMPLETED) is a transition that may require side effects — writes to other records to keep the system consistent.\n\nCancelling an order changes the order status, but also needs to restore product counts. Deleting a user should archive their posts, not just remove the user row. Changing an event date should invalidate cached calendar views.\n\nWhen you see a state transition, always ask: what else depends on this state? A status change in isolation is often a bug.",
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
                      "Implement findMissingSteps(actions) returning required actions NOT present in actions.\n\nExample: findMissingSteps([\"SET enrolledCourseId\"]) → [\"ADD to roster\", \"INCREMENT course.count\"].",
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
                      "Use .filter() on required — keep items not in actions.",
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
                    "Read the PATCH /:id/status handler in server/src/routes/orders.ts — count the Prisma calls. If there is only one (order.update), that is the bug.",
                  order: 1,
                },
                {
                  description:
                    "Check the POST /orders checkout path — the stock check (findMany) and the stock decrement (update) are in separate steps with no guard condition.",
                  order: 2,
                },
                {
                  description:
                    "Create server/src/controllers/order.controller.ts with an exported cancelOrder function to house the fix — the tests import from that exact path.",
                  order: 3,
                },
              ],
            },
            order: 1,
            acceptance_criteria: {
              create: [
                {
                  description:
                    "server/src/controllers/order.controller.ts exists and exports cancelOrder",
                  is_required: true,
                  order: 1,
                },
                {
                  description:
                    "cancelOrder references cancelledAt (documents where the timestamp will live)",
                  is_required: true,
                  order: 2,
                },
                {
                  description:
                    "schema.prisma Order model includes cancelledAt field",
                  is_required: true,
                  order: 3,
                },
                {
                  description:
                    "Problematic cancel path (no stock restore) is identified and documented",
                  is_required: true,
                  order: 4,
                },
              ],
            },
          },
          {
            task_name: "Atomic Order Cancellation + Concurrency Guard",
            test_type: "server",
            user_story:
              "As a backend engineer, I want cancelOrder to run inside a prisma.$transaction so that stock is atomically restored and cancelledAt is set — and I want checkout to guard against concurrent oversell.",
            learning_sections: {
              create: [
                {
                  title: "Overview\nDatabase Transactions and Atomic Operations",
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
                    "The key property of transactions is atomicity — the entire group of writes is treated as one indivisible unit. Without transaction:\nWrite 1 succeeds ✅\nWrite 2 fails ❌ ← partial state remains in DB\n\nWith transaction:\nWrite 1 succeeds ✅\nWrite 2 fails ❌ ← transaction rolls back Write 1 too\nResult: DB unchanged, consistent state preserved ✅",
                  order: 3,
                },
                {
                  title: "Prisma Transactions",
                  content:
                    "Prisma provides prisma.$transaction() to wrap multiple writes atomically:\n\nawait prisma.$transaction([\n  prisma.product.update({\n    where: { id },\n    data: { price: newPrice }\n  }),\n  prisma.priceHistory.create({\n    data: { productId, oldPrice, newPrice }\n  }),\n]);\n\nBoth writes succeed together, or neither is committed.",
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
                    "Implement an atomic transfer between two accounts.",
                  section_type: "INTERACTIVE" as const,
                  interactive_mode: "CODE_EDITOR" as const,
                  interactive_config: {
                    instructions:
                      "Implement atomicTransfer(senderBalance, receiverBalance, amount) returning [newSender, newReceiver]. Insufficient → unchanged.",
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
                    "Add cancelledAt DateTime? to the Order model in schema.prisma and run prisma migrate dev before implementing the controller.",
                  order: 1,
                },
                {
                  description:
                    "Inside the $transaction callback, query for the order's items first, then loop through them calling tx.product.update with { stock: { increment: item.quantity } }.",
                  order: 2,
                },
                {
                  description:
                    "In the POST /orders checkout handler, replace the standalone product.update with product.updateMany and include a where condition: { stock: { gte: item.quantity } }. If count === 0, throw an insufficient-stock error.",
                  order: 3,
                },
              ],
            },
            order: 2,
            acceptance_criteria: {
              create: [
                {
                  description:
                    "schema.prisma Order model has cancelledAt DateTime? field",
                  is_required: true,
                  order: 1,
                },
                {
                  description: "cancelOrder uses prisma.$transaction",
                  is_required: true,
                  order: 2,
                },
                {
                  description:
                    "cancelOrder sets cancelledAt: new Date() on the order",
                  is_required: true,
                  order: 3,
                },
                {
                  description:
                    "cancelOrder increments Product.stock for each OrderItem",
                  is_required: true,
                  order: 4,
                },
                {
                  description:
                    "cancelOrder only allows cancellation from PENDING or PROCESSING status",
                  is_required: true,
                  order: 5,
                },
                {
                  description:
                    "POST /api/orders checkout uses updateMany with stock gte guard",
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
      id: "pern-oe-level-4",
      title: "Starting my Full-Stack Journey",
      subtitle: "Implement Coupon / Discount Codes end-to-end.",
      order: 4,
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      level_description:
        "Mission Briefing: Marketing wants a coupon system. Build the Coupon model, a validate endpoint, extend order creation to apply discounts, add coupon input UI to Checkout, and enforce usage limits + expiry atomically — including decrementing usedCount on order cancellation.",
      xp_reward: 60,
      coin_reward: 300,
      key_takeaways:
        "A full-stack feature requires coordinating a new Prisma model, a validation endpoint, a client service, and UI state in one coherent change. Atomic counter mutations (increment/decrement with guards) prevent race conditions where two users both consume the last available coupon slot.",
      scenario_id: "pern-oe-scenario-2",
      tasks: {
        create: [
          {
            task_name: "Validate & Apply Coupon at Checkout",
            test_type: "both",
            user_story:
              "As a shopper, I want to enter a coupon code at checkout and see my discounted total before placing the order.",
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
                    "When a new feature needs data from an existing flow, the existing operation is extended — not duplicated. The order creation flow already handles stock decrement and payment within a transaction. Adding coupon logic means inserting the re-validation, discount application, and usage counter increment into that same transaction. This keeps all related writes atomic under the same commit-or-rollback guarantee.",
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
                      "Implement isCouponValid(coupon, now) returning boolean. True only when: isActive, expiresAt > now, AND usedCount < maxUses. At maxUses → false.",
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
                      "Combine three conditions with &&.",
                      "Think step by step about what operation transforms your input into the output you need. Break it down into smaller sub-problems and solve each one.",
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
                    "Add the Coupon model to server/prisma/schema.prisma with all six required fields, then run `pnpm exec prisma migrate dev` from the server directory.",
                  order: 1,
                },
                {
                  description:
                    "Create server/src/controllers/coupon.controller.ts with a validateCoupon function, and server/src/routes/coupons.ts that registers it at POST /validate. Register the coupons router in server/src/routes/index.ts.",
                  order: 2,
                },
                {
                  description:
                    "In Checkout.tsx, add a useState for couponCode (string) and appliedDiscount (number | null). Call validateCoupon from couponService and update state on success.",
                  order: 3,
                },
              ],
            },
            order: 1,
            acceptance_criteria: {
              create: [
                {
                  description:
                    "Coupon model exists in schema.prisma with all required fields",
                  is_required: true,
                  order: 1,
                },
                {
                  description:
                    "server/src/controllers/coupon.controller.ts exports validateCoupon",
                  is_required: true,
                  order: 2,
                },
                {
                  description:
                    "server/src/routes/coupons.ts registers POST /validate",
                  is_required: true,
                  order: 3,
                },
                {
                  description:
                    "POST /api/orders accepts optional couponCode and increments usedCount inside the transaction",
                  is_required: true,
                  order: 4,
                },
                {
                  description:
                    "client/src/services/couponService.ts exports validateCoupon calling POST /api/coupons/validate",
                  is_required: true,
                  order: 5,
                },
                {
                  description:
                    "Checkout.tsx renders a coupon input field and displays discounted total",
                  is_required: true,
                  order: 6,
                },
                {
                  description:
                    "Invalid / expired / exhausted coupon states are shown in the UI",
                  is_required: true,
                  order: 7,
                },
              ],
            },
          },
          {
            task_name: "Coupon Lifecycle + Usage Integrity",
            test_type: "both",
            user_story:
              "As a store admin, I want to see coupon usage stats, and as a system, I want coupon usedCount to be decremented when a coupon-bearing order is cancelled.",
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
                    "A counter with a maximum ceiling (usedCount < maxUses) is vulnerable to race conditions — two concurrent requests can both read the counter before either increments it, and both pass. The guard is a conditional write: include the ceiling check inside the update's where clause so the database itself enforces the limit atomically. If zero rows match the combined condition (id + counter under limit), the resource is exhausted and the operation is rejected. This is the same guard-condition pattern that prevents overselling stock.",
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
                    "When an operation is reversed (an order cancelled, a reservation released), any counters that were incremented during the forward operation must be decremented. This keeps resource counts accurate over time. Without reversal propagation, cancelled orders permanently consume capacity — the resource slots they held are never freed for other users. The reversal must happen inside the same transaction as the cancellation so both the status change and the counter update commit or roll back together.",
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
                      "Implement canUseCoupon(usedCount, maxUses) returning boolean: usedCount < maxUses (strict). At limit → false.",
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
                    "Update the coupon validation in coupon.controller.ts to use updateMany with a usedCount: { lt: maxUses } guard, so two concurrent requests cannot both pass.",
                  order: 1,
                },
                {
                  description:
                    "Add GET /api/coupons to coupons.ts protected by requireAdmin middleware, and include all usage stats in the response.",
                  order: 2,
                },
                {
                  description:
                    "In the cancelOrder transaction in order.controller.ts, check if the order has a couponId and if so, decrement the coupon's usedCount inside the same transaction.",
                  order: 3,
                },
              ],
            },
            order: 2,
            acceptance_criteria: {
              create: [
                {
                  description:
                    "coupon.controller.ts enforces usedCount < maxUses guard",
                  is_required: true,
                  order: 1,
                },
                {
                  description:
                    "coupon.controller.ts enforces expiresAt > now check",
                  is_required: true,
                  order: 2,
                },
                {
                  description: "coupon.controller.ts enforces isActive check",
                  is_required: true,
                  order: 3,
                },
                {
                  description:
                    "GET /api/coupons admin route exists with usage stats",
                  is_required: true,
                  order: 4,
                },
                {
                  description:
                    "cancelOrder decrements usedCount atomically when a coupon was applied",
                  is_required: true,
                  order: 5,
                },
                {
                  description:
                    "Admin coupon panel shows code, remaining uses, and expiry",
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
      id: "pern-oe-level-5",
      title: "The Production Struggle: Sales Revenue Bug",
      subtitle: "Fix the inflated revenue dashboard and write a postmortem.",
      order: 5,
      deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      level_description:
        "Mission Briefing: Finance cannot close the books. The admin Dashboard's total revenue includes cancelled orders, inflating figures. Worse, if an admin manually flips a cancelled order's status back to PENDING, the status field becomes stale — but cancelledAt still holds the truth. Fix the revenue query to use cancelledAt IS NULL as the source of truth, extract it into a shared utility, and write a postmortem.",
      xp_reward: 75,
      coin_reward: 375,
      key_takeaways:
        "Source-of-truth timestamps (cancelledAt) are more reliable than mutable status fields for financial queries. A shared revenueUtils.ts prevents the same filter logic from being written differently in multiple report endpoints. A postmortem turns a production incident into institutional knowledge that prevents recurrence.",
      scenario_id: "pern-oe-scenario-2",
      tasks: {
        create: [
          {
            task_name: "Stabilize Revenue Classification",
            test_type: "server",
            user_story:
              "As a finance officer, I want the revenue dashboard to exclude cancelled orders even when an admin has accidentally changed the status field, so I can trust the totals.",
            learning_sections: {
              create: [
                {
                  title: "Overview\nSource-of-Truth Fields vs. Stale Status",
                  content:
                    "This crash course explains why mutable status fields are unreliable for financial queries and how cancelledAt provides an immutable source of truth.",
                  order: 1,
                },
                {
                  title: "Mutable State in Production",
                  content:
                    "A status field that any admin action can change is not a reliable filter for financial queries. An order that was cancelled (cancelledAt set) but later had its status manually changed back to PENDING would pass a status-based filter — and its total would be counted as revenue. The mutable field tells you what someone last set it to, not what actually happened. Financial reporting must use fields that record the real-world event and never change afterwards.",
                  order: 2,
                },
                {
                  title: "Why status Is Unreliable",
                  content:
                    "status is a mutable field — any admin action can change it. An order can have:\nstatus: 'PENDING'   — because an admin fat-fingered it\ncancelledAt: <date> — the immutable proof it was actually cancelled\n\nThe cancelledAt timestamp is set once and never changed. It is the source of truth.",
                  order: 3,
                },
                {
                  title: "Source-of-Truth Filters",
                  content:
                    "Instead of filtering by what a status field says, filter by the immutable timestamp field that records the real-world event. An order with cancelledAt set — regardless of its current status — was cancelled and must be excluded from revenue. The filter condition becomes a check on the timestamp field rather than the status field. This is reliable even when other parts of the system have inconsistent data.",
                  order: 4,
                },
                {
                  title: "Designing Tests for Stale State",
                  content:
                    "The key test case is an order where the mutable status contradicts the immutable timestamp: status='PENDING' but cancelledAt set. A query filtering by status alone would include it (wrong). A query filtering by cancelledAt would exclude it (correct). Tests should cover all four combinations: cancelled with matching status, cancelled with conflicting status, active with matching status, and active with no timestamp. The stale-status case — where the two fields disagree — is the one that catches the bug.",
                  order: 5,
                },
                {
                  title: "Practice Lab: Revenue Filter",
                  content:
                    "Practice writing a revenue filter that trusts cancelledAt.",
                  section_type: "INTERACTIVE" as const,
                  interactive_mode: "CODE_EDITOR" as const,
                  interactive_config: {
                    instructions:
                      "Implement getRevenueOrders(orders) returning only orders where cancelledAt is null. Filter by cancelledAt, NOT status.",
                    language: "javascript",
                    starter_code:
                      "export function getRevenueOrders(orders) {\n  // TODO: return only non-cancelled orders\n}\n",
                    editable_regions: [
                      {
                        placeholder:
                          "// TODO: return only non-cancelled orders",
                        case_sensitive: false,
                      },
                    ],
                    entry_point: "getRevenueOrders",
                    test_cases: [
                      {
                        input: [
                          [
                            { total: 100, cancelledAt: null },
                            { total: 50, cancelledAt: new Date() },
                          ],
                        ],
                        expected: [{ total: 100, cancelledAt: null }],
                        label: "excludes cancelled",
                      },
                    ],
                  
                    hints: [
                      "Use .filter() with cancelledAt === null.",
                      "Walk through the array and build a new one keeping only the items that pass your check. What method lets you test each item against a condition?",
                      "return orders.filter(o => o.___ === ___);"
                      ],
                  },
                  order: 6,
                },
                {
                  title: "Key Takeaway",
                  content:
                    "In financial reporting, never trust mutable status fields. Use the immutable timestamp that was set at the moment the real-world event (cancellation) occurred.",
                  order: 7,
                },
              ],
            },
            hints: {
              create: [
                {
                  description:
                    "Find the GET /api/orders/stats handler in server/src/routes/orders.ts and add a where: { cancelledAt: null } clause to the findMany call.",
                  order: 1,
                },
                {
                  description:
                    "Create a test order with cancelledAt set to a past date but status left as 'PENDING' — verify it is excluded from the revenue total after your fix.",
                  order: 2,
                },
                {
                  description:
                    "Do NOT filter by status: { not: 'CANCELLED' } — a stale PENDING order with cancelledAt set must also be excluded.",
                  order: 3,
                },
              ],
            },
            order: 1,
            acceptance_criteria: {
              create: [
                {
                  description: "GET /api/orders/stats exists in orders.ts",
                  is_required: true,
                  order: 1,
                },
                {
                  description:
                    "Stats WHERE clause uses cancelledAt: null (source-of-truth filter)",
                  is_required: true,
                  order: 2,
                },
                {
                  description:
                    "Stale-status orders (cancelledAt set, status PENDING) are excluded from revenue",
                  is_required: true,
                  order: 3,
                },
                {
                  description:
                    "Active PENDING and DELIVERED orders (cancelledAt null) are included",
                  is_required: true,
                  order: 4,
                },
              ],
            },
          },
          {
            task_name: "Permanent Fix + Centralization + Postmortem",
            test_type: "server",
            user_story:
              "As a developer, I want to extract the revenue predicate into a shared utility and document the incident in a postmortem so the team can prevent similar bugs.",
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
                    "If the same cancelledAt: null filter is copied into three report endpoints and one of them is updated while the others are forgotten, the bug returns. A single isRevenueEligibleOrder function is the single point of change.",
                  order: 2,
                },
                {
                  title: "Pure Functions for Shared Logic",
                  content:
                    "A predicate function that checks a business rule (is this order eligible for revenue?) takes an order object and returns a boolean. It is a pure function — same input always produces the same output, and it has no side effects. This makes it testable without a database: instantiate an order object with known fields, pass it to the function, and assert the result. Pure predicate functions are the foundation of reliable reporting logic because they can be unit-tested in isolation.",
                  order: 3,
                },
                {
                  title: "Regression Test Cases",
                  content:
                    "Test all four meaningful scenarios:\n1. cancelledAt set, status CANCELLED → false (normal cancel)\n2. cancelledAt set, status PENDING   → false (stale status!)\n3. cancelledAt null, status PENDING  → true (active order)\n4. cancelledAt null, status DELIVERED → true (completed order)",
                  order: 4,
                },
                {
                  title: "Structured Incident Documentation",
                  content:
                    "A postmortem documents what went wrong and how to prevent recurrence. It has four parts: the symptom (what the user or system observed), the root cause (why the code was incorrect), the fix (what changed), and the prevention step (what process or test will catch this in the future). The value is not in the document itself but in the discipline of tracing the full chain from symptom to systemic fix.",
                  order: 5,
                },
                {
                  title: "Practice Lab: Revenue Eligibility Check",
                  content:
                    "Practice writing a predicate that filters orders by a source-of-truth field.",
                  section_type: "INTERACTIVE" as const,
                  interactive_mode: "CODE_EDITOR" as const,
                  interactive_config: {
                    instructions:
                      "Implement isEligibleForRevenue(order) returning boolean: cancelledAt === null. Do NOT check status.",
                    language: "javascript",
                    starter_code:
                      "export function isEligibleForRevenue(order) {\n  // Return true if order was never cancelled\n}\n",
                    editable_regions: [
                      {
                        placeholder:
                          "// Return true if order was never cancelled",
                        case_sensitive: false,
                      },
                    ],
                    entry_point: "isEligibleForRevenue",
                    test_cases: [
                      {
                        input: [
                          { total: 100, cancelledAt: null, status: "DELIVERED" },
                        ],
                        expected: true,
                        label: "delivered — eligible",
                      },
                      {
                        input: [
                          {
                            total: 50,
                            cancelledAt: new Date("2026-01-01"),
                            status: "CANCELLED",
                          },
                        ],
                        expected: false,
                        label: "cancelled — not eligible",
                      },
                      {
                        input: [
                          {
                            total: 75,
                            cancelledAt: new Date("2026-01-01"),
                            status: "PENDING",
                          },
                        ],
                        expected: false,
                        label: "stale status cancelled — not eligible",
                      },
                    ],
                  
                    hints: [
                      "Check cancelledAt only.",
                      "For each field, you need to ask two questions: is it the right type, and is its value above the minimum? Both checks must pass for each field.",
                      "return order.___ === ___;"
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
                    "Create server/src/utils/revenueUtils.ts with an isRevenueEligibleOrder function that takes an object with cancelledAt and returns cancelledAt === null.",
                  order: 1,
                },
                {
                  description:
                    "Write four test cases: normal cancelled (false), stale-status cancelled (false), active pending (true), delivered (true).",
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
                    "server/src/utils/revenueUtils.ts exists and exports isRevenueEligibleOrder",
                  is_required: true,
                  order: 1,
                },
                {
                  description:
                    "isRevenueEligibleOrder(order) returns false when cancelledAt is set",
                  is_required: true,
                  order: 2,
                },
                {
                  description:
                    "isRevenueEligibleOrder returns false even when status is PENDING (stale-status case)",
                  is_required: true,
                  order: 3,
                },
                {
                  description:
                    "isRevenueEligibleOrder returns true for active orders (cancelledAt: null)",
                  is_required: true,
                  order: 4,
                },
                {
                  description:
                    "server/POSTMORTEM_REVENUE.md exists with Symptom, Root Cause, Fix, and Prevention sections",
                  is_required: true,
                  order: 5,
                },
                {
                  description:
                    "orders.ts stats endpoint references revenueUtils or uses cancelledAt: null consistently",
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
