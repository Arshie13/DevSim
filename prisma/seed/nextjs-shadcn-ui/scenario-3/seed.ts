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
    subtitle: "Install dependencies, add the shadcn/ui Alert component, and fix the login button copy",
    order: 1,
    level_description:
      "Mission Briefing: Riverside University has onboarded a new developer and the student portal has to run on their machine before any feature work starts. Install the project dependencies with `pnpm install` and confirm `pnpm dev` prints `ready` or `Local:`. Then add the shadcn/ui Alert component to the project source: `src/components/ui/alert.tsx` naming `Alert`, `AlertTitle` and `AlertDescription`. Finally update `src/app/login/page.tsx` so the submit button reads `Log In` and the old `Sign In` copy is gone.",
    xp_reward: 10,
    coin_reward: 20,
    key_takeaways:
      "A project only counts as set up once `node_modules/next` and `node_modules/react` exist on disk and `pnpm dev` prints `ready` or `Local:`. shadcn/ui components are copied into `src/components/ui/`, so the graded check is that `alert.tsx` exists and names `Alert`, `AlertTitle` and `AlertDescription`. Branding copy is graded from source: `src/app/login/page.tsx` must contain `Log In` and must not contain `Sign In` once comments are stripped.",
    scenario_id: "nextjs-shadcn-ui-scenario-3",
    tasks: {
      create: [
        {
          task_name: "Dependencies and the shadcn/ui Alert Component",
          test_type: "both",
          user_story:
            "As a developer, I want the portal dependencies installed, the shadcn/ui Alert component copied into `src/components/ui/`, and `pnpm dev` booting so that the rest of the levels have a project that actually runs.",
          learning_sections: {
            create: [
              {
                title: "Overview\nGetting the Portal Running Locally",
                content:
                  "This level works on three things, all checked from the command line and the filesystem: dependencies are installed, the shadcn/ui Alert component is present in the project source, and the Next.js dev server starts. Nothing here touches application features.",
                order: 1,
              },
              {
                title: "Installing Dependencies",
                content:
                  "The project ships a `package.json` and a `pnpm-lock.yaml`. Running `pnpm install` at the project root downloads every listed dependency into a `node_modules` directory at that same root.\n\nThe graded check is that three paths exist:\nnode_modules\nnode_modules/next\nnode_modules/react\n\nIf `node_modules/next` is missing, the install did not finish.",
                order: 2,
              },
              {
                title: "Adding the shadcn/ui Alert Component",
                content:
                  "shadcn/ui components are copied into your own source instead of installed as a package. This level's graded component is the Alert primitive, checked by reading its file from disk and looking for the names below.\n\nsrc/components/ui/alert.tsx names `Alert`, `AlertTitle` and `AlertDescription`.\n\nOne command adds it:\npnpm dlx shadcn@latest add alert",
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
                  "The checks in this level are: `node_modules` with `next` and `react` inside it, a dev server that prints `ready` or `Local:` within 30 seconds without a non-zero exit, and `src/components/ui/alert.tsx` whose source names `Alert`, `AlertTitle` and `AlertDescription`.",
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
                description: "Run `pnpm dlx shadcn@latest add alert` so `src/components/ui/alert.tsx` is written.",
                order: 2,
              },
              {
                description: "Run `pnpm dev` in the project root and leave it running until the output matches `/ready|Local:/i` within 30 seconds.",
                order: 3,
              },
              {
                description: "Work through them in that order from the project root: install, add the Alert component, then start the server and leave it up.",
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
                  "The login form is a client component at `src/app/login/page.tsx`. The submit button currently renders a ternary:\n\n{isLoading ? 'Signing in...' : 'Sign In'}\n\nThe check reads this file for `Log In` and for the absence of `Sign In`; only the idle branch contains `Sign In`, so that is the one the check depends on.",
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
                  "Confirm the login page source (with `//` and `/* */` comments stripped) contains 'Log In' and no remaining 'Sign In'",
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
    id: "nextjs-shadcn-ui-scenario-3-level-2",
    title: "Explaining Standing Badges and Collapsing the Grades Table",
    subtitle: "Add an `InfoTooltip` to the standing status badges, and a `SemesterGroup` accordion for the grades page",
    order: 2,
    level_description:
      "Mission Briefing: the standing page prints a `Good Standing` badge with no explanation of what the three tiers mean. Wrap each academic-status badge on `src/app/dashboard/standing/page.tsx` in a new `InfoTooltip` so hovering it explains the GPA rule for that tier. Then create `src/components/SemesterGroup.tsx`, an accordion section that shows its title on a real button and reveals its children only when open, and use it in the All Semesters tab of `src/app/dashboard/grades/page.tsx` to render one group per unique `(semester, academicYear)` pair, with the first group open.",
    xp_reward: 25,
    coin_reward: 50,
    key_takeaways:
      "A tooltip is a labelled surface: `InfoTooltip` renders an element with the `tooltip` role whose accessible name is its `label` prop, and it stays out of the way until hover by combining `opacity-0` and `pointer-events-none` on the tooltip with `group` on the wrapper and `group-hover:opacity-100` on the tooltip. The three tier strings the standing page has to include are the source of truth for what each badge means. A `SemesterGroup` is a real `button` whose accessible name is its `title` prop and whose `aria-expanded` flips from `false` to `true` on click, or starts `true` when `defaultOpen` is passed; the children are unmounted while collapsed rather than merely hidden. Grouping the All Semesters tab by the pair `(semester, academicYear)` produces exactly two triggers for the shipped mock data, `1st Semester — 2025-2026` and `2nd Semester — 2024-2025`.",
    scenario_id: "nextjs-shadcn-ui-scenario-3",
    tasks: {
      create: [
        {
          task_name: "InfoTooltip on the Standing Status Badges",
          test_type: "both",
          user_story:
            "As a student, I want each academic-status badge on the standing page to explain what that status means, so that I know how the GPA tiers are defined.",
          learning_sections: {
            create: [
              {
                title: "Overview\nExplaining a Badge",
                content:
                  "The standing page at `src/app/dashboard/standing/page.tsx` renders one status badge per academic tier through its `getStatusBadge` helper, and nothing explains what the tiers mean. This task adds a small `InfoTooltip` component and wraps each badge with it.",
                order: 1,
              },
              {
                title: "The InfoTooltip Component",
                content:
                  "Create `src/components/InfoTooltip.tsx` exporting `InfoTooltip`, which takes a `label` string and the `children` it wraps:\n\n<InfoTooltip label='Good Standing — cumulative GPA of 3.0 or higher'>\n  <Badge>Good Standing</Badge>\n</InfoTooltip>\n\nIt renders a wrapper around `children` and, inside it, an element with the `tooltip` role whose accessible name is the `label`. The check imports the component and renders it directly, so the export has to be named `InfoTooltip`.",
                order: 2,
              },
              {
                title: "Hidden Until Hover",
                content:
                  "The tooltip is always in the document but visually out of the way until the wrapper is hovered. Four class names carry that behaviour, and the check reads them off the rendered elements:\n\nthe wrapper carries `group`\nthe tooltip carries `opacity-0`\nthe tooltip carries `pointer-events-none`\nthe tooltip carries `group-hover:opacity-100`\n\nMissing any one of them fails the check: `opacity-0` hides it, `pointer-events-none` keeps it from intercepting the pointer, `group` opts the wrapper into group-hover, and `group-hover:opacity-100` is what reveals it.",
                order: 3,
              },
              {
                title: "The Three Tier Strings",
                content:
                  "The standing page has to state what each tier means. The check reads `src/app/dashboard/standing/page.tsx` as source and matches three strings, so they have to appear literally in the file:\n\ngood standing ... cumulative gpa ... 3.0\nwarning ... gpa ... 2.0 ... 2.99\nprobation ... gpa below 2.0 ... advisor\n\nThat gives three concrete labels, for example:\n\nGood Standing — cumulative GPA of 3.0 or higher\nWarning — cumulative GPA between 2.0 and 2.99\nProbation — cumulative GPA below 2.0, book a meeting with your advisor\n\nThe rendered `good` tooltip is also queried by its accessible name, so the good label has to be attached to the badge shown for `currentStanding.academicStatus`, which is `good`.",
                order: 4,
              },
              {
                title: "Practice Lab: Status Tooltip Copy",
                content:
                  "Practice the pure lookup behind the three tier labels.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement `tooltipForStatus(status)` returning the tooltip copy for a tier: `'Good Standing — cumulative GPA of 3.0 or higher'` for `good`, `'Warning — cumulative GPA between 2.0 and 2.99'` for `warning`, `'Probation — cumulative GPA below 2.0, book a meeting with your advisor'` for `probation`, and `null` for anything else.",
                  language: "typescript",
                  starter_code:
                    "export function tooltipForStatus(status: string): string | null {\n  // TODO\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO",
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "tooltipForStatus",
                  test_cases: [
                    {
                      input: ["good"],
                      expected: "Good Standing — cumulative GPA of 3.0 or higher",
                      label: "good standing copy",
                    },
                    {
                      input: ["warning"],
                      expected: "Warning — cumulative GPA between 2.0 and 2.99",
                      label: "warning copy",
                    },
                    {
                      input: ["probation"],
                      expected: "Probation — cumulative GPA below 2.0, book a meeting with your advisor",
                      label: "probation copy",
                    },
                    {
                      input: ["unknown"],
                      expected: null,
                      label: "unknown status",
                    },
                  ],
                  hints: [
                    "Use a plain object keyed by status.",
                    "const table: Record<string, string> = { good: '…', warning: '…', probation: '…' }; return table[status] ?? null;",
                    "const table: Record<string, string> = { good: ___, warning: ___, probation: ___ }; return table[status] ?? ___;",
                  ],
                },
                order: 5,
              },
              {
                title: "Key Takeaway",
                content:
                  "`InfoTooltip` renders a `tooltip`-role element named by its `label`, hidden with `opacity-0` and `pointer-events-none` and revealed with `group` + `group-hover:opacity-100`, and the standing page wraps each status badge with it and carries the three tier strings in its source.",
                order: 6,
              },
            ],
          },
          hints: {
            create: [
              {
                description: "Create `src/components/InfoTooltip.tsx` exporting `InfoTooltip`, rendering an element with `role='tooltip'` whose accessible name is the `label` prop.",
                order: 1,
              },
              {
                description: "Put `group` on the wrapper, and `opacity-0`, `pointer-events-none` and `group-hover:opacity-100` on the tooltip, so it is hidden until hover.",
                order: 2,
              },
              {
                description: "In `getStatusBadge` on the standing page, wrap each badge in `InfoTooltip` with the matching tier copy, and make sure all three strings appear literally in the page source.",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Create src/components/InfoTooltip.tsx exporting InfoTooltip that renders an element with role='tooltip' whose text is the label prop",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Verify the tooltip is hidden by default with the classes opacity-0 and pointer-events-none",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Verify the wrapper carries the `group` class and the tooltip reveals on hover via group-hover:opacity-100",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Wrap the academic status badge on the standing page in InfoTooltip with a label matching 'good standing ... cumulative GPA ... 3.0'",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "Include the Warning tier tooltip copy in standing/page.tsx (matches 'warning ... GPA ... 2.0 ... 2.99')",
                is_required: true,
                order: 5,
              },
              {
                description:
                  "Include the Probation tier tooltip copy in standing/page.tsx (matches 'probation ... GPA below 2.0 ... advisor')",
                is_required: true,
                order: 6,
              },
            ],
          },
        },
        {
          task_name: "SemesterGroup Accordion on the Grades Page",
          test_type: "both",
          user_story:
            "As a student, I want the All Semesters tab collapsed into one expandable group per term so that I can open only the term I care about.",
          learning_sections: {
            create: [
              {
                title: "Overview\nAn Expandable Section",
                content:
                  "Create `src/components/SemesterGroup.tsx` exporting `SemesterGroup`, which takes a `title` string, an optional `defaultOpen` boolean, and `children`. It renders one `button` for the title and a body that holds the children, and the body is only in the document while the group is open.",
                order: 1,
              },
              {
                title: "The Trigger Button",
                content:
                  "The trigger is a real `button` element, not a `div` with an onClick. Its accessible name is the `title` prop, so `<SemesterGroup title='Section A'>` is queried with the name `Section A`.\n\nIt also reports the expansion state through `aria-expanded`, which is `true` while the body is showing and `false` while it is not:\n\n<button type='button' aria-expanded={open} onClick={() => setOpen((value) => !value)}>\n  {title}\n</button>\n\nWithout `defaultOpen`, the expanded state starts `false`, so `aria-expanded` starts `false`.",
                order: 2,
              },
              {
                title: "Conditional Body",
                content:
                  "The body is not rendered at all while collapsed, so the children are returned only when the group is open:\n\n{open && <div>{children}</div>}\n\nThat is why the child text is absent from the document before the click and present after it. Hiding with a class alone would leave the text queryable, so the content has to be unmounted while collapsed.",
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
                  "The trigger is a `button` named by its `title` prop, the body is absent from the document while collapsed, and `aria-expanded` reports the current state with `defaultOpen` seeding it.",
                order: 7,
              },
            ],
          },
          hints: {
            create: [
              {
                description: "Create `src/components/SemesterGroup.tsx` exporting `SemesterGroup` with `title`, an optional `defaultOpen` and `children`.",
                order: 1,
              },
              {
                description: "Render `title` on a real `button` that toggles `aria-expanded`, and render `{children}` only while it is open so they are absent from the document when collapsed.",
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
                  "Create src/components/SemesterGroup.tsx exporting SemesterGroup that renders a button named by its `title` prop with aria-expanded",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Render SemesterGroup without defaultOpen and verify the button's aria-expanded is 'false'",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Verify children are not in the document when collapsed, and clicking the button shows children and sets aria-expanded='true'",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Render SemesterGroup with defaultOpen and verify children are visible on first render with aria-expanded='true'",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "Switch to All Semesters tab and verify two buttons exist for '1st semester — 2025-2026' and '2nd semester — 2024-2025'",
                is_required: true,
                order: 5,
              },
              {
                description:
                  "Verify the first semester group has aria-expanded='true' by default",
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
    subtitle: "Add `/dashboard/courses/[courseCode]`, plus a `Modal` primitive and a three-step `RequestDocumentDialog`",
    order: 4,
    level_description:
      "Mission Briefing: the grades table has no way into a single course, and there is no way for a student to ask the registrar for a document. Create `src/app/dashboard/courses/[courseCode]/page.tsx` as a dynamic route that decodes the `courseCode` segment, merges the matching entry from `grades` in `src/lib/mockData.ts` with the matching entry from `schedule` for the professor, and falls back to a `Course not found` state with a link back to `/dashboard/grades`. Add a `View Details` link per grade row pointing at the URL-encoded route. Then create `src/components/ui/modal.tsx` exporting a `Modal` primitive and build `src/components/RequestDocumentDialog.tsx`, a three-step request flow rendered inside it, and put a `Request Document` trigger on the dashboard.",
    xp_reward: 60,
    coin_reward: 150,
    key_takeaways:
      "A dynamic route segment arrives percent-encoded, so `CS 301` reaches the page as `params.courseCode === 'CS%20301'` and has to be decoded before it is matched against `grade.courseCode`. A course detail view needs two mock arrays: `grades` for the code, name, units and grade, and `schedule` for the professor, because `CS 301` is a `3` unit `A` taught by `Dr. Sarah Johnson`. A modal that is closed must render nothing at all rather than a hidden container, so the `Modal` primitive returns nothing while `open` is false, and while it is open it renders `role='dialog'` with `aria-modal='true'`. A multi-step form has to gate each step: `Next` waits for a document type, `Submit` waits for a purpose of at least 10 characters, and the confirmation step prints the chosen type, the purpose text and a reference number matching `/REQ-[A-Z0-9]{6}/`.",
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
          task_name: "Multi-Step Request Document Flow on a Modal Primitive",
          test_type: "both",
          user_story:
            "As a student, I want a `Request Document` dialog that walks me through picking a document and writing a purpose, so that I can send the registrar a valid request.",
          learning_sections: {
            create: [
              {
                title: "Overview\nA Modal Primitive and a Three-Step Flow",
                content:
                  "Two files. First `src/components/ui/modal.tsx` exporting a `Modal` primitive that takes `open`, `onClose` and `children`. Then `src/components/RequestDocumentDialog.tsx` exporting `RequestDocumentDialog`, which takes the same `open` and `onClose`, owns the three steps, and renders its body inside `Modal`.",
                order: 1,
              },
              {
                title: "The Modal Contract",
                content:
                  "When `open` is true the modal renders an element with `role='dialog'` and `aria-modal='true'`. When `open` is false it renders nothing at all, so the container has no first child:\n\nif (!open) return null;\n\nReturning nothing is graded directly: the check renders `Modal` with `open={false}` and requires `container.firstChild` to be `null`. A hidden wrapper would leave an empty element in the document and fail.",
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
                  "Step 2 is a single textbox plus `Submit` and `Back`. `Submit` starts `disabled`, stays `disabled` for the nine-character string `too short`, and becomes enabled at ten characters, for example `For my job application portfolio.`.\n\nconst purposeOk = purpose.trim().length >= 10;\n\n`Back` returns to step 1, which is verified by the `Next` button being back on screen.",
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
                  "`Modal` renders `role='dialog'` with `aria-modal='true'` while open and nothing while closed; `RequestDocumentDialog` builds on it, gates `Next` on a chosen type and `Submit` on a 10-character purpose, and prints the type, the purpose and a `REQ-` reference on the confirmation step.",
                order: 7,
              },
            ],
          },
          hints: {
            create: [
              {
                description: "Create `src/components/ui/modal.tsx` exporting `Modal({ open, onClose, children })` that returns `null` when closed and otherwise renders `role='dialog'` with `aria-modal='true'`.",
                order: 1,
              },
              {
                description: "Create `src/components/RequestDocumentDialog.tsx` rendering inside `Modal`; rendering a hidden wrapper instead of nothing when closed is the easiest failure.",
                order: 2,
              },
              {
                description: "Self-check: step 1 `Next` disabled until chosen; step 2 `Submit` at 10+ chars and `Back` returns to step 1; step 3 shows 'Request submitted!', the type, the purpose and a `REQ-` ref with a `Done` button; the dashboard shows a `Request Document` trigger.",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Create src/components/ui/modal.tsx exporting Modal that renders role='dialog' with aria-modal='true' when open and nothing when closed",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Render Modal with open=false and verify the container's first child is null",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Verify step 1 shows a disabled 'Next' button, and selecting a document type (e.g., Transcript) enables it",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Verify step 2 shows a purpose textbox with a disabled 'Submit' button and a 'Back' button; 'Submit' enables at 10+ chars; clicking 'Back' returns to step 1",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "Complete the flow: choose 'Enrollment Certificate', enter 'Visa application requirement.', click 'Submit', and verify the confirmation shows 'Request submitted!', the document type, the purpose, and a reference matching REQ-[A-Z0-9]{6}, plus a 'Done' button",
                is_required: true,
                order: 5,
              },
              {
                description:
                  "Add a 'Request Document' trigger button on the dashboard that opens the dialog",
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
    id: "nextjs-shadcn-ui-scenario-3-level-5",
    title: "Derived Aggregates and an Accessibility Sweep",
    subtitle: "Compute units and earned credits from `grades`, then fix the skip link, landmarks and labels in the dashboard layout",
    order: 5,
    level_description:
      "Mission Briefing: the standing and dashboard pages both read `currentStanding.totalUnits` and `currentStanding.earnedCredits`, which are stale numbers that disagree with the eight-row `grades` array. Export `computeCurrentSemesterUnits` and `computeEarnedCredits` from `src/lib/mockData.ts`, use them on `src/app/dashboard/standing/page.tsx` and `src/app/dashboard/page.tsx`, and remove every `currentStanding.totalUnits` and `currentStanding.earnedCredits` read from those two files. Then sweep `src/app/dashboard/layout.tsx` for accessibility: a `Skip to main content` link as the very first focusable element targeting `#main-content`, a `main` landmark with `id='main-content'` and `tabindex='-1'`, a `nav` named `Primary`, exactly one `aria-current='page'` on the active sidebar item, `aria-label` on the two icon-only buttons, and an `sr-only` `h1` reading `Riverside University` inside the `header`.",
    xp_reward: 75,
    coin_reward: 200,
    key_takeaways:
      "Aggregate numbers that live in a hand-maintained object drift from the rows they describe, so they get derived instead: `computeCurrentSemesterUnits(grades)` sums only the current `(semester, academicYear)` rows and returns 12, and `computeEarnedCredits(grades)` sums `units` for every grade that is not `F` and returns 24. The two pages are then checked as source, not just as render output, so a leftover `currentStanding.totalUnits` reference fails even when the rendered number happens to look right. The layout sweep is the same shape: each fix is a specific attribute on a specific element, the skip link has to be the first element matching `a, button, [tabindex]`, exactly one element may carry `aria-current='page'`, and the visually hidden page title is an `h1` with the `sr-only` class inside the `header` landmark rather than a second visible heading.",
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
          task_name: "Dashboard Layout Accessibility Sweep",
          test_type: "both",
          user_story:
            "As a keyboard or screen reader user, I want a skip link, real landmarks and named icon buttons in the dashboard shell so that I can navigate the portal without seeing it.",
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
                  "The `header` needs an `h1`, but the visible brand text is a `span`, so the heading is added as a visually hidden duplicate with the `sr-only` class:\n\n<header ...><h1 className='sr-only'>Riverside University</h1>...</header>\n\nThe `h1` has to be inside the `header` element, which is why it cannot live in the `layout.tsx` of the app root. The two icon buttons are looked up by accessible name matching `/toggle sidebar/i` and `/sign out/i`.",
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
                  "Skip link first, `main` with the id it targets, a nav named `Primary`, one `aria-current='page'`, two `aria-label`led icon buttons, and an `sr-only` `h1` reading `Riverside University` inside the `header`.",
                order: 7,
              },
            ],
          },
          hints: {
            create: [
              {
                description: "`src/app/dashboard/layout.tsx`: skip link first; focusable `main`; `nav` named; `aria-current=page`; `aria-label` icons; `sr-only` h1.",
                order: 1,
              },
              {
                description: "Self-check: skip link first focusable; `main` `tabIndex={-1}`; one `aria-current=page`; icons named; hidden h1 inside the header.",
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
            ],
          },
        },
      ],
    },
  },
];
