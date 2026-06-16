export const scenarios = [
  {
    id: "nextjs-shadcn-ui-scenario-2",
    name: "City Support Portal",
    description:
      "Build a customer support portal for City Hall using Next.js and shadcn/ui. Agents manage conversations, citizens submit complaints, and the system persists state locally.",
    difficulty: "intermediate",
  },
];

export const levels = [
  {
    id: "nextjs-shadcn-ui-scenario-2-level-1",
    title: "Onboarding the Support Portal",
    subtitle: "Configure environment and update UI text",
    order: 1,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: City Hall has onboarded a new developer (you!) and needs the customer support portal running locally with environment configuration and minor UI tweaks. Set up the Next.js development environment, configure environment variables for the support phone, email, and app name, then replace hard-coded UI text to use these variables.",
    xp_reward: 10,
    coin_reward: 20,
    key_takeaways:
      "Environment variables centralize per-environment configuration in Next.js, separating deployment-specific values from source code. Using NEXT_PUBLIC_* variables for client-visible values keeps phone numbers, emails, and app names easy to change without code edits. This pattern is essential for portable Next.js applications.\n\nReplacing hard-coded UI text with environment-driven values prepares the codebase for white-labelling and per-tenant customization. Verifying the dev server runs cleanly before any feature work establishes a reliable baseline you can return to when debugging.",
    scenario_id: "nextjs-shadcn-ui-scenario-2",
    tasks: {
      create: [
        {
          task_name: "Environment Setup",
          test_type: "client",
          user_story:
            "As a developer, I want to install dependencies and configure environment variables so that the support portal runs locally with the correct contact details.",
          learning_sections: {
            create: [
              {
                title: "Overview\nBooting a Next.js + shadcn/ui Portal",
                content:
                  "This section walks through getting a Next.js support portal running locally. The flow is the same on every Next.js project: install dependencies, configure environment variables, then start the dev server.",
                order: 1,
              },
              {
                title: "What Lives Where",
                content:
                  "A typical Next.js + shadcn/ui project is structured like:\nproject/\n    ├── src/\n    │     ├── app/ ← Next.js routes and pages\n    │     ├── components/ ← shadcn/ui components and custom ones\n    │     └── lib/ ← shared helpers\n    ├── .env.local ← local environment variables\n    └── package.json ← scripts and dependencies\n\nKnowing where the app name, phone, and email are rendered is half of being productive.",
                order: 2,
              },
              {
                title: "NEXT_PUBLIC_* Variables",
                content:
                  "Variables prefixed with NEXT_PUBLIC_ are inlined into the client bundle at build time. Anything the browser needs to see (app name, phone, email) must use this prefix.\n\nNEXT_PUBLIC_APP_NAME=\"City Support Portal\"\nNEXT_PUBLIC_SUPPORT_PHONE=\"(555) 123-4567\"\nNEXT_PUBLIC_SUPPORT_EMAIL=\"support@cityhall.gov\"\n\nThese values are available in browser code via process.env.NEXT_PUBLIC_APP_NAME.",
                order: 3,
              },
              {
                title: "Replacing Hard-Coded Values",
                content:
                  "Search the codebase for the exact strings you want to replace. Use the editor's find feature (Ctrl+Shift+F in VS Code) to search for the old phone number or email, then replace them with the environment variable.\n\n// Before\n<p>(555) 123-4567</p>\n// After\n<p>{process.env.NEXT_PUBLIC_SUPPORT_PHONE}</p>",
                order: 4,
              },
              {
                title: "Key Takeaway",
                content:
                  "Environment variables make a Next.js app portable. Replace hard-coded tenant details with NEXT_PUBLIC_* variables so the same codebase can run for different organizations without edits.",
                order: 5,
              },
            ],
          },
          hints: {
            create: [
              {
                description: "Run `npm install` at the project root and inside the `client/` folder.",
                order: 1,
              },
              {
                description: "Create `client/.env.local` with NEXT_PUBLIC_APP_NAME, NEXT_PUBLIC_SUPPORT_PHONE, and NEXT_PUBLIC_SUPPORT_EMAIL.",
                order: 2,
              },
              {
                description: "Replace hard-coded phone/email in `src/app/page.tsx` and `src/app/support/page.tsx` with the env values.",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description: "App runs without errors on `npm run dev`",
                is_required: true,
                order: 1,
              },
              {
                description: "`.env.local` defines NEXT_PUBLIC_APP_NAME, NEXT_PUBLIC_SUPPORT_PHONE, NEXT_PUBLIC_SUPPORT_EMAIL",
                is_required: true,
                order: 2,
              },
              {
                description: "Footer phone/email render from environment variables on home and support pages",
                is_required: true,
                order: 3,
              },
            ],
          },
        },
        {
          task_name: "UI Text Updates",
          test_type: "client",
          user_story:
            "As a user, I want consistent button labels and a configurable app heading so that the portal feels polished and identifiable.",
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
                  "A button often has two states: idle and loading. Both should use the same verb:\n\n// Before\n<button>Sign In</button>\n<button>Signing in...</button>\n\n// After\n<button>Login</button>\n<button>Logging in...</button>\n\nConsistency reduces cognitive load and makes the UI feel professional.",
                order: 2,
              },
              {
                title: "Page Headings and Environment Variables",
                content:
                  "The home page heading is often the first thing a user sees. Rendering it from NEXT_PUBLIC_APP_NAME keeps the brand consistent and makes white-labelling trivial.\n\n<h1>{process.env.NEXT_PUBLIC_APP_NAME}</h1>\n\nThis single line adapts to any deployment without a code change.",
                order: 3,
              },
              {
                title: "Verifying Copy Changes",
                content:
                  "After editing, check every page that might share the component. A layout change affects all pages that use it. A page-specific change only affects that route. Use the browser dev tools to verify each route.",
                order: 4,
              },
              {
                title: "Key Takeaway",
                content:
                  "Consistent copy is a sign of a polished product. Align button labels, loading states, and headings with the environment variables so the portal feels cohesive.",
                order: 5,
              },
            ],
          },
          hints: {
            create: [
              {
                description: "Change the agent login button label from 'Sign In' to 'Login' in `src/app/agent/login/page.tsx`.",
                order: 1,
              },
              {
                description: "Change the support page logout label from 'Return to menu' to 'Logout' in `src/app/support/page.tsx`.",
                order: 2,
              },
              {
                description: "Render the home page heading from `NEXT_PUBLIC_APP_NAME` in `src/app/page.tsx`.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description: "Agent login button reads 'Login'",
                is_required: true,
                order: 1,
              },
              {
                description: "Support page logout button reads 'Logout'",
                is_required: true,
                order: 2,
              },
              {
                description: "Home page heading reflects NEXT_PUBLIC_APP_NAME",
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
    id: "nextjs-shadcn-ui-scenario-2-level-2",
    title: "Polishing the Agent Dashboard",
    subtitle: "Fix badge palette and extract a reusable MessageBubble",
    order: 2,
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: Agents report that conversation status badges are visually noisy and that similar messaging components are duplicated across the citizen and agent pages. Fix the badge palette for accessibility and refactor the duplicated message JSX into a reusable component.",
    xp_reward: 25,
    coin_reward: 50,
    key_takeaways:
      "Choosing accessible badge palettes (e.g. *-100 background with *-800 text) ensures status indicators stay legible for users with low-contrast vision. Distinct colors per status help operators scan dashboards quickly without re-reading labels.\n\nExtracting duplicated JSX into a shared component (`MessageBubble`) reduces drift between two pages that should look the same. Centralizing derivations into a single `useMemo` instead of multiple `.filter()` calls avoids redundant work on every render and keeps related state co-located.",
    scenario_id: "nextjs-shadcn-ui-scenario-2",
    tasks: {
      create: [
        {
          task_name: "Fix Conversation Status Badge Colors",
          test_type: "client",
          user_story:
            "As an agent, I want status badges to use distinct, accessible colors so that I can scan the conversations list quickly.",
          learning_sections: {
            create: [
              {
                title: "Overview\nAccessible Badge Palettes",
                content:
                  "This section introduces the crash course for styling status badges with accessible color palettes. It explains why contrast matters and how to map semantic states to Tailwind classes.",
                order: 1,
              },
              {
                title: "The Contrast Problem",
                content:
                  "Default badge colors often fail accessibility standards. A bg-blue-500 text-white badge might look fine to you, but be unreadable for someone with low-contrast vision. The *-100 / *-800 pairing guarantees enough contrast:\n\n• bg-green-100 + text-green-800 → Active\n• bg-yellow-100 + text-yellow-800 → Waiting\n• bg-gray-100 + text-gray-800 → Resolved",
                order: 2,
              },
              {
                title: "Mapping Status to Color",
                content:
                  "Create a helper that maps each status to its palette. Don't inline the classes in every render — centralize them:\n\nconst statusPalette = {\n  active: 'bg-green-100 text-green-800',\n  waiting: 'bg-yellow-100 text-yellow-800',\n  resolved: 'bg-gray-100 text-gray-800',\n};\n\nfunction getStatusBadge(status: string) {\n  return statusPalette[status] || 'bg-gray-100 text-gray-800';\n}",
                order: 3,
              },
              {
                title: "Verifying Accessibility",
                content:
                  "Use browser dev tools to check contrast ratios. The goal is WCAG AA (4.5:1 for normal text). The *-100 / *-800 combinations typically exceed 7:1, which is AAA. Distinct colors also help users scan quickly — a green badge means 'active' at a glance.",
                order: 4,
              },
              {
                title: "Practice Lab: Badge Palette",
                content:
                  "Practice mapping status strings to accessible Tailwind classes.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement getStatusPalette(status) that returns the correct Tailwind classes for 'active', 'waiting', and 'resolved'.",
                  language: "javascript",
                  starter_code:
                    "export function getStatusPalette(status) {\n  // TODO\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO",
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "getStatusPalette",
                  test_cases: [
                    {
                      input: ["active"],
                      expected: "bg-green-100 text-green-800",
                      label: "active badge",
                    },
                    {
                      input: ["waiting"],
                      expected: "bg-yellow-100 text-yellow-800",
                      label: "waiting badge",
                    },
                    {
                      input: ["resolved"],
                      expected: "bg-gray-100 text-gray-800",
                      label: "resolved badge",
                    },
                  ],
                },
                order: 5,
              },
              {
                title: "Key Takeaway",
                content:
                  "Accessible palettes are not just nice-to-have — they are required for usability. Map every status to a tested, high-contrast combination and reuse it across the app.",
                order: 6,
              },
            ],
          },
          hints: {
            create: [
              {
                description: "Update `getStatusBadge` in `src/app/agent/page.tsx` to map each status to a *-100 background and *-800 text.",
                order: 1,
              },
              {
                description: "Map: active → green-100/green-800, waiting → yellow-100/yellow-800, resolved → gray-100/gray-800.",
                order: 2,
              },
              {
                description: "Verify each status renders distinctly on the agent dashboard.",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description: "`active` badge uses bg-green-100 and text-green-800",
                is_required: true,
                order: 1,
              },
              {
                description: "`waiting` badge uses bg-yellow-100 and text-yellow-800",
                is_required: true,
                order: 2,
              },
              {
                description: "`resolved` badge uses bg-gray-100 and text-gray-800",
                is_required: true,
                order: 3,
              },
            ],
          },
        },
        {
          task_name: "Refactor & Extract MessageBubble",
          test_type: "client",
          user_story:
            "As a developer, I want a single reusable MessageBubble component and a single useMemo for conversation counts so that the codebase is consistent and maintainable.",
          learning_sections: {
            create: [
              {
                title: "Overview\nComponent Extraction and useMemo",
                content:
                  "This section introduces the crash course for extracting duplicated JSX into reusable components and consolidating derived state with useMemo.",
                order: 1,
              },
              {
                title: "The Duplication Problem",
                content:
                  "When the same message markup appears in two pages, any style change requires editing both files. Over time, they drift apart and become inconsistent.\n\n// In support page\n<div className=\"flex ...\">...citizen message...</div>\n\n// In agent page\n<div className=\"flex ...\">...agent message...</div>\n\nThese two blocks should be one component.",
                order: 2,
              },
              {
                title: "Extracting a MessageBubble",
                content:
                  "Create a component that accepts a message and a viewer prop to control alignment:\n\n// components/MessageBubble.tsx\nexport function MessageBubble({ message, viewer }: { message: string; viewer: 'customer' | 'agent' }) {\n  const align = viewer === 'customer' ? 'justify-start' : 'justify-end';\n  return (\n    <div className={`flex ${align}`}>\n      <div className=\"rounded p-2\">{message}</div>\n    </div>\n  );\n}\n\nThis single component replaces both inline versions.",
                order: 3,
              },
              {
                title: "Consolidating Filters with useMemo",
                content:
                  "Instead of three separate .filter() calls on every render, use one useMemo that returns all counts:\n\nconst counts = useMemo(() => {\n  return {\n    active: conversations.filter(c => c.status === 'active').length,\n    waiting: conversations.filter(c => c.status === 'waiting').length,\n    resolved: conversations.filter(c => c.status === 'resolved').length,\n  };\n}, [conversations]);\n\nThis is cleaner, faster, and easier to debug.",
                order: 4,
              },
              {
                title: "Practice Lab: Extract Component",
                content:
                  "Practice extracting inline JSX into a component call.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Refactor the inline JSX to use the MessageBubble component.",
                  language: "tsx",
                  starter_code:
                    "import { MessageBubble } from '../components/MessageBubble';\n\nexport function renderMessage(text, viewer) {\n  return (\n    <div className={`flex ${viewer === 'customer' ? 'justify-start' : 'justify-end'}`}>\n      <div className='rounded p-2'>{text}</div>\n    </div>\n  );\n}\n",
                  editable_regions: [
                    {
                      placeholder: "return (\n    <div className={`flex ${viewer === 'customer' ? 'justify-start' : 'justify-end'}`}>\n      <div className='rounded p-2'>{text}</div>\n    </div>\n  );",
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "renderMessage",
                  test_cases: [
                    {
                      input: ["hello", "customer"],
                      expected: "customer:hello",
                      label: "renders customer message",
                    },
                  ],
                },
                order: 5,
              },
              {
                title: "Key Takeaway",
                content:
                  "Duplication is a maintenance tax. Extract shared markup into components and consolidate derived state into useMemo. The codebase becomes smaller, faster, and more consistent.",
                order: 6,
              },
            ],
          },
          hints: {
            create: [
              {
                description: "Create `src/components/MessageBubble.tsx` accepting a `message` prop and a `viewer` prop ('customer' | 'agent').",
                order: 1,
              },
              {
                description: "Replace the inline message JSX in `src/app/support/page.tsx` and `src/app/agent/page.tsx` with the new component.",
                order: 2,
              },
              {
                description: "Replace the three inline `.filter()` count derivations on the agent page with a single `useMemo` returning `{ active, waiting, resolved }`.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description: "`src/components/MessageBubble.tsx` exists and is used by both support and agent pages",
                is_required: true,
                order: 1,
              },
              {
                description: "`MessageBubble` aligns correctly based on the `viewer` prop",
                is_required: true,
                order: 2,
              },
              {
                description: "Agent page derives active/waiting/resolved counts via a single `useMemo`",
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
    id: "nextjs-shadcn-ui-scenario-2-level-3",
    title: "Empowering Agents and Citizens",
    subtitle: "Add conversation search and a citizen complaint history page",
    order: 3,
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: Volume is up — agents need to find conversations quickly, and citizens want to revisit complaints they previously filed. Add real-time search with status filters to the agent dashboard, and build a /support/history page that reads complaints back from localStorage.",
    xp_reward: 40,
    coin_reward: 100,
    key_takeaways:
      "Real-time client-side filtering (search input + status chips) gives operators an immediate, responsive way to slice large lists without round-tripping to a server. Combining text search with discrete filters keeps both intents independent yet composable.\n\nUsing `localStorage` as a lightweight complaint store demonstrates how client-only persistence can ship before a backend exists. Reading and writing JSON arrays under a stable key teaches state hydration patterns that scale up to a real API later without restructuring the UI.",
    scenario_id: "nextjs-shadcn-ui-scenario-2",
    tasks: {
      create: [
        {
          task_name: "Conversation Search & Status Filter",
          test_type: "client",
          user_story:
            "As an agent, I want to search conversations by name or complaint and filter by status so that I can locate the right thread quickly.",
          learning_sections: {
            create: [
              {
                title: "Overview\nReal-Time Filtering in React",
                content:
                  "This section introduces the crash course for building real-time search and filter interfaces. It covers controlled inputs, combining multiple filter dimensions, and empty states.",
                order: 1,
              },
              {
                title: "Text Search + Status Chips",
                content:
                  "A good filter UI combines a free-text search with discrete status chips. Both filters work independently but can be combined:\n\nconst filtered = useMemo(() => {\n  return conversations\n    .filter(c =>\n      c.customer.fullName.toLowerCase().includes(query.toLowerCase()) ||\n      c.customer.complaint.toLowerCase().includes(query.toLowerCase())\n    )\n    .filter(c => statusFilter === 'all' || c.status === statusFilter);\n}, [conversations, query, statusFilter]);\n\nThis gives users two ways to slice the list.",
                order: 2,
              },
              {
                title: "Filter Chips UI",
                content:
                  "Use shadcn/ui Badge or Button components for filter chips. Highlight the active chip so the user knows which filter is applied:\n\nconst chips = ['all', 'active', 'waiting', 'resolved'];\n{chips.map(chip => (\n  <button\n    key={chip}\n    className={statusFilter === chip ? 'bg-primary' : 'bg-secondary'}\n    onClick={() => setStatusFilter(chip)}\n  >\n    {chip}\n  </button>\n))}\n\nThis pattern is reusable for any filterable list.",
                order: 3,
              },
              {
                title: "Empty States",
                content:
                  "When combined filters yield no results, show a clear message inside the list container:\n\n{filtered.length === 0 && (\n  <p>No conversations found</p>\n)}\n\nThis prevents the UI from looking broken and tells the user their filters are too restrictive.",
                order: 4,
              },
              {
                title: "Practice Lab: Combined Filter",
                content:
                  "Practice writing a filter that combines text search and status.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement filterConversations(conversations, query, status) that filters by name/complaint text and status.",
                  language: "javascript",
                  starter_code:
                    "export function filterConversations(conversations, query, status) {\n  // TODO\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO",
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "filterConversations",
                  test_cases: [
                    {
                      input: [
                        [{ customer: { fullName: "Alice", complaint: "Noise" }, status: "active" }],
                        "alice",
                        "all",
                      ],
                      expected: [{ customer: { fullName: "Alice", complaint: "Noise" }, status: "active" }],
                      label: "finds by name",
                    },
                    {
                      input: [
                        [{ customer: { fullName: "Alice", complaint: "Noise" }, status: "active" }],
                        "",
                        "resolved",
                      ],
                      expected: [],
                      label: "filters by status",
                    },
                  ],
                },
                order: 5,
              },
              {
                title: "Key Takeaway",
                content:
                  "Real-time filtering is a combination of controlled state, useMemo, and thoughtful UI. Give users both text search and discrete chips, and always handle the empty state.",
                order: 6,
              },
            ],
          },
          hints: {
            create: [
              {
                description: "Add a search input above the conversation list in `src/app/agent/page.tsx` with placeholder 'Search conversations...'.",
                order: 1,
              },
              {
                description: "Filter by `customer.fullName` OR `customer.complaint` (both case-insensitive).",
                order: 2,
              },
              {
                description: "Add a status filter row (All / Active / Waiting / Resolved) that combines with the search.",
                order: 3,
              },
              {
                description: "Render 'No conversations found' inside the conversations card when no rows match.",
                order: 4,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description: "Search input filters conversations in real-time by name or complaint text",
                is_required: true,
                order: 1,
              },
              {
                description: "Status filter chips (All / Active / Waiting / Resolved) combine with the search",
                is_required: true,
                order: 2,
              },
              {
                description: "'No conversations found' renders when filters yield zero results",
                is_required: true,
                order: 3,
              },
            ],
          },
        },
        {
          task_name: "Citizen Complaint History Page",
          test_type: "client",
          user_story:
            "As a citizen, I want to see complaints I previously submitted so that I can track their status.",
          learning_sections: {
            create: [
              {
                title: "Overview\nClient-Side Persistence with localStorage",
                content:
                  "This section introduces the crash course for persisting data to localStorage and reading it back on a new page. It covers hydration, JSON serialization, and page creation.",
                order: 1,
              },
              {
                title: "Writing to localStorage",
                content:
                  "When a citizen submits a complaint, push the new entry into an array and store it:\n\nconst complaints = JSON.parse(localStorage.getItem('customerComplaints') || '[]');\ncomplaints.push({\n  id: crypto.randomUUID(),\n  name,\n  cityZip,\n  complaint,\n  submittedAt: new Date().toISOString(),\n});\nlocalStorage.setItem('customerComplaints', JSON.stringify(complaints));\n\nThis persists the data across page reloads.",
                order: 2,
              },
              {
                title: "Reading and Hydrating",
                content:
                  "On the history page, read the stored array and render it. Use a useEffect or an initial state function to avoid hydration mismatches:\n\nconst [complaints, setComplaints] = useState(() => {\n  if (typeof window === 'undefined') return [];\n  return JSON.parse(localStorage.getItem('customerComplaints') || '[]');\n});\n\nThe typeof window check prevents server-side rendering issues.",
                order: 3,
              },
              {
                title: "Creating a New Route",
                content:
                  "Create app/support/history/page.tsx to add the /support/history route. Use the same layout as the support page by placing it inside the support folder.\n\napp/support/\n    ├── page.tsx ← /support\n    └── history/page.tsx ← /support/history\n\nAdd a link from the support page to the history page so users can navigate.",
                order: 4,
              },
              {
                title: "Key Takeaway",
                content:
                  "localStorage is a lightweight database for the browser. Use it to store user-generated data before a backend exists. Always serialize to JSON, always handle the empty state, and always provide navigation.",
                order: 5,
              },
            ],
          },
          hints: {
            create: [
              {
                description: "Create `src/app/support/history/page.tsx` reading from `localStorage` key `customerComplaints`.",
                order: 1,
              },
              {
                description: "Display Submitted / Name / City + ZIP / Complaint columns; show 'No complaints submitted yet' when empty.",
                order: 2,
              },
              {
                description: "On submitting the support form, push a new entry to `customerComplaints` with `submittedAt = new Date().toISOString()`.",
                order: 3,
              },
              {
                description: "Add a 'View History' link on `src/app/support/page.tsx` pointing to `/support/history`.",
                order: 4,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description: "/support/history reads complaints from localStorage key `customerComplaints`",
                is_required: true,
                order: 1,
              },
              {
                description: "Empty state shows 'No complaints submitted yet'",
                is_required: true,
                order: 2,
              },
              {
                description: "Submitting the support form persists a new complaint entry with `submittedAt`",
                is_required: true,
                order: 3,
              },
              {
                description: "Support page exposes a 'View History' link to `/support/history`",
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
    id: "nextjs-shadcn-ui-scenario-2-level-4",
    title: "Hardening the Citizen Experience",
    subtitle: "Validate the citizen form and persist state across reload",
    order: 4,
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: QA flagged that the citizen form accepts garbage input and that messages and conversations vanish on page reload. Add inline field validation, prevent whitespace-only chat sends, and build a `useLocalStorage` hook that persists conversations, agent status, and chat messages across reloads.",
    xp_reward: 60,
    coin_reward: 150,
    key_takeaways:
      "Inline field validation with disabled submit buttons prevents bad data from reaching the system in the first place, which is far cheaper than catching it later in the pipeline. Per-field error messages give users immediate, actionable feedback.\n\nA reusable `useLocalStorage` hook abstracts the hydrate-on-mount + persist-on-set pattern so multiple pages can share the same persistence logic without duplicating effects. This is the kind of small infrastructure investment that pays back immediately on the second use site.",
    scenario_id: "nextjs-shadcn-ui-scenario-2",
    tasks: {
      create: [
        {
          task_name: "Form & Message Validation",
          test_type: "client",
          user_story:
            "As a user, I want the support form to reject invalid input with clear inline errors so that I know exactly what to fix.",
          learning_sections: {
            create: [
              {
                title: "Overview\nInline Validation in React Forms",
                content:
                  "This section introduces the crash course for adding inline validation to React forms. It covers validation rules, error messages, and disabled submit buttons.",
                order: 1,
              },
              {
                title: "Validation Rules",
                content:
                  "Define clear rules for each field before writing code:\n\n• fullName: at least 2 characters\n• zipCode: exactly 5 digits (/^\\d{5}$/)\n• complaint: at least 10 characters\n\nThese rules are simple to test and easy to explain to users.",
                order: 2,
              },
              {
                title: "Inline Error Messages",
                content:
                  "Show an error message directly under the invalid field. Don't wait for the user to submit — validate on every keystroke or on blur:\n\n{errors.fullName && (\n  <p className=\"text-red-600 text-sm\">{errors.fullName}</p>\n)}\n\nThis gives immediate feedback and tells the user exactly what to fix.",
                order: 3,
              },
              {
                title: "Disabling Submit",
                content:
                  "Disable the submit button until all fields are valid. This prevents the user from sending garbage data:\n\nconst isValid = fullName.length >= 2 && /^\\d{5}$/.test(zipCode) && complaint.length >= 10;\n<button disabled={!isValid}>Submit</button>\n\nThis is a simple but effective guard.",
                order: 4,
              },
              {
                title: "Chat Input Validation",
                content:
                  "Chat inputs need validation too. Prevent whitespace-only messages from being sent:\n\nconst canSend = message.trim().length > 0;\n<button disabled={!canSend}>Send</button>\n\nThis stops accidental empty sends and keeps the chat clean.",
                order: 5,
              },
              {
                title: "Practice Lab: Validate Form",
                content:
                  "Practice writing validation logic for a simple form.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement validateForm({ fullName, zipCode, complaint }) that returns an object with error messages for invalid fields.",
                  language: "javascript",
                  starter_code:
                    "export function validateForm({ fullName, zipCode, complaint }) {\n  // TODO\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO",
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "validateForm",
                  test_cases: [
                    {
                      input: [{ fullName: "A", zipCode: "1234", complaint: "short" }],
                      expected: {
                        fullName: "Name must be at least 2 characters",
                        zipCode: "ZIP code must be 5 digits",
                        complaint: "Complaint must be at least 10 characters",
                      },
                      label: "returns all errors",
                    },
                    {
                      input: [{ fullName: "Alice", zipCode: "12345", complaint: "This is a long complaint" }],
                      expected: {},
                      label: "returns empty when valid",
                    },
                  ],
                },
                order: 6,
              },
              {
                title: "Key Takeaway",
                content:
                  "Validation is a frontline defense. Inline errors, disabled buttons, and trimmed inputs prevent bad data from ever entering the system.",
                order: 7,
              },
            ],
          },
          hints: {
            create: [
              {
                description: "Validate `fullName` (>= 2 chars), `zipCode` (/^\\d{5}$/), and `complaint` (>= 10 chars) in `src/app/support/page.tsx`.",
                order: 1,
              },
              {
                description: "Show an inline error under each invalid field (e.g. 'ZIP code must be 5 digits').",
                order: 2,
              },
              {
                description: "Disable the Submit Request button while any field is invalid.",
                order: 3,
              },
              {
                description: "Verify the chat input on /support and /agent cannot send whitespace-only messages.",
                order: 4,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description: "Submit Request is disabled until fullName (>= 2), zipCode (5 digits), and complaint (>= 10) are all valid",
                is_required: true,
                order: 1,
              },
              {
                description: "Inline error messages appear under each failing field",
                is_required: true,
                order: 2,
              },
              {
                description: "Whitespace-only chat messages cannot be sent on either page",
                is_required: true,
                order: 3,
              },
            ],
          },
        },
        {
          task_name: "localStorage Persistence",
          test_type: "client",
          user_story:
            "As a user, I want conversations, agent status, and chat messages to survive a page reload so that I don't lose context.",
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
                  "Read from localStorage when the component first mounts, not during render. This avoids hydration mismatches in SSR:\n\nconst [value, setValue] = useState<T>(initialValue);\n\nuseEffect(() => {\n  const stored = localStorage.getItem(key);\n  if (stored) setValue(JSON.parse(stored));\n}, [key]);\n\nThis ensures the server render matches the client render on first paint.",
                order: 3,
              },
              {
                title: "Persist on Change",
                content:
                  "Write back to localStorage whenever the value changes:\n\nuseEffect(() => {\n  localStorage.setItem(key, JSON.stringify(value));\n}, [key, value]);\n\nThis keeps the browser storage in sync with React state.",
                order: 4,
              },
              {
                title: "Using the Hook Across Pages",
                content:
                  "Once the hook exists, use it everywhere:\n\n// Agent page\nconst [conversations, setConversations] = useLocalStorage('agentConversations', []);\nconst [status, setStatus] = useLocalStorage('agentStatus', 'active');\n\n// Support page\nconst [messages, setMessages] = useLocalStorage('supportMessages', []);\n\nEach page gets its own isolated key, so data doesn't collide.",
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
                    "Implement getStoredOrDefault(key, initialValue) that returns initialValue when no value is stored.",
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
                description: "Create `src/hooks/useLocalStorage.ts` exporting `useLocalStorage<T>(key, initialValue): [T, (v: T) => void]` that hydrates on mount and persists on set.",
                order: 1,
              },
              {
                description: "Persist `agentConversations` and `agentStatus` in `src/app/agent/page.tsx`.",
                order: 2,
              },
              {
                description: "Persist `supportMessages` in `src/app/support/page.tsx`.",
                order: 3,
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
                description: "Agent conversations and agent status are persisted under `agentConversations` / `agentStatus`",
                is_required: true,
                order: 2,
              },
              {
                description: "Support chat messages are persisted under `supportMessages`",
                is_required: true,
                order: 3,
              },
              {
                description: "All three values survive a page reload",
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
    id: "nextjs-shadcn-ui-scenario-2-level-5",
    title: "The Unread Badge Crisis",
    subtitle: "Fix the unread badge bug and ship date utilities + docs",
    order: 5,
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: Agents report the unread badge stays red after they click into a conversation, and that the count doesn't match the underlying messages. They also want timestamps shown as 'Just now' / '5m ago' instead of raw times. Fix the unread state drift, build a reusable `dateUtils` module, and update the README so the next developer can onboard quickly.",
    xp_reward: 75,
    coin_reward: 200,
    key_takeaways:
      "When the same value is mirrored across two pieces of state (`conversations[i].unreadCount` and `selectedConversation.unreadCount`), forgetting to update both causes 'phantom' UI bugs that look like rendering issues but are really state-sync issues. The fix is to update every copy together — or, better, derive one from the other.\n\nCentralizing date formatting in a `dateUtils` module makes timestamp behavior consistent across pages and gives you a single place to handle invalid input safely. Keeping the README current with project overview, credentials, dev commands, and routes is what makes a codebase actually onboardable.",
    scenario_id: "nextjs-shadcn-ui-scenario-2",
    tasks: {
      create: [
        {
          task_name: "Fix Unread Count Bug",
          test_type: "client",
          user_story:
            "As an agent, I want the unread badge to clear when I click a conversation and the header counts to stay accurate so that the dashboard reflects reality.",
          learning_sections: {
            create: [
              {
                title: "Overview\nState Synchronization Bugs",
                content:
                  "This section introduces the crash course for debugging state synchronization bugs. It explains why mirrored state causes phantom UI issues and how to fix them.",
                order: 1,
              },
              {
                title: "The Mirrored State Problem",
                content:
                  "When the same value lives in two places, they can drift:\n\nconst [conversations, setConversations] = useState([...]);\nconst [selected, setSelected] = useState(null);\n\n// Clicking a conversation should clear its unread count\n// You must update BOTH arrays, or the list badge stays red\n\nThe fix is to update every copy of the value in the same event handler, or derive one from the other.",
                order: 2,
              },
              {
                title: "Updating Both Copies",
                content:
                  "When the agent clicks a conversation, clear unreadCount in both the list and the selected item:\n\nconst handleClick = (conversation) => {\n  const cleared = { ...conversation, unreadCount: 0 };\n  setSelected(cleared);\n  setConversations(prev =>\n    prev.map(c => c.id === conversation.id ? cleared : c)\n  );\n};\n\nThis guarantees both UI regions reflect the same truth.",
                order: 3,
              },
              {
                title: "Keeping Derived Counts Accurate",
                content:
                  "The header counts (active, waiting, resolved) should be derived from the same source of truth. If they are computed from a separate state slice, they can drift too. Use useMemo on the conversations array so the counts always reflect the latest state.",
                order: 4,
              },
              {
                title: "Key Takeaway",
                content:
                  "Phantom UI bugs are usually state-sync bugs. When the same value appears in two places, update both in the same handler, or derive one from the other. Never let them drift.",
                order: 5,
              },
            ],
          },
          hints: {
            create: [
              {
                description: "When the agent clicks a conversation in `src/app/agent/page.tsx`, set its `unreadCount` to 0 immediately.",
                order: 1,
              },
              {
                description: "Update both `conversations` state and `selectedConversation` state so they stay in sync.",
                order: 2,
              },
              {
                description: "Verify the header active/waiting/resolved counts (from Level 2's useMemo) still update correctly when a conversation is resolved.",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description: "Clicking a conversation clears its unread count to 0",
                is_required: true,
                order: 1,
              },
              {
                description: "Conversation list and selectedConversation stay in sync after click and after status change",
                is_required: true,
                order: 2,
              },
              {
                description: "Header active/waiting/resolved counts update correctly when a conversation is resolved",
                is_required: true,
                order: 3,
              },
            ],
          },
        },
        {
          task_name: "Date Utilities & Documentation",
          test_type: "client",
          user_story:
            "As a developer, I want reusable date utilities and a current README so that future contributors can onboard quickly.",
          learning_sections: {
            create: [
              {
                title: "Overview\nDate Utilities and Documentation",
                content:
                  "This section introduces the crash course for building reusable date utilities and keeping documentation current. It covers relative time formatting, safe defaults, and README structure.",
                order: 1,
              },
              {
                title: "Relative Time Formatting",
                content:
                  "Users prefer '5m ago' over '2026-06-10T14:30:00Z'. Implement a helper that converts a timestamp to a human-friendly string:\n\nexport function formatRelativeTime(date: string): string {\n  const diff = Date.now() - new Date(date).getTime();\n  const minutes = Math.floor(diff / 60000);\n  if (minutes < 1) return 'Just now';\n  if (minutes < 60) return `${minutes}m ago`;\n  const hours = Math.floor(minutes / 60);\n  if (hours < 24) return `${hours}h ago`;\n  return new Date(date).toLocaleDateString();\n}\n\nThis makes timestamps scannable.",
                order: 2,
              },
              {
                title: "Safe Defaults",
                content:
                  "Always return safe values for invalid input:\n\nexport function formatRelativeTime(date: string): string {\n  if (!date) return '';\n  ...\n}\n\nThis prevents crashes when the input is missing or malformed.",
                order: 3,
              },
              {
                title: "README Structure",
                content:
                  "A good README should include:\n\n• Project overview (what it does, who it's for)\n• Demo credentials (if any)\n• Dev workflow (npm install, npm run dev)\n• Route list (what pages exist)\n• Key utilities and how to use them\n\nKeep it current — outdated documentation is worse than no documentation.",
                order: 4,
              },
              {
                title: "Practice Lab: Relative Time",
                content:
                  "Practice writing a relative time formatter.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement formatRelativeTime(date) that returns 'Just now', '5m ago', or '2h ago' based on the input.",
                  language: "javascript",
                  starter_code:
                    "export function formatRelativeTime(date) {\n  // TODO\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO",
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "formatRelativeTime",
                  test_cases: [
                    {
                      input: [new Date(Date.now() - 30 * 1000).toISOString()],
                      expected: "Just now",
                      label: "just now",
                    },
                    {
                      input: [new Date(Date.now() - 5 * 60 * 1000).toISOString()],
                      expected: "5m ago",
                      label: "five minutes ago",
                    },
                  ],
                },
                order: 5,
              },
              {
                title: "Key Takeaway",
                content:
                  "Relative time formatting makes UIs feel alive. Safe defaults prevent crashes. A current README is the fastest way to onboard the next developer.",
                order: 6,
              },
            ],
          },
          hints: {
            create: [
              {
                description: "Create `src/lib/dateUtils.ts` with `formatRelativeTime`, `isStale`, and `formatTimestamp`.",
                order: 1,
              },
              {
                description: "All three functions must return safe values for invalid input ('' for strings, false for `isStale`).",
                order: 2,
              },
              {
                description: "Replace the inline `formatTime` in `src/app/agent/page.tsx` with `formatRelativeTime` from the new module.",
                order: 3,
              },
              {
                description: "Update README.md with project overview, demo credentials, dev workflow, and route list.",
                order: 4,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description: "`src/lib/dateUtils.ts` exports `formatRelativeTime`, `isStale`, `formatTimestamp` with the documented behavior",
                is_required: true,
                order: 1,
              },
              {
                description: "All three functions return safe values for invalid input",
                is_required: true,
                order: 2,
              },
              {
                description: "Agent page uses `formatRelativeTime` instead of the local `formatTime` helper",
                is_required: true,
                order: 3,
              },
              {
                description: "README documents project overview, demo credentials, dev workflow, and routes (`/`, `/support`, `/support/history`, `/agent/login`, `/agent`)",
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
