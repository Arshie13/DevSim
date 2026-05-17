/**
 * Prisma Seed Script
 *
 * Seeds the database with Level and Scenario data for learning DevOps and full-stack development.
 *
 * Usage:
 *   npx tsx prisma/seed.ts
 *
 * Make sure to run `npx prisma generate` first to generate the client.
 *
 * Task type values:
 *   "client" — only a client-side test exists
 *   "server" — only a server-side test exists
 *   "both"   — both client and server tests exist
 *   "none"   — no automated test (setup/manual tasks)
 */

// @ts-ignore - Prisma client path
import { PrismaClient } from "$prismaclient";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? "",
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting database seed...\n");

  // Clear existing data
  await prisma.completedTask.deleteMany();
  await prisma.containerStack.deleteMany();
  await prisma.userFileChanges.deleteMany();
  await prisma.container.deleteMany();
  await prisma.acceptanceCriteria.deleteMany();
  await prisma.hint.deleteMany();
  await prisma.levelTask.deleteMany();
  await prisma.level.deleteMany();
  await prisma.scenario.deleteMany();

  console.log("🗑️  Cleared existing data\n");

  // Define scenarios for each tech stack
  const scenarios = [
    {
      id: "react-express-postgres-prisma-scenario-1",
      name: "BookWise Library Management System",
      description:
        "Build a full-featured web-based Library Management System to manage books, members, and borrowing workflows using React, Express, PostgreSQL, and Prisma.",
      difficulty: "expert",
    },
    {
      id: "nextjs-shadcn-ui-scenario-1",
      name: "BookStop Public Library (Next.js + shadcn/ui)",
      description:
        "Build a client-side Library Management System using Next.js, shadcn/ui, and localStorage to manage books, borrows, and returns with a polished modern UI.",
      difficulty: "intermediate",
    },
    {
      id: "nextjs-shadcn-ui-scenario-2",
      name: "City Hall Customer Support Portal (Next.js + shadcn/ui)",
      description:
        "Build a client-side customer support portal with a citizen complaint form and agent dashboard using Next.js, shadcn/ui, and localStorage for persistence.",
      difficulty: "intermediate",
    },
    {
      id: "nextjs-shadcn-ui-scenario-3",
      name: "Riverside University Student Portal (Next.js + shadcn/ui)",
      description:
        "Build a client-side student portal with grades, schedule, fees, academic standing, and notes using Next.js, shadcn/ui, and localStorage for persistence.",
      difficulty: "intermediate",
    },
  ];

  // Define levels with progressive difficulty
  const levels = [
    {
      id: "level-1",
      title: "Getting Familiar with the Codebase",
      subtitle:
        "Set up the development environment and make a minor UI change.",
      order: 1,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      levelDescription:
        "Mission Briefing: The library has onboarded a new developer and needs the system running locally. Set up the PERN (Postgres, Express, React, NodeJs) stack, configure the database, and make minor UI tweaks to get the application running properly in your local machine.",
      xpReward: 100,
      coinReward: 50,
      keyTakeaways: "Mastering React + Express + PostgreSQL + Prisma development environments requires understanding package management (npm/pnpm), environment variables for securing database connections, and Prisma migrations to keep PostgreSQL schemas synchronized. This setup ensures consistent development across team members and reliable deployments. Every React frontend with Express backend and Prisma + PostgreSQL database starts with this crucial foundation.\n\nReact component props enable parent-to-child data flow, creating dynamic UIs that display data from Express APIs. Understanding component hierarchy and prop passing is essential for building maintainable React applications that consume Prisma-fetched PostgreSQL data. This component architecture is fundamental to all React applications integrated with Express backends.",
      scenarioId: "react-express-postgres-prisma-scenario-1",
      tasks: {
        create: [
          {
            taskName: "Prepare Development Environment",
            testType: "client", 
            userStory:
              "As a developer, I want to set up my development environment so that I can start working on the project.",
            hints: {
              create: [
                {
                  description:
                    "Run package installation in the `root`, `client`, and `server` folders.",
                  order: 1,
                },
                {
                  description:
                    "Use the README to gather information about the project setup.",
                  order: 2,
                },
                {
                  description:
                    "Make sure to run Prisma migrations to set up the database.",
                  order: 3,
                },
              ],
            },
            order: 1,
            acceptanceCriteria: {
              create: [
                {
                  description:
                    "Dependencies installed for the root, client, and server without errors",
                  isRequired: true,
                  order: 1,
                },
                {
                  description: "Prisma migrations executed successfully",
                  isRequired: true,
                  order: 2,
                },
                {
                  description: "Both client and server running without errors",
                  isRequired: true,
                  order: 3,
                },
              ],
            },
          },
          {
            taskName: "Update Brand Subtitle",
            testType: "client", // UI change only — client test
            userStory:
              "As a user, I want to see the updated brand subtitle on the website so that the interface reflects the library identity.",
            hints: {
              create: [
                {
                  description:
                    "Check shared layout components under `client/src/components/layout`.",
                  order: 1,
                },
                {
                  description:
                    "Run the client and quickly confirm both updates in the browser.",
                  order: 2,
                },
                {
                  description:
                    "Test the change locally to ensure it displays correctly.",
                  order: 3,
                },
              ],
            },
            order: 2,
            acceptanceCriteria: {
              create: [
                {
                  description:
                    'Header subtitle is exactly "BookWise Public Library"',
                  isRequired: true,
                  order: 1,
                },
                {
                  description:
                    "Subtitle renders correctly on desktop and mobile layouts",
                  isRequired: true,
                  order: 2,
                },
              ],
            },
          },
        ],
      },
    },
    {
      id: "level-2",
      title: "Client-Side Exploration",
      subtitle: "Investigate Client-Side Borrowing Logic and UI Helpers",
      order: 2,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      levelDescription:
        "Mission Briefing: Members report they cannot borrow books even when copies are available. Your task is to investigate the client-side availability logic and create a reusable helper function to ensure consistent borrow decisions across the React UI.",
      xpReward: 25,
      coinReward: 125,
      keyTakeaways: "Pure functions in React applications that process Prisma query results from PostgreSQL are easier to test and debug. Centralizing business logic ensures consistent data handling across React components that consume Express API responses. This functional programming approach is essential for reliable React + Express + Prisma applications.\n\nClient-side utility functions in React ensure consistent logic when processing data from Express APIs powered by Prisma and PostgreSQL. When the same availability logic exists in multiple React components, shared utilities prevent inconsistencies and simplify maintenance. This approach ensures reliable data handling in React applications consuming Express + Prisma + PostgreSQL backends.",
      scenarioId: "react-express-postgres-prisma-scenario-1",
      tasks: {
        create: [
          {
            taskName: "Add Borrow Availability Helper",
            testType: "client",
            userStory:
              "As a developer, I want a reusable availability helper, So that borrow decisions stay correct and consistent.",
            hints: {
              create: [
                {
                  description:
                    "Target the Contract - Expose a single function named `isBookAvailable` from `client/src/utils/helpers.ts`.",
                  order: 1,
                },
                {
                  description:
                    "Verify the Boundary - Make sure the boundary at `0` is handled exactly as expected.",
                  order: 2,
                },
                {
                  description:
                    "Keep It Reusable - Keep the function focused: copy count in, availability out.",
                  order: 3,
                },
              ],
            },
            order: 1,
            acceptanceCriteria: {
              create: [
                {
                  description:
                    "A helper is implemented and exported as `isBookAvailable` from `client/src/utils/helpers.ts`",
                  isRequired: true,
                  order: 1,
                },
                {
                  description:
                    "The helper returns `false` when `availableCopies <= 0`",
                  isRequired: true,
                  order: 2,
                },
                {
                  description:
                    "The helper returns `true` when `availableCopies > 0`",
                  isRequired: true,
                  order: 3,
                },
                {
                  description:
                    "Borrow-availability decisions remain consistent for mixed copy counts (positive, zero, negative)",
                  isRequired: true,
                  order: 4,
                },
                {
                  description:
                    "Repeated calls with the same input return the same output",
                  isRequired: true,
                  order: 5,
                },
                {
                  description:
                    "Tests validate behavior and contract rather than enforcing one exact implementation style",
                  isRequired: true,
                  order: 6,
                },
              ],
            },
          },
          {
            taskName: "Reuse Availability Logic",
            testType: "client", 
            userStory:
              "As a developer, I want BorrowRecords to use the shared availability helper, So that the logic stays consistent across views.",
            hints: {
              create: [
                {
                  description:
                    "Choose Utility Location - Use the existing shared helper in `client/src/utils/helpers.ts`.",
                  order: 1,
                },
                {
                  description:
                    "Keep Function Focused - Let the helper decide availability from copy count.",
                  order: 2,
                },
                {
                  description:
                    "Update Call Sites - Replace inline checks with the helper where appropriate.",
                  order: 3,
                },
              ],
            },
            order: 2,
            acceptanceCriteria: {
              create: [
                {
                  description:
                    "`BorrowRecords.tsx` uses `isBookAvailable` from `client/src/utils/helpers.ts` for availability filtering",
                  isRequired: true,
                  order: 1,
                },
                {
                  description:
                    "Inline availability checks in `BorrowRecords.tsx` are replaced by helper usage",
                  isRequired: true,
                  order: 2,
                },
                {
                  description:
                    "Availability filtering follows helper output, even when helper logic changes",
                  isRequired: true,
                  order: 3,
                },
                {
                  description:
                    "Validation is outcome-based and allows different coding styles, as long as requirements are met",
                  isRequired: true,
                  order: 4,
                },
                {
                  description:
                    "Borrow/Issue behavior remains correct after refactor",
                  isRequired: true,
                  order: 5,
                },
                {
                  description:
                    "Only books with available copies are selectable in Issue Book flow after refactor",
                  isRequired: true,
                  order: 6,
                },
                {
                  description:
                    "No regressions appear in related components using borrow flow",
                  isRequired: true,
                  order: 7,
                },
                {
                  description:
                    "Tests should verify behavior/contract, not enforce one exact line-by-line implementation",
                  isRequired: true,
                  order: 8,
                },
              ],
            },
          },
        ],
      },
    },
    {
      id: "level-3",
      title: "Debugging and Stabilizing the Backend",
      subtitle:
        "Trace return-flow issues and enforce transactional consistency.",
      order: 3,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      levelDescription:
        "Mission Briefing: Returning books occasionally causes negative available copy counts. Your mission is to debug the return flow, identify why the copy counts are going negative, and implement a fix to ensure the library's inventory stays accurate.",
      xpReward: 40,
      coinReward: 200,
      keyTakeaways: "Prisma migrations synchronize your PostgreSQL database schema with your Express + React application code changes. They prevent schema drift between development, staging, and production environments, ensuring database consistency across the entire React + Express + Prisma stack. Migrations are essential for maintaining data integrity in production PostgreSQL databases.\n\nDatabase transactions in Prisma ensure atomic operations when updating related PostgreSQL records through Express APIs. They prevent partial updates that could leave your database inconsistent, which is critical for React applications handling financial and inventory data. Always wrap related database operations in transactions to maintain data integrity in Express + Prisma + PostgreSQL applications.",
      scenarioId: "react-express-postgres-prisma-scenario-1",
      tasks: {
        create: [
          {
            taskName: "Diagnose Return Flow",
            testType: "server", // borrow.controller.ts is server-side
            userStory:
              "As a backend developer, I want to trace the return flow in the server, So that I can identify why available copy counts can become invalid.",
            hints: {
              create: [
                {
                  description:
                    "Start from Return Flow - Inspect `server/src/controllers/borrow.controller.ts` in `returnBook` and trace the full write path.",
                  order: 1,
                },
                {
                  description:
                    "Verify Prisma Write Sequence - Check whether borrow record update and book copy update are split across separate Prisma calls.",
                  order: 2,
                },
                {
                  description:
                    "Capture Root Cause Evidence - Reproduce the failure path where one write can succeed while another fails, then document the exact sequence and why it can leave inconsistent state.",
                  order: 3,
                },
              ],
            },
            order: 1,
            acceptanceCriteria: {
              create: [
                {
                  description:
                    "A reproducible case for negative stock is documented",
                  isRequired: true,
                  order: 1,
                },
                {
                  description:
                    "Problematic backend logic path is identified with evidence",
                  isRequired: true,
                  order: 2,
                },
                {
                  description: "Backend controller/service flow is validated",
                  isRequired: true,
                  order: 3,
                },
                {
                  description: "Prisma query sequence is validated",
                  isRequired: true,
                  order: 4,
                },
              ],
            },
          },
          {
            taskName: "Enforce Transaction Safety",
            testType: "server", // Prisma transactions are server-side
            userStory:
              "As a backend engineer, I want the borrow and return flows in `server/src/controllers/borrow.controller.ts` to run atomically, So that concurrent requests cannot corrupt `availableCopies` and partial writes are never persisted.",
            hints: {
              create: [
                {
                  description:
                    "Prisma Transactions - Wrap related writes in `prisma.$transaction(...)` so return updates are all-or-nothing.",
                  order: 1,
                },
                {
                  description:
                    "Guard Conditions - Protect inventory updates with a safe condition (for example, conditional update) so concurrent borrow requests cannot underflow stock.",
                  order: 2,
                },
                {
                  description:
                    "Verify with Stress Cases - Focus on `server/src/controllers/borrow.controller.ts` and validate behavior with concurrent borrow requests and return-write failure scenarios.",
                  order: 3,
                },
              ],
            },
            order: 2,
            acceptanceCriteria: {
              create: [
                {
                  description:
                    "Return flow updates (`BorrowRecord` + `Book.availableCopies`) run in one Prisma transaction",
                  isRequired: true,
                  order: 1,
                },
                {
                  description:
                    "If one write fails, no partial state is persisted",
                  isRequired: true,
                  order: 2,
                },
                {
                  description:
                    "Concurrent borrow requests never reduce `availableCopies` below zero",
                  isRequired: true,
                  order: 3,
                },
                {
                  description:
                    "Only valid borrow/return outcomes are committed under concurrent access",
                  isRequired: true,
                  order: 4,
                },
              ],
            },
          },
        ],
      },
    },
    {
      id: "level-4",
      title: "Starting my Full-Stack Journey",
      subtitle: "Implement Reservation Queue and Lifecycle Management",
      order: 4,
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      levelDescription:
        "Mission Briefing: The Library is implementing a reservation system for popular books. Your task is to build a reservation feature that allows users to reserve a book when all copies are borrowed and receive notifications when the book becomes available.",
      xpReward: 60,
      coinReward: 300,
      keyTakeaways: "Input validation and sanitization are critical for Express API security and PostgreSQL data integrity in React applications. They prevent malicious input from corrupting your database and protect against attacks. Always validate and sanitize user inputs in Express routes before they reach Prisma and PostgreSQL. This creates secure, reliable APIs that safely handle React frontend data submissions.\n\nProper error handling in Express APIs and React components creates better user experiences in full-stack applications. Clear error messages help users understand issues, while graceful error handling prevents React app crashes. Implement comprehensive error boundaries in React and meaningful error responses in Express routes. This ensures reliable, user-friendly React + Express + PostgreSQL + Prisma applications.",
      scenarioId: "react-express-postgres-prisma-scenario-1",
      tasks: {
        create: [
          {
            taskName: "Reserve an Unavailable Book",
            testType: "both", // client/src/services/libraryService.ts + server/src/controllers/reservation.controller.ts
            userStory:
              "As a library member, I want to reserve a book when all copies are borrowed, So that I can claim it when it becomes available.",
            hints: {
              create: [
                {
                  description:
                    "Keep Reservation Eligibility Explicit - Reservation creation should pass only when book copies are `0`. Validate this on the server before insert.",
                  order: 1,
                },
                {
                  description:
                    "Assign Queue Position Server-Side - Compute `queuePosition` in backend create flow so client stays presentation-only.",
                  order: 2,
                },
                {
                  description:
                    "Return Display-Ready Queue Rows - Include `member` and `book` relation fields needed by UI in the queue response.",
                  order: 3,
                },
                {
                  description:
                    "Keep Task-1 Scope Strict - Task-1 is only reservation creation and queue visibility. Fulfillment and cancellation belong to task-2.",
                  order: 4,
                },
              ],
            },
            order: 1,
            acceptanceCriteria: {
              create: [
                {
                  description:
                    "`POST /api/reservations` returns HTTP `201` with `{ success: true, data: Reservation }` for valid requests",
                  isRequired: true,
                  order: 1,
                },
                {
                  description: "Request body includes `bookId` and `memberId`",
                  isRequired: true,
                  order: 2,
                },
                {
                  description:
                    "Reservation create is allowed only when target book has `availableCopies === 0`",
                  isRequired: true,
                  order: 3,
                },
                {
                  description:
                    "Duplicate active reservation for the same member and book returns HTTP `400`",
                  isRequired: true,
                  order: 4,
                },
                {
                  description:
                    "Required implementation names are exact and case-sensitive: `createReservation` in `server/src/controllers/reservation.controller.ts`, `createReservation` in `client/src/services/libraryService.ts`, Route path is `/api/reservations` in `server/src/routes/reservation.routes.ts`",
                  isRequired: true,
                  order: 5,
                },
                {
                  description:
                    "`GET /api/reservations?bookId=<id>` returns HTTP `200` with `{ success: true, data: ReservationQueueRow[] }`",
                  isRequired: true,
                  order: 6,
                },
                {
                  description:
                    "Each queue row includes `id`, `bookId`, `memberId`, `queuePosition`, `status`, `createdAt`",
                  isRequired: true,
                  order: 7,
                },
                {
                  description:
                    "Each queue row includes display-ready relation data: `member.name` and `book.title`",
                  isRequired: true,
                  order: 8,
                },
                {
                  description:
                    "Queue response is ordered by `queuePosition` ascending",
                  isRequired: true,
                  order: 9,
                },
                {
                  description:
                    "`client/src/pages/Books.tsx` renders `Reserve Book` only when `availableCopies` is `0`",
                  isRequired: true,
                  order: 10,
                },
                {
                  description:
                    "Borrow action stays primary when `availableCopies` is greater than `0`",
                  isRequired: true,
                  order: 11,
                },
                {
                  description:
                    "Reserve action triggers `createReservation(...)` from `client/src/services/libraryService.ts`",
                  isRequired: true,
                  order: 12,
                },
                {
                  description:
                    "Reservation errors (book available, duplicate reservation, invalid member) are shown in UI",
                  isRequired: true,
                  order: 13,
                },
                {
                  description:
                    "After successful reservation, UI confirms queue position (for example: `You are #3 in line.`)",
                  isRequired: true,
                  order: 14,
                },
                {
                  description:
                    "Queue length and position display are based on backend response, not hard-coded client math",
                  isRequired: true,
                  order: 15,
                },
                {
                  description:
                    "Empty queue state for a book displays `No active reservations.`",
                  isRequired: true,
                  order: 16,
                },
              ],
            },
          },
          {
            taskName: "Fulfill and Manage Reservation Lifecycle",
            testType: "both", // client reservation list + server return/cancel flow
            userStory:
              "As a librarian, I want reservation fulfillment and cancellation to update queue order automatically, So that members always see accurate reservation status and position.",
            hints: {
              create: [
                {
                  description:
                    "Model the Reservation Lifecycle - Use explicit reservation states (`RESERVED`, `READY_FOR_PICKUP`, `CANCELLED`) and transition between them intentionally.",
                  order: 1,
                },
                {
                  description:
                    "Keep Queue Mutations Transactional - Promotion and queue reindex should happen inside one transactional operation to avoid race conditions.",
                  order: 2,
                },
                {
                  description:
                    "Centralize Queue Reindex Logic - Put queue position recalculation in one server helper so return flow and cancellation reuse the same behavior.",
                  order: 3,
                },
                {
                  description:
                    "Use Backend as Source of Truth - Client should render reservation status and position from API responses rather than deriving them locally.",
                  order: 4,
                },
              ],
            },
            order: 2,
            acceptanceCriteria: {
              create: [
                {
                  description:
                    "In `returnBook` flow, when a returned book has active reservations and stock becomes available, first queue entry is updated to `READY_FOR_PICKUP`",
                  isRequired: true,
                  order: 1,
                },
                {
                  description:
                    "Queue progression updates happen in the same transactional boundary as return updates",
                  isRequired: true,
                  order: 2,
                },
                {
                  description:
                    "Required implementation names are exact and case-sensitive: `returnBook` in `server/src/controllers/borrow.controller.ts`, `promoteNextReservation` in `server/src/controllers/reservation.controller.ts`",
                  isRequired: true,
                  order: 3,
                },
                {
                  description:
                    "`DELETE /api/reservations/:id` (or equivalent cancel endpoint) marks reservation as `CANCELLED`",
                  isRequired: true,
                  order: 4,
                },
                {
                  description:
                    "Cancellation triggers queue reindex so remaining active reservations have continuous positions (`1..n`)",
                  isRequired: true,
                  order: 5,
                },
                {
                  description:
                    "Cancelling an already cancelled or fulfilled reservation returns HTTP `400`",
                  isRequired: true,
                  order: 6,
                },
                {
                  description:
                    "Required implementation names are exact and case-sensitive: `cancelReservation` in `server/src/controllers/reservation.controller.ts`, `cancelReservation` in `client/src/services/libraryService.ts`",
                  isRequired: true,
                  order: 7,
                },
                {
                  description:
                    "Client provides a reservation list view for the member showing `book.title`, `queuePosition`, and `status`",
                  isRequired: true,
                  order: 8,
                },
                {
                  description:
                    "Rows with `READY_FOR_PICKUP` are visually distinct from `RESERVED`",
                  isRequired: true,
                  order: 9,
                },
                {
                  description: "Empty state displays `No reservations found.`",
                  isRequired: true,
                  order: 10,
                },
                {
                  description:
                    "On successful cancellation, UI confirms: `Reservation cancelled.`",
                  isRequired: true,
                  order: 11,
                },
                {
                  description:
                    "On queue updates, affected members see updated position values from backend response",
                  isRequired: true,
                  order: 12,
                },
                {
                  description:
                    "UI never computes lifecycle status from local assumptions; it uses server status output",
                  isRequired: true,
                  order: 13,
                },
              ],
            },
          },
        ],
      },
    },
    {
      id: "level-5",
      title: "The Production Struggle",
      subtitle: "Investigate and fix a critical production issue.",
      order: 5,
      deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      levelDescription:
        "Mission Briefing: Congratulations! The project is in production, but a critical issue has been reported by the client. Your mission is to investigate the problem, identify the root cause, and deliver a fix as soon as possible to maintain system reliability.",
      xpReward: 75,
      coinReward: 375,
      keyTakeaways: "Pagination is essential for handling large datasets in React applications consuming Express APIs with PostgreSQL. It improves frontend performance and user experience by loading data incrementally instead of overwhelming the React UI with massive datasets. Implement proper pagination with clear navigation controls and loading states for scalable React + Express + PostgreSQL applications.\n\nAutomated testing is crucial for maintaining code quality in React + Express + Prisma + PostgreSQL applications. Tests ensure that React component changes, Express API modifications, and Prisma database operations work correctly together and prevent regressions. Always write tests for critical business logic and user interactions to maintain reliable full-stack applications.",
      scenarioId: "react-express-postgres-prisma-scenario-1",
      tasks: {
        create: [
          {
            taskName: "Stabilize Overdue Report Classification",
            testType: "server", // overdue report logic is in server borrow controller
            userStory:
              "As a developer, I want the overdue report to classify records by source-of-truth fields, So that client-visible overdue output remains correct even with stale status data.",
            hints: {
              create: [
                {
                  description:
                    "Trust Source-of-Truth Fields - Use `returnedAt` and `dueDate` as primary decision fields instead of relying on status alone.",
                  order: 1,
                },
                {
                  description:
                    "Guard Against Stale Status - Returned records may still carry `BORROWED` or `OVERDUE`; overdue output should still stay correct.",
                  order: 2,
                },
                {
                  description:
                    "Use Deterministic UTC Fixtures - Use fixed UTC timestamps around midnight to make boundary behavior reproducible.",
                  order: 3,
                },
              ],
            },
            order: 1,
            acceptanceCriteria: {
              create: [
                {
                  description:
                    "`/api/borrow-records/overdue` excludes any record with `returnedAt != null` regardless of status value",
                  isRequired: true,
                  order: 1,
                },
                {
                  description:
                    "`/api/borrow-records/overdue` includes past-due unreturned records",
                  isRequired: true,
                  order: 2,
                },
                {
                  description:
                    "A stale-status discrepancy case is reproducible and covered by tests",
                  isRequired: true,
                  order: 3,
                },
                {
                  description:
                    "A UTC midnight boundary case is covered by deterministic test data",
                  isRequired: true,
                  order: 4,
                },
              ],
            },
          },
          {
            taskName: "Deliver Permanent Fix and Documentation",
            testType: "server", // overdue fix and utility is server-side
            userStory:
              "As a developer, I want to fix overdue mismatches and document the root cause, So that the client can trust overdue reports.",
            hints: {
              create: [
                {
                  description:
                    "Add Regression Tests - Capture the original bug in tests before implementing the fix.",
                  order: 1,
                },
                {
                  description:
                    "Centralize Date Logic - Keep overdue determination in one shared utility.",
                  order: 2,
                },
                {
                  description:
                    "Write a Postmortem Note - Include symptom, root cause, fix, and prevention actions.",
                  order: 3,
                },
              ],
            },
            order: 2,
            acceptanceCriteria: {
              create: [
                {
                  description: "Incorrect overdue markings are resolved",
                  isRequired: true,
                  order: 1,
                },
                {
                  description: "Returned items are no longer listed overdue",
                  isRequired: true,
                  order: 2,
                },
                {
                  description:
                    "Overdue reports match source borrowing and return records",
                  isRequired: true,
                  order: 3,
                },
                {
                  description: "Spot checks confirm data consistency",
                  isRequired: true,
                  order: 4,
                },
                {
                  description: "Root cause is documented",
                  isRequired: true,
                  order: 5,
                },
                {
                  description:
                    "Fix approach and validation steps are documented",
                  isRequired: true,
                  order: 6,
                },
              ],
            },
          },
        ],
      },
    },
    {
      id: "nextjs-shadcn-ui-level-1",
      title: "Setup & Simple UI Fixes",
      subtitle: "Configure environment and make minor UI updates",
      order: 1,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      levelDescription:
        "Mission Briefing: The library has onboarded a new developer (you!) and needs the system running locally with minor UI tweaks and environment configuration. Set up the Next.js development environment, configure environment variables, and make initial UI text updates to get the library management system running.",
      xpReward: 10,
      coinReward: 20,
      keyTakeaways:
        "Mastering Next.js + shadcn/ui development environments requires understanding package management (npm/pnpm), NEXT_PUBLIC_* environment variables for client-visible configuration, and the Next.js dev server for instant feedback. Proper `.env.local` setup keeps app names, API keys, and tenant-specific values out of source code, ensuring consistent development across team members and reliable deployments. Every Next.js + shadcn/ui application starts with this crucial foundation.\n\nNext.js layout components and page metadata enable consistent UI text driven from a single source of truth, with shadcn/ui components carrying the visual styling out of the box. Reading `NEXT_PUBLIC_APP_NAME` from environment variables in `layout.tsx` and propagating it through the dashboard header is essential for building maintainable Next.js applications where brand and tenant labels can change without code edits. This configuration-as-content pattern is fundamental to portable Next.js + shadcn/ui applications.",
      scenarioId: "nextjs-shadcn-ui-scenario-1",
      tasks: {
        create: [
          {
            taskName: "Environment Setup",
            testType: "client",
            userStory:
              "As a developer, I want to set up the development environment so that I can start working on the project.",
            hints: {
              create: [
                {
                  description: "Install dependencies using npm install",
                  order: 1,
                },
                {
                  description:
                    "Create .env.local file with required environment variables",
                  order: 2,
                },
                {
                  description:
                    "Start the development server and verify it loads",
                  order: 3,
                },
              ],
            },
            order: 1,
            acceptanceCriteria: {
              create: [
                {
                  description: "App runs without errors on npm run dev",
                  isRequired: true,
                  order: 1,
                },
                {
                  description: ".env.local file is properly configured",
                  isRequired: true,
                  order: 2,
                },
                {
                  description: "Development server starts successfully",
                  isRequired: true,
                  order: 3,
                },
              ],
            },
          },
          {
            taskName: "Update UI Text",
            testType: "client",
            userStory:
              "As a user, I want to see the correct library name and page titles so that I know which system I'm using.",
            hints: {
              create: [
                {
                  description:
                    "Update layout.tsx to use NEXT_PUBLIC_APP_NAME for page title",
                  order: 1,
                },
                {
                  description: "Change 'Sign Up' to 'Register' on auth pages",
                  order: 2,
                },
                {
                  description:
                    "Update dashboard header to display 'BookStop Public Library'",
                  order: 3,
                },
              ],
            },
            order: 2,
            acceptanceCriteria: {
              create: [
                {
                  description: "Page title reflects the environment variable",
                  isRequired: true,
                  order: 1,
                },
                {
                  description: "Updated text appears correctly in the UI",
                  isRequired: true,
                  order: 2,
                },
                {
                  description: "Dashboard header shows correct library name",
                  isRequired: true,
                  order: 3,
                },
              ],
            },
          },
        ],
      },
    },
    {
      id: "nextjs-shadcn-ui-level-2",
      title: "Bug Fixing & Refactoring",
      subtitle: "Fix status display issues and refactor code",
      order: 2,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      levelDescription:
        "Mission Briefing: Users report that the book status display is inconsistent and the code needs cleanup. Fix the status badge colors and refactor the book filtering logic to use proper React patterns.",
      xpReward: 25,
      coinReward: 50,
      keyTakeaways:
        "`useMemo` in Next.js + shadcn/ui applications is essential for derived state like book filtering — it caches expensive `.filter()` and grouping work between renders and keeps related shape (`availableBooks`, `borrowedBooks`, `overdueBooks`) co-located. Centralizing one memoized derivation in a Next.js client component prevents the inconsistencies you get when three separate `.filter()` calls drift across renders and makes the dashboard predictable.\n\nExtracting repeated row JSX into a reusable `BookRow` component reduces drift across pages that should look the same and lets shadcn/ui `Badge` components carry tier-specific colors consistently. Combined with explicit Tailwind classes per status (green for available, blue for borrowed, red for overdue), this delivers accessible, scannable UI in any Next.js + shadcn/ui application without relying on default variant palettes that drift across themes.",
      scenarioId: "nextjs-shadcn-ui-scenario-1",
      tasks: {
        create: [
          {
            taskName: "Fix Status Badge Colors",
            testType: "client",
            userStory:
              "As a user, I want to see distinct colors for different book statuses so that I can quickly identify book availability.",
            hints: {
              create: [
                {
                  description: "Ensure 'available' status shows green color",
                  order: 1,
                },
                {
                  description: "Ensure 'borrowed' status shows blue color",
                  order: 2,
                },
                {
                  description: "Ensure 'overdue' status shows red color",
                  order: 3,
                },
              ],
            },
            order: 1,
            acceptanceCriteria: {
              create: [
                {
                  description: "Each status has a distinct color",
                  isRequired: true,
                  order: 1,
                },
                {
                  description: "Colors match the status type correctly",
                  isRequired: true,
                  order: 2,
                },
              ],
            },
          },
          {
            taskName: "Refactor Book Filtering",
            testType: "client",
            userStory:
              "As a developer, I want to use useMemo for book filtering so that the application performs better and the code is more maintainable.",
            hints: {
              create: [
                {
                  description:
                    "Create a single useMemo hook for book filtering",
                  order: 1,
                },
                {
                  description:
                    "Return an object with availableBooks, borrowedBooks, and overdueBooks",
                  order: 2,
                },
                {
                  description: "Create and use a BookRow component",
                  order: 3,
                },
              ],
            },
            order: 2,
            acceptanceCriteria: {
              create: [
                {
                  description: "useMemo is used for book filtering",
                  isRequired: true,
                  order: 1,
                },
                {
                  description: "BookRow component exists and works correctly",
                  isRequired: true,
                  order: 2,
                },
                {
                  description: "Dashboard uses the new component",
                  isRequired: true,
                  order: 3,
                },
              ],
            },
          },
        ],
      },
    },
    {
      id: "nextjs-shadcn-ui-level-3",
      title: "Feature Development",
      subtitle: "Add search and borrow functionality",
      order: 3,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      levelDescription:
        "Mission Briefing: The library wants to expand functionality with new features for better book management. Implement search functionality and a borrow system with modal dialogs.",
      xpReward: 40,
      coinReward: 100,
      keyTakeaways:
        "Real-time client-side search and filtering in Next.js + shadcn/ui give users an immediate, responsive way to slice large datasets without round-tripping to a server. Combining a controlled input with a `useMemo`-derived filter keeps the UI snappy and the rendering logic simple, which is the right default for client-rendered Next.js pages backed by shadcn/ui primitives.\n\nshadcn/ui `Dialog` components provide accessible, keyboard-friendly modal interfaces out of the box, which makes borrow confirmation and borrower-detail capture straightforward in a Next.js application. Pairing a `Dialog` with a controlled form and an action handler that updates client state is the canonical pattern for adding write flows like borrows and returns to a client-only Next.js + shadcn/ui application.",
      scenarioId: "nextjs-shadcn-ui-scenario-1",
      tasks: {
        create: [
          {
            taskName: "Add Search & Borrow Features",
            testType: "client",
            userStory:
              "As a user, I want to search for books and borrow available books so that I can find and reserve books easily.",
            hints: {
              create: [
                {
                  description:
                    "Add search input that filters books by title or author",
                  order: 1,
                },
                {
                  description:
                    "Show 'No books found' when search yields no results",
                  order: 2,
                },
                {
                  description:
                    "Add Borrow button that opens a modal with borrower details",
                  order: 3,
                },
              ],
            },
            order: 1,
            acceptanceCriteria: {
              create: [
                {
                  description: "Search filters books in real-time",
                  isRequired: true,
                  order: 1,
                },
                {
                  description: "Borrow modal works and updates the UI",
                  isRequired: true,
                  order: 2,
                },
              ],
            },
          },
          {
            taskName: "Create Returns Page",
            testType: "client",
            userStory:
              "As a librarian, I want to process book returns so that I can update the system when books are returned.",
            hints: {
              create: [
                {
                  description:
                    "Create returns page with borrowed books table",
                  order: 1,
                },
                {
                  description: "Add Return button to process returns",
                  order: 2,
                },
                {
                  description: "Update borrow record status to 'returned'",
                  order: 3,
                },
              ],
            },
            order: 2,
            acceptanceCriteria: {
              create: [
                {
                  description: "Returns page processes returns correctly",
                  isRequired: true,
                  order: 1,
                },
                {
                  description: "Borrow records are updated on return",
                  isRequired: true,
                  order: 2,
                },
              ],
            },
          },
        ],
      },
    },
    {
      id: "nextjs-shadcn-ui-level-4",
      title: "Integration & Edge Cases",
      subtitle: "Handle validation and data persistence",
      order: 4,
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      levelDescription:
        "Mission Briefing: Edge cases and data integrity issues arise when multiple operations happen. Add validation, confirmation dialogs, and data persistence to ensure a robust application.",
      xpReward: 60,
      coinReward: 150,
      keyTakeaways:
        "Date math in Next.js + shadcn/ui applications requires careful handling of timezones and boundary conditions — a due date computed as `today + 14 days` must be normalized and formatted (YYYY-MM-DD) so that overdue checks are deterministic across client renders. Blocking borrow actions on overdue records at the validation layer in a Next.js client component prevents bad state from ever entering the UI in the first place.\n\n`localStorage` gives Next.js + shadcn/ui applications client-side persistence with no backend, and a custom `useLocalStorage` hook abstracts the hydrate-on-mount + persist-on-set pattern so multiple components can share it without duplicating effects. Pairing persistence with shadcn/ui `AlertDialog` confirmations means destructive actions like borrow and return never silently lose user data, even in a fully client-rendered Next.js app.",
      scenarioId: "nextjs-shadcn-ui-scenario-1",
      tasks: {
        create: [
          {
            taskName: "Add Validation & Date Handling",
            testType: "client",
            userStory:
              "As a user, I want proper validation and date handling so that the system prevents invalid operations.",
            hints: {
              create: [
                {
                  description: "Prevent borrowing of overdue books",
                  order: 1,
                },
                {
                  description:
                    "Auto-calculate due date to 14 days from current date",
                  order: 2,
                },
                {
                  description: "Format due date as YYYY-MM-DD",
                  order: 3,
                },
              ],
            },
            order: 1,
            acceptanceCriteria: {
              create: [
                {
                  description: "Overdue books cannot be borrowed",
                  isRequired: true,
                  order: 1,
                },
                {
                  description: "Due date auto-calculates correctly",
                  isRequired: true,
                  order: 2,
                },
              ],
            },
          },
          {
            taskName: "Add Confirmation & Persistence",
            testType: "client",
            userStory:
              "As a user, I want confirmation dialogs and data persistence so that I don't lose data accidentally.",
            hints: {
              create: [
                {
                  description:
                    "Add confirmation dialogs before borrowing and returning",
                  order: 1,
                },
                {
                  description: "Persist all data to localStorage",
                  order: 2,
                },
                {
                  description: "Create useLocalStorage hook",
                  order: 3,
                },
              ],
            },
            order: 2,
            acceptanceCriteria: {
              create: [
                {
                  description: "Confirmation dialogs appear before actions",
                  isRequired: true,
                  order: 1,
                },
                {
                  description: "Data persists across page refreshes",
                  isRequired: true,
                  order: 2,
                },
              ],
            },
          },
        ],
      },
    },
    {
      id: "nextjs-shadcn-ui-level-5",
      title: "Real Client Issue",
      subtitle: "Fix overdue bug and create utilities",
      order: 5,
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      levelDescription:
        "Mission Briefing: Fix a critical overdue status bug reported by clients and create reusable date utilities while updating documentation for maintainability.",
      xpReward: 75,
      coinReward: 200,
      keyTakeaways:
        "Bug fixing in a Next.js + shadcn/ui codebase requires systematic debugging — reproduce the overdue mismatch with deterministic test data, then trace the calculation to the field that's wrong rather than the UI that displays it. A standalone overdue report page in Next.js makes the fix observable in isolation, which keeps regressions visible and lets shadcn/ui Table components surface accurate data immediately.\n\nCentralizing date logic into a reusable utility module (`src/lib/dateUtils.ts`) makes Next.js + shadcn/ui applications easier to maintain because every page calls the same calculation and any future fix lands in one place. Updated documentation with usage examples and inline comments explaining the fix is what makes the codebase actually onboardable to the next developer who picks up the Next.js + shadcn/ui project.",
      scenarioId: "nextjs-shadcn-ui-scenario-1",
      tasks: {
        create: [
          {
            taskName: "Fix Overdue Bug & Build Report",
            testType: "client",
            userStory:
              "As a client, I want overdue statuses to be accurate so that library operations run smoothly.",
            hints: {
              create: [
                {
                  description:
                    "Investigate and fix the overdue status bug",
                  order: 1,
                },
                {
                  description: "Create overdue report page",
                  order: 2,
                },
                {
                  description: "Add 'Mark as Returned' functionality",
                  order: 3,
                },
              ],
            },
            order: 1,
            acceptanceCriteria: {
              create: [
                {
                  description: "Overdue status calculation is fixed",
                  isRequired: true,
                  order: 1,
                },
                {
                  description:
                    "Overdue report page displays accurate information",
                  isRequired: true,
                  order: 2,
                },
              ],
            },
          },
          {
            taskName: "Create Utilities & Documentation",
            testType: "client",
            userStory:
              "As a developer, I want reusable date utilities and documentation so that the codebase is maintainable.",
            hints: {
              create: [
                {
                  description: "Create date utility functions",
                  order: 1,
                },
                {
                  description: "Update documentation with usage examples",
                  order: 2,
                },
                {
                  description: "Add code comments explaining the fix",
                  order: 3,
                },
              ],
            },
            order: 2,
            acceptanceCriteria: {
              create: [
                {
                  description: "Date utilities handle all date operations",
                  isRequired: true,
                  order: 1,
                },
                {
                  description: "Documentation is updated with examples",
                  isRequired: true,
                  order: 2,
                },
              ],
            },
          },
        ],
      },
    },
    {
      id: "nextjs-shadcn-ui-scenario-2-level-1",
      title: "Onboarding the Support Portal",
      subtitle: "Configure environment and update UI text",
      order: 1,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      levelDescription:
        "Mission Briefing: City Hall has onboarded a new developer (you!) and needs the customer support portal running locally with environment configuration and minor UI tweaks. Set up the Next.js development environment, configure environment variables for the support phone, email, and app name, then update hard-coded UI text to use these variables.",
      xpReward: 10,
      coinReward: 20,
      keyTakeaways:
        "Mastering Next.js + shadcn/ui development environments requires understanding package management, NEXT_PUBLIC_* environment variables for centralizing tenant-specific contact details, and the Next.js dev server for instant feedback. Configuring `NEXT_PUBLIC_SUPPORT_PHONE` and `NEXT_PUBLIC_SUPPORT_EMAIL` in `client/.env.local` keeps phone numbers and email addresses out of source code and ready for white-labelling across tenants. Every Next.js + shadcn/ui support portal starts with this crucial foundation.\n\nReplacing hard-coded UI text on the home page, support page, and agent login with environment-driven values is a small change with outsized impact — it forces a Next.js codebase to treat tenant data as configuration rather than content. Consistent shadcn/ui `Button` labels ('Login', 'Logout') across pages then make the portal feel polished and identifiable to citizens and agents alike, which is the visual contract any Next.js + shadcn/ui application should uphold.",
      scenarioId: "nextjs-shadcn-ui-scenario-2",
      tasks: {
        create: [
          {
            taskName: "Environment Setup",
            testType: "client",
            userStory:
              "As a developer, I want to install dependencies and configure environment variables so that the support portal runs locally with the correct contact details.",
            hints: {
              create: [
                {
                  description:
                    "Run `npm install` at the project root and inside the `client/` folder.",
                  order: 1,
                },
                {
                  description:
                    "Create `client/.env.local` with NEXT_PUBLIC_APP_NAME, NEXT_PUBLIC_SUPPORT_PHONE, and NEXT_PUBLIC_SUPPORT_EMAIL.",
                  order: 2,
                },
                {
                  description:
                    "Replace hard-coded phone/email in `src/app/page.tsx` and `src/app/support/page.tsx` with the env values.",
                  order: 3,
                },
              ],
            },
            order: 1,
            acceptanceCriteria: {
              create: [
                {
                  description: "App runs without errors on `npm run dev`",
                  isRequired: true,
                  order: 1,
                },
                {
                  description:
                    "`.env.local` defines NEXT_PUBLIC_APP_NAME, NEXT_PUBLIC_SUPPORT_PHONE, NEXT_PUBLIC_SUPPORT_EMAIL",
                  isRequired: true,
                  order: 2,
                },
                {
                  description:
                    "Footer phone/email render from environment variables on home and support pages",
                  isRequired: true,
                  order: 3,
                },
              ],
            },
          },
          {
            taskName: "UI Text Updates",
            testType: "client",
            userStory:
              "As a user, I want consistent button labels and a configurable app heading so that the portal feels polished and identifiable.",
            hints: {
              create: [
                {
                  description:
                    "Change the agent login button label from 'Sign In' to 'Login' in `src/app/agent/login/page.tsx`.",
                  order: 1,
                },
                {
                  description:
                    "Change the support page logout label from 'Return to menu' to 'Logout' in `src/app/support/page.tsx`.",
                  order: 2,
                },
                {
                  description:
                    "Render the home page heading from `NEXT_PUBLIC_APP_NAME` in `src/app/page.tsx`.",
                  order: 3,
                },
              ],
            },
            order: 2,
            acceptanceCriteria: {
              create: [
                {
                  description: "Agent login button reads 'Login'",
                  isRequired: true,
                  order: 1,
                },
                {
                  description: "Support page logout button reads 'Logout'",
                  isRequired: true,
                  order: 2,
                },
                {
                  description: "Home page heading reflects NEXT_PUBLIC_APP_NAME",
                  isRequired: true,
                  order: 3,
                },
              ],
            },
          },
        ],
      },
    },
    {
      id: "nextjs-shadcn-ui-scenario-2-level-2",
      title: "A Smarter Self-Service Layer",
      subtitle: "Build an intent-matching AI engine and agent quick replies",
      order: 2,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      levelDescription:
        "Mission Briefing: The AI assistant answers with the first keyword it stumbles across, so a citizen asking a permit question about their tax bill only ever hears about permits. Meanwhile agents retype the same greetings and closings dozens of times a day. Build a scored intent matcher to replace the order-dependent getAIResponse, and add a library of one-click quick-reply snippets to the agent dashboard.",
      xpReward: 30,
      coinReward: 50,
      keyTakeaways:
        "A scored intent matcher is the canonical fix for order-dependent keyword logic in a Next.js + shadcn/ui chat experience: instead of returning the first keyword that matches, `matchIntent` counts how many keywords of each intent appear in the input and returns the strongest, falling back to a dedicated `fallback` intent when nothing scores. Keeping the keyword map and reply copy in a self-contained `src/lib/intentMatcher.ts` module makes the support page a thin consumer of `getAssistantReply` — testable in isolation and reusable anywhere the portal needs an answer.\n\nAgent quick replies show how a tiny data module (`src/lib/quickReplies.ts` — a non-empty array of `{ id, label, text }` snippets) plus a row of shadcn/ui `Button`s removes real friction from a Next.js dashboard. The important interaction detail is *append, don't replace*: clicking a snippet must add its text to whatever the agent has already typed, never overwrite it. Driving the button row from the data array means every new snippet renders for free with no extra JSX.",
      scenarioId: "nextjs-shadcn-ui-scenario-2",
      tasks: {
        create: [
          {
            taskName: "Intent-Matching AI Engine",
            testType: "client",
            userStory:
              "As a citizen, I want the assistant to weigh every keyword in my question so that it answers the topic I actually care about.",
            hints: {
              create: [
                {
                  description:
                    "Create `src/lib/intentMatcher.ts` with a keyword map for the permits, taxes, trash, utilities, parking, and hours intents.",
                  order: 1,
                },
                {
                  description:
                    "Export `matchIntent(input)` that scores keyword hits (case-insensitive substring matches), returns the highest-scoring intent, and returns `{ intent: 'fallback', score: 0 }` when nothing matches.",
                  order: 2,
                },
                {
                  description:
                    "Export `getAssistantReply(input)` returning a helpful reply per intent; the fallback reply must offer to connect the citizen to a human agent.",
                  order: 3,
                },
                {
                  description:
                    "Replace the inline `getAIResponse` logic in the support page chat flow (`src/app/support/page.tsx`) with `getAssistantReply`.",
                  order: 4,
                },
              ],
            },
            order: 1,
            acceptanceCriteria: {
              create: [
                {
                  description:
                    "`matchIntent` scores keyword hits and returns the strongest intent",
                  isRequired: true,
                  order: 1,
                },
                {
                  description:
                    "Unmatched input resolves to the `fallback` intent with score 0",
                  isRequired: true,
                  order: 2,
                },
                {
                  description:
                    "`getAssistantReply` powers the support chat and its fallback reply offers a human agent",
                  isRequired: true,
                  order: 3,
                },
              ],
            },
          },
          {
            taskName: "Agent Quick-Reply Snippets",
            testType: "client",
            userStory:
              "As an agent, I want one-click canned snippets so that I do not retype the same greetings and closings all day.",
            hints: {
              create: [
                {
                  description:
                    "Create `src/lib/quickReplies.ts` exporting `quickReplies`, a non-empty array of `{ id, label, text }` snippets (e.g. a greeting, a holding line, a closing).",
                  order: 1,
                },
                {
                  description:
                    "On the agent dashboard (`src/app/agent/page.tsx`), render one quick-reply button per snippet directly above the message input, labelled with `snippet.label`.",
                  order: 2,
                },
                {
                  description:
                    "Clicking a snippet appends its `text` to the current message input without erasing text the agent has already typed.",
                  order: 3,
                },
              ],
            },
            order: 2,
            acceptanceCriteria: {
              create: [
                {
                  description:
                    "`src/lib/quickReplies.ts` exports a non-empty array of `{ id, label, text }` snippets",
                  isRequired: true,
                  order: 1,
                },
                {
                  description:
                    "One quick-reply button renders per snippet, labelled with `snippet.label`",
                  isRequired: true,
                  order: 2,
                },
                {
                  description:
                    "Clicking a snippet appends its text and preserves any text already typed",
                  isRequired: true,
                  order: 3,
                },
              ],
            },
          },
        ],
      },
    },
    {
      id: "nextjs-shadcn-ui-scenario-2-level-3",
      title: "Triage & Service Levels",
      subtitle: "Add priority scoring and a first-response SLA indicator",
      order: 3,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      levelDescription:
        "Mission Briefing: The agent dashboard lists conversations in whatever order they arrived. Agents cannot tell who has been waiting longest, who has unread messages piling up, or who still has not had a single reply. Build a priority-scoring module that re-orders the conversation list, and an SLA module that flags every conversation still awaiting a first agent reply.",
      xpReward: 50,
      coinReward: 100,
      keyTakeaways:
        "Priority scoring turns a flat list into a triage queue. A pure `getPriorityScore` helper combines a status weight (waiting outranks active, resolved is always 0), an unread-message bonus, and an age bonus capped so old conversations cannot dominate forever; `getPriorityLevel` then buckets that score into low / normal / high / urgent tiers. Keeping the math in `src/lib/priority.ts` means the Next.js dashboard simply sorts by `getPriorityScore` and renders the tier — the ranking logic is unit-testable and never tangled in JSX.\n\nA first-response SLA indicator is a second pure module (`src/lib/sla.ts`): `hasAgentReplied` checks whether any message has `role === 'agent'`, and `getServiceState` classifies a conversation as resolved, awaiting-first-reply, or in-progress. Surfacing an 'Awaiting first reply' badge plus a header count built from these helpers is how a Next.js + shadcn/ui dashboard makes service-level gaps impossible to miss without scattering status logic across components.",
      scenarioId: "nextjs-shadcn-ui-scenario-2",
      tasks: {
        create: [
          {
            taskName: "Priority Scoring & Sorting",
            testType: "client",
            userStory:
              "As an agent, I want the conversation list ordered by urgency so that I always work the most pressing thread first.",
            hints: {
              create: [
                {
                  description:
                    "Create `src/lib/priority.ts` exporting `getPriorityScore(conversation)`: a resolved conversation always scores 0; otherwise score = statusWeight (40 waiting / 10 active) + unreadCount * 10 + ageBonus.",
                  order: 1,
                },
                {
                  description:
                    "Compute `ageBonus` as `Math.min(Math.floor(hoursSinceCreated), 12)` so old conversations cannot dominate the queue forever.",
                  order: 2,
                },
                {
                  description:
                    "Export `getPriorityLevel(conversation)` mapping the score to a tier: urgent >= 70, high >= 35, normal >= 10, otherwise low.",
                  order: 3,
                },
                {
                  description:
                    "In `src/app/agent/page.tsx`, sort the conversation list by priority score (highest first) and surface each row's priority level.",
                  order: 4,
                },
              ],
            },
            order: 1,
            acceptanceCriteria: {
              create: [
                {
                  description:
                    "`getPriorityScore` ranks waiting above active above resolved and rewards unread messages",
                  isRequired: true,
                  order: 1,
                },
                {
                  description:
                    "`getPriorityLevel` maps scores to the four tiers (low / normal / high / urgent)",
                  isRequired: true,
                  order: 2,
                },
                {
                  description:
                    "The conversation list is sorted by priority score, highest first",
                  isRequired: true,
                  order: 3,
                },
              ],
            },
          },
          {
            taskName: "First-Response SLA Indicator",
            testType: "client",
            userStory:
              "As an agent, I want conversations that have never had a reply flagged so that no citizen is left waiting unseen.",
            hints: {
              create: [
                {
                  description:
                    "Create `src/lib/sla.ts` exporting `hasAgentReplied(conversation)` — true when at least one message has `role === 'agent'`.",
                  order: 1,
                },
                {
                  description:
                    "Export `getServiceState(conversation)` returning 'resolved' when status is resolved, 'awaiting-first-reply' when no agent message exists, otherwise 'in-progress'.",
                  order: 2,
                },
                {
                  description:
                    "On the agent dashboard, show an 'Awaiting first reply' badge on every conversation whose service state is awaiting-first-reply.",
                  order: 3,
                },
                {
                  description:
                    "Add a header stat with the count of conversations awaiting a first reply.",
                  order: 4,
                },
              ],
            },
            order: 2,
            acceptanceCriteria: {
              create: [
                {
                  description:
                    "`hasAgentReplied` detects whether any agent message exists in a conversation",
                  isRequired: true,
                  order: 1,
                },
                {
                  description:
                    "`getServiceState` classifies a conversation as resolved / awaiting-first-reply / in-progress",
                  isRequired: true,
                  order: 2,
                },
                {
                  description:
                    "Conversations with no agent reply show an 'Awaiting first reply' badge and a header count",
                  isRequired: true,
                  order: 3,
                },
              ],
            },
          },
        ],
      },
    },
    {
      id: "nextjs-shadcn-ui-scenario-2-level-4",
      title: "Live Queue & Agent Tooling",
      subtitle: "Build a live wait estimator and agent keyboard shortcuts",
      order: 4,
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      levelDescription:
        "Mission Briefing: When a citizen asks for a human, the app shows a hard-coded '2 in queue' with no idea how long that means. And agents work the dashboard all day with a mouse. Build a real wait estimator wired into the live queue, and add global keyboard handling so agents can triage without touching the mouse.",
      xpReward: 70,
      coinReward: 150,
      keyTakeaways:
        "A live queue estimator is a pair of pure functions in `src/lib/queue.ts`: `estimateWaitMinutes(position, avgHandleMinutes = 4)` returns a never-negative `position * avgHandleMinutes`, and `formatWait(minutes)` renders human copy — 'less than a minute', 'about N minutes', 'over an hour' — and crucially returns an empty string for invalid (NaN / non-finite) input. Wiring these into the 'Connect with an Agent' flow means the citizen sees a real, updating estimate instead of a frozen number, and the safe fallbacks keep a Next.js client component from ever rendering 'NaN minutes'.\n\nGlobal keyboard shortcuts make a Next.js + shadcn/ui dashboard genuinely fast to operate. A `window` `keydown` handler registered in `useEffect` (with a matching cleanup) lets ArrowDown / ArrowUp move the selected conversation, while an input-scoped handler lets Ctrl/Cmd+Enter send and Escape clear the message box. Distinguishing global navigation from input-scoped editing is the key design decision — it keeps shortcuts predictable and avoids hijacking normal typing.",
      scenarioId: "nextjs-shadcn-ui-scenario-2",
      tasks: {
        create: [
          {
            taskName: "Live Queue Estimator",
            testType: "client",
            userStory:
              "As a citizen connecting to an agent, I want to see how long the wait will be so that I can decide whether to hold.",
            hints: {
              create: [
                {
                  description:
                    "Create `src/lib/queue.ts` exporting `estimateWaitMinutes(position, avgHandleMinutes = 4)` that returns `position * avgHandleMinutes` and never goes negative.",
                  order: 1,
                },
                {
                  description:
                    "Export `formatWait(minutes)`: '< 1' -> 'less than a minute', '< 60' -> 'about N minutes', '>= 60' -> 'over an hour', invalid input -> ''.",
                  order: 2,
                },
                {
                  description:
                    "In `src/app/support/page.tsx`, when the 'Connect with an Agent' form is submitted, show the citizen's queue position and a line of the form `Estimated wait: <formatWait(...)>`.",
                  order: 3,
                },
                {
                  description:
                    "As the queue advances, the displayed position and estimate must update.",
                  order: 4,
                },
              ],
            },
            order: 1,
            acceptanceCriteria: {
              create: [
                {
                  description:
                    "`estimateWaitMinutes` defaults to a 4-minute handle time, honours a custom one, and never returns a negative number",
                  isRequired: true,
                  order: 1,
                },
                {
                  description:
                    "`formatWait` renders sub-minute / minute-scale / hour-plus copy and returns '' for invalid input",
                  isRequired: true,
                  order: 2,
                },
                {
                  description:
                    "Submitting the agent-request form shows a queue position and an estimated wait line",
                  isRequired: true,
                  order: 3,
                },
              ],
            },
          },
          {
            taskName: "Agent Keyboard Shortcuts",
            testType: "client",
            userStory:
              "As an agent, I want to navigate and reply with the keyboard so that I can work the dashboard without a mouse.",
            hints: {
              create: [
                {
                  description:
                    "In `src/app/agent/page.tsx`, add a global `keydown` handler (registered in `useEffect`, with cleanup) so ArrowDown / ArrowUp move the selected conversation to the next / previous row in the visible list.",
                  order: 1,
                },
                {
                  description:
                    "Inside the message input, Ctrl+Enter (or Cmd+Enter) sends the current message.",
                  order: 2,
                },
                {
                  description:
                    "Inside the message input, Escape clears the message input.",
                  order: 3,
                },
              ],
            },
            order: 2,
            acceptanceCriteria: {
              create: [
                {
                  description:
                    "ArrowDown / ArrowUp move the selected conversation through the visible list",
                  isRequired: true,
                  order: 1,
                },
                {
                  description:
                    "Ctrl/Cmd+Enter sends the current message from the input",
                  isRequired: true,
                  order: 2,
                },
                {
                  description:
                    "Escape clears the message input",
                  isRequired: true,
                  order: 3,
                },
              ],
            },
          },
        ],
      },
    },
    {
      id: "nextjs-shadcn-ui-scenario-2-level-5",
      title: "Production Bug Hunt",
      subtitle: "Fix two interacting dashboard bugs and ship transcript export + docs",
      order: 5,
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      levelDescription:
        "Mission Briefing: The agent dashboard is misbehaving in production. One: an agent who sets themselves Offline can still type and send replies, so citizens think someone is there who has gone home. Two: the red unread badge never clears, even after the agent has clearly opened the conversation. Separately, supervisors keep asking for a plain-text transcript of a conversation, and the README is still create-next-app boilerplate. The two dashboard bugs interact with the Level 3 priority sort and SLA badges, so trace the state flow before changing anything.",
      xpReward: 85,
      coinReward: 200,
      keyTakeaways:
        "The two dashboard bugs are both single-source-of-truth failures. Bug A — the status selector is purely cosmetic because nothing reads `agentStatus`; the fix is to gate the message input and send button (and show a verbatim offline notice) whenever the agent is offline. Bug B — clicking a conversation selects it but never resets `unreadCount`; the fix must reset the count on the `conversations` array itself, not a detached copy, so the Level 3 priority score recomputes and the sorted list and SLA badges stay consistent. A careless fix here quietly breaks features built earlier — the lesson is to trace state flow before editing.\n\n`formatTranscript` in `src/lib/transcript.ts` is a defensive pure function: it builds a plain-text transcript (a header with the customer name, then one `[HH:MM] Role: content` line per message) and must return a string for any input, including a conversation with no messages — it never throws. Pairing the export affordance with a real `README.md` (project overview, demo credentials, dev workflow, route list) is what makes a Next.js + shadcn/ui codebase both supervisor-ready and onboardable.",
      scenarioId: "nextjs-shadcn-ui-scenario-2",
      tasks: {
        create: [
          {
            taskName: "Dashboard Bug Hunt",
            testType: "client",
            userStory:
              "As an agent, I want an offline status to actually block replies and the unread badge to clear when I open a conversation so that the dashboard reflects reality.",
            hints: {
              create: [
                {
                  description:
                    "Bug A: in `src/app/agent/page.tsx`, when `agentStatus` is 'offline', disable the message input and its send button.",
                  order: 1,
                },
                {
                  description:
                    "Bug A: while offline, show an inline notice reading exactly 'You are offline — set your status to Online to reply.'; returning to Online (or Away) re-enables replying and removes the notice.",
                  order: 2,
                },
                {
                  description:
                    "Bug B: when the agent opens a conversation, set that conversation's `unreadCount` to 0.",
                  order: 3,
                },
                {
                  description:
                    "Bug B: reset the count on the `conversations` array itself (not a detached copy) so the Level 3 priority score recomputes and the sorted list and SLA badges stay consistent; other conversations' counts must be untouched.",
                  order: 4,
                },
              ],
            },
            order: 1,
            acceptanceCriteria: {
              create: [
                {
                  description:
                    "An offline agent cannot type or send; the exact offline notice appears, and Online restores both",
                  isRequired: true,
                  order: 1,
                },
                {
                  description:
                    "Opening a conversation clears its unread badge; other conversations are unaffected",
                  isRequired: true,
                  order: 2,
                },
                {
                  description:
                    "The priority sort and SLA badges stay correct after the unread reset",
                  isRequired: true,
                  order: 3,
                },
              ],
            },
          },
          {
            taskName: "Transcript Export & Documentation",
            testType: "client",
            userStory:
              "As a supervisor, I want a plain-text transcript of any conversation and a real README so that I can review threads and onboard new developers.",
            hints: {
              create: [
                {
                  description:
                    "Create `src/lib/transcript.ts` exporting `formatTranscript(conversation)`: a header line with the customer's full name, then one `[HH:MM] Role: content` line per message.",
                  order: 1,
                },
                {
                  description:
                    "`formatTranscript` must return a string for any input, including a conversation with no messages — it must never throw.",
                  order: 2,
                },
                {
                  description:
                    "Add an 'Export Transcript' button on the agent dashboard that builds the transcript for the selected conversation with `formatTranscript`.",
                  order: 3,
                },
                {
                  description:
                    "Replace the create-next-app boilerplate README with project overview, demo credentials, dev workflow, and the route list.",
                  order: 4,
                },
              ],
            },
            order: 2,
            acceptanceCriteria: {
              create: [
                {
                  description:
                    "`formatTranscript` produces a readable transcript and never throws, even with no messages",
                  isRequired: true,
                  order: 1,
                },
                {
                  description:
                    "An 'Export Transcript' button exists on the agent dashboard",
                  isRequired: true,
                  order: 2,
                },
                {
                  description:
                    "README documents project overview, demo credentials, dev workflow, and routes (`/`, `/support`, `/agent/login`, `/agent`)",
                  isRequired: true,
                  order: 3,
                },
              ],
            },
          },
        ],
      },
    },
    {
      id: "nextjs-shadcn-ui-scenario-3-level-1",
      title: "Setup & Tinkering",
      subtitle: "Create a portal config module and polish the header",
      order: 1,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      levelDescription:
        "Mission Briefing: Riverside University has onboarded a new developer (you!). Before touching any business logic, get the student portal running locally and make a couple of orientation tweaks: create a plain TypeScript config module for the school's branding strings and wire it into the header, login page, and dashboard welcome block.",
      xpReward: 10,
      coinReward: 20,
      keyTakeaways:
        "A plain TypeScript config module — `src/lib/portalConfig.ts` exporting `SCHOOL_NAME`, `SCHOOL_TAGLINE`, and `PORTAL_ACCENT` as named constants — is the simplest way to centralize branding in a Next.js + shadcn/ui app. Unlike `NEXT_PUBLIC_*` environment variables it needs no `.env` file, no dev-server restart, and is fully type-checked; importing `SCHOOL_NAME` into the dashboard layout and login page means the school identity lives in exactly one place. Every Next.js + shadcn/ui portal benefits from treating tenant strings as imported configuration rather than scattered string literals.\n\nThe header-polish task is deliberately small but teaches where things live: swapping the lucide `GraduationCap` icon for `School` on the login page, sourcing the login heading from `SCHOOL_NAME`, and adding the tagline as a third muted (`text-sm text-gray-500`) line under the dashboard welcome block. These cosmetic changes confirm a developer can navigate the Next.js App Router file tree and apply Tailwind utility classes before any harder level depends on it.",
      scenarioId: "nextjs-shadcn-ui-scenario-3",
      tasks: {
        create: [
          {
            taskName: "Local Setup & Portal Config Module",
            testType: "client",
            userStory:
              "As a developer, I want a typed config module for branding so that the school identity lives in exactly one place.",
            hints: {
              create: [
                {
                  description:
                    "Run `npm install` and `npm run dev` inside `client/`, then open http://localhost:3000 to confirm the app loads.",
                  order: 1,
                },
                {
                  description:
                    "Create a plain TypeScript config module at `src/lib/portalConfig.ts` (not env vars) exporting `SCHOOL_NAME = 'Riverside University'`, `SCHOOL_TAGLINE = 'Learn. Grow. Graduate.'`, and `PORTAL_ACCENT = 'blue'`.",
                  order: 2,
                },
                {
                  description:
                    "Replace the hard-coded 'Student Portal' brand label in the dashboard header (`src/app/dashboard/layout.tsx`) with the imported `SCHOOL_NAME`.",
                  order: 3,
                },
              ],
            },
            order: 1,
            acceptanceCriteria: {
              create: [
                {
                  description: "App runs without errors on `npm run dev`",
                  isRequired: true,
                  order: 1,
                },
                {
                  description:
                    "`src/lib/portalConfig.ts` exists and exports `SCHOOL_NAME`, `SCHOOL_TAGLINE`, `PORTAL_ACCENT`",
                  isRequired: true,
                  order: 2,
                },
                {
                  description:
                    "Dashboard header brand reads 'Riverside University', sourced from `SCHOOL_NAME`",
                  isRequired: true,
                  order: 3,
                },
              ],
            },
          },
          {
            taskName: "Dashboard Header Polish",
            testType: "client",
            userStory:
              "As a user, I want a consistent icon and brand heading so that the portal feels polished and identifiable.",
            hints: {
              create: [
                {
                  description:
                    "On the login page (`src/app/login/page.tsx`), swap the `GraduationCap` icon for the `School` icon from `lucide-react`.",
                  order: 1,
                },
                {
                  description:
                    "Render the login page heading from `SCHOOL_NAME` instead of the hard-coded 'Student Portal'.",
                  order: 2,
                },
                {
                  description:
                    "In `src/app/dashboard/page.tsx`, add a third line under the program/year welcome text that renders `SCHOOL_TAGLINE` in a small, muted style (`text-sm text-gray-500`).",
                  order: 3,
                },
              ],
            },
            order: 2,
            acceptanceCriteria: {
              create: [
                {
                  description:
                    "Login page uses the lucide `School` icon and a `SCHOOL_NAME` heading",
                  isRequired: true,
                  order: 1,
                },
                {
                  description:
                    "Dashboard welcome block shows `SCHOOL_TAGLINE` as a third muted line",
                  isRequired: true,
                  order: 2,
                },
                {
                  description:
                    "The tagline renders with `text-sm` and a muted text color (e.g. `text-gray-500`)",
                  isRequired: true,
                  order: 3,
                },
              ],
            },
          },
        ],
      },
    },
    {
      id: "nextjs-shadcn-ui-scenario-3-level-2",
      title: "Custom Reusable UI Primitives",
      subtitle: "Hand-roll an InfoTooltip and a SemesterGroup accordion",
      order: 2,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      levelDescription:
        "Mission Briefing: The standing badges confuse students — nobody knows what 'Good' actually requires — and the All Semesters tab on the grades page is one long table that mixes years together. Build two small, hand-rolled UI primitives (no radix install needed) and put them to use: a hover tooltip for the standing badges and a self-contained accordion for the grades page.",
      xpReward: 25,
      coinReward: 50,
      keyTakeaways:
        "`InfoTooltip` shows how far you can get with Tailwind and the `group` utility instead of a tooltip library. The component wraps its children in a `relative inline-block group` span and renders the label in a sibling `role=\"tooltip\"` element that is hidden by default (`opacity-0 pointer-events-none`) and revealed on `group-hover` (`group-hover:opacity-100`). Keeping the tooltip element always in the DOM — only visually hidden — preserves accessibility while staying purely CSS-driven.\n\n`SemesterGroup` is a self-contained accordion: it owns its `open` state with `useState`, exposes a `<button aria-expanded={open}>` whose label is the title with a chevron rotated when open, and conditionally renders the body. Grouping the grades page's All Semesters rows by `${semester} — ${academicYear}` and rendering one `SemesterGroup` per group — with the first `defaultOpen` — turns a flat mega-table into a scannable, collapsible structure. Both primitives prove a Next.js + shadcn/ui app can grow bespoke components that still respect ARIA.",
      scenarioId: "nextjs-shadcn-ui-scenario-3",
      tasks: {
        create: [
          {
            taskName: "InfoTooltip Primitive on Standing Badges",
            testType: "client",
            userStory:
              "As a student, I want to hover an academic-status badge and see what it means so that I understand my standing.",
            hints: {
              create: [
                {
                  description:
                    "Create `src/components/InfoTooltip.tsx` accepting `label` and `children`; wrap `children` in a `<span class=\"relative inline-block group\">`.",
                  order: 1,
                },
                {
                  description:
                    "Render the label in a sibling `<span role=\"tooltip\">` hidden by default (`opacity-0 pointer-events-none`) and shown on `group-hover` (`group-hover:opacity-100`), positioned above the trigger (`absolute bottom-full mb-2`).",
                  order: 2,
                },
                {
                  description:
                    "In `src/app/dashboard/standing/page.tsx`, wrap each status badge from `getStatusBadge` in an `InfoTooltip`: good -> 'Good Standing: cumulative GPA at or above 3.0.', warning -> 'Warning: GPA between 2.0 and 2.99 — improve next term.', probation -> 'Probation: GPA below 2.0 — meet your advisor.'",
                  order: 3,
                },
              ],
            },
            order: 1,
            acceptanceCriteria: {
              create: [
                {
                  description:
                    "`InfoTooltip` exists and renders a `role=\"tooltip\"` element exposing its `label`",
                  isRequired: true,
                  order: 1,
                },
                {
                  description:
                    "The tooltip is hidden by default and revealed on `group-hover` via Tailwind classes",
                  isRequired: true,
                  order: 2,
                },
                {
                  description:
                    "The standing page wraps each status badge with the correct tooltip label",
                  isRequired: true,
                  order: 3,
                },
              ],
            },
          },
          {
            taskName: "SemesterGroup Accordion on Grades Page",
            testType: "client",
            userStory:
              "As a student, I want the All Semesters tab grouped into collapsible terms so that I can focus on one semester at a time.",
            hints: {
              create: [
                {
                  description:
                    "Create `src/components/SemesterGroup.tsx` accepting `title`, `defaultOpen = false`, and `children`; hold an internal `useState` for `open`.",
                  order: 1,
                },
                {
                  description:
                    "Render a `<button aria-expanded={open}>` labelled by `title` with a `ChevronRight` rotated 90 degrees when open; conditionally render the body when `open` is true.",
                  order: 2,
                },
                {
                  description:
                    "In `src/app/dashboard/grades/page.tsx`, inside the All Semesters tab, group rows by `${semester} — ${academicYear}` and render one `SemesterGroup` per group; the first group is `defaultOpen`.",
                  order: 3,
                },
              ],
            },
            order: 2,
            acceptanceCriteria: {
              create: [
                {
                  description:
                    "`SemesterGroup` manages its own open state and exposes `aria-expanded` on its trigger button",
                  isRequired: true,
                  order: 1,
                },
                {
                  description:
                    "The All Semesters tab is split into one accordion per `semester + academicYear` pair",
                  isRequired: true,
                  order: 2,
                },
                {
                  description:
                    "The first accordion is open by default; the others start closed",
                  isRequired: true,
                  order: 3,
                },
              ],
            },
          },
        ],
      },
    },
    {
      id: "nextjs-shadcn-ui-scenario-3-level-3",
      title: "Data Aggregation & Visualization",
      subtitle: "Derive per-semester GPA and build a reusable Progress bar",
      order: 3,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      levelDescription:
        "Mission Briefing: Advisors want to see a student's GPA trend over time and visual feedback on degree progress instead of raw numbers. The data is already in mockData.ts — your job is to derive new aggregates and visualize them. Build a units-weighted per-semester GPA helper with a card, and a reusable Progress primitive used on both the standing and dashboard pages.",
      xpReward: 45,
      coinReward: 100,
      keyTakeaways:
        "`computeGPABySemester` is a pure aggregation helper: it groups the grades list by `(semester, academicYear)`, converts letter grades through a points map, computes a units-weighted average rounded to two decimals, and sorts the results chronologically (older academic year first, 1st Semester before 2nd). Keeping this in `src/lib/mockData.ts` means the standing page just maps over the result to render a 'GPA by Semester' card — derivation and presentation stay cleanly separated in a Next.js + shadcn/ui app.\n\nThe `<Progress>` primitive (`src/components/ui/progress.tsx`) is a small accessibility win: an outer `role=\"progressbar\"` element carries `aria-valuenow` / `aria-valuemin` / `aria-valuemax`, and an inner fill div is widthed at `(value / max) * 100%` with values clamped into `[0, max]` so the bar can never overflow. Replacing the hand-rolled standing bar and adding a Degree Progress card to the dashboard shows how one well-typed primitive removes duplicated, un-clamped markup across a Next.js codebase.",
      scenarioId: "nextjs-shadcn-ui-scenario-3",
      tasks: {
        create: [
          {
            taskName: "Per-Semester GPA Helper + Card",
            testType: "client",
            userStory:
              "As an advisor, I want a student's GPA broken down by semester so that I can see their trend over time.",
            hints: {
              create: [
                {
                  description:
                    "In `src/lib/mockData.ts`, export `computeGPABySemester(gradeList)` returning `SemesterGPA[]` ({ semester, academicYear, gpa, units }), grouping grades by `(semester, academicYear)`.",
                  order: 1,
                },
                {
                  description:
                    "Use the points map A=4.0, A-=3.7, B+=3.3, B=3.0, B-=2.7, C+=2.3, C=2.0, C-=1.7, D+=1.3, D=1.0, F=0.0; each `gpa` is units-weighted and rounded to 2 decimals.",
                  order: 2,
                },
                {
                  description:
                    "Sort results chronologically — older `academicYear` first, then 1st Semester before 2nd Semester.",
                  order: 3,
                },
                {
                  description:
                    "In `src/app/dashboard/standing/page.tsx`, add a 'GPA by Semester' card below Degree Progress with one row per entry: `${semester} ${academicYear}`, the 2-decimal GPA, and a bar filling `(gpa / 4.0) * 100%` (`bg-blue-600`).",
                  order: 4,
                },
              ],
            },
            order: 1,
            acceptanceCriteria: {
              create: [
                {
                  description:
                    "`computeGPABySemester` returns one entry per unique `(semester, academicYear)` pair, sorted chronologically",
                  isRequired: true,
                  order: 1,
                },
                {
                  description:
                    "GPA values are units-weighted and rounded to 2 decimals",
                  isRequired: true,
                  order: 2,
                },
                {
                  description:
                    "The standing page renders a 'GPA by Semester' card with one row per semester",
                  isRequired: true,
                  order: 3,
                },
              ],
            },
          },
          {
            taskName: "Reusable Progress Primitive",
            testType: "client",
            userStory:
              "As a student, I want a visual progress bar for my degree completion so that I can gauge progress at a glance.",
            hints: {
              create: [
                {
                  description:
                    "Create `src/components/ui/progress.tsx` exporting `Progress({ value, max = 100, className })`.",
                  order: 1,
                },
                {
                  description:
                    "Outer `<div role=\"progressbar\" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>` with an inner fill div whose width is `(value / max) * 100%`; clamp values outside `[0, max]` so the bar never overflows.",
                  order: 2,
                },
                {
                  description:
                    "Replace the hand-rolled progress bar in the Degree Progress card on the standing page with `<Progress value={earnedCredits} max={totalCredits} />`.",
                  order: 3,
                },
                {
                  description:
                    "On `src/app/dashboard/page.tsx`, add a 'Degree Progress' card under the Tuition Summary card showing `<Progress>` plus the percentage label.",
                  order: 4,
                },
              ],
            },
            order: 2,
            acceptanceCriteria: {
              create: [
                {
                  description:
                    "`<Progress>` exposes `role=\"progressbar\"` with correct `aria-valuenow` / `aria-valuemin` / `aria-valuemax`",
                  isRequired: true,
                  order: 1,
                },
                {
                  description:
                    "Values outside `[0, max]` are clamped so the fill width never exceeds 100%",
                  isRequired: true,
                  order: 2,
                },
                {
                  description:
                    "The standing Degree Progress bar and the new dashboard Degree Progress card both use `<Progress>`",
                  isRequired: true,
                  order: 3,
                },
              ],
            },
          },
        ],
      },
    },
    {
      id: "nextjs-shadcn-ui-scenario-3-level-4",
      title: "Routing & Multi-Step Workflows",
      subtitle: "Build a dynamic course route and a multi-step request modal",
      order: 4,
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      levelDescription:
        "Mission Briefing: Students want a way to drill into a single course — grade, schedule, and instructor on one page — and a way to request official documents (transcript, enrollment certificate) without emailing the registrar. Build a dynamic course-detail route and a self-contained multi-step Request Document modal.",
      xpReward: 65,
      coinReward: 150,
      keyTakeaways:
        "A dynamic route at `src/app/dashboard/courses/[courseCode]/page.tsx` shows the Next.js App Router pattern: the page reads `params.courseCode`, decodes it (so `CS%20301` becomes `CS 301`), looks up the matching grade and schedule item, and renders a detail card — or a 'Course not found' fallback with a link back to grades. Pairing it with a 'View Details' `<Link>` on every grades row teaches URL-encoded navigation between a list and a detail view inside a single Next.js + shadcn/ui app.\n\nThe Request Document workflow is a self-contained `Modal` primitive (`role=\"dialog\"`, `aria-modal`, overlay-click to close, returns null when closed) plus a `RequestDocumentDialog` that walks three internally-managed steps: choose type, enter purpose, confirm. The interesting part is button gating — Next is disabled until a type is chosen, Submit until the purpose reaches ten characters — and a generated `REQ-XXXXXX` reference on the confirmation step. Driving the whole flow from one `step` state variable keeps a multi-step Next.js workflow predictable and testable.",
      scenarioId: "nextjs-shadcn-ui-scenario-3",
      tasks: {
        create: [
          {
            taskName: "Dynamic Course Detail Route",
            testType: "client",
            userStory:
              "As a student, I want a single page per course so that I can see its grade, schedule, and instructor together.",
            hints: {
              create: [
                {
                  description:
                    "Create `src/app/dashboard/courses/[courseCode]/page.tsx` as a client component receiving `{ params: { courseCode: string } }`; decode the `courseCode` param.",
                  order: 1,
                },
                {
                  description:
                    "Look up the matching `Grade` (most recent if multiple) and `ScheduleItem`; render a card with course code, name, grade in a `<Badge>`, units, semester, academic year, day/time/room, and professor.",
                  order: 2,
                },
                {
                  description:
                    "If no grade match exists, render 'Course not found' and a link back to `/dashboard/grades`.",
                  order: 3,
                },
                {
                  description:
                    "On `src/app/dashboard/grades/page.tsx`, add an Actions column to both tab tables with a `<Link>` reading 'View Details' to `/dashboard/courses/${encodeURIComponent(courseCode)}`.",
                  order: 4,
                },
              ],
            },
            order: 1,
            acceptanceCriteria: {
              create: [
                {
                  description:
                    "`/dashboard/courses/[courseCode]` renders the details for a known course",
                  isRequired: true,
                  order: 1,
                },
                {
                  description:
                    "An unknown course code shows 'Course not found' and a link back to grades",
                  isRequired: true,
                  order: 2,
                },
                {
                  description:
                    "Grades page rows include a 'View Details' link to the encoded course route",
                  isRequired: true,
                  order: 3,
                },
              ],
            },
          },
          {
            taskName: "Multi-Step Request Document Modal",
            testType: "client",
            userStory:
              "As a student, I want to request official documents in a guided modal so that I do not have to email the registrar.",
            hints: {
              create: [
                {
                  description:
                    "Build `src/components/ui/modal.tsx` exporting `Modal({ open, onClose, children })`: returns null when closed; when open renders a fixed overlay with `role=\"dialog\"` and `aria-modal=\"true\"`; clicking the overlay (not the inner panel) calls `onClose`.",
                  order: 1,
                },
                {
                  description:
                    "Build `src/components/RequestDocumentDialog.tsx` using `Modal` to walk three internally-managed steps.",
                  order: 2,
                },
                {
                  description:
                    "Step 1 — radios for Transcript / Enrollment Certificate / Good Moral Certificate, with Next disabled until a type is chosen. Step 2 — a purpose `<textarea>`, a Back button, and a Submit disabled until the textarea has >= 10 characters.",
                  order: 3,
                },
                {
                  description:
                    "Step 3 — show 'Request submitted!', the chosen type, the purpose, and a generated `REQ-XXXXXX` reference (six uppercase alphanumerics), plus a Done button. Add a `Request Document` button near the top of `src/app/dashboard/page.tsx` that opens the dialog.",
                  order: 4,
                },
              ],
            },
            order: 2,
            acceptanceCriteria: {
              create: [
                {
                  description:
                    "`Modal` exposes `role=\"dialog\"` and `aria-modal=\"true\"` and only renders when `open`",
                  isRequired: true,
                  order: 1,
                },
                {
                  description:
                    "`RequestDocumentDialog` walks step 1 -> 2 -> 3 with correct Next / Submit button gating",
                  isRequired: true,
                  order: 2,
                },
                {
                  description:
                    "The confirmation step exposes a `REQ-XXXXXX` reference plus the chosen type and purpose, and the dashboard exposes a 'Request Document' trigger",
                  isRequired: true,
                  order: 3,
                },
              ],
            },
          },
        ],
      },
    },
    {
      id: "nextjs-shadcn-ui-scenario-3-level-5",
      title: "Real Bug Fix + Accessibility Sweep",
      subtitle: "Derive standing aggregates from grades and sweep the dashboard for a11y",
      order: 5,
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      levelDescription:
        "Mission Briefing: QA found two issues that must ship together. (A) The 'Total Units' and 'Earned Credits' numbers on the Academic Standing page never change when grades are updated — they are frozen at 21 and 78; the dashboard is the same. They should be derived from the grades list. (B) An accessibility consultant flagged the dashboard for missing landmarks, a missing skip link, unlabeled icon buttons, and a sidebar that does not announce the current page to screen readers. Both have to be fixed before release.",
      xpReward: 80,
      coinReward: 200,
      keyTakeaways:
        "Hard-coded aggregates are a data-integrity bug: `currentStanding.totalUnits` and `currentStanding.earnedCredits` never react to grade changes. The fix is two pure helpers in `src/lib/mockData.ts` — `computeCurrentSemesterUnits` sums units for grades in the current `(semester, academicYear)`, and `computeEarnedCredits` sums units for every non-`F` grade — and replacing every read of the frozen fields on the standing and dashboard pages (including the `creditsNeeded` and `completionRate` math) with the computed values. Deriving state from source data is what keeps a Next.js + shadcn/ui UI honest.\n\nThe accessibility sweep is a checklist every Next.js + shadcn/ui dashboard should pass: a `sr-only focus:not-sr-only` skip link as the first focusable element targeting `#main-content`; a `<main id=\"main-content\" tabIndex={-1}>`; `role=\"navigation\"` and `aria-label=\"Primary\"` on the sidebar `<nav>`; `aria-current=\"page\"` on the active link; `aria-label`s on icon-only buttons; and an `sr-only <h1>` carrying the school name inside the `role=\"banner\"` header. Landmarks, focus order, and accessible names are not optional polish — they are what makes the portal usable with a screen reader.",
      scenarioId: "nextjs-shadcn-ui-scenario-3",
      tasks: {
        create: [
          {
            taskName: "Replace Hard-Coded Standing Aggregates",
            testType: "client",
            userStory:
              "As a student, I want my total units and earned credits to reflect my actual grades so that the standing page tells the truth.",
            hints: {
              create: [
                {
                  description:
                    "In `src/lib/mockData.ts`, export `computeCurrentSemesterUnits(gradeList)` summing `units` for grades whose `(semester, academicYear)` matches `currentStanding`.",
                  order: 1,
                },
                {
                  description:
                    "Export `computeEarnedCredits(gradeList)` summing `units` for every grade that is not `F` (passing grades only).",
                  order: 2,
                },
                {
                  description:
                    "In `src/app/dashboard/standing/page.tsx`, replace every read of `currentStanding.totalUnits` with `computeCurrentSemesterUnits(grades)` and `currentStanding.earnedCredits` with `computeEarnedCredits(grades)`; the `creditsNeeded` and `completionRate` math must use the computed earned credits.",
                  order: 3,
                },
                {
                  description:
                    "In `src/app/dashboard/page.tsx`, replace `currentStanding.totalUnits` in the Total Units stat with `computeCurrentSemesterUnits(grades)` and use `computeEarnedCredits(grades)` for the Academic Standing card.",
                  order: 4,
                },
              ],
            },
            order: 1,
            acceptanceCriteria: {
              create: [
                {
                  description:
                    "`computeCurrentSemesterUnits` and `computeEarnedCredits` are exported from `mockData.ts`",
                  isRequired: true,
                  order: 1,
                },
                {
                  description:
                    "Standing page Total Units and Earned Credits both reflect the computed values, not the hard-coded 21 / 78",
                  isRequired: true,
                  order: 2,
                },
                {
                  description:
                    "The dashboard Total Units stat matches the computed current-semester units",
                  isRequired: true,
                  order: 3,
                },
              ],
            },
          },
          {
            taskName: "Dashboard Accessibility Sweep",
            testType: "client",
            userStory:
              "As a screen-reader user, I want landmarks, a skip link, and labeled controls so that I can navigate the dashboard.",
            hints: {
              create: [
                {
                  description:
                    "In `src/app/dashboard/layout.tsx`, add a 'Skip to main content' link as the first focusable element, pointing to `#main-content`, `sr-only` by default and `focus:not-sr-only` on focus; give `<main>` `id=\"main-content\"` and `tabIndex={-1}`.",
                  order: 1,
                },
                {
                  description:
                    "Add `role=\"navigation\"` and `aria-label=\"Primary\"` to the sidebar `<nav>`, and set `aria-current=\"page\"` on the active sidebar item when `pathname === item.href`.",
                  order: 2,
                },
                {
                  description:
                    "Add `aria-label=\"Toggle sidebar\"` to the menu button and `aria-label=\"Sign out\"` to the logout button.",
                  order: 3,
                },
                {
                  description:
                    "Give the `<header>` `role=\"banner\"` and add an `<h1 class=\"sr-only\">` carrying the current school name (visible brand text stays as-is).",
                  order: 4,
                },
              ],
            },
            order: 2,
            acceptanceCriteria: {
              create: [
                {
                  description:
                    "The skip link is the first focusable element and points to `#main-content`; `<main>` has `id=\"main-content\"` and `tabIndex={-1}`",
                  isRequired: true,
                  order: 1,
                },
                {
                  description:
                    "The sidebar `<nav>` exposes `role=\"navigation\"` + `aria-label=\"Primary\"`, and the active item has `aria-current=\"page\"`",
                  isRequired: true,
                  order: 2,
                },
                {
                  description:
                    "Icon-only buttons have `aria-label`s and the header includes an `sr-only <h1>` with the school name",
                  isRequired: true,
                  order: 3,
                },
              ],
            },
          },
        ],
      },
    },
  ];

  // Insert scenarios first
  console.log("\n📦 Creating scenarios...\n");
  for (const scenario of scenarios) {
    await prisma.scenario.create({ data: scenario });
    console.log(`✅ Created scenario: ${scenario.name}`);
  }

  // Insert levels
  console.log("\n🎯 Creating levels...\n");
  for (const level of levels) {
    await prisma.level.create({ data: level });
    console.log(`✅ Created level: ${level.title}`);
  }

  console.log("\n🎉 Database seeded successfully!\n");

  // Summary
  console.log("📊 Summary:");
  console.log(`   Levels: ${levels.length}`);
  console.log(`   Scenarios: ${scenarios.length}`);
  console.log("\n📋 Difficulty breakdown:");
  const difficultyCount = scenarios.reduce(
    (acc, s) => {
      acc[s.difficulty] = (acc[s.difficulty] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  Object.entries(difficultyCount).forEach(([diff, count]) => {
    console.log(`   ${diff}: ${count}`);
  });
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });