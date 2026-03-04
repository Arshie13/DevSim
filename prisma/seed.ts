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
  await prisma.userStackOptions.deleteMany();
  await prisma.scenario.deleteMany();
  await prisma.level.deleteMany();
  
  console.log('🗑️  Cleared existing levels and scenarios\n');

  // Define levels with progressive difficulty
  const levels = [
    {
      id: 'level-beginner',
      title: 'Beginner Fundamentals',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      levelDescription: 'Learn the basics of full-stack development. Set up your development environment, understand project structure, and create simple features.',
      hints: [
        'Start by exploring the project structure',
        'Check the package.json for available scripts',
        'Look at existing components for code patterns',
        'Use console.log for debugging',
        'Check the database schema for data models'
      ],
      xpReward: 100,
      coinReward: 50,
      task: [
        'Explore the project structure',
        'Set up environment variables',
        'Create a simple API endpoint',
        'Connect to the database',
        'Deploy your first feature'
      ],
      completedTask: []
    },
    {
      id: 'level-intermediate',
      title: 'Intermediate Development',
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      levelDescription: 'Build upon the fundamentals. Implement authentication, handle form submissions, and create RESTful APIs.',
      hints: [
        'Review authentication patterns in the project',
        'Use environment variables for sensitive data',
        'Implement input validation',
        'Handle errors gracefully',
        'Write clean, modular code'
      ],
      xpReward: 250,
      coinReward: 150,
      task: [
        'Implement user authentication',
        'Create RESTful API endpoints',
        'Add form validation',
        'Set up database migrations',
        'Write unit tests'
      ],
      completedTask: []
    },
    {
      id: 'level-advanced',
      title: 'Advanced Full-Stack',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      levelDescription: 'Master advanced concepts. Optimize performance, implement real-time features, and deploy to production.',
      hints: [
        'Profile your application for performance bottlenecks',
        'Implement caching strategies',
        'Use WebSockets for real-time features',
        'Set up CI/CD pipelines',
        'Monitor application health'
      ],
      xpReward: 500,
      coinReward: 300,
      task: [
        'Optimize database queries',
        'Implement WebSocket functionality',
        'Set up CI/CD pipeline',
        'Configure production environment',
        'Deploy to cloud platform'
      ],
      completedTask: []
    },
    {
      id: 'level-expert',
      title: 'Expert DevOps',
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      levelDescription: 'Become a DevOps expert. Master containerization, orchestration, and infrastructure as code.',
      hints: [
        'Use Docker for containerization',
        'Implement Kubernetes orchestration',
        'Set up monitoring and logging',
        'Use infrastructure as code tools',
        'Automate everything'
      ],
      xpReward: 1000,
      coinReward: 500,
      task: [
        'Dockerize the application',
        'Set up Kubernetes deployment',
        'Configure monitoring tools',
        'Implement log aggregation',
        'Create disaster recovery plan'
      ],
      completedTask: []
    }
  ];

  // Insert levels
  for (const level of levels) {
    await prisma.level.create({ data: level });
    console.log(`✅ Created level: ${level.title}`);
  }

  console.log('\n📦 Creating scenarios...\n');

  // Define scenarios for each tech stack
  const scenarios = [
    // NestJS + PostgreSQL + Prisma scenarios
    {
      levelId: 'level-beginner',
      name: 'NestJS Money Tracker - Basic Setup',
      description: 'Set up a basic money tracking application with NestJS, PostgreSQL, and Prisma. Create your first database model and API endpoint.',
      difficulty: 'easy'
    },
    {
      levelId: 'level-beginner',
      name: 'NestJS Account API',
      description: 'Create a simple account management API. Learn about NestJS controllers, services, and Prisma CRUD operations.',
      difficulty: 'easy'
    },
    {
      levelId: 'level-intermediate',
      name: 'NestJS Authentication',
      description: 'Implement JWT authentication with Passport. Create protected routes and user registration/login flows.',
      difficulty: 'medium'
    },
    {
      levelId: 'level-intermediate',
      name: 'NestJS Transaction Management',
      description: 'Build transaction handling for money transfers. Implement validation and error handling for financial operations.',
      difficulty: 'medium'
    },
    {
      levelId: 'level-advanced',
      name: 'NestJS Real-time Notifications',
      description: 'Add WebSocket support for real-time transaction notifications. Learn about NestJS gateways and event-driven architecture.',
      difficulty: 'hard'
    },
    {
      levelId: 'level-advanced',
      name: 'NestJS Report Generation',
      description: 'Create automated report generation with PDF export. Implement background jobs and scheduled tasks.',
      difficulty: 'hard'
    },
    {
      levelId: 'level-expert',
      name: 'NestJS Microservices',
      description: 'Refactor the application into microservices. Implement service communication and API gateway.',
      difficulty: 'expert'
    },

    // Next.js scenarios
    {
      levelId: 'level-beginner',
      name: 'Next.js Basic Page',
      description: 'Create your first Next.js page. Learn about file-based routing and React Server Components.',
      difficulty: 'easy'
    },
    {
      levelId: 'level-beginner',
      name: 'Next.js API Routes',
      description: 'Build API routes in Next.js. Understand GET, POST requests and data fetching patterns.',
      difficulty: 'easy'
    },
    {
      levelId: 'level-intermediate',
      name: 'Next.js Authentication',
      description: 'Implement NextAuth.js authentication. Create protected routes and session management.',
      difficulty: 'medium'
    },
    {
      levelId: 'level-intermediate',
      name: 'Next.js Database Integration',
      description: 'Connect to PostgreSQL using Prisma. Perform CRUD operations with React Server Actions.',
      difficulty: 'medium'
    },
    {
      levelId: 'level-advanced',
      name: 'Next.js Real-time Chat',
      description: 'Build a real-time chat application using WebSockets and Server-Sent Events.',
      difficulty: 'hard'
    },
    {
      levelId: 'level-advanced',
      name: 'Next.js Performance Optimization',
      description: 'Optimize application performance with caching, image optimization, and code splitting.',
      difficulty: 'hard'
    },
    {
      levelId: 'level-expert',
      name: 'Next.js Full-stack Deployment',
      description: 'Deploy Next.js with Docker and Kubernetes. Set up CI/CD and monitoring.',
      difficulty: 'expert'
    },

    // React + Express + PostgreSQL scenarios
    {
      levelId: 'level-beginner',
      name: 'React Express Setup',
      description: 'Set up a React frontend with Express backend. Learn about CORS and proxy configuration.',
      difficulty: 'easy'
    },
    {
      levelId: 'level-beginner',
      name: 'Express REST API',
      description: 'Build a RESTful API with Express. Learn about routing, middleware, and error handling.',
      difficulty: 'easy'
    },
    {
      levelId: 'level-intermediate',
      name: 'React State Management',
      description: 'Implement state management with Redux or Context API. Handle complex form states.',
      difficulty: 'medium'
    },
    {
      levelId: 'level-intermediate',
      name: 'Express Authentication',
      description: 'Create JWT-based authentication system. Implement refresh tokens and secure routes.',
      difficulty: 'medium'
    },
    {
      levelId: 'level-advanced',
      name: 'React Real-time Dashboard',
      description: 'Build a real-time dashboard with WebSocket updates. Implement live data visualization.',
      difficulty: 'hard'
    },
    {
      levelId: 'level-advanced',
      name: 'Express Performance',
      description: 'Optimize Express API performance. Implement caching, rate limiting, and compression.',
      difficulty: 'hard'
    },
    {
      levelId: 'level-expert',
      name: 'Full-stack Microservices',
      description: 'Convert monolithic app to microservices. Implement service discovery and load balancing.',
      difficulty: 'expert'
    },

    // Next.js + Supabase scenarios
    {
      levelId: 'level-beginner',
      name: 'Supabase Quickstart',
      description: 'Connect Next.js to Supabase. Set up authentication and database in minutes.',
      difficulty: 'easy'
    },
    {
      levelId: 'level-beginner',
      name: 'Supabase Database Basics',
      description: 'Create tables and manage data with Supabase JavaScript client. Learn about Row Level Security.',
      difficulty: 'easy'
    },
    {
      levelId: 'level-intermediate',
      name: 'Supabase Auth Deep Dive',
      description: 'Implement advanced authentication with Supabase. Handle social login and email confirmation.',
      difficulty: 'medium'
    },
    {
      levelId: 'level-intermediate',
      name: 'Supabase Realtime',
      description: 'Use Supabase Realtime for live data. Implement presence and broadcast features.',
      difficulty: 'medium'
    },
    {
      levelId: 'level-advanced',
      name: 'Supabase Edge Functions',
      description: 'Write serverless Edge Functions. Implement custom API logic with Deno.',
      difficulty: 'hard'
    },
    {
      levelId: 'level-advanced',
      name: 'Supabase Storage',
      description: 'Implement file upload and management with Supabase Storage. Add image transformations.',
      difficulty: 'hard'
    },
    {
      levelId: 'level-expert',
      name: 'Supabase Multi-tenant',
      description: 'Build a multi-tenant application using Supabase. Implement row-level isolation.',
      difficulty: 'expert'
    },

    // Next.js + shadcn/ui scenarios
    {
      levelId: 'level-beginner',
      name: 'shadcn/ui Setup',
      description: 'Install and configure shadcn/ui components. Build your first responsive layout.',
      difficulty: 'easy'
    },
    {
      levelId: 'level-beginner',
      name: 'Building Forms',
      description: 'Create forms using React Hook Form and Zod validation with shadcn/ui components.',
      difficulty: 'easy'
    },
    {
      levelId: 'level-intermediate',
      name: 'Dashboard Layout',
      description: 'Build a complete dashboard layout with sidebar, header, and data tables.',
      difficulty: 'medium'
    },
    {
      levelId: 'level-intermediate',
      name: 'Interactive Components',
      description: 'Implement modals, dropdowns, and complex UI interactions with shadcn/ui.',
      difficulty: 'medium'
    },
    {
      levelId: 'level-advanced',
      name: 'Theme Customization',
      description: 'Customize the theme with CSS variables. Create dark/light mode and brand colors.',
      difficulty: 'hard'
    },
    {
      levelId: 'level-advanced',
      name: 'Advanced Data Display',
      description: 'Build complex data tables with sorting, filtering, and pagination.',
      difficulty: 'hard'
    },
    {
      levelId: 'level-expert',
      name: 'Component Library',
      description: 'Create a reusable component library using shadcn/ui patterns and best practices.',
      difficulty: 'expert'
    }
  ];

  // Insert scenarios
  for (const scenario of scenarios) {
    await prisma.scenario.create({ data: scenario });
    const level = levels.find(l => l.id === scenario.levelId);
    console.log(`✅ Created scenario: ${scenario.name} (${level?.title})`);
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
