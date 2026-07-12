export const scenarios = [
  {
    id: "nextjs-postgres-prisma-3",
    name: "Employee Time Tracking",
    description:
      "Build a time tracking manager dashboard where employees clock in/out, log their work hours, and request time off using Next.js, PostgreSQL, and Prisma.",
    difficulty: "expert",
    is_paywalled: true,
  },
];

export const levels = [
  {
    id: "npp-ett-level-1",
    title: "Getting Familiar with the Codebase",
    subtitle:
      "Set up the WorkPulse manager dashboard and add hour / currency formatters.",
    order: 1,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: A new full-stack developer has joined WorkPulse Inc. to work on the manager dashboard of the time-tracking product, built with Next.js, PostgreSQL, and Prisma. The first tasks are to get the dashboard running against a local database and add two formatting helpers so hour columns and payroll columns display consistently.",
    xp_reward: 100,
    coin_reward: 50,
    key_takeaways:
      "A Next.js + Prisma dashboard boots the same way every Next.js + Prisma project does. Knowing the recipe by heart — install, configure, migrate, seed, run — means less time debugging tooling and more time on the actual work.\n\nSmall formatters in src/lib/ replace ad-hoc `toFixed` calls scattered across the dashboard. One change to the format spec, one file to edit.",
    scenario_id: "nextjs-postgres-prisma-3",
    tasks: {
      create: [
        {
          task_name: "Prepare Development Environment",
          test_type: "both",
          user_story:
            "As a developer, I want to install the dashboard locally and point it at my own PostgreSQL database so that I can start working on tasks.",
          learning_sections: {
            create: [
              {
                title: "Overview\nBooting a Next.js + Prisma Dashboard",
                content:
                  "This section walks through getting a Next.js dashboard app running against a local PostgreSQL database. The flow is the same on every Next.js + Prisma project: install dependencies, configure environment variables, run migrations, seed sample data, then start the dev server.",
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
                  "A typical Next.js + Prisma project is structured like:\nproject/\n    ├── prisma/\n    │     ├── schema.prisma ← Employee, TimeEntry, TimeOffRequest, PayrollPeriod, PayrollRecord\n    │     └── seed.ts ← demo employees + entries + payroll\n    ├── src/\n    │     ├── app/ ← Next.js routes and pages (manager dashboard)\n    │     ├── app/api/ ← API routes (dashboard, time-off-requests)\n    │     └── lib/ ← shared helpers (new helpers are added here)\n    └── package.json ← scripts and dependencies\nKnowing where helpers live is half of being productive on a Next.js codebase.",
                order: 3,
              },
              {
                title: "Environment Variables",
                content:
                  'Prisma reads DATABASE_URL from a .env file at the project root. The format is:\nDATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"\nFor local Postgres on the default port it usually looks like:\nDATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/workpulse"\nThe .env file should never be committed. The repo\'s .gitignore already excludes it; .env.example is provided as a starting point.\n\nNote: Environment variables in this project are pre-configured.',
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
                  "pnpm prisma:seed runs prisma/seed.ts, which clears the relevant tables and inserts demo employees, time entries, time-off requests, and a closed payroll period with records. Then pnpm dev boots the Next.js dev server on http://localhost:3000 with hot module replacement — saving a file triggers an instant page update without a full refresh.",
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
                  "If `prisma migrate dev` fails on a fresh database, the Postgres user may not have CREATE privileges — fix the user or pre-create the database.",
                order: 1,
              },
              {
                description:
                  "The setup-check grader verifies that dependencies installed, the Prisma migrations ran, and the seed completed — all three should pass locally.",
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
                  "Prisma migrations applied and seed data inserted",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "`pnpm dev` boots the dashboard on http://localhost:3000",
                is_required: true,
                order: 3,
              },
            ],
          },
        },
        {
          task_name: "Add Hour and Currency Helpers",
          test_type: "both",
          user_story:
            "As a manager, I want every hour and dollar column on the dashboard to render the same way so that the numbers I read line up cleanly down the column.",
          learning_sections: {
            create: [
              {
                title: "Overview\nTwo Tiny Formatters",
                content:
                  "Two helpers in src/lib/format.ts — `formatHours` and `formatCurrency`. Together they cover every numeric column on the dashboard. Once they exist, every component imports them; no inline `toFixed` allowed.",
                order: 1,
              },
              {
                title: "The formatHours Contract",
                content:
                  "export function formatHours(hours: number): string\n\nAlways one decimal place and an `h` suffix.\n  • `8` → `\"8.0h\"`\n  • `40.5` → `\"40.5h\"`\n  • `0` → `\"0.0h\"`\nUse `.toFixed(1)` then append the `h` — that's the whole implementation.",
                order: 2,
              },
              {
                title: "The formatCurrency Contract",
                content:
                  "export function formatCurrency(amount: number): string\n\nPrefix `$`, exactly two decimals, comma thousands separators.\n  • `1234` → `\"$1,234.00\"`\n  • `0.5` → `\"$0.50\"`\n  • `1000000` → `\"$1,000,000.00\"`\n`Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })` provides thousands separators and 2-decimal padding for free; prepend `$` or use `style: 'currency', currency: 'USD'`.",
                order: 3,
              },
              {
                title: "Wiring Them Into the Dashboard",
                content:
                  "Replace inline `${hours.toFixed(1)}h` with `formatHours(hours)`, and any ad-hoc dollar formatting with `formatCurrency(amount)`. Every cell in the hours and payroll columns should now flow through the same two helpers.",
                order: 4,
              },
              {
                title: "Practice Lab: Format Hours",
                content:
                  "Try the one-decimal-plus-suffix pattern in isolation before writing it in the real file.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement formatHours(hours) that takes a number and returns a string\nwith exactly one decimal place followed by the letter \"h\".\n\nExamples:\n  formatHours(8)     → \"8.0h\"\n  formatHours(40.5)  → \"40.5h\"\n  formatHours(0)     → \"0.0h\"\n  formatHours(12.34) → \"12.3h\"",
                  language: "javascript",
                  starter_code:
                    "export function formatHours(hours) {\n  // TODO\n}\n",
                  editable_regions: [
                    { placeholder: "// TODO", case_sensitive: true },
                  ],
                  entry_point: "formatHours",
                  test_cases: [
                    { input: [8], expected: "8.0h", label: "whole number" },
                    { input: [40.5], expected: "40.5h", label: "half hour" },
                    { input: [0], expected: "0.0h", label: "zero" },
                    { input: [12.34], expected: "12.3h", label: "rounds to one decimal" },
                  ],
                  hints: [
                    "You need a method that formats a number to a fixed number of decimal places, then append the letter. Look at what the crashcourse just taught you.",
                    "The built-in method for fixed decimal places is called .toFixed(). Call it with the right argument, then add the suffix.",
                    "return hours.toFixed(___) + \"___\" — what precision and what suffix?"
                  ],
                },
                order: 5,
              },
              {
                title: "Key Takeaway",
                content:
                  "Formatters are the cheapest helper to write and the cheapest helper to forget. Put them in src/lib/ on day one to avoid `.toFixed(1)` scattered across twelve components later.",
                order: 6,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "For formatHours, `hours.toFixed(1) + 'h'` is the entire body — keep it that short.",
                order: 1,
              },
              {
                description:
                  "For formatCurrency, `Intl.NumberFormat` with `style: 'currency', currency: 'USD'` provides the `$` and the comma separators in one call.",
                order: 2,
              },
              {
                description:
                  "Search the dashboard for stray `.toFixed(` and replace each one with the right helper.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "`formatHours` and `formatCurrency` are exported from `src/lib/format.ts`",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "formatHours always shows one decimal place with a trailing `h`",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "formatCurrency renders `$`, two decimals, and comma thousands separators",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Both helpers are used in the dashboard's hour and payroll columns",
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
    id: "npp-ett-level-2",
    title: "Time Calculations",
    subtitle:
      "Two Prisma-backed server actions: employee clock state and a sum of completed hours.",
    order: 2,
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: The attendance table re-checks clock-in/out fields in every row, and the 'hours this week' total is computed on the client. Both must be moved behind server actions backed by Prisma so the dashboard agrees with the database. The graders mock `@/lib/prisma`, so real Prisma queries are written — no DB calls execute during the test.",
    xp_reward: 150,
    coin_reward: 125,
    key_takeaways:
      "Server actions in the App Router live under `src/app/actions/` and run only on the server. They can read `@/lib/prisma` directly and return typed shapes that client components consume like any other async function. Putting status and hour-sum logic behind them keeps every screen consistent with the source of truth.\n\nSumming durations: skip incomplete records explicitly, parse with `new Date(...)`, subtract, divide by 3_600_000, and round once at the end. Open entries (no `clock_out`) are excluded — they aren't payable hours yet.",
    scenario_id: "nextjs-postgres-prisma-3",
    tasks: {
      create: [
        {
          task_name: "Employee Status Server Action",
          test_type: "both",
          user_story:
            "As a manager, I want the server to authoritatively report whether each employee is clocked in, clocked out, or off so that the dashboard never disagrees with the timesheet.",
          learning_sections: {
            create: [
              {
                title: "Overview\nThree States, One Server Action",
                content:
                  "An employee row has exactly three states: `'clocked-in'`, `'clocked-out'`, `'off'`. The action reads the latest time entry from Prisma and returns the verdict. The dashboard just renders a badge driven by that string.",
                order: 1,
              },
              {
                title: "The getEmployeeStatusForId Contract",
                content:
                  "Create `src/app/actions/time.ts` and export:\n\nexport async function getEmployeeStatusForId(\n  employeeId: number,\n): Promise<'off' | 'clocked-in' | 'clocked-out'>\n\nUse `prisma.timeEntry.findFirst({ where: { employee_id: employeeId } })`. Apply the rules:\n  • `null` row → `'off'`.\n  • Row with no `clock_out` → `'clocked-in'`.\n  • Row with a `clock_out` → `'clocked-out'`.",
                order: 2,
              },
              {
                title: "Why findFirst",
                content:
                  "`findFirst` returns the first matching row (or null) without throwing. In real usage an `orderBy: { clock_in: 'desc' }` would be added to get the latest entry, but the grader's mock returns whichever row it wants — the task is to handle `null` and the two `clock_out` branches.",
                order: 3,
              },
              {
                title: "Null-First Narrowing",
                content:
                  "Check `entry == null` first so the rest of the function can treat `entry` as non-null. TypeScript's narrowing then allows `entry.clock_out` to be read without optionals, and the code reads as a flat three-way split.",
                order: 4,
              },
              {
                title: "Key Takeaway",
                content:
                  "A discriminated string union beats two booleans (`isClockedIn`, `isOff`) every time. One server action, one source of truth, one badge in the UI.",
                order: 5,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Use an early `if (!entry) return 'off';` so the remaining code can treat `entry` as non-null.",
                order: 1,
              },
              {
                description:
                  "`entry.clock_out == null` catches both `null` and `undefined` in one comparison.",
                order: 2,
              },
              {
                description:
                  "Don't parse the dates here — only the presence or absence of `clock_out` matters for status.",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "`getEmployeeStatusForId` is exported as an async function from `src/app/actions/time.ts`",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Uses `prisma.timeEntry.findFirst` keyed by `employee_id`",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Returns `'off'` when the row is null, `'clocked-in'` when `clock_out` is null, `'clocked-out'` otherwise",
                is_required: true,
                order: 3,
              },
            ],
          },
        },
        {
          task_name: "Sum Hours Server Action",
          test_type: "both",
          user_story:
            "As a manager, I want the server to sum each employee's completed shifts so that 'hours this week' always reflects what the timesheet table actually contains.",
          learning_sections: {
            create: [
              {
                title: "Overview\nSum Only What's Done",
                content:
                  "An open shift has no `clock_out`. Crediting the employee for 'now minus clock_in' on an open shift would inflate payroll on every page load. Skip open entries; sum only completed ones.",
                order: 1,
              },
              {
                title: "The sumHoursForEmployee Contract",
                content:
                  "Add to `src/app/actions/time.ts`:\n\nexport async function sumHoursForEmployee(employeeId: number): Promise<number>\n\nUse `prisma.timeEntry.findMany({ where: { employee_id: employeeId } })`. Sum the duration in hours of every entry with a `clock_out`. Ignore open entries. Round the total to 2 decimals. Empty result → `0`.",
                order: 2,
              },
              {
                title: "Parsing Dates and Dividing for Hours",
                content:
                  "`new Date(iso).getTime()` returns ms since epoch. `(clockOut - clockIn) / 3_600_000` gives the duration in hours. Wrapping in `new Date(...)` accepts whatever shape Prisma hands back — string or Date instance both work.",
                order: 3,
              },
              {
                title: "Round Once, At the End",
                content:
                  "Sum at full precision, then `Math.round(total * 100) / 100` once before returning. Rounding each entry individually accumulates a cent of error per row on long timesheets — exactly the kind of bug a payroll audit catches.",
                order: 4,
              },
              {
                title: "Key Takeaway",
                content:
                  "Skip the incomplete; sum the complete; round at the end. Three rules, every duration helper — now backed by Prisma.",
                order: 5,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "`entries.filter(e => e.clock_out != null)` isolates the completed rows; reduce over that filtered list.",
                order: 1,
              },
              {
                description:
                  "Divide by `3_600_000` (ms per hour) — the numeric separator makes the magic number readable.",
                order: 2,
              },
              {
                description:
                  "Empty array → return `0`. Don't return `undefined` or skip the return statement.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "`sumHoursForEmployee` is exported as an async function from `src/app/actions/time.ts`",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Uses `prisma.timeEntry.findMany` keyed by `employee_id`",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Ignores entries where `clock_out` is null",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Returns the total hours rounded to 2 decimals; empty input returns `0`",
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
    id: "npp-ett-level-3",
    title: "Time-Off Logic",
    subtitle:
      "Render two React components: a validated request form and a used/pending/remaining balance panel.",
    order: 3,
    deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: Employees need a request form that rejects bad inputs before they leave the page, and a balance panel that shows used / pending / remaining hours at a glance. Build two presentational React components, graded with `@testing-library/react` in jsdom.",
    xp_reward: 200,
    coin_reward: 200,
    key_takeaways:
      "Form components own three responsibilities at once: rendering inputs, validating on submit, and calling the callback only when valid. Keep validation logic in the submit handler so the form is a normal controlled-input pattern.\n\nA balance panel is a stack of three derived numbers. Compute them inside the component body and tag each with the `data-testid` the grader queries — used, pending, remaining add up to the same allowance every render because they all came from one pass.",
    scenario_id: "nextjs-postgres-prisma-3",
    tasks: {
      create: [
        {
          task_name: "Time-Off Request Form Component",
          test_type: "both",
          user_story:
            "As an employee, I want a request form that rejects backward dates and non-positive hours so that I can't accidentally submit a malformed request to HR.",
          learning_sections: {
            create: [
              {
                title: "Overview\nValidated Form Components with Submit-Time Validation",
                content:
                  "This section covers form components that validate input at submission time — comparing multiple fields together — and render an error message when validation fails. The pattern applies to request forms, checkout flows, search forms, and any interface where cross-field rules must be satisfied before the submission is accepted.",
                order: 1,
              },
              {
                title: "React Controlled Components",
                content:
                  "A controlled input stores its value in React state and updates via `onChange`. Every keystroke flows through the state variable, giving the component full authority over what the input displays. A hotel check-in kiosk that auto-formats a reservation number as the guest types requires controlled input because the displayed value differs from the raw keystrokes. The form state is owned by the component; the parent receives a clean payload only on successful submission.",
                order: 2,
              },
              {
                title: "Accessible Labels with htmlFor and id",
                content:
                  "Each input field is paired with a `<label>` element linked via the `htmlFor` attribute matching the input's `id`. This association ensures that clicking the label text focuses the corresponding input, and screen readers announce the label when the input is focused. Testing libraries use `getByLabelText` to locate inputs, which simultaneously validates the label-input pairing and finds the element.",
                order: 3,
              },
              {
                title: "Client-Side Validation",
                content:
                  "Validation runs in the submit handler before the `onSubmit` callback is called. Cross-field rules — such as end date must not precede start date — require both fields to be evaluated together. When validation fails, an error element appears with a `data-testid` attribute, and the callback is never invoked. The form state is preserved so the user can correct the input without losing data.",
                order: 4,
              },
              {
                title: "Practice Lab: Validate a Date Range Form",
                content:
                  "Practice implementing cross-field validation that checks a date range and returns either the payload or an error.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Return { valid: true, data: { start, end, days } } when end >= start and days > 0. Otherwise return { valid: false, error: 'Invalid input' }.",
                  language: "javascript",
                  starter_code:
                    "function validateRequest(start, end, days) {\n  // TODO\n}\n",
                  editable_regions: [
                    { placeholder: "// TODO", case_sensitive: true },
                  ],
                  entry_point: "validateRequest",
                  test_cases: [
                    { input: ['2025-06-01', '2025-06-05', 3], expected: { valid: true, data: { start: '2025-06-01', end: '2025-06-05', days: 3 } }, label: "valid range" },
                    { input: ['2025-06-05', '2025-06-01', 3], expected: { valid: false, error: 'Invalid input' }, label: "end before start" },
                    { input: ['2025-06-01', '2025-06-05', 0], expected: { valid: false, error: 'Invalid input' }, label: "zero days" },
                    { input: ['2025-06-01', '2025-06-01', 1], expected: { valid: true, data: { start: '2025-06-01', end: '2025-06-01', days: 1 } }, label: "same-day is valid" },
                  ],
                  hints: [
                    "You need to check two conditions at once — use the logical AND operator (&&). Both conditions must be true.",
                    "Check if end is at least start, AND days is greater than zero. If both pass, wrap the three inputs into a data object under valid: true. Otherwise return the error object.",
                    "if (end >= start && days > ___) return { valid: true, data: { start, end, days } }; return { valid: ___, error: \"Invalid input\" };"
                  ],
                },
                order: 5,
              },
              {
                title: "Key Takeaway",
                content:
                  "Validate on submit, not on every keystroke. Cross-field rules evaluate multiple inputs together. Pair labels with inputs via `htmlFor`/`id` for accessibility. The callback fires only when validation passes — the form state is preserved for correction when it fails.",
                order: 6,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Use `<label htmlFor=\"...\">` paired with `id` so `getByLabelText` finds each input.",
                order: 1,
              },
              {
                description:
                  "Valid = `end_date >= start_date` AND `hours > 0`. Invalid → render `data-testid=\"form-error\"` and don't call `onSubmit`.",
                order: 2,
              },
              {
                description:
                  "The Type select must offer `vacation` / `sick` / `personal` / `unpaid` as lowercase option values.",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "`TimeOffRequestForm` is the default export of `src/components/TimeOffRequestForm.tsx`",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Renders labelled \"Start date\", \"End date\", \"Hours\" inputs and a \"Type\" select with `vacation` / `sick` / `personal` / `unpaid`",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Submitting valid input calls `onSubmit` with the typed request payload",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Submitting invalid input (`end_date < start_date` OR `hours <= 0`) does NOT call `onSubmit` and renders `data-testid=\"form-error\"`",
                is_required: true,
                order: 4,
              },
            ],
          },
        },
        {
          task_name: "Time-Off Balance Component",
          test_type: "both",
          user_story:
            "As an employee, I want a panel that shows my used, pending, and remaining time-off hours so that I can plan the rest of the year without phoning HR.",
          learning_sections: {
            create: [
              {
                title: "Overview\nDerived Balance Panels with Filtered Aggregation",
                content:
                  "This section covers components that receive a dataset and an allowance, then derive three values — used, pending, and remaining — from the same input. The pattern applies to time-off balances, budget trackers, credit systems, and any view where an allowance is consumed by filtered subsets of records.",
                order: 1,
              },
              {
                title: "Derived State from Props",
                content:
                  "Derived state is computed directly from props during render rather than being stored in component state or refs. A bank account summary that computes available balance from posted transactions follows this pattern — the balance is a function of the transactions, never an independent variable. Deriving values from props guarantees they are always consistent with the input data: used, pending, and remaining are all computed from the same requests array in one pass.",
                order: 2,
              },
              {
                title: "Filtered Aggregation by Status",
                content:
                  "The used total sums only approved records of qualifying types. A construction budget tracker that sums only approved expenses — excluding pending and denied — uses the same approach. Filtering first, then reducing, produces a clear, auditable aggregation:\n\nconst approved = requests.filter(r => r.status === 'APPROVED' && r.category !== 'EXCLUDED');\nconst used = approved.reduce((sum, r) => sum + r.amount, 0);\n\nPending items are summed separately and do not reduce the remaining balance. The remaining formula is `allowance - used` — pending does not appear in the subtraction.",
                order: 3,
              },
              {
                title: "Testing with data-testid",
                content:
                  "Each derived value occupies a dedicated DOM element with a `data-testid` attribute. A test can assert `used-hours` equals a specific number by querying that element directly, without navigating sibling relationships or CSS selectors. All values are computed from the same input in one pass, guaranteeing they add up consistently.",
                order: 4,
              },
              {
                title: "Practice Lab: Filter and Sum by Status",
                content:
                  "Practice filtering records by status and type, then computing used and pending totals separately.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Return { used, pending, remaining } where used sums approved + non-unpaid, pending sums pending, remaining = allowance - used.",
                  language: "javascript",
                  starter_code:
                    "function computeBalance(requests, allowance) {\n  // requests: [{ status, type, hours }]\n  // TODO\n}\n",
                  editable_regions: [
                    { placeholder: "// TODO", case_sensitive: true },
                  ],
                  entry_point: "computeBalance",
                  test_cases: [
                    { input: [[{ status: 'APPROVED', type: 'VACATION', hours: 8 }, { status: 'PENDING', type: 'SICK', hours: 4 }, { status: 'APPROVED', type: 'UNPAID', hours: 8 }], 40], expected: { used: 8, pending: 4, remaining: 32 }, label: "unpaid excluded from used, pending separate" },
                    { input: [[], 40], expected: { used: 0, pending: 0, remaining: 40 }, label: "empty → full allowance remaining" },
                    { input: [[{ status: 'APPROVED', type: 'VACATION', hours: 20 }, { status: 'APPROVED', type: 'SICK', hours: 20 }], 40], expected: { used: 40, pending: 0, remaining: 0 }, label: "all used up" },
                  ],
                  hints: [
                    "Use .filter() twice — once for used (approved, not unpaid) and once for pending. Then .reduce() each filtered list to sum the hours.",
                    "For used: keep items where status is APPROVED AND type is NOT UNPAID. For pending: keep items where status is PENDING. remaining is allowance minus used.",
                    "const used = requests.filter(r => r.status === \"APPROVED\" && r.type !== \"___\").reduce((s, r) => s + r.hours, 0);\nconst pending = requests.filter(r => r.___ === \"___\").reduce((s, r) => s + r.hours, 0);\nreturn { used, pending, remaining: ___ - used };"
                  ],
                },
                order: 5,
              },
              {
                title: "Key Takeaway",
                content:
                  "Filter by status and category before summing. Keep pending separate — it does not reduce the remaining balance. Compute all derived values from the same input in one pass to guarantee internal consistency.",
                order: 6,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Required `data-testid`s: `used-hours`, `pending-hours`, `remaining-hours`.",
                order: 1,
              },
              {
                description:
                  "`used` sums approved, non-unpaid requests only — unpaid leave never reduces the allowance.",
                order: 2,
              },
              {
                description:
                  "`remaining = allowance − used`; pending doesn't subtract until it's approved.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "`TimeOffBalance` is the default export of `src/components/TimeOffBalance.tsx`",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "`used-hours` sums approved, non-unpaid request hours",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "`pending-hours` sums pending request hours",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "`remaining-hours` equals `allowance − used`",
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
    id: "npp-ett-level-4",
    title: "Payroll Computation",
    subtitle:
      "Render an Hours Breakdown component and a Prisma-backed Gross Pay server action.",
    order: 4,
    deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: Payroll currently mixes hours-display logic and pay computation in a single 60-line server function with no tests. Split it into one presentational React component (Hours Breakdown) and one Prisma-backed server action (Gross Pay). The dashboard composes them; each is graded independently.",
    xp_reward: 250,
    coin_reward: 300,
    key_takeaways:
      "Default parameters in React props let one component cover both standard and configured cases (`threshold?: number`). Callers that don't care get the default; callers with overrides get the override. No second component needed.\n\nMultiplication-and-round is the payroll pattern: full precision through the arithmetic, single round at the boundary where the number becomes money. On the server, fetch the rate from Prisma so the dashboard can't pass an inflated value.",
    scenario_id: "nextjs-postgres-prisma-3",
    tasks: {
      create: [
        {
          task_name: "Hours Breakdown Component",
          test_type: "both",
          user_story:
            "As a payroll clerk, I want a row that visibly splits each employee's hours into regular and overtime so that I can audit the threshold at a glance.",
          learning_sections: {
            create: [
              {
                title: "Overview\nThreshold-Based Split Components with Default Parameters",
                content:
                  "This section covers components that divide a total into two buckets — regular and overtime — at a configurable threshold. Default prop values allow the threshold to be overridden without defining a second component. The pattern applies to billing tiers, tax brackets, usage limits, and any threshold-based allocation.",
                order: 1,
              },
              {
                title: "Clamping with Math.min and Math.max",
                content:
                  "Regular hours are the portion of total hours below the threshold, computed as `Math.min(totalHours, threshold)`. This caps the regular bucket at the threshold even when total hours exceed it. Overtime hours are the portion above the threshold, computed as `Math.max(0, totalHours - threshold)`. The `Math.max` clamping prevents negative overtime when total hours are below the threshold. A utility billing system that splits usage into a base tier and a premium tier uses the same min/max pattern — the base tier is capped at the allowance, and the remainder flows into the premium tier.",
                order: 2,
              },
              {
                title: "Default Parameters in React Props",
                content:
                  "Destructuring with default values lets a component accept an optional prop that falls back to a standard value when omitted:\n\nfunction Breakdown({ totalHours, threshold = 40 }) {\n  ...\n}\n\nA shipping calculator that defaults to a standard box size unless the caller passes a custom dimension uses the same pattern. One component handles both cases — standard and configured — without conditional logic or component variants.",
                order: 3,
              },
              {
                title: "Guaranteeing the Split Adds Up",
                content:
                  "The invariant `regular + overtime === totalHours` holds for all non-negative inputs regardless of the threshold. This is guaranteed by the math: `Math.min(h, t) + Math.max(0, h - t) = h` for any `h ≥ 0` and `t > 0`. A payroll auditor can trust that the split never misrepresents, drops, or duplicates hours.",
                order: 4,
              },
              {
                title: "Practice Lab: Split at a Threshold",
                content:
                  "Practice splitting a total into regular (≤ threshold) and overtime (> threshold) portions.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Return { regular, overtime } where regular ≤ threshold and overtime = total - regular. Threshold defaults to 40.",
                  language: "javascript",
                  starter_code:
                    "function splitHours(total, threshold = 40) {\n  // TODO\n}\n",
                  editable_regions: [
                    { placeholder: "// TODO", case_sensitive: true },
                  ],
                  entry_point: "splitHours",
                  test_cases: [
                    { input: [35], expected: { regular: 35, overtime: 0 }, label: "below threshold → no overtime" },
                    { input: [45], expected: { regular: 40, overtime: 5 }, label: "above threshold → overtime present" },
                    { input: [50, 35], expected: { regular: 35, overtime: 15 }, label: "custom threshold overrides default" },
                  ],
                  hints: [
                    "Use Math.min to find regular hours (capped at threshold) and subtract from total for overtime.",
                    "regular = Math.min(total, threshold) — this picks the smaller of the two. overtime is whatever is left: total minus regular.",
                    "const regular = Math.min(total, ___);\nreturn { regular, overtime: total - ___ };"
                  ],
                },
                order: 5,
              },
              {
                title: "Key Takeaway",
                content:
                  "Default prop values via destructuring let one component serve multiple thresholds. Clamp minimum with `Math.min` and maximum floor with `Math.max`. The split invariant — regular plus overtime always equals the input — is mathematically guaranteed.",
                order: 6,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "`threshold` defaults to `40`; use destructuring `{ totalHours, threshold = 40 }`.",
                order: 1,
              },
              {
                description:
                  "Overtime must clamp at 0 when total hours fall below the threshold.",
                order: 2,
              },
              {
                description:
                  "Test ids: `regular-hours`, `overtime-hours`.",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "`HoursBreakdown` is the default export of `src/components/HoursBreakdown.tsx`",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "`data-testid=\"regular-hours\"` shows `Math.min(totalHours, threshold)` with `threshold` defaulting to `40`",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "`data-testid=\"overtime-hours\"` shows `Math.max(0, totalHours - threshold)`",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Passing an explicit `threshold` overrides the default",
                is_required: true,
                order: 4,
              },
            ],
          },
        },
        {
          task_name: "Gross Pay Server Action",
          test_type: "both",
          user_story:
            "As a payroll clerk, I want the server to compute gross pay using the employee's stored hourly rate so that the dashboard can't accidentally pay a different rate than the database says.",
          learning_sections: {
            create: [
              {
                title: "Overview\nServer-Side Payroll Computation with Database-Sourced Rates",
                content:
                  "This section covers server actions that fetch a rate from the database and compute a monetary result. The rate lives in the database — the client sends only hours. The pattern applies to payroll, billing engines, pricing systems, and any computation where the database owns the multiplier.",
                order: 1,
              },
              {
                title: "Fetching with Prisma findUnique",
                content:
                  "`findUnique` retrieves a single record by its primary key. It is the correct choice when the caller has the exact identifier — an employee ID, an order number, or an account code. `findUnique` returns `null` when no record matches, which the action handles with an explicit error rather than silently returning zero.",
                order: 2,
              },
              {
                title: "Overtime Pay Calculation",
                content:
                  "The standard overtime rate in many jurisdictions is 1.5× the regular hourly rate — commonly called 'time and a half.' The formula is:\n\nconst grossPay = regular × rate + overtime × rate × 1.5;\n\nThe multiplication happens at full precision; rounding is deferred to a single `Math.round(pay * 100) / 100` at the end. Rounding intermediate values introduces cumulative floating-point error. This is the payroll standard: compute with full precision, round once at the boundary where the number becomes money.",
                order: 3,
              },
              {
                title: "Error Handling for Missing Data",
                content:
                  "When the database returns no employee record or the employee has no `hourly_rate`, the action throws an error with `throw new Error(...)`. Returning zero would be indistinguishable from a genuine zero-pay scenario and could result in an underpayment without detection. The caller catches the error and renders an appropriate message, keeping the error path separate from the success path.",
                order: 4,
              },
              {
                title: "Practice Lab: Compute Gross Pay from Rate",
                content:
                  "Practice computing gross pay using regular hours, overtime hours, and an hourly rate with a 1.5× overtime multiplier.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Compute gross pay: regular × rate + overtime × rate × 1.5. Round result to 2 decimals. Return null if rate is missing.",
                  language: "javascript",
                  starter_code:
                    "function computeGrossPay(regular, overtime, rate) {\n  // TODO\n}\n",
                  editable_regions: [
                    { placeholder: "// TODO", case_sensitive: true },
                  ],
                  entry_point: "computeGrossPay",
                  test_cases: [
                    { input: [40, 5, 20], expected: 950, label: "40 regular + 5 overtime at $20/hr" },
                    { input: [40, 0, 15], expected: 600, label: "no overtime" },
                    { input: [40, 10, null], expected: null, label: "missing rate → null" },
                  ],
                  hints: [
                    "Check rate first — if it's null, return null immediately. Otherwise compute regular and overtime pay, sum them, and round.",
                    "Overtime pay uses 1.5× the rate. Round the final result with Math.round(pay * 100) / 100 for 2 decimal places.",
                    "if (rate === null) return ___;\nconst raw = regular * rate + overtime * rate * ___;\nreturn Math.round(raw * ___) / 100;"
                  ],
                },
                order: 5,
              },
              {
                title: "Key Takeaway",
                content:
                  "The rate lives in the database; the client sends only hours. Compute overtime at 1.5×. Round once at the end. Throw on missing data — zero is never a safe default for payroll computations.",
                order: 6,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "The Employee primary key is `id`, not `employee_id`.",
                order: 1,
              },
              {
                description:
                  "Missing employee or missing `hourly_rate` must throw, not return 0.",
                order: 2,
              },
              {
                description:
                  "Round after summing both products, not per product.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "`computeGrossPayForEmployee` is exported as an async function from `src/app/actions/payroll.ts`",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Reads `hourly_rate` via `prisma.employee.findUnique` keyed by `id`",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Throws when the employee is missing or has no `hourly_rate`",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Returns `regular × rate + overtime × rate × 1.5`, rounded to 2 decimals",
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
    id: "npp-ett-level-5",
    title: "Payroll Reporting",
    subtitle:
      "Render a Payroll Summary component and a Department Report server action.",
    order: 5,
    deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: Leadership wants a 'Department Report' view on the payroll tab with two pieces — a presentational summary card (totals + averages) and a Prisma-backed leaderboard that groups payroll records by department. The summary is a React component; the report is a server action that joins `payrollRecord` with `employee` and groups by a derived department key.",
    xp_reward: 300,
    coin_reward: 400,
    key_takeaways:
      "Mixed reporting levels split the work cleanly: presentational components total what's already on the page, server actions join Prisma models and aggregate. The component never queries; the action never renders.\n\nGrouping by a derived key (department from first name) is a function that runs as rows are folded into a `Map`. Defining the name→department mapping inside the action keeps the source of truth next to the consumer.",
    scenario_id: "nextjs-postgres-prisma-3",
    tasks: {
      create: [
        {
          task_name: "Payroll Summary Component",
          test_type: "both",
          user_story:
            "As a manager, I want one summary card showing total regular, overtime, total hours, total gross, and average gross so that I can sign off the payroll period at a glance.",
          learning_sections: {
            create: [
              {
                title: "Overview\nMulti-Aggregate Summary Cards with Safe Averages",
                content:
                  "This section covers components that receive an array of records, derive several aggregates — sums, combined totals, and averages — and display each in a labelled slot. The pattern applies to payroll summaries, expense reports, budget dashboards, and any view that compresses raw rows into summary figures with a per-row average.",
                order: 1,
              },
              {
                title: "Average Computation with Division Guard",
                content:
                  "The average gross pay is total gross divided by the record count. When the array is empty, division by zero produces `Infinity` or `NaN`. A restaurant tip-pooling calculator that divides tips among staff must handle the case where no staff worked a shift — the average is zero, not `NaN`. The guard is:\n\nconst avg = records.length === 0 ? 0 : total / records.length;\n\nApplying the guard once, immediately after the sums are computed, guarantees every consumer of the average value receives a valid number.",
                order: 2,
              },
              {
                title: "Reusing Shared Formatting Helpers",
                content:
                  "All monetary aggregates flow through the same `formatCurrency` helper used by other components. A corporate payroll dashboard that reuses the same dollar formatter across employee detail rows, department summaries, and the executive overview guarantees visual consistency. The component passes raw numbers to the formatter and renders the returned string — it never concatenates `$` directly.",
                order: 3,
              },
              {
                title: "Practice Lab: Compute Payroll Summary with Safe Average",
                content:
                  "Practice computing total hours, total pay, and average pay from an array of records, handling the empty case safely.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Return { totalHours, totalPay, averagePay } from an array of { hours, pay } records. averagePay is 0 when records is empty.",
                  language: "javascript",
                  starter_code:
                    "function payrollSummary(records) {\n  // TODO\n}\n",
                  editable_regions: [
                    { placeholder: "// TODO", case_sensitive: true },
                  ],
                  entry_point: "payrollSummary",
                  test_cases: [
                    { input: [[{ hours: 40, pay: 800 }, { hours: 30, pay: 600 }]], expected: { totalHours: 70, totalPay: 1400, averagePay: 700 }, label: "two records" },
                    { input: [[]], expected: { totalHours: 0, totalPay: 0, averagePay: 0 }, label: "empty → all zeroes" },
                    { input: [[{ hours: 20, pay: 500 }]], expected: { totalHours: 20, totalPay: 500, averagePay: 500 }, label: "single record" },
                  ],
                  hints: [
                    "Use .reduce() to accumulate totalHours and totalPay in a single pass. Guard the division so empty arrays produce 0 average.",
                    "Protect against dividing by zero: if records.length is 0, averagePay must be 0 not NaN. Otherwise divide totalPay by records.length.",
                    "const totalHours = records.reduce((s, r) => s + r.___, 0);\nconst totalPay = records.reduce((s, r) => s + r.___, 0);\nconst averagePay = records.length === 0 ? ___ : totalPay / records.length;"
                  ],
                },
                order: 4,
              },
              {
                title: "Key Takeaway",
                content:
                  "Accumulate sums in one pass. Guard the average with a count check so empty input produces zero rather than `NaN`. Delegate all formatting to the shared currency helper for visual consistency across every view.",
                order: 5,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Empty `records` must surface `$0.00` for the average, not `NaN`.",
                order: 1,
              },
              {
                description:
                  "Dollar fields go through `formatCurrency`.",
                order: 2,
              },
              {
                description:
                  "Five test ids — see the acceptance criteria.",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "`PayrollSummary` is the default export of `src/components/PayrollSummary.tsx`",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "`total-regular`, `total-overtime`, and `total-hours` are correct sums",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "`total-gross` and `average-gross` are dollar-formatted via `formatCurrency`; `average-gross` is `$0.00` (not `NaN`) on empty records",
                is_required: true,
                order: 3,
              },
            ],
          },
        },
        {
          task_name: "Department Report Server Action",
          test_type: "both",
          user_story:
            "As a manager, I want a server-side per-department report (headcount, total hours, total gross) so that I can compare departments at a glance without trusting client-side joins.",
          learning_sections: {
            create: [
              {
                title: "Overview\nGrouping by a Derived Key with Distinct Counting",
                content:
                  "This section covers server actions that join models via `include`, group rows by a derived category key, and produce per-category aggregates including distinct entity counts. The pattern applies to departmental reports, regional breakdowns, team dashboards, and any grouping where the category is computed from a field rather than stored directly.",
                order: 1,
              },
              {
                title: "Prisma Eager Loading with include",
                content:
                  "`include` fetches related records in the same query, avoiding N+1. `prisma.detail.findMany({ include: { parent: true } })` returns detail rows with their parent entities pre-populated in one database round-trip. Without include, a follow-up query per row to fetch parent names multiplies database load.",
                order: 2,
              },
              {
                title: "Distinct Counting with JavaScript Set",
                content:
                  "A `Set` stores only unique values — adding the same value twice has no effect. For headcount reporting, each department bucket maintains a Set of employee identifiers:\n\nemployees.add(record.employee.id);\nconst headcount = employees.size;\n\nA volunteer registration system that counts unique volunteers per event uses the same pattern. The headcount is `Set.size`, not the number of detail rows. A single employee with multiple rows contributes exactly one to the headcount.",
                order: 3,
              },
              {
                title: "Grouping Values with a Map and Sorting",
                content:
                  "Rows are folded into a Map keyed by department name. Each entry accumulates total hours, total gross pay, and a Set of employee IDs. After all rows are processed, the Map is converted to an array and sorted alphabetically by department name using `Array.prototype.sort` with `localeCompare`. Alphabetical sorting is deterministic — the same departments always appear in the same order.",
                order: 4,
              },
              {
                title: "Practice Lab: Group and Count Distinctly",
                content:
                  "Practice grouping records by a derived category and counting distinct contributors per category.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Group entries by dept (derived from name: first 2 chars). Return { dept, totalAmount, distinctNames } sorted by dept asc.",
                  language: "javascript",
                  starter_code:
                    "function groupByDept(entries) {\n  // entries: [{ name, amount }]\n  // dept = name.slice(0, 2)\n  // TODO\n}\n",
                  editable_regions: [
                    { placeholder: "// TODO", case_sensitive: true },
                  ],
                  entry_point: "groupByDept",
                  test_cases: [
                    { input: [[{ name: 'Alice', amount: 100 }, { name: 'Alvin', amount: 50 }, { name: 'Bob', amount: 200 }]], expected: [{ dept: 'Al', totalAmount: 150, distinctNames: 2 }, { dept: 'Bo', totalAmount: 200, distinctNames: 1 }], label: "two departments, distinct counting" },
                    { input: [[{ name: 'Al', amount: 10 }, { name: 'Al', amount: 20 }]], expected: [{ dept: 'Al', totalAmount: 30, distinctNames: 1 }], label: "same name twice → distinct count 1" },
                    { input: [[]], expected: [], label: "empty → empty array" },
                  ],
                  hints: [
                    "Use a Map keyed by department (name.slice(0, 2)). For each entry, accumulate totalAmount and track distinct names using a Set.",
                    "For each entry, compute dept. If the Map already has this dept, add to totalAmount and add name to the Set. If not, create a new entry. At the end, convert Map values to an array and sort by dept.",
                    "const map = new Map();\nentries.forEach(e => {\n  const dept = e.name.slice(0, ___);\n  if (!map.has(dept)) map.set(dept, { totalAmount: 0, names: new Set() });\n  const g = map.get(dept);\n  g.totalAmount += e.___;\n  g.names.add(e.name);\n});\nreturn [...map.entries()].map(([dept, g]) => ({ dept, totalAmount: g.totalAmount, distinctNames: g.names.size })).sort((a, b) => a.dept.localeCompare(b.dept));"
                  ],
                },
                order: 5,
              },
              {
                title: "Key Takeaway",
                content:
                  "Query with `include` to avoid N+1. Derive the category key inside the action. Use a `Set` for distinct counting. Fold rows into a Map, then sort alphabetically at the end for deterministic output.",
                order: 6,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Department is derived from first name; the mapping is in the acceptance criteria.",
                order: 1,
              },
              {
                description:
                  "`headcount` is distinct employees — a `Set` handles this cleanly.",
                order: 2,
              },
              {
                description:
                  "Sort alphabetically at the end.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "`getDepartmentReport` is exported as an async function from `src/app/actions/reports.ts`",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Uses `prisma.payrollRecord.findMany({ include: { employee: true } })`",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Department mapping matches the spec: Sarah/Robert → Engineering, Michael → Design, Emily → Marketing, James → Sales, else → HR",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Per-department `headcount` counts distinct employees; `totalHours` and `totalGross` are correct sums; departments are sorted alphabetically",
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