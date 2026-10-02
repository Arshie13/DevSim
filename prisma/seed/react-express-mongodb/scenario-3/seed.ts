/**
 * Prisma Seed Script — TripWeaver (MERN Scenario 3)
 *
 * Seeds the database with Level and Scenario data for the TripWeaver learning scenario.
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
    id: "mern-tw-scenario-3",
    name: "TripWeaver",
    description:
      "Build a travel itinerary planner that lets users plan trips, discover destinations, and organize their journeys. Use React + Vite for the frontend and Express + MongoDB for the backend.",
    difficulty: "expert",
    is_paywalled: true,
  },
];

export const levels = [
  // ─────────────────────────────────────────────────────────────
  // LEVEL 1 — Getting Familiar with the Codebase
  // ─────────────────────────────────────────────────────────────
  {
    id: "mern-tw-level-1",
    title: "Getting Familiar with the Codebase",
    subtitle: "Set up the development environment and update the brand tagline.",
    order: 1,
    level_description:
      "Mission Briefing: WanderMint Studios just onboarded a new developer on TripWeaver. The first tasks are to get the MERN (MongoDB, Express, React, Node.js) stack running locally and make a small but visible UI change that confirms understanding of how the codebase is organized.",
    xp_reward: 100,
    coin_reward: 50,
    key_takeaways:
      "Setting up a MERN project requires installing dependencies in three separate locations (root, client, server), configuring environment variables for MongoDB connection strings, and running a seed script to populate realistic data. Understanding this separation of concerns is foundational for every full-stack developer working with Node.js-based projects.\n\nReact components are the building blocks of every UI. Layout components like Header are shared across pages, meaning a single text change affects the entire application consistently. Knowing where to find and edit a component is as important as knowing how to write one.",
    scenario_id: "mern-tw-scenario-3",
    tasks: {
      create: [
        // ── L1-T1: Prepare Development Environment ──────────────
        {
          task_name: "Prepare Development Environment",
          test_type: "none",
          user_story:
            "As a developer, I want to set up my local development environment so that I can run and modify the TripWeaver application.",
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
                  "MERN stands for MongoDB, Express, React, Node.js — four technologies that work together to build full-stack web apps.\n\nMongoDB — a NoSQL document database that stores data as JSON-like objects\nExpress — a Node.js framework that handles server and API routes\nReact — the frontend library that builds the user interface\nNode.js — the JavaScript runtime that runs server code\n\nTripWeaver uses all four layers: MongoDB stores trips, stops, and expenses, Express serves the REST API, React renders the trip feed and itinerary forms, and Node.js ties the backend together.",
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
                  "Sensitive config (like database URIs) is stored in .env files — never hardcoded in source code.\n\nMONGODB_URI=mongodb://localhost:27017/tripweaver\nPORT=4000\nJWT_SECRET=changeme\n\nThe dotenv package reads these files and makes them available as process.env.MONGODB_URI in the application code. ⚠️ .env files are listed in .gitignore intentionally — they contain secrets that should never be committed to version control.\n\nNote: In this project, some environment variables will be provided, so no need to set them up manually.",
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
                  "A seed script populates the database with realistic sample data so that development can proceed against a real dataset instead of an empty one. The TripWeaver seed creates 8 users, 4 trips, ~20 stops, ~12 expenses, and ~10 votes.\n\nRun the seed with:\npnpm run db:seed\n\nThis command is defined in the root package.json and calls server/src/seed/seed.ts via ts-node.",
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
                  "Run `pnpm install` three times: once in the project root, once in `client/`, once in `server/`. Each folder has its own `package.json` and its own `node_modules`, and the root one is what supplies `concurrently`.",
                order: 1,
              },
              {
                description:
                  "The connection string is read from `MONGO_URI`, which `server/src/env.ts` expects and `server/.env.example` shows the shape of. Put `MONGO_URI` in `server/.env`, and make sure MongoDB is running and reachable before a connect/disconnect script that prints `DB_OK` can exit 0.",
                order: 2,
              },
              {
                description:
                  "From `server/`, run `pnpm run dev`, which runs `tsx watch src/index.ts`. The health route is mounted at `GET /api/health` in `server/src/routes/index.ts` and answers with `{ status: \"ok\" }`, so request it and confirm a 200.",
                order: 3,
              },
              {
                description:
                  "From `client/`, run `pnpm run dev -- --port 3000` to start Vite. The HTML it serves must still contain the `<div id=\"root\">` mount point from `client/index.html`.",
                order: 4,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Install root dependencies using pnpm install from the project root",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Install client dependencies using pnpm install from the client directory",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Install server dependencies using pnpm install from the server directory",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Verify the database connection works from the server",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "Start the server from the server directory and verify the health endpoint responds",
                is_required: true,
                order: 5,
              },
              {
                description:
                  "Start the client from the client directory and verify the app loads",
                is_required: true,
                order: 6,
              },
            ],
          },
        },

        // ── L1-T2: Update Brand Tagline ──────────────────────────
        {
          task_name: "Update the Brand Tagline",
          test_type: "client",
          user_story:
            'As a user, I want to see the correct brand tagline "Plan Together. Travel Smarter." in the header so that the app reflects TripWeaver\'s identity.',
          learning_sections: {
            create: [
              {
                title: "Overview\nEditing a React Layout Component",
                content:
                  "This section introduces the crash course for making the first UI change in a React codebase. It covers how React components work, how layout components are shared across pages, and how to find the right file to edit.",
                order: 1,
              },
              {
                title: "What is a React Component?",
                content:
                  "A React component is a JavaScript function that returns JSX — a syntax that looks like HTML but is compiled to JavaScript. Components can be small (a button) or large (an entire page). Every piece of UI in TripWeaver is a component. Components are composable — complex UIs are built by nesting smaller components inside larger ones.",
                order: 2,
              },
              {
                title: "Layout Components",
                content:
                  "A layout component wraps every page in a consistent shell — header, footer, and the page content in between. Because Header is rendered once in Layout (and Layout wraps every page), any change to Header immediately affects the entire app.",
                order: 3,
              },
              {
                title: "How to Find What to Change",
                content:
                  "When visible text needs changing, work backwards from what is displayed:\n1. Look at the UI — which element contains the text?\n2. Open the browser DevTools and inspect the element to find a class name or data attribute.\n3. Search the codebase for that string.\n4. Open the file, find the line, and change it.",
                order: 4,
              },
              {
                title: "JSX Text Content",
                content:
                  "In JSX, text content is written directly between tags. Unlike HTML, JSX is case-sensitive and requires all tags to be closed. Changing the text between the tags is the simplest possible React edit — no state, no props, no hooks needed.",
                order: 5,
              },
              {
                title: "Hot Module Replacement (HMR)",
                content:
                  "Vite (the build tool for TripWeaver's client) supports Hot Module Replacement — when a file is saved, the browser instantly reflects the change without a full page reload. This makes UI iterations very fast.",
                order: 6,
              },
              {
                title: "Practice Lab: Return the Correct Heading Text",
                content:
                  "Practice returning the correct string value from a function.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement getUpdatedHeadingText() returning \"Welcome Back\" exactly.",
                  language: "javascript",
                  starter_code:
                    'export function getUpdatedHeadingText() {\n  // TODO: return the string "Welcome Back"\n}\n',
                  editable_regions: [
                    {
                      placeholder: '// TODO: return the string "Welcome Back"',
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "getUpdatedHeadingText",
                  test_cases: [
                    {
                      input: [],
                      expected: "Welcome Back",
                      label: 'returns "Welcome Back"',
                    },
                  ],
                
                  hints: [
                    "Simple return.",
                    "return \"Welcome Back\";",
                    "return \"___\";"
                  ],
                },
                order: 7,
              },
              {
                title: "Key Takeaway",
                content:
                  "Layout components are the single source of truth for shared UI elements. A one-line text change in a Header component propagates to every page instantly. Always trace UI elements back to their source component before editing.",
                order: 8,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Open `client/src/components/layout/Header.tsx`. The tagline is the small muted `<span>` directly under the `TripWeaver` wordmark, and it currently reads `Your Tagline Here`. Replace the text inside that span only, and leave the surrounding `<header>` element alone.",
                order: 1,
              },
              {
                description:
                  "Set the text to exactly `Plan Together. Travel Smarter.`. The whole string is matched including the trailing period, so an extra space or a missing period will not do.",
                order: 2,
              },
              {
                description:
                  "Leave the element visible. Hiding it with `hidden`, `sr-only` or `display: none` is treated as a failure, and it has to stay inside the `<header>` element that carries the `banner` role.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  'Update the Header component to display "Plan Together. Travel Smarter." as the tagline',
                is_required: true,
                order: 1,
              },
              {
                description:
                  'Remove the placeholder text "Your Tagline Here" from the Header',
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Verify the tagline is visible in the header when viewing the app",
                is_required: true,
                order: 3,
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
    id: "mern-tw-level-2",
    title: "Client-Side Exploration",
    subtitle: "Build the StopCard component and add day filtering to the itinerary.",
    order: 2,
    level_description:
      "Mission Briefing: The TripWeaver itinerary page is barely functional — stops are not displaying and there is no way to filter by day. The tasks are to build the StopCard presentational component from a stub and then wire up the DayFilter so travelers can focus on a single day of their trip.",
    xp_reward: 150,
    coin_reward: 75,
    key_takeaways:
      "Presentational components are pure functions of their props — given the same props, they always render the same output. This makes them easy to test and reuse across pages. The key skill is reading a type definition and translating every field into the correct JSX element with the right data-testid attribute.\n\nLifting state up means moving shared state to the nearest common ancestor. When DayFilter (the chip group) and ItineraryFeed (the list) both need the same activeDay value, that state belongs in their shared parent — TripDetail. The parent passes the state down as props and passes the setter down as a callback. This one-way data flow is the core pattern of React UI architecture.",
    scenario_id: "mern-tw-scenario-3",
    tasks: {
      create: [
        // ── L2-T1: Build StopCard Component ──────────────────────
        {
          task_name: "Build the StopCard Component",
          test_type: "client",
          user_story:
            "As a member, I want to see stop cards in the itinerary so I can browse trip activities at a glance.",
          learning_sections: {
            create: [
              {
                title: "Overview\nBuilding a Presentational Component",
                content:
                  "This section introduces the crash course for building a typed presentational component in React. It covers how props flow into components, how to render conditional content, how to use data-testid attributes for testing, and how to compose UI primitives.",
                order: 1,
              },
              {
                title: "What is a Presentational Component?",
                content:
                  "A presentational component is a React component that receives all its data through props, has no internal state (or only local UI state like hover), does not fetch data or call APIs directly, and returns JSX that visualizes the props. StopCard is a perfect example: it receives a Stop object as a prop and renders its fields.",
                order: 2,
              },
              {
                title: "Typed Props with TypeScript",
                content:
                  "Define a props interface before writing the component. TypeScript warns if a field that does not exist on the type is accessed, or if a required prop is missing. This catches bugs at compile time, not at runtime.",
                order: 3,
              },
              {
                title: "Reusing UI Primitives",
                content:
                  "TripWeaver ships a ui/ folder with ready-made components like Card, Badge, and Button. Using these keeps the visual language consistent across the app — no need to write custom CSS for borders, shadows, or button styles.",
                order: 4,
              },
              {
                title: "data-testid Attributes",
                content:
                  "Tests use data-testid attributes to find elements without relying on implementation details like class names. If a CSS class is renamed, tests still pass because they look for testids, not classes. Always add these attributes exactly as specified.",
                order: 5,
              },
              {
                title: "Conditional Rendering",
                content:
                  "Some fields are optional. The && operator conditionally renders elements: when a field is empty or undefined, React renders nothing. When it has a value, it renders the element. This prevents empty elements from cluttering the DOM.",
                order: 6,
              },
              {
                title: "Practice Lab: Format a Stop Summary",
                content:
                  "Practice the string formatting logic used to display a stop's title and location together.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement formatStopSummary({title, location}) returning \"TITLE in LOCATION\".\n\nExamples: formatStopSummary({title:\"Senso-ji\",location:\"Asakusa\"})→\"Senso-ji in Asakusa\".",
                  language: "javascript",
                  starter_code:
                    "export function formatStopSummary({ title, location }) {\n  // TODO: return a string like \"Senso-ji in Asakusa\"\n}\n",
                  editable_regions: [
                    {
                      placeholder: '// TODO: return a string like "Senso-ji in Asakusa"',
                      case_sensitive: false,
                    },
                  ],
                  entry_point: "formatStopSummary",
                  test_cases: [
                    {
                      input: [{ title: "Senso-ji", location: "Asakusa" }],
                      expected: "Senso-ji in Asakusa",
                      label: "temple stop",
                    },
                    {
                      input: [{ title: "Shibuya Crossing", location: "Shibuya" }],
                      expected: "Shibuya Crossing in Shibuya",
                      label: "landmark stop",
                    },
                  ],
                
                  hints: [
                    "Use template literal.",
                    "JavaScript has a way to embed values directly into a string without using + for each piece. Think about what syntax lets you write a string template with placeholders.",
                    "return `${___} in ${___}`;"
                    ],
                },
                order: 7,
              },
              {
                title: "Key Takeaway",
                content:
                  "A well-built presentational component is a direct translation of a type definition into JSX. Read each field of the Stop type, decide how to display it (text, badge, formatted date), and add the correct data-testid so automated tests can find each element.",
                order: 8,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Build the card in `client/src/components/trip/StopCard.tsx`, which currently returns `null`. Replace the return value with JSX, and the file's header comment lists the exact elements, attributes and test ids expected. Take the field names from the `Stop` interface in `client/src/types/stop.ts`, and reuse `Card`, `Badge` and `Button` from `../ui/` along with `formatDate` from `../../utils/formatters`.",
                order: 1,
              },
              {
                description:
                  "The three test ids must be exactly `category-badge`, `day-label` and `vote-count`. The title, location and Vote button are matched as text and by accessible role, so those have to be real text content rather than attributes.",
                order: 2,
              },
              {
                description:
                  "Put the title in an `<h3>` so it exposes the `heading` role with the title as its accessible name, and make the Vote control a real `<button>` whose accessible name contains `Vote`. Wire its `onClick` straight to the `onVote` prop.",
                order: 3,
              },
              {
                description:
                  "If the shared `Card`, `Badge` and `Button` primitives do not forward `data-testid`, none of the three lookups will resolve even though the markup looks right.",
                order: 4,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Build the StopCard component in client/src/components/trip/StopCard.tsx to display the stop title as an h3 heading",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Display the stop location as visible text in the StopCard",
                is_required: true,
                order: 2,
              },
              {
                description:
                  'Add a category badge with data-testid="category-badge" showing the stop category',
                is_required: true,
                order: 3,
              },
              {
                description:
                  'Add a day label with data-testid="day-label" showing the formatted stop.dayDate',
                is_required: true,
                order: 4,
              },
              {
                description:
                  'Add a vote count element with data-testid="vote-count" containing the stop voteCount value',
                is_required: true,
                order: 5,
              },
              {
                description:
                  "Add a Vote button that calls the onVote prop when clicked",
                is_required: true,
                order: 6,
              },
            ],
          },
        },

        // ── L2-T2: Filter Itinerary by Day ───────────────────────
        {
          task_name: "Filter the Itinerary by Day",
          test_type: "client",
          user_story:
            "As a member, I want to filter the itinerary by day so I can focus on a single date when planning.",
          learning_sections: {
            create: [
              {
                title: "Overview\nLifting State and Filtering Lists",
                content:
                  "This section introduces the crash course for lifting state up to a parent component and using it to filter a list of items. It covers controlled components, pure filter functions, and the chip group pattern for day selection.",
                order: 1,
              },
              {
                title: "Lifting State Up",
                content:
                  "When two sibling components need to share the same value, move that value up to their nearest common ancestor. DayFilter reads activeDay to highlight the selected chip. ItineraryFeed reads filteredStops (derived from activeDay). Neither component manages the state — they just receive and display it.",
                order: 2,
              },
              {
                title: "Controlled Components",
                content:
                  "A controlled component has its state managed by a parent via props. For a filter chip group, controlled is correct — the parent needs to know the active day to compute the filtered list.",
                order: 3,
              },
              {
                title: "Pure Filter Functions",
                content:
                  "A pure function always returns the same output for the same input and has no side effects. Because it is pure, it is trivial to unit-test: pass in an array, assert the output. No mocking required.",
                order: 4,
              },
              {
                title: "useMemo for Derived State",
                content:
                  "Instead of storing filteredStops in state, derive it from existing state with useMemo. This is more reliable than keeping a separate filtered array in state — it stays in sync automatically whenever the source data or filter changes. Only recomputes when the dependencies change.",
                order: 5,
              },
              {
                title: "Chip Group Pattern",
                content:
                  "A chip group is a row of pill-shaped buttons where one is active at a time. Generate the day chips dynamically from the trip's startDate and endDate so they always match the trip duration. The 'All' chip always comes first and resets the filter.",
                order: 6,
              },
              {
                title: "Practice Lab: filterByDay",
                content:
                  "Practice writing the pure filter function that drives the day filter feature.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement filterByDay(stops, dayKey): \"all\"→all stops, else filter by stop.dayKey.\n\nExamples: filterByDay(stops,\"all\")→all, filterByDay(stops,\"2026-04-12\")→only April 12.",
                  language: "javascript",
                  starter_code:
                    "export function filterByDay(stops, dayKey) {\n  // TODO: return all stops when dayKey === 'all'\n  // otherwise return stops matching dayKey\n}\n",
                  editable_regions: [
                    {
                      placeholder:
                        "// TODO: return all stops when dayKey === 'all'\n  // otherwise return stops matching dayKey",
                      case_sensitive: false,
                    },
                  ],
                  entry_point: "filterByDay",
                  test_cases: [
                    {
                      input: [
                        [
                          { title: "Senso-ji", dayKey: "2026-04-12" },
                          { title: "Shibuya", dayKey: "2026-04-13" },
                        ],
                        "all",
                      ],
                      expected: [
                        { title: "Senso-ji", dayKey: "2026-04-12" },
                        { title: "Shibuya", dayKey: "2026-04-13" },
                      ],
                      label: "all returns everything",
                    },
                    {
                      input: [
                        [
                          { title: "Senso-ji", dayKey: "2026-04-12" },
                          { title: "Shibuya", dayKey: "2026-04-13" },
                        ],
                        "2026-04-12",
                      ],
                      expected: [{ title: "Senso-ji", dayKey: "2026-04-12" }],
                      label: "filters to specific day",
                    },
                  ],
                
                  hints: [
                    "Check \"all\" first, then filter.",
                    "if (dayKey === \"all\") return stops; return stops.filter(s => s.dayKey === dayKey);",
                    "if (dayKey === \"___\") return stops; return stops.filter(s => s.___ === dayKey);"
                  ],
                },
                order: 7,
              },
              {
                title: "Key Takeaway",
                content:
                  "Lift the active day into the parent, derive filtered results with useMemo, and keep DayFilter as a controlled component. Three rules — three of the most common React state-management mistakes avoided.",
                order: 8,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "The chip row in `client/src/components/trip/DayFilter.tsx` already renders. The only intentional bug is the empty `onClick={() => {}}`, so wire each day chip to `onClick={() => onDayChange(day)}` and the All chip to `onClick={() => onDayChange(\"all\")}`.",
                order: 1,
              },
              {
                description:
                  "Each day chip has to expose the raw day key as its accessible name, for example `2026-04-11`, so leave the label as the key itself rather than reformatting it into a friendlier date string. The All chip label has to contain `all` case-insensitively, which the existing `{day === \"all\" ? \"All\" : day}` label already gives you.",
                order: 2,
              },
              {
                description:
                  "Keep `aria-pressed={activeDay === day}` in place so the selected chip reports itself as pressed.",
                order: 3,
              },
              {
                description:
                  "DayFilter stays a controlled component and must not hold its own `activeDay` state. `TripDetail.tsx` owns that value and passes it down together with the `onDayChange` callback.",
                order: 4,
              },
              {
                description:
                  "Make `filterByDay` in `client/src/utils/helpers.ts` return all stops for `\"all\"` and otherwise match on the stop's day key.",
                order: 5,
              },
              {
                description:
                  "The empty click handler being left in place renders a filter bar that looks finished and does nothing at all.",
                order: 6,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Add an 'All' filter chip button to the DayFilter component",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Add one filter chip button for each day in the trip duration",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Wire up clicking a day chip to call onDayChange with that day's key (e.g., '2026-04-11')",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Wire up clicking the 'All' chip to call onDayChange with 'all'",
                is_required: true,
                order: 4,
              },
              {
                description:
                  'Set aria-pressed="true" on the chip that matches the currently active day',
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
    id: "mern-tw-level-3",
    title: "Backend / MongoDB",
    subtitle: "Fix the Trip Stats aggregation and harden the endpoint.",
    order: 3,
    level_description:
      "Mission Briefing: The product team wants a Trip Stats endpoint that returns the top-voted stops and total spend for a trip. The aggregation pipeline was written in a hurry — it has four bugs that produce wrong or empty results. After fixing the pipeline, hardening the endpoint with query validation, a consistent response envelope, and proper error handling is also needed.",
    xp_reward: 200,
    coin_reward: 100,
    key_takeaways:
      "MongoDB aggregation pipelines process documents through a sequence of stages. The order of stages matters enormously: filter ($match) early to discard documents before expensive operations ($lookup, $group). A misplaced $lookup processes the entire collection before filtering, which is both slow and semantically wrong.\n\nProduction endpoints need three layers of hardening beyond the happy path: input validation that rejects bad parameters before they reach business logic, a consistent response envelope so clients always know what shape to expect, and async error propagation so uncaught exceptions become proper 500 responses instead of process crashes.",
    scenario_id: "mern-tw-scenario-3",
    tasks: {
      create: [
        // ── L3-T1: Trip Stats Aggregation ────────────────────────
        {
          task_name: "Fix the Trip Stats Aggregation",
          test_type: "server",
          user_story:
            "As a trip planner, I want to see the top-voted stops and total spend for a trip so I can prioritize the most popular activities.",
          learning_sections: {
            create: [
              {
                title: "Overview\nMongoDB Aggregation Pipelines",
                content:
                  "This section introduces the crash course for building and debugging MongoDB aggregation pipelines. It covers pipeline stage ordering, $match before $lookup, date math for range filters, $group accumulators, and $sort/$limit for ranked results.",
                order: 1,
              },
              {
                title: "What is an Aggregation Pipeline?",
                content:
                  "An aggregation pipeline transforms documents through a sequence of stages. Each stage receives the output of the previous one. Think of it as a Unix pipe: documents are filtered, joined, grouped, sorted, and projected as they flow through the stages.",
                order: 2,
              },
              {
                title: "$match Before $lookup: Why Order Matters",
                content:
                  "A common performance and correctness bug is running $lookup (a join) before $match (a filter). The wrong order is both slow (processes every document in the DB) and semantically incorrect (joins before the trip filter is applied).",
                order: 3,
              },
              {
                title: "Date Math for Range Filters",
                content:
                  "To filter stops within a trip's date range, compare against the trip's startDate and endDate. A common bug is using `new Date()` (the current time) as the lower bound — which means only stops scheduled in the future match.",
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
                  "Without $sort and $limit, the aggregation returns documents in arbitrary order and could return the entire collection. Always add both when building a ranked list — they prevent unbounded queries and non-deterministic ordering.",
                order: 6,
              },
              {
                title: "Practice Lab: Compute Trip Start Cutoff",
                content:
                  "Practice writing the date computation used to define the trip's start boundary for the $match stage.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Complete getTripStartCutoff(trip) so it returns a Date equal to trip.startDate minus 1 millisecond.",
                  language: "javascript",
                  starter_code:
                    "export function getTripStartCutoff(trip) {\n  // TODO: return a Date 1ms before trip.startDate\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO: return a Date 1ms before trip.startDate",
                      case_sensitive: false,
                    },
                  ],
                  entry_point: "getTripStartCutoff",
                  test_cases: [
                    {
                      input: [{ startDate: new Date("2026-04-10T00:00:00Z") }],
                      expected: "__WITHIN_RANGE__",
                      label: "returns a Date 1ms before startDate",
                    },
                  ],
                hints: [
                  "Break this into smaller steps and think about what each piece of your input becomes in the output.",
                  "Focus on the transformation itself — what operation changes your input value into the form the test expects?",
                  "You are close — look at the examples again. What pattern do you see in how the input maps to the expected output?"
                ],
                },
                order: 7,
              },
              {
                title: "Key Takeaway",
                content:
                  "Always $match before $lookup. Always use the correct date boundaries (trip.startDate, not new Date()). Always reference the correct field names with $ in accumulators. Always $sort and $limit ranked queries.",
                order: 8,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "The pipeline in `getTripStats` in `server/src/controllers/trip.controller.ts` carries four labelled defects, marked `// L3-T1 BUG 1` through `// L3-T1 BUG 4`, each sitting directly above the offending stage. Move the `$match` on `tripId` plus `dayDate` between `trip.startDate` and `trip.endDate` ahead of the `$lookup`, so the join only processes this trip's own stops.",
                order: 1,
              },
              {
                description:
                  "The lower bound of that `$match` is `new Date()`, which is a 'now' cutoff that silently drops every stop already in the past. It has to be `trip.startDate` instead.",
                order: 2,
              },
              {
                description:
                  "The vote total has to be accumulated as `voteCount: { $sum: \"$voteCount\" }` rather than `$size: \"$votes\"`. Then append `{ $sort: { voteCount: -1 } }` and `{ $limit: topN }` after the `$project` stage so the ranking is ordered and bounded.",
                order: 3,
              },
              {
                description:
                  "Keep `_id: 0` in the projection and map `_id` to `stopId`. That is what stops the raw joined `votes` array from leaking into the response, and a `votes` key anywhere in `topStops` is treated as a failure.",
                order: 4,
              },
              {
                description:
                  "The separate `Expense.aggregate()` that sums `totalSpent` is already correct.",
                order: 5,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Call GET /api/trips/:tripId/stats with authentication and verify it responds successfully",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Verify the topStops list is ordered by voteCount descending and the ?topN parameter limits results",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Verify the ?topN parameter correctly caps the number of returned entries",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Verify the raw votes array is not exposed in the topStops response",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "Verify totalSpent equals the sum of all expense amounts for the trip",
                is_required: true,
                order: 5,
              },
              {
                description:
                  "Verify the endpoint requires authentication and returns 401 without a bearer token",
                is_required: true,
                order: 6,
              },
            ],
          },
        },

        // ── L3-T2: Harden the Stats Endpoint ─────────────────────
        {
          task_name: "Harden the Stats Endpoint",
          test_type: "server",
          user_story:
            "As a backend developer, I want the stats endpoint to validate query params, return a consistent response envelope, and propagate errors so that the API is production-ready.",
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
                  "TripWeaver has a shared `validateRequest` middleware that wraps Zod schemas and automatically returns 400 with a helpful error message on failure. This keeps validation logic out of the controller and ensures every invalid request is rejected before reaching business logic.",
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
                    "Implement wrapSuccess(payload) returning {success:true, data:payload}.",
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
                    ],
                },
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
                  "`statsQuerySchema` already exists in `server/src/validators/trip.schema.ts`, with `topN` an optional string transformed to a number and piped through `.int().min(1).max(25)` defaulting to 5, so it only needs wiring.",
                order: 1,
              },
              {
                description:
                  "In `server/src/routes/trip.routes.ts`, insert `validateRequest({ query: statsQuerySchema })` between `requireAuth` and `getTripStats` on the `/:tripId/stats` route.",
                order: 2,
              },
              {
                description:
                  "`validateRequest` in `server/src/middleware/validateRequest.ts` already answers 400 with `{ success: false, error, issues }` on a Zod failure, so `topN=0` (below the minimum), `topN=999` (above the maximum) and `topN=abc` (not an integer) are all rejected before the controller ever runs.",
                order: 3,
              },
              {
                description:
                  "In `getTripStats`, replace `res.send(data)` with `res.status(200).json({ success: true, data })` and type the parameters as `Request` and `Response` instead of `any`.",
                order: 4,
              },
              {
                description:
                  "Wrap the aggregation work in `try/catch` and forward failures with `next(err)`. A bad `tripId` makes Mongoose throw a CastError, and the global `errorHandler` has to turn that into a 400 or a 404.",
                order: 5,
              },
              {
                description:
                  "Once the schema is wired, `req.query.topN` is already a number, so drop the manual `Number(req.query.topN ?? 5)` coercion and let the default of 5 come from the schema in one place.",
                order: 6,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Verify that passing ?topN=0 returns a 400 error",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Verify that passing ?topN=999 returns a 400 error (above maximum)",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Verify that passing ?topN=abc returns a 400 error (not a valid integer)",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Verify a successful request returns 200 with success: true and a data property",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "Verify the response data contains topStops as an array and totalSpent as a number",
                is_required: true,
                order: 5,
              },
              {
                description:
                  "Verify an unknown tripId returns 400 or 404 instead of a 500 error",
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
  // LEVEL 4 — Full-Stack Feature: Vote + Expense Splitting
  // ─────────────────────────────────────────────────────────────
  {
    id: "mern-tw-level-4",
    title: "Full-Stack Feature: Vote + Expense Splitting",
    subtitle: "Implement the vote toggle and expense splitting end-to-end.",
    order: 4,
    level_description:
      "Mission Briefing: WanderMint wants two collaborative features shipped before the next sprint review: a vote system where members can upvote activity suggestions with a count that never drifts, and an expense splitter where one member logs what they paid and the system computes who owes what. Both features require server routes, Mongoose logic, client services, and UI wiring.",
    xp_reward: 250,
    coin_reward: 125,
    key_takeaways:
      "Idempotent operations are safe to retry — a second vote request from the same user should produce the same state as the first without double-counting. Separating the Vote join-table from a voteCount cache enables maintaining both an accurate count and a queryable history of who voted on what.\n\nExpense splitting is a balance computation: paidBy contributed `amount`, every member in `splitBetween` owes `amount / splitBetween.length`. A balance summary (paid minus owed per member) must sum to zero across all members — this invariant is a good sanity check for any implementation.",
    scenario_id: "mern-tw-scenario-3",
    tasks: {
      create: [
        // ── L4-T1: Vote/Unvote on Stops ──────────────────────────
        {
          task_name: "Implement Vote and Unvote on Stops",
          test_type: "both",
          user_story:
            "As a trip member, I want to upvote stop suggestions so we can prioritize what to do, and the count must update instantly.",
          learning_sections: {
            create: [
              {
                title: "Overview\nFull-Stack Feature: Vote System",
                content:
                  "This section introduces the crash course for implementing a full-stack vote (upvote) feature. It covers REST verb semantics, idempotency, join tables, optimistic UI updates, and Mongoose atomic increments.",
                order: 1,
              },
              {
                title: "REST Verb Semantics for Social Actions",
                content:
                  "Vote maps naturally to REST verbs: POST creates a Vote document (idempotent), DELETE removes it. Both are scoped to the authenticated user's identity via the JWT — the userId is never passed in the body.",
                order: 2,
              },
              {
                title: "Idempotency: Safe to Retry",
                content:
                  "An idempotent operation produces the same result no matter how many times it is called with the same input. The first POST creates the Vote doc and increments the counter; a second POST from the same user finds the existing doc and returns success without incrementing again.",
                order: 3,
              },
              {
                title: "Join Table Pattern (Vote Model)",
                content:
                  "Rather than storing a list of userId values inside the Stop document, a separate Vote collection (join table) stores each vote as its own document. This makes queries scannable by index, counts accurate via countDocuments, and avoids document size limit issues.",
                order: 4,
              },
              {
                title: "Atomic Increment with $inc",
                content:
                  "When creating a vote, the counter is incremented atomically using $inc so concurrent requests do not race. Never read-modify-write (fetch, then set) — atomic $inc is the MongoDB-safe way to update counters under concurrent load.",
                order: 5,
              },
              {
                title: "Optimistic UI Updates",
                content:
                  "For a snappy UX, the UI updates immediately before the server confirms the action. If the server request fails, the UI reverts to the previous state. This makes the interface feel instant even on slow connections.",
                order: 6,
              },
              {
                title: "Practice Lab: Next Vote Count",
                content:
                  "Practice the simple counter logic that drives the optimistic UI update.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement nextVoteCount(current, action): \"vote\"→+1, \"unvote\"→-1 but never below 0.",
                  language: "javascript",
                  starter_code:
                    "export function nextVoteCount(current, action) {\n  // TODO: return current + 1 for 'vote', current - 1 for 'unvote' (min 0)\n}\n",
                  editable_regions: [
                    {
                      placeholder:
                        "// TODO: return current + 1 for 'vote', current - 1 for 'unvote' (min 0)",
                      case_sensitive: false,
                    },
                  ],
                  entry_point: "nextVoteCount",
                  test_cases: [
                    {
                      input: [0, "vote"],
                      expected: 1,
                      label: "vote from 0",
                    },
                    {
                      input: [5, "vote"],
                      expected: 6,
                      label: "vote from 5",
                    },
                    {
                      input: [1, "unvote"],
                      expected: 0,
                      label: "unvote to 0",
                    },
                    {
                      input: [0, "unvote"],
                      expected: 0,
                      label: "unvote clamped at 0",
                    },
                  ],
                
                  hints: [
                    "Check action.",
                    "if (action === \"vote\") return current + 1; return Math.max(0, current - 1);",
                    "if (action === \"___\") return current + 1; return Math.___(0, current - 1);"
                  ],
                },
                order: 7,
              },
              {
                title: "Key Takeaway",
                content:
                  "Full-stack social features require consistent state across three layers: the Vote document (source of truth), the voteCount cache (performance), and the UI optimistic state (UX). Keep them in sync with atomic DB operations and careful error handling on the client.",
                order: 8,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "`vote` and `unvote` in `server/src/controllers/stop.controller.ts` currently raise a 501. Voting has to be scoped to the authenticated user, so the id always comes from the token (`req.user!.userId`) and never from the request body.",
                order: 1,
              },
              {
                description:
                  "Look for `Vote.findOne({ stopId, userId })` first. If one already exists, return 200 without touching the counter, otherwise `Vote.create(...)` and then `Stop.findByIdAndUpdate(stopId, { $inc: { voteCount: 1 } })`.",
                order: 2,
              },
              {
                description:
                  "Make `unvote` delete the Vote document and only then run `$inc: { voteCount: -1 }`.",
                order: 3,
              },
              {
                description:
                  "Both routes already sit behind `requireAuth` in `server/src/routes/stop.routes.ts`. Do not add a second auth check inside the controller.",
                order: 4,
              },
              {
                description:
                  "Implement `voteStop` and `unvoteStop` in `client/src/services/stop.service.ts` with the shared `api` axios instance against `POST` and `DELETE /trips/:tripId/stops/:stopId/vote`.",
                order: 5,
              },
              {
                description:
                  "`StopCard` only has to hand the click up through its `onVote` prop. Keep the card presentational and update the displayed `voteCount` in `TripDetail`.",
                order: 6,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Implement POST /api/trips/:tripId/stops/:stopId/vote to vote on a stop and verify it responds successfully",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Verify voting twice from the same user does not double-count (idempotent)",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Verify a vote from a different user increments the voteCount",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Implement DELETE /api/trips/:tripId/stops/:stopId/vote to remove a vote and verify it decrements voteCount",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "Verify removing a vote from a stop with no votes does not make voteCount negative",
                is_required: true,
                order: 5,
              },
              {
                description:
                  "Verify the endpoint requires authentication and returns 401 without a bearer token",
                is_required: true,
                order: 6,
              },
              {
                description:
                  "Wire up the StopCard Vote button to call the onVote prop and update the displayed vote count",
                is_required: true,
                order: 7,
              },
              {
                description:
                  "Ensure StopCard always renders the vote count element even when no vote handler is provided",
                is_required: true,
                order: 8,
              },
              {
                description:
                  "Ensure the Vote button is visible and enabled",
                is_required: true,
                order: 9,
              },
            ],
          },
        },

        // ── L4-T2: Expense Splitting Endpoint ─────────────────────
        {
          task_name: "Implement the Expense Splitting Endpoint",
          test_type: "server",
          user_story:
            "As a trip member, I want to log expenses split between selected members so we can settle balances at the end of the trip.",
          learning_sections: {
            create: [
              {
                title: "Overview\nFull-Stack Feature: Expense Splitting",
                content:
                  "This section introduces the crash course for implementing an expense splitting endpoint. It covers membership validation, per-member share computation, atomic counter updates, and balance summaries.",
                order: 1,
              },
              {
                title: "Validating Trip Membership",
                content:
                  "Before creating an expense, validate that paidBy and every user in splitBetween are members of the trip (either the ownerId or in collaboratorIds). This prevents expenses from referencing users who are not part of the trip.",
                order: 2,
              },
              {
                title: "Computing Per-Member Share",
                content:
                  "Divide the total amount equally among the members in splitBetween, rounding to 2 decimal places using Math.round(amount * 100 / splitCount) / 100. This gives consistent cent-level rounding across all languages.",
                order: 3,
              },
              {
                title: "Atomic Trip Counter Update",
                content:
                  "After creating the Expense document, update Trip.totalSpent atomically using $inc instead of read-modify-write. This prevents counter drift under concurrent expense logging.",
                order: 4,
              },
              {
                title: "Returning a Balance Summary",
                content:
                  "After creating the expense, compute a balance summary for all trip members: net balance = paid − owed. The sum of all net balances must equal 0. Return this as an array of { userId, net } objects.",
                order: 5,
              },
              {
                title: "Idempotency-Key Pattern (Awareness Only)",
                content:
                  "For financial endpoints, production systems use an idempotency key (a unique client-generated UUID sent in a header) to prevent duplicate charges on network retries. The server stores the key and result in a cache. On retry, it returns the cached result without re-processing. TripWeaver does not implement this in Level 4 — it is a real-world pattern worth knowing about.",
                order: 6,
              },
              {
                title: "Practice Lab: Compute Share",
                content:
                  "Practice writing the per-member share computation used in the expense splitting endpoint.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement computeShare(amount, splitCount) returning per-member share rounded to 2 decimals as NUMBER. toFixed returns string — use Math.round.\n\nExamples: computeShare(60,3)→20, computeShare(100,3)→33.33.",
                  language: "javascript",
                  starter_code:
                    "export function computeShare(amount, splitCount) {\n  // TODO: return amount / splitCount rounded to 2 decimal places\n}\n",
                  editable_regions: [
                    {
                      placeholder:
                        "// TODO: return amount / splitCount rounded to 2 decimal places",
                      case_sensitive: false,
                    },
                  ],
                  entry_point: "computeShare",
                  test_cases: [
                    {
                      input: [60, 3],
                      expected: 20,
                      label: "60 split 3 ways",
                    },
                    {
                      input: [100, 3],
                      expected: 33.33,
                      label: "100 split 3 ways (repeating decimal)",
                    },
                    {
                      input: [50, 4],
                      expected: 12.5,
                      label: "50 split 4 ways",
                    },
                    {
                      input: [0, 5],
                      expected: 0,
                      label: "zero amount",
                    },
                  ],
                
                  hints: [
                    "Divide and round with Math.round.",
                    "Think step by step about what operation transforms your input into the output you need. Break it down into smaller sub-problems and solve each one.",
                    "return Math.round((amount / splitCount) * ___) / ___;"
                    ],
                },
                order: 7,
              },
              {
                title: "Key Takeaway",
                content:
                  "Expense splitting has three invariants: only trip members can be in splitBetween, the per-member share rounds to 2 decimal places, and the balance summary sums to zero. Verify all three in tests.",
                order: 8,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "`createExpense` currently answers with a hardcoded `{ ok: true }`. A new expense has to leave the trip's `totalSpent` and the per-member balances consistent, and the payer has to be whoever is actually logged in. The schema stores the payer in `paidById`, so default it to `req.user!.userId` when the body omits it.",
                order: 1,
              },
              {
                description:
                  "Only trip members can be in the split. Build the member set from `[trip.ownerId, ...trip.collaboratorIds]` and answer 400 if any id in `splitBetween` is missing from it.",
                order: 2,
              },
              {
                description:
                  "Add the amount to the trip with `Trip.findByIdAndUpdate(tripId, { $inc: { totalSpent: amount } })` rather than a read-modify-write.",
                order: 3,
              },
              {
                description:
                  "The response is 201 with `{ success: true, data: { ...expense, balances } }`, and the created expense has to be readable on `data` itself with `balances` alongside it rather than one level deeper. The route already runs `validateRequest({ body: createExpenseSchema })` behind `requireAuth`, so the 401 and the body shape are handled.",
                order: 4,
              },
              {
                description:
                  "Each share is `Math.round(amount * 100 / splitBetween.length) / 100`, and the payer's net is the full amount minus their own share, which is what makes the nets sum to zero.",
                order: 5,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Implement POST /api/trips/:tripId/expenses to create an expense and verify it responds successfully with the created expense",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Verify creating an expense increases the trip's totalSpent by the expense amount",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Verify the balance summary in the response has net values that sum to zero",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Verify passing a splitBetween array with a non-member user returns 400",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "Verify the endpoint requires authentication and returns 401 without a bearer token",
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
  // LEVEL 5 — Production Bug Fixes
  // ─────────────────────────────────────────────────────────────
  {
    id: "mern-tw-level-5",
    title: "Production Bug Fixes",
    subtitle: "Fix vote counter drift and trip-timezone-naive day grouping.",
    order: 5,
    level_description:
      "Mission Briefing: Two critical bugs have been reported by WanderMint users. First, stop vote counts are inflating — some stops show more votes than there are voters. Second, travelers planning trips to foreign destinations see stops grouped on the wrong day in the timeline. Both bugs are production-grade issues that require database-level fixes and timezone-aware date handling.",
    xp_reward: 300,
    coin_reward: 150,
    key_takeaways:
      "Database-level unique indexes are the only reliable way to enforce uniqueness under concurrent load. Application-level checks (findOne then create) have a race window — two requests can both find no existing document and both insert. The MongoDB unique index catches the second insert and returns E11000, which the application handles as an idempotent no-op.\n\nDate objects in JavaScript are always UTC instants. Converting a UTC timestamp to a local calendar day requires timezone-aware formatting. For trip planning, the correct timezone source is the trip's destination — not the requesting user's timezone. A Manila user planning a Tokyo trip should see stops grouped by Tokyo local dates, not Manila local dates. Always use trip.destinationTimezone with Intl.DateTimeFormat when grouping trip itinerary items.",
    scenario_id: "mern-tw-scenario-3",
    tasks: {
      create: [
        // ── L5-T1: Fix Vote Counter Drift ────────────────────────
        {
          task_name: "Fix Vote Counter Drift",
          test_type: "server",
          user_story:
            "As a trip member, I want stop vote counts to be accurate so I can trust which suggestions are most popular.",
          learning_sections: {
            create: [
              {
                title: "Overview\nConcurrency Bugs and Unique Indexes",
                content:
                  "This section introduces the crash course for diagnosing and fixing counter drift caused by concurrent duplicate inserts. It covers MongoDB unique indexes, E11000 duplicate-key errors, and the check-then-act race condition.",
                order: 1,
              },
              {
                title: "The Bug: Duplicate Vote Documents",
                content:
                  'Client Report: "Some stops show 8 votes but we can only count 5 distinct users who voted on them."\n\nRoot cause: two concurrent POST /vote requests from the same user both execute Vote.findOne({ userId, stopId }) simultaneously and both find no existing document. They both proceed to insert — so now there are 2 Vote docs for the same pair, and voteCount was incremented twice. This is the classic "check then act" race condition.',
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
                  "Once the unique index is added with syncIndexes(), MongoDB enforces it going forward. Existing duplicate documents from before the fix must be cleaned up by finding all duplicate (userId, stopId) pairs, keeping the oldest doc and deleting the rest, then recalculating voteCount from the clean Vote collection.",
                order: 6,
              },
              {
                title: "Practice Lab: Detect Duplicate Key Error",
                content:
                  "Practice writing the error-type guard used in the vote controller.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement isDuplicateKeyError(err) returning true for MongoDB duplicate-key (code 11000).",
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
  ],
                },
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
                  "One user gets one vote per stop, and the database has to be what guarantees it.",
                order: 1,
              },
              {
                description:
                  "A uniqueness rule over the user and stop pair is the fix, and it has to reach the actual collection rather than sitting only in the model definition.",
                order: 2,
              },
              {
                description:
                  "Counting every request instead of counting new votes inflates `voteCount` on every retry. A rejected duplicate still means the vote is there, so it has to succeed without moving the counter again.",
                order: 3,
              },
              {
                description:
                  "The existing lookup can stay as a fast path, but it is the constraint that makes the write safe. The second insert is rejected by the database, not by your code.",
                order: 4,
              },
              {
                description:
                  "Votes recorded before the fix have to be cleaned up first, keeping the oldest per pair and recomputing each count from what is left, or the constraint cannot be added at all.",
                order: 5,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Add a unique index on the Vote collection covering both userId and stopId",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Verify that concurrent vote requests from the same user create only one Vote document",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Verify that after concurrent same-user votes, the stop's voteCount is 1 (no counter drift)",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Verify that five different users voting on the same stop produce a voteCount of 5",
                is_required: true,
                order: 4,
              },
            ],
          },
        },

        // ── L5-T2: Fix Timezone-Naive Day Grouping ────────────────
        {
          task_name: "Fix Timezone-Naive Itinerary Day Grouping",
          test_type: "server",
          user_story:
            "As a Manila user planning a Tokyo trip, I want stops to be grouped by Tokyo local date (the destination), not by my own timezone or by UTC, so the day-by-day timeline reflects the trip locale.",
          learning_sections: {
            create: [
              {
                title: "Overview\nTimezone-Aware Date Grouping for Trips",
                content:
                  "This section introduces the crash course for fixing timezone-naive date grouping in a trip timeline. It covers UTC vs. local time, IANA timezone identifiers, Intl.DateTimeFormat, and the critical distinction between per-trip timezone and per-user timezone for travel apps.",
                order: 1,
              },
              {
                title: "The Bug: Wrong Day Assignment",
                content:
                  "Client Report: \"I'm planning a Tokyo trip from Manila. A stop I scheduled for midnight in Tokyo shows up on the wrong day in my timeline.\"\n\nRoot cause: the timeline controller uses stop.dayDate.toISOString().slice(0, 10), which always returns the UTC date. For a stop at 15:30 UTC in Tokyo (UTC+9), that timestamp is 00:30 the next day — the UTC date is wrong for the trip's destination.",
                order: 2,
              },
              {
                title: "JavaScript Date is Always UTC",
                content:
                  "new Date() stores a UTC instant. It has no local timezone built in — it is always UTC underneath. Using toISOString() always converts to UTC. Using getDate() uses the server locale (wrong on a UTC server). Intl.DateTimeFormat is the correct approach because it accepts an explicit IANA timezone parameter.",
                order: 3,
              },
              {
                title: "Per-Trip Timezone, Not Per-User Timezone",
                content:
                  "This is the key insight for travel apps: when grouping a trip's itinerary by day, the correct timezone is the trip's DESTINATION — not the traveler's home timezone. A Manila user planning a Tokyo trip should see stops grouped by Tokyo local dates. The Trip document stores `destinationTimezone` (e.g., \"Asia/Tokyo\") for exactly this purpose.",
                order: 4,
              },
              {
                title: "IANA Timezone Identifiers",
                content:
                  "IANA timezones (like \"Asia/Tokyo\", \"Asia/Manila\", \"America/New_York\") encode both the UTC offset and daylight saving time rules. They are more reliable than raw offsets because some regions observe DST. Store the trip's destination timezone as an IANA string in Trip.destinationTimezone.",
                order: 5,
              },
              {
                title: "Intl.DateTimeFormat for Timezone-Aware Date Keys",
                content:
                  "The Web Standard way to get a calendar date in a specific timezone is Intl.DateTimeFormat with en-CA locale, which produces YYYY-MM-DD output. This correctly converts the UTC timestamp to the destination's local calendar day.",
                order: 6,
              },
              {
                title: "Reading the Trip's Destination Timezone",
                content:
                  "The timeline controller loads the Trip document before grouping. Read the timezone from the trip: trip.destinationTimezone. Default to 'UTC' when destinationTimezone is missing so trips without a timezone set are unaffected.",
                order: 7,
              },
              {
                title: "Practice Lab: Local Date Key for Trip",
                content:
                  "Practice writing the timezone-aware date key function used to fix the itinerary grouping.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Complete localDateKeyForTrip(isoString, tripTimezone) that returns a 'YYYY-MM-DD' string in the given IANA timezone.",
                  language: "javascript",
                  starter_code:
                    "export function localDateKeyForTrip(isoString, tripTimezone) {\n  // TODO: use Intl.DateTimeFormat to return 'YYYY-MM-DD' in the given timezone\n  // Example: localDateKeyForTrip('2026-04-12T15:30:00Z', 'Asia/Tokyo') === '2026-04-13'\n}\n",
                  editable_regions: [
                    {
                      placeholder:
                        "// TODO: use Intl.DateTimeFormat to return 'YYYY-MM-DD' in the given timezone\n  // Example: localDateKeyForTrip('2026-04-12T15:30:00Z', 'Asia/Tokyo') === '2026-04-13'",
                      case_sensitive: false,
                    },
                  ],
                  entry_point: "localDateKeyForTrip",
                  test_cases: [
                    {
                      input: ["2026-04-12T15:30:00Z", "Asia/Tokyo"],
                      expected: "2026-04-13",
                      label: "15:30 UTC = 00:30 Tokyo next day",
                    },
                    {
                      input: ["2026-04-12T15:30:00Z", "UTC"],
                      expected: "2026-04-12",
                      label: "UTC baseline unchanged",
                    },
                    {
                      input: ["2026-04-12T13:00:00Z", "Asia/Manila"],
                      expected: "2026-04-12",
                      label: "13:00 UTC = 21:00 Manila same day",
                    },
                  ],
                hints: [
                  "Break this into smaller steps and think about what each piece of your input becomes in the output.",
                  "Focus on the transformation itself — what operation changes your input value into the form the test expects?",
                  "You are close — look at the examples again. What pattern do you see in how the input maps to the expected output?"
                ],
                },
                order: 8,
              },
              {
                title: "Key Takeaway",
                content:
                  "For travel apps, always group itinerary items by the trip's destination timezone — not the user's home timezone and not UTC. Read trip.destinationTimezone, default to 'UTC', and use Intl.DateTimeFormat with the 'en-CA' locale for clean YYYY-MM-DD output.",
                order: 9,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Stops have to be grouped by the calendar day at the destination, not by UTC.",
                order: 1,
              },
              {
                description:
                  "The timezone belongs to the trip rather than to whoever is asking, so a Manila owner and a Tokyo collaborator hitting the same trip have to see the same grouping. Default to `\"UTC\"` when the trip has none.",
                order: 2,
              },
              {
                description:
                  "Each group is emitted as `{ date, stops }`, and the grouping key stays under the property name `date` as a `YYYY-MM-DD` string. A UTC trip with a single stop at `2026-04-12T09:00:00Z` still has to produce the group `2026-04-12`.",
                order: 3,
              },
              {
                description:
                  "For a trip with `destinationTimezone` `Asia/Tokyo`, two stops at 15:30Z on consecutive UTC dates group under `2026-04-13` and `2026-04-14`, and the raw UTC date `2026-04-12` must not appear at all.",
                order: 4,
              },
              {
                description:
                  "A timezone helper for this already exists and formats straight to `YYYY-MM-DD`. Import it rather than hand-rolling offset maths.",
                order: 5,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Call GET /api/trips/:tripId/timeline and verify it returns day groups with date and stops arrays",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Verify stops are grouped by the trip's destination timezone (e.g., Asia/Tokyo), not UTC",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Verify a stop at 2026-04-12T15:30:00Z appears in the Tokyo local date group for 2026-04-13",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Verify the same trip returns identical day groups regardless of the requesting user's timezone",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "Verify a trip with destinationTimezone UTC still groups stops by UTC date correctly",
                is_required: true,
                order: 5,
              },
              {
                description:
                  "Verify the endpoint requires authentication and returns 401 without a bearer token",
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
