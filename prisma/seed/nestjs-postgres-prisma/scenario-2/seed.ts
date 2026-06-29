/**
 * Prisma Seed Script - BrewHaven Online Enterprise (NestJS Scenario 2)
 *
 * Seeds the database with Level and Scenario data for the BrewHaven learning scenario.
 */

export const scenarios = [
  {
    id: "nestjs-bh-scenario-2",
    name: "BrewHaven Online Enterprise",
    description:
      "Build and harden a production-grade coffee e-commerce platform using NestJS, PostgreSQL, and Prisma. Progress from environment setup through product catalog APIs with pagination, transactional checkout with stock and tax, order lifecycle state machines, sales reporting, inventory alerts, and critical production bug fixes including overselling, decimal precision, and timezone inconsistency.",
    difficulty: "expert",
  },
];

export const levels = [
  {
    id: "nestjs-bh-level-1",
    title: "Getting Familiar with the Codebase",
    subtitle: "Set up the development environment and extend the Product model with a roastLevel field.",
    order: 1,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: A new developer has joined the BrewHaven engineering team. The first tasks are to get the NestJS + PostgreSQL + Prisma stack running locally and make a small but visible schema change - adding a roastLevel field to products - so the codebase structure becomes clear end-to-end.",
    xp_reward: 100,
    coin_reward: 50,
    key_takeaways:
      "Setting up a NestJS + PostgreSQL + Prisma project requires understanding three layers: the NestJS runtime (controllers, services, modules), the Prisma schema (models, enums, relations), and the PostgreSQL database (migrations, seeds, connection strings). Knowing how to run `pnpm exec prisma migrate dev`, `pnpm exec prisma generate`, and `pnpm run start:dev` in the correct order is foundational for every backend developer on this stack.\n\nPrisma schema changes are the source of truth for the database. Adding a single field like `roastLevel String?` to a model triggers a migration, updates the TypeScript types, and propagates to the API DTOs and service logic. Understanding this single-file-to-database pipeline is critical before building any feature.",
    scenario_id: "nestjs-bh-scenario-2",
    tasks: {
      create: [
        {
          task_name: "Prepare Development Environment",
          test_type: "both",
          user_story:
            "As a developer, I want to set up my local development environment so that I can run and modify the BrewHaven application.",
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
                  "NestJS is a progressive Node.js framework for building scalable server-side applications.\n\nNestJS provides a modular architecture with decorators, dependency injection, and built-in support for REST APIs, GraphQL, and WebSockets.\nPostgreSQL is a powerful open-source relational database with ACID compliance, JSON support, and advanced querying.\nPrisma is a next-generation ORM that replaces raw SQL with a type-safe database client and a declarative schema language.\n\nBrewHaven uses all three layers: PostgreSQL stores users, categories, products, and orders; Prisma defines the schema and generates the client; NestJS serves the REST API with controllers, services, and guards.",
                order: 2,
              },
              {
                title: "How a NestJS App is Structured",
                content:
                  "A typical NestJS project is organized by feature modules:\n\nsrc/\n  auth/          authentication module (JWT strategy, guards)\n  users/         user management\n  categories/    product categories\n  products/      product catalog\n  orders/        order management\n  reports/       analytics endpoints\n  prisma/        schema, migrations, seed\n  main.ts        application bootstrap\n\nEach module contains its own controller, service, DTOs, and tests. This separation of concerns makes the codebase scalable and testable.",
                order: 3,
              },
              {
                title: "Package Management in a NestJS Project",
                content:
                  "When a project is cloned, no dependencies are installed yet - node_modules is in .gitignore. Dependencies must be installed by running pnpm install at the project root.\n\nKey packages in this project:\n- @nestjs/core, @nestjs/common - framework runtime\n- @nestjs/platform-express - HTTP server adapter\n- @prisma/client - type-safe database client\n- prisma - CLI for migrations and schema management\n- bcrypt - password hashing\n- class-validator, class-transformer - DTO validation\n- supertest - HTTP assertions in tests\n\nThe Prisma CLI and Prisma Client are separate packages. The CLI handles migrations; the Client is what services import at runtime.",
                order: 4,
              },
              {
                title: "Prisma Schema and Migrations",
                content:
                  "The Prisma schema (prisma/schema.prisma) is the single source of truth for the database structure. Models define tables, fields define columns, and decorators define constraints like `@id`, `@unique`, and `@default`.\n\nAfter editing the schema, changes are applied with:\npnpm exec prisma migrate dev --name add_product_fields\n\nThis generates a SQL migration file and applies it to the database. Then run:\npnpm exec prisma generate\n\nThis regenerates the Prisma Client TypeScript types so services get autocomplete and type checking.",
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
                    "Implement getRoastLevelFieldDefinition() returning \"roastLevel String?\".",
                  language: "javascript",
                  starter_code:
                    "export function getRoastLevelFieldDefinition() {\n  // TODO\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO",
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "getRoastLevelFieldDefinition",
                  test_cases: [
                    {
                      input: [],
                      expected: "roastLevel String?",
                      label: "optional roastLevel field",
                    },
                  ],
                
                hints: [
                  "Return Prisma string.",
                  "The instructions already show the exact string to return. It's in quotes after the word 'returning' — copy it exactly.",
                  "return \"___ ___?\";"
                ],},
                order: 6,
              },
              {
                title: "Environment Variables",
                content:
                  "Sensitive config (like database URIs) is stored in .env files - never hardcoded in source code.\n\nDATABASE_URL=postgresql://user:password@localhost:5432/brewhaven\nJWT_SECRET=changeme\nPORT=4000\n\nThe @nestjs/config package reads these files and makes them available via ConfigService. Prisma reads DATABASE_URL directly from .env. Warning: .env files are listed in .gitignore intentionally - they contain secrets that should never be committed to version control.\n\nNote: In this project, some environment variables will be provided by us, so no need to set them up manually.",
                order: 7,
              },
              {
                title: "Seeding the Database",
                content:
                  "A seed script populates the database with realistic sample data so development can proceed against a real dataset instead of an empty one. The BrewHaven seed creates 2 users, 4 categories, 10 products, and 2 sample orders.\n\nRun the seed with:\npnpm exec prisma db seed\n\nThis command is defined in the root package.json and calls prisma/seed.ts via ts-node.",
                order: 8,
              },
              {
                title: "Key Takeaway",
                content:
                  "Setting up a project is more than running one command - it means aligning the local environment (dependencies, env vars, database) so the app runs identically for every developer on the team. Getting this right first enables building features with confidence.",
                order: 9,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "The project has a single root package.json - run pnpm install from the project root, not from any subfolder.",
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
          task_name: "Add a Roast Level Field to Products",
          test_type: "both",
          user_story:
            "As a store admin, I want to tag each coffee product with its roast level so customers can browse by Light, Medium, or Dark roasts.",
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
                  "After editing schema.prisma, a migration is created:\n\npnpm exec prisma migrate dev --name add_product_roast_level\n\nPrisma compares the schema against the current database state, generates a SQL migration file in prisma/migrations/, and applies it. This is how the database stays in sync with the code. Migration files should never be edited by hand without a thorough understanding of the consequences.",
                order: 3,
              },
              {
                title: "DTOs: Data Transfer Objects",
                content:
                  "NestJS uses DTOs to define the shape of incoming request bodies. The CreateProductDto tells NestJS what fields to expect when someone POSTs to /api/products:\n\nexport class CreateProductDto {\n  @IsString()\n  name: string;\n\n  @IsNumber()\n  price: number;\n\n  @IsUUID()\n  categoryId: string;\n}\n\nUse class-validator decorators (@IsString, @IsOptional, etc.) to enforce rules before the data reaches the service layer.",
                order: 4,
              },
              {
                title: "Updating the Service and Controller",
                content:
                  "The service layer calls Prisma Client methods to interact with the database. After adding a field, update the service to include it in create and find operations:\n\n// products.service.ts\nasync create(dto: CreateProductDto) {\n  return this.prisma.product.create({\n    data: dto,\n  });\n}\n\nThe controller returns the full Prisma result, so if the model and DTO both include `roastLevel`, the API response will include it too.",
                order: 5,
              },
              {
                title: "Hot Reload with NestJS Dev Mode",
                content:
                  "NestJS in development mode (pnpm run start:dev) watches files and restarts automatically on save. After running prisma generate and updating the DTO/service, saving the files triggers the server to restart - the new field will be available immediately.\n\nPostgreSQL does not need to be restarted, nor do migrations need to be re-run, unless the schema itself changes.",
                order: 6,
              },
              {
                title: "Practice Lab: Return the Correct Roast Level",
                content:
                  "Practice returning an optional string value from a function - the same logic applied when handling an optional roastLevel in a DTO.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement getRoastLevel(roastLevel) returning string when provided/non-empty, null otherwise.\n\nExamples: getRoastLevel(\"Light\")→\"Light\", getRoastLevel(\"\")→null.",
                  language: "javascript",
                  starter_code:
                    'export function getRoastLevel(roastLevel) {\n  // TODO: return roastLevel if non-empty, otherwise null\n}\n',
                  editable_regions: [
                    {
                      placeholder: "// TODO: return roastLevel if non-empty, otherwise null",
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "getRoastLevel",
                  test_cases: [
                    {
                      input: ["Light"],
                      expected: "Light",
                      label: "returns provided roast level",
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
                  "You need to handle two cases that should return null: when roastLevel is falsy (null/undefined), and when it's an empty string. Otherwise return the input as-is.",
                  "if (___ || roastLevel === \"\") return ___; return ___;"
                ],},
                order: 7,
              },
              {
                title: "Key Takeaway",
                content:
                  "In a Prisma + NestJS stack, schema changes flow in one direction: schema.prisma -> migration -> generated client -> DTO -> service -> controller -> API response. Master this pipeline and every feature becomes predictable to implement.",
                order: 8,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Open `prisma/schema.prisma` and find the `Product` model. Add `roastLevel String?` after the `isActive` field.",
                order: 1,
              },
              {
                description:
                  "Run `pnpm exec prisma migrate dev --name add_product_roast_level` to apply the schema change to PostgreSQL, then `pnpm exec prisma generate` to update the TypeScript types.",
                order: 2,
              },
              {
                description:
                  "Add `@IsOptional()` and `@IsString()` decorators for the `roastLevel` field in `CreateProductDto`. The controller already spreads the DTO into the service call, so no controller changes are needed.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description: "Product model in schema.prisma includes `roastLevel String?`",
                is_required: true,
                order: 1,
              },
              {
                description: "Migration file is created and applied to the database",
                is_required: true,
                order: 2,
              },
              {
                description: "CreateProductDto includes an optional roastLevel field with validation decorators",
                is_required: true,
                order: 3,
              },
              {
                description: "POST /api/products accepts and persists a roastLevel value",
                is_required: true,
                order: 4,
              },
              {
                description: "GET /api/products returns the roastLevel field in each product object",
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
    id: "nestjs-bh-level-2",
    title: "Product Catalog & Visibility",
    subtitle: "Build paginated product listings with filters and guard visibility with soft-deleted categories.",
    order: 2,
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: BrewHaven customers need to browse the coffee catalog efficiently, and inactive categories should be hidden from the storefront while preserving historical product data. The job is to implement offset-based pagination with filters and enforce soft-delete visibility rules across the API.",
    xp_reward: 150,
    coin_reward: 75,
    key_takeaways:
      "Pagination is not a UI convenience - it is a performance requirement. Returning thousands of products in a single JSON payload crashes both the server and the client. A proper paginated API uses `skip` (offset) and `take` (limit) in Prisma, and returns a consistent envelope with `data`, `total`, `page`, `limit`, and `totalPages`.\n\nSoft delete (using an `isActive` flag instead of `DELETE`) preserves referential integrity. A category used by 50 products cannot be physically deleted without violating foreign-key constraints or losing product history. Filtering `WHERE isActive = true` in every list query is the correct pattern.",
    scenario_id: "nestjs-bh-scenario-2",
    tasks: {
      create: [
        {
          task_name: "Paginated & Filterable Product List",
          test_type: "both",
          user_story:
            "As a customer, I want to browse products with pagination and filters so I can find specific coffees and equipment without loading the entire catalog.",
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
                  "Without pagination, a catalog with hundreds of products could trigger a query that returns all rows at once. This:\n- Exhausts database memory for sorting\n- Serializes megabytes of JSON on the server\n- Blocks the event loop\n- Crashes the client trying to render it all\n\nPagination limits the damage to a fixed, small page size (e.g., 10 items) and gives the user controls to navigate.",
                order: 2,
              },
              {
                title: "Prisma skip and take",
                content:
                  "Prisma provides two pagination parameters:\n\nconst products = await prisma.product.findMany({\n  skip: (page - 1) * limit,  // how many rows to skip\n  take: limit,               // how many rows to return\n  where: { isActive: true },\n  orderBy: { name: 'asc' },\n});\n\n`skip` is the offset. `take` is the limit. Both are integers. Prisma translates these into SQL `OFFSET` and `LIMIT` clauses.",
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
                  "Prisma's `where` object accepts multiple conditions that are ANDed together by default:\n\nconst where: Prisma.ProductWhereInput = {\n  isActive: true,\n  ...(categoryId && { categoryId }),\n  ...(search && {\n    name: { contains: search, mode: 'insensitive' },\n  }),\n};\n\nUse the spread operator with conditional objects to build dynamic filters without nested if-statements. This keeps the code readable when there are 3 or more optional filters.",
                order: 5,
              },
              {
                title: "Search with Case-Insensitive Matching",
                content:
                  "PostgreSQL's `ILIKE` operator (case-insensitive LIKE) is exposed in Prisma as `mode: 'insensitive'`:\n\nname: {\n  contains: 'ethiopian',\n  mode: 'insensitive',\n}\n\nThis matches 'Ethiopian', 'ETHIOPIAN', and 'ethiopian' without requiring the client to normalize case. Always use insensitive mode for user-facing search.",
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
                    "Implement paginate(data, total, page, limit) returning {data,total,page,limit,totalPages}. Handle zero total.",
                  language: "javascript",
                  starter_code:
                    'export function paginate(data, total, page, limit) {\n  // TODO: return the paginated envelope\n}\n',
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
                      input: [[{ id: 1 }], 13, 2, 5],
                      expected: { data: [{ id: 1 }], total: 13, page: 2, limit: 5, totalPages: 3 },
                      label: "page 2 of 13 items",
                    },
                  ],
                
                hints: [
  "Compute totalPages.",
  "Break this into smaller steps. What is the first transformation your input needs to become the output? Apply it, then think about the next step.",
  "const tp = total === ___ ? ___ : Math.ceil(total / ___);"
],},
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
                  "The controller already receives query params via `@Query()`. Use `parseInt` with a fallback (e.g., `page = 1`, `limit = 10`) to ensure integers.",
                order: 1,
              },
              {
                description:
                  "Build a `where` object that conditionally includes `categoryId` and a `name` search filter with `mode: 'insensitive'`. Pass the same `where` object to both `findMany` and `count`.",
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
                description: "?categoryId=<id> filters to products in that category",
                is_required: true,
                order: 3,
              },
              {
                description: "?search=term filters products by name (case-insensitive)",
                is_required: true,
                order: 4,
              },
              {
                description: "Combines categoryId and search filters correctly",
                is_required: true,
                order: 5,
              },
            ],
          },
        },

        {
          task_name: "Soft-Deleted Categories Visibility",
          test_type: "both",
          user_story:
            "As a customer, I want inactive categories to be hidden from the storefront so I don't see products from discontinued lines.",
          learning_sections: {
            create: [
              {
                title: "Overview\nSoft Deletes with Prisma",
                content:
                  "This section introduces the crash course for implementing soft deletes in Prisma. It covers the `isActive` flag pattern, referential integrity, filtering in list queries, and excluding inactive products from public listings.",
                order: 1,
              },
              {
                title: "Hard Delete vs Soft Delete",
                content:
                  "A hard delete removes a row permanently:\n\nawait prisma.category.delete({ where: { id } });\n\nThis is dangerous when other tables have foreign keys pointing to it. Prisma will throw a foreign-key constraint error, or worse, cascade and delete linked products.\n\nA soft delete keeps the row but sets a flag:\n\nawait prisma.category.update({\n  where: { id },\n  data: { isActive: false },\n});\n\nHistorical products remain intact. The category simply disappears from active lists.",
                order: 2,
              },
              {
                title: "Filtering Active Categories",
                content:
                  "Every list query must explicitly filter for active records:\n\nconst categories = await prisma.category.findMany({\n  where: { isActive: true },\n});\n\nWithout this, inactive categories leak into the storefront. The test specifically checks that `Inactive Category` does NOT appear in GET /api/categories.",
                order: 3,
              },
              {
                title: "Excluding Inactive Products from Public Listings",
                content:
                  "When a category is deactivated, its products should also disappear from the public product listing. This can be achieved by joining or filtering on the category's isActive status. Prisma's relation filters let products be filtered based on their related category's fields. This is cleaner than querying categories first and then filtering products by categoryId.",
                order: 4,
              },
              {
                title: "Prisma Model Configuration",
                content:
                  "The Category model already has `isActive Boolean @default(true)`. When a soft-delete is performed, this field is updated instead of calling `delete`. No schema changes are needed for this feature - only service and controller logic changes.",
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
                    "Implement getActiveNames(items) returning names of active items.",
                  language: "javascript",
                  starter_code:
                    'export function getActiveNames(items) {\n  // TODO: return names of active items only\n}\n',
                  editable_regions: [
                    {
                      placeholder: "// TODO: return names of active items only",
                      case_sensitive: false,
                    },
                  ],
                  entry_point: "getActiveNames",
                  test_cases: [
                    {
                      input: [[{ name: "Coffee", isActive: true }, { name: "Old", isActive: false }]],
                      expected: ["Coffee"],
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
                  ],},
                order: 6,
              },
              {
                title: "Key Takeaway",
                content:
                  "Soft delete is an `isActive` flag plus disciplined filtering. Filter it in every list query, use relation filters to exclude products under inactive categories, and never use `.delete()` on a table with dependent records.",
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
                  "In `products.service.ts -> findAll()`, add a relation filter `category: { isActive: true }` to the `where` object.",
                order: 2,
              },
              {
                description:
                  "The test expects `GET /api/categories` to NOT contain an inactive category ID, and expects `GET /api/products` to NOT contain products under inactive categories.",
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
                description: "Products under an inactive category are excluded from public listing",
                is_required: true,
                order: 2,
              },
              {
                description: "Active category products remain visible in public listing",
                is_required: true,
                order: 3,
              },
            ],
          },
        },
      ],
    },
  },

  {
    id: "nestjs-bh-level-3",
    title: "Transactional Checkout",
    subtitle: "Implement stock-aware checkout with tax calculation and order lifecycle management.",
    order: 3,
    deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: BrewHaven customers need a reliable checkout experience. An order must deduct stock atomically, calculate tax correctly, validate payment methods, and move through a controlled state machine from PENDING to DELIVERED. The job is to build the transactional checkout and the order lifecycle endpoints.",
    xp_reward: 200,
    coin_reward: 100,
    key_takeaways:
      "Transactional checkout means the stock deduction, order creation, and payment validation all succeed or all fail together. Prisma's `$transaction` API wraps multiple database operations in a single ACID transaction. If any step fails (e.g., insufficient stock), the entire operation rolls back and the database remains consistent.\n\nAn order state machine prevents invalid transitions (like PENDING -> DELIVERED) by explicitly defining which transitions are legal. This is not just validation - it is business logic. A DELIVERED order cannot be cancelled because the customer already has the product.",
    scenario_id: "nestjs-bh-scenario-2",
    tasks: {
      create: [
        {
          task_name: "Checkout: Stock, Tax & Payment Validation",
          test_type: "both",
          user_story:
            "As a customer, I want to place an order knowing that stock is deducted atomically, tax is calculated correctly, and invalid payment methods are rejected.",
          learning_sections: {
            create: [
              {
                title: "Overview\nTransactional Checkout in Prisma",
                content:
                  "This section introduces the crash course for implementing a transactional checkout endpoint. It covers Prisma interactive transactions, stock deduction, tax calculation, payment validation, and rollback behavior.",
                order: 1,
              },
              {
                title: "Why Transactions Matter for Checkout",
                content:
                  "Without a transaction, checkout can leave the database in an inconsistent state:\n\n1. Stock is deducted\n2. Order is created\n3. Tax calculation fails\n4. Order exists but stock is gone - data corruption!\n\nA transaction wraps all three steps. If step 3 fails, steps 1 and 2 are rolled back automatically. The database remains consistent.",
                order: 2,
              },
              {
                title: "Prisma Interactive Transactions",
                content:
                  "Prisma's `$transaction` API accepts an async function that receives a transaction-bound client:\n\nawait prisma.$transaction(async (tx) => {\n  // 1. Validate stock\n  const product = await tx.product.findUnique({ where: { id } });\n  if (product.stock < quantity) throw new Error('Insufficient stock');\n\n  // 2. Deduct stock\n  await tx.product.update({\n    where: { id },\n    data: { stock: { decrement: quantity } },\n  });\n\n  // 3. Create order\n  await tx.order.create({ data: { ... } });\n});\n\nIf any step throws, the entire transaction rolls back. No stock is lost, no ghost orders are created.",
                order: 3,
              },
              {
                title: "Stock Validation Before Deduction",
                content:
                  "Stock must always be validated before deducting it. The `decrement` operation does not know if the result will be negative unless checked first. This validation belongs inside the transaction so it sees the same snapshot of data that the decrement will modify.",
                order: 4,
              },
              {
                title: "Tax Calculation",
                content:
                  "Tax is typically a percentage of the subtotal. For BrewHaven, assume a default tax rate of 8%:\n\nconst taxRate = 0.08;\nconst subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);\nconst tax = Math.round(subtotal * taxRate * 100) / 100;\nconst total = subtotal + tax;\n\nRound to 2 decimal places to avoid floating-point drift. The test checks that the total has at most 2 decimal places.",
                order: 5,
              },
              {
                title: "Payment Method Validation",
                content:
                  "Validate the payment method against an allowed enum before creating the order:\n\nconst allowedMethods = ['CASH', 'CARD'];\nif (!allowedMethods.includes(paymentMethod)) {\n  throw new BadRequestException('Invalid payment method');\n}\n\nUse a Zod schema or class-validator `@IsEnum()` to enforce this at the DTO level as well.",
                order: 6,
              },
              {
                title: "Practice Lab: Compute Order Total",
                content:
                  "Practice writing the tax calculation used in the checkout endpoint.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement computeOrderTotal(subtotal, taxRate) returning {subtotal,tax,total}. tax = subtotal × taxRate, total = subtotal + tax. Both rounded to 2 decimals.\n\nExample: computeOrderTotal(100,0.08)→{subtotal:100,tax:8,total:108}.",
                  language: "javascript",
                  starter_code:
                    'export function computeOrderTotal(subtotal, taxRate) {\n  // TODO: return subtotal, tax, total (rounded to 2 decimals)\n}\n',
                  editable_regions: [
                    {
                      placeholder: "// TODO: return subtotal, tax, total (rounded to 2 decimals)",
                      case_sensitive: false,
                    },
                  ],
                  entry_point: "computeOrderTotal",
                  test_cases: [
                    {
                      input: [100, 0.08],
                      expected: { subtotal: 100, tax: 8, total: 108 },
                      label: "8% tax on $100",
                    },
                    {
                      input: [99.99, 0.08],
                      expected: { subtotal: 99.99, tax: 8, total: 107.99 },
                      label: "8% tax on $99.99",
                    },
                  ],
                
                hints: [
                  "Compute tax then total, round both.",
                  "Think step by step about what operation transforms your input into the output you need. Break it down into smaller sub-problems and solve each one.",
                  "const t = subtotal * taxRate; return {subtotal,tax:Math.round(t*100)/100,total:Math.round((subtotal+t)*___)/___};"
                  ],},
                order: 7,
              },
              {
                title: "Key Takeaway",
                content:
                  "Checkout is the most critical endpoint in any e-commerce app. Wrap stock validation, deduction, order creation, and tax calculation in a single Prisma transaction. Validate inputs before the transaction starts. Round financial values to 2 decimal places.",
                order: 8,
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
                  "Use `tx.product.update({ where: { id }, data: { stock: { decrement: quantity } } })` for atomic stock deduction inside the transaction.",
                order: 2,
              },
              {
                description:
                  "Validate `paymentMethod` against the `PaymentMethod` enum. Reject unsupported methods like 'CRYPTO' with a 400 error.",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description: "Order creation deducts stock atomically",
                is_required: true,
                order: 1,
              },
              {
                description: "Tax is calculated and stored on the order record",
                is_required: true,
                order: 2,
              },
              {
                description: "Order total is rounded to 2 decimal places",
                is_required: true,
                order: 3,
              },
              {
                description: "Rejects order when stock is insufficient (400)",
                is_required: true,
                order: 4,
              },
              {
                description: "Rejects unsupported payment methods (400)",
                is_required: true,
                order: 5,
              },
              {
                description: "Rolls back stock deduction when order fails mid-transaction",
                is_required: true,
                order: 6,
              },
            ],
          },
        },

        {
          task_name: "Order Lifecycle State Machine",
          test_type: "both",
          user_story:
            "As a store admin, I want orders to move through a controlled lifecycle so I can track fulfillment and prevent invalid status changes.",
          learning_sections: {
            create: [
              {
                title: "Overview\nBuilding State Machines in NestJS",
                content:
                  "This section introduces the crash course for implementing an order lifecycle state machine. It covers state transitions, guard logic, admin-only endpoints, and the difference between valid and invalid transitions.",
                order: 1,
              },
              {
                title: "Order States and Valid Transitions",
                content:
                  "The Order model uses an enum for status:\n\nenum OrderStatus {\n  PENDING\n  PROCESSING\n  SHIPPED\n  DELIVERED\n  CANCELLED\n}\n\nValid transitions:\n- PENDING -> PROCESSING\n- PROCESSING -> SHIPPED\n- SHIPPED -> DELIVERED\n- PENDING -> CANCELLED\n- PROCESSING -> CANCELLED\n- SHIPPED -> CANCELLED\n\nInvalid transitions:\n- PENDING -> DELIVERED (must go through PROCESSING and SHIPPED)\n- DELIVERED -> CANCELLED (already delivered)\n- Any -> PENDING (cannot go backwards to initial state)",
                order: 2,
              },
              {
                title: "Transition Validation Logic",
                content:
                  "Implement a helper that checks if a transition is valid:\n\nconst validTransitions: Record<OrderStatus, OrderStatus[]> = {\n  PENDING: ['PROCESSING', 'CANCELLED'],\n  PROCESSING: ['SHIPPED', 'CANCELLED'],\n  SHIPPED: ['DELIVERED', 'CANCELLED'],\n  DELIVERED: [],\n  CANCELLED: [],\n};\n\nfunction canTransition(from: OrderStatus, to: OrderStatus): boolean {\n  return validTransitions[from].includes(to);\n}\n\nThis pattern is called a transition matrix. It is explicit, testable, and easy to extend when new states are added.",
                order: 3,
              },
              {
                title: "Admin-Only Endpoints",
                content:
                  "Order status updates should be restricted to admin users. Use NestJS guards and decorators:\n\n@Patch(':id/status')\n@UseGuards(JwtAuthGuard, RolesGuard)\n@Roles('ADMIN')\nasync updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {\n  return this.ordersService.updateStatus(id, dto.status);\n}\n\nThe RolesGuard checks the user's role from the JWT token. Customers should get a 401 or 403 when trying to update order status.",
                order: 4,
              },
              {
                title: "Implementing the Service Method",
                content:
                  "The service method loads the order, validates the transition, and updates the status:\n\nasync updateStatus(orderId: string, newStatus: OrderStatus) {\n  const order = await this.prisma.order.findUnique({ where: { id: orderId } });\n  if (!order) throw new NotFoundException('Order not found');\n\n  if (!canTransition(order.status, newStatus)) {\n    throw new BadRequestException(`Cannot transition from ${order.status} to ${newStatus}`);\n  }\n\n  return this.prisma.order.update({\n    where: { id: orderId },\n    data: { status: newStatus },\n  });\n}\n\nAlways validate before mutating. Return the updated order so the client sees the new state.",
                order: 5,
              },
              {
                title: "Practice Lab: Validate State Transition",
                content:
                  "Practice writing the transition validation logic.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement canTransition(from, to) using state machine: PENDING→[PROCESSING,CANCELLED], PROCESSING→[SHIPPED,CANCELLED], SHIPPED→[DELIVERED,CANCELLED], DELIVERED→[], CANCELLED→[].\n\nExamples: canTransition(\"PENDING\",\"PROCESSING\")→true, canTransition(\"PENDING\",\"DELIVERED\")→false.",
                  language: "javascript",
                  starter_code:
                    'export function canTransition(from, to) {\n  // TODO: return true if transition is valid\n}\n',
                  editable_regions: [
                    {
                      placeholder: "// TODO: return true if transition is valid",
                      case_sensitive: false,
                    },
                  ],
                  entry_point: "canTransition",
                  test_cases: [
                    {
                      input: ["PENDING", "PROCESSING"],
                      expected: true,
                      label: "valid forward",
                    },
                    {
                      input: ["PENDING", "DELIVERED"],
                      expected: false,
                      label: "invalid skip",
                    },
                    {
                      input: ["DELIVERED", "CANCELLED"],
                      expected: false,
                      label: "invalid from delivered",
                    },
                  ],
                
                hints: [
                  "Define allowed map, check if target in list.",
                  "Create an object mapping each state to its allowed next states as an array. Look up the from-state in this object (defaulting to empty array if missing), then check whether the to-state appears in that array.",
                  "const allowed={...}; return (allowed[___]||[]).___(___);"
                ],},
                order: 6,
              },
              {
                title: "Key Takeaway",
                content:
                  "A state machine is a transition matrix plus guard logic. Define allowed transitions explicitly, validate before updating, and restrict status endpoints to authorized roles. Never let invalid transitions reach the database.",
                order: 7,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Create a `validTransitions` mapping in `orders.service.ts` and use it in `updateStatus()` to reject invalid transitions with BadRequestException.",
                order: 1,
              },
              {
                description:
                  "Add `@UseGuards(JwtAuthGuard, RolesGuard)` and `@Roles('ADMIN')` to the `updateStatus` controller method. The test verifies that customers get 401-403.",
                order: 2,
              },
              {
                description:
                  "The test specifically checks: PENDING->PROCESSING (200), PROCESSING->SHIPPED (200), PENDING->DELIVERED (400), DELIVERED->CANCELLED (400), and customer access (401-403).",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description: "PENDING -> PROCESSING succeeds (200)",
                is_required: true,
                order: 1,
              },
              {
                description: "PROCESSING -> SHIPPED succeeds (200)",
                is_required: true,
                order: 2,
              },
              {
                description: "PENDING -> DELIVERED is rejected (400)",
                is_required: true,
                order: 3,
              },
              {
                description: "Non-DELIVERED order can be CANCELLED",
                is_required: true,
                order: 4,
              },
              {
                description: "DELIVERED order cannot be CANCELLED (400)",
                is_required: true,
                order: 5,
              },
              {
                description: "Customer cannot update order status (401-403)",
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
    id: "nestjs-bh-level-4",
    title: "Reporting & Inventory",
    subtitle: "Build daily/weekly sales reports and a low-stock alert endpoint.",
    order: 4,
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: BrewHaven management needs visibility into sales performance and inventory health. The job is to build daily and weekly sales reports, plus a low-stock alert endpoint that proactively warns when products are running low.",
    xp_reward: 250,
    coin_reward: 125,
    key_takeaways:
      "Sales reports aggregate order data by time period. A daily report shows today's revenue and order count; a weekly report shows the last 7 days with a daily breakdown. Both should be admin-only and return consistent, chronologically ordered data.\n\nLow-stock alerts are a filtered product list where `stock <= threshold`. The default threshold is 10, but it should be configurable via query parameter. Results must include product name, SKU, current stock, and category name, sorted by stock ascending so the most critical items appear first.",
    scenario_id: "nestjs-bh-scenario-2",
    tasks: {
      create: [
        {
          task_name: "Daily & Weekly Sales Reports",
          test_type: "both",
          user_story:
            "As a store admin, I want to see daily and weekly sales reports so I can track revenue trends and best-selling products.",
          learning_sections: {
            create: [
              {
                title: "Overview\nSales Reporting with Prisma",
                content:
                  "This section introduces the crash course for building sales reports. It covers Prisma aggregate queries, date filtering, top-N product ranking, and admin-only route protection.",
                order: 1,
              },
              {
                title: "Daily Report: Revenue and Order Count",
                content:
                  "A daily report needs two aggregates:\n\nconst today = new Date();\ntoday.setHours(0, 0, 0, 0);\nconst tomorrow = new Date(today);\ntomorrow.setDate(tomorrow.getDate() + 1);\n\nconst [totalRevenue, orderCount] = await Promise.all([\n  prisma.order.aggregate({\n    _sum: { total: true },\n    where: { createdAt: { gte: today, lt: tomorrow } },\n  }),\n  prisma.order.count({\n    where: { createdAt: { gte: today, lt: tomorrow } },\n  }),\n]);\n\nUse `createdAt` (not `date`) for the order timestamp. The Prisma model uses `createdAt` with `@default(now())`.",
                order: 2,
              },
              {
                title: "Top Products Ranking",
                content:
                  "To find the top 5 best-selling products, aggregate order items by productId and sum the quantities:\n\nconst topProducts = await prisma.orderItem.groupBy({\n  by: ['productId'],\n  _sum: { quantity: true },\n  where: {\n    order: { createdAt: { gte: today, lt: tomorrow } },\n  },\n  orderBy: { _sum: { quantity: 'desc' } },\n  take: 5,\n});\n\nThen join with the Product model to get names. The test checks for `productName` and `quantitySold` in each entry.",
                order: 3,
              },
              {
                title: "Weekly Report: Daily Breakdown",
                content:
                  "A weekly report needs a daily breakdown for the last 7 days. Generate 7 date buckets and query each:\n\nconst dailyBreakdown = [];\nfor (let i = 6; i >= 0; i--) {\n  const day = new Date();\n  day.setDate(day.getDate() - i);\n  day.setHours(0, 0, 0, 0);\n\n  const nextDay = new Date(day);\n  nextDay.setDate(nextDay.getDate() + 1);\n\n  const revenue = await prisma.order.aggregate({\n    _sum: { total: true },\n    where: { createdAt: { gte: day, lt: nextDay } },\n  });\n\n  const orders = await prisma.order.count({\n    where: { createdAt: { gte: day, lt: nextDay } },\n  });\n\n  dailyBreakdown.push({\n    date: day.toISOString().split('T')[0],\n    revenue: Number(revenue._sum.total ?? 0),\n    orderCount: orders,\n  });\n}\n\nThe test expects exactly 7 entries, each with `date`, `revenue`, and `orderCount`.",
                order: 4,
              },
              {
                title: "Admin-Only Routes",
                content:
                  "Sales reports contain sensitive business data. Protect them with admin guards:\n\n@Get('daily')\n@UseGuards(JwtAuthGuard, RolesGuard)\n@Roles('ADMIN')\nasync dailyReport() { ... }\n\nThe test verifies that non-admin users (customers) receive 401-403.",
                order: 5,
              },
              {
                title: "Practice Lab: Compute Revenue",
                content:
                  "Practice summing an array of order totals.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement computeTotalRevenue(orders) returning sum of order.total values.\n\nExamples: computeTotalRevenue([{total:50},{total:75}])→125.",
                  language: "javascript",
                  starter_code:
                    'export function computeTotalRevenue(orders) {\n  // TODO: return sum of order.total\n}\n',
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
                  ],},
                order: 6,
              },
              {
                title: "Key Takeaway",
                content:
                  "Reports are aggregate queries over time-bounded data. Use Promise.all for parallel independent aggregates, groupBy for rankings, and always protect report endpoints with admin guards.",
                order: 7,
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
                  "For `weekly()`, loop from 6 days ago to today, creating 7 date buckets. Query revenue and order count for each bucket.",
                order: 2,
              },
              {
                description:
                  "The test checks: `totalRevenue`, `orderCount` for daily; `dailyBreakdown` array of length 7 with `date`, `revenue`, `orderCount` for weekly; and admin-only access (401-403 for customers).",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description: "GET /api/reports/daily returns totalRevenue and orderCount",
                is_required: true,
                order: 1,
              },
              {
                description: "Daily report returns top 5 best-selling products",
                is_required: true,
                order: 2,
              },
              {
                description: "GET /api/reports/weekly returns totalRevenue and totalOrders",
                is_required: true,
                order: 3,
              },
              {
                description: "Weekly report returns dailyBreakdown array with exactly 7 entries",
                is_required: true,
                order: 4,
              },
              {
                description: "Each dailyBreakdown entry has date, revenue, and orderCount",
                is_required: true,
                order: 5,
              },
              {
                description: "Reports are admin-only (customer gets 401-403)",
                is_required: true,
                order: 6,
              },
            ],
          },
        },

        {
          task_name: "Low-Stock Alert Endpoint",
          test_type: "both",
          user_story:
            "As a store admin, I want to see which products are running low on stock so I can reorder before we run out.",
          learning_sections: {
            create: [
              {
                title: "Overview\nInventory Alerts with Prisma",
                content:
                  "This section introduces the crash course for building a low-stock alert endpoint. It covers stock threshold filtering, query parameter defaults, and sorting by severity.",
                order: 1,
              },
              {
                title: "Filtering by Stock Threshold",
                content:
                  "A low-stock alert returns products where `stock <= threshold`. The default threshold is 10:\n\nconst threshold = parseInt(query.threshold ?? '10', 10);\n\nconst alerts = await prisma.product.findMany({\n  where: {\n    stock: { lte: threshold },\n    isActive: true,\n  },\n  include: { category: true },\n  orderBy: { stock: 'asc' },\n});\n\nUse `lte` (less than or equal) not just `lt`. The test verifies that a product with `stock === threshold` is included.",
                order: 2,
              },
              {
                title: "Custom Threshold via Query Param",
                content:
                  "Allow admins to override the default threshold via `?threshold=5`:\n\nconst threshold = parseInt(query.threshold ?? '10', 10);\n\nValidate that the threshold is a positive integer. Reject negative values or non-numeric strings with a 400 error.",
                order: 3,
              },
              {
                title: "Response Shape",
                content:
                  "The alert endpoint should return an array of objects with:\n\n{\n  productName: string;\n  sku: string;\n  currentStock: number;\n  categoryName: string;\n}\n\nInclude `categoryName` (not just `categoryId`) so the admin knows which supplier to contact. Use `include: { category: true }` in Prisma to join the category data.",
                order: 4,
              },
              {
                title: "Sorting by Severity",
                content:
                  "Sort results by `stock` ascending so the most critical items (lowest stock) appear first:\n\norderBy: { stock: 'asc' }\n\nThis makes the alert list actionable - the admin sees the most urgent reorders at the top.",
                order: 5,
              },
              {
                title: "Admin-Only Access",
                content:
                  "Like sales reports, low-stock alerts are admin-only. Use the same RolesGuard pattern:\n\n@Get('low-stock')\n@UseGuards(JwtAuthGuard, RolesGuard)\n@Roles('ADMIN')\nasync lowStock(@Query() query) { ... }\n\nThe test verifies that non-admin users receive 401-403.",
                order: 6,
              },
              {
                title: "Practice Lab: Filter Low Stock",
                content:
                  "Practice filtering an array of products by a stock threshold.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement getLowStockProducts(products, threshold) returning products where stock <= threshold, sorted by stock ascending.\n\nExamples: getLowStockProducts([{name:\"A\",stock:3},{name:\"B\",stock:15}],10)→[{name:\"A\",stock:3}].",
                  language: "javascript",
                  starter_code:
                    'export function getLowStockProducts(products, threshold) {\n  // TODO: filter and sort\n}\n',
                  editable_regions: [
                    {
                      placeholder: "// TODO: filter and sort",
                      case_sensitive: false,
                    },
                  ],
                  entry_point: "getLowStockProducts",
                  test_cases: [
                    {
                      input: [[{ name: "A", stock: 3 }, { name: "B", stock: 15 }], 10],
                      expected: [{ name: "A", stock: 3 }],
                      label: "filters and sorts",
                    },
                  ],
                
                hints: [
                  "Filter then sort ascending.",
                  "Walk through the array and build a new one keeping only the items that pass your check. What method lets you test each item against a condition?",
                  "return products.filter(p => p.___ <= ___).sort((a,b) => a.___ - b.___);"
                  ],},
                order: 7,
              },
              {
                title: "Key Takeaway",
                content:
                  "Low-stock alerts are a filtered, sorted view of the product catalog. Use `lte` for inclusive threshold filtering, allow custom thresholds via query params, and always sort by severity ascending. Protect the endpoint with admin guards.",
                order: 8,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Implement `low-stock` in `reports.service.ts` using `prisma.product.findMany` with `where: { stock: { lte: threshold } }`.",
                order: 1,
              },
              {
                description:
                  "Use `parseInt(query.threshold ?? '10', 10)` for the threshold. The default is 10.",
                order: 2,
              },
              {
                description:
                  "The test checks: default threshold includes stock=3 and stock=0 but excludes stock=15; custom threshold=5 excludes stock=3 (wait, no - stock=3 IS <= 5, so it should be included). Make sure `lte` is inclusive.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description: "Returns products below the default threshold of 10",
                is_required: true,
                order: 1,
              },
              {
                description: "Respects a custom ?threshold query parameter",
                is_required: true,
                order: 2,
              },
              {
                description: "Results include productName, sku, currentStock, categoryName",
                is_required: true,
                order: 3,
              },
              {
                description: "Results are sorted by stock ascending (lowest first)",
                is_required: true,
                order: 4,
              },
              {
                description: "Is admin-only (customer gets 401-403)",
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
    id: "nestjs-bh-level-5",
    title: "Production Hardening",
    subtitle: "Fix overselling, decimal drift, and timezone inconsistency under load.",
    order: 5,
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: Three critical bugs have been reported by BrewHaven users. First, concurrent checkouts can oversell a product with only 1 item in stock. Second, order totals occasionally show more than 2 decimal places due to floating-point drift. Third, daily reports show inconsistent order counts depending on when they are queried. These are production-grade issues that require database-level fixes and defensive coding.",
    xp_reward: 300,
    coin_reward: 150,
    key_takeaways:
      "Pessimistic locking (SELECT ... FOR UPDATE) is the only reliable way to prevent overselling under concurrent load. Application-level read-modify-write sequences have a race window that grows with traffic. In PostgreSQL, `SELECT ... FOR UPDATE` inside a transaction locks the product row before updating stock, ensuring that no other request can modify it between the read and the write.\n\nDecimal precision in financial calculations requires explicit rounding. JavaScript's floating-point arithmetic produces values like 30.029999999999 instead of 30.03. `Math.round(value * 100) / 100` or a dedicated decimal library should always be used for currency math.\n\nTimezone-aware date filtering is essential for reports that group by calendar day. Using `new Date()` or server-local time in SQL queries produces different results depending on where the server is deployed. Dates should always be stored in UTC and use explicit UTC boundaries.",
    scenario_id: "nestjs-bh-scenario-2",
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
                  "This section introduces the crash course for diagnosing and fixing three common production bugs in e-commerce applications: overselling from race conditions, decimal precision drift in financial calculations, and timezone inconsistency in date-grouped reports.",
                order: 1,
              },
              {
                title: "Bug #1: Race Condition / Oversell",
                content:
                  "Client Report: 'Two customers both successfully bought the last Ethiopian Yirgacheffe!'\n\nRoot cause: The checkout reads stock, checks if stock >= quantity, then deducts stock. If two requests read stock=1 simultaneously, both pass the check and both deduct, resulting in stock=-1.\n\nFix: Use `SELECT ... FOR UPDATE` (pessimistic locking) inside a Prisma interactive transaction. Prisma's `$transaction` with raw query or the native `update` with `decrement` both work:\n\nawait prisma.$transaction(async (tx) => {\n  const product = await tx.product.findUnique({\n    where: { id: productId },\n  });\n\n  if (product.stock < quantity) {\n    throw new BadRequestException('Out of stock');\n  }\n\n  await tx.product.update({\n    where: { id: productId },\n    data: { stock: { decrement: quantity } },\n  });\n});\n\nThe transaction serializes concurrent requests. Only one can deduct stock at a time.",
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
                  "For the oversell fix, wrap the stock check and deduction in a transaction. Prisma handles the locking automatically when `$transaction` is used with related queries on the same rows. The key insight is that the stock check and the decrement must happen in the same transaction - not as separate queries.\n\nIf explicit row-level locking is needed, a raw query can be used:\n\nawait prisma.$executeRaw`SELECT * FROM products WHERE id = ${productId} FOR UPDATE`;\n\nThen proceed with the update inside the same transaction.",
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
                    "Implement round2(value) returning value rounded to 2 decimal places as a number. Use Math.round, not toFixed.\n\nExamples: round2(27.03)→27.03, round2(10)→10.",
                  language: "javascript",
                  starter_code:
                    'export function round2(value) {\n  // TODO: round to 2 decimal places\n}\n',
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
                  "Multiply by 100, round, divide by 100.",
                  "Think step by step about what operation transforms your input into the output you need. Break it down into smaller sub-problems and solve each one.",
                  "return Math.round(value * ___) / ___;"
                  ],},
                order: 7,
              },
              {
                title: "Key Takeaway",
                content:
                  "Production e-commerce systems need three defenses: pessimistic locking (or atomic decrement) for stock, explicit rounding for all financial calculations, and explicit UTC date boundaries for reports. These three rules prevent the most common classes of production bugs in online stores.",
                order: 8,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Wrap the stock check and deduction in `prisma.$transaction(async (tx) => { ...  concurrent checkout can pass the stock check at a time.",
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
                description: "Stock never goes negative after concurrent checkouts",
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
                    'export function identifyRootCause() {\n  // TODO: return the deepest root cause\n}\n',
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
                  "Ask yourself: what kind of test was never written that would have caught the oversell bug before it hit production? Frame your answer around what was missing.",
                  "return \"___\";"
                ],},
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


