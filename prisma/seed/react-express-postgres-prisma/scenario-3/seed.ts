export const scenarios = [
  {
    id: "scenario-3",
    name: "IPPO POS System",
    description:
      "Build and debug a production-grade Point-of-Sale system for IPPO Software Solutions using React 18, Express, Prisma, and PostgreSQL. Progress from environment setup through cashier UI helpers, transactional inventory/void flows, a full-stack promo-code feature, and a critical revenue-reporting bug.",
    difficulty: "expert",
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
        "A PERN POS project needs npm install in root, client/, and server/. Prisma migrations keep Postgres aligned with schema.prisma. React layout components (Sidebar) are the single source of truth for brand text — update them once and every page reflects the change.",
      scenario_id: "scenario-3",
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
                  title: "Overview\nSetting Up a PERN Stack POS",
                  content:
                    "This crash course walks you through preparing a PERN (PostgreSQL + Express + React + Node.js) POS environment from scratch. By the end you will have both servers running and the database schema applied.",
                  order: 1,
                },
                {
                  title: "Why POS Systems Are Demanding",
                  content:
                    "A POS system is transactional by nature — every checkout writes to multiple tables (Order, OrderItem, Inventory). A correct local setup ensures these transactions behave the same way on your laptop as in production. Missing migrations or a stale Prisma client are the most common first-day pitfalls.",
                  order: 2,
                },
                {
                  title: "Three Package Roots",
                  content:
                    "This project has three separate package.json files:\nroot/          ← monorepo orchestrator + test scripts\n├── client/    ← React + Vite + Tailwind\n└── server/    ← Express + Prisma\n\nRun npm install in each directory independently.",
                  order: 3,
                },
                {
                  title: "Environment Variables",
                  content:
                    'Sensitive configuration lives in .env files:\nDATABASE_URL="postgresql://user:pass@localhost:5432/pos_system"\nPORT=5000\nJWT_SECRET=your-secret\n\nThe dotenv package loads these at runtime. Never commit .env.',
                  order: 4,
                },
                {
                  title: "Prisma Migrations",
                  content:
                    "After installing server dependencies, run:\nnpx prisma migrate dev --name init\n\nThis reads server/prisma/schema.prisma, creates SQL, and applies it. Prisma generate then regenerates the type-safe client.",
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
                    "A working PERN POS environment means: three node_modules folders, a server .env, a migrated Prisma schema, and both dev servers running without errors.",
                  order: 7,
                },
              ],
            },
            hints: {
              create: [
                {
                  description:
                    "Run npm install in all three directories (root, client/, server/) — each has its own package.json.",
                  order: 1,
                },
                {
                  description:
                    "Check the readme for required environment variables and create a .env file inside server/ before running migrations.",
                  order: 2,
                },
                {
                  description:
                    "Run `npx prisma migrate dev` inside server/ to apply the schema to your Postgres database.",
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
                    "This crash course shows how to locate and safely update a brand string in a React layout component without breaking the surrounding UI.",
                  order: 1,
                },
                {
                  title: "What is a Layout Component?",
                  content:
                    "Layout components (Sidebar, Navbar, Footer) render on every page. In this app the Sidebar lives in client/src/components/layout/Sidebar.tsx. Updating a string in that one file changes the brand everywhere.",
                  order: 2,
                },
                {
                  title: "JSX Text Nodes",
                  content:
                    'In JSX, plain text inside tags is a text node:\n<span className="text-sm">IPPO Solutions</span>\n\nUpdate the span text to the exact required string — case and spacing matter.',
                  order: 3,
                },
                {
                  title: "Vite HMR",
                  content:
                    "Vite's Hot Module Replacement updates the browser instantly on save — no manual refresh needed. Save and watch the sidebar update live.",
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
                      'Change the returned string from "IPPO Solutions" to "IPPO Software Solutions".',
                    language: "tsx",
                    starter_code:
                      'export function getBrandSubtitle() {\n  return "IPPO Solutions";\n}\n',
                    editable_regions: [
                      { placeholder: "IPPO Solutions", case_sensitive: true },
                    ],
                    entry_point: "getBrandSubtitle",
                    test_cases: [
                      {
                        input: [],
                        expected: "IPPO Software Solutions",
                        label: "exact subtitle string",
                      },
                    ],
                  },
                  order: 5,
                },
                {
                  title: "Key Takeaway",
                  content:
                    "Layout components are the single source of truth for global UI text. Update Sidebar.tsx once and the change propagates to every page.",
                  order: 6,
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
      scenario_id: "scenario-3",
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
                  title: "Overview\nPure Two-Argument Classifiers",
                  content:
                    "This crash course covers writing a threshold-based classifier as a pure two-argument function that returns a typed union rather than a boolean.",
                  order: 1,
                },
                {
                  title: "Why Two Arguments?",
                  content:
                    "POS inventory stores a per-product `lowStock` threshold. A single-argument helper with a fixed threshold would force every SKU to use the same cutoff — wrong for a shop that sells both low-volume and high-volume items. A two-arg signature (quantity, threshold) lets each product set its own LOW_STOCK boundary.",
                  order: 2,
                },
                {
                  title: "Union Types vs Booleans",
                  content:
                    "Boolean: in-stock / not.\nUnion: IN_STOCK | LOW_STOCK | OUT_OF_STOCK.\n\nThree states let the UI render three badge colours and let the filter make a precise decision. Booleans collapse that information.",
                  order: 3,
                },
                {
                  title: "Threshold Order Matters",
                  content:
                    "Check <=0 first, then <=threshold, then default to IN_STOCK. Swapping the order breaks the OUT_OF_STOCK case when threshold itself is 0. Always validate boundaries.",
                  order: 4,
                },
                {
                  title: "Pure Functions Are Testable",
                  content:
                    "A pure function depends only on its inputs and never mutates state. getStockLevel takes two numbers and returns a string literal — no side effects, no hidden config. That means a single unit test table covers every branch.",
                  order: 5,
                },
                {
                  title: "Practice Lab: Write the Classifier",
                  content:
                    "Implement getStockLevel and verify all three branches.",
                  section_type: "INTERACTIVE" as const,
                  interactive_mode: "CODE_EDITOR" as const,
                  interactive_config: {
                    instructions:
                      "Return 'OUT_OF_STOCK' if quantity <= 0, 'LOW_STOCK' if quantity <= threshold, otherwise 'IN_STOCK'.",
                    language: "javascript",
                    starter_code:
                      "export function getStockLevel(quantity, threshold) {\n  if (/* out-of-stock condition */) {\n    return 'OUT_OF_STOCK';\n  } else if (/* low-stock condition */) {\n    return 'LOW_STOCK';\n  } else {\n    return 'IN_STOCK';\n  }\n}\n",
                    required_code_includes: [
                      "quantity <= 0",
                      "quantity <= threshold",
                    ],
                    editable_regions: [
                      {
                        placeholder: "/* out-of-stock condition */",
                        case_sensitive: true,
                      },
                      {
                        placeholder: "/* low-stock condition */",
                        case_sensitive: true,
                      },
                    ],
                    entry_point: "getStockLevel",
                    test_cases: [
                      {
                        input: [0, 5],
                        expected: "OUT_OF_STOCK",
                        label: "zero quantity",
                      },
                      {
                        input: [3, 5],
                        expected: "LOW_STOCK",
                        label: "below threshold",
                      },
                      {
                        input: [5, 5],
                        expected: "LOW_STOCK",
                        label: "at threshold",
                      },
                      {
                        input: [10, 5],
                        expected: "IN_STOCK",
                        label: "above threshold",
                      },
                    ],
                  },
                  order: 6,
                },
                {
                  title: "Key Takeaway",
                  content:
                    "A two-argument pure classifier + union-typed return replaces scattered inline checks with one testable helper — and prevents threshold drift between components.",
                  order: 7,
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
                  title: "Overview\nRefactoring Duplicated Logic Across Pages",
                  content:
                    "This crash course refactors inline stock checks in POSPage.tsx and InventoryPage.tsx to use the shared getStockLevel helper, then adds a cashier-visible 'Hide out-of-stock items' toggle on POSPage.",
                  order: 1,
                },
                {
                  title: "Why Refactor?",
                  content:
                    "Inline checks like `quantity === 0 ? 'Out of Stock' : quantity <= lowStock ? 'Low' : 'In Stock'` duplicate logic. If the classification rules change (say, a 'BACKORDERED' state gets added), every site must be updated in lockstep. A shared helper fixes drift once and for all.",
                  order: 2,
                },
                {
                  title: "Controlled Inputs in React",
                  content:
                    'A controlled input binds its value to state:\nconst [hide, setHide] = useState(false);\n<input type="checkbox" checked={hide} onChange={e => setHide(e.target.checked)} />\n\nThe filter then reads hide to decide whether to drop OUT_OF_STOCK items.',
                  order: 3,
                },
                {
                  title: "Disabling vs Hiding",
                  content:
                    "Two UX choices: disable the button (visible but non-clickable) or hide the item (removed from the grid). This task does both — always disable OUT_OF_STOCK items, and when the toggle is on, hide them entirely from the grid.",
                  order: 4,
                },
                {
                  title: "Accessibility",
                  content:
                    "A hidden item must not receive keyboard focus. Use conditional rendering (filter before map) rather than CSS display:none when you want the element gone for screen readers and tab navigation too.",
                  order: 5,
                },
                {
                  title: "Practice Lab: Filter an Array",
                  content:
                    "Practice writing the filter predicate that the toggle drives.",
                  section_type: "INTERACTIVE" as const,
                  interactive_mode: "CODE_EDITOR" as const,
                  interactive_config: {
                    instructions:
                      "Filter out OUT_OF_STOCK items when hideOutOfStock is true. Return the array of kept items.",
                    language: "ts",
                    starter_code:
                      "export function filterProducts(products: { stockLevel: string }[], hideOutOfStock: boolean) {\n  // TODO: drop OUT_OF_STOCK when hideOutOfStock is true\n  return products;\n}\n",
                    entry_point: "filterProducts",
                    test_cases: [
                      {
                        input: [
                          [
                            { stockLevel: "IN_STOCK" },
                            { stockLevel: "OUT_OF_STOCK" },
                            { stockLevel: "LOW_STOCK" },
                          ],
                          true,
                        ],
                        expected: [
                          { stockLevel: "IN_STOCK" },
                          { stockLevel: "LOW_STOCK" },
                        ],
                        label: "hides when toggle on",
                      },
                      {
                        input: [[{ stockLevel: "OUT_OF_STOCK" }], false],
                        expected: [{ stockLevel: "OUT_OF_STOCK" }],
                        label: "shows all when toggle off",
                      },
                    ],
                  },
                  order: 6,
                },
                {
                  title: "Key Takeaway",
                  content:
                    "Shared helpers + controlled inputs + accessible conditional rendering = a cashier-facing feature that is testable, consistent, and easy to evolve.",
                  order: 7,
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
      scenario_id: "scenario-3",
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
                  title: "Overview\nDiagnosing Transactional Bugs",
                  content:
                    "This crash course teaches you how to read a checkout route, spot a read-then-write race, and produce evidence that the race is real.",
                  order: 1,
                },
                {
                  title: "Read-Then-Write Races in POS",
                  content:
                    "The current checkout reads inventory, validates quantity, then writes later. Between the read and the write, another cashier on another register can perform the same read. Both pass the guard, both decrement, and inventory goes negative. POS systems are especially vulnerable because multiple cashiers are the norm, not the exception.",
                  order: 2,
                },
                {
                  title: "Why There Is No Void Today",
                  content:
                    "The Order model has no status column and no voidedAt column. The schema literally cannot represent a voided order, so the API has no endpoint for it. Any reversal today would require the admin to mutate inventory by hand — and they'd do it without an audit trail.",
                  order: 3,
                },
                {
                  title: "Writing an Evidence Test",
                  content:
                    "A diagnosis is only as good as its reproduction. A concurrent-sale integration test fires two overlapping checkouts for the last unit and asserts that at most one succeeds. Today's code fails that test — that failure is the evidence.",
                  order: 4,
                },
                {
                  title: "The Status vs Timestamp Question",
                  content:
                    "When we add the void flow next task, we'll learn that status columns are mutable (admins can flip them) but timestamps are write-once in transactional code. This matters for reporting in Level 5 — spoiler: voidedAt will be the source of truth, not status.",
                  order: 5,
                },
                {
                  title: "Practice Lab: Spot the Race",
                  content:
                    "Identify the offending line in a simplified checkout.",
                  section_type: "INTERACTIVE" as const,
                  interactive_mode: "CODE_EDITOR" as const,
                  interactive_config: {
                    instructions:
                      "The function returns true if inventory is sufficient. Replace it with a version that uses updateMany + gte so two concurrent calls can never both succeed.",
                    language: "ts",
                    starter_code:
                      "export async function checkout(productId: number, qty: number, tx: any) {\n  const inv = await tx.inventory.findUnique({ where: { productId } });\n  if (inv.quantity < qty) return false;\n  await tx.inventory.update({ where: { productId }, data: { quantity: { decrement: qty } } });\n  return true;\n}\n",
                    entry_point: "checkout",
                    test_cases: [
                      {
                        input: [
                          1,
                          1,
                          {
                            inventory: {
                              findUnique: { returns: { quantity: 1 } },
                              update: { returns: {} },
                              updateMany: { returns: { count: 1 } },
                            },
                          },
                        ],
                        expected: true,
                        label: "last unit succeeds",
                      },
                    ],
                  },
                  order: 6,
                },
                {
                  title: "Key Takeaway",
                  content:
                    "Document the two failure paths (oversell race + missing void) with an evidence test before you write the fix. The test is the contract the fix must satisfy.",
                  order: 7,
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
                  title: "Overview\nAtomic Transactions for POS",
                  content:
                    "This crash course adds an OrderStatus enum, a voidedAt column, a voidOrder controller, and an oversell-safe checkout using Prisma's updateMany with a gte guard.",
                  order: 1,
                },
                {
                  title: "Schema Changes",
                  content:
                    "Add an OrderStatus enum (COMPLETED, VOIDED) with a default of COMPLETED. Add a voidedAt DateTime? column. Both are net new — POS had no void flow before.",
                  order: 2,
                },
                {
                  title: "updateMany + gte Guard",
                  content:
                    "Prisma's updateMany accepts a where-clause and returns { count }. Using `where: { productId, quantity: { gte: item.quantity } }` means the update only applies if the stock is still sufficient at the moment the UPDATE hits the database. If count !== 1, another transaction beat us to it — throw and the outer $transaction rolls back.",
                  order: 3,
                },
                {
                  title: "Multi-Table Atomicity",
                  content:
                    "voidOrder touches Order (status + voidedAt), Inventory (increment each OrderItem's quantity back), and PromoCode (decrement usedCount if one was applied). All three must live inside a single prisma.$transaction(async (tx) => { ... }) block so that a failure anywhere rolls back everything.",
                  order: 4,
                },
                {
                  title: "Guard the Transition",
                  content:
                    "Only a COMPLETED order can be voided. If the status is already VOIDED, throw — otherwise a double-void would double-restore inventory and drive stock up unfairly.",
                  order: 5,
                },
                {
                  title: "Practice Lab: Write the Guard",
                  content:
                    "Write the check that only allows voiding COMPLETED orders.",
                  section_type: "INTERACTIVE" as const,
                  interactive_mode: "CODE_EDITOR" as const,
                  interactive_config: {
                    instructions:
                      "Throw if the status is anything other than 'COMPLETED'. Otherwise return true.",
                    language: "ts",
                    starter_code:
                      "export function assertCanVoid(status: string) {\n  // TODO: throw if not COMPLETED\n  return true;\n}\n",
                    entry_point: "assertCanVoid",
                    test_cases: [
                      {
                        input: ["COMPLETED"],
                        expected: true,
                        label: "completed passes",
                      },
                    ],
                  },
                  order: 6,
                },
                {
                  title: "Key Takeaway",
                  content:
                    "Atomic transactions + updateMany gte guards + explicit status transitions are how you ship a POS void flow that can't be exploited by concurrent cashiers.",
                  order: 7,
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
      scenario_id: "scenario-3",
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
                  title: "Overview\nEnd-to-End Promo Flow",
                  content:
                    "This crash course builds a promo-code feature spanning a new Prisma model, two server routes, a client service, and a UI hook-up in the checkout modal.",
                  order: 1,
                },
                {
                  title: "PromoCode Model",
                  content:
                    "Add a PromoCode model with: `code String @unique`, `discountPercent Int`, `maxUses Int`, `usedCount Int @default(0)`, `expiresAt DateTime`, `isActive Boolean @default(true)`. Link Order with optional `promoCodeId Int?`.",
                  order: 2,
                },
                {
                  title: "validatePromo — Pure-ish Helper",
                  content:
                    "validatePromo(code, subtotal) returns a discriminated union: `{ ok: true, discountPercent, finalTotal }` or `{ ok: false, reason: 'NOT_FOUND' | 'INACTIVE' | 'EXPIRED' | 'EXHAUSTED' }`. Same helper can be called by the validate endpoint and re-checked inside the order transaction.",
                  order: 3,
                },
                {
                  title: "Why Re-Validate in the Transaction?",
                  content:
                    "The validate endpoint is advisory — it can succeed at t=0 but the promo might be exhausted by the time the cashier clicks Pay at t=3s. The order create path must re-validate inside the transaction with an atomic counter update.",
                  order: 4,
                },
                {
                  title: "Cashier UX States",
                  content:
                    "The UI must render four states: (a) no promo entered — input + Apply button; (b) applied — green message + Remove button; (c) invalid — red message with the reason (NOT_FOUND / INACTIVE / EXPIRED / EXHAUSTED); (d) in-flight — loading spinner on the Apply button.",
                  order: 5,
                },
                {
                  title: "Practice Lab: Build the Discount Total",
                  content:
                    "Compute the final total given a subtotal and a discount percent.",
                  section_type: "INTERACTIVE" as const,
                  interactive_mode: "CODE_EDITOR" as const,
                  interactive_config: {
                    instructions:
                      "Return subtotal * (1 - discountPercent / 100). Round nothing — the caller handles rounding.",
                    language: "ts",
                    starter_code:
                      "export function applyDiscount(subtotal: number, discountPercent: number) {\n  return subtotal;\n}\n",
                    entry_point: "applyDiscount",
                    test_cases: [
                      { input: [100, 10], expected: 90, label: "10% off 100" },
                      { input: [50, 25], expected: 37.5, label: "25% off 50" },
                      { input: [100, 0], expected: 100, label: "0% off" },
                    ],
                  },
                  order: 6,
                },
                {
                  title: "Key Takeaway",
                  content:
                    "Share a validatePromo helper between the validate endpoint and the order transaction, and render explicit states in the UI. Never trust an advisory validation — re-check in the transaction.",
                  order: 7,
                },
              ],
            },
            hints: {
              create: [
                {
                  description:
                    "Add the PromoCode model to schema.prisma and add optional promoCodeId to Order, then run prisma migrate dev.",
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
                  title: "Overview\nAtomic Counters + Lifecycle Hooks",
                  content:
                    "This crash course enforces maxUses + expiresAt + isActive atomically inside the order transaction and hooks voidOrder to decrement usedCount on reversal.",
                  order: 1,
                },
                {
                  title: "Atomic Counter Pattern",
                  content:
                    "`tx.promoCode.updateMany({ where: { id, isActive: true, expiresAt: { gt: now }, usedCount: { lt: maxUses } }, data: { usedCount: { increment: 1 } } })` with a count check of 1 — if the count is 0, someone else just consumed the last slot and we throw.",
                  order: 2,
                },
                {
                  title: "Why Not { lt: fields.maxUses }?",
                  content:
                    "Prisma cannot reference a sibling column in a single UPDATE — there is no Postgres-style `usedCount < maxUses` in Prisma's generated API. We read maxUses in a preceding findUnique and pass the literal into the updateMany guard.",
                  order: 3,
                },
                {
                  title: "Lifecycle Hook: Void Decrements",
                  content:
                    "Inside voidOrder's $transaction, if the order has promoCodeId, decrement that promo's usedCount by 1. This returns the use to the pool and keeps the admin panel's remaining uses accurate.",
                  order: 4,
                },
                {
                  title: "Admin Observability",
                  content:
                    "The /api/promos list endpoint (ADMIN only) returns each promo's code, discountPercent, maxUses, usedCount, and a derived remainingUses = maxUses - usedCount. The SettingsPage renders this in a simple table.",
                  order: 5,
                },
                {
                  title: "Practice Lab: Remaining Uses",
                  content:
                    "Compute remainingUses without letting it go negative.",
                  section_type: "INTERACTIVE" as const,
                  interactive_mode: "CODE_EDITOR" as const,
                  interactive_config: {
                    instructions: "Return max(0, maxUses - usedCount).",
                    language: "ts",
                    starter_code:
                      "export function remainingUses(maxUses: number, usedCount: number) {\n  return maxUses - usedCount;\n}\n",
                    entry_point: "remainingUses",
                    test_cases: [
                      { input: [10, 3], expected: 7, label: "normal" },
                      { input: [10, 10], expected: 0, label: "exhausted" },
                      { input: [5, 8], expected: 0, label: "negative clamped" },
                    ],
                  },
                  order: 6,
                },
                {
                  title: "Key Takeaway",
                  content:
                    "Atomic counter guards prevent overspend, lifecycle hooks keep the counter honest, and an admin panel makes the whole flow observable.",
                  order: 7,
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
      scenario_id: "scenario-3",
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
                  title:
                    "Overview\nSource-of-Truth Timestamps for Financial Reporting",
                  content:
                    "This crash course teaches why timestamp columns (like voidedAt) are safer than mutable enums (like status) as the predicate for financial queries.",
                  order: 1,
                },
                {
                  title: "The Stale-Status Pitfall",
                  content:
                    "An admin with DB-edit rights can flip Order.status from VOIDED back to COMPLETED. They cannot undo voidedAt without an explicit UPDATE — and voidedAt is never written by the checkout path, only by voidOrder. So voidedAt IS NULL is equivalent to 'this order has never been voided'.",
                  order: 2,
                },
                {
                  title: "Writing the Predicate",
                  content:
                    "In Prisma, the revenue where-clause is simply `{ voidedAt: null }`. When combined with a date range it becomes `{ createdAt: { gte, lt }, voidedAt: null }`. Any query that sums `order.total` must carry this predicate.",
                  order: 3,
                },
                {
                  title: "Regression Tests That Matter",
                  content:
                    "Your test suite must include at least one 'stale-status' scenario: an order with status COMPLETED but voidedAt set. The predicate must exclude it. If future refactors try to short-circuit the check with `status === 'COMPLETED'`, this test will fail and catch them.",
                  order: 4,
                },
                {
                  title: "Extending the Pattern",
                  content:
                    "The same idea applies to OE's cancelledAt, any softDeletedAt column, or archivedAt — if the business question is 'did X ever happen?', use a timestamp column, not a status enum.",
                  order: 5,
                },
                {
                  title: "Practice Lab: isRevenueEligibleOrder",
                  content:
                    "Implement the predicate that every revenue query will share.",
                  section_type: "INTERACTIVE" as const,
                  interactive_mode: "CODE_EDITOR" as const,
                  interactive_config: {
                    instructions:
                      "Return true only when order.voidedAt is null or undefined. Do not look at status.",
                    language: "ts",
                    starter_code:
                      "export function isRevenueEligibleOrder(order: { voidedAt: Date | null | undefined }) {\n  return true;\n}\n",
                    entry_point: "isRevenueEligibleOrder",
                    test_cases: [
                      {
                        input: [{ voidedAt: null }],
                        expected: true,
                        label: "never voided",
                      },
                      {
                        input: [{ voidedAt: new Date() }],
                        expected: false,
                        label: "voided",
                      },
                    ],
                  },
                  order: 6,
                },
                {
                  title: "Key Takeaway",
                  content:
                    "voidedAt IS NULL is the correct predicate. Status is a UI hint, not a financial truth.",
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
                  title: "Overview\nFrom Fix to Institutional Knowledge",
                  content:
                    "This crash course centralizes the revenue predicate into a shared utility and documents the bug + fix in a postmortem so the lesson outlives the commit.",
                  order: 1,
                },
                {
                  title: "Centralization",
                  content:
                    "Create server/src/utils/revenueUtils.ts exporting two things: `isRevenueEligibleOrder(order)` for in-memory filtering and `revenueWhereClause(extra)` that spreads into Prisma findMany/aggregate `where` clauses. Every revenue query imports these — no more copies.",
                  order: 2,
                },
                {
                  title: "Why a where-clause Builder?",
                  content:
                    "A predicate-as-function is easy to write but easy to misuse — someone could call it in application code after loading all orders, doubling the cost. A where-clause builder is pushed down to Postgres, so the DB never returns voided rows to the app.",
                  order: 3,
                },
                {
                  title: "Postmortem Structure",
                  content:
                    "server/POSTMORTEM_REVENUE.md must have four sections: Symptom (what finance saw), Root Cause (why status-based filtering is wrong), Fix (voidedAt: null + centralization), Prevention (reviewers reject status-based revenue predicates; the regression test must never be weakened).",
                  order: 4,
                },
                {
                  title: "Code Review Checklist",
                  content:
                    "A new PR line that reads `where: { status: 'COMPLETED' }` in any revenue context should be rejected at review. The utility exists so reviewers have a single concrete thing to point at.",
                  order: 5,
                },
                {
                  title: "Practice Lab: revenueWhereClause",
                  content:
                    "Merge extra predicates into the base revenue where-clause.",
                  section_type: "INTERACTIVE" as const,
                  interactive_mode: "CODE_EDITOR" as const,
                  interactive_config: {
                    instructions:
                      "Return an object with voidedAt: null plus any extra keys from the argument.",
                    language: "ts",
                    starter_code:
                      "export function revenueWhereClause(extra: Record<string, unknown> = {}) {\n  return {};\n}\n",
                    entry_point: "revenueWhereClause",
                    test_cases: [
                      {
                        input: [],
                        expected: { voidedAt: null },
                        label: "no extras",
                      },
                    ],
                  },
                  order: 6,
                },
                {
                  title: "Key Takeaway",
                  content:
                    "Fix once, centralize always, and document the reasoning so the next person to touch revenue queries doesn't repeat the bug.",
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
