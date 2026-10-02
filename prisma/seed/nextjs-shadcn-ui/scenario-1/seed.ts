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
      "Mission Briefing: The library has onboarded a new developer and needs the system running locally with minor UI tweaks. Set up the Next.js development environment, install dependencies, add the `alert`, `dialog` and `input` shadcn/ui components, and verify the dev server starts cleanly.",
    xp_reward: 10,
    coin_reward: 20,
    key_takeaways:
      "Installing project dependencies with pnpm install ensures all required libraries (React, Next.js, shadcn/ui, Tailwind CSS) are available. Running the dev server verifies the project boots without errors before any feature work begins. Adding shadcn/ui components via the CLI copies them into the project source, giving full ownership and easy customization.\n\nThree components are graded here: `src/components/ui/alert.tsx` with `Alert`, `AlertTitle` and `AlertDescription`, `src/components/ui/dialog.tsx` with `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle` and `DialogDescription`, and `src/components/ui/input.tsx` with `Input` and `forwardRef`.",
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
                  "shadcn/ui is a collection of reusable, accessible UI components built on top of Radix UI and Tailwind CSS. The components are copied directly into the project source, giving full ownership and easy customization.\n\nThe CLI copies one component per run into `src/components/ui/`. `pnpm dlx shadcn@latest add alert` writes `alert.tsx` with `Alert`, `AlertTitle` and `AlertDescription`, `add dialog` writes `dialog.tsx` with `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle` and `DialogDescription`, and `add input` writes `input.tsx` with `Input` built on `forwardRef`. Every export name is what later levels import by name.",
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
                  "Practice adding shadcn/ui components using the CLI. Running the commands below downloads each component's source into the project's `components/ui` folder, where it can be customized.\n\npnpm dlx shadcn@latest add alert\npnpm dlx shadcn@latest add dialog\npnpm dlx shadcn@latest add input",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "TERMINAL_CMD" as const,
                interactive_config: {
                  instructions:
                    "Run the shadcn/ui CLI commands that add the Alert, Dialog and Input components. Type the exact commands and click Check to verify.",
                  expected_commands: [
                    "pnpm dlx shadcn@latest add alert",
                    "pnpm dlx shadcn@latest add dialog",
                    "pnpm dlx shadcn@latest add input",
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
                description: "Run `pnpm dlx shadcn@latest add alert`, `pnpm dlx shadcn@latest add dialog` and `pnpm dlx shadcn@latest add input`; they write `src/components/ui/alert.tsx`, `src/components/ui/dialog.tsx` and `src/components/ui/input.tsx`, and each file must name its exported components.",
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
                  "Add the alert shadcn/ui component using the CLI",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Add the dialog shadcn/ui component using the CLI",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "Add the input shadcn/ui component using the CLI",
                is_required: true,
                order: 5,
              },
            ],
          },
        },
        {
          task_name: "Update UI Text",
          test_type: "both",
          user_story:
            "As a visitor, I want the signup button to read Register so that the page uses the wording the library standardised on.",
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
                  "Changing text in JSX is straightforward — it's just like editing HTML:\n// Before\n<Button>Sign Up</Button>\n// After\n<Button>Register</Button>\n\nThe text has to change everywhere it appears in the file, because a leftover copy inside a comment is stripped before the check and any copy left in live JSX is what a reader still sees.",
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
                description: "Change that label to 'Register', then replace every other 'Sign Up' left in the file outside comments so no occurrence survives.",
                order: 2,
              },
              {
                description: "Save and reload `/signup`; the page should show 'Register' and no 'Sign Up' outside a comment.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Update the signup page button label from 'Sign Up' to 'Register'",
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
                  "Verify the signup page displays 'Register' and no 'Sign Up' text is visible",
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
    title: "Overdue Alert Banner and BookRow Refactor",
    subtitle: "Warn about overdue books at the top of the dashboard, then extract the table row into a BookRow component with memoized collections",
    order: 2,
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: Nothing on the dashboard says that late books exist, so a librarian has to open the overdue tab to find out. Add an overdue warning banner at the top of the dashboard styled as a destructive shadcn Alert, with a link that filters the table to the overdue books, then pull the repeated table row out of `src/app/dashboard/page.tsx` into a `BookRow` component that renders one book and is reused for every row.",
    xp_reward: 25,
    coin_reward: 50,
    key_takeaways:
      "`Alert`, `AlertTitle` and `AlertDescription` come from `src/components/ui/alert.tsx`. The banner is the element with the `alert` role, so the border, background and text classes are read straight off it: `border-l-4`, `border-red-500`, `bg-red-50` and `text-red-900`, and `AlertTitle` renders the level 5 heading.\n\nA `BookRow` component takes a single `book` prop and renders the `title`, `author`, `isbn` and status for that book, so one row can be rendered and inspected on its own. A default export and a named `BookRow` export are both accepted.\n\n`useMemo` imported from `react` wraps at least one of the derived lists, `availableBooks`, `borrowedBooks` or `overdueBooks`, so those filters are not rebuilt on every render.",
    scenario_id: "nextjs-shadcn-ui-scenario-1",
    tasks: {
      create: [
        {
          task_name: "Add an Overdue Books Alert Banner",
          test_type: "both",
          user_story:
            "As a librarian, I want a warning at the top of the dashboard whenever books are overdue so that I notice late loans without hunting for them.",
          learning_sections: {
            create: [
              {
                title: "Overview\nAdding the Overdue Alert Banner",
                content:
                  "This level has two tasks. The first adds an overdue warning banner to the dashboard using the shadcn Alert component. The second extracts the repeated table row into a `BookRow` component and memoizes the derived lists.",
                order: 1,
              },
              {
                title: "The Alert Role",
                content:
                  "`Alert`, `AlertTitle` and `AlertDescription` come from `src/components/ui/alert.tsx`. The wrapper is the element that carries the `alert` role, so it is the element whose classes and text a reader sees first.\n\nRendering the dashboard gives exactly one element with the `alert` role, so put the banner above the `Tabs` rather than inside one `TabsContent`: outside the tabs it is on screen whichever tab is active.",
                order: 2,
              },
              {
                title: "Styling the Warning",
                content:
                  "A destructive warning reads as a thick red rule down the left edge of a pale panel, and the four classes live on the same `Alert` element:\n\n- `border-l-4` for the thick left rule\n- `border-red-500` for the rule colour\n- `bg-red-50` for the pale background\n- `text-red-900` for the dark red text\n\n`AlertTitle` renders a heading at level 5, and its text has to say `overdue`.",
                order: 3,
              },
              {
                title: "Counting and Linking",
                content:
                  "The description carries the count, and a link beside it points at the filtered dashboard so the banner is actionable:\n\nconst overdueCount = books.filter((book) => book.status === 'overdue').length;\n\n<AlertDescription>{overdueCount} overdue books need attention</AlertDescription>\n<Link href=\"/dashboard?status=overdue\">View overdue</Link>\n\nThe link has to render an `a`, because a link is what carries the `link` role, and the `status=overdue` query is what puts the table in its overdue state.",
                order: 4,
              },
              {
                title: "Practice Lab: Banner Text",
                content:
                  "Practice the count the description shows: turn a number of overdue books into one line of text.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement `overdueBannerText(count)` returning the sentence shown in the alert description.\n\n- the text always contains the number then ` overdue book`\n- exactly `1` adds no `s`\n- `0` and any count above `1` add an `s`\n\nExample: `overdueBannerText(2)` returns `2 overdue books`.",
                  language: "javascript",
                  starter_code:
                    "export function overdueBannerText(count) {\n  // TODO\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO",
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "overdueBannerText",
                  test_cases: [
                    {
                      input: [1],
                      expected: "1 overdue book",
                      label: "one overdue book stays singular",
                    },
                    {
                      input: [2],
                      expected: "2 overdue books",
                      label: "two overdue books are plural",
                    },
                    {
                      input: [0],
                      expected: "0 overdue books",
                      label: "none left is still plural",
                    },
                  ],
                  hints: [
                    "Build the sentence from the number and one branch on the count.",
                    "return `${count} overdue book${count === 1 ? '' : 's'}`;",
                    "return `${___} overdue book${___ === 1 ? '___' : '___'}`;",
                  ],
                },
                order: 5,
              },
              {
                title: "Key Takeaway",
                content:
                  "One banner, one `alert` element, four destructive classes, and a heading that says `overdue`. The count comes from the same books list the table reads, and the link takes the reader straight to the overdue view.",
                order: 6,
              },
            ],
          },
          hints: {
            create: [
              {
                description: "Add `Alert`, `AlertTitle` and `AlertDescription` from `@/components/ui/alert` to `src/app/dashboard/page.tsx` and render the banner above the `Tabs`, so it is on screen on every tab.",
                order: 1,
              },
              {
                description: "Put `border-l-4`, `border-red-500`, `bg-red-50` and `text-red-900` on the `Alert` itself, and give the `AlertTitle` text containing `overdue`; the description carries the number and the words `overdue book`.",
                order: 2,
              },
              {
                description: "Finish with a `Link` whose `href` carries `status=overdue` and whose label matches `view overdue`, `filter overdue` or `show overdue`. Keep the words `overdue book` on that one element only, so the description stays the only text match for it.",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Add an overdue books alert banner to the dashboard page above the tabs",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Style the alert banner with a thick red left border, pale pink background, and dark red text",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Add a heading to the alert banner containing the word 'overdue'",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Include the overdue book count and the words 'overdue book' in the alert description",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "Add a link labeled 'View overdue', 'Filter overdue', or 'Show overdue' that navigates to the dashboard filtered to overdue books",
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
                  "This level has two tasks. The first adds the overdue alert banner to the dashboard. The second pulls the inline table row out of `src/app/dashboard/page.tsx` into its own component file and wraps the derived lists in `useMemo`.",
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
                description: "In `src/app/dashboard/page.tsx` render `<BookRow book={book} />` for each book, keeping the titles and both counts on screen, and wrap at least one of `availableBooks`, `borrowedBooks` or `overdueBooks` in `useMemo` imported from `react`.",
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
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: Librarians cannot find a book on a list of eight without reading every row, and there is nowhere to process a return. Add a search input to the dashboard that filters by title and author, and add a `/returns` page that lists the borrowed books and takes one through a confirmation before the book leaves the list.",
    xp_reward: 40,
    coin_reward: 100,
    key_takeaways:
      "A controlled `Input` carries a `placeholder` of `Search books...` and an `onChange` that writes each keystroke to state, so the visible list follows the query.\n\nFiltering matches the lowercased query against `book.title` and `book.author`, which is what makes a lowercase search term still find `Orwell`.\n\nA new App Router route is a folder plus a `page.tsx`, and a return that is confirmed in a dialog removes the book from the borrowed list.",
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
                  "`Input` from `src/components/ui/input.tsx` forwards its props to the underlying `input`. Driving its `value` from state and writing back in `onChange` is what makes it controlled:\n\nconst [query, setQuery] = useState('');\n\n<Input\n  placeholder=\"Search books...\"\n  value={query}\n  onChange={(e) => setQuery(e.target.value)}\n/>\n\n`placeholder=\"Search books...\"` is the visible hint a reader sees before typing, and it is matched case-insensitively by `getByPlaceholderText(/search books/i)`. The sizing classes are passed in as `className` and land on the same `input`: `h-10`, `px-3`, `rounded-md`, `border`, `focus:outline-none` and `focus:ring-2`.",
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
                description: "In `src/app/dashboard/page.tsx` import `Input` from `@/components/ui/input`, hold the search term in state and feed it to the `Input` through `onChange`, with the `placeholder` reading `Search books...`.",
                order: 1,
              },
              {
                description: "Pass `className` on that `Input` so the element carries `h-10`, `px-3`, `rounded-md`, `border`, `focus:outline-none` and `focus:ring-2`, and filter the list by comparing the lowercased term against `book.title` and `book.author`.",
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
                  "Style the search box using the shared Input component with proper sizing, border, and focus ring",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Import the shared Input component in the dashboard page",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Filter the book list by title when typing in the search box",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "Filter the book list by author when typing in the search box",
                is_required: true,
                order: 5,
              },
              {
                description:
                  "Make the search case-insensitive so lowercase queries still find matching books",
                is_required: true,
                order: 6,
              },
              {
                description:
                  "Show 'No books found' message when the search returns no results",
                is_required: true,
                order: 7,
              },
              {
                description:
                  "Verify all book titles are visible before any search is performed",
                is_required: true,
                order: 8,
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
                  "Clicking `Return` sets `pendingBook`, which opens the confirmation. `Dialog`, `DialogContent`, `DialogTitle`, `DialogDescription` and `DialogFooter` are imported from `@/components/ui/dialog`, and the body text carries `Are you sure`.\n\nThe open dialog is the element with the `dialog` role, and it has to carry `aria-modal=\"true\"`, because that is what tells assistive technology the rest of the page is blocked while it is open. `DialogTitle` renders the heading inside it.\n\nThe `Confirm` button is the only place the state changes:\n\nconst handleConfirm = () => {\n  setBooks((prev) =>\n    prev.map((book) =>\n      book.id === pendingBook.id ? { ...book, status: 'available' } : book\n    )\n  );\n  setPendingBook(null);\n};\n\nBecause the page recomputes `borrowedBooks` from `books`, the returned book drops out of the table on its own, and `Cancel` only sets `pendingBook` back to `null`, which unmounts the dialog without touching the list.",
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
                description: "Opening the confirmation shows `Are you sure` inside an element with the `dialog` role whose `aria-modal` attribute is `true`, only `Confirm` turns that book to `available` so its title leaves the page, and `Cancel` closes the dialog again.",
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
                  "Open a confirmation dialog when clicking Return that blocks the rest of the page",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "Show 'Are you sure' with Confirm and Cancel buttons in the confirmation dialog",
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
                  "Close the dialog without changes when Cancel is clicked",
                is_required: true,
                order: 7,
              },
              {
                description:
                  "Build the confirmation dialog using the shared dialog component.",
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
    id: "nextjs-shadcn-ui-level-4",
    title: "Borrow Validation and Confirmation with Persistence",
    subtitle: "Offer Borrow only on available books, confirm every borrow and return, and keep books in localStorage through a useLocalStorage hook",
    order: 4,
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: A librarian can still act on a book that should be off limits, and every action goes through unchecked. Restrict the dashboard to one `Borrow` button per available book so the overdue tab offers none, keep the destructive `Alert` banner readable on that tab, put an `Are you sure` confirmation with `Cancel` and `Confirm` in front of both borrow and return, and back the books list with a `useLocalStorage` hook so a refresh keeps the data.",
    xp_reward: 60,
    coin_reward: 150,
    key_takeaways:
      "The Borrow button is offered by the row, not by the page, so a tab showing only `overdue` books renders zero `Borrow` buttons while `All Books` renders exactly one per `available` book.\n\nThe `Alert` from `@/components/ui/alert` sits above the `Tabs`, so it is the single `alert` element on screen on the overdue tab as well, and its `AlertTitle` is the page's single level 5 heading.\n\n`Dialog` from `@/components/ui/dialog` carries the `Are you sure` body text plus `Cancel` and `Confirm`, and cancelling closes it without touching state.\n\n`useLocalStorage(key, initialValue)` in `src/hooks/useLocalStorage.ts` returns a `[value, setValue]` tuple: the initial value when the key is empty, the stored value when it is not, and every setter call writes the value back as JSON.",
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
                  "This level has two tasks. The first decides which rows offer a Borrow action and warns about overdue books. The second puts a confirmation in front of borrow and return, and moves the books list into `localStorage`.",
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
                title: "The Overdue Warning",
                content:
                  "The overdue view also has to say out loud that something is wrong. The destructive banner from the dashboard banner already does that, and because it sits above the `Tabs` it is still on screen once the overdue tab is active, which is what the check looks for.\n\nThe four classes live on the `Alert` element itself: `border-l-4`, `border-red-500`, `bg-red-50` and `text-red-900`. `AlertTitle` renders a heading at level 5, and its text has to contain `overdue`. Keep it to one banner on the page, so there is a single `alert` element and a single level 5 heading.",
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
                  "The gate belongs on the row. Available books get one `Borrow` button each, and the overdue tab renders none, because every cell on that table is overdue. The destructive `Alert` is what makes the tab itself say so.",
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
                description: "Reuse the one overdue banner you already built, above the `Tabs` so it is still on screen on the overdue tab, and keep it as the page's only `alert` element and only level 5 heading.",
                order: 2,
              },
              {
                description: "Self-check: on the `Overdue Books` tab nothing matches `/borrow/i` and the destructive `Alert` is on screen, while on `All Books` the count equals the available books in `mockBooks`.",
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
                  "Click the Overdue Books tab and verify exactly one alert element is shown with the four destructive styling classes",
                is_required: true,
                order: 5,
              },
              {
                description:
                  "Click the Overdue Books tab and verify exactly one level 5 heading is shown with text matching 'overdue'",
                is_required: true,
                order: 6,
              },
              {
                description:
                  "Verify the dashboard page imports Alert components.",
                is_required: true,
                order: 7,
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
                  "`Dialog`, `DialogContent`, `DialogTitle`, `DialogDescription` and `DialogFooter` come from `@/components/ui/dialog`, which takes `open` and `onOpenChange`. Body text reading `Are you sure` plus two buttons covers both actions:\n\n<Dialog open={pending !== null} onOpenChange={setPending}>\n  <DialogContent>\n    <DialogTitle>Confirm</DialogTitle>\n    <DialogDescription>Are you sure?</DialogDescription>\n    <DialogFooter>\n      <Button onClick={() => setPending(null)}>Cancel</Button>\n      <Button onClick={handleConfirm}>Confirm</Button>\n    </DialogFooter>\n  </DialogContent>\n</Dialog>\n\n`Cancel` sets the pending action back to `null`, which closes the dialog and leaves the books untouched. The same dialog is used by the `Return` button on `src/app/returns/page.tsx`.",
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
                  "Nothing changes until `Confirm` is pressed, and cancelling puts nothing back. `useLocalStorage('books', mockBooks)` then makes that change survive the next mount.",
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
                description: "Easiest to get wrong: `Cancel` must close the dialog and leave the list untouched, and the dialog needs the labelled `Borrower Name` and `Borrower Email` fields.",
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
                  "Click Cancel on the borrow dialog and verify the dialog closes without changes",
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
    subtitle: "Add /overdue with borrower details and a Mark as Returned action, expose formatDate and isOverdue from src/lib/dateUtils, and open a book details dialog from the dashboard",
    order: 5,
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: Chasing late books means reading three tables and cross-referencing the borrow records by hand. Build an `/overdue` route that shows each overdue book's title, author, borrower name, borrower email and how many days late it is, with a `Mark as Returned` action that clears the row, move the date work into `src/lib/dateUtils.ts` behind `formatDate` and `isOverdue`, and turn a click on a dashboard row into a `Book Details` dialog.",
    xp_reward: 75,
    coin_reward: 200,
    key_takeaways:
      "The borrower name on a book is `book.borrowedBy` and the borrower email comes from the `mockBorrowRecords` entry whose `bookId` matches, which is why both live in different arrays.\n\n`formatDate('2026-01-15')` returns `Jan 15, 2026` and returns an empty string for `'invalid'` and for `''`; `isOverdue` compares a `YYYY-MM-DD` string against today and returns `false` rather than throwing on input it cannot parse.\n\nThe dashboard imports the `Dialog` family from `@/components/ui/dialog` and opens it from a row click, with a `DialogTitle` reading `Book Details` rendered as a level 2 heading and a close button whose accessible name matches `close`.",
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
                  "This level has two tasks. The first builds the `/overdue` route. The second moves the date work into `src/lib/dateUtils.ts` and opens a book details dialog from the dashboard.",
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
                  "`BorrowRecord.dueDate` and `Book.dueDate` are `YYYY-MM-DD` strings, so the difference against today is a plain subtraction:\n\nconst daysOverdue = Math.floor(\n  (Date.now() - new Date(book.dueDate!).getTime()) / 86400000\n);\n\nThe row text keeps the word `days overdue`, for example `5 days overdue`, which is what a reader scans the column for.",
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
                  "Show 'days overdue' text for each overdue book row",
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
          task_name: "Add Date Utilities and the Book Details Dialog",
          test_type: "both",
          user_story:
            "As a developer, I want `formatDate` and `isOverdue` in `src/lib/dateUtils.ts` and a book details dialog on the dashboard so that date handling is shared and I can read a book's details without leaving the page.",
          learning_sections: {
            create: [
              {
                title: "Overview\nDate Utilities and the Book Details Dialog",
                content:
                  "This level has two tasks. The first builds the `/overdue` route. The second extracts `formatDate` and `isOverdue` into `src/lib/dateUtils.ts` and turns a click on a dashboard row into a dialog.",
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
                  "The month names are the three-letter English abbreviations joined with the day and year:\n\nconst months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];\n\nfunction formatDate(dateString: string): string {\n  const date = parseDate(dateString);\n  if (!date) return '';\n  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;\n}\n\n`formatDate('2026-01-15')` gives `Jan 15, 2026`.",
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
                  "`isOverdue` only cares whether the date is in the past, so both sides are read at the start of their day:\n\nfunction isOverdue(dateString: string): boolean {\n  const date = parseDate(dateString);\n  if (!date) return false;\n  const today = new Date();\n  today.setHours(0, 0, 0, 0);\n  return date.getTime() < today.getTime();\n}\n\nA date one day ago is `true` and a date well in the future is `false`.",
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
                title: "Opening the Dialog From a Row",
                content:
                  "The `dialog.tsx` added in Level 1 is reused here. `src/app/dashboard/page.tsx` imports `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription` and `DialogFooter` from `@/components/ui/dialog`, and the row becomes the trigger:\n\nconst [selectedBook, setSelectedBook] = useState<Book | null>(null);\n\n<TableRow onClick={() => setSelectedBook(book)}>\n\n<Dialog open={selectedBook !== null} onOpenChange={(open) => !open && setSelectedBook(null)}>\n  <DialogContent>\n    <DialogHeader>\n      <DialogTitle>Book Details</DialogTitle>\n      <DialogDescription>{selectedBook?.title}</DialogDescription>\n    </DialogHeader>\n    <DialogFooter>\n      <Button onClick={() => setSelectedBook(null)}>Close</Button>\n    </DialogFooter>\n  </DialogContent>\n</Dialog>\n\n`DialogTitle` renders the heading, and the close button is what a reader presses to dismiss the dialog without borrowing anything.",
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
                description: "In `src/app/dashboard/page.tsx` import from `@/components/ui/dialog`, open the dialog on a row click, and give it a `Book Details` title plus a `Close` button so the level 2 heading and the close control are both there.",
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
                  "Verify Dialog Page exists and exports Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, and DialogDescription",
                is_required: true,
                order: 6,
              },
              {
                description:
                  "Click a table row on the dashboard and verify a dialog opens",
                is_required: true,
                order: 7,
              },
              {
                description:
                  "Verify the open dialog shows a level 2 heading with text matching 'Book Details'",
                is_required: true,
                order: 8,
              },
              {
                description:
                  "Verify the open dialog has a Close button",
                is_required: true,
                order: 9,
              },
              {
                description:
                  "Verify the dashboard page imports Dialog components.",
                is_required: true,
                order: 10,
              },
            ],
          },
        },
      ],
    },
  },
];

