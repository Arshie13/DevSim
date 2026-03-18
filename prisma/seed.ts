/**
 * Prisma Seed Script
 * 
 * Seeds the database with Level and Scenario data for learning DevOps and full-stack development.
 * 
 * Usage:
 *   npx tsx prisma/seed.ts
 * 
 * Make sure to run `npx prisma generate` first to generate the client.
 */

// @ts-ignore - Prisma client path
import { PrismaClient } from '$prismaclient';
import { PrismaPg } from "@prisma/adapter-pg";
import 'dotenv/config';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? "",
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Clear existing data
  await prisma.completedTask.deleteMany();
  await prisma.containerStack.deleteMany();
  await prisma.fileChange.deleteMany();
  await prisma.container.deleteMany();
  await prisma.session.deleteMany();
  await prisma.acceptanceCriteria.deleteMany();
  await prisma.hint.deleteMany();
  await prisma.levelTask.deleteMany();
  await prisma.level.deleteMany();
  await prisma.scenario.deleteMany();
  
  console.log('🗑️  Cleared existing data\n');

  // Define scenarios for each tech stack
  const scenarios = [
    {
      id: 'scenario-1',
      name: 'BookWise Library Management System',
      description: 'Build a full-featured web-based Library Management System to manage books, members, and borrowing workflows using React, Express, PostgreSQL, and Prisma.',
      difficulty: 'expert'
    }
  ];

  // Define levels with progressive difficulty
  const levels = [
    {
      id: 'level-1',
      title: 'Setup & Simple UI Fixes',
      order: 1,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      levelDescription: 'The library has onboarded a new developer (you!) and needs the system running locally with minor UI tweaks.',
      xpReward: 100,
      coinReward: 50,
      scenarioId: 'scenario-1',
      tasks: {
        create: [
          {
            taskName: 'Environment Setup',
            order: 1,
            acceptanceCriteria: {
              create: [
                { description: 'Dependencies installed for both client and server', isRequired: true, order: 1 },
                { description: '.env file configured with database and JWT secret', isRequired: true, order: 2 },
                { description: 'Prisma migrations executed successfully', isRequired: true, order: 3 },
                { description: 'Both client and server running without errors', isRequired: true, order: 4 }
              ]
            }
          },
          {
            taskName: 'UI Text Updates',
            order: 2,
            acceptanceCriteria: {
              create: [
                { description: '"Sign Up" changed to "Register" on auth page', isRequired: true, order: 1 },
                { description: 'Header subtitle updated to "BookWise Public Library"', isRequired: true, order: 2 }
              ]
            }
          }
        ]
      }
    },
    {
      id: 'level-2',
      title: 'Bug Fixing & Refactoring',
      order: 2,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      levelDescription: 'Members report they cannot borrow books even when copies are available.',
      xpReward: 250,
      coinReward: 150,
      scenarioId: 'scenario-library-management',
      tasks: {
        create: [
          {
            taskName: 'Bug Fix – Borrow Button Disabled Incorrectly',
            order: 1,
            acceptanceCriteria: {
              create: [
                { description: 'Books with availableCopies > 0 show as available', isRequired: true, order: 1 },
                { description: 'Books with availableCopies = 0 show as unavailable', isRequired: true, order: 2 },
                { description: 'Borrow button enabled/disabled correctly based on availability', isRequired: true, order: 3 }
              ]
            }
          },
          {
            taskName: 'Refactor Availability Logic',
            order: 2,
            acceptanceCriteria: {
              create: [
                { description: 'Availability logic moved to reusable helper function', isRequired: true, order: 1 },
                { description: 'Helper function used in BookDetails.tsx', isRequired: true, order: 2 },
                { description: 'No duplication of availability logic', isRequired: true, order: 3 }
              ]
            }
          }
        ]
      }
    },
    {
      id: 'level-3',
      title: 'Feature Development',
      order: 3,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      levelDescription: 'The library wants better visibility into borrowing activity.',
      xpReward: 500,
      coinReward: 300,
      scenarioId: 'scenario-library-management',
      tasks: {
        create: [
          {
            taskName: 'Overdue Books View',
            order: 1,
            acceptanceCriteria: {
              create: [
                { description: 'Page shows list of overdue books', isRequired: true, order: 1 },
                { description: 'Each overdue book shows member name', isRequired: true, order: 2 },
                { description: 'Each overdue book shows days overdue', isRequired: true, order: 3 },
                { description: 'Only truly overdue books are displayed', isRequired: true, order: 4 }
              ]
            }
          },
          {
            taskName: 'Member Borrow History',
            order: 2,
            acceptanceCriteria: {
              create: [
                { description: 'Member dashboard shows borrowing history', isRequired: true, order: 1 },
                { description: 'History includes book titles, borrow/return dates', isRequired: true, order: 2 },
                { description: 'History shows status (BORROWED, RETURNED, OVERDUE)', isRequired: true, order: 3 }
              ]
            }
          }
        ]
      }
    },
    {
      id: 'level-4',
      title: 'Integration & Edge Cases',
      order: 4,
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      levelDescription: 'Returning books occasionally causes negative available copy counts.',
      xpReward: 1000,
      coinReward: 500,
      scenarioId: 'scenario-library-management',
      tasks: {
        create: [
          {
            taskName: 'Debug Return Logic',
            order: 1,
            acceptanceCriteria: {
              create: [
                { description: 'Frontend return request properly sent to backend', isRequired: true, order: 1 },
                { description: 'Backend correctly processes return requests', isRequired: true, order: 2 },
                { description: 'Prisma update queries modify availableCopies correctly', isRequired: true, order: 3 }
              ]
            }
          },
          {
            taskName: 'Add Transaction Safety',
            order: 2,
            acceptanceCriteria: {
              create: [
                { description: 'Borrow/return operations use database transactions', isRequired: true, order: 1 },
                { description: 'No negative available copy values after returns', isRequired: true, order: 2 },
                { description: 'Concurrent requests handled safely', isRequired: true, order: 3 }
              ]
            }
          }
        ]
      }
    },
    {
      id: 'level-5',
      title: 'Real Client Issue',
      order: 5,
      deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      levelDescription: '"Some members are marked overdue even after returning books. The reports don’t match reality."',
      xpReward: 2000,
      coinReward: 1000,
      scenarioId: 'scenario-library-management',
      tasks: {
        create: [
          {
            taskName: 'Investigate Overdue Logic',
            order: 1,
            acceptanceCriteria: {
              create: [
                { description: 'Timezone handling consistent across application', isRequired: true, order: 1 },
                { description: 'Returned date properly compared for overdue calculation', isRequired: true, order: 2 },
                { description: 'Status updates correctly when books returned', isRequired: true, order: 3 }
              ]
            }
          },
          {
            taskName: 'Fix & Document',
            order: 2,
            acceptanceCriteria: {
              create: [
                { description: 'Overdue status accurately reflects actual borrowing state', isRequired: true, order: 1 },
                { description: 'Reports match borrowing records exactly', isRequired: true, order: 2 },
                { description: 'Clear documentation of root cause and fix provided', isRequired: true, order: 3 }
              ]
            }
          }
        ]
      }
    }
  ];

  // Insert scenarios first
  console.log('\n📦 Creating scenarios...\n');
  for (const scenario of scenarios) {
    await prisma.scenario.create({ data: scenario });
    console.log(`✅ Created scenario: ${scenario.name}`);
  }

  // Insert levels
  console.log('\n🎯 Creating levels...\n');
  for (const level of levels) {
    await prisma.level.create({ data: level });
    console.log(`✅ Created level: ${level.title}`);
  }

  console.log('\n🎉 Database seeded successfully!\n');
  
  // Summary
  console.log('📊 Summary:');
  console.log(`   Levels: ${levels.length}`);
  console.log(`   Scenarios: ${scenarios.length}`);
  console.log('\n📋 Difficulty breakdown:');
  const difficultyCount = scenarios.reduce((acc, s) => {
    acc[s.difficulty] = (acc[s.difficulty] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  Object.entries(difficultyCount).forEach(([diff, count]) => {
    console.log(`   ${diff}: ${count}`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
