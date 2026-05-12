// Define levels with progressive difficulty
export const levels = [
  {
    id: "pern-lb-level-1",
    title: "Getting Familiar with the Codebase",
    subtitle:
      "Set up the development environment and make a minor UI change.",
    order: 1,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: The library has onboarded a new developer and needs the system running locally. Set up the PERN (Postgres, Express, React, NodeJs) stack, configure the database, and make minor UI tweaks to get the application running properly in your local machine.",
    xp_reward: 100,
    coin_reward: 50,
    key_takeaways:
      "Mastering React + Express + PostgreSQL + Prisma development environments requires understanding package management (npm/pnpm), environment variables for securing database connections, and Prisma migrations to keep PostgreSQL schemas synchronized. This setup ensures consistent development across team members and reliable deployments. Every React frontend with Express backend and Prisma + PostgreSQL database starts with this crucial foundation.\n\nReact component props enable parent-to-child data flow, creating dynamic UIs that display data from Express APIs. Understanding component hierarchy and prop passing is essential for building maintainable React applications that consume Prisma-fetched PostgreSQL data. This component architecture is fundamental to all React applications integrated with Express backends.",
    scenario_id: "scenario-1",
    tasks: {
      create: [
        {
          task_name: "Prepare Development Environment",
          test_type: "client",
          user_story:
            "As a developer, I want to set up my development environment so that I can start working on the project.",
          learning_sections: {
            create: [
              {
                title: "Overview\nSetting Up a PERN Stack Project",
                content:
                  "This section introduces the crash course for preparing a PERN stack development environment. It provides a high-level view of the setup flow, required tools, and key concepts you need before starting the hands-on tasks.",
                order: 1,
              },
              {
                title: "What is the PERN Stack?",
                content:
                  "PERN stands for PostgreSQL, Express, React, Node.js — four technologies that work together to build full-stack web apps.\n\nPostgreSQL — the database that stores your data\nExpress — a Node.js framework that handles your server and API routes\nReact — the frontend library that builds your user interface\nNode.js — the JavaScript runtime that runs your server code",
                order: 2,
              },
              {
                title: "How a PERN App is Structured",
                content:
                  "A typical PERN project has three parts:\nroot/ ← workspace root (shared config, scripts)\n    ├── client/ ← React frontend\n    └── server/ ← Express backend\nEach part has its own package.json, which means you need to install dependencies in all three locations.",
                order: 3,
              },
              {
                title: "Package Management 101",
                content:
                  "When you start a project, no dependencies are installed yet. You need to run npm install (or pnpm install) in each folder that has a package.json.\n\nWhy separate installs? Each folder is its own isolated module. The client uses React libraries, the server uses Express libraries — they don't share the same node_modules.",
                order: 4,
              },
              {
                title: "Change Directory (cd) Basics",
                content:
                  "In development, you must run commands in the correct folder. Use cd (change directory) to move between root, client, and server before running installs or scripts.\n\nCommon commands:\ncd client → move into the frontend folder\ncd ../server → move from client to server\ncd .. → move up one folder\n\nAlways check your current location before running a command, because npm install and npm run commands affect the folder you are currently in.",
                order: 5,
              },
              {
                title: "Practice Lab: cd Navigation",
                content:
                  "Practice navigating folders with cd. Use `ls` to list files/folders in your current directory and `pwd` to print your current path when you want to verify where you are.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "TERMINAL_CD" as const,
                interactive_config: {
                  instructions:
                    "Goal: navigate to /workspace/client, then to /workspace/server, then back to /workspace. Tip: `ls` lists current directory contents and `pwd` prints your current path.",
                  initial_directory: "/workspace",
                  expected_commands: ["cd client", "cd ../server", "cd .."],
                  directory_tree: {
                    "/workspace": ["client", "server", "README.md"],
                    "/workspace/client": ["src", "package.json"],
                    "/workspace/server": ["src", "package.json"],
                  },
                },
                order: 6,
              },
              {
                title: "Environment Variables",
                content:
                  'Sensitive config (like database credentials) is stored in .env files — never hardcoded in source code. DATABASE_URL="postgresql://user:password@localhost:5432/mydb"\nPORT=3000\n The dotenv package reads these files and makes them available as process.env.DATABASE_URL in your code. ⚠️ .env files are listed in .gitignore intentionally — they contain secrets that should never be committed to version control. \n\n Note:\nIn this project, some environment variables will be provided by us, so no need to set it up',
                order: 7,
              },
              {
                title: "What is an ORM?",
                content:
                  "ORM stands for Object-Relational Mapping. It's a programming technique that lets you interact with a relational database (like MySQL, PostgreSQL, or SQLite) using the object-oriented syntax of your programming language (like Python, Java, C#, or JavaScript), instead of writing raw SQL queries. [https://aws.amazon.com/what-is/object-relational-mapping/]",
                order: 8,
              },
              {
                title: "Prisma Migrations",
                content:
                  "A migration is a recorded change to your database schema (tables, columns, relationships). When you run npx prisma migrate dev, Prisma reads your schema.prisma file, compares it with the current state of the database, and then generates and executes the necessary SQL to synchronize them. This process ensures that every developer's database remains consistent and follows the same structure.",
                order: 9,
              },
              {
                title: "Key Takeaway",
                content:
                  "Setting up a project isn't just installing packages — it's aligning your local environment (dependencies, env vars, database schema) so the app runs the same way for every developer on the team.",
                order: 10,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "The project has three separate folders that each need their own dependencies installed — check which folders contain a `package.json` file.",
                order: 1,
              },
              {
                description:
                  "The README contains setup instructions specific to this project — look for sections about environment configuration and required files.",
                order: 2,
              },
              {
                description:
                  "Prisma needs a migration command to create your database tables — look for a Prisma CLI command that applies schema changes to a local database.",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Dependencies installed for the root, client, and server without errors",
                is_required: true,
                order: 1,
              },
              {
                description: "Prisma migrations executed successfully",
                is_required: true,
                order: 2,
              },
              {
                description: "Both client and server running without errors",
                is_required: true,
                order: 3,
              },
            ],
          },
        },
        {
          task_name: "Update Brand Subtitle",
          test_type: "client",
          user_story:
            "As a user, I want to see the updated brand subtitle on the website so that the interface reflects the library identity.",
          learning_sections: {
            create: [
              {
                title: "Overview\nReact Components and the UI Layer",
                content:
                  "This section introduces the crash course for understanding React components and the UI layer. It gives a broad view of how interface elements are structured and where to make safe, task-focused UI updates.",
                order: 1,
              },
              {
                title: "What is a React Component?",
                content:
                  "A React component is a reusable piece of UI — like a header, a button, or a card. Components are just JavaScript functions that return HTML-like syntax called JSX.",
                order: 2,
              },
              {
                title: "Layout Components",
                content:
                  "In most React apps, elements like the header and footer live in layout components — shared wrappers used across multiple pages. This way, you change the header text in one place and it updates everywhere.\n\nA typical layout structure:\ncomponents/\n    └── layout/\n          ├── Header.tsx ← top navigation bar\n          ├── Sidebar.tsx ← side menu\n          └── Footer.tsx ← bottom bar",
                order: 3,
              },
              {
                title: "How to Find What to Change",
                content:
                  "When you need to update something you see in the browser, ask:\nWhat element is it? (header, footer, sidebar?)\nWhich component renders it? (trace it to a file)\nIs the text hardcoded or coming from props/state? For a subtitle in the header, you'd look inside the layout's header component for a hardcoded string like \"Public Library\" or similar.",
                order: 4,
              },
              {
                title: "JSX Text Content",
                content:
                  'Changing text in JSX is straightforward — it\'s just like editing HTML:\n// Before\n<p className="subtitle">Old Subtitle</p>\n// After\n<p className="subtitle">BookWise Public Library</p>',
                order: 5,
              },
              {
                title: "Verifying Your Change",
                content:
                  "After editing, save the file and check the browser. React's dev server (via Vite or CRA) supports Hot Module Replacement (HMR) — meaning the page updates instantly without a full refresh when you save a file.",
                order: 6,
              },
              {
                title: "Practice Lab: Update Heading Text",
                content:
                  "Practice a simple UI change by editing the text inside a heading element.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    'Update the function output from "Hello World" to "Welcome Back".',
                  language: "tsx",
                  starter_code:
                    'export function getUpdatedHeadingText() {\n  return "Hello World";\n}\n',
                  editable_regions: [
                    {
                      placeholder: "Hello World",
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "getUpdatedHeadingText",
                  test_cases: [
                    {
                      input: [],
                      expected: "Welcome Back",
                      label: "updated heading text",
                    },
                  ],
                },
                order: 7,
              },
              {
                title: "Key Takeaway",
                content:
                  "UI changes in React always trace back to a component file. Layout components are the first place to look for global elements like headers. Find the component, find the text, change it.",
                order: 8,
              },

            ],
          },
          hints: {
            create: [
              {
                description:
                  "The header is a layout-level element — look inside the layout components folder for a file that renders the top navigation or brand area.",
                order: 1,
              },
              {
                description:
                  "After saving your change, open the running client in the browser to visually confirm the subtitle updated correctly on both desktop and mobile widths.",
                order: 2,
              },
              {
                description:
                  "The acceptance criteria specifies the exact subtitle text — make sure your change matches it character for character, including spacing and capitalization.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  'Header subtitle is exactly "BookWise Public Library"',
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Subtitle renders correctly on desktop and mobile layouts",
                is_required: true,
                order: 2,
              },
            ],
          },
        },
      ],
    },
  },
  {
    id: "pern-lb-level-2",
    title: "Client-Side Exploration",
    subtitle: "Investigate Client-Side Borrowing Logic and UI Helpers",
    order: 2,
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: Members report they cannot borrow books even when copies are available. Your task is to investigate the client-side availability logic and create a reusable helper function to ensure consistent borrow decisions across the React UI.",
    xp_reward: 25,
    coin_reward: 125,
    key_takeaways:
      "Pure functions in React applications that process Prisma query results from PostgreSQL are easier to test and debug. Centralizing business logic ensures consistent data handling across React components that consume Express API responses. This functional programming approach is essential for reliable React + Express + Prisma applications.\n\nClient-side utility functions in React ensure consistent logic when processing data from Express APIs powered by Prisma and PostgreSQL. When the same availability logic exists in multiple React components, shared utilities prevent inconsistencies and simplify maintenance. This approach ensures reliable data handling in React applications consuming Express + Prisma + PostgreSQL backends.",
    scenario_id: "scenario-1",
    tasks: {
      create: [
        {
          task_name: "Add Borrow Availability Helper",
          test_type: "client",
          user_story:
            "As a developer, I want a reusable availability helper, So that borrow decisions stay correct and consistent.",
          learning_sections: {
            create: [
              {
                title:
                  "Overview\nPure Functions and Utility Helpers in React",
                content:
                  "This section introduces the crash course for pure functions and reusable utility helpers in React. It outlines why centralized logic improves consistency, testability, and maintainability across related task workflows.",
                order: 1,
              },
              {
                title: "What is a Pure Function?",
                content:
                  "A pure function is a function that:\n - Always returns the same output for the same input\n - Has no side effects (doesn't modify anything outside itself) \n// Pure function ✅\nfunction isBookAvailable(availableCopies: number): boolean { \n return availableCopies > 0; \n} \n// NOT pure ❌ — reads external state\n // depends on outside variable\nfunction isBookAvailable(): boolean {\n return globalBookCount > 0;\n}\n Pure functions are predictable, easy to test, and safe to reuse anywhere.",
                order: 2,
              },
              {
                title: "Why Centralize Logic in a Helper?",
                content:
                  'Imagine the same availability check scattered across 5 different components: \n // In Books.tsx\nif (book.availableCopies > 0) { ... } \n // In BorrowRecords.tsx\nif (book.copies !== 0) { ... }  ← slightly different!\n // In Dashboard.tsx\nif (book.availableCopies >= 1) { ... } \n Each variation is a bug waiting to happen. If the rule changes (e.g., "reserve 1 copy for walk-ins"), you\'d need to update every file. With a centralized helper, every component imports uses the same logic.\nOne change = consistent behavior everywhere.',
                order: 3,
              },
              {
                title: "Where to Put Helpers",
                content:
                  "In React projects, shared utility functions live in a utils/ folder: \nclient/\n    src/\n        └── utils/\n              └── helpers.ts ← shared helper functions go here",
                order: 4,
              },
              {
                title: "Boundary Conditions",
                content:
                  "When writing availability logic, you need to handle edge cases — inputs at or near the boundary of expected values: \n| 5 | true (available) |\n| 1 | true (available) |\n| 0 | false (unavailable) |\n| -1 | false (unavailable — defensive) | \nThe 0 boundary is the most important: \na book with 0 copies is not available, even though 0 is technically a valid number.",
                order: 5,
              },
              {
                title: "Exporting from a Module",
                content:
                  "To use your helper in other files, you must export it: \n// utils/helpers.ts\nexport function isBookAvailable(availableCopies: number): boolean { \nreturn availableCopies > 0;\n} \nAnd import it where needed:\nimport { isBookAvailable } from '../utils/helpers';",
                order: 6,
              },
              {
                title: "Practice Lab: Next Copy Counter",
                content:
                  "Practice writing a very simple number utility before doing the real workspace task.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Create getNextCopyCount(currentCopies) that returns currentCopies + 1.",
                  language: "javascript",
                  starter_code:
                    "export function getNextCopyCount(currentCopies) {\n  // TODO\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO",
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "getNextCopyCount",
                  test_cases: [
                    { input: [0], expected: 1, label: "zero copies" },
                    { input: [1], expected: 2, label: "one copy" },
                    { input: [5], expected: 6, label: "five copies" },
                  ],
                },
                order: 7,
              },
              {
                title: "Key Takeaway",
                content:
                  "Small, focused pure functions are the building blocks of reliable UIs. By centralizing decision logic in a shared helper, you write it once, test it once, and trust it everywhere.",
                order: 8,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "The function must be exported from a specific file path — check the acceptance criteria for the exact filename and export name you need to use.",
                order: 1,
              },
              {
                description:
                  "Think carefully about what value of `availableCopies` represents the exact boundary between available and unavailable — test your logic at that exact value.",
                order: 2,
              },
              {
                description:
                  "The helper should do one thing only: receive a number and return a boolean. Keep it simple and avoid adding any logic unrelated to availability.",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "A helper is implemented and exported as `isBookAvailable` from `client/src/utils/helpers.ts`",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "The helper returns `false` when `availableCopies <= 0`",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "The helper returns `true` when `availableCopies > 0`",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Borrow-availability decisions remain consistent for mixed copy counts (positive, zero, negative)",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "Repeated calls with the same input return the same output",
                is_required: true,
                order: 5,
              },
              {
                description:
                  "Tests validate behavior and contract rather than enforcing one exact implementation style",
                is_required: true,
                order: 6,
              },
            ],
          },
        },
        {
          task_name: "Reuse Availability Logic",
          test_type: "client",
          user_story:
            "As a developer, I want BorrowRecords to use the shared availability helper, So that the logic stays consistent across views.",
          learning_sections: {
            create: [
              {
                title:
                  "Overview\nRefactoring: Replacing Inline Logic with Shared Helpers",
                content:
                  "This section introduces the crash course for refactoring inline checks into shared helpers. It provides a high-level guide for reducing duplication while keeping behavior stable across the task flow.",
                order: 1,
              },
              {
                title: "What is Refactoring?",
                content:
                  "Refactoring means improving the structure of existing code without changing what it does. The behavior stays the same — but the code becomes cleaner, more consistent, and easier to maintain.",
                order: 2,
              },
              {
                title: "The Problem: Duplicated Logic",
                content:
                  'When the same decision appears in multiple components with slight differences, bugs creep in:\n // Books.tsx\nconst canBorrow = book.availableCopies > 0;\n // BorrowRecords.tsx\nconst canBorrow = book.copies !== 0; ← different condition!\nThese two checks look similar but behave differently at edge cases (e.g., negative copies). If a librarian borrows the last copy and copies somehow go negative, one check says "unavailable" and the other says "available."',
                order: 3,
              },
              {
                title: "The Fix: Import and Reuse",
                content:
                  "Replace the inline condition with the shared helper: \n// Before — inline logic\nconst showBorrowButton = book.availableCopies !== 0;\n // After — shared helper\nimport { isBookAvailable } from '../utils/helpers';\nconst showBorrowButton = isBookAvailable(book.availableCopies); \nThe behavior is driven by the helper now. If the helper's rule ever changes, all components update automatically.",
                order: 4,
              },
              {
                title: "Finding Inline Checks to Replace",
                content:
                  "When refactoring, search the codebase for patterns that mirror the logic you're centralizing. In this case, look for:\n - Direct comparisons involving availableCopies\n - Conditions used to show/hide borrow UI elements\n - Any boolean derived from copy count",
                order: 5,
              },
              {
                title:
                  "Non-Regression: Making Sure You Didn't Break Anything",
                content:
                  'After refactoring, verify the feature still works the same way:\nBooks with copies available → borrow button shown\nBooks with 0 copies → borrow button hidden\nThe "Issue Book" flow works end-to-end Refactoring should be invisible to the user — same behavior, better code.',
                order: 6,
              },
              {
                title: "Practice Lab: Refactor Status Badge Rule",
                content:
                  "Practice extracting an inline UI badge rule into a helper call.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Refactor the page logic to use the helper. The helper is shown below for reference as if it came from another file, and this section represents the page where you should import and use it.",
                  language: "javascript",
                  starter_code:
                    "// helper file (shown for context; this lives in another file)\nfunction getBorrowBadgeLabel(record) {\n  return record.returnedAt ? \"Returned\" : \"Active\";\n}\n\n// page file section (this is where you refactor)\nimport { getBorrowBadgeLabel } from '../utils/helpers';\n\nfunction getBadgeForRecord(record) {\n  return record.returnedAt ? \"Returned\" : \"Active\";\n}\n\nexport function renderBadgeLabel(record) {\n  return getBadgeForRecord(record);\n}\n",
                  required_code_includes: [
                    "import { getBorrowBadgeLabel } from '../utils/helpers';",
                    "getBorrowBadgeLabel(record)",
                  ],
                  editable_regions: [
                    {
                      placeholder: 'record.returnedAt ? "Returned" : "Active"',
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "renderBadgeLabel",
                  test_cases: [
                    {
                      input: [{ returnedAt: null }],
                      expected: "Active",
                      label: "active record badge output",
                    },
                    {
                      input: [{ returnedAt: "2026-01-10T00:00:00.000Z" }],
                      expected: "Returned",
                      label: "returned record badge output",
                    },
                  ],
                },
                order: 7,
              },
              {
                title: "Key Takeaway",
                content:
                  "Refactoring is a professional habit. Replace scattered inline conditions with centralized helpers to make your codebase consistent and easier to change safely in the future.",
                order: 8,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Search `BorrowRecords.tsx` for any condition that checks copy count or availability — that's the inline logic you need to replace with the helper.",
                order: 1,
              },
              {
                description:
                  "After importing the helper, pass the book's available copy count into it — the helper handles the decision, so the component just uses the returned boolean.",
                order: 2,
              },
              {
                description:
                  "Manually test the borrow flow after your refactor — the UI should behave identically to before, just driven by the shared helper now.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "`BorrowRecords.tsx` uses `isBookAvailable` from `client/src/utils/helpers.ts` for availability filtering",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Inline availability checks in `BorrowRecords.tsx` are replaced by helper usage",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Availability filtering follows helper output, even when helper logic changes",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Validation is outcome-based and allows different coding styles, as long as requirements are met",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "Borrow/Issue behavior remains correct after refactor",
                is_required: true,
                order: 5,
              },
              {
                description:
                  "Only books with available copies are selectable in Issue Book flow after refactor",
                is_required: true,
                order: 6,
              },
              {
                description:
                  "No regressions appear in related components using borrow flow",
                is_required: true,
                order: 7,
              },
              {
                description:
                  "Tests should verify behavior/contract, not enforce one exact line-by-line implementation",
                is_required: true,
                order: 8,
              },
            ],
          },
        },
      ],
    },
  },
  {
    id: "pern-lb-level-3",
    title: "Debugging and Stabilizing the Backend",
    subtitle:
      "Trace return-flow issues and enforce transactional consistency.",
    order: 3,
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: Returning books occasionally causes negative available copy counts. Your mission is to debug the return flow, identify why the copy counts are going negative, and implement a fix to ensure the library's inventory stays accurate.",
    xp_reward: 40,
    coin_reward: 200,
    key_takeaways:
      "Prisma migrations synchronize your PostgreSQL database schema with your Express + React application code changes. They prevent schema drift between development, staging, and production environments, ensuring database consistency across the entire React + Express + Prisma stack. Migrations are essential for maintaining data integrity in production PostgreSQL databases.\n\nDatabase transactions in Prisma ensure atomic operations when updating related PostgreSQL records through Express APIs. They prevent partial updates that could leave your database inconsistent, which is critical for React applications handling financial and inventory data. Always wrap related database operations in transactions to maintain data integrity in Express + Prisma + PostgreSQL applications.",
    scenario_id: "scenario-1",
    tasks: {
      create: [
        {
          task_name: "Diagnose Return Flow",
          test_type: "server",
          user_story:
            "As a backend developer, I want to trace the return flow in the server, So that I can identify why available copy counts can become invalid.",
          learning_sections: {
            create: [
              {
                title:
                  "Overview\nDebugging Backend Logic: Tracing a Data Flow",
                content:
                  "This section introduces the crash course for tracing backend data flow during debugging. It gives an overview of how to inspect write sequences, isolate failure points, and identify the root cause of inconsistent task outcomes.",
                order: 1,
              },
              {
                title: 'What Does "Debugging" Mean Here?',
                content:
                  "Debugging isn't just fixing errors — sometimes it means understanding why a system produces wrong data. In this case, the symptom is availableCopies going negative. Your job is to trace the code path that causes it.",
                order: 2,
              },
              {
                title: "The Return Flow",
                content:
                  "When a member returns a book, two things should happen:\n\nThe BorrowRecord is updated (e.g., returnedAt set, status changed)\nThe Book's availableCopies is incremented by 1\n\nBoth changes need to happen — but what if only one of them does?",
                order: 3,
              },
              {
                title: "The Problem: Separate Writes",
                content:
                  "If these two database updates are made in separate Prisma calls:\n\n// Step 1\nawait prisma.borrowRecord.update({\n  where: { id },\n  data: { returnedAt: new Date() }\n});\n\n// Step 2 — what if this crashes or the server restarts here?\nawait prisma.book.update({\n  where: { id: bookId },\n  data: { availableCopies: { increment: 1 } }\n});\n\n...then a failure between Step 1 and Step 2 leaves the database in a partial state:\n\nThe record says the book was returned ✅\nBut the inventory never updated ❌\n\nOver time, with repeated partial failures, counts drift and can go negative.",
                order: 4,
              },
              {
                title: "How to Trace a Flow",
                content:
                  'Open the controller responsible for returning books\nFind every prisma call inside the return function\nAsk: "What happens if the second write fails after the first succeeds?"\nLook for any conditional logic that might skip the inventory update',
                order: 5,
              },
              {
                title: "Identifying the Root Cause",
                content:
                  "Document what you find:\nWhich line does the borrow record update?\nWhich line does the copy count update?\nAre they in the same operation, or separate?\nWhat scenario makes one succeed and the other fail? This kind of analysis — reading code to understand failure paths — is called root cause analysis and is a core backend engineering skill.",
                order: 6,
              },
              {
                title: "Practice Lab: Add Debug Checkpoints",
                content:
                  "Practice adding structured debug checkpoints to trace a backend flow.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Add three log checkpoints: before update, after first write, and after second write.",
                  language: "typescript",
                  starter_code:
                    "async function updateBorrowRecord() {\n  return true;\n}\n\nasync function updateInventory() {\n  return true;\n}\n\nexport async function returnBookFlow() {\n  const logs = [];\n  logs.push(\"BEFORE_UPDATE\");\n  await updateBorrowRecord();\n  logs.push(\"AFTER_FIRST_WRITE\");\n  await updateInventory();\n  logs.push(\"AFTER_SECOND_WRITE\");\n  return logs;\n}\n",
                  editable_regions: [
                    {
                      placeholder: "BEFORE_UPDATE",
                      case_sensitive: false,
                    },
                    {
                      placeholder: "AFTER_FIRST_WRITE",
                      case_sensitive: false,
                    },
                    {
                      placeholder: "AFTER_SECOND_WRITE",
                      case_sensitive: false,
                    },
                  ],
                  entry_point: "returnBookFlow",
                  test_cases: [
                    {
                      input: [],
                      expected: [
                        "before update",
                        "after first write",
                        "after second write",
                      ],
                      label: "checkpoint log order and content",
                    },
                  ],
                },
                order: 7,
              },
              {
                title: "Key Takeaway",
                content:
                  'When data becomes inconsistent, the bug is usually in a write sequence that can be interrupted. Trace every write in the flow, and ask: "What breaks if this step fails in isolation?"',
                order: 8,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Open the borrow controller and locate the `returnBook` function — read through every database write it makes and note the order they happen in.",
                order: 1,
              },
              {
                description:
                  "Count the number of separate `prisma.` calls inside the return flow — if there's more than one, consider what would happen if the process stopped between them.",
                order: 2,
              },
              {
                description:
                  "Write down a concrete scenario: what sequence of events (e.g., a crash, a timeout, a concurrent request) could cause one write to succeed while the other doesn't?",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "A reproducible case for negative stock is documented",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Problematic backend logic path is identified with evidence",
                is_required: true,
                order: 2,
              },
              {
                description: "Backend controller/service flow is validated",
                is_required: true,
                order: 3,
              },
              {
                description: "Prisma query sequence is validated",
                is_required: true,
                order: 4,
              },
            ],
          },
        },
        {
          task_name: "Enforce Transaction Safety",
          test_type: "server",
          user_story:
            "As a backend engineer, I want the borrow and return flows in `server/src/controllers/borrow.controller.ts` to run atomically, So that concurrent requests cannot corrupt `availableCopies` and partial writes are never persisted.",
          learning_sections: {
            create: [
              {
                title:
                  "Overview\nDatabase Transactions and Atomic Operations",
                content:
                  "This section introduces the crash course for database transactions and atomic operations. It explains the core idea behind all-or-nothing updates and why transaction safety is essential for reliable task behavior.",
                order: 1,
              },
              {
                title: "What is a Transaction?",
                content:
                  "A database transaction is a group of operations that either all succeed or all fail together. There's no in-between.\n\nThink of it like a bank transfer:\nDeduct $100 from Account A\nAdd $100 to Account B\n\nIf step 2 fails after step 1, the money disappears. A transaction prevents this — it rolls back step 1 if step 2 fails.",
                order: 2,
              },
              {
                title: "Atomicity: All or Nothing",
                content:
                  "The key property of transactions is atomicity — the entire group of writes is treated as one indivisible unit. Without transaction:\nWrite 1 succeeds ✅\nWrite 2 fails ❌ ← partial state remains in DB With transaction:\nWrite 1 succeeds ✅\nWrite 2 fails ❌ ← transaction rolls back Write 1 too\nResult: DB unchanged, consistent state preserved ✅",
                order: 3,
              },
              {
                title: "Prisma Transactions",
                content:
                  "Prisma provides prisma.$transaction() to wrap multiple writes atomically:\n\nawait prisma.$transaction([\n  prisma.borrowRecord.update({\n    where: { id },\n    data: { returnedAt: new Date() }\n  }),\n  prisma.book.update({\n    where: { id: bookId },\n    data: { availableCopies: { increment: 1 } }\n  }),\n]);\n\nBoth writes succeed together, or neither is committed.",
                order: 4,
              },
              {
                title: "The Concurrency Problem",
                content:
                  "Even with correct logic, concurrent requests can corrupt data.\n\nTimeline (no protection):\nRequest A reads availableCopies = 1\nRequest B reads availableCopies = 1\nRequest A borrows → sets to 0\nRequest B borrows → sets to 0 ← should have been rejected!\n\nResult: 2 borrows, 0 copies (should be -1 if no guard)",
                order: 5,
              },
              {
                title: "Guard Conditions",
                content:
                  "A conditional update prevents this by including a safety check in the update itself:\n\nprisma.book.updateMany({\n  where: {\n    id: bookId,\n    availableCopies: { gt: 0 } // only update if copies > 0\n  },\n  data: {\n    availableCopies: { decrement: 1 }\n  },\n});\n\nIf 0 rows are updated, the borrow is rejected — the book is already gone.",
                order: 6,
              },
              {
                title: "Practice Lab: Atomic Audit Write",
                content:
                  "Practice wrapping a data update with an audit-log write in one atomic transaction.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Create a function that returns both required transaction operations.",
                  language: "typescript",
                  starter_code:
                    "export function buildAtomicAuditPlan() {\n  // inventory update\n  // audit log insert\n  return [];\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// inventory update",
                      case_sensitive: false,
                    },
                    {
                      placeholder: "// audit log insert",
                      case_sensitive: false,
                    },
                  ],
                  entry_point: "buildAtomicAuditPlan",
                  test_cases: [
                    {
                      input: [],
                      expected: ["tx.book.update", "tx.auditLog.create"],
                      label: "contains both atomic operations",
                    },
                  ],
                },
                order: 7,
              },
              {
                title: "Key Takeaway",
                content:
                  "Transactions protect against partial writes. Guard conditions protect against race conditions. Together, they ensure your inventory data stays accurate even under concurrent load.",
                order: 8,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Look up Prisma's `$transaction` API — it accepts an array of Prisma operations and runs them as a single atomic unit.",
                order: 1,
              },
              {
                description:
                  "For the borrow decrement, consider adding a `where` condition that prevents the update from running if `availableCopies` is already at or below zero.",
                order: 2,
              },
              {
                description:
                  "After implementing the transaction, write a test that simulates two simultaneous borrow requests for a book with one copy — only one should succeed.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Return flow updates (`BorrowRecord` + `Book.availableCopies`) run in one Prisma transaction",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "If one write fails, no partial state is persisted",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Concurrent borrow requests never reduce `availableCopies` below zero",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Only valid borrow/return outcomes are committed under concurrent access",
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
    id: "pern-lb-level-4",
    title: "Starting my Full-Stack Journey",
    subtitle: "Implement Reservation Queue and Lifecycle Management",
    order: 4,
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: The Library is implementing a reservation system for popular books. Your task is to build a reservation feature that allows users to reserve a book when all copies are borrowed and receive notifications when the book becomes available.",
    xp_reward: 60,
    coin_reward: 300,
    key_takeaways:
      "Input validation and sanitization are critical for Express API security and PostgreSQL data integrity in React applications. They prevent malicious input from corrupting your database and protect against attacks. Always validate and sanitize user inputs in Express routes before they reach Prisma and PostgreSQL. This creates secure, reliable APIs that safely handle React frontend data submissions.\n\nProper error handling in Express APIs and React components creates better user experiences in full-stack applications. Clear error messages help users understand issues, while graceful error handling prevents React app crashes. Implement comprehensive error boundaries in React and meaningful error responses in Express routes. This ensures reliable, user-friendly React + Express + PostgreSQL + Prisma applications.",
    scenario_id: "scenario-1",
    tasks: {
      create: [
        {
          task_name: "Reserve an Unavailable Book",
          test_type: "both",
          user_story:
            "As a library member, I want to reserve a book when all copies are borrowed, So that I can claim it when it becomes available.",
          learning_sections: {
            create: [
              {
                title:
                  "Overview\nBuilding a Full-Stack Feature: Reservation Creation",
                content:
                  "This section introduces the crash course for implementing reservation creation as a full-stack feature. It summarizes the end-to-end task flow between API logic, data validation, and user-facing interactions.",
                order: 1,
              },
              {
                title: 'What Does "Full-Stack" Mean for This Task?',
                content:
                  "A full-stack feature touches both the server (API logic, database) and the client (UI, service calls). You'll build both ends and make them talk to each other.",
                order: 2,
              },
              {
                title: "The Feature: Reservation Queue",
                content:
                  "When all copies of a book are borrowed, a member should be able to join a queue. The queue determines who gets the book next when a copy becomes available.\n\n### Data Model Concept\nReservation {\n  id\n  bookId        ← which book\n  memberId      ← who reserved it\n  queuePosition ← their place in line (1 = first)\n  status        ← RESERVED | READY_FOR_PICKUP | CANCELLED\n  createdAt\n}",
                order: 3,
              },
              {
                title: "Server Side: The API Endpoint",
                content:
                  "### POST /api/reservations\nCreates a new reservation. Before inserting, the server must validate:\n- The book exists\n- availableCopies === 0 (reserving available books makes no sense)\n- The member doesn't already have an active reservation for this book\n\nAssigning Queue Position\nQueue position is calculated server-side — count active reservations and add 1:\n\nconst existingCount = await prisma.reservation.count({\n  where: { bookId, status: 'RESERVED' }\n});\nconst queuePosition = existingCount + 1;\n\n### GET /api/reservations?bookId=<id>\nReturns the reservation queue for a book, ordered by position. Each row includes member and book details so the UI doesn't need extra requests.",
                order: 4,
              },
              {
                title: "Client Side: The Service Layer",
                content:
                  "In a well-structured React app, API calls live in a service layer — not directly in components:\n\nclient/src/\n    └── services/\n          └── libraryService.ts  ← all API calls live here\n\nYour createReservation function in this file calls POST /api/reservations and returns the result.",
                order: 5,
              },
              {
                title: "Client Side: The UI",
                content:
                  'The Books.tsx page needs conditional rendering:\nIf availableCopies > 0 → show Borrow button\nIf availableCopies === 0 → show Reserve button\n\nAfter a successful reservation, show the member their queue position:\n"You are #3 in line."\n\nThis number must come from the server response — not calculated on the client.',
                order: 6,
              },
              {
                title: "Error Handling",
                content:
                  'The UI should handle and display:\n"Book is available — no reservation needed"\n"You already have an active reservation for this book"\nGeneric server errors',
                order: 7,
              },
              {
                title: "Practice Lab: Reservation Payload Validator",
                content:
                  "Practice writing request-payload validation for reservation creation input.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Validate required fields and return early errors before calling database logic.",
                  language: "javascript",
                  starter_code:
                    "function validateReservationPayload(body) {\n  // return true only when both IDs are positive numbers\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// return true only when both IDs are positive numbers",
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "validateReservationPayload",
                  test_cases: [
                    {
                      input: [{ bookId: 4, memberId: 2 }],
                      expected: true,
                      label: "valid numeric IDs",
                    },
                    {
                      input: [{ bookId: 0, memberId: 2 }],
                      expected: false,
                      label: "zero bookId",
                    },
                    {
                      input: [{ bookId: 9, memberId: -1 }],
                      expected: false,
                      label: "negative memberId",
                    },
                    {
                      input: [{ bookId: "9", memberId: 2 }],
                      expected: false,
                      label: "string bookId",
                    },
                  ],
                },
                order: 8,
              },
              {
                title: "Key Takeaway",
                content:
                  "Full-stack features require you to think in two layers: the API contract (what endpoints exist, what they accept, what they return) and the UI contract (what the user sees and does). Build the server first, then connect the client to it.",
                order: 9,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Before inserting a reservation, query the database to check the book's `availableCopies` — the reservation should only be allowed when that value is exactly `0`.",
                order: 1,
              },
              {
                description:
                  "Queue position should be calculated by counting how many active reservations already exist for that book, then adding 1 — do this in the server before the insert.",
                order: 2,
              },
              {
                description:
                  "The GET queue endpoint needs to include related `member` and `book` fields in the response — use Prisma's `include` option to join those relations.",
                order: 3,
              },
              {
                description:
                  "In `Books.tsx`, check `availableCopies` to decide which button to show — the Reserve button should only appear when copies are `0`, and it should call the service function, not the API directly.",
                order: 4,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "`POST /api/reservations` returns HTTP `201` with `{ success: true, data: Reservation }` for valid requests",
                is_required: true,
                order: 1,
              },
              {
                description: "Request body includes `bookId` and `memberId`",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Reservation create is allowed only when target book has `availableCopies === 0`",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Duplicate active reservation for the same member and book returns HTTP `400`",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "Required implementation names are exact and case-sensitive: `createReservation` in `server/src/controllers/reservation.controller.ts`, `createReservation` in `client/src/services/libraryService.ts`, Route path is `/api/reservations` in `server/src/routes/reservation.routes.ts`",
                is_required: true,
                order: 5,
              },
              {
                description:
                  "`GET /api/reservations?bookId=<id>` returns HTTP `200` with `{ success: true, data: ReservationQueueRow[] }`",
                is_required: true,
                order: 6,
              },
              {
                description:
                  "Each queue row includes `id`, `bookId`, `memberId`, `queuePosition`, `status`, `createdAt`",
                is_required: true,
                order: 7,
              },
              {
                description:
                  "Each queue row includes display-ready relation data: `member.name` and `book.title`",
                is_required: true,
                order: 8,
              },
              {
                description:
                  "Queue response is ordered by `queuePosition` ascending",
                is_required: true,
                order: 9,
              },
              {
                description:
                  "`client/src/pages/Books.tsx` renders `Reserve Book` only when `availableCopies` is `0`",
                is_required: true,
                order: 10,
              },
              {
                description:
                  "Borrow action stays primary when `availableCopies` is greater than `0`",
                is_required: true,
                order: 11,
              },
              {
                description:
                  "Reserve action triggers `createReservation(...)` from `client/src/services/libraryService.ts`",
                is_required: true,
                order: 12,
              },
              {
                description:
                  "Reservation errors (book available, duplicate reservation, invalid member) are shown in UI",
                is_required: true,
                order: 13,
              },
              {
                description:
                  "After successful reservation, UI confirms queue position (for example: `You are #3 in line.`)",
                is_required: true,
                order: 14,
              },
              {
                description:
                  "Queue length and position display are based on backend response, not hard-coded client math",
                is_required: true,
                order: 15,
              },
              {
                description:
                  "Empty queue state for a book displays `No active reservations.`",
                is_required: true,
                order: 16,
              },
            ],
          },
        },
        {
          task_name: "Fulfill and Manage Reservation Lifecycle",
          test_type: "both",
          user_story:
            "As a librarian, I want reservation fulfillment and cancellation to update queue order automatically, So that members always see accurate reservation status and position.",
          learning_sections: {
            create: [
              {
                title: "Overview\nState Machines and Queue Management",
                content:
                  "This section introduces the crash course for reservation lifecycle states and queue management. It provides a high-level view of status transitions, ordering rules, and consistent state handling throughout the task.",
                order: 1,
              },
              {
                title: "What is a Lifecycle?",
                content:
                  "A lifecycle describes all the states a thing can be in and how it moves between them. For a reservation, the lifecycle looks like this:\n\nRESERVED → READY_FOR_PICKUP → (borrowed, reservation complete)\n                     ↓\n                 CANCELLED\n\nEach state has meaning:\nRESERVED — in the queue, waiting\nREADY_FOR_PICKUP — a copy is available, this member is next\nCANCELLED — member withdrew from the queue",
                order: 2,
              },
              {
                title: "State Transitions: When and How",
                content:
                  '### RESERVED → READY_FOR_PICKUP\nThis happens automatically when a book is returned. The return flow should:\nMark the borrow record as returned\nIncrement availableCopies\nCheck if any active reservations exist for this book\nIf yes, promote the first one (lowest queuePosition) to READY_FOR_PICKUP\n\nAll of this happens inside one transaction — it\'s one atomic action.\n\n### RESERVED → CANCELLED\nTriggered by the member. The cancellation flow should:\nMark the reservation as CANCELLED\nReindex the remaining active reservations so positions stay continuous\n\n### Reindexing the Queue\nWhen reservation #2 is cancelled, the queue looks like this:\nPosition 1 → Member A (RESERVED)\nPosition 2 → CANCELLED\nPosition 3 → Member C (RESERVED)\n\nAfter reindex:\nPosition 1 → Member A\nPosition 2 → Member C ← was 3, now 2\n\nReindexing ensures members always see accurate "You are #N in line" numbers.',
                order: 3,
              },
              {
                title: "Transactional Queue Mutations",
                content:
                  "Both promotion and reindexing must happen inside a transaction:\n\nawait prisma.$transaction(async (tx) => {\n  // cancel the reservation\n  await tx.reservation.update({\n    where: { id },\n    data: { status: 'CANCELLED' }\n  });\n\n  // reindex remaining reservations\n  const remaining = await tx.reservation.findMany({\n    where: { bookId, status: 'RESERVED' },\n    orderBy: { createdAt: 'asc' }\n  });\n\n  for (let i = 0; i < remaining.length; i++) {\n    await tx.reservation.update({\n      where: { id: remaining[i].id },\n      data: { queuePosition: i + 1 }\n    });\n  }\n});",
                order: 4,
              },
              {
                title: "Client Side: Reservation List View",
                content:
                  "The UI should show each reservation with:\nBook title\nCurrent queue position\nStatus (visually distinct for READY_FOR_PICKUP vs RESERVED)\nA cancel button (only for active reservations)\n\nAlways render based on server data — never compute lifecycle status on the client.",
                order: 5,
              },
              {
                title: "Practice Lab: Queue Snapshot Formatter",
                content:
                  "Practice building a queue summary formatter for UI display.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Map reservation rows into readable summary lines with position + member + status.",
                  language: "javascript",
                  starter_code:
                    "function formatQueueSnapshot(rows) {\n  // Return one summary string joined by \" | \"\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// Return one summary string joined by \" | \"",
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "formatQueueSnapshot",
                  test_cases: [
                    {
                      input: [[
                        { queuePosition: 1, memberName: "Ari", status: "RESERVED" },
                        { queuePosition: 2, memberName: "Bea", status: "READY_FOR_PICKUP" },
                      ]],
                      expected: "#1 Ari [RESERVED] | #2 Bea [READY_FOR_PICKUP]",
                      label: "two-row queue",
                    },
                    {
                      input: [[]],
                      expected: "(empty queue)",
                      label: "empty queue",
                    },
                  ],
                },
                order: 6,
              },
              {
                title: "Key Takeaway",
                content:
                  "Lifecycle management is about controlling state transitions carefully. Use explicit states, handle transitions in the right place (server), keep mutations atomic, and always let the backend be the source of truth.",
                order: 7,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Inside the `returnBook` function, after incrementing `availableCopies`, query for the reservation with the lowest `queuePosition` and status `RESERVED` — that's the one to promote.",
                order: 1,
              },
              {
                description:
                  "The promotion and return updates should all be inside the same `prisma.$transaction` — if any part fails, none of the changes should persist.",
                order: 2,
              },
              {
                description:
                  "After cancelling a reservation, fetch the remaining active reservations for that book ordered by `createdAt`, then loop through them and reassign positions starting from 1.",
                order: 3,
              },
              {
                description:
                  "In the reservation list UI, use the `status` field from the API response to decide how to style each row — don't derive or guess status on the client side.",
                order: 4,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "In `returnBook` flow, when a returned book has active reservations and stock becomes available, first queue entry is updated to `READY_FOR_PICKUP`",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Queue progression updates happen in the same transactional boundary as return updates",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Required implementation names are exact and case-sensitive: `returnBook` in `server/src/controllers/borrow.controller.ts`, `promoteNextReservation` in `server/src/controllers/reservation.controller.ts`",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "`DELETE /api/reservations/:id` (or equivalent cancel endpoint) marks reservation as `CANCELLED`",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "Cancellation triggers queue reindex so remaining active reservations have continuous positions (`1..n`)",
                is_required: true,
                order: 5,
              },
              {
                description:
                  "Cancelling an already cancelled or fulfilled reservation returns HTTP `400`",
                is_required: true,
                order: 6,
              },
              {
                description:
                  "Required implementation names are exact and case-sensitive: `cancelReservation` in `server/src/controllers/reservation.controller.ts`, `cancelReservation` in `client/src/services/libraryService.ts`",
                is_required: true,
                order: 7,
              },
              {
                description:
                  "Client provides a reservation list view for the member showing `book.title`, `queuePosition`, and `status`",
                is_required: true,
                order: 8,
              },
              {
                description:
                  "Rows with `READY_FOR_PICKUP` are visually distinct from `RESERVED`",
                is_required: true,
                order: 9,
              },
              {
                description: "Empty state displays `No reservations found.`",
                is_required: true,
                order: 10,
              },
              {
                description:
                  "On successful cancellation, UI confirms: `Reservation cancelled.`",
                is_required: true,
                order: 11,
              },
              {
                description:
                  "On queue updates, affected members see updated position values from backend response",
                is_required: true,
                order: 12,
              },
              {
                description:
                  "UI never computes lifecycle status from local assumptions; it uses server status output",
                is_required: true,
                order: 13,
              },
            ],
          },
        },
      ],
    },
  },
  {
    id: "pern-lb-level-5",
    title: "The Production Struggle",
    subtitle: "Investigate and fix a critical production issue.",
    order: 5,
    deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: Congratulations! The project is in production, but a critical issue has been reported by the client. Your mission is to investigate the problem, identify the root cause, and deliver a fix as soon as possible to maintain system reliability.",
    xp_reward: 75,
    coin_reward: 375,
    key_takeaways:
      "Pagination is essential for handling large datasets in React applications consuming Express APIs with PostgreSQL. It improves frontend performance and user experience by loading data incrementally instead of overwhelming the React UI with massive datasets. Implement proper pagination with clear navigation controls and loading states for scalable React + Express + PostgreSQL applications.\n\nAutomated testing is crucial for maintaining code quality in React + Express + Prisma + PostgreSQL applications. Tests ensure that React component changes, Express API modifications, and Prisma database operations work correctly together and prevent regressions. Always write tests for critical business logic and user interactions to maintain reliable full-stack applications.",
    scenario_id: "scenario-1",
    tasks: {
      create: [
        {
          task_name: "Stabilize Overdue Report Classification",
          test_type: "server",
          user_story:
            "As a developer, I want the overdue report to classify records by source-of-truth fields, So that client-visible overdue output remains correct even with stale status data.",
          learning_sections: {
            create: [
              {
                title:
                  "Overview\nDebugging Production Data: Source of Truth vs. Stale State",
                content:
                  "This section introduces the crash course for debugging production data using source-of-truth fields. It explains how to evaluate stale-state risks and classify records accurately within the task context.",
                order: 1,
              },
              {
                title: "The Production Bug",
                content:
                  "The overdue report is showing books as overdue even when they've already been returned. This is a stale data classification bug — the system is trusting a status field that may not reflect reality.",
                order: 2,
              },
              {
                title: "Why Does Stale Status Happen?",
                content:
                  "In a database, you often have:\n\nA computed/derived field — like status (BORROWED, OVERDUE, RETURNED) that gets set at specific points in time\nA source-of-truth field — like returnedAt which is only ever set when an actual return happens\n\nThe problem: status can become stale. If the code that updates status to RETURNED fails or is skipped, the record still has status = 'OVERDUE' even though returnedAt has a value.\n\nRecord:\n{ status: 'OVERDUE', returnedAt: '2024-01-10', dueDate: '2024-01-05' }\n↑ stale!\n↑ source of truth: book WAS returned",
                order: 3,
              },
              {
                title: "The Fix: Trust Source-of-Truth Fields",
                content:
                  "Instead of filtering overdue records by status:\n\n// ❌ Unreliable — status can be stale\nwhere: { status: 'OVERDUE' }\n\nFilter by the fields that cannot lie:\n\n// ✅ Reliable — returnedAt is only set when a return actually happened\nwhere: {\n  returnedAt: null, // not returned yet\n  dueDate: { lt: new Date() } // past due date\n}\n\nA record with returnedAt != null was returned — full stop. No status value can override that fact.",
                order: 4,
              },
              {
                title: "UTC and Timezone Boundaries",
                content:
                  "Overdue logic is time-sensitive. Bugs often appear at midnight boundaries due to timezone differences. Always use UTC timestamps in tests:\n\nconst yesterday = new Date('2024-01-09T23:59:59Z'); // just before midnight UTC\nconst today = new Date('2024-01-10T00:00:01Z'); // just after midnight UTC\n\nUsing fixed, deterministic timestamps makes bugs reproducible — especially at edge cases.",
                order: 5,
              },
              {
                title: "What is a Regression Test?",
                content:
                  "A regression test captures a bug so it can never silently return. You write it to reproduce the current broken behavior, then fix the code until the test passes. If the bug ever comes back, the test fails again — alerting you immediately.",
                order: 6,
              },
              {
                title: "Practice Lab: Overdue Label Helper",
                content:
                  "Practice writing a small helper that labels records as overdue/not overdue.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    'Create a helper that returns "OVERDUE" or "ON_TIME" from dueDate + returnedAt.',
                  language: "javascript",
                  starter_code:
                    "function getOverdueLabel(dueDate, returnedAt) {\n  // TODO\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO",
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "getOverdueLabel",
                  test_cases: [
                    {
                      input: ["2024-01-01T00:00:00.000Z", null],
                      expected: "OVERDUE",
                      label: "past due and not returned",
                    },
                    {
                      input: ["3024-01-01T00:00:00.000Z", null],
                      expected: "ON_TIME",
                      label: "future due and not returned",
                    },
                    {
                      input: ["2024-01-01T00:00:00.000Z", "2024-01-02T00:00:00.000Z"],
                      expected: "ON_TIME",
                      label: "already returned",
                    },
                  ],
                },
                order: 7,
              },
              {
                title: "Key Takeaway",
                content:
                  "In production debugging, always identify the source-of-truth field — the field that is set directly from a real-world event, not derived or computed. Build your queries around those fields, not cached status values.",
                order: 8,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Look at the overdue query in the borrow controller — check whether it filters by `status` or by `returnedAt` and `dueDate`, and think about which is more reliable.",
                order: 1,
              },
              {
                description:
                  "Create a test record that has `returnedAt` set to a real date but `status` still showing as `OVERDUE` — this is your stale-status reproduction case.",
                order: 2,
              },
              {
                description:
                  "Use fixed UTC timestamps close to midnight in your test data to ensure the boundary between overdue and not-overdue is deterministic and reproducible.",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "`/api/borrow-records/overdue` excludes any record with `returnedAt != null` regardless of status value",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "`/api/borrow-records/overdue` includes past-due unreturned records",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "A stale-status discrepancy case is reproducible and covered by tests",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "A UTC midnight boundary case is covered by deterministic test data",
                is_required: true,
                order: 4,
              },
            ],
          },
        },
        {
          task_name: "Deliver Permanent Fix and Documentation",
          test_type: "server",
          user_story:
            "As a developer, I want to fix overdue mismatches and document the root cause, So that the client can trust overdue reports.",
          learning_sections: {
            create: [
              {
                title:
                  "Overview\nProduction Fixes: Regression Tests, Shared Utilities, and Postmortems",
                content:
                  "This section introduces the crash course for delivering a durable production fix. It outlines the high-level task approach for using regression tests, shared logic, and documentation to prevent recurrence.",
                order: 1,
              },
              {
                title: "The Professional Fix Workflow",
                content:
                  'In production, a proper fix isn\'t just "change the code and redeploy." It follows this pattern: Write a failing test that reproduces the bug\nImplement the fix\nConfirm the test now passes\nCentralize the logic to prevent future drift\nWrite a postmortem document',
                order: 2,
              },
              {
                title: "Step 1: Regression Tests First",
                content:
                  "Write the test before fixing the code. This proves:\nThe bug exists (test fails before fix)\nYour fix works (test passes after fix)\nThe bug can never silently return (test will catch it)\n\nit('should not list returned books as overdue even with stale OVERDUE status', async () => {\n  // create a record that has returnedAt set but status = 'OVERDUE'\n  // call /api/borrow-records/overdue\n  // assert: this record is NOT in the response\n});",
                order: 3,
              },
              {
                title: "Step 2: Centralize the Date Logic",
                content:
                  "Overdue determination logic (returnedAt === null && dueDate < now) should live in one shared utility:\n\n// utils/overdueUtils.ts\nexport function isOverdue(returnedAt: Date | null, dueDate: Date): boolean {\n  return returnedAt === null && dueDate < new Date();\n}\n\nThis prevents the same logic from being written differently in multiple places (the original cause of the bug).",
                order: 4,
              },
              {
                title: "Step 3: Writing a Postmortem",
                content:
                  'A postmortem is a short document written after a production incident. It\'s not about blame — it\'s about learning and preventing recurrence. A good postmortem includes:\n\n### Symptom\nWhat the user/client observed:\n"Overdue report shows returned books as overdue"\n\n### Root Cause\nThe technical reason it happened:\n"The overdue query filtered by status field which can become stale when the return flow fails mid-way. Books with returnedAt set but status = \'OVERDUE\' were incorrectly included."\n\n### Fix\nWhat you changed:\n"Replaced status-based filter with returnedAt IS NULL AND dueDate < NOW() in the Prisma query. Centralized this logic in overdueUtils.ts."\n\n### Prevention\nHow to stop it from happening again:\n"Added regression test coverage. Added code comment warning against using status for overdue classification."',
                order: 5,
              },
              {
                title: "Practice Lab: Incident Timeline Note",
                content:
                  "Practice drafting a concise incident timeline separate from the full postmortem.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Write a 4-line timeline: detection, impact window, mitigation, and final verification.",
                  language: "javascript",
                  starter_code:
                    "export function formatIncidentTimeline() {\n  return [\n    \"- Detection: [detection detail]\",\n    \"- Impact Window: [impact window]\",\n    \"- Mitigation: [mitigation step]\",\n    \"- Verification: [verification result]\",\n  ].join(\"\\n\");\n}\n",
                  editable_regions: [
                    {
                      placeholder: "[detection detail]",
                      case_sensitive: false,
                    },
                    {
                      placeholder: "[impact window]",
                      case_sensitive: false,
                    },
                    {
                      placeholder: "[mitigation step]",
                      case_sensitive: false,
                    },
                    {
                      placeholder: "[verification result]",
                      case_sensitive: false,
                    },
                  ],
                  entry_point: "formatIncidentTimeline",
                  test_cases: [
                    {
                      input: [],
                      expected:
                        "- Detection: Alert from overdue report\n- Impact Window: 09:00-11:00 UTC\n- Mitigation: query patched\n- Verification: regression test passed",
                      label: "required incident timeline output",
                    },
                  ],
                },
                order: 6,
              },
              {
                title: "Key Takeaway",
                content:
                  "A permanent fix includes tests, centralized logic, and documentation. Tests prevent regression. Shared utilities prevent drift. Postmortems prevent the same mistake from being made again by the next developer.",
                order: 7,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Write your test to create a record with \`returnedAt\` set but \`status\` still as \`OVERDUE\`, then assert it does NOT appear in the overdue endpoint response — this confirms the bug exists before you fix it.",
                order: 1,
              },
              {
                description:
                  "Extract the overdue check condition into a standalone utility function — the controller should call that function rather than duplicating the logic inline.",
                order: 2,
              },
              {
                description:
                  "Your postmortem should be a short markdown or text file covering: what the symptom was, what caused it technically, what you changed, and what would prevent similar bugs in the future.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description: "Incorrect overdue markings are resolved",
                is_required: true,
                order: 1,
              },
              {
                description: "Returned items are no longer listed overdue",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Overdue reports match source borrowing and return records",
                is_required: true,
                order: 3,
              },
              {
                description: "Spot checks confirm data consistency",
                is_required: true,
                order: 4,
              },
              {
                description: "Root cause is documented",
                is_required: true,
                order: 5,
              },
              {
                description:
                  "Fix approach and validation steps are documented",
                is_required: true,
                order: 6,
              },
            ],
          },
        },
      ],
    },
  },
  // ─────────────────────────────────────────────
  // SCENARIO 2 — UrbanPottery Online Enterprise
  // ─────────────────────────────────────────────
  {
    id: "pern-oe-level-1",
    title: "Getting Familiar with the Codebase",
    subtitle: "Set up the development environment and make a minor brand UI change.",
    order: 1,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: UrbanPottery has just onboarded a new developer. Get the PERN stack running locally — install dependencies in all three package roots, run Prisma migrations, start both dev servers, and update the brand name in the Navbar to match the official style guide.",
    xp_reward: 100,
    coin_reward: 50,
    key_takeaways:
      "A PERN stack project requires separate npm install runs in the root, client/, and server/ directories. Prisma migrations keep the PostgreSQL schema in sync with your code. Environment variables (DATABASE_URL, PORT) are read by dotenv and must never be committed. React layout components like Navbar are the single place to update global brand text — change it once and it updates everywhere.",
    scenario_id: "scenario-2",
    tasks: {
      create: [
        {
          task_name: "Prepare Development Environment",
          test_type: "client",
          user_story:
            "As a developer, I want to set up my local PERN environment so that I can run the UrbanPottery app and start contributing.",
          learning_sections: {
            create: [
              {
                title: "Overview\nSetting Up a PERN Stack Project",
                content:
                  "This crash course walks you through preparing a PERN (PostgreSQL + Express + React + Node.js) development environment from scratch. By the end you will have both servers running and the database schema applied.",
                order: 1,
              },
              {
                title: "What is the PERN Stack?",
                content:
                  "PERN = PostgreSQL + Express + React + Node.js.\n\nPostgreSQL stores your data.\nExpress (Node.js) handles your API routes.\nReact renders the user interface.\nPrisma bridges Express and PostgreSQL with a type-safe ORM.",
                order: 2,
              },
              {
                title: "Three Package Roots",
                content:
                  "This project has three separate package.json files:\nroot/          ← shared scripts (test runner, concurrently)\n├── client/    ← React + Vite + Tailwind\n└── server/    ← Express + Prisma\n\nRun npm install in each directory independently.",
                order: 3,
              },
              {
                title: "Environment Variables",
                content:
                  "Sensitive configuration lives in .env files:\nDATABASE_URL=\"postgresql://user:pass@localhost:5432/urbanpottery\"\nPORT=5000\nJWT_SECRET=your-secret\n\nThe dotenv package loads these at runtime. Never commit .env — it is gitignored intentionally. The project's README lists every required variable.",
                order: 4,
              },
              {
                title: "Prisma Migrations",
                content:
                  "After installing dependencies, run:\nnpx prisma migrate dev --name init\n\nThis reads server/prisma/schema.prisma, creates SQL, and applies it to PostgreSQL. Run prisma generate afterward (or it runs automatically) to regenerate the type-safe client.",
                order: 5,
              },
              {
                title: "Practice Lab: cd Navigation",
                content: "Practice navigating between the three project directories.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "TERMINAL_CD" as const,
                interactive_config: {
                  instructions:
                    "Navigate from /workspace to /workspace/client, then to /workspace/server, then back to /workspace.",
                  initial_directory: "/workspace",
                  expected_commands: ["cd client", "cd ../server", "cd .."],
                  directory_tree: {
                    "/workspace": ["client", "server", "package.json"],
                    "/workspace/client": ["src", "package.json"],
                    "/workspace/server": ["src", "prisma", "package.json"],
                  },
                },
                order: 6,
              },
              {
                title: "Key Takeaway",
                content:
                  "A working PERN environment means: all three node_modules folders present, .env configured, Prisma schema migrated, and both dev servers running without errors.",
                order: 7,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "There are three directories that each contain a package.json — you must run npm install in all three (root, client/, server/).",
                order: 1,
              },
              {
                description:
                  "Check the README for the required environment variables and create a .env file inside server/ before running migrations.",
                order: 2,
              },
              {
                description:
                  "After installing server dependencies, run `npx prisma migrate dev` inside the server/ directory to apply the schema.",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description: "Dependencies installed in root, client/, and server/ without errors",
                is_required: true,
                order: 1,
              },
              {
                description: "Prisma migrations executed successfully (schema applied to PostgreSQL)",
                is_required: true,
                order: 2,
              },
              {
                description: "Both client (port 5173) and server (port 5000) start without errors",
                is_required: true,
                order: 3,
              },
            ],
          },
        },
        {
          task_name: "Update Brand Identity in Navbar",
          test_type: "client",
          user_story:
            "As a user, I want the navbar to show the full official brand name so that the site matches the marketing style guide.",
          learning_sections: {
            create: [
              {
                title: "Overview\nEditing React Layout Components",
                content:
                  "This crash course shows you how to locate and safely update a brand string inside a React layout component without breaking the surrounding UI.",
                order: 1,
              },
              {
                title: "What is a Layout Component?",
                content:
                  "Layout components (Navbar, Footer, Sidebar) are rendered on every page. They live in client/src/components/layout/. Changing text in one file updates the brand across the entire app instantly.",
                order: 2,
              },
              {
                title: "JSX Text Nodes",
                content:
                  "In JSX, plain text inside tags is a text node:\n<span className=\"font-bold\">UrbanPottery</span>\n\nTo update the brand, find this span and change its content to the exact required string — case and spaces matter.",
                order: 3,
              },
              {
                title: "Vite HMR",
                content:
                  "Vite's Hot Module Replacement updates the browser instantly when you save a file — no manual refresh needed. Save the file and watch the Navbar update in real time.",
                order: 4,
              },
              {
                title: "Practice Lab: Update Heading Text",
                content: "Practice editing a JSX text node to match a target string.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions: 'Change the returned string from "UrbanPottery" to "UrbanPottery Artisan Ceramics".',
                  language: "tsx",
                  starter_code: 'export function getBrandName() {\n  return "UrbanPottery";\n}\n',
                  editable_regions: [{ placeholder: "UrbanPottery", case_sensitive: true }],
                  entry_point: "getBrandName",
                  test_cases: [
                    { input: [], expected: "UrbanPottery Artisan Ceramics", label: "exact brand string" },
                  ],
                },
                order: 5,
              },
              {
                title: "Key Takeaway",
                content:
                  "Layout components are the single source of truth for global UI text. Update the text node in Navbar.tsx and the change propagates everywhere — no search-and-replace across pages needed.",
                order: 6,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Open client/src/components/layout/Navbar.tsx and search for the current brand text — it is a hardcoded string inside a <span> element near the logo.",
                order: 1,
              },
              {
                description:
                  "The acceptance criteria specifies the exact string — copy it character-for-character including spaces and capitalisation.",
                order: 2,
              },
              {
                description:
                  "After saving, confirm the change appears in the running browser on both desktop and mobile viewport widths.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description: 'Navbar brand text is exactly "UrbanPottery Artisan Ceramics"',
                is_required: true,
                order: 1,
              },
              {
                description: "Brand renders correctly on desktop and mobile viewports",
                is_required: true,
                order: 2,
              },
            ],
          },
        },
      ],
    },
  },
  {
    id: "pern-oe-level-2",
    title: "Client-Side Exploration",
    subtitle: "Build a stock status helper and adopt it across the UI.",
    order: 2,
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: The shop page uses duplicate inline stock checks scattered across components. Your job is to create a shared getStockStatus helper that returns a 3-state enum, then refactor ProductCard to use it and add a 'Hide out-of-stock' toggle on the Shop page.",
    xp_reward: 25,
    coin_reward: 125,
    key_takeaways:
      "Pure functions returning union types are more expressive than booleans when there are more than two meaningful states. Centralising threshold logic in a shared helper eliminates drift between components. A user-facing filter toggle driven by the helper proves the abstraction is working end-to-end.",
    scenario_id: "scenario-2",
    tasks: {
      create: [
        {
          task_name: "Add Stock Status Classifier Helper",
          test_type: "client",
          user_story:
            "As a developer, I want a getStockStatus helper in formatters.ts so that stock-level decisions are consistent and testable across all components.",
          learning_sections: {
            create: [
              {
                title: "Overview\nPure Functions Returning Union Types",
                content:
                  "This crash course covers writing a threshold-based classifier as a pure function that returns a typed union rather than a boolean.",
                order: 1,
              },
              {
                title: "Why a Union Type Instead of a Boolean?",
                content:
                  "A boolean tells you available / not available.\nA union type tells you IN_STOCK | LOW_STOCK | OUT_OF_STOCK.\n\nThree states allow the UI to show three different badge colours and the filter to make a more precise decision. Booleans collapse that information.",
                order: 2,
              },
              {
                title: "Threshold-Based Classification",
                content:
                  "Classify stock into three buckets:\nstock <= 0  → 'OUT_OF_STOCK'\n1 ≤ stock ≤ 5 → 'LOW_STOCK'\nstock > 5   → 'IN_STOCK'\n\nBoundary values (0, 1, 5, 6) are the most important to test.",
                order: 3,
              },
              {
                title: "Placing the Helper",
                content:
                  "Add getStockStatus to the existing file:\nclient/src/utils/formatters.ts\n\nIt already contains formatCurrency, formatDate, truncateText, and getStarRating. Export the new function from the same file and re-export it through client/src/utils/index.ts.",
                order: 4,
              },
              {
                title: "Testing Boundary Values",
                content:
                  "Always test at, just inside, and just outside each boundary:\ngetStockStatus(0)  → 'OUT_OF_STOCK'\ngetStockStatus(1)  → 'LOW_STOCK'\ngetStockStatus(5)  → 'LOW_STOCK'\ngetStockStatus(6)  → 'IN_STOCK'",
                order: 5,
              },
              {
                title: "Practice Lab: Three-Bucket Classifier",
                content: "Practice writing a threshold classifier that returns one of three string values.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement getStockStatus(stock): returns 'OUT_OF_STOCK' (<=0), 'LOW_STOCK' (1-5), or 'IN_STOCK' (>5).",
                  language: "javascript",
                  starter_code:
                    "export function getStockStatus(stock) {\n  // TODO\n}\n",
                  editable_regions: [{ placeholder: "// TODO", case_sensitive: true }],
                  entry_point: "getStockStatus",
                  test_cases: [
                    { input: [0], expected: "OUT_OF_STOCK", label: "zero stock" },
                    { input: [3], expected: "LOW_STOCK", label: "low stock" },
                    { input: [10], expected: "IN_STOCK", label: "in stock" },
                  ],
                },
                order: 6,
              },
              {
                title: "Key Takeaway",
                content:
                  "When a domain concept has more than two states, use a union type. One pure function with clear thresholds is easier to test and read than multiple ad-hoc comparisons spread across components.",
                order: 7,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Add the function to client/src/utils/formatters.ts and export it — you do not need a new file.",
                order: 1,
              },
              {
                description:
                  "Pay close attention to the boundary values: stock === 0 must be OUT_OF_STOCK, stock === 1 must be LOW_STOCK, stock === 5 must be LOW_STOCK, and stock === 6 must be IN_STOCK.",
                order: 2,
              },
              {
                description:
                  "Make sure the function is also re-exported from client/src/utils/index.ts so other files can import it via '../utils'.",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description: "getStockStatus is exported from client/src/utils/formatters.ts",
                is_required: true,
                order: 1,
              },
              {
                description: "Returns 'OUT_OF_STOCK' for stock <= 0",
                is_required: true,
                order: 2,
              },
              {
                description: "Returns 'LOW_STOCK' for stock 1..5 (inclusive)",
                is_required: true,
                order: 3,
              },
              {
                description: "Returns 'IN_STOCK' for stock > 5",
                is_required: true,
                order: 4,
              },
              {
                description: "Boundary values 0, 1, 5, 6 all return the correct bucket",
                is_required: true,
                order: 5,
              },
              {
                description: "Function is pure — same input always returns same output",
                is_required: true,
                order: 6,
              },
            ],
          },
        },
        {
          task_name: "Adopt Stock Helper in ProductCard & Shop Filter",
          test_type: "client",
          user_story:
            "As a shopper, I want to toggle 'Hide out-of-stock' on the Shop page so I only see products I can actually buy.",
          learning_sections: {
            create: [
              {
                title: "Overview\nRefactoring Inline Checks and Adding a Filter Toggle",
                content:
                  "This crash course covers replacing duplicated inline stock comparisons with the shared helper, and adding a new user-facing toggle that uses the same helper for filtering.",
                order: 1,
              },
              {
                title: "The Refactoring Goal",
                content:
                  "ProductCard.tsx currently has:\nconst isOutOfStock = product.stock === 0;\nconst isLowStock = product.stock > 0 && product.stock <= 5;\n\nAfter refactoring:\nconst status = getStockStatus(product.stock);\nconst isOutOfStock = status === 'OUT_OF_STOCK';\nconst isLowStock = status === 'LOW_STOCK';",
                order: 2,
              },
              {
                title: "Adding the Shop Toggle",
                content:
                  "Add a boolean state to Shop.tsx:\nconst [hideOutOfStock, setHideOutOfStock] = useState(false);\n\nFilter the products list:\nconst filteredProducts = products.filter(p => {\n  if (hideOutOfStock && getStockStatus(p.stock) === 'OUT_OF_STOCK') return false;\n  // existing search/category filters...\n  return true;\n});\n\nRender a checkbox or toggle button labelled 'Hide out-of-stock'.",
                order: 3,
              },
              {
                title: "Non-Regression Checklist",
                content:
                  "After refactoring:\n- Out-of-stock products still show the 'Out of Stock' overlay\n- Low-stock products still show the 'Only N left' badge\n- The toggle hides out-of-stock when active and shows them when inactive\n- Existing search and category filters still work",
                order: 4,
              },
              {
                title: "Practice Lab: Refactor a Stock Badge",
                content: "Practice replacing an inline stock check with a helper call.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Refactor getBadgeLabel to use getStockStatus instead of an inline comparison.",
                  language: "javascript",
                  starter_code:
                    "function getStockStatus(stock) {\n  if (stock <= 0) return 'OUT_OF_STOCK';\n  if (stock <= 5) return 'LOW_STOCK';\n  return 'IN_STOCK';\n}\n\nexport function getBadgeLabel(stock) {\n  if (stock === 0) return 'Out of Stock'; // inline — refactor me\n  if (stock <= 5) return 'Low Stock';\n  return 'In Stock';\n}\n",
                  required_code_includes: ["getStockStatus(stock)"],
                  editable_regions: [{ placeholder: "if (stock === 0) return 'Out of Stock'; // inline — refactor me\n  if (stock <= 5) return 'Low Stock';\n  return 'In Stock';", case_sensitive: false }],
                  entry_point: "getBadgeLabel",
                  test_cases: [
                    { input: [0], expected: "Out of Stock", label: "zero stock" },
                    { input: [3], expected: "Low Stock", label: "low stock" },
                    { input: [10], expected: "In Stock", label: "in stock" },
                  ],
                },
                order: 5,
              },
              {
                title: "Key Takeaway",
                content:
                  "Refactoring consolidates logic into one helper and proves it works by wiring the same helper into a new user-facing feature. The toggle is the integration test for the helper.",
                order: 6,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "In ProductCard.tsx, replace the two isOutOfStock and isLowStock const declarations with a single getStockStatus call, then derive the booleans from the returned status string.",
                order: 1,
              },
              {
                description:
                  "In Shop.tsx, add a useState for hideOutOfStock (default false), a filter step that calls getStockStatus, and a visible toggle button or checkbox in the filter card.",
                order: 2,
              },
              {
                description:
                  "Make sure importing getStockStatus in Shop.tsx comes from '../utils' (via the re-export) — not directly from '../utils/formatters'.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description: "ProductCard.tsx imports and uses getStockStatus instead of inline comparisons",
                is_required: true,
                order: 1,
              },
              {
                description: "Shop.tsx imports and uses getStockStatus for the out-of-stock filter",
                is_required: true,
                order: 2,
              },
              {
                description: "A 'Hide out-of-stock' toggle is visible on the Shop page",
                is_required: true,
                order: 3,
              },
              {
                description: "Toggle filters OUT_OF_STOCK products from the grid when active",
                is_required: true,
                order: 4,
              },
              {
                description: "Existing search and category filters still work after refactor",
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
    id: "pern-oe-level-3",
    title: "Backend Debugging & Transactional Consistency",
    subtitle: "Diagnose the cancel-flow stock leak and enforce atomic operations.",
    order: 3,
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: Finance reports that cancelled orders are not restoring product stock — meaning the warehouse counts are wrong. Diagnose the missing restore in the PATCH /orders/:id/status route, then implement an atomic cancelOrder function with a new cancelledAt timestamp field and a concurrency guard at checkout.",
    xp_reward: 40,
    coin_reward: 200,
    key_takeaways:
      "The current PATCH /status route only flips the status field — it never restores stock. Extracting a dedicated cancelOrder controller function wrapped in prisma.$transaction ensures both the status flip and stock restoration happen atomically. Adding a cancelledAt DateTime? column creates a tamper-proof source of truth used by Level 5's revenue fix.",
    scenario_id: "scenario-2",
    tasks: {
      create: [
        {
          task_name: "Diagnose Cancelled-Order Stock Leak",
          test_type: "server",
          user_story:
            "As a backend developer, I want to trace the cancel flow and document why product stock is not restored when orders are cancelled.",
          learning_sections: {
            create: [
              {
                title: "Overview\nTracing a Cancel-Path Data Leak",
                content:
                  "This crash course shows you how to read a route handler, identify missing writes, and understand why stock levels become incorrect after cancellation.",
                order: 1,
              },
              {
                title: "The Bug: Only Status Changes",
                content:
                  "Open server/src/routes/orders.ts and find the PATCH /:id/status handler. It does exactly one thing:\nawait prisma.order.update({ data: { status } });\n\nThere is no step that increments Product.stock for each cancelled OrderItem. Cancelled stock silently disappears.",
                order: 2,
              },
              {
                title: "The Concurrent Oversell Race",
                content:
                  "A second bug: the POST /orders checkout reads stock, then decrements it in a later write. Between the read and write, another request can place the same item. Both succeed, driving stock negative.\n\nThis is a classic TOCTOU (Time-Of-Check-Time-Of-Use) race.",
                order: 3,
              },
              {
                title: "Root Cause Analysis",
                content:
                  "Document both failure paths:\n1. Cancel path — PATCH handler has no stock increment for OrderItems\n2. Concurrent checkout — stock check and decrement are not atomic\n\nEvidence: trace the Prisma calls and list what is missing from each path.",
                order: 4,
              },
              {
                title: "Practice Lab: Spot the Missing Write",
                content: "Practice identifying missing writes in a two-step sequence.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "The function cancels an order but forgets to restore stock. Add the missing step.",
                  language: "typescript",
                  starter_code:
                    "export async function cancelOrderFlow(orderId: string) {\n  const steps: string[] = [];\n  steps.push('SET status=CANCELLED');\n  // TODO: add missing step\n  return steps;\n}\n",
                  editable_regions: [{ placeholder: "// TODO: add missing step", case_sensitive: false }],
                  entry_point: "cancelOrderFlow",
                  test_cases: [
                    { input: ["order-1"], expected: ["SET status=CANCELLED", "RESTORE stock"], label: "both steps present" },
                  ],
                },
                order: 5,
              },
              {
                title: "Key Takeaway",
                content:
                  "A route handler that changes order status without touching inventory is a data-integrity bug waiting to compound. Every state transition that affects related models needs atomic, coordinated writes.",
                order: 6,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Read the PATCH /:id/status handler in server/src/routes/orders.ts — count the Prisma calls. If there is only one (order.update), that is the bug.",
                order: 1,
              },
              {
                description:
                  "Check the POST /orders checkout path — the stock check (findMany) and the stock decrement (update) are in separate steps with no guard condition.",
                order: 2,
              },
              {
                description:
                  "Create server/src/controllers/order.controller.ts with an exported cancelOrder function to house the fix — the tests import from that exact path.",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description: "server/src/controllers/order.controller.ts exists and exports cancelOrder",
                is_required: true,
                order: 1,
              },
              {
                description: "cancelOrder references cancelledAt (documents where the timestamp will live)",
                is_required: true,
                order: 2,
              },
              {
                description: "schema.prisma Order model includes cancelledAt field",
                is_required: true,
                order: 3,
              },
              {
                description: "Problematic cancel path (no stock restore) is identified and documented",
                is_required: true,
                order: 4,
              },
            ],
          },
        },
        {
          task_name: "Atomic Order Cancellation + Concurrency Guard",
          test_type: "server",
          user_story:
            "As a backend engineer, I want cancelOrder to run inside a prisma.$transaction so that stock is atomically restored and cancelledAt is set — and I want checkout to guard against concurrent oversell.",
          learning_sections: {
            create: [
              {
                title: "Overview\nPrisma Transactions and Schema Migrations",
                content:
                  "This crash course covers adding a new column via Prisma migration and implementing a multi-step atomic cancel that restores stock in one transaction.",
                order: 1,
              },
              {
                title: "Prisma Schema Migration",
                content:
                  "Add to the Order model in schema.prisma:\ncancelledAt  DateTime?\n\nThen run:\nnpx prisma migrate dev --name add-cancelled-at\n\nThe ? makes it nullable — existing orders keep cancelledAt: null. Only cancelled orders get a timestamp.",
                order: 2,
              },
              {
                title: "The cancelOrder Transaction",
                content:
                  "await prisma.$transaction(async (tx) => {\n  // 1. Guard: only cancel PENDING or PROCESSING\n  // 2. Flip status to CANCELLED, set cancelledAt: new Date()\n  // 3. Find all OrderItems for this order\n  // 4. For each item, increment Product.stock by item.quantity\n});\n\nAll four steps succeed or all roll back.",
                order: 3,
              },
              {
                title: "Concurrency Guard at Checkout",
                content:
                  "Replace the separate read+update with updateMany that includes the guard:\nawait tx.product.updateMany({\n  where: { id: item.productId, stock: { gte: item.quantity } },\n  data: { stock: { decrement: item.quantity } },\n});\n\nIf 0 rows updated → stock was insufficient → throw and roll back.",
                order: 4,
              },
              {
                title: "Practice Lab: Atomic Audit Write",
                content: "Practice building a two-step atomic transaction plan.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions: "Return both required atomic steps as an array.",
                  language: "typescript",
                  starter_code:
                    "export function buildCancelPlan(): string[] {\n  return [];\n}\n",
                  editable_regions: [{ placeholder: "return [];", case_sensitive: false }],
                  entry_point: "buildCancelPlan",
                  test_cases: [
                    { input: [], expected: ["flip status + set cancelledAt", "restore stock"], label: "both cancel steps" },
                  ],
                },
                order: 5,
              },
              {
                title: "Key Takeaway",
                content:
                  "Transactions make multiple writes atomic. Guard conditions on updateMany prevent race conditions. Together they keep inventory accurate under concurrent load.",
                order: 6,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Add cancelledAt DateTime? to the Order model in schema.prisma and run prisma migrate dev before implementing the controller.",
                order: 1,
              },
              {
                description:
                  "Inside the $transaction callback, query for the order's items first, then loop through them calling tx.product.update with { stock: { increment: item.quantity } }.",
                order: 2,
              },
              {
                description:
                  "In the POST /orders checkout handler, replace the standalone product.update with product.updateMany and include a where condition: { stock: { gte: item.quantity } }. If count === 0, throw an insufficient-stock error.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description: "schema.prisma Order model has cancelledAt DateTime? field",
                is_required: true,
                order: 1,
              },
              {
                description: "cancelOrder uses prisma.$transaction",
                is_required: true,
                order: 2,
              },
              {
                description: "cancelOrder sets cancelledAt: new Date() on the order",
                is_required: true,
                order: 3,
              },
              {
                description: "cancelOrder increments Product.stock for each OrderItem",
                is_required: true,
                order: 4,
              },
              {
                description: "cancelOrder only allows cancellation from PENDING or PROCESSING status",
                is_required: true,
                order: 5,
              },
              {
                description: "POST /api/orders checkout uses updateMany with stock gte guard",
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
    id: "pern-oe-level-4",
    title: "Starting my Full-Stack Journey",
    subtitle: "Implement Coupon / Discount Codes end-to-end.",
    order: 4,
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: Marketing wants a coupon system. Build the Coupon model, a validate endpoint, extend order creation to apply discounts, add coupon input UI to Checkout, and enforce usage limits + expiry atomically — including decrementing usedCount on order cancellation.",
    xp_reward: 60,
    coin_reward: 300,
    key_takeaways:
      "A full-stack feature requires coordinating a new Prisma model, a validation endpoint, a client service, and UI state in one coherent change. Atomic counter mutations (increment/decrement with guards) prevent race conditions where two users both consume the last available coupon slot.",
    scenario_id: "scenario-2",
    tasks: {
      create: [
        {
          task_name: "Validate & Apply Coupon at Checkout",
          test_type: "both",
          user_story:
            "As a shopper, I want to enter a coupon code at checkout and see my discounted total before placing the order.",
          learning_sections: {
            create: [
              {
                title: "Overview\nBuilding a Validation Endpoint + Client Service",
                content:
                  "This crash course covers adding a new Prisma model, a POST /api/coupons/validate endpoint, extending the order creation flow, and building the client service layer and UI.",
                order: 1,
              },
              {
                title: "The Coupon Model",
                content:
                  "Add to schema.prisma:\nmodel Coupon {\n  id              String   @id @default(uuid())\n  code            String   @unique\n  discountPercent Float\n  maxUses         Int\n  usedCount       Int      @default(0)\n  expiresAt       DateTime\n  isActive        Boolean  @default(true)\n  createdAt       DateTime @default(now())\n  updatedAt       DateTime @updatedAt\n}\n\nRun prisma migrate dev after adding.",
                order: 2,
              },
              {
                title: "POST /api/coupons/validate",
                content:
                  "Accepts { code, subtotal }. Returns:\n{ success: true, data: { discountPercent, finalTotal } }\nor 400 if coupon is invalid/expired/exhausted.\n\nValidation checks (all inside one DB read):\n1. Coupon exists and isActive === true\n2. expiresAt > now\n3. usedCount < maxUses",
                order: 3,
              },
              {
                title: "Extending POST /api/orders",
                content:
                  "Accept optional couponCode in the request body. Inside the existing $transaction:\n1. Re-validate the coupon (atomically)\n2. Apply discountPercent to the total\n3. Increment coupon.usedCount",
                order: 4,
              },
              {
                title: "Client Service Layer",
                content:
                  "Create client/src/services/couponService.ts:\nexport async function validateCoupon(code: string, subtotal: number) {\n  const res = await api.post('/api/coupons/validate', { code, subtotal });\n  return res.data;\n}",
                order: 5,
              },
              {
                title: "Checkout UI",
                content:
                  "Add to Checkout.tsx:\n- A text input for coupon code\n- An 'Apply' button that calls validateCoupon\n- State for: applied / invalid / expired / exhausted\n- Display the discounted total when a coupon is applied",
                order: 6,
              },
              {
                title: "Practice Lab: Coupon Validator",
                content: "Practice writing a coupon validation function.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions: "Return true only if all three conditions pass.",
                  language: "javascript",
                  starter_code:
                    "export function isCouponValid(coupon, now) {\n  // isActive, not expired, has remaining uses\n}\n",
                  editable_regions: [{ placeholder: "// isActive, not expired, has remaining uses", case_sensitive: false }],
                  entry_point: "isCouponValid",
                  test_cases: [
                    { input: [{ isActive: true, expiresAt: new Date(9999, 0, 1), usedCount: 0, maxUses: 10 }, new Date()], expected: true, label: "valid coupon" },
                    { input: [{ isActive: false, expiresAt: new Date(9999, 0, 1), usedCount: 0, maxUses: 10 }, new Date()], expected: false, label: "inactive coupon" },
                    { input: [{ isActive: true, expiresAt: new Date(2000, 0, 1), usedCount: 0, maxUses: 10 }, new Date()], expected: false, label: "expired coupon" },
                    { input: [{ isActive: true, expiresAt: new Date(9999, 0, 1), usedCount: 10, maxUses: 10 }, new Date()], expected: false, label: "exhausted coupon" },
                  ],
                },
                order: 7,
              },
              {
                title: "Key Takeaway",
                content:
                  "Always re-validate the coupon inside the order transaction — the client-side check is UX only. The atomic server-side check prevents two simultaneous checkouts from both consuming the last slot.",
                order: 8,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Add the Coupon model to server/prisma/schema.prisma with all six required fields, then run `npx prisma migrate dev` from the server directory.",
                order: 1,
              },
              {
                description:
                  "Create server/src/controllers/coupon.controller.ts with a validateCoupon function, and server/src/routes/coupons.ts that registers it at POST /validate. Register the coupons router in server/src/routes/index.ts.",
                order: 2,
              },
              {
                description:
                  "In Checkout.tsx, add a useState for couponCode (string) and appliedDiscount (number | null). Call validateCoupon from couponService and update state on success.",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description: "Coupon model exists in schema.prisma with all required fields",
                is_required: true,
                order: 1,
              },
              {
                description: "server/src/controllers/coupon.controller.ts exports validateCoupon",
                is_required: true,
                order: 2,
              },
              {
                description: "server/src/routes/coupons.ts registers POST /validate",
                is_required: true,
                order: 3,
              },
              {
                description: "POST /api/orders accepts optional couponCode and increments usedCount inside the transaction",
                is_required: true,
                order: 4,
              },
              {
                description: "client/src/services/couponService.ts exports validateCoupon calling POST /api/coupons/validate",
                is_required: true,
                order: 5,
              },
              {
                description: "Checkout.tsx renders a coupon input field and displays discounted total",
                is_required: true,
                order: 6,
              },
              {
                description: "Invalid / expired / exhausted coupon states are shown in the UI",
                is_required: true,
                order: 7,
              },
            ],
          },
        },
        {
          task_name: "Coupon Lifecycle + Usage Integrity",
          test_type: "both",
          user_story:
            "As a store admin, I want to see coupon usage stats, and as a system, I want coupon usedCount to be decremented when a coupon-bearing order is cancelled.",
          learning_sections: {
            create: [
              {
                title: "Overview\nAtomic Counters, Expiry Guards, and Admin Observability",
                content:
                  "This crash course covers enforcing usage limits atomically, adding an admin coupon list endpoint, and wiring the cancel flow to decrement usedCount.",
                order: 1,
              },
              {
                title: "Atomic usedCount Guard",
                content:
                  "To prevent two simultaneous checkouts both consuming the last slot:\nawait tx.coupon.updateMany({\n  where: { id: couponId, usedCount: { lt: maxUses } },\n  data: { usedCount: { increment: 1 } },\n});\nif (updated.count === 0) throw new Error('Coupon exhausted');\n\nThis is the same guard-condition pattern as the stock race fix in Level 3.",
                order: 2,
              },
              {
                title: "Expiry and isActive Check",
                content:
                  "Always check both conditions before accepting a coupon:\n1. isActive === true\n2. expiresAt > new Date()\n3. usedCount < maxUses\n\nAll three must pass — and re-check server-side inside the order transaction.",
                order: 3,
              },
              {
                title: "GET /api/coupons (Admin)",
                content:
                  "Admin-only endpoint returning all coupons with usage stats:\nGET /api/coupons → { id, code, discountPercent, usedCount, maxUses, expiresAt, isActive }\n\nRequires requireAdmin middleware.",
                order: 4,
              },
              {
                title: "Cancel Order Decrements usedCount",
                content:
                  "When a coupon-bearing order is cancelled, decrement usedCount inside the same cancelOrder $transaction:\nif (order.couponId) {\n  await tx.coupon.update({\n    where: { id: order.couponId },\n    data: { usedCount: { decrement: 1 } },\n  });\n}\n\nThis keeps coupon slots accurate after cancellations.",
                order: 5,
              },
              {
                title: "Admin Coupon Panel",
                content:
                  "Add a section to admin/Dashboard.tsx (or a new admin/Coupons.tsx) that:\n- Fetches GET /api/coupons\n- Shows each coupon's code, remaining uses (maxUses - usedCount), and expiry date",
                order: 6,
              },
              {
                title: "Practice Lab: Counter Guard",
                content: "Practice writing an atomic counter guard.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions: "Return true only if usedCount is strictly less than maxUses.",
                  language: "javascript",
                  starter_code: "export function canUseCoupon(usedCount, maxUses) {\n  // TODO\n}\n",
                  editable_regions: [{ placeholder: "// TODO", case_sensitive: false }],
                  entry_point: "canUseCoupon",
                  test_cases: [
                    { input: [0, 10], expected: true, label: "has remaining uses" },
                    { input: [10, 10], expected: false, label: "exactly exhausted" },
                    { input: [11, 10], expected: false, label: "over limit" },
                  ],
                },
                order: 7,
              },
              {
                title: "Key Takeaway",
                content:
                  "Usage counters must be guarded atomically on increment AND decremented on reversal. Without the decrement on cancel, refunded customers can never use the coupon slot they freed up.",
                order: 8,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Update the coupon validation in coupon.controller.ts to use updateMany with a usedCount: { lt: maxUses } guard, so two concurrent requests cannot both pass.",
                order: 1,
              },
              {
                description:
                  "Add GET /api/coupons to coupons.ts protected by requireAdmin middleware, and include all usage stats in the response.",
                order: 2,
              },
              {
                description:
                  "In the cancelOrder transaction in order.controller.ts, check if the order has a couponId and if so, decrement the coupon's usedCount inside the same transaction.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description: "coupon.controller.ts enforces usedCount < maxUses guard",
                is_required: true,
                order: 1,
              },
              {
                description: "coupon.controller.ts enforces expiresAt > now check",
                is_required: true,
                order: 2,
              },
              {
                description: "coupon.controller.ts enforces isActive check",
                is_required: true,
                order: 3,
              },
              {
                description: "GET /api/coupons admin route exists with usage stats",
                is_required: true,
                order: 4,
              },
              {
                description: "cancelOrder decrements usedCount atomically when a coupon was applied",
                is_required: true,
                order: 5,
              },
              {
                description: "Admin coupon panel shows code, remaining uses, and expiry",
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
    id: "pern-oe-level-5",
    title: "The Production Struggle: Sales Revenue Bug",
    subtitle: "Fix the inflated revenue dashboard and write a postmortem.",
    order: 5,
    deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: Finance cannot close the books. The admin Dashboard's total revenue includes cancelled orders, inflating figures. Worse, if an admin manually flips a cancelled order's status back to PENDING, the status field becomes stale — but cancelledAt still holds the truth. Fix the revenue query to use cancelledAt IS NULL as the source of truth, extract it into a shared utility, and write a postmortem.",
    xp_reward: 75,
    coin_reward: 375,
    key_takeaways:
      "Source-of-truth timestamps (cancelledAt) are more reliable than mutable status fields for financial queries. A shared revenueUtils.ts prevents the same filter logic from being written differently in multiple report endpoints. A postmortem turns a production incident into institutional knowledge that prevents recurrence.",
    scenario_id: "scenario-2",
    tasks: {
      create: [
        {
          task_name: "Stabilize Revenue Classification",
          test_type: "server",
          user_story:
            "As a finance officer, I want the revenue dashboard to exclude cancelled orders even when an admin has accidentally changed the status field, so I can trust the totals.",
          learning_sections: {
            create: [
              {
                title: "Overview\nSource-of-Truth Fields vs. Stale Status",
                content:
                  "This crash course explains why mutable status fields are unreliable for financial queries and how cancelledAt provides an immutable source of truth.",
                order: 1,
              },
              {
                title: "The Bug",
                content:
                  "GET /api/orders/stats sums order.total across ALL orders with no WHERE clause. Cancelled orders are included, inflating revenue.\n\nWorse: if an admin accidentally changes a cancelled order's status back to PENDING, any status-based filter would miss that order entirely.",
                order: 2,
              },
              {
                title: "Why status Is Unreliable",
                content:
                  "status is a mutable field — any admin action can change it. An order can have:\nstatus: 'PENDING'   — because an admin fat-fingered it\ncancelledAt: <date> — the immutable proof it was actually cancelled\n\nThe cancelledAt timestamp is set once and never changed. It is the source of truth.",
                order: 3,
              },
              {
                title: "The Fix: cancelledAt IS NULL",
                content:
                  "Replace the unfiltered query:\n// BEFORE (buggy)\nwhere: {}\n\n// AFTER (correct)\nwhere: { cancelledAt: null }\n\nAn order with cancelledAt set was cancelled — regardless of what status says.",
                order: 4,
              },
              {
                title: "Stale-Status Test Case",
                content:
                  "Write a test with this data:\nOrder A: status='PENDING', cancelledAt=<yesterday>  ← MUST be excluded\nOrder B: status='PENDING', cancelledAt=null           ← MUST be included\n\nIf only filtering by status, both appear identical and both are included — the bug.",
                order: 5,
              },
              {
                title: "Practice Lab: Revenue Filter",
                content: "Practice writing a revenue filter that trusts cancelledAt.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions: "Filter orders to only include those with cancelledAt === null.",
                  language: "javascript",
                  starter_code:
                    "export function getRevenueOrders(orders) {\n  // TODO: return only non-cancelled orders\n}\n",
                  editable_regions: [{ placeholder: "// TODO: return only non-cancelled orders", case_sensitive: false }],
                  entry_point: "getRevenueOrders",
                  test_cases: [
                    {
                      input: [[{ total: 100, cancelledAt: null }, { total: 50, cancelledAt: new Date() }]],
                      expected: [{ total: 100, cancelledAt: null }],
                      label: "excludes cancelled",
                    },
                  ],
                },
                order: 6,
              },
              {
                title: "Key Takeaway",
                content:
                  "In financial reporting, never trust mutable status fields. Use the immutable timestamp that was set at the moment the real-world event (cancellation) occurred.",
                order: 7,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Find the GET /api/orders/stats handler in server/src/routes/orders.ts and add a where: { cancelledAt: null } clause to the findMany call.",
                order: 1,
              },
              {
                description:
                  "Create a test order with cancelledAt set to a past date but status left as 'PENDING' — verify it is excluded from the revenue total after your fix.",
                order: 2,
              },
              {
                description:
                  "Do NOT filter by status: { not: 'CANCELLED' } — a stale PENDING order with cancelledAt set must also be excluded.",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description: "GET /api/orders/stats exists in orders.ts",
                is_required: true,
                order: 1,
              },
              {
                description: "Stats WHERE clause uses cancelledAt: null (source-of-truth filter)",
                is_required: true,
                order: 2,
              },
              {
                description: "Stale-status orders (cancelledAt set, status PENDING) are excluded from revenue",
                is_required: true,
                order: 3,
              },
              {
                description: "Active PENDING and DELIVERED orders (cancelledAt null) are included",
                is_required: true,
                order: 4,
              },
            ],
          },
        },
        {
          task_name: "Permanent Fix + Centralization + Postmortem",
          test_type: "server",
          user_story:
            "As a developer, I want to extract the revenue predicate into a shared utility and document the incident in a postmortem so the team can prevent similar bugs.",
          learning_sections: {
            create: [
              {
                title: "Overview\nShared Utilities, Regression Tests, and Postmortems",
                content:
                  "This crash course covers extracting a Prisma where-clause builder into a reusable utility, writing regression tests, and producing a structured postmortem document.",
                order: 1,
              },
              {
                title: "Why Centralise the Revenue Predicate?",
                content:
                  "If the same cancelledAt: null filter is copied into three report endpoints and one of them is updated while the others are forgotten, the bug returns. A single isRevenueEligibleOrder function is the single point of change.",
                order: 2,
              },
              {
                title: "revenueUtils.ts",
                content:
                  "Create server/src/utils/revenueUtils.ts:\nexport function isRevenueEligibleOrder(order: { cancelledAt: Date | null; status: string }): boolean {\n  return order.cancelledAt === null;\n}\n\nThis is a pure function — testable without mocking Prisma.",
                order: 3,
              },
              {
                title: "Regression Test Cases",
                content:
                  "Test all four meaningful scenarios:\n1. cancelledAt set, status CANCELLED → false (normal cancel)\n2. cancelledAt set, status PENDING   → false (stale status!)\n3. cancelledAt null, status PENDING  → true (active order)\n4. cancelledAt null, status DELIVERED → true (completed order)",
                order: 4,
              },
              {
                title: "Writing a Postmortem",
                content:
                  "Create server/POSTMORTEM_REVENUE.md with four sections:\n## Symptom\nWhat finance observed.\n\n## Root Cause\nWhy the stats query was wrong technically.\n\n## Fix\nWhat changed in the code.\n\n## Prevention\nWhat will stop this from happening again.",
                order: 5,
              },
              {
                title: "Practice Lab: Incident Timeline",
                content: "Practice drafting a 4-line incident timeline.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Fill in each placeholder with a meaningful detail.",
                  language: "javascript",
                  starter_code:
                    "export function formatTimeline() {\n  return [\n    '- Detection: [fill in]',\n    '- Impact Window: [fill in]',\n    '- Mitigation: [fill in]',\n    '- Verification: [fill in]',\n  ].join('\\n');\n}\n",
                  editable_regions: [
                    { placeholder: "[fill in]", case_sensitive: false },
                  ],
                  entry_point: "formatTimeline",
                  test_cases: [
                    {
                      input: [],
                      expected: "- Detection: Finance report showed inflated revenue\n- Impact Window: Unknown — since cancelledAt was added in L3\n- Mitigation: Added cancelledAt: null WHERE filter to stats query\n- Verification: Regression tests pass; finance confirmed correct totals",
                      label: "complete timeline",
                    },
                  ],
                },
                order: 6,
              },
              {
                title: "Key Takeaway",
                content:
                  "A production fix is only complete when there are tests that would have caught the bug, shared logic that prevents drift, and documentation that teaches the next developer why the filter is the way it is.",
                order: 7,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Create server/src/utils/revenueUtils.ts with an isRevenueEligibleOrder function that takes an object with cancelledAt and returns cancelledAt === null.",
                order: 1,
              },
              {
                description:
                  "Write four test cases: normal cancelled (false), stale-status cancelled (false), active pending (true), delivered (true).",
                order: 2,
              },
              {
                description:
                  "Create server/POSTMORTEM_REVENUE.md with the four required sections: Symptom, Root Cause, Fix, Prevention.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description: "server/src/utils/revenueUtils.ts exists and exports isRevenueEligibleOrder",
                is_required: true,
                order: 1,
              },
              {
                description: "isRevenueEligibleOrder(order) returns false when cancelledAt is set",
                is_required: true,
                order: 2,
              },
              {
                description: "isRevenueEligibleOrder returns false even when status is PENDING (stale-status case)",
                is_required: true,
                order: 3,
              },
              {
                description: "isRevenueEligibleOrder returns true for active orders (cancelledAt: null)",
                is_required: true,
                order: 4,
              },
              {
                description: "server/POSTMORTEM_REVENUE.md exists with Symptom, Root Cause, Fix, and Prevention sections",
                is_required: true,
                order: 5,
              },
              {
                description: "orders.ts stats endpoint references revenueUtils or uses cancelledAt: null consistently",
                is_required: true,
                order: 6,
              },
            ],
          },
        },
      ],
    },
  },
  // ─────────────────────────────────────────────
  // SCENARIO 3 — IPPO POS System
  // ─────────────────────────────────────────────
  {
    id: "pern-pos-level-1",
    title: "Getting Familiar with the Codebase",
    subtitle: "Set up the POS environment and align the sidebar brand.",
    order: 1,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: IPPO has just onboarded a new cashier-support engineer. Get the PERN POS stack running locally — install in all three package roots, run Prisma migrations, start both dev servers, and update the sidebar subtitle to match the company's official style guide.",
    xp_reward: 100,
    coin_reward: 50,
    key_takeaways:
      "A PERN POS project needs npm install in root, client/, and server/. Prisma migrations keep Postgres aligned with schema.prisma. React layout components (Sidebar) are the single source of truth for brand text — update them once and every page reflects the change.",
    scenario_id: "scenario-3",
    tasks: {
      create: [
        {
          task_name: "Prepare Development Environment",
          test_type: "client",
          user_story:
            "As an engineer, I want to set up my local PERN environment so that I can run the IPPO POS app and start contributing.",
          learning_sections: {
            create: [
              {
                title: "Overview\nSetting Up a PERN Stack POS",
                content:
                  "This crash course walks you through preparing a PERN (PostgreSQL + Express + React + Node.js) POS environment from scratch. By the end you will have both servers running and the database schema applied.",
                order: 1,
              },
              {
                title: "Why POS Systems Are Demanding",
                content:
                  "A POS system is transactional by nature — every checkout writes to multiple tables (Order, OrderItem, Inventory). A correct local setup ensures these transactions behave the same way on your laptop as in production. Missing migrations or a stale Prisma client are the most common first-day pitfalls.",
                order: 2,
              },
              {
                title: "Three Package Roots",
                content:
                  "This project has three separate package.json files:\nroot/          ← monorepo orchestrator + test scripts\n├── client/    ← React + Vite + Tailwind\n└── server/    ← Express + Prisma\n\nRun npm install in each directory independently.",
                order: 3,
              },
              {
                title: "Environment Variables",
                content:
                  "Sensitive configuration lives in .env files:\nDATABASE_URL=\"postgresql://user:pass@localhost:5432/pos_system\"\nPORT=5000\nJWT_SECRET=your-secret\n\nThe dotenv package loads these at runtime. Never commit .env.",
                order: 4,
              },
              {
                title: "Prisma Migrations",
                content:
                  "After installing server dependencies, run:\nnpx prisma migrate dev --name init\n\nThis reads server/prisma/schema.prisma, creates SQL, and applies it. Prisma generate then regenerates the type-safe client.",
                order: 5,
              },
              {
                title: "Practice Lab: cd Navigation",
                content: "Practice navigating between the three project directories.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "TERMINAL_CD" as const,
                interactive_config: {
                  instructions:
                    "Navigate from /workspace to /workspace/client, then to /workspace/server, then back to /workspace.",
                  initial_directory: "/workspace",
                  expected_commands: ["cd client", "cd ../server", "cd .."],
                  directory_tree: {
                    "/workspace": ["client", "server", "package.json"],
                    "/workspace/client": ["src", "package.json"],
                    "/workspace/server": ["src", "prisma", "package.json"],
                  },
                },
                order: 6,
              },
              {
                title: "Key Takeaway",
                content:
                  "A working PERN POS environment means: three node_modules folders, a server .env, a migrated Prisma schema, and both dev servers running without errors.",
                order: 7,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Run npm install in all three directories (root, client/, server/) — each has its own package.json.",
                order: 1,
              },
              {
                description:
                  "Check the readme for required environment variables and create a .env file inside server/ before running migrations.",
                order: 2,
              },
              {
                description:
                  "Run `npx prisma migrate dev` inside server/ to apply the schema to your Postgres database.",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description: "Dependencies installed in root, client/, and server/ without errors",
                is_required: true,
                order: 1,
              },
              {
                description: "Prisma migrations applied successfully to PostgreSQL",
                is_required: true,
                order: 2,
              },
              {
                description: "Client (port 5173) and server (port 5000) start without errors",
                is_required: true,
                order: 3,
              },
            ],
          },
        },
        {
          task_name: "Update Brand Identity in Sidebar",
          test_type: "client",
          user_story:
            "As a user, I want the sidebar to show the full official brand name so the POS matches IPPO's marketing style guide.",
          learning_sections: {
            create: [
              {
                title: "Overview\nEditing React Layout Components",
                content:
                  "This crash course shows how to locate and safely update a brand string in a React layout component without breaking the surrounding UI.",
                order: 1,
              },
              {
                title: "What is a Layout Component?",
                content:
                  "Layout components (Sidebar, Navbar, Footer) render on every page. In this app the Sidebar lives in client/src/components/layout/Sidebar.tsx. Updating a string in that one file changes the brand everywhere.",
                order: 2,
              },
              {
                title: "JSX Text Nodes",
                content:
                  "In JSX, plain text inside tags is a text node:\n<span className=\"text-sm\">IPPO Solutions</span>\n\nUpdate the span text to the exact required string — case and spacing matter.",
                order: 3,
              },
              {
                title: "Vite HMR",
                content:
                  "Vite's Hot Module Replacement updates the browser instantly on save — no manual refresh needed. Save and watch the sidebar update live.",
                order: 4,
              },
              {
                title: "Practice Lab: Update Heading Text",
                content: "Practice editing a JSX text node to match a target string.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    'Change the returned string from "IPPO Solutions" to "IPPO Software Solutions".',
                  language: "tsx",
                  starter_code:
                    'export function getBrandSubtitle() {\n  return "IPPO Solutions";\n}\n',
                  editable_regions: [{ placeholder: "IPPO Solutions", case_sensitive: true }],
                  entry_point: "getBrandSubtitle",
                  test_cases: [
                    {
                      input: [],
                      expected: "IPPO Software Solutions",
                      label: "exact subtitle string",
                    },
                  ],
                },
                order: 5,
              },
              {
                title: "Key Takeaway",
                content:
                  "Layout components are the single source of truth for global UI text. Update Sidebar.tsx once and the change propagates to every page.",
                order: 6,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Open client/src/components/layout/Sidebar.tsx and search for the current subtitle — it is a hardcoded string inside a <span> element near the brand logo.",
                order: 1,
              },
              {
                description:
                  "Copy the exact string from the acceptance criteria — including spaces and capitalisation.",
                order: 2,
              },
              {
                description:
                  "After saving, confirm the change appears in the running browser on both expanded and collapsed sidebar states.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description: 'Sidebar subtitle is exactly "IPPO Software Solutions"',
                is_required: true,
                order: 1,
              },
              {
                description: "Subtitle renders correctly across sidebar states",
                is_required: true,
                order: 2,
              },
            ],
          },
        },
      ],
    },
  },
  {
    id: "pern-pos-level-2",
    title: "Client-Side Exploration",
    subtitle: "Build a per-product stock classifier and adopt it across POS + Inventory pages.",
    order: 2,
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: POS and Inventory pages each repeat inline stock checks. Create a pure getStockLevel(quantity, threshold) helper that returns a 3-state union, refactor both pages to use it, and add a cashier-facing 'Hide out-of-stock items' toggle on the POS page.",
    xp_reward: 150,
    coin_reward: 125,
    key_takeaways:
      "Pure two-argument classifiers return richer information than booleans. Per-product thresholds let each SKU set its own LOW_STOCK boundary. Centralising the logic eliminates drift between the POS grid and the Inventory table, and a visible toggle proves the abstraction reaches the user.",
    scenario_id: "scenario-3",
    tasks: {
      create: [
        {
          task_name: "Add Stock Level Classifier Helper",
          test_type: "client",
          user_story:
            "As a developer, I want a getStockLevel(quantity, threshold) helper in formatters.ts so stock-level decisions are consistent and testable across the POS and Inventory pages.",
          learning_sections: {
            create: [
              {
                title: "Overview\nPure Two-Argument Classifiers",
                content:
                  "This crash course covers writing a threshold-based classifier as a pure two-argument function that returns a typed union rather than a boolean.",
                order: 1,
              },
              {
                title: "Why Two Arguments?",
                content:
                  "POS inventory stores a per-product `lowStock` threshold. A single-argument helper with a fixed threshold would force every SKU to use the same cutoff — wrong for a shop that sells both low-volume and high-volume items. A two-arg signature (quantity, threshold) lets each product set its own LOW_STOCK boundary.",
                order: 2,
              },
              {
                title: "Union Types vs Booleans",
                content:
                  "Boolean: in-stock / not.\nUnion: IN_STOCK | LOW_STOCK | OUT_OF_STOCK.\n\nThree states let the UI render three badge colours and let the filter make a precise decision. Booleans collapse that information.",
                order: 3,
              },
              {
                title: "Threshold Order Matters",
                content:
                  "Check <=0 first, then <=threshold, then default to IN_STOCK. Swapping the order breaks the OUT_OF_STOCK case when threshold itself is 0. Always validate boundaries.",
                order: 4,
              },
              {
                title: "Pure Functions Are Testable",
                content:
                  "A pure function depends only on its inputs and never mutates state. getStockLevel takes two numbers and returns a string literal — no side effects, no hidden config. That means a single unit test table covers every branch.",
                order: 5,
              },
              {
                title: "Practice Lab: Write the Classifier",
                content: "Implement getStockLevel and verify all three branches.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Return 'OUT_OF_STOCK' if quantity <= 0, 'LOW_STOCK' if quantity <= threshold, otherwise 'IN_STOCK'.",
                  language: "ts",
                  starter_code:
                    "export function getStockLevel(quantity: number, threshold: number) {\n  // TODO: return 'OUT_OF_STOCK' | 'LOW_STOCK' | 'IN_STOCK'\n  return 'IN_STOCK';\n}\n",
                  entry_point: "getStockLevel",
                  test_cases: [
                    { input: [0, 5], expected: "OUT_OF_STOCK", label: "zero quantity" },
                    { input: [3, 5], expected: "LOW_STOCK", label: "below threshold" },
                    { input: [5, 5], expected: "LOW_STOCK", label: "at threshold" },
                    { input: [10, 5], expected: "IN_STOCK", label: "above threshold" },
                  ],
                },
                order: 6,
              },
              {
                title: "Key Takeaway",
                content:
                  "A two-argument pure classifier + union-typed return replaces scattered inline checks with one testable helper — and prevents threshold drift between components.",
                order: 7,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Create client/src/utils/formatters.ts and export getStockLevel(quantity: number, threshold: number).",
                order: 1,
              },
              {
                description:
                  "Handle quantity <= 0 first — otherwise an OUT_OF_STOCK item with a threshold of 0 is misclassified as LOW_STOCK.",
                order: 2,
              },
              {
                description:
                  "The function must be pure — no imports, no DOM, no network. Just two numbers in, a string out.",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description: "formatters.ts exists at client/src/utils/formatters.ts",
                is_required: true,
                order: 1,
              },
              {
                description: "getStockLevel is exported as a named export",
                is_required: true,
                order: 2,
              },
              {
                description: "Returns 'OUT_OF_STOCK' when quantity <= 0",
                is_required: true,
                order: 3,
              },
              {
                description: "Returns 'LOW_STOCK' when 0 < quantity <= threshold",
                is_required: true,
                order: 4,
              },
              {
                description: "Returns 'IN_STOCK' when quantity > threshold",
                is_required: true,
                order: 5,
              },
            ],
          },
        },
        {
          task_name: "Adopt Stock Helper in POS Grid + Inventory Page",
          test_type: "client",
          user_story:
            "As a cashier, I want the POS grid to clearly mark out-of-stock items and let me hide them, so I don't waste time trying to ring up unavailable products.",
          learning_sections: {
            create: [
              {
                title: "Overview\nRefactoring Duplicated Logic Across Pages",
                content:
                  "This crash course refactors inline stock checks in POSPage.tsx and InventoryPage.tsx to use the shared getStockLevel helper, then adds a cashier-visible 'Hide out-of-stock items' toggle on POSPage.",
                order: 1,
              },
              {
                title: "Why Refactor?",
                content:
                  "Inline checks like `quantity === 0 ? 'Out of Stock' : quantity <= lowStock ? 'Low' : 'In Stock'` duplicate logic. If the classification rules change (say, a 'BACKORDERED' state gets added), every site must be updated in lockstep. A shared helper fixes drift once and for all.",
                order: 2,
              },
              {
                title: "Controlled Inputs in React",
                content:
                  "A controlled input binds its value to state:\nconst [hide, setHide] = useState(false);\n<input type=\"checkbox\" checked={hide} onChange={e => setHide(e.target.checked)} />\n\nThe filter then reads hide to decide whether to drop OUT_OF_STOCK items.",
                order: 3,
              },
              {
                title: "Disabling vs Hiding",
                content:
                  "Two UX choices: disable the button (visible but non-clickable) or hide the item (removed from the grid). This task does both — always disable OUT_OF_STOCK items, and when the toggle is on, hide them entirely from the grid.",
                order: 4,
              },
              {
                title: "Accessibility",
                content:
                  "A hidden item must not receive keyboard focus. Use conditional rendering (filter before map) rather than CSS display:none when you want the element gone for screen readers and tab navigation too.",
                order: 5,
              },
              {
                title: "Practice Lab: Filter an Array",
                content: "Practice writing the filter predicate that the toggle drives.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Filter out OUT_OF_STOCK items when hideOutOfStock is true. Return the array of kept items.",
                  language: "ts",
                  starter_code:
                    "export function filterProducts(products: { stockLevel: string }[], hideOutOfStock: boolean) {\n  // TODO: drop OUT_OF_STOCK when hideOutOfStock is true\n  return products;\n}\n",
                  entry_point: "filterProducts",
                  test_cases: [
                    {
                      input: [
                        [
                          { stockLevel: "IN_STOCK" },
                          { stockLevel: "OUT_OF_STOCK" },
                          { stockLevel: "LOW_STOCK" },
                        ],
                        true,
                      ],
                      expected: [{ stockLevel: "IN_STOCK" }, { stockLevel: "LOW_STOCK" }],
                      label: "hides when toggle on",
                    },
                    {
                      input: [[{ stockLevel: "OUT_OF_STOCK" }], false],
                      expected: [{ stockLevel: "OUT_OF_STOCK" }],
                      label: "shows all when toggle off",
                    },
                  ],
                },
                order: 6,
              },
              {
                title: "Key Takeaway",
                content:
                  "Shared helpers + controlled inputs + accessible conditional rendering = a cashier-facing feature that is testable, consistent, and easy to evolve.",
                order: 7,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Import getStockLevel in POSPage.tsx and InventoryPage.tsx, then replace inline stock checks with the helper.",
                order: 1,
              },
              {
                description:
                  "Add a boolean state (hideOutOfStock) to POSPage and a checkbox labelled 'Hide out-of-stock items' that toggles it.",
                order: 2,
              },
              {
                description:
                  "When hideOutOfStock is true, filter OUT_OF_STOCK products out of the grid — don't just hide them with CSS.",
                order: 3,
              },
              {
                description:
                  "Always disable the add-to-cart button for OUT_OF_STOCK items so the cashier can't accidentally ring them up.",
                order: 4,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description: "POSPage.tsx imports getStockLevel from formatters",
                is_required: true,
                order: 1,
              },
              {
                description: "InventoryPage.tsx imports getStockLevel from formatters",
                is_required: true,
                order: 2,
              },
              {
                description: "POSPage renders a 'Hide out-of-stock items' checkbox",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Toggling the checkbox filters OUT_OF_STOCK items out of the product grid",
                is_required: true,
                order: 4,
              },
              {
                description: "OUT_OF_STOCK products are disabled (cannot be added to cart)",
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
    id: "pern-pos-level-3",
    title: "Backend: Introduce Void Flow + Concurrency Guard",
    subtitle: "Diagnose the oversell race, then ship an atomic void endpoint and oversell-safe checkout.",
    order: 3,
    deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: The POS has two structural gaps — the existing checkout reads inventory then decrements later (two cashiers can both sell the last unit), and there is no way to void a mistaken sale. Diagnose both, then add an OrderStatus enum + voidedAt column, an atomic voidOrder controller, and an oversell-safe checkout using updateMany + gte guard.",
    xp_reward: 200,
    coin_reward: 200,
    key_takeaways:
      "Read-then-write is unsafe under concurrency. Prisma's updateMany with a gte guard + a count check is the textbook atomic fix. Multi-table transactions (Order + OrderItem + Inventory) must share a single prisma.$transaction to guarantee rollback. Source-of-truth timestamps (voidedAt) are safer than mutable status fields.",
    scenario_id: "scenario-3",
    tasks: {
      create: [
        {
          task_name: "Diagnose Oversell Race & Missing Void Flow",
          test_type: "server",
          user_story:
            "As an engineer, I want to document the oversell race and the absence of a void flow so that the team can prioritize the fix.",
          learning_sections: {
            create: [
              {
                title: "Overview\nDiagnosing Transactional Bugs",
                content:
                  "This crash course teaches you how to read a checkout route, spot a read-then-write race, and produce evidence that the race is real.",
                order: 1,
              },
              {
                title: "Read-Then-Write Races in POS",
                content:
                  "The current checkout reads inventory, validates quantity, then writes later. Between the read and the write, another cashier on another register can perform the same read. Both pass the guard, both decrement, and inventory goes negative. POS systems are especially vulnerable because multiple cashiers are the norm, not the exception.",
                order: 2,
              },
              {
                title: "Why There Is No Void Today",
                content:
                  "The Order model has no status column and no voidedAt column. The schema literally cannot represent a voided order, so the API has no endpoint for it. Any reversal today would require the admin to mutate inventory by hand — and they'd do it without an audit trail.",
                order: 3,
              },
              {
                title: "Writing an Evidence Test",
                content:
                  "A diagnosis is only as good as its reproduction. A concurrent-sale integration test fires two overlapping checkouts for the last unit and asserts that at most one succeeds. Today's code fails that test — that failure is the evidence.",
                order: 4,
              },
              {
                title: "The Status vs Timestamp Question",
                content:
                  "When we add the void flow next task, we'll learn that status columns are mutable (admins can flip them) but timestamps are write-once in transactional code. This matters for reporting in Level 5 — spoiler: voidedAt will be the source of truth, not status.",
                order: 5,
              },
              {
                title: "Practice Lab: Spot the Race",
                content: "Identify the offending line in a simplified checkout.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "The function returns true if inventory is sufficient. Replace it with a version that uses updateMany + gte so two concurrent calls can never both succeed.",
                  language: "ts",
                  starter_code:
                    "export async function checkout(productId: number, qty: number, tx: any) {\n  const inv = await tx.inventory.findUnique({ where: { productId } });\n  if (inv.quantity < qty) return false;\n  await tx.inventory.update({ where: { productId }, data: { quantity: { decrement: qty } } });\n  return true;\n}\n",
                  entry_point: "checkout",
                  test_cases: [
                    {
                      input: [
                        1,
                        1,
                        {
                          inventory: {
                            findUnique: { returns: { quantity: 1 } },
                            update: { returns: {} },
                            updateMany: { returns: { count: 1 } },
                          },
                        },
                      ],
                      expected: true,
                      label: "last unit succeeds",
                    },
                  ],
                },
                order: 6,
              },
              {
                title: "Key Takeaway",
                content:
                  "Document the two failure paths (oversell race + missing void) with an evidence test before you write the fix. The test is the contract the fix must satisfy.",
                order: 7,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Open server/src/routes/orders.ts and locate the checkout handler — look for where inventory is read before it is decremented.",
                order: 1,
              },
              {
                description:
                  "Open server/prisma/schema.prisma and confirm that the Order model has no status or voidedAt columns today.",
                order: 2,
              },
              {
                description:
                  "Your test must exercise the schema and route as they exist today — the tests in tests/server/level-3/task-1 document the gaps that Level 3 Task 2 will fix.",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "tests/server/level-3/task-1 tests assert the current schema lacks OrderStatus + voidedAt",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Tests assert that there is no voidOrder export today (it will be introduced in Task 2)",
                is_required: true,
                order: 2,
              },
              {
                description: "Tests assert that no POST /:id/void route is registered yet",
                is_required: true,
                order: 3,
              },
            ],
          },
        },
        {
          task_name: "Atomic Void + Oversell-Safe Checkout",
          test_type: "server",
          user_story:
            "As a cashier, I want to void a mistaken sale so that inventory is restored and the order is marked voided — and I need checkout to never oversell under concurrent use.",
          learning_sections: {
            create: [
              {
                title: "Overview\nAtomic Transactions for POS",
                content:
                  "This crash course adds an OrderStatus enum, a voidedAt column, a voidOrder controller, and an oversell-safe checkout using Prisma's updateMany with a gte guard.",
                order: 1,
              },
              {
                title: "Schema Changes",
                content:
                  "Add an OrderStatus enum (COMPLETED, VOIDED) with a default of COMPLETED. Add a voidedAt DateTime? column. Both are net new — POS had no void flow before.",
                order: 2,
              },
              {
                title: "updateMany + gte Guard",
                content:
                  "Prisma's updateMany accepts a where-clause and returns { count }. Using `where: { productId, quantity: { gte: item.quantity } }` means the update only applies if the stock is still sufficient at the moment the UPDATE hits the database. If count !== 1, another transaction beat us to it — throw and the outer $transaction rolls back.",
                order: 3,
              },
              {
                title: "Multi-Table Atomicity",
                content:
                  "voidOrder touches Order (status + voidedAt), Inventory (increment each OrderItem's quantity back), and PromoCode (decrement usedCount if one was applied). All three must live inside a single prisma.$transaction(async (tx) => { ... }) block so that a failure anywhere rolls back everything.",
                order: 4,
              },
              {
                title: "Guard the Transition",
                content:
                  "Only a COMPLETED order can be voided. If the status is already VOIDED, throw — otherwise a double-void would double-restore inventory and drive stock up unfairly.",
                order: 5,
              },
              {
                title: "Practice Lab: Write the Guard",
                content: "Write the check that only allows voiding COMPLETED orders.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Throw if the status is anything other than 'COMPLETED'. Otherwise return true.",
                  language: "ts",
                  starter_code:
                    "export function assertCanVoid(status: string) {\n  // TODO: throw if not COMPLETED\n  return true;\n}\n",
                  entry_point: "assertCanVoid",
                  test_cases: [
                    { input: ["COMPLETED"], expected: true, label: "completed passes" },
                  ],
                },
                order: 6,
              },
              {
                title: "Key Takeaway",
                content:
                  "Atomic transactions + updateMany gte guards + explicit status transitions are how you ship a POS void flow that can't be exploited by concurrent cashiers.",
                order: 7,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Add `enum OrderStatus { COMPLETED VOIDED }`, `status OrderStatus @default(COMPLETED)`, and `voidedAt DateTime?` to server/prisma/schema.prisma.",
                order: 1,
              },
              {
                description:
                  "Create server/src/controllers/order.controller.ts exporting voidOrder(orderId). Wrap every DB touch in prisma.$transaction.",
                order: 2,
              },
              {
                description:
                  "In checkout, replace the read-then-decrement pattern with `tx.inventory.updateMany({ where: { productId, quantity: { gte: item.quantity } }, data: { quantity: { decrement: item.quantity } } })` and throw when count !== 1.",
                order: 3,
              },
              {
                description:
                  "Wire POST /api/orders/:id/void to voidOrderHandler inside server/src/routes/orders.ts.",
                order: 4,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description: "schema.prisma has OrderStatus enum with COMPLETED and VOIDED",
                is_required: true,
                order: 1,
              },
              {
                description: "schema.prisma Order model has voidedAt DateTime? field",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "order.controller.ts exports voidOrder which uses prisma.$transaction",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "voidOrder restores inventory via increment on each OrderItem",
                is_required: true,
                order: 4,
              },
              {
                description: "voidOrder stamps voidedAt = new Date() and flips status to VOIDED",
                is_required: true,
                order: 5,
              },
              {
                description:
                  "Checkout uses updateMany with gte guard and throws when count !== 1",
                is_required: true,
                order: 6,
              },
              {
                description: "POST /api/orders/:id/void route is registered",
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
    id: "pern-pos-level-4",
    title: "Full-Stack Feature: Promo Codes",
    subtitle: "Ship end-to-end validate-apply-redeem promo code flow with admin observability.",
    order: 4,
    deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: Marketing wants reusable promo codes the cashier can apply at checkout. Add a PromoCode model, POST /api/promos/validate, GET /api/promos (admin), wire the order create path to apply + atomically increment usedCount, hook voidOrder to decrement on reversal, and build the cashier UI + admin observability panel.",
    xp_reward: 250,
    coin_reward: 300,
    key_takeaways:
      "Validation endpoints can share business rules with transactional endpoints when both read the same source-of-truth row. Atomic counter updates with updateMany prevent two concurrent sales from consuming the same last slot. Admin observability panels make a feature operable from day one — cashiers and accountants shouldn't have to ask engineering what's happening.",
    scenario_id: "scenario-3",
    tasks: {
      create: [
        {
          task_name: "Validate & Apply Promo Code at POS Checkout",
          test_type: "both",
          user_story:
            "As a cashier, I want to enter a promo code at checkout and see an applied discount so that customers get the promotions marketing is running.",
          learning_sections: {
            create: [
              {
                title: "Overview\nEnd-to-End Promo Flow",
                content:
                  "This crash course builds a promo-code feature spanning a new Prisma model, two server routes, a client service, and a UI hook-up in the checkout modal.",
                order: 1,
              },
              {
                title: "PromoCode Model",
                content:
                  "Add a PromoCode model with: `code String @unique`, `discountPercent Int`, `maxUses Int`, `usedCount Int @default(0)`, `expiresAt DateTime`, `isActive Boolean @default(true)`. Link Order with optional `promoCodeId Int?`.",
                order: 2,
              },
              {
                title: "validatePromo — Pure-ish Helper",
                content:
                  "validatePromo(code, subtotal) returns a discriminated union: `{ ok: true, discountPercent, finalTotal }` or `{ ok: false, reason: 'NOT_FOUND' | 'INACTIVE' | 'EXPIRED' | 'EXHAUSTED' }`. Same helper can be called by the validate endpoint and re-checked inside the order transaction.",
                order: 3,
              },
              {
                title: "Why Re-Validate in the Transaction?",
                content:
                  "The validate endpoint is advisory — it can succeed at t=0 but the promo might be exhausted by the time the cashier clicks Pay at t=3s. The order create path must re-validate inside the transaction with an atomic counter update.",
                order: 4,
              },
              {
                title: "Cashier UX States",
                content:
                  "The UI must render four states: (a) no promo entered — input + Apply button; (b) applied — green message + Remove button; (c) invalid — red message with the reason (NOT_FOUND / INACTIVE / EXPIRED / EXHAUSTED); (d) in-flight — loading spinner on the Apply button.",
                order: 5,
              },
              {
                title: "Practice Lab: Build the Discount Total",
                content: "Compute the final total given a subtotal and a discount percent.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Return subtotal * (1 - discountPercent / 100). Round nothing — the caller handles rounding.",
                  language: "ts",
                  starter_code:
                    "export function applyDiscount(subtotal: number, discountPercent: number) {\n  return subtotal;\n}\n",
                  entry_point: "applyDiscount",
                  test_cases: [
                    { input: [100, 10], expected: 90, label: "10% off 100" },
                    { input: [50, 25], expected: 37.5, label: "25% off 50" },
                    { input: [100, 0], expected: 100, label: "0% off" },
                  ],
                },
                order: 6,
              },
              {
                title: "Key Takeaway",
                content:
                  "Share a validatePromo helper between the validate endpoint and the order transaction, and render explicit states in the UI. Never trust an advisory validation — re-check in the transaction.",
                order: 7,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Add the PromoCode model to schema.prisma and add optional promoCodeId to Order, then run prisma migrate dev.",
                order: 1,
              },
              {
                description:
                  "Create server/src/controllers/promo.controller.ts with validatePromo (helper) + validatePromoHandler (Express handler).",
                order: 2,
              },
              {
                description:
                  "Create server/src/routes/promos.ts and mount it at /api/promos in server/src/index.ts.",
                order: 3,
              },
              {
                description:
                  "Create client/src/services/promoService.ts and call it from POSPage.tsx's checkout modal.",
                order: 4,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description: "schema.prisma has PromoCode model with unique code field",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "POST /api/promos/validate returns discountPercent + finalTotal on success",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "POST /api/orders accepts optional promoCode and applies the discount",
                is_required: true,
                order: 3,
              },
              {
                description: "Order transaction increments PromoCode.usedCount atomically",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "POSPage checkout modal renders a Promo Code input + Apply button",
                is_required: true,
                order: 5,
              },
              {
                description:
                  "POSPage renders applied / invalid / expired / exhausted states clearly",
                is_required: true,
                order: 6,
              },
            ],
          },
        },
        {
          task_name: "Promo Lifecycle + Usage Integrity",
          test_type: "both",
          user_story:
            "As an admin, I want to see each promo's remaining uses and I want voiding a promo order to return its use to the pool — otherwise promotions become impossible to reconcile.",
          learning_sections: {
            create: [
              {
                title: "Overview\nAtomic Counters + Lifecycle Hooks",
                content:
                  "This crash course enforces maxUses + expiresAt + isActive atomically inside the order transaction and hooks voidOrder to decrement usedCount on reversal.",
                order: 1,
              },
              {
                title: "Atomic Counter Pattern",
                content:
                  "`tx.promoCode.updateMany({ where: { id, isActive: true, expiresAt: { gt: now }, usedCount: { lt: maxUses } }, data: { usedCount: { increment: 1 } } })` with a count check of 1 — if the count is 0, someone else just consumed the last slot and we throw.",
                order: 2,
              },
              {
                title: "Why Not { lt: fields.maxUses }?",
                content:
                  "Prisma cannot reference a sibling column in a single UPDATE — there is no Postgres-style `usedCount < maxUses` in Prisma's generated API. We read maxUses in a preceding findUnique and pass the literal into the updateMany guard.",
                order: 3,
              },
              {
                title: "Lifecycle Hook: Void Decrements",
                content:
                  "Inside voidOrder's $transaction, if the order has promoCodeId, decrement that promo's usedCount by 1. This returns the use to the pool and keeps the admin panel's remaining uses accurate.",
                order: 4,
              },
              {
                title: "Admin Observability",
                content:
                  "The /api/promos list endpoint (ADMIN only) returns each promo's code, discountPercent, maxUses, usedCount, and a derived remainingUses = maxUses - usedCount. The SettingsPage renders this in a simple table.",
                order: 5,
              },
              {
                title: "Practice Lab: Remaining Uses",
                content: "Compute remainingUses without letting it go negative.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions: "Return max(0, maxUses - usedCount).",
                  language: "ts",
                  starter_code:
                    "export function remainingUses(maxUses: number, usedCount: number) {\n  return maxUses - usedCount;\n}\n",
                  entry_point: "remainingUses",
                  test_cases: [
                    { input: [10, 3], expected: 7, label: "normal" },
                    { input: [10, 10], expected: 0, label: "exhausted" },
                    { input: [5, 8], expected: 0, label: "negative clamped" },
                  ],
                },
                order: 6,
              },
              {
                title: "Key Takeaway",
                content:
                  "Atomic counter guards prevent overspend, lifecycle hooks keep the counter honest, and an admin panel makes the whole flow observable.",
                order: 7,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Inside POST /api/orders, after findUnique(promo), use updateMany with a usedCount: { lt: appliedPromo.maxUses } guard and check count === 1.",
                order: 1,
              },
              {
                description:
                  "In voidOrder, after flipping status, check if order.promoCodeId is set and decrement that row's usedCount inside the same transaction.",
                order: 2,
              },
              {
                description:
                  "GET /api/promos should be protected by authorize('ADMIN') and include remainingUses in the response shape.",
                order: 3,
              },
              {
                description:
                  "SettingsPage.tsx should load promoService.listPromos() on mount and render a table with code, discount, remainingUses, expiresAt, and isActive.",
                order: 4,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Order creation uses updateMany with usedCount: { lt: maxUses } guard",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Order creation validates expiresAt and isActive inside the same transaction",
                is_required: true,
                order: 2,
              },
              {
                description: "voidOrder decrements PromoCode.usedCount when promoCodeId is set",
                is_required: true,
                order: 3,
              },
              {
                description: "GET /api/promos is ADMIN-only",
                is_required: true,
                order: 4,
              },
              {
                description: "GET /api/promos returns remainingUses for each promo",
                is_required: true,
                order: 5,
              },
              {
                description: "SettingsPage renders an admin promo-list panel",
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
    id: "pern-pos-level-5",
    title: "The Production Struggle: Sales Revenue Bug",
    subtitle: "Voided sales are inflating the Reports page — fix the source-of-truth predicate and centralize it.",
    order: 5,
    deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: Finance escalated — the Reports page total revenue doesn't match the cash drawer. Voided orders are still being counted, and worse, admins with edit access can flip status back to COMPLETED while voidedAt still holds the truth. Fix the predicate, centralize it, and write a postmortem so this never happens again.",
    xp_reward: 300,
    coin_reward: 400,
    key_takeaways:
      "Timestamp columns are write-once when set inside a transaction — that makes them source-of-truth for historical questions. Status enums are mutable and unreliable for financial reporting. Centralizing a Prisma where-clause builder + writing a postmortem converts a one-time fix into durable institutional knowledge.",
    scenario_id: "scenario-3",
    tasks: {
      create: [
        {
          task_name: "Stabilize Revenue Classification",
          test_type: "server",
          user_story:
            "As the finance lead, I want the Reports page revenue to exclude voided orders — including ones whose status has been manually flipped back to COMPLETED — so I can close the books.",
          learning_sections: {
            create: [
              {
                title: "Overview\nSource-of-Truth Timestamps for Financial Reporting",
                content:
                  "This crash course teaches why timestamp columns (like voidedAt) are safer than mutable enums (like status) as the predicate for financial queries.",
                order: 1,
              },
              {
                title: "The Stale-Status Pitfall",
                content:
                  "An admin with DB-edit rights can flip Order.status from VOIDED back to COMPLETED. They cannot undo voidedAt without an explicit UPDATE — and voidedAt is never written by the checkout path, only by voidOrder. So voidedAt IS NULL is equivalent to 'this order has never been voided'.",
                order: 2,
              },
              {
                title: "Writing the Predicate",
                content:
                  "In Prisma, the revenue where-clause is simply `{ voidedAt: null }`. When combined with a date range it becomes `{ createdAt: { gte, lt }, voidedAt: null }`. Any query that sums `order.total` must carry this predicate.",
                order: 3,
              },
              {
                title: "Regression Tests That Matter",
                content:
                  "Your test suite must include at least one 'stale-status' scenario: an order with status COMPLETED but voidedAt set. The predicate must exclude it. If future refactors try to short-circuit the check with `status === 'COMPLETED'`, this test will fail and catch them.",
                order: 4,
              },
              {
                title: "Extending the Pattern",
                content:
                  "The same idea applies to OE's cancelledAt, any softDeletedAt column, or archivedAt — if the business question is 'did X ever happen?', use a timestamp column, not a status enum.",
                order: 5,
              },
              {
                title: "Practice Lab: isRevenueEligibleOrder",
                content:
                  "Implement the predicate that every revenue query will share.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Return true only when order.voidedAt is null or undefined. Do not look at status.",
                  language: "ts",
                  starter_code:
                    "export function isRevenueEligibleOrder(order: { voidedAt: Date | null | undefined }) {\n  return true;\n}\n",
                  entry_point: "isRevenueEligibleOrder",
                  test_cases: [
                    { input: [{ voidedAt: null }], expected: true, label: "never voided" },
                    { input: [{ voidedAt: new Date() }], expected: false, label: "voided" },
                  ],
                },
                order: 6,
              },
              {
                title: "Key Takeaway",
                content:
                  "voidedAt IS NULL is the correct predicate. Status is a UI hint, not a financial truth.",
                order: 7,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Open server/src/routes/orders.ts and locate GET /reports/daily. Replace status-based filtering with voidedAt: null.",
                order: 1,
              },
              {
                description:
                  "Write a regression test at tests/server/level-5/task-1/revenue-classification.test.ts that asserts a stale-status order is excluded.",
                order: 2,
              },
              {
                description:
                  "Do not filter by status === 'COMPLETED' as a substitute — the bug is that status can be flipped back.",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description: "Daily revenue query filters by voidedAt: null",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Stale-status test (status COMPLETED, voidedAt set) fails without the fix and passes with it",
                is_required: true,
                order: 2,
              },
              {
                description: "Normal completed order (voidedAt null) is still included",
                is_required: true,
                order: 3,
              },
            ],
          },
        },
        {
          task_name: "Permanent Fix + Centralization + Postmortem",
          test_type: "server",
          user_story:
            "As an engineer, I want the revenue predicate centralized into a utility and a postmortem written so the next person inheriting this code doesn't re-introduce the bug.",
          learning_sections: {
            create: [
              {
                title: "Overview\nFrom Fix to Institutional Knowledge",
                content:
                  "This crash course centralizes the revenue predicate into a shared utility and documents the bug + fix in a postmortem so the lesson outlives the commit.",
                order: 1,
              },
              {
                title: "Centralization",
                content:
                  "Create server/src/utils/revenueUtils.ts exporting two things: `isRevenueEligibleOrder(order)` for in-memory filtering and `revenueWhereClause(extra)` that spreads into Prisma findMany/aggregate `where` clauses. Every revenue query imports these — no more copies.",
                order: 2,
              },
              {
                title: "Why a where-clause Builder?",
                content:
                  "A predicate-as-function is easy to write but easy to misuse — someone could call it in application code after loading all orders, doubling the cost. A where-clause builder is pushed down to Postgres, so the DB never returns voided rows to the app.",
                order: 3,
              },
              {
                title: "Postmortem Structure",
                content:
                  "server/POSTMORTEM_REVENUE.md must have four sections: Symptom (what finance saw), Root Cause (why status-based filtering is wrong), Fix (voidedAt: null + centralization), Prevention (reviewers reject status-based revenue predicates; the regression test must never be weakened).",
                order: 4,
              },
              {
                title: "Code Review Checklist",
                content:
                  "A new PR line that reads `where: { status: 'COMPLETED' }` in any revenue context should be rejected at review. The utility exists so reviewers have a single concrete thing to point at.",
                order: 5,
              },
              {
                title: "Practice Lab: revenueWhereClause",
                content:
                  "Merge extra predicates into the base revenue where-clause.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Return an object with voidedAt: null plus any extra keys from the argument.",
                  language: "ts",
                  starter_code:
                    "export function revenueWhereClause(extra: Record<string, unknown> = {}) {\n  return {};\n}\n",
                  entry_point: "revenueWhereClause",
                  test_cases: [
                    { input: [], expected: { voidedAt: null }, label: "no extras" },
                  ],
                },
                order: 6,
              },
              {
                title: "Key Takeaway",
                content:
                  "Fix once, centralize always, and document the reasoning so the next person to touch revenue queries doesn't repeat the bug.",
                order: 7,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Create server/src/utils/revenueUtils.ts exporting isRevenueEligibleOrder and revenueWhereClause.",
                order: 1,
              },
              {
                description:
                  "Replace the ad-hoc `voidedAt: null` spreads in orders.ts with imports from revenueUtils.",
                order: 2,
              },
              {
                description:
                  "Create server/POSTMORTEM_REVENUE.md with the four required sections: Symptom, Root Cause, Fix, Prevention.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "server/src/utils/revenueUtils.ts exists and exports isRevenueEligibleOrder + revenueWhereClause",
                is_required: true,
                order: 1,
              },
              {
                description: "revenueWhereClause() returns { voidedAt: null }",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "isRevenueEligibleOrder returns false for stale-status voided orders",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "orders.ts stats/reports endpoints import revenueWhereClause",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "POSTMORTEM_REVENUE.md exists with Symptom, Root Cause, Fix, and Prevention sections",
                is_required: true,
                order: 5,
              },
            ],
          },
        },
      ],
    },
  },
];