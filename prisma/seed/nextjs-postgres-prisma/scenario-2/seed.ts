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
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: You've joined FitTech Systems as a full-stack developer. The team maintains a member portal built with Next.js, PostgreSQL, and Prisma where members view their membership, book classes, and check attendance. Get the portal running against your own database, then add two small formatting helpers so the header and membership card display data consistently.",
    xp_reward: 100,
    coin_reward: 50,
    key_takeaways:
      "A Next.js + Prisma portal starts the same way every project does: install deps, point DATABASE_URL at your DB, run migrations, seed sample data, start the dev server. Knowing the recipe by heart frees you to focus on the actual work.\n\nFormatting helpers belong in src/lib/ as small pure functions. A shared formatMemberName / formatShortDate means the portal header, the membership card, and every future feature display names and dates the exact same way.",
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
                  "This section walks through getting the FitTech portal running locally. The flow is identical to any Next.js + Prisma project: install dependencies, configure environment variables, migrate, seed, then run the dev server.",
                order: 1,
              },
              {
                title: "What Lives Where",
                content:
                  "project/\n    ├── prisma/\n    │     ├── schema.prisma ← User, Membership, Class, Booking, Attendance\n    │     └── seed.ts ← demo members + classes\n    ├── src/\n    │     ├── app/portal/ ← portal pages and React components\n    │     ├── app/api/ ← Next.js API routes (classes, bookings)\n    │     └── lib/ ← shared helpers you'll add to\n    └── package.json\nMost of your code will live in src/app/portal/ and src/lib/.",
                order: 2,
              },
              {
                title: "Environment Variables and DATABASE_URL",
                content:
                  'Prisma reads DATABASE_URL from a .env file at the project root. Format:\nDATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"\nFor local Postgres on the default port:\nDATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/gym_portal"\nNever commit .env. Copy .env.example as a starting point and edit the credentials.',
                order: 3,
              },
              {
                title: "Prisma Migrate, Seed, and Dev",
                content:
                  "Three commands in order:\n  1. `npm run prisma:migrate` — applies SQL migrations to your database and regenerates the Prisma Client.\n  2. `npm run prisma:seed` — inserts the demo member, membership, classes, and attendance.\n  3. `npm run dev` — boots Next.js on http://localhost:3000 with hot module replacement.\nIf any step fails, fix it before moving on — the next step depends on it.",
                order: 4,
              },
              {
                title: "Key Takeaway",
                content:
                  "Local setup isn't ceremony — it's the contract that says every developer's environment matches every other developer's, which means a bug you see is a bug everyone sees.",
                order: 5,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "If migrate fails, verify your Postgres user has the privileges to create databases or that the database referenced in DATABASE_URL already exists.",
                order: 1,
              },
              {
                description:
                  "The setup-check grader verifies that dependencies installed, the Prisma migrations ran, and the seed completed — make sure all three pass locally.",
                order: 2,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Dependencies installed cleanly via `npm install`",
                is_required: true,
                order: 1,
              },
              {
                description:
                  ".env exists at the project root with a working DATABASE_URL",
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
                  "`npm run dev` boots the portal on http://localhost:3000 without errors",
                is_required: true,
                order: 4,
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
                title: "Practice Lab: Member Name",
                content:
                  "Try the trimmed-join behaviour yourself before writing it in the real file.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement formatMemberName(first, last) that trims both inputs and joins them with a single space. If one is empty, return the other without a stray space.",
                  language: "javascript",
                  starter_code:
                    "export function formatMemberName(first, last) {\n  // TODO\n}\n",
                  editable_regions: [
                    { placeholder: "// TODO", case_sensitive: true },
                  ],
                  entry_point: "formatMemberName",
                  test_cases: [
                    { input: ["Jordan", "Rivera"], expected: "Jordan Rivera", label: "both parts" },
                    { input: ["  Jordan  ", "Rivera"], expected: "Jordan Rivera", label: "trims whitespace" },
                    { input: ["", "Rivera"], expected: "Rivera", label: "missing first" },
                    { input: ["Jordan", ""], expected: "Jordan", label: "missing last" },
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
                  "`[first.trim(), last.trim()].filter(Boolean).join(' ')` handles every formatMemberName case in one expression.",
                order: 1,
              },
              {
                description:
                  "For formatShortDate, prefer `new Date(d).toISOString().slice(0, 10)` over `toLocaleDateString` — the locale-free version is deterministic.",
                order: 2,
              },
              {
                description:
                  "Update the portal header and membership card to import these helpers; don't re-implement the same logic inline.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "`formatMemberName` and `formatShortDate` are exported from `src/lib/format.ts`",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "formatMemberName trims and joins with a single space; a missing part leaves no stray whitespace",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "formatShortDate accepts string or Date and returns the date as `YYYY-MM-DD`",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Portal header and membership card use these helpers",
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
    id: "npp-gym-level-2",
    title: "Membership Logic",
    subtitle:
      "Two Prisma-backed server actions: membership status and days-until-expiry.",
    order: 2,
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: The portal needs an authoritative membership badge and an 'expires in N days' line. Today both are computed on the client from whichever fields the API happened to return. Move both behind server actions backed by Prisma so the database is the source of truth. The graders mock `@/lib/prisma`, so you write real Prisma queries — no DB calls execute during the test.",
    xp_reward: 150,
    coin_reward: 125,
    key_takeaways:
      "Server actions in the App Router are async functions exported from `src/app/actions/`. They run only on the server and can read `@/lib/prisma` directly. Putting the membership rules behind one means every screen — badge, booking guard, future analytics — agrees on the answer.\n\nTake `now: Date` as an optional parameter (`now?: Date`) defaulting to `new Date()`. Production callers pass nothing; tests inject a fixed clock. Same input, same output, every time.",
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
                  "Create `src/app/actions/membership.ts` and export:\n\nexport async function getMembershipStatusForUser(\n  userId: string,\n  now?: Date,\n): Promise<'active' | 'expired' | 'inactive'>\n\nUse `prisma.membership.findFirst({ where: { user_id: userId } })`. Default `now` to `new Date()`. Apply the rules in order:\n  • `now > end_date` → `'expired'`.\n  • Otherwise `status === 'active'` and `now >= start_date` → `'active'`.\n  • Anything else (including no membership) → `'inactive'`.",
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
                  "`prisma.membership.findFirst({ where: { user_id: userId } })` may return `null` — treat that as `'inactive'`.",
                order: 1,
              },
              {
                description:
                  "Coerce `start_date` / `end_date` to Date with `new Date(...)` if Prisma hands them back as strings; numeric comparison is unambiguous on Date instances.",
                order: 2,
              },
              {
                description:
                  "The expired branch fires when `now > end_date`, not `now >= end_date` — read the spec carefully on the day-of-expiry behaviour.",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "`getMembershipStatusForUser` is exported as an async function from `src/app/actions/membership.ts`",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Uses `prisma.membership.findFirst` keyed by `user_id` and defaults `now` to `new Date()`",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Returns `'expired'` when `now > end_date`, `'active'` when status is `'active'` and `now >= start_date`, `'inactive'` otherwise (incl. no membership)",
                is_required: true,
                order: 3,
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
                  "Add to `src/app/actions/membership.ts`:\n\nexport async function getDaysUntilExpiry(\n  userId: string,\n  now?: Date,\n): Promise<number | null>\n\nLook up the user's membership end_date via Prisma. Return whole days between `now` and `end_date`, floored.\n  • `0` on the expiry day itself.\n  • Negative once expired (`-1` the day after, etc).\n  • `null` when no membership exists for the user.",
                order: 2,
              },
              {
                title: "Floor the Difference, Don't Round",
                content:
                  "Compute `(endDate - now) / 86_400_000` and apply `Math.floor`. Rounding would give you '1 day' on a 0.6-day diff — wrong both in human terms and per the spec. Flooring matches the natural 'how many full days remain' reading.",
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
                  "Compute the difference as ms with `end.getTime() - now.getTime()`, then divide by 86_400_000 and floor.",
                order: 1,
              },
              {
                description:
                  "Allow negatives — the spec wants `-1` the day after expiry, not `0` or an error.",
                order: 2,
              },
              {
                description:
                  "Return `null` exactly when `findFirst` returns `null`; never substitute `0` for missing data.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "`getDaysUntilExpiry` is exported as an async function from `src/app/actions/membership.ts`",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Uses `prisma.membership.findFirst` and returns `null` when no membership exists",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Returns the floored whole-day count between `now` and `end_date`; `0` on the day of expiry and negative numbers once past expiry",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Defaults `now` to `new Date()` so production callers can omit it",
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
    id: "npp-gym-level-3",
    title: "Class Capacity",
    subtitle:
      "Render two React components: a clamped spots indicator and a smart booking button.",
    order: 3,
    deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: Members see negative 'spots left' counters on popular classes and the Book button stays clickable after they've already booked. Replace the ad-hoc inline math with two presentational React components — a `<ClassSpotsIndicator />` and a `<BookingButton />` — graded with `@testing-library/react` in jsdom.",
    xp_reward: 200,
    coin_reward: 200,
    key_takeaways:
      "Presentational components map props to ARIA roles and `data-testid` hooks. Anchor your markup on the hooks the grader queries; style freely around them.\n\nWhen a UI element has more than two states (default / disabled-A / disabled-B / ...), encode the priority as a chain of `if` checks rather than overlapping booleans. The order of the checks is part of the spec — write the comments to match.",
    scenario_id: "nextjs-postgres-prisma-2",
    tasks: {
      create: [
        {
          task_name: "Class Spots Indicator Component",
          test_type: "both",
          user_story:
            "As a member, I want each class card to show how many spots are left and a 'Class Full' badge when none remain so that I don't waste time tapping a class I can't join.",
          hints: {
            create: [
              {
                description:
                  "Required `data-testid`s: `spots-left` (always) and `full-badge` (only when `booked >= capacity`).",
                order: 1,
              },
              {
                description:
                  "Clamp the count with `Math.max(0, capacity - booked)` so the counter never goes negative.",
                order: 2,
              },
              {
                description:
                  "Wrap the badge in `{booked >= capacity && (...)}` — never emit it when seats remain.",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "`ClassSpotsIndicator` is the default export of `src/components/ClassSpotsIndicator.tsx`",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "`data-testid=\"spots-left\"` shows the remaining count, clamped to 0",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "`data-testid=\"full-badge\"` appears only when `booked >= capacity` and contains \"Class Full\"",
                is_required: true,
                order: 3,
              },
            ],
          },
        },
        {
          task_name: "Booking Button Component",
          test_type: "both",
          user_story:
            "As a member, I want the Book button to say why it's disabled (\"Already booked\" or \"Class full\") so that I know whether to wait or pick a different class.",
          hints: {
            create: [
              {
                description:
                  "Three states, in order: already-booked → \"Already booked\" (disabled), then full → \"Class full\" (disabled), otherwise \"Book\" (enabled).",
                order: 1,
              },
              {
                description:
                  "The already-booked branch must win when the class is also full.",
                order: 2,
              },
              {
                description:
                  "`onBook` must never fire when the button is disabled.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "`BookingButton` is the default export of `src/components/BookingButton.tsx`",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Renders \"Already booked\" (disabled) when the class is in `userBookedClassIds`, even if the class is also full",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Renders \"Class full\" (disabled) when not already booked but `booked >= capacity`",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Otherwise renders \"Book\" (enabled) and calls `onBook(classId)` on click",
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
    id: "npp-gym-level-4",
    title: "Booking Aggregation",
    subtitle:
      "Render a Bookings-By-Class list (client) and a month-bucketed attendance server action.",
    order: 4,
    deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
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
          hints: {
            create: [
              {
                description:
                  "Group bookings per `class_id` and emit one `booking-row` per class with count > 0, sorted ascending by id.",
                order: 1,
              },
              {
                description:
                  "Render `empty-state` when `bookings.length === 0`, not when the row list is empty.",
                order: 2,
              },
              {
                description:
                  "A `Map<number, number>` is the natural shape for the count pass.",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "`BookingsByClassList` is the default export of `src/components/BookingsByClassList.tsx`",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Renders one `data-testid=\"booking-row\"` per class with at least one booking, showing the class name and count, sorted by class id ascending",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Renders `data-testid=\"empty-state\"` when `bookings` is empty",
                is_required: true,
                order: 3,
              },
            ],
          },
        },
        {
          task_name: "Attendance By Month Server Action",
          test_type: "both",
          user_story:
            "As a studio manager, I want a server-side attendance-per-month aggregation so that the dashboard reflects the true database state without trusting client-side bucketing.",
          hints: {
            create: [
              {
                description:
                  "Bucket each row by `YYYY-MM` in UTC; `toISOString().slice(0, 7)` is the canonical recipe.",
                order: 1,
              },
              {
                description:
                  "Sort the final array ascending by `month` — strings of that form sort chronologically.",
                order: 2,
              },
              {
                description:
                  "Empty input → return `[]`, never null.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "`getAttendanceByMonth` is exported as an async function from `src/app/actions/attendance.ts`",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Uses `prisma.attendance.findMany` keyed by `user_id`",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Each output row has `month` in `YYYY-MM` (UTC) form and a numeric `count`, sorted ascending by `month`",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Returns `[]` when the user has no attendance",
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
    id: "npp-gym-level-5",
    title: "Attendance Analytics",
    subtitle:
      "Render a Member Stats card (client) and an active-members ranking server action.",
    order: 5,
    deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
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
          hints: {
            create: [
              {
                description:
                  "Both the rate and the favourite class need empty-branch handling.",
                order: 1,
              },
              {
                description:
                  "Favourite class ties break on the lowest `class_id`.",
                order: 2,
              },
              {
                description:
                  "Rate is rendered as `\"N%\"`; favourite falls back to `\"—\"`.",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "`MemberStatsCard` is the default export of `src/components/MemberStatsCard.tsx`",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "`total-booked`, `total-attended`, and `attendance-rate` (as `\"N%\"`) render correctly; rate is `0%` when there are no bookings",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "`favorite-class` shows the most-attended class name (lowest class id on ties), or `\"—\"` when there is no attendance",
                is_required: true,
                order: 3,
              },
            ],
          },
        },
        {
          task_name: "Active Members Ranking Server Action",
          test_type: "both",
          user_story:
            "As an owner, I want a server-side leaderboard of every member ordered by attendance so that the dashboard surfaces both the most engaged and the least active without trusting client-side joins.",
          hints: {
            create: [
              {
                description:
                  "Start from `user.findMany` so members with zero attendance still appear.",
                order: 1,
              },
              {
                description:
                  "`include` the relation to avoid N+1 queries.",
                order: 2,
              },
              {
                description:
                  "Tie-break on `name` ascending.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "`getActiveMembersRanking` is exported as an async function from `src/app/actions/leaderboard.ts`",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Uses `prisma.user.findMany({ include: { attendances: true } })`",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Every user appears once with `attendedCount = attendances.length`, including users with zero attendance",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Sorted by `attendedCount` desc with `name` asc as the tie-breaker",
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