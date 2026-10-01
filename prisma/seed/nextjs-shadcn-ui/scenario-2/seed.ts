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
    title: "Booting the Support Portal",
    subtitle: "Install dependencies, add four shadcn/ui components, and fix the login wording",
    order: 1,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: A new developer starts on the City Hall support portal and needs a working baseline before any feature work. Install the project dependencies, confirm `pnpm dev` prints a ready line, add the shadcn/ui Alert, Toast, ScrollArea and Badge components, and fix the wording on the agent login page.",
    xp_reward: 10,
    coin_reward: 20,
    key_takeaways:
      "`pnpm install` creates a `node_modules` directory containing both `next` and `react`, which is what the project check looks for.\n\n`pnpm dev` printing `ready` or `Local:` is the signal that the dev server actually started.\n\nshadcn/ui components are copied into `src/components/ui/`, so each component file in that directory has to define the exact export names the rest of the portal imports from it.",
    scenario_id: "nextjs-shadcn-ui-scenario-2",
    tasks: {
      create: [
        {
          task_name: "Project Setup and the shadcn/ui Components",
          test_type: "both",
          user_story:
            "As a developer, I want dependencies installed and the Alert, Toast, ScrollArea and Badge components in the project source so that the portal runs locally from a clean checkout.",
          learning_sections: {
            create: [
              {
                title: "Overview\nBooting the Support Portal",
                content:
                  "This level has two short tasks. The first installs dependencies, adds four shadcn/ui components, and confirms `pnpm dev` starts. The second fixes the submit wording on the agent login page.",
                order: 1,
              },
              {
                title: "What Lives Where",
                content:
                  "A Next.js App Router project is structured like:\n\nproject/\n  src/\n    app/          routes and pages\n      agent/login/  /agent/login\n      agent/        /agent\n      support/       /support\n    components/ui/  shadcn/ui components\n    lib/            shared helpers\n  package.json      scripts and dependencies\n\n`pnpm install` reads `package.json` and writes `node_modules`. Nothing is added to `src` by the install step.",
                order: 2,
              },
              {
                title: "Adding a shadcn/ui Component",
                content:
                  "shadcn/ui components are copied into the project source instead of being imported from a package, one file per component:\n\npnpm dlx shadcn@latest add alert\npnpm dlx shadcn@latest add toast\npnpm dlx shadcn@latest add scroll-area\npnpm dlx shadcn@latest add badge\n\n`src/components/ui/alert.tsx` defines `Alert`, `AlertTitle` and `AlertDescription`. `src/components/ui/toast.tsx` defines `Toast`, `ToastProvider`, `ToastViewport`, `ToastTitle`, `ToastDescription`, `ToastAction` and the `useToast` hook. `src/components/ui/scroll-area.tsx` defines `ScrollArea`, `ScrollBar` and `ScrollAreaViewport`. `src/components/ui/badge.tsx` defines `Badge`, and it has to keep a `variant` prop and forward its ref.",
                order: 3,
              },
              {
                title: "Checking the Dev Server",
                content:
                  "`pnpm dev` starts the Next.js development server. The run is treated as successful once its output matches `/ready|Local:/i`, and it is given 30 seconds to print that. A non-zero exit before the ready line is a failure.",
                order: 4,
              },
              {
                title: "Practice Lab: Check the Installed Tree",
                content:
                  "Practice the small pure check behind the dependency assertion.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement hasPackage(dir, name) returning true when the directory listing contains an entry exactly equal to name. Do not match on a prefix.\n\nExamples: hasPackage(['next', 'react'], 'react') -> true.",
                  language: "javascript",
                  starter_code:
                    "export function hasPackage(dir, name) {\n  // TODO\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO",
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "hasPackage",
                  test_cases: [
                    {
                      input: [["next", "react"], "react"],
                      expected: true,
                      label: "react is present",
                    },
                    {
                      input: [["next", "react"], "vite"],
                      expected: false,
                      label: "missing package",
                    },
                    {
                      input: [["next"], "nextjs"],
                      expected: false,
                      label: "no prefix matching",
                    },
                  ],
                  hints: [
                    "Compare entries for equality, not with startsWith.",
                    "return dir.some((entry) => entry === name);",
                    "return dir.some((entry) => entry === ___);",
                  ],
                },
                order: 5,
              },
              {
                title: "Key Takeaway",
                content:
                  "The baseline is four things: `node_modules` holding `next` and `react`, a dev server that prints `ready` or `Local:`, and four component files in `src/components/ui/` that export the exact names the rest of the portal imports.",
                order: 6,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Run `pnpm install` in the project root, then confirm `node_modules` holds both `next` and `react`",
                order: 1,
              },
              {
                description:
                  "Run `pnpm dlx shadcn@latest add alert`, `pnpm dlx shadcn@latest add toast`, `pnpm dlx shadcn@latest add scroll-area` and `pnpm dlx shadcn@latest add badge`, which copy the components into your own source rather than a package",
                order: 2,
              },
              {
                description:
                  "Open `src/components/ui/alert.tsx`, `src/components/ui/toast.tsx`, `src/components/ui/scroll-area.tsx` and `src/components/ui/badge.tsx`, and check each exports the names the portal imports: `Alert`, `AlertTitle`, `AlertDescription`; `Toast`, `ToastProvider`, `ToastViewport`, `ToastTitle`, `ToastDescription`, `ToastAction`, `useToast`; `ScrollArea`, `ScrollBar`, `ScrollAreaViewport`; and `Badge` with a `variant` prop that forwards its ref",
                order: 3,
              },
              {
                description:
                  "Run `pnpm dev` at the project root and confirm its output prints `ready` or `Local:` within 30 seconds",
                order: 4,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "The user runs `pnpm install` in the project root, which creates a `node_modules` directory containing both `next` and `react`",
                is_required: true,
                order: 1,
              },
              {
                description: "Dev server started by `pnpm dev` at the project root prints output matching `/ready|Local:/i` within 30 seconds",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "`src/components/ui/alert.tsx` exists and its content matches `/\\bAlert\\b/`, `/\\bAlertTitle\\b/`, and `/\\bAlertDescription\\b/`",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "`src/components/ui/toast.tsx` exists and its content matches `/\\bToast\\b/`, `/\\bToastProvider\\b/`, `/\\bToastViewport\\b/`, `/\\bToastTitle\\b/`, `/\\bToastDescription\\b/`, `/\\bToastAction\\b/`, and `/\\buseToast\\b/`",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "`src/components/ui/scroll-area.tsx` exists and its content matches `/\\bScrollArea\\b/`, `/\\bScrollBar\\b/`, and `/\\bScrollAreaViewport\\b/`",
                is_required: true,
                order: 5,
              },
              {
                description:
                  "`src/components/ui/badge.tsx` exists and its content matches `/\\bBadge\\b/`, `/variant/`, and `/forwardRef/`",
                is_required: true,
                order: 6,
              },
            ],
          },
        },
        {
          task_name: "Rebrand the Agent Login Button",
          test_type: "both",
          user_story:
            "As an agent, I want the login button to read Login instead of Sign In so that the wording matches the rest of the portal.",
          learning_sections: {
            create: [
              {
                title: "Overview\nConsistent Wording on the Login Page",
                content:
                  "This section walks through the one-word change on `src/app/agent/login/page.tsx` and how it is checked. The check reads the file as text with `//` and `/* */` comments removed, then looks for `Login` and for the absence of `Sign In`.",
                order: 1,
              },
              {
                title: "Where the Label Lives",
                content:
                  "The submit button has an idle label and a loading label:\n\n// Before\nidle     -> Sign In\nloading  -> Signing in...\n\n// After\nidle     -> Login\nloading  -> Signing in...\n\nThe idle label is the `Button` child rendered when `isLoading` is false. The loading label `Signing in...` does not contain the string `Sign In`, so it is safe to leave as it is.",
                order: 2,
              },
              {
                title: "Comments Are Stripped Before Checking",
                content:
                  "The check removes line comments and block comments before it looks for the text. So a leftover `Sign In` inside a comment is harmless:\n\n// TODO: keep Sign In wording for the SSO button\n\nThat comment is deleted before the comparison, so only JSX and string literals are searched. The header `Agent Login` is fine too, because it contains `Login` and not `Sign In`.",
                order: 3,
              },
              {
                title: "The Working Tree is the Contract",
                content:
                  "The check reads the file on disk, not the rendered page. That means the label has to be in the source, not injected at runtime.",
                order: 4,
              },
              {
                title: "Practice Lab: Update Button Label",
                content:
                  "Practice the label change in isolation before applying it to the page.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions: "Update `getAgentButtonLabel()` to return `Login` instead of `Sign In`.",
                  language: "typescript",
                  starter_code:
                    "export function getAgentButtonLabel() {\n  return `Sign In`;\n}\n",
                  editable_regions: [
                    {
                      placeholder: "Sign In",
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "getAgentButtonLabel",
                  test_cases: [
                    {
                      input: [],
                      expected: "Login",
                      label: "updated button label",
                    },
                  ],
                  hints: [
                    "Replace the returned string.",
                    "Return `Login`.",
                    "return `___`;",
                  ],
                },
                order: 5,
              },
              {
                title: "Key Takeaway",
                content:
                  "Wording is part of the product. Keeping the label in the source rather than a constant elsewhere keeps the page checkable and consistent.",
                order: 6,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Open `src/app/agent/login/page.tsx` and find the submit `Button` whose idle child text is `Sign In`",
                order: 1,
              },
              {
                description:
                  "Change that idle child to `Login`; the loading branch reads `Signing in...`, which is not the string `Sign In` and can stay as it is",
                order: 2,
              },
              {
                description:
                  "Save and reread the file: with comments stripped it must contain `Login` and no `Sign In` left",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "`src/app/agent/login/page.tsx` contains `Login` and does not contain `Sign In` once `//` line comments and `/* */` block comments are stripped",
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
    id: "nextjs-shadcn-ui-scenario-2-level-2",
    title: "Escalate Unmatched Chat and Add Quick Replies",
    subtitle: "Offer a handoff to a human when the helper cannot answer, and give agents one-click reply snippets",
    order: 2,
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: The citizen chat on `/support` answers with the first keyword it finds, and when nothing matches the citizen gets a generic line with no route to a human. Replace that silence with a shadcn/ui Alert banner offering an escalation, then add a `src/lib/quickReplies.ts` snippet library rendered inside a shadcn/ui ScrollArea on the agent dashboard.",
    xp_reward: 25,
    coin_reward: 50,
    key_takeaways:
      "A banner that is already on screen when the page renders means the citizen never has to guess that a human exists, and the heading is what names the outcome in the alert itself.\n\nThe warning look is written as classes on the alert element, `border-l-4`, `border-amber-500`, `bg-amber-50` and `text-amber-900`, rather than left to a variant name.\n\nSnippet data as `{ id, label, text }` lets the dashboard render one button per snippet inside a named `region`, use `label` as the accessible name, and append `text` to whatever the agent already typed.",
    scenario_id: "nextjs-shadcn-ui-scenario-2",
    tasks: {
      create: [
        {
          task_name: "Fallback Alert for Unmatched Support Chat",
          test_type: "both",
          user_story:
            "As a citizen, I want an alert offering a handoff to a human agent when the helper cannot answer so that I am not stuck in an automated loop.",
          learning_sections: {
            create: [
              {
                title: "Overview\nA Visible Route to a Human",
                content:
                  "This section walks through putting a shadcn/ui Alert on `src/app/support/page.tsx` above the chat messages. Today an unmatched message gets a generic reply line and nothing else. The alert is rendered as soon as the page loads, not after a particular message, so a citizen who has not typed yet still sees that a human is available.",
                order: 1,
              },
              {
                title: "The Alert Component",
                content:
                  "`src/components/ui/alert.tsx` was added in Level 1. It exports `Alert` as the container plus `AlertTitle` and `AlertDescription` for the two text slots. Import it by its own path:\n\nimport { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';\n\nThe container is the element that carries the alert role, so both the role and the styling belong on `Alert`.",
                order: 2,
              },
              {
                title: "Writing the Warning Look",
                content:
                  "The container carries the warning colours as classes, so the banner reads as a notice rather than as more chat text:\n\n<Alert className={'border-l-4 border-amber-500 bg-amber-50 text-amber-900'}>\n\nThe four classes are `border-l-4`, `border-amber-500`, `bg-amber-50` and `text-amber-900`.",
                order: 3,
              },
              {
                title: "Naming the Outcome in the Title",
                content:
                  "The title is the part a citizen scans first, so it has to say who is on the other end. `AlertTitle` is rendered as the only level 5 heading, and its text matches `/human agent|escalat/i`. Beside it goes a single `button` whose accessible name matches `/escalate|transfer|human agent/i`, which is what the citizen presses to start the handoff. Clicking it must not throw or unmount the alert.",
                order: 4,
              },
              {
                title: "Practice Lab: Zero Hits Means Escalate",
                content:
                  "Practice the small decision behind the banner: a score of zero keyword hits is the one case that needs a human.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement needsEscalation(score) returning true when the keyword score is 0 and false for any higher score. Return false for a negative score too.\n\nExamples: needsEscalation(0) -> true.",
                  language: "javascript",
                  starter_code:
                    "export function needsEscalation(score) {\n  // TODO\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO",
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "needsEscalation",
                  test_cases: [
                    {
                      input: [0],
                      expected: true,
                      label: "no keyword hits",
                    },
                    {
                      input: [3],
                      expected: false,
                      label: "a matched intent answers itself",
                    },
                    {
                      input: [-2],
                      expected: false,
                      label: "a negative score is not the fallback case",
                    },
                  ],
                  hints: [
                    "The fallback case is the single value 0, so compare for equality rather than for less than.",
                    "return score === 0;",
                    "return score === ___;",
                  ],
                },
                order: 5,
              },
              {
                title: "Key Takeaway",
                content:
                  "Offering a human on the first screen beats offering one after three turns of guessing. Writing the warning colours on the container itself means the banner looks like a notice without needing a separate variant.",
                order: 6,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "In `src/app/support/page.tsx`, import from `@/components/ui/alert` and render an `Alert` above the chat messages that is on screen as soon as the page loads, before the citizen has sent anything",
                order: 1,
              },
              {
                description:
                  "Give the `Alert` container the classes `border-l-4 border-amber-500 bg-amber-50 text-amber-900`, and make its `AlertTitle` the only level 5 heading with text naming a human agent or escalation",
                order: 2,
              },
              {
                description:
                  "Add one `button` whose accessible name matches `/escalate|transfer|human agent/i` beside that title, then reload and confirm it is still the only element with the `alert` role",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "`src/app/support/page.tsx` imports from `@/components/ui/alert` and its source contains `Alert`, `AlertTitle` or `AlertDescription`",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Rendering the support page shows exactly one element with the `alert` role, carrying the classes `border-l-4`, `border-amber-500`, `bg-amber-50` and `text-amber-900`",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Rendering the support page shows exactly one heading at level 5 whose text matches `/human agent|escalat/i`",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Rendering the support page shows exactly one `button` whose accessible name matches `/escalate|transfer|human agent/i`, and clicking that button leaves it in the document instead of throwing",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "The `alert` role element is present on the support page immediately after render, with no chat message sent first",
                is_required: true,
                order: 5,
              },
            ],
          },
        },
        {
          task_name: "Quick Reply Snippets in a Scroll Area",
          test_type: "both",
          user_story:
            "As an agent, I want canned replies I can drop into the message box with one click from a scrolled snippet list so that I do not retype the same sentences every day.",
          learning_sections: {
            create: [
              {
                title: "Overview\nQuick Reply Snippets",
                content:
                  "This section walks through building a snippet library in `src/lib/quickReplies.ts` and rendering a row of one-click buttons inside a shadcn/ui ScrollArea on `src/app/agent/page.tsx`. Each snippet is `{ id, label, text }`: `label` is the button text, `text` is what gets inserted.",
                order: 1,
              },
              {
                title: "The Snippet Shape",
                content:
                  "A snippet needs three string fields. `id` is a stable React key, `label` is what the agent reads on the button, and `text` is the message body:\n\nexport interface QuickReply {\n  id: string;\n  label: string;\n  text: string;\n}\n\nexport const quickReplies: QuickReply[] = [\n  {\n    id: 'greeting',\n    label: 'Greeting',\n    text: 'Hello, thank you for contacting City Hall support. How can I help you today?',\n  },\n];\n\nThe array must not be empty and every `text` must have at least one character.",
                order: 2,
              },
              {
                title: "Rendering in a Named Scroll Area",
                content:
                  "Wrap the snippet buttons in a `ScrollArea` from `@/components/ui/scroll-area`. Give the wrapper `role='region'` and an accessible name containing `Quick replies`, so the whole snippet list is one labelled landmark rather than loose buttons:\n\n<ScrollArea className='w-full' role='region' aria-label='Quick replies'>\n  <ScrollBar />\n  <ScrollAreaViewport>\n    {quickReplies.map((reply) => (\n      <Button key={reply.id} variant='outline' onClick={() => insertSnippet(reply)}>\n        {reply.label}\n      </Button>\n    ))}\n  </ScrollAreaViewport>\n</ScrollArea>\n\nMap the array to buttons so each one is reachable by its label alone. The label is the accessible name, so keep it short and unique: anything else inside the button would change its accessible name and break the match. The scrollbar and the viewport come from the component itself, so they are present without any extra markup.",
                order: 3,
              },
              {
                title: "Inserting Without Losing Typed Text",
                content:
                  "Appending beats overwriting. The agent may have half-written a reply, so concatenate instead of replacing:\n\nconst insertSnippet = (reply: QuickReply) => {\n  setMessageInput((current) => (current ? `${current} ${reply.text}` : reply.text));\n};\n\nThe input controlled by `messageInput` has the placeholder `Type your response...`, and after a click it holds both the draft and the snippet text.",
                order: 4,
              },
              {
                title: "Practice Lab: Append a Snippet",
                content:
                  "Practice the pure string step behind the insert handler: joining what is already typed with the snippet text.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement appendSnippet(current, text) returning the current text with the snippet text appended after it. Use a single space between the two when `current` is not empty, and return just the snippet text when `current` is empty.\n\nExamples: appendSnippet('Hi there.', 'How can I help?') -> 'Hi there. How can I help?'.",
                  language: "javascript",
                  starter_code:
                    "export function appendSnippet(current, text) {\n  // TODO\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO",
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "appendSnippet",
                  test_cases: [
                    {
                      input: ["", "How can I help?"],
                      expected: "How can I help?",
                      label: "empty input returns the snippet alone",
                    },
                    {
                      input: ["Hi there.", "How can I help?"],
                      expected: "Hi there. How can I help?",
                      label: "typed text is preserved",
                    },
                    {
                      input: ["Checking now. ", "Any other details?"],
                      expected: "Checking now. Any other details?",
                      label: "no extra space after a trailing space",
                    },
                  ],
                  hints: [
                    "Trim the end of the current text, then decide on the separator.",
                    "const left = current.trimEnd(); return left ? `${left} ${text}` : text;",
                    "const left = current.trimEnd(); return left ? `${left} ___` : ___;",
                  ],
                },
                order: 5,
              },
              {
                title: "Key Takeaway",
                content:
                  "Keeping snippets as data in `src/lib/quickReplies.ts` means the dashboard stays a renderer with no hardcoded copy. Insertion appends to the input, so a snippet never discards a draft the agent already wrote. Putting the buttons in a named `region` means the list can still be found when the dashboard grows.",
                order: 6,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Export the snippet array from `src/lib/quickReplies.ts` with a string `id`, `label`, and non-empty `text`, and confirm `src/components/ui/scroll-area.tsx` exports `ScrollArea`, `ScrollBar` and `ScrollAreaViewport`",
                order: 1,
              },
              {
                description:
                  "On the dashboard, wrap the snippet buttons in a `ScrollArea` with `role='region'` and an accessible name matching `/quick replies/i`, and give each button `reply.label` as its only child so the name matches exactly",
                order: 2,
              },
              {
                description:
                  "The rule to get right: a click appends `reply.text` to what the agent already typed, never replacing the draft",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description: "`src/lib/quickReplies.ts` exists",
                is_required: true,
                order: 1,
              },
              {
                description: "`src/lib/quickReplies.ts` exports an array of at least one snippet, either as the named export `quickReplies` or as the default export, and every snippet has a string `id`, a string `label`, and a non-empty string `text`",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "`src/app/agent/page.tsx` renders one `button` per snippet whose full accessible name matches that snippet's `label` exactly (anchored, case-insensitive)",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "`src/components/ui/scroll-area.tsx` exists and its content matches `/\\bScrollArea\\b/`, `/\\bScrollBar\\b/`, and `/\\bScrollAreaViewport\\b/`",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "`src/app/agent/page.tsx` imports from `@/components/ui/scroll-area` and its source contains `ScrollArea`, `ScrollAreaViewport` or `ScrollBar`",
                is_required: true,
                order: 5,
              },
              {
                description:
                  "The agent dashboard renders exactly one element with the `region` role whose accessible name matches `/quick replies/i`, containing an element matching `[data-radix-scroll-area-scrollbar]`",
                is_required: true,
                order: 6,
              },
              {
                description:
                  "Clicking the button for the first snippet puts that snippet's `text` into the input matched by placeholder `/type your response/i`",
                is_required: true,
                order: 7,
              },
              {
                description:
                  "Clicking the button for the first snippet leaves text the agent already typed, for example `Hi there.`, present in the input matched by placeholder `/type your response/i`",
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
    id: "nextjs-shadcn-ui-scenario-2-level-3",
    title: "Triage: Priority Order and First-Reply Tracking",
    subtitle: "Sort the queue by priority score and badge conversations waiting on an agent",
    order: 3,
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: Conversations pile up in the dashboard in seed order, so an agent cannot tell which case needs attention first, and there is no signal for cases where a citizen is still waiting on a first human reply. Score each conversation in `src/lib/priority.ts`, render the list highest score first, then classify each conversation in `src/lib/sla.ts` and badge the ones still awaiting a first reply.",
    xp_reward: 40,
    coin_reward: 100,
    key_takeaways:
      "A resolved conversation always scores `0` regardless of unread messages, `waiting` outranks `active`, and each unread message adds to the score, so the sort is driven by need rather than arrival.\n\n`getPriorityLevel` turns a score into one of four tiers (`urgent`, `high`, `normal`, `low`) for display.\n\n`getServiceState` reduces a conversation to `resolved`, `awaiting-first-reply` or `in-progress` from its `status` and whether any message has `role: 'agent'`, which is what makes the first-reply badge derivable instead of hand-maintained.",
    scenario_id: "nextjs-shadcn-ui-scenario-2",
    tasks: {
      create: [
        {
          task_name: "Priority Scoring and Sorted Conversation List",
          test_type: "both",
          user_story:
            "As an agent, I want the conversation list ordered by priority so that the most urgent case is at the top when I open the dashboard.",
          learning_sections: {
            create: [
              {
                title: "Overview\nPriority Scoring",
                content:
                  "This section walks through building `src/lib/priority.ts` with `getPriorityScore` and `getPriorityLevel`, then sorting the conversation list on `src/app/agent/page.tsx` by that score. A conversation is described by its `status` (`active`, `waiting`, `resolved`), its `unreadCount`, and its `createdAt`.",
                order: 1,
              },
              {
                title: "Status Weights and the Resolved Shortcut",
                content:
                  "Status is the dominant term. Waiting on an agent outranks active, and resolved conversations drop out of the queue entirely:\n\nresolved -> 0\nactive   -> 10\nwaiting  -> 40\n\nA resolved conversation must return `0` even when it has unread messages, so return early on `status === 'resolved'` instead of adding the unread bonus.",
                order: 2,
              },
              {
                title: "The Unread Bonus",
                content:
                  "Unread messages raise the score so an active thread with five unread messages outranks an untouched one:\n\nconst STATUS_WEIGHT = { resolved: 0, active: 10, waiting: 40 } as const;\nconst UNREAD_WEIGHT = 10;\n\nexport function getPriorityScore(conv) {\n  if (conv.status === 'resolved') return 0;\n  return STATUS_WEIGHT[conv.status] + conv.unreadCount * UNREAD_WEIGHT;\n}\n\nThat gives waiting with 3 unread a score of 70, active with 2 unread 30, and resolved 0.",
                order: 3,
              },
              {
                title: "Mapping a Score to a Tier",
                content:
                  "The dashboard shows a word rather than a number. `getPriorityLevel` maps a conversation to one of four tiers:\n\nlow    -> score 0\nnormal -> below 40\nhigh   -> 40 to 49\nurgent -> 50 and above\n\nIt takes the same conversation object as `getPriorityScore` and calls it internally, so the two functions cannot drift.",
                order: 4,
              },
              {
                title: "Sorting the List",
                content:
                  "Sort a copy before mapping to rows so the displayed order is deterministic. Comparing scores descending puts Maria Garcia (waiting) first, then John Smith (active with 2 unread), then Robert Johnson (resolved):\n\nconst ordered = [...conversations].sort(\n  (a, b) => getPriorityScore(b) - getPriorityScore(a)\n);",
                order: 5,
              },
              {
                title: "Practice Lab: Tier From a Score",
                content:
                  "Practice the tier boundaries used by `getPriorityLevel` as a standalone pure function.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement priorityTier(score) returning the tier name for a numeric priority score. Return 'low' for 0, 'normal' for 1 to 39, 'high' for 40 to 49, and 'urgent' for 50 and above.\n\nExamples: priorityTier(70) -> 'urgent'.",
                  language: "javascript",
                  starter_code:
                    "export function priorityTier(score) {\n  // TODO\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO",
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "priorityTier",
                  test_cases: [
                    {
                      input: [0],
                      expected: "low",
                      label: "zero is low",
                    },
                    {
                      input: [30],
                      expected: "normal",
                      label: "30 is normal",
                    },
                    {
                      input: [40],
                      expected: "high",
                      label: "40 is high",
                    },
                    {
                      input: [70],
                      expected: "urgent",
                      label: "70 is urgent",
                    },
                  ],
                  hints: [
                    "Check the boundaries from the bottom up.",
                    "if (score === 0) return 'low'; if (score < 40) return 'normal'; if (score < 50) return 'high'; return 'urgent';",
                    "if (score === 0) return 'low'; if (score < ___) return 'normal'; if (score < ___) return 'high'; return 'urgent';",
                  ],
                },
                order: 6,
              },
              {
                title: "Key Takeaway",
                content:
                  "Sorting by a computed score instead of seed order makes the queue match need. Keeping the resolved shortcut as an early return is what stops unread messages from pulling a finished case back into view.",
                order: 7,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Start in `src/lib/priority.ts`, exporting `getPriorityScore` and `getPriorityLevel`, then import from `src/app/agent/page.tsx`",
                order: 1,
              },
              {
                description:
                  "Score each conversation from its `status` and `unreadCount`, then sort a copy of the list by score descending before you map it to rows",
                order: 2,
              },
              {
                description:
                  "Self-check: the rows read Maria Garcia, then John Smith, then Robert Johnson, and a `resolved` conversation still scores `0`",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description: "`src/lib/priority.ts` exists and exports `getPriorityScore` and `getPriorityLevel` as functions",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "`getPriorityScore({ status: 'resolved', unreadCount: 9, createdAt: new Date() })` returns exactly `0`",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "`getPriorityScore` for `{ status: 'waiting', unreadCount: 0 }` is greater than its value for `{ status: 'active', unreadCount: 0 }`",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "`getPriorityScore` for `{ status: 'active', unreadCount: 5 }` is greater than its value for `{ status: 'active', unreadCount: 0 }`",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "`getPriorityLevel` returns `'urgent'` for `{ status: 'waiting', unreadCount: 3 }`, `'high'` for `{ status: 'waiting', unreadCount: 0 }`, `'normal'` for `{ status: 'active', unreadCount: 0 }`, and `'low'` for `{ status: 'resolved', unreadCount: 4 }`",
                is_required: true,
                order: 5,
              },
              {
                description: "`src/app/agent/page.tsx` imports from a path ending in `priority`",
                is_required: true,
                order: 6,
              },
              {
                description:
                  "The rendered conversation rows contain exactly three of the names John Smith, Maria Garcia and Robert Johnson, in this order: Maria Garcia, then John Smith, then Robert Johnson",
                is_required: true,
                order: 7,
              },
            ],
          },
        },
        {
          task_name: "First-Reply SLA Badges on the Dashboard",
          test_type: "both",
          user_story:
            "As an agent, I want each conversation row to show whether a citizen is still waiting on a first reply so that I know which cases are breaching.",
          learning_sections: {
            create: [
              {
                title: "Overview\nFirst-Reply Service States",
                content:
                  "This section walks through building `src/lib/sla.ts` with `hasAgentReplied` and `getServiceState`, then using `getServiceState` to badge rows on `src/app/agent/page.tsx`. A conversation carries `status` (`active`, `waiting`, `resolved`) and a `messages` array whose entries have a `role` of `system`, `customer` or `agent`.",
                order: 1,
              },
              {
                title: "Has an Agent Replied?",
                content:
                  "The first-reply check is a scan over `messages` for a `role` of `agent`. It must not depend on position or count:\n\nexport function hasAgentReplied(conversation) {\n  return conversation.messages.some((message) => message.role === 'agent');\n}\n\nA conversation of only `system` and `customer` messages returns `false`; adding one `agent` message flips it to `true`.",
                order: 2,
              },
              {
                title: "Three Service States",
                content:
                  "Resolved wins over everything else, then the reply check splits the remaining cases:\n\nexport function getServiceState(conversation) {\n  if (conversation.status === 'resolved') return 'resolved';\n  return hasAgentReplied(conversation) ? 'in-progress' : 'awaiting-first-reply';\n}\n\nThe three returned values are `'resolved'`, `'awaiting-first-reply'` and `'in-progress'`.",
                order: 3,
              },
              {
                title: "Badging the Rows",
                content:
                  "Only the awaiting case gets a badge, and it goes inside the row button so it travels with the conversation. Render the text `Awaiting first reply` when the state is `awaiting-first-reply`:\n\nimport { Badge } from '@/components/ui/badge';\n\n{getServiceState(conv) === 'awaiting-first-reply' && (\n  <Badge className='rounded-full font-medium'>Awaiting first reply</Badge>\n)}\n\nThe pill look comes from the component: the badge element carries `inline-flex`, `items-center`, `rounded-full`, `px-2.5`, `py-0.5`, `text-xs`, `font-medium` and `transition-colors`. In the seed data John Smith and Maria Garcia have no agent message, and Robert Johnson already has one.",
                order: 4,
              },
              {
                title: "Practice Lab: Derive the Service State",
                content:
                  "Practice the state decision as a pure function of `status` and the message roles.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement serviceState(status, roles) returning the service state string for a conversation. Return 'resolved' when status is 'resolved', 'in-progress' when roles includes 'agent', and 'awaiting-first-reply' otherwise.\n\nExamples: serviceState('active', ['system', 'customer']) -> 'awaiting-first-reply'.",
                  language: "javascript",
                  starter_code:
                    "export function serviceState(status, roles) {\n  // TODO\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO",
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "serviceState",
                  test_cases: [
                    {
                      input: ["resolved", ["customer", "agent"]],
                      expected: "resolved",
                      label: "resolved wins",
                    },
                    {
                      input: ["active", ["system", "customer"]],
                      expected: "awaiting-first-reply",
                      label: "no agent message",
                    },
                    {
                      input: ["waiting", ["system", "customer", "agent"]],
                      expected: "in-progress",
                      label: "agent has replied",
                    },
                  ],
                  hints: [
                    "Return the resolved case first, then check the roles array.",
                    "if (status === 'resolved') return 'resolved'; return roles.includes('agent') ? 'in-progress' : 'awaiting-first-reply';",
                    "if (status === 'resolved') return 'resolved'; return roles.includes('___') ? 'in-progress' : '___';",
                  ],
                },
                order: 5,
              },
              {
                title: "Key Takeaway",
                content:
                  "Deriving the badge from `status` and the messages means there is no second piece of state to keep in sync. Robert Johnson stays unbadged because his transcript already contains an `agent` message.",
                order: 6,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Create `src/lib/sla.ts` exporting `hasAgentReplied` and `getServiceState`, then call `getServiceState` from `src/app/agent/page.tsx`",
                order: 1,
              },
              {
                description:
                  "Reduce a conversation to `resolved`, `awaiting-first-reply` or `in-progress` from its `status` and whether any message has `role: 'agent'`",
                order: 2,
              },
              {
                description:
                  "Self-check: the John Smith and Maria Garcia rows each carry the text `Awaiting first reply` inside a `Badge` imported from `@/components/ui/badge`, with the pill classes `rounded-full` and `font-medium`, and the Robert Johnson row carries no badge",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "`src/lib/sla.ts` exists and exports `hasAgentReplied` and `getServiceState` as functions",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "`hasAgentReplied({ messages: [{ role: 'system' }, { role: 'customer' }, { role: 'customer' }] })` returns `false`",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "`hasAgentReplied({ messages: [{ role: 'customer' }, { role: 'agent' }] })` returns `true`",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "`getServiceState({ status: 'resolved', messages: [{ role: 'customer' }, { role: 'agent' }] })` returns `'resolved'`",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "`getServiceState({ status: 'active', messages: [{ role: 'system' }, { role: 'customer' }] })` returns `'awaiting-first-reply'`",
                is_required: true,
                order: 5,
              },
              {
                description:
                  "`getServiceState({ status: 'waiting', messages: [{ role: 'system' }, { role: 'customer' }, { role: 'agent' }] })` returns `'in-progress'`",
                is_required: true,
                order: 6,
              },
              {
                description:
                  "The row buttons named for John Smith and Maria Garcia each contain text matching `/awaiting first reply/i`, and the row button named for Robert Johnson does not",
                is_required: true,
                order: 7,
              },
              {
                description:
                  "At least two elements on the agent dashboard match the text `/awaiting first reply/i`",
                is_required: true,
                order: 8,
              },
              {
                description:
                  "`src/components/ui/badge.tsx` exists and its content matches `/\\bBadge\\b/`, `/variant/`, and `/forwardRef/`",
                is_required: true,
                order: 9,
              },
              {
                description:
                  "The element carrying `/awaiting first reply/i` inside the row button named for John Smith has the classes `inline-flex`, `items-center`, `rounded-full`, `px-2.5`, `py-0.5`, `text-xs`, `font-medium` and `transition-colors`",
                is_required: true,
                order: 10,
              },
              {
                description:
                  "`src/app/agent/page.tsx` imports from `@/components/ui/badge` and its source contains `Badge`",
                is_required: true,
                order: 11,
              },
            ],
          },
        },
      ],
    },
  },
  {
    id: "nextjs-shadcn-ui-scenario-2-level-4",
    title: "Queue Times and Keyboard-First Triage",
    subtitle: "Show citizens an estimated wait and drive the dashboard from the keyboard",
    order: 4,
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: The support page tells citizens they are connecting but never how long the wait is, and agents juggling three conversations lose time to the mouse. Build `src/lib/queue.ts` with `estimateWaitMinutes` and `formatWait`, show an estimated wait after the request form is submitted, then add ArrowUp and ArrowDown conversation selection plus Ctrl+Enter to send and Escape to clear on `src/app/agent/page.tsx`.",
    xp_reward: 60,
    coin_reward: 150,
    key_takeaways:
      "`estimateWaitMinutes(position, avgHandleMinutes)` multiplies the queue position by the average handle time, defaults that average to 4 minutes, and never returns a negative number.\n\n`formatWait` turns minutes into `less than a minute`, `about N minutes` or `over an hour`, and returns an empty string for `NaN` and `Infinity` so bad input never renders `NaN` in the UI.\n\nKeyboard handlers compare `event.key` against `ArrowDown`, `ArrowUp`, `Enter` with `ctrlKey`, and `Escape`, so the selection and the composer can share one `keydown` listener.",
    scenario_id: "nextjs-shadcn-ui-scenario-2",
    tasks: {
      create: [
        {
          task_name: "Estimated Wait on the Agent Request Form",
          test_type: "both",
          user_story:
            "As a citizen, I want to see how long the wait for an agent is once I submit a request so that I know whether to hold my phone or walk to City Hall.",
          learning_sections: {
            create: [
              {
                title: "Overview\nThe Queue Estimator",
                content:
                  "This section walks through building `src/lib/queue.ts` with `estimateWaitMinutes` and `formatWait`, then calling them from `src/app/support/page.tsx` after the request form is submitted. The form is reached by clicking the button whose name matches `/talk to agent/i` and is submitted with the button named `Submit Request`.",
                order: 1,
              },
              {
                title: "Minutes From a Queue Position",
                content:
                  "The estimate is position times average handle time, with a default average of 4 minutes:\n\nconst DEFAULT_AVG_HANDLE_MINUTES = 4;\n\nexport function estimateWaitMinutes(position, avgHandleMinutes = DEFAULT_AVG_HANDLE_MINUTES) {\n  return Math.max(0, position * avgHandleMinutes);\n}\n\nSo position 3 waits 12 minutes, position 2 with a 10 minute average waits 20, and a negative position clamps to 0 instead of showing a negative wait.",
                order: 2,
              },
              {
                title: "Turning Minutes into Copy",
                content:
                  "Three buckets cover the whole range. The literal text matters because it is what a citizen reads:\n\n0            -> less than a minute\n1 to 59      -> about N minutes\n60 and above -> over an hour\n\nAnything that is not a finite number returns an empty string so nothing renders `NaN minutes`.",
                order: 3,
              },
              {
                title: "Wiring the Estimate into the Form",
                content:
                  "The support page already tracks a queue position. Compute the estimate and render one element whose text starts with `Estimated wait`, and keep it the only such element on the page, so the wait and the position appear together:\n\nconst minutes = estimateWaitMinutes(2);\n<p>Estimated wait: {formatWait(minutes)}</p>\n\nThe form inputs it submits are matched by the placeholders `Enter your full name`, `Enter your address`, `City`, `ZIP Code`, and `Describe your issue`.",
                order: 4,
              },
              {
                title: "Practice Lab: Format the Wait",
                content:
                  "Practice the copy function that turns a number of minutes into the three wait descriptions.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement waitLabel(minutes) returning 'less than a minute' for 0, 'about N minutes' for 1 to 59, 'over an hour' for 60 and above, and an empty string for a value that is not a finite number.\n\nExamples: waitLabel(12) -> 'about 12 minutes'.",
                  language: "javascript",
                  starter_code:
                    "export function waitLabel(minutes) {\n  // TODO\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO",
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "waitLabel",
                  test_cases: [
                    {
                      input: [0],
                      expected: "less than a minute",
                      label: "zero minutes",
                    },
                    {
                      input: [12],
                      expected: "about 12 minutes",
                      label: "twelve minutes",
                    },
                    {
                      input: [75],
                      expected: "over an hour",
                      label: "seventy five minutes",
                    },
                    {
                      input: [null],
                      expected: "",
                      label: "not a number",
                    },
                  ],
                  hints: [
                    "Reject non-finite input first, then check the buckets from the bottom up.",
                    "if (!Number.isFinite(minutes)) return ''; if (minutes === 0) return 'less than a minute'; if (minutes < 60) return `about ${minutes} minutes`; return 'over an hour';",
                    "if (!Number.isFinite(minutes)) return ''; if (minutes === 0) return 'less than a minute'; if (minutes < ___) return `about ${minutes} ___`; return '___';",
                  ],
                },
                order: 5,
              },
              {
                title: "Key Takeaway",
                content:
                  "Position times handle time is enough to give a citizen a real answer. Handling `NaN` and `Infinity` inside `formatWait` keeps bad numbers out of the rendered text instead of pushing the check into every caller.",
                order: 6,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "In `src/lib/queue.ts` export `estimateWaitMinutes` and `formatWait`, then call them from `src/app/support/page.tsx` after the request is submitted",
                order: 1,
              },
              {
                description:
                  "The easy thing to miss at this level: `formatWait` has to return the empty string for `NaN` and `Infinity` so a bad number never reaches the page",
                order: 2,
              },
              {
                description:
                  "Self-check: submitting the request form shows one element reading `Estimated wait` whose text is `less than a minute`, `about N minutes` or `over an hour`",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "`src/lib/queue.ts` exists and exports `estimateWaitMinutes` and `formatWait` as functions",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "`estimateWaitMinutes(3)` returns `12`, using the default average handle time of 4 minutes",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "`estimateWaitMinutes(2, 10)` returns `20`, honouring a custom average handle time of 10 minutes",
                is_required: true,
                order: 3,
              },
              {
                description: "`estimateWaitMinutes(-3)` returns `0`, never a negative number",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "`formatWait(0)` matches `/less than a minute/i`, `formatWait(12)` matches `/about 12 minutes/i`, and `formatWait(75)` matches `/over an hour/i`",
                is_required: true,
                order: 5,
              },
              {
                description:
                  "`formatWait(NaN)` and `formatWait(Infinity)` both return the empty string",
                is_required: true,
                order: 6,
              },
              {
                description:
                  "On `src/app/support/page.tsx`, clicking the button matching `/talk to agent/i`, filling the inputs whose placeholders match `/enter your full name/i`, `/enter your address/i`, `/^city$/i`, `/zip code/i` and `/describe your issue/i`, then clicking the button matching `/submit request/i` renders exactly one element whose text matches `/estimated wait/i`, and that element's `textContent` matches `/less than a minute|about \\d+ minutes?|over an hour/i`",
                is_required: true,
                order: 7,
              },
            ],
          },
        },
        {
          task_name: "Keyboard Navigation and Composer Shortcuts",
          test_type: "both",
          user_story:
            "As an agent, I want to move between conversations with the arrow keys and send or discard my draft from the composer so that I can work without leaving the keyboard.",
          learning_sections: {
            create: [
              {
                title: "Overview\nShortcuts on the Agent Dashboard",
                content:
                  "This section walks through two keydown handlers on `src/app/agent/page.tsx`. One listens on `document.body` and moves the selected conversation with `ArrowDown` and `ArrowUp`. The other lives on the message input and handles `Enter` with `ctrlKey` and `Escape`.",
                order: 1,
              },
              {
                title: "Moving the Selection",
                content:
                  "Keep the selected index in state and move it by one, clamped to the ends of the list. Reading `event.key` rather than `event.code` keeps it working across layouts:\n\nconst moveSelection = (delta: number) => {\n  setSelectedIndex((index) =>\n    Math.min(Math.max(index + delta, 0), conversations.length - 1)\n  );\n};\n\nThe selected customer name is rendered as a heading, so moving the selection is visible immediately.",
                order: 2,
              },
              {
                title: "Enter With Ctrl Sends",
                content:
                  "The existing send path already refuses empty and whitespace-only input, so Ctrl+Enter only has to call it and clear the box:\n\nconst handleKeyDown = (event: React.KeyboardEvent) => {\n  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {\n    event.preventDefault();\n    handleSendMessage();\n  }\n};\n\nAfter the send, the input value is the empty string and the message text appears in the transcript.",
                order: 3,
              },
              {
                title: "Escape Discards the Draft",
                content:
                  "Escape clears without sending, which is the escape hatch for a half-written message:\n\nif (event.key === 'Escape') {\n  event.preventDefault();\n  setMessageInput('');\n}\n\nNo message is appended, and only the input value changes.",
                order: 4,
              },
              {
                title: "Practice Lab: Map a Key to an Action",
                content:
                  "Practice the small pure function that turns a keyboard event into the action the page should take.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement shortcutAction(event) returning the action for a keyboard event. Return 'next' for ArrowDown, 'prev' for ArrowUp, 'send' for Enter with ctrlKey true, 'clear' for Escape, and null for anything else.\n\nExamples: shortcutAction({ key: 'ArrowUp' }) -> 'prev'.",
                  language: "javascript",
                  starter_code:
                    "export function shortcutAction(event) {\n  // TODO\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO",
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "shortcutAction",
                  test_cases: [
                    {
                      input: [{ key: "ArrowDown" }],
                      expected: "next",
                      label: "arrow down selects the next conversation",
                    },
                    {
                      input: [{ key: "ArrowUp" }],
                      expected: "prev",
                      label: "arrow up selects the previous conversation",
                    },
                    {
                      input: [{ key: "Enter", ctrlKey: true }],
                      expected: "send",
                      label: "ctrl plus enter sends",
                    },
                    {
                      input: [{ key: "Escape" }],
                      expected: "clear",
                      label: "escape clears the draft",
                    },
                    {
                      input: [{ key: "Enter" }],
                      expected: null,
                      label: "plain enter is not a shortcut",
                    },
                  ],
                  hints: [
                    "Check the navigation keys first, then the composer keys.",
                    "if (event.key === 'ArrowDown') return 'next'; if (event.key === 'ArrowUp') return 'prev'; if (event.key === 'Enter' && event.ctrlKey) return 'send'; if (event.key === 'Escape') return 'clear'; return null;",
                    "if (event.key === 'ArrowDown') return 'next'; if (event.key === 'ArrowUp') return 'prev'; if (event.key === 'Enter' && event.___) return 'send'; if (event.key === '___') return 'clear'; return null;",
                  ],
                },
                order: 5,
              },
              {
                title: "Key Takeaway",
                content:
                  "Comparing `event.key` in one handler per surface keeps navigation and composing from interfering with each other. Escape clearing without sending is what makes Ctrl+Enter safe to press by habit.",
                order: 6,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "Work in `src/app/agent/page.tsx`: one `keydown` handler on `document.body` moves the selection, another on the message input handles the composer",
                order: 1,
              },
              {
                description:
                  "The easy mistake here: comparing `event.code` instead of `event.key`, or letting a plain `Enter` send, since only `Enter` with `ctrlKey` counts",
                order: 2,
              },
              {
                description:
                  "Self-check: `ArrowDown` then `ArrowUp` brings the heading back to the first name, `Ctrl+Enter` empties the box, and `Escape` adds nothing",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "Sending `keydown` with key `ArrowDown` on `document.body` changes the heading showing the selected customer name, and sending `ArrowUp` afterwards returns to the original name",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Ctrl+Enter on the input matched by placeholder `/type your response/i` appends a message whose text matches `/looking into it now/i` and leaves the input value as the empty string",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "Escape on that input clears its value from `a half-written draft` to the empty string",
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
    id: "nextjs-shadcn-ui-scenario-2-level-5",
    title: "Ship-Ready Dashboard and Documentation",
    subtitle: "Gate replies on agent status, reset unread badges, and export transcripts",
    order: 5,
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    level_description:
      "Mission Briefing: QA found two dashboard bugs that only show up in use. An agent set to offline can still type and send, and the unread badge never clears when a conversation is opened, which also leaves the priority sort stale. Fix both in `src/app/agent/page.tsx`, then add `src/lib/transcript.ts` with an export button that confirms itself with a toast, and replace the boilerplate `README.md` with real project docs.",
    xp_reward: 75,
    coin_reward: 200,
    key_takeaways:
      "Mirrored state drifts when only one copy is updated, so clearing `unreadCount` has to write back into the `conversations` array as well as the selected conversation.\n\nGating the input and the send button on `agentStatus` is what makes the status selector real, and the notice tells the agent why the composer is disabled.\n\n`formatTranscript` has to return a string for every conversation, including one with no messages, and confirming the export with a `status` toast turns an invisible action into a visible one.",
    scenario_id: "nextjs-shadcn-ui-scenario-2",
    tasks: {
      create: [
        {
          task_name: "Fix the Offline Gate and the Stale Unread Badge",
          test_type: "both",
          user_story:
            "As a team lead, I want an offline agent blocked from replying and unread badges cleared on open so that the dashboard reflects what has actually been handled.",
          learning_sections: {
            create: [
              {
                title: "Overview\nTwo Interacting Bugs",
                content:
                  "This section walks through two fixes in `src/app/agent/page.tsx`. Bug A: the status selector is cosmetic, so an agent set to offline can still type and send. Bug B: clicking a conversation never resets `unreadCount`, so the red badge stays forever. Because unread count feeds the Level 3 priority score, the reset has to update the `conversations` array itself.",
                order: 1,
              },
              {
                title: "Bug A: Gating the Composer",
                content:
                  "The status selector already stores `online`, `away` or `offline`. Bind `disabled` on the input and on the send button to that state, and explain it instead of leaving the agent guessing:\n\nconst offline = agentStatus === 'offline';\n\n<Input disabled={offline} placeholder=\"Type your response...\" />\n<Button disabled={offline}><Send /></Button>\n{offline && <p>Set your status to online to reply</p>}\n\nSwitching back to online clears both the `disabled` flag and the notice.",
                order: 2,
              },
              {
                title: "Bug B: Mirrored State",
                content:
                  "`selectedConversation` holds a copy of one object from `conversations`. Resetting `unreadCount` on the copy alone leaves the list row showing the old number. Reset it in the array, then re-derive the selection from the updated array:\n\nconst opened = { ...conv, unreadCount: 0 };\nsetConversations((prev) => prev.map((c) => (c.id === conv.id ? opened : c)));\nsetSelectedConversation(opened);\n\nOnly the clicked conversation changes, so Maria Garcia opening leaves John Smith on 2.",
                order: 3,
              },
              {
                title: "Why the Badge Number Matters",
                content:
                  "The badge is the seeded `unreadCount` rendered as its own text node, so a row for John Smith starts at 2 and a row for Maria Garcia shows nothing at 0. Rendering `{conv.unreadCount}` inside a conditional keeps 0 hidden without hardcoding a value per row.",
                order: 4,
              },
              {
                title: "Practice Lab: Reset One Count",
                content:
                  "Practice the pure update that resets one conversation's unread count and leaves the rest untouched.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement markAsRead(conversations, id) returning a new array where the conversation with that id has unreadCount 0 and every other conversation is unchanged.\n\nExamples: markAsRead([{ id: '1', unreadCount: 2 }], '1') -> [{ id: '1', unreadCount: 0 }].",
                  language: "javascript",
                  starter_code:
                    "export function markAsRead(conversations, id) {\n  // TODO\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO",
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "markAsRead",
                  test_cases: [
                    {
                      input: [
                        [
                          { id: "1", unreadCount: 2 },
                          { id: "2", unreadCount: 0 },
                        ],
                        "1",
                      ],
                      expected: [
                        { id: "1", unreadCount: 0 },
                        { id: "2", unreadCount: 0 },
                      ],
                      label: "resets the clicked conversation",
                    },
                    {
                      input: [
                        [
                          { id: "1", unreadCount: 2 },
                          { id: "2", unreadCount: 0 },
                        ],
                        "2",
                      ],
                      expected: [
                        { id: "1", unreadCount: 2 },
                        { id: "2", unreadCount: 0 },
                      ],
                      label: "leaves other counts alone",
                    },
                  ],
                  hints: [
                    "Map over the array and spread the matching object with a zero count.",
                    "return conversations.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c));",
                    "return conversations.map((c) => (c.___ === id ? { ...c, unreadCount: ___ } : c));",
                  ],
                },
                order: 5,
              },
              {
                title: "Key Takeaway",
                content:
                  "A control that does not gate anything is worse than no control, because the agent believes it is offline while still sending. Updating the array rather than a snapshot keeps the badge, the priority sort, and the SLA state in agreement.",
                order: 6,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "In `src/app/agent/page.tsx`, gate the input and the send button on `agentStatus`, and show a notice while the status is `offline` that says how to reply",
                order: 1,
              },
              {
                description:
                  "The second bug is in the row click handler: opening a conversation has to clear its unread count, not just re-select it",
                order: 2,
              },
              {
                description:
                  "Same file: on open, reset `unreadCount` in the `conversations` array itself, not only on the selected copy, or the John Smith row keeps its `2`",
                order: 3,
              },
            ],
          },
          order: 1,
          acceptance_criteria: {
            create: [
              {
                description:
                  "With the default status, the input matched by placeholder `/type your response/i` has `disabled` `false` and no element matches `/set your status to online to reply/i`",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "Changing the status `select` to the value `offline` sets `disabled` to `true` on that input and on the first `button` inside the input's parent element",
                is_required: true,
                order: 2,
              },
              {
                description:
                  "While the status is `offline`, an element with text matching `/set your status to online to reply/i` is present",
                is_required: true,
                order: 3,
              },
              {
                description:
                  "Changing the status back to `online` sets `disabled` `false` on the input again and removes the `/set your status to online to reply/i` notice",
                is_required: true,
                order: 4,
              },
              {
                description:
                  "Before any conversation is opened, the row button matching `/john smith/i` contains the text `2`, the seeded unread count",
                is_required: true,
                order: 5,
              },
              {
                description:
                  "Clicking the row button matching `/john smith/i` removes the text `2` from that row",
                is_required: true,
                order: 6,
              },
              {
                description:
                  "Clicking the row button matching `/maria garcia/i` leaves the text `2` in the row button matching `/john smith/i`",
                is_required: true,
                order: 7,
              },
            ],
          },
        },
        {
          task_name: "Transcript Export, Export Toast, and Project README",
          test_type: "both",
          user_story:
            "As an agent, I want to export the open conversation as a readable transcript and see a confirmation when it lands so that I can attach it to a case, and as a new contributor I want a README that explains how to run the portal.",
          learning_sections: {
            create: [
              {
                title: "Overview\nTranscript Formatting and Docs",
                content:
                  "This section walks through building `src/lib/transcript.ts` with `formatTranscript`, adding an `Export Transcript` button to `src/app/agent/page.tsx` that confirms itself with a toast, and rewriting `README.md`. A conversation has `customer.fullName`, `status`, and `messages` whose entries carry `role`, `content`, and `timestamp`.",
                order: 1,
              },
              {
                title: "Building the Transcript String",
                content:
                  "The output is one plain string: a header naming the customer, then one line per message with its role and content. Joining with newlines keeps it readable and keeps the function pure:\n\nexport function formatTranscript(conversation) {\n  const lines = [`Transcript for ${conversation.customer.fullName}`];\n  for (const message of conversation.messages) {\n    lines.push(`${message.role}: ${message.content}`);\n  }\n  return lines.join('\\n');\n}\n\nRole names `customer` and `agent` come straight from the message `role`, so both appear in the output.",
                order: 2,
              },
              {
                title: "Never Throwing on Empty Input",
                content:
                  "A conversation with `messages: []` must still return a string rather than throwing or returning `undefined`. Starting the lines array with the header line guarantees a string in every case:\n\nformatTranscript({ customer: { fullName: 'Empty Case' }, status: 'active', messages: [] })\n// Transcript for Empty Case",
                order: 3,
              },
              {
                title: "The Export Button and Its Toast",
                content:
                  "Import `formatTranscript` from `@/lib/transcript` and render one button whose accessible name matches `/export transcript/i`, so the export affordance is found by name alone:\n\n<Button onClick={() => downloadTranscript(selectedConversation)}>\n  Export Transcript\n</Button>\n\nThe button sits with the other conversation actions, so it acts on the open conversation. A download that leaves no trace reads as a broken button, so the same click raises a toast from `@/components/ui/toast` using `useToast`. The toast is a live region, so it needs the `status` role and an accessible name that says the export finished, matching `/exported|complete|success/i`:\n\n<Toast>\n  <ToastTitle>Transcript exported</ToastTitle>\n  <ToastDescription>The transcript is ready to attach.</ToastDescription>\n</Toast>",
                order: 4,
              },
              {
                title: "Writing the README",
                content:
                  "Replace the create-next-app boilerplate with the facts a new contributor needs: what the project is for City Hall, the demo credentials `admin` and `admin123`, the routes `/support` and `/agent`, and the commands to install and run. A README under 400 characters is still boilerplate; the checked content has to name the project, the credentials, and both routes.",
                order: 5,
              },
              {
                title: "Practice Lab: Format One Line",
                content:
                  "Practice the single line formatting that `formatTranscript` repeats for every message.",
                section_type: "INTERACTIVE" as const,
                interactive_mode: "CODE_EDITOR" as const,
                interactive_config: {
                  instructions:
                    "Implement transcriptLine(role, content) returning one transcript line for a message: the role, a colon, a single space, then the content.\n\nExamples: transcriptLine('customer', 'My streetlight is out.') -> 'customer: My streetlight is out.'.",
                  language: "javascript",
                  starter_code:
                    "export function transcriptLine(role, content) {\n  // TODO\n}\n",
                  editable_regions: [
                    {
                      placeholder: "// TODO",
                      case_sensitive: true,
                    },
                  ],
                  entry_point: "transcriptLine",
                  test_cases: [
                    {
                      input: ["customer", "My streetlight is out."],
                      expected: "customer: My streetlight is out.",
                      label: "customer line",
                    },
                    {
                      input: ["agent", "I have logged a repair ticket."],
                      expected: "agent: I have logged a repair ticket.",
                      label: "agent line",
                    },
                  ],
                  hints: [
                    "Concatenate the two parts with a colon and a space.",
                    "return `${role}: ${content}`;",
                    "return `${___}: ${___}`;",
                  ],
                },
                order: 6,
              },
              {
                title: "Key Takeaway",
                content:
                  "A transcript is just a formatted string, so it can be logged, copied, or downloaded without a second data model. Handling the empty case is what keeps an export button from throwing on a brand new conversation. The toast is what tells the agent the export worked at all, since the file leaves the browser with no other visible sign.",
                order: 7,
              },
            ],
          },
          hints: {
            create: [
              {
                description:
                  "In `src/lib/transcript.ts`, export `formatTranscript`: a header naming `customer.fullName`, one line per message, a string even for `messages: []`",
                order: 1,
              },
              {
                description:
                  "On `src/app/agent/page.tsx`, import from a path ending in `transcript` and render one `button` whose accessible name matches `/export transcript/i`",
                order: 2,
              },
              {
                description:
                  "Same file: raise a toast from `@/components/ui/toast` on that click, carrying the `status` role and a name matching `/exported|complete|success/i`, then replace `README.md` with real docs over 400 characters naming City Hall, the credentials `admin` and `admin123`, and the routes `/support` and `/agent`",
                order: 3,
              },
            ],
          },
          order: 2,
          acceptance_criteria: {
            create: [
              {
                description:
                  "`src/lib/transcript.ts` exists and exports `formatTranscript` as a function",
                is_required: true,
                order: 1,
              },
              {
                description:
                  "`formatTranscript` for a conversation whose `customer.fullName` is `Jane Tester` returns a string containing `Jane Tester`, containing the content `My streetlight has been out for two weeks.`, containing the content `Thanks for reporting it — I have logged a repair ticket.`, and matching `/customer/i` and `/agent/i`",
                is_required: true,
                order: 2,
              },
              {
                description:
"`formatTranscript({ customer: { fullName: 'Empty Case' }, status: 'active', messages: [] })` returns a string rather than throwing",
                is_required: true,
                order: 3,
              },
              {
                description: "`src/app/agent/page.tsx` imports from a path ending in `transcript`",
                is_required: true,
                order: 4,
              },
              {
                description: "The agent dashboard renders a `button` whose accessible name matches `/export transcript/i`",
                is_required: true,
                order: 5,
              },
              {
                description:
                  "`src/components/ui/toast.tsx` exists and its content matches `/\\bToast\\b/`, `/\\bToastProvider\\b/`, `/\\bToastViewport\\b/`, `/\\bToastTitle\\b/`, `/\\bToastDescription\\b/`, `/\\bToastAction\\b/`, and `/\\buseToast\\b/`",
                is_required: true,
                order: 6,
              },
              {
                description:
                  "Clicking the `button` matching `/export transcript/i` on the agent dashboard shows an element with the `status` role whose accessible name matches `/exported|complete|success/i`",
                is_required: true,
                order: 7,
              },
              {
                description:
                  "`src/app/agent/page.tsx` imports from `@/components/ui/toast` and its source contains `Toast`, `ToastProvider`, `ToastViewport`, `ToastTitle`, `ToastDescription` or `ToastAction`, plus `useToast`",
                is_required: true,
                order: 8,
              },
              {
                description:
                  "`README.md` exists, is longer than 400 characters, and matches `/city hall/i`, `/admin/`, `/admin123/`, `/\\/support/` and `/\\/agent/`",
                is_required: true,
                order: 9,
              },
            ],
          },
        },
      ],
    },
  },
];
