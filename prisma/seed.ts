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
      id: "scenario-1",
      name: "BookWise Library Management System",
      description:
        "Build a full-featured web-based Library Management System to manage books, members, and borrowing workflows using React, Express, PostgreSQL, and Prisma.",
      difficulty: "expert",
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
        "Mission Briefing: The library has onboarded a new developer and needs the system running locally. Set up the Next.js + Prisma + PostgreSQL stack, configure the database, and make minor UI tweaks to get the application running properly in your local machine.",
      xpReward: 100,
      coinReward: 50,
      keyTakeaways: "Mastering React + Express + PostgreSQL + Prisma development environments requires understanding package management (npm/pnpm), environment variables for securing database connections, and Prisma migrations to keep PostgreSQL schemas synchronized. This setup ensures consistent development across team members and reliable deployments. Every React frontend with Express backend and Prisma + PostgreSQL database starts with this crucial foundation.\n\nReact component props enable parent-to-child data flow, creating dynamic UIs that display data from Express APIs. Understanding component hierarchy and prop passing is essential for building maintainable React applications that consume Prisma-fetched PostgreSQL data. This component architecture is fundamental to all React applications integrated with Express backends.",
      scenarioId: "scenario-1",
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
                    "Use the server README as reference for required `.env` values.",
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
                  description:
                    ".env file configured with database and JWT secret",
                  isRequired: true,
                  order: 2,
                },
                {
                  description: "Prisma migrations executed successfully",
                  isRequired: true,
                  order: 3,
                },
                {
                  description: "Both client and server running without errors",
                  isRequired: true,
                  order: 4,
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
      scenarioId: "scenario-1",
      tasks: {
        create: [
          {
            taskName: "Fix Borrow Availability Bug",
            testType: "client", // helpers.ts is client-side
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
            testType: "client", // BorrowRecords.tsx is client-side
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
      scenarioId: "scenario-1",
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
      scenarioId: "scenario-1",
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
      scenarioId: "scenario-1",
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