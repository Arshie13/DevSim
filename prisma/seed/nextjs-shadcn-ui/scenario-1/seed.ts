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
    level_description:
      "Mission Briefing: The library has onboarded a new developer and needs the system running locally. Install the project dependencies, verify the Next.js development server starts cleanly, and add the shadcn/ui Alert component with its expected exports.",
    xp_reward: 10,
    coin_reward: 20,
    key_takeaways:
      "Installing project dependencies with pnpm install ensures Next.js and React are available. Running the dev server verifies the project boots without errors. Adding a shadcn/ui component via the CLI copies its source into the project. This task checks for `src/components/ui/alert.tsx` and the `Alert`, `AlertTitle` and `AlertDescription` names; it does not grade the Dialog or Input component or require a particular ref-forwarding implementation.",
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
                  "shadcn/ui is a collection of reusable, accessible UI components built on top of Radix UI and Tailwind CSS. Components are copied into the project source, giving the project ownership and room to customize them.\n\nFor this task, the setup test checks that `src/components/ui/alert.tsx` exists and contains the `Alert`, `AlertTitle` and `AlertDescription` component names. It does not check that Dialog or Input has been installed.",
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
                  "Practice adding the shadcn/ui Alert component using the CLI. The command copies the component source into `src/components/ui/`, where it can be customized.\n\npnpm dlx shadcn@latest add alert",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "TERMINAL_CMD" as const,
                interactive_config: {
                  instructions:
                    "Run the shadcn/ui CLI command that adds the Alert component. Type the exact command and click Check to verify.",
                  expected_commands: [
                    "pnpm dlx shadcn@latest add alert",
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
                description: "Run `pnpm install` in the project root and let it finish; `node_modules/` should then hold both `next` and `react`.",
                order: 1,
              },
              {
                description: "Run `pnpm dlx shadcn@latest add alert`; verify `src/components/ui/alert.tsx` exists and contains `Alert`, `AlertTitle` and `AlertDescription`.",
                order: 2,
              },
              {
                description: "Run `pnpm dev` in the project root and leave it running; the output should print `ready` or `Local:` within 30 seconds and exit without a non-zero code.",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Install project dependencies using pnpm install",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Run the development server and verify it starts successfully",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Verify src/components/ui/alert.tsx exists and contains Alert, AlertTitle and AlertDescription",
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
            "As a visitor, I want the signup button to read Login so that the page uses the wording the library standardised on.",
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
                  "To locate the source of a UI element visible in the browser, the following questions help:\nWhat element is it? (header, footer, button label?)\nWhich component renders it? (trace it to a file)\nIs the text hardcoded or coming from props/state?\nThe signup button is hardcoded in `src/app/signup/page.tsx`, so that is the file to open.",
                order: 4,
              },
              {
title: "JSX Text Content",
                  content:
                    "Changing text in JSX is straightforward — it's just like editing HTML:\n// Before\n<Button>Sign Up</Button>\n// After\n<Button>Login</Button>\n\nThe text has to change everywhere it appears in the file, because a leftover copy inside a comment is stripped before the check and any copy left in live JSX is what a reader still sees.",
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
                  "UI changes in Next.js always trace back to a component file. The signup page is `src/app/signup/page.tsx`, the label lives in the JSX, and every copy of the old wording outside a comment has to go with it.",
                order: 8,
              },
            ],
          },
          hints: {
            create: [
              {
                description: "Open `src/app/signup/page.tsx` and find the button whose visible label in the JSX reads 'Sign Up'.",
                order: 1,
              },
              {
                description: "Change that label to 'Login', then replace every other 'Sign Up' left in the file outside comments so no occurrence survives.",
                order: 2,
              },
              {
                description: "Verify the source of `/signup` contains `Login` and no `Sign Up` outside comments; the test checks source text rather than rendering the page.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Update the signup page button label from 'Sign Up' to 'Login'",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Remove all other instances of 'Sign Up' from the signup page outside of comments",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Verify the signup page source contains 'Login' and no 'Sign Up' outside comments",
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
    id: "nextjs-shadcn-ui-level-2",
    title: "Book Status Badge Colors and BookRow Refactor",
    subtitle: "Give each book status a distinct badge color, then extract the table row into a BookRow component",
    order: 2,
    level_description:
      "Mission Briefing: The status badges are too easy to confuse. Give available, borrowed and overdue books the distinct colors required by the tests. Then extract a reusable `BookRow` component, memoize at least one derived book collection, and keep the dashboard's book titles and status counts visible.",
    xp_reward: 25,
    coin_reward: 50,
    key_takeaways:
      "The dashboard renders status text inside table cells with distinct badge classes: available uses `bg-green-100 text-green-800`, borrowed uses `bg-blue-100 text-blue-800`, and overdue uses `bg-red-100 text-red-800`. The test checks these classes on each matching status badge.\n\nA `BookRow` component takes a single `book` prop and renders its title, author, ISBN and status; either a default or named `BookRow` export is accepted. The tests render it inside a table.\n\nThe dashboard source must import `useMemo` from `react` and use it for at least one of `availableBooks`, `borrowedBooks` or `overdueBooks`. The rendered dashboard is also checked for every starter-book title and the available/overdue counts.",
    scenario_id: "nextjs-shadcn-ui-scenario-1",
    tasks: {
      create: [
        {
          task_name: "Fix Book Status Badge Colors",
          test_type: "both",
          user_story:
            "As a librarian, I want available, borrowed and overdue books to have distinct, correct badge colors so that I can recognize each status at a glance.",
          learning_sections: {
            create: [
              {
                title: "Overview\nFixing Book Status Badge Colors",
                content:
                  "This level has two tasks. The first fixes the status badge colors on the dashboard. The second creates a reusable `BookRow` component and verifies the dashboard's book rows, counts and memoized collections.",
                order: 1,
              },
              {
                title: "Status-to-Color Mapping",
                content:
                  "Each book's status badge is rendered in a dashboard table cell. The test finds those cells by their visible status text and checks the badge classes:\n\n- `available`: `bg-green-100 text-green-800`\n- `borrowed`: `bg-blue-100 text-blue-800`\n- `overdue`: `bg-red-100 text-red-800`\n\nThe test checks the badges that render for each status; it does not require an Alert banner or a particular shadcn component for the badge.",
                order: 2,
              },
              {
                title: "Apply Classes to the Status Badge",
                content:
                  "Apply both expected utility classes to the element that displays each status, for example:\n\n<span className=\"bg-green-100 text-green-800\">Available</span>\n\nThe tests assert both classes on each matching status element, so styling a parent while leaving the status element unstyled will not satisfy the check.",
                order: 3,
              },
              {
                title: "Render Every Status",
                content:
                  "The starter data includes books in all three statuses. The dashboard tests render the page and verify that at least one badge for each status exists, then check the expected classes on every matching badge. Keep the visible status words so the badges are discoverable.",
                order: 4,
              },
              {
                title: "Practice Lab: Choose Badge Classes",
                content:
                  "Practice selecting the same status classes used by the dashboard badges.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement `statusBadgeClasses(status)` returning the two expected CSS classes for each known status as a space-separated string.\n\n- `available` returns `bg-green-100 text-green-800`\n- `borrowed` returns `bg-blue-100 text-blue-800`\n- `overdue` returns `bg-red-100 text-red-800`",
                  language: "javascript",
                  starter_code:
                    "export function statusBadgeClasses(status) {\n  // TODO\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO",
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "statusBadgeClasses",
                  test_cases: [
                    {
                      input: ["available"],
                      expected: "bg-green-100 text-green-800",
                      label: "available uses green classes",
                    },
                    {
                      input: ["borrowed"],
                      expected: "bg-blue-100 text-blue-800",
                      label: "borrowed uses blue classes",
                    },
                    {
                      input: ["overdue"],
                      expected: "bg-red-100 text-red-800",
                      label: "overdue uses red classes",
                    },
                  ],
                  hints: [
                    "Choose a class pair based on the status string.",
                    "if (status === 'available') return 'bg-green-100 text-green-800';",
                    "if (status === '___') return 'bg-___-100 text-___-800';",
                  ],
                },
                order: 5,
              },
              {
                title: "Key Takeaway",
                content:
                  "Use green classes for available books, blue for borrowed books and red for overdue books. Keep the status text on the badge so the tests can identify each rendered status.",
                order: 6,
              },
            ],
          },
          hints: {
            create: [
              {
                description: "In the dashboard table, locate the element displaying each book's status and give it the matching badge classes: available green, borrowed blue and overdue red.",
                order: 1,
              },
              {
                description: "The exact class pairs checked are `bg-green-100 text-green-800`, `bg-blue-100 text-blue-800` and `bg-red-100 text-red-800`; apply both classes to every matching status badge.",
                order: 2,
              },
              {
                description: "Use the visible labels `available`, `borrowed` and `overdue` on the respective badges; the tests locate the status elements by that text.",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Display at least one available book status badge in the dashboard table",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Give every available status badge the classes bg-green-100 and text-green-800",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Display at least one borrowed book status badge in the dashboard table",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Give every borrowed status badge the classes bg-blue-100 and text-blue-800",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "Display at least one overdue book status badge and give every overdue badge the classes bg-red-100 and text-red-800",
                is_required: true,
                order: 5,
              },
            ],
          },
        },
        {
          task_name: "Extract BookRow and Memoize the Derived Lists",
          test_type: "both",
          user_story:
            "As a developer, I want the dashboard table row extracted into a `BookRow` component and the derived lists memoized so that a single book row can be rendered on its own and the filters are not rebuilt on every render.",
          learning_sections: {
            create: [
              {
                title: "Overview\nExtracting the BookRow Component",
                content:
                  "This level has two tasks. The first assigns the tested green, blue and red class pairs to the available, borrowed and overdue status badges. The second creates a `BookRow` component and memoizes at least one derived book collection.",
                order: 1,
              },
              {
                title: "The Inline Row Today",
                content:
                  "The All Books table maps over `mockBooks` and builds each row inline:\n\n{books.map((book) => (\n  <TableRow key={book.id}>\n    <TableCell className=\"font-medium\">{book.title}</TableCell>\n    <TableCell>{book.author}</TableCell>\n    <TableCell>{book.isbn}</TableCell>\n    <TableCell><Badge>{/* status */}</Badge></TableCell>\n    <TableCell>{book.borrowedBy || '-'}</TableCell>\n  </TableRow>\n))}\n\nThe five `TableCell`s line up with the `TableHead`s: `Title`, `Author`, `ISBN`, `Status`, `Borrowed By`.",
                order: 2,
              },
              {
                title: "One Row, One Component",
                content:
                  "Moving that row into `src/components/BookRow.tsx` gives it a single `book` prop typed with the `Book` interface from `src/lib/mockData.ts`:\n\nimport { Book } from '@/lib/mockData';\n\nexport default function BookRow({ book }: { book: Book }) {\n  return (\n    <TableRow>\n      <TableCell className=\"font-medium\">{book.title}</TableCell>\n      ...\n    </TableRow>\n  );\n}\n\nThe test imports the whole module and uses `module.default ?? module.BookRow`, so a default export and a named `BookRow` export are both accepted.",
                order: 3,
              },
              {
                title: "Why the Row Needs a Table",
                content:
                  "`BookRow` renders a `TableRow`, which is a `tr`. A `tr` is only valid inside `tbody`, which is only valid inside `table`, so the row is always rendered in that order:\n\nrender(\n  <table>\n    <tbody>\n      <BookRow book={book} />\n    </tbody>\n  </table>\n)\n\nReturning a fragment of `TableCell`s instead of a `TableRow` also works, as long as the cells stay inside a `table`.",
                order: 4,
              },
              {
                title: "Counts Still Belong to the Page",
                content:
                  "The three stat cards at the top of the page are not part of the row. They keep reading the whole list, and `useMemo` from `react` is what keeps those filters from being rebuilt on every render:\n\nimport { useMemo } from 'react';\n\nconst availableBooks = useMemo(\n  () => books.filter((book) => book.status === 'available'),\n  [books]\n);\nconst overdueBooks = useMemo(\n  () => books.filter((book) => book.status === 'overdue'),\n  [books]\n);\n\nThe `Available` card renders `availableBooks.length` and the `Overdue` card renders `overdueBooks.length`, so the numbers stay on screen after the row is extracted.",
                order: 5,
              },
              {
                title: "Practice Lab: Row Values",
                content:
                  "Practice the pure part of the row: pick the four values a row shows for a book.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement `getRowValues(book)` returning an array with the row's four visible values in order.\n\n- index 0 is `book.title`\n- index 1 is `book.author`\n- index 2 is `book.isbn`\n- index 3 is `book.status`\n\nExample: `getRowValues({ title: '1984', author: 'George Orwell', isbn: '978-0-452-28423-4', status: 'overdue' })` returns `['1984', 'George Orwell', '978-0-452-28423-4', 'overdue']`.",
                  language: "javascript",
                  starter_code:
                    "export function getRowValues(book) {\n  // TODO\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO",
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "getRowValues",
                  test_cases: [
                    {
                      input: [
                        {
                          title: "1984",
                          author: "George Orwell",
                          isbn: "978-0-452-28423-4",
                          status: "overdue",
                        },
                      ],
                      expected: ["1984", "George Orwell", "978-0-452-28423-4", "overdue"],
                      label: "row values in header order",
                    },
                    {
                      input: [
                        {
                          title: "The Hobbit",
                          author: "J.R.R. Tolkien",
                          isbn: "978-0-547-92822-7",
                          status: "borrowed",
                        },
                      ],
                      expected: [
                        "The Hobbit",
                        "J.R.R. Tolkien",
                        "978-0-547-92822-7",
                        "borrowed",
                      ],
                      label: "second book keeps the same order",
                    },
                  ],
                  hints: [
                    "Return four values in the order the table headers appear: Title, Author, ISBN, Status.",
                    "return [book.title, book.author, book.isbn, book.status];",
                    "return [book.___, book.___, book.___, book.___];",
                  ],
                },
                order: 6,
              },
              {
                title: "Key Takeaway",
                content:
                  "The page keeps the list and the counts behind `useMemo`; the row component keeps the markup. Each side stays small, and a single book row can be rendered without the page around it.",
                order: 7,
              },
            ],
          },
          hints: {
            create: [
              {
                description: "Create `src/components/BookRow.tsx` exporting the component as its default export or as a named `BookRow` export; both are accepted.",
                order: 1,
              },
              {
                description: "Give it one `book` prop typed `Book` and render a `TableRow` whose `TableCell`s show `title`, `author`, `isbn` and the status text.",
                order: 2,
              },
              {
                description: "The tests verify `BookRow` renders a supplied book's title, author, ISBN and status, and the dashboard displays starter-book titles and available/overdue counts. They check `useMemo` in the dashboard source, but do not explicitly verify the dashboard imports or renders `BookRow`.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Wrap at least one of the derived book lists (availableBooks, borrowedBooks, or overdueBooks) with React's useMemo hook",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Create a BookRow component as either a default export or named BookRow export",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Render the book's title, author, and ISBN as visible text in the BookRow component",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Show borrowed status text for books that are on loan in the BookRow component",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "Verify the dashboard still displays the title of every book from the starter data",
                is_required: true,
                order: 5,
              },
              {
                description:
                  "Verify the dashboard still shows the available and overdue book counts",
                is_required: true,
                order: 6,
              },
            ],
          },
        },
      ],
    },
  },
  {
    id: "nextjs-shadcn-ui-level-3",
    title: "Book Search and the Returns Page",
    subtitle: "Filter the dashboard books from a search input and add a /returns route that processes returns behind a confirmation",
    order: 3,
    level_description:
      "Mission Briefing: Librarians cannot find a book on a list of eight without reading every row, and there is nowhere to process a return. Add a search input to the dashboard that filters by title and author, and add a `/returns` page that lists the borrowed books and takes one through a confirmation before the book leaves the list.",
    xp_reward: 40,
    coin_reward: 100,
    key_takeaways:
      "The dashboard search input has a placeholder matching `Search books` and filters visible books as the query changes. The tests check title search, author search, case-insensitive matching, the no-results message and the initial unfiltered list; they do not require a particular input component or styling.\n\nA new App Router route is a folder plus a `page.tsx`. The returns page lists borrowed books, shows confirmation when Return is clicked, and removes the selected book after Confirm. Its test also checks that the page imports the shared shadcn Dialog component.",
    scenario_id: "nextjs-shadcn-ui-scenario-1",
    tasks: {
      create: [
        {
          task_name: "Add a Search Box to the Dashboard",
          test_type: "both",
          user_story:
            "As a librarian, I want to type into a search box on the dashboard so that only the books matching that title or author stay on screen.",
          learning_sections: {
            create: [
              {
                title: "Overview\nAdding Book Search",
                content:
                  "This level has two tasks. The first adds a search input to the dashboard. The second adds a `/returns` page that lists borrowed books.",
                order: 1,
              },
              {
                title: "A Controlled Input",
                content:
                  "A controlled input uses state for its value and updates that state in `onChange`:\n\nconst [query, setQuery] = useState('');\n\n<input\n  placeholder=\"Search books...\"\n  value={query}\n  onChange={(e) => setQuery(e.target.value)}\n/>\n\nThe test locates the field with a placeholder matching `/search books/i`, so wording such as `Search books...` is sufficient. A shared shadcn `Input` is welcome, but the test does not require that component or particular sizing/focus classes.",
                order: 2,
              },
              {
                title: "Filtering Title and Author",
                content:
                  "`mockBooks` entries carry a `title` and an `author`, so both are worth matching:\n\nconst term = query.trim().toLowerCase();\nconst filteredBooks = books.filter(\n  (book) =>\n    book.title.toLowerCase().includes(term) ||\n    book.author.toLowerCase().includes(term)\n);\n\nLowercasing both sides is what makes `orwell` and `Orwell` behave the same. An empty query lowercases to an empty string, which every title contains, so nothing is filtered out while the box is empty.",
                order: 3,
              },
              {
                title: "The Empty State",
                content:
                  "A search that matches nothing must say so:\n\n{filteredBooks.length === 0 && (\n  <p className=\"text-amber-600\">No books found</p>\n)}\n\nThe text `No books found` is the only thing on screen in that branch, so nothing else can match the title queries while it is showing.",
                order: 4,
              },
              {
                title: "Practice Lab: Match a Query",
                content:
                  "Practice the match on its own: write the pure filter that the dashboard state calls.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement `searchBooks(books, query)` returning the books whose `title` or `author` contains `query`, compared case-insensitively.\n\n- matching is a substring check, not an exact comparison\n- an empty or whitespace-only `query` returns every book\n- books that match neither field are dropped\n\nExample: `searchBooks([{ title: '1984', author: 'George Orwell' }], 'orwell')` returns that one book.",
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
                      input: [
                        [
                          { title: "1984", author: "George Orwell" },
                          { title: "The Hobbit", author: "J.R.R. Tolkien" },
                        ],
                        "orwell",
                      ],
                      expected: [{ title: "1984", author: "George Orwell" }],
                      label: "matches by author regardless of case",
                    },
                    {
                      input: [
                        [
                          { title: "1984", author: "George Orwell" },
                          { title: "Animal Farm", author: "George Orwell" },
                        ],
                        " Orwell ",
                      ],
                      expected: [
                        { title: "1984", author: "George Orwell" },
                        { title: "Animal Farm", author: "George Orwell" },
                      ],
                      label: "trims the query and keeps both books",
                    },
                    {
                      input: [
                        [
                          { title: "1984", author: "George Orwell" },
                          { title: "The Hobbit", author: "J.R.R. Tolkien" },
                        ],
                        "",
                      ],
                      expected: [
                        { title: "1984", author: "George Orwell" },
                        { title: "The Hobbit", author: "J.R.R. Tolkien" },
                      ],
                      label: "empty query keeps every book",
                    },
                    {
                      input: [[{ title: "1984", author: "George Orwell" }], "xyznonexistent"],
                      expected: [],
                      label: "no match returns an empty list",
                    },
                  ],
                  hints: [
                    "Walk the list and keep only the books that pass the check, after lowercasing the query and both fields.",
                    "const term = query.trim().toLowerCase(); if (!term) return books; return books.filter((book) => book.title.toLowerCase().includes(term) || book.___.toLowerCase().includes(term));",
                    "const term = query.trim().toLowerCase(); if (!term) return books; return books.filter((book) => book.___.toLowerCase().includes(term) || book.___.toLowerCase().includes(term));",
                  ],
                },
                order: 5,
              },
              {
                title: "Key Takeaway",
                content:
                  "The state, the filter and the empty branch live together on the dashboard page. `Search books...` in the placeholder is what makes the box findable, and `No books found` is what covers the empty branch.",
                order: 6,
              },
            ],
          },
          hints: {
            create: [
              {
                description: "In `src/app/dashboard/page.tsx`, provide an input whose placeholder matches `Search books`, keep the query in state, and update it on change. The test does not require importing the shared Input component.",
                order: 1,
              },
              {
                description: "Filter the list by comparing the query against both `book.title` and `book.author`, ignoring case; show `No books found` when nothing matches.",
                order: 2,
              },
              {
                description: "Self-check: before typing, every `mockBooks` title is visible; type `xyznonexistent` and only `No books found` should be left on the page.",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Add a search box to the dashboard with placeholder text 'Search books...'",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Filter books by title and author, case-insensitively, when the search input changes",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Show 'No books found' when a search query has no matching books",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Show every starter-book title on the initial unfiltered dashboard",
                is_required: true,
                order: 4,
              },
            ],
          },
        },
        {
          task_name: "Build the Returns Page",
          test_type: "both",
          user_story:
            "As a librarian, I want a returns page that lists the borrowed books so that I can take each one back after confirming the return.",
          learning_sections: {
            create: [
              {
                title: "Overview\nBuilding the Returns Page",
                content:
                  "This level has two tasks. The first adds a search input to the dashboard. The second adds a new route that lists borrowed books and processes a confirmed return.",
                order: 1,
              },
              {
                title: "A Route Is a Folder",
                content:
                  "App Router turns each folder under `src/app` into a route, and the `page.tsx` inside it is that route's page:\n\nsrc/app/\n  dashboard/page.tsx  /dashboard\n  returns/page.tsx    /returns\n\nThe page must be the default export of `src/app/returns/page.tsx`, and it starts with `'use client'` because the page holds state and handles clicks.",
                order: 2,
              },
              {
                title: "Listing Only the Borrowed Books",
                content:
                  "`mockBooks` carries a `status` of `'available' | 'borrowed' | 'overdue'`, so the page filters once and works from that list:\n\nconst borrowedBooks = books.filter((book) => book.status === 'borrowed');\n\n`Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead` and `TableCell` come from `src/components/ui/table.tsx`. A `TableHead` renders a `th`, which is what gives the page a column header an accessible name.",
                order: 3,
              },
              {
                title: "One Return Button per Borrowed Book",
                content:
                  "Each row ends with a `Button` labelled `Return`, and only the borrowed rows are rendered, so the count of buttons and the count of borrowed books agree:\n\n{borrowedBooks.map((book) => (\n  <TableRow key={book.id}>\n    ...\n    <TableCell>\n      <Button onClick={() => setPendingBook(book)}>Return</Button>\n    </TableCell>\n  </TableRow>\n))}\n\nNothing else on the page should be a button whose accessible name contains `Return`, or the count comes out higher than the row count.",
                order: 4,
              },
              {
                title: "Confirming the Return",
                content:
                  "Clicking `Return` opens a confirmation containing `Are you sure`; clicking `Confirm` changes the selected book to `available`, so it leaves the borrowed list. The test also checks that the page source imports and uses a component from `@/components/ui/dialog`. It does not assert `aria-modal` or test cancellation on this page; the Level 4 test checks that Cancel closes the borrow confirmation.",
                order: 5,
              },
              {
                title: "Practice Lab: Applying a Return",
                content:
                  "Practice the pure part of the handler: flip one book's status without touching the rest of the list.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement `markReturned(books, bookId)` returning a new list where the book whose `id` is `bookId` has `status` `available`, and every other book is unchanged.\n\n- the input list is not mutated\n- a `bookId` that is not in the list returns an equivalent list\n\nExample: `markReturned([{ id: '1', status: 'borrowed' }], '1')` returns `[{ id: '1', status: 'available' }]`.",
                  language: "javascript",
                  starter_code:
                    "export function markReturned(books, bookId) {\n  // TODO\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO",
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "markReturned",
                  test_cases: [
                    {
                      input: [
                        [
                          { id: "1", title: "1984", status: "borrowed" },
                          { id: "2", title: "The Hobbit", status: "borrowed" },
                        ],
                        "1",
                      ],
                      expected: [
                        { id: "1", title: "1984", status: "available" },
                        { id: "2", title: "The Hobbit", status: "borrowed" },
                      ],
                      label: "one book becomes available",
                    },
                    {
                      input: [[{ id: "1", title: "1984", status: "borrowed" }], "99"],
                      expected: [{ id: "1", title: "1984", status: "borrowed" }],
                      label: "unknown id changes nothing",
                    },
                  ],
                  hints: [
                    "Walk the list and replace only the entry whose `id` matches, spreading the original book.",
                    "return books.map((book) => (book.id === bookId ? { ...book, status: 'available' } : book));",
                    "return books.map((book) => (book.___ === ___ ? { ...book, ___: '___' } : book));",
                  ],
                },
                order: 6,
              },
              {
                title: "Key Takeaway",
                content:
                  "The page owns the list, filters to `borrowed`, and renders one `Return` button per row. The status change happens on confirm, and the filtered list re-renders without the returned book.",
                order: 7,
              },
            ],
          },
          hints: {
            create: [
              {
                description: "Add `src/app/returns/page.tsx` with `'use client'`, importing `Dialog` and friends from `@/components/ui/dialog`, plus a heading and a `Title` column header and one row per borrowed book.",
                order: 1,
              },
              {
                description: "Give each borrowed row exactly one `Button` labelled `Return`; the button count must equal the number of borrowed books.",
                order: 2,
              },
              {
                description: "Opening Return shows `Are you sure`; clicking `Confirm` changes the selected book to `available` so its title leaves the borrowed list. Use the shared Dialog import from `@/components/ui/dialog`.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Create the returns page with a title mentioning Returns and a Title column header",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "List every currently borrowed book in the returns page table",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Add a Return button for each borrowed book so the button count matches the borrowed book count",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Show confirmation text containing 'Are you sure' after clicking Return",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "Provide a Confirm button in the return confirmation so the test can confirm a return",
                is_required: true,
                order: 5,
              },
              {
                description:
                  "Remove the book from the returns list when Confirm is clicked",
                is_required: true,
                order: 6,
              },
              {
                description:
                  "Import and use a Dialog component from the shared shadcn dialog module",
                is_required: true,
                order: 7,
              },
            ],
          },
        },
      ],
    },
  },
  {
    id: "nextjs-shadcn-ui-level-4",
    title: "Borrow Validation and Confirmation with Persistence",
    subtitle: "Offer Borrow only on available books, confirm every borrow and return, and keep books in localStorage through a useLocalStorage hook",
    order: 4,
    level_description:
      "Mission Briefing: A librarian can still act on a book that should be off limits, and every action goes through unchecked. Restrict the dashboard to one `Borrow` button per available book and none on the overdue tab, then put confirmations in front of borrow and return and back the books list with a `useLocalStorage` hook so changes persist.",
    xp_reward: 60,
    coin_reward: 150,
    key_takeaways:
      "The dashboard tests click the `Overdue Books` tab and check that an overdue book is visible with no `Borrow` button present. They also click `All Books` and check the Borrow-button count equals the number of available starter books.\n\n`Dialog` from `@/components/ui/dialog` carries the `Are you sure` body text plus `Cancel` and `Confirm`; the tests check that Cancel closes the borrow dialog and that the returns page shows confirmation before returning a book.\n\n`useLocalStorage(key, initialValue)` in `src/hooks/useLocalStorage.ts` returns a `[value, setValue]` tuple: the initial value when the key is empty, the stored value when it is not, and every setter call writes the value back as JSON.",
    scenario_id: "nextjs-shadcn-ui-scenario-1",
    tasks: {
      create: [
        {
          task_name: "Offer Borrow Only on Available Books",
          test_type: "both",
          user_story:
            "As a librarian, I want a Borrow button on available books and none on overdue books so that I cannot start a new loan on something that is already late.",
          learning_sections: {
            create: [
              {
                title: "Overview\nRestricting the Borrow Action",
                content:
                  "This level has two tasks. The first verifies that only available books offer a Borrow button and that the overdue tab has none. The second puts confirmations in front of borrow and return, and moves the books list into `localStorage`.",
                order: 1,
              },
              {
                title: "The Tab Decides the Row",
                content:
                  "`src/app/dashboard/page.tsx` drives its three tables from `activeTab`, and `TabsTrigger` renders a `button` with `role=\"tab\"`. The triggers are labelled `All Books`, `Borrowed Books` and `Overdue Books`, and `Overdue Books` is the trigger found by the name `overdue`.\n\nClicking a trigger swaps which table is on screen, so any `Borrow` button is only on screen because of the tab that is active.",
                order: 2,
              },
              {
                title: "One Button per Available Book",
                content:
                  "A `Button` labelled `Borrow` belongs inside the row of a book whose `status` is `available`:\n\n{book.status === 'available' && (\n  <TableCell>\n    <Button>Borrow</Button>\n  </TableCell>\n)}\n\nA `Borrowed Books` column header that reads `Borrowed` does not make a button, so the count stays equal to the number of `available` books in `mockBooks`.",
                order: 3,
              },
              {
                title: "Check Borrow Actions by Tab",
                content:
                  "The test selects the `Overdue Books` tab, verifies an overdue starter-book title is visible, and checks that no button with the name `Borrow` is present. On `All Books`, it checks that the number of Borrow buttons equals the count of available books. The test does not check a disabled button: it expects no Borrow button in the overdue view.",
                order: 4,
              },
              {
                title: "Reading a Tab by Name",
                content:
                  "A tab is found by role plus accessible name, so the label is what matters:\n\nconst overdueTab = screen.getByRole('tab', { name: /overdue/i });\nfireEvent.click(overdueTab);\n\nAfter that click the overdue table is the one on screen, showing each overdue book's `title` beside text matching `overdue`, and `queryAllByRole('button', { name: /borrow/i })` comes back empty because the conditional branch never renders there.",
                order: 5,
              },
              {
                title: "Practice Lab: Gate the Action",
                content:
                  "Practice the gate on its own: write the predicate that decides whether a row shows Borrow.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement `canBorrow(book)` returning `true` only when `book.status` is `available`.\n\n- `borrowed` returns `false`\n- `overdue` returns `false`\n- a book with no `status` returns `false`\n\nExample: `canBorrow({ status: 'available' })` returns `true`.",
                  language: "javascript",
                  starter_code:
                    "export function canBorrow(book) {\n  // TODO\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO",
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "canBorrow",
                  test_cases: [
                    {
                      input: [{ status: "available" }],
                      expected: true,
                      label: "available books can be borrowed",
                    },
                    {
                      input: [{ status: "borrowed" }],
                      expected: false,
                      label: "borrowed books cannot",
                    },
                    {
                      input: [{ status: "overdue" }],
                      expected: false,
                      label: "overdue books cannot",
                    },
                    {
                      input: [{ title: "1984" }],
                      expected: false,
                      label: "a missing status cannot",
                    },
                  ],
                  hints: [
                    "Compare the book's `status` against the one string that allows the action.",
                    "return book.status === 'available';",
                    "return book.___ === '___';",
                  ],
                },
                order: 6,
              },
              {
                title: "Key Takeaway",
                content:
                  "Available books get one `Borrow` button each in the all-books view, and the overdue view has no Borrow buttons. The tests also require an overdue book title and an overdue indication to remain visible.",
                order: 7,
              },
            ],
          },
          hints: {
            create: [
              {
                description: "In `src/app/dashboard/page.tsx` let the row decide: render the `Borrow` `Button` only when that book's `status` is `available`. Gating on the active tab instead of on the book's `status` leaves the wrong buttons on the wrong table.",
                order: 1,
              },
              {
                description: "Self-check: the overdue tab shows an overdue title and no Borrow buttons; All Books shows one Borrow button per available book.",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Click the Overdue Books tab and verify the first overdue book's title is visible",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Click the Overdue Books tab and verify no Borrow buttons are visible",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Click the Overdue Books tab and verify text matching 'overdue' is visible",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Click the All Books tab and verify the number of Borrow buttons equals the number of available books",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "Verify there are no Borrow buttons in the overdue view and the overdue indication remains visible",
                is_required: true,
                order: 5,
              },
            ],
          },
        },
        {
          task_name: "Confirm Every Action and Persist Books",
          test_type: "both",
          user_story:
            "As a librarian, I want a confirmation before a book is borrowed or returned and my changes kept across a refresh so that no loan happens by accident and none is lost.",
          learning_sections: {
            create: [
              {
                title: "Overview\nConfirmation Dialogs and Persistence",
                content:
                  "This level has two tasks. The first restricts the Borrow action to available books. The second puts a confirmation in front of borrow and return, and moves the books list into `localStorage`.",
                order: 1,
              },
              {
                title: "The Confirmation Dialog",
                content:
                  "`Dialog`, `DialogContent`, `DialogTitle`, `DialogDescription` and `DialogFooter` come from `@/components/ui/dialog`, which takes `open` and `onOpenChange`. Body text reading `Are you sure` plus two buttons covers both actions:\n\n<Dialog open={pending !== null} onOpenChange={setPending}>\n  <DialogContent>\n    <DialogTitle>Confirm</DialogTitle>\n    <DialogDescription>Are you sure?</DialogDescription>\n    <DialogFooter>\n      <Button onClick={() => setPending(null)}>Cancel</Button>\n      <Button onClick={handleConfirm}>Confirm</Button>\n    </DialogFooter>\n  </DialogContent>\n</Dialog>\n\nThe test checks that `Cancel` closes the borrow confirmation by making `Are you sure` disappear. The returns-page test checks confirmation and successful return, but not cancellation on that page.",
                order: 2,
              },
              {
                title: "Labelled Inputs Inside the Dialog",
                content:
                  "The borrow dialog collects who the loan is for. `Label` from `src/components/ui/label.tsx` renders a `label`, and an `id` on the `Input` plus `htmlFor` on the label ties the two together, which is what lets the field be found by its label text:\n\n<Label htmlFor=\"borrower-name\">Borrower Name</Label>\n<Input id=\"borrower-name\" value={borrowerName} onChange={onBorrowerName} />\n\n`Borrower Name` and `Borrower Email` are the two label texts the borrow form must use.",
                order: 3,
              },
              {
                title: "The useLocalStorage Hook",
                content:
                  "One hook in `src/hooks/useLocalStorage.ts` covers read, write and hydrate, and returns a tuple:\n\nfunction useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {\n  const [value, setValue] = useState<T>(() => {\n    const stored = localStorage.getItem(key);\n    return stored ? (JSON.parse(stored) as T) : initialValue;\n  });\n\n  useEffect(() => {\n    localStorage.setItem(key, JSON.stringify(value));\n  }, [key, value]);\n\n  return [value, setValue];\n}\n\nThe lazy initializer reads the key on mount, so a key that already holds JSON wins over `initialValue`. Every call to the setter updates the value and the effect writes the new value back under the same key.",
                order: 4,
              },
              {
                title: "Wiring the Books List",
                content:
                  "The dashboard holds its books with the hook instead of `useState`:\n\nconst [books, setBooks] = useLocalStorage<Book[]>('books', mockBooks);\n\nA confirmed borrow calls `setBooks`, the effect writes the new list to `localStorage` under `books`, and a later mount reads that same key, so the dashboard opens on the stored books rather than on `mockBooks`.",
                order: 5,
              },
              {
                title: "Practice Lab: Store and Read",
                content:
                  "Practice the fallback behaviour the hook depends on: choosing between what is stored and the default.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement `readStored(raw, fallback)` returning the parsed value of `raw`, or `fallback` when `raw` is `null`, an empty string, or does not parse.\n\n- a missing key (`null`) returns `fallback`\n- a stored JSON string is parsed and returned\n- an empty string returns `fallback`\n- an unparseable string returns `fallback`\n\nExample: `readStored(null, [])` returns `[]`.",
                  language: "javascript",
                  starter_code:
                    "export function readStored(raw, fallback) {\n  // TODO\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO",
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "readStored",
                  test_cases: [
                    {
                      input: [null, []],
                      expected: [],
                      label: "missing key returns the fallback",
                    },
                    {
                      input: ["[]", []],
                      expected: [],
                      label: "stored value is parsed and returned",
                    },
                    {
                      input: ['"hello"', "initial"],
                      expected: "hello",
                      label: "a stored string is returned unquoted",
                    },
                    {
                      input: ["", "initial"],
                      expected: "initial",
                      label: "empty string returns the fallback",
                    },
                    {
                      input: ["{oops", "initial"],
                      expected: "initial",
                      label: "unparseable value returns the fallback",
                    },
                  ],
                  hints: [
                    "Guard the parse so a bad stored value cannot throw.",
                    "if (!raw) return fallback; try { return JSON.parse(raw); } catch { return fallback; }",
                    "if (!___) return ___; try { return JSON.___(___); } catch { return ___; }",
                  ],
                },
                order: 6,
              },
              {
                title: "Key Takeaway",
                content:
                  "The Level 4 tests verify that Cancel closes the borrow dialog, Confirm persists a borrow to the `books` key, and `useLocalStorage('books', mockBooks)` restores stored data on mount.",
                order: 7,
              },
            ],
          },
          hints: {
            create: [
              {
                description: "In `src/app/dashboard/page.tsx` and `src/app/returns/page.tsx`, put one `Dialog` in front of `Borrow` and `Return` carrying `Are you sure`, `Cancel` and `Confirm`.",
                order: 1,
              },
              {
                description: "The tests check that Cancel closes the borrow confirmation and that the borrow dialog exposes fields labelled `Borrower Name` and `Borrower Email`; they do not check that cancellation leaves data unchanged or test Cancel on the returns page.",
                order: 2,
              },
              {
                description: "Self-check: `Confirm` leaves a non-null value under the `books` key via `useLocalStorage` from `src/hooks/useLocalStorage`, and a stored `Test Book` then renders.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Click a Borrow button and verify a confirmation dialog appears with 'Are you sure', Cancel, and Confirm buttons",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Click a Return button and verify a confirmation dialog appears with 'Are you sure'",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Click Cancel on the borrow dialog and verify the confirmation closes",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Verify the borrow dialog has labeled fields for Borrower Name and Borrower Email",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "Fill in the borrower fields, click Confirm, and verify the data is saved to localStorage under the 'books' key",
                is_required: true,
                order: 5,
              },
              {
                description:
                  "Pre-populate localStorage with a 'Test Book' and verify it renders on the dashboard page",
                is_required: true,
                order: 6,
              },
              {
                description:
                  "Verify useLocalStorage hook returns [value, setValue] and returns the initial value when nothing is stored",
                is_required: true,
                order: 7,
              },
              {
                description:
                  "Verify calling setValue updates both the value and localStorage",
                is_required: true,
                order: 8,
              },
              {
                description:
                  "Verify useLocalStorage reads existing stored data on mount instead of the initial value",
                is_required: true,
                order: 9,
              },
            ],
          },
        },
      ],
    },
  },
  {
    id: "nextjs-shadcn-ui-level-5",
    title: "Overdue Report Page and Date Utilities",
    subtitle: "Add /overdue with borrower details and a Mark as Returned action, then expose formatDate and isOverdue and document the project",
    order: 5,
    level_description:
      "Mission Briefing: Chasing late books means reading three tables and cross-referencing borrow records by hand. Build an `/overdue` route with each overdue book's title, author, borrower name, borrower email, a `day(s) overdue` indicator and a `Mark as Returned` action. Then implement `formatDate` and `isOverdue` in `src/lib/dateUtils.ts`, write README feature documentation, and add comments across at least 80% of the source files under `src`.",
    xp_reward: 75,
    coin_reward: 200,
    key_takeaways:
      "The borrower name on a book is `book.borrowedBy`, while the borrower email comes from the `mockBorrowRecords` entry whose `bookId` matches. The overdue report test verifies each overdue book's title, author, borrower name and email, looks for text matching `day overdue` or `days overdue`, checks one `Mark as Returned` button per overdue book, and confirms the first clicked item disappears. It does not validate the numeric day count.\n\n`formatDate('2026-01-15')` returns `Jan 15, 2026` and returns an empty string for invalid or empty input. `isOverdue` returns true for a date yesterday, false for a date fourteen days ahead, and false for invalid or empty input.\n\nThe documentation test checks that README contains `library management`, `book` and `feature` and is longer than 100 characters; it also checks that comment markers occur in at least 80% of `.ts` and `.tsx` files under `src`.",
    scenario_id: "nextjs-shadcn-ui-scenario-1",
    tasks: {
      create: [
        {
          task_name: "Build the Overdue Report Page",
          test_type: "both",
          user_story:
            "As a librarian, I want one page listing every overdue book with its borrower and how late it is so that I can chase late loans without cross-referencing two tables.",
          learning_sections: {
            create: [
              {
                title: "Overview\nBuilding the Overdue Report",
                content:
                  "This level has two tasks. The first builds the `/overdue` route. The second moves date formatting and overdue checks into `src/lib/dateUtils.ts` and adds the README and source comments the tests require.",
                order: 1,
              },
              {
                title: "Where the Borrower Details Live",
                content:
                  "The two pieces of borrower data come from different places in `src/lib/mockData.ts`:\n\n- `Book.borrowedBy` holds the borrower's name\n- `BorrowRecord.borrowerEmail` holds the email, reached by finding the record whose `bookId` is the book's `id`\n\nconst record = mockBorrowRecords.find((r) => r.bookId === book.id);\n\nSo a row showing the email has to look the record up rather than read a field on the book.",
                order: 2,
              },
              {
                title: "Days Overdue",
                content:
                  "`BorrowRecord.dueDate` and `Book.dueDate` are date strings. Show a human-readable number with a singular or plural label, such as `1 day overdue` or `5 days overdue`. The test checks that at least one row contains `day overdue` or `days overdue`; it does not validate the numeric calculation, so treat the number as useful UI information rather than a tested requirement.",
                order: 3,
              },
              {
                title: "One Action per Row",
                content:
                  "Every overdue row ends with a `Button` labelled `Mark as Returned`, and only overdue rows are rendered, so the button count equals the overdue book count:\n\n{overdueBooks.map((book) => (\n  <TableRow key={book.id}>\n    <TableCell>{book.title}</TableCell>\n    <TableCell>{book.author}</TableCell>\n    <TableCell>{book.borrowedBy}</TableCell>\n    <TableCell>{record?.borrowerEmail}</TableCell>\n    <TableCell>{daysOverdue} days overdue</TableCell>\n    <TableCell><Button onClick={...}>Mark as Returned</Button></TableCell>\n  </TableRow>\n))}\n\nThe handler sets that book's `status` to `available`, and the page recomputes `overdueBooks` from state, so the row disappears.",
                order: 4,
              },
              {
                title: "Practice Lab: Days Late",
                content:
                  "Practice the pure part of the cell: turn a due date and a reference day into a day count.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement `daysOverdue(dueDate, now)` returning the whole days between `dueDate` and `now`, both `YYYY-MM-DD` strings, using the `YYYY-MM-DD` form rather than the browser's time of day.\n\n- `2026-01-20` against `2026-01-15` is `5`\n- the same due date is `0`\n- a due date in the future is negative\n\nExample: `daysOverdue('2026-01-20', '2026-01-15')` returns `5`.",
                  language: "javascript",
                  starter_code:
                    "export function daysOverdue(dueDate, now) {\n  // TODO\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO",
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "daysOverdue",
                  test_cases: [
                    {
                      input: ["2026-01-20", "2026-01-15"],
                      expected: 5,
                      label: "five days late",
                    },
                    {
                      input: ["2026-01-15", "2026-01-15"],
                      expected: 0,
                      label: "due today is zero",
                    },
                    {
                      input: ["2026-01-10", "2026-01-15"],
                      expected: -5,
                      label: "future due date is negative",
                    },
                  ],
                  hints: [
                    "Read both strings as dates, clear the time of day, then take the difference in milliseconds and divide by the length of a day.",
                    "const due = new Date(`${dueDate}T00:00:00`); const today = new Date(`${now}T00:00:00`); return Math.floor((today - due) / 86400000);",
                    "const due = new Date(`${___}T00:00:00`); const today = new Date(`${___}T00:00:00`); return Math.floor((today - due) / ____);",
                  ],
                },
                order: 5,
              },
              {
                title: "Key Takeaway",
                content:
                  "The report joins `mockBooks` and `mockBorrowRecords` on `bookId`, so both borrower fields appear on the same row. Marking a book returned changes its `status` and the row leaves the table.",
                order: 6,
              },
            ],
          },
          hints: {
            create: [
              {
                description: "Build the route at `src/app/overdue/page.tsx`: one row per `overdue` book in `mockBooks`, showing its `title`, `author` and `borrowedBy`.",
                order: 1,
              },
              {
                description: "The email is not on the book: look it up in `mockBorrowRecords` by matching `bookId` to the book's `id`, and keep the words `days overdue` on the row.",
                order: 2,
              },
              {
                description: "Then give every row one `Mark as Returned` button; the button count must equal the overdue book count, and clicking the first clears that title.",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Create the overdue report page at src/app/overdue/page.tsx showing title and author of all overdue books",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Show the borrower name for each overdue book",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Look up and display the borrower email from mockBorrowRecords for each overdue book",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Show text matching 'day overdue' or 'days overdue' on overdue report rows",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "Add a Mark as Returned button for each overdue book so button count matches overdue book count",
                is_required: true,
                order: 5,
              },
              {
                description:
                  "Click Mark as Returned and verify the book title is removed from the page",
                is_required: true,
                order: 6,
              },
            ],
          },
        },
        {
          task_name: "Add Date Utilities and Documentation",
          test_type: "both",
          user_story:
            "As a developer, I want reusable date utilities and clear project documentation so that dates are handled consistently and future contributors can understand the library app.",
          learning_sections: {
            create: [
              {
                title: "Overview\nDate Utilities and Documentation",
                content:
                  "This level has two tasks. The first builds the `/overdue` route. The second implements `formatDate` and `isOverdue` in `src/lib/dateUtils.ts`, documents the library-management features in README, and adds comments across most TypeScript source files.",
                order: 1,
              },
              {
                title: "One Module, Two Exports",
                content:
                  "`src/lib/dateUtils.ts` is imported by its path, so both functions need named exports from that one file:\n\nexport function formatDate(dateString: string): string { ... }\nexport function isOverdue(dateString: string): boolean { ... }\n\nBoth take a `YYYY-MM-DD` string and nothing else, which keeps them pure and easy to call from a page or a component.",
                order: 2,
              },
              {
                title: "Formatting to Jan 15, 2026",
                content:
                  "The month names are the three-letter English abbreviations joined with the day and year. Parse a date-only string in UTC and use UTC getters so the result does not shift with the machine's timezone:\n\nfunction formatDate(dateString: string): string {\n  const date = parseDate(dateString);\n  if (!date) return '';\n  return `${months[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;\n}\n\n`formatDate('2026-01-15')` gives `Jan 15, 2026` in every timezone.",
                order: 3,
              },
              {
                title: "Parsing That Fails Softly",
                content:
                  "A helper builds the date and reports failure instead of throwing:\n\nfunction parseDate(dateString: string): Date | null {\n  if (!dateString) return null;\n  const date = new Date(dateString);\n  return Number.isNaN(date.getTime()) ? null : date;\n}\n\nBoth public functions go through it, so `formatDate('invalid')` and `formatDate('')` both return the empty string, and `isOverdue('invalid')` and `isOverdue('')` both return `false`.",
                order: 4,
              },
              {
                title: "Comparing Against Today",
                content:
                  "`isOverdue` compares date-only values by calendar day. Normalize both values to UTC midnight (or compare validated `YYYY-MM-DD` strings) so the result does not depend on the machine's timezone. Return `false` for an empty or invalid string. A date one day ago is `true` and a date fourteen days in the future is `false`.",
                order: 5,
              },
              {
                title: "Practice Lab: Safe Date Utils",
                content:
                  "Practice the guard the two utilities share: turning an untrusted string into a date or `null`.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement `parseDate(value)` returning a `Date` for a `YYYY-MM-DD` string, or `null` for anything unusable.\n\n- an empty string returns `null`\n- `invalid` returns `null`\n- `2026-01-15` returns a Date whose year is 2026, month is 0 and day is 15\n\nExample: `parseDate('2026-01-15')` returns a Date, and `parseDate('nope')` returns `null`.",
                  language: "javascript",
                  starter_code:
                    "export function parseDate(value) {\n  // TODO\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO",
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "parseDate",
                  test_cases: [
                    {
                      input: [""],
                      expected: null,
                      label: "empty string is not a date",
                    },
                    {
                      input: ["nope"],
                      expected: null,
                      label: "unparseable text is not a date",
                    },
                    {
                      input: ["2026-01-15"],
                      expected: "2026-01-15T00:00:00.000Z",
                      label: "parses at the start of the day",
                    },
                  ],
                  hints: [
                    "Reject the empty string first, then build the date and reject it if its time value is `NaN`.",
                    "if (!value) return null; const date = new Date(value); return Number.isNaN(date.getTime()) ? null : date;",
                    "if (!value) return null; const date = new Date(value); return Number.isNaN(date.___()) ? null : date;",
                  ],
                },
                order: 6,
              },
              {
                title: "Document the Project",
                content:
                  "Add a README that explains this library-management project and its features. The test checks for text matching `library management`, `book` and `feature`, and requires more than 100 characters. It also scans `.ts` and `.tsx` files under `src` and requires comment markers in at least 80% of those files; add meaningful comments where they clarify non-obvious code.",
                order: 7,
              },
            ],
          },
          hints: {
            create: [
              {
                description: "Export both `formatDate` and `isOverdue` from `src/lib/dateUtils.ts`, each taking a `YYYY-MM-DD` string and failing softly rather than throwing.",
                order: 1,
              },
              {
                description: "`2026-01-15` formats as `Jan 15, 2026`, a past date makes `isOverdue` `true`, and input you cannot read gives an empty string or `false`.",
                order: 2,
              },
              {
                description: "Add README feature documentation containing `library management`, `book` and `feature` (more than 100 characters), and add source comments so at least 80% of `.ts`/`.tsx` files under `src` contain comment markers.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Implement formatDate in src/lib/dateUtils.ts to return 'Jan 15, 2026' for input '2026-01-15'",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Make formatDate return an empty string for invalid input and empty string input",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Implement isOverdue in src/lib/dateUtils.ts to return true for a date one day before today",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Make isOverdue return false for a date fourteen days in the future",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "Make isOverdue return false (not throw) for invalid input and empty string input",
                is_required: true,
                order: 5,
              },
              {
                description:
                  "Add a README longer than 100 characters that documents the library management project, books and its features",
                is_required: true,
                order: 6,
              },
              {
                description:
                  "Include comment markers in at least 80% of TypeScript files under src",
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

