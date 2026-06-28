# DevSim - Interactive Full-Stack Development Platform

DevSim is an interactive project-based simulation platform designed to help aspiring software developers master full-stack web development through realistic, hands-on practice. Unlike traditional learning platforms that teach technologies in isolation, DevSim focuses on teaching how frontend, backend, database, and authentication components work together as integrated systems.

## Overview

DevSim provides an immersive learning environment where users can:

- **Select Tech Stacks**: Choose from various technology combinations including frontend frameworks, backend servers, databases, and additional services
- **Work in Real Environments**: Execute code in isolated Docker containers that simulate real-world development environments
- **Complete Sprint Tasks**: Work through guided tasks and scenarios with time-based challenges
- **Get AI Assistance**: Receive contextual hints and guidance from an AI-powered assistant
- **Track Progress**: Monitor learning progress through a comprehensive dashboard with KPIs, stats, and achievements

## Tech Stack

### Frontend
- **SvelteKit** - Full-stack web framework
- **Svelte 5** - Latest version with runes
- **TailwindCSS** - Utility-first CSS framework
- **Monaco Editor** - VS Code's editor component for code editing
- **xterm.js** - Terminal emulator for shell access
- **Lucide Svelte** - Icon library
- **mdsvex** - Markdown for Svelte

### Backend
- **Auth.js (SvelteKit Auth)** - Authentication solution
- **Prisma** - Type-safe ORM
- **PostgreSQL** - Primary database
- **WebSocket** - Real-time communication

### Infrastructure
- **Docker** - Containerization for isolated development environments
- **Dockerode** - Docker API client for Node.js

### AI Integration
- **AI-Powered Hints** - Contextual assistance using AI to help users overcome challenges

## Project Structure

```
devsim/
├── prisma/
│   ├── schema.prisma        # Prisma schema definition
│   └── seed/                # Database seed scripts for scenarios
├── scripts/                 # Utility scripts
│   ├── reset-docker-containers.ts
│   ├── create-image.ts
│   ├── setup-shared-postgres.ts
│   └── create-volumes.ts
├── src/
│   ├── app.css              # Global styles
│   ├── app.html             # HTML template
│   ├── auth.ts              # Authentication configuration
│   ├── hooks.server.ts      # Server hooks
│   ├── lib/
│   │   ├── ai/              # AI-related functionality
│   │   │   ├── codeDetector.ts
│   │   │   ├── contextBuilder.ts
│   │   │   ├── index.ts
│   │   │   └── messageFormatter.ts
│   │   ├── client/          # Client-side initializers
│   │   │   ├── MonacoInitializer.ts
│   │   │   └── TerminalInitializer.ts
│   │   ├── components/      # Reusable UI components
│   │   │   ├── dashboard/   # Dashboard components
│   │   │   ├── workspace/   # IDE workspace components
│   │   │   │   ├── crashcourse/          # Learning crash course components
│   │   │   │   ├── SubmitSprintModal.svelte
│   │   │   │   ├── TerminalManagerPanel.svelte
│   │   │   │   ├── FileTabBar.svelte
│   │   │   │   ├── KeyTakeawaysModal.svelte
│   │   │   │   ├── TakeawayCard.svelte
│   │   │   │   ├── TakeawayContent.svelte
│   │   │   │   ├── TakeawayHeader.svelte
│   │   │   │   ├── TakeawayNavigation.svelte
│   │   │   │   ├── WorkspaceBootScreen.svelte
│   │   │   │   ├── WorkspaceHeader.svelte
│   │   │   │   ├── WorkspaceTabs.svelte
│   │   │   │   ├── EditorPanel.svelte
│   │   │   │   ├── PreviewPanel.svelte
│   │   │   │   └── TerminalPanel.svelte
│   │   │   ├── stacks/      # Tech stack selection components
│   │   │   ├── ui/          # Reusable UI components
│   │   │   ├── scenario/    # Scenario components
│   │   │   ├── tutorial/    # Tutorial components
│   │   │   ├── onboarding/  # Onboarding components
│   │   │   ├── achievements/ # Achievement components
│   │   │   ├── rivals/      # Rival comparison components
│   │   │   ├── dailyRewards/ # Daily rewards components
│   │   │   ├── projects/    # Project components
│   │   │   └── aiHelp/      # AI assistance components
│   │   ├── layers/          # Service and data access layer
│   │   │   ├── service/
│   │   │   └── data-access/
│   │   ├── mocks/           # Mock data for development
│   │   ├── server/          # Server-side logic
│   │   │   ├── docker/      # Docker container management
│   │   │   ├── stats/       # Statistics and analytics
│   │   │   ├── achievements/ # Achievement system
│   │   │   ├── access/      # Project access control
│   │   │   ├── app-settings.ts
│   │   │   ├── accounts/    # User account management
│   │   │   ├── websocket/   # WebSocket handlers
│   │   │   ├── keyTakeaways.ts
│   │   │   ├── ratelimit.ts
│   │   │   └── fileChangeLogger.ts
│   │   ├── stores/          # Svelte stores
│   │   ├── styles/          # Additional styles
│   │   └── types/           # TypeScript type definitions
│   └── routes/              # SvelteKit routes
│       ├── api/             # API endpoints
│       │   ├── ai/          # AI endpoints (hint, score, stack-description)
│       │   ├── docker/      # Docker management endpoints
│       │   ├── user/        # User management endpoints
│       │   ├── level/       # Level key takeaways
│       │   ├── stripe/      # Payment processing
│       │   ├── admin/       # Admin settings
│       │   ├── tests/       # Test runner
│       │   └── app-settings/ # Application settings
│       ├── dashboard/       # User dashboard
│       ├── login/           # Authentication
│       ├── profile/         # User profile
│       ├── stacks/          # Tech stack selection
│       ├── workspace/       # Interactive workspace
│       ├── rivals/          # Rival comparison
│       ├── achievements/    # Achievement display
│       ├── leaderboards/    # Leaderboard
│       ├── tutorial/        # Tutorial workspace
│       ├── scenario/        # Scenario selection
│       ├── projects/        # Project management
│       ├── pass/            # Learner pass system
│       ├── pretest/         # Pre-assessment
│       ├── postassessment/  # Post-assessment
│       ├── marketplace/     # Coin marketplace
│       └── admin/           # Admin panel
├── submodules/              # Git submodules for project templates
│   └── projects/
│       └── tech-stacks/     # Pre-configured tech stack templates
│           ├── nextjs-postgres-prisma/
│           ├── nextjs-postgres-supabase/
│           ├── nextjs-shadcn-ui/
│           ├── nestjs-postgres-prisma/
│           ├── react-express-mongodb/
│           └── react-express-postgres-prisma/
└── static/                  # Static assets
```

