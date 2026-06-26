export const scenarios = [
  {
    id: "nextjs-shadcn-ui-scenario-1",
    name: "BookStop Library Management System",
    description:
      "Build a library management system using Next.js and shadcn/ui to manage books, borrowing, and returns with client-side persistence.",
    difficulty: "intermediate",
  },
];

export const levels = [
  {
    id: "nextjs-shadcn-ui-level-1",
    title: "Setup & Simple UI Fixes",
    subtitle: "Configure environment and make minor UI updates",
    order: 1,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: The library has onboarded a new developer and needs the system running locally with minor UI tweaks. Set up the Next.js development environment, install dependencies, add the required shadcn/ui components, and verify the dev server starts cleanly.",
    xp_reward: 10,
    coin_reward: 20,
    key_takeaways:
      "Installing project dependencies with pnpm install ensures all required libraries (React, Next.js, shadcn/ui, Tailwind CSS) are available. Running the dev server verifies the project boots without errors before any feature work begins. Adding shadcn/ui components via the CLI copies them into the project source, giving full ownership and easy customization.",
    scenario_id: "nextjs-shadcn-ui-scenario-1",
    tasks: {
      create: [
        {
          task_name: "Environment Setup",
          test_type: "both",
          user_story:
            "As a developer, I want to set up the development environment so that I can start working on the project.",
          learning_sections: {
            create: [
              {
                title: "Overview\nSetting Up a Next.js + shadcn/ui Project",
                content:
                  "This section introduces the crash course for setting up a Next.js + shadcn/ui project locally. It covers the key tools, dependency installation, and verifying the dev server runs cleanly before writing any feature code.",
                order: 1,
              },
              {
                title: "What is Next.js?",
                content:
                  "Next.js is a React framework that adds server-side rendering, static site generation, and a file-based routing system on top of React. It handles bundling, dev server, and production optimizations so developers can focus on building features.",
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
                  "Practice adding a shadcn/ui component using the CLI. Running the command below downloads the component source into the project's components/ui folder, where it can be customized.\n\npnpm dlx shadcn@latest add select",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "TERMINAL_CMD" as const,
                interactive_config: {
                  instructions:
                    "Run the shadcn/ui CLI command to add the Select component. Type the exact command and click Check to verify.",
                  expected_commands: [
                    "pnpm dlx shadcn@latest add select",
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
                description: "Install dependencies using pnpm install",
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
          task_name: "Update UI Text",
          test_type: "both",
          user_story:
            "As a user, I want to see the correct library name and page titles so that I know which system I'm using.",
          learning_sections: {
            create: [
              {
                title: "Overview\nReact Components and the UI Layer",
                content:
                  "This section introduces the crash course for understanding React components and the UI layer in a Next.js app. It gives a broad view of how interface elements are structured and where to make safe, task-focused UI updates.",
                order: 1,
              },
              {
                title: "What is a React Component?",
                content:
                  "A React component is a reusable piece of UI — like a header, a button, or a card. Components are just JavaScript functions that return HTML-like syntax called JSX.",
                order: 2,
              },
              {
                title: "Layout Components in Next.js",
                content:
                  "In Next.js, layout components wrap pages. The root layout (layout.tsx) is shared across every route and is the first place to look for global elements like page titles and headers.\n\nA typical layout structure:\napp/\n    ├── layout.tsx ← root layout (title, meta, global nav)\n    └── page.tsx ← home page",
                order: 3,
              },
              {
                title: "How to Find What to Change",
                content:
                  "To locate the source of a UI element visible in the browser, the following questions help:\nWhat element is it? (header, footer, page title?)\nWhich component renders it? (trace it to a file)\nIs the text hardcoded or coming from props/state?\nFor a page title, layout.tsx is where to look for a hardcoded string or a metadata export.",
                order: 4,
              },
              {
                title: "JSX Text Content",
                content:
                  "Changing text in JSX is straightforward — it's just like editing HTML:\n// Before\n<h1>Old Library</h1>\n// After\n<h1>BookStop Public Library</h1>",
                order: 5,
              },
              {
                title: "Verifying the Change",
                content:
                  "After editing a component file, saving triggers the dev server to update the browser. Next.js's dev server supports Fast Refresh — the page updates instantly without a full refresh when a file is saved.",
                order: 6,
              },
              {
                title: "Practice Lab: Update Heading Text",
                content:
                  "Practice a simple UI change by editing the text inside a heading element.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    'Update the function output from "Hello World" to "Welcome Back".',
                  language: "tsx",
                  starter_code:
                    'export function getUpdatedHeadingText() {\n  return "Hello World";\n}\n',
                  editable_regions: [
                    {
                      placeholder: "Hello World",
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "getUpdatedHeadingText",
                  test_cases: [
                    {
                      input: [],
                      expected: "Welcome Back",
                      label: "updated heading text",
                    },
                  ],
                },
                order: 7,
              },
              {
                title: "Key Takeaway",
                content:
                  "UI changes in Next.js always trace back to a component file. Layout components are the primary location for global elements such as page titles. The source text is found inside the component and modified there.",
                order: 8,
              },
            ],
          },
          hints: {
            create: [
              {
                description: "Change the signup button label from 'Sign Up' to 'Register' in `src/app/signup/page.tsx`",
                order: 1,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description: "Signup button reads 'Register'",
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
    id: "nextjs-shadcn-ui-level-2",
    title: "Bug Fixing & Refactoring",
    subtitle: "Fix status display issues and refactor code",
    order: 2,
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: Users report that the book status display is inconsistent and the code needs cleanup. Fix the status badge colors and refactor the book filtering logic to use proper React patterns.",
    xp_reward: 25,
    coin_reward: 50,
    key_takeaways:
      "useMemo optimizes expensive calculations in React components. Extracting components improves code reusability and makes testing easier. Shadcn/ui components integrate seamlessly with React hooks for state management.",
    scenario_id: "nextjs-shadcn-ui-scenario-1",
    tasks: {
      create: [
        {
          task_name: "Fix Status Badge Colors",
          test_type: "both",
          user_story:
            "As a user, I want to see distinct colors for different book statuses so that I can quickly identify book availability.",
          learning_sections: {
            create: [
              {
                title: "Overview\nStyling Status Badges with Tailwind",
                content:
                  "This section introduces the crash course for styling status badges using Tailwind CSS classes in a shadcn/ui project. It explains how to map semantic states to accessible color palettes.",
                order: 1,
              },
              {
                title: "The Badge Component",
                content:
                  "shadcn/ui provides a Badge component that wraps content in a small pill. Its appearance can be overridden by passing custom className props with Tailwind utility classes.",
                order: 2,
              },
              {
                title: "Accessible Color Palettes",
                content:
                  "For status indicators, a *-100 background with *-800 text provides high contrast and readability:\n\n• bg-green-100 + text-green-800 → Available\n• bg-blue-100 + text-blue-800 → Borrowed\n• bg-red-100 + text-red-800 → Overdue\n\nThese combinations pass WCAG contrast guidelines and look consistent across themes.",
                order: 3,
              },
              {
                title: "Mapping States to Colors",
                content:
                  "A helper function maps each status string to its color className:\n\nfunction getStatusBadge(status: string) {\n  switch (status) {\n    case 'available': return 'bg-green-100 text-green-800';\n    case 'borrowed': return 'bg-blue-100 text-blue-800';\n    case 'overdue': return 'bg-red-100 text-red-800';\n    default: return 'bg-gray-100 text-gray-800';\n  }\n}",
                order: 4,
              },
              {
                title: "Practice Lab: Badge Classifier",
                content:
                  "Practice writing a pure function that maps status strings to Tailwind classes.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement getBadgeClass(status) that returns the correct Tailwind classes for 'available', 'borrowed', and 'overdue'.",
                  language: "javascript",
                  starter_code:
                    "export function getBadgeClass(status) {\n  // TODO\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO",
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "getBadgeClass",
                  test_cases: [
                    {
                      input: ["available"],
                      expected: "bg-green-100 text-green-800",
                      label: "available badge",
                    },
                    {
                      input: ["borrowed"],
                      expected: "bg-blue-100 text-blue-800",
                      label: "borrowed badge",
                    },
                    {
                      input: ["overdue"],
                      expected: "bg-red-100 text-red-800",
                      label: "overdue badge",
                    },
                  ],
                },
                order: 5,
              },
              {
                title: "Key Takeaway",
                content:
                  "Consistent color mapping makes status badges instantly scannable. Centralizing the mapping in a helper ensures every badge in the app follows the same rules.",
                order: 6,
              },
            ],
          },
          hints: {
            create: [
              {
                description: "Ensure 'available' status shows green color",
                order: 1,
              },
              {
                description: "Ensure 'borrowed' status shows blue color",
                order: 2,
              },
              {
                description: "Ensure 'overdue' status shows red color",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description: "Each status has a distinct color",
                is_required: true,
                order: 1,
              },
              {
                description: "Colors match the status type correctly",
                is_required: true,
                order: 2,
              },
            ],
          },
        },
        {
          task_name: "Refactor Book Filtering",
          test_type: "both",
          user_story:
            "As a developer, I want to use useMemo for book filtering so that the application performs better and the code is more maintainable.",
          learning_sections: {
            create: [
              {
                title: "Overview\nReact Hooks and Performance",
                content:
                  "This section introduces the crash course for optimizing React rendering with useMemo and extracting reusable components. It explains why these patterns matter for large lists and complex UIs.",
                order: 1,
              },
              {
                title: "What is useMemo?",
                content:
                  "useMemo is a React hook that caches the result of an expensive calculation. It only recomputes when its dependencies change.\n\nconst filtered = useMemo(() => {\n  return books.filter(b => b.status === 'available');\n}, [books]);\n\nWithout useMemo, the filter runs on every render. With useMemo, it only runs when books changes.",
                order: 2,
              },
              {
                title: "When to Use useMemo",
                content:
                  "useMemo is appropriate when:\n\n• Filtering or sorting large arrays\n• Deriving multiple values from the same source\n• The calculation is noticeably slow\n\nIt should not be used for trivial operations — the overhead of useMemo can outweigh the benefit for simple math.",
                order: 3,
              },
              {
                title: "Extracting Reusable Components",
                content:
                  "When the same JSX appears in multiple places, extracting it into a component is beneficial:\n\n// Before — inline in Dashboard\n{books.map(b => <tr key={b.id}>...</tr>)}\n\n// After — reusable BookRow\nimport { BookRow } from '@/components/BookRow';\n{books.map(b => <BookRow key={b.id} book={b} />)}\n\nThis keeps the parent clean and makes the row testable in isolation.",
                order: 4,
              },
              {
                title: "Returning Multiple Derived Values",
                content:
                  "When multiple filtered views are needed, they can be computed in one useMemo result and returned as an object:\n\nconst { available, borrowed, overdue } = useMemo(() => {\n  return {\n    available: books.filter(b => b.status === 'available'),\n    borrowed: books.filter(b => b.status === 'borrowed'),\n    overdue: books.filter(b => b.status === 'overdue'),\n  };\n}, [books]);\n\nThis avoids three separate filter passes on every render.",
                order: 5,
              },
              {
                title: "Practice Lab: Derive a Value",
                content:
                  "Practice writing a pure function that derives a value from input.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement getDoubledValue(value) that returns value * 2.",
                  language: "javascript",
                  starter_code:
                    "export function getDoubledValue(value) {\n  // TODO\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO",
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "getDoubledValue",
                  test_cases: [
                    {
                      input: [5],
                      expected: 10,
                      label: "doubles five",
                    },
                    {
                      input: [0],
                      expected: 0,
                      label: "handles zero",
                    },
                  ],
                },
                order: 6,
              },
              {
                title: "Key Takeaway",
                content:
                  "useMemo prevents redundant work. Extracted components prevent redundant code. Together, they keep large lists fast and maintainable.",
                order: 7,
              },
            ],
          },
          hints: {
            create: [
              {
                description: "Create a single useMemo hook for book filtering",
                order: 1,
              },
              {
                description: "Return an object with availableBooks, borrowedBooks, and overdueBooks",
                order: 2,
              },
              {
                description: "Create and use a BookRow component",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description: "useMemo is used for book filtering",
                is_required: true,
                order: 1,
              },
              {
                description: "BookRow component exists and works correctly",
                is_required: true,
                order: 2,
              },
              {
                description: "Dashboard uses the new component",
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
    id: "nextjs-shadcn-ui-level-3",
    title: "Feature Development",
    subtitle: "Add search and borrow functionality",
    order: 3,
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: The library wants to expand functionality with new features for better book management. Implement search functionality and a borrow system with modal dialogs.",
    xp_reward: 40,
    coin_reward: 100,
    key_takeaways:
      "Search and filter functionality improves user experience with large datasets. Confirmation dialogs prevent accidental actions. Shadcn/ui Dialog components provide accessible modal interfaces.",
    scenario_id: "nextjs-shadcn-ui-scenario-1",
    tasks: {
      create: [
        {
          task_name: "Add Search & Borrow Features",
          test_type: "both",
          user_story:
            "As a user, I want to search for books and borrow available books so that I can find and reserve books easily.",
          learning_sections: {
            create: [
              {
                title: "Overview\nBuilding Interactive Features in React",
                content:
                  "This section introduces the crash course for building interactive search and modal dialogs in React. It covers state management, controlled inputs, and accessible UI patterns.",
                order: 1,
              },
              {
                title: "Controlled Inputs",
                content:
                  "A controlled input's value is driven by React state:\n\nconst [query, setQuery] = useState('');\n\n<input\n  value={query}\n  onChange={(e) => setQuery(e.target.value)}\n  placeholder=\"Search books...\"\n/>\n\nEvery keystroke updates the state, which triggers a re-render. The UI always reflects the current state.",
                order: 2,
              },
              {
                title: "Real-Time Filtering",
                content:
                  "A controlled input combined with useMemo creates real-time list filtering:\n\nconst filtered = useMemo(() => {\n  return books.filter(b =>\n    b.title.toLowerCase().includes(query.toLowerCase()) ||\n    b.author.toLowerCase().includes(query.toLowerCase())\n  );\n}, [books, query]);\n\nThe user sees results instantly as they type.",
                order: 3,
              },
              {
                title: "Empty States",
                content:
                  "A friendly message should be shown when filters yield no results:\n\n{filtered.length === 0 && (\n  <p>No books found</p>\n)}\n\nThis prevents the UI from looking broken when a search returns nothing.",
                order: 4,
              },
              {
                title: "Modal Dialogs with shadcn/ui",
                content:
                  "shadcn/ui provides a Dialog component that handles focus trapping, keyboard navigation, and accessibility.\n\n<Dialog>\n  <DialogTrigger>Open</DialogTrigger>\n  <DialogContent>\n    <DialogTitle>Borrow Book</DialogTitle>\n    ...\n  </DialogContent>\n</Dialog>\n\nDialog is appropriate for actions that need confirmation or additional input before proceeding.",
                order: 5,
              },
              {
                title: "Practice Lab: Search Filter",
                content:
                  "Practice writing a filter function that searches by name and author.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement searchBooks(books, query) that returns books whose title or author includes the query (case-insensitive).",
                  language: "javascript",
                  starter_code:
                    "export function searchBooks(books, query) {\n  // TODO\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO",
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "searchBooks",
                  test_cases: [
                    {
                      input: [[{ title: "React Guide", author: "Dan" }], "react"],
                      expected: [{ title: "React Guide", author: "Dan" }],
                      label: "finds by title",
                    },
                    {
                      input: [[{ title: "React Guide", author: "Dan" }], "dan"],
                      expected: [{ title: "React Guide", author: "Dan" }],
                      label: "finds by author",
                    },
                    {
                      input: [[{ title: "React Guide", author: "Dan" }], "vue"],
                      expected: [],
                      label: "returns empty when no match",
                    },
                  ],
                },
                order: 6,
              },
              {
                title: "Key Takeaway",
                content:
                  "Controlled inputs combined with useMemo create responsive search. Dialog components make complex workflows feel simple and safe. The empty state should always be handled as a first-class UI concern.",
                order: 7,
              },
            ],
          },
          hints: {
            create: [
              {
                description: "Add search input that filters books by title or author",
                order: 1,
              },
              {
                description: "Show 'No books found' when search yields no results",
                order: 2,
              },
              {
                description: "Add Borrow button that opens a modal with borrower details",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description: "Search filters books in real-time",
                is_required: true,
                order: 1,
              },
              {
                description: "Borrow modal works and updates the UI",
                is_required: true,
                order: 2,
              },
            ],
          },
        },
        {
          task_name: "Create Returns Page",
          test_type: "both",
          user_story:
            "As a librarian, I want to process book returns so that I can update the system when books are returned.",
          learning_sections: {
            create: [
              {
                title: "Overview\nBuilding New Pages in Next.js",
                content:
                  "This section introduces the crash course for adding new routes and pages in a Next.js App Router project. It covers file-based routing, shared layouts, and page-specific state.",
                order: 1,
              },
              {
                title: "File-Based Routing",
                content:
                  "In Next.js App Router, every folder inside app/ becomes a route.\n\napp/\n    ├── page.tsx ← /\n    ├── dashboard/page.tsx ← /dashboard\n    └── returns/page.tsx ← /returns\n\nTo add a route, a new folder and a page.tsx file are created inside the app directory.",
                order: 2,
              },
              {
                title: "Reusing Layouts",
                content:
                  "Pages inside a route group or under the same parent share layouts. If /dashboard uses a sidebar layout, /dashboard/returns can use the same layout by nesting the page inside the dashboard folder.\n\napp/dashboard/\n    ├── layout.tsx ← wraps all dashboard pages\n    ├── page.tsx ← /dashboard\n    └── returns/page.tsx ← /dashboard/returns",
                order: 3,
              },
              {
                title: "Table Components",
                content:
                  "shadcn/ui provides a Table component built on top of Tailwind. It is well-suited for data-heavy pages:\n\n<Table>\n  <TableHeader>\n    <TableRow>\n      <TableHead>Title</TableHead>\n      <TableHead>Status</TableHead>\n    </TableRow>\n  </TableHeader>\n  <TableBody>\n    {books.map(b => (...))}\n  </TableBody>\n</Table>\n\nThis provides a styled, accessible table out of the box.",
                order: 4,
              },
              {
                title: "Updating State on Action",
                content:
                  "When a user clicks 'Return', the local state is updated to reflect the change immediately:\n\nconst handleReturn = (bookId) => {\n  setBooks(prev => prev.map(b =>\n    b.id === bookId ? { ...b, status: 'returned' } : b\n  ));\n};\n\nThis keeps the UI responsive without waiting for a server round-trip.",
                order: 5,
              },
              {
                title: "Key Takeaway",
                content:
                  "New pages are created by adding folders and files to the app directory. Layouts and table components are reused to keep the UI consistent, and state is updated immediately for a responsive feel.",
                order: 6,
              },
            ],
          },
          hints: {
            create: [
              {
                description: "Create returns page with borrowed books table",
                order: 1,
              },
              {
                description: "Add Return button to process returns",
                order: 2,
              },
              {
                description: "Update borrow record status to 'returned'",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description: "Returns page processes returns correctly",
                is_required: true,
                order: 1,
              },
              {
                description: "Borrow records are updated on return",
                is_required: true,
                order: 2,
              },
            ],
          },
        },
      ],
    },
  },
  {
    id: "nextjs-shadcn-ui-level-4",
    title: "Integration & Edge Cases",
    subtitle: "Handle validation and data persistence",
    order: 4,
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: Edge cases and data integrity issues arise when multiple operations happen. Add validation, confirmation dialogs, and data persistence to ensure a robust application.",
    xp_reward: 60,
    coin_reward: 150,
    key_takeaways:
      "Date calculations require careful handling of timezones and edge cases. localStorage provides client-side persistence for better UX. Proper error handling ensures robust user experiences.",
    scenario_id: "nextjs-shadcn-ui-scenario-1",
    tasks: {
      create: [
        {
          task_name: "Add Validation & Date Handling",
          test_type: "both",
          user_story:
            "As a user, I want proper validation and date handling so that the system prevents invalid operations.",
          learning_sections: {
            create: [
              {
                title: "Overview\nValidation and Date Handling in React",
                content:
                  "This section introduces the crash course for adding client-side validation and date handling in a React application. It covers guard conditions, date math, and formatting.",
                order: 1,
              },
              {
                title: "Guard Conditions",
                content:
                  "Guard conditions prevent invalid operations before they happen. Instead of letting an invalid borrow attempt proceed and then showing an error, the action is disabled upfront:\n\nconst canBorrow = book.status !== 'overdue' && book.status === 'available';\n\n<button disabled={!canBorrow}>Borrow</button>\n\nThis approach prevents invalid operations before they occur rather than handling them retroactively.",
                order: 2,
              },
              {
                title: "Date Math in JavaScript",
                content:
                  "JavaScript's Date object makes date math straightforward:\n\nconst today = new Date();\nconst dueDate = new Date(today);\ndueDate.setDate(today.getDate() + 14);\n\nThis creates a due date 14 days from today. Timezones require careful handling — when comparing dates, setHours(0,0,0,0) is called to ignore time of day.",
                order: 3,
              },
              {
                title: "Formatting Dates",
                content:
                  "toLocaleDateString or a library such as date-fns can be used for consistent formatting. For YYYY-MM-DD format, the following approach works:\n\nconst yyyy = dueDate.getFullYear();\nconst mm = String(dueDate.getMonth() + 1).padStart(2, '0');\nconst dd = String(dueDate.getDate()).padStart(2, '0');\nconst formatted = `${yyyy}-${mm}-${dd}`;\n\nThis guarantees exactly 2 digits for month and day.",
                order: 4,
              },
              {
                title: "Practice Lab: Date Formatter",
                content:
                  "Practice formatting a date as YYYY-MM-DD.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement formatDate(date) that returns a string in YYYY-MM-DD format.",
                  language: "javascript",
                  starter_code:
                    "export function formatDate(date) {\n  // TODO\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO",
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "formatDate",
                  test_cases: [
                    {
                      input: [new Date("2026-06-10")],
                      expected: "2026-06-10",
                      label: "formats June date",
                    },
                    {
                      input: [new Date("2026-01-05")],
                      expected: "2026-01-05",
                      label: "formats January date",
                    },
                  ],
                },
                order: 5,
              },
              {
                title: "Key Takeaway",
                content:
                  "Invalid actions are prevented with guard conditions. Dates should be calculated carefully and formatted consistently. These small checks make an app feel reliable.",
                order: 6,
              },
            ],
          },
          hints: {
            create: [
              {
                description: "Prevent borrowing of overdue books",
                order: 1,
              },
              {
                description: "Auto-calculate due date to 14 days from current date",
                order: 2,
              },
              {
                description: "Format due date as YYYY-MM-DD",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description: "Overdue books cannot be borrowed",
                is_required: true,
                order: 1,
              },
              {
                description: "Due date auto-calculates correctly",
                is_required: true,
                order: 2,
              },
            ],
          },
        },
        {
          task_name: "Add Confirmation & Persistence",
          test_type: "both",
          user_story:
            "As a user, I want confirmation dialogs and data persistence so that I don't lose data accidentally.",
          learning_sections: {
            create: [
              {
                title: "Overview\nPersistence and Confirmation in React",
                content:
                  "This section introduces the crash course for persisting state to localStorage and adding confirmation dialogs. It covers the useLocalStorage hook pattern and the shadcn/ui Alert Dialog.",
                order: 1,
              },
              {
                title: "localStorage Basics",
                content:
                  "localStorage is a browser API that stores key-value pairs persistently. Data survives page refreshes and browser restarts.\n\nlocalStorage.setItem('books', JSON.stringify(books));\nconst stored = JSON.parse(localStorage.getItem('books') || '[]');\n\nObjects should always be serialized with JSON.stringify and parsed back with JSON.parse.",
                order: 2,
              },
              {
                title: "The useLocalStorage Hook",
                content:
                  "A reusable hook encapsulates the read-write logic:\n\nfunction useLocalStorage<T>(key: string, initialValue: T) {\n  const [value, setValue] = useState<T>(() => {\n    const stored = localStorage.getItem(key);\n    return stored ? JSON.parse(stored) : initialValue;\n  });\n\n  useEffect(() => {\n    localStorage.setItem(key, JSON.stringify(value));\n  }, [key, value]);\n\n  return [value, setValue];\n}\n\nThis hook hydrates on mount and persists on every change.",
                order: 3,
              },
              {
                title: "Confirmation Dialogs",
                content:
                  "An Alert Dialog is used for destructive or irreversible actions:\n\n<AlertDialog>\n  <AlertDialogTrigger>Return Book</AlertDialogTrigger>\n  <AlertDialogContent>\n    <AlertDialogTitle>Are you sure?</AlertDialogTitle>\n    <AlertDialogAction onClick={handleConfirm}>\n      Confirm\n    </AlertDialogAction>\n  </AlertDialogContent>\n</AlertDialog>\n\nThis prevents accidental clicks from causing data loss.",
                order: 4,
              },
              {
                title: "Key Takeaway",
                content:
                  "State should be persisted to localStorage for resilience. Confirmation dialogs should be added for actions that are hard to undo. These two patterns together make a frontend app feel reliable.",
                order: 5,
              },
            ],
          },
          hints: {
            create: [
              {
                description: "Add confirmation dialogs before borrowing and returning",
                order: 1,
              },
              {
                description: "Persist all data to localStorage",
                order: 2,
              },
              {
                description: "Create useLocalStorage hook",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description: "Confirmation dialogs appear before actions",
                is_required: true,
                order: 1,
              },
              {
                description: "Data persists across page refreshes",
                is_required: true,
                order: 2,
              },
            ],
          },
        },
      ],
    },
  },
  {
    id: "nextjs-shadcn-ui-level-5",
    title: "Real Client Issue",
    subtitle: "Fix overdue bug and create utilities",
    order: 5,
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: Fix a critical overdue status bug reported by clients and create reusable date utilities while updating documentation for maintainability.",
    xp_reward: 75,
    coin_reward: 200,
    key_takeaways:
      "Bug fixing requires systematic debugging and testing. Utility functions improve code reusability. Good documentation ensures long-term maintainability of React applications.",
    scenario_id: "nextjs-shadcn-ui-scenario-1",
    tasks: {
      create: [
        {
          task_name: "Fix Overdue Bug & Build Report",
          test_type: "both",
          user_story:
            "As a client, I want overdue statuses to be accurate so that library operations run smoothly.",
          learning_sections: {
            create: [
              {
                title: "Overview\nDebugging Frontend State Bugs",
                content:
                  "This section introduces the crash course for debugging frontend state bugs. It covers systematic tracing, root cause analysis, and fixing state synchronization issues.",
                order: 1,
              },
              {
                title: "Symptoms vs Root Causes",
                content:
                  "A bug where overdue statuses are wrong could be caused by:\n\n• Incorrect date comparison logic\n• State not updating when a book is returned\n• Timezone issues in date math\n• A stale closure capturing old state\n\nGuessing is not productive — the code path that produces the status should be traced systematically.",
                order: 2,
              },
              {
                title: "Tracing the Data Flow",
                content:
                  "The data can be traced from source to screen:\n\n1. Where is the status computed? (useMemo? inline render?)\n2. What inputs does it depend on? (borrowDate, dueDate, returnedAt?)\n3. What happens when those inputs change?\n4. Is there a mismatch between the computed value and what's displayed?\n\nconsole.log can be added at each step to verify assumptions.",
                order: 3,
              },
              {
                title: "Building Report Pages",
                content:
                  "A report page is just a filtered view of existing data. The same patterns used in the dashboard apply:\n\n• Filter books where status === 'overdue'\n• Render them in a table\n• Add actions like 'Mark as Returned'\n\nThe report page should be kept simple — it reads from the same state source as the dashboard.",
                order: 4,
              },
              {
                title: "Key Takeaway",
                content:
                  "Debugging is a systematic process, not a guess. The data flow should be traced to identify the exact line where the bug originates, and the fix should be applied there. Report pages are simply filtered views of the same underlying data.",
                order: 5,
              },
            ],
          },
          hints: {
            create: [
              {
                description: "Investigate and fix the overdue status bug",
                order: 1,
              },
              {
                description: "Create overdue report page",
                order: 2,
              },
              {
                description: "Add 'Mark as Returned' functionality",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description: "Overdue status calculation is fixed",
                is_required: true,
                order: 1,
              },
              {
                description: "Overdue report page displays accurate information",
                is_required: true,
                order: 2,
              },
            ],
          },
        },
        {
          task_name: "Create Utilities & Documentation",
          test_type: "both",
          user_story:
            "As a developer, I want reusable date utilities and documentation so that the codebase is maintainable.",
          learning_sections: {
            create: [
              {
                title: "Overview\nCreating Reusable Utilities and Documentation",
                content:
                  "This section introduces the crash course for building reusable utility modules and writing documentation. It covers module design, safe defaults, and README best practices.",
                order: 1,
              },
              {
                title: "Utility Modules",
                content:
                  "Utility functions belong in a dedicated folder such as src/lib/ or src/utils/. Each module should have a single responsibility:\n\n// src/lib/dateUtils.ts\nexport function isOverdue(dueDate: string): boolean {\n  const today = new Date();\n  today.setHours(0, 0, 0, 0);\n  return new Date(dueDate) < today;\n}\n\nexport function formatDueDate(dueDate: string): string {\n  ...\n}\n\nUtilities should be kept pure — they should receive inputs and return outputs without side effects.",
                order: 2,
              },
              {
                title: "Safe Defaults for Invalid Input",
                content:
                  "Invalid or missing input should always be handled gracefully:\n\nexport function isOverdue(dueDate: string): boolean {\n  if (!dueDate) return false;\n  ...\n}\n\nThis prevents crashes when the input is undefined, null, or malformed.",
                order: 3,
              },
              {
                title: "Writing a README",
                content:
                  "A good README should include:\n\n• Project overview (what it does, who it's for)\n• Demo credentials (if any)\n• Dev workflow (pnpm install, pnpm run dev)\n• Route list (what pages exist)\n• Key utilities and how to use them\n\nKeeping it current is important — outdated documentation is worse than no documentation.",
                order: 4,
              },
              {
                title: "Practice Lab: Safe Utility",
                content:
                  "Practice writing a utility that returns a safe default for invalid input.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement safeParseInt(value) that returns parseInt(value) when valid, or 0 when invalid.",
                  language: "javascript",
                  starter_code:
                    "export function safeParseInt(value) {\n  // TODO\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO",
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "safeParseInt",
                  test_cases: [
                    {
                      input: ["42"],
                      expected: 42,
                      label: "parses valid number",
                    },
                    {
                      input: ["abc"],
                      expected: 0,
                      label: "returns default for invalid",
                    },
                    {
                      input: [null],
                      expected: 0,
                      label: "handles null",
                    },
                  ],
                },
                order: 5,
              },
              {
                title: "Key Takeaway",
                content:
                  "Utilities are the shared vocabulary of a codebase. They should be documented, tested, and kept safe. A current README is the fastest way to onboard the next developer.",
                order: 6,
              },
            ],
          },
          hints: {
            create: [
              {
                description: "Create date utility functions",
                order: 1,
              },
              {
                description: "Update documentation with usage examples",
                order: 2,
              },
              {
                description: "Add code comments explaining the fix",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description: "Date utilities handle all date operations",
                is_required: true,
                order: 1,
              },
              {
                description: "Documentation is updated with examples",
                is_required: true,
                order: 2,
              },
            ],
          },
        },
      ],
    },
  },
];

