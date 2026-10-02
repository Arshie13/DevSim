export const scenarios = [
  {
    id: "nextjs-shadcn-ui-scenario-3",
    name: "Riverside University Student Portal",
    description:
      "Build a student portal for Riverside University using Next.js and shadcn/ui. Students view grades, schedule, fees, and write personal notes with client-side persistence.",
    difficulty: "intermediate",
    is_paywalled: true,
  },
];

export const levels = [
  {
    id: "nextjs-shadcn-ui-scenario-3-level-1",
    title: "Onboarding the Student Portal",
    subtitle: "Install dependencies, add four shadcn/ui primitives, and fix the login button copy",
    order: 1,
    level_description:
      "Mission Briefing: Riverside University has onboarded a new developer and the student portal has to run on their machine before any feature work starts. Install the project dependencies with `pnpm install` and confirm `pnpm dev` prints `ready` or `Local:`. Then add four shadcn/ui components to the project source: `src/components/ui/alert.tsx` naming `Alert`, `AlertTitle` and `AlertDescription`; `src/components/ui/dropdown-menu.tsx` naming `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuSeparator`, `DropdownMenuLabel` and `DropdownMenuGroup`; `src/components/ui/collapsible.tsx` naming `Collapsible`, `CollapsibleTrigger` and `CollapsibleContent`; and `src/components/ui/dialog.tsx` naming `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription` and `DialogFooter`. Finally update `src/app/login/page.tsx` so the submit button reads `Log In` and the old `Sign In` copy is gone.",
    xp_reward: 10,
    coin_reward: 20,
    key_takeaways:
      "A project only counts as set up once `node_modules/next` and `node_modules/react` exist on disk and `pnpm dev` prints `ready` or `Local:`. shadcn/ui components are copied into `src/components/ui/`, so the graded check is that each of `alert.tsx`, `dropdown-menu.tsx`, `collapsible.tsx` and `dialog.tsx` exists and names the identifiers listed for it; three of those four files are reused by later levels. Branding copy is graded from source: `src/app/login/page.tsx` must contain `Log In` and must not contain `Sign In` once comments are stripped.",
    scenario_id: "nextjs-shadcn-ui-scenario-3",
    tasks: {
      create: [
        {
          task_name: "Dependencies and shadcn/ui Primitives",
          test_type: "both",
          user_story:
            "As a developer, I want the portal dependencies installed, the four shadcn/ui components this project builds on copied into `src/components/ui/`, and `pnpm dev` booting so that the rest of the levels have a project that actually runs.",
          learning_sections: {
            create: [
              {
                title: "Overview\nGetting the Portal Running Locally",
                content:
                  "This level works on three things, all checked from the command line and the filesystem: dependencies are installed, the four shadcn/ui components this project relies on are present in the project source, and the Next.js dev server starts. Nothing here touches application features.",
                order: 1,
              },
              {
                title: "Installing Dependencies",
                content:
                  "The project ships a `package.json` and a `pnpm-lock.yaml`. Running `pnpm install` at the project root downloads every listed dependency into a `node_modules` directory at that same root.\n\nThe graded check is that three paths exist:\nnode_modules\nnode_modules/next\nnode_modules/react\n\nIf `node_modules/next` is missing, the install did not finish.",
                order: 2,
              },
              {
                title: "Adding the shadcn/ui Components",
                content:
                  "shadcn/ui components are copied into your own source instead of installed as a package, and this project needs four of them. Each is checked by reading its file from disk and looking for the names below.\n\nsrc/components/ui/alert.tsx names `Alert`, `AlertTitle` and `AlertDescription`.\nsrc/components/ui/dropdown-menu.tsx names `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuSeparator`, `DropdownMenuLabel` and `DropdownMenuGroup`.\nsrc/components/ui/collapsible.tsx names `Collapsible`, `CollapsibleTrigger` and `CollapsibleContent`.\nsrc/components/ui/dialog.tsx names `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription` and `DialogFooter`.\n\nOne command adds all four:\npnpm dlx shadcn@latest add alert dropdown-menu collapsible dialog\n\nThe dropdown menu is used by the dashboard header in the last level, the collapsible by the semester accordion in level two, and the dialog by the document request flow in level four.",
                order: 3,
              },
              {
                title: "Starting the Dev Server",
                content:
                  "`pnpm dev` starts the Next.js development server. The graded check spawns it in the project root and watches both stdout and stderr for text matching `/ready|Local:/i`. It gives the process 30 seconds to print that text.\n\nIf the process exits with a non-zero code before printing it, the check fails. A server that crashes on boot does not count as started.",
                order: 4,
              },
              {
                title: "Practice Lab: Installed Dependency Check",
                content:
                  "Practice the small pure function you would use to check an install manifest before spawning anything.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement `hasDependency(deps, name)` returning `true` when the object `deps` has its own key `name`, otherwise `false`.",
                  language: "typescript",
                  starter_code:
                    "export function hasDependency(deps: Record<string, string>, name: string): boolean {\n  // TODO\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO",
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "hasDependency",
                  test_cases: [
                    {
                      input: [{ next: "15.0.0", react: "19.0.0" }, "next"],
                      expected: true,
                      label: "next is listed",
                    },
                    {
                      input: [{ next: "15.0.0" }, "react"],
                      expected: false,
                      label: "react is missing",
                    },
                  ],
                  hints: [
                    "Use Object.prototype.hasOwnProperty.",
                    "return Object.prototype.hasOwnProperty.call(deps, name);",
                    "return Object.prototype.hasOwnProperty.call(___, ___);",
                  ],
                },
                order: 5,
              },
              {
                title: "Key Takeaway",
                content:
                  "The checks in this level are: `node_modules` with `next` and `react` inside it, a dev server that prints `ready` or `Local:` within 30 seconds without a non-zero exit, and four files in `src/components/ui/` whose source names `Alert`, `AlertTitle`, `AlertDescription`, the seven `DropdownMenu` names, `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent`, `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription` and `DialogFooter`.",
                order: 6,
              },
            ],
          },
          hints: {
            create: [
              {
                description: "Run `pnpm install` in the project root so `node_modules/`, `node_modules/next` and `node_modules/react` all exist.",
                order: 1,
              },
              {
                description: "Run `pnpm dlx shadcn@latest add alert dropdown-menu collapsible dialog` so `src/components/ui/alert.tsx`, `src/components/ui/dropdown-menu.tsx`, `src/components/ui/collapsible.tsx` and `src/components/ui/dialog.tsx` are all written.",
                order: 2,
              },
              {
                description: "Run `pnpm dev` in the project root and leave it running until the output matches `/ready|Local:/i` within 30 seconds.",
                order: 3,
              },
              {
                description: "Work through them in that order from the project root: install, add the four components, then start the server and leave it up.",
                order: 4,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Install project dependencies in the project root",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Run the development server and verify it starts successfully (prints 'ready' or 'Local:')",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Add the alert shadcn/ui component using the CLI and verify it exports Alert, AlertTitle, and AlertDescription",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Add the dropdown-menu shadcn/ui component using the CLI and verify it exports DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel, and DropdownMenuGroup",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "Add the collapsible shadcn/ui component using the CLI and verify it exports Collapsible, CollapsibleTrigger, and CollapsibleContent",
                is_required: true,
                order: 5,
              },
              {
                description:
                  "Add the dialog shadcn/ui component using the CLI and verify it exports Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, and DialogFooter",
                is_required: true,
                order: 6,
              },
            ],
          },
        },
        {
          task_name: "Login Button Branding",
          test_type: "both",
          user_story:
            "As a student, I want the login page to say `Log In` so that the portal wording matches the rest of the product.",
          learning_sections: {
            create: [
              {
                title: "Overview\nOne Verb, Two States",
                content:
                  "A submit button has an idle state and a loading state, and both use the same verb. This level changes the login page copy so the idle label is `Log In` and the loading label is built from the same verb.",
                order: 1,
              },
              {
                title: "Where the Copy Lives",
                content:
                  "The login form is a client component at `src/app/login/page.tsx`. The submit button currently renders a ternary:\n\n{isLoading ? 'Signing in...' : 'Sign In'}\n\nBoth strings are in that file, so both have to change together.",
                order: 2,
              },
              {
                title: "How the Check Reads the File",
                content:
                  "The check reads `src/app/login/page.tsx` as text, strips `//` line comments and `/* */` block comments, then asserts two things on the remaining source: it contains `Log In`, and it does not contain `Sign In`.\n\n`Sign in to access your academic information` is a different string and is not matched, because the comparison is case sensitive.",
                order: 3,
              },
              {
                title: "Deriving the Loading Label",
                content:
                  "Building both labels from one constant keeps them from drifting again:\n\nconst LOGIN_VERB = 'Log In';\nconst loadingLabel = `Logging In...`;\n\nOnce the literal `Sign In` is gone from the file, the check passes.",
                order: 4,
              },
              {
                title: "Practice Lab: Login Button Label",
                content:
                  "Practice deriving both button states from a single verb.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement `getLoginButtonLabel(isLoading)` returning `Log In` when `isLoading` is `false` and `Logging In...` when it is `true`.",
                  language: "typescript",
                  starter_code:
                    "export function getLoginButtonLabel(isLoading: boolean): string {\n  // TODO\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO",
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "getLoginButtonLabel",
                  test_cases: [
                    {
                      input: [false],
                      expected: "Log In",
                      label: "idle label",
                    },
                    {
                      input: [true],
                      expected: "Logging In...",
                      label: "loading label",
                    },
                  ],
                  hints: [
                    "Branch on the boolean argument.",
                    "return isLoading ? 'Logging In...' : 'Log In';",
                    "return isLoading ? '___' : '___';",
                  ],
                },
                order: 5,
              },
              {
                title: "Key Takeaway",
                content:
                  "The graded contract is a single file: `src/app/login/page.tsx` contains `Log In` and no longer contains `Sign In` once comments are removed.",
                order: 6,
              },
            ],
          },
          hints: {
            create: [
              {
                description: "In `src/app/login/page.tsx`, replace the submit button label `Sign In` with `Log In` in the `isLoading ? ... : ...` expression.",
                order: 1,
              },
              {
                description: "Change the loading label `Signing in...` to `Logging In...` so both states use the same verb.",
                order: 2,
              },
              {
                description: "Search `src/app/login/page.tsx` for any remaining capitalised `Sign In` outside comments and remove it.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Update the login page submit button label from 'Sign In' to 'Log In'",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Update the loading label from 'Signing in...' to 'Logging In...'",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Remove all remaining instances of 'Sign In' from the login page source (outside of comments)",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Verify the login page shows 'Log In' and 'Logging In...' and no 'Sign In' text is visible",
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
    id: "nextjs-shadcn-ui-scenario-3-level-2",
    title: "Warning the Student and Collapsing the Grades Table",
    subtitle: "Add an academic probation `Alert` banner to the standing page, and a `SemesterGroup` accordion for the grades page",
    order: 2,
    level_description:
      "Mission Briefing: the standing page prints a `Good Standing` badge with no warning about what the three tiers mean and no way to act on them. Put a shadcn/ui `Alert` banner at the top of `src/app/dashboard/standing/page.tsx`, carrying a level 5 title, the GPA threshold the student has to clear, and a link to an advisor meeting. Then build `src/components/SemesterGroup.tsx` on the shadcn/ui `Collapsible` component added in level one and use it in the All Semesters tab of `src/app/dashboard/grades/page.tsx` to render one group per unique `(semester, academicYear)` pair, with the first group open.",
    xp_reward: 25,
    coin_reward: 50,
    key_takeaways:
      "A live region is what makes an `Alert` announce itself: the shadcn/ui `Alert` primitive renders the `alert` role, and the destructive styling the standing banner needs is four extra Tailwind classes, `border-l-4`, `border-red-500`, `bg-red-50` and `text-red-900`. An accordion trigger built on shadcn/ui `Collapsible` is a real `button` whose accessible name is its `title` prop and whose `aria-expanded` flips from `false` to `true` on click, or starts `true` when `defaultOpen` is passed; each trigger also carries `flex`, `w-full`, `items-center`, `justify-between`, `py-2`, `px-4`, `rounded-md` and `hover:bg-accent`. Grouping the All Semesters tab by the pair `(semester, academicYear)` produces exactly two triggers for the shipped mock data, `1st Semester — 2025-2026` and `2nd Semester — 2024-2025`.",
    scenario_id: "nextjs-shadcn-ui-scenario-3",
    tasks: {
      create: [
        {
          task_name: "Academic Probation Alert Banner",
          test_type: "both",
          user_story:
            "As a student, I want a prominent warning banner at the top of the standing page that names my probation status, the GPA I have to clear and where to book an advisor meeting, so that I know what I have to fix.",
          learning_sections: {
            create: [
              {
                title: "Overview\nA Live Region, Not Just Styling",
                content:
                  "The standing page at `src/app/dashboard/standing/page.tsx` renders a status badge and nothing else about what the tiers mean. This task adds a banner at the top of that page, built from the shadcn/ui `Alert` primitive installed in level one.",
                order: 1,
              },
              {
                title: "The alert Role",
                content:
                  "The shadcn/ui `Alert` component renders its wrapper with `role='alert'`, which is a live region: assistive technology announces the banner when it appears. Because the role comes from the primitive, the banner has to be an `Alert` element rather than a plain `div`.\n\n<Alert className='border-l-4 border-red-500 bg-red-50 text-red-900'>\n  ...\n</Alert>\n\nThe check queries the rendered page with the `alert` role, so anything that does not carry that role is invisible to it.",
                order: 2,
              },
              {
                title: "The Destructive Styling",
                content:
                  "Four Tailwind classes carry the whole visual treatment and each is checked by name on the `alert` element:\n\nborder-l-4\nborder-red-500\nbg-red-50\ntext-red-900\n\n`border-l-4` plus a red border colour gives the thick left rule, `bg-red-50` the tinted panel, and `text-red-900` the readable text colour.",
                order: 3,
              },
              {
                title: "The Heading Level",
                content:
                  "Inside the banner the title is a real `heading` element at level 5, and its text mentions probation or academic standing:\n\n<AlertTitle asChild><h5>Academic Probation Warning</h5></AlertTitle>\n\nThe page already has an `h1` for the page title and the card titles around it, so the banner deliberately sits one level below the card headings rather than competing with the `h1`.",
                order: 4,
              },
              {
                title: "The GPA Line and the Advisor Link",
                content:
                  "The banner body states the GPA situation and the threshold the student has to clear, so a single element in the banner carries text about GPA or grade points together with `2.0` or the words minimum or required.\n\nIt also carries a real `link` for booking the meeting, so the student has somewhere to go from the warning. Its accessible name mentions an advisor, scheduling or a meeting, and its `href` points at an advisor or scheduling destination.",
                order: 5,
              },
              {
                title: "Practice Lab: Tier Thresholds",
                content:
                  "Practice the pure function that maps an academic status to the GPA threshold it has to clear.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement `gpaThresholdFor(status)` returning `3.0` for `good`, `2.5` for `warning` and `2.0` for `probation`, and `null` for anything else.",
                  language: "typescript",
                  starter_code:
                    "export function gpaThresholdFor(status: string): number | null {\n  // TODO\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO",
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "gpaThresholdFor",
                  test_cases: [
                    {
                      input: ["good"],
                      expected: 3,
                      label: "good standing threshold",
                    },
                    {
                      input: ["warning"],
                      expected: 2.5,
                      label: "warning threshold",
                    },
                    {
                      input: ["probation"],
                      expected: 2,
                      label: "probation threshold",
                    },
                    {
                      input: ["unknown"],
                      expected: null,
                      label: "unknown status",
                    },
                  ],
                  hints: [
                    "Use a plain object keyed by status.",
                    "const table: Record<string, number> = { good: 3.0, warning: 2.5, probation: 2.0 }; return table[status] ?? null;",
                    "const table: Record<string, number> = { good: ___, warning: ___, probation: ___ }; return table[status] ?? ___;",
                  ],
                },
                order: 6,
              },
              {
                title: "Key Takeaway",
                content:
                  "The banner is an `Alert` with `role='alert'`, the classes `border-l-4 border-red-500 bg-red-50 text-red-900`, a level 5 heading naming probation, a line stating the GPA threshold and a link to book an advisor meeting.",
                order: 7,
              },
            ],
          },
          hints: {
            create: [
              {
                description: "Import `Alert`, `AlertTitle` and `AlertDescription` from `@/components/ui/alert` at the top of `src/app/dashboard/standing/page.tsx` and render the banner above the status card.",
                order: 1,
              },
              {
                description: "Put `border-l-4`, `border-red-500`, `bg-red-50` and `text-red-900` on the `Alert` itself, and make the title a level 5 heading whose text mentions probation or academic standing.",
                order: 2,
              },
              {
                description: "In the body, state the GPA threshold using `2.0` or the words minimum or required, and add a real `link` to an advisor or scheduling destination.",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Add an Alert banner to the top of the standing page with alert role",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Style the Alert with border-l-4, border-red-500, bg-red-50, and text-red-900 classes",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Add a level 5 heading in the Alert mentioning probation or academic standing",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Include GPA threshold text (mentioning GPA/grade point and 2.0/minimum/required) in the Alert body",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "Add a link in the Alert for booking an advisor meeting (accessible name mentions advisor/schedule/meeting, href matches advisor/schedule)",
                is_required: true,
                order: 5,
              },
              {
                description:
                  "Import Alert components in the standing page",
                is_required: true,
                order: 6,
              },
            ],
          },
        },
        {
          task_name: "SemesterGroup Accordion on the shadcn Collapsible",
          test_type: "both",
          user_story:
            "As a student, I want the All Semesters tab collapsed into one expandable group per term, built on the shadcn `Collapsible` component, so that I can open only the term I care about.",
          learning_sections: {
            create: [
              {
                title: "Overview\nA Collapsible Section",
                content:
                  "`SemesterGroup` takes a `title` string, an optional `defaultOpen` boolean, and `children`. It renders one `button` for the title and a body region that holds the children.\n\nIt is built on the shadcn/ui `Collapsible` component installed in level one, so `src/components/SemesterGroup.tsx` imports `Collapsible`, `CollapsibleTrigger` and `CollapsibleContent` from `@/components/ui/collapsible` and nests the trigger and the body inside them.",
                order: 1,
              },
              {
                title: "The Trigger Button",
                content:
                  "The trigger is a real `button` element, not a `div` with an onClick. Its accessible name is the `title` prop, so `<SemesterGroup title='Section A'>` is queried with the name `Section A`.\n\nIt also carries the expansion state and the full-width header row layout:\n\n<CollapsibleTrigger className='flex w-full items-center justify-between py-2 px-4 rounded-md hover:bg-accent'>\n\nWithout `defaultOpen`, the expanded state starts `false`, so `aria-expanded` starts `false`.",
                order: 2,
              },
              {
                title: "Conditional Body",
                content:
                  "The body is not rendered at all while collapsed. The children sit inside the `CollapsibleContent` region, which stays out of the tree until the trigger reports that it is open:\n\n<CollapsibleContent>{children}</CollapsibleContent>\n\nThat is why the child text is absent from the document before the click and present after it. Hiding with a class alone would leave the text queryable, so the content has to be unmounted while collapsed.",
                order: 3,
              },
              {
                title: "The defaultOpen Prop",
                content:
                  "`defaultOpen` seeds the initial state instead of forcing it. `<SemesterGroup title='Default Open' defaultOpen>` renders its children on the first paint and its button starts with `aria-expanded='true'`.\n\nThe initial state is `useState(defaultOpen)`, so passing nothing means `undefined`, which is falsy.",
                order: 4,
              },
              {
                title: "Grouping the Grades Table",
                content:
                  "In `src/app/dashboard/grades/page.tsx`, the All Semesters `TabsContent` is replaced by a map over the unique `(semester, academicYear)` pairs in the `grades` array from `src/lib/mockData.ts`. Each group title is the semester name, an em dash, then the academic year.\n\nThe first group is the only one that gets `defaultOpen`, so exactly one trigger starts expanded and the rest start collapsed. Both triggers have to land in the content of the `All Semesters` `tab`, because the check switches to that tab before it queries the buttons.",
                order: 5,
              },
              {
                title: "Practice Lab: Semester Group Title",
                content:
                  "Practice the pure function that builds the group title and the grouping key.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement `formatSemesterTitle(semester, academicYear)` returning the semester name, a single em dash surrounded by spaces, then the academic year. Example: `formatSemesterTitle('1st Semester', '2025-2026')` returns `1st Semester — 2025-2026`.",
                  language: "typescript",
                  starter_code:
                    "export function formatSemesterTitle(semester: string, academicYear: string): string {\n  // TODO\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO",
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "formatSemesterTitle",
                  test_cases: [
                    {
                      input: ["1st Semester", "2025-2026"],
                      expected: "1st Semester — 2025-2026",
                      label: "first term title",
                    },
                    {
                      input: ["2nd Semester", "2024-2025"],
                      expected: "2nd Semester — 2024-2025",
                      label: "second term title",
                    },
                  ],
                  hints: [
                    "Use a template literal with U+2014 between the two values.",
                    "return `${semester} \\u2014 ${academicYear}`;",
                    "return `${___} ___ ${___}`;",
                  ],
                },
                order: 6,
              },
              {
                title: "Key Takeaway",
                content:
                  "The component imports from `@/components/ui/collapsible`, the trigger is a `button` named by its `title` prop carrying the eight layout classes, the body is absent from the document while collapsed, and `aria-expanded` reports the current state with `defaultOpen` seeding it.",
                order: 7,
              },
            ],
          },
          hints: {
            create: [
              {
                description: "Create `src/components/SemesterGroup.tsx` exporting `SemesterGroup` with `title`, an optional `defaultOpen` and `children`, importing `Collapsible`, `CollapsibleTrigger` and `CollapsibleContent` from `@/components/ui/collapsible`.",
                order: 1,
              },
              {
                description: "Render `title` inside a `CollapsibleTrigger` carrying `flex`, `w-full`, `items-center`, `justify-between`, `py-2`, `px-4`, `rounded-md` and `hover:bg-accent`, and put `{children}` in `CollapsibleContent` so they are absent while collapsed.",
                order: 2,
              },
              {
                description: "In the grades page render one group per unique `semester` and `academicYear` pair from `grades`, title each as semester, em dash, academic year, and open only the first.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Verify a Collapsible file exists and exports Collapsible, CollapsibleTrigger, and CollapsibleContent",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Create a Semester Group file importing from @/components/ui/collapsible",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Render SemesterGroup without defaultOpen and verify it shows a button with accessible name matching '1st semester — 2025-2026' and aria-expanded='false'",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Verify children are not in the document when collapsed, and clicking the button shows children and sets aria-expanded='true'",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "Render SemesterGroup with defaultOpen and verify children are visible on first render with aria-expanded='true'",
                is_required: true,
                order: 5,
              },
              {
                description:
                  "Switch to All Semesters tab and verify two buttons exist for '1st semester — 2025-2026' and '2nd semester — 2024-2025'",
                is_required: true,
                order: 6,
              },
              {
                description:
                  "Verify all semester buttons have the required styling classes (flex, w-full, items-center, justify-between, py-2, px-4, rounded-md, hover:bg-accent) and the first one has aria-expanded='true'",
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
    id: "nextjs-shadcn-ui-scenario-3-level-3",
    title: "Per-Semester GPA and a Reusable Progress Bar",
    subtitle: "Add `computeGPABySemester` with a `GPA by Semester` card, and ship `src/components/ui/progress.tsx`",
    order: 3,
    level_description:
      "Mission Briefing: students want to see how their GPA moved term by term, and the standing and dashboard pages each hand-roll a progress bar out of nested `div` elements with an inline width. Export `computeGPABySemester` from `src/lib/mockData.ts`, returning one weighted GPA per unique `(semester, academicYear)` pair in chronological order, and render those rows in a `GPA by Semester` card on `src/app/dashboard/standing/page.tsx`. Then create `src/components/ui/progress.tsx` exporting `Progress`, which exposes the full `progressbar` ARIA contract, clamps its fill between 0% and 100%, and is used by the `Degree Progress` card on both the standing page and `src/app/dashboard/page.tsx`.",
    xp_reward: 40,
    coin_reward: 100,
    key_takeaways:
      "Grouping by the pair `(semester, academicYear)` rather than by semester name alone keeps two terms from the same year apart, and each entry carries its own `units` total alongside its units-weighted `gpa`. Sorting by `academicYear` first and by `1st Semester` before `2nd Semester` inside a year gives a chronological list without needing a date parser. A progress bar has to be a real widget: the `progressbar` role with `aria-valuenow`, `aria-valuemin` and `aria-valuemax` on the outer element, a single child element whose inline width is `(value / max) * 100` clamped to the 0-100 range, and a `max` of 90 for the credit bars so the same component serves every progress card.",
    scenario_id: "nextjs-shadcn-ui-scenario-3",
    tasks: {
      create: [
        {
          task_name: "computeGPABySemester and the GPA by Semester Card",
          test_type: "both",
          user_story:
            "As a student, I want one weighted GPA per term listed in date order so that I can see how my average moved across the year.",
          learning_sections: {
            create: [
              {
                title: "Overview\nGrouping, Weighting and Sorting",
                content:
                  "`computeGPABySemester` is a pure function over the `grades` array. It returns an array of entries shaped `{ semester, academicYear, units, gpa }`, one entry per unique `(semester, academicYear)` pair, already sorted.",
                order: 1,
              },
              {
                title: "The Group Key",
                content:
                  "Both fields are needed in the key. `semester` alone would merge `1st Semester` 2025-2026 with `1st Semester` 2024-2025, so the key is the pair:\n\nconst key = `${g.semester}|${g.academicYear}`;\n\nEvery grade in the shipped `grades` array is either `1st Semester` / `2025-2026` or `2nd Semester` / `2024-2025`, so the shipped data produces exactly two entries with two distinct keys.",
                order: 2,
              },
              {
                title: "Units-Weighted GPA",
                content:
                  "A GPA is not the mean of the letter grades. Each grade letter is converted to points, multiplied by that course's `units`, and divided by the total units in the group.\n\nconst points = { 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'F': 0.0 };\n\nThree units of `A` plus three units of `B` gives `(4.0 * 3 + 3.0 * 3) / 6 = 3.5` over 6 units. A lone four-unit `C` gives 2.0 over 4 units.",
                order: 3,
              },
              {
                title: "Chronological Sorting",
                content:
                  "The academic year strings are `YYYY-YYYY` and sort correctly as plain strings. Within one year, `1st Semester` has to come before `2nd Semester`, so a second sort key is the leading digit of the semester name:\n\nreturn groups.sort((a, b) =>\n  a.academicYear.localeCompare(b.academicYear) || Number(a.semester) - Number(b.semester);\n);\n\nFor the four-term sample the resulting labels are `2024-2025 1st Semester`, `2024-2025 2nd Semester`, `2025-2026 1st Semester`, `2025-2026 2nd Semester`.",
                order: 4,
              },
              {
                title: "Rendering the Card",
                content:
                  "`src/app/dashboard/standing/page.tsx` imports `computeGPABySemester` and `grades` from `@/lib/mockData`, calls the helper, and renders one row per entry. The card needs a heading that matches `/gpa by semester/i`, and the rows need to show both the `1st Semester` and `2nd Semester` labels plus a numeric GPA.",
                order: 5,
              },
              {
                title: "Practice Lab: Group GPA",
                content:
                  "Practice the single-group half of the helper, which is the part that does the weighting.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement `gpaForGroup(grades)` returning `{ units, gpa }` for one term, where `units` is the sum of the `units` fields and `gpa` is the units-weighted mean of the grade points rounded to two decimals. Use A = 4.0, A- = 3.7, B+ = 3.3, B = 3.0, B- = 2.7, C+ = 2.3, C = 2.0, C- = 1.7, D+ = 1.3, D = 1.0, F = 0.0.",
                  language: "typescript",
                  starter_code:
                    "export function gpaForGroup(grades: { units: number; grade: string }[]): { units: number; gpa: number } {\n  // TODO\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO",
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "gpaForGroup",
                  test_cases: [
                    {
                      input: [
                        [
                          { units: 3, grade: "A" },
                          { units: 3, grade: "B" },
                        ],
                      ],
                      expected: { units: 6, gpa: 3.5 },
                      label: "three units of A plus three units of B",
                    },
                    {
                      input: [[{ units: 4, grade: "C" }]],
                      expected: { units: 4, gpa: 2.0 },
                      label: "one four-unit C",
                    },
                    {
                      input: [[]],
                      expected: { units: 0, gpa: 0 },
                      label: "empty group",
                    },
                  ],
                  hints: [
                    "Reduce twice: once for total units, once for total points.",
                    "const units = grades.reduce((s, g) => s + g.units, 0); if (units === 0) return { units: 0, gpa: 0 }; const pts = grades.reduce((s, g) => s + (points[g.grade] ?? 0) * g.units, 0); return { units, gpa: Math.round((pts / units) * 100) / 100 };",
                    "const units = grades.reduce((s, g) => s + g.___, 0); const pts = grades.reduce((s, g) => s + (points[g.grade] ?? 0) * g.___, 0); return { units, gpa: ___ };",
                  ],
                },
                order: 6,
              },
              {
                title: "Key Takeaway",
                content:
                  "One entry per unique `(semester, academicYear)` pair, a units-weighted `gpa` per entry, and a sort by `academicYear` then by the semester number.",
                order: 7,
              },
            ],
          },
          hints: {
            create: [
              {
                description: "In `src/lib/mockData.ts`, add `computeGPABySemester` that groups `grades` by the `(semester, academicYear)` pair and returns units and weighted GPA per group.",
                order: 1,
              },
              {
                description: "Sort the groups by `academicYear` then semester number so the rendered order is chronological, not alphabetical.",
                order: 2,
              },
              {
                description: "Self-check: the helper returns two groups (6 units at 3.5, 4 units at 2.0) and the standing page shows a `GPA by Semester` card with both semester labels.",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Export computeGPABySemester from src/lib/mockData.ts and verify it returns exactly 2 entries with distinct keys for the shipped grades array",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Verify the function reports correct units and GPA: 6 units at 3.5 GPA for 'A' + 'B' group, 4 units at 2.0 GPA for lone 'C' group",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Verify the returned labels are in chronological order: 2024-2025 1st Semester, 2024-2025 2nd Semester, 2025-2026 1st Semester, 2025-2026 2nd Semester",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Add a 'GPA by Semester' card to the standing page with heading matching 'gpa by semester'",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "Verify the standing page shows both 1st Semester and 2nd Semester labels",
                is_required: true,
                order: 5,
              },
            ],
          },
        },
        {
          task_name: "Progress Primitive and Degree Progress Cards",
          test_type: "both",
          user_story:
            "As a student, I want the degree progress bars on the standing and dashboard pages to be real progress widgets so that screen readers announce them and out-of-range values cannot overflow.",
          learning_sections: {
            create: [
              {
                title: "Overview\nA Progress Bar With an ARIA Contract",
                content:
                  "`src/components/ui/progress.tsx` exports a `Progress` component taking `value` and `max`. It replaces the hand-rolled `div` bars that the standing and dashboard pages currently build by hand.",
                order: 1,
              },
              {
                title: "The Outer Element",
                content:
                  "The outer element carries the `progressbar` role and the three value attributes, derived from the props:\n\n<div\n  role='progressbar'\n  aria-valuenow={value}\n  aria-valuemin={0}\n  aria-valuemax={max}\n>\n\nWith `value={42}` and `max={100}` those attributes read `42`, `0` and `100`.",
                order: 2,
              },
              {
                title: "The Inner Fill Element",
                content:
                  "The fill is the single child of the `progressbar` element, and its width is an inline style computed from the ratio:\n\nconst percent = (value / max) * 100;\n\n<div style={{ width: `${percent}%` }} className='h-full bg-primary' />\n\nThe inner element is found with `[role=progressbar] > *`, so there must be exactly one child and it must carry the width.",
                order: 3,
              },
              {
                title: "Clamping",
                content:
                  "The ratio has to be clamped before it becomes a width, otherwise `value={250}` with `max={100}` produces a 250% wide bar that spills out of the track:\n\nconst percent = Math.min(100, Math.max(0, (value / max) * 100));\n\n`value={30}` with `max={60}` still gives 50% because the clamp only bites outside the range.",
                order: 4,
              },
              {
                title: "Wiring the Degree Progress Cards",
                content:
                  "The standing page Degree Progress card and the dashboard Degree Progress card both render `<Progress value={earnedCredits} max={currentStanding.totalCredits} />`. `currentStanding.totalCredits` is `90`, so the rendered `aria-valuemax` is the string `90`, and that exact value is what is looked for on both pages.",
                order: 5,
              },
              {
                title: "Practice Lab: Percent With Clamping",
                content:
                  "Practice the pure function that turns a value and a max into a clamped percentage.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement `toPercent(value, max)` returning `(value / max) * 100` clamped to the range 0 to 100, and rounded to two decimals. A `max` of 0 returns 0.",
                  language: "typescript",
                  starter_code:
                    "export function toPercent(value: number, max: number): number {\n  // TODO\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO",
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "toPercent",
                  test_cases: [
                    {
                      input: [30, 60],
                      expected: 50,
                      label: "half of max",
                    },
                    {
                      input: [42, 100],
                      expected: 42,
                      label: "in range",
                    },
                    {
                      input: [250, 100],
                      expected: 100,
                      label: "clamped to max",
                    },
                    {
                      input: [-50, 100],
                      expected: 0,
                      label: "clamped to zero",
                    },
                  ],
                  hints: [
                    "Use Math.min and Math.max around the ratio.",
                    "if (max <= 0) return 0; const raw = (value / max) * 100; return Math.round(Math.min(100, Math.max(0, raw)) * 100) / 100;",
                    "const raw = (value / max) * ___; return Math.min(___, Math.max(___, raw));",
                  ],
                },
                order: 6,
              },
              {
                title: "Key Takeaway",
                content:
                  "`role=progressbar` with `aria-valuenow`, `aria-valuemin` and `aria-valuemax` on the outer element, one child element whose inline width is the clamped percentage, and `max={currentStanding.totalCredits}` for every credit bar.",
                order: 7,
              },
            ],
          },
          hints: {
            create: [
              {
                description: "Create `src/components/ui/progress.tsx` exporting `Progress` with `role='progressbar'`, `aria-valuenow/min/max`, and a single clamped-width child.",
                order: 1,
              },
              {
                description: "Clamp the percentage with `Math.min(100, Math.max(0, (value / max) * 100))` before it becomes the inline width — out-of-range values are the easiest failure.",
                order: 2,
              },
              {
                description: "Self-check: `value={42}` with `max={100}` gives `aria-valuenow=42` and 42% width; `value={250}` caps at 100%; the dashboard shows a `Degree Progress` card.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Create src/components/ui/progress.tsx exporting Progress component with progressbar role, aria-valuenow, aria-valuemin, aria-valuemax",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Verify the Progress component shows correct width (50% for value=30, max=60)",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Verify width is clamped to 100% for out-of-range values (value=250, max=100)",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Verify width is clamped to 0% for negative values (value=-50, max=100)",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "Verify the standing page renders a progressbar with aria-valuemax='90'",
                is_required: true,
                order: 5,
              },
              {
                description:
                  "Verify the dashboard page shows 'Degree Progress' text and a progressbar with aria-valuemax='90'",
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
    id: "nextjs-shadcn-ui-scenario-3-level-4",
    title: "Course Details and Document Requests",
    subtitle: "Add `/dashboard/courses/[courseCode]`, plus a shadcn `Dialog` and a three-step `RequestDocumentDialog`",
    order: 4,
    level_description:
      "Mission Briefing: the grades table has no way into a single course, and there is no way for a student to ask the registrar for a document. Create `src/app/dashboard/courses/[courseCode]/page.tsx` as a dynamic route that decodes the `courseCode` segment, merges the matching entry from `grades` in `src/lib/mockData.ts` with the matching entry from `schedule` for the professor, and falls back to a `Course not found` state with a link back to `/dashboard/grades`. Add a `View Details` link per grade row pointing at the URL-encoded route. Then build `src/components/RequestDocumentDialog.tsx`, a three-step request flow rendered inside the shadcn/ui `Dialog` component installed in level one, and put a `Request Document` trigger on the dashboard.",
    xp_reward: 60,
    coin_reward: 150,
    key_takeaways:
      "A dynamic route segment arrives percent-encoded, so `CS 301` reaches the page as `params.courseCode === 'CS%20301'` and has to be decoded before it is matched against `grade.courseCode`. A course detail view needs two mock arrays: `grades` for the code, name, units and grade, and `schedule` for the professor, because `CS 301` is a `3` unit `A` taught by `Dr. Sarah Johnson`. A dialog that is closed must render nothing at all rather than a hidden container, so `RequestDocumentDialog` returns nothing while `open` is false, and when it is open the shadcn `DialogContent` supplies `role='dialog'` with `aria-modal='true'`, a level 2 title matching `/request document/i` and a description reading `Select the type of document`. A multi-step form has to gate each step: `Next` waits for a document type, `Submit` waits for a purpose of at least 10 characters, and the confirmation step prints the chosen type, the purpose text and a reference number matching `/REQ-[A-Z0-9]{6}/`.",
    scenario_id: "nextjs-shadcn-ui-scenario-3",
    tasks: {
      create: [
        {
          task_name: "Dynamic Course Detail Route and View Details Links",
          test_type: "both",
          user_story:
            "As a student, I want a page for a single course with its grade and professor, and a `View Details` link in every grade row, so that I can go deeper on one result without leaving the portal.",
          learning_sections: {
            create: [
              {
                title: "Overview\nA Dynamic Route Segment",
                content:
                  "Next.js names a dynamic route segment with square brackets. `src/app/dashboard/courses/[courseCode]/page.tsx` becomes `/dashboard/courses/<anything>`, and the segment arrives on the page component as `params.courseCode`.",
                order: 1,
              },
              {
                title: "The Segment Is Encoded",
                content:
                  "A course code contains a space, and a space is not legal in a URL path. The link has to be built with `encodeURIComponent` and the page has to reverse it with `decodeURIComponent` before matching.\n\nparams.courseCode === 'CS%20301'\ndecodeURIComponent('CS%20301') === 'CS 301'\n\nSkipping the decode is the most common failure here: nothing matches and the page falls through to the not-found state for a code that does exist.",
                order: 2,
              },
              {
                title: "Joining grades and schedule",
                content:
                  "The two mock arrays in `src/lib/mockData.ts` hold different facts about the same course. `grades` has `courseCode`, `courseName`, `units` and `grade`. `schedule` has `courseCode`, `room`, `day`, `time` and `professor`.\n\nFor `CS 301` the detail page needs the code, the name `Data Structures and Algorithms`, the grade `A`, and the professor `Dr. Sarah Johnson` from the `schedule` entry with the same `courseCode`.",
                order: 3,
              },
              {
                title: "The Not-Found State",
                content:
                  "When the decoded code matches nothing, render a single `Course not found` message and a `Link` back to the grades page. The link's `href` is exactly `/dashboard/grades`, and its accessible name contains `grades`.\n\n<Link href='/dashboard/grades'>Back to grades</Link>",
                order: 4,
              },
              {
                title: "The View Details Link",
                content:
                  "Every row of the grades table in `src/app/dashboard/grades/page.tsx` gets a link whose accessible name contains `View Details` and whose `href` starts with `/dashboard/courses/`, built as:\n\n<Link href={`/dashboard/courses/${encodeURIComponent(grade.courseCode)}`}>View Details</Link>\n\nFor `CS 301` that produces `href='/dashboard/courses/CS%20301'`.",
                order: 5,
              },
              {
                title: "Practice Lab: Decoded Course Lookup",
                content:
                  "Practice the pure lookup that sits at the centre of the route.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement `findCourseByCode(grades, rawCourseCode)` decoding `rawCourseCode` with `decodeURIComponent` and returning the entry whose `courseCode` matches exactly, or `null` when nothing matches.",
                  language: "typescript",
                  starter_code:
                    "export function findCourseByCode<T extends { courseCode: string }>(grades: T[], rawCourseCode: string): T | null {\n  // TODO\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO",
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "findCourseByCode",
                  test_cases: [
                    {
                      input: [
                        [{ courseCode: "CS 301", courseName: "Data Structures and Algorithms", units: 3, grade: "A" }],
                        "CS%20301",
                      ],
                      expected: { courseCode: "CS 301", courseName: "Data Structures and Algorithms", units: 3, grade: "A" },
                      label: "encoded CS 301 resolves",
                    },
                    {
                      input: [
                        [{ courseCode: "CS 301", courseName: "Data Structures and Algorithms", units: 3, grade: "A" }],
                        "BOGUS%20999",
                      ],
                      expected: null,
                      label: "unknown code returns null",
                    },
                    {
                      input: [[{ courseCode: "CS 301" }], "CS 301"],
                      expected: { courseCode: "CS 301" },
                      label: "already decoded code still matches",
                    },
                  ],
                  hints: [
                    "Decode first, then compare with ===.",
                    "const wanted = decodeURIComponent(rawCourseCode); return grades.find((g) => g.courseCode === wanted) ?? null;",
                    "const wanted = decodeURIComponent(___); return grades.find((g) => g.___ === wanted) ?? ___;",
                  ],
                },
                order: 6,
              },
              {
                title: "Key Takeaway",
                content:
                  "Decode the segment, look the course up in `grades` and `schedule`, and fall back to `Course not found` with a `/dashboard/grades` link when the lookup misses.",
                order: 7,
              },
            ],
          },
          hints: {
            create: [
              {
                description: "Create `src/app/dashboard/courses/[courseCode]/page.tsx`; decode `params.courseCode` with `decodeURIComponent` before matching against `grades` and `schedule`.",
                order: 1,
              },
              {
                description: "Forgetting to decode the segment is the most common failure — `CS%20301` will not match `CS 301` unless decoded.",
                order: 2,
              },
              {
                description: "Self-check: `CS%20301` renders grade `A` and professor `Dr. Sarah Johnson`; `BOGUS%20999` shows `Course not found` with a link back to `/dashboard/grades`.",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Create the dynamic course detail route at /dashboard/courses/[courseCode] and verify it shows course code, name, and grade for CS 301",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Verify the course detail page shows the professor name (Dr. Sarah Johnson) from the schedule array",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Verify the page shows 'Course not found' with a link back to /dashboard/grades for invalid course codes",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Add 'View Details' links to each grade row pointing to the encoded course detail route (e.g., /dashboard/courses/CS%20301)",
                is_required: true,
                order: 4,
              },
            ],
          },
        },
        {
          task_name: "Multi-Step Request Document Flow on the shadcn Dialog",
          test_type: "both",
          user_story:
            "As a student, I want a `Request Document` dialog that walks me through picking a document and writing a purpose, so that I can send the registrar a valid request.",
          learning_sections: {
            create: [
              {
                title: "Overview\nOne Dialog, Three Steps",
                content:
                  "`src/components/RequestDocumentDialog.tsx` exports `RequestDocumentDialog`, which takes `open` and `onClose`, owns the three steps, and renders its whole body inside the shadcn/ui `Dialog` component installed in level one. The dialog primitive itself is not rewritten; it is imported from `@/components/ui/dialog`.",
                order: 1,
              },
              {
                title: "The Dialog Contract",
                content:
                  "When `open` is true the shadcn `DialogContent` contributes `role='dialog'` with `aria-modal='true'`, and the dialog also needs the parts the component ships: `DialogHeader`, `DialogTitle` and `DialogDescription` inside it, plus `DialogFooter` for the row of buttons. The title is a level 2 heading reading `Request Document`, and the description reads `Select the type of document`.\n\nWhen `open` is false the component returns nothing, so the render container has no first child at all:\n\nif (!open) return null;\n\nReturning nothing matters: rendering a hidden wrapper would leave an empty element in the document.",
                order: 2,
              },
              {
                title: "Step 1: Document Type",
                content:
                  "Step 1 is a radio group. Each option is a real `input` with `type='radio'` and a `value` such as `Transcript` or `Enrollment Certificate`, wrapped in a `label`, so the option is found by its accessible label text. The `Next` button starts `disabled` and only becomes enabled once a type is selected.",
                order: 3,
              },
              {
                title: "Step 2: Purpose",
                content:
                  "Step 2 is a single textbox plus `Submit` and `Back`. `Submit` starts `disabled`, stays `disabled` for the nine-character string `too short`, and becomes enabled at ten characters, for example `For my job application portfolio.`.\n\nconst purposeOk = purpose.trim().length >= 10;\n\nThe step keeps a `Next` button on screen alongside `Submit`, so the footer holds `Back`, `Submit` and `Next` together. `Back` returns to step 1, which is verified by the `Next` button being back on screen.",
                order: 4,
              },
              {
                title: "Step 3: Confirmation and the Dashboard Trigger",
                content:
                  "Step 3 replaces the form with a confirmation: the text `Request submitted!`, the chosen document type, the purpose string the student typed, and a generated reference number. The reference is built from `REQ-` plus six uppercase letters or digits, so it matches `/REQ-[A-Z0-9]{6}/`.\n\nconst ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';\n\nA `Done` button closes the dialog. The whole step is reached by choosing `Enrollment Certificate` on step 1, entering `Visa application requirement.` on step 2, and clicking `Submit`.\n\n`src/app/dashboard/page.tsx` holds the dialog's `open` state and renders a trigger whose accessible name contains `Request Document`, and clicking that trigger puts the dialog on screen. A `Button` with the label `Request Document` and an `onClick` that sets the state to `true` is enough.",
                order: 5,
              },
              {
                title: "Practice Lab: Purpose Validation",
                content:
                  "Practice the small pure function that gates the `Submit` button.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement `isPurposeValid(purpose)` returning `true` only when the trimmed string is at least 10 characters long.",
                  language: "typescript",
                  starter_code:
                    "export function isPurposeValid(purpose: string): boolean {\n  // TODO\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO",
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "isPurposeValid",
                  test_cases: [
                    {
                      input: [""],
                      expected: false,
                      label: "empty purpose",
                    },
                    {
                      input: ["too short"],
                      expected: false,
                      label: "nine characters",
                    },
                    {
                      input: ["For my job application portfolio."],
                      expected: true,
                      label: "thirty-four characters",
                    },
                  ],
                  hints: [
                    "Trim, then compare the length against 10.",
                    "return purpose.trim().length >= 10;",
                    "return purpose.trim().length >= ___;",
                  ],
                },
                order: 6,
              },
              {
                title: "Key Takeaway",
                content:
                  "The flow is built on `@/components/ui/dialog`: nothing at all is rendered while `open` is false, the open state exposes `role=dialog` with `aria-modal=true` plus a level 2 title and the `Select the type of document` description, the three steps gate `Next` on a type and `Submit` on a 10-character purpose, and the confirmation prints the type, the purpose and a `REQ-` reference.",
                order: 7,
              },
            ],
          },
          hints: {
            create: [
              {
                description: "Create `src/components/RequestDocumentDialog.tsx` importing `Dialog` parts from `@/components/ui/dialog`, returning nothing while `open` is false.",
                order: 1,
              },
              {
                description: "Rendering a hidden wrapper instead of nothing when closed is the easiest failure — the container must have no first child at all.",
                order: 2,
              },
              {
                description: "Self-check: title `Request Document`; step 1 `Next` disabled until chosen; step 2 `Submit` at 10+ chars; step 3 shows type, purpose, `REQ-` ref; trigger opens dialog.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Verify src/components/ui/dialog.tsx exists and exports Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, and DialogFooter",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Render RequestDocumentDialog with open=true and verify it shows a dialog with role='dialog' and aria-modal='true'",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Verify the open dialog shows a level 2 heading 'Request Document' and description 'Select the type of document'",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Verify RequestDocumentDialog with open=false renders nothing (no first child in container)",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "Verify step 1 shows disabled 'Next' button, and selecting a document type (e.g., Transcript) enables it",
                is_required: true,
                order: 5,
              },
              {
                description:
                  "Verify step 2 shows purpose textbox with disabled 'Submit' button, 'Back' and 'Next' buttons; 'Submit' enables at 10+ chars; clicking 'Back' returns to step 1",
                is_required: true,
                order: 6,
              },
              {
                description:
                  "Complete the flow: choose 'Enrollment Certificate', enter 'Visa application requirement.', click 'Submit', and verify confirmation shows request submitted, document type, purpose, and a REQ- reference number",
                is_required: true,
                order: 7,
              },
              {
                description:
                  "Verify the confirmation step shows a reference number matching REQ-[A-Z0-9]{6} pattern and a 'Done' button",
                is_required: true,
                order: 8,
              },
              {
                description:
                  "Import Dialog components from @/components/ui/dialog in RequestDocumentDialog",
                is_required: true,
                order: 9,
              },
              {
                description:
                  "Add a 'Request Document' trigger button on the dashboard that opens the dialog",
                is_required: true,
                order: 10,
              },
            ],
          },
        },
      ],
    },
  },
  {
    id: "nextjs-shadcn-ui-scenario-3-level-5",
    title: "Derived Aggregates and an Accessibility Sweep",
    subtitle: "Compute units and earned credits from `grades`, then fix the skip link, landmarks, labels and user menu in the dashboard layout",
    order: 5,
    level_description:
      "Mission Briefing: the standing and dashboard pages both read `currentStanding.totalUnits` and `currentStanding.earnedCredits`, which are stale numbers that disagree with the eight-row `grades` array. Export `computeCurrentSemesterUnits` and `computeEarnedCredits` from `src/lib/mockData.ts`, use them on `src/app/dashboard/standing/page.tsx` and `src/app/dashboard/page.tsx`, and remove every `currentStanding.totalUnits` and `currentStanding.earnedCredits` read from those two files. Then sweep `src/app/dashboard/layout.tsx` for accessibility: a `Skip to main content` link as the very first focusable element targeting `#main-content`, a `main` landmark with `id='main-content'` and `tabindex='-1'`, a `nav` named `Primary`, exactly one `aria-current='page'` on the active sidebar item, `aria-label` on the two icon-only buttons, an `sr-only` `h1` reading `Riverside University` inside the `header`, and a user `DropdownMenu` in the `header` built on the shadcn/ui `dropdown-menu` component installed in level one.",
    xp_reward: 75,
    coin_reward: 200,
    key_takeaways:
      "Aggregate numbers that live in a hand-maintained object drift from the rows they describe, so they get derived instead: `computeCurrentSemesterUnits(grades)` sums only the current `(semester, academicYear)` rows and returns 12, and `computeEarnedCredits(grades)` sums `units` for every grade that is not `F` and returns 24. The two pages are then checked as source, not just as render output, so a leftover `currentStanding.totalUnits` reference fails even when the rendered number happens to look right. The layout sweep is the same shape: each fix is a specific attribute on a specific element, the skip link has to be the first element matching `a, button, [tabindex]`, exactly one element may carry `aria-current='page'`, and the visually hidden page title is an `h1` with the `sr-only` class inside the `header` landmark rather than a second visible heading. The user menu reuses the `dropdown-menu` component from level one, where the trigger needs a name matching `/user|profile|account/i` and the open content needs the `menu` role plus a `menuitem` for profile, one for settings or preferences, and one for signing out.",
    scenario_id: "nextjs-shadcn-ui-scenario-3",
    tasks: {
      create: [
        {
          task_name: "Derive Standing Aggregates from the grades Array",
          test_type: "both",
          user_story:
            "As a student, I want the units and earned credits on the standing and dashboard pages computed from my actual grades so that the numbers agree with the grade list.",
          learning_sections: {
            create: [
              {
                title: "Overview\nTwo Pure Helpers",
                content:
                  "Two new exports in `src/lib/mockData.ts` replace the two stale fields. Both take the `grades` array and return a number, and neither reads `currentStanding`.",
                order: 1,
              },
              {
                title: "Current Semester Units",
                content:
                  "Only the rows whose `semester` and `academicYear` both match `currentStanding` count toward the current-term total:\n\nexport function computeCurrentSemesterUnits(grades: Grade[]): number {\n  return grades\n    .filter((g) => g.semester === currentStanding.semester && g.academicYear === currentStanding.academicYear)\n    .reduce((sum, g) => sum + g.units, 0);\n}\n\n`currentStanding.semester` is `1st Semester` and `currentStanding.academicYear` is `2025-2026`, which is four rows of three units, so the helper returns 12 rather than the stored 21.",
                order: 2,
              },
              {
                title: "Earned Credits",
                content:
                  "Earned credits count every row whose grade is not `F`:\n\nexport function computeEarnedCredits(grades: Grade[]): number {\n  return grades\n    .filter((g) => g.grade !== 'F')\n    .reduce((sum, g) => sum + g.units, 0);\n}\n\nThe shipped `grades` array has eight rows of three units and no `F`, so the helper returns 24. On a mixed sample of 3-unit `A`, 4-unit `F` and 2-unit `C-` it returns 5, because the `F` is filtered out before the sum.",
                order: 3,
              },
              {
                title: "Removing the Stale Reads",
                content:
                  "Both pages are also read as source, and two patterns are rejected outright:\n\ncurrentStanding.totalUnits\ncurrentStanding.earnedCredits\n\nOn the standing page, the `Current Units` card, the `In Progress` block and the `Earned Credits` card all switch to the helpers. `currentStanding.gpa` and `currentStanding.totalCredits` stay, because they are not derived from `grades`.",
                order: 4,
              },
              {
                title: "Where the Numbers Land",
                content:
                  "The standing page renders 12 for units and 24 for earned credits, and the dashboard renders 12 for its `Total Units` stat. Both values are checked as exact text nodes, so a formatted string like `12 units` in the same element would not count: the numeric text has to be its own element.",
                order: 5,
              },
              {
                title: "Practice Lab: Earned Credits",
                content:
                  "Practice the second helper, which is where the exclusion rule lives.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement `computeEarnedCredits(grades)` returning the sum of the `units` fields over every entry whose `grade` is not `F`.",
                  language: "typescript",
                  starter_code:
                    "export function computeEarnedCredits(grades: { units: number; grade: string }[]): number {\n  // TODO\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO",
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "computeEarnedCredits",
                  test_cases: [
                    {
                      input: [
                        [
                          { units: 3, grade: "A" },
                          { units: 4, grade: "F" },
                          { units: 2, grade: "C-" },
                        ],
                      ],
                      expected: 5,
                      label: "F is excluded",
                    },
                    {
                      input: [
                        [
                          { units: 3, grade: "A" },
                          { units: 3, grade: "B" },
                        ],
                      ],
                      expected: 6,
                      label: "all non-F rows count",
                    },
                    {
                      input: [[{ units: 4, grade: "F" }]],
                      expected: 0,
                      label: "only an F",
                    },
                    {
                      input: [[]],
                      expected: 0,
                      label: "empty array",
                    },
                  ],
                  hints: [
                    "Filter first, then reduce over units.",
                    "return grades.filter((g) => g.grade !== 'F').reduce((sum, g) => sum + g.units, 0);",
                    "return grades.filter((g) => g.grade !== '___').reduce((sum, g) => sum + g.___, 0);",
                  ],
                },
                order: 6,
              },
              {
                title: "Key Takeaway",
                content:
                  "12 units for the current term, 24 earned credits across all terms, and no `currentStanding.totalUnits` or `currentStanding.earnedCredits` left in either page.",
                order: 7,
              },
            ],
          },
          hints: {
            create: [
              {
                description: "In `src/lib/mockData.ts`, export `computeCurrentSemesterUnits` (current term only) and `computeEarnedCredits` (non-`F` grades) from `grades`.",
                order: 1,
              },
              {
                description: "In the standing and dashboard pages, replace `currentStanding.totalUnits` and `currentStanding.earnedCredits` with the new helpers.",
                order: 2,
              },
              {
                description: "Self-check: standing shows exact `12` and `24`; dashboard shows exact `12`; no stale `currentStanding` fields remain in either page source.",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Export computeCurrentSemesterUnits from the mock data file and verify it returns exactly 12 for the shipped grades array",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Export computeEarnedCredits from the mock data file and verify it returns exactly 24 for the shipped grades array",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Verify computeEarnedCredits excludes F grades (returns 5 for 3-unit A, 4-unit F, 2-unit C-)",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Remove all currentStanding.totalUnits and currentStanding.earnedCredits references from the standing page source",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "Verify the standing page renders exact text '12' and '24' as separate elements",
                is_required: true,
                order: 5,
              },
              {
                description:
                  "Remove currentStanding.totalUnits reference from the dashboard page source",
                is_required: true,
                order: 6,
              },
              {
                description:
                  "Verify the dashboard page renders exact text '12' as a separate element",
                is_required: true,
                order: 7,
              },
            ],
          },
        },
        {
          task_name: "Dashboard Layout Accessibility Sweep and User DropdownMenu",
          test_type: "both",
          user_story:
            "As a keyboard or screen reader user, I want a skip link, real landmarks, named buttons and a reachable user menu in the dashboard shell so that I can navigate the portal without seeing it.",
          learning_sections: {
            create: [
              {
                title: "Overview\nWhat the Shell Renders",
                content:
                  "`src/app/dashboard/layout.tsx` renders the `header`, the `aside` with its `nav`, and a `main`. The sweep adds seven things to that shell, and each one is checked on a specific element.",
                order: 1,
              },
              {
                title: "The Skip Link",
                content:
                  "The skip link is an `a` with `href='#main-content'` whose text matches `/skip to main content/i`. It has to be the first element matching `a, button, [tabindex]` in document order, which means it is rendered before the header, not inside it.\n\n<a href='#main-content' className='sr-only focus:not-sr-only ...'>Skip to main content</a>\n\n`sr-only` hides it until `focus:not-sr-only` reveals it.",
                order: 2,
              },
              {
                title: "The Main Landmark",
                content:
                  "The content area becomes a real landmark with the id the skip link targets and a negative tabindex so focus can land on it:\n\n<main id='main-content' tabIndex={-1} className='flex-1 p-6 overflow-auto'>{children}</main>\n\n`tabindex='-1'` is what lets the browser move focus here; it is not in the tab order.",
                order: 3,
              },
              {
                title: "Primary Navigation and Icon-Only Buttons",
                content:
                  "The `nav` inside the `aside` needs an accessible name, otherwise it is an unnamed landmark:\n\n<nav aria-label='Primary' className='p-4 space-y-2'>\n\nThe active item is marked with `aria-current='page'` and only the active one:\n\n<Link href={item.href} aria-current={isActive ? 'page' : undefined}>\n\nWith `usePathname()` returning `/dashboard/grades`, exactly one element in the shell carries `aria-current='page'` and its text contains `grades`.\n\nThe sidebar toggle and the sign-out control in the `header` render nothing but a `lucide-react` icon, so each needs an `aria-label` that becomes its accessible name:\n\n<Button aria-label='Toggle sidebar' ...><Menu /></Button>\n<Button aria-label='Sign out' ...><LogOut /></Button>",
                order: 4,
              },
              {
                title: "The Screen-Reader Heading",
                content:
                  "The `header` needs an `h1`, but the visible brand text is a `span`, so the heading is added as a visually hidden duplicate with the `sr-only` class:\n\n<header ...><h1 className='sr-only'>Riverside University</h1>...</header>\n\nThe `h1` has to be inside the `header` element, which is why it cannot live in the `layout.tsx` of the app root. The two icon buttons are looked up by accessible name matching `/toggle sidebar/i` and `/sign out/i`.\n\nThe `header` also grows a user menu built on the shadcn/ui `dropdown-menu` component installed in level one. Its trigger is a `button` whose accessible name mentions the user, a profile or the account, and clicking it puts an element with the `menu` role in the document. That content holds three `menuitem` elements: one for the profile, one for settings or preferences, and one for signing out.\n\n<DropdownMenu>\n  <DropdownMenuTrigger aria-label='User account' ... />\n  <DropdownMenuContent>\n    <DropdownMenuItem>Profile</DropdownMenuItem>\n    <DropdownMenuItem>Settings</DropdownMenuItem>\n    <DropdownMenuSeparator />\n    <DropdownMenuItem>Sign out</DropdownMenuItem>\n  </DropdownMenuContent>\n</DropdownMenu>\n\nThe `menu` and `menuitem` roles come from the primitive, so a plain list of links would not answer the `menu` and `menuitem` queries.",
                order: 5,
              },
              {
                title: "Practice Lab: Active Sidebar Item",
                content:
                  "Practice the pure function that decides which sidebar link is the current page.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement `getSidebarLinkState(pathname, href)` returning `{ active: true }` when `pathname` equals `href` exactly, and `{ active: false }` otherwise. It is used to set `aria-current` to `page` or to leave it off.",
                  language: "typescript",
                  starter_code:
                    "export function getSidebarLinkState(pathname: string, href: string): { active: boolean } {\n  // TODO\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO",
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "getSidebarLinkState",
                  test_cases: [
                    {
                      input: ["/dashboard/grades", "/dashboard/grades"],
                      expected: { active: true },
                      label: "current route is active",
                    },
                    {
                      input: ["/dashboard/grades", "/dashboard"],
                      expected: { active: false },
                      label: "other route is not active",
                    },
                    {
                      input: ["/dashboard/standing", "/dashboard/standing"],
                      expected: { active: true },
                      label: "standing route is active",
                    },
                  ],
                  hints: [
                    "Compare the two strings with ===.",
                    "return { active: pathname === href };",
                    "return { active: pathname ___ href };",
                  ],
                },
                order: 6,
              },
              {
                title: "Key Takeaway",
                content:
                  "Skip link first, `main` with the id it targets, a nav named `Primary`, one `aria-current='page'`, two `aria-label`led icon buttons, an `sr-only` `h1` reading `Riverside University` inside the `header`, and a user `DropdownMenu` whose trigger is named and whose content is a `menu` of profile, settings or preferences, and sign out `menuitem`s.",
                order: 7,
              },
            ],
          },
          hints: {
            create: [
              {
                description: "`src/app/dashboard/layout.tsx`: skip link first; focusable `main`; `nav` named; `aria-current=page`; `aria-label` icons; `sr-only` h1; `DropdownMenu`, 3 items.",
                order: 1,
              },
              {
                description: "Self-check: skip link first focusable; `main` `tabIndex={-1}`; one `aria-current=page`; icons named; hidden h1; user trigger opens `menu` with 3 `menuitem`s.",
                order: 2,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Add a skip link as the first focusable element (a with href='#main-content', text 'Skip to main content', with sr-only and focus:not-sr-only classes)",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Add a main element with id='main-content' and tabindex='-1'",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Add a nav element with accessible name 'Primary'",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Add exactly one aria-current='page' on the active sidebar item (matching 'grades' when on /dashboard/grades)",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "Add aria-label='Toggle sidebar' to the sidebar toggle button",
                is_required: true,
                order: 5,
              },
              {
                description:
                  "Add aria-label='Sign out' to the sign out button",
                is_required: true,
                order: 6,
              },
              {
                description:
                  "Add an sr-only h1 with text 'Riverside University' inside the header element",
                is_required: true,
                order: 7,
              },
              {
                description:
                  "Verify a dropdown page component from shadcn/ui exists and exports all DropdownMenu components",
                is_required: true,
                order: 8,
              },
              {
                description:
                  "Add a user menu dropdown with trigger named 'user/profile/account' that opens a menu with menu role containing menuitem for Profile, Settings/Preferences, and Sign out/Logout",
                is_required: true,
                order: 9,
              },
              {
                description:
                  "Import DropdownMenu components from shadcn/ui in the dashboard layout",
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
