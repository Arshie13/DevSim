import type { LevelConfig } from "$types";

// Level 1 Configuration
export const LEVEL_1_CONFIG: LevelConfig = {
  level: 1,
  title: "Setup & First API Route",
  stack: "Next.js + Prisma",
  difficulty: "Beginner",
  deadline: 4 * 60 * 60, // 4 hours in seconds
  tasks: [
    {
      id: 1,
      text: "Set up Next.js 15 project with TypeScript",
      completed: false,
    },
    { id: 2, text: "Configure Prisma with PostgreSQL", completed: false },
    { id: 3, text: "Create a simple User model", completed: false },
    { id: 4, text: "Build GET /api/users endpoint", completed: false },
  ],
  scenario: `You've just joined StudentHub as a backend developer! Your first sprint task is to set up the foundation for our course registration system. The team needs you to create the initial Next.js project with Prisma ORM and build your first API endpoint to fetch users.`,
  hints: [
    'Use "pnpm dlx create-next-app@latest" to initialize the project',
    'Install Prisma with "pnpm add prisma @prisma/client"',
    'Initialize Prisma with "pnpm dlx prisma init"',
    "Create your User model in schema.prisma",
    'Generate Prisma Client with "pnpm dlx prisma generate"',
  ],
  starterFiles: {
    "package.json": {
      file: {
        contents: JSON.stringify(
          {
            name: "studenthub-api",
            version: "0.1.0",
            private: true,
            scripts: {
              dev: "next dev",
              build: "next build",
              start: "next start",
            },
            dependencies: {
              next: "~14.2.5",
              react: "~18.3.0",
              "react-dom": "~18.3.0",
              "@prisma/client": "^5.0.0",
            },
            devDependencies: {
              "@types/node": "^20.0.0",
              "@types/react": "~18.3.0",
              typescript: "^5.0.0",
              prisma: "^5.0.0",
            },
          },
          null,
          2,
        ),
      },
    },
    app: {
      directory: {
        "page.tsx": {
          file: {
            contents: `export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">StudentHub API</h1>
      <p className="mt-4 text-lg">Your Next.js + Prisma backend is ready!</p>
    </main>
  );
}
`,
          },
        },
        "layout.tsx": {
          file: {
            contents: `export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
`,
          },
        },
      },
    },
    "tsconfig.json": {
      file: {
        contents: JSON.stringify(
          {
            compilerOptions: {
              target: "ES2017",
              lib: ["dom", "dom.iterable", "esnext"],
              allowJs: true,
              skipLibCheck: true,
              strict: true,
              forceConsistentCasingInFileNames: true,
              noEmit: true,
              esModuleInterop: true,
              module: "esnext",
              moduleResolution: "bundler",
              resolveJsonModule: true,
              isolatedModules: true,
              jsx: "preserve",
              incremental: true,
              paths: {
                "@/*": ["./*"],
              },
            },
            include: ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
            exclude: ["node_modules"],
          },
          null,
          2,
        ),
      },
    },
    "next.config.js": {
      file: {
        contents: `/** @type {import('next').NextConfig} */
const nextConfig = {}

module.exports = nextConfig
`,
      },
    },
  },
};
