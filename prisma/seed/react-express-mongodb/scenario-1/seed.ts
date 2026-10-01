/**
 * Prisma Seed Script — RecipeNest (MERN scenario-1)
 *
 * Seeds the DevSim platform DB with the scenario, its 5 levels and 10 tasks
 * (with learning sections, hints, and acceptance criteria), and the
 * platform-wide achievements catalog.
 *
 * Usage:
 *   pnpm exec tsx seed.ts
 *
 * Make sure `pnpm exec prisma generate` has been run so the Prisma client exists.
 *
 * Task type values:
 *   "client" — only a client-side test exists
 *   "server" — only a server-side test exists
 *   "both"   — both client and server tests exist
 *   "none"   — no automated test (setup/manual tasks)
 */

export const scenarios = [
  {
    id: "mern-rn-scenario-1",
    name: "RecipeNest Social Recipe Platform",
    description:
      "Build and debug a social recipe-sharing platform for Skillet & Stack Studios using React 19, Express, Mongoose, and MongoDB. Progress from environment setup through client-side feed UX, MongoDB aggregation, a full-stack save feature, and two production bug fixes (concurrency + timezones).",
    difficulty: "expert",
  },
];

export const levels = [
  // ────────────────────────────────────────────────────────────────────────
  // LEVEL 1 — Getting Familiar with the Codebase
  // ────────────────────────────────────────────────────────────────────────
  {
    id: "mern-rn-level-1",
    title: "Getting Familiar with the Codebase",
    subtitle:
      "Set up the MERN stack, run MongoDB locally, seed the recipe DB, and ship a tiny brand tweak.",
    order: 1,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: Skillet & Stack Studios has just onboarded a new developer and needs RecipeNest running locally. Set up the MERN (MongoDB, Express, React, Node.js) stack, configure the environment, seed the recipe database, and make a small UI tweak so the brand identity reads correctly.",
    xp_reward: 100,
    coin_reward: 50,
    key_takeaways:
      "Mastering React + Express + Mongoose + MongoDB development environments requires understanding package management (pnpm), environment variables for securing database connections, and how Mongoose models live alongside application code rather than in separate migration files. This setup ensures consistent development across team members and reliable deployments. Every React frontend with an Express backend and a MongoDB database starts with this crucial foundation.\n\nReact component composition lets parent layouts share UI across pages, and small JSX text changes flow through to the rendered DOM via Vite's Hot Module Replacement. Understanding component hierarchy and where text lives in the source tree is essential to making safe, scoped UI changes that don't accidentally regress unrelated screens.",
    scenario_id: "mern-rn-scenario-1",
    tasks: {
      create: [
        // ──────────────────────────────────────────────────────────────────
        // L1-T1 Prepare Development Environment
        // ──────────────────────────────────────────────────────────────────
        {
          task_name: "Prepare Development Environment",
          test_type: "client",
          user_story:
            "As a developer, I want to set up my MERN development environment so I can start working on RecipeNest.",
          learning_sections: {
            create: [
              {
                title: "Overview\nSetting Up a MERN Stack Project",
                content:
                  "This section introduces the crash course for preparing a MERN stack development environment. It provides a high-level view of the setup flow, required tools, and key concepts needed before starting the hands-on tasks.",
                order: 1,
              },
              {
                title: "What is the MERN Stack?",
                content:
                  "MERN stands for MongoDB, Express, React, Node.js — four technologies that work together to build full-stack web apps.\n\nMongoDB — a document database that stores data as JSON-like objects\nExpress — a Node.js framework that handles server and API routes\nReact — the frontend library that builds the user interface\nNode.js — the JavaScript runtime that runs server code",
                order: 2,
              },
              {
                title: "How a MERN App is Structured",
                content:
                  "A typical MERN project has three parts:\nroot/ ← workspace root (shared config, scripts)\n    ├── client/ ← React frontend\n    └── server/ ← Express backend\nEach part has its own package.json, so dependencies must be installed in all three locations.",
                order: 3,
              },
              {
                title: "Package Management 101",
                content:
                  "When a project is started, no dependencies are installed yet. The `pnpm install` command must be run in each folder that has a package.json.\n\nEach folder is its own isolated module. The client uses React libraries, the server uses Express + Mongoose libraries — they do not share the same node_modules.",
                order: 4,
              },
              {
                title: "Change Directory (cd) Basics",
                content:
                  "Terminal commands are executed relative to the current working directory. The cd (change directory) command moves between directories before running installs or scripts.\n\nCommon commands:\ncd client → move from root to the frontend folder\ncd ../server → move from client to server\ncd .. → move up one folder\n\nThe current directory determines which package.json a package manager reads, so commands must be run from the correct location.",
                order: 5,
              },
              {
                title: "Practice Lab: cd Navigation",
                content:
                  "Practice navigating folders with `cd`. Use `ls` to list files/folders and `pwd` to print the working directory path.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "TERMINAL_CD" as const,
                interactive_config: {
                  instructions:
                    "Goal: navigate to /workspace/client, then to /workspace/server, then back to /workspace.",
                  initial_directory: "/workspace",
                  expected_commands: ["cd client", "cd ../server", "cd .."],
                  directory_tree: {
                    "/workspace": ["client", "server", "tests", "README.md"],
                    "/workspace/client": ["src", "package.json"],
                    "/workspace/server": ["src", "package.json"],
                  },
                },
                order: 6,
              },
              {
                title: "Environment Variables",
                content:
                  'Sensitive config (like database connection strings) is stored in `.env` files — never hardcoded in source code.\n\nMONGO_URI="mongodb://localhost:27017/app"\nPORT=4000\nJWT_SECRET="some-long-random-string"\n\nThe `dotenv` package reads these files and makes them available as `process.env.MONGO_URI` in the code. ⚠️ `.env` files are listed in `.gitignore` intentionally — they contain secrets that should never be committed to version control.',
                order: 7,
              },
              {
                title: "MongoDB & Mongoose 101",
                content:
                  "MongoDB stores documents in collections. Mongoose schemas define the shape of documents in code, and collections are created on first insert.\n\nMongoose is a widely-used MongoDB ODM (Object-Document Mapper) for Node.js. Schemas define document shapes and models provide a typed interface for querying and mutating data via the `model()` function.",
                order: 8,
              },
              {
                title: "Key Takeaway",
                content:
                  "Setting up a project isn't just installing packages — it's aligning the local environment (dependencies, env vars, running database) so the app runs the same way for every developer on the team.",
                order: 9,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Work from the repo root and run `pnpm install` three times: once in the root folder, once in `client/`, once in `server/`. Each of those folders has its own `package.json` and its own `node_modules`. The root `package.json` must list `concurrently`, `client/package.json` must list `react` and `axios`, and `server/package.json` must list `express` and `mongoose`.",
                order: 1,
              },
              {
                description:
                  "Create `server/.env` and put `MONGO_URI` in it, for example `MONGO_URI=\"mongodb://localhost:27017/app\"`. Then write a short script in `server/` that loads `dotenv/config`, connects mongoose to `process.env.MONGO_URI`, disconnects again, prints `DB_OK` and exits 0.",
                order: 2,
              },
              {
                description:
                  "Start the API by running `pnpm run dev` in `server/`, then request `GET http://127.0.0.1:5000/api/health`. You should get a 200 and a body containing `ok`.",
                order: 3,
              },
              {
                description:
                  "Finally start the frontend with `pnpm run dev -- --port 3000` in `client/` and request `http://127.0.0.1:3000`. The body must contain `<div id=\"root\">`. That div is the React mount point in `client/index.html`.",
                order: 4,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Root `node_modules` exists and contains `concurrently`",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Client `node_modules` exists and contains `react` and `axios`",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Server `node_modules` exists and contains `express` and `mongoose`",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "A Mongoose connect/disconnect script using `process.env.MONGO_URI` exits 0 and prints `DB_OK`",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "The server starts via `pnpm run dev` and `GET http://127.0.0.1:5000/api/health` returns 200 with a body containing `ok`",
                is_required: true,
                order: 5,
              },
              {
                description:
                  "The client starts via `pnpm run dev -- --port 3000` and `GET http://127.0.0.1:3000` returns a body containing `<div id=\"root\">`",
                is_required: true,
                order: 6,
              },
            ],
          },
        },
        // ──────────────────────────────────────────────────────────────────
        // L1-T2 Update Brand Subtitle
        // ──────────────────────────────────────────────────────────────────
        {
          task_name: "Update Brand Subtitle",
          test_type: "client",
          user_story:
            "As a user, I want to see the RecipeNest brand subtitle in the header so the app reflects its identity.",
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
                  "In most React apps, elements like the header and footer live in layout components — shared wrappers used across multiple pages. This way, changing the header text in one place updates it everywhere.\n\nA typical layout structure:\ncomponents/\n    └── layout/\n          ├── Header.tsx ← top navigation bar\n          ├── Footer.tsx ← bottom bar\n          └── Layout.tsx ← shared page shell",
                order: 3,
              },
              {
                title: "How to Find What to Change",
                content:
                  "To find what to update in the browser, consider: What element is it? (header, footer, sidebar?) Which component renders it? (trace it to a file) Is the text hardcoded or coming from props/state? For a subtitle in the header, the relevant file is inside the layout's header component where a hardcoded string like a brand subtitle lives.",
                order: 4,
              },
              {
                title: "JSX Text Content",
                content:
                  'Changing text in JSX is straightforward — it\'s just like editing HTML:\n// Before\n<p className="brand-subtitle">Old Subtitle</p>\n// After\n<p className="brand-subtitle">Cook. Share. Inspire.</p>',
                order: 5,
              },
              {
                title: "Verifying Changes",
                content:
                  "After editing, save the file and check the browser. Vite supports Hot Module Replacement (HMR) — meaning the page updates instantly without a full refresh when a file is saved.",
                order: 6,
              },
              {
                title: "Practice Lab: Update Heading Text",
                content: "Practice a simple UI change by editing the text inside a heading element.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Update the function to return \"Welcome Back\" instead of \"Hello World\".",
                  language: "tsx",
                  starter_code:
                    'export function getUpdatedHeadingText() {\n  return "Hello World";\n}\n',
                  editable_regions: [
                    { placeholder: "Hello World", case_sensitive: true },
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
                  "Open `client/src/components/layout/Header.tsx`. The brand area is the `<span>Your Tagline Here</span>` rendered under the RecipeNest heading. Replace only that span's text and leave the surrounding `<header>` element exactly as it is.",
                order: 1,
              },
              {
                description:
                  "Keep `Header` a named export. It gets rendered on its own inside a router, so it must not need any provider it does not already receive. Save the file, then confirm the new text shows up inside the `role=\"banner\"` element.",
                order: 2,
              },
              {
                description:
                  "The new text has to be exactly `Cook. Share. Inspire.`, character for character, with capitals, periods and single spaces. The old placeholder `Your Tagline Here` must be gone from the rendered header, and the subtitle has to stay visible inside the `<header>` element.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "The subtitle text is exactly `Cook. Share. Inspire.` (case- and punctuation-sensitive)",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "The placeholder `Your Tagline Here` is no longer present anywhere in the rendered header",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "The subtitle renders inside the page header (the `role=\"banner\"` element)",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "The subtitle is visible (passes the testing-library visibility check)",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "The brand area is exported as a named `Header` component and renders inside a router context",
                is_required: true,
                order: 5,
              },
            ],
          },
        },
      ],
    },
  },

  // ────────────────────────────────────────────────────────────────────────
  // LEVEL 2 — Client-Side Exploration
  // ────────────────────────────────────────────────────────────────────────
  {
    id: "mern-rn-level-2",
    title: "Client-Side Exploration",
    subtitle: "Make recipe cards navigable and wire a live search filter into the feed.",
    order: 2,
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: The product team wants the recipe feed to feel like a real app — clicking a card should navigate to the full recipe, and a search bar should filter results in real time. React Router's <Link> is wired up for client-side navigation, then state is lifted up to connect a controlled search input to the feed.",
    xp_reward: 150,
    coin_reward: 125,
    key_takeaways:
      "Client-side navigation enables a React app to swap page content without a full reload. React Router's <Link> swaps page content without a full reload, and wrapping a whole card in a <Link> gives users a large, accessible click target. The :id route parameter lets a single detail page handle any recipe by reading the URL.\n\nLifting state up and using pure helper functions to derive filtered views is a foundational React pattern. Pure functions are trivially testable, and the parent component owning state means controlled inputs can stay in sync without hidden coupling. useMemo prevents redundant work on each re-render once the data set grows.",
    scenario_id: "mern-rn-scenario-1",
    tasks: {
      create: [
        {
          task_name: "Make Recipe Cards Clickable",
          test_type: "client",
          user_story:
            "As a user, I want to click a recipe card in the feed and be taken to the full recipe page so I can read the details.",
          learning_sections: {
            create: [
              {
                title: "Overview\nClient-Side Navigation with React Router",
                content:
                  "The recipe cards are already rendering title, author, tags, and ratings — but clicking them does nothing. In this task React Router's <Link> component will be wired so each card navigates to its detail page at /recipes/:id.",
                order: 1,
              },
              {
                title: "React Router's <Link> Component",
                content:
                  'React Router\'s <Link to="/recipes/123"> performs client-side navigation — only the relevant components re-render without a full page reload.\n\nimport { Link } from \'react-router-dom\';\n<Link to={`/recipes/${recipe._id}`}>...</Link>',
                order: 2,
              },
              {
                title: "The Route Parameter :id",
                content:
                  "The route /recipes/:id is already registered in App.tsx. The :id segment is a dynamic parameter — React Router reads whatever comes after /recipes/ and exposes it via the useParams() hook inside the detail page:\n\nconst { id } = useParams();\n\nThe Link needs to put the right id value in the to prop.",
                order: 3,
              },
              {
                title: "Wrapping a Card in a Link",
                content:
                  "An entire block element can be wrapped inside a <Link>. Because Link renders as an <a>, the whole card becomes one accessible, keyboard-navigable link:\n\n<Link to={`/recipes/${recipe._id}`}>\n  <article>... card contents ...</article>\n</Link>\n\nThe click target is the whole card, providing a large hit area for navigation.",
                order: 4,
              },
              {
                title: "Accessibility: Link and Button Semantics",
                content:
                  "<Link> (renders <a>) is used when the action is navigation — changing the URL. <button> is used when the action is in-page (toggle, submit, delete). Screen readers announce these differently, so using the correct element matters.",
                order: 5,
              },
              {
                title: "Testing Navigation with MemoryRouter",
                content:
                  "React Router components must be rendered inside a Router context. In tests, the component is wrapped in <MemoryRouter> instead of <BrowserRouter> so there is no real URL bar. Then the test can assert that the link element has the expected href attribute.",
                order: 6,
              },
              {
                title: "Practice Lab: Build a Route Path",
                content: "Practice constructing dynamic route paths.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement getRecipePath(id) returning a route path like \"/recipes/abc123\".\n\nExamples: getRecipePath(\"abc123\")→\"/recipes/abc123\".",
                  language: "javascript",
                  starter_code:
                    "export function getRecipePath(id) {\n  // TODO\n}\n",
                  editable_regions: [{ placeholder: "// TODO", case_sensitive: true }],
                  entry_point: "getRecipePath",
                  test_cases: [
                    {
                      input: ["abc123"],
                      expected: "/recipes/abc123",
                      label: "basic id",
                    },
                    {
                      input: ["69ff39bc45fbc158714ef8a0"],
                      expected: "/recipes/69ff39bc45fbc158714ef8a0",
                      label: "mongo objectid",
                    },
                    {
                      input: ["lemon-tart"],
                      expected: "/recipes/lemon-tart",
                      label: "slug-style id",
                    },
                  ],
                
                  hints: [
                    "Build \"/recipes/\" + id.",
                    "return \"/recipes/\" + id;",
                    "return \"/recipes/\" + ___;"
                  ],
                },
                order: 7,
              },
              {
                title: "Key Takeaway",
                content:
                  "Client-side navigation is what distinguishes a React app experience from a traditional website navigation. <Link> is the building block — it is the standard choice for in-app routes, and wrapping the largest meaningful hit target provides an accessible user experience.",
                order: 8,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "In `RecipeCard`, import `Link` from `react-router-dom` and wrap the whole card in `<Link to={\`/recipes/${recipe._id}\`}>`.",
                order: 1,
              },
              {
                description:
                  "The `<Link>` has to wrap the `<h3>` title too, and the card should end up with exactly one `role=\"link\"` element.",
                order: 2,
              },
              {
                description:
                  "If a `useHref outside Router` error turns up, make sure `main.tsx` already provides a `<BrowserRouter>`.",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "The card contains exactly one link (`role=\"link\"`) with `href` equal to `/recipes/<recipe._id>`",
                is_required: true,
                order: 1,
              },
              {
                description: "The link wraps the card title (`<h3>`) so the whole card is the click target",
                is_required: true,
                order: 2,
              },
              {
                description: "RecipeCard still renders the title in `<h3>`, author `@handle`, cover `<img alt={title}>`, tag chips, avg rating, and saved count",
                is_required: true,
                order: 3,
              },
              {
                description: "Clicking the card in the browser navigates to `/recipes/:id` without a full page reload",
                is_required: true,
                order: 4,
              },
            ],
          },
        },
        {
          task_name: "Wire Live Search Filter",
          test_type: "client",
          user_story:
            "As a user, I want to type in the search bar and see the recipe feed filter in real time so I can find recipes by title or tag.",
          learning_sections: {
            create: [
              {
                title: "Overview\nLifting State and Pure Filters",
                content:
                  "This section introduces the crash course for connecting a search input to a list. State is lifted up to a parent feed component and a pure helper is used to derive a filtered view.",
                order: 1,
              },
              {
                title: "Lifting State Up",
                content:
                  "When two siblings need to share state, the state is moved into their nearest common ancestor and passed down as props. The parent component owns the state, child components display it, and the rendered list is filtered through it.",
                order: 2,
              },
              {
                title: "Controlled Inputs",
                content:
                  "A controlled <input> reads its value from React state and writes back via onChange. That makes the parent the single source of truth for the current input value.",
                order: 3,
              },
              {
                title: "Pure Filter Functions",
                content:
                  "A pure function depends only on its inputs and has no side effects. Filter functions written as pure functions are trivially testable in isolation and easy to memoize.",
                order: 4,
              },
              {
                title: "useMemo for Derived Data",
                content:
                  "If filtering is expensive, `useMemo` ensures the derived data is recomputed only when its dependencies change.",
                order: 5,
              },
              {
                title: "Empty States",
                content:
                  'When the filter returns nothing, an empty-state element should be rendered. Tests look for `data-testid="empty-state"`. A good empty state explains why and suggests a next action: "No recipes match the search. Try a different keyword."',
                order: 6,
              },
              {
                title: "Practice Lab: filterByPrefix",
                content: "Practice writing a small pure filter function.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement filterByPrefix(prefix, items) returning items starting with prefix (case-insensitive). Empty prefix returns all.\n\nExamples: filterByPrefix(\"AP\",[\"apple\",\"apricot\"])→[\"apple\",\"apricot\"].",
                  language: "javascript",
                  starter_code:
                    "export function filterByPrefix(prefix, items) {\n  // TODO\n}\n",
                  editable_regions: [{ placeholder: "// TODO", case_sensitive: true }],
                  entry_point: "filterByPrefix",
                  test_cases: [
                    {
                      input: ["", ["apple", "banana", "cherry"]],
                      expected: ["apple", "banana", "cherry"],
                      label: "empty prefix returns all",
                    },
                    {
                      input: ["AP", ["apple", "banana", "apricot"]],
                      expected: ["apple", "apricot"],
                      label: "case-insensitive match",
                    },
                    {
                      input: ["zz", ["apple", "banana"]],
                      expected: [],
                      label: "no match",
                    },
                    {
                      input: ["ban", ["apple", "Banana", "Banoffee"]],
                      expected: ["Banana", "Banoffee"],
                      label: "exact prefix wins",
                    },
                  ],
                
                  hints: [
                    "Use .filter() with .toLowerCase(). Handle empty prefix.",
                    "Walk through the array and build a new one keeping only the items that pass your check. What method lets you test each item against a condition?",
                    "return items.filter(item => item.___().startsWith(prefix.___()));"
                    ],
                },
                order: 7,
              },
              {
                title: "Key Takeaway",
                content:
                  "Lift state up, derive rendered views with a pure function, and treat the empty case as a first-class UX concern. Done well, this pattern scales from feeds to dashboards to admin tables.",
                order: 8,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Make `filterRecipes` a pure function that returns a new array and lower-cases both sides before matching, so a query for `PASTA` still finds a recipe tagged `pasta`.",
                order: 1,
              },
              {
                description:
                  "Give `SearchBar` `value` and `onChange` props so the parent feed component owns the query state and the input stays controlled.",
                order: 2,
              },
              {
                description:
                  "Wrap the filtered list in `useMemo`.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "`filterRecipes('', recipes)` returns the full list unchanged in length",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "`filterRecipes('PASTA', recipes)` returns recipes whose title or tag matches case-insensitively",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "`filterRecipes('DESSERT', recipes)` returns only recipes whose tags match case-insensitively",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "`filterRecipes('xyzzz', recipes)` returns an empty array when nothing matches",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "`filterRecipes` returns a NEW array — it does not mutate the input list",
                is_required: true,
                order: 5,
              },
            ],
          },
        },
      ],
    },
  },

  // ────────────────────────────────────────────────────────────────────────
  // LEVEL 3 — Backend & MongoDB
  // ────────────────────────────────────────────────────────────────────────
  {
    id: "mern-rn-level-3",
    title: "Backend & MongoDB",
    subtitle:
      "Fix a broken Mongoose aggregation for trending recipes and expose it as a clean endpoint.",
    order: 3,
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: The home feed needs a trending section, and the existing /trending endpoint is shipping wrong data. Investigate the aggregation pipeline, fix the stages, and wire up a properly-validated, properly-typed endpoint that the client can rely on.",
    xp_reward: 200,
    coin_reward: 200,
    key_takeaways:
      "Mongoose aggregation pipelines are powerful but stage-order-sensitive. $match should run before $lookup so the database can use indexes and avoid hydrating unnecessary documents. After a $lookup, the joined array doesn't automatically expose a count — $addFields with $size makes it sortable. Always close a pipeline with $limit and $project so responses don't balloon.\n\nA good Express endpoint is more than just a function — it's a typed controller, a validated input contract, a consistent response shape, and an error-handling chain. Reusable middleware like `validateRequest(zodSchema)` and a single error handler keep route code small and predictable.",
    scenario_id: "mern-rn-scenario-1",
    tasks: {
      create: [
        {
          task_name: "Fix Trending Recipes Aggregation",
          test_type: "server",
          user_story:
            "As a backend developer, I want the trending recipes pipeline to return the correct top-N recipes from the past 7 days so the home feed promotes recent, popular recipes.",
          learning_sections: {
            create: [
              {
                title: "Overview\nDebugging a Mongoose Aggregation Pipeline",
                content:
                  "This section introduces the crash course for debugging an aggregation pipeline. Topics covered include how stage order, joined array shapes, and missing terminal stages can each silently break a query.",
                order: 1,
              },
              {
                title: "Why Aggregation Pipelines",
                content:
                  "Aggregation pipelines enable joining collections, computing fields, grouping, sorting, and limiting — all server-side. They are how trending feeds, leaderboards, and analytics queries are expressed in MongoDB.",
                order: 2,
              },
              {
                title: "$match Placement Matters",
                content:
                  "$match early lets MongoDB use indexes and prune the document set before more expensive stages. Running $match AFTER $lookup means every document gets joined first, then most are thrown away.\n\nGood: { $match }, { $lookup }, ...\nBad: { $lookup }, { $match }, ...",
                order: 3,
              },
              {
                title: "$lookup Basics",
                content:
                  "$lookup performs a left outer join from one collection into another. Its result is an ARRAY field (named via `as`):\n\n{ $lookup: { from: 'saves', localField: '_id', foreignField: 'recipeId', as: 'saves' } }\n\nAfter this stage, every recipe document has a `saves: [...]` array of matched save docs.",
                order: 4,
              },
              {
                title: "$addFields + $size",
                content:
                  "To sort by a count of joined items, a scalar is needed — $addFields with $size computes it:\n\n{ $addFields: { savedCount: { $size: '$saves' } } }\n\nNow `savedCount` is a number available for sorting.",
                order: 5,
              },
              {
                title: "$sort with Multiple Keys",
                content:
                  "Sorting by two keys breaks ties deterministically:\n\n{ $sort: { savedCount: -1, createdAt: -1 } }\n\nThis means: highest savedCount first, and on a tie, newest createdAt first.",
                order: 6,
              },
              {
                title: "$limit and $project",
                content:
                  "Always close a pipeline with $limit (cap the result size) and $project (shape the response, dropping heavy fields):\n\n{ $limit: 10 }\n{ $project: { saves: 0 } }",
                order: 7,
              },
              {
                title: "Reproducing the Bug Locally",
                content:
                  "mongodb-memory-server starts an in-process MongoDB just for tests. Combined with vitest + supertest, specific data shapes can be seeded to reproduce a bug deterministically — without depending on production data.",
                order: 8,
              },
              {
                title: "Practice Lab: buildTrendingPipeline",
                content: "Practice composing the correct pipeline as data.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Return the pipeline array: $match createdAt > now-7d, $lookup saves, $addFields savedCount via $size, $sort savedCount desc and createdAt desc, $limit 10, $project drop saves.",
                  language: "javascript",
                  starter_code:
                    "export function buildTrendingPipeline(now) {\n  // TODO — return an array of pipeline stages\n  return [];\n}\n",
                  editable_regions: [{ placeholder: "// TODO", case_sensitive: true }],
                  entry_point: "buildTrendingPipeline",
                  test_cases: [
                    {
                      input: [new Date("2026-05-05T00:00:00.000Z")],
                      expected: [
                        { $match: { createdAt: { $gt: new Date("2026-04-28T00:00:00.000Z") } } },
                        {
                          $lookup: {
                            from: "saves",
                            localField: "_id",
                            foreignField: "recipeId",
                            as: "saves",
                          },
                        },
                        { $addFields: { savedCount: { $size: "$saves" } } },
                        { $sort: { savedCount: -1, createdAt: -1 } },
                        { $limit: 10 },
                        { $project: { saves: 0 } },
                      ],
                      label: "canonical 6-stage pipeline",
                    },
                  ],
                hints: [
                  "Break this into smaller steps and think about what each piece of your input becomes in the output.",
                  "Focus on the transformation itself — what operation changes your input value into the form the test expects?",
                  "You are close — look at the examples again. What pattern do you see in how the input maps to the expected output?"
                ],
                },
                order: 9,
              },
              {
                title: "Key Takeaway",
                content:
                  "Pipeline correctness depends on stage order. Match → join → derive → sort → limit → project. Treat each stage as a contract over the next.",
                order: 10,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "The trending pipeline needs a `$match` on `createdAt` for the last 7 days before the `$lookup` into `saves`.",
                order: 1,
              },
              {
                description:
                  "A `$lookup` leaves an array behind, so derive a numeric `savedCount` from it before sorting.",
                order: 2,
              },
              {
                description:
                  "Close the pipeline with a `$limit` of 10 and a `$project` that drops the joined `saves` array, so documents come back ordered by `savedCount` and then `createdAt`, newest first, without the heavy field.",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description: "The aggregation returns at most 10 documents",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Returned documents are sorted by descending savedCount, breaking ties by newer createdAt",
                is_required: true,
                order: 2,
              },
              {
                description: "Recipes older than 7 days are excluded",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Each returned document excludes the heavy `saves` array",
                is_required: true,
                order: 4,
              },
            ],
          },
        },
        {
          task_name: "Expose Trending Endpoint",
          test_type: "server",
          user_story:
            "As a backend developer, I want a properly wired GET /api/recipes/trending endpoint with input validation so the client can consume trending recipes safely.",
          learning_sections: {
            create: [
              {
                title: "Overview\nFrom Pipeline to HTTP API",
                content:
                  "This section introduces the crash course for turning a working aggregation into a stable HTTP endpoint. The contract matters as much as the data.",
                order: 1,
              },
              {
                title: "Express Controller Typings",
                content:
                  "Use `(req: Request, res: Response, next: NextFunction)` so editor types catch common mistakes. Wrap the body in `try/catch` and call `next(err)` so errors flow into the central error handler instead of crashing the process.",
                order: 2,
              },
              {
                title: "Zod Schemas for Query Strings",
                content:
                  "Query strings always arrive as strings — use Zod's `z.coerce.number()` to convert and validate at the same time:\n\nz.object({ limit: z.coerce.number().int().min(1).max(50).default(10) })",
                order: 3,
              },
              {
                title: "Reusable validateRequest Middleware",
                content:
                  "A single `validateRequest({ query: ..., body: ..., params: ... })` middleware keeps route code clean. On success, it parses + replaces the request fields. On failure, it returns 400 with a structured error.",
                order: 4,
              },
              {
                title: "Standard Response Shape",
                content:
                  "A consistent response shape across all endpoints removes a class of bugs from clients:\n\n{ success: true, data: ... }\n{ success: false, error: '...', issues?: [...] }",
                order: 5,
              },
              {
                title: "Error-Handling Middleware",
                content:
                  "Express's error handler signature is `(err, req, res, next)`. Mount it LAST so any controller can `next(err)` and have the response shape and status applied uniformly.",
                order: 6,
              },
              {
                title: "Practice Lab: validateLimit",
                content: "Practice writing a small input validator that returns a discriminated result.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement validateLimit(value) returning {ok:true,value:number} for integers in [1,50], or {ok:false,error:string}. Input is a STRING.\n\nExamples: validateLimit(\"3\")→{ok:true,value:3}, validateLimit(\"0\")→{ok:false,error:\"out of range\"}.",
                  language: "javascript",
                  starter_code:
                    "export function validateLimit(value) {\n  // TODO\n}\n",
                  editable_regions: [{ placeholder: "// TODO", case_sensitive: true }],
                  entry_point: "validateLimit",
                  test_cases: [
                    { input: ["3"], expected: { ok: true, value: 3 }, label: "valid integer" },
                    { input: ["0"], expected: { ok: false, error: "out of range" }, label: "below range" },
                    { input: ["51"], expected: { ok: false, error: "out of range" }, label: "above range" },
                    { input: ["abc"], expected: { ok: false, error: "not a number" }, label: "non-numeric" },
                    { input: ["50"], expected: { ok: true, value: 50 }, label: "boundary upper" },
                  ],
                
                  hints: [
                    "Parse string, check NaN, check range.",
                    "const num = parseInt(value); if (isNaN(num)) return {ok:false,error:\"not a number\"}; if (num<1||num>50) return {ok:false,error:\"out of range\"}; return {ok:true,value:num};",
                    "const num = parseInt(value); if (___) return {ok:false,error:\"not a number\"}; if (num<___||num>___) return {ok:false,error:\"out of range\"}; return {ok:true,value:num};"
                  ],
                },
                order: 7,
              },
              {
                title: "Key Takeaway",
                content:
                  "An endpoint is a triplet — types, validation, response shape. Reusable middleware encodes those decisions once and applies them everywhere.",
                order: 8,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Wire `validateRequest(zodSchema)` onto `GET /api/recipes/trending` with a query schema that coerces `limit` to an integer between 1 and 50, so `?limit=999`, `?limit=0` and `?limit=abc` are all turned away with 400.",
                order: 1,
              },
              {
                description:
                  "Type the controller handler as `(req: Request, res: Response, next: NextFunction)` and wrap the body in `try/catch` that calls `next(err)`.",
                order: 2,
              },
              {
                description:
                  "Answer with `res.status(200).json({ success: true, data: [...] })`.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "GET /api/recipes/trending returns 200 with `res.body.success === true` and `res.body.data` an array",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "GET /api/recipes/trending?limit=3 returns 200 with at most 3 documents in `data`",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "GET /api/recipes/trending?limit=999 returns 400 with `res.body.success === false` (validation error)",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "GET /api/recipes/trending?limit=0 returns 400 (out-of-range rejected)",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "GET /api/recipes/trending?limit=abc returns 400 (non-numeric rejected)",
                is_required: true,
                order: 5,
              },
            ],
          },
        },
      ],
    },
  },

  // ────────────────────────────────────────────────────────────────────────
  // LEVEL 4 — Full-Stack Feature: Save Recipes
  // ────────────────────────────────────────────────────────────────────────
  {
    id: "mern-rn-level-4",
    title: "Full-Stack Feature: Save Recipes",
    subtitle:
      "Implement Save Recipe end-to-end, then build the Saved Recipes page.",
    order: 4,
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: Users want to bookmark recipes they like. The full Save feature is implemented end-to-end — model, idempotent endpoint, optimistic UI button — culminating in a Saved Recipes page where users can browse and unsave their favorites.",
    xp_reward: 300,
    coin_reward: 300,
    key_takeaways:
      "Idempotent endpoints make clients safe to retry. Mongoose's `findOneAndUpdate` with `$setOnInsert` and `upsert: true` distinguishes a first-save from a duplicate save in a single round-trip. Returning a clear, predictable response shape means the client can update its UI without guesswork.\n\nGood UX over a slow network is built on two ideas: optimistic updates (toggle the button immediately, revert on error) and clamping (numeric counters never go below zero). Both make the app feel snappy and resilient.",
    scenario_id: "mern-rn-scenario-1",
    tasks: {
      create: [
        {
          task_name: "Save Recipe Feature",
          test_type: "both",
          user_story:
            "As a logged-in user, I want to save a recipe to my favorites so I can find it again later.",
          learning_sections: {
            create: [
              {
                title: "Overview\nFull-Stack Save Feature",
                content:
                  "This section introduces the crash course for shipping a save feature end-to-end. The model, controller, route, service, and UI button are all involved.",
                order: 1,
              },
              {
                title: "Mongoose Upserts (`findOneAndUpdate`)",
                content:
                  "Use `findOneAndUpdate({...}, {...}, { upsert: true, new: true })` to insert-or-update in a single call. Combined with `rawResult: true`, the result indicates whether a new document was created or an existing one was matched.",
                order: 2,
              },
              {
                title: "$setOnInsert and $set",
                content:
                  "$setOnInsert applies only when an upsert creates a new document. $set always applies. For a save record $setOnInsert is the right choice so re-saves don't trample the original `savedAt`.",
                order: 3,
              },
              {
                title: "Idempotent Endpoints",
                content:
                  "An idempotent POST returns the same logical state regardless of how many times it's called. For Save: the first call creates the Save doc and increments savedCount; subsequent calls are no-ops. Idempotency makes retries safe.",
                order: 4,
              },
              {
                title: "Optimistic UI",
                content:
                  "Toggle the UI immediately when the user clicks, then send the request. If it fails, revert the UI and show an error. The user feels instant feedback.",
                order: 5,
              },
              {
                title: "Authenticated Routes",
                content:
                  "Mount the `requireAuth` middleware on protected routes. It reads the Authorization: Bearer header, verifies the JWT, and attaches `req.user` so controllers know who's calling.",
                order: 6,
              },
              {
                title: "Service-Layer Encapsulation",
                content:
                  "API calls are not made directly from components — each endpoint is wrapped in a typed service function. That keeps component code readable and makes a future API rename a one-line change.",
                order: 7,
              },
              {
                title: "curl/Postman Walkthrough",
                content:
                  "Test the endpoint independent of the UI:\n\ncurl -X POST http://localhost:4000/api/recipes/<id>/save \\\n  -H 'Authorization: Bearer <token>'\n\nThe second call should return the same logical 'saved' state without inflating savedCount.",
                order: 8,
              },
              {
                title: "Practice Lab: buildUpsertFilter",
                content: "Practice writing the small filter object passed to findOneAndUpdate.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement buildUpsertFilter(userId, recipeId) returning {userId, recipeId}.\n\nExamples: buildUpsertFilter(\"u_alice\",\"r_lemon\")→{userId:\"u_alice\",recipeId:\"r_lemon\"}.",
                  language: "javascript",
                  starter_code:
                    "export function buildUpsertFilter(userId, recipeId) {\n  // TODO\n}\n",
                  editable_regions: [{ placeholder: "// TODO", case_sensitive: true }],
                  entry_point: "buildUpsertFilter",
                  test_cases: [
                    {
                      input: ["u_alice", "r_lemon"],
                      expected: { userId: "u_alice", recipeId: "r_lemon" },
                      label: "string ids",
                    },
                    {
                      input: ["u_bob", "r_pesto"],
                      expected: { userId: "u_bob", recipeId: "r_pesto" },
                      label: "different ids",
                    },
                    {
                      input: ["", ""],
                      expected: { userId: "", recipeId: "" },
                      label: "empty strings still get keys",
                    },
                  ],
                
                  hints: [
    "Return object literal with two keys.",
    "Construct a value with a specific shape. Think about what keys the output needs and what values go with them.",
    "return { ___, ___ };"
  ],
                },
                order: 9,
              },
              {
                title: "Key Takeaway",
                content:
                  "An idempotent endpoint plus an optimistic UI creates a feature that feels instant and survives network flakes.",
                order: 10,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Saving has to be idempotent on the server. One insert-or-update call does that.",
                order: 1,
              },
              {
                description:
                  "Only bump `recipe.savedCount` when a Save document was really created. The raw result tells you which of the two happened.",
                order: 2,
              },
              {
                description:
                  "The client toggle is optimistic: flip it immediately, send the request, and revert the button if the call fails.",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "First save: `POST /api/recipes/:id/save` returns a success status (200 or 201) with `res.body.success === true` and `recipe.savedCount` becomes 1",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "A duplicate save by the same user returns a success status, leaves `recipe.savedCount` at 1, and leaves at least one Save document for that (userId, recipeId)",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "A save by a DIFFERENT user increments `recipe.savedCount` by exactly 1 (so two users → savedCount === 2)",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "An unauthenticated `POST /api/recipes/:id/save` returns 401",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "A save for a nonexistent recipe id returns a client error status between 400 and 499",
                is_required: true,
                order: 5,
              },
              {
                description:
                  "`SaveButton` is exported as a function component from `client/src/components/recipe/SaveButton.tsx` and renders a `<button>` with an `aria-label`",
                is_required: true,
                order: 6,
              },
              {
                description:
                  "Clicking `SaveButton` toggles its `aria-pressed` attribute (the value changes, i.e. it is not static)",
                is_required: true,
                order: 7,
              },
            ],
          },
        },
        {
          task_name: "Saved Recipes Page",
          test_type: "both",
          user_story:
            "As a logged-in user, I want to see all recipes I have saved and remove ones I no longer want so I can manage my favorites.",
          learning_sections: {
            create: [
              {
                title: "Overview\nListing and Removing Saved Items",
                content:
                  "This section introduces the crash course for completing the Save feature. The listing endpoint, the unsave endpoint, and a page that wires them together with optimistic removal are all covered.",
                order: 1,
              },
              {
                title: "populate and $lookup",
                content:
                  "Mongoose's `populate` is a convenience helper that runs follow-up queries to attach referenced docs. $lookup runs a single aggregation stage. Both produce the same observable shape.",
                order: 2,
              },
              {
                title: "Sorting & Pagination",
                content:
                  "Sort by `savedAt: -1` so newest first. For pagination, cursor-based (return the last seen savedAt and ask for items older than it) is preferred over offset-based once the dataset grows.",
                order: 3,
              },
              {
                title: "Clamping Numeric Fields",
                content:
                  "When a counter is decremented, it should never go below zero:\n\nUpdate with: { $inc: { savedCount: -1 } }\nGuard with:  filter: { savedCount: { $gt: 0 } }\n\nOr, in code, clamp(value, 0).",
                order: 4,
              },
              {
                title: "Empty UI States",
                content:
                  'An empty list deserves a real empty state with a `data-testid="empty-state"` hook. Tell users why the list is empty and what to do next.',
                order: 5,
              },
              {
                title: "DELETE Semantics",
                content:
                  "Idempotent DELETE: deleting something that doesn't exist is a 200, not an error. The server's job is to make state match the request, not to complain about prior state.",
                order: 6,
              },
              {
                title: "Optimistic Removal",
                content:
                  "Remove the card from the UI immediately on click. If the API call fails, restore it. This trades a tiny bit of consistency for a much snappier feel.",
                order: 7,
              },
              {
                title: "Practice Lab: clamp",
                content: "Practice writing the small clamp helper.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions: "Implement clamp(value, min) returning the larger of value and min. Use Math.max.\n\nExamples: clamp(5,0)→5, clamp(-3,0)→0.",
                  language: "javascript",
                  starter_code:
                    "export function clamp(value, min) {\n  // TODO\n}\n",
                  editable_regions: [{ placeholder: "// TODO", case_sensitive: true }],
                  entry_point: "clamp",
                  test_cases: [
                    { input: [5, 0], expected: 5, label: "above min" },
                    { input: [0, 0], expected: 0, label: "equal min" },
                    { input: [-3, 0], expected: 0, label: "below min" },
                    { input: [10, 5], expected: 10, label: "non-zero min" },
                  ],
                
                  hints: [
    "Use Math.max.",
    "JavaScript has built-in functions for common mathematical operations. Think about which one picks the larger of two numbers, or rounds to the nearest integer.",
    "return Math.max(___, ___);"
  ],
                },
                order: 8,
              },
              {
                title: "Key Takeaway",
                content:
                  "Listing endpoints earn user trust through correctness (only the user's data, sorted correctly) and resilience (empty states, clamped counters, idempotent deletes).",
                order: 9,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Unsave must never push `recipe.savedCount` below zero, so clamp the decrement at 0 with an atomic update that only applies when the count is currently above 0.",
                order: 1,
              },
              {
                description:
                  "`getSaved` can bring the recipes back however you like, populating the reference or using a `$lookup`. The only hard requirement is that the list holds exactly this user's saves, newest first.",
                order: 2,
              },
              {
                description:
                  "Ordering matters: sort by `savedAt` descending and render a real empty state carrying `data-testid=\"empty-state\"` when the user has saved nothing.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "GET /api/recipes/saved returns 200 with `res.body.data` an array containing exactly the user's saved recipes",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "The saved list is sorted by `savedAt` descending — the recipe saved last appears first in `res.body.data`",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "DELETE /api/recipes/:id/save returns 200, removes the Save document, and decrements `recipe.savedCount` by 1",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "`recipe.savedCount` never goes below 0 — extra unsaves leave it at `>= 0`",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "An unauthenticated `GET /api/recipes/saved` returns 401",
                is_required: true,
                order: 5,
              },
              {
                description:
                  "`SavedRecipesPage` (exported from `client/src/pages/SavedRecipes.tsx`) renders an element with `data-testid=\"empty-state\"` when `getSaved` resolves to `[]`",
                is_required: true,
                order: 6,
              },
              {
                description:
                  "`SavedRecipesPage` renders exactly one card per saved recipe — the title of every recipe returned by `getSaved` appears in the document",
                is_required: true,
                order: 7,
              },
            ],
          },
        },
      ],
    },
  },

  // ────────────────────────────────────────────────────────────────────────
  // LEVEL 5 — Production Bug-Fixing
  // ────────────────────────────────────────────────────────────────────────
  {
    id: "mern-rn-level-5",
    title: "The Production Struggle",
    subtitle:
      "Real client-reported bugs in production. Reproduce, fix, and write a regression test for each.",
    order: 5,
    deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: Congratulations — RecipeNest is live. Two production issues have been reported by users: inflated save counts and confusing 'posted X days ago' labels. The mission is to investigate each, identify the root cause, deliver a fix backed by a regression test, and write a short postmortem.",
    xp_reward: 400,
    coin_reward: 400,
    key_takeaways:
      "Concurrent writes are the most common source of subtle production bugs in Node.js + MongoDB apps. Two key tools tame them: database-level uniqueness (compound indexes) for hard invariants, and atomic operators ($inc, $setOnInsert) for counters. Read-modify-write loops on shared documents are a code smell — an atomic operator should be reached for first.\n\nTime is the second-most common source of production bugs. Always compute elapsed time from raw timestamps, never from formatted date strings. Use Math.floor on elapsed days so labels move forward only as full 24-hour windows pass. Time-dependent helpers can accept an explicit `now` parameter so tests can pin them to a deterministic instant.",
    scenario_id: "mern-rn-scenario-1",
    tasks: {
      create: [
        {
          task_name: "Fix Duplicate Saves & Counter Drift",
          test_type: "server",
          user_story:
            "As a developer, I want savedCount to always equal the unique number of users who saved a recipe so the UI never shows inflated numbers.",
          learning_sections: {
            create: [
              {
                title: "Overview\nProduction Concurrency & Invariants",
                content:
                  "This section introduces the crash course for diagnosing and fixing a duplicate-write bug. Topics covered include how compound unique indexes and atomic operators prevent a whole class of concurrency issues.",
                order: 1,
              },
              {
                title: "The Production Bug",
                content:
                  "Users report that popular recipes show savedCount values 2–3× higher than the actual number of unique savers. The Saved Recipes page also shows the same recipe multiple times for some users. Both symptoms point to the same root cause.",
                order: 2,
              },
              {
                title: "Read-Modify-Write Race Conditions",
                content:
                  "When two requests arrive concurrently and both run:\n\n  recipe = await Recipe.findById(id)\n  recipe.savedCount += 1\n  await recipe.save()\n\n…they both read the same starting value. One write wins, the other is lost. The counter drifts upward by less than the number of saves.",
                order: 3,
              },
              {
                title: "Atomic Operators ($inc, $setOnInsert)",
                content:
                  "MongoDB's atomic update operators apply server-side, in a single document operation:\n\n  Recipe.updateOne({ _id }, { $inc: { savedCount: 1 } })\n\nNo read-modify-write — no race. Use $inc for counters, $setOnInsert for upsert-only fields.",
                order: 4,
              },
              {
                title: "Database-Level Uniqueness",
                content:
                  "Application code is fallible. A compound unique index on the Save collection makes duplicates impossible at the DB level:\n\n  SaveSchema.index({ userId: 1, recipeId: 1 }, { unique: true });\n\nWith the index, a duplicate insert throws E11000 — the upsert path becomes the only safe write.",
                order: 5,
              },
              {
                title: "Idempotency Keys",
                content:
                  "Some systems use an idempotency key (a UUID per logical operation) so retries don't double-charge. For a save, the natural idempotency key is just (userId, recipeId) — that's exactly what the compound index encodes.",
                order: 6,
              },
              {
                title: "Writing a Regression Test for a Race",
                content:
                  "Use `Promise.all(Array.from({length: 100}, () => POST /save))` to fire 100 parallel requests. Assert that exactly one Save doc exists and savedCount === 1. Without the fix, this test will reliably fail.",
                order: 7,
              },
              {
                title: "Backfill Scripts for Drifted Counters",
                content:
                  "Once the live bug is fixed, write a one-off script to repair existing data:\n\n  for each recipe:\n    savedCount = await Save.countDocuments({ recipeId })\n    await Recipe.updateOne({ _id: recipe._id }, { $set: { savedCount } })\n\nKeep the script in `scripts/`, run it once in production, and document it in the postmortem.",
                order: 8,
              },
              {
                title: "Practice Lab: Atomic Counter",
                content: "Convert a buggy read-modify-write counter into an atomic operation.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement incrementAtomically(state, key) so that calling it 100× from parallel async tasks yields exactly 100. (state is a shared object; mutate state[key] in a way that's safe under interleaved awaits.)",
                  language: "javascript",
                  starter_code:
                    "export async function incrementAtomically(state, key) {\n  // TODO — must be safe even if scheduling interleaves between awaits\n}\n",
                  editable_regions: [{ placeholder: "// TODO", case_sensitive: true }],
                  entry_point: "incrementAtomically",
                  test_cases: [
                    {
                      input: [{ x: 0 }, "x"],
                      expected: undefined,
                      label: "single call returns void; state.x is incremented to 1",
                    },
                  ],
                hints: [
                  "Break this into smaller steps and think about what each piece of your input becomes in the output.",
                  "Focus on the transformation itself — what operation changes your input value into the form the test expects?",
                  "You are close — look at the examples again. What pattern do you see in how the input maps to the expected output?"
                ],
                },
                order: 9,
              },
              {
                title: "Key Takeaway",
                content:
                  "Trust the database for invariants and atomic operations. Application code can validate, but it cannot serialize concurrent requests on its own.",
                order: 10,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "One save per `userId` and `recipeId` has to be impossible, and a uniqueness rule in the database is the only thing that survives two requests arriving at the same moment.",
                order: 1,
              },
              {
                description:
                  "Move the counter in a single atomic step so the database does the arithmetic.",
                order: 2,
              },
              {
                description:
                  "Count saves, not requests. Bumping the counter every time a save is attempted means a retry inflates the count.",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "The Save collection has a compound unique index on { userId, recipeId }",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Two concurrent saves by the same user for the same recipe result in exactly one Save document",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "After 100 concurrent save attempts for the same (user, recipe), recipe.savedCount increases by exactly 1",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "A regression test reproduces the bug on the broken code and passes on the fix",
                is_required: true,
                order: 4,
              },
              {
                description: "getSaved no longer returns duplicate recipes for any user",
                is_required: true,
                order: 5,
              },
            ],
          },
        },
        {
          task_name: "Fix Posted-At Timezone Bug",
          test_type: "server",
          user_story:
            "As a user, I want \"Posted X days ago\" labels to be accurate regardless of my timezone or DST so I trust how recent a recipe is.",
          learning_sections: {
            create: [
              {
                title: "Overview\nProduction Debugging — Time, Timezones, DST",
                content:
                  "This section introduces the crash course for fixing time-dependent bugs. Time is deceptively hard: every formatting decision can hide a timezone bug.",
                order: 1,
              },
              {
                title: "The Production Bug",
                content:
                  "Users in EU report that recipes they posted last night show 'Posted 2 days ago'; the label also flips by one day around midnight. The fix is to stop deriving elapsed time from formatted date strings.",
                order: 2,
              },
              {
                title: "Date Strings and Timestamps",
                content:
                  "An ISO date string like '2026-05-05T13:14:00.000Z' is unambiguous — it encodes a specific UTC instant. A 'YYYY-MM-DD' substring loses that. Always elapsed-compare timestamps (`Date.parse(iso)` returns ms), never strings.",
                order: 3,
              },
              {
                title: "The split('T')[0] Trap",
                content:
                  "Slicing an ISO string to its date prefix discards time AND timezone. The computed 'today' then depends on the user's clock relative to UTC midnight, which is a different boundary depending on where they are.",
                order: 4,
              },
              {
                title: "Math.round and Math.floor for Elapsed Time",
                content:
                  "When Math.round is used on a fractional day count, the label flips at 0.5 — i.e. 12 hours after the post. Math.floor ensures labels only advance after a full 24-hour window has passed.",
                order: 5,
              },
              {
                title: "Inject `now` for Testability",
                content:
                  "A pure function `daysAgo(now: Date, iso: string)` is trivially testable — pass any pair of instants and assert the output. A function that calls `new Date()` internally is bound to system time and impossible to test deterministically.",
                order: 6,
              },
              {
                title: "Intl.RelativeTimeFormat",
                content:
                  "For production-grade relative-time labels in any locale, the platform's Intl.RelativeTimeFormat handles plurals and translations correctly. For this task, a hand-rolled helper is sufficient since only English output is required.",
                order: 7,
              },
              {
                title: "Writing a Deterministic Regression Test",
                content:
                  "Build test cases at exact instants spanning DST boundaries (e.g., Europe/Madrid spring-forward). The output should depend only on elapsed milliseconds, not on the system's local timezone.",
                order: 8,
              },
              {
                title: "Practice Lab: daysAgo",
                content:
                  "Implement the deterministic helper. Tests pin both `now` and the post timestamp.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement daysAgo(postedAt, now) returning \"Posted today\" when < 24h, or \"Posted N day(s) ago\". N = Math.floor(elapsedMs/86400000).\n\nExamples: daysAgo(sameInstant)→\"Posted today\", daysAgo(24h)→\"Posted 1 day ago\".",
                  language: "javascript",
                  starter_code:
                    "export function daysAgo(now, iso) {\n  // TODO — accept now (Date or ISO string) and iso (post timestamp)\n}\n",
                  editable_regions: [{ placeholder: "// TODO", case_sensitive: true }],
                  entry_point: "daysAgo",
                  test_cases: [
                    {
                      input: ["2026-05-05T12:00:00.000Z", "2026-05-05T12:00:00.000Z"],
                      expected: "Posted today",
                      label: "same instant",
                    },
                    {
                      input: ["2026-05-05T23:59:00.000Z", "2026-05-05T00:00:00.000Z"],
                      expected: "Posted today",
                      label: "23h59m elapsed",
                    },
                    {
                      input: ["2026-05-06T00:00:00.000Z", "2026-05-05T00:00:00.000Z"],
                      expected: "Posted 1 day ago",
                      label: "exactly 24h elapsed",
                    },
                    {
                      input: ["2026-05-06T00:01:00.000Z", "2026-05-05T00:00:00.000Z"],
                      expected: "Posted 1 day ago",
                      label: "24h01m elapsed (floor)",
                    },
                    {
                      input: ["2026-05-07T00:00:00.000Z", "2026-05-05T00:00:00.000Z"],
                      expected: "Posted 2 days ago",
                      label: "48h elapsed",
                    },
                  ],
                
                  hints: [
                    "Compute ms diff, check < 24h, floor days.",
                    "const diff = new Date(now) - new Date(postedAt); if (diff < 86400000) return \"Posted today\"; const days = Math.floor(diff / 86400000); return `Posted ${days} day(s) ago`;",
                    "const diff = new Date(now) - new Date(postedAt); if (diff < ___) return \"Posted today\"; const days = Math.floor(diff / ___);"
                  ],
                },
                order: 9,
              },
              {
                title: "Key Takeaway",
                content:
                  "Treat time as elapsed milliseconds, not formatted strings. The `now` parameter should be injected and the diff floored. These practices prevent timezone and DST-related bugs.",
                order: 10,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Elapsed time has to be measured from the raw timestamps, not from a date string that has already been cut down to a calendar day.",
                order: 1,
              },
              {
                description:
                  "A day has to be complete before the label moves on, so round down.",
                order: 2,
              },
              {
                description:
                  "The helper has to take the current instant as an input rather than read the clock itself.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description: "Elapsed < 24h returns `Posted today`",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Elapsed >= 24h returns `Posted N day(s) ago` with N = Math.floor(diffMs/86400000)",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Boundary deterministic: 23h59m → today, 24h00m → 1 day, 24h01m → 1 day",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "DST transitions don't introduce off-by-one errors in tests using fixed UTC Date instances",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "A regression test reproduces the original incorrect output on the broken code",
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
