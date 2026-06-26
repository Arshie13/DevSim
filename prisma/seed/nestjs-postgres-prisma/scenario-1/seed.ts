/**
 * Prisma Seed Script — FlexiSpend Money Tracker (NestJS Scenario 1)
 *
 * Seeds the database with Level and Scenario data for the FlexiSpend learning scenario.
 */

export const scenarios = [
  {
    id: "nestjs-fs-scenario-1",
    name: "FlexiSpend Money Tracker",
    description:
      "Build and harden a production-grade personal finance tracker using NestJS, PostgreSQL, and Prisma. Progress from environment setup through paginated APIs with filters, atomic balance updates, budget tracking, rich reporting, and critical production bug fixes including concurrency, timezone, and decimal precision.",
    difficulty: "expert",
  },
];

export const levels = [
  // ─────────────────────────────────────────────────────────────
  // LEVEL 1 — Getting Familiar with the Codebase
  // ─────────────────────────────────────────────────────────────
  {
    id: "nestjs-fs-level-1",
    title: "Getting Familiar with the Codebase",
    subtitle: "Set up the development environment and extend the Transaction model with a note field.",
    order: 1,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: A new developer has joined the FlexiSpend engineering team. The first tasks are to get the NestJS + PostgreSQL + Prisma stack running locally and make a small but visible schema change — adding a note field to transactions — so the codebase structure becomes clear end-to-end.",
    xp_reward: 100,
    coin_reward: 50,
    key_takeaways:
      "Setting up a NestJS + PostgreSQL + Prisma project requires understanding three layers: the NestJS runtime (controllers, services, modules), the Prisma schema (models, enums, relations), and the PostgreSQL database (migrations, seeds, connection strings). Knowing how to run `pnpm exec prisma migrate dev`, `pnpm exec prisma generate`, and `pnpm run start:dev` in the correct order is foundational for every backend developer on this stack.\n\nPrisma schema changes are the source of truth for the database. Adding a single field like `note String?` to a model triggers a migration, updates the TypeScript types, and propagates to the API DTOs and service logic. Understanding this single-file-to-database pipeline is critical before building any feature.",
    scenario_id: "nestjs-fs-scenario-1",
    tasks: {
      create: [
        // ── L1-T1: Prepare Development Environment ──────────────
        {
          task_name: "Prepare Development Environment",
          test_type: "none",
          user_story:
            "As a developer, I want to set up my local development environment so that I can run and modify the FlexiSpend application.",
          learning_sections: {
            create: [
              {
                title: "Overview\nSetting Up a NestJS + PostgreSQL + Prisma Project",
                content:
                  "This section introduces the crash course for preparing a NestJS backend with PostgreSQL and Prisma. It gives a high-level view of the setup flow, required tools, and key concepts needed before starting the hands-on tasks.",
                order: 1,
              },
              {
                title: "What is the NestJS + PostgreSQL + Prisma Stack?",
                content:
                  "NestJS is a progressive Node.js framework for building scalable server-side applications.\n\nNestJS — provides a modular architecture with decorators, dependency injection, and built-in support for REST APIs, GraphQL, and WebSockets.\nPostgreSQL — a powerful open-source relational database with ACID compliance, JSON support, and advanced querying.\nPrisma — a next-generation ORM that replaces raw SQL with a type-safe database client and a declarative schema language.\n\nFlexiSpend uses all three layers: PostgreSQL stores users, accounts, transactions, and budgets; Prisma defines the schema and generates the client; NestJS serves the REST API with controllers, services, and guards.",
                order: 2,
              },
              {
                title: "How a NestJS App is Structured",
                content:
                  "A typical NestJS project is organized by feature modules:\n\nsrc/\n  ├── auth/          ← authentication module (JWT strategy, guards)\n  ├── users/         ← user management\n  ├── accounts/      ← bank/wallet accounts\n  ├── transactions/  ← income/expense records\n  ├── categories/    ← budget categories\n  ├── budgets/       ← monthly budget limits\n  ├── reports/       ← analytics endpoints\n  ├── prisma/        ← schema, migrations, seed\n  └── main.ts        ← application bootstrap\n\nEach module contains its own controller, service, DTOs, and tests. This separation of concerns makes the codebase scalable and testable.",
                order: 3,
              },
              {
                title: "Package Management in a NestJS Project",
                content:
                  "When a project is cloned, no dependencies are installed yet — node_modules is in .gitignore. Dependencies must be installed by running pnpm install at the project root.\n\nKey packages in this project:\n- @nestjs/core, @nestjs/common — framework runtime\n- @nestjs/platform-express — HTTP server adapter\n- @prisma/client — type-safe database client\n- prisma — CLI for migrations and schema management\n- bcrypt — password hashing\n- class-validator, class-transformer — DTO validation\n- supertest — HTTP assertions in tests\n\nThe Prisma CLI and Prisma Client are separate packages. The CLI handles migrations; the Client is what services import at runtime.",
                order: 4,
              },
              {
                title: "Prisma Schema and Migrations",
                content:
                  "The Prisma schema (prisma/schema.prisma) is the single source of truth for the database structure. Models define tables, fields define columns, and decorators define constraints like `@id`, `@unique`, and `@default`.\n\nAfter editing the schema, changes are applied with:\npnpm exec prisma migrate dev --name add_user_fields\n\nThis generates a SQL migration file and applies it to the database. Then run:\npnpm exec prisma generate\n\nThis regenerates the Prisma Client TypeScript types so services get autocomplete and type checking.",
                order: 5,
              },
              {
                title: "Practice Lab: Prisma Model Field",
                content:
                  "Practice writing a Prisma model field definition for an optional string field.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement getNoteFieldDefinition() that returns the Prisma field definition for an optional note string field.",
                  language: "javascript",
                  starter_code:
                    "export function getNoteFieldDefinition() {\n  // TODO\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO",
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "getNoteFieldDefinition",
                  test_cases: [
                    {
                      input: [],
                      expected: "note String?",
                      label: "optional note field",
                    },
                  ],
                },
                order: 6,
              },
              {
                title: "Environment Variables",
                content:
                  "Sensitive config (like database URIs) is stored in .env files — never hardcoded in source code.\n\nDATABASE_URL=postgresql://user:password@localhost:5432/flexispend\nJWT_SECRET=changeme\nPORT=4000\n\nThe @nestjs/config package reads these files and makes them available via ConfigService. Prisma reads DATABASE_URL directly from .env. ⚠️ .env files are listed in .gitignore intentionally — they contain secrets that should never be committed to version control.\n\nNote: Environment variables in this project are pre-configured.",
                order: 7,
              },
              {
                title: "Seeding the Database",
                content:
                  "A seed script populates the database with realistic sample data so development can proceed against a real dataset instead of an empty one. The FlexiSpend seed creates 2 users, 8 default categories, 3 accounts, and ~18 transactions.\n\nRun the seed with:\npnpm exec prisma db seed\n\nThis command is defined in the root package.json and calls prisma/seed.ts via ts-node.",
                order: 8,
              },
              {
                title: "Key Takeaway",
                content:
                  "Setting up a project is more than running one command — it means aligning the local environment (dependencies, env vars, database) so the app runs identically for every developer on the team. Getting this right first enables building features with confidence.",
                order: 9,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "The project has a single root package.json — run pnpm install from the project root, not from any subfolder.",
                order: 1,
              },
              {
                description:
                  "The README.md contains step-by-step setup instructions — look for sections about environment configuration, the `.env` file, and the Prisma migrate/seed commands.",
                order: 2,
              },
              {
                description:
                  "PostgreSQL must be running before Prisma can connect. The README contains instructions for starting PostgreSQL on the local platform (local install or Docker).",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description: "Dependencies installed in root without errors",
                is_required: true,
                order: 1,
              },
              {
                description: ".env file created with valid DATABASE_URL pointing to PostgreSQL",
                is_required: true,
                order: 2,
              },
              {
                description: "Prisma migrations applied successfully (pnpm exec prisma migrate dev)",
                is_required: true,
                order: 3,
              },
              {
                description: "Seed script runs successfully and populates the database",
                is_required: true,
                order: 4,
              },
              {
                description: "NestJS dev server starts at http://localhost:4000 without errors",
                is_required: true,
                order: 5,
              },
            ],
          },
        },

        // ── L1-T2: Add a Note Field to Transactions ─────────────────
        {
          task_name: "Add a Note Field to Transactions",
          test_type: "server",
          user_story:
            "As a user, I want to attach a note to each transaction so I can remember what a purchase or deposit was for.",
          learning_sections: {
            create: [
              {
                title: "Overview\nExtending a Prisma Model and API",
                content:
                  "This section introduces the crash course for making a first schema change in a NestJS + Prisma codebase. It covers how Prisma models map to database tables, how migrations propagate changes, and how DTOs and services stay in sync with the schema.",
                order: 1,
              },
              {
                title: "Prisma Models are Schema-First",
                content:
                  "In Prisma, database structure is defined in schema.prisma, then the client is generated. This is schema-first development. Models define the shape of database tables, and fields map to columns. A `?` after a field type means the field is optional (nullable in SQL). Adding a field here is the first step; the migration and DTO updates follow.",
                order: 2,
              },
              {
                title: "Running a Migration",
                content:
                  "After editing schema.prisma, a migration is created:\n\npnpm exec prisma migrate dev --name add_transaction_note\n\nPrisma compares the schema against the current database state, generates a SQL migration file in prisma/migrations/, and applies it. This is how the database stays in sync with the code. Migration files should never be edited by hand without a thorough understanding of the consequences.",
                order: 3,
              },
              {
                title: "DTOs: Data Transfer Objects",
                content:
                  "NestJS uses DTOs to define the shape of incoming request bodies. The CreateTransactionDto tells NestJS what fields to expect when someone POSTs to /api/transactions. Class-validator decorators (@IsString, @IsOptional, etc.) enforce validation rules before the data reaches the service layer.",
                order: 4,
              },
              {
                title: "Updating the Service and Controller",
                content:
                  "The service layer calls Prisma Client methods to interact with the database. After adding a field, the service must be updated to include it in create and find operations. The controller returns the full Prisma result, so if the model and DTO both include the field, the API response will include it too.",
                order: 5,
              },
              {
                title: "Hot Reload with NestJS Dev Mode",
                content:
                  "NestJS in development mode (pnpm run start:dev) watches files and restarts automatically on save. After running prisma generate and updating the DTO/service, saving the files triggers the server to restart — the new field will be available immediately.\n\nPostgreSQL does not need to be restarted, nor do migrations need to be re-run, unless the schema itself changes.",
                order: 6,
              },
              {
                title: "Practice Lab: Return the Correct Note Value",
                content:
                  "Practice returning an optional string value from a function — the same logic applied when handling an optional note in a DTO.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    'Complete getTransactionNote(note) so it returns the note string when provided, or undefined when note is null or empty.',
                  language: "javascript",
                  starter_code:
                    "export function getTransactionNote(note) {\n  // TODO: return note if it's a non-empty string, otherwise undefined\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO: return note if it's a non-empty string, otherwise undefined",
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "getTransactionNote",
                  test_cases: [
                    {
                      input: ["lunch with team"],
                      expected: "lunch with team",
                      label: "returns provided note",
                    },
                    {
                      input: [""],
                      expected: undefined,
                      label: "empty string returns undefined",
                    },
                    {
                      input: [null],
                      expected: undefined,
                      label: "null returns undefined",
                    },
                  ],
                },
                order: 7,
              },
              {
                title: "Key Takeaway",
                content:
                  "In a Prisma + NestJS stack, schema changes flow in one direction: schema.prisma → migration → generated client → DTO → service → controller → API response. Master this pipeline and every feature becomes predictable to implement.",
                order: 8,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Open `prisma/schema.prisma` and find the `Transaction` model. Add `note String?` after the `description` field.",
                order: 1,
              },
              {
                description:
                  "Run `pnpm exec prisma migrate dev --name add_transaction_note` to apply the schema change to PostgreSQL, then `pnpm exec prisma generate` to update the TypeScript types.",
                order: 2,
              },
              {
                description:
                  "Add `@IsOptional()` and `@IsString()` decorators for the `note` field in `CreateTransactionDto`. The controller already spreads the DTO into the service call, so no controller changes are needed.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description: "Transaction model in schema.prisma includes `note String?`",
                is_required: true,
                order: 1,
              },
              {
                description: "Migration file is created and applied to the database",
                is_required: true,
                order: 2,
              },
              {
                description: "CreateTransactionDto includes an optional note field with validation decorators",
                is_required: true,
                order: 3,
              },
              {
                description: "POST /api/transactions accepts and persists a note value",
                is_required: true,
                order: 4,
              },
              {
                description: "GET /api/transactions returns the note field in each transaction object",
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
  // LEVEL 2 — Data Modeling & API Foundations
  // ─────────────────────────────────────────────────────────────
  {
    id: "nestjs-fs-level-2",
    title: "Data Modeling & API Foundations",
    subtitle: "Build paginated transaction lists and guard visibility with soft-delete categories.",
    order: 2,
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: FlexiSpend users need to browse hundreds of transactions efficiently, and inactive categories should be hidden from daily use while preserving historical data. The job is to implement cursor-based pagination with filters and enforce soft-delete visibility rules across the API.",
    xp_reward: 150,
    coin_reward: 75,
    key_takeaways:
      "Pagination is not a UI convenience — it is a performance requirement. Returning 10,000 transactions in a single JSON payload crashes both the server and the client. A proper paginated API uses `skip` (offset) and `take` (limit) in Prisma, and returns a consistent envelope with `data`, `total`, `page`, `limit`, and `totalPages`.\n\nSoft delete (using an `isActive` flag instead of `DELETE`) preserves referential integrity. A category used by 500 transactions cannot be physically deleted without violating foreign-key constraints or losing history. Filtering `WHERE isActive = true` in every list query is the correct pattern.",
    scenario_id: "nestjs-fs-scenario-1",
    tasks: {
      create: [
        // ── L2-T1: Paginated & Filterable Transactions ────────────
        {
          task_name: "Paginated & Filterable Transaction List",
          test_type: "server",
          user_story:
            "As a user, I want to browse my transactions with pagination and filters so I can find specific records without loading the entire history.",
          learning_sections: {
            create: [
              {
                title: "Overview\nBuilding Paginated APIs with Prisma",
                content:
                  "This section introduces the crash course for implementing offset-based pagination with Prisma in NestJS. It covers query parameter parsing, Prisma's skip/take API, filter composition, and the response envelope pattern.",
                order: 1,
              },
              {
                title: "Why Pagination Matters",
                content:
                  "Without pagination, a user with 5 years of transaction history could trigger a query that returns 3,000+ rows. This:\n- Exhausts database memory for sorting\n- Serializes megabytes of JSON on the server\n- Blocks the event loop\n- Crashes the client trying to render it all\n\nPagination limits the damage to a fixed, small page size (e.g., 10-20 items) and gives the user controls to navigate.",
                order: 2,
              },
              {
                title: "Prisma skip and take",
                content:
                  "Prisma provides two pagination parameters:\n\nconst transactions = await prisma.transaction.findMany({\n  skip: (page - 1) * limit,  // how many rows to skip\n  take: limit,               // how many rows to return\n  where: { userId },\n  orderBy: { date: 'desc' },\n});\n\n`skip` is the offset. `take` is the limit. Both are integers. Prisma translates these into SQL `OFFSET` and `LIMIT` clauses.",
                order: 3,
              },
              {
                title: "The Paginated Response Envelope",
                content:
                  "Clients need more than just an array. They need metadata to render pagination controls:\n\n{\n  data: [...],      // the current page of items\n  total: 237,       // total matching records across all pages\n  page: 2,          // current page number\n  limit: 10,        // items per page\n  totalPages: 24    // ceil(total / limit)\n}\n\nAlways return the same envelope shape. Clients only need to check `totalPages` to know if a Next button should be enabled.",
                order: 4,
              },
              {
                title: "Composing WHERE Filters",
                content:
                  "Prisma's `where` object accepts multiple conditions that are ANDed together by default. The spread operator with conditional objects builds dynamic filters without nested if-statements. This keeps the code readable when there are 4 or more optional filters.",
                order: 5,
              },
              {
                title: "Counting for the Envelope",
                content:
                  "Two Prisma calls are needed for a proper paginated response:\n\nconst [data, total] = await Promise.all([\n  prisma.transaction.findMany({ skip, take, where, orderBy }),\n  prisma.transaction.count({ where }),\n]);\n\n`Promise.all` runs both queries concurrently. `count` uses the exact same `where` object so `total` reflects the filtered result set, not the entire table.",
                order: 6,
              },
              {
                title: "Practice Lab: Calculate Pagination Metadata",
                content:
                  "Practice writing the helper that converts total, page, and limit into a paginated envelope object.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Complete paginate(data, total, page, limit) so it returns { data, total, page, limit, totalPages } where totalPages is Math.ceil(total / limit).",
                  language: "javascript",
                  starter_code:
                    "export function paginate(data, total, page, limit) {\n  // TODO: return the paginated envelope\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO: return the paginated envelope",
                      case_sensitive: false,
                    },
                  ],
                  entry_point: "paginate",
                  test_cases: [
                    {
                      input: [[], 0, 1, 10],
                      expected: { data: [], total: 0, page: 1, limit: 10, totalPages: 0 },
                      label: "empty result set",
                    },
                    {
                      input: [[{ id: 1 }], 25, 2, 10],
                      expected: { data: [{ id: 1 }], total: 25, page: 2, limit: 10, totalPages: 3 },
                      label: "page 2 of 25 items",
                    },
                  ],
                },
                order: 7,
              },
              {
                title: "Key Takeaway",
                content:
                  "Pagination requires two database calls (findMany + count) with the same WHERE clause. Wrap them in Promise.all for concurrency. Return a consistent envelope so every client knows how to render navigation controls.",
                order: 8,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "The controller already receives query params via `@Query()`. Use `parseInt` with a fallback (e.g., `page = 1`, `limit = 20`) to ensure integers.",
                order: 1,
              },
              {
                description:
                  "Build a `where` object that conditionally includes `type`, `categoryId`, and `date` range. Pass the same `where` object to both `findMany` and `count`.",
                order: 2,
              },
              {
                description:
                  "The test checks for `res.body.data`, `res.body.total`, `res.body.page`, `res.body.limit`, and `res.body.totalPages`. Make sure all five keys are present in the response.",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description: "GET /api/transactions returns a paginated envelope with data, total, page, limit, totalPages",
                is_required: true,
                order: 1,
              },
              {
                description: "Defaults to page=1, limit=20 when no query params are provided",
                is_required: true,
                order: 2,
              },
              {
                description: "?type=EXPENSE filters to only expense transactions",
                is_required: true,
                order: 3,
              },
              {
                description: "?categoryId=<id> filters to transactions in that category",
                is_required: true,
                order: 4,
              },
              {
                description: "?startDate=2025-01-05&endDate=2025-01-10 filters to transactions within that date range",
                is_required: true,
                order: 5,
              },
            ],
          },
        },

        // ── L2-T2: Soft-Deleted Categories Visibility ─────────────
        {
          task_name: "Soft-Deleted Categories Visibility",
          test_type: "server",
          user_story:
            "As a user, I want inactive categories to be hidden from my category list so I don't accidentally use them, but I don't want to lose historical transactions tied to them.",
          learning_sections: {
            create: [
              {
                title: "Overview\nSoft Deletes with Prisma",
                content:
                  "This section introduces the crash course for implementing soft deletes in Prisma. It covers the `isActive` flag pattern, referential integrity, filtering in list queries, and rejecting invalid foreign-key references.",
                order: 1,
              },
              {
                title: "Hard Delete vs Soft Delete",
                content:
                  "A hard delete removes a row permanently:\n\nawait prisma.category.delete({ where: { id } });\n\nThis is dangerous when other tables have foreign keys pointing to it. Prisma will throw a foreign-key constraint error, or worse, cascade and delete 500 linked transactions.\n\nA soft delete keeps the row but sets a flag:\n\nawait prisma.category.update({\n  where: { id },\n  data: { isActive: false },\n});\n\nHistorical transactions remain intact. The category simply disappears from active lists.",
                order: 2,
              },
              {
                title: "Filtering Active Records",
                content:
                  "Every list query must explicitly filter for active records:\n\nconst categories = await prisma.category.findMany({\n  where: { isActive: true },\n});\n\nWithout this, inactive categories leak into the UI. The test specifically checks that `Inactive Cat` does NOT appear in GET /api/categories.",
                order: 3,
              },
              {
                title: "Guarding Transaction Creation",
                content:
                  "When a user creates a transaction, validate that the referenced category is active before inserting. This prevents stale data from being used after a soft delete:\n\nconst category = await prisma.category.findUnique({\n  where: { id: dto.categoryId },\n});\nif (!category || !category.isActive) {\n  throw new BadRequestException('Category is inactive or does not exist');\n}\n\nThis guard belongs in the service layer, right before the `prisma.transaction.create` call.",
                order: 4,
              },
              {
                title: "Prisma Model Configuration",
                content:
                  "The Category model already has `isActive Boolean @default(true)`. When a soft-delete is performed, this field is updated instead of calling `delete`. No schema changes are needed for this feature — only service and controller logic changes.",
                order: 5,
              },
              {
                title: "Practice Lab: Filter Active Items",
                content:
                  "Practice writing the filter logic used to exclude inactive items from a list.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    'Complete getActiveNames(items) so it returns only the names of items where item.isActive === true.',
                  language: "javascript",
                  starter_code:
                    "export function getActiveNames(items) {\n  // TODO: return names of active items only\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO: return names of active items only",
                      case_sensitive: false,
                    },
                  ],
                  entry_point: "getActiveNames",
                  test_cases: [
                    {
                      input: [[{ name: "Food", isActive: true }, { name: "Old", isActive: false }]],
                      expected: ["Food"],
                      label: "filters inactive",
                    },
                    {
                      input: [[{ name: "A", isActive: true }, { name: "B", isActive: true }]],
                      expected: ["A", "B"],
                      label: "all active",
                    },
                  ],
                },
                order: 6,
              },
              {
                title: "Key Takeaway",
                content:
                  "Soft delete is an `isActive` flag plus disciplined filtering. Filter it in every list query, guard it on every foreign-key write, and never use `.delete()` on a table with dependent records.",
                order: 7,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Update the `findAll` method in `categories.service.ts` to add `where: { isActive: true }` to the `prisma.category.findMany` call.",
                order: 1,
              },
              {
                description:
                  "In `transactions.service.ts → create()`, add a check that looks up the category by `categoryId` and throws if `!category || !category.isActive`.",
                order: 2,
              },
              {
                description:
                  "The test expects `GET /api/categories` to NOT contain an inactive category ID, and expects `POST /api/transactions` with an inactive `categoryId` to return 400. Make sure both endpoints are updated.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description: "Inactive categories do not appear in GET /api/categories",
                is_required: true,
                order: 1,
              },
              {
                description: "Creating a transaction with an inactive categoryId returns 400",
                is_required: true,
                order: 2,
              },
              {
                description: "Active categories remain usable for new transactions (201 response)",
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
  // LEVEL 3 — Business Logic & Validation
  // ─────────────────────────────────────────────────────────────
  {
    id: "nestjs-fs-level-3",
    title: "Business Logic & Validation",
    subtitle: "Guard account balances with atomic updates and track budgets against actual spending.",
    order: 3,
    deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: FlexiSpend handles real money — incorrect balance calculations or overspent budgets erode user trust. The job is to implement atomic balance updates (so concurrent transactions never drift), enforce funds guards (prevent overspending), and build a budget tracker that compares monthly limits against real transaction totals.",
    xp_reward: 200,
    coin_reward: 100,
    key_takeaways:
      "Atomic database operations are the only safe way to update financial counters under concurrent load. Prisma's `update` with `$inc` (or raw SQL with row-level locking) guarantees that two simultaneous expense requests both see the current balance and both deduct correctly. Read-modify-write at the application level has a race window that causes balance drift.\n\nBudget tracking is a computed view, not stored state. The budget table stores the limit; the transactions table stores the spending. The API computes `spent`, `remaining`, `percentUsed`, and `exceeded` on the fly by aggregating transactions per category per month. Deriving state from source data eliminates synchronization bugs between the budget and transaction tables.",
    scenario_id: "nestjs-fs-scenario-1",
    tasks: {
      create: [
        // ── L3-T1: Atomic Balance, Funds Guard & Field Validation ──
        {
          task_name: "Atomic Balance Updates, Funds Guard & Field Validation",
          test_type: "server",
          user_story:
            "As a user, I want my account balance to update accurately when I record transactions, and I want the app to prevent me from spending more than I have unless I explicitly allow negative balances.",
          learning_sections: {
            create: [
              {
                title: "Overview\nAtomic Financial Operations in Prisma",
                content:
                  "This section introduces the crash course for implementing safe balance updates in a financial application. It covers Prisma atomic operations, funds guards, field validation with class-validator, and the allowNegativeBalance flag.",
                order: 1,
              },
              {
                title: "The Race Condition Problem",
                content:
                  "Consider this unsafe sequence:\n\nconst account = await prisma.account.findUnique({ where: { id } });\nconst newBalance = Number(account.balance) - amount;\nawait prisma.account.update({\n  where: { id },\n  data: { balance: newBalance },\n});\n\nIf two requests both read $1000 and both try to deduct $600, both write $400. The final balance is $400 instead of $-200. This is a race condition caused by read-modify-write logic.",
                order: 2,
              },
              {
                title: "Prisma Atomic Operations",
                content:
                  "Prisma supports atomic operations that run inside a single SQL statement:\n\nawait prisma.account.update({\n  where: { id: accountId },\n  data: {\n    balance: {\n      increment: type === 'INCOME' ? amount : -amount,\n    },\n  },\n});\n\nThis translates to `UPDATE accounts SET balance = balance + delta WHERE id = ?`. The database handles the read and write atomically — no race condition is possible. Always use atomic operations for financial counters.",
                order: 3,
              },
              {
                title: "Funds Guard Logic",
                content:
                  "Before creating an expense transaction, check if the account has sufficient funds (unless it explicitly allows negative balances):\n\nconst account = await prisma.account.findUnique({ where: { id: accountId } });\nif (\n  type === 'EXPENSE' &&\n  !account.allowNegativeBalance &&\n  Number(account.balance) < amount\n) {\n  throw new BadRequestException('Insufficient funds');\n}\n\nThe `allowNegativeBalance` flag (Boolean @default(false)) lets certain accounts (like credit cards) go below zero while cash wallets are strictly guarded.",
                order: 4,
              },
              {
                title: "Field Validation with class-validator",
                content:
                  "Use class-validator decorators to reject bad data before it reaches business logic. class-validator runs automatically when the `ValidationPipe` is applied globally in main.ts. This means negative amounts, invalid dates, and unknown enum values all return 400 before service code executes.",
                order: 5,
              },
              {
                title: "Rejecting Future Dates",
                content:
                  "For accurate financial records, transactions should not be dated in the future. Add a custom validation in the service or a `@MaxDate(new Date())` decorator in the DTO:\n\nconst transactionDate = new Date(dto.date);\nif (transactionDate > new Date()) {\n  throw new BadRequestException('Transaction date cannot be in the future');\n}\n\nThis prevents users from backloading future budget periods or gaming the trend reports.",
                order: 6,
              },
              {
                title: "Practice Lab: Atomic Balance Update",
                content:
                  "Practice writing the atomic balance update expression used in the transaction service.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Complete computeDelta(type, amount) so it returns +amount for INCOME and -amount for EXPENSE.",
                  language: "javascript",
                  starter_code:
                    "export function computeDelta(type, amount) {\n  // TODO: return +amount for INCOME, -amount for EXPENSE\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO: return +amount for INCOME, -amount for EXPENSE",
                      case_sensitive: false,
                    },
                  ],
                  entry_point: "computeDelta",
                  test_cases: [
                    {
                      input: ["INCOME", 100],
                      expected: 100,
                      label: "income adds",
                    },
                    {
                      input: ["EXPENSE", 50],
                      expected: -50,
                      label: "expense subtracts",
                    },
                  ],
                },
                order: 7,
              },
              {
                title: "Key Takeaway",
                content:
                  "Never read-modify-write financial counters. Use Prisma's atomic `increment` / `decrement` operations. Guard expenses with a funds check that respects the `allowNegativeBalance` flag. Validate all inputs with class-validator and custom service checks before touching the database.",
                order: 8,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "In `transactions.service.ts → create()`, wrap the balance update and transaction creation in a `prisma.$transaction([...])` block for atomicity, or use `prisma.account.update` with `{ balance: { increment: delta } }`.",
                order: 1,
              },
              {
                description:
                  "The funds guard should query the account first, then throw BadRequestException if the balance is insufficient and `allowNegativeBalance` is false.",
                order: 2,
              },
              {
                description:
                  "Add `@IsPositive()` to the amount field in CreateTransactionDto, and add a future-date check in the service. The test expects 400 for negative amounts and future dates.",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description: "EXPENSE decreases account balance atomically",
                is_required: true,
                order: 1,
              },
              {
                description: "INCOME increases account balance atomically",
                is_required: true,
                order: 2,
              },
              {
                description: "Rejects EXPENSE when balance is insufficient and allowNegativeBalance is false",
                is_required: true,
                order: 3,
              },
              {
                description: "Allows negative balance when allowNegativeBalance is true",
                is_required: true,
                order: 4,
              },
              {
                description: "Rejects transaction with negative amount (400)",
                is_required: true,
                order: 5,
              },
              {
                description: "Rejects transaction with a future date (400)",
                is_required: true,
                order: 6,
              },
            ],
          },
        },

        // ── L3-T2: Budget-vs-Actual Tracking ──────────────────────
        {
          task_name: "Budget-vs-Actual Tracking",
          test_type: "server",
          user_story:
            "As a user, I want to see how much of my monthly budget I've spent so I can adjust my spending before I exceed the limit.",
          learning_sections: {
            create: [
              {
                title: "Overview\nComputing Budget Metrics from Transactions",
                content:
                  "This section introduces the crash course for building a budget tracking endpoint. It covers Prisma aggregation with `groupBy`, computed fields in the API response, and the division-by-zero guard.",
                order: 1,
              },
              {
                title: "Budget Schema",
                content:
                  "The Budget model stores a monthly limit per category:\n\nmodel Budget {\n  id         String  @id @default(uuid())\n  amount     Decimal @db.Decimal(10, 2)\n  month      Int\n  year       Int\n  categoryId String\n  userId     String\n  @@unique([userId, categoryId, month, year])\n}\n\nThe `@@unique` constraint prevents duplicate budgets for the same user+category+month. Budgets are the ceiling; transactions are the floor. The API bridges them.",
                order: 2,
              },
              {
                title: "Aggregating Transactions by Category",
                content:
                  "Use Prisma's aggregate API to sum expenses per category in a given month. This returns an array of category IDs with summed amounts, which is mapped into the budget response to compute spent, remaining, and percentUsed.",
                order: 3,
              },
              {
                title: "Computing Budget Metrics",
                content:
                  "For each budget row, compute:\n\nconst spent = categorySpentMap[budget.categoryId] ?? 0;\nconst remaining = Number(budget.amount) - spent;\nconst percentUsed = budget.amount > 0\n  ? (spent / Number(budget.amount)) * 100\n  : 0;\nconst exceeded = spent > Number(budget.amount);\n\nReturn these as computed fields alongside the budget data. Never store `spent` or `percentUsed` in the database — they are derived values.",
                order: 4,
              },
              {
                title: "Division-by-Zero Guard",
                content:
                  "A budget with `amount = 0` (or any zero-value budget) must not produce `NaN` or `Infinity` when computing `percentUsed`:\n\nif (budgetAmount === 0) {\n  percentUsed = 0;\n} else {\n  percentUsed = (spent / budgetAmount) * 100;\n}\n\nThe test in Level 5 will specifically verify this guard. Get it right now and that test will pass automatically.",
                order: 5,
              },
              {
                title: "Date Range Construction",
                content:
                  "JavaScript Date months are 0-indexed (0 = January). When a user passes `month=1&year=2025`, construct the range as:\n\nconst start = new Date(2025, 0, 1);  // Jan 1, 2025\nconst end = new Date(2025, 1, 1);    // Feb 1, 2025 (exclusive)\n\nUse `gte: start` and `lt: end` in the Prisma `date` filter. This correctly includes all of January and excludes February 1st.",
                order: 6,
              },
              {
                title: "Practice Lab: Compute Percent Used",
                content:
                  "Practice writing the percentage computation with a zero guard.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Complete computePercentUsed(spent, budgetAmount) that returns (spent / budgetAmount) * 100, or 0 when budgetAmount is 0. Never return NaN or Infinity.",
                  language: "javascript",
                  starter_code:
                    "export function computePercentUsed(spent, budgetAmount) {\n  // TODO: return percent used, guarding against division by zero\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO: return percent used, guarding against division by zero",
                      case_sensitive: false,
                    },
                  ],
                  entry_point: "computePercentUsed",
                  test_cases: [
                    {
                      input: [300, 500],
                      expected: 60,
                      label: "normal case",
                    },
                    {
                      input: [0, 0],
                      expected: 0,
                      label: "zero budget",
                    },
                  ],
                },
                order: 7,
              },
              {
                title: "Key Takeaway",
                content:
                  "Budget tracking is a join between the budgets table and an aggregated view of the transactions table. Compute spent with Prisma groupBy, derive metrics in memory, and always guard against division by zero. Store limits, not computed state.",
                order: 8,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "In `budgets.service.ts`, query budgets for the user/month/year, then query transactions with `groupBy` to get the spent amount per category.",
                order: 1,
              },
              {
                description:
                  "Map the groupBy results into a lookup object `{ [categoryId]: spent }` for O(1) lookup when building the response.",
                order: 2,
              },
              {
                description:
                  "The test checks `spent`, `remaining`, `percentUsed`, and `exceeded` fields in the response. Make sure all four are present and that `exceeded` flips to true when spent > budget.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description: "GET /api/budgets?month=1&year=2025 returns budgets with spent, remaining, percentUsed, and exceeded fields",
                is_required: true,
                order: 1,
              },
              {
                description: "spent equals the sum of EXPENSE transactions in that category for the requested month",
                is_required: true,
                order: 2,
              },
              {
                description: "exceeded is true when spent > budget amount",
                is_required: true,
                order: 3,
              },
              {
                description: "percentUsed is 0 (not NaN/Infinity) when budget amount is 0",
                is_required: true,
                order: 4,
              },
            ],
          },
        },
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────
  // LEVEL 4 — Reporting & Analytics
  // ─────────────────────────────────────────────────────────────
  {
    id: "nestjs-fs-level-4",
    title: "Reporting & Analytics",
    subtitle: "Build monthly summaries, trend reports, category breakdowns, and budget alerts.",
    order: 4,
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: FlexiSpend users need insights into their spending habits. The product team wants a monthly summary dashboard, a multi-month trend line, a category breakdown pie chart, and proactive budget alerts when users approach their limits. These endpoints aggregate large datasets — correctness and performance are equally important.",
    xp_reward: 250,
    coin_reward: 125,
    key_takeaways:
      "Aggregate queries should always be scoped to an indexed column (userId, date range) so the database scans a small subset of rows instead of the entire transactions table. Prisma's `aggregate`, `groupBy`, and raw query APIs each have different performance characteristics — the right one depends on the report shape and the most efficient SQL it generates.\n\nBudget alerts are a filtered, sorted view of the same budget data. Instead of duplicating the query, a reusable helper computes budget metrics (spent, remaining, percentUsed) and a `percentUsed >= 80` filter is applied on top. Reusing computation logic prevents the alerts and the budget page from diverging.",
    scenario_id: "nestjs-fs-scenario-1",
    tasks: {
      create: [
        // ── L4-T1: Monthly Summary & Trend Reports ────────────────
        {
          task_name: "Monthly Summary & Trend Reports",
          test_type: "server",
          user_story:
            "As a user, I want to see my total income, expenses, and net savings for any month, and I want a trend report showing my financial health over the last several months.",
          learning_sections: {
            create: [
              {
                title: "Overview\nBuilding Financial Reports with Prisma",
                content:
                  "This section introduces the crash course for building aggregate financial reports. It covers Prisma aggregate API, date-range filtering, raw queries for grouped data, and ensuring chronological ordering in trend reports.",
                order: 1,
              },
              {
                title: "Monthly Summary: Aggregate by Type",
                content:
                  "A monthly summary needs three numbers: total income, total expense, and net savings. Use Prisma's `_sum` aggregate for each type:\n\nconst [incomeAgg, expenseAgg] = await Promise.all([\n  prisma.transaction.aggregate({\n    _sum: { amount: true },\n    where: { userId, type: 'INCOME', date: { gte: start, lt: end } },\n  }),\n  prisma.transaction.aggregate({\n    _sum: { amount: true },\n    where: { userId, type: 'EXPENSE', date: { gte: start, lt: end } },\n  }),\n]);\n\nconst totalIncome = Number(incomeAgg._sum.amount ?? 0);\nconst totalExpense = Number(expenseAgg._sum.amount ?? 0);\nconst netSavings = totalIncome - totalExpense;\n\nRun both queries in parallel with Promise.all for better performance.",
                order: 2,
              },
              {
                title: "Counting Transactions",
                content:
                  "The summary should also include how many transactions occurred in the period:\n\nconst transactionCount = await prisma.transaction.count({\n  where: { userId, date: { gte: start, lt: end } },\n});\n\nThis is a cheap query because it uses COUNT(*) instead of loading rows.",
                order: 3,
              },
              {
                title: "Trend Report: Grouping by Month",
                content:
                  "A trend report needs data for each month over a sliding window (e.g., last 6 months). Prisma's `groupBy` can group by month if the date column supports it, but PostgreSQL's `DATE_TRUNC` is more reliable:\n\nconst raw = await prisma.$queryRaw`\n  SELECT\n    EXTRACT(YEAR FROM date) AS year,\n    EXTRACT(MONTH FROM date) AS month,\n    SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END) AS totalIncome,\n    SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END) AS totalExpense\n  FROM transactions\n  WHERE userId = ${userId}\n    AND date >= ${start}\n  GROUP BY year, month\n  ORDER BY year, month\n`;\n\nRaw queries are acceptable for reports when Prisma's type-safe API cannot express the required SQL shape.",
                order: 4,
              },
              {
                title: "Chronological Ordering",
                content:
                  "Trend data must be sorted by time ascending so charts render left-to-right correctly:\n\nresults.sort((a, b) => {\n  const aKey = a.year * 100 + a.month;\n  const bKey = b.year * 100 + b.month;\n  return aKey - bKey;\n});\n\nThe test verifies that each entry's `(year * 100 + month)` is greater than or equal to the previous entry's. Never rely on database default ordering for reports.",
                order: 5,
              },
              {
                title: "Admin-Only Routes with Guards",
                content:
                  "Summary and trend endpoints should be protected by an admin or authenticated-user guard. NestJS guards intercept requests before they reach the controller. The JWT strategy extracts the user from the Authorization header; the guard ensures only valid tokens proceed.",
                order: 6,
              },
              {
                title: "Practice Lab: Compute Net Savings",
                content:
                  "Practice the simple arithmetic that drives the monthly summary.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Complete computeNetSavings(income, expense) that returns income minus expense.",
                  language: "javascript",
                  starter_code:
                    "export function computeNetSavings(income, expense) {\n  // TODO: return income - expense\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO: return income - expense",
                      case_sensitive: false,
                    },
                  ],
                  entry_point: "computeNetSavings",
                  test_cases: [
                    {
                      input: [2000, 600],
                      expected: 1400,
                      label: "positive savings",
                    },
                    {
                      input: [500, 800],
                      expected: -300,
                      label: "negative savings",
                    },
                  ],
                },
                order: 7,
              },
              {
                title: "Key Takeaway",
                content:
                  "Reports are aggregate queries over scoped, indexed data. Use Promise.all for parallel independent aggregates, raw SQL for complex groupings, and always sort chronologically. Protect report endpoints with authentication guards.",
                order: 8,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "In `reports.controller.ts` and `reports.service.ts`, implement `monthly-summary` with two `prisma.transaction.aggregate` calls (one for INCOME, one for EXPENSE) using the same date range.",
                order: 1,
              },
              {
                description:
                  "For the `trends` endpoint, query the last N months of data and group by year+month. Prisma `groupBy` with raw date extraction or `$queryRaw` with PostgreSQL `DATE_TRUNC('month', date)` can both be used.",
                order: 2,
              },
              {
                description:
                  "The test checks that trend entries have `month`, `year`, `totalIncome`, `totalExpense`, and `netSavings`, and that the array is sorted chronologically.",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description: "GET /api/reports/monthly-summary?month=1&year=2025 returns totalIncome, totalExpense, and netSavings",
                is_required: true,
                order: 1,
              },
              {
                description: "Monthly summary includes transactionCount",
                is_required: true,
                order: 2,
              },
              {
                description: "GET /api/reports/trends?months=3 returns an array sorted chronologically",
                is_required: true,
                order: 3,
              },
              {
                description: "Each trend entry has month, year, totalIncome, totalExpense, and netSavings",
                is_required: true,
                order: 4,
              },
            ],
          },
        },

        // ── L4-T2: Category Breakdown & Budget Alerts ──────────────
        {
          task_name: "Category Breakdown & Budget Alerts",
          test_type: "server",
          user_story:
            "As a user, I want to see how my spending breaks down by category and receive alerts when I'm close to exceeding any budget.",
          learning_sections: {
            create: [
              {
                title: "Overview\nCategory Analytics and Proactive Alerts",
                content:
                  "This section introduces the crash course for building category-level analytics and alert endpoints. It covers Prisma groupBy with ordering, percentage calculations, and filtering computed metrics.",
                order: 1,
              },
              {
                title: "Category Breakdown by Aggregated Spending",
                content:
                  "A category breakdown shows how much was spent in each category, as a percentage of total spending, plus the number of transactions:\n\nconst breakdown = await prisma.transaction.groupBy({\n  by: ['categoryId'],\n  where: { userId, type: 'EXPENSE', date: { gte: start, lt: end } },\n  _sum: { amount: true },\n  _count: { id: true },\n});\n\nFor each group, compute:\nconst percentage = totalSpent > 0\n  ? (categoryTotal / totalSpent) * 100\n  : 0;\n\nSort the final array by `total` descending so the largest category appears first.",
                order: 2,
              },
              {
                title: "Reusable Budget Metric Helper",
                content:
                  "Both the budget list and the alerts endpoint need the same computed fields. Extract a helper function that takes a budget row and a spent map, then returns the enriched object:\n\nfunction enrichBudget(budget, spentMap) {\n  const spent = spentMap[budget.categoryId] ?? 0;\n  const amount = Number(budget.amount);\n  return {\n    ...budget,\n    spent,\n    remaining: amount - spent,\n    percentUsed: amount > 0 ? (spent / amount) * 100 : 0,\n    exceeded: spent > amount,\n  };\n}\n\nReuse this helper in both GET /api/budgets and GET /api/reports/budget-alerts. Duplicating the computation logic leads to divergence bugs.",
                order: 3,
              },
              {
                title: "Filtering Alerts by Threshold",
                content:
                  "Budget alerts are budgets where `percentUsed >= 80` (or any defined threshold). Only the budgets that need attention are returned, sorted by severity (highest percent first). This gives the user a clear priority list.",
                order: 4,
              },
              {
                title: "Guarding Division by Zero in Percentages",
                content:
                  "When a budget has `amount = 0`, `percentUsed` must be `0`, never `NaN` or `Infinity`:\n\nconst percentUsed =\n  Number(budget.amount) === 0\n    ? 0\n    : (spent / Number(budget.amount)) * 100;\n\nThis guard also protects the alerts endpoint from producing invalid sort keys.",
                order: 5,
              },
              {
                title: "Response Shape for Breakdown",
                content:
                  "The category breakdown endpoint should return an array of objects with these exact fields:\n\n{\n  categoryName: string;\n  total: number;\n  percentage: number;\n  transactionCount: number;\n}\n\nInclude `categoryName` (not just `categoryId`) so the client can render labels without a second lookup. Prisma's `include: { category: true }` in a findMany or raw query joins the category name.",
                order: 6,
              },
              {
                title: "Practice Lab: Filter by Threshold",
                content:
                  "Practice filtering an array of objects by a computed threshold.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Complete getHighRiskBudgets(budgets) that returns only budgets where percentUsed >= 80, sorted by percentUsed descending.",
                  language: "javascript",
                  starter_code:
                    "export function getHighRiskBudgets(budgets) {\n  // TODO: filter percentUsed >= 80 and sort descending\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO: filter percentUsed >= 80 and sort descending",
                      case_sensitive: false,
                    },
                  ],
                  entry_point: "getHighRiskBudgets",
                  test_cases: [
                    {
                      input: [[{ name: "Food", percentUsed: 85 }, { name: "Transport", percentUsed: 40 }]],
                      expected: [{ name: "Food", percentUsed: 85 }],
                      label: "filters and sorts",
                    },
                  ],
                },
                order: 7,
              },
              {
                title: "Key Takeaway",
                content:
                  "Build reusable helpers for computed metrics so reports and alerts share the same logic. Filter alerts by threshold, sort by severity, and always guard division by zero. Include category names in the response so clients render without extra lookups.",
                order: 8,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Implement `category-breakdown` in `reports.service.ts` using `prisma.transaction.groupBy` with `_sum` and `_count`, then enrich each entry with the category name.",
                order: 1,
              },
              {
                description:
                  "For `budget-alerts`, reuse the same budget-enrichment logic as the budgets endpoint, then `.filter(b => b.percentUsed >= 80)` and `.sort((a, b) => b.percentUsed - a.percentUsed)`.",
                order: 2,
              },
              {
                description:
                  "The test expects the breakdown to be sorted by total descending, and expects alerts to exclude budgets under 80% used. Verify both orderings.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description: "GET /api/reports/category-breakdown returns entries sorted by total descending",
                is_required: true,
                order: 1,
              },
              {
                description: "Each breakdown entry has categoryName, total, percentage, and transactionCount",
                is_required: true,
                order: 2,
              },
              {
                description: "GET /api/reports/budget-alerts only returns budgets with percentUsed >= 80",
                is_required: true,
                order: 3,
              },
              {
                description: "Alerts are sorted by percentUsed descending (highest first)",
                is_required: true,
                order: 4,
              },
            ],
          },
        },
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────
  // LEVEL 5 — Production Hardening
  // ─────────────────────────────────────────────────────────────
  {
    id: "nestjs-fs-level-5",
    title: "Production Hardening",
    subtitle: "Fix balance drift, timezone inconsistency, and division-by-zero bugs under load.",
    order: 5,
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: Three critical bugs have been reported by FlexiSpend users. First, account balances occasionally drift after rapid transaction creation and deletion. Second, monthly reports show inconsistent totals depending on the server's timezone. Third, setting a budget to zero causes the dashboard to display NaN. These are production-grade issues that require database-level fixes and defensive coding.",
    xp_reward: 300,
    coin_reward: 150,
    key_takeaways:
      "Pessimistic locking (or atomic operations) is the only reliable way to prevent balance drift under concurrent load. Application-level read-modify-write sequences have a race window that grows with traffic. In PostgreSQL, `SELECT ... FOR UPDATE` inside a transaction locks the row before updating it, ensuring that no other request can modify the balance between the read and the write.\n\nTimezone-aware date filtering is essential for financial reports that group by calendar day. Using `new Date()` or server-local time in SQL queries produces different results depending on where the server is deployed. Dates should always be stored in UTC, and PostgreSQL timezone-aware functions (`AT TIME ZONE`) or Prisma date filters with explicit UTC boundaries should be used.\n\nDivision by zero in budget math is a silent bug that corrupts dashboards. A budget amount of zero is valid user input (users might want to track spending without a limit), so the computation must handle it gracefully by returning 0% instead of NaN or Infinity.",
    scenario_id: "nestjs-fs-scenario-1",
    tasks: {
      create: [
        // ── L5-T1: Fix Balance Drift, Timezone & Budget Math ───────
        {
          task_name: "Fix Balance Drift, Timezone & Budget Math",
          test_type: "server",
          user_story:
            "As a user, I want my account balance to be accurate even after rapid edits, and I want my monthly reports to be consistent regardless of when I view them.",
          learning_sections: {
            create: [
              {
                title: "Overview\nProduction Bugs: Concurrency, Timezone, and Math",
                content:
                  "This section introduces the crash course for diagnosing and fixing three common production bugs in financial applications: balance drift from race conditions, timezone inconsistency in date-grouped reports, and division-by-zero in budget calculations.",
                order: 1,
              },
              {
                title: "Bug #1: Balance Drift from Race Conditions",
                content:
                  "Client Report: 'I added a $500 expense and then deleted it, but my balance shows $9,500 instead of $10,000.'\n\nRoot cause: The transaction creation and deletion both read the balance, compute a new value, and write it back. If two requests overlap, one overwrites the other's change.\n\nFix: Use an interactive transaction with `SELECT ... FOR UPDATE` (pessimistic locking) or atomic `increment`/`decrement` operations. Prisma supports interactive transactions:\n\nawait prisma.$transaction(async (tx) => {\n  await tx.account.updateMany({\n    where: { id: accountId },\n    data: { balance: { increment: delta } },\n  });\n  await tx.transaction.create({ data: { ... } });\n});\n\nThis locks the account row for the duration of the transaction, preventing concurrent modifications.",
                order: 2,
              },
              {
                title: "Bug #2: Timezone Inconsistency in Reports",
                content:
                  "Client Report: 'My January report shows different totals when I check it at 11 PM vs 1 AM.'\n\nRoot cause: The report groups transactions by calendar day using the server's local timezone. A transaction at 2026-01-15T23:00:00Z is January 15 in UTC but January 16 in Tokyo (+9).\n\nFix: UTC date boundaries should always be used in SQL queries, and all dates should be stored in UTC. When grouping by day, truncate to UTC midnight. For Prisma, explicit UTC start/end dates are constructed in the controller and passed to the service. The server-local time or `new Date()` should never be relied upon for report boundaries.",
                order: 3,
              },
              {
                title: "Bug #3: Division by Zero in Budget Math",
                content:
                  "Client Report: 'When I set a budget to zero, the dashboard shows NaN% and breaks the charts.'\n\nRoot cause: `percentUsed = (spent / budgetAmount) * 100` produces `NaN` when `budgetAmount` is 0. JavaScript does not throw on division by zero — it silently returns `NaN` or `Infinity`.\n\nFix: Add a zero guard that checks for zero or null budget amount before dividing. Validation with `Number.isFinite(percentUsed)` in tests catches remaining edge cases.",
                order: 4,
              },
              {
                title: "Prisma Interactive Transactions",
                content:
                  "Prisma's `$transaction` API accepts an async function that receives a transaction-bound client. If any query inside the callback fails, the entire transaction rolls back. This keeps the account balance and the transaction record in perfect sync.",
                order: 5,
              },
              {
                title: "Consistent Report Totals",
                content:
                  "The test verifies that calling the same report twice returns the same total. This catches non-deterministic queries caused by:\n- Missing `ORDER BY` clauses\n- Using `new Date()` inside the query instead of fixed boundaries\n- Timezone-dependent date truncation\n\nAlways pass explicit `start` and `end` dates from the controller, and use them consistently in both `aggregate` and `findMany` calls.",
                order: 6,
              },
              {
                title: "Practice Lab: Safe Division",
                content:
                  "Practice writing the defensive division function used in budget math.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Complete safeDivide(numerator, denominator) that returns numerator / denominator, or 0 when denominator is 0. Never return NaN or Infinity.",
                  language: "javascript",
                  starter_code:
                    "export function safeDivide(numerator, denominator) {\n  // TODO: return numerator / denominator, or 0 if denominator is 0\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO: return numerator / denominator, or 0 if denominator is 0",
                      case_sensitive: false,
                    },
                  ],
                  entry_point: "safeDivide",
                  test_cases: [
                    {
                      input: [300, 500],
                      expected: 0.6,
                      label: "normal division",
                    },
                    {
                      input: [100, 0],
                      expected: 0,
                      label: "zero denominator",
                    },
                  ],
                },
                order: 7,
              },
              {
                title: "Key Takeaway",
                content:
                  "Production financial systems need three defenses: atomic transactions (or locking) for balance updates, explicit UTC date boundaries for reports, and zero-guarded division for all percentage calculations. These three rules prevent the most common classes of production bugs in fintech backends.",
                order: 8,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Wrap the balance update and transaction creation in `prisma.$transaction(async (tx) => { ... })`. This ensures both succeed or both rollback.",
                order: 1,
              },
              {
                description:
                  "For timezone consistency, construct the month start and end as UTC Dates in the controller: `new Date(Date.UTC(year, month - 1, 1))` and `new Date(Date.UTC(year, month, 1))`. Pass these exact values to every query.",
                order: 2,
              },
              {
                description:
                  "Add `if (Number(budget.amount) === 0) return 0;` before computing `percentUsed` in both the budgets service and the alerts endpoint.",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description: "Balance stays consistent after sequential create-delete cycle",
                is_required: true,
                order: 1,
              },
              {
                description: "percentUsed is 0 and not NaN/Infinity when budgetAmount is zero",
                is_required: true,
                order: 2,
              },
              {
                description: "Monthly summary returns consistent totals on repeated calls",
                is_required: true,
                order: 3,
              },
            ],
          },
        },

        // ── L5-T2: Postmortem Document ────────────────────────────
        {
          task_name: "Write a Postmortem Document",
          test_type: "none",
          user_story:
            "As an engineering team member, I want to document the root causes of the three production bugs so we can prevent them in future projects.",
          learning_sections: {
            create: [
              {
                title: "Overview\nWriting Production Postmortems",
                content:
                  "This section introduces the crash course for writing a technical postmortem. It covers root cause analysis, the Five Whys technique, and how to structure a document that turns incidents into organizational learning.",
                order: 1,
              },
              {
                title: "What is a Postmortem?",
                content:
                  "A postmortem is a blameless document written after an incident that answers:\n\n1. What happened?\n2. Why did it happen? (root cause)\n3. How was it detected?\n4. How was it fixed?\n5. How do we prevent it from happening again?\n\nPostmortems are not about assigning blame. They are about improving systems, processes, and knowledge sharing across the team.",
                order: 2,
              },
              {
                title: "The Five Whys Technique",
                content:
                  "The Five Whys is a simple root-cause analysis method:\n\nProblem: Balance drift after concurrent transactions.\nWhy? Two requests both read $1000 before either wrote back.\nWhy? The code used read-modify-write instead of atomic operations.\nWhy? The developer did not know about Prisma's interactive transactions.\nWhy? There was no code review checklist for financial operations.\nWhy? The team had not documented concurrency patterns for this stack.\n\nEach 'why' digs deeper into the systemic cause rather than the surface symptom.",
                order: 3,
              },
              {
                title: "Documenting the Three Bugs",
                content:
                  "The postmortem should cover all three bugs fixed in Level 5, Task 1:\n\n1. Balance Drift / Race Condition\n   - Symptom: Incorrect balance after rapid create/delete\n   - Root cause: Read-modify-write without locking\n   - Fix: Prisma interactive transactions with atomic increment\n\n2. Timezone Inconsistency\n   - Symptom: Report totals vary by time of day\n   - Root cause: Server-local date boundaries in SQL\n   - Fix: Explicit UTC date ranges in controller, passed to all queries\n\n3. Division by Zero / NaN in Budgets\n   - Symptom: Dashboard shows NaN% when budget is $0\n   - Root cause: Unchecked division in percentage calculation\n   - Fix: Zero-guard before every division, validation with isFinite()",
                order: 4,
              },
              {
                title: "Action Items and Prevention",
                content:
                  "Every postmortem must end with concrete action items:\n\n- Add a code review checklist for financial endpoints (must use transactions or atomic ops)\n- Add lint rules that flag raw `new Date()` in SQL queries\n- Add unit tests for zero-input edge cases in all percentage calculations\n- Schedule a team workshop on Prisma interactive transactions\n\nAction items with owners and deadlines turn postmortems from documentation into prevention.",
                order: 5,
              },
              {
                title: "Practice Lab: Identify a Root Cause",
                content:
                  "Practice the Five Whys by tracing a simple bug to its systemic cause.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    'Given a bug description, return the deepest root cause from the options. This is a conceptual exercise — return the string "missing tests for zero input".',
                  language: "javascript",
                  starter_code:
                    "export function identifyRootCause() {\n  // TODO: return the deepest root cause\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO: return the deepest root cause",
                      case_sensitive: false,
                    },
                  ],
                  entry_point: "identifyRootCause",
                  test_cases: [
                    {
                      input: [],
                      expected: "missing tests for zero input",
                      label: "returns root cause",
                    },
                  ],
                },
                order: 6,
              },
              {
                title: "Key Takeaway",
                content:
                  "Postmortems turn painful incidents into durable team knowledge. Document the root cause, the fix, and the prevention plan. A good postmortem is read by new engineers six months later and saves them from making the same mistake.",
                order: 7,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Create a file named `POSTMORTEM.md` at the project root (same level as `package.json`).",
                order: 1,
              },
              {
                description:
                  "The test checks for lowercase mentions of 'balance', 'concurrency', 'race condition', 'timezone', 'utc', 'division', 'nan', 'infinity', and 'zero'. Make sure each concept appears at least once.",
                order: 2,
              },
              {
                description:
                  "Structure the document with clear headings for each bug, followed by symptom, root cause, fix, and action items.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description: "POSTMORTEM.md exists at the project root",
                is_required: true,
                order: 1,
              },
              {
                description: "Document mentions balance drift / race condition / concurrency root cause",
                is_required: true,
                order: 2,
              },
              {
                description: "Document mentions timezone / UTC root cause",
                is_required: true,
                order: 3,
              },
              {
                description: "Document mentions division-by-zero / NaN / Infinity root cause",
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
