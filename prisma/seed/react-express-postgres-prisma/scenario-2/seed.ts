export const scenarios = [
  {
    id: "scenario-2",
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
        "A PERN stack project requires separate npm install runs in the root, client/, and server/ directories. Prisma migrations keep the PostgreSQL schema in sync with your code. Environment variables (DATABASE_URL, PORT) are read by dotenv and must never be committed. React layout components like Navbar are the single place to update global brand text — change it once and it updates everywhere.",
      scenario_id: "scenario-2",
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
                    "This crash course walks you through preparing a PERN (PostgreSQL + Express + React + Node.js) development environment from scratch. By the end you will have both servers running and the database schema applied.",
                  order: 1,
                },
                {
                  title: "What is the PERN Stack?",
                  content:
                    "PERN = PostgreSQL + Express + React + Node.js.\n\nPostgreSQL stores your data.\nExpress (Node.js) handles your API routes.\nReact renders the user interface.\nPrisma bridges Express and PostgreSQL with a type-safe ORM.",
                  order: 2,
                },
                {
                  title: "Three Package Roots",
                  content:
                    "This project has three separate package.json files:\nroot/          ← shared scripts (test runner, concurrently)\n├── client/    ← React + Vite + Tailwind\n└── server/    ← Express + Prisma\n\nRun npm install in each directory independently.",
                  order: 3,
                },
                {
                  title: "Environment Variables",
                  content:
                    'Sensitive configuration lives in .env files:\nDATABASE_URL="postgresql://user:pass@localhost:5432/urbanpottery"\nPORT=5000\nJWT_SECRET=your-secret\n\nThe dotenv package loads these at runtime. Never commit .env — it is gitignored intentionally. The project\'s README lists every required variable.',
                  order: 4,
                },
                {
                  title: "Prisma Migrations",
                  content:
                    "After installing dependencies, run:\nnpx prisma migrate dev --name init\n\nThis reads server/prisma/schema.prisma, creates SQL, and applies it to PostgreSQL. Run prisma generate afterward (or it runs automatically) to regenerate the type-safe client.",
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
                  title: "Key Takeaway",
                  content:
                    "A working PERN environment means: all three node_modules folders present, .env configured, Prisma schema migrated, and both dev servers running without errors.",
                  order: 7,
                },
              ],
            },
            hints: {
              create: [
                {
                  description:
                    "There are three directories that each contain a package.json — you must run npm install in all three (root, client/, server/).",
                  order: 1,
                },
                {
                  description:
                    "Check the README for the required environment variables and create a .env file inside server/ before running migrations.",
                  order: 2,
                },
                {
                  description:
                    "After installing server dependencies, run `npx prisma migrate dev` inside the server/ directory to apply the schema.",
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
                    "This crash course shows you how to locate and safely update a brand string inside a React layout component without breaking the surrounding UI.",
                  order: 1,
                },
                {
                  title: "What is a Layout Component?",
                  content:
                    "Layout components (Navbar, Footer, Sidebar) are rendered on every page. They live in client/src/components/layout/. Changing text in one file updates the brand across the entire app instantly.",
                  order: 2,
                },
                {
                  title: "JSX Text Nodes",
                  content:
                    'In JSX, plain text inside tags is a text node:\n<span className="font-bold">UrbanPottery</span>\n\nTo update the brand, find this span and change its content to the exact required string — case and spaces matter.',
                  order: 3,
                },
                {
                  title: "Vite HMR",
                  content:
                    "Vite's Hot Module Replacement updates the browser instantly when you save a file — no manual refresh needed. Save the file and watch the Navbar update in real time.",
                  order: 4,
                },
                {
                  title: "Practice Lab: Update Heading Text",
                  content:
                    "Practice editing a JSX text node to match a target string.",
                  section_type: "INTERACTIVE" as const,
                  interactive_mode: "CODE_EDITOR" as const,
                  interactive_config: {
                    instructions:
                      'Change the returned string from "UrbanPottery" to "UrbanPottery Artisan Ceramics".',
                    language: "tsx",
                    starter_code:
                      'export function getBrandName() {\n  return "UrbanPottery";\n}\n',
                    editable_regions: [
                      { placeholder: "UrbanPottery", case_sensitive: true },
                    ],
                    entry_point: "getBrandName",
                    test_cases: [
                      {
                        input: [],
                        expected: "UrbanPottery Artisan Ceramics",
                        label: "exact brand string",
                      },
                    ],
                  },
                  order: 5,
                },
                {
                  title: "Key Takeaway",
                  content:
                    "Layout components are the single source of truth for global UI text. Update the text node in Navbar.tsx and the change propagates everywhere — no search-and-replace across pages needed.",
                  order: 6,
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
      scenario_id: "scenario-2",
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
                  title: "Overview\nPure Functions Returning Union Types",
                  content:
                    "This crash course covers writing a threshold-based classifier as a pure function that returns a typed union rather than a boolean.",
                  order: 1,
                },
                {
                  title: "Why a Union Type Instead of a Boolean?",
                  content:
                    "A boolean tells you available / not available.\nA union type tells you IN_STOCK | LOW_STOCK | OUT_OF_STOCK.\n\nThree states allow the UI to show three different badge colours and the filter to make a more precise decision. Booleans collapse that information.",
                  order: 2,
                },
                {
                  title: "Threshold-Based Classification",
                  content:
                    "Classify stock into three buckets:\nstock <= 0  → 'OUT_OF_STOCK'\n1 ≤ stock ≤ 5 → 'LOW_STOCK'\nstock > 5   → 'IN_STOCK'\n\nBoundary values (0, 1, 5, 6) are the most important to test.",
                  order: 3,
                },
                {
                  title: "Placing the Helper",
                  content:
                    "Add getStockStatus to the existing file:\nclient/src/utils/formatters.ts\n\nIt already contains formatCurrency, formatDate, truncateText, and getStarRating. Export the new function from the same file and re-export it through client/src/utils/index.ts.",
                  order: 4,
                },
                {
                  title: "Testing Boundary Values",
                  content:
                    "Always test at, just inside, and just outside each boundary:\ngetStockStatus(0)  → 'OUT_OF_STOCK'\ngetStockStatus(1)  → 'LOW_STOCK'\ngetStockStatus(5)  → 'LOW_STOCK'\ngetStockStatus(6)  → 'IN_STOCK'",
                  order: 5,
                },
                {
                  title: "Practice Lab: Three-Bucket Classifier",
                  content:
                    "Practice writing a threshold classifier that returns one of three string values.",
                  section_type: "INTERACTIVE" as const,
                  interactive_mode: "CODE_EDITOR" as const,
                  interactive_config: {
                    instructions:
                      "Implement getStockStatus(stock): returns 'OUT_OF_STOCK' (<=0), 'LOW_STOCK' (1-5), or 'IN_STOCK' (>5).",
                    language: "javascript",
                    starter_code:
                      "export function getStockStatus(stock) {\n  // TODO\n}\n",
                    editable_regions: [
                      { placeholder: "// TODO", case_sensitive: true },
                    ],
                    entry_point: "getStockStatus",
                    test_cases: [
                      {
                        input: [0],
                        expected: "OUT_OF_STOCK",
                        label: "zero stock",
                      },
                      { input: [3], expected: "LOW_STOCK", label: "low stock" },
                      { input: [10], expected: "IN_STOCK", label: "in stock" },
                    ],
                  },
                  order: 6,
                },
                {
                  title: "Key Takeaway",
                  content:
                    "When a domain concept has more than two states, use a union type. One pure function with clear thresholds is easier to test and read than multiple ad-hoc comparisons spread across components.",
                  order: 7,
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
                    "Overview\nRefactoring Inline Checks and Adding a Filter Toggle",
                  content:
                    "This crash course covers replacing duplicated inline stock comparisons with the shared helper, and adding a new user-facing toggle that uses the same helper for filtering.",
                  order: 1,
                },
                {
                  title: "The Refactoring Goal",
                  content:
                    "ProductCard.tsx currently has:\nconst isOutOfStock = product.stock === 0;\nconst isLowStock = product.stock > 0 && product.stock <= 5;\n\nAfter refactoring:\nconst status = getStockStatus(product.stock);\nconst isOutOfStock = status === 'OUT_OF_STOCK';\nconst isLowStock = status === 'LOW_STOCK';",
                  order: 2,
                },
                {
                  title: "Adding the Shop Toggle",
                  content:
                    "Add a boolean state to Shop.tsx:\nconst [hideOutOfStock, setHideOutOfStock] = useState(false);\n\nFilter the products list:\nconst filteredProducts = products.filter(p => {\n  if (hideOutOfStock && getStockStatus(p.stock) === 'OUT_OF_STOCK') return false;\n  // existing search/category filters...\n  return true;\n});\n\nRender a checkbox or toggle button labelled 'Hide out-of-stock'.",
                  order: 3,
                },
                {
                  title: "Non-Regression Checklist",
                  content:
                    "After refactoring:\n- Out-of-stock products still show the 'Out of Stock' overlay\n- Low-stock products still show the 'Only N left' badge\n- The toggle hides out-of-stock when active and shows them when inactive\n- Existing search and category filters still work",
                  order: 4,
                },
                {
                  title: "Practice Lab: Refactor a Stock Badge",
                  content:
                    "Practice replacing an inline stock check with a helper call.",
                  section_type: "INTERACTIVE" as const,
                  interactive_mode: "CODE_EDITOR" as const,
                  interactive_config: {
                    instructions:
                      "Refactor getBadgeLabel to use getStockStatus instead of an inline comparison.",
                    language: "javascript",
                    starter_code:
                      "function getStockStatus(stock) {\n  if (stock <= 0) return 'OUT_OF_STOCK';\n  if (stock <= 5) return 'LOW_STOCK';\n  return 'IN_STOCK';\n}\n\nexport function getBadgeLabel(stock) {\n  if (stock === 0) return 'Out of Stock'; // inline — refactor me\n  if (stock <= 5) return 'Low Stock';\n  return 'In Stock';\n}\n",
                    required_code_includes: ["getStockStatus(stock)"],
                    editable_regions: [
                      {
                        placeholder:
                          "if (stock === 0) return 'Out of Stock'; // inline — refactor me\n  if (stock <= 5) return 'Low Stock';\n  return 'In Stock';",
                        case_sensitive: false,
                      },
                    ],
                    entry_point: "getBadgeLabel",
                    test_cases: [
                      {
                        input: [0],
                        expected: "Out of Stock",
                        label: "zero stock",
                      },
                      { input: [3], expected: "Low Stock", label: "low stock" },
                      { input: [10], expected: "In Stock", label: "in stock" },
                    ],
                  },
                  order: 5,
                },
                {
                  title: "Key Takeaway",
                  content:
                    "Refactoring consolidates logic into one helper and proves it works by wiring the same helper into a new user-facing feature. The toggle is the integration test for the helper.",
                  order: 6,
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
      scenario_id: "scenario-2",
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
                  title: "Overview\nTracing a Cancel-Path Data Leak",
                  content:
                    "This crash course shows you how to read a route handler, identify missing writes, and understand why stock levels become incorrect after cancellation.",
                  order: 1,
                },
                {
                  title: "The Bug: Only Status Changes",
                  content:
                    "Open server/src/routes/orders.ts and find the PATCH /:id/status handler. It does exactly one thing:\nawait prisma.order.update({ data: { status } });\n\nThere is no step that increments Product.stock for each cancelled OrderItem. Cancelled stock silently disappears.",
                  order: 2,
                },
                {
                  title: "The Concurrent Oversell Race",
                  content:
                    "A second bug: the POST /orders checkout reads stock, then decrements it in a later write. Between the read and write, another request can place the same item. Both succeed, driving stock negative.\n\nThis is a classic TOCTOU (Time-Of-Check-Time-Of-Use) race.",
                  order: 3,
                },
                {
                  title: "Root Cause Analysis",
                  content:
                    "Document both failure paths:\n1. Cancel path — PATCH handler has no stock increment for OrderItems\n2. Concurrent checkout — stock check and decrement are not atomic\n\nEvidence: trace the Prisma calls and list what is missing from each path.",
                  order: 4,
                },
                {
                  title: "Practice Lab: Spot the Missing Write",
                  content:
                    "Practice identifying missing writes in a two-step sequence.",
                  section_type: "INTERACTIVE" as const,
                  interactive_mode: "CODE_EDITOR" as const,
                  interactive_config: {
                    instructions:
                      "The function cancels an order but forgets to restore stock. Add the missing step.",
                    language: "typescript",
                    starter_code:
                      "export async function cancelOrderFlow(orderId: string) {\n  const steps: string[] = [];\n  steps.push('SET status=CANCELLED');\n  // TODO: add missing step\n  return steps;\n}\n",
                    editable_regions: [
                      {
                        placeholder: "// TODO: add missing step",
                        case_sensitive: false,
                      },
                    ],
                    entry_point: "cancelOrderFlow",
                    test_cases: [
                      {
                        input: ["order-1"],
                        expected: ["SET status=CANCELLED", "RESTORE stock"],
                        label: "both steps present",
                      },
                    ],
                  },
                  order: 5,
                },
                {
                  title: "Key Takeaway",
                  content:
                    "A route handler that changes order status without touching inventory is a data-integrity bug waiting to compound. Every state transition that affects related models needs atomic, coordinated writes.",
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
                  title: "Overview\nPrisma Transactions and Schema Migrations",
                  content:
                    "This crash course covers adding a new column via Prisma migration and implementing a multi-step atomic cancel that restores stock in one transaction.",
                  order: 1,
                },
                {
                  title: "Prisma Schema Migration",
                  content:
                    "Add to the Order model in schema.prisma:\ncancelledAt  DateTime?\n\nThen run:\nnpx prisma migrate dev --name add-cancelled-at\n\nThe ? makes it nullable — existing orders keep cancelledAt: null. Only cancelled orders get a timestamp.",
                  order: 2,
                },
                {
                  title: "The cancelOrder Transaction",
                  content:
                    "await prisma.$transaction(async (tx) => {\n  // 1. Guard: only cancel PENDING or PROCESSING\n  // 2. Flip status to CANCELLED, set cancelledAt: new Date()\n  // 3. Find all OrderItems for this order\n  // 4. For each item, increment Product.stock by item.quantity\n});\n\nAll four steps succeed or all roll back.",
                  order: 3,
                },
                {
                  title: "Concurrency Guard at Checkout",
                  content:
                    "Replace the separate read+update with updateMany that includes the guard:\nawait tx.product.updateMany({\n  where: { id: item.productId, stock: { gte: item.quantity } },\n  data: { stock: { decrement: item.quantity } },\n});\n\nIf 0 rows updated → stock was insufficient → throw and roll back.",
                  order: 4,
                },
                {
                  title: "Practice Lab: Atomic Audit Write",
                  content:
                    "Practice building a two-step atomic transaction plan.",
                  section_type: "INTERACTIVE" as const,
                  interactive_mode: "CODE_EDITOR" as const,
                  interactive_config: {
                    instructions:
                      "Return both required atomic steps as an array.",
                    language: "typescript",
                    starter_code:
                      "export function buildCancelPlan(): string[] {\n  return [];\n}\n",
                    editable_regions: [
                      { placeholder: "return [];", case_sensitive: false },
                    ],
                    entry_point: "buildCancelPlan",
                    test_cases: [
                      {
                        input: [],
                        expected: [
                          "flip status + set cancelledAt",
                          "restore stock",
                        ],
                        label: "both cancel steps",
                      },
                    ],
                  },
                  order: 5,
                },
                {
                  title: "Key Takeaway",
                  content:
                    "Transactions make multiple writes atomic. Guard conditions on updateMany prevent race conditions. Together they keep inventory accurate under concurrent load.",
                  order: 6,
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
      scenario_id: "scenario-2",
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
                    "Overview\nBuilding a Validation Endpoint + Client Service",
                  content:
                    "This crash course covers adding a new Prisma model, a POST /api/coupons/validate endpoint, extending the order creation flow, and building the client service layer and UI.",
                  order: 1,
                },
                {
                  title: "The Coupon Model",
                  content:
                    "Add to schema.prisma:\nmodel Coupon {\n  id              String   @id @default(uuid())\n  code            String   @unique\n  discountPercent Float\n  maxUses         Int\n  usedCount       Int      @default(0)\n  expiresAt       DateTime\n  isActive        Boolean  @default(true)\n  createdAt       DateTime @default(now())\n  updatedAt       DateTime @updatedAt\n}\n\nRun prisma migrate dev after adding.",
                  order: 2,
                },
                {
                  title: "POST /api/coupons/validate",
                  content:
                    "Accepts { code, subtotal }. Returns:\n{ success: true, data: { discountPercent, finalTotal } }\nor 400 if coupon is invalid/expired/exhausted.\n\nValidation checks (all inside one DB read):\n1. Coupon exists and isActive === true\n2. expiresAt > now\n3. usedCount < maxUses",
                  order: 3,
                },
                {
                  title: "Extending POST /api/orders",
                  content:
                    "Accept optional couponCode in the request body. Inside the existing $transaction:\n1. Re-validate the coupon (atomically)\n2. Apply discountPercent to the total\n3. Increment coupon.usedCount",
                  order: 4,
                },
                {
                  title: "Client Service Layer",
                  content:
                    "Create client/src/services/couponService.ts:\nexport async function validateCoupon(code: string, subtotal: number) {\n  const res = await api.post('/api/coupons/validate', { code, subtotal });\n  return res.data;\n}",
                  order: 5,
                },
                {
                  title: "Checkout UI",
                  content:
                    "Add to Checkout.tsx:\n- A text input for coupon code\n- An 'Apply' button that calls validateCoupon\n- State for: applied / invalid / expired / exhausted\n- Display the discounted total when a coupon is applied",
                  order: 6,
                },
                {
                  title: "Practice Lab: Coupon Validator",
                  content: "Practice writing a coupon validation function.",
                  section_type: "INTERACTIVE" as const,
                  interactive_mode: "CODE_EDITOR" as const,
                  interactive_config: {
                    instructions:
                      "Return true only if all three conditions pass.",
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
                  },
                  order: 7,
                },
                {
                  title: "Key Takeaway",
                  content:
                    "Always re-validate the coupon inside the order transaction — the client-side check is UX only. The atomic server-side check prevents two simultaneous checkouts from both consuming the last slot.",
                  order: 8,
                },
              ],
            },
            hints: {
              create: [
                {
                  description:
                    "Add the Coupon model to server/prisma/schema.prisma with all six required fields, then run `npx prisma migrate dev` from the server directory.",
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
                    "Overview\nAtomic Counters, Expiry Guards, and Admin Observability",
                  content:
                    "This crash course covers enforcing usage limits atomically, adding an admin coupon list endpoint, and wiring the cancel flow to decrement usedCount.",
                  order: 1,
                },
                {
                  title: "Atomic usedCount Guard",
                  content:
                    "To prevent two simultaneous checkouts both consuming the last slot:\nawait tx.coupon.updateMany({\n  where: { id: couponId, usedCount: { lt: maxUses } },\n  data: { usedCount: { increment: 1 } },\n});\nif (updated.count === 0) throw new Error('Coupon exhausted');\n\nThis is the same guard-condition pattern as the stock race fix in Level 3.",
                  order: 2,
                },
                {
                  title: "Expiry and isActive Check",
                  content:
                    "Always check both conditions before accepting a coupon:\n1. isActive === true\n2. expiresAt > new Date()\n3. usedCount < maxUses\n\nAll three must pass — and re-check server-side inside the order transaction.",
                  order: 3,
                },
                {
                  title: "GET /api/coupons (Admin)",
                  content:
                    "Admin-only endpoint returning all coupons with usage stats:\nGET /api/coupons → { id, code, discountPercent, usedCount, maxUses, expiresAt, isActive }\n\nRequires requireAdmin middleware.",
                  order: 4,
                },
                {
                  title: "Cancel Order Decrements usedCount",
                  content:
                    "When a coupon-bearing order is cancelled, decrement usedCount inside the same cancelOrder $transaction:\nif (order.couponId) {\n  await tx.coupon.update({\n    where: { id: order.couponId },\n    data: { usedCount: { decrement: 1 } },\n  });\n}\n\nThis keeps coupon slots accurate after cancellations.",
                  order: 5,
                },
                {
                  title: "Admin Coupon Panel",
                  content:
                    "Add a section to admin/Dashboard.tsx (or a new admin/Coupons.tsx) that:\n- Fetches GET /api/coupons\n- Shows each coupon's code, remaining uses (maxUses - usedCount), and expiry date",
                  order: 6,
                },
                {
                  title: "Practice Lab: Counter Guard",
                  content: "Practice writing an atomic counter guard.",
                  section_type: "INTERACTIVE" as const,
                  interactive_mode: "CODE_EDITOR" as const,
                  interactive_config: {
                    instructions:
                      "Return true only if usedCount is strictly less than maxUses.",
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
                  },
                  order: 7,
                },
                {
                  title: "Key Takeaway",
                  content:
                    "Usage counters must be guarded atomically on increment AND decremented on reversal. Without the decrement on cancel, refunded customers can never use the coupon slot they freed up.",
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
      scenario_id: "scenario-2",
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
                  title: "The Bug",
                  content:
                    "GET /api/orders/stats sums order.total across ALL orders with no WHERE clause. Cancelled orders are included, inflating revenue.\n\nWorse: if an admin accidentally changes a cancelled order's status back to PENDING, any status-based filter would miss that order entirely.",
                  order: 2,
                },
                {
                  title: "Why status Is Unreliable",
                  content:
                    "status is a mutable field — any admin action can change it. An order can have:\nstatus: 'PENDING'   — because an admin fat-fingered it\ncancelledAt: <date> — the immutable proof it was actually cancelled\n\nThe cancelledAt timestamp is set once and never changed. It is the source of truth.",
                  order: 3,
                },
                {
                  title: "The Fix: cancelledAt IS NULL",
                  content:
                    "Replace the unfiltered query:\n// BEFORE (buggy)\nwhere: {}\n\n// AFTER (correct)\nwhere: { cancelledAt: null }\n\nAn order with cancelledAt set was cancelled — regardless of what status says.",
                  order: 4,
                },
                {
                  title: "Stale-Status Test Case",
                  content:
                    "Write a test with this data:\nOrder A: status='PENDING', cancelledAt=<yesterday>  ← MUST be excluded\nOrder B: status='PENDING', cancelledAt=null           ← MUST be included\n\nIf only filtering by status, both appear identical and both are included — the bug.",
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
                      "Filter orders to only include those with cancelledAt === null.",
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
                    "This crash course covers extracting a Prisma where-clause builder into a reusable utility, writing regression tests, and producing a structured postmortem document.",
                  order: 1,
                },
                {
                  title: "Why Centralise the Revenue Predicate?",
                  content:
                    "If the same cancelledAt: null filter is copied into three report endpoints and one of them is updated while the others are forgotten, the bug returns. A single isRevenueEligibleOrder function is the single point of change.",
                  order: 2,
                },
                {
                  title: "revenueUtils.ts",
                  content:
                    "Create server/src/utils/revenueUtils.ts:\nexport function isRevenueEligibleOrder(order: { cancelledAt: Date | null; status: string }): boolean {\n  return order.cancelledAt === null;\n}\n\nThis is a pure function — testable without mocking Prisma.",
                  order: 3,
                },
                {
                  title: "Regression Test Cases",
                  content:
                    "Test all four meaningful scenarios:\n1. cancelledAt set, status CANCELLED → false (normal cancel)\n2. cancelledAt set, status PENDING   → false (stale status!)\n3. cancelledAt null, status PENDING  → true (active order)\n4. cancelledAt null, status DELIVERED → true (completed order)",
                  order: 4,
                },
                {
                  title: "Writing a Postmortem",
                  content:
                    "Create server/POSTMORTEM_REVENUE.md with four sections:\n## Symptom\nWhat finance observed.\n\n## Root Cause\nWhy the stats query was wrong technically.\n\n## Fix\nWhat changed in the code.\n\n## Prevention\nWhat will stop this from happening again.",
                  order: 5,
                },
                {
                  title: "Practice Lab: Incident Timeline",
                  content: "Practice drafting a 4-line incident timeline.",
                  section_type: "INTERACTIVE" as const,
                  interactive_mode: "CODE_EDITOR" as const,
                  interactive_config: {
                    instructions:
                      "Fill in each placeholder with a meaningful detail.",
                    language: "javascript",
                    starter_code:
                      "export function formatTimeline() {\n  return [\n    '- Detection: [fill in]',\n    '- Impact Window: [fill in]',\n    '- Mitigation: [fill in]',\n    '- Verification: [fill in]',\n  ].join('\\n');\n}\n",
                    editable_regions: [
                      { placeholder: "[fill in]", case_sensitive: false },
                    ],
                    entry_point: "formatTimeline",
                    test_cases: [
                      {
                        input: [],
                        expected:
                          "- Detection: Finance report showed inflated revenue\n- Impact Window: Unknown — since cancelledAt was added in L3\n- Mitigation: Added cancelledAt: null WHERE filter to stats query\n- Verification: Regression tests pass; finance confirmed correct totals",
                        label: "complete timeline",
                      },
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
