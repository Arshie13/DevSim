export const scenarios = [
  {
    id: "nextjs-postgres-prisma-1",
    name: "POS System",
    description:
      "Build a Point-of-Sale system for tracking inventory, managing sales, and managing coupons and discounts using Next.js, PostgreSQL, and Prisma.",
    difficulty: "expert",
  },
];

export const levels = [
  {
    id: "npp-pos-level-1",
    title: "Getting Familiar with the Codebase",
    subtitle:
      "Set up the Next.js + PostgreSQL + Prisma POS environment and add a peso-formatting helper.",
    order: 1,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: A new full-stack developer has just been hired at NOVO Enterprises Inc. The team maintains a Point-of-Sale system built with Next.js, PostgreSQL, and Prisma. The first task is to get the project running against a local database, then add a small peso-formatting helper to confirm where the code lives.",
    xp_reward: 100,
    coin_reward: 50,
    key_takeaways:
      "A Next.js + PostgreSQL + Prisma app comes up in three steps: install dependencies, point DATABASE_URL at a local database, then run Prisma migrations so the schema and the generated client match. Seeding loads the sample data the UI renders.\n\nFormatting helpers belong in src/lib/ as small, pure functions. Centralizing currency formatting in one exported helper keeps every price display consistent and makes the rule easy to test in isolation.",
    scenario_id: "nextjs-postgres-prisma-1",
    tasks: {
      create: [
        {
          task_name: "Prepare Development Environment",
          test_type: "both",
          user_story:
            "As a developer, I want to install the POS project locally and connect it to my own PostgreSQL database so that I can start working on tasks.",
          learning_sections: {
            create: [
              {
                title: "Overview\nBooting a Next.js + PostgreSQL + Prisma App",
                content:
                  "This section walks through getting a Next.js POS app running against a local PostgreSQL database. The flow is the same on every Next.js + Prisma project: install dependencies, configure environment variables, run migrations, seed sample data, then start the dev server.",
                order: 1,
              },
              {
                title: "Serverless Architecture Context",
                content:
                  "Next.js on Vercel deploys as a serverless application. API routes and server components run as on-demand functions that spin up per request, then spin down. There is no persistent server process running 24/7. This means the stack handles traffic bursts by scaling horizontally, but cold starts can occur when no function instance is warm. Prisma handles this via connection pooling in serverless environments — a Prisma Accelerator or a DB-side pooler manages the PostgreSQL connection pool across ephemeral function instances.\n\nIn the local development environment, Next.js runs a standard Node.js dev server — the serverless distinction only matters at deployment. Architecturally, the project has no server/ directory; backend logic lives in src/app/api/ as route handlers or in src/app/actions/ as server actions.",
                order: 2,
              },
              {
                title: "What Lives Where",
                content:
                  "A typical Next.js + Prisma project is structured like:\nproject/\n    ├── prisma/\n    │     ├── schema.prisma ← models and database URL\n    │     └── seed.ts ← sample data\n    ├── src/\n    │     ├── app/ ← Next.js routes and pages\n    │     └── lib/ ← shared helpers (new files are added here)\n    └── package.json ← scripts and dependencies\nKnowing where helpers live is half of being productive on a Next.js codebase.",
                order: 3,
              },
              {
                title: "Environment Variables",
                content:
                  "Prisma reads DATABASE_URL from a .env file at the project root. The format is:\nDATABASE_URL=\"postgresql://USER:PASSWORD@HOST:PORT/DATABASE\"\nFor local Postgres on the default port it usually looks like:\nDATABASE_URL=\"postgresql://postgres:yourpassword@localhost:5432/pos_system\"\nThe .env file should never be committed. The repo's .gitignore already excludes it; .env.example is provided as a starting point.\n\nNote: Environment variables in this project are pre-configured.",
                order: 4,
              },
              {
                title: "Prisma Migrate & Generate",
                content:
                  "The 'pnpm prisma:migrate' (an alias for `prisma migrate dev`) does two jobs:\n  1. Reads prisma/schema.prisma and applies any pending SQL migrations to the database.\n  2. Regenerates the Prisma Client (the typed API imported as `prisma`) so it matches the schema.\nWhen schema.prisma is changed, this command should be re-run — migrations keep every developer's DB in lockstep.",
                order: 5,
              },
              {
                title: "Seeding and Running the Dev Server",
                content:
                  "The 'pnpm prisma:seed' runs prisma/seed.ts, which clears the relevant tables and inserts sample products, coupons, and orders. Then 'pnpm dev' boots the Next.js dev server on http://localhost:3000 with hot module replacement — saving a file triggers an instant page update without a full refresh.",
                order: 6,
              },
              {
                title: "Key Takeaway",
                content:
                  "Setting up a Next.js + Prisma project isn't about memorizing commands — it's about aligning the local environment (deps, .env, migrated schema, seeded data) so the app behaves identically for every developer on the team.",
                order: 7,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "If `prisma migrate dev` fails, check that the Postgres user can create databases — the migration creates the schema from scratch on a fresh DB.",
                order: 1,
              },
              {
                description:
                  "The setup-check grader verifies that dependencies installed, the Prisma migrations ran, and the seed completed — all three should pass locally before submitting.",
                order: 2,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Dependencies installed cleanly via `pnpm install`",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Prisma migrations applied and seed data inserted (`pnpm prisma:migrate` and `pnpm prisma:seed` succeed)",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "`pnpm dev` boots the app on http://localhost:3000 without errors",
                is_required: true,
                order: 3,
              },
            ],
          },
        },
        {
          task_name: "Add Peso Formatting Helper",
          test_type: "both",
          user_story:
            "As a cashier, I want every price on the POS and Inventory screens formatted consistently in pesos so that I can scan amounts without second-guessing.",
          learning_sections: {
            create: [
              {
                title: "Overview\nCentralizing Currency Formatting",
                content:
                  "This section introduces the idea of a single, pure helper that owns the rules for displaying money. When every component imports the same formatter, consistent prices are achieved everywhere, with one place to change the rule if it ever needs to evolve.",
                order: 1,
              },
              {
                title: "Why a Pure Helper",
                content:
                  "A pure function returns the same output for the same input and has no side effects. Currency formatting is a perfect fit — given a number, exactly one string is returned. Pure helpers are trivial to unit-test, safe to import anywhere, and do not pull in React or Next.js internals.",
                order: 2,
              },
              {
                title: "The formatPeso Contract",
                content:
                  "Create src/lib/format.ts and export:\n\nexport function formatPeso(amount: number): string\n\nRules:\n  • Always prefix the peso symbol ₱.\n  • Always show exactly 2 decimal places.\n  • Use comma thousands separators (1234.5 → \"₱1,234.50\").\n  • Negative amounts put the minus before the symbol (-5 → \"-₱5.00\").\nThe `Intl.NumberFormat` API handles thousands separators and fixed decimals out of the box — paired with a sign check for the negative case.",
                order: 3,
              },
              {
                title: "Wiring It Into the UI",
                content:
                  "Once formatPeso exists, replace ad-hoc `${price}` and `price.toFixed(2)` expressions in the POS and Inventory pages with `formatPeso(price)`. The goal is that every visible price on screen flows through the same helper.",
                order: 4,
              },
              {
                title: "Practice Lab: Round to Cents",
                content:
                  "Warm up by writing a tiny helper that rounds a number to two decimals before tackling the real formatter.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement roundToCents(amount) that returns amount rounded to 2 decimal places (e.g. 1.005 → 1.01, 1.234 → 1.23).",
                  language: "javascript",
                  starter_code:
                    "export function roundToCents(amount) {\n  // TODO\n}\n",
                  editable_regions: [
                    { placeholder: "// TODO", case_sensitive: true },
                  ],
                  entry_point: "roundToCents",
                  test_cases: [
                    { input: [1.005], expected: 1.01, label: "rounds halves up" },
                    { input: [1.234], expected: 1.23, label: "rounds down" },
                    { input: [0], expected: 0, label: "handles zero" },
                  ],
                },
                order: 5,
              },
              {
                title: "Key Takeaway",
                content:
                  "One exported helper, one rule, one source of truth. The moment the same formatting logic shows up in two components, refactor it into src/lib/.",
                order: 6,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "`Intl.NumberFormat('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })` provides thousands separators and 2-decimal padding for free.",
                order: 1,
              },
              {
                description:
                  "For the negative case, format the absolute value first, then prepend the minus sign so the symbol stays adjacent to the digits.",
                order: 2,
              },
              {
                description:
                  "After creating the helper, search the POS and Inventory pages for any remaining `toFixed` or template-literal price displays and replace them with `formatPeso`.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "`formatPeso` is exported from `src/lib/format.ts`",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Positive amounts produce `₱` + comma-separated integer part + 2 decimals (1234.5 → \"₱1,234.50\")",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Negative amounts put the minus before the peso sign (-5 → \"-₱5.00\")",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "The helper is used to render prices on the POS and Inventory pages",
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
    id: "npp-pos-level-2",
    title: "Inventory Quality",
    subtitle:
      "Write two Prisma-backed server actions: one to classify stock, one to compute cart totals from DB prices.",
    order: 2,
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: Cashiers cannot tell at a glance which products are low on stock, and the cart summary recomputes totals inline using whatever price the client happens to send. Both must be replaced with server actions backed by Prisma so the database is the source of truth. The graders mock `@/lib/prisma`, so real Prisma queries are written — no DB calls execute during the test.",
    xp_reward: 150,
    coin_reward: 125,
    key_takeaways:
      "Server actions in the Next.js App Router are async functions exported from files under `src/app/actions/`. They run on the server, can read `@/lib/prisma` directly, and are imported into client components just like any other function. Putting the stock-status rule and the cart math behind server actions means the client cannot disagree with the database.\n\nMoney math is unforgiving: round once at the end. Sum at full precision, then round the three outgoing fields. The empty-input case must be handled before Prisma is touched — querying for an empty `in` list is wasted work.",
    scenario_id: "nextjs-postgres-prisma-1",
    tasks: {
      create: [
        {
          task_name: "Stock Status Server Action",
          test_type: "both",
          user_story:
            "As an inventory manager, I want the server to classify each product as OUT_OF_STOCK, LOW_STOCK, or IN_STOCK so that every screen agrees on the badge without trusting client-side math.",
          learning_sections: {
            create: [
              {
                title: "Overview\nServer Actions in the App Router",
                content:
                  "Server actions are async functions exported from files inside `src/app/actions/`. They run only on the server, can import `@/lib/prisma` directly, and are called from client components like any other async function. They are the right home for any rule that has to agree with the database.",
                order: 1,
              },
              {
                title: "The getStockStatusForProduct Contract",
                content:
                  "Create `src/app/actions/inventory.ts` and export:\n\nexport async function getStockStatusForProduct(productId: string): Promise<{\n  productId: string;\n  quantity: number;\n  status: 'OUT_OF_STOCK' | 'LOW_STOCK' | 'IN_STOCK';\n}>\n\nUse `prisma.product.findUnique({ where: { product_id: productId } })`. Throw when the product does not exist. Classify the quantity: `<= 0` → `OUT_OF_STOCK`, `1..5` → `LOW_STOCK`, `> 5` → `IN_STOCK`.",
                order: 2,
              },
              {
                title: "Boundary Conditions",
                content:
                  "The interesting boundary is 5 vs 6: 5 is still `LOW_STOCK`, 6 flips to `IN_STOCK`. Zero and any negative number are `OUT_OF_STOCK`. The return shape includes the original `productId` and the live `quantity` so the caller has everything it needs in one trip.",
                order: 3,
              },
              {
                title: "Why Mocked Prisma in Tests",
                content:
                  "The grader replaces `@/lib/prisma` with `vi.mock(...)` so the unit test exercises the action code without touching a real database. Real Prisma calls are written — they just resolve to whatever the test injected. Shortcutting around the Prisma client by reading from a JSON file or hardcoding rows should be avoided.",
                order: 4,
              },
              {
                title: "Practice Lab: Classify Stock",
                content:
                  "Warm up by writing the pure classifier in isolation. In the real action this same rule is used after the Prisma fetch.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement classifyStock(quantity) returning 'OUT_OF_STOCK', 'LOW_STOCK', or 'IN_STOCK' per the spec.",
                  language: "javascript",
                  starter_code:
                    "export function classifyStock(quantity) {\n  // TODO\n}\n",
                  editable_regions: [
                    { placeholder: "// TODO", case_sensitive: true },
                  ],
                  entry_point: "classifyStock",
                  test_cases: [
                    { input: [0], expected: "OUT_OF_STOCK", label: "zero is out" },
                    { input: [-3], expected: "OUT_OF_STOCK", label: "negative is out" },
                    { input: [1], expected: "LOW_STOCK", label: "one is low" },
                    { input: [5], expected: "LOW_STOCK", label: "five is still low" },
                    { input: [6], expected: "IN_STOCK", label: "six is in stock" },
                    { input: [50], expected: "IN_STOCK", label: "well stocked" },
                  ],
                },
                order: 5,
              },
              {
                title: "Key Takeaway",
                content:
                  "Push business rules that depend on database state into server actions, not into client components. The action returns a typed shape; the UI only renders it.",
                order: 6,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Use `prisma.product.findUnique({ where: { product_id: productId } })` — the column is `product_id`, not `id`.",
                order: 1,
              },
              {
                description:
                  "Throw an Error when the product is not found; the grader asserts the action rejects in that case.",
                order: 2,
              },
              {
                description:
                  "The 5-vs-6 boundary is the trick: 5 is the last LOW_STOCK value, 6 is the first IN_STOCK.",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "`getStockStatusForProduct` is exported as an async function from `src/app/actions/inventory.ts`",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "The action queries Prisma via `product.findUnique` keyed by `product_id`",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Missing product throws; otherwise the response includes `productId`, `quantity`, and a status of `OUT_OF_STOCK` / `LOW_STOCK` / `IN_STOCK`",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Quantities classify as: `<= 0` → OUT_OF_STOCK, `1..5` → LOW_STOCK, `> 5` → IN_STOCK",
                is_required: true,
                order: 4,
              },
            ],
          },
        },
        {
          task_name: "Cart Totals Server Action",
          test_type: "both",
          user_story:
            "As a cashier, I want the subtotal, discount, and total to be computed on the server using DB prices so that the client cannot underbill the customer by tampering with prices.",
          learning_sections: {
            create: [
              {
                title: "Overview\nDB Prices Are the Source of Truth",
                content:
                  "If the client sends both the cart and the prices, the client controls the total — a recipe for fraud and drift. The server action accepts only what cannot be faked (product IDs and quantities) and fetches the prices itself from Prisma.",
                order: 1,
              },
              {
                title: "The getCartTotals Contract",
                content:
                  "Create `src/app/actions/cart.ts` and export:\n\nexport async function getCartTotals(input: {\n  items: { product_id: string; cartQuantity: number }[];\n  discountPercent?: number;\n}): Promise<{ subtotal: number; discount: number; total: number }>\n\nFetch prices via `prisma.product.findMany({ where: { product_id: { in: [...] } } })`. Compute `subtotal = Σ price × cartQuantity` using DB prices, `discount = subtotal × discountPercent / 100` (0 when not given), `total = subtotal − discount`. Round all three to 2 decimals.",
                order: 2,
              },
              {
                title: "Edge Cases",
                content:
                  "Empty `items` → return `{ subtotal: 0, discount: 0, total: 0 }` WITHOUT querying Prisma. Missing `discountPercent` → treat as 0. Round only the three outgoing values; summing already-rounded line subtotals can drift by a cent on long carts.",
                order: 3,
              },
              {
                title: "Why Prisma's `in` Filter",
                content:
                  "`prisma.product.findMany({ where: { product_id: { in: ids } } })` issues one SQL query for all cart lines. Looping over `findUnique` per line is N+1 — slow under any real load and exactly the pattern code reviewers reject.",
                order: 4,
              },
              {
                title: "Key Takeaway",
                content:
                  "When several values are computed from the same inputs, return them together. One trip through the action guarantees the three numbers add up and the DB stays the source of truth.",
                order: 5,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Short-circuit the empty-cart case at the top of the function — return zeroes before any Prisma call.",
                order: 1,
              },
              {
                description:
                  "Build a `Map<product_id, price>` from the `findMany` result so the subtotal loop is O(n) instead of O(n × m).",
                order: 2,
              },
              {
                description:
                  "`Math.round(n * 100) / 100` is the clean way to round to two decimals while keeping the return type `number`.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "`getCartTotals` is exported as an async function from `src/app/actions/cart.ts`",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Prices are fetched from Prisma via `product.findMany` with an `in` filter on `product_id`",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Empty `items` returns zeroes without calling Prisma; missing `discountPercent` is treated as 0",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "`subtotal`, `discount`, and `total` are computed from DB prices and rounded to 2 decimals",
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
    id: "npp-pos-level-3",
    title: "Checkout Integrity",
    subtitle:
      "Render two React components — an errors banner and a live order summary.",
    order: 3,
    deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: Cashiers cannot tell whether the cart is safe to submit, and the on-screen order summary is duplicated across two pages with slightly different markup. Build two presentational React components — one that surfaces every checkout error at once, and one that renders the live order summary with totals. Both are graded with `@testing-library/react` in jsdom.",
    xp_reward: 200,
    coin_reward: 200,
    key_takeaways:
      "Presentational React components map props to ARIA roles and `data-testid` hooks — the grader doesn't inspect CSS; it checks whether `getByRole('alert')` finds the right element. Designing components against the testing-library queries ensures screen readers can also use them.\n\nWhen the same UI block is rendered in two places, create one component and reuse it. The order summary on the cart page and the receipt page should be the same `<OrderSummary />` so the totals always line up.",
    scenario_id: "nextjs-postgres-prisma-1",
    tasks: {
      create: [
        {
          task_name: "Checkout Errors Banner Component",
          test_type: "both",
          user_story:
            "As a cashier, I want a banner that either confirms the cart is ready or lists every problem at once so that I can fix them before the customer waits.",
          learning_sections: {
            create: [
              {
                title: "Overview\nPresentational Components and ARIA Live Regions",
                content:
                  "This section covers presentational React components that render one of two visual states based on a single condition. The pattern appears in form validation banners, status indicators, confirmation messages, and any UI that toggles between success and error views. The component receives data purely through props and produces markup without side effects or state management.",
                order: 1,
              },
              {
                title: "Default Exports in ES6 Modules",
                content:
                  "A default export is the primary export from a module — the value that callers receive when they import without curly braces. Each module can have at most one default export, which is the convention for 'this file exports one main component.' The import does not need to match the exported name, though matching names improves readability:\n\nimport CheckoutErrors from './CheckoutErrors';\n\nGrader tests import the default export, so the component must be declared with `export default function` rather than a named export followed by a separate default statement.",
                order: 2,
              },
              {
                title: "Conditional Rendering with Props",
                content:
                  "When a component displays one of two mutually exclusive views, a single top-level conditional is used. An order-status badge on a restaurant display board shows either 'Preparing' or 'Ready' — never both. The condition is evaluated once at the top of the render function:\n\nif (orders.length === 0) {\n  return <EmptyState />;\n}\nreturn <OrderList items={orders} />;\n\nBoth branches are never reached simultaneously, keeping the control flow flat and avoiding deeply nested ternaries that are harder to test and debug.",
                order: 3,
              },
              {
                title: "ARIA Live Regions: Alert vs. Status",
                content:
                  "ARIA live regions announce content changes to assistive technology without requiring the user to move focus. Two roles apply to status banners:\n\n`role=\"alert\"` — assertive: the screen reader interrupts its current announcement to read this content immediately. Used for messages that demand attention, such as submission rejections or validation failures.\n\n`role=\"status\"` — polite: the screen reader finishes its current announcement before reading this update. Used for confirmations that can wait, such as success messages or completion statuses.\n\nA flight-status board at an airport gate illustrates the difference: a gate change announcement (`alert`) interrupts the boarding call, while a 'Boarding in 5 minutes' update (`status`) waits until the current announcement finishes. The component renders one role or the other, depending on whether errors are present.",
                order: 4,
              },
              {
                title: "Testing with getByRole",
                content:
                  "Testing libraries query the DOM using selectors that mirror how users and assistive technology interact with the page. `getByRole('alert')` finds the error banner when problems exist; `getByRole('status')` finds the confirmation banner when everything is clean. Designing a component against these queries means it is accessible by default — the ARIA role serves both the test assertion and the screen reader simultaneously.",
                order: 5,
              },
              {
                title: "Practice Lab: Status Banner Conditionals",
                content:
                  "Practice rendering one of two banners based on whether an alerts array is empty or populated.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Return a success banner ('No alerts') when the alerts array is empty; return an error-list banner when it contains messages.",
                  language: "javascript",
                  starter_code:
                    "function renderBanner(alerts) {\n  // TODO\n}\n",
                  editable_regions: [
                    { placeholder: "// TODO", case_sensitive: true },
                  ],
                  entry_point: "renderBanner",
                  test_cases: [
                    { input: [[]], expected: "No alerts", label: "empty alerts → success banner" },
                    { input: [['Expired card']], expected: "Error: Expired card", label: "one alert → error banner" },
                    { input: [['Bad input', 'Missing field']], expected: "Error: Bad input, Missing field", label: "multiple alerts → error banner" },
                  ],
                },
                order: 6,
              },
              {
                title: "Key Takeaway",
                content:
                  "One component, two branches, one role per view. The `alert` role communicates urgency for error states; the `status` role communicates completion for confirmation states. testing-library role queries validate both correctness and accessibility together.",
                order: 7,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Two branches: `errors.length === 0` renders a confirmation; otherwise an alert.",
                order: 1,
              },
              {
                description:
                  "The empty branch is a polite live region (`role=\"status\"`); the non-empty branch is assertive (`role=\"alert\"`) with one `<li>` per error.",
                order: 2,
              },
              {
                description:
                  "The grader imports the default export — `export default function CheckoutErrors(...)`.",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "`CheckoutErrors` is the default export of `src/components/CheckoutErrors.tsx`",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Empty errors → renders an element with `role=\"status\"` and \"Ready to checkout\" text",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Non-empty errors → renders an element with `role=\"alert\"` containing a `<ul>` with one `<li>` per message",
                is_required: true,
                order: 3,
              },
            ],
          },
        },
        {
          task_name: "Order Summary Component",
          test_type: "both",
          user_story:
            "As a cashier, I want the order summary to show the customer name, every line, the total, and (when applied) the coupon discount so that the receipt and the cart agree before I confirm the sale.",
          learning_sections: {
            create: [
              {
                title: "Overview\nData-Driven List Components with Conditional Sections",
                content:
                  "This section covers rendering a list of items from an array prop alongside conditional sections that appear only when relevant data is supplied. The pattern is common in order summaries, invoices, receipts, and any interface that iterates over line items while optionally displaying applied modifiers like discounts or taxes.",
                order: 1,
              },
              {
                title: "Rendering Lists with data-testid Attributes",
                content:
                  "React renders collections by mapping each array element to a DOM node. Each element requires a stable `key` prop — typically a unique identifier from the data — so React can reconcile the list efficiently. The `data-testid` attribute on each row provides a stable anchor for test queries without relying on CSS classes or DOM nesting. A weather alert dashboard that lists active warnings per city uses this pattern: each city gets a row tagged with a test ID, and tests assert row counts and content directly.",
                order: 2,
              },
              {
                title: "Conditional Sections with Logical AND",
                content:
                  "When markup must render only when a prop was passed, the logical AND short-circuit evaluates the condition once and renders nothing when the left side is falsy. A shipping label that includes a 'Fragile' badge only when the package is marked as breakable follows this pattern: the badge DOM node exists only when the condition is met. Tests assert the badge's absence with `queryByTestId` rather than `getByTestId` — the former returns `null` when the element is absent.",
                order: 3,
              },
              {
                title: "Reusing Shared Formatting Helpers",
                content:
                  "Monetary values, dates, and other formatted output are delegated to imported helper functions. The component passes the raw value to a formatter and renders the returned string. A billing dashboard that reuses the same currency formatter across all invoice rows, summary cards, and export views guarantees visual consistency. Changing the currency format requires editing one file, not every component.",
                order: 4,
              },
              {
                title: "Practice Lab: Render Line Items with Conditional Discount",
                content:
                  "Practice rendering a list of items with an optional discount row that appears only when a discount prop is provided.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Render each item as 'NAME × QTY — $PRICE' and conditionally show a discount row when discount > 0. Return the result as a newline-joined string.",
                  language: "javascript",
                  starter_code:
                    "function renderReceipt(items, discount) {\n  // TODO\n}\n",
                  editable_regions: [
                    { placeholder: "// TODO", case_sensitive: true },
                  ],
                  entry_point: "renderReceipt",
                  test_cases: [
                    { input: [[{ name: 'Coffee', qty: 2, price: 3.50 }], 0], expected: "Coffee × 2 — $3.50", label: "single item, no discount" },
                    { input: [[{ name: 'Coffee', qty: 2, price: 3.50 }, { name: 'Donut', qty: 1, price: 2.00 }], 1.00], expected: "Coffee × 2 — $3.50\nDonut × 1 — $2.00\nDiscount: -$1.00", label: "two items with discount row" },
                    { input: [[], 0], expected: "", label: "empty items returns empty" },
                  ],
                },
                order: 5,
              },
              {
                title: "Key Takeaway",
                content:
                  "A list component maps array props to rows, shows optional sections with conditional rendering, and delegates formatting to shared helpers. When the same UI block appears on multiple pages, a single component ensures consistent layout and data display.",
                order: 6,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Required `data-testid`s: `customer-name`, `order-item` (one per line), `order-total`, and `order-discount`.",
                order: 1,
              },
              {
                description:
                  "Render `order-discount` ONLY when a coupon prop is supplied — wrap it in `{coupon && (...)}` so `queryByTestId` returns null when none is passed.",
                order: 2,
              },
              {
                description:
                  "Reuse `formatPeso` from Level 1 for every money value; the grader matches the `₱` prefix and two decimals.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "`OrderSummary` is the default export of `src/components/OrderSummary.tsx`",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Renders `data-testid=\"customer-name\"` with the customer's name and one `data-testid=\"order-item\"` per cart line",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "`data-testid=\"order-total\"` shows the peso-formatted total; `data-testid=\"order-discount\"` is only emitted when a coupon is supplied",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "All money values are rendered via the `formatPeso` helper from Level 1 (₱X.XX)",
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
    id: "npp-pos-level-4",
    title: "Coupons Feature Expansion",
    subtitle:
      "Add an expiry column, build a Coupon Input component, and pick the best valid coupon on the server.",
    order: 4,
    deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: Coupons need an `expires_at` column on the `Coupon` model so flash sales can self-terminate. The cashier needs a small input component that normalizes whatever they type, and the POS needs a server action that picks the coupon yielding the largest valid discount. One client task (React component), one server task (Prisma-backed action), one schema migration in between.",
    xp_reward: 250,
    coin_reward: 300,
    key_takeaways:
      "Mixed levels combine the muscles built in Levels 2 and 3: presentational components for what the user touches, server actions for what the database decides. The boundary between them is exactly the props/return shape — designed deliberately.\n\nA Prisma schema change is a three-step rhythm: edit `schema.prisma`, run `prisma migrate dev --name <change>`, then teach every action that reads the model about the new field. Optional columns (`DateTime?`) ship cleanly because existing rows just default to NULL.",
    scenario_id: "nextjs-postgres-prisma-1",
    tasks: {
      create: [
        {
          task_name: "Coupon Input Component",
          test_type: "both",
          user_story:
            "As a cashier, I want the coupon input to ignore stray whitespace and case so that the lookup matches whether the customer typed \"save10\" or \"  SAVE 10  \".",
          learning_sections: {
            create: [
              {
                title: "Overview\nControlled Input Components with Normalization",
                content:
                  "This section covers controlled form inputs that preprocess user text before emitting it. Normalization — trimming, case folding, and whitespace stripping — transforms freeform input into a canonical form suitable for lookups, search queries, and code entry. The input component owns the normalization logic; the parent receives only clean, predictable values.",
                order: 1,
              },
              {
                title: "React Controlled Components",
                content:
                  "A controlled input stores its value in React state and updates it via an `onChange` handler. Every keystroke flows through the state variable, giving the component full authority over what the input displays. A ticket-booking kiosk that formats a confirmation number as the user types — inserting dashes at fixed positions — requires controlled input because the displayed value does not match the raw keystrokes. Controlled inputs are the right choice when raw text must be transformed, validated, or restricted during typing.",
                order: 2,
              },
              {
                title: "Input Normalization Strategies",
                content:
                  "Normalization transforms raw user input into a consistent format before it leaves the component. Three transformations commonly apply to code-entry fields:\n\nTrimming — removing leading and trailing whitespace so that `\"  CODE789  \"` becomes `\"CODE789\"`.\n\nCase folding — converting to uppercase or lowercase so that `\"code789\"` and `\"CODE789\"` are treated identically.\n\nInternal whitespace stripping — collapsing or removing spaces within the text so that `\"CODE 789\"` becomes `\"CODE789\"`.\n\nA parking-validation kiosk applies the same transformations: a code typed as `\"  a b c 1 2 3  \"` is normalized to `\"ABC123\"` before being checked against the database. These transformations are applied in sequence at the moment of submission.",
                order: 3,
              },
              {
                title: "Derived Disabled State",
                content:
                  "The Apply button's disabled state is derived from the current input value during render rather than stored in separate state. Checking `value.trim().length` on every render determines whether the button should be clickable:\n\nconst isDisabled = value.trim().length === 0;\n\nAn elevator call button that lights up only when a floor number is entered follows the same principle — the button state is a direct function of the input, never an independent variable. Deriving disabled state from the value guarantees the button state is always consistent with the input field.",
                order: 4,
              },
              {
                title: "Practice Lab: Normalize a Promo Code Input",
                content:
                  "Practice writing a function that normalizes a freeform input string by trimming, uppercasing, and stripping internal whitespace.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Normalize the input: trim outer whitespace, convert to uppercase, and remove all internal spaces so the result is a compact code.",
                  language: "javascript",
                  starter_code:
                    "function normalizePromoCode(raw) {\n  // TODO\n}\n",
                  editable_regions: [
                    { placeholder: "// TODO", case_sensitive: true },
                  ],
                  entry_point: "normalizePromoCode",
                  test_cases: [
                    { input: ["  save20  "], expected: "SAVE20", label: "trims outer whitespace" },
                    { input: ["SAVE 20"], expected: "SAVE20", label: "strips internal space" },
                    { input: ["  Save  20  "], expected: "SAVE20", label: "trims, uppercases, and strips internal spaces" },
                    { input: ["hello"], expected: "HELLO", label: "uppercases lowercase input" },
                  ],
                },
                order: 5,
              },
              {
                title: "Key Takeaway",
                content:
                  "Controlled inputs with normalization produce clean, predictable values regardless of how users type them. Derive disabled state from the value during render; reset after successful submission. The component normalizes on the way out — the parent never sees raw input text.",
                order: 6,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Placeholder must contain the word \"coupon\" (grader uses `getByPlaceholderText(/coupon/i)`).",
                order: 1,
              },
              {
                description:
                  "Derive `disabled` from `value.trim().length` during render — don't store it in its own state.",
                order: 2,
              },
              {
                description:
                  "Normalize before emitting: trim, uppercase, strip internal whitespace.",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "`CouponInput` is the default export of `src/components/CouponInput.tsx`",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Renders a textbox (with `coupon` in the placeholder) and an Apply button",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Apply is disabled for empty or whitespace-only input; clicking Apply on valid input calls `onApply` with the trimmed, uppercased, whitespace-stripped code",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Input clears after a successful apply",
                is_required: true,
                order: 4,
              },
            ],
          },
        },
        {
          task_name: "Best Coupon Selector Server Action",
          test_type: "both",
          user_story:
            "As a customer, I want the POS to automatically apply whichever valid coupon gives me the biggest discount so that I don't have to remember which code stacks best.",
          learning_sections: {
            create: [
              {
                title: "Overview\nServer-Side Filtering and Ranking with Date Validation",
                content:
                  "This section covers a server action that filters records by date-based validity, then ranks the survivors to select the optimal candidate. The two concerns — filtering and ranking — are handled sequentially: records that fail the validity gate are discarded, and among those that pass, the one with the highest value wins.",
                order: 1,
              },
              {
                title: "Schema Migrations with Optional Fields",
                content:
                  "Adding a new column to a Prisma model follows a three-step rhythm. First, the column is added to `schema.prisma` with its type — `DateTime?` for an optional date field. Second, `pnpm prisma migrate dev` generates and applies the migration. Third, every query that reads the model is updated to account for the new field. Optional fields — those declared with `?` — carry the benefit that existing rows default to `NULL` with no backfill required. A warehouse system adding an optional `recalled_at` timestamp to a Product model follows the same process: add field, migrate, update queries.",
                order: 2,
              },
              {
                title: "Date-Based Validity Gates",
                content:
                  "Filtering records by expiry requires comparing a stored timestamp against a reference point. The pattern is straightforward: fetch all candidates, compare each candidate's expiry date to the reference point, and discard those in the past. A concert venue checks tickets at the gate using the same logic — tickets for past shows are rejected regardless of seat quality or price paid. The date check happens first and is absolute; nothing overrides an expired entry. The same gate applies to promotional codes, event registrations, and subscription-based access.",
                order: 3,
              },
              {
                title: "Ranking by Maximum Value with Prisma Filtering",
                content:
                  "After invalid records are discarded, the remaining candidates are ranked by a numeric field — discount percentage, reward amount, or priority score. The highest value wins. Prisma's `where` clause with `findMany` fetches only active records, and the ranking pass discards expired ones. Keeping filtering and ranking as separate passes produces code that is easier to audit: the filter declares what is eligible, the ranking declares what is best.",
                order: 4,
              },
              {
                title: "Practice Lab: Filter and Rank by Expiry",
                content:
                  "Practice writing a function that filters out expired items and returns the one with the highest value, or null when nothing qualifies.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Filter out items whose expiresAt is before now, then return the item with the highest value. Return null when nothing qualifies.",
                  language: "javascript",
                  starter_code:
                    "function selectBest(entries, now) {\n  // TODO\n}\n",
                  editable_regions: [
                    { placeholder: "// TODO", case_sensitive: true },
                  ],
                  entry_point: "selectBest",
                  test_cases: [
                    { input: [[{ value: 10, expiresAt: '2025-12-31' }, { value: 20, expiresAt: '2024-01-01' }], '2025-06-01'], expected: { value: 10, expiresAt: '2025-12-31' }, label: "expired excluded, active wins" },
                    { input: [[{ value: 10, expiresAt: '2024-01-01' }, { value: 5, expiresAt: '2023-06-01' }], '2025-06-01'], expected: null, label: "all expired → null" },
                    { input: [[{ value: 5, expiresAt: '2026-01-01' }, { value: 8, expiresAt: '2026-06-01' }], '2025-06-01'], expected: { value: 8, expiresAt: '2026-06-01' }, label: "both active, highest value wins" },
                  ],
                },
                order: 5,
              },
              {
                title: "Key Takeaway",
                content:
                  "Filter first, rank second. Validity is a gate, not a tiebreaker. Expiry checks use absolute comparisons against a reference point. Returning null for the empty-result case lets the caller handle that state gracefully without conflating it with an error.",
                order: 6,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Don't skip the schema change — add `expires_at DateTime?` to the Coupon model and migrate before writing the action.",
                order: 1,
              },
              {
                description:
                  "Validity is a gate, not a tiebreaker — drop expired coupons before ranking discounts.",
                order: 2,
              },
              {
                description:
                  "`now` defaults to `new Date()` so production callers can omit it; tests inject a fixed clock.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "`Coupon.expires_at DateTime?` added to `schema.prisma` and a Prisma migration applied",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "`applyBestCoupon` is exported as an async function from `src/app/actions/coupons.ts`",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "The action calls `prisma.coupon.findMany({ where: { is_active: true } })` and ignores coupons whose `expires_at` is in the past relative to `now`",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Returns the largest-discount valid coupon with the computed `discount`, or `null` when none qualify",
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
    id: "npp-pos-level-5",
    title: "Sales Reporting",
    subtitle:
      "Build a Sales Summary component and a Top Selling server action, then surface both on /admin/reports.",
    order: 5,
    deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: The owner wants a `/admin/reports` page with two pieces — a live summary card (revenue, discounts, order count, average order value) and a leaderboard of the top-selling products. The summary is a presentational React component; the leaderboard is a Prisma-backed server action that aggregates `OrderItem` rows.",
    xp_reward: 300,
    coin_reward: 400,
    key_takeaways:
      "Reporting pages mix two kinds of code: a presentational component that totals what's already on the page, and a server action that aggregates rows the page hasn't seen yet. Returning the four summary numbers from one component (instead of four scattered spans) means they cannot drift apart.\n\nA leaderboard server action is three steps: query with `include` to pull the related model, fold into a `Map` keyed by id, sort with an explicit tie-breaker, then slice to `limit`. The grader mocks Prisma, so the loaded rows are whatever the test injects — the code has to aggregate them correctly.",
    scenario_id: "nextjs-postgres-prisma-1",
    tasks: {
      create: [
        {
          task_name: "Sales Summary Component",
          test_type: "both",
          user_story:
            "As an owner, I want one card showing total revenue, total discount, order count, and average order value so that I can see daily performance at a glance.",
          learning_sections: {
            create: [
              {
                title: "Overview\nMulti-Aggregate Summary Cards with Safe Division",
                content:
                  "This section covers components that receive an array of records, derive several aggregates — sums, counts, and averages — and display each in a labelled slot. The pattern appears in dashboards, summary cards, budget trackers, and any view that condenses raw rows into a handful of key metrics. The critical edge case is computing an average when the denominator may be zero.",
                order: 1,
              },
              {
                title: "Presentational Components for Aggregated Data",
                content:
                  "A presentational component receives data through props and derives aggregate values during render. A sports scoreboard that receives a list of match results and displays total wins, losses, and win percentage follows this pattern — every number displayed is a function of the input array. No state, no data fetching, no side effects. The component computes sums with `reduce`, counts with `length`, and averages with division guarded by a zero check. All values are derived in a single render pass, guaranteeing they are internally consistent.",
                order: 2,
              },
              {
                title: "Division by Zero Prevention",
                content:
                  "Computing an average requires dividing a sum by the record count. When the array is empty, the count is zero and division produces `NaN` or `Infinity`. A shipping-cost calculator that averages per-package weight across a batch must handle the empty-batch case — a guard clause sets the average to zero when no packages exist:\n\nconst avg = records.length === 0 ? 0 : total / records.length;\n\nThe guard evaluates to zero for empty inputs, which is the correct business value: no orders means an average order value of zero. Without this guard, `NaN` appears in the UI, which is never a valid display value.",
                order: 3,
              },
              {
                title: "Formatting Through Shared Helpers",
                content:
                  "Monetary aggregates flow through the same formatting helper used by every other component. A restaurant POS that displays subtotals, kitchen display screens, and nightly close-out reports all use the same currency formatter — guaranteeing that every dollar amount looks identical regardless of where it is shown.",
                order: 4,
              },
              {
                title: "Practice Lab: Compute Summary with Safe Average",
                content:
                  "Practice computing total, count, and average from an array of numeric values, handling the empty case safely.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Return { total, count, average } from an array of numbers. Average must be 0 (not NaN) when the array is empty.",
                  language: "javascript",
                  starter_code:
                    "function summarize(values) {\n  // TODO\n}\n",
                  editable_regions: [
                    { placeholder: "// TODO", case_sensitive: true },
                  ],
                  entry_point: "summarize",
                  test_cases: [
                    { input: [[10, 20, 30]], expected: { total: 60, count: 3, average: 20 }, label: "three values" },
                    { input: [[]], expected: { total: 0, count: 0, average: 0 }, label: "empty array → average is 0" },
                    { input: [[5]], expected: { total: 5, count: 1, average: 5 }, label: "single value" },
                  ],
                },
                order: 5,
              },
              {
                title: "Key Takeaway",
                content:
                  "Derive aggregates from props in a single render pass. Guard division with a count check so empty input never produces `NaN`. Delegate all formatting to shared helpers for visual consistency across every display of the same data type.",
                order: 6,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Mind the zero-orders branch when computing the average.",
                order: 1,
              },
              {
                description:
                  "Money values flow through `formatPeso`.",
                order: 2,
              },
              {
                description:
                  "Anchor on the documented `data-testid`s.",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "`SalesSummary` is the default export of `src/components/SalesSummary.tsx`",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Renders `total-revenue`, `total-discount`, `order-count`, and `average-order` test ids with the correct sums",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Empty orders → `average-order` is `0` (peso-formatted), never `NaN` or `Infinity`",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Money values are rendered via `formatPeso` (₱ + 2 decimals + comma separators)",
                is_required: true,
                order: 4,
              },
            ],
          },
        },
        {
          task_name: "Top Selling Products Server Action",
          test_type: "both",
          user_story:
            "As an owner, I want a server-side ranking of the best-selling products so that the leaderboard reflects the true database state without trusting client-side aggregation.",
          learning_sections: {
            create: [
              {
                title: "Overview\nServer-Side Aggregation and Leaderboard Ranking",
                content:
                  "This section covers server actions that aggregate detail rows into per-entity summaries, then rank those summaries by a numeric metric. The pattern appears in leaderboards, top-N reports, sales dashboards, and any view that answers 'which X has the most Y.' The server fetches, folds, sorts, and slices — the client receives a clean, ranked list.",
                order: 1,
              },
              {
                title: "Prisma Eager Loading with include",
                content:
                  "Prisma's `include` option pulls related records in the same query, avoiding the N+1 problem. Instead of fetching detail rows, then querying per entity ID to fetch names, a single query with `include: { related: true }` returns each row with its parent data already attached. A library catalog that shows book titles alongside borrow counts uses `include: { book: true }` on the borrow records — one round-trip produces everything needed for the display. Without include, a follow-up query per row multiplies database load as the dataset grows.",
                order: 2,
              },
              {
                title: "Aggregation with JavaScript Map",
                content:
                  "Grouping detail rows into per-entity summaries uses a Map — each entity ID maps to an accumulator object that tracks quantity and value. As each detail row is processed, its contribution is added to the appropriate entry:\n\nfor (const row of rows) {\n  const entry = map.get(row.entityId) || { totalQty: 0, totalValue: 0 };\n  entry.totalQty += row.qty;\n  entry.totalValue += row.qty * row.unitPrice;\n  map.set(row.entityId, entry);\n}\n\nA shipping manifest that groups packages by destination uses the same pattern — each destination accumulates weight and package count from every row that matches it. The fold happens entirely in memory after the database round-trip completes.",
                order: 3,
              },
              {
                title: "Sorting with Tiebreakers and Slicing",
                content:
                  "After aggregation, entries are sorted by the primary metric in descending order. When two entries tie, a secondary metric resolves the order deterministically. Without an explicit tiebreaker, the sort order depends on the runtime's internal iteration order, which can change between runs. A sports league table that sorts by points and breaks ties with goal difference follows this exact two-key pattern.\n\nFinally, `Array.prototype.slice(0, limit)` truncates the sorted array. Slicing happens after sorting — truncating earlier would omit entries that might rank higher than those already seen.",
                order: 4,
              },
              {
                title: "Practice Lab: Aggregate and Rank Leaderboard",
                content:
                  "Practice aggregating score entries by player, then ranking players by total score with an alphabetical tiebreaker.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Group entries by playerId, sum scores, then return players sorted by totalScore desc with playerId asc as tiebreaker. Limit to top 3.",
                  language: "javascript",
                  starter_code:
                    "function topPlayers(entries) {\n  // TODO\n}\n",
                  editable_regions: [
                    { placeholder: "// TODO", case_sensitive: true },
                  ],
                  entry_point: "topPlayers",
                  test_cases: [
                    { input: [[{ playerId: 'A', score: 10 }, { playerId: 'B', score: 20 }, { playerId: 'A', score: 5 }]], expected: [{ playerId: 'A', totalScore: 15 }, { playerId: 'B', totalScore: 20 }], label: "groups and sums, sorted desc" },
                    { input: [[{ playerId: 'X', score: 5 }, { playerId: 'Y', score: 5 }, { playerId: 'Z', score: 10 }]], expected: [{ playerId: 'Z', totalScore: 10 }, { playerId: 'X', totalScore: 5 }, { playerId: 'Y', totalScore: 5 }], label: "tiebreaker by playerId asc" },
                    { input: [[]], expected: [], label: "empty → empty array" },
                  ],
                },
                order: 5,
              },
              {
                title: "Key Takeaway",
                content:
                  "Query with `include` to avoid N+1. Fold rows into a Map keyed by entity ID for per-entity aggregation. Sort by primary metric descending with a deterministic tiebreaker. Slice after sorting — never before.",
                order: 6,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Ties on `unitsSold` need a deterministic tiebreaker.",
                order: 1,
              },
              {
                description:
                  "`include` the related product to carry its name on the result row.",
                order: 2,
              },
              {
                description:
                  "Slice to `limit` after sorting, not during the aggregation.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "`getTopSellingProducts` is exported as an async function from `src/app/actions/reports.ts`",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "The action queries Prisma via `orderItem.findMany({ include: { product: true } })`",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Rows are aggregated per `product_id` with summed `unitsSold` and `revenue`, and the related `product_name` is carried through",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Results are sorted by `unitsSold` desc with `revenue` desc as the tie-breaker, then sliced to `limit`",
                is_required: true,
                order: 4,
              },
            ],
          },
        },
      ],
    },
  },
];