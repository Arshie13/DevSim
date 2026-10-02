/**
 * Prisma Seed Script
 *
 * Seeds the database with Level and Scenario data for learning DevOps and full-stack development.
 *
 * Usage:
 *   npx tsx prisma/seed.ts
 *
 * Make sure to run `npx prisma generate` first to generate the client.
 *
 * Task type values:
 *   "client" — only a client-side test exists
 *   "server" — only a server-side test exists
 *   "both"   — both client and server tests exist
 *   "none"   — no automated test (setup/manual tasks)
 */

// @ts-ignore - Prisma client path
import { PrismaClient } from "$prismaclient";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

import { levels as pernScenario1Levels, scenarios as pernScenario1Scenarios } from "./seed/react-express-postgres-prisma/scenario-1/seed";
import { levels as pernScenario2Levels, scenarios as pernScenario2Scenarios } from "./seed/react-express-postgres-prisma/scenario-2/seed";
import { levels as pernScenario3Levels, scenarios as pernScenario3Scenarios } from "./seed/react-express-postgres-prisma/scenario-3/seed";

import { levels as mernScenario1Levels, scenarios as mernScenario1Scenarios } from "./seed/react-express-mongodb/scenario-1/seed";
import { levels as mernScenario2Levels, scenarios as mernScenario2Scenarios } from "./seed/react-express-mongodb/scenario-2/seed";
import { levels as mernScenario3Levels, scenarios as mernScenario3Scenarios } from "./seed/react-express-mongodb/scenario-3/seed";

import { levels as nestjsScenario1Levels, scenarios as nestjsScenario1Scenarios } from "./seed/nestjs-postgres-prisma/scenario-1/seed";
import { levels as nestjsScenario2Levels, scenarios as nestjsScenario2Scenarios } from "./seed/nestjs-postgres-prisma/scenario-2/seed";
import { levels as nestjsScenario3Levels, scenarios as nestjsScenario3Scenarios } from "./seed/nestjs-postgres-prisma/scenario-3/seed";

import { levels as nextjsScenario1Levels, scenarios as nextjsScenario1Scenarios } from "./seed/nextjs-postgres-prisma/scenario-1/seed";
import { levels as nextjsScenario2Levels, scenarios as nextjsScenario2Scenarios } from "./seed/nextjs-postgres-prisma/scenario-2/seed";
import { levels as nextjsScenario3Levels, scenarios as nextjsScenario3Scenarios } from "./seed/nextjs-postgres-prisma/scenario-3/seed";

import { levels as nextjsShadcnScenario1Levels, scenarios as nextjsShadcnScenario1Scenarios } from "./seed/nextjs-shadcn-ui/scenario-1/seed";
import { levels as nextjsShadcnScenario2Levels, scenarios as nextjsShadcnScenario2Scenarios } from "./seed/nextjs-shadcn-ui/scenario-2/seed";
import { levels as nextjsShadcnScenario3Levels, scenarios as nextjsShadcnScenario3Scenarios } from "./seed/nextjs-shadcn-ui/scenario-3/seed";

