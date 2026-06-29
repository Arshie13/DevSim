/**
 * Prisma Seed Script — FitTrackr (MERN Scenario 2)
 *
 * Seeds the database with Level and Scenario data for the FitTrackr learning scenario.
 *
 * Usage:
 *   pnpm exec tsx prisma/seed.ts
 *
 * Make sure to run `pnpm exec prisma generate` first to generate the client.
 *
 * Task type values:
 *   "client" — only a client-side test exists
 *   "server" — only a server-side test exists
 *   "both"   — both client and server tests exist
 *   "none"   — no automated test (setup/manual tasks)
 */

export const scenarios = [
  {
    id: "mern-ft-scenario-2",
    name: "FitTrackr Social Fitness Platform",
    description:
      "Build and debug a production-grade social fitness-tracking platform for PulseLabs Wellness using React 19, Express, MongoDB, and Mongoose. Progress from environment setup through client UI components, MongoDB aggregation pipelines, a full-stack cheer + streak feature, and two critical production bug fixes.",
    difficulty: "expert",
  },
];

export const levels = [
  // ─────────────────────────────────────────────────────────────
  // LEVEL 1 — Getting Familiar with the Codebase
  // ─────────────────────────────────────────────────────────────
  {
    id: "mern-ft-level-1",
    title: "Getting Familiar with the Codebase",
    subtitle: "Set up the development environment and update the brand tagline.",
    order: 1,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: PulseLabs just onboarded a new developer on FitTrackr. The first tasks are to get the MERN (MongoDB, Express, React, Node.js) stack running locally and make a small but visible UI change that confirms understanding of how the codebase is organized.",
    xp_reward: 100,
    coin_reward: 50,
    key_takeaways:
      "Setting up a MERN project requires installing dependencies in three separate locations (root, client, server), configuring environment variables for MongoDB connection strings, and running a seed script to populate realistic data. Understanding this separation of concerns is foundational for every full-stack developer working with Node.js-based projects.\n\nReact components are the building blocks of every UI. Layout components like Header are shared across pages, meaning a single text change affects the entire application consistently. Knowing where to find and edit a component is as important as knowing how to write one.",
    scenario_id: "mern-ft-scenario-2",
    tasks: {
      create: [
        // ── L1-T1: Prepare Development Environment ──────────────
        {
          task_name: "Prepare Development Environment",
          test_type: "client",
          user_story:
            "As a developer, I want to set up my local development environment so that I can run and modify the FitTrackr application.",
          learning_sections: {
            create: [
              {
                title: "Overview\nSetting Up a MERN Stack Project",
                content:
                  "This section introduces the crash course for preparing a MERN stack development environment. It gives a high-level view of the setup flow, required tools, and key concepts needed before starting the hands-on tasks.",
                order: 1,
              },
              {
                title: "What is the MERN Stack?",
                content:
                  "MERN stands for MongoDB, Express, React, Node.js — four technologies that work together to build full-stack web apps.\n\nMongoDB — a NoSQL document database that stores data as JSON-like objects\nExpress — a Node.js framework that handles server and API routes\nReact — the frontend library that builds the user interface\nNode.js — the JavaScript runtime that runs server code\n\nFitTrackr uses all four layers: MongoDB stores workouts and user data, Express serves the REST API, React renders the workout feed and forms, and Node.js ties the backend together.",
                order: 2,
              },
              {
                title: "How a MERN App is Structured",
                content:
                  "A typical MERN project has three parts:\nroot/ ← workspace root (shared config, scripts)\n    ├── client/ ← React frontend (Vite + Tailwind)\n    └── server/ ← Express backend (Mongoose + MongoDB)\n\nEach part has its own package.json, so dependencies must be installed in all three locations. The root also has convenience scripts that start both servers at once.",
                order: 3,
              },
              {
                title: "Package Management 101",
                content:
                  "When a project is cloned, no dependencies are installed yet — node_modules is in .gitignore. Dependencies must be installed in each folder that has a package.json using pnpm install.\n\nWhy separate installs?\nEach folder is its own isolated module. The client uses React and Vite; the server uses Express and Mongoose. Mixing them would create version conflicts and bloated bundles.",
                order: 4,
              },
              {
                title: "Change Directory (cd) Basics",
                content:
                  "In development, commands must be run in the correct folder. Use cd (change directory) to move between root, client, and server.\n\nCommon commands:\ncd client → move into the frontend folder\ncd ../server → move from client to server\ncd .. → move up one folder\n\nAlways check the current directory before running pnpm install or pnpm run commands — they only affect the folder currently active.",
                order: 5,
              },
              {
                title: "Practice Lab: cd Navigation",
                content:
                  "Practice navigating folders with cd. Use `ls` to list files/folders in the current directory and `pwd` to print the current path when verification of the location is needed.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "TERMINAL_CD" as const,
                interactive_config: {
                  instructions:
                    "Goal: navigate to /workspace/client, then to /workspace/server, then back to /workspace. Tip: `ls` lists current directory contents and `pwd` prints the current path.",
                  initial_directory: "/workspace",
                  expected_commands: ["cd client", "cd ../server", "cd .."],
                  directory_tree: {
                    "/workspace": ["client", "server", "README.md", "package.json"],
                    "/workspace/client": ["src", "package.json", "vite.config.ts"],
                    "/workspace/server": ["src", "package.json", ".env.example"],
                  },
                },
                order: 6,
              },
              {
                title: "Environment Variables",
                content:
                  "Sensitive config (like database URIs) is stored in .env files — never hardcoded in source code.\n\nMONGODB_URI=mongodb://localhost:27017/fittrackr\nPORT=4000\nJWT_SECRET=changeme\n\nThe dotenv package reads these files and makes them available as process.env.MONGODB_URI in the application code. ⚠️ .env files are listed in .gitignore intentionally — they contain secrets that should never be committed to version control.\n\nNote: In this project, some environment variables will be provided, so no need to set them up manually.",
                order: 7,
              },
              {
                title: "What is MongoDB & Mongoose?",
                content:
                  "MongoDB is a document database — it stores JSON-like documents in collections. Mongoose is an ODM (Object Document Mapper) that wraps the MongoDB Node.js driver with a schema layer that defines the shape of documents, enforces types, and provides helper methods. The seed script uses Mongoose to insert realistic sample data.",
                order: 8,
              },
              {
                title: "Seeding the Database",
                content:
                  "A seed script populates the database with realistic sample data so that development can proceed against a real dataset instead of an empty one. The FitTrackr seed creates 8 users, 18 workouts, 20 cheers, and 15 comments.\n\nRun the seed with:\npnpm run db:seed\n\nThis command is defined in the root package.json and calls server/src/seed/seed.ts via ts-node.",
                order: 9,
              },
              {
                title: "Key Takeaway",
                content:
                  "Setting up a project is more than running one command — it means aligning the local environment (dependencies, env vars, database) so the app runs identically for every developer on the team. Getting this right first, then build features.",
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
                  "The README.md contains step-by-step setup instructions — look for sections about environment configuration, the `.env` file, and the seed command.",
                order: 2,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description: "Dependencies installed in root, client, and server without errors",
                is_required: true,
                order: 1,
              },
              {
                description: "Seed script runs successfully and populates the database",
                is_required: true,
                order: 3,
              },
              {
                description: "Client dev server starts without errors",
                is_required: true,
                order: 4,
              },
              {
                description: "Express API server starts without errors",
                is_required: true,
                order: 5,
              },
            ],
          },
        },
        // ── L1-T2: Update Brand Tagline ──────────────────────────
        {
          task_name: "Update Brand Tagline",
          test_type: "client",
          user_story:
            'As a user, I want to see the correct brand tagline "Train. Log. Level Up." in the header so that the app reflects FitTrackr\'s identity.',
          learning_sections: {
            create: [
              {
                title: "Overview\nReact Components and the UI Layer",
                content:
                  "This section introduces the crash course for understanding React components and the UI layer. It gives a broad view of how interface elements are structured and where to safely make UI updates.",
                order: 1,
              },
              {
                title: "What is a React Component?",
                content:
                  "A React component is a reusable piece of UI — like a header, a button, or a card. Components are JavaScript functions that return HTML-like syntax called JSX. Each component lives in its own file and can be imported and used anywhere in the app.",
                order: 2,
              },
              {
                title: "Layout Components",
                content:
                  "In most React apps, the header and footer live in layout components — shared wrappers used across all pages. Changing text once in the layout component updates it everywhere the layout is used.\n\nA typical layout structure:\ncomponents/\n    └── layout/\n          ├── Header.tsx\n          ├── Layout.tsx\n          └── Footer.tsx",
                order: 3,
              },
              {
                title: "How to Find What to Change",
                content:
                  "When something visible in the browser needs updating, trace the element to its source:\n1. What element is it? (header, footer, sidebar)\n2. Which component renders it?\n3. Is the text hardcoded or dynamic?\n\nFor a tagline in the header, look inside the layout's Header component for a hardcoded string.",
                order: 4,
              },
              {
                title: "JSX Text Content",
                content:
                  "Changing text in JSX is similar to editing HTML. The tagline text must match the expected string character-for-character — the test checks every character.",
                order: 5,
              },
              {
                title: "Hot Module Replacement (HMR)",
                content:
                  "After saving a React file, Vite's HMR (Hot Module Replacement) instantly updates the browser without a full page refresh. If the update does not appear, check the terminal for compile errors before refreshing manually.",
                order: 6,
              },
              {
                title: "Practice Lab: Update Heading Text",
                content:
                  "Practice a simple UI change by editing the text inside a function that returns a string.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Update the function to return \"Welcome Back\" instead of \"Hello World\".",
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
                
                hints: [
                  "Simple text replacement.",
                  "Replace \"Hello World\" with \"Welcome Back\".",
                  "return \"___\";"
                ],},
                order: 7,
              },
              {
                title: "Key Takeaway",
                content:
                  "UI changes in React always trace back to a component file. Layout components are the first place to look for global elements like the header tagline. Find the component, find the text, change it — and the whole app updates.",
                order: 8,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "The tagline is a layout-level element — look inside `client/src/components/layout/` for a file that renders the top navigation or brand area.",
                order: 1,
              },
              {
                description:
                  "After saving the change, open the running client in the browser to confirm the tagline updated correctly in the header.",
                order: 2,
              },
              {
                description:
                  'The acceptance criteria specifies the exact tagline text — the change must match "Train. Log. Level Up." character for character, including the periods.',
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description: 'Header tagline reads exactly "Train. Log. Level Up."',
                is_required: true,
                order: 1,
              },
              {
                description: "Tagline is visible on both desktop and mobile screen widths",
                is_required: true,
                order: 2,
              },
            ],
          },
        },
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────
  // LEVEL 2 — Client-Side Exploration
  // ─────────────────────────────────────────────────────────────
  {
    id: "mern-ft-level-2",
    title: "Client-Side Exploration",
    subtitle: "Build the WorkoutCard component and add category filtering to the feed.",
    order: 2,
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: Users are frustrated — the workout feed is blank and there is no way to filter by training category. The tasks are to implement the WorkoutCard presentational component and wire up category filter chips so members can browse workouts by type.",
    xp_reward: 150,
    coin_reward: 75,
    key_takeaways:
      "Presentational (pure) components take data as props and return UI without side effects. Keeping rendering logic separate from data-fetching logic makes components easier to test, reuse, and maintain across large React applications.\n\nLifting state up to a common parent is the standard React pattern for shared UI state. When sibling components need to communicate — like a filter chip group and a list below it — the shared state lives in the nearest common ancestor and flows down via props.",
    scenario_id: "mern-ft-scenario-2",
    tasks: {
      create: [
        // ── L2-T1: Build the WorkoutCard component ───────────────
        {
          task_name: "Build the WorkoutCard Component",
          test_type: "client",
          user_story:
            "As a member, I want to see workout cards in the feed so that I can browse recent training activity.",
          learning_sections: {
            create: [
              {
                title: "Overview\nPresentational Components in React",
                content:
                  "This section introduces the crash course for building presentational components. It gives a high-level view of how UI is composed from typed props, existing UI primitives, and conditional rendering.",
                order: 1,
              },
              {
                title: "What is a Presentational Component?",
                content:
                  "A presentational component receives data via props and returns JSX. It has no side effects, no API calls, and no local state beyond visual interactions (e.g., hover). This makes it fully predictable and easy to test.",
                order: 2,
              },
              {
                title: "Typed Props with TypeScript",
                content:
                  "TypeScript interfaces describe the shape of a component's props. The WorkoutCard already has a typed interface defined — the task is to implement the component body so it renders every field. TypeScript warns if a field that does not exist in the interface is accessed.",
                order: 3,
              },
              {
                title: "Reusing UI Primitives",
                content:
                  "FitTrackr has a set of pre-built UI primitives in `client/src/components/ui/` — reusable components like Card, Badge, Avatar, and Button that already handle accessibility, styling, and dark mode.",
                order: 4,
              },
              {
                title: "Conditional Rendering",
                content:
                  "Some workout fields are optional. Conditional rendering handles missing values gracefully using short-circuit evaluation or ternary expressions based on whether the field is truthy or non-empty.",
                order: 5,
              },
              {
                title: "Displaying Counts and Dates",
                content:
                  "Dynamic values are formatted in the JSX using JavaScript expressions: exercise count with pluralization, duration in minutes, and dates localized via toLocaleDateString(). Consistency in formatting keeps the UI readable across different data shapes.",
                order: 6,
              },
              {
                title: "Practice Lab: Render a Workout Summary",
                content:
                  "Practice rendering a simple object to a string representation.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement formatWorkoutSummary({title, authorUsername}) returning \"TITLE by AUTHOR\".\n\nExamples: formatWorkoutSummary({title:\"Leg Day\",authorUsername:\"tomh\"})→\"Leg Day by tomh\".",
                  language: "javascript",
                  starter_code:
                    'export function formatWorkoutSummary(workout) {\n  // TODO: return "{title} by {authorUsername}"\n}\n',
                  editable_regions: [
                    {
                      placeholder: '// TODO: return "{title} by {authorUsername}"',
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "formatWorkoutSummary",
                  test_cases: [
                    {
                      input: [{ title: "Leg Day", authorUsername: "tomh" }],
                      expected: "Leg Day by tomh",
                      label: "basic summary",
                    },
                    {
                      input: [{ title: "Morning Run", authorUsername: "priya" }],
                      expected: "Morning Run by priya",
                      label: "different workout",
                    },
                  ],
                
                hints: [
                  "Use template literal or concatenation.",
                  "JavaScript has a way to embed values directly into a string without using + for each piece. Think about what syntax lets you write a string template with placeholders.",
                  "return `${___} by ${___}`;"
                  ],},
                order: 7,
              },
              {
                title: "Key Takeaway",
                content:
                  "Presentational components are the workhorses of a React UI. Keep them pure — no API calls, no side effects — and rely on existing UI primitives to stay consistent. A component that does one job well is easy to test and easy to reuse.",
                order: 8,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "The component file already exists at `client/src/components/workout/WorkoutCard.tsx` — it is a stub that returns null. The job is to replace the return statement with real JSX.",
                order: 1,
              },
              {
                description:
                  "Check `client/src/components/ui/` for existing primitives like `<Card>`, `<Badge>`, and `<Button>` — import and reuse them instead of writing raw divs.",
                order: 2,
              },
              {
                description:
                  "The test checks that the title, author username, category badge text, exercise count, durationMin, cheerCount, and a Cheer button are all rendered. Use React Testing Library's `getByText` or `getByRole` to understand what the test is looking for.",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description: "WorkoutCard renders the workout title",
                is_required: true,
                order: 1,
              },
              {
                description: "WorkoutCard renders the author's username",
                is_required: true,
                order: 2,
              },
              {
                description: "WorkoutCard renders a category badge",
                is_required: true,
                order: 3,
              },
              {
                description: 'WorkoutCard renders the exercise count (e.g., "3 exercises")',
                is_required: true,
                order: 4,
              },
              {
                description: "WorkoutCard renders the duration in minutes",
                is_required: true,
                order: 5,
              },
              {
                description: "WorkoutCard renders the cheerCount",
                is_required: true,
                order: 6,
              },
              {
                description: "WorkoutCard renders a Cheer button with accessible name matching /cheer/i",
                is_required: true,
                order: 7,
              },
            ],
          },
        },
        // ── L2-T2: Filter WorkoutFeed by Category ────────────────
        {
          task_name: "Filter the WorkoutFeed by Category",
          test_type: "client",
          user_story:
            "As a member, I want to filter workouts by category so that I can quickly browse training content relevant to my goals.",
          learning_sections: {
            create: [
              {
                title: "Overview\nState Management and Filtering in React",
                content:
                  "This section introduces the crash course for managing shared UI state and filtering lists in React. It gives a high-level view of lifting state up, controlled components, and pure filter functions.",
                order: 1,
              },
              {
                title: "Lifting State Up",
                content:
                  "When two sibling components need to share data, the state must live in their nearest common parent and flow down as props. Neither child component should hold the filter state internally — the parent coordinates between them.",
                order: 2,
              },
              {
                title: "Controlled Components",
                content:
                  "A controlled component's value is driven entirely by props passed from the parent. The component never holds its own state for the displayed value — it only calls the `onChange` callback when the user interacts. This is the same pattern as a controlled `<input value={...} onChange={...} />`.",
                order: 3,
              },
              {
                title: "Pure Filter Functions",
                content:
                  "Filtering is pure data manipulation — no side effects needed. A pure filter function is easy to unit-test in isolation and safe to call inside `useMemo`.",
                order: 4,
              },
              {
                title: "useMemo for Derived State",
                content:
                  "When a value is derived from props or state (like a filtered list), wrap it in `useMemo` so React only recomputes it when the input changes. This prevents unnecessary re-renders when unrelated state changes.",
                order: 5,
              },
              {
                title: "Chip Group Pattern",
                content:
                  "A chip group (also called a toggle group) is a row of labeled buttons where exactly one is active at a time. The active chip gets a highlighted style. Each chip should have role=\"button\" and visually distinguish itself as selected when it matches the active category.",
                order: 6,
              },
              {
                title: "Practice Lab: Filter by Category",
                content:
                  "Practice writing the core filter function used by the feed.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement filterByCategory(items, category) returning filtered array. \"all\" → all items, else filter by category.\n\nExamples: filterByCategory(items,\"all\")→all, filterByCategory(items,\"strength\")→only strength.",
                  language: "javascript",
                  starter_code:
                    "export function filterByCategory(items, category) {\n  // TODO: return all items when category === 'all'\n  // return only matching items otherwise\n}\n",
                  editable_regions: [
                    {
                      placeholder:
                        "// TODO: return all items when category === 'all'\n  // return only matching items otherwise",
                      case_sensitive: false,
                    },
                  ],
                  entry_point: "filterByCategory",
                  test_cases: [
                    {
                      input: [
                        [
                          { title: "A", category: "strength" },
                          { title: "B", category: "cardio" },
                        ],
                        "all",
                      ],
                      expected: [
                        { title: "A", category: "strength" },
                        { title: "B", category: "cardio" },
                      ],
                      label: "all category returns everything",
                    },
                    {
                      input: [
                        [
                          { title: "A", category: "strength" },
                          { title: "B", category: "cardio" },
                        ],
                        "strength",
                      ],
                      expected: [{ title: "A", category: "strength" }],
                      label: "filter by strength",
                    },
                  ],
                
                hints: [
                  "Check \"all\" first, then filter.",
                  "if (category === \"all\") return items; return items.filter(i => i.category === category);",
                  "if (category === \"___\") return items; return items.filter(i => i.___ === category);"
                ],},
                order: 7,
              },
              {
                title: "Key Takeaway",
                content:
                  "Lifting state up and passing it down via props is the fundamental React pattern for coordinating between sibling components. Keep filter logic pure and separated from rendering — it is easier to test, easier to extend, and easier to debug.",
                order: 8,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "`CategoryFilter.tsx` is a stub — implement it as a row of clickable chip buttons. The parent `Feed.tsx` should hold the `activeCategory` state and pass it down via props.",
                order: 1,
              },
              {
                description:
                  "The `filterByCategory` helper in `client/src/utils/helpers.ts` is intentionally unimplemented — complete it first, then use it inside `Feed.tsx` to filter the workout list before passing it to `WorkoutFeed`.",
                order: 2,
              },
              {
                description:
                  "The test clicks a category chip and then checks that only workouts of that category remain visible in the list. Make sure the chip `onClick` triggers a state update that causes the feed to re-render with filtered data.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "CategoryFilter renders chips for: all, strength, cardio, mobility, hiit",
                is_required: true,
                order: 1,
              },
              {
                description: "Clicking a category chip filters the feed to show only that category",
                is_required: true,
                order: 2,
              },
              {
                description: 'Clicking "all" shows all workouts regardless of category',
                is_required: true,
                order: 3,
              },
              {
                description:
                  'filterByCategory in utils/helpers.ts returns workouts unchanged when category is "all"',
                is_required: true,
                order: 4,
              },
              {
                description: "Active category chip is visually distinguishable from inactive chips",
                is_required: true,
                order: 5,
              },
            ],
          },
        },
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────
  // LEVEL 3 — Backend / MongoDB
  // ─────────────────────────────────────────────────────────────
  {
    id: "mern-ft-level-3",
    title: "Backend / MongoDB",
    subtitle: "Fix the leaderboard aggregation and harden the endpoint.",
    order: 3,
    deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: The weekly leaderboard is returning empty results and bad data. Two backend tasks await: fix the broken MongoDB aggregation pipeline in the leaderboard controller, then wrap it in proper Express error handling and query-param validation so the endpoint is production-ready.",
    xp_reward: 200,
    coin_reward: 100,
    key_takeaways:
      "MongoDB aggregation pipelines process documents through ordered stages. Always run $match before $lookup to filter documents before the expensive join — doing it after wastes I/O on every record. Use $group with correct field references and always add $sort + $limit for ranked results.\n\nRobust Express endpoints validate incoming data before executing business logic, propagate errors through next(err) instead of swallowing them, and return consistent { success, data } response envelopes so client code can handle responses uniformly.",
    scenario_id: "mern-ft-scenario-2",
    tasks: {
      create: [
        // ── L3-T1: Fix the Leaderboard Aggregation ───────────────
        {
          task_name: "Fix the Weekly Leaderboard Aggregation",
          test_type: "server",
          user_story:
            "As a member, I want to see a leaderboard of top users by cheers this week so that I can track community engagement.",
          learning_sections: {
            create: [
              {
                title: "Overview\nMongoDB Aggregation Pipelines",
                content:
                  "This section introduces the crash course for MongoDB aggregation. It gives a high-level view of how pipeline stages transform documents, why stage order matters, and the common bugs that break aggregation results.",
                order: 1,
              },
              {
                title: "What is an Aggregation Pipeline?",
                content:
                  "An aggregation pipeline is a sequence of stages that each transform the documents flowing through it. Each stage receives the output of the previous stage. Order matters enormously — a mistake early in the pipeline corrupts everything downstream.",
                order: 2,
              },
              {
                title: "$match Before $lookup — Why It Matters",
                content:
                  "Running $lookup (a join) before $match joins every document in the collection before filtering. For a collection with 100k workouts, that computes 100k joins before discarding 93k. Filtering first can be the difference between a 2ms query and a 2000ms query.",
                order: 3,
              },
              {
                title: "Date Math for a 7-Day Window",
                content:
                  "To find workouts from the last 7 days, compute the cutoff date by subtracting 7 days in milliseconds from the current time. A common bug is using `new Date()` without any subtraction — which makes the cutoff the current moment, so only workouts from that exact millisecond match.",
                order: 4,
              },
              {
                title: "$group Accumulators and Field Names",
                content:
                  "The $group stage accumulates values across documents. Field paths use the $ prefix. A misspelled field silently returns 0 for every document — MongoDB does not throw an error for missing field references.",
                order: 5,
              },
              {
                title: "$sort and $limit for Ranked Results",
                content:
                  "Without $sort and $limit, the aggregation returns documents in arbitrary order and could return the entire collection. Always add both when building a ranked leaderboard — they prevent unbounded queries and non-deterministic ordering.",
                order: 6,
              },
              {
                title: "Practice Lab: Compute Start of Last Week",
                content:
                  "Practice writing the date math used to define the leaderboard time window.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Complete getStartOfLastWeek() so it returns a Date that is exactly 7 days (7 * 24 * 60 * 60 * 1000 ms) before the current time.",
                  language: "javascript",
                  starter_code:
                    "export function getStartOfLastWeek() {\n  // TODO: return a Date 7 days ago\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO: return a Date 7 days ago",
                      case_sensitive: false,
                    },
                  ],
                  entry_point: "getStartOfLastWeek",
                  test_cases: [
                    {
                      input: [],
                      expected: "__WITHIN_RANGE__",
                      label: "returns a Date object roughly 7 days ago",
                    },
                  ],
                },
                hints: [
                  "Break this into smaller steps and think about what each piece of your input becomes in the output.",
                  "Focus on the transformation itself — what operation changes your input value into the form the test expects?",
                  "You are close — look at the examples again. What pattern do you see in how the input maps to the expected output?"
                ],
                order: 7,
              },
              {
                title: "Key Takeaway",
                content:
                  "Always match (filter) before lookup (join). Always use the correct field names with $ prefix in accumulators. Always sort and limit ranked queries. Three rules — three of the most common aggregation bugs fixed.",
                order: 8,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Look at `server/src/controllers/workout.controller.ts` in the `getLeaderboard` function. There are at least 4 distinct bugs in the aggregation pipeline — read the comments labeled `// BUG` for hints on what needs fixing.",
                order: 1,
              },
              {
                description:
                  "The date filter is computing the wrong cutoff — `new Date()` without any subtraction means only documents from the current millisecond match. Subtract 7 days in milliseconds.",
                order: 2,
              },
              {
                description:
                  "After fixing the date math, check the $group stage's $sum field reference — it references a field name that does not exist on Workout documents. Also ensure $sort and $limit are present.",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Leaderboard only includes users with at least one workout in the last 7 days",
                is_required: true,
                order: 1,
              },
              {
                description: "Results are sorted by totalCheers descending",
                is_required: true,
                order: 2,
              },
              {
                description: "Results are capped at 10 entries",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Each entry has fields: userId, username, totalCheers, workoutCount",
                is_required: true,
                order: 4,
              },
              {
                description: "Response does not include a raw workouts array",
                is_required: true,
                order: 5,
              },
            ],
          },
        },
        // ── L3-T2: Type-safe leaderboard endpoint ────────────────
        {
          task_name: "Harden the Leaderboard Endpoint",
          test_type: "server",
          user_story:
            "As a backend developer, I want the leaderboard endpoint to validate query params, return a consistent response envelope, and propagate errors so that the API is production-ready.",
          learning_sections: {
            create: [
              {
                title: "Overview\nExpress Endpoint Hardening",
                content:
                  "This section introduces the crash course for hardening Express endpoints. It gives a high-level view of request validation, response envelopes, error propagation, and TypeScript typing for route handlers.",
                order: 1,
              },
              {
                title: "Query Parameter Validation with Zod",
                content:
                  "Query parameters arrive as strings and must be validated before use. Zod makes this declarative by transforming raw strings into typed values and validating constraints before the controller runs.",
                order: 2,
              },
              {
                title: "The validateRequest Middleware",
                content:
                  "The shared `validateRequest` middleware wraps Zod schemas and automatically returns 400 with a helpful error message on failure. This keeps validation logic out of the controller and ensures every invalid request is rejected before reaching business logic.",
                order: 3,
              },
              {
                title: "Response Envelopes",
                content:
                  "Consistent response shapes make client code simpler. A standard envelope uses `{ success: true, data: payload }` for success and `{ success: false, message: '...' }` for errors. Clients only need to check `body.success` to decide how to handle the response.",
                order: 4,
              },
              {
                title: "Async Error Propagation with next(err)",
                content:
                  "Unhandled promise rejections in Express crash the process or return no response. Async controllers wrapped in try/catch forward errors to next(err), which passes them to the global error handler that converts them into proper 500 responses.",
                order: 5,
              },
              {
                title: "Express RequestHandler Typing",
                content:
                  "Typing Express handlers in TypeScript prevents `req.query` from being typed as `any`. With the Zod schema attached to the route, validated query params become properly typed values.",
                order: 6,
              },
              {
                title: "Practice Lab: Write a Response Envelope Handler",
                content:
                  "Practice writing a function that wraps a payload in the standard success envelope.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement wrapSuccess(payload) returning {success:true, data:payload}.\n\nExamples: wrapSuccess([])→{success:true,data:[]}.",
                  language: "javascript",
                  starter_code:
                    "export function wrapSuccess(payload) {\n  // TODO: return the success envelope\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO: return the success envelope",
                      case_sensitive: false,
                    },
                  ],
                  entry_point: "wrapSuccess",
                  test_cases: [
                    {
                      input: [[]],
                      expected: { success: true, data: [] },
                      label: "empty array payload",
                    },
                    {
                      input: [{ id: 1 }],
                      expected: { success: true, data: { id: 1 } },
                      label: "object payload",
                    },
                  ],
                
                hints: [
                  "Return object literal.",
                  "Think step by step about what operation transforms your input into the output you need. Break it down into smaller sub-problems and solve each one.",
                  "return { ___: true, ___: payload };"
                  ],},
                order: 7,
              },
              {
                title: "Key Takeaway",
                content:
                  "Production endpoints do three things: validate inputs before processing, return consistent response shapes, and propagate errors without crashing. Get these right and the API becomes predictable for every caller.",
                order: 8,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "The `validateRequest` middleware already exists in `server/src/middleware/validateRequest.ts`. Create a `leaderboardQuerySchema` with Zod in the validators file and wire it to the route.",
                order: 1,
              },
              {
                description:
                  "The controller currently uses `res.send(data)` with no status code and no `{ success, data }` envelope. Fix it to use `res.status(200).json({ success: true, data })` and wrap the whole thing in try/catch with `next(err)`.",
                order: 2,
              },
              {
                description:
                  "For `?limit=999`, the Zod schema should fail validation because 999 > 50. For `?limit=abc`, it should fail because Number('abc') is NaN which fails the `.int()` check. Test both cases after wiring up the schema.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "GET /api/workouts/leaderboard returns 200 with { success: true, data: [...] }",
                is_required: true,
                order: 1,
              },
              {
                description: "?limit=5 returns at most 5 entries",
                is_required: true,
                order: 2,
              },
              {
                description: "?limit=999 returns 400 with success: false",
                is_required: true,
                order: 3,
              },
              {
                description: "?limit=0 returns 400",
                is_required: true,
                order: 4,
              },
              {
                description: "?limit=abc returns 400",
                is_required: true,
                order: 5,
              },
              {
                description: "Thrown errors are forwarded to next(err) and handled by the global error handler",
                is_required: true,
                order: 6,
              },
            ],
          },
        },
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────
  // LEVEL 4 — Full-Stack Feature: Cheer + Streak
  // ─────────────────────────────────────────────────────────────
  {
    id: "mern-ft-level-4",
    title: "Full-Stack Feature: Cheer + Streak",
    subtitle: "Implement the cheer toggle and personal workout streak page end-to-end.",
    order: 4,
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: PulseLabs wants two social features shipped before the next sprint review: a cheer (like) system where members can cheer each other's workouts with a count that never drifts, and a personal streak page showing how many consecutive days a member has trained. Both features require server routes, Mongoose logic, client services, and UI wiring.",
    xp_reward: 250,
    coin_reward: 125,
    key_takeaways:
      "Idempotent operations are safe to retry — a second cheer request from the same user should produce the same state as the first without double-counting. Separating the Cheer join-table from a cheerCount cache enables both an accurate count and a queryable history of who cheered what.\n\nStreak computation is a pure algorithm over date-keyed data: deduplicate workouts to one per calendar day, then count consecutive days walking backwards from today. Computation is always correct but O(n); a cache is fast but can drift if not invalidated correctly.",
    scenario_id: "mern-ft-scenario-2",
    tasks: {
      create: [
        // ── L4-T1: Cheer endpoint + button wiring ────────────────
        {
          task_name: "Implement Cheer and Uncheer",
          test_type: "both",
          user_story:
            "As a member, I want to cheer a workout to show appreciation and see the count update instantly so that the community stays engaged.",
          learning_sections: {
            create: [
              {
                title: "Overview\nFull-Stack Feature: Cheer System",
                content:
                  "This section introduces the crash course for implementing a full-stack cheer (like) feature. It covers REST verb semantics, idempotency, join tables, optimistic UI updates, and Mongoose atomic increments.",
                order: 1,
              },
              {
                title: "REST Verb Semantics for Social Actions",
                content:
                  "Cheer maps naturally to REST verbs: POST creates a Cheer document (idempotent), DELETE removes it. Both are scoped to the authenticated user's identity via the JWT — the userId is never passed in the body.",
                order: 2,
              },
              {
                title: "Idempotency: Safe to Retry",
                content:
                  "An idempotent operation produces the same result no matter how many times it is called with the same input. The first POST creates the Cheer doc and increments the counter; a second POST from the same user finds the existing doc and returns success without incrementing again.",
                order: 3,
              },
              {
                title: "Join Table Pattern (Cheer Model)",
                content:
                  "Rather than storing a list of userId values inside the Workout document, a separate Cheer collection (join table) stores each cheer as its own document. This makes queries scannable by index, counts accurate via countDocuments, and avoids document size limit issues.",
                order: 4,
              },
              {
                title: "Atomic Increment with $inc",
                content:
                  "When creating a cheer, the counter is incremented atomically using $inc so concurrent requests do not race. Never read-modify-write (fetch, then set) — atomic $inc is the MongoDB-safe way to update counters under concurrent load.",
                order: 5,
              },
              {
                title: "Optimistic UI Updates",
                content:
                  "For a snappy UX, the UI updates immediately before the server confirms the action. If the server request fails, the UI reverts to the previous state. This makes the interface feel instant even on slow connections.",
                order: 6,
              },
              {
                title: "Practice Lab: Next Cheer Count",
                content:
                  "Practice the simple counter logic that drives the optimistic UI update.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement nextCheerCount(current, action): \"cheer\"→+1, \"uncheer\"→-1 but never below 0.\n\nExamples: nextCheerCount(0,\"cheer\")→1, nextCheerCount(0,\"uncheer\")→0.",
                  language: "javascript",
                  starter_code:
                    "export function nextCheerCount(current, action) {\n  // TODO: return current + 1 for 'cheer', current - 1 for 'uncheer' (min 0)\n}\n",
                  editable_regions: [
                    {
                      placeholder:
                        "// TODO: return current + 1 for 'cheer', current - 1 for 'uncheer' (min 0)",
                      case_sensitive: false,
                    },
                  ],
                  entry_point: "nextCheerCount",
                  test_cases: [
                    {
                      input: [0, "cheer"],
                      expected: 1,
                      label: "cheer from 0",
                    },
                    {
                      input: [5, "cheer"],
                      expected: 6,
                      label: "cheer from 5",
                    },
                    {
                      input: [1, "uncheer"],
                      expected: 0,
                      label: "uncheer to 0",
                    },
                    {
                      input: [0, "uncheer"],
                      expected: 0,
                      label: "uncheer clamped at 0",
                    },
                  ],
                
                hints: [
                  "Check action. Increment or decrement with floor.",
                  "if (action === \"cheer\") return current + 1; return Math.max(0, current - 1);",
                  "if (action === \"___\") return current + 1; return Math.___(0, current - 1);"
                ],},
                order: 7,
              },
              {
                title: "Key Takeaway",
                content:
                  "Full-stack social features require consistent state across three layers: the Cheer document (source of truth), the cheerCount cache (performance), and the UI optimistic state (UX). Keep them in sync with atomic DB operations and careful error handling on the client.",
                order: 8,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "The controller stub in `workout.controller.ts` returns 501 for cheer/uncheer. Implement it: use `Cheer.findOne({ workoutId, userId })` to check for an existing cheer, then create or skip accordingly, and use `$inc` to adjust the counter.",
                order: 1,
              },
              {
                description:
                  "The client service `cheerWorkout` in `workout.service.ts` throws an error instead of calling the API. Implement it using the `api` axios instance with `POST /workouts/:id/cheer`.",
                order: 2,
              },
              {
                description:
                  "The WorkoutCard Cheer button is a no-op. Wire it to call `cheerWorkout(workout._id)` and update local state optimistically, reverting on error.",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description: "First cheer returns 2xx and increments workout cheerCount by 1",
                is_required: true,
                order: 1,
              },
              {
                description: "Duplicate cheer by same user does not increment cheerCount again",
                is_required: true,
                order: 2,
              },
              {
                description: "Cheer by a different user increments cheerCount by 1 more",
                is_required: true,
                order: 3,
              },
              {
                description: "DELETE uncheer removes the Cheer doc and decrements cheerCount",
                is_required: true,
                order: 4,
              },
              {
                description: "Uncheer on a workout never cheered does not cause negative cheerCount",
                is_required: true,
                order: 5,
              },
              {
                description: "Unauthenticated cheer request returns 401",
                is_required: true,
                order: 6,
              },
              {
                description: "WorkoutCard Cheer button updates the displayed count optimistically",
                is_required: true,
                order: 7,
              },
            ],
          },
        },
        // ── L4-T2: Personal streak page ──────────────────────────
        {
          task_name: "Personal Workout Streak Page",
          test_type: "both",
          user_story:
            "As a member, I want to see my current and longest workout streaks so that I stay motivated to train every day.",
          learning_sections: {
            create: [
              {
                title: "Overview\nFull-Stack Feature: Workout Streaks",
                content:
                  "This section introduces the crash course for implementing a personal streak feature. It covers streak algorithm design, date-only comparisons, deduplication by calendar day, and connecting a new API endpoint to a React page.",
                order: 1,
              },
              {
                title: "What is a Workout Streak?",
                content:
                  "A streak is the number of consecutive calendar days on which a user has logged at least one workout. The streak continues today (or ended yesterday — the app does not break the streak for not yet working out today).\n\nExamples:\n- Workouts on Mon, Tue, Wed → streak: 3\n- Workouts on Mon, Wed (gap on Tue) → streak: 1 (only Wed counts)\n- No workouts → streak: 0",
                order: 2,
              },
              {
                title: "Date-Only Comparison",
                content:
                  "Workout timestamps are full Date objects. To count streaks, only the calendar date matters, not the time. Converting each timestamp to a date string allows grouping workouts by their date key to get one entry per calendar day.",
                order: 3,
              },
              {
                title: "Deduplication and Sorting",
                content:
                  "Multiple workouts on the same day still count as one streak day. A Set deduplicates the date strings. Sorting in descending order produces a list that can be walked to count consecutive days.",
                order: 4,
              },
              {
                title: "Counting Consecutive Days",
                content:
                  "Walking backwards from today, each matching date increments the streak counter and moves the cursor back one day. The algorithm allows starting from yesterday so the streak is not broken simply because the user has not worked out yet today. A gap of more than one day ends the streak.",
                order: 5,
              },
              {
                title: "The Streak API Shape",
                content:
                  "The endpoint GET /api/users/me/streak returns `{ success: true, data: { currentStreak, longestStreak, lastWorkoutDate } }`. longestStreak must always be >= currentStreak. When there are no workouts, all values are 0 or null.",
                order: 6,
              },
              {
                title: "Practice Lab: Days Between Two Dates",
                content:
                  "Practice the core date math used to check whether two dates are adjacent.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement daysBetween(a, b) returning whole-number days between two ISO date strings.\n\nExamples: daysBetween(\"2026-01-10\",\"2026-01-12\")→2.",
                  language: "javascript",
                  starter_code:
                    "export function daysBetween(a, b) {\n  // TODO: return the number of calendar days between dates a and b\n  // Example: daysBetween('2026-01-10', '2026-01-12') === 2\n}\n",
                  editable_regions: [
                    {
                      placeholder:
                        "// TODO: return the number of calendar days between dates a and b\n  // Example: daysBetween('2026-01-10', '2026-01-12') === 2",
                      case_sensitive: false,
                    },
                  ],
                  entry_point: "daysBetween",
                  test_cases: [
                    {
                      input: ["2026-01-10", "2026-01-10"],
                      expected: 0,
                      label: "same day",
                    },
                    {
                      input: ["2026-01-10", "2026-01-11"],
                      expected: 1,
                      label: "adjacent days",
                    },
                    {
                      input: ["2026-01-10", "2026-01-12"],
                      expected: 2,
                      label: "two days apart",
                    },
                  ],
                
                hints: [
                  "Parse dates, ms diff, divide by 86400000, Math.abs.",
                  "Before you can check the number, you need to convert it from its string form. Then you need to decide: is this a valid number, and is it within the allowed range?",
                  "return Math.abs(new Date(a) - new Date(b)) / ___;"
                  ],},
                order: 7,
              },
              {
                title: "Key Takeaway",
                content:
                  "Streak computation is a pure algorithm: deduplicate → sort → walk. The tricky parts are using date-only keys (not full timestamps) and allowing today or yesterday as the streak anchor. Get those two right and the rest is straightforward iteration.",
                order: 8,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "The controller stub `getMyStreak` in `user.controller.ts` returns 501. Implement it: fetch all workouts for `req.user._id`, deduplicate by UTC date string, then count consecutive days.",
                order: 1,
              },
              {
                description:
                  "The client service `getMyStreak` in `workout.service.ts` throws an error. Implement it with `GET /users/me/streak` using the `api` axios instance.",
                order: 2,
              },
              {
                description:
                  "The `MyStreak.tsx` page is empty — add a `useEffect` to call `getMyStreak()` on mount and display `currentStreak`, `longestStreak`, and `lastWorkoutDate`. Handle the zero-workout case with a friendly empty state.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "GET /api/users/me/streak returns 200 with { success: true, data: { currentStreak, longestStreak, lastWorkoutDate } }",
                is_required: true,
                order: 1,
              },
              {
                description: "5 consecutive daily workouts produce currentStreak === 5",
                is_required: true,
                order: 2,
              },
              {
                description: "Multiple workouts on the same day count as 1 streak day",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "A gap of more than 1 day breaks the streak (currentStreak resets to the recent run)",
                is_required: true,
                order: 4,
              },
              {
                description: "longestStreak is always >= currentStreak",
                is_required: true,
                order: 5,
              },
              {
                description:
                  "User with no workouts → currentStreak: 0, longestStreak: 0, lastWorkoutDate: null",
                is_required: true,
                order: 6,
              },
              {
                description: "MyStreak page renders currentStreak and longestStreak values from the API",
                is_required: true,
                order: 7,
              },
              {
                description: "Unauthenticated request returns 401",
                is_required: true,
                order: 8,
              },
            ],
          },
        },
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────
  // LEVEL 5 — Production Bug Fixes
  // ─────────────────────────────────────────────────────────────
  {
    id: "mern-ft-level-5",
    title: "Production Bug Fixes",
    subtitle: "Fix cheer counter drift and timezone-naive streak grouping.",
    order: 5,
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: Two critical bugs have been reported by PulseLabs users. First, some workouts show inflated cheer counts because concurrent requests create duplicate Cheer documents. Second, users in UTC+8 see their late-night workouts appear on the wrong day, breaking their streak. Diagnose and fix both production bugs.",
    xp_reward: 300,
    coin_reward: 150,
    key_takeaways:
      "Database-level unique indexes are the only reliable way to enforce uniqueness under concurrent load. Application-level checks (findOne then create) have a race window — two requests can both find no existing document and both insert. The MongoDB unique index catches the second insert and returns E11000, which the application handles as an idempotent no-op.\n\nDate objects in JavaScript are always UTC instants. Converting a UTC timestamp to a local calendar day requires timezone-aware formatting. Naive toISOString().slice(0,10) gives the UTC date — for a UTC+8 user this assigns late-night workouts to the next UTC calendar day, which is actually the same local day. Always use Intl.DateTimeFormat or a tz-aware library when grouping by user-local date.",
    scenario_id: "mern-ft-scenario-2",
    tasks: {
      create: [
        // ── L5-T1: Cheer counter drift ───────────────────────────
        {
          task_name: "Fix Cheer Counter Drift",
          test_type: "server",
          user_story:
            "As a member, I want workout cheer counts to be accurate so that I can trust the engagement numbers on posts.",
          learning_sections: {
            create: [
              {
                title: "Overview\nConcurrency Bugs and Unique Indexes",
                content:
                  "This section introduces the crash course for diagnosing and fixing counter drift caused by concurrent duplicate inserts. It covers MongoDB unique indexes, E11000 duplicate-key errors, and the check-then-act race condition.",
                order: 1,
              },
              {
                title: "The Bug: Duplicate Cheer Documents",
                content:
                  'Client Report: "Some workouts show 12 cheers but we can only count 6 distinct users who cheered."\n\nRoot cause: two concurrent POST /cheer requests from the same user both execute Cheer.findOne({ userId, workoutId }) simultaneously and both find no existing document. They both proceed to insert — so now there are 2 Cheer docs for the same pair, and cheerCount was incremented twice. This is the classic "check then act" race condition.',
                order: 2,
              },
              {
                title: "Application-Level Checks Are Not Enough",
                content:
                  "A findOne → create sequence has a race window between the read and the write. No amount of careful application-level logic can close this window. Only the database can enforce uniqueness atomically.",
                order: 3,
              },
              {
                title: "MongoDB Unique Indexes",
                content:
                  "A compound unique index tells MongoDB to reject any insert that would create a duplicate combination of fields. This index is enforced at the storage engine level — no race condition is possible. The second insert fails with a duplicate-key error (E11000) before the document is written.",
                order: 4,
              },
              {
                title: "Handling E11000 in the Controller",
                content:
                  "When the unique index rejects a duplicate insert, Mongoose throws an error with code 11000. Catching it and treating it as the idempotent path returns success without double-incrementing the counter.",
                order: 5,
              },
              {
                title: "Backfill: Cleaning Up Existing Duplicates",
                content:
                  "Once the unique index is added with syncIndexes(), MongoDB enforces it going forward. Existing duplicate documents from before the fix must be cleaned up by finding all duplicate (userId, workoutId) pairs, keeping the oldest doc and deleting the rest, then recalculating cheerCount from the clean Cheer collection.",
                order: 6,
              },
              {
                title: "Practice Lab: Detect Duplicate Key Error",
                content:
                  "Practice writing the error-type guard used in the cheer controller.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement isDuplicateKeyError(err) returning true for MongoDB duplicate-key error (code 11000).\n\nExamples: isDuplicateKeyError({code:11000})→true.",
                  language: "javascript",
                  starter_code:
                    "export function isDuplicateKeyError(err) {\n  // TODO: return true if err.code === 11000\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO: return true if err.code === 11000",
                      case_sensitive: false,
                    },
                  ],
                  entry_point: "isDuplicateKeyError",
                  test_cases: [
                    {
                      input: [{ code: 11000 }],
                      expected: true,
                      label: "duplicate key error",
                    },
                    {
                      input: [{ code: 500 }],
                      expected: false,
                      label: "non-duplicate error",
                    },
                    {
                      input: [{ message: "some other error" }],
                      expected: false,
                      label: "error without code",
                    },
                  ],
                
                hints: [
  "Check err.code === 11000.",
  "Break this into smaller steps. What is the first transformation your input needs to become the output? Apply it, then think about the next step.",
  "return ___.___ === ___;"
],},
                order: 7,
              },
              {
                title: "Key Takeaway",
                content:
                  "Never rely solely on application-level checks for uniqueness under concurrent load. Add the database-level unique index and let the DB enforce the constraint. Handle E11000 gracefully in the application so it looks like a successful idempotent operation to the caller.",
                order: 8,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Open `server/src/models/Cheer.ts` and look for the comment labeled `// L5-T1 BUG`. Add `CheerSchema.index({ userId: 1, workoutId: 1 }, { unique: true })` below the schema definition.",
                order: 1,
              },
              {
                description:
                  "After adding the index, update the cheer controller to wrap `Cheer.create()` in a try/catch that catches `err.code === 11000` and returns 200 without incrementing the counter again.",
                order: 2,
              },
              {
                description:
                  "Run `Cheer.syncIndexes()` in the controller or test setup to ensure MongoDB applies the new index to the existing collection. Without this, the index only applies to new collections.",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Cheer schema has a compound unique index on { userId: 1, workoutId: 1 } with unique: true",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "100 concurrent cheer requests from the same user produce exactly 1 Cheer document",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "After the concurrency race, workout.cheerCount === 1 (no counter drift)",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "The duplicate-key error (E11000) is caught and treated as an idempotent success — not a 500 error",
                is_required: true,
                order: 4,
              },
              {
                description: "Existing cheer and uncheer tests from Level 4 still pass",
                is_required: true,
                order: 5,
              },
            ],
          },
        },
        // ── L5-T2: Streak timezone-aware grouping ────────────────
        {
          task_name: "Fix Timezone-Naive Streak Grouping",
          test_type: "server",
          user_story:
            "As a member in a non-UTC timezone, I want my workout streak to count correctly based on my local calendar day so that late-night workouts don't appear on the wrong day.",
          learning_sections: {
            create: [
              {
                title: "Overview\nTimezone-Aware Date Grouping",
                content:
                  "This section introduces the crash course for fixing timezone-naive date grouping in a streak computation. It covers UTC vs. local time, IANA timezone identifiers, Intl.DateTimeFormat, and why toISOString().slice(0,10) is unsafe for user-local grouping.",
                order: 1,
              },
              {
                title: "The Bug: Wrong Day Assignment",
                content:
                  'Client Report: "I log a workout at 11:30 PM on Monday (I\'m in Manila, UTC+8) but my streak page says it counts as Tuesday and breaks my streak."\n\nRoot cause: the streak controller uses performedAt.toISOString().slice(0, 10), which always returns the UTC date. For a user in UTC+8, a workout timestamp that is 00:30 local the next day gets assigned to the wrong calendar day. The problem only affects users in timezones with positive offsets where late-night workouts cross the UTC date boundary.',
                order: 2,
              },
              {
                title: "JavaScript Date is Always UTC",
                content:
                  "new Date() stores a UTC instant. It has no local timezone built in — it is always UTC underneath. Using toISOString() always converts to UTC. Using getDate() uses the system locale (wrong on a UTC server). Intl.DateTimeFormat is the correct approach because it accepts an explicit IANA timezone parameter.",
                order: 3,
              },
              {
                title: "IANA Timezone Identifiers",
                content:
                  "IANA timezones (like \"Asia/Manila\", \"America/New_York\", \"Europe/London\") encode both the UTC offset and daylight saving time rules. They are more reliable than raw offsets because some regions observe DST, shifting the offset seasonally. Store the user's IANA timezone in User.timezone (default: 'UTC').",
                order: 4,
              },
              {
                title: "Intl.DateTimeFormat for Timezone-Aware Date Keys",
                content:
                  "The Web Standard way to get a calendar date in a specific timezone is Intl.DateTimeFormat with en-CA locale, which produces YYYY-MM-DD output. This correctly converts the UTC timestamp to the user's local calendar day.",
                order: 5,
              },
              {
                title: "Reading the User's Timezone",
                content:
                  "The streak controller has access to the authenticated user via req.user (populated by the auth middleware). The User model has a timezone field that defaults to 'UTC' when no timezone is set, so existing UTC-timezone users are unaffected.",
                order: 6,
              },
              {
                title: "Practice Lab: Local Date Key",
                content:
                  "Practice writing the timezone-aware date key function used to fix the streak grouping.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Complete localDateKey(isoString, tz) that returns a 'YYYY-MM-DD' string in the given IANA timezone.",
                  language: "javascript",
                  starter_code:
                    "export function localDateKey(isoString, tz) {\n  // TODO: use Intl.DateTimeFormat to return 'YYYY-MM-DD' in the given timezone\n  // Example: localDateKey('2026-01-12T15:30:00Z', 'Asia/Manila') === '2026-01-12'\n}\n",
                  editable_regions: [
                    {
                      placeholder:
                        "// TODO: use Intl.DateTimeFormat to return 'YYYY-MM-DD' in the given timezone\n  // Example: localDateKey('2026-01-12T15:30:00Z', 'Asia/Manila') === '2026-01-12'",
                      case_sensitive: false,
                    },
                  ],
                  entry_point: "localDateKey",
                  test_cases: [
                    {
                      input: ["2026-01-12T15:30:00Z", "Asia/Manila"],
                      expected: "2026-01-12",
                      label: "23:30 Monday Manila → Monday",
                    },
                    {
                      input: ["2026-01-12T15:30:00Z", "UTC"],
                      expected: "2026-01-12",
                      label: "UTC baseline unchanged",
                    },
                  ],
                },
                hints: [
                  "Break this into smaller steps and think about what each piece of your input becomes in the output.",
                  "Focus on the transformation itself — what operation changes your input value into the form the test expects?",
                  "You are close — look at the examples again. What pattern do you see in how the input maps to the expected output?"
                ],
                order: 7,
              },
              {
                title: "Key Takeaway",
                content:
                  "Never use toISOString() to group user-local dates on a UTC server. Always use the user's IANA timezone with Intl.DateTimeFormat. The cost is a single timezone conversion per workout timestamp — the benefit is correct behavior for every user in every timezone.",
                order: 8,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Find where the streak controller groups workouts by date. It uses `performedAt.toISOString().slice(0,10)` — replace this call with a timezone-aware helper that reads `req.user.timezone`.",
                order: 1,
              },
              {
                description:
                  "Implement a `localDateKey(date: Date, tz: string): string` helper using `new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)`. The `en-CA` locale produces `YYYY-MM-DD` output directly.",
                order: 2,
              },
              {
                description:
                  "The test seeds two workouts at 15:30Z on consecutive UTC dates for a Manila user (UTC+8). After the fix, both should group to their correct local calendar days (consecutive) and produce streak: 2. Verify UTC-timezone users are still unaffected.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Streak groups workouts by user's local calendar day using their IANA timezone (not UTC date)",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Two workouts at 15:30Z on consecutive UTC dates produce streak: 2 for a UTC+8 user (both are 23:30 on consecutive local days)",
                is_required: true,
                order: 2,
              },
              {
                description: "UTC-timezone users are unaffected by the fix",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Implementation works with either Intl.DateTimeFormat or a tz-aware date library",
                is_required: true,
                order: 4,
              },
              {
                description: "Default timezone falls back to UTC when user has no timezone set",
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
