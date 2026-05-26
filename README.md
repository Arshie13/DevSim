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
├── prisma/                  # Database schema and migrations
│   └── schema.prisma        # Prisma schema definition
├── scripts/                 # Utility scripts
│   └── reset-docker-containers.ts
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
│   │   │   │   ├── ActivityFeed.svelte
│   │   │   │   ├── CurrentStacks.svelte
│   │   │   │   ├── FinishedStacks.svelte
│   │   │   │   ├── KPIs.svelte
│   │   │   │   ├── LeaderboardSnapshot.svelte
│   │   │   │   ├── StatsDrawer.svelte
│   │   │   │   └── WeeklyStats.svelte
│   │   │   ├── devSidebar/  # IDE sidebar components
│   │   │   │   ├── AiHelp.svelte
│   │   │   │   ├── Explorer.svelte
│   │   │   │   ├── PrimarySidebar.svelte
│   │   │   │   ├── Search.svelte
│   │   │   │   └── SprintTask.svelte
│   │   │   ├── stacks/      # Tech stack selection components
│   │   │   │   ├── CategorySection.svelte
│   │   │   │   ├── PopularCombos.svelte
│   │   │   │   ├── StackInfoModal.svelte
│   │   │   │   ├── StackSummary.svelte
│   │   │   │   └── TechOptionCard.svelte
│   │   │   ├── ui/          # Reusable UI components
│   │   │   └── workspace/   # IDE workspace components
│   │   │       ├── EditorPanel.svelte
│   │   │       ├── PreviewPanel.svelte
│   │   │       ├── TerminalPanel.svelte
│   │   │       ├── WorkspaceBootScreen.svelte
│   │   │       ├── WorkspaceHeader.svelte
│   │   │       └── WorkspaceTabs.svelte
│   │   ├── mocks/           # Mock data for development
│   │   ├── server/          # Server-side logic
│   │   │   ├── accounts/    # User account management
│   │   │   └── docker/      # Docker container management
│   │   ├── stores/          # Svelte stores
│   │   ├── styles/          # Additional styles
│   │   └── types/           # TypeScript type definitions
│   └── routes/              # SvelteKit routes
│       ├── api/             # API endpoints
│       │   ├── ai/          # AI hint endpoints
│       │   └── docker/      # Docker management endpoints
│       ├── dashboard/       # User dashboard
│       ├── login/           # Authentication
│       ├── profile/         # User profile
│       ├── stacks/          # Tech stack selection
│       └── workspace/       # Interactive workspace
├── submodules/              # Git submodules for project templates
│   └── projects/
│       └── tech-stacks/     # Pre-configured tech stack templates
│           ├── nextjs/
│           ├── nextjs-postgres-supabase/
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

### 2. Tech Stack Selection
Users can build custom technology combinations:

| Category | Options |
|----------|---------|
| Frontend | Next.js, React |
| Backend | Express, Next.js API Routes |
| Database | PostgreSQL, Prisma ORM |
| Services | Supabase (Auth & Database) |

### 3. Interactive Workspace
The core learning environment featuring:

- **Monaco Editor**: Full-featured code editor (VS Code engine)
- **Terminal Panel**: Shell access to the container
- **Preview Panel**: Live preview of the application
- **File Explorer**: Navigate and manage project files
- **Task Panel**: View and track sprint tasks
- **AI Help**: Get contextual assistance with coding challenges

### 4. Gamification System
- **XP (Experience Points)**: Earn by completing tasks
- **Coins**: Virtual currency for hints and features
- **Levels**: Progress through levels as you learn
- **Achievements**: Unlock achievements for milestones

### 5. Docker Integration
Each user session runs in an isolated Docker container:
- Create new containers from pre-built images
- Archive and restore container states
- File management (read, write, rename, delete)
- Submit completed sprints for evaluation

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Docker (for containerized development environments)
- pnpm or yarn

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
| `pnpm run docker:container-reset` | Reset all Docker containers (Warning! this will remove all existing docker containers even outside this project! Use with caution!)|

## API Endpoints

### Docker Container Management
- `POST /api/docker/container/create` - Create new container
- `GET /api/docker/container/[id]/status` - Get container status
- `POST /api/docker/container/[id]/start` - Start container
- `POST /api/docker/container/[id]/archive` - Archive container
- `POST /api/docker/container/[id]/restore` - Restore container
- `POST /api/docker/container/[id]/destroy` - Destroy container
- `POST /api/docker/container/[id]/submit` - Submit sprint

### File Operations
- `GET /api/docker/container/[id]/files/list` - List files
- `GET /api/docker/container/[id]/files/read` - Read file
- `POST /api/docker/container/[id]/files/write` - Write file
- `POST /api/docker/container/[id]/files/create` - Create file
- `POST /api/docker/container/[id]/files/delete` - Delete file
- `POST /api/docker/container/[id]/files/rename` - Rename file

### AI Assistance
- `POST /api/ai/hint` - Get AI-powered hints

## Supported Tech Stack Templates

The platform includes pre-configured project templates as submodules:

- **Next.js** - Next.js full-stack application
- **Next.js + PostgreSQL + Supabase** - Full-stack with auth and database
- **React + Express + PostgreSQL + Prisma** - MERN-style stack with Prisma

### Setting Up Sample Projects

Each sample project template requires environment variables to function properly. You need to create a `.env` file in each project directory:

1. Copy the example file or create a new `.env` file:
```bash
# For nextjs-postgres-supabase example:
cp submodules/projects/tech-stacks/nextjs-postgres-supabase/scenario-1/pos-system/.env.example \
   submodules/projects/tech-stacks/nextjs-postgres-supabase/scenario-1/pos-system/.env
```

2. Fill in the required values for each technology in your stack.

When adding new tech stacks, always include a `.env.example` file with placeholder values (never real secrets) so users know what environment variables are required.

## Development

### Adding New Tech Stacks

1. Create a new directory in `submodules/projects/tech-stacks/`
2. Add your project template with necessary configuration
3. Update the stack selection components to include new options
4. Add scenario definitions for learning paths

### Customizing the Workspace

The workspace components in `src/lib/components/workspace/` can be customized:
- Editor themes and configurations
- Terminal shell preferences
- Preview panel settings

## License

This project is proprietary software. All rights reserved.

## Contributing

For development inquiries, please contact the project maintainers.
