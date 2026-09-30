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
                description: "Run `pnpm install` in the project root so `node_modules/`, `node_modules/next` and `node_modules/react` all exist",
                order: 1,
              },
              {
                description: "Run `pnpm dlx shadcn@latest add alert` to write `src/components/ui/alert.tsx`; keep the shadcn file that exports `Alert`, `AlertTitle` and `AlertDescription`",
                order: 2,
              },
              {
                description: "Run `pnpm dev` in the project root and leave it running until the output contains `ready` or `Local:` within 30 seconds",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description: "A `node_modules` directory exists in the project root containing both `next` and `react`",
                is_required: true,
                order: 1,
              },
              {
                description: "`pnpm dev` starts the development server and prints a line containing `ready` or `Local:` within 30 seconds, exiting without a non-zero code",
                is_required: true,
                order: 2,
              },
              {
                description: "`src/components/ui/alert.tsx` exists and its source references `Alert`, `AlertTitle` and `AlertDescription`",
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
                    "Update the function to return \"Welcome Back\" instead of \"Hello World\".",
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
                
                  hints: [
                    "Simple text replacement.",
                    "Replace \"Hello World\" with \"Welcome Back\".",
                    "return \"___\";"
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
                description: "Open `src/app/signup/page.tsx` and locate the button whose visible label is 'Sign Up'",
                order: 1,
              },
              {
                description: "Change that button label from 'Sign Up' to 'Register', then remove every other occurrence of the string 'Sign Up' in the file that is not inside a comment",
                order: 2,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description: "`src/app/signup/page.tsx` contains the text 'Register' and no longer contains 'Sign Up' anywhere outside of comments",
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
                    "Implement getBadgeClass(status) returning Tailwind classes: available→green, borrowed→blue, overdue→red.\n\nExamples: getBadgeClass(\"available\")→\"bg-green-100 text-green-800\".",
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
                
                  hints: [
                    "Map status to class.",
                    "return {available:\"bg-green-100 text-green-800\",borrowed:\"bg-blue-100 text-blue-800\",overdue:\"bg-red-100 text-red-800\"}[status];",
                    "return {available:\"___\",borrowed:\"___\",overdue:\"___\"}[___];"
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
                description: "The dashboard is `src/app/dashboard/page.tsx`, and it needs data to show. Store a logged-in librarian record in localStorage under the `librarian` key so the page renders",
                order: 1,
              },
              {
                description: "Each book's status renders as a badge inside its table cell (`<td>`)",
                order: 2,
              },
              {
                description: "Each status carries its own color classes: `bg-green-100 text-green-800` for available, `bg-blue-100 text-blue-800` for borrowed, `bg-red-100 text-red-800` for overdue",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description: "The dashboard shows at least one status badge containing 'available' inside a table cell, and every such badge carries the classes `bg-green-100` and `text-green-800`",
                is_required: true,
                order: 1,
              },
              {
                description: "The dashboard shows at least one status badge containing 'borrowed' inside a table cell, and every such badge carries the classes `bg-blue-100` and `text-blue-800`",
                is_required: true,
                order: 2,
              },
              {
                description: "The dashboard shows at least one status badge containing 'overdue' inside a table cell, and every such badge carries the classes `bg-red-100` and `text-red-800`",
                is_required: true,
                order: 3,
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
                    "Implement getDoubledValue(value) returning value * 2.\n\nExamples: getDoubledValue(5)→10, getDoubledValue(0)→0.",
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
                
                  hints: [
    "Multiply by 2.",
    "Combine the two numbers using the right mathematical operator. What symbol means multiplication in JavaScript?",
    "return value * ___;"
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
                description: "Extract the repeated table row into a `BookRow` component in `src/components/BookRow.tsx` that takes a single `book` prop",
                order: 1,
              },
              {
                description: "`BookRow` renders a `<tr>` with the book's `title`, `author`, `isbn` and status as visible text",
                order: 2,
              },
              {
                description: "Use it from `src/app/dashboard/page.tsx` in place of the inline rows, passing `key={book.id}` and `book={book}`, so every book from `@/lib/mockData` still renders",
                order: 3,
              },
              {
                description: "Leave the dashboard stat cards in place, still showing the numeric available and overdue counts as visible text",
                order: 4,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description: "`src/components/BookRow.tsx` exports a React component function, either as its default export or as a named `BookRow` export",
                is_required: true,
                order: 1,
              },
              {
                description: "Given a `book` prop, `BookRow` renders that book's title, author and ISBN as visible text",
                is_required: true,
                order: 2,
              },
              {
                description: "Given a book whose status is 'borrowed', `BookRow` renders text matching 'borrowed'",
                is_required: true,
                order: 3,
              },
              {
                description: "The dashboard renders a row for every book in the mock data set, with each book's title visible",
                is_required: true,
                order: 4,
              },
              {
                description: "The dashboard displays the available book count and the overdue book count as visible text",
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
                    "Implement searchBooks(books, query) returning books where title or author contains query (case-insensitive).\n\nExamples: searchBooks([{title:\"React Guide\",author:\"Dan\"}],\"react\")→matched.",
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
                
                  hints: [
                    "Filter on both fields, lowercase.",
                    "Walk through the array and build a new one keeping only the items that pass your check. What method lets you test each item against a condition?",
                    "return books.filter(b => b.___.toLowerCase().includes(query.toLowerCase()) || b.___.toLowerCase().includes(query.toLowerCase()));"
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
                description: "The dashboard search needs a controlled input the user can type a book query into",
                order: 1,
              },
              {
                description: "The visible book list filters on every keystroke, matching the query against both `book.title` and `book.author` case-insensitively",
                order: 2,
              },
              {
                description: "A search that matches nothing shows the message 'No books found'",
                order: 3,
              },
              {
                description: "An empty search box keeps every book visible",
                order: 4,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description: "The dashboard renders an input field whose placeholder text matches 'Search books'",
                is_required: true,
                order: 1,
              },
              {
                description: "Typing the first word of a book's title into the search input shows that book and hides books whose titles do not contain the query",
                is_required: true,
                order: 2,
              },
              {
                description: "Typing an author's name into the search input shows every book by that author",
                is_required: true,
                order: 3,
              },
              {
                description: "The search matches titles and authors case-insensitively",
                is_required: true,
                order: 4,
              },
              {
                description: "A search that matches nothing displays the text 'No books found'",
                is_required: true,
                order: 5,
              },
              {
                description: "With an empty search input, every book in the list remains visible",
                is_required: true,
                order: 6,
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
                description: "A returns page lists only the books that are currently borrowed, with one action per book",
                order: 1,
              },
              {
                description: "The page shows a 'Returns' heading and a shadcn/ui `Table` whose header row has a `TableHead` (column header) labelled 'Title'",
                order: 2,
              },
              {
                description: "Each borrowed book gets one button labelled 'Return'. There must be exactly one of these per borrowed book",
                order: 3,
              },
              {
                description: "Clicking a Return button opens a confirmation dialog showing 'Are you sure' with a 'Confirm' button",
                order: 4,
              },
              {
                description: "Confirming the return removes that book from the borrowed list, so its title is no longer on the page",
                order: 5,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description: "The returns page renders visible text matching 'Returns' and a table column header whose accessible name matches 'Title'",
                is_required: true,
                order: 1,
              },
              {
                description: "Every currently borrowed book is listed on the returns page with its title visible",
                is_required: true,
                order: 2,
              },
              {
                description: "The page renders exactly one button whose accessible name matches 'Return' for each borrowed book",
                is_required: true,
                order: 3,
              },
              {
                description: "Clicking a Return button displays a confirmation message containing 'Are you sure'",
                is_required: true,
                order: 4,
              },
              {
                description: "Confirming the return removes that book's title from the page",
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
                    "Implement formatDate(date) returning YYYY-MM-DD string.\n\nExamples: formatDate(new Date(\"2026-06-10\"))→\"2026-06-10\".",
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
                
                  hints: [
                    "Use getFullYear, getMonth+1, getDate, padStart.",
                    "const y=date.getFullYear(); const m=String(date.getMonth()+1).padStart(2,\"0\"); const d=String(date.getDate()).padStart(2,\"0\"); return `${y}-${m}-${d}`;",
                    "const m=String(date.getMonth()+___).padStart(2,\"0\"); const d=String(date.___()).padStart(2,\"0\");"
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
                description: "The dashboard status filter keeps working as tabs, one labelled 'All Books' and one labelled 'Overdue'",
                order: 1,
              },
              {
                description: "Only books that are available offer a Borrow action, so the overdue tab shows no Borrow button at all. The risk is deriving the actions from the whole book list instead of the filtered one",
                order: 2,
              },
              {
                description: "Overdue books still appear on the overdue tab with their title and an 'overdue' label",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description: "Selecting the 'Overdue' tab shows the overdue books by title and renders no Borrow buttons at all",
                is_required: true,
                order: 1,
              },
              {
                description: "The 'Overdue' tab displays text matching 'overdue'",
                is_required: true,
                order: 2,
              },
              {
                description: "Selecting the 'All Books' tab renders exactly one Borrow button per available book",
                is_required: true,
                order: 3,
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
                description: "Borrow and Return are confirmed through a shadcn/ui `AlertDialog` whose body text reads 'Are you sure' and which offers 'Confirm' and 'Cancel' buttons",
                order: 1,
              },
              {
                description: "The borrow or return happens only when Confirm fires. Cancelling leaves the book untouched",
                order: 2,
              },
              {
                description: "The borrow dialog has labelled text inputs named 'Borrower Name' and 'Borrower Email'",
                order: 3,
              },
              {
                description: "Persistence comes from one reusable `useLocalStorage(key, initialValue)` hook in `src/hooks/useLocalStorage.ts` that returns a `[value, setValue]` tuple",
                order: 4,
              },
              {
                description: "Books live under the `books` localStorage key. Seed state from it on mount and write it back on every change",
                order: 5,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description: "Clicking a Borrow button on the dashboard opens a confirmation dialog showing text matching 'Are you sure', with buttons whose accessible names match 'Cancel' and 'Confirm'",
                is_required: true,
                order: 1,
              },
              {
                description: "Clicking a Return button on the returns page opens a confirmation dialog showing text matching 'Are you sure'",
                is_required: true,
                order: 2,
              },
              {
                description: "Clicking Cancel in the borrow confirmation dialog closes it, removing the 'Are you sure' text from the page",
                is_required: true,
                order: 3,
              },
              {
                description: "Filling in the borrower name and email inputs and confirming the borrow writes the updated books to localStorage under the `books` key",
                is_required: true,
                order: 4,
              },
              {
                description: "When books have been saved to localStorage under the `books` key, the dashboard renders those stored books on mount",
                is_required: true,
                order: 5,
              },
              {
                description: "`useLocalStorage(key, initialValue)` returns the initial value when nothing is stored under that key",
                is_required: true,
                order: 6,
              },
              {
                description: "Calling the setter returned by `useLocalStorage` updates the value and persists it to localStorage under the same key",
                is_required: true,
                order: 7,
              },
              {
                description: "`useLocalStorage` returns an existing stored value instead of the initial value when the key already holds one",
                is_required: true,
                order: 8,
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
                description: "A new page lists only overdue books, and every row offers a 'Mark as Returned' action. Leaving the page out means the report has nowhere to live",
                order: 1,
              },
              {
                description: "Each overdue book shows its title, its author, the borrower's name, and the borrower's email taken from its borrow record",
                order: 2,
              },
              {
                description: "Every row states how many days the book is overdue, for example '5 days overdue'",
                order: 3,
              },
              {
                description: "Marking a book returned takes it off the list. A row that survives the click means the list and the stored status disagree",
                order: 4,
              },
              {
                description: "The overdue status shown everywhere else has to agree with the due date. Fixing only the report leaves the rest of the app wrong",
                order: 5,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description: "The overdue report page lists every overdue book with both its title and its author",
                is_required: true,
                order: 1,
              },
              {
                description: "Each overdue book is shown with the borrower's name",
                is_required: true,
                order: 2,
              },
              {
                description: "Each overdue book is shown with the borrower's email from its borrow record",
                is_required: true,
                order: 3,
              },
              {
                description: "The page displays text matching 'days overdue' for the overdue books",
                is_required: true,
                order: 4,
              },
              {
                description: "The page renders exactly one button whose accessible name matches 'Mark as Returned' for each overdue book",
                is_required: true,
                order: 5,
              },
              {
                description: "Clicking 'Mark as Returned' removes that book's title from the overdue list",
                is_required: true,
                order: 6,
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
                    "Implement safeParseInt(value) returning parseInt when valid, 0 when invalid.\n\nExamples: safeParseInt(\"42\")→42, safeParseInt(\"abc\")→0.",
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
                
                  hints: [
                    "Parse and check NaN.",
                    "Before you can check the number, you need to convert it from its string form. Then you need to decide: is this a valid number, and is it within the allowed range?",
                    "const num = parseInt(value); return ___(num) ? ___ : num;"
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
                description: "A reusable date module exposes a formatter and an overdue check. Without one, both behaviours get reimplemented wherever they are needed",
                order: 1,
              },
              {
                description: "Formatting '2026-01-15' has to produce exactly 'Jan 15, 2026'",
                order: 2,
              },
              {
                description: "Unparseable input must not throw. Both 'invalid' and '' format to an empty string, and the overdue check answers false for both",
                order: 3,
              },
              {
                description: "The overdue check compares a `YYYY-MM-DD` date string against today, answering true for past dates and false for future ones",
                order: 4,
              },
              {
                description: "The project README describes a library management app, mentions 'library management', 'book' and 'feature', and runs to more than 100 characters",
                order: 5,
              },
              {
                description: "At least 80% of the TypeScript source files in the project carry a code comment. Leaving them bare makes the codebase undiscoverable",
                order: 6,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description: "`formatDate` exported from `src/lib/dateUtils` converts '2026-01-15' to 'Jan 15, 2026'",
                is_required: true,
                order: 1,
              },
              {
                description: "`formatDate` returns an empty string for the inputs 'invalid' and ''",
                is_required: true,
                order: 2,
              },
              {
                description: "`isOverdue` exported from `src/lib/dateUtils` returns true for a date one day in the past",
                is_required: true,
                order: 3,
              },
              {
                description: "`isOverdue` returns false for a date in the future",
                is_required: true,
                order: 4,
              },
              {
                description: "`isOverdue` returns false for the invalid date strings 'invalid' and '' instead of throwing",
                is_required: true,
                order: 5,
              },
              {
                description: "`README.md` exists at the project root, is longer than 100 characters, and mentions 'library management', 'book' and 'feature'",
                is_required: true,
                order: 6,
              },
              {
                description: "At least 80% of the `.ts` and `.tsx` files under `src/` contain at least one code comment",
                is_required: true,
                order: 7,
              },
            ],
          },
        },
      ],
    },
  },
];