// import { levels as svelteDrizzleScenario1Levels, scenarios as svelteDrizzleScenario1Scenarios } from "./seed/svelte-drizzle/scenario-1/seed";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? "",
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting database seed...\n");

  console.log("ℹ️  Existing data will be preserved — new records only\n");

  // Define scenarios for each tech stack
  const scenarios = [
    ...pernScenario1Scenarios,
    ...pernScenario2Scenarios,
    ...pernScenario3Scenarios,
    ...mernScenario1Scenarios,
    ...mernScenario2Scenarios,
    ...mernScenario3Scenarios,
    ...nestjsScenario1Scenarios,
    ...nestjsScenario2Scenarios,
    ...nestjsScenario3Scenarios,
    ...nextjsScenario1Scenarios,
    ...nextjsScenario2Scenarios,
    ...nextjsScenario3Scenarios,
    ...nextjsShadcnScenario1Scenarios,
    ...nextjsShadcnScenario2Scenarios,
    ...nextjsShadcnScenario3Scenarios,

    // ...svelteDrizzleScenario1Scenarios,
  ];

  // Define levels with progressive difficulty
  const levels = [
    ...pernScenario1Levels,
    ...pernScenario2Levels,
    ...pernScenario3Levels,
    ...mernScenario1Levels,
    ...mernScenario2Levels,
    ...mernScenario3Levels,
    ...nestjsScenario1Levels,
    ...nestjsScenario2Levels,
    ...nestjsScenario3Levels,
    ...nextjsScenario1Levels,
    ...nextjsScenario2Levels,
    ...nextjsScenario3Levels,
    ...nextjsShadcnScenario1Levels,
    ...nextjsShadcnScenario2Levels,
    ...nextjsShadcnScenario3Levels,

    // ...svelteDrizzleScenario1Levels,
  ];

  // Achievements are NOT seeded. The catalog is static reference data and lives
  // in code — see `src/lib/server/achievements/definitions.ts`. The database only
  // stores unlock records (`user_achievements`), so there is nothing to insert.

  // A scenario must own at least one level (deferred constraint trigger), and that check
  // only runs at COMMIT — so the scenario and its levels must be written in the SAME
  // transaction. `tx` replaces `prisma` for the rest of this block.
  await prisma.$transaction(
    async (tx) => {
      // Insert scenarios first
      console.log("\n📦 Creating scenarios...\n");
      for (const scenario of scenarios) {
        const existing = await tx.scenario.findUnique({ where: { id: scenario.id } });
        if (existing) {
          console.log(`⏭️  Skipped scenario: ${scenario.name} (already exists)`);
          continue;
        }
        await tx.scenario.create({ data: scenario });
        console.log(`✅ Created scenario: ${scenario.name}`);
      }

      // Insert levels
      console.log("\n🎯 Creating levels...\n");
      for (const level of levels) {
        const existing = await tx.level.findUnique({ where: { id: level.id } });
        if (existing) {
          // Upsert tasks by (level_id, task_name).  Nested relations
          // (learning_sections, acceptance_criteria, hints) are cycled only
          // when new data is present so existing rows are preserved when the
          // seed omits them (e.g. a task with no learning_sections block).
          const { tasks, ...levelData } = level;
          await tx.level.update({ where: { id: level.id }, data: levelData });
          for (const task of tasks.create) {
            const { acceptance_criteria, hints, ...taskData } = task;
            const learning_sections = (task as any).learning_sections;
            const updateData: any = { ...taskData };
            if (learning_sections?.create?.length) {
              updateData.learning_sections = { deleteMany: {}, create: learning_sections.create };
            }
            if (acceptance_criteria?.create?.length) {
              updateData.acceptance_criteria = { deleteMany: {}, create: acceptance_criteria.create };
            }
            if (hints?.create?.length) {
              updateData.hints = { deleteMany: {}, create: hints.create };
            }
            await tx.level_task.upsert({
              where: { level_id_task_name: { level_id: level.id, task_name: taskData.task_name } },
              update: updateData,
              create: {
                ...taskData,
                level_id: level.id,
                learning_sections: learning_sections ?? {},
                acceptance_criteria: acceptance_criteria ?? {},
                hints: hints ?? {},
              },
            });
          }
          console.log(`🔄 Updated level: ${level.title}`);
          continue;
        }
        await tx.level.create({ data: level });
        console.log(`✅ Created level: ${level.title}`);
      }
    },
    { timeout: 600_000 }
  );

  // Learner pass rewards are no longer seeded.
  //
  // The ladder moved into code at src/lib/server/learnerPass/schedule.ts. Seeding it
  // here would recreate exactly the drift that change removed: a second copy of the
  // same numbers that the server never reads, free to diverge from what is paid out.

  console.log("\n🎉 Database seeded successfully!\n");

  // Summary
  console.log("📊 Summary:");
  console.log(`   Levels: ${levels.length}`);
  console.log(`   Scenarios: ${scenarios.length}`);
  console.log("\n📋 Difficulty breakdown:");
  const difficultyCount = scenarios.reduce(
    (acc, s) => {
      acc[s.difficulty] = (acc[s.difficulty] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  Object.entries(difficultyCount).forEach(([diff, count]) => {
    console.log(`   ${diff}: ${count}`);
  });
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

