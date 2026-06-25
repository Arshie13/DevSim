/**
 * Prisma Seed Script — RecipeNest (MERN scenario-1)
 *
 * Seeds the DevSim platform DB with the scenario, its 5 levels and 10 tasks
 * (with learning sections, hints, and acceptance criteria), and the
 * platform-wide achievements catalog.
 *
 * Usage:
 *   npx tsx seed.ts
 *
 * Make sure `npx prisma generate` has been run so the Prisma client exists.
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
      "Mission Briefing: Skillet & Stack Studios has just onboarded a new developer and needs RecipeNest running locally. Set up the MERN (MongoDB, Express, React, Node.js) stack, configure your environment, seed the recipe database, and make a small UI tweak so the brand identity reads correctly.",
    xp_reward: 100,
    coin_reward: 50,
    key_takeaways:
      "Mastering React + Express + Mongoose + MongoDB development environments requires understanding package management (npm), environment variables for securing database connections, and how Mongoose models live alongside your application code rather than in separate migration files. This setup ensures consistent development across team members and reliable deployments. Every React frontend with an Express backend and a MongoDB database starts with this crucial foundation.\n\nReact component composition lets parent layouts share UI across pages, and small JSX text changes flow through to the rendered DOM via Vite's Hot Module Replacement. Understanding component hierarchy and where text lives in the source tree is essential to making safe, scoped UI changes that don't accidentally regress unrelated screens.",
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
                  "This section introduces the crash course for preparing a MERN stack development environment. It provides a high-level view of the setup flow, required tools, and key concepts you need before starting the hands-on tasks.",
                order: 1,
              },
              {
                title: "What is the MERN Stack?",
                content:
                  "MERN stands for MongoDB, Express, React, Node.js — four technologies that work together to build full-stack web apps.\n\nMongoDB — a document database that stores your data as JSON-like objects\nExpress — a Node.js framework that handles your server and API routes\nReact — the frontend library that builds your user interface\nNode.js — the JavaScript runtime that runs your server code",
                order: 2,
              },
              {
                title: "How a MERN App is Structured",
                content:
                  "A typical MERN project has three parts:\nroot/ ← workspace root (shared config, scripts)\n    ├── client/ ← React frontend\n    └── server/ ← Express backend\nEach part has its own package.json, which means you need to install dependencies in all three locations.",
                order: 3,
              },
              {
                title: "Package Management 101",
                content:
                  "When you start a project, no dependencies are installed yet. You need to run npm install in each folder that has a package.json.\n\nWhy separate installs? Each folder is its own isolated module. The client uses React libraries, the server uses Express + Mongoose libraries — they don't share the same node_modules.",
                order: 4,
              },
              {
                title: "Practice Lab: cd Navigation",
                content:
                  "Practice navigating folders with `cd`. Use `ls` to list files/folders in your current directory and `pwd` to print your current path when you want to verify where you are.",
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
                order: 5,
              },
              {
                title: "Environment Variables",
                content:
                  'Sensitive config (like database connection strings) is stored in `.env` files — never hardcoded in source code.\n\nMONGO_URI="mongodb://localhost:27017/recipenest"\nPORT=4000\nJWT_SECRET="some-long-random-string"\n\nThe `dotenv` package reads these files and makes them available as `process.env.MONGO_URI` in your code. ⚠️ `.env` files are listed in `.gitignore` intentionally — they contain secrets that should never be committed to version control.',
                order: 6,
              },
              {
                title: "MongoDB & Mongoose 101",
                content:
                  "MongoDB stores documents in collections, which is a different mental model from SQL tables and rows. You don't run migrations to create tables — instead, you define a Mongoose schema in code, and collections are created on first insert.\n\nMongoose is the most popular MongoDB ODM (Object-Document Mapper) for Node.js. Instead of writing raw queries, you define schemas like:\n\nconst RecipeSchema = new Schema({ title: String, tags: [String] });\nconst Recipe = model('Recipe', RecipeSchema);\nawait Recipe.find({ tags: 'dessert' });",
                order: 7,
              },
              {
                title: "Key Takeaway",
                content:
                  "Setting up a project isn't just installing packages — it's aligning your local environment (dependencies, env vars, running database) so the app runs the same way for every developer on the team.",
                order: 8,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Three folders contain a `package.json` — install in each. Mongoose also needs a running MongoDB before the app boots.",
                order: 1,
              },
              {
                description:
                  "`server/.env` is gitignored on purpose — copy `.env.example` to `.env` and fill in your local Mongo connection URI.",
                order: 2,
              },
              {
                description:
                  "Run `npm run db:seed` inside `server/` after Mongo is up; the dev server will fetch zero recipes until the DB has data.",
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
                description: "MONGO_URI configured in `server/.env` and pointing to a running MongoDB instance",
                is_required: true,
                order: 2,
              },
              {
                description: "App seed script populates at least 10 recipes and 5 users",
                is_required: true,
                order: 3,
              },
              {
                description: "Both client and server start via `npm run dev` without crashes",
                is_required: true,
                order: 4,
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
                  "In most React apps, elements like the header and footer live in layout components — shared wrappers used across multiple pages. This way, you change the header text in one place and it updates everywhere.\n\nA typical layout structure:\ncomponents/\n    └── layout/\n          ├── Header.tsx ← top navigation bar\n          ├── Footer.tsx ← bottom bar\n          └── Layout.tsx ← shared page shell",
                order: 3,
              },
              {
                title: "How to Find What to Change",
                content:
                  "When you need to update something you see in the browser, ask:\nWhat element is it? (header, footer, sidebar?)\nWhich component renders it? (trace it to a file)\nIs the text hardcoded or coming from props/state? For a subtitle in the header, you'd look inside the layout's header component for a hardcoded string like \"Your kitchen, online\" or similar.",
                order: 4,
              },
              {
                title: "JSX Text Content",
                content:
                  'Changing text in JSX is straightforward — it\'s just like editing HTML:\n// Before\n<p className="brand-subtitle">Old Subtitle</p>\n// After\n<p className="brand-subtitle">Cook. Share. Inspire.</p>',
                order: 5,
              },
              {
                title: "Verifying Your Change",
                content:
                  "After editing, save the file and check the browser. Vite supports Hot Module Replacement (HMR) — meaning the page updates instantly without a full refresh when you save a file.",
                order: 6,
              },
              {
                title: "Practice Lab: Update Heading Text",
                content: "Practice a simple UI change by editing the text inside a heading element.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    'Update the function output from "Hello World" to "Cook. Share. Inspire.".',
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
                      expected: "Cook. Share. Inspire.",
                      label: "updated brand subtitle",
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
                  "The header is a layout-level element — look inside the `components/layout/` folder for the file that renders the brand area.",
                order: 1,
              },
              {
                description:
                  "After saving your change, open the running client in the browser to visually confirm the subtitle updated correctly on both desktop and mobile widths.",
                order: 2,
              },
              {
                description:
                  "The acceptance criteria specifies the exact subtitle text — make sure your change matches it character for character, including punctuation and capitalization.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description: 'Header subtitle is exactly "Cook. Share. Inspire."',
                is_required: true,
                order: 1,
              },
              {
                description: "Subtitle renders correctly on desktop and mobile breakpoints",
                is_required: true,
                order: 2,
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
      "Mission Briefing: The product team wants the recipe feed to feel like a real app — clicking a card should take you to the full recipe, and a search bar should filter results in real time. You'll wire up React Router's <Link> for client-side navigation, then lift state up to connect a controlled search input to the feed.",
    xp_reward: 150,
    coin_reward: 125,
    key_takeaways:
      "Client-side navigation is what separates a React app from a static website. React Router's <Link> swaps page content without a full reload, and wrapping a whole card in a <Link> gives users a large, accessible click target. The :id route parameter lets a single detail page handle any recipe by reading the URL.\n\nLifting state up and using pure helper functions to derive filtered views is a foundational React pattern. Pure functions are trivially testable, and the parent component owning state means controlled inputs can stay in sync without hidden coupling. useMemo prevents redundant work on each re-render once the data set grows.",
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
                  "The recipe cards are already rendering title, author, tags, and ratings — but clicking them does nothing. In this task you'll wire up React Router's <Link> component so each card navigates to its detail page at /recipes/:id.",
                order: 1,
              },
              {
                title: "React Router's <Link> vs <a>",
                content:
                  'A plain HTML <a href="/recipes/123"> causes a full page reload, losing React state and making the browser re-fetch everything. React Router\'s <Link to="/recipes/123"> performs a client-side navigation instead — only the relevant components re-render and the page feels instant.\n\nimport { Link } from \'react-router-dom\';\n<Link to={`/recipes/${recipe._id}`}>...</Link>',
                order: 2,
              },
              {
                title: "The Route Parameter :id",
                content:
                  "The route /recipes/:id is already registered in App.tsx. The :id segment is a dynamic parameter — React Router reads whatever comes after /recipes/ and exposes it via the useParams() hook inside the detail page:\n\nconst { id } = useParams();\n\nYour Link just needs to put the right value there.",
                order: 3,
              },
              {
                title: "Wrapping a Card in a Link",
                content:
                  "You can wrap an entire block element inside a <Link>. Because Link renders as an <a>, the whole card becomes one accessible, keyboard-navigable link:\n\n<Link to={`/recipes/${recipe._id}`}>\n  <article>... card contents ...</article>\n</Link>\n\nThis is better UX than a small 'View' button — the click target is the whole card.",
                order: 4,
              },
              {
                title: "Accessibility: Links vs Buttons",
                content:
                  "Use <Link> (renders <a>) when the action is navigation — changing the URL. Use <button> when the action is in-page (toggle, submit, delete). Screen readers announce these differently, so getting it right matters.",
                order: 5,
              },
              {
                title: "Testing Navigation with MemoryRouter",
                content:
                  "React Router components must be rendered inside a Router context. In tests, wrap your component in <MemoryRouter> instead of <BrowserRouter> so there's no real URL bar:\n\nrender(\n  <MemoryRouter>\n    <RecipeCard recipe={recipe} />\n  </MemoryRouter>\n);\n\nThen assert screen.getByRole('link') has the right href.",
                order: 6,
              },
              {
                title: "Practice Lab: Build a Route Path",
                content: "Practice constructing dynamic route paths.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement getRecipePath(id) that returns the route path string for a recipe detail page (e.g. '/recipes/abc123').",
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
                },
                order: 7,
              },
              {
                title: "Key Takeaway",
                content:
                  "Client-side navigation is what makes a React app feel like an app rather than a website. <Link> is the building block — always prefer it over <a> for in-app routes, and always wrap the largest meaningful hit target.",
                order: 8,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Import `Link` from `react-router-dom` and wrap the entire `<article>` (or `<Card>`) in `<Link to={\\`/recipes/${recipe._id}\\`}>`. The test checks for a single `role=\"link\"` element.",
                order: 1,
              },
              {
                description:
                  "The `<Link>` must contain the `<h3>` title — the test asserts that the link wraps the heading, making the whole card the click target.",
                order: 2,
              },
              {
                description:
                  "In tests the component is wrapped in `<MemoryRouter>` — if you see a 'useHref outside Router' error when running locally, make sure your app's root already provides a `<BrowserRouter>` in `main.tsx`.",
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
                  "This section introduces the crash course for connecting a search input to a list. You'll lift state up to a parent feed component and use a pure helper to derive a filtered view.",
                order: 1,
              },
              {
                title: "Lifting State Up",
                content:
                  "When two siblings need to share state, move the state into their nearest common ancestor and pass it down as props. Here, `RecipeFeed` owns the `query` state, `SearchBar` displays it, and the rendered list is filtered through it.",
                order: 2,
              },
              {
                title: "Controlled Inputs",
                content:
                  "A controlled <input> reads its value from React state and writes back via onChange. That makes the parent the single source of truth for what the user has typed:\n\n<input value={query} onChange={e => setQuery(e.target.value)} />",
                order: 3,
              },
              {
                title: "Pure Filter Functions",
                content:
                  "A pure function depends only on its inputs and has no side effects. `filterRecipes(query, recipes)` is perfect for this — it's trivially testable in isolation, and easy to memoize.",
                order: 4,
              },
              {
                title: "useMemo for Derived Data",
                content:
                  "If filtering is expensive, recompute it only when inputs change:\n\nconst visible = useMemo(() => filterRecipes(query, recipes), [query, recipes]);",
                order: 5,
              },
              {
                title: "Empty States",
                content:
                  'When the filter returns nothing, render an empty-state element. Tests look for `data-testid="empty-state"`. A good empty state explains why and suggests a next action: "No recipes match your search. Try a different keyword."',
                order: 6,
              },
              {
                title: "Practice Lab: filterByPrefix",
                content: "Practice writing a small pure filter function.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement filterByPrefix(prefix, items) that returns items starting with the prefix (case-insensitive). Empty prefix returns all.",
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
                },
                order: 7,
              },
              {
                title: "Key Takeaway",
                content:
                  "Lift state up, derive what you render with a pure function, and treat the empty case as a first-class UX concern. Done well, this pattern scales from feeds to dashboards to admin tables.",
                order: 8,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "`filterRecipes` should be a pure function returning a NEW array — don't mutate the input. Lower-case both sides before `includes`.",
                order: 1,
              },
              {
                description:
                  "`SearchBar` should accept `value` and `onChange` props so the parent owns the query state.",
                order: 2,
              },
              {
                description:
                  "Wrap the derived list in `useMemo` so the filter doesn't re-run on every unrelated render.",
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
                  "Typing in the search input updates the rendered card count without a page reload",
                is_required: true,
                order: 3,
              },
              {
                description: 'Empty matches show an empty-state element with `data-testid="empty-state"`',
                is_required: true,
                order: 4,
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
                  "This section introduces the crash course for debugging an aggregation pipeline. You'll learn how stage order, joined array shapes, and missing terminal stages can each silently break a query.",
                order: 1,
              },
              {
                title: "Why Aggregation Pipelines",
                content:
                  "Aggregation pipelines let you join collections, compute fields, group, sort, and limit — all server-side. They're how you express trending feeds, leaderboards, and analytics queries in MongoDB.",
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
                  "To sort by a count of joined items, you need a scalar — use $addFields with $size:\n\n{ $addFields: { savedCount: { $size: '$saves' } } }\n\nNow `savedCount` is a number you can sort on.",
                order: 5,
              },
              {
                title: "$sort with Multiple Keys",
                content:
                  "Sorting by two keys lets you break ties deterministically:\n\n{ $sort: { savedCount: -1, createdAt: -1 } }\n\nThis says: highest savedCount first, and on a tie, newest createdAt first.",
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
                  "mongodb-memory-server starts an in-process MongoDB just for tests. Combined with vitest + supertest, you can seed exactly the data shape you need to reproduce a bug deterministically — without depending on production data.",
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
                  "$match should run BEFORE $lookup to keep the pipeline cheap and let MongoDB use its indexes.",
                order: 1,
              },
              {
                description:
                  "After $lookup you have an array — use $addFields with $size to compute a number you can sort on.",
                order: 2,
              },
              {
                description:
                  "End the pipeline with $limit and $project so the response is bounded and doesn't include the heavy joined array.",
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
                  "Use `(req: Request, res: Response, next: NextFunction)` so editor types catch silly mistakes. Wrap the body in `try/catch` and call `next(err)` so errors flow into your central error handler instead of crashing the process.",
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
                  "Pick a shape and stick to it across all endpoints — clients depend on it:\n\n{ success: true, data: ... }\n{ success: false, error: '...', issues?: [...] }\n\nConsistency removes a class of bugs from your client.",
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
                    "Implement validateLimit(value): {ok: true, value: number} for integers in [1,50], otherwise {ok: false, error: string}.",
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
                  "Use the existing `validateRequest(zodSchema)` middleware — define a query schema for `limit` and wire it before the controller.",
                order: 1,
              },
              {
                description:
                  "Wrap the controller body in `try/catch` and pass any error to `next(err)` so the central error handler runs.",
                order: 2,
              },
              {
                description:
                  "Return `{ success: true, data: [...] }` with `res.status(200).json(...)` — match the shape every other endpoint uses.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "GET /api/recipes/trending returns 200 with `{ success: true, data: [...] }`",
                is_required: true,
                order: 1,
              },
              {
                description: "GET /api/recipes/trending?limit=3 returns at most 3 documents",
                is_required: true,
                order: 2,
              },
              {
                description: "GET /api/recipes/trending?limit=999 returns 400 with a validation error",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Route is registered before any catch-all 404 handler so it actually resolves",
                is_required: true,
                order: 4,
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
      "Mission Briefing: Users want to bookmark recipes they like. You'll implement the full Save feature — model, idempotent endpoint, optimistic UI button — and then ship a Saved Recipes page where users can browse and unsave their favorites.",
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
                  "This section introduces the crash course for shipping a save feature end-to-end. You'll touch the model, controller, route, service, and UI button.",
                order: 1,
              },
              {
                title: "Mongoose Upserts (`findOneAndUpdate`)",
                content:
                  "Use `findOneAndUpdate({...}, {...}, { upsert: true, new: true })` to insert-or-update in a single call. Combined with `rawResult: true`, the result tells you whether you inserted or matched an existing doc.",
                order: 2,
              },
              {
                title: "$setOnInsert vs $set",
                content:
                  "$setOnInsert applies only when an upsert creates a new document. $set always applies. For a save record you want $setOnInsert so re-saves don't trample the original `savedAt`.",
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
                  "Don't call axios directly from a component — wrap each endpoint in a typed service function. That way the component code stays readable and a future API rename is a one-line change.",
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
                    "Return an object literal { userId, recipeId } from the two arguments.",
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
                },
                order: 9,
              },
              {
                title: "Key Takeaway",
                content:
                  "An idempotent endpoint plus an optimistic UI gives you a feature that feels instant and survives network flakes.",
                order: 10,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "On the server, `findOneAndUpdate({userId, recipeId}, { $setOnInsert: {...} }, { upsert: true, new: true, rawResult: true })` lets you tell first-save from re-save.",
                order: 1,
              },
              {
                description:
                  "Increment `recipe.savedCount` only when `rawResult.lastErrorObject.updatedExisting === false` (i.e. you actually inserted).",
                order: 2,
              },
              {
                description:
                  "On the client, store `isSaved` in component state and toggle it optimistically; revert on API error.",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "POST /api/recipes/:id/save returns 201 (first save) or 200 (idempotent re-save) with `{ success, data }`",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Recipe `savedCount` increments by exactly 1 per unique user, never more on repeated saves by the same user",
                is_required: true,
                order: 2,
              },
              {
                description: "`SaveButton` toggles its visual state immediately on click",
                is_required: true,
                order: 3,
              },
              {
                description: "Unauthenticated POST returns 401",
                is_required: true,
                order: 4,
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
                  "This section introduces the crash course for completing the Save feature. You'll build the listing endpoint, the unsave endpoint, and a page that wires them together with optimistic removal.",
                order: 1,
              },
              {
                title: "populate vs $lookup",
                content:
                  "Mongoose's `populate` is a convenience helper that runs follow-up queries to attach referenced docs. $lookup runs a single aggregation stage. Both produce the same observable shape; pick whichever reads more clearly for your use case.",
                order: 2,
              },
              {
                title: "Sorting & Pagination",
                content:
                  "Sort by `savedAt: -1` so newest first. For pagination, prefer cursor-based (return the last seen savedAt and ask for items older than it) over offset-based once your dataset grows.",
                order: 3,
              },
              {
                title: "Clamping Numeric Fields",
                content:
                  "When you decrement a counter, never let it go below zero:\n\nUpdate with: { $inc: { savedCount: -1 } }\nGuard with:  filter: { savedCount: { $gt: 0 } }\n\nOr, in code, clamp(value, 0).",
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
                  instructions: "Implement clamp(value, min) returning Math.max(value, min).",
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
                },
                order: 8,
              },
              {
                title: "Key Takeaway",
                content:
                  "Listing endpoints earn user trust through correctness (only your data, sorted right) and resilience (empty states, clamped counters, idempotent deletes).",
                order: 9,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Decrementing must clamp at 0 — use `$inc: { savedCount: -1 }` plus a `where: { savedCount: { $gt: 0 } }` guard with findOneAndUpdate.",
                order: 1,
              },
              {
                description:
                  "`Save.find({userId}).populate('recipeId')` or an aggregation `$lookup` are both fine — tests assert observable behaviour.",
                order: 2,
              },
              {
                description: "Sort by `savedAt: -1` so the newest save appears first.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "GET /api/recipes/saved returns 200 with the user's saved recipes sorted by savedAt descending",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "DELETE /api/recipes/:id/save returns 200 and removes the Save document",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "After unsave, `savedCount` decreases by 1 (never below 0)",
                is_required: true,
                order: 3,
              },
              {
                description: "SavedRecipes page renders an empty state when the user has no saves",
                is_required: true,
                order: 4,
              },
              {
                description: "Unauthenticated requests return 401",
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
      "Mission Briefing: Congratulations — RecipeNest is live. Two production issues have been reported by users: inflated save counts and confusing 'posted X days ago' labels. Your mission is to investigate each, identify the root cause, deliver a fix backed by a regression test, and write a short postmortem.",
    xp_reward: 400,
    coin_reward: 400,
    key_takeaways:
      "Concurrent writes are the most common source of subtle production bugs in Node.js + MongoDB apps. Two key tools tame them: database-level uniqueness (compound indexes) for hard invariants, and atomic operators ($inc, $setOnInsert) for counters. Read-modify-write loops on shared documents are a code smell — always reach for an atomic operator first.\n\nTime is the second-most common source of production bugs. Always compute elapsed time from raw timestamps, never from formatted date strings. Use Math.floor on elapsed days so labels move forward only as full 24-hour windows pass. Make time-dependent helpers accept an explicit `now` parameter so tests can pin them to a deterministic instant.",
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
                  "This section introduces the crash course for diagnosing and fixing a duplicate-write bug. You'll learn how compound unique indexes and atomic operators prevent a whole class of concurrency issues.",
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
                  "The data model is the first place to enforce invariants — a compound unique index on { userId, recipeId } makes duplicates impossible at the DB level.",
                order: 1,
              },
              {
                description:
                  "Read-modify-write on a counter is unsafe under concurrency. Use the atomic `$inc` operator instead.",
                order: 2,
              },
              {
                description:
                  "Only increment the counter when the upsert actually inserted a new document — otherwise the counter drifts upward on every retry.",
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
            'As a user, I want "Posted X days ago" labels to be accurate regardless of my timezone or DST so I trust how recent a recipe is.',
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
                title: "Date Strings vs Timestamps",
                content:
                  "An ISO date string like '2026-05-05T13:14:00.000Z' is unambiguous — it encodes a specific UTC instant. A 'YYYY-MM-DD' substring loses that. Always elapsed-compare timestamps (`Date.parse(iso)` returns ms), never strings.",
                order: 3,
              },
              {
                title: "The split('T')[0] Trap",
                content:
                  "Slicing an ISO string to its date prefix discards time AND timezone. Suddenly your 'today' depends on the user's clock relative to UTC midnight, which is a different boundary depending on where they are.",
                order: 4,
              },
              {
                title: "Math.round vs Math.floor for Elapsed Time",
                content:
                  "If you Math.round a fractional day count, the label flips at 0.5 — i.e. 12 hours after the post. Use Math.floor so labels only advance after a full 24-hour window has passed.",
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
                  "For production-grade relative-time labels in any locale, use the platform's Intl.RelativeTimeFormat — it handles plurals and translations correctly. For this task, a hand-rolled helper is fine since we only need English output.",
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
                    'Return "Posted today" when elapsed < 24h, otherwise "Posted N day(s) ago" with N = Math.floor(elapsedMs/86400000).',
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
                },
                order: 9,
              },
              {
                title: "Key Takeaway",
                content:
                  "Treat time as elapsed milliseconds, not formatted strings. Inject `now`. Floor the diff. Future-you will thank present-you.",
                order: 10,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Compute the diff from raw timestamps (`Date.parse(iso)` or `new Date(iso).getTime()`), not from formatted date strings.",
                order: 1,
              },
              {
                description:
                  "Use `Math.floor` so labels only move forward after a full 24-hour window has passed; rounding flips the label at 12 hours.",
                order: 2,
              },
              {
                description:
                  "Make the helper accept an explicit `now` parameter — that makes timezone and DST cases trivial to test deterministically.",
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
