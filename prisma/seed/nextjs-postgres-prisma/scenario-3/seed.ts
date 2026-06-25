export const scenarios = [
  {
    id: "nextjs-postgres-prisma-3",
    name: "Employee Time Tracking",
    description:
      "Build a time tracking manager dashboard where employees clock in/out, log their work hours, and request time off using Next.js, PostgreSQL, and Prisma.",
    difficulty: "expert",
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
                  ".env exists with a working DATABASE_URL",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Prisma migrations applied and seed data inserted",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "`pnpm dev` boots the dashboard on http://localhost:3000",
                is_required: true,
                order: 4,
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
                    "Implement formatHours(hours) that always returns one decimal place with an `h` suffix.",
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