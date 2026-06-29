export const scenarios = [
  {
    id: "nextjs-shadcn-ui-scenario-3",
    name: "Riverside University Student Portal",
    description:
      "Build a student portal for Riverside University using Next.js and shadcn/ui. Students view grades, schedule, fees, and write personal notes with client-side persistence.",
    difficulty: "intermediate",
    isPaywalled: true,
  },
];

export const levels = [
  {
    id: "nextjs-shadcn-ui-scenario-3-level-1",
    title: "Onboarding the Student Portal",
    subtitle: "Bootstrap the dev environment",
    order: 1,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: Riverside University has onboarded a new developer and needs the student portal running locally. Set up the Next.js development environment by installing dependencies, adding the required shadcn/ui components, and verifying the dev server starts cleanly.",
    xp_reward: 10,
    coin_reward: 20,
    key_takeaways:
      "Installing project dependencies with pnpm install ensures all required libraries are available. Adding shadcn/ui components via the CLI copies them into the project source for full ownership. Verifying the dev server boots without errors establishes a reliable baseline before any feature work begins.",
    scenario_id: "nextjs-shadcn-ui-scenario-3",
    tasks: {
      create: [
        {
          task_name: "Environment Setup",
          test_type: "both",
          user_story:
            "As a developer, I want to install dependencies and add required shadcn/ui components so that the student portal runs locally.",
          learning_sections: {
            create: [
              {
                title: "Overview\nBooting a Next.js + shadcn/ui Portal",
                content:
                  "This section walks through getting a Next.js student portal running locally. The flow is the same on every Next.js project: install dependencies, add required UI components, then verify the dev server starts cleanly.",
                order: 1,
              },
              {
                title: "What Lives Where",
                content:
                  "A typical Next.js + shadcn/ui project is structured like:\nproject/\n    ├── src/\n    │     ├── app/ ← Next.js routes and pages\n    │     ├── components/ ← shadcn/ui components and custom ones\n    │     ├── lib/ ← shared helpers and mock data\n    │     └── hooks/ ← custom React hooks\n    ├── package.json ← scripts and dependencies\n\nKnowing where files live makes navigating the codebase productive from day one.",
                order: 2,
              },
              {
                title: "What is shadcn/ui?",
                content:
                  "shadcn/ui is a collection of reusable, accessible UI components built on top of Radix UI and Tailwind CSS. The components are copied directly into the project source, giving full ownership and easy customization.",
                order: 3,
              },
              {
                title: "Package Management 101",
                content:
                  "Package management is the process of managing external code dependencies a project relies on. A package manager such as pnpm handles installing, updating, and removing dependencies, ensuring the correct versions are available.\n\nIn an existing project with a package.json file, running pnpm install downloads all listed dependencies. The package.json lists all the libraries the app needs (React, Next.js, shadcn/ui components, Tailwind CSS). pnpm install downloads them into node_modules.",
                order: 4,
              },
              {
                title: "The Development Server",
                content:
                  "Next.js includes a built-in development server that provides hot module replacement and Fast Refresh. Running pnpm run dev starts the server, watches for file changes, and instantly updates the browser without a full page reload.\n\nBefore writing any feature code, always verify the dev server starts without errors — this confirms the project setup is complete and establishes a known-good baseline.",
                order: 5,
              },
              {
                title: "Practice Lab: Adding shadcn/ui Components",
                content:
                  "Practice adding a shadcn/ui component using the CLI. Running the command below downloads the component source into the project's components/ui folder, where it can be customized.\n\npnpm dlx shadcn@latest add avatar",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "TERMINAL_CMD" as const,
                interactive_config: {
                  instructions:
                    "Run the shadcn/ui CLI command to add the Avatar component. Type the exact command and click Check to verify.",
                  expected_commands: [
                    "pnpm dlx shadcn@latest add avatar",
                  ],
                },
                order: 6,
              },
              {
                title: "Key Takeaway",
                content:
                  "Setting up a Next.js project means installing dependencies, adding required UI components, and confirming the dev server starts cleanly — this establishes a reliable baseline before any feature work.",
                order: 7,
              },
            ],
          },
          hints: {
            create: [
              {
                description: "Install dependencies using pnpm install at the project root",
                order: 1,
              },
              {
                description: "Add the shadcn Alert component using pnpm dlx shadcn@latest add alert",
                order: 2,
              },
              {
                description: "Start the development server and verify it loads",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description: "App runs without errors on pnpm run dev",
                is_required: true,
                order: 1,
              },
              {
                description: "Required shadcn/components/ui/alert component is installed",
                is_required: true,
                order: 2,
              },
              {
                description: "All project dependencies are installed",
                is_required: true,
                order: 3,
              },
            ],
          },
        },
        {
          task_name: "UI Text Updates",
          test_type: "both",
          user_story:
            "As a user, I want consistent login copy and an environment-driven academic year so that the portal feels polished and accurate.",
          learning_sections: {
            create: [
              {
                title: "Overview\nConsistency in UI Copy",
                content:
                  "This section introduces the crash course for maintaining consistent UI text. It covers finding labels, understanding loading states, and keeping copy aligned across the app.",
                order: 1,
              },
              {
                title: "Button Labels and Loading States",
                content:
                  "A button often has two states: idle and loading. Both should use the same verb:\n\n// Before\n<button>Submit</button>\n<button>Submitting...</button>\n\n// After\n<button>Save</button>\n<button>Saving...</button>\n\nConsistency reduces cognitive load and makes the UI feel professional.",
                order: 2,
              },
              {
                title: "Page Descriptions and Environment Variables",
                content:
                  "Page descriptions and subtitles should use environment variables when they reference tenant-specific data. This ensures the text stays accurate when the portal is rebranded for a different institution.\n\n// Before\n<p>Sign in to access the portal</p>\n<p>Summary for 2025-2026</p>\n// After\n<p>Log in to access the portal</p>\n<p>Summary for {process.env.NEXT_PUBLIC_ACADEMIC_YEAR}</p>\n\nThis keeps the portal accurate and easy to rebrand.",
                order: 3,
              },
              {
                title: "Verifying Copy Changes",
                content:
                  "After editing, every page that might share the component should be checked. A layout change affects all pages that use it. A page-specific change only affects that route. Browser dev tools can be used to verify each route.",
                order: 4,
              },
              {
                title: "Practice Lab: Update Login Label",
                content:
                  "Practice updating login labels to maintain consistency across the academic portal.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Update function to return \"Log In\" instead of \"Sign In\".",
                  language: "typescript",
                  starter_code:
                    'export function getLoginButtonLabel() {\n  return "Sign In";\n}\n',
                  editable_regions: [
                    {
                      placeholder: "Sign In",
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "getLoginButtonLabel",
                  test_cases: [
                    {
                      input: [],
                      expected: "Log In",
                      label: "updated login label",
                    },
                  ],
                
                  hints: [
                    "Simple text replacement.",
                    "Replace \"Sign In\" with \"Log In\".",
                    "return \"___\";"
                  ],
                },
                order: 5,
              },
              {
                title: "Key Takeaway",
                content:
                  "Consistent copy is a sign of a polished product. Button labels, loading states, and headings should be aligned with the environment variables so the portal feels cohesive.",
                order: 6,
              },
            ],
          },
          hints: {
            create: [
              {
                description: "Change the login button label from 'Sign In' to 'Log In' in `src/app/login/page.tsx`",
                order: 1,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description: "Login button reads 'Log In'",
                is_required: true,
                order: 1,
              },
            ],
          },
        },
      ],
    },
  },
  {
    id: "nextjs-shadcn-ui-scenario-3-level-2",
    title: "Polishing the Academic Dashboard",
    subtitle: "Fix grade badge palette and extract a reusable StatCard",
    order: 2,
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: The dean's office reports that grade badges are visually noisy and inconsistent across pages, and that similar stat-card components are duplicated in nearly every dashboard view. Replace the default shadcn variant palette with explicit, accessible Tailwind classes per grade tier, extract the duplicated stat-card JSX into a reusable component, and consolidate the fees page filter calls into a single useMemo.",
    xp_reward: 25,
    coin_reward: 50,
    key_takeaways:
      "Mapping grade tiers (A, B, C, D/F) to explicit *-100 background and *-800 text classes guarantees accessible contrast across the dashboard. Distinct color tiers help students scan their grades at a glance without re-reading each badge.\n\nExtracting repeated stat-card JSX into a single reusable component prevents drift across multiple dashboard pages. Replacing three back-to-back `.filter()` calls with a single `useMemo` returning all derived totals avoids redundant work on every render and keeps related derived state co-located.",
    scenario_id: "nextjs-shadcn-ui-scenario-3",
    tasks: {
      create: [
        {
          task_name: "Fix Grade Badge Colors",
          test_type: "both",
          user_story:
            "As a student, I want grade badges to use distinct, accessible colors so that I can quickly identify how I'm doing in each course.",
          learning_sections: {
            create: [
              {
                title: "Overview\nAccessible Grade Badges",
                content:
                  "This section introduces the crash course for styling grade badges with accessible color palettes. It explains why contrast matters and how to map grade tiers to Tailwind classes.",
                order: 1,
              },
              {
                title: "Grade Tier Mapping",
                content:
                  "Each grade tier is mapped to a high-contrast palette:\n\n- A-tier (A, A-) -> bg-green-100 text-green-800\n- B-tier (B+, B, B-) -> bg-blue-100 text-blue-800\n- C-tier (C+, C, C-) -> bg-yellow-100 text-yellow-800\n- D/F-tier -> bg-red-100 text-red-800\n\nThese combinations pass WCAG contrast guidelines and make grades scannable.",
                order: 2,
              },
              {
                title: "Replacing Variant-Driven Styles",
                content:
                  "Instead of relying on shadcn/ui Badge variants, pass explicit className strings:\n\n// Before\n<Badge variant={getGradeVariant(grade)}>\n\n// After\n<Badge className={getGradeClass(grade)}>\n\nThis gives full control over the color and ensures consistency across themes.",
                order: 3,
              },
              {
                title: "Verifying Accessibility",
                content:
                  "Browser dev tools can be used to check contrast ratios. The *-100 / *-800 combinations typically exceed 7:1, which is AAA. Distinct colors also help students scan quickly - a green badge means 'A' at a glance.",
                order: 4,
              },
              {
                title: "Practice Lab: Grade Classifier",
                content:
                  "Practice mapping grade strings to Tailwind classes.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement getGradeClass(grade) returning Tailwind classes by tier: A→green, B→blue, C→yellow, D/F→red.\n\nExamples: getGradeClass(\"A\")→\"bg-green-100 text-green-800\", getGradeClass(\"B+\")→\"bg-blue-100 text-blue-800\".",
                  language: "javascript",
                  starter_code:
                    "export function getGradeClass(grade) {\n  // TODO\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO",
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "getGradeClass",
                  test_cases: [
                    {
                      input: ["A"],
                      expected: "bg-green-100 text-green-800",
                      label: "A grade",
                    },
                    {
                      input: ["B+"],
                      expected: "bg-blue-100 text-blue-800",
                      label: "B+ grade",
                    },
                    {
                      input: ["C-"],
                      expected: "bg-yellow-100 text-yellow-800",
                      label: "C- grade",
                    },
                    {
                      input: ["D"],
                      expected: "bg-red-100 text-red-800",
                      label: "D grade",
                    },
                  ],
                
                  hints: [
                    "Check first character of grade.",
                    "const t=grade[0]; if(t===\"A\")return\"bg-green-100 text-green-800\"; else if(t===\"B\")return\"bg-blue-100 text-blue-800\"; else if(t===\"C\")return\"bg-yellow-100 text-yellow-800\"; else return\"bg-red-100 text-red-800\";",
                    "const t=grade[___]; if(t===\"A\")return\"___\"; else if(t===\"B\")return\"___\"; else if(t===\"C\")return\"___\"; else return\"___\";"
                  ],
                },
                order: 5,
              },
              {
                title: "Key Takeaway",
                content:
                  "Grade badges are a critical UI element. Every tier should be mapped to a tested, high-contrast combination and applied via className for full control.",
                order: 6,
              },
            ],
          },
          hints: {
            create: [
              {
                description: "Update `getGradeColor` in `src/app/dashboard/grades/page.tsx` to return a `className` string per grade tier instead of a shadcn variant.",
                order: 1,
              },
              {
                description: "Map A-tier (A, A-) â†’ bg-green-100 text-green-800; B-tier (B+, B, B-) â†’ bg-blue-100 text-blue-800; C-tier (C+, C, C-) â†’ bg-yellow-100 text-yellow-800; D/F-tier â†’ bg-red-100 text-red-800.",
                order: 2,
              },
              {
                description: "Apply the className via the existing `Badge` component and verify each tier renders distinctly.",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description: "A-tier badges (A, A-) use bg-green-100 and text-green-800",
                is_required: true,
                order: 1,
              },
              {
                description: "B-tier badges (B+, B, B-) use bg-blue-100 and text-blue-800",
                is_required: true,
                order: 2,
              },
              {
                description: "C-tier badges (C+, C, C-) use bg-yellow-100 and text-yellow-800",
                is_required: true,
                order: 3,
              },
              {
                description: "D/F-tier badges use bg-red-100 and text-red-800",
                is_required: true,
                order: 4,
              },
            ],
          },
        },
        {
          task_name: "Refactor & Extract StatCard",
          test_type: "both",
          user_story:
            "As a developer, I want a single reusable StatCard component and a single useMemo for fee totals so that the codebase stays consistent and maintainable.",
          learning_sections: {
            create: [
              {
                title: "Overview\nComponent Extraction and useMemo",
                content:
                  "This section introduces the crash course for extracting duplicated stat-card JSX into a reusable component and consolidating derived state with useMemo.",
                order: 1,
              },
              {
                title: "The Duplication Problem",
                content:
                  "When the same stat-card markup appears across four pages, any style change requires editing four files. Over time, they drift apart and become inconsistent.\n\n// Page A\n<Card><CardHeader>...</CardHeader><CardContent>...</CardContent></Card>\n// Page B â€” same structure, different content\n<Card><CardHeader>...</CardHeader><CardContent>...</CardContent></Card>\n\nThese blocks should be one component.",
                order: 2,
              },
              {
                title: "Extracting a StatCard",
                content:
                  "A component that accepts title, value, subtitle, icon, and optional valueClassName can be created:\n\n// components/StatCard.tsx\nimport { LucideIcon } from 'lucide-react';\n\nexport function StatCard({ title, value, subtitle, icon: Icon, valueClassName }: { ... }) {\n  return (\n    <Card>\n      <CardHeader className=\"flex flex-row items-center justify-between\">\n        <CardTitle>{title}</CardTitle>\n        <Icon />\n      </CardHeader>\n      <CardContent>\n        <div className={valueClassName}>{value}</div>\n        <p className=\"text-xs text-muted-foreground\">{subtitle}</p>\n      </CardContent>\n    </Card>\n  );\n}\n\nThis single component replaces every inline stat card.",
                order: 3,
              },
              {
                title: "Consolidating Fee Totals with useMemo",
                content:
                  "A single useMemo can return all derived totals:\n\nconst { paid, pending, overdue, totals } = useMemo(() => {\n  const paid = tuitionFees.filter(f => f.status === 'paid');\n  const pending = tuitionFees.filter(f => f.status === 'pending');\n  const overdue = tuitionFees.filter(f => f.status === 'overdue');\n  const grand = paid.reduce((s, f) => s + f.amount, 0);\n  return { paid, pending, overdue, totals: { paid, pending, overdue, grand } };\n}, [tuitionFees]);\n\nThis reduces multiple passes through the same array to a single computation.",
                order: 4,
              },
              {
                title: "Practice Lab: Extract StatCard",
                content:
                  "Practice extracting inline JSX into a component call.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Refactor to use StatCard component instead of inline rendering.",
                  language: "tsx",
                  starter_code:
                    "import { StatCard } from '../components/StatCard';\nimport { DollarSign } from 'lucide-react';\n\nexport function renderTotalCard(value) {\n  return (\n    <div>\n      <h3>Total</h3>\n      <DollarSign />\n      <p>{value}</p>\n      <p>All fees</p>\n    </div>\n  );\n}\n",
                  editable_regions: [
                    {
                      placeholder: "return (\n    <div>\n      <h3>Total</h3>\n      <DollarSign />\n      <p>{value}</p>\n      <p>All fees</p>\n    </div>\n  );",
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "renderTotalCard",
                  test_cases: [
                    {
                      input: [1000],
                      expected: "StatCard",
                      label: "uses StatCard",
                    },
                  ],
                
                  hints: [
                    "Delegate to StatCard.",
                    "Call StatCard.",
                    "return ___;"
                  ],
                },
                order: 5,
              },
              {
                title: "Key Takeaway",
                content:
                  "Duplication is a maintenance tax. Shared markup should be extracted into components and derived state consolidated into useMemo. The codebase becomes smaller, faster, and more consistent.",
                order: 6,
              },
            ],
          },
          hints: {
            create: [
              {
                description: "Create `src/components/StatCard.tsx` accepting `title`, `value`, `subtitle`, `icon` (LucideIcon), and optional `valueClassName` props.",
                order: 1,
              },
              {
                description: "Replace the inline stat-card JSX in `src/app/dashboard/page.tsx`, `src/app/dashboard/fees/page.tsx`, `src/app/dashboard/schedule/page.tsx`, and `src/app/dashboard/standing/page.tsx` with the new component.",
                order: 2,
              },
              {
                description: "Replace the three back-to-back `tuitionFees.filter(...)` calls in `src/app/dashboard/fees/page.tsx` with a single `useMemo` returning `{ paid, pending, overdue, totals: { paid, pending, overdue, grand } }`.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description: "`src/components/StatCard.tsx` exists and is used by dashboard, fees, schedule, and standing pages",
                is_required: true,
                order: 1,
              },
              {
                description: "StatCard accepts title, value, subtitle, icon, and optional valueClassName props",
                is_required: true,
                order: 2,
              },
              {
                description: "Fees page derives all fee tallies from a single `useMemo`",
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
    id: "nextjs-shadcn-ui-scenario-3-level-3",
    title: "Empowering Students",
    subtitle: "Add grade search, semester filters, and a personal notes page",
    order: 3,
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: Students are asking for two things â€” a faster way to find an old grade, and a way to write down personal study notes per course without leaving the portal. Add real-time search with semester filter chips to the grades page, then build a notes page that reads and writes from localStorage.",
    xp_reward: 40,
    coin_reward: 100,
    key_takeaways:
      "Real-time client-side filtering (search input + semester chips) gives students an immediate, responsive way to slice their academic history without round-tripping to a server. Combining text search with discrete filters keeps both intents independent yet composable.\n\nUsing `localStorage` as a lightweight notes store demonstrates how client-only persistence can ship before a backend exists. Reading and writing JSON arrays under a stable key teaches state hydration patterns that scale up to a real API later without restructuring the UI.",
    scenario_id: "nextjs-shadcn-ui-scenario-3",
    tasks: {
      create: [
        {
          task_name: "Grade Search & Semester Filter",
          test_type: "both",
          user_story:
            "As a student, I want to search my grades by course code or name and filter by semester so that I can locate an old grade quickly.",
          learning_sections: {
            create: [
              {
                title: "Overview\nReal-Time Filtering in React",
                content:
                  "This section introduces the crash course for building real-time search and filter interfaces. It covers controlled inputs, combining multiple filter dimensions, and empty states.",
                order: 1,
              },
              {
                title: "Text Search + Filter Chips",
                content:
                  "A combined filter approach pairs a free-text search input with discrete category chips. Both filters work independently and can be combined:\n\nconst filtered = useMemo(() => {\n  return items\n    .filter(item =>\n      item.title.toLowerCase().includes(query.toLowerCase()) ||\n      item.author.toLowerCase().includes(query.toLowerCase())\n    )\n    .filter(item => categoryFilter === 'all' || item.category === categoryFilter);\n}, [items, query, categoryFilter]);\n\nUsers can search by text, filter by category, or use both at the same time.",
                order: 2,
              },
              {
                title: "Filter Chips UI",
                content:
                  "shadcn/ui Badge or Button components can be used for filter chips. The active chip should be highlighted so the user knows which filter is applied:\n\nconst chips = ['all', 'Category A', 'Category B'];\n{chips.map(chip => (\n  <button\n    key={chip}\n    className={filter === chip ? 'bg-primary' : 'bg-secondary'}\n    onClick={() => setFilter(chip)}\n  >\n    {chip}\n  </button>\n))}\n\nThis pattern is reusable for any filterable list.",
                order: 3,
              },
              {
                title: "Empty States",
                content:
                  "When combined filters yield no results, a clear message should be shown inside the list container:\n\n{filtered.length === 0 && (\n  <p>No items found</p>\n)}\n\nThis prevents the UI from looking broken and tells the user their filters are too restrictive.",
                order: 4,
              },
              {
                title: "Practice Lab: Combined Filter",
                content:
                  "Practice writing a filter that combines text search and semester.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement filterGrades(grades, query, semester) filtering by code/name text and semester. \"all\" skips semester. Case-insensitive.",
                  language: "javascript",
                  starter_code:
                    "export function filterGrades(grades, query, semester) {\n  // TODO\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO",
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "filterGrades",
                  test_cases: [
                    {
                      input: [
                        [{ courseCode: "CS101", courseName: "Intro to CS", semester: "1st Semester" }],
                        "cs",
                        "all",
                      ],
                      expected: [{ courseCode: "CS101", courseName: "Intro to CS", semester: "1st Semester" }],
                      label: "finds by code",
                    },
                    {
                      input: [
                        [{ courseCode: "CS101", courseName: "Intro to CS", semester: "1st Semester" }],
                        "",
                        "2nd Semester",
                      ],
                      expected: [],
                      label: "filters by semester",
                    },
                  ],
                
                  hints: [
                    "Chain two filters.",
                    "let r=grades; if(query) r=r.filter(g=>g.courseCode.toLowerCase().includes(query.toLowerCase())); if(semester!==\"all\") r=r.filter(g=>g.semester===semester); return r;",
                    "if (___) r = r.filter(...); if (semester !== \"___\") r = r.filter(g => g.semester === semester);"
                  ],
                },
                order: 5,
              },
              {
                title: "Key Takeaway",
                content:
                  "Real-time filtering is a combination of controlled state, useMemo, and thoughtful UI. Users should be given both text search and discrete chips, and the empty state should always be handled as a first-class UI concern.",
                order: 6,
              },
            ],
          },
          hints: {
            create: [
              {
                description: "Add a search input above the 'Course Grades' card in `src/app/dashboard/grades/page.tsx` with placeholder 'Search grades...'.",
                order: 1,
              },
              {
                description: "Filter rows in the All Semesters tab by `courseCode` OR `courseName` (both case-insensitive).",
                order: 2,
              },
              {
                description: "Add a row of filter chips (All / 1st Semester / 2nd Semester) that combines with the search.",
                order: 3,
              },
              {
                description: "Render 'No grades found' inside the table card body when no rows match.",
                order: 4,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description: "Search input filters grade rows in real-time by course code or name",
                is_required: true,
                order: 1,
              },
              {
                description: "Semester filter chips (All / 1st Semester / 2nd Semester) combine with the search input",
                is_required: true,
                order: 2,
              },
              {
                description: "'No grades found' message renders when filters yield zero results",
                is_required: true,
                order: 3,
              },
            ],
          },
        },
        {
          task_name: "Student Notes Page",
          test_type: "both",
          user_story:
            "As a student, I want to write and revisit personal study notes per course so that I can track ideas without leaving the portal.",
          learning_sections: {
            create: [
              {
                title: "Overview\nClient-Side Persistence with localStorage",
                content:
                  "This section introduces the crash course for persisting data to localStorage and reading it back on a new page. It covers hydration, JSON serialization, page creation, and sidebar navigation.",
                order: 1,
              },
              {
                title: "Writing to localStorage",
                content:
                  "When a user adds an entry, it can be pushed into an array and stored:\n\nconst entries = JSON.parse(localStorage.getItem('userEntries') || '[]');\nentries.push({\n  id: crypto.randomUUID(),\n  category,\n  content,\n  createdAt: new Date().toISOString(),\n});\nlocalStorage.setItem('userEntries', JSON.stringify(entries));\n\nThis persists the data across page reloads.",
                order: 2,
              },
              {
                title: "Reading and Hydrating",
                content:
                  "The stored array should be read and rendered on the notes page. A useEffect or an initial state function can be used to avoid hydration mismatches:\n\nconst [notes, setNotes] = useState(() => {\n  if (typeof window === 'undefined') return [];\n  return JSON.parse(localStorage.getItem('userEntries') || '[]');\n});\n\nThe typeof window check prevents server-side rendering issues.",
                order: 3,
              },
              {
                title: "Creating a New Route",
                content:
                  "A new route is added by creating a page file in the appropriate subfolder of the app directory. A nested route inherits its parent layout, so placing a notes page inside the dashboard folder gives it the same sidebar and header as other dashboard pages.\n\napp/dashboard/\n    layout.tsx      - wraps all dashboard pages\n    page.tsx        - /dashboard\n    notes/page.tsx  - /dashboard/notes\n\nThe new page should be linked from the sidebar so users can navigate to it.",
                order: 4,
              },
              {
                title: "Adding Sidebar Navigation",
                content:
                  "The sidebar in the layout file determines what navigation links are available. Adding a new entry to the links array with a label, icon, and href makes the new route discoverable:\n\n{ label: 'Notes', icon: StickyNote, href: '/dashboard/notes' }\n\nThis keeps the navigation consistent with the existing sidebar pattern.",
                order: 5,
              },
              {
                title: "Key Takeaway",
                content:
                  "localStorage is a lightweight database for the browser. It can store user-generated data before a backend exists. Data should be serialized to JSON, the empty state should always be handled, and navigation should always be provided.",
                order: 6,
              },
            ],
          },
          hints: {
            create: [
              {
                description: "Create `src/app/dashboard/notes/page.tsx` reading from `localStorage` key `studentNotes` (array of `{ id, courseCode, content, createdAt }`).",
                order: 1,
              },
              {
                description: "Display notes in a card list with course code, content, and formatted createdAt; show 'No notes yet' when empty.",
                order: 2,
              },
              {
                description: "Add a textarea + 'Add Note' button at the top that pushes a new entry with generated `id` and `createdAt = new Date().toISOString()`.",
                order: 3,
              },
              {
                description: "Add a 'Notes' link to the dashboard sidebar in `src/app/dashboard/layout.tsx` (icon: `StickyNote` from `lucide-react`, href: `/dashboard/notes`).",
                order: 4,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description: "/dashboard/notes reads notes from localStorage key `studentNotes`",
                is_required: true,
                order: 1,
              },
              {
                description: "Empty state shows 'No notes yet'",
                is_required: true,
                order: 2,
              },
              {
                description: "Submitting the new-note form persists a new entry with id and createdAt",
                is_required: true,
                order: 3,
              },
              {
                description: "Sidebar exposes a 'Notes' link to `/dashboard/notes`",
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
    id: "nextjs-shadcn-ui-scenario-3-level-4",
    title: "Hardening the Login Experience",
    subtitle: "Validate the login form and persist preferences across reload",
    order: 4,
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: QA flagged that the login screen accepts garbage input and that the sidebar collapses back to its default state every page reload, which annoys students who prefer a compact view. Add inline field validation to the login form, build a `useLocalStorage` hook, and wire it up to persist sidebar state, notes, and the last successful student ID.",
    xp_reward: 60,
    coin_reward: 150,
    key_takeaways:
      "Inline field validation with disabled submit buttons prevents bad credentials from ever reaching the auth check, which is far cheaper than handling the failure later in the flow. Per-field error messages give users immediate, actionable feedback like 'Student ID must be in format XX-XXX-XX'.\n\nA reusable `useLocalStorage` hook abstracts the hydrate-on-mount + persist-on-set pattern so the sidebar, notes page, and login form can share the same persistence logic without duplicating effects. This is the kind of small infrastructure investment that pays back immediately on the second use site.",
    scenario_id: "nextjs-shadcn-ui-scenario-3",
    tasks: {
      create: [
        {
          task_name: "Login Form Validation",
          test_type: "both",
          user_story:
            "As a user, I want the login form to reject invalid input with clear inline errors so that I know exactly what to fix before submitting.",
          learning_sections: {
            create: [
              {
                title: "Overview\nInline Validation in React Forms",
                content:
                  "This section introduces the crash course for adding inline validation to React forms. It covers regex validation, error messages, disabled submit buttons, and server error handling.",
                order: 1,
              },
              {
                title: "Regex Validation",
                content:
                  "Regex patterns are well-suited for structured input like employee IDs or order codes:\n\nconst orderCodeRegex = /^\\d{3}-[A-Z]{2}-\\d{4}$/;\nconst isValid = orderCodeRegex.test(orderCode);\n\nThis checks exactly 3 digits, a dash, 2 uppercase letters, a dash, and 4 digits. Regex provides precise validation without complex conditional logic.",
                order: 2,
              },
              {
                title: "Inline Error Messages",
                content:
                  "An error message should be shown directly under the invalid field. Validation should not wait for the user to submit — it runs on every keystroke or on blur:\n\n{errors.orderCode && (\n  <p className=\"text-red-600 text-sm\">Order code must be in format XXX-XX-XXXX</p>\n)}\n\nThis gives immediate feedback and tells the user exactly what to fix.",
                order: 3,
              },
              {
                title: "Disabling Submit",
                content:
                  "The submit button should be disabled until all fields are valid. This prevents the user from sending invalid data:\n\nconst isValid = orderCodeRegex.test(orderCode) && password.length >= 6;\n<button disabled={!isValid}>Submit</button>\n\nThis is a simple but effective guard.",
                order: 4,
              },
              {
                title: "Handling Server Errors",
                content:
                  "After client-side validation passes, the server may still reject the credentials. A clear error can be shown above the form:\n\n{serverError && (\n  <p className=\"text-red-600\">Invalid credentials</p>\n)}\n\nThis covers the case where the format is correct but the values don't match.",
                order: 5,
              },
              {
                title: "Practice Lab: Validate ID",
                content:
                  "Practice writing regex validation for a student ID.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement isValidStudentId(id) returning true for pattern XX-XXX-XX (digits only).\n\nExamples: isValidStudentId(\"12-346-78\")→true, isValidStudentId(\"123-46-78\")→false.",
                  language: "javascript",
                  starter_code:
                    "export function isValidStudentId(id) {\n  // TODO\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO",
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "isValidStudentId",
                  test_cases: [
                    {
                      input: ["12-346-78"],
                      expected: true,
                      label: "valid ID",
                    },
                    {
                      input: ["123-46-78"],
                      expected: false,
                      label: "invalid ID",
                    },
                    {
                      input: ["12-346-789"],
                      expected: false,
                      label: "too long",
                    },
                  ],
                
                  hints: [
                    "Use regex.",
                    "Think step by step about what operation transforms your input into the output you need. Break it down into smaller sub-problems and solve each one.",
                    "return /^___/.test(id);"
                    ],
                },
                order: 6,
              },
              {
                title: "Key Takeaway",
                content:
                  "Validation is a frontline defense. Inline errors, disabled buttons, and regex patterns prevent bad data from ever entering the system.",
                order: 7,
              },
            ],
          },
          hints: {
            create: [
              {
                description: "Validate `studentId` against the regex `^\\d{2}-\\d{3}-\\d{2}$` in `src/app/login/page.tsx`.",
                order: 1,
              },
              {
                description: "Validate `password` to be at least 6 characters.",
                order: 2,
              },
              {
                description: "Show an inline error message under each invalid field (e.g. 'Student ID must be in format XX-XXX-XX') and disable the Log In button until both are valid.",
                order: 3,
              },
              {
                description: "On submit, if credentials don't match the demo (`12-346-78` / `sample`), show 'Invalid student ID or password' above the form and stay on the login page.",
                order: 4,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description: "Log In button is disabled until both studentId (XX-XXX-XX) and password (>= 6 chars) are valid",
                is_required: true,
                order: 1,
              },
              {
                description: "Inline error messages appear under each failing field",
                is_required: true,
                order: 2,
              },
              {
                description: "Wrong credentials show 'Invalid student ID or password' above the form",
                is_required: true,
                order: 3,
              },
            ],
          },
        },
        {
          task_name: "localStorage Persistence",
          test_type: "both",
          user_story:
            "As a user, I want the sidebar state, my notes, and my last successful student ID to survive a page reload so that I don't have to reconfigure the portal every visit.",
          learning_sections: {
            create: [
              {
                title: "Overview\nThe useLocalStorage Hook",
                content:
                  "This section introduces the crash course for building a reusable useLocalStorage hook. It covers hydration, persistence, and sharing the hook across multiple pages.",
                order: 1,
              },
              {
                title: "The Hook Signature",
                content:
                  "A reusable hook should have a clean signature:\n\nfunction useLocalStorage<T>(key: string, initialValue: T): [T, (v: T) => void]\n\nThis mirrors useState but adds persistence. The key identifies the storage slot, and the generic T makes it type-safe.",
                order: 2,
              },
              {
                title: "Hydrate on Mount",
                content:
                  "Data should be read from localStorage when the component first mounts, not during render. This avoids hydration mismatches in SSR:\n\nconst [value, setValue] = useState<T>(initialValue);\n\nuseEffect(() => {\n  const stored = localStorage.getItem(key);\n  if (stored) setValue(JSON.parse(stored));\n}, [key]);\n\nThis ensures the server render matches the client render on first paint.",
                order: 3,
              },
              {
                title: "Persist on Change",
                content:
                  "Data should be written back to localStorage whenever the value changes:\n\nuseEffect(() => {\n  localStorage.setItem(key, JSON.stringify(value));\n}, [key, value]);\n\nThis keeps the browser storage in sync with React state.",
                order: 4,
              },
              {
                title: "Using the Hook Across Pages",
                content:
                  "Once the hook exists, it can be used across any component:\n\n// Layout\nconst [sidebarOpen, setSidebarOpen] = useLocalStorage('sidebarOpen', true);\n\n// Notes page\nconst [entries, setEntries] = useLocalStorage('userEntries', []);\n\n// Login page\nconst [lastId, setLastId] = useLocalStorage('lastUserId', '');\n\nEach page gets its own isolated key, so data doesn't collide.",
                order: 5,
              },
              {
                title: "Practice Lab: Safe Storage Reader",
                content:
                  "Practice writing a function that returns a stored value or a safe default.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement getStoredOrDefault(key, initialValue) returning initialValue.",
                  language: "javascript",
                  starter_code:
                    "export function getStoredOrDefault(key, initialValue) {\n  // TODO\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO",
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "getStoredOrDefault",
                  test_cases: [
                    {
                      input: ["myCounter", 0],
                      expected: 0,
                      label: "returns initial value",
                    },
                    {
                      input: ["myCounter", 5],
                      expected: 5,
                      label: "returns custom initial value",
                    },
                  ],
                
                  hints: [
    "Return parameter as-is.",
    "Break this into smaller steps. What is the first transformation your input needs to become the output? Apply it, then think about the next step.",
    "return ___;"
  ],
                },
                order: 6,
              },
              {
                title: "Key Takeaway",
                content:
                  "A reusable useLocalStorage hook is a small infrastructure investment with immediate payoff. Every page that needs persistence can share the same logic, and data survives reloads.",
                order: 7,
              },
            ],
          },
          hints: {
            create: [
              {
                description: "Create `src/hooks/useLocalStorage.ts` exporting `useLocalStorage<T>(key, initialValue): [T, (v: T) => void]` that hydrates on mount and persists on every set.",
                order: 1,
              },
              {
                description: "Persist the `sidebarOpen` boolean under key `sidebarOpen` in `src/app/dashboard/layout.tsx`.",
                order: 2,
              },
              {
                description: "Replace the direct `localStorage.getItem`/`setItem` calls in the notes page with `useLocalStorage('studentNotes', [])`.",
                order: 3,
              },
              {
                description: "Persist the last successfully entered `studentId` under key `lastStudentId` in `src/app/login/page.tsx` so it pre-fills on next visit.",
                order: 4,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description: "`src/hooks/useLocalStorage.ts` exists and matches the documented signature",
                is_required: true,
                order: 1,
              },
              {
                description: "Sidebar open/closed preference is persisted under `sidebarOpen` and survives reload",
                is_required: true,
                order: 2,
              },
              {
                description: "Notes page uses `useLocalStorage('studentNotes', [])` and notes survive reload",
                is_required: true,
                order: 3,
              },
              {
                description: "Last successful studentId is persisted under `lastStudentId` and pre-fills the login form on next visit",
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
    id: "nextjs-shadcn-ui-scenario-3-level-5",
    title: "The GPA Drift Crisis",
    subtitle: "Fix the cumulative GPA mismatch and ship date utilities + docs",
    order: 5,
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: Students complain that their cumulative GPA on the dashboard never matches the one on the grades page, and the academic standing page is showing a hard-coded 3.67 even after grades are updated. They also want fee due dates rendered as 'Due in 5 days' / 'Overdue by 2 days' / 'Due Today' rather than raw ISO strings. The GPA calculation must be centralized, a reusable dateUtils module built, and the README updated so the next developer can onboard quickly.",
    xp_reward: 75,
    coin_reward: 200,
    key_takeaways:
      "When the same value (cumulative GPA) is duplicated across multiple pages, each copy can drift independently and produce 'phantom' inconsistencies that look like rendering bugs but are really a single-source-of-truth problem. The fix is to compute it once in a shared utility and have every page read from that helper.\n\nCentralizing date formatting in a `dateUtils` module makes due-date behavior consistent across pages and provides a single place to handle invalid input safely. Keeping the README current with project overview, demo credentials, dev commands, and routes is what makes a codebase actually onboardable to the next developer.",
    scenario_id: "nextjs-shadcn-ui-scenario-3",
    tasks: {
      create: [
        {
          task_name: "Fix GPA + Standing Sync Bug",
          test_type: "both",
          user_story:
            "As a student, I want the cumulative GPA on the dashboard, grades page, and standing page to always match so that I can trust what the portal tells me.",
          learning_sections: {
            create: [
              {
                title: "Overview\nSingle Source of Truth",
                content:
                  "This section introduces the crash course for fixing phantom UI bugs caused by duplicated state. It explains why a single source of truth is essential and how to implement it.",
                order: 1,
              },
              {
                title: "The Duplication Problem",
                content:
                  "When the same value lives in multiple places, they can drift:\n\n// Page A\nconst value = sourceA.value;\n\n// Page B\nconst value = computeFromRaw(data);\n\n// Page C\nconst value = 3.67; // hard-coded!\n\nThese three sources can disagree. The fix is to compute the value in one place and import it everywhere.",
                order: 2,
              },
              {
                title: "Centralizing the Calculation",
                content:
                  "A pure function that computes a value from an array can be created in a shared library module:\n\nexport function computeCumulativeGPA(grades: Grade[]): number {\n  const points = { 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'F': 0.0 };\n  const totalPoints = grades.reduce((sum, g) => sum + (points[g.grade] || 0) * g.units, 0);\n  const totalUnits = grades.reduce((sum, g) => sum + g.units, 0);\n  return totalUnits > 0 ? totalPoints / totalUnits : 0;\n}\n\nThis is the single source of truth.",
                order: 3,
              },
              {
                title: "Replacing Duplicated Sources",
                content:
                  "Every inline calculation should be replaced with the shared helper:\n\n// Before\nconst gpa = currentStanding.gpa;\n\n// After\nimport { computeCumulativeGPA } from '@/lib/mockData';\nconst gpa = computeCumulativeGPA(grades);\n\nThis ensures every page that shows the value stays in sync.",
                order: 4,
              },
              {
                title: "Key Takeaway",
                content:
                  "Phantom UI bugs are usually state-sync bugs. When the same value appears in multiple places, it should be computed once and imported everywhere. Copies should never be allowed to drift.",
                order: 5,
              },
            ],
          },
          hints: {
            create: [
              {
                description: "In `src/lib/mockData.ts`, export `computeCumulativeGPA(grades: Grade[]): number` using the grade-points map (A=4.0, A-=3.7, B+=3.3, B=3.0, B-=2.7, C+=2.3, C=2.0, C-=1.7, D+=1.3, D=1.0, F=0.0) weighted by `units`.",
                order: 1,
              },
              {
                description: "In `src/app/dashboard/standing/page.tsx`, replace every hard-coded `currentStanding.gpa` (standing card, GPA stat card, GPA-status helper input) with `computeCumulativeGPA(grades)`.",
                order: 2,
              },
              {
                description: "In `src/app/dashboard/page.tsx`, replace the `currentStanding.gpa` reference in the 'Current GPA' stat with the computed cumulative GPA.",
                order: 3,
              },
              {
                description: "On the grades page, delete the inline `getAllTimeGPA` helper and read the 'Cumulative GPA' card from `computeCumulativeGPA` instead.",
                order: 4,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description: "`computeCumulativeGPA` is exported from `src/lib/mockData.ts` and weights grade points by units",
                is_required: true,
                order: 1,
              },
              {
                description: "Standing page uses computeCumulativeGPA in the standing card, GPA stat card, and GPA-status helper",
                is_required: true,
                order: 2,
              },
              {
                description: "Dashboard page 'Current GPA' stat uses computeCumulativeGPA instead of currentStanding.gpa",
                is_required: true,
                order: 3,
              },
              {
                description: "Grades page 'Cumulative GPA' card uses computeCumulativeGPA and the duplicated `getAllTimeGPA` helper is removed",
                is_required: true,
                order: 4,
              },
            ],
          },
        },
        {
          task_name: "Date Utilities & Documentation",
          test_type: "both",
          user_story:
            "As a developer, I want reusable date utilities and a current README so that future contributors can onboard quickly and fee due dates render in human-friendly form.",
          learning_sections: {
            create: [
              {
                title: "Overview\nDate Utilities and Documentation",
                content:
                  "This section introduces the crash course for building reusable date utilities and keeping documentation current. It covers due-date formatting, safe defaults, and README structure.",
                order: 1,
              },
              {
                title: "Due-Date Formatting",
                content:
                  "A helper that converts a due date to a human-friendly string makes deadlines scannable:\n\nexport function formatDueDate(dueDate: string): string {\n  const today = new Date();\n  today.setHours(0, 0, 0, 0);\n  const due = new Date(dueDate);\n  due.setHours(0, 0, 0, 0);\n  const diff = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));\n  if (diff === 0) return 'Due Today';\n  if (diff === 1) return 'Due Tomorrow';\n  if (diff > 1 && diff <= 7) return `Due in ${diff} days`;\n  if (diff < 0) return `Overdue by ${Math.abs(diff)} days`;\n  return due.toLocaleDateString();\n}\n\nThis makes due dates scannable.",
                order: 2,
              },
              {
                title: "Safe Defaults",
                content:
                  "Safe values should always be returned for invalid input:\n\nexport function formatDueDate(dueDate: string): string {\n  if (!dueDate) return '';\n  ...\n}\n\nexport function isOverdue(dueDate: string): boolean {\n  if (!dueDate) return false;\n  ...\n}\n\nexport function daysUntilDue(dueDate: string): number {\n  if (!dueDate) return 0;\n  ...\n}\n\nThis prevents crashes when the input is missing or malformed.",
                order: 3,
              },
              {
                title: "README Structure",
                content:
                  "A good README should include:\n\nâ€¢ Project overview (what it does, who it's for)\nâ€¢ Demo credentials (if any)\nâ€¢ Dev workflow (pnpm install, pnpm run dev)\nâ€¢ Route list (what pages exist)\n\nKeeping it current matters â€” outdated documentation is worse than no documentation.",
                order: 4,
              },
              {
                title: "Practice Lab: Due Date Formatter",
                content:
                  "Practice writing a due-date formatter.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement formatDueDate(dueDate): today→\"Due Today\", tomorrow→\"Due Tomorrow\", future→\"Due in N days\", past→\"Overdue by N days\".\n\nExample: dueDate 5 days ahead→\"Due in 5 days\".",
                  language: "javascript",
                  starter_code:
                    "export function formatDueDate(dueDate) {\n  // TODO\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO",
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "formatDueDate",
                  test_cases: [
                    {
                      input: [new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()],
                      expected: "Due in 5 days",
                      label: "five days ahead",
                    },
                    {
                      input: [new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()],
                      expected: "Overdue by 2 days",
                      label: "two days overdue",
                    },
                    {
                      input: [new Date().toISOString()],
                      expected: "Due Today",
                      label: "due today",
                    },
                  ],
                
                  hints: [
                    "Compute day diff with Math.ceil, return appropriate string.",
                    "const diff=Math.ceil((new Date(dueDate)-new Date())/86400000); if(diff===0)return\"Due Today\"; if(diff===1)return\"Due Tomorrow\"; if(diff>0)return`Due in ${diff} days`; return`Overdue by ${Math.abs(diff)} days`;",
                    "const diff=Math.ceil((new Date(dueDate)-new Date())/___); if(diff===___)return\"Due Today\"; if(diff===___)return\"Due Tomorrow\"; ..."
                  ],
                },
                order: 5,
              },
              {
                title: "Key Takeaway",
                content:
                  "Human-friendly date formatting makes deadlines scannable at a glance. Safe defaults prevent crashes. A current README is the fastest way to onboard the next developer.",
                order: 6,
              },
            ],
          },
          hints: {
            create: [
              {
                description: "Create `src/lib/dateUtils.ts` exporting `formatDueDate`, `isOverdue`, and `daysUntilDue`.",
                order: 1,
              },
              {
                description: "`formatDueDate` returns 'Due Today' (same calendar day), 'Due Tomorrow' (1 day ahead), 'Due in N days' (2..7 days ahead), 'Overdue by N days' (any past date), otherwise the locale date string.",
                order: 2,
              },
              {
                description: "All three functions must return safe values for invalid input ('' for the string, false for `isOverdue`, 0 for `daysUntilDue`).",
                order: 3,
              },
              {
                description: "Replace the inline `formatDate` helper in `src/app/dashboard/fees/page.tsx` with `formatDueDate`, and update README.md with project overview, demo credentials (12-346-78 / sample), dev workflow, and route list.",
                order: 4,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description: "`src/lib/dateUtils.ts` exports `formatDueDate`, `isOverdue`, `daysUntilDue` with the documented behavior",
                is_required: true,
                order: 1,
              },
              {
                description: "All three functions return safe values for invalid input",
                is_required: true,
                order: 2,
              },
              {
                description: "Fees page uses `formatDueDate` instead of the local `formatDate` helper; pending and overdue rows read 'Due in N days' / 'Overdue by N days'",
                is_required: true,
                order: 3,
              },
              {
                description: "README documents project overview, demo credentials, dev workflow, and routes (`/`, `/login`, `/dashboard`, `/dashboard/grades`, `/dashboard/schedule`, `/dashboard/fees`, `/dashboard/standing`, `/dashboard/notes`)",
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