## Features

### 1. Dashboard
- **Welcome Section**: Personalized greeting with quick actions
- **KPIs Display**: Key performance indicators showing progress
- **Current Stacks**: Active learning sessions
- **Finished Stacks**: Completed projects with rewards
- **Stats Drawer**: Detailed statistics and weekly activity
- **Activity Feed**: User's recent task completions

### 2. Tech Stack Selection
Users can build custom technology combinations:

| Category | Options |
|----------|---------|
| Frontend | Next.js, React |
| Backend | Express, NestJS, Next.js API Routes |
| Database | PostgreSQL, MongoDB, Prisma ORM |
| Services | Supabase (Auth & Database) |

### 3. Interactive Workspace
The core learning environment featuring:

- **Monaco Editor**: Full-featured code editor (VS Code engine)
- **Terminal Panel**: Shell access to the container
- **Preview Panel**: Live preview of the application
- **File Explorer**: Navigate and manage project files
- **Task Panel**: View and track sprint tasks
- **AI Help**: Get contextual assistance with coding challenges
- **Test Runner**: Execute tests and view results
- **Key Takeaways**: Learning summaries and insights

### 4. Gamification System
- **XP (Experience Points)**: Earn by completing tasks
- **Coins**: Virtual currency for hints and features
- **Levels**: Progress through levels as you learn
- **Achievements**: Unlock achievements for milestones
- **Daily Rewards**: Claim daily login rewards
- **Learner Pass**: 30-day challenge pass with premium rewards

### 5. Docker Integration
Each user session runs in an isolated Docker container:
- Create new containers from pre-built images
- Archive and restore container states
- File management (read, write, create, delete, rename)
- Terminal access via WebSocket
- Submit completed sprints for evaluation
- Run automated tests in containers

### 6. Assessment System
- **Pretest**: Assess initial skill level
- **Post-assessment**: Measure learning progress
- **Topic-based scoring**: Track improvement by topic

### 7. Social Features
- **Leaderboards**: Compare progress with other learners
- **Rivals**: Challenge friends or compete with others

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Docker (for containerized development environments)
- pnpm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd devsim
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Initialize the database:
```bash
pnpm run db:generate
pnpm run db:push
pnpm run db:seed
```

