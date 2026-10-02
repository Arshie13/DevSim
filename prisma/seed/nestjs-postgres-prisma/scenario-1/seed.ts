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
          test_type: "both",
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
                  "When a project is cloned, no dependencies are installed yet — node_modules is in .gitignore. Dependencies must be installed by running pnpm install at the project root.\n\nKey packages in this project:\n- @nestjs/core, @nestjs/common — framework runtime\n- @nestjs/platform-express — HTTP server adapter\n- @prisma/client — type-safe database client\n- prisma — CLI for migrations and schema management\n- bcrypt — password hashing\n- zod — request-body validation through Zod schemas and ZodValidationPipe\n- supertest — HTTP assertions in tests\n\nThe Prisma CLI and Prisma Client are separate packages. The CLI handles migrations; the Client is what services import at runtime.",
                order: 4,
              },
              {
                title: "Prisma Schema and Migrations",
                content:
                  "The Prisma schema (prisma/schema.prisma) is the single source of truth for the database structure. Models define tables, fields define columns, and decorators define constraints like `@id`, `@unique`, and `@default`.\n\nAfter editing the schema, changes are applied with:\npnpm exec prisma migrate dev --name add_user_fields\n\nThis generates a SQL migration file and applies it to the database. Then run:\npnpm exec prisma generate\n\nThis regenerates the Prisma Client TypeScript types so services get autocomplete and type checking.",
                order: 5,
              },
              {
                title: "Prisma Fields, Types, and Optionality",
                content:
                  "A Prisma model is made up of fields. Each field has a name, a type, and optional attributes.\n\nCommon scalar types:\n- `String` — text\n- `Int` — whole numbers\n- `Boolean` — true/false\n- `DateTime` — timestamps\n- `Decimal` — exact money values\n\nA field is required by default. Adding a `?` right after the type makes it optional (nullable):\n\n  `name String`   → required\n  `name String?`  → optional\n\nOptional fields can be left empty when a record is created, while required fields must always have a value.",
                order: 6,
              },
              {
                title: "Practice Lab: Prisma Model Field",
                content:
                  "Practice adding a field to a real Prisma model definition.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Add an optional note field with the String type under this model.",
                  language: "prisma",
                  starter_code:
                    "model Transaction {\n  id          String          @id @default(uuid())\n  amount      Decimal         @db.Decimal(10, 2)\n  type        TransactionType\n  description String?\n  // TODO: add note field here\n  date        DateTime\n  accountId   String\n  userId      String\n  createdAt   DateTime        @default(now())\n  updatedAt   DateTime        @updatedAt\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO: add note field here",
                      case_sensitive: true,
                    },
                  ],
                  test_cases: [
                    {
                      input: [],
                      expected: "note String?",
                      label: "optional note field",
                    },
                  ],
                  hints: [
                    "Add an optional string field named note.",
                    "Fields are written as `name Type`, and a `?` after the type makes it optional.",
                    "note String?"
                  ],
                },
                order: 7,
              },
              {
                title: "Environment Variables",
                content:
                  "Sensitive config (like database URIs) is stored in .env files — never hardcoded in source code.\n\nDATABASE_URL=postgresql://user:password@localhost:5432/flexispend\nJWT_SECRET=changeme\nPORT=3000\n\nThe app reads these values straight from `process.env`, and `src/main.ts` falls back to port 3000 when `PORT` is unset. Prisma reads DATABASE_URL directly from .env. ⚠️ .env files are listed in .gitignore intentionally — they contain secrets that should never be committed to version control.\n\nNote: Environment variables in this project are pre-configured.",
                order: 8,
              },
              {
                title: "Seeding the Database",
                content:
                  "A seed script populates the database with realistic sample data so development can proceed against a real dataset instead of an empty one. The FlexiSpend seed creates 2 users, 8 default categories, 3 accounts, and ~18 transactions.\n\nRun the seed with:\npnpm exec prisma db seed\n\nThis command is defined in the root package.json and calls prisma/seed.ts via ts-node.",
                order: 9,
              },
              {
                title: "Key Takeaway",
                content:
                  "Setting up a project is more than running one command — it means aligning the local environment (dependencies, env vars, database) so the app runs identically for every developer on the team. Getting this right first enables building features with confidence.",
                order: 10,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Open `src/app.module.ts` and make sure it exports an `AppModule` class that imports every feature module the app needs, each of which `providers` and `exports` what its own files inject. In `src/prisma/prisma.service.ts` add a `PrismaService` class that extends `PrismaClient` and calls `await this.$connect()` from an `onModuleInit` lifecycle method, and export the class.",
                order: 1,
              },
              {
                description:
                  "The server calls `app.setGlobalPrefix('api')`, so every controller has to sit under that prefix for `GET /api` to answer at all. A `@Get()` handler in a module that `AppModule` imports gives you the path `/api`. You do not need a root controller. Any status below 500 counts.",
                order: 2,
              },
              {
                description:
                  "Build `POST /api/auth/login` under `src/auth/`, taking an email and a password in the body. Look the user up by email, and when nothing comes back throw `UnauthorizedException`. The status has to be exactly 401.",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Build and start the application without errors",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Verify the database connection works by running a test query",
                is_required: true,
                order: 2,
              },
              {
                description: "Access the API root endpoint and verify it responds successfully",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Attempt login with invalid credentials and verify it's rejected",
                is_required: true,
                order: 4,
              },
            ],
          },
        },

        // ── L1-T2: Add a Note Field to Transactions ─────────────────
        {
          task_name: "Add a Note Field to Transactions",
          test_type: "both",
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
                  "NestJS uses DTOs to define the shape of incoming request bodies. The CreateTransactionDto tells NestJS what fields to expect when someone POSTs to /api/transactions. In this project DTOs are Zod schemas — `CreateTransactionDtoSchema` in `src/transactions/dto/create-transaction.dto.ts` — and the `ZodValidationPipe` on the route runs `schema.parse()` to reject invalid data before the service layer sees it. Only keys declared in the schema survive parsing.",
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
                    "Implement getTransactionNote(note) returning string when provided/non-empty, undefined when null/empty.\n\nExamples: getTransactionNote(\"lunch\")→\"lunch\", getTransactionNote(\"\")→undefined.",
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
                
                  hints: [
                    "Check if exists and not empty.",
                    "if (!note || note === \"\") return undefined; return note;",
                    "if (___ || note === \"\") return undefined; return ___;"
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
                  "Open `prisma/schema.prisma`, find the `Transaction` model, and add `note String?` as a field on it. Then run `pnpm exec prisma migrate dev --name add_transaction_note` and, once that finishes, `pnpm exec prisma generate`.",
                order: 1,
              },
              {
                description:
                  "In `src/transactions/dto/create-transaction.dto.ts` add `note: z.string().optional()` to `CreateTransactionDtoSchema` — the schema, not a decorator on a class, because `ZodValidationPipe` strips any key it does not declare. Then in `src/transactions/transactions.service.ts` the `create` method builds an explicit `data` object, so add `note: dto.note` to it. In `src/transactions/transactions.controller.ts` the create handler returns the raw Prisma result, so the saved value comes back in the 201 response body on its own.",
                order: 2,
              },
              {
                description:
                  "`POST /api/auth/login` returns the JWT in a field named `accessToken`, and it is sent back as `Authorization: Bearer <accessToken>`. The create handler in `src/transactions/transactions.controller.ts` has to read the current user from that token, for example through the auth guard and the request object it decorates.",
                order: 3,
              },
              {
                description:
                  "The list handler in `src/transactions/transactions.controller.ts` returns the Prisma result, which already includes every scalar field, so once the model and schema carry `note` it shows up automatically. `GET /api/transactions` may answer with a bare JSON array or with a `{ data: [...] }` envelope, because the list is read as `(listRes.body.data ?? listRes.body).map(t => t.note)`. Make sure a transaction saved with `groceries` shows that exact value on the list.",
                order: 4,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Create a transaction with a note and verify it's saved correctly",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Create an expense with note \"lunch with team\" and verify the note appears in the response",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Create a transaction without a note and verify it succeeds without a note",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "List transactions and verify the saved note \"groceries\" appears in the results",
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
  // LEVEL 2 — Data Modeling & API Foundations
  // ─────────────────────────────────────────────────────────────
  {
    id: "nestjs-fs-level-2",
    title: "Data Modeling & API Foundations",
    subtitle: "Build paginated transaction lists and guard visibility with soft-delete categories.",
    order: 2,
    level_description:
      "Mission Briefing: FlexiSpend users need to browse transactions efficiently, and inactive categories should be hidden from daily use. Implement page/limit pagination and filters, then enforce soft-delete visibility rules. The tests check response shape/counts and category visibility/use; they do not verify row ordering, exact date-filter membership, or preservation of pre-existing historical transactions.",
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
          test_type: "both",
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
                    "Implement paginate(data, total, page, limit) returning {data,total,page,limit,totalPages}. totalPages = Math.ceil(total/limit), 0 when total is 0.\n\nExample: paginate([],0,1,10)→{data:[],total:0,page:1,limit:10,totalPages:0}.",
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
                
                  hints: [
    "Compute totalPages with Math.ceil, handle zero.",
    "You need a running total that accumulates across all elements. Which array method takes an accumulator function and a starting value?",
    "const tp = total === ___ ? ___ : Math.ceil(total / ___);"
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
                  "The list is assembled in `findAll()` in `src/transactions/transactions.controller.ts`. It needs the whole `@Query()` object, with `page` and `limit` read from it and parsed with `parseInt`, falling back to `page = 1` and `limit = 20`.",
                order: 1,
              },
              {
                description:
                  "Pagination is offset-based, not cursor-based, so `findAll()` in `src/transactions/transactions.service.ts` skips `(page - 1) * limit` rows and takes `limit`.",
                order: 2,
              },
              {
                description:
                  "In `findAll()` in `src/transactions/transactions.service.ts` the filter has to be one single object that conditionally spreads in `type`, `categoryId` and a `date` range built from the `startDate` and `endDate` query params (`date: { gte, lte }`), and that same object goes to both `findMany` and `count`.",
                order: 3,
              },
              {
                description:
                  "The response body has to carry all five keys: `data`, `total`, `page`, `limit` and `totalPages`. A `?type=EXPENSE` request returns `total` 15 with every row in `data` at `type === \"EXPENSE\"`.",
                order: 4,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "View page 1 with 5 items per page and verify the paginated response includes all required fields",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Verify page 1 with limit 5 returns five rows and the paginated response metadata; row identity/order is not asserted",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "View transactions without filters and verify default pagination (page 1, 20 items)",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Filter transactions by expense type and verify only expenses are returned with correct total",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "Filter transactions by category and verify correct count is returned",
                is_required: true,
                order: 5,
              },
              {
                description:
                  "Filter transactions by date range and verify the total is within the test's asserted range (1–6); individual row dates are not checked",
                is_required: true,
                order: 6,
              },
            ],
          },
        },

        // ── L2-T2: Soft-Deleted Categories Visibility ─────────────
        {
          task_name: "Soft-Deleted Categories Visibility",
          test_type: "both",
          user_story:
            "As a user, I want inactive categories hidden from my category list and rejected for new transactions so that I do not accidentally use them.",
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
                  "A hard delete removes a row permanently:\n\nawait prisma.category.delete({ where: { id } });\n\nThis is dangerous when other tables have foreign keys pointing to it. Prisma will throw a foreign-key constraint error, or worse, cascade and delete 500 linked transactions.\n\nA soft delete keeps the row but sets a flag:\n\nawait prisma.category.update({\n  where: { id },\n  data: { isActive: false },\n});\n\nThe soft-delete pattern is intended to preserve historical transactions while hiding the category from active lists. This scenario's tests verify visibility and rejection of new transactions, but do not create or check historical transactions.",
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
                    "Implement getActiveNames(items) returning names of items where isActive is true.\n\nExamples: getActiveNames([{name:\"Food\",isActive:true},{name:\"Old\",isActive:false}])→[\"Food\"].",
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
                
                  hints: [
                    "Filter then map.",
                    "Walk through the array and build a new one keeping only the items that pass your check. What method lets you test each item against a condition?",
                    "return items.filter(i => ___.___).map(i => ___.___);"
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
                  "The list lives in `findAll()` in `src/categories/categories.service.ts`, and the query needs to skip inactive categories, so add `where: { isActive: true }` to the `prisma.category.findMany` call.",
                order: 1,
              },
              {
                description:
                  "The list is read as `(res.body.data ?? res.body).map(c => c.id)`, so a bare array or a `{ data: [...] }` envelope both work. Either way the inactive category's id must be missing from the result.",
                order: 2,
              },
              {
                description:
                  "The transaction guard belongs in `create()` in `src/transactions/transactions.service.ts`, which looks the category up with `prisma.category.findUnique({ where: { id: dto.categoryId } })` and throws when `!category || !category.isActive`. Any status from 400 to 499 is accepted. A success status (200 to 299) is the failure to avoid.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "View categories list and verify active categories appear while inactive ones are hidden",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Try to create a transaction with an inactive category and verify it's rejected",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Create a transaction with an active category and verify it succeeds",
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
          test_type: "both",
          user_story:
            "As a user, I want my account balance to update accurately when I record transactions, and I want the app to prevent me from spending more than I have unless I explicitly allow negative balances.",
          learning_sections: {
            create: [
              {
                title: "Overview\nAtomic Financial Operations in Prisma",
                content:
                  "This section introduces the crash course for implementing safe balance updates in a financial application. It covers Prisma atomic operations, funds guards, field validation with Zod schemas, and the allowNegativeBalance flag.",
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
                title: "Field Validation with Zod Schemas",
                content:
                  "Use the Zod schema for each route to reject bad data before it reaches business logic. Routes attach `ZodValidationPipe`, which calls `schema.parse()` and throws a 400 when parsing fails. Rules such as `z.number().positive()` or `z.string().datetime()` on the schema mean negative amounts, invalid dates, and unknown enum values all return 400 before service code executes.",
                order: 5,
              },
              {
                title: "Rejecting Future Dates",
                content:
                  "For accurate financial records, transactions should not be dated in the future. Add a custom validation in the service, or a `.refine()` on the date field of the Zod schema:\n\nconst transactionDate = new Date(dto.date);\nif (transactionDate > new Date()) {\n  throw new BadRequestException('Transaction date cannot be in the future');\n}\n\nThis prevents users from backloading future budget periods or gaming the trend reports.",
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
                    "Implement computeDelta(type, amount): INCOME→+amount, EXPENSE→-amount.\n\nExamples: computeDelta(\"INCOME\",100)→100, computeDelta(\"EXPENSE\",50)→-50.",
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
                
                  hints: [
                    "Check type, return appropriate sign.",
                    "if (type === \"INCOME\") return amount; return -amount;",
                    "if (type === \"___\") return ___; return ___;"
                  ],
                },
                order: 7,
              },
              {
                title: "Key Takeaway",
                content:
                  "Never read-modify-write financial counters. Use Prisma's atomic `increment` / `decrement` operations. Guard expenses with a funds check that respects the `allowNegativeBalance` flag. Validate all inputs with Zod schemas and custom service checks before touching the database.",
                order: 8,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "The transactions service has to move the account balance by letting the database apply the delta in one operation, rather than reading the balance, working it out in JavaScript and writing a new value back. The `accounts` row is read straight from the database afterwards, so the delta has to be exact.",
                order: 1,
              },
              {
                description:
                  "The funds guard sits with the expense path in the same service. Read the account first, then turn the expense away when `type === 'EXPENSE' && !account.allowNegativeBalance && Number(account.balance) < amount`. The rejected case needs a client error status between 400 and 499, and the `allowNegativeBalance: true` case needs exactly 201.",
                order: 2,
              },
              {
                description:
                  "The transaction input is rejected in two more places. A negative amount such as `-50` and a date 24 hours ahead both need a status of 400 or above. There is no upper bound, but any success status is a failure.",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Record an expense of 300 on an account with 1000 balance and verify balance becomes 700",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Record income of 500 on an account with 1000 balance and verify balance becomes 1500",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Try to spend 2000 from an account with 1000 balance (no negative allowed) and verify it's rejected",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Spend 500 from an account with 100 balance that allows negative and verify it succeeds",
                is_required: true,
                order: 4,
              },
              {
                description: "Try to record a transaction with a negative amount and verify it's rejected",
                is_required: true,
                order: 5,
              },
              {
                description:
                  "Try to record a transaction with a future date and verify it's rejected",
                is_required: true,
                order: 6,
              },
            ],
          },
        },

        // ── L3-T2: Budget-vs-Actual Tracking ──────────────────────
        {
          task_name: "Budget-vs-Actual Tracking",
          test_type: "both",
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
                    "Implement computePercentUsed(spent, budgetAmount) returning (spent/budgetAmount)*100, but 0 when budgetAmount is 0. Never NaN.\n\nExamples: computePercentUsed(300,500)→60, computePercentUsed(0,0)→0.",
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
                
                  hints: [
    "Guard division.",
    "The dangerous case is a specific input that breaks the calculation. Check for that case FIRST before dividing, and return a safe fallback number.",
    "if (budgetAmount === ___) return ___; return (spent / budgetAmount) * ___;"
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
                  "The budgets service reads `month` and `year` from the query, finds the budgets for the current user, and then works out the spending per category for that month. A category with no spending at all has to report 0 rather than nothing, so the lookup needs a fallback.",
                order: 1,
              },
              {
                description:
                  "Map the groupBy output into a lookup keyed by `categoryId`, shaped as `{ [categoryId]: sum }`. Read it with `spentMap[budget.categoryId] ?? 0` so a category with no spending reports 0 instead of `undefined`.",
                order: 2,
              },
              {
                description:
                  "The row is found by `b.category?.name === \"Food\" || b.categoryId === categoryId`. A budget of 500 with 300 spent must report `spent` 300, `remaining` 200, `percentUsed` 60 and `exceeded` false. A small float drift such as 60.0001 is fine. Adding one more 300 expense has to flip `exceeded` to true. All four computed fields belong on every budget row.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "View budgets for January 2025 and verify at least one budget exists",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "With a 500 budget and 300 spent, verify spent shows 300 and remaining shows 200",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Verify percent used shows 60%",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Verify budget shows not exceeded when spending is under limit",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "Add more spending to exceed budget and verify it shows as exceeded",
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
  // LEVEL 4 — Reporting & Analytics
  // ─────────────────────────────────────────────────────────────
  {
    id: "nestjs-fs-level-4",
    title: "Reporting & Analytics",
    subtitle: "Build monthly summaries, trend reports, category breakdowns, and budget alerts.",
    order: 4,
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
          test_type: "both",
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
                title: "Authenticated Routes with Guards",
                content:
                  "Summary and trend endpoints are protected by `JwtAuthGuard`, which requires a valid JWT — any authenticated user, not only admins. NestJS guards intercept requests before they reach the controller. The JWT strategy extracts the user from the Authorization header; the guard ensures only valid tokens proceed.",
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
                    "Implement computeNetSavings(income, expense) returning income minus expense.\n\nExamples: computeNetSavings(2000,600)→1400, computeNetSavings(500,800)→-300.",
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
                
                  hints: [
    "Subtract.",
    "Break this into smaller steps. What is the first transformation your input needs to become the output? Apply it, then think about the next step.",
    "return income ___ expense;"
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
                  "The monthly summary adds up income and expenses separately over the same window and then subtracts one from the other. A transaction count belongs alongside them as `transactionCount`, with `numberOfTransactions` accepted as an alternative name.",
                order: 1,
              },
              {
                description:
                  "The count is read as `res.body.transactionCount ?? res.body.numberOfTransactions` and has to be 4 for a month with four transactions. Counting the rows is the cheapest way to get it.",
                order: 2,
              },
              {
                description:
                  "The trend report has to answer with a bare JSON array. Wrapping the rows in `{ data: [...] }` fails immediately, because the body is checked with `Array.isArray(res.body)`. The `months` query param caps the row count, so `?months=3` gives 3 or fewer rows and `?months=6` at most 6.",
                order: 3,
              },
              {
                description:
                  "The trend rows run oldest to newest, so `year * 100 + month` never decreases as you read the array, and every entry carries `month`, `year`, `totalIncome`, `totalExpense` and `netSavings`.",
                order: 4,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "View monthly summary for January 2025 and verify income, expenses, and net savings",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Verify transaction count is shown",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "View trend report for last 3 months and verify it returns a list of months",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Verify trend data is sorted chronologically (oldest to newest)",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "Verify each trend entry has month, year, income, expenses, and net savings",
                is_required: true,
                order: 5,
              },
            ],
          },
        },

        // ── L4-T2: Category Breakdown & Budget Alerts ──────────────
        {
          task_name: "Category Breakdown & Budget Alerts",
          test_type: "both",
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
                    "Implement getHighRiskBudgets(budgets) returning budgets where percentUsed >= 80, sorted by percentUsed descending.\n\nExamples: getHighRiskBudgets([{name:\"Food\",percentUsed:85},{name:\"Transport\",percentUsed:40}])→[{name:\"Food\",percentUsed:85}].",
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
                
                  hints: [
                    "Filter >= 80, sort descending.",
                    "Walk through the array and build a new one keeping only the items that pass your check. What method lets you test each item against a condition?",
                    "return budgets.filter(b => b.___ >= ___).sort((a,b) => b.___ - a.___);"
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
                  "The category breakdown groups spending by category for the period, gives each group its share of the overall total as a percentage, and comes back largest first. Every entry needs `categoryName`, `total`, `percentage` and `transactionCount`.",
                order: 1,
              },
              {
                description:
                  "The `type` query param is optional. The route is called once as `?month=1&year=2025&type=EXPENSE` and once as `?month=1&year=2025` with no type at all, and both must return 200 with the same entry shape. Read it with `@Query('type')` and add it to the filter only when it is present.",
                order: 2,
              },
              {
                description:
                  "`GET /api/reports/budget-alerts` is called with no query params at all, and the seeded budgets live in January 2025, so the query must not be scoped to the current month and year — return every budget for the user. Enrich each budget with `spent`, `remaining`, `percentUsed` and `exceeded`, keep only `percentUsed >= 80`, and sort descending.",
                order: 3,
              },
              {
                description:
                  "The alert list is read as `(res.body.data ?? res.body).map(b => b.categoryName ?? b.category?.name)`, so a bare array or a `{ data: [...] }` envelope both work. Each row must carry the category name under one of those two keys, otherwise `Food` cannot be found.",
                order: 4,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "View spending breakdown by category for January 2025 expenses and verify categories ordered by spending (highest first)",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "View spending breakdown without type filter and verify each category shows name, total, percentage, and transaction count",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "View budget alerts and verify Food budget at 86% appears in alerts",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Verify Transport budget at 40% does not appear in alerts (below 80% threshold)",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "Verify alerts are sorted by percentage used (highest first)",
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
  // LEVEL 5 — Production Hardening
  // ─────────────────────────────────────────────────────────────
  {
    id: "nestjs-fs-level-5",
    title: "Production Hardening",
    subtitle: "Fix balance drift, timezone inconsistency, and division-by-zero bugs under load.",
    order: 5,
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
          test_type: "both",
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
                    "Implement safeDivide(numerator, denominator) returning numerator/denominator, but 0 when denominator is 0. Never NaN.\n\nExamples: safeDivide(300,500)→0.6, safeDivide(100,0)→0.",
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
                
                  hints: [
                    "Check denominator first.",
                    "For each field, you need to ask two questions: is it the right type, and is its value above the minimum? Both checks must pass for each field.",
                    "if (denominator === ___) return ___; return numerator / denominator;"
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
                  "A created transaction has to be removable again, and `DELETE /api/transactions/:id` has to honour the same `Authorization: Bearer <accessToken>` token as the create. The id it takes is the `id` from the create response body.",
                order: 1,
              },
              {
                description:
                  "The delete has to be the exact inverse of the create. Subtract the stored `amount` back onto the account for an EXPENSE, and add it for an INCOME. 10000 in, 500 out, 10000 back.",
                order: 2,
              },
              {
                description:
                  "A budget of `amount: 0` is located by a bare `categoryId` with no category relation. Its `percentUsed` must not be NaN, `isFinite(percentUsed) === true` must hold, and `Number(percentUsed) === 0`.",
                order: 3,
              },
              {
                description:
                  "Two calls to `GET /api/reports/monthly-summary?month=1&year=2025` carry the same query, so their `totalExpense` must be identical. Build the range from the request parameters with UTC boundaries such as `new Date(Date.UTC(year, month - 1, 1))` and reuse that exact range.",
                order: 4,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Create a transaction then delete it, verifying both operations work with the same authentication",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "On account with 10000 balance, add 500 expense then delete it, verify balance returns to exactly 10000",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Set a budget to 0 and verify it shows 0% used (not NaN or infinity)",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "View the same monthly report twice and verify both show identical totals",
                is_required: true,
                order: 4,
              },
            ],
          },
        },

        // ── L5-T2: Postmortem Document ────────────────────────────
        {
          task_name: "Write a Postmortem Document",
          test_type: "both",
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
                    "Implement identifyRootCause() returning the deepest root cause string. Conceptual exercise.",
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
                
                  hints: [
                    "Think about systemic cause, not surface symptom.",
                    "Relates to missing zero-input test coverage.",
                    "return \"___\" — what kind of tests?"
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
                  "Create `POSTMORTEM.md` at the project root, the directory that contains `package.json`. The file is resolved four levels up from `tests/server/level-5/task-2/`, so `docs/POSTMORTEM.md` or `src/POSTMORTEM.md` will not be found.",
                order: 1,
              },
              {
                description:
                  "The file is read and lowercased before matching, and each of the three checks accepts any one term from a keyword group. Take one term from each group. `balance`, `concurren`, `race condition` or `locking` for the first. `timezone`, `utc` or `date boundary` for the second. `division`, `nan`, `infinity`, `zero` or `budget amount` for the third.",
                order: 2,
              },
              {
                description:
                  "Give each bug its own heading, followed by its symptom, root cause, fix and action items. Putting all three concepts into one heading is the most reliable way to cover the three keyword groups.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Create a POSTMORTEM.md file at the project root (same folder as package.json)",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Document the balance drift bug: include terms about balance, concurrency, race condition, or locking",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Document the timezone bug: include terms about timezone, UTC, or date boundaries",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Document the division by zero bug: include terms about division, NaN, infinity, zero, or budget amount",
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
