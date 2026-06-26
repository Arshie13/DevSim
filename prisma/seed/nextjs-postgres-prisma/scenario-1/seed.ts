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
                  "pnpm prisma:migrate (an alias for `prisma migrate dev`) does two jobs:\n  1. Reads prisma/schema.prisma and applies any pending SQL migrations to the database.\n  2. Regenerates the Prisma Client (the typed API imported as `prisma`) so it matches the schema.\nWhen schema.prisma is changed, this command should be re-run — migrations keep every developer's DB in lockstep.",
                order: 5,
              },
              {
                title: "Seeding and Running the Dev Server",
                content:
                  "pnpm prisma:seed runs prisma/seed.ts, which clears the relevant tables and inserts sample products, coupons, and orders. Then pnpm dev boots the Next.js dev server on http://localhost:3000 with hot module replacement — saving a file triggers an instant page update without a full refresh.",
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
                  ".env exists at the project root with a working DATABASE_URL pointing at a local PostgreSQL instance",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Prisma migrations applied and seed data inserted (`pnpm prisma:migrate` and `pnpm prisma:seed` succeed)",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "`pnpm dev` boots the app on http://localhost:3000 without errors",
                is_required: true,
                order: 4,
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