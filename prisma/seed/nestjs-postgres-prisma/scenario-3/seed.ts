/**
 * Prisma Seed Script — IPPO POS System (NestJS Scenario 3)
 *
 * Seeds the database with Level and Scenario data for the IPPO POS learning scenario.
 */

export const scenarios = [
  {
    id: "nestjs-pos-scenario-3",
    name: "IPPO POS System",
    description:
      "Build and debug a production-grade Point-of-Sale system for a coffee shop using NestJS, PostgreSQL, and Prisma. Progress from environment setup through inventory guards, transactional checkout with tax and discount, sales reporting, and critical production bug fixes including overselling, decimal precision, and timezone inconsistency.",
    difficulty: "expert",
    is_paywalled: true,
  },
];

export const levels = [
  {
    id: "nestjs-pos-level-1",
    title: "Getting Familiar with the Codebase",
    subtitle: "Set up the development environment and make a first schema change.",
    order: 1,
    level_description:
      "Mission Briefing: A new developer has joined the IPPO POS engineering team. The first tasks are to get the NestJS + PostgreSQL + Prisma stack running locally and make a small but visible schema change — adding a phoneNumber field to store settings — so the codebase structure becomes clear end-to-end.",
    xp_reward: 100,
    coin_reward: 50,
    key_takeaways:
      "Setting up a NestJS + PostgreSQL + Prisma project requires understanding three layers: the NestJS runtime (controllers, services, modules), the Prisma schema (models, enums, relations), and the PostgreSQL database (migrations, seeds, connection strings). Knowing how to run `pnpm exec prisma migrate dev`, `pnpm exec prisma generate`, and `pnpm run start:dev` in the correct order is foundational for every backend developer on this stack.\n\nPrisma schema changes are the source of truth for the database. Adding a single field like `phoneNumber String?` to a model triggers a migration, updates the TypeScript types, and propagates to the API DTOs and service logic. Understanding this single-file-to-database pipeline is critical before building any feature.",
    scenario_id: "nestjs-pos-scenario-3",
    tasks: {
      create: [
        {
          task_name: "Prepare Development Environment",
          test_type: "both",
          user_story:
            "As a developer, I want to set up my local development environment so that I can run and modify the IPPO POS application.",
          learning_sections: {
            create: [
              {
                title: "Overview\nSetting Up a NestJS + PostgreSQL + Prisma POS",
                content:
                  "This section introduces the crash course for preparing a NestJS backend with PostgreSQL and Prisma for a Point-of-Sale system. It gives a high-level view of the setup flow, required tools, and key concepts needed before starting the hands-on tasks.",
                order: 1,
              },
              {
                title: "What is the IPPO POS System?",
                content:
                  "The IPPO POS System is a NestJS application using Prisma ORM with PostgreSQL. It has standard NestJS module structure with modules for Auth, Users, Products, Categories, Orders, Inventory, Reports, and Settings.\n\nNestJS — provides a modular architecture with decorators, dependency injection, and built-in support for REST APIs.\nPostgreSQL — stores users, products, categories, orders, and inventory.\nPrisma — defines the schema and generates the type-safe client.",
                order: 2,
              },
              {
                title: "How a NestJS App is Structured",
                content:
                  "A typical NestJS project is organized by feature modules:\n\nsrc/\n  ├── auth/          ← authentication module (JWT strategy, guards)\n  ├── users/         ← user management\n  ├── products/      ← product catalog\n  ├── categories/    ← product categories\n  ├── orders/        ← order management\n  ├── inventory/     ← stock tracking\n  ├── reports/       ← analytics endpoints\n  ├── settings/      ← store settings\n  ├── prisma/        ← schema, migrations, seed\n  └── main.ts        ← application bootstrap\n\nEach module contains its own controller, service, DTOs, and tests.",
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
                  "The Prisma schema (prisma/schema.prisma) is the single source of truth for the database structure.\n\nAfter editing the schema, changes are applied with:\npnpm exec prisma migrate dev --name init\n\nThis generates a SQL migration file and applies it to the database. Then run:\npnpm exec prisma generate\n\nThis regenerates the Prisma Client TypeScript types so services get autocomplete and type checking.",
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
                    "Add an optional phoneNumber field with the String type under this model.",
                  language: "prisma",
                  starter_code:
                    "model Setting {\n  id                 String  @id @default(uuid())\n  storeName          String  @default(\"My POS Store\")\n  storeAddress       String  @default(\"\")\n  taxRate            Decimal @db.Decimal(5, 2) @default(0)\n  acceptCash         Boolean @default(true)\n  acceptCard         Boolean @default(true)\n  // TODO: add phoneNumber field here\n  createdAt          DateTime @default(now())\n  updatedAt          DateTime @updatedAt\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO: add phoneNumber field here",
                      case_sensitive: true,
                    },
                  ],
                  test_cases: [
                    {
                      input: [],
                      expected: "phoneNumber String?",
                      label: "optional phoneNumber field",
                    },
                  ],
                  hints: [
                    "Add an optional string field named phoneNumber.",
                    "Fields are written as `name Type`, and a `?` after the type makes it optional.",
                    "phoneNumber String?"
                  ],
                },
                order: 7,
              },
              {
                title: "Environment Variables",
                content:
                  "Sensitive config (like database URIs) is stored in .env files — never hardcoded in source code.\n\nDATABASE_URL=postgresql://user:password@localhost:5432/pos_system\nJWT_SECRET=changeme\nJWT_EXPIRES_IN=1d\nPORT=3000\n\nThe app reads these values straight from `process.env`, and `src/main.ts` falls back to port 3000 when `PORT` is unset. Prisma reads DATABASE_URL directly from .env. ⚠️ .env files are listed in .gitignore intentionally — they contain secrets that should never be committed to version control.\n\nNote: Environment variables in this project are pre-configured.",
                order: 8,
              },
              {
                title: "Seeding the Database",
                content:
                  "A seed script populates the database with realistic sample data so development can proceed against a real dataset instead of an empty one. The IPPO POS seed creates default admin and cashier users for testing.\n\nRun the seed with:\npnpm exec prisma db seed\n\nThis command is defined in the root package.json and calls prisma/seed.ts via ts-node.",
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
                  "Run `pnpm install` from the project root, which is the directory that holds `package.json`, not from a subfolder such as `src/` or `prisma/`. Dependencies such as NestJS, Prisma, bcrypt, and supertest must all resolve before you touch anything else.",
                order: 1,
              },
              {
                description:
                  "Run `pnpm exec prisma migrate dev` and then `pnpm exec prisma generate`, in that order. The first applies the migrations in `prisma/migrations/` to the database named by `DATABASE_URL`, the second refreshes the client.",
                order: 2,
              },
              {
                description:
                  "Start the app with `pnpm run start:dev` and open `GET /api`. The bootstrap file is `src/main.ts` and the module tree is wired in `src/app.module.ts`. Any status below 500 means the app is up, and NestJS's default 404 already qualifies, so there is no root controller to add.",
                order: 3,
              },
              {
                description:
                  "The admin and cashier accounts come from `prisma/seed.ts`. Send `POST /api/auth/login` with a seeded email and `password123` and you get a JWT back in the `accessToken` field. The same request with a wrong password answers 401, and every later call sends that token as `Authorization: Bearer <accessToken>`.",
                order: 4,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description: "Start the application and verify the API root responds successfully",
                is_required: true,
                order: 1,
              },
              {
                description: "Verify the database connection works",
                is_required: true,
                order: 2,
              },
              {
                description: "Attempt login with wrong credentials and verify it's rejected",
                is_required: true,
                order: 3,
              },
              {
                description: "Login with valid seeded credentials and verify you get a JWT",
                is_required: true,
                order: 4,
              },
            ],
          },
        },
        {
          task_name: "Add a phoneNumber Field to Store Settings",
          test_type: "both",
          user_story:
            "As a store admin, I want to store the shop's phone number in settings so customers can call for support.",
          learning_sections: {
            create: [
              {
                title: "Overview\nExtending a Prisma Model",
                content:
                  "This section introduces the crash course for making a first schema change in a NestJS + Prisma codebase.",
                order: 1,
              },
              {
                title: "Prisma Models are Schema-First",
                content:
                  "In Prisma, database structure is defined in schema.prisma, then generate the client. The Setting model currently stores storeName, storeAddress, taxRate, acceptCash, and acceptCard. A phoneNumber field needs to be added that is optional (nullable).\n\nmodel Setting {\n  id           String   @id @default(uuid())\n  storeName    String   @default(\"My POS Store\")\n  storeAddress String   @default(\"\")\n  taxRate      Decimal  @db.Decimal(5, 2) @default(0)\n  acceptCash   Boolean  @default(true)\n  acceptCard   Boolean  @default(true)\n  // TODO: add phoneNumber here\n}",
                order: 2,
              },
              {
                title: "Running a Migration",
                content:
                  "After editing schema.prisma, a migration is created:\n\npnpm exec prisma migrate dev --name add_setting_phone_number\n\nPrisma compares the schema against the current database state, generates a SQL migration file, and applies it. Then run `pnpm exec prisma generate` to update the TypeScript types.",
                order: 3,
              },
              {
                title: "Updating the Controller and Service",
                content:
                  "This settings module has no DTO classes: settings.controller.ts types the request body inline and settings.service.ts builds an explicit safeData object. Add phoneNumber?: string to the controller's inline body type, and add phoneNumber: data.phoneNumber to safeData so the service writes and returns it.",
                order: 4,
              },
              {
                title: "Updating the Service",
                content:
                  "Ensure the Settings service passes the phoneNumber through when creating or updating settings. No special logic is needed if the field is simply stored and returned.",
                order: 5,
              },
              {
                title: "Practice Lab: Return Optional String",
                content:
                  "Practice returning an optional string value from a function.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement getPhoneNumber(phoneNumber) returning string when provided/non-empty, null otherwise.\n\nExamples: getPhoneNumber(\"+1-555\")→\"+1-555\", getPhoneNumber(\"\")→null.",
                  language: "javascript",
                  starter_code:
                    "export function getPhoneNumber(phoneNumber) {\n  // TODO: return phoneNumber if non-empty, otherwise null\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO: return phoneNumber if non-empty, otherwise null",
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "getPhoneNumber",
                  test_cases: [
                    {
                      input: ["+1-555-0199"],
                      expected: "+1-555-0199",
                      label: "returns provided number",
                    },
                    {
                      input: [""],
                      expected: null,
                      label: "empty string returns null",
                    },
                    {
                      input: [null],
                      expected: null,
                      label: "null returns null",
                    },
                  ],
                
                  hints: [
                    "Check if exists and not empty.",
                    "if (!phoneNumber || phoneNumber === \"\") return null; return phoneNumber;",
                    "if (___ || phoneNumber === \"\") return ___; return ___;"
                  ],
                },
                order: 6,
              },
              {
                title: "Key Takeaway",
                content:
                  "In a Prisma + NestJS stack, schema changes flow in one direction: schema.prisma → migration → generated client → DTO → service → controller → API response. Master this pipeline and every feature becomes predictable to implement.",
                order: 7,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Open `prisma/schema.prisma`, find the `Setting` model, and add `phoneNumber String?` at the end of the model, after `acceptCash` and `acceptCard`. Do not leave the `?` off.",
                order: 1,
              },
              {
                description:
                  "Run `pnpm exec prisma migrate dev --name add_setting_phone_number` to put the change in the database, then `pnpm exec prisma generate` to refresh the TypeScript types.",
                order: 2,
              },
              {
                description:
                  "There are no DTO classes under `src/settings/` — only controller, module and service. Add `phoneNumber` to the inline body type in `src/settings/settings.controller.ts`, and add `phoneNumber` to the explicit `safeData` object the service writes in `src/settings/settings.service.ts`. Then `GET /api/settings` includes it, where it may be `null`.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description: "The Setting model in schema.prisma includes phoneNumber as an optional field",
                is_required: true,
                order: 1,
              },
              {
                description: "A migration has been created and applied to the database",
                is_required: true,
                order: 2,
              },
              {
                description: "The settings DTO includes an optional phoneNumber field with validation",
                is_required: true,
                order: 3,
              },
              {
                description: "View settings and verify phoneNumber is included (may be null)",
                is_required: true,
                order: 4,
              },
              {
                description: "Update settings and verify phoneNumber is saved",
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
    id: "nestjs-pos-level-2",
    title: "Product Catalog & Inventory",
    subtitle: "Implement inventory guards and paginated product listings.",
    order: 2,
    level_description:
      "Mission Briefing: IPPO customers need to browse the product catalog efficiently, and inventory guards must prevent invalid stock states. The job is to fix low-stock comparison logic, prevent negative inventory updates, and build a paginated product listing.",
    xp_reward: 150,
    coin_reward: 75,
    key_takeaways:
      "Inventory integrity requires both correct comparison operators (`lte` instead of `lt`) and input validation (rejecting negative quantities). These guards prevent silent data corruption.\n\nPagination is not a UI convenience — it is a performance requirement. A proper paginated API uses `skip` and `take` in Prisma, and returns a consistent envelope with `data`, `total`, `page`, `limit`, and `totalPages`.",
    scenario_id: "nestjs-pos-scenario-3",
    tasks: {
      create: [
        {
          task_name: "Inventory Integrity Guards",
          test_type: "both",
          user_story:
            "As a store admin, I want inventory updates to be safe so that stock levels never go negative and low-stock alerts catch items at the threshold.",
          learning_sections: {
            create: [
              {
                title: "Overview\nInventory Guards in Prisma",
                content:
                  "This section introduces the crash course for fixing two inventory bugs: low-stock comparison and negative quantity prevention.",
                order: 1,
              },
              {
                title: "Bug #INV-001: Low-Stock Comparison",
                content:
                  "The low-stock endpoint currently returns inventory rows where `quantity < lowStock`. It should also include rows whose quantity is exactly at their own low-stock level, i.e. the comparison has to be `quantity <= lowStock` (inclusive).\n\nThere is no request parameter here — each row is compared against its own `lowStock` column, so the fix is simply the `<` versus `<=` operator.",
                order: 2,
              },
              {
                title: "Bug #INV-002: Negative Inventory",
                content:
                  "The inventory update endpoint should validate that the quantity parameter is non-negative before updating.\n\nif (dto.quantity < 0) {\n  throw new BadRequestException('Quantity cannot be negative');\n}\n\n`updateInventorySchema` in `src/inventory/dto/update-inventory.dto.ts` is a Zod schema — add `.min(0)` to its `quantity` field, or add an equivalent check in the service.",
                order: 3,
              },
              {
                title: "Practice Lab: Filter by Threshold",
                content:
                  "Practice writing the filter logic for low-stock alerts.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement getLowStock(products, threshold) returning products where stock <= threshold.",
                  language: "javascript",
                  starter_code:
                    "export function getLowStock(products, threshold) {\n  // TODO: filter products with stock <= threshold\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO: filter products with stock <= threshold",
                      case_sensitive: false,
                    },
                  ],
                  entry_point: "getLowStock",
                  test_cases: [
                    {
                      input: [[{ name: "A", stock: 3 }, { name: "B", stock: 15 }], 10],
                      expected: [{ name: "A", stock: 3 }],
                      label: "filters below threshold",
                    },
                  ],
                
                  hints: [
                    "Filter by stock.",
                    "Walk through the array and build a new one keeping only the items that pass your check. What method lets you test each item against a condition?",
                    "return products.filter(p => p.___ <= ___);"
                    ],
                },
                order: 4,
              },
              {
                title: "Key Takeaway",
                content:
                  "Inventory guards are simple but critical. Use `lte` for inclusive threshold filtering and validate inputs to prevent negative quantities. These two guards prevent the most common inventory bugs.",
                order: 5,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "The controller calls `this.inventoryService.getLowStockProducts()` in `src/inventory/inventory.service.ts` (the stub `getLowStock()` is not wired up). Implement it so a row whose `quantity` equals its own `lowStock` is included — change the comparison from `lt` to `lte`.",
                order: 1,
              },
              {
                description:
                  "The inventory update endpoint has to reject a negative quantity. Add `.min(0)` to the `quantity` field of the Zod `updateInventorySchema` in `src/inventory/dto/update-inventory.dto.ts`, or add an equivalent check in `src/inventory/inventory.service.ts`. `quantity: -1` answers 400, while `quantity: 0` and a valid positive quantity are accepted.",
                order: 2,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description: "View low-stock inventory and verify items at the threshold are included",
                is_required: true,
                order: 1,
              },
              {
                description: "View low-stock inventory and verify items above threshold are excluded",
                is_required: true,
                order: 2,
              },
              {
                description: "Try to update inventory with negative quantity and verify it's rejected",
                is_required: true,
                order: 3,
              },
              {
                description: "Update inventory with zero quantity and verify it's accepted",
                is_required: true,
                order: 4,
              },
              {
                description: "Update inventory with valid positive quantity and verify it succeeds",
                is_required: true,
                order: 5,
              },
            ],
          },
        },
        {
          task_name: "Paginated Product Listing",
          test_type: "both",
          user_story:
            "As a customer, I want to browse products with pagination and search so I can find what I need without loading the entire catalog.",
          learning_sections: {
            create: [
              {
                title: "Overview\nPaginated Product Listing",
                content:
                  "This section introduces the crash course for implementing paginated product listings in a POS system.",
                order: 1,
              },
              {
                title: "Pagination Envelope",
                content:
                  "The product list endpoint must return an envelope object with data, total, page, limit, and totalPages fields.\n\nconst [data, total] = await Promise.all([\n  prisma.product.findMany({ skip, take, where }),\n  prisma.product.count({ where }),\n]);\n\nreturn { data, total, page, limit, totalPages: Math.ceil(total / limit) };",
                order: 2,
              },
              {
                title: "Search Filter",
                content:
                  "When a search query parameter is provided, filter products by name using case-insensitive matching. Prisma mode: 'insensitive' works for PostgreSQL.\n\nconst where: Prisma.ProductWhereInput = {\n  isActive: true,\n  ...(search && {\n    name: { contains: search, mode: 'insensitive' },\n  }),\n};",
                order: 3,
              },
              {
                title: "Practice Lab: Calculate Pagination Metadata",
                content:
                  "Practice writing the helper that converts total, page, and limit into a paginated envelope object.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement paginate returning {data,total,page,limit,totalPages}. Handle zero total.",
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
    "Compute totalPages.",
    "Break this into smaller steps. What is the first transformation your input needs to become the output? Apply it, then think about the next step.",
    "const tp = total === ___ ? ___ : Math.ceil(total / ___);"
  ],
                },
                order: 4,
              },
              {
                title: "Key Takeaway",
                content:
                  "Pagination requires two database calls (findMany + count) with the same WHERE clause. Wrap them in Promise.all for concurrency. Return a consistent envelope so every client knows how to render navigation controls.",
                order: 5,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "`products.controller.ts` currently reads only `search` through `@Query()`; `page` and `limit` have to be added. They arrive as strings, so convert them with `parseInt` and fall back to `page = 1` and `limit = 10`.",
                order: 1,
              },
              {
                description:
                  "The list in `findAll()` in `src/products/products.service.ts` is built from one `where` object that adds a `name` filter with `mode: 'insensitive'` when a search term is present. That same object feeds both `findMany` and `count`.",
                order: 2,
              },
              {
                description:
                  "The response body needs all five keys: `data`, `total`, `page`, `limit`, and `totalPages`.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description: "View products list and verify it returns a paginated envelope with all required fields",
                is_required: true,
                order: 1,
              },
              {
                description: "View products without filters and verify default pagination (page 1, at most 20 items)",
                is_required: true,
                order: 2,
              },
              {
                description: "Verify the response reports page 2 and limit 5 and contains at most 5 rows; the test does not compare rows with page 1 to confirm offset behavior",
                is_required: true,
                order: 3,
              },
              {
                description: "Verify total counts all matching products across all pages",
                is_required: true,
                order: 4,
              },
              {
                description: "Search products and verify it works with pagination",
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
    id: "nestjs-pos-level-3",
    title: "Transactional Checkout",
    subtitle: "Implement a transactional checkout with tax, discount, inventory deduction, and payment validation.",
    order: 3,
    level_description:
      "Mission Briefing: IPPO customers need a reliable checkout experience. An order must deduct stock atomically, calculate tax and discount correctly, validate payment methods, and never leave the database in an inconsistent state.",
    xp_reward: 200,
    coin_reward: 100,
    key_takeaways:
      "Transactional checkout means the stock deduction, order creation, and payment validation all succeed or all fail together. Prisma's `$transaction` API wraps multiple database operations in a single ACID transaction. If any step fails (e.g., insufficient stock), the entire operation rolls back and the database remains consistent.\n\nTax and discount calculations require explicit rounding to 2 decimal places. JavaScript's floating-point arithmetic produces values like 14.030000000000001 instead of 14.03. `Math.round(value * 100) / 100` for currency math.",
    scenario_id: "nestjs-pos-scenario-3",
    tasks: {
      create: [
        {
          task_name: "Transactional Checkout: Tax, Discount & Inventory",
          test_type: "both",
          user_story:
            "As a customer, I want to place an order knowing that stock is deducted atomically, tax is calculated correctly, discount is applied, and invalid payment methods are rejected.",
          learning_sections: {
            create: [
              {
                title: "Overview\nTransactional Checkout in Prisma",
                content:
                  "This section introduces the crash course for implementing a transactional checkout endpoint in a POS system.",
                order: 1,
              },
              {
                title: "Why Transactions Matter for Checkout",
                content:
                  "Without a transaction, checkout can leave the database in an inconsistent state. A transaction wraps stock validation, deduction, order creation, and tax calculation. If any step fails, the entire operation rolls back.",
                order: 2,
              },
              {
                title: "Prisma Interactive Transactions",
                content:
                  "Prisma's `$transaction` API accepts an async function that receives a transaction-bound client:\n\nawait prisma.$transaction(async (tx) => {\n  // 1. Validate stock\n  const inventory = await tx.inventory.findUnique({ where: { productId } });\n  if (inventory.quantity < quantity) {\n    throw new BadRequestException('Insufficient stock');\n  }\n\n  // 2. Deduct stock\n  await tx.inventory.update({\n    where: { productId },\n    data: { quantity: { decrement: quantity } },\n  });\n\n  // 3. Create order\n  await tx.order.create({ data: { ... } });\n});",
                order: 3,
              },
              {
                title: "Tax Calculation",
                content:
                  "Fetch the tax rate from Settings. Calculate tax from the subtotal:\n\nconst settings = await tx.setting.findFirst();\nconst taxRate = settings ? Number(settings.taxRate) / 100 : 0;\nconst tax = Math.round(subtotal * taxRate * 100) / 100;\nconst total = Math.round((subtotal + tax - discount) * 100) / 100;\n\nRound all monetary values to 2 decimal places.",
                order: 4,
              },
              {
                title: "Discount Logic",
                content:
                  "The discountAmount from the request body is subtracted from the total after tax is added. Ensure the total cannot go below zero.\n\nconst total = Math.max(0, Math.round((subtotal + tax - discountAmount) * 100) / 100);",
                order: 5,
              },
              {
                title: "Practice Lab: Compute Order Total",
                content:
                  "Practice writing the tax and discount calculation.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement computeOrderTotal(subtotal, taxRate, discount) returning {subtotal,tax,total}. total = subtotal+tax-discount, never below 0.\n\nExamples: computeOrderTotal(100,0.08,5)→{subtotal:100,tax:8,total:103}, computeOrderTotal(50,0.1,100)→{subtotal:50,tax:5,total:0}.",
                  language: "javascript",
                  starter_code:
                    "export function computeOrderTotal(subtotal, taxRate, discount) {\n  // TODO: return subtotal, tax, total (rounded to 2 decimals, total >= 0)\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO: return subtotal, tax, total (rounded to 2 decimals, total >= 0)",
                      case_sensitive: false,
                    },
                  ],
                  entry_point: "computeOrderTotal",
                  test_cases: [
                    {
                      input: [100, 0.08, 5],
                      expected: { subtotal: 100, tax: 8, total: 103 },
                      label: "8% tax, $5 discount",
                    },
                    {
                      input: [50, 0.1, 100],
                      expected: { subtotal: 50, tax: 5, total: 0 },
                      label: "discount exceeds total",
                    },
                  ],
                
                  hints: [
    "Compute tax, clamp total, round.",
    "JavaScript has built-in functions for common mathematical operations. Think about which one picks the larger of two numbers, or rounds to the nearest integer.",
    "const t = subtotal * taxRate; const raw = subtotal + t - discount; const total = Math.___(___, raw);"
  ],
                },
                order: 6,
              },
              {
                title: "Key Takeaway",
                content:
                  "Checkout is the most critical endpoint in any POS system. Wrap stock validation, deduction, order creation, and tax/discount calculation in a single Prisma transaction. Validate inputs before the transaction starts. Round financial values to 2 decimal places.",
                order: 7,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "The checkout in `orders.service.ts` (`create()`) has to run as a single unit of work. Put the whole order creation inside `prisma.$transaction(async (tx) => { ... })`.",
                order: 1,
              },
              {
                description:
                  "Stock is deducted inside the same unit, keyed on the product, with `tx.inventory.update({ where: { productId }, data: { quantity: { decrement: item.quantity } } })`. The delta is applied rather than a new quantity written, and a request that fails afterwards has to leave inventory exactly as it found it.",
                order: 2,
              },
              {
                description:
                  "The tax rate is read from settings inside the same unit. Tax is added first, the discount comes off next, and the result is rounded to 2 decimals. A discount larger than the total still leaves 0, never a negative amount.",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description: "Complete a checkout and verify it creates an order with correct subtotal, tax, and total",
                is_required: true,
                order: 1,
              },
              {
                description: "Verify tax equals subtotal × (taxRate / 100) from Settings",
                is_required: true,
                order: 2,
              },
              {
                description: "Verify discount is subtracted from the total",
                is_required: true,
                order: 3,
              },
              {
                description: "After checkout, verify inventory quantity decreased by the ordered amount",
                is_required: true,
                order: 4,
              },
              {
                description: "Try checkout with insufficient stock and verify it's rejected, inventory unchanged",
                is_required: true,
                order: 5,
              },
              {
                description: "Verify order total has at most 2 decimal places",
                is_required: true,
                order: 6,
              },
            ],
          },
        },
        {
          task_name: "Payment Method Validation",
          test_type: "both",
          user_story:
            "As a store admin, I want to restrict payment methods to only CASH and CARD so that unsupported methods are rejected.",
          learning_sections: {
            create: [
              {
                title: "Overview\nPayment Method Validation",
                content:
                  "This section introduces the crash course for restricting payment methods in a POS system.",
                order: 1,
              },
              {
                title: "PaymentMethod Enum",
                content:
                  "The Prisma schema defines a PaymentMethod enum with CASH and CARD values. The order creation endpoint should validate that the incoming paymentMethod matches one of these values.\n\nenum PaymentMethod {\n  CASH\n  CARD\n}\n\n`src/orders/dto/create-order.dto.ts` is a Zod schema — restrict the field with `paymentMethod: z.enum(['CASH', 'CARD'])` (or `z.nativeEnum(PaymentMethod)`) so `ZodValidationPipe` rejects anything else.",
                order: 2,
              },
              {
                title: "Service Guard",
                content:
                  "As a secondary defense, the service can also check the value before creating the order. Throw BadRequestException if the payment method is not supported.",
                order: 3,
              },
              {
                title: "Practice Lab: Validate Payment Method",
                content:
                  "Practice validating a payment method.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement isValidPaymentMethod(method) returning true for \"CASH\" or \"CARD\", false otherwise.\n\nExamples: isValidPaymentMethod(\"CASH\")→true, isValidPaymentMethod(\"CRYPTO\")→false.",
                  language: "javascript",
                  starter_code:
                    "export function isValidPaymentMethod(method) {\n  // TODO: return true for CASH and CARD only\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO: return true for CASH and CARD only",
                      case_sensitive: false,
                    },
                  ],
                  entry_point: "isValidPaymentMethod",
                  test_cases: [
                    {
                      input: ["CASH"],
                      expected: true,
                      label: "cash is valid",
                    },
                    {
                      input: ["CARD"],
                      expected: true,
                      label: "card is valid",
                    },
                    {
                      input: ["CRYPTO"],
                      expected: false,
                      label: "crypto is invalid",
                    },
                  ],
                
                  hints: [
                    "Check both valid options.",
                    "return method === \"CASH\" || method === \"CARD\";",
                    "return method === \"___\" || method === \"___\";"
                  ],
                },
                order: 4,
              },
              {
                title: "Key Takeaway",
                content:
                  "Validate payment methods at both the DTO level (with the Zod enum) and the service level (with custom guards). Reject unsupported methods before any database writes occur.",
                order: 5,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Payment methods are restricted to the `PaymentMethod` enum from `@prisma/client`, which holds `CASH` and `CARD`. The Zod schema on `paymentMethod` in the order DTO declares `z.enum(['CASH', 'CARD'])`, so `ZodValidationPipe` rejects anything outside it.",
                order: 1,
              },
              {
                description:
                  "Both an empty string and a missing `paymentMethod` have to be refused with 400, and so do `CRYPTO` and `BITCOIN`.",
                order: 2,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description: "Place an order with CASH payment and verify it's accepted",
                is_required: true,
                order: 1,
              },
              {
                description: "Place an order with CARD payment and verify it's accepted",
                is_required: true,
                order: 2,
              },
              {
                description: "Try CRYPTO payment and verify it's rejected",
                is_required: true,
                order: 3,
              },
              {
                description: "Try BITCOIN payment and verify it's rejected",
                is_required: true,
                order: 4,
              },
              {
                description: "Try empty payment method and verify it's rejected",
                is_required: true,
                order: 5,
              },
              {
                description: "Try missing payment method and verify it's rejected",
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
    id: "nestjs-pos-level-4",
    title: "Reporting",
    subtitle: "Build admin-only daily and weekly sales reports with product breakdowns.",
    order: 4,
    level_description:
      "Mission Briefing: IPPO management needs visibility into sales performance. The job is to build daily and weekly sales reports, aggregating order data and showing top-selling products.",
    xp_reward: 250,
    coin_reward: 125,
    key_takeaways:
      "Sales reports aggregate order data by time period. A daily report shows today's revenue and order count; a weekly report shows the last 7 days with a daily breakdown. Both should be admin-only and return consistent, chronologically ordered data.\n\nAggregate queries should always be scoped to an indexed column (createdAt, date range) so the database scans a small subset of rows instead of the entire orders table.",
    scenario_id: "nestjs-pos-scenario-3",
    tasks: {
      create: [
        {
          task_name: "Daily Sales Report",
          test_type: "both",
          user_story:
            "As a store admin, I want to see today's total revenue, order count, and top-selling products so I can track daily performance.",
          learning_sections: {
            create: [
              {
                title: "Overview\nDaily Sales Reporting",
                content:
                  "This section introduces the crash course for building daily sales reports with Prisma.",
                order: 1,
              },
              {
                title: "Daily Report: Revenue and Order Count",
                content:
                  "A daily report needs two aggregates:\n\nconst [totalRevenue, orderCount] = await Promise.all([\n  prisma.order.aggregate({\n    _sum: { total: true },\n    where: { createdAt: { gte: today, lt: tomorrow } },\n  }),\n  prisma.order.count({\n    where: { createdAt: { gte: today, lt: tomorrow } },\n  }),\n]);\n\nUse `createdAt` with explicit UTC boundaries for consistency.",
                order: 2,
              },
              {
                title: "Top Products Ranking",
                content:
                  "To find the top 5 best-selling products, aggregate order items by productId and sum the quantities:\n\nconst topProducts = await prisma.orderItem.groupBy({\n  by: ['productId'],\n  _sum: { quantity: true },\n  where: {\n    order: { createdAt: { gte: today, lt: tomorrow } },\n  },\n  orderBy: { _sum: { quantity: 'desc' } },\n  take: 5,\n});\n\nThen join with the Product model to get names. The test accepts either `productName`/`quantitySold` or the raw `name`/`quantity` on each entry.",
                order: 3,
              },
              {
                title: "Admin-Only Routes",
                content:
                  "Sales reports contain sensitive business data. Protect them with admin guards:\n\n@Get('daily')\n@UseGuards(JwtAuthGuard, RolesGuard)\n@Roles(UserRole.ADMIN)\nasync dailyReport() { ... }\n\nThe test verifies that non-admin users (cashiers) receive 401-403.",
                order: 4,
              },
              {
                title: "Practice Lab: Compute Revenue",
                content:
                  "Practice summing an array of order totals.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement computeTotalRevenue(orders) returning sum of order.total values.",
                  language: "javascript",
                  starter_code:
                    "export function computeTotalRevenue(orders) {\n  // TODO: return sum of order.total\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO: return sum of order.total",
                      case_sensitive: false,
                    },
                  ],
                  entry_point: "computeTotalRevenue",
                  test_cases: [
                    {
                      input: [[{ total: 50 }, { total: 75 }]],
                      expected: 125,
                      label: "sums two orders",
                    },
                    {
                      input: [[]],
                      expected: 0,
                      label: "empty array",
                    },
                  ],
                
                  hints: [
                    "Sum with .reduce().",
                    "You need to accumulate a running total across all elements. Think about which array method lets you carry a value forward as you visit each element.",
                    "return orders.reduce((sum, o) => sum + o.___, ___);"
                    ],
                },
                order: 5,
              },
              {
                title: "Key Takeaway",
                content:
                  "Reports are aggregate queries over time-bounded data. Use Promise.all for parallel independent aggregates, groupBy for rankings, and always protect report endpoints with admin guards.",
                order: 6,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "The daily report adds up order revenue and counts orders over the same window and the same filter, reporting them as `totalRevenue` and `orderCount`.",
                order: 1,
              },
              {
                description:
                  "The date range has explicit UTC boundaries.",
                order: 2,
              },
              {
                description:
                  "`topProducts` is a ranking of the best sellers by summed quantity with at most 5 entries; each entry may name the product as `productName` or `name` and the count as `quantitySold` or `quantity`. The route stays admin-only, so a cashier gets 401 or 403.",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description: "View daily sales report as admin and verify it shows total revenue and order count",
                is_required: true,
                order: 1,
              },
              {
                description: "Verify total revenue is the sum of all today's order totals",
                is_required: true,
                order: 2,
              },
              {
                description: "Verify report includes top products list (up to 5 items)",
                is_required: true,
                order: 3,
              },
              {
                description: "Verify each top product entry has product name and quantity sold",
                is_required: true,
                order: 4,
              },
              {
                description: "Try viewing report as cashier and verify it's refused",
                is_required: true,
                order: 5,
              },
            ],
          },
        },
        {
          task_name: "Weekly Sales Report",
          test_type: "both",
          user_story:
            "As a store admin, I want to see weekly sales trends so I can identify patterns and adjust staffing.",
          learning_sections: {
            create: [
              {
                title: "Overview\nWeekly Sales Reporting",
                content:
                  "This section introduces the crash course for building weekly sales reports with Prisma.",
                order: 1,
              },
              {
                title: "Weekly Report: Daily Breakdown",
                content:
                  "A weekly report needs a daily breakdown for the last 7 days. Generate 7 date buckets and query each:\n\nconst dailyBreakdown = [];\nfor (let i = 6; i >= 0; i--) {\n  const day = new Date();\n  day.setDate(day.getDate() - i);\n  day.setUTCHours(0, 0, 0, 0);\n\n  const nextDay = new Date(day);\n  nextDay.setUTCDate(nextDay.getUTCDate() + 1);\n\n  const revenue = await prisma.order.aggregate({\n    _sum: { total: true },\n    where: { createdAt: { gte: day, lt: nextDay } },\n  });\n\n  const orders = await prisma.order.count({\n    where: { createdAt: { gte: day, lt: nextDay } },\n  });\n\n  dailyBreakdown.push({\n    date: day.toISOString().split('T')[0],\n    revenue: Number(revenue._sum.total ?? 0),\n    orderCount: orders,\n  });\n}\n\nThe test expects exactly 7 entries, each with `date`, `revenue`, and `orderCount`.",
                order: 2,
              },
              {
                title: "Admin-Only Routes",
                content:
                  "Same as daily report: protect with admin guards.",
                order: 3,
              },
              {
                title: "Practice Lab: Compute Weekly Revenue",
                content:
                  "Practice summing daily revenues.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement sumDailyRevenues(days) returning sum of day.revenue values.",
                  language: "javascript",
                  starter_code:
                    "export function sumDailyRevenues(days) {\n  // TODO: return sum of day.revenue\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO: return sum of day.revenue",
                      case_sensitive: false,
                    },
                  ],
                  entry_point: "sumDailyRevenues",
                  test_cases: [
                    {
                      input: [[{ revenue: 100 }, { revenue: 200 }]],
                      expected: 300,
                      label: "sums two days",
                    },
                    {
                      input: [[]],
                      expected: 0,
                      label: "empty array",
                    },
                  ],
                
                  hints: [
                    "Sum with .reduce().",
                    "You need to accumulate a running total across all elements. Think about which array method lets you carry a value forward as you visit each element.",
                    "return days.reduce((sum, d) => sum + d.___, ___);"
                    ],
                },
                order: 4,
              },
              {
                title: "Key Takeaway",
                content:
                  "Weekly reports need a daily breakdown. Use a loop to generate 7 date buckets, query revenue and order count for each, and return the aggregated data. Always use UTC boundaries.",
                order: 5,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "The weekly report loops from 6 days ago through today to build 7 date buckets, and asks for revenue and order count in each one. The `dailyBreakdown` array has exactly 7 entries, each with `date`, `revenue` and `orderCount`, and the top level carries `totalRevenue` and `totalOrders`.",
                order: 1,
              },
              {
                description:
                  "Build each bucket with UTC boundaries: `new Date()` then `setUTCHours(0,0,0,0)`.",
                order: 2,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description: "View weekly sales report as admin and verify it shows total revenue and total orders",
                is_required: true,
                order: 1,
              },
              {
                description: "Verify report includes daily breakdown with exactly 7 entries",
                is_required: true,
                order: 2,
              },
              {
                description: "Verify each daily breakdown entry has date, revenue, and order count",
                is_required: true,
                order: 3,
              },
              {
                description: "Try viewing report as cashier and verify it's refused",
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
    id: "nestjs-pos-level-5",
    title: "Production Hardening",
    subtitle: "Fix race conditions, decimal precision issues, timezone inconsistencies, and document everything in a postmortem.",
    order: 5,
    level_description:
      "Mission Briefing: Three critical bugs have been reported by IPPO users. First, concurrent checkouts can oversell a product with only 1 item in stock. Second, order totals occasionally show more than 2 decimal places due to floating-point drift. Third, daily reports show inconsistent order counts depending on when they are queried. These are production-grade issues that require database-level fixes and defensive coding.",
    xp_reward: 300,
    coin_reward: 150,
    key_takeaways:
      "Pessimistic locking (SELECT ... FOR UPDATE) is the only reliable way to prevent overselling under concurrent load. Application-level read-modify-write sequences have a race window that grows with traffic. In PostgreSQL, `SELECT ... FOR UPDATE` inside a transaction to lock the inventory row before updating it, ensuring that no other request can modify it between the read and the write.\n\nDecimal precision in financial calculations requires explicit rounding. JavaScript's floating-point arithmetic produces values like 30.029999999999 instead of 30.03. `Math.round(value * 100) / 100` or a dedicated decimal library for currency math.\n\nTimezone-aware date filtering is essential for reports that group by calendar day. Using `new Date()` or server-local time in SQL queries produces different results depending on where the server is deployed. Dates should always be stored in UTC and use explicit UTC boundaries.",
    scenario_id: "nestjs-pos-scenario-3",
    tasks: {
      create: [
        {
          task_name: "Fix Oversell, Decimal Drift & Timezone",
          test_type: "both",
          user_story:
            "As a customer, I want the checkout to be reliable: no overselling, correct totals, and consistent reports regardless of when I view them.",
          learning_sections: {
            create: [
              {
                title: "Overview\nProduction Bugs: Concurrency, Precision, and Time",
                content:
                  "This section introduces the crash course for diagnosing and fixing three common production bugs in POS systems: overselling from race conditions, decimal precision drift in financial calculations, and timezone inconsistency in date-grouped reports.",
                order: 1,
              },
              {
                title: "Bug #1: Race Condition / Oversell",
                content:
                  "Client Report: 'Two customers both successfully bought the last Ethiopian Yirgacheffe!'\n\nRoot cause: The checkout reads inventory, checks if stock >= quantity, then deducts stock. If two requests read stock=1 simultaneously, both pass the check and both deduct, resulting in stock=-1.\n\nFix: Use `SELECT ... FOR UPDATE` (pessimistic locking) inside a Prisma interactive transaction. Prisma's `$transaction` with the native `update` with `decrement` both work:\n\nawait prisma.$transaction(async (tx) => {\n  const inventory = await tx.inventory.findUnique({\n    where: { productId: item.productId },\n  });\n\n  if (inventory.quantity < item.quantity) {\n    throw new BadRequestException('Out of stock');\n  }\n\n  await tx.inventory.update({\n    where: { productId: item.productId },\n    data: { quantity: { decrement: item.quantity } },\n  });\n});\n\nWrapping the check and the decrement in `$transaction` is necessary but not sufficient: under PostgreSQL's default READ COMMITTED isolation both requests can still read `quantity=1` before either writes, so both pass the check and inventory lands at -1. To genuinely serialise them, fold the guard into an atomic conditional write (see below) or take an explicit row lock.",
                order: 2,
              },
              {
                title: "Bug #2: Decimal Precision Drift",
                content:
                  "Client Report: 'My order total shows $27.030000000000001 instead of $27.03.'\n\nRoot cause: JavaScript uses IEEE 754 floating-point arithmetic. 0.1 + 0.2 === 0.30000000000000004. When prices are multiplied by quantities and tax is added, tiny rounding errors accumulate.\n\nFix: Round every financial value to 2 decimal places before storing or returning it:\n\nfunction round2(value: number): number {\n  return Math.round(value * 100) / 100;\n}\n\nconst subtotal = round2(unitPrice * quantity);\nconst tax = round2(subtotal * taxRate);\nconst total = round2(subtotal + tax);\n\nThe test checks that `total.toString().split('.')[1].length <= 2`.",
                order: 3,
              },
              {
                title: "Bug #3: Timezone Inconsistency in Reports",
                content:
                  "Client Report: 'The daily report shows different order counts when I check at 11 PM vs 1 AM.'\n\nRoot cause: The report groups orders by calendar day using the server's local timezone. An order at 23:00 UTC is one day in UTC but the next day in Tokyo (+9).\n\nFix: UTC date boundaries should always be used in SQL queries, and store all dates in UTC. When grouping by day, truncate to UTC midnight:\n\nconst start = new Date();\nstart.setUTCHours(0, 0, 0, 0);\nconst end = new Date(start);\nend.setUTCDate(end.getUTCDate() + 1);\n\nFor Prisma, pass these exact UTC Date objects to the `createdAt` filter.",
                order: 4,
              },
              {
                title: "Prisma Interactive Transactions with Locking",
                content:
                  "For the oversell fix, wrap the stock check and deduction in a transaction — and make the check atomic. Prisma does not take row locks automatically inside an interactive transaction; under READ COMMITTED two overlapping transactions can each read the same quantity before either writes. Fold the guard into the write instead:\n\nconst updated = await tx.inventory.updateMany({\n  where: { productId, quantity: { gte: item.quantity } },\n  data: { quantity: { decrement: item.quantity } },\n});\n\nif (updated.count === 0) {\n  throw new BadRequestException('Out of stock');\n}\n\nIf you prefer an explicit lock, run it with `tx.$queryRaw` *inside* the transaction (note `$queryRaw`, not `$executeRaw`, since `$executeRaw` cannot run a `SELECT`; the camelCase column also needs quoting):\n\nawait tx.$queryRaw`SELECT * FROM inventory WHERE \"productId\" = ${productId} FOR UPDATE`;\n\nThen proceed with the update inside the same transaction.",
                order: 5,
              },
              {
                title: "Consistent Report Totals",
                content:
                  "The test verifies that calling the same report twice returns the same order count. This catches non-deterministic queries caused by:\n- Missing `ORDER BY` clauses\n- Using `new Date()` inside the query instead of fixed boundaries\n- Timezone-dependent date truncation\n\nAlways compute explicit `start` and `end` UTC boundaries inside the service, and use them consistently in both `aggregate` and `count` calls.",
                order: 6,
              },
              {
                title: "Practice Lab: Round to 2 Decimals",
                content:
                  "Practice writing the rounding function used in checkout.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement round2(value) returning value rounded to 2 decimal places as a number. Use Math.round.",
                  language: "javascript",
                  starter_code:
                    "export function round2(value) {\n  // TODO: round to 2 decimal places\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO: round to 2 decimal places",
                      case_sensitive: false,
                    },
                  ],
                  entry_point: "round2",
                  test_cases: [
                    {
                      input: [27.030000000000001],
                      expected: 27.03,
                      label: "floating point fix",
                    },
                    {
                      input: [10],
                      expected: 10,
                      label: "integer unchanged",
                    },
                  ],
                
                  hints: [
                    "Multiply by 100, round, divide.",
                    "Think step by step about what operation transforms your input into the output you need. Break it down into smaller sub-problems and solve each one.",
                    "return Math.round(value * ___) / ___;"
                    ],
                },
                order: 7,
              },
              {
                title: "Key Takeaway",
                content:
                  "Production POS systems need three defenses: pessimistic locking (or atomic decrement) for stock, explicit rounding for all financial calculations, and explicit UTC date boundaries for reports. These three rules prevent the most common classes of production bugs in point-of-sale systems.",
                order: 8,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "The stock check and the deduction belong to the same unit of work, so only one of two checkouts racing for the last item succeeds.",
                order: 1,
              },
              {
                description:
                  "Apply `Math.round(value * 100) / 100` to every money value before you return it: `subtotal`, `tax`, `total`, and `discount`.",
                order: 2,
              },
              {
                description:
                  "For a consistent timezone, build the day start and end as UTC dates in the controller with `new Date()` then `setUTCHours(0,0,0,0)`. Pass those exact values to every query.",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description: "Simulate two concurrent checkouts for a product with 1 item in stock: verify only one succeeds",
                is_required: true,
                order: 1,
              },
              {
                description: "After concurrent checkouts, verify inventory never drops below zero",
                is_required: true,
                order: 2,
              },
              {
                description: "Place an order and verify the total has at most 2 decimal places",
                is_required: true,
                order: 3,
              },
              {
                description: "View daily report multiple times and verify it gives the same order count each time",
                is_required: true,
                order: 4,
              },
            ],
          },
        },
        {
          task_name: "Postmortem Document",
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
                  "The Five Whys is a simple root-cause analysis method:\n\nProblem: Overselling on concurrent checkouts.\nWhy? Two requests both read stock=1 before either wrote back.\nWhy? The code used read-modify-write instead of atomic decrement.\nWhy? The developer did not know about Prisma's interactive transactions.\nWhy? There was no code review checklist for inventory operations.\nWhy? The team had not documented concurrency patterns for this stack.\n\nEach 'why' digs deeper into the systemic cause rather than the surface symptom.",
                order: 3,
              },
              {
                title: "Documenting the Three Bugs",
                content:
                  "The postmortem should cover all three bugs fixed in Level 5, Task 1:\n\n1. Race Condition / Oversell\n   - Symptom: Two customers bought the last item\n   - Root cause: Read-modify-write without locking\n   - Fix: Prisma interactive transactions with atomic decrement\n\n2. Decimal Precision Drift\n   - Symptom: Order totals showed 27.030000000000001\n   - Root cause: Unrounded floating-point arithmetic\n   - Fix: Math.round(value * 100) / 100 on all financial values\n\n3. Timezone Inconsistency\n   - Symptom: Daily reports varied by time of day\n   - Root cause: Server-local date boundaries in queries\n   - Fix: Explicit UTC date boundaries in controller, passed to all queries",
                order: 4,
              },
              {
                title: "Action Items and Prevention",
                content:
                  "Every postmortem must end with concrete action items:\n\n- Add a code review checklist for checkout endpoints (must use transactions)\n- Add lint rules that flag unrounded arithmetic in financial code\n- Add integration tests for concurrent checkout behavior\n- Document timezone handling guidelines for all date-boundary features\n\nAction items with owners and deadlines turn postmortems from documentation into prevention.",
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
                    "Implement identifyRootCause() returning deepest root cause string.",
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
                      expected: "missing tests for concurrent access",
                      label: "returns root cause",
                    },
                  ],
                
                  hints: [
                    "Think about systemic cause.",
                    "Relates to missing concurrent access tests.",
                    "return \"___\";"
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
                  "Create a file named `POSTMORTEM.md` at the project root, on the same level as `package.json`.",
                order: 1,
              },
              {
                description:
                  "Grading is case-insensitive and needs only one term from each of three groups. Group one: `race condition`, `concurrency`, `oversell`, or `locking`. Group two: `decimal`, `precision`, `rounding`, or `float`. Group three: `timezone`, `utc`, `date boundary`, or `midnight`. One term from each is enough.",
                order: 2,
              },
              {
                description:
                  "Give each bug its own heading, then list the symptom, the root cause, the fix, and the action items under it.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description: "Create a POSTMORTEM.md file at the project root (same folder as package.json)",
                is_required: true,
                order: 1,
              },
              {
                description: "Document the race condition/oversell bug: include terms about race condition, concurrency, oversell, or locking",
                is_required: true,
                order: 2,
              },
              {
                description: "Document the decimal precision bug: include terms about decimal, precision, rounding, or float",
                is_required: true,
                order: 3,
              },
              {
                description: "Document the timezone bug: include terms about timezone, UTC, date boundary, or midnight",
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
