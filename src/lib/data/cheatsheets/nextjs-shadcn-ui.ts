import type { CheatsheetStack } from '$types/cheatsheets';

const STACK_DIR =
	'submodules/projects/tech-stacks/nextjs-shadcn-ui/scenario-1/library-management/tests';

const APP = 'library-management';

const SUPPORT_DIR =
	'submodules/projects/tech-stacks/nextjs-shadcn-ui/scenario-2/customer-support-city-hall/tests';

const SUPPORT_APP = 'customer-support-city-hall';

const PORTAL_DIR =
	'submodules/projects/tech-stacks/nextjs-shadcn-ui/scenario-3/student-portal/tests';

const PORTAL_APP = 'student-portal';

/**
 * Cheatsheet content for the `nextjs-shadcn-ui` stack.
 *
 * Unlike `nextjs-postgres-prisma`, these tasks modify an existing Next.js app,
 * so most solutions are whole files. They are stored under
 * `cheatsheet-solutions/nextjs-shadcn-ui/<scenario>/<path>` and rendered from
 * there — see `solutions.ts`.
 *
 * `scenario-1` is authored; scenarios 2 and 3 are scaffolded with their
 * canonical level titles and filled in as they are verified.
 */
export const nextjsShadcnUiCheatsheet: CheatsheetStack = {
	name: 'nextjs-shadcn-ui',
	label: 'Next.js + shadcn/ui',
	description:
		'A Next.js App Router front end built on shadcn/ui primitives. Tasks are client-side: fixing status badge palettes, extracting reusable components, adding search and confirmation flows, persisting state to localStorage, and shipping date utilities.',
	scenarios: [
		{
			ref: 'scenario-1',
			folder: 'library-management',
			name: 'Library Management',
			description:
				'BookWise Library — a librarian dashboard for tracking books, borrowing, returns and overdue items.',
			totalTasks: 10,
			levels: [
				{
					order: 1,
					title: 'Setup & Simple UI Fixes',
					tasks: [
						{
							level: 1,
							task: 1,
							title: 'Environment Setup',
							summary:
								'Install dependencies, confirm the dev server boots, and add the shadcn `alert` component so the UI kit is complete.',
							targetFiles: ['src/components/ui/alert.tsx'],
							steps: [
								'Install dependencies with `pnpm install`.',
								'Confirm the dev server starts.',
								'Add the shadcn alert primitive. The registry entry is unavailable offline, so paste the file below — it is the stock component.'
							],
							snippets: [],
							solutionFiles: [
								{ path: `${APP}/src/components/ui/alert.tsx`, action: 'create' }
							],
							notes: [
								'The test spawns `pnpm dev` and waits up to 30s for a ready line, then asserts `alert.tsx` exists and exports `Alert`, `AlertTitle` and `AlertDescription`.'
							],
							testLabel: 'Level 1 Task 1: Project Setup',
							testPath: `${STACK_DIR}/level-1/task-1/setup.test.ts`
						},
						{
							level: 1,
							task: 2,
							title: 'Update UI Text',
							summary:
								'Rename the signup page\'s "Sign Up" link to "Register".',
							targetFiles: ['src/app/signup/page.tsx'],
							snippets: [],
							solutionFiles: [
								{
									path: `${APP}/src/app/signup/page.tsx`,
									action: 'edit',
									note: 'The only change is the link text in the "Already have an account?" block.'
								}
							],
							notes: [
								'The test strips comments before checking, so the string "Sign Up" must not appear anywhere in the file — including comments.'
							],
							testLabel: 'Level 1 Task 2: Branding Update',
							testPath: `${STACK_DIR}/level-1/task-2/branding.test.ts`
						}
					]
				},
				{
					order: 2,
					title: 'Bug Fixing & Refactoring',
					tasks: [
						{
							level: 2,
							task: 1,
							title: 'Fix Status Badge Colors',
							summary:
								'Give each book status its own badge palette: green for available, blue for borrowed, red for overdue.',
							targetFiles: ['src/components/BookRow.tsx'],
							snippets: [],
							solutionFiles: [
								{
									path: `${APP}/src/components/BookRow.tsx`,
									action: 'create',
									note: 'Badge colours come from a `STATUS_CLASSES` map so each status is explicit.'
								}
							],
							notes: [
								'The test asserts the badge element inside a table cell carries `bg-green-100 text-green-800`, `bg-blue-100 text-blue-800` or `bg-red-100 text-red-800`.',
								'`Badge` merges classes with `tailwind-merge`, so passing `className` overrides the variant colour cleanly.'
							],
							testLabel: 'Level 2 - Task 2.1: Status Badge Colors',
							testPath: `${STACK_DIR}/level-2/task-1/badge-colors.test.tsx`
						},
						{
							level: 2,
							task: 2,
							title: 'Refactor Book Filtering',
							summary:
								'Extract the table row markup into a reusable `BookRow` component and render every book through it.',
							targetFiles: ['src/components/BookRow.tsx', 'src/app/dashboard/page.tsx'],
							snippets: [],
							solutionFiles: [
								{ path: `${APP}/src/components/BookRow.tsx`, action: 'create' },
								{
									path: `${APP}/src/app/dashboard/page.tsx`,
									action: 'edit',
									note: 'Import `BookRow` and replace the inline `<TableRow>` markup with `<BookRow key={book.id} book={book} />`.'
								}
							],
							notes: [
								'The test accepts either a default or a named export from `BookRow`.',
								'`BookRow` renders a table row, so it must be mounted inside `<TableBody>`.'
							],
							testLabel: 'Level 2 - Task 2.2: Refactored Book Filtering',
							testPath: `${STACK_DIR}/level-2/task-2/refactoring.test.tsx`
						}
					]
				},
				{
					order: 3,
					title: 'Feature Development',
					tasks: [
						{
							level: 3,
							task: 1,
							title: 'Add Search & Borrow Features',
							summary:
								'Add a case-insensitive search box that filters the catalogue by title or author, with an empty state when nothing matches.',
							targetFiles: ['src/app/dashboard/page.tsx'],
							snippets: [],
							solutionFiles: [
								{
									path: `${APP}/src/app/dashboard/page.tsx`,
									action: 'edit',
									note: 'Add `searchTerm` state, a `useMemo` filter, the `Input` with placeholder "Search books...", and the "No books found" empty row.'
								}
							],
							notes: [
								'The placeholder must match `/search books/i`.',
								'The derived book arrays must be declared before the early `if (!librarian)` return, otherwise the filter cannot read them.'
							],
							testLabel: 'Level 3 - Task 3.1: Book Search & Filter',
							testPath: `${STACK_DIR}/level-3/task-1/search-filter.test.tsx`
						},
						{
							level: 3,
							task: 2,
							title: 'Create Returns Page',
							summary:
								'Add a returns desk that lists borrowed books, asks for confirmation, and marks the book available on confirm.',
							targetFiles: ['src/app/returns/page.tsx'],
							snippets: [],
							solutionFiles: [
								{ path: `${APP}/src/app/returns/page.tsx`, action: 'create' }
							],
							notes: [
								'Exactly one Return button per borrowed book — the test counts them.',
								'The confirmation must contain the text "Are you sure?" plus Cancel and Confirm buttons.',
								'After confirming, the returned book must disappear from the borrowed list.'
							],
							testLabel: 'Level 3 - Task 3.2: Returns Page',
							testPath: `${STACK_DIR}/level-3/task-2/returns-page.test.tsx`
						}
					]
				},
				{
					order: 4,
					title: 'Integration & Edge Cases',
					tasks: [
						{
							level: 4,
							task: 1,
							title: 'Add Validation & Date Handling',
							summary:
								'Only offer Borrow on available books — overdue and borrowed rows must expose no Borrow action.',
							targetFiles: ['src/components/BookRow.tsx', 'src/app/dashboard/page.tsx'],
							snippets: [],
							solutionFiles: [
								{ path: `${APP}/src/components/BookRow.tsx`, action: 'create' },
								{
									path: `${APP}/src/app/dashboard/page.tsx`,
									action: 'edit',
									note: 'Add the Action column, wire `onBorrow`, and add an `onClick` to every `TabsTrigger`.'
								}
							],
							notes: [
								'Radix tabs activate on `mousedown`, which testing-library\'s `fireEvent.click` never fires. Add `onClick={() => setActiveTab(value)}` to each `TabsTrigger` or the overdue-tab assertion can never pass.',
								'With the Overdue tab active there must be zero buttons named /borrow/i; with All Books active there must be one per available book.'
							],
							testLabel: 'Level 4 - Task 4.1: Overdue Book Validation',
							testPath: `${STACK_DIR}/level-4/task-1/overdue-validation.test.tsx`
						},
						{
							level: 4,
							task: 2,
							title: 'Add Confirmation & Persistence',
							summary:
								'Confirm before borrowing, capture borrower name and email, and persist the books array to localStorage via a reusable hook.',
							targetFiles: [
								'src/app/dashboard/page.tsx',
								'src/app/returns/page.tsx',
								'src/hooks/useLocalStorage.ts'
							],
							snippets: [],
							solutionFiles: [
								{ path: `${APP}/src/hooks/useLocalStorage.ts`, action: 'create' },
								{
									path: `${APP}/src/app/dashboard/page.tsx`,
									action: 'edit',
									note: 'Swap `useState` for `useLocalStorage(\'books\', mockBooks)` and add the borrow dialog.'
								},
								{
									path: `${APP}/src/app/returns/page.tsx`,
									action: 'edit',
									note: 'Read and write books through `useLocalStorage` so returns persist too.'
								}
							],
							notes: [
								'The dialog labels must be "Borrower Name" and "Borrower Email" so `getByLabelText` finds the inputs.',
								'`useLocalStorage` must read the stored value on mount and write on every change.',
								'The dashboard must hydrate `books` from localStorage so a pre-seeded `books` key is rendered.'
							],
							testLabel: 'Level 4 - Task 4.2: Confirmation & Persistence',
							testPath: `${STACK_DIR}/level-4/task-2/persistence.test.tsx`
						}
					]
				},
				{
					order: 5,
					title: 'Real Client Issue',
					tasks: [
						{
							level: 5,
							task: 1,
							title: 'Fix Overdue Bug & Build Report',
							summary:
								'Build an overdue report listing each overdue book with borrower contact details, days overdue, and a "Mark as Returned" action.',
							targetFiles: ['src/app/overdue/page.tsx'],
							snippets: [],
							solutionFiles: [
								{ path: `${APP}/src/app/overdue/page.tsx`, action: 'create' }
							],
							notes: [
								'The borrower email comes from `mockBorrowRecords`, matched on `bookId`.',
								'Each row needs the text "N days overdue" and a "Mark as Returned" button — one per overdue book.',
								'Marking returned must remove the book from the report.'
							],
							testLabel: 'Level 5 - Task 5.1: Overdue Report Page',
							testPath: `${STACK_DIR}/level-5/task-1/overdue-fix-report.test.tsx`
						},
						{
							level: 5,
							task: 2,
							title: 'Create Utilities & Documentation',
							summary:
								'Add timezone-safe date utilities and document the project so at least 80% of source files carry a comment.',
							targetFiles: ['src/lib/dateUtils.ts', 'README.md'],
							snippets: [],
							solutionFiles: [
								{ path: `${APP}/src/lib/dateUtils.ts`, action: 'create' },
								{ path: `${APP}/README.md`, action: 'edit' },
								{
									path: 'README.md',
									action: 'create',
									note: 'The docs test resolves the README one directory ABOVE the app — it reads `scenario-1/README.md`, not the app README.'
								}
							],
							notes: [
								'`formatDate("2026-01-15")` must return `"Jan 15, 2026"`, and `""` for invalid input. Parse `YYYY-MM-DD` from its parts — `new Date("2026-01-15")` shifts a day in negative-offset timezones.',
								'`isOverdue` returns false for invalid dates.',
								'The docs test resolves `../../../../README.md` from `tests/level-5/task-2`, which lands on `scenario-1/README.md`. The app\'s own README does not satisfy it.',
								'≥80% of files under `src` must contain `//` or `/*`. The starter sits near 50%, so add a one-line header comment to each remaining file.'
							],
							testLabel: 'Level 5 - Task 5.2: Utilities & Documentation',
							testPath: `${STACK_DIR}/level-5/task-2/utils-docs.test.tsx`
						}
					]
				}
			]
		},
		{
			ref: 'scenario-2',
			folder: 'customer-support-city-hall',
			name: 'Customer Support — City Hall',
			description:
				'City Hall support portal — an AI intake assistant, a citizen complaint form and hand-off flow, and an agent dashboard with conversation search, status filters, unread tracking and reload-safe state.',
			totalTasks: 10,
			levels: [
				{
					order: 1,
					title: 'Onboarding the Support Portal',
					tasks: [
						{
							level: 1,
							task: 1,
							title: 'Environment Setup',
							summary:
								'Install dependencies, confirm the dev server boots, and add the shadcn `alert` primitive so the UI kit is complete.',
							targetFiles: ['src/components/ui/alert.tsx'],
							steps: [
								'Install dependencies with `pnpm install`.',
								'Confirm `pnpm dev` starts and prints a local URL.',
								'Add the shadcn `alert` component — the registry is unreachable offline, so paste the stock file below.'
							],
							snippets: [],
							solutionFiles: [
								{ path: `${SUPPORT_APP}/src/components/ui/alert.tsx`, action: 'create' }
							],
							notes: [
								'The setup test only checks that `Alert`, `AlertTitle` and `AlertDescription` all appear in the file — do not hand-roll a variant system.',
								'It also spawns `pnpm dev` and waits for `ready` or `Local:` in the output, so a broken Next.js config fails the task too.',
								'Later scenarios assume this file exists; create it before anything else.'
							],
							testLabel: 'Level 1 Task 1: Project Setup',
							testPath: `${SUPPORT_DIR}/level-1/task-1/setup.test.ts`
						},
						{
							level: 1,
							task: 2,
							title: 'UI Text Updates',
							summary:
								'Rebrand the agent sign-in page so its submit button reads `Login` instead of `Sign In`.',
							targetFiles: ['src/app/agent/login/page.tsx'],
							steps: [
								'Open `src/app/agent/login/page.tsx`.',
								'Rename every user-visible `Sign In` string to `Login`.'
							],
							snippets: [],
							solutionFiles: [
								{
									path: `${SUPPORT_APP}/src/app/agent/login/page.tsx`,
									action: 'edit',
									note: 'Swap the button label (and page heading) from `Sign In` to `Login`.'
								}
							],
							notes: [
								'The test strips comments before asserting, so leaving `Sign In` in a comment is safe — but easier to just remove it everywhere.',
								'The assertion is a plain substring check: any remaining `Sign In` in non-comment source fails the task.'
							],
							testLabel: 'Level 1 Task 2: Branding Update',
							testPath: `${SUPPORT_DIR}/level-1/task-2/branding.test.ts`
						}
					]
				},
				{
					order: 2,
					title: 'Polishing the Agent Dashboard',
					tasks: [
						{
							level: 2,
							task: 1,
							title: 'Fix Conversation Status Badge Colors',
							summary:
								'Replace the hardcoded `bg-*-500` status badges with explicit pale-background / dark-text class pairs per status.',
							targetFiles: ['src/app/agent/page.tsx'],
							steps: [
								'Find the badge class helper in `src/app/agent/page.tsx`.',
								'Map `active`, `waiting` and `resolved` to their class pairs.',
								'Apply the result through `className`, not a `variant` prop.'
							],
							snippets: [],
							solutionFiles: [
								{
									path: `${SUPPORT_APP}/src/app/agent/page.tsx`,
									action: 'edit',
									note: 'Make the status helper return the full class string: `bg-green-100 text-green-800`, `bg-yellow-100 text-yellow-800`, `bg-gray-100 text-gray-800`.'
								}
							],
							notes: [
								'`active` → `bg-green-100 text-green-800`, `waiting` → `bg-yellow-100 text-yellow-800`, `resolved` → `bg-gray-100 text-gray-800`.',
								'The test fails if `bg-green-500` or `bg-yellow-500` still appears anywhere in the file — delete the old literals.',
								'The classes are asserted from the rendered DOM, so the badge markup must actually receive them.'
							],
							testLabel: 'Level 2 - Task 2.1: status badge palette',
							testPath: `${SUPPORT_DIR}/level-2/task-1/conversation-status-badges.test.tsx`
						},
						{
							level: 2,
							task: 2,
							title: 'Refactor & Extract MessageBubble',
							summary:
								'Extract the duplicated chat bubble markup into a single `MessageBubble` component that aligns messages relative to whoever is viewing them.',
							targetFiles: [
								'src/components/MessageBubble.tsx',
								'src/app/agent/page.tsx',
								'src/app/support/page.tsx'
							],
							steps: [
								'Create `src/components/MessageBubble.tsx`.',
								'Accept a `message` and a `viewer` prop: `agent` or `customer`.',
								'Use the component on both chat pages and delete the local bubble markup.',
								'Derive the conversation counts with `useMemo` in `src/app/agent/page.tsx`.'
							],
							snippets: [],
							solutionFiles: [
								{ path: `${SUPPORT_APP}/src/components/MessageBubble.tsx`, action: 'create' },
								{
									path: `${SUPPORT_APP}/src/app/agent/page.tsx`,
									action: 'edit',
									note: 'Render `<MessageBubble message={m} viewer="agent" />`, and derive counts from one `useMemo` destructured as `const { active, waiting, resolved } = ...`.'
								},
								{
									path: `${SUPPORT_APP}/src/app/support/page.tsx`,
									action: 'edit',
									note: 'Render `<MessageBubble message={m} viewer="customer" />` for the citizen chat.'
								}
							],
							notes: [
								'Alignment is viewer-relative: `justify-end` when `message.role === viewer`, `justify-start` otherwise, and `justify-center` for `system` messages.',
								'Export `MessageBubble` as a named or default export from `@/components/MessageBubble` — the test accepts either.',
								'Both `src/app/agent/page.tsx` and `src/app/support/page.tsx` must import it, and the agent page must contain a `/useMemo/` call plus the destructured counts.'
							],
							testLabel: 'Level 2 - Task 2.2: MessageBubble primitive',
							testPath: `${SUPPORT_DIR}/level-2/task-2/message-bubble.test.tsx`
						}
					]
				},
				{
					order: 3,
					title: 'Empowering Agents and Citizens',
					tasks: [
						{
							level: 3,
							task: 1,
							title: 'Conversation Search & Status Filter',
							summary:
								'Let agents search the queue by customer name or complaint text and narrow it with status filter chips.',
							targetFiles: ['src/app/agent/page.tsx'],
							steps: [
								'Add a search input with the placeholder `Search conversations...`.',
								'Combine the search term with a status chip filter in the memoised derivation.',
								'Render the `No conversations found` empty state when nothing matches.'
							],
							snippets: [],
							solutionFiles: [
								{
									path: `${SUPPORT_APP}/src/app/agent/page.tsx`,
									action: 'edit',
									note: 'Filter on `customer.fullName` and the last message body, case-insensitively, and expose chips labelled exactly `all`, `active`, `waiting`, `resolved`.'
								}
							],
							notes: [
								'The search placeholder must match `/search conversations/i`.',
								'Matching is case-insensitive and covers both the customer name and the complaint text.',
								'The chip labels are checked exactly as `all`, `active`, `waiting` and `resolved` — do not title-case them.',
								'With no matches the page must show exactly `No conversations found`.'
							],
							testLabel: 'Level 3 - Task 3.1: conversation search & filters',
							testPath: `${SUPPORT_DIR}/level-3/task-1/conversation-search.test.tsx`
						},
						{
							level: 3,
							task: 2,
							title: 'Citizen Complaint History Page',
							summary:
								'Persist submitted complaints under `customerComplaints` and list them on a new `/support/history` page.',
							targetFiles: ['src/app/support/history/page.tsx', 'src/app/support/page.tsx'],
							steps: [
								'Create `src/app/support/history/page.tsx`.',
								'Read the `customerComplaints` key with `useLocalStorage`.',
								'Render the Submitted / Name / City / ZIP / Complaint columns.',
								'Append the complaint on submit in `src/app/support/page.tsx` and link to the history page.'
							],
							snippets: [],
							solutionFiles: [
								{
									path: `${SUPPORT_APP}/src/app/support/history/page.tsx`,
									action: 'create',
									note: 'Always render the table head, and show `No complaints submitted yet` in a full-width body row when the list is empty.'
								},
								{
									path: `${SUPPORT_APP}/src/app/support/page.tsx`,
									action: 'edit',
									note: 'On submit, append `{ ...formData, id, submittedAt }` to `customerComplaints`; add a `View History` link to `/support/history`.'
								}
							],
							notes: [
								'The storage key is exactly `customerComplaints` — a different name silently breaks the page.',
								'The column headers must exist even when the list is empty, so never early-return the table.',
								'Submitting the support form must append an entry that carries a `submittedAt` timestamp.',
								'The header needs a `View History` link whose `href` is `/support/history`.'
							],
							testLabel: 'Level 3 - Task 3.2: complaint history page',
							testPath: `${SUPPORT_DIR}/level-3/task-2/complaint-history.test.tsx`
						}
					]
				},
				{
					order: 4,
					title: 'Hardening the Citizen Experience',
					tasks: [
						{
							level: 4,
							task: 1,
							title: 'Form & Message Validation',
							summary:
								'Validate the agent hand-off form inline and block empty or whitespace-only chat messages.',
							targetFiles: ['src/app/support/page.tsx'],
							steps: [
								'Validate `fullName` at 2+ characters, `zipCode` against `/^\\d{5}$/`, and `complaint` at 10+ characters.',
								'Show one inline error per invalid, non-empty field.',
								'Disable `Submit Request` until the whole form is valid.',
								'Disable the chat send button for whitespace-only input.'
							],
							snippets: [],
							solutionFiles: [
								{
									path: `${SUPPORT_APP}/src/app/support/page.tsx`,
									action: 'edit',
									note: 'Extract `MIN_NAME_LENGTH`, `MIN_COMPLAINT_LENGTH` and `ZIP_PATTERN` constants, gate errors on non-empty fields, and drive `disabled` off a single `isFormValid`.'
								}
							],
							notes: [
								'Error copy is matched by regex: `/at least 2/i`, `/zip code must be 5 digits/i` and `/at least 10/i`.',
								'`Submit Request` must be `disabled` while any field is invalid, and a disabled button cannot submit — the test clicks it and asserts nothing is stored.',
								'Whitespace-only input must be rejected on both the form and the chat box.',
								'Trim before measuring length so `"  "` never passes the name or complaint rules.'
							],
							testLabel: 'Level 4 - Task 4.1: form validation',
							testPath: `${SUPPORT_DIR}/level-4/task-1/form-validation.test.tsx`
						},
						{
							level: 4,
							task: 2,
							title: 'localStorage Persistence',
							summary:
								'Extract a reusable `useLocalStorage` hook and route agent status, conversations and chat history through it.',
							targetFiles: [
								'src/hooks/useLocalStorage.ts',
								'src/app/agent/page.tsx',
								'src/app/support/page.tsx'
							],
							steps: [
								'Create `src/hooks/useLocalStorage.ts` returning a `[value, setValue]` tuple.',
								'Hydrate the stored value on mount and write on every change.',
								'Store the agent status under `agentStatus`, the queue under `agentConversations` and the chat under `supportMessages`.'
							],
							snippets: [],
							solutionFiles: [
								{ path: `${SUPPORT_APP}/src/hooks/useLocalStorage.ts`, action: 'create' },
								{
									path: `${SUPPORT_APP}/src/app/agent/page.tsx`,
									action: 'edit',
									note: 'Use `useLocalStorage("agentStatus", ...)` and `useLocalStorage("agentConversations", ...)`; the status control must render as a `<select>` so it is exposed with the `combobox` role.'
								},
								{
									path: `${SUPPORT_APP}/src/app/support/page.tsx`,
									action: 'edit',
									note: 'Use `useLocalStorage("supportMessages", ...)` for the chat transcript.'
								}
							],
							notes: [
								'The hook signature is `useLocalStorage<T>(key, initialValue)` returning `[value, setValue]`, and values are JSON-serialised.',
								'It must hydrate on mount — reading `localStorage` during render breaks SSR and the remount assertions.',
								'Three keys are asserted: `agentStatus`, `agentConversations` and `supportMessages`.',
								'The agent status control must be a `<select>`; the test reaches it through `getByRole("combobox")`.',
								'Both pages must survive an unmount/remount cycle with their state intact.'
							],
							testLabel: 'Level 4 - Task 4.2: useLocalStorage hook',
							testPath: `${SUPPORT_DIR}/level-4/task-2/localstorage-persistence.test.tsx`
						}
					]
				},
				{
					order: 5,
					title: 'The Unread Badge Crisis',
					tasks: [
						{
							level: 5,
							task: 1,
							title: 'Fix Unread Count Bug',
							summary:
								'Make selecting a conversation clear its unread badge without disturbing the rest of the queue or the derived counts.',
							targetFiles: ['src/app/agent/page.tsx'],
							steps: [
								'Keep the conversation list as the single source of truth.',
								'Recompute `active`, `waiting` and `resolved` from it with `useMemo`.',
								'Zero `unreadCount` on the selected row via `setConversations`.',
								'Give the resolve control the exact label `Resolve`.'
							],
							snippets: [],
							solutionFiles: [
								{
									path: `${SUPPORT_APP}/src/app/agent/page.tsx`,
									action: 'edit',
									note: 'Selecting a conversation must map over the array and set `unreadCount: 0` on the matching id; the resolve button label is exactly `Resolve`.'
								}
							],
							notes: [
								'John Smith is seeded with 2 unread messages, so the badge starts at `2`.',
								'Clicking a row clears only that row — every other unread badge must stay untouched.',
								'The button is matched case-sensitively as `/^Resolve$/`, so `Resolved` does not satisfy it. Do not case-insensitively style the label.',
								'The status badge text after resolving must read `Resolved`.',
								'Derived counts must come from one `useMemo` over the stored conversations, and updates must go through `setConversations`.'
							],
							testLabel: 'Level 5 - Task 5.1: unread badge',
							testPath: `${SUPPORT_DIR}/level-5/task-1/unread-count.test.tsx`
						},
						{
							level: 5,
							task: 2,
							title: 'Date Utilities & Documentation',
							summary:
								'Extract relative-time formatting, staleness and absolute timestamps into `src/lib/dateUtils.ts`, then document the project.',
							targetFiles: ['src/lib/dateUtils.ts', 'src/app/agent/page.tsx', 'README.md'],
							steps: [
								'Create `src/lib/dateUtils.ts` with `formatRelativeTime`, `isStale` and `formatTimestamp`.',
								'Replace the local `formatTime` helper in the agent page with `formatRelativeTime`.',
								'Rewrite `README.md` with the project overview, demo credentials and route table.'
							],
							snippets: [],
							solutionFiles: [
								{ path: `${SUPPORT_APP}/src/lib/dateUtils.ts`, action: 'create' },
								{
									path: `${SUPPORT_APP}/src/app/agent/page.tsx`,
									action: 'edit',
									note: 'Delete the local `formatTime` helper and import `formatRelativeTime` from `@/lib/dateUtils` for the conversation row timestamps.'
								},
								{ path: `${SUPPORT_APP}/README.md`, action: 'edit' }
							],
							notes: [
								'`formatRelativeTime` returns `Just now` under a minute, then `5m ago`, `3h ago`, and `""` for an invalid date.',
								'`isStale` is `true` past 25 hours, `false` at 1 hour, and `false` for invalid input — never throw.',
								'`formatTimestamp` must include the year and return `""` for invalid input.',
								'The module must accept `Date | string`, because `useLocalStorage` round-trips dates as ISO strings.',
								'Agent page: no `const formatTime =` may remain, but it must reference `formatRelativeTime`.',
								'`README.md` must exceed 400 characters and mention City Hall, `admin`, `pnpm install`, and the `/support`, `/support/history`, `/agent` and `/agent/login` routes.'
							],
							testLabel: 'Level 5 - Task 5.2: dateUtils module',
							testPath: `${SUPPORT_DIR}/level-5/task-2/date-utils-docs.test.tsx`
						}
					]
				}
			]
		},
		{
			ref: 'scenario-3',
			folder: 'student-portal',
			name: 'Student Portal',
			description:
				'Riverside University student portal — academic dashboard with grades, GPA, schedule, tuition fees, standing and personal study notes.',
			totalTasks: 10,
			levels: [
				{
					order: 1,
					title: 'Onboarding the Student Portal',
					tasks: [
						{
							level: 1,
							task: 1,
							title: 'Environment Setup',
							summary:
								'Install dependencies, confirm the dev server boots, and add the shadcn `alert` component.',
							targetFiles: ['src/components/ui/alert.tsx'],
							steps: [
								'Install dependencies with `pnpm install`.',
								'Confirm the dev server starts.',
								'Add the shadcn alert primitive — the stock file is below.'
							],
							snippets: [],
							solutionFiles: [
								{ path: `${PORTAL_APP}/src/components/ui/alert.tsx`, action: 'create' }
							],
							notes: [
								'The test spawns `pnpm dev` and waits up to 30s for a ready line, then asserts the alert file exports `Alert`, `AlertTitle` and `AlertDescription`.'
							],
							testLabel: 'Level 1 Task 1: Project Setup',
							testPath: `${PORTAL_DIR}/level-1/task-1/setup.test.ts`
						},
						{
							level: 1,
							task: 2,
							title: 'UI Text Updates',
							summary: 'Rename the login page\'s "Sign In" copy to "Log In".',
							targetFiles: ['src/app/login/page.tsx'],
							snippets: [],
							solutionFiles: [
								{
									path: `${PORTAL_APP}/src/app/login/page.tsx`,
									action: 'edit',
									note: 'Both the submit button and the page subtitle change; the loading label becomes "Logging in...".'
								}
							],
							notes: [
								'The test strips comments before checking, so "Sign In" must not survive anywhere in the file — including comments.',
								'Keep the loading label free of the literal "Sign In" too.'
							],
							testLabel: 'Level 1 Task 2: Branding Update',
							testPath: `${PORTAL_DIR}/level-1/task-2/branding.test.ts`
						}
					]
				},
				{
					order: 2,
					title: 'Polishing the Academic Dashboard',
					tasks: [
						{
							level: 2,
							task: 1,
							title: 'Fix Grade Badge Colors',
							summary:
								'Map each grade tier to an explicit, accessible badge palette instead of a generic shadcn variant.',
							targetFiles: ['src/app/dashboard/grades/page.tsx'],
							snippets: [],
							solutionFiles: [
								{
									path: `${PORTAL_APP}/src/app/dashboard/grades/page.tsx`,
									action: 'edit',
									note: 'Replace `getGradeColor` (which returned a variant name) with a `getGradeClass` helper returning a class pair, and pass it via `className`.'
								}
							],
							notes: [
								'Tiers: A → `bg-green-100 text-green-800`, B → `bg-blue-100 text-blue-800`, C → `bg-yellow-100 text-yellow-800`, D/F → `bg-red-100 text-red-800`.',
								'Grade badges must not use a `variant` prop at all — the test fails if any `variant="success|warning|secondary|destructive"` remains.',
								'The mock data contains only A and B grades, so the C and D/F mappings are checked against the source text; keep the literal class strings in the file.'
							],
							testLabel: 'Level 2 - Task 2.1: grade badge colors',
							testPath: `${PORTAL_DIR}/level-2/task-1/grade-badge-colors.test.tsx`
						},
						{
							level: 2,
							task: 2,
							title: 'Refactor & Extract StatCard',
							summary:
								'Extract the duplicated stat-card markup into one reusable component and consolidate the fees page tallies into a single `useMemo`.',
							targetFiles: [
								'src/components/StatCard.tsx',
								'src/app/dashboard/page.tsx',
								'src/app/dashboard/fees/page.tsx',
								'src/app/dashboard/schedule/page.tsx',
								'src/app/dashboard/standing/page.tsx'
							],
							snippets: [],
							solutionFiles: [
								{ path: `${PORTAL_APP}/src/components/StatCard.tsx`, action: 'create' },
								{
									path: `${PORTAL_APP}/src/app/dashboard/fees/page.tsx`,
									action: 'edit',
									note: 'Return `{ paid, pending, overdue, totals }` from one `useMemo`; this page must also become a client component.'
								},
								{
									path: `${PORTAL_APP}/src/app/dashboard/page.tsx`,
									action: 'edit',
									note: 'Replace the four inline stat cards with `StatCard`.'
								},
								{
									path: `${PORTAL_APP}/src/app/dashboard/schedule/page.tsx`,
									action: 'edit',
									note: 'Replace the three summary cards with `StatCard`.'
								},
								{
									path: `${PORTAL_APP}/src/app/dashboard/standing/page.tsx`,
									action: 'edit',
									note: 'Replace the four progress cards with `StatCard`.'
								}
							],
							notes: [
								'`StatCard` takes `title`, `value`, `subtitle`, `icon` (a LucideIcon) and an optional `valueClassName` applied to the value element.',
								'Export it as a named export (the test accepts a default export too) — a named export is what the pages import.',
								'The fees tallies must be correct after the refactor: the test still asserts the grand total and the paid transaction count.'
							],
							testLabel: 'Level 2 - Task 2.2: StatCard primitive',
							testPath: `${PORTAL_DIR}/level-2/task-2/stat-card.test.tsx`
						}
					]
				},
				{
					order: 3,
					title: 'Empowering Students',
					tasks: [
						{
							level: 3,
							task: 1,
							title: 'Grade Search & Semester Filter',
							summary:
								'Add real-time search by course code or name, plus semester filter chips that combine with it.',
							targetFiles: ['src/app/dashboard/grades/page.tsx'],
							snippets: [],
							solutionFiles: [
								{
									path: `${PORTAL_APP}/src/app/dashboard/grades/page.tsx`,
									action: 'edit',
									note: 'Add `query`/`semesterFilter` state, a `useMemo` that applies both filters, the input + chips above the table, and the "No grades found" empty row.'
								}
							],
							notes: [
								'The input placeholder must be "Search grades..." and it must render outside the tabs so it is visible on load.',
								'The chips must be buttons named `All`, `1st Semester` and `2nd Semester` (`getByRole("button", { name: /^all$/i })` is anchored, so no other button may be named exactly "All").',
								'Both tables need the "No grades found" row for when filters match nothing.'
							],
							testLabel: 'Level 3 - Task 3.1: search input',
							testPath: `${PORTAL_DIR}/level-3/task-1/grade-search.test.tsx`
						},
						{
							level: 3,
							task: 2,
							title: 'Student Notes Page',
							summary:
								'Add a notes page at `/dashboard/notes` that reads and writes per-course notes in localStorage, linked from the sidebar.',
							targetFiles: [
								'src/app/dashboard/notes/page.tsx',
								'src/app/dashboard/layout.tsx'
							],
							snippets: [],
							solutionFiles: [
								{ path: `${PORTAL_APP}/src/app/dashboard/notes/page.tsx`, action: 'create' },
								{
									path: `${PORTAL_APP}/src/app/dashboard/layout.tsx`,
									action: 'edit',
									note: 'Add a `Notes` entry to the sidebar navigation pointing at `/dashboard/notes`.'
								}
							],
							notes: [
								'Persist under the `studentNotes` key as an array of `{ id, courseCode, content, createdAt }`.',
								'The empty state text must be "No notes yet".',
								'The new-note inputs must be reachable as `getByRole("textbox", { name: /course/i })` and `... /note/i }`, with an "Add Note" button — so label them "Course" and "Note".',
								'Each entry needs a generated `id` and `createdAt = new Date().toISOString()`.'
							],
							testLabel: 'Level 3 - Task 3.2: notes page scaffolding',
							testPath: `${PORTAL_DIR}/level-3/task-2/notes-page.test.tsx`
						}
					]
				},
				{
					order: 4,
					title: 'Hardening the Login Experience',
					tasks: [
						{
							level: 4,
							task: 1,
							title: 'Login Form Validation',
							summary:
								'Validate the student ID format and password length inline, block submission until valid, and reject wrong credentials.',
							targetFiles: ['src/app/login/page.tsx'],
							snippets: [],
							solutionFiles: [
								{
									path: `${PORTAL_APP}/src/app/login/page.tsx`,
									action: 'edit',
									note: 'Add the regex check, inline field errors, a disabled submit, and a credential check against the demo values.'
								}
							],
							notes: [
								'Student ID must match `^\\d{2}-\\d{3}-\\d{2}$`; the password must be at least 6 characters.',
								'Inline error copy must contain "Student ID must be in format" and "at least 6".',
								'Wrong credentials show "Invalid student ID or password" and must NOT navigate.',
								'Demo credentials are `12-346-78` / `sample`.',
								'Show each field error only once its field is non-empty, so a pristine form is not pre-flagged.'
							],
							testLabel: 'Level 4 - Task 4.1: student ID format validation',
							testPath: `${PORTAL_DIR}/level-4/task-1/login-validation.test.tsx`
						},
						{
							level: 4,
							task: 2,
							title: 'localStorage Persistence',
							summary:
								'Add a reusable `useLocalStorage` hook and use it for the sidebar preference, the notes store and the last student ID.',
							targetFiles: [
								'src/hooks/useLocalStorage.ts',
								'src/app/dashboard/layout.tsx',
								'src/app/dashboard/notes/page.tsx',
								'src/app/login/page.tsx'
							],
							snippets: [],
							solutionFiles: [
								{ path: `${PORTAL_APP}/src/hooks/useLocalStorage.ts`, action: 'create' },
								{
									path: `${PORTAL_APP}/src/app/dashboard/layout.tsx`,
									action: 'edit',
									note: 'Store `sidebarOpen` through the hook.'
								},
								{
									path: `${PORTAL_APP}/src/app/dashboard/notes/page.tsx`,
									action: 'edit',
									note: 'Use `useLocalStorage("studentNotes", [])` instead of raw get/setItem.'
								},
								{
									path: `${PORTAL_APP}/src/app/login/page.tsx`,
									action: 'edit',
									note: 'Persist `lastStudentId` on success and pre-fill the ID field from it.'
								}
							],
							notes: [
								'The hook signature is `useLocalStorage<T>(key, initialValue)` returning a `[value, setValue]` tuple, hydrating on mount and persisting on every set.',
								'The sidebar toggle button must carry `aria-label="Toggle sidebar"` so the test can find it deterministically.',
								'Persist the raw value with `JSON.stringify`, so the test reads it back via `JSON.parse(localStorage.getItem("sidebarOpen"))`.',
								'`lastStudentId` must pre-fill the field on the next visit.'
							],
							testLabel: 'Level 4 - Task 4.2: useLocalStorage hook',
							testPath: `${PORTAL_DIR}/level-4/task-2/localstorage-persistence.test.tsx`
						}
					]
				},
				{
					order: 5,
					title: 'The GPA Drift Crisis',
					tasks: [
						{
							level: 5,
							task: 1,
							title: 'Fix GPA + Standing Sync Bug',
							summary:
								'Centralise the cumulative GPA in one units-weighted helper and make every page read from it instead of a hard-coded value.',
							targetFiles: [
								'src/lib/mockData.ts',
								'src/app/dashboard/standing/page.tsx',
								'src/app/dashboard/page.tsx',
								'src/app/dashboard/grades/page.tsx'
							],
							snippets: [],
							solutionFiles: [
								{
									path: `${PORTAL_APP}/src/lib/mockData.ts`,
									action: 'edit',
									note: 'Add `computeCumulativeGPA(gradeList)` using the grade-points map, weighted by units.'
								},
								{
									path: `${PORTAL_APP}/src/app/dashboard/standing/page.tsx`,
									action: 'edit',
									note: 'Replace every `currentStanding.gpa` read (including the GPA-status helper input) with the computed value.'
								},
								{
									path: `${PORTAL_APP}/src/app/dashboard/page.tsx`,
									action: 'edit',
									note: 'Use the computed GPA in the stat card and the Academic Standing card.'
								},
								{
									path: `${PORTAL_APP}/src/app/dashboard/grades/page.tsx`,
									action: 'edit',
									note: 'Delete the `getAllTimeGPA` helper and read the Cumulative GPA card from `computeCumulativeGPA`.'
								}
							],
							notes: [
								'Grade points: A 4.0, A- 3.7, B+ 3.3, B 3.0, B- 2.7, C+ 2.3, C 2.0, C- 1.7, D+ 1.3, D 1.0, F 0.0.',
								'The mock grades produce **3.50** cumulative, not the stale hard-coded 3.67 — the tests assert 3.50 is rendered and 3.67 is not.',
								'Return 0 (not NaN) for an empty grade list.',
								'Source checks: `currentStanding.gpa` must be gone from the standing and dashboard pages, and `getAllTimeGPA` from the grades page. Leaving the now-unused `gpa` field on the `currentStanding` object is fine.'
							],
							testLabel: 'Level 5 - Task 5.1: computeCumulativeGPA helper',
							testPath: `${PORTAL_DIR}/level-5/task-1/gpa-sync.test.tsx`
						},
						{
							level: 5,
							task: 2,
							title: 'Date Utilities & Documentation',
							summary:
								'Ship a shared `dateUtils` module so fee due dates read as "Due in 5 days" / "Overdue by 2 days", and document the project in the README.',
							targetFiles: [
								'src/lib/dateUtils.ts',
								'src/app/dashboard/fees/page.tsx',
								'README.md'
							],
							snippets: [],
							solutionFiles: [
								{ path: `${PORTAL_APP}/src/lib/dateUtils.ts`, action: 'create' },
								{
									path: `${PORTAL_APP}/src/app/dashboard/fees/page.tsx`,
									action: 'edit',
									note: 'Delete the local `formatDate` helper and render `formatDueDate(fee.dueDate)` in the table.'
								},
								{ path: `${PORTAL_APP}/README.md`, action: 'edit' }
							],
							notes: [
								'`formatDueDate`: "Due Today" (same day), "Due Tomorrow" (1 day), "Due in N days" (2–7), "Overdue by N days" (past), otherwise the locale date string.',
								'Every helper needs a safe default: `""` for `formatDueDate`, `false` for `isOverdue`, `0` for `daysUntilDue`.',
								'Parse `YYYY-MM-DD` from its parts rather than `new Date(string)` — otherwise the day shifts in negative-offset timezones. All mock fee dates are in the past, so the table renders "Overdue by N days".',
								'The README must exceed 400 characters and mention the student portal, `12-346-78`, `sample`, `pnpm install`, and the `/dashboard/grades|schedule|fees|standing|notes` routes.'
							],
							testLabel: 'Level 5 - Task 5.2: dateUtils module',
							testPath: `${PORTAL_DIR}/level-5/task-2/date-utils-docs.test.tsx`
						}
					]
				}
			]
		}
	]
};
