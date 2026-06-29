/**
 * Prisma Seed Script â€” IPPO POS System (NestJS Scenario 3)
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
    paywall: true,
  },
];

export const levels = [
  {
    id: "nestjs-pos-level-1",
    title: "Getting Familiar with the Codebase",
    subtitle: "Set up the development environment and make a first schema change.",
    order: 1,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: A new developer has joined the IPPO POS engineering team. The first tasks are to get the NestJS + PostgreSQL + Prisma stack running locally and make a small but visible schema change â€” adding a phoneNumber field to store settings â€” so the codebase structure becomes clear end-to-end.",
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
                  "The IPPO POS System is a NestJS application using Prisma ORM with PostgreSQL. It has standard NestJS module structure with modules for Auth, Users, Products, Categories, Orders, Inventory, Reports, and Settings.\n\nNestJS â€” provides a modular architecture with decorators, dependency injection, and built-in support for REST APIs.\nPostgreSQL â€” stores users, products, categories, orders, and inventory.\nPrisma â€” defines the schema and generates the type-safe client.",
                order: 2,
              },
              {
                title: "How a NestJS App is Structured",
                content:
                  "A typical NestJS project is organized by feature modules:\n\nsrc/\n  â”œâ”€â”€ auth/          â† authentication module (JWT strategy, guards)\n  â”œâ”€â”€ users/         â† user management\n  â”œâ”€â”€ products/      â† product catalog\n  â”œâ”€â”€ categories/    â† product categories\n  â”œâ”€â”€ orders/        â† order management\n  â”œâ”€â”€ inventory/     â† stock tracking\n  â”œâ”€â”€ reports/       â† analytics endpoints\n  â”œâ”€â”€ settings/      â† store settings\n  â”œâ”€â”€ prisma/        â† schema, migrations, seed\n  â””â”€â”€ main.ts        â† application bootstrap\n\nEach module contains its own controller, service, DTOs, and tests.",
                order: 3,
              },
              {
                title: "Package Management in a NestJS Project",
                content:
                  "When a project is cloned, no dependencies are installed yet â€” node_modules is in .gitignore. Dependencies must be installed by running pnpm install at the project root.\n\nKey packages in this project:\n- @nestjs/core, @nestjs/common â€” framework runtime\n- @nestjs/platform-express â€” HTTP server adapter\n- @prisma/client â€” type-safe database client\n- prisma â€” CLI for migrations and schema management\n- bcrypt â€” password hashing\n- class-validator, class-transformer â€” DTO validation\n- supertest â€” HTTP assertions in tests\n\nThe Prisma CLI and Prisma Client are separate packages. The CLI handles migrations; the Client is what services import at runtime.",
                order: 4,
              },
              {
                title: "Prisma Schema and Migrations",
                content:
                  "The Prisma schema (prisma/schema.prisma) is the single source of truth for the database structure.\n\nAfter editing the schema, changes are applied with:\npnpm exec prisma migrate dev --name init\n\nThis generates a SQL migration file and applies it to the database. Then run:\npnpm exec prisma generate\n\nThis regenerates the Prisma Client TypeScript types so services get autocomplete and type checking.",
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
                    "Implement getPhoneNumberFieldDefinition() returning \"phoneNumber String?\".",
                  language: "javascript",
                  starter_code:
                    "export function getPhoneNumberFieldDefinition() {\n  // TODO\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO",
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "getPhoneNumberFieldDefinition",
                  test_cases: [
                    {
                      input: [],
                      expected: "phoneNumber String?",
                      label: "optional phoneNumber field",
                    },
                  ],
                
                  hints: [
                    "Return Prisma string.",
                    "return \"phoneNumber String?\";",
                    "return \"___ ___?\";"
                  ],
                },
                order: 6,
              },
              {
                title: "Environment Variables",
                content:
                  "Sensitive config (like database URIs) is stored in .env files â€” never hardcoded in source code.\n\nDATABASE_URL=postgresql://user:password@localhost:5432/pos_system\nJWT_SECRET=changeme\nPORT=4000\n\nThe @nestjs/config package reads these files and makes them available via ConfigService. Prisma reads DATABASE_URL directly from .env. âš ï¸ .env files are listed in .gitignore intentionally â€” they contain secrets that should never be committed to version control.\n\nNote: Environment variables in this project are pre-configured.",
                order: 7,
              },
              {
                title: "Seeding the Database",
                content:
                  "A seed script populates the database with realistic sample data so development can proceed against a real dataset instead of an empty one. The IPPO POS seed creates default admin and cashier users for testing.\n\nRun the seed with:\npnpm exec prisma db seed\n\nThis command is defined in the root package.json and calls prisma/seed.ts via ts-node.",
                order: 8,
              },
              {
                title: "Key Takeaway",
                content:
                  "Setting up a project is more than running one command â€” it means aligning the local environment (dependencies, env vars, database) so the app runs identically for every developer on the team. Getting this right first enables building features with confidence.",
                order: 9,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "The project has a single root package.json, run pnpm install from the project root, not from any subfolder.",
                order: 1,
              },
              {
                description:
                  "The README.md contains step-by-step setup instructions, follow them carefully.",
                order: 2,
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
                description: "Prisma migrations applied successfully (pnpm exec prisma migrate dev)",
                is_required: true,
                order: 2,
              },
              {
                description: "Seed script runs successfully and populates the database",
                is_required: true,
                order: 3,
              },
              {
                description: "NestJS dev server starts without errors",
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
                title: "Updating the DTO",
                content:
                  "Update the CreateSettingDto and UpdateSettingDto to include the optional phoneNumber field. Use @IsOptional() and @IsString() decorators.",
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
                  "In a Prisma + NestJS stack, schema changes flow in one direction: schema.prisma â†’ migration â†’ generated client â†’ DTO â†’ service â†’ controller â†’ API response. Master this pipeline and every feature becomes predictable to implement.",
                order: 7,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Open `prisma/schema.prisma` and find the `Setting` model. Add `phoneNumber String?` at the end of the model.",
                order: 1,
              },
              {
                description:
                  "Run `pnpm exec prisma migrate dev --name add_setting_phone_number` to apply the schema change, then `pnpm exec prisma generate` to update the TypeScript types.",
                order: 2,
              },
              {
                description:
                  "Add `@IsOptional()` and `@IsString()` decorators for the `phoneNumber` field in the settings DTO.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description: "Setting model in schema.prisma includes `phoneNumber String?`",
                is_required: true,
                order: 1,
              },
              {
                description: "Migration file is created and applied to the database",
                is_required: true,
                order: 2,
              },
              {
                description: "Settings DTO includes an optional phoneNumber field with validation decorators",
                is_required: true,
                order: 3,
              },
              {
                description: "GET /api/settings returns the phoneNumber field (may be null)",
                is_required: true,
                order: 4,
              },
              {
                description: "PUT /api/settings persists phoneNumber value",
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
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: IPPO customers need to browse the product catalog efficiently, and inventory guards must prevent invalid stock states. The job is to fix low-stock comparison logic, prevent negative inventory updates, and build a paginated product listing.",
    xp_reward: 150,
    coin_reward: 75,
    key_takeaways:
      "Inventory integrity requires both correct comparison operators (`lte` instead of `lt`) and input validation (rejecting negative quantities). These guards prevent silent data corruption.\n\nPagination is not a UI convenience â€” it is a performance requirement. A proper paginated API uses `skip` and `take` in Prisma, and returns a consistent envelope with `data`, `total`, `page`, `limit`, and `totalPages`.",
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
                  "The low-stock endpoint currently filters products where stock < lowStock. It should include products where stock is exactly at the threshold too (stock <= lowStock).\n\nconst lowStock = await prisma.inventory.findMany({\n  where: {\n    quantity: { lte: threshold },\n  },\n});\n\nUse `lte` (less than or equal) instead of `lt`.",
                order: 2,
              },
              {
                title: "Bug #INV-002: Negative Inventory",
                content:
                  "The inventory update endpoint should validate that the quantity parameter is non-negative before updating.\n\nif (dto.quantity < 0) {\n  throw new BadRequestException('Quantity cannot be negative');\n}\n\nUse @Min(0) from class-validator on the quantity DTO field, or validate manually in the service.",
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
                  "In `inventory.service.ts`, change the low-stock filter from `lt` to `lte`.",
                order: 1,
              },
              {
                description:
                  "Add a `quantity >= 0` check in the inventory update endpoint. Use @Min(0) from class-validator.",
                order: 2,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description: "GET /api/inventory/low-stock includes products at threshold (stock === lowStock)",
                is_required: true,
                order: 1,
              },
              {
                description: "GET /api/inventory/low-stock excludes products above threshold",
                is_required: true,
                order: 2,
              },
              {
                description: "PUT /api/inventory/:productId with quantity: -1 returns 400",
                is_required: true,
                order: 3,
              },
              {
                description: "PUT /api/inventory/:productId with quantity: 0 is accepted",
                is_required: true,
                order: 4,
              },
              {
                description: "PUT /api/inventory/:productId with valid positive quantity succeeds",
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
                  "The controller already receives query params via `@Query()`. Use `parseInt` with a fallback (e.g., `page = 1`, `limit = 10`) to ensure integers.",
                order: 1,
              },
              {
                description:
                  "Build a `where` object that conditionally includes a `name` search filter with `mode: 'insensitive'`. Pass the same `where` object to both `findMany` and `count`.",
                order: 2,
              },
              {
                description:
                  "The test checks for `res.body.data`, `res.body.total`, `res.body.page`, `res.body.limit`, and `res.body.totalPages`. Make sure all five keys are present.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description: "GET /api/products returns a paginated envelope with data, total, page, limit, totalPages",
                is_required: true,
                order: 1,
              },
              {
                description: "Defaults to page=1, limit=10 when no query params are provided",
                is_required: true,
                order: 2,
              },
              {
                description: "?page=2&limit=5 returns the second page of 5 products",
                is_required: true,
                order: 3,
              },
              {
                description: "total reflects the full count across all pages",
                is_required: true,
                order: 4,
              },
              {
                description: "?search= filter works alongside pagination",
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
    deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
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
                  "In `orders.service.ts -> create()`, wrap the entire checkout logic in `prisma.$transaction(async (tx) => { ... })`.",
                order: 1,
              },
              {
                description:
                  "Use `tx.inventory.update({ where: { productId }, data: { quantity: { decrement: item.quantity } } })` for atomic stock deduction inside the transaction.",
                order: 2,
              },
              {
                description:
                  "Fetch settings inside the transaction to get the tax rate. Calculate tax, then apply discount, then round to 2 decimals.",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description: "Successful checkout creates an order with correct subtotal, tax, and total",
                is_required: true,
                order: 1,
              },
              {
                description: "tax equals subtotal Ã— (taxRate / 100) from Settings",
                is_required: true,
                order: 2,
              },
              {
                description: "discountAmount is subtracted from the total",
                is_required: true,
                order: 3,
              },
              {
                description: "Inventory quantity is decremented by the ordered amount after checkout",
                is_required: true,
                order: 4,
              },
              {
                description: "Checkout with insufficient stock returns 4xx and leaves inventory unchanged",
                is_required: true,
                order: 5,
              },
              {
                description: "Order total has at most 2 decimal places",
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
                  "The Prisma schema defines a PaymentMethod enum with CASH and CARD values. The order creation endpoint should validate that the incoming paymentMethod matches one of these values.\n\nenum PaymentMethod {\n  CASH\n  CARD\n}\n\nUse @IsEnum(PaymentMethod) from class-validator on the paymentMethod field in the CreateOrderDto.",
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
                  "Validate payment methods at both the DTO level (with class-validator) and the service level (with custom guards). Reject unsupported methods before any database writes occur.",
                order: 5,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Import the PaymentMethod enum from @prisma/client for use in decorators.",
                order: 1,
              },
              {
                description:
                  "Empty string and missing paymentMethod should both be rejected.",
                order: 2,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description: "CASH payment method is accepted",
                is_required: true,
                order: 1,
              },
              {
                description: "CARD payment method is accepted",
                is_required: true,
                order: 2,
              },
              {
                description: "CRYPTO payment method returns 400",
                is_required: true,
                order: 3,
              },
              {
                description: "BITCOIN payment method returns 400",
                is_required: true,
                order: 4,
              },
              {
                description: "Empty string payment method returns 400",
                is_required: true,
                order: 5,
              },
              {
                description: "Missing paymentMethod returns 400",
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
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
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
                  "To find the top 5 best-selling products, aggregate order items by productId and sum the quantities:\n\nconst topProducts = await prisma.orderItem.groupBy({\n  by: ['productId'],\n  _sum: { quantity: true },\n  where: {\n    order: { createdAt: { gte: today, lt: tomorrow } },\n  },\n  orderBy: { _sum: { quantity: 'desc' } },\n  take: 5,\n});\n\nThen join with the Product model to get names. The test checks for `productName` and `quantitySold` in each entry.",
                order: 3,
              },
              {
                title: "Admin-Only Routes",
                content:
                  "Sales reports contain sensitive business data. Protect them with admin guards:\n\n@Get('daily')\n@UseGuards(JwtAuthGuard, RolesGuard)\n@Roles('ADMIN')\nasync dailyReport() { ... }\n\nThe test verifies that non-admin users (cashiers) receive 401-403.",
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
                  "In `reports.service.ts`, implement `daily()` with `prisma.order.aggregate` for revenue and `prisma.order.count` for order count, both filtered by `createdAt`.",
                order: 1,
              },
              {
                description:
                  "Use explicit UTC boundaries for the date range to avoid timezone issues.",
                order: 2,
              },
              {
                description:
                  "The test checks: `totalRevenue`, `orderCount` for daily; and admin-only access (401-403 for cashiers).",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description: "Returns totalRevenue and orderCount",
                is_required: true,
                order: 1,
              },
              {
                description: "totalRevenue reflects the sum of all today's order totals",
                is_required: true,
                order: 2,
              },
              {
                description: "Returns topProducts array with at most 5 entries",
                is_required: true,
                order: 3,
              },
              {
                description: "topProducts entries include productName and quantitySold",
                is_required: true,
                order: 4,
              },
              {
                description: "Is admin-only â€” cashier gets 401/403",
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
                  "For `weekly()`, loop from 6 days ago to today, creating 7 date buckets. Query revenue and order count for each bucket.",
                order: 1,
              },
              {
                description:
                  "Use UTC date boundaries: `new Date()` then `setUTCHours(0,0,0,0)`.",
                order: 2,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description: "Returns totalRevenue and totalOrders",
                is_required: true,
                order: 1,
              },
              {
                description: "Returns a dailyBreakdown array with exactly 7 entries",
                is_required: true,
                order: 2,
              },
              {
                description: "Each dailyBreakdown entry has date, revenue, and orderCount",
                is_required: true,
                order: 3,
              },
              {
                description: "Is admin-only â€” cashier gets 401/403",
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
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
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
                  "Client Report: 'Two customers both successfully bought the last Ethiopian Yirgacheffe!'\n\nRoot cause: The checkout reads inventory, checks if stock >= quantity, then deducts stock. If two requests read stock=1 simultaneously, both pass the check and both deduct, resulting in stock=-1.\n\nFix: Use `SELECT ... FOR UPDATE` (pessimistic locking) inside a Prisma interactive transaction. Prisma's `$transaction` with the native `update` with `decrement` both work:\n\nawait prisma.$transaction(async (tx) => {\n  const inventory = await tx.inventory.findUnique({\n    where: { productId: item.productId },\n  });\n\n  if (inventory.quantity < item.quantity) {\n    throw new BadRequestException('Out of stock');\n  }\n\n  await tx.inventory.update({\n    where: { productId: item.productId },\n    data: { quantity: { decrement: item.quantity } },\n  });\n});\n\nThe transaction serializes concurrent requests. Only one can deduct stock at a time.",
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
                  "For the oversell fix, wrap the stock check and deduction in a transaction. Prisma handles the locking automatically when `$transaction is used` with related queries on the same rows. The key insight is that the stock check and the decrement must happen in the same transaction - not as separate queries.\n\nIf explicit row-level locking, use a raw query:\n\nawait prisma.$executeRaw`SELECT * FROM inventory WHERE productId = ${productId} FOR UPDATE`;\n\nThen proceed with the update inside the same transaction.",
                order: 5,
              },
              {
                title: "Consistent Report Totals",
                content:
                  "The test verifies that calling the same report twice returns the same total. This catches non-deterministic queries caused by:\n- Missing `ORDER BY` clauses\n- Using `new Date()` inside the query instead of fixed boundaries\n- Timezone-dependent date truncation\n\nAlways pass explicit `start` and `end` dates from the controller, and use them consistently in both `aggregate` and `count` calls.",
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
                  "Wrap the stock check and deduction in `prisma.$transaction(async (tx) => { ... })`. Only one concurrent checkout can pass the stock check at a time.",
                order: 1,
              },
              {
                description:
                  "Add `Math.round(value * 100) / 100` to every financial value before returning it: subtotal, tax, total, and discount.",
                order: 2,
              },
              {
                description:
                  "For timezone consistency, construct the day start/end as UTC Dates in the controller: `new Date()` then `setUTCHours(0,0,0,0)`. Pass these exact values to every query.",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description: "Only one of two concurrent checkouts succeeds for a 1-stock product",
                is_required: true,
                order: 1,
              },
              {
                description: "Inventory quantity never goes negative after concurrent checkouts",
                is_required: true,
                order: 2,
              },
              {
                description: "Order total has at most 2 decimal places",
                is_required: true,
                order: 3,
              },
              {
                description: "Daily report returns consistent orderCount on repeated calls",
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
                  "Create a file named `POSTMORTEM.md` at the project root (same level as `package.json`).",
                order: 1,
              },
              {
                description:
                  "The test checks for lowercase mentions of 'race condition', 'concurrency', 'oversell', 'decimal', 'precision', 'rounding', 'timezone', 'utc', and 'date boundary'. Make sure each concept appears at least once.",
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
                description: "Document mentions race condition / concurrency / oversell root cause",
                is_required: true,
                order: 2,
              },
              {
                description: "Document mentions decimal / precision / rounding root cause",
                is_required: true,
                order: 3,
              },
              {
                description: "Document mentions timezone / UTC / date boundary root cause",
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
