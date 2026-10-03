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
                  "Next.js on Vercel deploys as a serverless application. API routes and server components run as on-demand functions that spin up per request, then spin down. There is no persistent server process running 24/7. This means the stack handles traffic bursts by scaling horizontally, but cold starts can occur when no function instance is warm. Prisma handles this via connection pooling in serverless environments — a Prisma Accelerator or a DB-side pooler manages the PostgreSQL connection pool across ephemeral function instances.\n\nIn the local development environment, Next.js runs a standard Node.js dev server — the serverless distinction only matters at deployment. Architecturally, the project has no server/ directory; backend logic lives in src/app/api/ as route handlers or in src/lib/actions/ as server actions.",
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
                  "Run these commands from the project root, in this order. First `pnpm install`. Then `pnpm exec prisma generate`. Then `pnpm exec prisma migrate deploy`. Then `pnpm exec tsx scripts/db-check.ts`.",
                order: 1,
              },
              {
                description:
                  "Each of those three `pnpm exec` commands has to finish with exit code 0. Check that `DATABASE_URL` in `.env` names a database that accepts connections.",
                order: 2,
              },
              {
                description:
                  "The `scripts/db-check.ts` script prints `DB_OK` and a `ROWS=<n>` value. A `ROWS=0` count fails. Run `pnpm prisma:seed` to insert the sample products, then run the script again.",
                order: 3,
              },
              {
                description:
                  "A `DB_CHECK_FAILED` message on stderr means a missing or wrong `DATABASE_URL`, an unapplied migration, or an empty `products` table.",
                order: 4,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Install all project dependencies.",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Generate the Prisma Client.",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Apply database migrations.",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Verify the database connection works.",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "Confirm sample data is loaded (database shows rows).",
                is_required: true,
                order: 5,
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
                  "Create src/lib/format.ts and export:\n\nexport function formatPeso(amount: number): string\n\nRules:\n  • Always prefix the peso symbol ₱.\n  • Always show exactly 2 decimal places.\n  • Round to the nearest centavo.\nOne stdlib call covers every case: `amount.toFixed(2)` pads whole numbers, keeps a single decimal, and rounds to the nearest centavo.",
                order: 3,
              },
              {
                title: "Wiring It Into the UI",
                content:
                  "Once formatPeso exists, replace ad-hoc `${price}` and `price.toFixed(2)` expressions in the POS and Inventory pages with `formatPeso(price)`. The goal is that every visible price on screen flows through the same helper.",
                order: 4,
              },
              {
                title: "Practice Lab: Format to 2 Decimals",
                content:
                  "Warm up by writing a tiny helper that formats a number to two decimal places before tackling the real formatter.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement formatTwoDecimals(amount) that takes a number and returns it\nas a string with exactly 2 decimal places.\n\nExamples:\n  formatTwoDecimals(1.5)    → \"1.50\"\n  formatTwoDecimals(3)      → \"3.00\"\n  formatTwoDecimals(1.234)  → \"1.23\"\n  formatTwoDecimals(0)      → \"0.00\"",
                  language: "javascript",
                  starter_code:
                    "export function formatTwoDecimals(amount) {\n  // TODO\n}\n",
                  editable_regions: [
                    { placeholder: "// TODO", case_sensitive: true },
                  ],
                  entry_point: "formatTwoDecimals",
                  test_cases: [
                    { input: [1.5], expected: "1.50", label: "rounds up and pads" },
                    { input: [3], expected: "3.00", label: "pads whole numbers" },
                    { input: [1.234], expected: "1.23", label: "truncates extra decimals" },
                    { input: [0], expected: "0.00", label: "handles zero" },
                  ],
                  hints: [
                    "The built-in method you need is called on a number and returns a string. Look at what the crashcourse just taught you about formatting prices.",
                    "Pattern: call .toFixed(2) on the amount. The argument is how many decimal places you want in the result.",
                    "return amount.toFixed(___) — what number goes in the parentheses to get exactly 2 decimal places?"
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
                  "Create `src/lib/format.ts` and export the function there as a named export, with the signature `export function formatPeso(amount: number): string`. A default export will not be found.",
                order: 1,
              },
              {
                description:
                  "`amount.toFixed(2)` handles every required case on its own. It pads whole numbers (5 gives \"5.00\"), keeps an existing single decimal (3.1 gives \"3.10\"), and rounds to the nearest centavo (9.999 gives \"10.00\", 2.345 gives \"2.35\").",
                order: 2,
              },
              {
                description:
                  "Put the peso sign directly in front of the fixed string with `return '₱' + amount.toFixed(2)`. The sign has to sit immediately before the first digit. `formatPeso(0)` returns `'₱0.00'` and `formatPeso(120)` returns `'₱120.00'`.",
                order: 3,
              },
              {
                description:
                  "Keep `src/lib/format.ts` free of side effects. Do not import React or `@/lib/prisma` into it. The file has to load on its own in a plain `node` environment with no DOM.",
                order: 4,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Export a formatPeso function as a named export.",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Every result carries the peso sign and shows exactly two decimal places: formatPeso(0) gives ₱0.00, formatPeso(5) gives ₱5.00, formatPeso(120) gives ₱120.00.",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Fractional amounts keep both decimals: formatPeso(3.1) gives ₱3.10 and formatPeso(95.5) gives ₱95.50.",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Amounts round to the nearest centavo: formatPeso(9.999) gives ₱10.00 and formatPeso(2.345) gives ₱2.35.",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "The module can be imported dynamically and formatPeso retrieved as a named export, so the function works in isolation.",
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
    id: "npp-pos-level-2",
    title: "Inventory Quality",
    subtitle:
      "Write two Prisma-backed server actions: one to classify stock, one to compute cart totals from DB prices.",
    order: 2,
    level_description:
      "Mission Briefing: Cashiers cannot tell at a glance which products are low on stock, and the cart summary recomputes totals inline using whatever price the client happens to send. Both must be replaced with server actions backed by Prisma so the database is the source of truth. The graders mock `@/lib/prisma`, so real Prisma queries are written — no DB calls execute during the test.",
    xp_reward: 150,
    coin_reward: 125,
    key_takeaways:
      "Server actions in the Next.js App Router are async functions exported from files under `src/lib/actions/`. They run on the server, can read `@/lib/prisma` directly, and are imported into client components just like any other function. Putting the stock-status rule and the cart math behind server actions means the client cannot disagree with the database.\n\nMoney math is unforgiving: round once at the end. Sum at full precision, then round the three outgoing fields. The empty-input case must be handled before Prisma is touched — querying for an empty `in` list is wasted work.",
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
                  "Server actions are async functions exported from files inside `src/lib/actions/`. They run only on the server, can import `@/lib/prisma` directly, and are called from client components like any other async function. They are the right home for any rule that has to agree with the database.",
                order: 1,
              },
              {
                title: "The getStockStatusForProduct Contract",
                content:
                  "Create `src/lib/actions/inventory.ts` and export:\n\nexport async function getStockStatusForProduct(productId: string): Promise<{\n  productId: string;\n  quantity: number;\n  status: 'OUT_OF_STOCK' | 'LOW_STOCK' | 'IN_STOCK';\n}>\n\nUse `prisma.product.findUnique({ where: { product_id: productId } })`. Throw when the product does not exist. Classify the quantity: `<= 0` → `OUT_OF_STOCK`, `1..5` → `LOW_STOCK`, `> 5` → `IN_STOCK`.",
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
                  "Add `getStockStatusForProduct` to `src/lib/actions/inventory.ts` as a named async export that looks the product up through `prisma.product.findUnique` and classifies the quantity that comes back. Use that one database method and nothing else.",
                order: 1,
              },
              {
                description:
                  "Call it as `prisma.product.findUnique({ where: { product_id: productId } })`, passing a single object. The column is `product_id`, not `id`.",
                order: 2,
              },
              {
                description:
                  "When `findUnique` gives you `null`, throw before building the result with `if (!product) throw new Error('Product not found')`. The action has to reject rather than return a status for a product that does not exist.",
                order: 3,
              },
              {
                description:
                  "The bands are `<= 0` → OUT_OF_STOCK, `1..5` → LOW_STOCK, `> 5` → IN_STOCK, so 5 is still low and 6 flips to in stock. Return the raw database quantity alongside the status, so a LOW_STOCK result carries the live value, and echo back the `productId` you were given.",
                order: 4,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Export a getStockStatusForProduct function from src/lib/actions/inventory.ts as an async server action.",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "The function calls prisma.product.findUnique with a single argument containing the product_id filter.",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "A quantity of 0 returns status OUT_OF_STOCK.",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "A quantity of 3 returns status LOW_STOCK with the live database value 3 in the quantity field.",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "A quantity of 42 returns status IN_STOCK. The bands are 0 or less for OUT_OF_STOCK, 1 to 5 for LOW_STOCK, and above 5 for IN_STOCK.",
                is_required: true,
                order: 5,
              },
              {
                description:
                  "When the product is not found and findUnique returns null, the action throws an error instead of returning a status.",
                is_required: true,
                order: 6,
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
                  "Create `src/lib/actions/cart.ts` and export:\n\nexport async function getCartTotals(input: {\n  items: { product_id: string; cartQuantity: number }[];\n  discountPercent?: number;\n}): Promise<{ subtotal: number; discount: number; total: number }>\n\nFetch prices via `prisma.product.findMany({ where: { product_id: { in: [...] } } })`. Compute `subtotal = Σ price × cartQuantity` using DB prices, `discount = subtotal × discountPercent / 100` (0 when not given), `total = subtotal − discount`. Round all three to 2 decimals.",
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
                  "Add `getCartTotals` to `src/lib/actions/cart.ts` as a named async export that reads prices with `prisma.product.findMany` and computes the three money values from those database prices. Use that one database method and nothing else.",
                order: 1,
              },
              {
                description:
                  "Collect every cart `product_id` into one array and pass it as the `in` filter, so the call is `{ where: { product_id: { in: [...ids] } } }` with the cart ids such as `p1` and `p2` in there. Looking products up one at a time is the pattern code reviewers reject.",
                order: 2,
              },
              {
                description:
                  "Handle the empty cart before any Prisma call: `if (items.length === 0) return { subtotal: 0, discount: 0, total: 0 }`. Touching the database with an empty id list fails, and a missing `discountPercent` counts as 0.",
                order: 3,
              },
              {
                description:
                  "Round only the three outgoing numbers, at the very end, with `Math.round(n * 100) / 100`. Three lines of `9.99` at `discountPercent: 15` come out as subtotal `29.97`, discount `4.5`, total `25.47`.",
                order: 4,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Export a getCartTotals function from src/lib/actions/cart.ts as an async server action.",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "The function calls prisma.product.findMany with a single argument containing an in filter with every cart product ID.",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "The subtotal is summed from database prices times cart quantities, never from prices the client sends. Prices of 100 times 2 and 50 times 3 give subtotal 350, discount 0, total 350.",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "A percentage discount applies to the subtotal. Prices of 100 times 2 with a 10% discount give subtotal 200, discount 20, total 180. Leaving out the discount gives a discount of 0.",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "An empty cart ({ items: [] }) gives back exactly { subtotal: 0, discount: 0, total: 0 } and does not depend on any database result.",
                is_required: true,
                order: 5,
              },
              {
                description:
                  "The three money values are rounded to two decimals. Prices p1: 9.99 × 3 with discountPercent: 15 give { subtotal: 29.97, discount: 4.5, total: 25.47 }.",
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
    id: "npp-pos-level-3",
    title: "Checkout Integrity",
    subtitle:
      "Render two React components — an errors banner and a live order summary.",
    order: 3,
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
                  "The banner is the default export of `src/components/CheckoutErrors.tsx` and takes an `errors` array of strings. Use `export default function CheckoutErrors({ errors })`, or default-export a named function.",
                order: 1,
              },
              {
                description:
                  "Branch on `errors.length === 0` and keep the two branches exclusive. The clean branch needs an element carrying `role=\"status\"` whose text matches `/ready to checkout/i`, so include the literal words \"Ready to checkout\".",
                order: 2,
              },
              {
                description:
                  "The error branch puts `role=\"alert\"` on a `<ul>` with exactly one `<li>` per message, so three errors means exactly three list items. Each message has to appear as its own text node.",
                order: 3,
              },
              {
                description:
                  "With any error present there must be no element with `role=\"status\"` anywhere on the page. Never render the confirmation banner alongside the alert.",
                order: 4,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "CheckoutErrors is the default export of src/components/CheckoutErrors.tsx. It takes an errors array of strings.",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "With an empty errors array, the page shows an element with role=\"status\" whose text matches 'ready to checkout'.",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "With three errors, the page shows an element with role=\"alert\" holding exactly 3 list items, one <li> per error.",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Each error message appears as its own text node. With errors=['p2 exceeds available stock'], the text matching 'p2 exceeds available stock' is on the page.",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "When at least one error exists, there is no element with role=\"status\" on the page. The confirmation banner never appears alongside the alert.",
                is_required: true,
                order: 5,
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
                  "The summary is the default export of `src/components/OrderSummary.tsx`. Use `export default function OrderSummary({ customerName, items, coupon })`.",
                order: 1,
              },
              {
                description:
                  "You need these `data-testid` values: `customer-name` (text = `customerName`), `order-item` (one per item), `order-total`, and `order-discount`.",
                order: 2,
              },
              {
                description:
                  "Each `order-item` row has to hold BOTH the product name and its own peso-formatted line subtotal. For `price: 100, cartQuantity: 2` the row text must contain `₱200.00`.",
                order: 3,
              },
              {
                description:
                  "The cart `[{100, 2}, {50, 1}]` sums to 250, so with no coupon `order-total` reads `₱250.00`. With `coupon={{ coupon_id: 'c1', code: 'SAVE20', discount_percent: 20 }}` the discount row reads `₱50.00` (20% of 250) and the total becomes `₱200.00`.",
                order: 4,
              },
              {
                description:
                  "Render `order-discount` ONLY when a coupon prop is supplied, wrapped in `{coupon && (...)}`, so nothing with that `data-testid` is on the page when no coupon is passed.",
                order: 5,
              },
              {
                description:
                  "Run every money value through `formatPeso` from Level 1. The required text has the `₱` prefix and exactly two decimals.",
                order: 6,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "OrderSummary is the default export of src/components/OrderSummary.tsx. It takes props customerName, items, and an optional coupon.",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "data-testid=\"customer-name\" shows the customer name. With customerName=\"Ada Lovelace\" its text is \"Ada Lovelace\".",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "There is one order-item row per cart item. The first row holds both the product name and that line's peso-formatted subtotal (e.g., ₱200.00 for price 100 × quantity 2).",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "With no coupon, data-testid=\"order-total\" contains ₱250.00 (the sum of line subtotals 200 + 50), and no order-discount element is on the page.",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "With coupon={{ coupon_id: 'c1', code: 'SAVE20', discount_percent: 20 }}, data-testid=\"order-discount\" contains ₱50.00 and data-testid=\"order-total\" becomes ₱200.00.",
                is_required: true,
                order: 5,
              },
              {
                description:
                  "Money values are formatted with the ₱ sign and exactly two decimals.",
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
    id: "npp-pos-level-4",
    title: "Coupons Feature Expansion",
    subtitle:
      "Add an expiry column, build a Coupon Input component, and pick the best valid coupon on the server.",
    order: 4,
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
                  "The coupon field is a controlled text input with an Apply button beside it, and it hands the normalized code to `onApply` instead of the raw text. Declare it as the default export of `src/components/CouponInput.tsx`.",
                order: 1,
              },
              {
                description:
                  "The Apply button's accessible name has to contain \"Apply\", so an icon-only button will not do.",
                order: 2,
              },
              {
                description:
                  "Derive `disabled` during render from the controlled value with `const isDisabled = value.trim().length === 0;`, then pass `disabled={isDisabled}`. The button has to be disabled on mount and stay disabled after typing only spaces.",
                order: 3,
              },
              {
                description:
                  "Normalize before emitting, in this order: trim, uppercase, remove internal whitespace. Typing `  save 10 ` and clicking Apply has to call `onApply` with exactly `'SAVE10'`.",
                order: 4,
              },
              {
                description:
                  "Clear the field after a successful apply by resetting the value state to `''` in the click handler. Leaving the old code in the box is the usual mistake.",
                order: 5,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "`CouponInput` is the default export of `src/components/CouponInput.tsx`, so `typeof mod.default === 'function'`. It takes an `onApply: (normalizedCode: string) => void` prop",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "It shows a textbox, conventionally with `coupon` in the placeholder, plus an Apply button whose accessible name contains \"Apply\"",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "On mount, with an empty input, the Apply button is disabled",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Typing `  save 10 ` and clicking Apply calls `onApply` with exactly `'SAVE10'`. The code is trimmed, uppercased, and internal whitespace removed",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "Typing only whitespace (`'   '`) leaves the Apply button disabled and `onApply` is never called",
                is_required: true,
                order: 5,
              },
              {
                description:
                  "After a successful apply the input value is reset to the empty string, so `input.value === ''`",
                is_required: true,
                order: 6,
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
                  "Do the schema change first. Add `expires_at DateTime?` to the Coupon model in `prisma/schema.prisma` and run `prisma migrate dev --name add_coupon_expires_at` before writing the action. The coupon rows carry an `expires_at` field, so the action has to read it.",
                order: 1,
              },
              {
                description:
                  "`applyBestCoupon(subtotal: number, now?: Date)` is the named export in the coupons action module, and the query it makes has to contain `is_active: true` in its `where` object.",
                order: 2,
              },
              {
                description:
                  "Default `now` to `new Date()` so production callers can omit it, and also accept an injected clock such as `2026-06-01T00:00:00Z`. Return `{ coupon, discount }` or `null`.",
                order: 3,
              },
              {
                description:
                  "Validity is a gate, not a tiebreaker. Drop coupons where `expires_at !== null && expires_at < now` BEFORE ranking, then pick the highest `discount_percent`. Return `null` when nothing qualifies, not an error and not an empty object.",
                order: 4,
              },
              {
                description:
                  "`discount` is the absolute amount off the subtotal: 25% of 200 is `50`, 10% of 200 is `20`.",
                order: 5,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Add an optional expires_at DateTime? field to the Coupon model in prisma/schema.prisma and run a Prisma migration.",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Export applyBestCoupon as a named async export from src/lib/actions/coupons.ts with the signature applyBestCoupon(subtotal: number, now?: Date). It returns { coupon, discount } or null.",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "The function calls prisma.coupon.findMany with a where object containing is_active: true so the active-coupon filter happens in the database.",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Among valid coupons the largest discount wins. For a subtotal of 200 with unexpired A10 (10%) and B25 (25%), the result has coupon.coupon_id === 'b' and discount === 50.",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "Expired coupons are discarded before ranking even when their percent is higher. With A10 (10%, expires_at: null) and D40 (40%, expires_at: 2026-05-01) against now = 2026-06-01, the result has coupon.coupon_id === 'a' and discount === 20.",
                is_required: true,
                order: 5,
              },
              {
                description:
                  "The result is null when there are no active coupons.",
                is_required: true,
                order: 6,
              },
              {
                description:
                  "The result is null when every active coupon is expired.",
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
    id: "npp-pos-level-5",
    title: "Sales Reporting",
    subtitle:
      "Build a Sales Summary component and a Top Selling server action, then surface both on /admin/reports.",
    order: 5,
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
                  "The card has to show total revenue, total discount, order count and average order value, each in its own labelled element carrying the `total-revenue`, `total-discount`, `order-count` and `average-order` hooks.",
                order: 1,
              },
              {
                description:
                  "The first three numbers are plain sums over the orders, and the average is the revenue total divided by the order count. All four come from one pass, so they can never disagree with each other.",
                order: 2,
              },
              {
                description:
                  "An empty order list has to render real zeros everywhere, including the average. Divide without a count check and the average shows `₱NaN`.",
                order: 3,
              },
              {
                description:
                  "Every money value comes from the peso formatter built in Level 1, with the `₱` sign and exactly two decimals, so 750 of revenue reads `₱750.00` and nothing reads `₱0.00` by accident.",
                order: 4,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Export SalesSummary as the default export of src/components/SalesSummary.tsx. It takes an orders prop of { total_amount: number; discount_amount: number }[].",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "For orders totalling 750 with 75 of discount across 3 orders, data-testid=\"total-revenue\" contains ₱750.00, data-testid=\"total-discount\" contains ₱75.00, and data-testid=\"order-count\" contains 3.",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "data-testid=\"average-order\" shows the average order value rounded to two decimals and formatted in pesos, so ₱250.00 for 750 across 3 orders.",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "With an empty orders array, total-revenue contains ₱0.00, total-discount contains ₱0.00, order-count contains 0, and average-order contains ₱0.00. The division is guarded, so no NaN or Infinity is rendered.",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "Money values go through formatPeso, with the ₱ sign and exactly two decimals.",
                is_required: true,
                order: 5,
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
                  "`getTopSellingProducts` has to return one entry per product carrying the product id, the product name, the units sold and the revenue, and nothing else. An extra property on an entry makes the result fail to match.",
                order: 1,
              },
              {
                description:
                  "Units and revenue are summed per product, so p1 with a quantity of 5 plus 1 and a subtotal of 600 plus 120 is 6 units and 720 of revenue.",
                order: 2,
              },
              {
                description:
                  "Every row has to arrive carrying its product, so the name is available without chasing each id down separately.",
                order: 3,
              },
              {
                description:
                  "Ties on units sold need a deterministic tiebreaker: units sold descending, then revenue descending, so with p2 and p3 both at 8 units p2 at 1200 outranks p3 at 760.",
                order: 4,
              },
              {
                description:
                  "The limit is applied after the ranking, never during the aggregation, and with no rows the result is an empty array rather than nothing at all.",
                order: 5,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Export getTopSellingProducts as a named async export from src/lib/actions/reports.ts with the signature getTopSellingProducts(limit: number). It returns { product_id: string; product_name: string; unitsSold: number; revenue: number }[].",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "The function calls prisma.orderItem.findMany with an include object that includes the related product, so the product name arrives on each row.",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Rows are aggregated per product_id. For p1 with rows (quantity 5, subtotal 600) and (quantity 1, subtotal 120), the entry is exactly { product_id: 'p1', product_name: 'Espresso', unitsSold: 6, revenue: 720 }, where unitsSold sums quantity and revenue sums subtotal.",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Results are sorted by unitsSold descending with revenue descending as the tie-breaker. For the sample rows the order is p2, p3, p1, since p2 and p3 both sold 8 units and p2 has the higher revenue of 1200 against 760.",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "The limit is respected: getTopSellingProducts(2) returns exactly 2 entries.",
                is_required: true,
                order: 5,
              },
              {
                description:
                  "When there are no items, the action returns an empty array [].",
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