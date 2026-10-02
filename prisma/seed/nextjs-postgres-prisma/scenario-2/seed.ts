export const scenarios = [
  {
    id: "nextjs-postgres-prisma-2",
    name: "Gym Member Portal",
    description:
      "Build a member portal for a fitness gym chain that lets members view their membership details, book classes, and check their attendance history using Next.js, PostgreSQL, and Prisma.",
    difficulty: "expert",
  },
];

export const levels = [
  {
    id: "npp-gym-level-1",
    title: "Getting Familiar with the Codebase",
    subtitle:
      "Set up the FitTech member portal and add member-name / short-date formatters.",
    order: 1,
    level_description:
      "Mission Briefing: A new full-stack developer has joined FitTech Systems. The team maintains a member portal built with Next.js, PostgreSQL, and Prisma where members view their membership, book classes, and check attendance. The first tasks are to get the portal running against a local database and add two small formatting helpers so the header and membership card display data consistently.",
    xp_reward: 100,
    coin_reward: 50,
    key_takeaways:
      "A Next.js + Prisma portal starts the same way every project does: install deps, point DATABASE_URL at a local DB, run migrations, seed sample data, start the dev server. Knowing the recipe by heart means setup stops being an obstacle and becomes routine.\n\nFormatting helpers belong in src/lib/ as small pure functions. A shared formatMemberName / formatShortDate means the portal header, the membership card, and every future feature display names and dates the exact same way.",
    scenario_id: "nextjs-postgres-prisma-2",
    tasks: {
      create: [
        {
          task_name: "Prepare Development Environment",
          test_type: "both",
          user_story:
            "As a developer, I want to install the member portal locally and connect it to my own PostgreSQL database so that I can start working on tasks.",
          learning_sections: {
            create: [
              {
                title: "Overview\nBooting a Next.js + Prisma Portal",
                content:
                  "This section walks through getting a Next.js portal app running against a local PostgreSQL database. The flow is the same on every Next.js + Prisma project: install dependencies, configure environment variables, run migrations, seed sample data, then start the dev server.",
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
                  "A typical Next.js + Prisma project is structured like:\nproject/\n    ├── prisma/\n    │     ├── schema.prisma ← User, Membership, Class, Booking, Attendance\n    │     └── seed.ts ← demo members + classes\n    ├── src/\n    │     ├── app/portal/ ← portal pages and React components\n    │     ├── app/api/ ← Next.js API routes (classes, bookings)\n    │     └── lib/ ← shared helpers (new helpers are added here)\n    └── package.json ← scripts and dependencies\nKnowing where helpers live is half of being productive on a Next.js codebase.",
                order: 3,
              },
              {
                title: "Environment Variables",
                content:
                  'Prisma reads DATABASE_URL from a .env file at the project root. The format is:\nDATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"\nFor local Postgres on the default port it usually looks like:\nDATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/gym_portal"\nThe .env file should never be committed. The repo\'s .gitignore already excludes it; .env.example is provided as a starting point.\n\nNote: Environment variables in this project are pre-configured.',
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
                  "pnpm prisma:seed runs prisma/seed.ts, which clears the relevant tables and inserts a demo member, memberships, classes, and attendance records. Then pnpm dev boots the Next.js dev server on http://localhost:3000 with hot module replacement — saving a file triggers an instant page update without a full refresh.",
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
                  "Run `pnpm install` at the project root. A `node_modules` directory then sits at the root holding both the `next` package and the `@prisma/client` package.",
                order: 1,
              },
              {
                description:
                  "Next run `pnpm exec prisma generate`. It reads `prisma/schema.prisma`, rebuilds the typed Prisma Client, and has to finish with exit code `0`.",
                order: 2,
              },
              {
                description:
                  "Then run `pnpm exec prisma migrate deploy` so every pending migration is applied to the database named in `DATABASE_URL`, and confirm it finishes with exit code `0`.",
                order: 3,
              },
              {
                description:
                  "Then run `pnpm exec tsx scripts/db-check.ts` and confirm it finishes with exit code `0` and prints `DB_OK`.",
                order: 4,
              },
              {
                description:
                  "The `scripts/db-check.ts` output also carries a `ROWS=<n>` value where `n` is greater than `0`. That is how you confirm the database really holds seeded rows. If the count is `0`, run `pnpm prisma:seed` and then run the script again.",
                order: 5,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Install all dependencies at the project root.",
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
                  "Verify database connectivity (prints DB_OK).",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "The database check output shows a ROWS count greater than 0.",
                is_required: true,
                order: 5,
              },
            ],
          },
        },
        {
          task_name: "Add Member Name and Short Date Helpers",
          test_type: "both",
          user_story:
            "As a member, I want my name and dates to render consistently on the portal so that the header and membership card always look right regardless of whether middle parts are missing.",
          learning_sections: {
            create: [
              {
                title: "Overview\nTwo Small Helpers, One File",
                content:
                  "Two helpers in src/lib/format.ts — one for names, one for dates. Both pure, both exported. Centralizing these means every component on the portal renders the same data the same way.",
                order: 1,
              },
              {
                title: "The formatMemberName Contract",
                content:
                  "export function formatMemberName(first: string, last: string): string\n\nTrim each part, then join with a single space. If a part is empty, do not leave stray whitespace. Examples:\n  • formatMemberName(' Jordan ', 'Rivera') → 'Jordan Rivera'\n  • formatMemberName('', 'Rivera') → 'Rivera'\n  • formatMemberName('Jordan', '') → 'Jordan'",
                order: 2,
              },
              {
                title: "The formatShortDate Contract",
                content:
                  "export function formatShortDate(date: string | Date): string\n\nReturn the date as `YYYY-MM-DD`. Accept both ISO strings and Date instances; coerce the string with `new Date(...)` first. Use `toISOString().slice(0, 10)` for the format — it's deterministic across time zones because we want the calendar date, not the wall-clock one.",
                order: 3,
              },
              {
                title: "Wiring Them Into the UI",
                content:
                  "Replace any `${user.first_name} ${user.last_name}` template-literal with `formatMemberName(user.first_name, user.last_name)`, and any inline `new Date(d).toLocaleDateString()` with `formatShortDate(d)`. The portal header and the membership-details card are the two obvious call sites.",
                order: 4,
              },
              {
                title: "Practice Lab: Format First Name",
                content:
                  "Try the trim behaviour before writing the real formatter.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement formatFirstName(first) that takes a string and returns it with\nleading and trailing whitespace removed.\n\nExamples:\n  formatFirstName(\"Jordan\")        → \"Jordan\"\n  formatFirstName(\"  Jordan  \")    → \"Jordan\"\n  formatFirstName(\"\\tJordan \")     → \"Jordan\"\n  formatFirstName(\"\")              → \"\"",
                  language: "javascript",
                  starter_code:
                    "export function formatFirstName(first) {\n  // TODO\n}\n",
                  editable_regions: [
                    { placeholder: "// TODO", case_sensitive: true },
                  ],
                  entry_point: "formatFirstName",
                  test_cases: [
                    { input: ["Jordan"], expected: "Jordan", label: "no whitespace" },
                    { input: ["  Jordan  "], expected: "Jordan", label: "trims spaces" },
                    { input: ["\tJordan "], expected: "Jordan", label: "trims tabs" },
                    { input: [""], expected: "", label: "empty string" },
                  ],
                  hints: [
                    "There's a built-in string method that removes whitespace from both ends. Think about what the crashcourse just taught you about cleaning up input.",
                    "The method is called .trim(). Call it on the input string — it handles spaces, tabs, and newlines.",
                    "return first.___() — what string method removes leading and trailing whitespace?"
                  ],
                },
                order: 5,
              },
              {
                title: "Key Takeaway",
                content:
                  "Even one-line helpers deserve a home in src/lib/. Two call sites today is six call sites by next quarter — start centralized.",
                order: 6,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Create `src/lib/format.ts` and export `formatMemberName` there as a named export, with the signature `export function formatMemberName(first: string, last: string): string`.",
                order: 1,
              },
              {
                description:
                  "Add `formatShortDate` to that same `src/lib/format.ts` file, also as a named export, with the signature `export function formatShortDate(date: string | Date): string`. Both helpers belong in the one file so the portal has a single formatting home.",
                order: 2,
              },
              {
                description:
                  "Inside `formatMemberName`, trim each part before joining. `formatMemberName('Jordan', 'Rivera')` returns `'Jordan Rivera'` and `formatMemberName('  Jordan ', ' Rivera  ')` also returns `'Jordan Rivera'`.",
                order: 3,
              },
              {
                description:
                  "Drop an empty part instead of joining it. `formatMemberName('Jordan', '')` returns `'Jordan'` and `formatMemberName('', 'Rivera')` returns `'Rivera'`, both with no leading or trailing space.",
                order: 4,
              },
              {
                description:
                  "Inside `formatShortDate`, coerce the input first with `new Date(date)`, then return `date.toISOString().slice(0, 10)`. `formatShortDate('2025-03-08T00:00:00Z')` returns `'2025-03-08'`.",
                order: 5,
              },
              {
                description:
                  "The same body handles a `Date` instance, because `new Date(dateInstance)` still yields a valid date. `formatShortDate(new Date('2025-12-25T09:30:00Z'))` returns `'2025-12-25'`.",
                order: 6,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Create a format file and export a formatMemberName function.",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Create a format file and export a formatShortDate function.",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "formatMemberName trims each part and joins them with a single space, so 'Jordan' plus 'Rivera' gives 'Jordan Rivera'.",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "An empty part leaves no stray whitespace. When either part is an empty string, formatMemberName returns the present part alone.",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "formatShortDate turns an ISO timestamp string into YYYY-MM-DD. '2025-03-08T00:00:00Z' gives '2025-03-08'.",
                is_required: true,
                order: 5,
              },
              {
                description:
                  "formatShortDate also accepts a Date instance and gives the same YYYY-MM-DD form. new Date('2025-12-25T09:30:00Z') gives '2025-12-25'.",
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
    id: "npp-gym-level-2",
    title: "Membership Logic",
    subtitle:
      "Two Prisma-backed server actions: membership status and days-until-expiry.",
    order: 2,
    level_description:
      "Mission Briefing: The portal needs an authoritative membership badge and an 'expires in N days' line. Today both are computed on the client from whichever fields the API happened to return. Both must be moved behind server actions backed by Prisma so the database is the source of truth. The graders mock `@/lib/prisma`, so real Prisma queries are written — no DB calls execute during the test.",
    xp_reward: 150,
    coin_reward: 125,
    key_takeaways:
      "Server actions in the App Router are async functions exported from `src/lib/actions/`. They run only on the server and can read `@/lib/prisma` directly. Putting the membership rules behind one means every screen — badge, booking guard, future analytics — agrees on the answer.\n\nTake `now: Date` as an optional parameter (`now?: Date`) defaulting to `new Date()`. Production callers pass nothing; tests inject a fixed clock. Same input, same output, every time.",
    scenario_id: "nextjs-postgres-prisma-2",
    tasks: {
      create: [
        {
          task_name: "Membership Status Server Action",
          test_type: "both",
          user_story:
            "As a member, I want the server to authoritatively report whether my membership is active, expired, or otherwise inactive so that every screen agrees on the badge.",
          learning_sections: {
            create: [
              {
                title: "Overview\nThree States, One Server Action",
                content:
                  "The membership card has exactly three states: `'active'`, `'expired'`, `'inactive'`. Encode them as a string literal union returned by an async server action. The action queries Prisma once and the UI just renders the result.",
                order: 1,
              },
              {
                title: "The getMembershipStatusForUser Contract",
                content:
                  "Create `src/lib/actions/membership.ts` and export:\n\nexport async function getMembershipStatusForUser(\n  userId: string,\n  now?: Date,\n): Promise<'active' | 'expired' | 'inactive'>\n\nUse `prisma.membership.findFirst({ where: { user_id: userId } })`. Default `now` to `new Date()`. Apply the rules in order:\n  • `now > end_date` → `'expired'`.\n  • Otherwise `status === 'active'` and `now >= start_date` → `'active'`.\n  • Anything else (including no membership) → `'inactive'`.",
                order: 2,
              },
              {
                title: "Take Now as a Parameter",
                content:
                  "Reading the wall clock inside the action makes it impossible to test deterministically. Take `now?: Date` as an optional argument, default to `new Date()`. The grader injects a fixed clock; production callers pass nothing.",
                order: 3,
              },
              {
                title: "The Order of the Checks Matters",
                content:
                  "Run the expired check first: an expired-but-active membership is still expired. Only then check the active branch. The 'not yet started' case (now < start_date) falls through to `'inactive'` — a future-dated membership shouldn't be marketed as currently active.",
                order: 4,
              },
              {
                title: "Key Takeaway",
                content:
                  "Server actions that take time as a parameter are the recipe for trustworthy date logic. The action never lies about what 'now' was when it answered, and the DB is the only source of truth for the dates.",
                order: 5,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Create `src/lib/actions/membership.ts` and export `getMembershipStatusForUser` there as a named async export that reads the membership through `prisma.membership.findFirst`. Get the client as `import { prisma } from '@/lib/prisma'`.",
                order: 1,
              },
              {
                description:
                  "`prisma.membership.findFirst` gives `null` when the member has no membership row at all. Return `'inactive'` in that case.",
                order: 2,
              },
              {
                description:
                  "Pass the id through unchanged inside a `where` object, so the filter is `{ user_id: userId }`.",
                order: 3,
              },
              {
                description:
                  "Prisma can hand `start_date` and `end_date` back as strings, so wrap each in `new Date(...)` before comparing it with `now`. Check expiry first: `now > end_date` is `'expired'` even when the stored `status` is still `'active'`.",
                order: 4,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Create src/lib/actions/membership.ts and export an async getMembershipStatusForUser(userId, now?) function.",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "The function reads the membership with prisma.membership.findFirst using a filter containing where: { user_id: userId }.",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "A membership with status 'active' whose date range covers now returns 'active'.",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "A membership whose end_date is already in the past returns 'expired', even when its status is still 'active'.",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "A status other than 'active', such as 'frozen', returns 'inactive' even while the membership is inside its date range.",
                is_required: true,
                order: 5,
              },
              {
                description:
                  "A member with no membership row at all returns 'inactive'.",
                is_required: true,
                order: 6,
              },
            ],
          },
        },
        {
          task_name: "Days Until Expiry Server Action",
          test_type: "both",
          user_story:
            "As a member, I want the server to tell me how many days are left on my membership so that I can decide when to renew.",
          learning_sections: {
            create: [
              {
                title: "Overview\nWhole-Day Math, on the Server",
                content:
                  "A second server action on the same file. It reads the membership's `end_date` from Prisma and returns the floored whole-day diff against `now`. Negative values mean the membership has already expired; `null` means there is no membership at all.",
                order: 1,
              },
              {
                title: "The getDaysUntilExpiry Contract",
                content:
                  "Add to `src/lib/actions/membership.ts`:\n\nexport async function getDaysUntilExpiry(\n  userId: string,\n  now?: Date,\n): Promise<number | null>\n\nLook up the user's membership end_date via Prisma. Return whole days between `now` and `end_date`, floored.\n  • `0` on the expiry day itself.\n  • Negative once expired (`-1` the day after, etc).\n  • `null` when no membership exists for the user.",
                order: 2,
              },
              {
                title: "Floor the Difference, Don't Round",
                content:
                  "Compute `(endDate - now) / 86_400_000` and apply `Math.floor`. Rounding would produce '1 day' on a 0.6-day diff — wrong both in human terms and per the spec. Flooring matches the natural 'how many full days remain' reading.",
                order: 3,
              },
              {
                title: "Null vs Zero",
                content:
                  "The grader distinguishes between `null` (no membership row exists) and `0` (today is the expiry day). Don't conflate them — `findFirst` returning `null` is a different story from a real row with `end_date === now`.",
                order: 4,
              },
              {
                title: "Key Takeaway",
                content:
                  "Pure math + an explicit `now` + a single Prisma read is enough to make the action testable, deterministic, and authoritative. The UI never reaches around it.",
                order: 5,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Add `getDaysUntilExpiry` to that same `src/lib/actions/membership.ts` file, so both actions are exported from one module.",
                order: 1,
              },
              {
                description:
                  "Floor the difference. Compute `end.getTime() - now.getTime()`, divide by `86_400_000`, then apply `Math.floor`. A 3.5 day gap gives `3`, never `4`.",
                order: 2,
              },
              {
                description:
                  "Allow negatives, because a membership that ended two days ago has to report `-2` rather than `0` and rather than an error.",
                order: 3,
              },
              {
                description:
                  "Return `null` exactly when `findFirst` returns `null`, and never substitute `0` for missing data. On the expiry day itself a real row must yield `0`.",
                order: 4,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Create a membership file and export a getDaysUntilExpiry function.",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "The function reads the membership with prisma.membership.findFirst using a filter containing where: { user_id: userId }.",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "An end_date three days after now resolves to 3.",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "A partial day is floored, not rounded: an end_date 3.5 days after now still resolves to 3.",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "An end_date exactly equal to now resolves to 0.",
                is_required: true,
                order: 5,
              },
              {
                description:
                  "An end_date two days in the past resolves to the negative number -2.",
                is_required: true,
                order: 6,
              },
              {
                description:
                  "When findFirst resolves null (no membership for the user), the function resolves null.",
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
    id: "npp-gym-level-3",
    title: "Class Capacity",
    subtitle:
      "Render two React components: a clamped spots indicator and a smart booking button.",
    order: 3,
    level_description:
      "Mission Briefing: Members see negative 'spots left' counters on popular classes and the Book button stays clickable after they've already booked. Replace the ad-hoc inline math with two presentational React components — a `<ClassSpotsIndicator />` and a `<BookingButton />` — graded with `@testing-library/react` in jsdom.",
    xp_reward: 200,
    coin_reward: 200,
    key_takeaways:
      "Presentational components map props to ARIA roles and `data-testid` hooks. The markup should be anchored on the hooks the grader queries; styling is flexible around them.\n\nWhen a UI element has more than two states (default / disabled-A / disabled-B / ...), the priority should be encoded as a chain of `if` checks rather than overlapping booleans. The order of the checks is part of the spec — the comments should match.",
    scenario_id: "nextjs-postgres-prisma-2",
    tasks: {
      create: [
        {
          task_name: "Class Spots Indicator Component",
          test_type: "both",
          user_story:
            "As a member, I want each class card to show how many spots are left and a 'Class Full' badge when none remain so that I don't waste time tapping a class I can't join.",
          learning_sections: {
            create: [
              {
                title: "Overview\nClamped Counters and Conditional Badges",
                content:
                  "This section covers components that display a derived count alongside a conditional badge that appears when the count hits a threshold. The pattern applies to inventory indicators, capacity displays, seat availability counters, and any UI that shows remaining quantity with a visual warning at zero.",
                order: 1,
              },
              {
                title: "Clamping with Math.max",
                content:
                  "A remaining count is computed by subtracting occupancy from capacity. When subtraction yields a negative number — more bookings than capacity — `Math.max(0, difference)` clamps the display to zero. A hotel booking system uses this same pattern: displaying '-3 rooms available' is incorrect and confusing. Clamping ensures the counter never shows a negative value. The calculation is deterministic: given the same inputs it always produces the same output, making it safe to recompute on every render.",
                order: 2,
              },
              {
                title: "Conditional Badge Visibility with React Conditional Rendering",
                content:
                  "The 'at capacity' badge renders only when occupancy matches or exceeds capacity. The logical AND `&&` operator evaluates the condition once: `{occupancy >= capacity && <Badge />}`. When the condition is false, React renders nothing and the badge DOM node does not exist. A parking garage sign that displays 'FULL' only when every space is occupied works identically — the sign is either present or absent, never display:none.",
                order: 3,
              },
              {
                title: "Default Exports",
                content:
                  "A default export is the primary value a module exports — the value callers receive when importing without curly braces. Each module has at most one default export, matching the convention that a component file exports one main component. Graders import the default export, so the component must be declared as `export default function`.",
                order: 4,
              },
              {
                title: "Practice Lab: Clamp and Conditionally Badge",
                content:
                  "Practice computing remaining spots and conditionally adding a full badge.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Return { spotsLeft, badge } where spotsLeft is clamped to 0 and badge is 'FULL' when booked >= capacity, otherwise null.",
                  language: "javascript",
                  starter_code:
                    "function getSpotDisplay(capacity, booked) {\n  // TODO\n}\n",
                  editable_regions: [
                    { placeholder: "// TODO", case_sensitive: true },
                  ],
                  entry_point: "getSpotDisplay",
                  test_cases: [
                    { input: [10, 4], expected: { spotsLeft: 6, badge: null }, label: "capacity > booked, no badge" },
                    { input: [10, 10], expected: { spotsLeft: 0, badge: "FULL" }, label: "full → badge shown" },
                    { input: [10, 12], expected: { spotsLeft: 0, badge: "FULL" }, label: "overbooked → clamped to 0, badge shown" },
                  ],
                },
                order: 5,
              },
              {
                title: "Key Takeaway",
                content:
                  "Clamp the displayed count with `Math.max` so negative values never appear. Show the badge conditionally — the DOM node exists only when the threshold is met. The default export convention makes the component testable by grading tools.",
                order: 6,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "`src/components/ClassSpotsIndicator.tsx` default-exports a component taking `capacity` and `booked`. Every render has to include an element carrying the `data-testid=\"spots-left\"` hook.",
                order: 1,
              },
              {
                description:
                  "Clamp the remaining count at zero. `capacity={10}` with `booked={14}` shows `0` and never `-4`, while `capacity={15}` with `booked={4}` shows `11`.",
                order: 2,
              },
              {
                description:
                  "The `data-testid=\"full-badge\"` element appears only at capacity. With `capacity={15}` and `booked={14}` no such element may exist on the page, while `booked={15}` and `booked={16}` both show it, with text containing \"full\".",
                order: 3,
              },
              {
                description:
                  "Declare it as `export default function ClassSpotsIndicator(...)`, since the module is loaded through its default export.",
                order: 4,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Create src/components/ClassSpotsIndicator.tsx with a default export that is a function accepting capacity and booked props.",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "With capacity={15} and booked={4}, the element with data-testid=\"spots-left\" shows 11.",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "With capacity={10} and booked={14}, data-testid=\"spots-left\" shows 0 — the remaining count is clamped and never negative.",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "With capacity={15} and booked={14}, no element with data-testid=\"full-badge\" exists in the document.",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "With capacity={15} and booked={15}, an element with data-testid=\"full-badge\" exists and its text contains \"full\" (case-insensitive).",
                is_required: true,
                order: 5,
              },
              {
                description:
                  "With capacity={15} and booked={16}, an element with data-testid=\"full-badge\" is still present.",
                is_required: true,
                order: 6,
              },
            ],
          },
        },
        {
          task_name: "Booking Button Component",
          test_type: "both",
          user_story:
            "As a member, I want the Book button to say why it's disabled (\"Already booked\" or \"Class full\") so that I know whether to wait or pick a different class.",
          learning_sections: {
            create: [
              {
                title: "Overview\nMulti-State Buttons with Priority-Ranked Conditions",
                content:
                  "This section covers button components that render one of several visual states based on an ordered chain of conditions. When multiple conditions can be true simultaneously — someone can have already applied AND the resource can be full — the order of checks determines which label and disabled state appear. The pattern applies to any action button that explains why it is unavailable.",
                order: 1,
              },
              {
                title: "Logical AND for Conditional Rendering",
                content:
                  "The `&&` operator short-circuits: when the left side is falsy, the right side never evaluates and nothing renders. This is the standard pattern for conditionally emitting JSX. A concert seat selector that shows a 'Reserved' label only when a seat is already taken uses `{isReserved && <ReservedLabel />}` — the label element exists in the DOM only when the condition is met.",
                order: 2,
              },
              {
                title: "The Disabled Attribute",
                content:
                  "The HTML `disabled` attribute prevents user interaction with a form element. A disabled button cannot be clicked, focused, or submitted. Assistive technology announces the disabled state. The attribute is a boolean that is either present or absent — there is no 'partially disabled' state. The button's click handler is attached only when disabled is false; an enabled button with a handler that returns early is unreliable because focus and keyboard events are not suppressed.",
                order: 3,
              },
              {
                title: "Priority-Based Condition Chains",
                content:
                  "When a button has more than two possible states, conditions are checked in priority order rather than as independent booleans. The first matching condition wins. A museum ticket kiosk illustrates the priority: if a visitor already holds a ticket for a time slot, it shows 'Already Reserved' regardless of whether the slot is sold out. The user-specific condition takes priority over the resource-wide condition because it answers the most relevant question: 'Why can't *I* proceed?' rather than 'Why can't *anyone* proceed?'\n\nif (alreadyBooked) {\n  label = 'Already reserved';\n  disabled = true;\n} else if (atCapacity) {\n  label = 'Sold out';\n  disabled = true;\n} else {\n  label = 'Reserve';\n  disabled = false;\n}",
                order: 4,
              },
              {
                title: "Practice Lab: Multi-State Button Logic",
                content:
                  "Practice implementing a button label and disabled state based on priority-ordered conditions.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Return { label, disabled } where: alreadyOwned → 'Owned'/true, soldOut → 'Sold Out'/true, else → 'Buy'/false. Note: alreadyOwned > soldOut priority.",
                  language: "javascript",
                  starter_code:
                    "function getButtonState(alreadyOwned, soldOut) {\n  // TODO\n}\n",
                  editable_regions: [
                    { placeholder: "// TODO", case_sensitive: true },
                  ],
                  entry_point: "getButtonState",
                  test_cases: [
                    { input: [false, false], expected: { label: "Buy", disabled: false }, label: "neither → enabled Buy" },
                    { input: [false, true], expected: { label: "Sold Out", disabled: true }, label: "sold out → disabled Sold Out" },
                    { input: [true, true], expected: { label: "Owned", disabled: true }, label: "alreadyOwned wins over soldOut" },
                    { input: [true, false], expected: { label: "Owned", disabled: true }, label: "alreadyOwned alone" },
                  ],
                },
                order: 5,
              },
              {
                title: "Key Takeaway",
                content:
                  "Check conditions in priority order, not as independent booleans. User-specific states win over resource-wide states. The disabled attribute blocks all interaction — the click handler is attached only when the button is enabled.",
                order: 6,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "`src/components/BookingButton.tsx` default-exports a real `<button>` taking `classId`, `capacity`, `booked`, `userBookedClassIds` and `onBook`.",
                order: 1,
              },
              {
                description:
                  "The states run in priority order: already booked gives a disabled button reading \"Already booked\", then full gives a disabled button reading \"Class full\", otherwise the button is enabled and reads \"Book\".",
                order: 2,
              },
              {
                description:
                  "The already-booked branch wins when the class is also full, so with both conditions true the text still matches \"already booked\".",
                order: 3,
              },
              {
                description:
                  "The default label is exactly \"Book\" with no extra text, because the whole text content of the button is compared as one string.",
                order: 4,
              },
              {
                description:
                  "Wire the click so `onBook` fires exactly once with the `classId` prop when the enabled button is clicked.",
                order: 5,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Create src/components/BookingButton.tsx with a default export that is a function accepting classId, capacity, booked, userBookedClassIds, and onBook props.",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "When classId is absent from userBookedClassIds and seats remain, the button element is enabled and its full text is exactly \"Book\".",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "When classId is present in userBookedClassIds, the button is disabled and its text contains \"already booked\" (case-insensitive).",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "When classId is not in userBookedClassIds and booked is at least capacity, the button is disabled and its text contains \"class full\" (case-insensitive).",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "When classId is in userBookedClassIds and booked is at least capacity, the button text contains \"already booked\" — the already-booked state wins.",
                is_required: true,
                order: 5,
              },
              {
                description:
                  "Clicking the enabled button calls onBook exactly once with the classId prop as its argument.",
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
    id: "npp-gym-level-4",
    title: "Booking Aggregation",
    subtitle:
      "Render a Bookings-By-Class list (client) and a month-bucketed attendance server action.",
    order: 4,
    level_description:
      "Mission Briefing: Studio managers want a Class Insights panel that shows bookings per class and a Member Insights panel that shows attendance bucketed by month. Build one presentational component for the per-class list and one Prisma-backed server action for the monthly attendance aggregation.",
    xp_reward: 250,
    coin_reward: 300,
    key_takeaways:
      "Mixed levels keep aggregation in the right home: per-page lists that already have the data render in a component, while cross-record analytics that need fresh DB reads live in a server action.\n\nBucketing by `YYYY-MM` makes month-over-month comparisons stable. `toISOString().slice(0, 7)` is the canonical recipe — globally consistent and lexicographically chronological.",
    scenario_id: "nextjs-postgres-prisma-2",
    tasks: {
      create: [
        {
          task_name: "Bookings By Class List Component",
          test_type: "both",
          user_story:
            "As a studio manager, I want a per-class list of booking counts so that I can spot which sessions are growing and which are stagnant.",
          learning_sections: {
            create: [
              {
                title: "Overview\nGrouping Flat Arrays into Counted Summaries",
                content:
                  "This section covers components that receive a flat array of records, group them by category, count occurrences per category, and render a sorted list. The pattern applies to booking dashboards, tag clouds, category breakdowns, and any view that transforms raw event rows into per-category tallies.",
                order: 1,
              },
              {
                title: "Grouping with JavaScript Map",
                content:
                  "A Map stores key-value pairs where keys can be any type — strings, numbers, or objects — and iteration order matches insertion order. For grouping flat rows into per-category counts, the category identifier serves as the key and a running total as the value:\n\nconst counts = new Map();\nfor (const row of input) {\n  counts.set(row.category, (counts.get(row.category) || 0) + 1);\n}\n\nA vote-tallying system that groups ballots by candidate uses the same approach — the Map accumulates per-candidate totals as ballots are processed. After the loop, the Map holds one entry per distinct category with its total count.",
                order: 2,
              },
              {
                title: "Sorting by Category Identifier",
                content:
                  "The grouped entries are sorted by the category identifier (ID, name, or code) in ascending order. Sorting by identifier rather than by count produces a stable, predictable list — the order depends on what the entity is called, not on how many times it appeared. `Array.prototype.sort` accepts a comparator function that returns a negative, zero, or positive number based on the desired order.",
                order: 3,
              },
              {
                title: "Empty State Design",
                content:
                  "When the input array is empty, the component renders an empty-state message rather than an empty list container. A blank list looks like a loading state or rendering error; an explicit message like 'No bookings yet' communicates that data is absent for a valid reason. The empty state is tagged with a test ID so automated tests can confirm the component handles this case correctly.",
                order: 4,
              },
              {
                title: "Practice Lab: Group and Sort Category Counts",
                content:
                  "Practice grouping records by category, counting them, and returning entries sorted by category ascending.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Count records per category. Return array sorted by category asc: [{ category, count }]. Empty input → [].",
                  language: "javascript",
                  starter_code:
                    "function countByCategory(records) {\n  // TODO\n}\n",
                  editable_regions: [
                    { placeholder: "// TODO", case_sensitive: true },
                  ],
                  entry_point: "countByCategory",
                  test_cases: [
                    { input: [[{ cat: 'A' }, { cat: 'B' }, { cat: 'A' }]], expected: [{ cat: 'A', count: 2 }, { cat: 'B', count: 1 }], label: "groups and sorts ascending" },
                    { input: [[{ cat: 'Z' }, { cat: 'A' }]], expected: [{ cat: 'A', count: 1 }, { cat: 'Z', count: 1 }], label: "sorts by category, not count" },
                    { input: [[]], expected: [], label: "empty → empty array" },
                  ],
                },
                order: 5,
              },
              {
                title: "Key Takeaway",
                content:
                  "Fold a flat array into a Map keyed by category for per-category counts. Sort by category identifier ascending for stable output. Render an explicit empty-state element when the input is empty.",
                order: 6,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Count the bookings per class, keep only classes with at least one booking, and order the rows by class id ascending. Each row carries the `booking-row` hook.",
                order: 1,
              },
              {
                description:
                  "Each row's text has to hold both the class name and the count as separate text nodes, so class 1 shows \"Morning Yoga\" and `2` while class 3 shows \"Spin Class\" and `3`. Bookings spanning classes 1, 2 and 3 with only 1 and 3 booked gives exactly two rows.",
                order: 2,
              },
              {
                description:
                  "Render the `empty-state` hook when `bookings` is empty, with zero `booking-row` elements in that case. A blank list reads as a loading state rather than a valid answer.",
                order: 3,
              },
              {
                description:
                  "The list takes `bookings` (`{ class_id }[]`) and `classes` (`{ id, name }[]`), and looks each display name up from `classes`. `src/components/BookingsByClassList.tsx` default-exports it.",
                order: 4,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Create src/components/BookingsByClassList.tsx with a default export that is a function accepting bookings ({ class_id }[]) and classes ({ id, name }[]) props.",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Given bookings across classes 1, 2 and 3 where only 1 and 3 have bookings, exactly two elements with data-testid=\"booking-row\" are rendered.",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Each booking-row contains the matching class name from classes and its booking count as text, e.g., class 1 renders \"Morning Yoga\" and 2, class 3 renders \"Spin Class\" and 3.",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Booking-row elements are ordered by class id ascending, so class 1's row precedes class 3's row.",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "With bookings={[]}, an element with data-testid=\"empty-state\" is rendered and no booking-row elements exist.",
                is_required: true,
                order: 5,
              },
            ],
          },
        },
        {
          task_name: "Attendance By Month Server Action",
          test_type: "both",
          user_story:
            "As a studio manager, I want a server-side attendance-per-month aggregation so that the dashboard reflects the true database state without trusting client-side bucketing.",
          learning_sections: {
            create: [
              {
                title: "Overview\nTime-Based Bucketing with ISO Month Keys",
                content:
                  "This section covers server actions that group timestamped records into month buckets for trend analysis. Records are sorted into `YYYY-MM` labels, producing a time series that is naturally chronological — sorting the labels alphabetically produces the correct timeline. The pattern applies to attendance tracking, login analytics, sales trends, and any reporting where events are grouped by calendar month.",
                order: 1,
              },
              {
                title: "Querying with Prisma findMany",
                content:
                  "`findMany` retrieves all records matching a filter — in this case, attendance records for a specific user. Unlike `findFirst` or `findUnique`, `findMany` returns an array that may be empty, which the action handles gracefully. The filter is applied at the database level via the `where` clause, reducing the data transferred to only relevant rows.",
                order: 2,
              },
              {
                title: "YYYY-MM Bucketing with toISOString",
                content:
                  "Month-level grouping uses the `YYYY-MM` format, extracted by slicing the first seven characters of an ISO 8601 string: `new Date(timestamp).toISOString().slice(0, 7)`. The `.toISOString()` method produces a UTC-based string, making the month boundary consistent regardless of the server's local timezone. This is critical for systems with distributed users — 'March 2025' means the same thing whether the server is in New York or Tokyo.\n\nnew Date('2025-03-15').toISOString().slice(0, 7) // '2025-03'\n\nA global conference platform tracking registrations by month uses this format so all dashboards agree on what 'this month' means.",
                order: 3,
              },
              {
                title: "UTC Date Handling",
                content:
                  "Using UTC-based date methods avoids timezone offset surprises. A record timestamped at 2025-03-01 01:00 in UTC+8 is actually February 28th in UTC — and `toISOString()` correctly reports it as '2025-02'. Month bucketing via UTC ensures every record falls into the same bucket regardless of where the computation runs or who views the report.",
                order: 4,
              },
              {
                title: "Practice Lab: Bucket Dates by YYYY-MM",
                content:
                  "Practice grouping date strings by their YYYY-MM label and returning sorted month-count pairs.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Group timestamps by YYYY-MM, count per month, return array sorted by month ascending. Empty input → [].",
                  language: "javascript",
                  starter_code:
                    "function bucketByMonth(timestamps) {\n  // TODO\n}\n",
                  editable_regions: [
                    { placeholder: "// TODO", case_sensitive: true },
                  ],
                  entry_point: "bucketByMonth",
                  test_cases: [
                    { input: [['2025-01-15', '2025-01-20', '2025-02-10']], expected: [{ month: '2025-01', count: 2 }, { month: '2025-02', count: 1 }], label: "two months, sorted ascending" },
                    { input: [['2025-12-01', '2025-01-01']], expected: [{ month: '2025-01', count: 1 }, { month: '2025-12', count: 1 }], label: "out-of-order input sorted by month" },
                    { input: [[]], expected: [], label: "empty → empty array" },
                  ],
                },
                order: 5,
              },
              {
                title: "Key Takeaway",
                content:
                  "Bucket timestamps into `YYYY-MM` labels via `toISOString().slice(0, 7)`. UTC-based bucketing eliminates timezone ambiguity. Sort output by month key ascending — the ISO format is naturally chronological. Return an empty array for empty input.",
                order: 6,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Create `src/lib/actions/attendance.ts` with an async `getAttendanceByMonth(userId: string)` and import the client as `import { prisma } from '@/lib/prisma'`.",
                order: 1,
              },
              {
                description:
                  "Read the rows with `prisma.attendance.findMany({ where: { user_id: userId } })`, so the id is passed through as `user_id` inside the filter.",
                order: 2,
              },
              {
                description:
                  "The timestamp field on each row is `attended_at`, and the `YYYY-MM` key comes from `new Date(r.attended_at).toISOString().slice(0, 7)` so the bucketing is done in UTC.",
                order: 3,
              },
              {
                description:
                  "Sort the final array ascending by `month`, which puts ISO month keys into chronological order. Empty input returns `[]`, never `null`.",
                order: 4,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Create an attendance file and export an async getAttendanceByMonth(userId) function.",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "The function calls prisma.attendance.findMany with a filter.",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Attendance timestamps are grouped into YYYY-MM UTC buckets and returned as { month, count } rows, e.g., two January records and three March records produce exactly [{ month: '2026-01', count: 2 }, { month: '2026-03', count: 3 }].",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "The returned rows are ordered by month ascending, so out-of-order input months come back in chronological order.",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "When the query resolves with no attendance rows, the function resolves an empty array [].",
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
    id: "npp-gym-level-5",
    title: "Attendance Analytics",
    subtitle:
      "Render a Member Stats card (client) and an active-members ranking server action.",
    order: 5,
    level_description:
      "Mission Briefing: The owner wants a 'Member Insights' page with two pieces — a per-member stats card showing bookings, attendance, rate, and favourite class, plus a leaderboard of the most active members across the gym. The card is a presentational React component; the leaderboard is a Prisma-backed server action that has to include members with zero attendance.",
    xp_reward: 300,
    coin_reward: 400,
    key_takeaways:
      "Attendance rate is a percentage — and percentages divide. Guard the no-bookings branch explicitly so the card never renders `NaN%`. Round once at the end, never on partial sums.\n\nLeaderboards that include zero-activity rows are the right default. A 'who showed up' list that hides everyone who didn't is also a 'where did Carol go' bug report waiting to happen. On the server, that means starting from `user.findMany`, not `attendance.findMany`.",
    scenario_id: "nextjs-postgres-prisma-2",
    tasks: {
      create: [
        {
          task_name: "Member Stats Card Component",
          test_type: "both",
          user_story:
            "As a member, I want a card showing my total bookings, attended count, attendance rate, and favourite class so that I can see how I'm using my membership.",
          learning_sections: {
            create: [
              {
                title: "Overview\nMulti-Metric Profile Cards with Safe Percentages and Fallbacks",
                content:
                  "This section covers components that display several derived metrics from the same input data, including a percentage and a 'most frequent' value. Every computed value must handle the empty-data case without producing `NaN`, null references, or undefined display slots. The pattern applies to profile stats, usage dashboards, and any view where metrics share a common data source.",
                order: 1,
              },
              {
                title: "Safe Percentage Computation",
                content:
                  "A rate is computed by dividing the attended count by the total booking count, then multiplying by 100. When total bookings are zero, division produces `NaN`. The guard is an explicit check:\n\nconst rate = totalBooked === 0 ? 0 : Math.round((attended / totalBooked) * 100);\n\nA fitness-tracker summary computing 'workout completion rate' uses the same guard — zero planned workouts means a 0% completion rate, not `NaN`. The guard is applied once, and the resulting value is used everywhere the rate is displayed.",
                order: 2,
              },
              {
                title: "Finding the Most Frequent Value (Mode)",
                content:
                  "The 'favourite' item is the category that appears most frequently in the data. Frequency analysis tracks each category's count and selects the category with the highest count. When two categories tie, a deterministic tiebreaker — lowest identifier — resolves the tie. A music streaming dashboard that shows 'most played genre' from listening history calculates this by counting plays per genre and selecting the genre with the highest count, breaking ties alphabetically. The calculation is deterministic: identical input always produces the same favourite.",
                order: 3,
              },
              {
                title: "Fallback UI for Missing Data",
                content:
                  "When no attendance data exists, the favourite field displays a fallback character such as '—' instead of leaving the slot empty or showing an error. A delivery tracking card that shows '—' for average delivery time when there are no deliveries yet follows the same pattern — the slot is occupied, the layout is stable, and the meaning is clear. Every metric slot has a defined value for every input scenario.",
                order: 4,
              },
              {
                title: "Practice Lab: Mode Finder with Fallback",
                content:
                  "Practice finding the most frequent value in an array with a fallback when the array is empty.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Return the most frequent value. Tiebreaker: lowest value. Empty array → '—'.",
                  language: "javascript",
                  starter_code:
                    "function findMode(values) {\n  // TODO\n}\n",
                  editable_regions: [
                    { placeholder: "// TODO", case_sensitive: true },
                  ],
                  entry_point: "findMode",
                  test_cases: [
                    { input: [['A', 'B', 'A', 'C', 'B', 'A']], expected: 'A', label: "A appears most" },
                    { input: [['X', 'Y', 'X', 'Y']], expected: 'X', label: "tie → lowest value wins" },
                    { input: [[]], expected: '—', label: "empty → fallback" },
                  ],
                },
                order: 5,
              },
              {
                title: "Key Takeaway",
                content:
                  "Guard percentage division to prevent `NaN`. Break ties deterministically with the lowest identifier. Provide fallback characters for every metric slot when data is absent — the card layout stays stable regardless of input.",
                order: 6,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "The card has to show total bookings, total attendance, the attendance rate and the favourite class, each in its own element carrying the `total-booked`, `total-attended`, `attendance-rate` and `favorite-class` hooks.",
                order: 1,
              },
              {
                description:
                  "The rate is a rounded whole percentage with a percent sign, so 2 attended out of 3 booked reads 67%. A member with no bookings has to read 0%.",
                order: 2,
              },
              {
                description:
                  "The favourite is the class with the most attendance, ties going to the lowest class id, and with no attendance at all the slot shows the em dash `—`.",
                order: 3,
              },
              {
                description:
                  "Every metric slot needs a defined value for every input. The trap is a rate that divides by zero and shows NaN, or a favourite left blank instead of carrying the em dash.",
                order: 4,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Create src/components/MemberStatsCard.tsx with a default export that is a function accepting bookings, attendances, and classes props.",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "data-testid=\"total-booked\" shows bookings.length and data-testid=\"total-attended\" shows attendances.length.",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "data-testid=\"attendance-rate\" shows the attended share of bookings as a rounded whole percentage followed by %, e.g., 2 attended out of 3 booked renders 67%.",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "data-testid=\"favorite-class\" shows the name of the class with the most attendance, e.g., two attendances for class 1 renders Morning Yoga.",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "With bookings={[]} and attendances={[]}, total-booked shows 0, total-attended shows 0, attendance-rate shows 0% and favorite-class shows the em dash —.",
                is_required: true,
                order: 5,
              },
            ],
          },
        },
        {
          task_name: "Active Members Ranking Server Action",
          test_type: "both",
          user_story:
            "As an owner, I want a server-side leaderboard of every member ordered by attendance so that the dashboard surfaces both the most engaged and the least active without trusting client-side joins.",
          learning_sections: {
            create: [
              {
                title: "Overview\nInclusive Leaderboards from the Parent Model",
                content:
                  "This section covers server actions that build a leaderboard starting from the parent entity rather than the detail records, ensuring entities with zero activity appear alongside the most active. The pattern applies to member rankings, usage dashboards, contribution scores, and any leaderboard where the absence of activity is itself meaningful data.",
                order: 1,
              },
              {
                title: "Prisma Eager Loading and N+1 Prevention",
                content:
                  "`include` fetches related records in the same query as the parent model. `prisma.parent.findMany({ include: { children: true } })` produces one round-trip that returns parents with their children arrays pre-populated. Without include, iterating over parents and querying children per parent produces the N+1 problem — one query for the parent list plus N queries for children — multiplying database load as the dataset grows.",
                order: 2,
              },
              {
                title: "Inclusive Zero-Count Reporting",
                content:
                  "Querying from the parent model ensures every entity appears, including those with zero related records. A constituency report that lists every voter alongside their town-hall attendance includes non-attendees — their presence on the list is as important as the attendees' counts. Querying from attendance records alone would silently drop anyone with zero attendance, creating a blind spot that looks like a bug.",
                order: 3,
              },
              {
                title: "Sorting with Deterministic Tiebreakers",
                content:
                  "The leaderboard is sorted by attendance count descending. Entities with the same count are tiebroken alphabetically by name ascending. `Array.prototype.sort` with a comparator that checks the primary key first, then the secondary key, produces a stable, reproducible order. Without a tiebreaker, tied entries shuffle based on runtime internals — tests break, dashboards look glitchy, and debugging is unreliable.",
                order: 4,
              },
              {
                title: "Practice Lab: Inclusive Leaderboard from Parent List",
                content:
                  "Practice building a leaderboard that includes every entity, even those with zero activity.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Return all players sorted by score desc, name asc as tiebreaker. Players without entries in scores must appear with score: 0.",
                  language: "javascript",
                  starter_code:
                    "function rankPlayers(players, scores) {\n  // scores is [{ playerName, points }]\n  // players is [{ name }] — every player must appear\n  // TODO\n}\n",
                  editable_regions: [
                    { placeholder: "// TODO", case_sensitive: true },
                  ],
                  entry_point: "rankPlayers",
                  test_cases: [
                    { input: [[{ name: 'Alice' }, { name: 'Bob' }], [{ playerName: 'Alice', points: 10 }]], expected: [{ name: 'Alice', score: 10 }, { name: 'Bob', score: 0 }], label: "Bob appears with zero" },
                    { input: [[{ name: 'Zoe' }, { name: 'Ava' }], [{ playerName: 'Zoe', points: 5 }, { playerName: 'Ava', points: 5 }]], expected: [{ name: 'Ava', score: 5 }, { name: 'Zoe', score: 5 }], label: "tie → name ascending" },
                    { input: [[{ name: 'Solo' }], []], expected: [{ name: 'Solo', score: 0 }], label: "no scores → everyone at zero" },
                  ],
                },
                order: 5,
              },
              {
                title: "Key Takeaway",
                content:
                  "Query the parent model with `include`, not the detail model, to prevent N+1. Count via the included array length. Sort by activity descending with a deterministic tiebreaker. Include zero-activity members — a leaderboard that hides absence also hides disengagement.",
                order: 6,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "`getActiveMembersRanking` has to include every member, including the ones with no attendance at all, so the leaderboard starts from the member list and pulls the attendance in with it.",
                order: 1,
              },
              {
                description:
                  "Each entry is exactly a member id, a name built from the first and last name, and the attendance count, with no extra keys. An extra key makes the result fail to match.",
                order: 2,
              },
              {
                description:
                  "Order by attendance count descending, with ties broken on name ascending so the same input always produces the same order.",
                order: 3,
              },
              {
                description:
                  "The trap is building the list from attendance records. Members who never attended then vanish, and those missing zero rows are exactly what the leaderboard is meant to show.",
                order: 4,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Create a leaderboard file and export a getActiveMembersRanking() function.",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "The function calls prisma.user.findMany with an include that contains attendances.",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Each returned entry equals exactly { user_id, name, attendedCount }, with name built as first name + space + last name and attendedCount equal to the number of included attendances.",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Entries are ordered by attendedCount descending, so a member with 3 attendances ranks ahead of one with 2.",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "A member with no attendance records still appears in the result with attendedCount equal to 0.",
                is_required: true,
                order: 5,
              },
              {
                description:
                  "Members with equal attendedCount are ordered by name ascending.",
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