5. Start the development server:
```bash
pnpm run dev
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start development server |
| `pnpm run build` | Build for production |
| `pnpm run preview` | Preview production build |
| `pnpm run db:generate` | Generate Prisma client |
| `pnpm run db:push` | Push schema to database |
| `pnpm run db:studio` | Open Prisma Studio |
| `pnpm run db:seed` | Seed database with initial data |
| `pnpm run db:reset` | Reset database |
| `pnpm run docker:container-reset` | Reset all Docker containers (Warning! removes all existing docker containers) |
| `pnpm run docker:build-image` | Build Docker image |
| `pnpm run docker:rebuild-image` | Rebuild Docker image without cache |
| `pnpm run docker:create-project-images` | Create project images |
| `pnpm run docker:setup-shared-postgres` | Setup shared PostgreSQL for containers |
| `pnpm run validate` | Run TypeScript type checking |
| `pnpm run check` | Run Svelte check |
| `pnpm run test` | Run tests |

## API Endpoints

### Docker Container Management
- `POST /api/docker/container/create` - Create new container
- `GET /api/docker/container/[id]/status` - Get container status
- `POST /api/docker/container/[id]/start` - Start container
- `POST /api/docker/container/[id]/stop` - Stop container
- `POST /api/docker/container/[id]/archive` - Archive container
- `POST /api/docker/container/[id]/restore` - Restore container
- `POST /api/docker/container/[id]/destroy` - Destroy container
- `POST /api/docker/container/[id]/submit` - Submit sprint
- `GET /api/docker/container/[id]/logs` - Get container logs
- `POST /api/docker/container/[id]/clear-logs` - Clear container logs
- `POST /api/docker/container/[id]/download` - Download workspace files

### File Operations
- `GET /api/docker/container/[id]/files/list` - List files
- `GET /api/docker/container/[id]/files/read` - Read file
- `POST /api/docker/container/[id]/files/write` - Write file
- `POST /api/docker/container/[id]/files/create` - Create file
- `POST /api/docker/container/[id]/files/delete` - Delete file
- `POST /api/docker/container/[id]/files/rename` - Rename file
- `GET /api/docker/container/[id]/files/search` - Search files

### AI Assistance
- `POST /api/ai/hint` - Get AI-powered hints
- `POST /api/ai/score` - Get AI scoring for submissions
- `POST /api/ai/stack-description` - Get stack descriptions

### User Management
- `POST /api/user/onboarding` - Update onboarding status
- `POST /api/user/pretest` - Submit pretest answers
- `POST /api/user/postassessment` - Submit post-assessment
- `POST /api/user/daily-rewards/claim` - Claim daily rewards
- `GET /api/user/rivals` - Get rival users
- `POST /api/user/avatar` - Update user avatar
- `POST /api/user/username/update` - Update username

### Test Operations
- `POST /api/docker/container/[id]/tests/run` - Run tests in container
- `POST /api/docker/container/[id]/tests/cancel` - Cancel running tests

### Admin
- `GET /api/admin/settings` - Get admin settings
- `POST /api/admin/settings` - Update admin settings

## Supported Tech Stack Templates

The platform includes pre-configured project templates as submodules:

- **Next.js + PostgreSQL + Prisma** - Full-stack with Prisma ORM
- **Next.js + PostgreSQL + Supabase** - Full-stack with Supabase auth/database
- **Next.js + shadcn/ui** - Modern UI components
- **React + Express + MongoDB** - MERN-style stack
- **React + Express + PostgreSQL + Prisma** - PERN-style stack with Prisma
- **NestJS + PostgreSQL + Prisma** - Structured backend with Prisma

### Structure
Each tech stack template includes:
- Complete project boilerplate
- Database migrations and seeding
- Test files for automated evaluation
- Scenario-specific learning tasks

## Development

### Adding New Tech Stacks

1. Create a new directory in `submodules/projects/tech-stacks/`
2. Add your project template with necessary configuration
3. Include a `project.md` file describing the project
4. Add test files under `tests/server/` for evaluation
5. Add scenario seed data if needed in `prisma/seed/`
6. Update the stack selection components to include new options

### Key Directories

- `src/lib/layers/service/` - Business logic layer
- `src/lib/layers/data-access/` - Database access layer
- `src/lib/server/` - Server utilities and services
- `src/lib/components/` - Reusable Svelte components
- `prisma/seed/` - Database seed scripts by tech stack

## License

This project is proprietary software. All rights reserved.

## Contributing

For development inquiries, please contact the project maintainers.