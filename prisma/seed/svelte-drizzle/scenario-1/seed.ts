export const scenarios = [
  {
    id: "svelte-drizzle-scenario-1",
    name: "Membership Directory",
    description:
      "Build a member directory web application using SvelteKit and Drizzle ORM with SQLite to manage organization members.",
    difficulty: "intermediate",
  },
];

export const levels = [
  {
    id: "svelte-drizzle-level-1",
    title: "Environment Setup & Database Exploration",
    subtitle: "Configure the environment and explore the existing schema",
    order: 1,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: The project has been scaffolded but not yet configured. Set up the environment, verify the database connection, and explore the existing schema.",
    xp_reward: 100,
    coin_reward: 50,
    key_takeaways:
      "Setting up a SvelteKit + Drizzle project requires installing dependencies, configuring environment variables, and pushing the schema to create the SQLite database file. Drizzle's schema-first approach means table definitions in TypeScript are the single source of truth. The `drizzle-kit push` command syncs the schema to the database without manual SQL.",
    scenario_id: "svelte-drizzle-scenario-1",
    tasks: {
      create: [
        {
          task_name: "Environment Setup",
          test_type: "both",
          user_story:
            "As a developer, I want to set up the development environment so that I can start working on the project.",
          learning_sections: {
            create: [
              {
                title: "Overview\nSetting Up a SvelteKit + Drizzle Project",
                content:
                  "This section introduces the crash course for setting up a SvelteKit + Drizzle + SQLite project locally. It covers the key tools, dependency installation, and verifying the dev server runs cleanly.",
                order: 1,
              },
              {
                title: "What is SvelteKit?",
                content:
                  "SvelteKit is a full-stack framework for building web applications with Svelte. It provides file-based routing, server-side rendering, API endpoints, and a build system. Unlike React-based frameworks, Svelte shifts work from the browser to the compiler, producing smaller and faster client-side code.",
                order: 2,
              },
              {
                title: "What is Drizzle ORM?",
                content:
                  "Drizzle is a lightweight TypeScript ORM that provides a SQL-like API for querying databases. Schema is defined in TypeScript files using `sqliteTable` and related helpers. The schema file is the source of truth — Drizzle Kit reads it and generates SQL to create or update the database tables.",
                order: 3,
              },
              {
                title: "Database Setup",
                content:
                  "Drizzle ORM with SQLite uses `better-sqlite3` as the underlying driver. The database file is created automatically when the first schema push or migration runs. The connection is configured in `src/lib/server/db/index.ts` and is only importable from server-side code (files ending in `.server.ts`).",
                order: 4,
              },
              {
                title: "Key Takeaway",
                content:
                  "Setting up a SvelteKit + Drizzle + SQLite project involves installing dependencies, configuring the environment, pushing the schema, and seeding sample data. The dev server auto-reloads on file changes, providing a fast feedback loop.",
                order: 5,
              },
            ],
          },
          acceptance_criteria: {
            create: [
              {
                description: "Dependencies installed without errors",
                is_required: true,
                order: 1,
              },
              {
                description: "Database created and schema pushed successfully",
                is_required: true,
                order: 2,
              },
              {
                description: "Dev server starts and renders at localhost:5173",
                is_required: true,
                order: 3,
              },
            ],
          },
          hints: { create: [] },
          order: 1,
        },
      ],
    },
  },
  {
    id: "svelte-drizzle-level-2",
    title: "Member Listing & Search",
    subtitle: "Build a member directory with search capabilities",
    order: 2,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: The organization needs a proper member directory. Build a table view that lists all members with search functionality.",
    xp_reward: 150,
    coin_reward: 75,
    key_takeaways:
      "SvelteKit load functions run on the server and can query the database directly. Drizzle's query API (`db.select().from(users)`) returns typed results that integrate seamlessly with Svelte templates. Passing search parameters via URL search params keeps the UI bookmarkable and server-renderable. Filtering on the server prevents sending unnecessary data to the client.",
    scenario_id: "svelte-drizzle-scenario-1",
    tasks: {
      create: [
        {
          task_name: "Display Members Table",
          test_type: "client",
          user_story:
            "As a user, I want to see all members in a clean table so that I can browse the directory.",
          acceptance_criteria: {
            create: [
              {
                description: "Members are rendered in an HTML table with ID, Name, and Email columns",
                is_required: true,
                order: 1,
              },
              {
                description: "Table is styled with Tailwind CSS for readability",
                is_required: true,
                order: 2,
              },
              {
                description: "Empty message shown when no members exist",
                is_required: true,
                order: 3,
              },
            ],
          },
          hints: { create: [] },
          order: 1,
        },
        {
          task_name: "Add Member Search",
          test_type: "server",
          user_story:
            "As a user, I want to search members by name or email so that I can find specific people quickly.",
          acceptance_criteria: {
            create: [
              {
                description: "Search input filters members by name (case-insensitive)",
                is_required: true,
                order: 1,
              },
              {
                description: "Search input filters members by email (case-insensitive)",
                is_required: true,
                order: 2,
              },
              {
                description: "Empty state shown when no members match the search",
                is_required: true,
                order: 3,
              },
            ],
          },
          hints: { create: [] },
          order: 2,
        },
      ],
    },
  },
  {
    id: "svelte-drizzle-level-3",
    title: "Add & Edit Members",
    subtitle: "Implement full CRUD for the member directory",
    order: 3,
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: The member directory needs full CRUD functionality. Add forms to create new members and edit existing ones.",
    xp_reward: 200,
    coin_reward: 100,
    key_takeaways:
      "SvelteKit form actions (`+page.server.ts` actions) handle POST submissions on the server, making form handling type-safe and progressive-enhanced. Drizzle's `db.insert().values()` and `db.update().set()` provide type-safe insert and update operations. Unique constraints from the schema (like `email().unique()`) are enforced at the database level, and errors from `better-sqlite3` are thrown as exceptions that must be caught server-side.",
    scenario_id: "svelte-drizzle-scenario-1",
    tasks: {
      create: [
        {
          task_name: "Add Member Form",
          test_type: "server",
          user_story:
            "As a user, I want to add a new member with name and email so that I can grow the directory.",
          acceptance_criteria: {
            create: [
              {
                description: "Form with name and email fields submits via POST",
                is_required: true,
                order: 1,
              },
              {
                description: "New member appears in the list after submission",
                is_required: true,
                order: 2,
              },
              {
                description: "Duplicate email returns a user-friendly error message",
                is_required: true,
                order: 3,
              },
            ],
          },
          hints: { create: [] },
          order: 1,
        },
        {
          task_name: "Edit Member Details",
          test_type: "server",
          user_story:
            "As a user, I want to edit a member's name and email so that I can keep the directory up to date.",
          acceptance_criteria: {
            create: [
              {
                description: "Edit button available for each member row",
                is_required: true,
                order: 1,
              },
              {
                description: "Edit form pre-fills with current member data",
                is_required: true,
                order: 2,
              },
              {
                description: "Changes persist after page reload",
                is_required: true,
                order: 3,
              },
            ],
          },
          hints: { create: [] },
          order: 2,
        },
      ],
    },
  },
];
