// src/lib/data/reflectionConcepts.ts
//
// Curated concept chips shown in the post-assessment reflection step, keyed by
// scenario id. Each scenario has an array of 5 entries — one per level, indexed
// by (level order - 1). These replace raw task names with cleaner skill phrases.
//
// If a scenario/level is missing here, the reflection UI falls back to the
// level's task names (see postassessment/+page.server.ts).
export const reflectionConcepts: Record<string, string[][]> = {
  // ── React + Express + Postgres + Prisma — Library Management ──────────────
  "react-express-postgres-prisma-1": [
    // Level 1 — Getting Familiar with the Codebase
    [
      "The PERN stack (Postgres, Express, React, Node)",
      "Package management with npm/pnpm",
      "Environment variables & .env configuration",
      "ORMs and Prisma migrations",
      "React components & layout components",
      "Editing JSX text content",
    ],
    // Level 2 — Client-Side Exploration
    [
      "Pure functions with predictable outputs",
      "Centralizing logic in reusable helpers",
      "Handling boundary conditions",
      "Exporting & importing modules",
      "Refactoring to remove duplicated logic",
    ],
    // Level 3 — Debugging and Stabilizing the Backend
    [
      "Tracing a data flow end-to-end",
      "Identifying root causes vs. symptoms",
      "Adding debug checkpoints",
      "Database transactions & atomicity",
      "Prisma $transaction",
      "Concurrency guards",
    ],
    // Level 4 — Starting my Full-Stack Journey
    [
      "Building a full-stack feature end-to-end",
      "Designing an API endpoint",
      "The client service layer",
      "Reservation queues & lifecycles",
      "State transitions / state machines",
      "Error handling across the stack",
    ],
    // Level 5 — The Production Struggle
    [
      "Debugging a production bug",
      "Trusting source-of-truth fields over stale status",
      "UTC & timezone boundaries",
      "Writing regression tests",
      "Centralizing date logic",
      "Writing a postmortem",
    ],
  ],

  // ── React + Express + Postgres + Prisma — UrbanPottery e-commerce ─────────
  "react-express-postgres-prisma-2": [
    // Level 1 — Getting Familiar with the Codebase
    [
      "The PERN stack & three package roots",
      "Environment variables & .env configuration",
      "Prisma migrations",
      "React layout components",
      "Editing JSX text nodes",
      "Vite hot module replacement (HMR)",
    ],
    // Level 2 — Client-Side Exploration
    [
      "Union return types vs. booleans",
      "Threshold-based classification",
      "Pure helper functions",
      "Testing boundary values",
      "Refactoring inline checks into a helper",
      "Non-regression checklists",
    ],
    // Level 3 — Backend Debugging & Transactional Consistency
    [
      "Tracing a data leak",
      "Root cause analysis",
      "Concurrent oversell races",
      "Prisma schema migrations",
      "Atomic transactions (Prisma $transaction)",
      "Concurrency guards at checkout",
    ],
    // Level 4 — Starting my Full-Stack Journey
    [
      "Designing a validation API endpoint",
      "Extending existing API routes",
      "The client service layer",
      "Atomic counters & usage guards",
      "Expiry & active-state checks",
      "Admin observability panels",
    ],
    // Level 5 — The Production Struggle: Sales Revenue Bug
    [
      "Debugging a revenue-reporting bug",
      "Source-of-truth fields vs. stale status",
      "Writing stale-status regression tests",
      "Centralizing logic into shared utilities",
      "Writing a postmortem",
    ],
  ],

  // ── React + Express + Postgres + Prisma — IPPO POS ───────────────────────
  "react-express-postgres-prisma-3": [
    // Level 1 — Getting Familiar with the Codebase
    [
      "The PERN stack & three package roots",
      "Environment variables & .env configuration",
      "Prisma migrations",
      "React layout components",
      "Editing JSX text nodes",
      "Vite hot module replacement (HMR)",
    ],
    // Level 2 — Client-Side Exploration
    [
      "Pure classifier functions",
      "Union types vs. booleans",
      "Why threshold ordering matters",
      "Refactoring duplicated logic",
      "Controlled inputs in React",
      "Accessibility: disabling vs. hiding",
    ],
    // Level 3 — Backend: Void Flow + Concurrency Guard
    [
      "Read-then-write race conditions",
      "Writing an evidence test",
      "Status vs. timestamp as source of truth",
      "Atomic multi-table transactions",
      "updateMany with a gte guard",
      "Guarding state transitions",
    ],
    // Level 4 — Full-Stack Feature: Promo Codes
    [
      "Building an end-to-end feature",
      "Data modeling (the PromoCode model)",
      "Re-validating inside a transaction",
      "Cashier UX states",
      "The atomic counter pattern",
      "Lifecycle hooks & admin observability",
    ],
    // Level 5 — The Production Struggle: Sales Revenue Bug
    [
      "Source-of-truth timestamps for reporting",
      "Avoiding the stale-status pitfall",
      "Writing regression tests",
      "Centralizing logic (a where-clause builder)",
      "Postmortem structure",
      "Code review checklists",
    ],
  ],

  // ── Next.js + Postgres + Prisma — POS system ─────────────────────────────
  "nextjs-postgres-prisma-1": [
    // Level 1 — Getting Familiar with the Codebase
    [
      "The Next.js + Postgres + Prisma stack",
      "Project structure (what lives where)",
      "Environment variables & DATABASE_URL",
      "Prisma migrate, generate & seed",
      "Running the Next.js dev server",
      "Centralizing currency formatting in a pure helper",
    ],
    // Level 2 — Inventory Quality
    [
      "Classifying numeric bands",
      "String literal union return types",
      "Handling boundary conditions",
      "Pure helper functions",
      "Driving UI state from a helper",
    ],
    // Level 3 — Checkout Integrity
    [
      "A single source of truth for cart math",
      "Handling edge cases",
      "Validating before side effects",
      "Collecting all errors instead of throwing",
      "Indexing data by ID",
      "Building a wire-format payload",
      "Composing helper functions",
    ],
    // Level 4 — Coupons Feature Expansion
    [
      "Prisma schema changes (optional DateTime)",
      "Input normalization",
      "Validation contracts",
      "Filter-then-reduce patterns",
      "Selecting the best option from a set",
      "Wiring logic into checkout",
    ],
    // Level 5 — Sales Reporting
    [
      "Aggregating arrays of data",
      "Handling empty-input branches",
      "Grouping data with a Map",
      "Sorting & tie-breaking",
      "Ranking & limiting results",
      "Tracing where report data comes from",
    ],
  ],

  // ── Next.js + Postgres + Prisma — Membership portal ──────────────────────
  "nextjs-postgres-prisma-2": [
    // Level 1 — Getting Familiar with the Codebase
    [
      "The Next.js + Postgres + Prisma stack",
      "Project structure & environment variables (DATABASE_URL)",
      "Prisma migrate, seed & dev server",
      "Pure helper functions",
      "Formatting names & dates",
      "Wiring helpers into the UI",
    ],
    // Level 2 — Membership Logic
    [
      "Multi-state status helpers",
      "Taking `now` as a parameter for testability",
      "Order of checks as part of the spec",
      "Whole-day date math",
      "Flooring vs. rounding",
    ],
    // Level 3 — Class Capacity
    [
      "Boundary-safe helper functions",
      "Computing available capacity",
      "Guard functions that return a reason",
      "Order of checks as part of the spec",
      "Wiring helpers into components",
    ],
    // Level 4 — Booking Aggregation
    [
      "Group-by in plain JavaScript",
      "Counting with a Map",
      "Bucketing data by month (YYYY-MM)",
      "Sorting aggregated results",
      "Time zones & ISO dates",
    ],
    // Level 5 — Attendance Analytics
    [
      "Computing summary statistics",
      "Handling empty-input branches",
      "Building counts then projecting results",
      "Ranking with tie-breaks in the comparator",
      "Including every record in a ranking",
    ],
  ],

  // ── Next.js + Postgres + Prisma — Payroll / HR dashboard ─────────────────
  "nextjs-postgres-prisma-3": [
    // Level 1 — Getting Familiar with the Codebase
    [
      "The Next.js + Postgres + Prisma stack",
      "Project structure & environment variables (DATABASE_URL)",
      "Prisma migrate, seed & dev server",
      "Pure helper functions",
      "Formatting hours & currency",
      "Wiring helpers into the dashboard",
    ],
    // Level 2 — Time Calculations
    [
      "Multi-state status helpers",
      "Null-first checks",
      "Summing filtered data",
      "Parsing ISO date strings",
      "Rounding once, at the end",
    ],
    // Level 3 — Time-Off Logic
    [
      "Validating every input field",
      "Using a Set for allowed values",
      "Collecting errors instead of throwing",
      "Computing a balance from filtered sums",
      "Modeling business rules in code",
    ],
    // Level 4 — Payroll Computation
    [
      "Threshold-based splitting",
      "Default parameters",
      "Clamping values at zero",
      "Overtime pay multipliers",
      "Rounding once, at the end",
      "Composing helper functions",
    ],
    // Level 5 — Payroll Reporting
    [
      "Summarizing data in one pass",
      "Handling empty-record branches",
      "Reduce with multiple accumulators",
      "Grouping by a derived key",
      "Building an index",
      "Sorting results alphabetically",
    ],
  ],
};
