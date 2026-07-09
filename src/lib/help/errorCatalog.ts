export interface HelpEntry {
	id: string;
	category: string;
	title: string;
	description: string;
	steps: string[];
	actions?: { label: string; handler: string }[];
}

export const errorCatalog: HelpEntry[] = [
	{
		id: 'file-save-failure',
		category: 'File System',
		title: 'Can\'t save files',
		description: 'File save operations failed. This could be due to read-only files, workspace disk space issues, or a temporary API error.',
		steps: [
			'Check if the file is read-only (package.json and README files are protected from editing).',
			'Verify you have enough disk space in the workspace. Large dependency installs can fill up space quickly.',
			'Try saving again (Ctrl+S) — transient API errors sometimes resolve on their own.',
			'If the problem persists, try refreshing the file tree from the sidebar to re-sync.'
		],
		actions: [{ label: 'Refresh Files', handler: 'refreshFiles' }]
	},
	{
		id: 'file-create-failure',
		category: 'File System',
		title: 'Can\'t create files or folders',
		description: 'File or folder creation failed. This may be caused by invalid names, permission issues, or workspace disk space limits.',
		steps: [
			'Avoid special characters in file and folder names (use letters, numbers, hyphens, and underscores).',
			'Check that the parent directory exists before creating files inside it.',
			'Clear unnecessary cache folders (node_modules, .next, dist) to free up space.',
			'Try refreshing the file tree to sync with the workspace filesystem.'
		],
		actions: [{ label: 'Refresh Files', handler: 'refreshFiles' }]
	},
	{
		id: 'file-delete-failure',
		category: 'File System',
		title: 'Can\'t delete files',
		description: 'File deletion failed. Protected system files cannot be deleted, and certain directories may be locked.',
		steps: [
			'System files like package.json and README are protected from deletion.',
			'If you\'re sure you want to delete a non-protected file, try refreshing the file tree first.',
			'Use the terminal (rm command) as an alternative way to delete files.'
		],
		actions: [{ label: 'Refresh Files', handler: 'refreshFiles' }]
	},
	{
		id: 'terminal-disconnect',
		category: 'Terminal',
		title: 'Terminal disconnected',
		description: 'The terminal session lost its connection to the workspace. This can happen due to network fluctuations or workspace restarts.',
		steps: [
			'Click the Refresh button at the top of the terminal panel to re-establish the connection.',
			'If the terminal won\'t reconnect, close it and open a new terminal session from the Terminals sidebar.',
			'Long-running processes may have been interrupted — you\'ll need to restart them.',
			'You can have up to 3 terminal sessions. Close unused ones if you hit the limit.'
		],
		actions: [{ label: 'Open Terminal', handler: 'openTerminal' }]
	},
	{
		id: 'terminal-init-failure',
		category: 'Terminal',
		title: 'Terminal won\'t start',
		description: 'A new terminal session couldn\'t be initialized. This typically happens when the workspace is still booting or has stopped.',
		steps: [
			'Wait a few seconds and try again — the workspace may still be initializing.',
			'Make sure you haven\'t reached the 3-terminal limit. Close unused sessions from the Terminals sidebar.',
			'If the workspace was idle for a long time, it may have stopped. Refresh the page.',
			'If the problem persists, try opening a new terminal with the + button in the Terminals sidebar.'
		]
	},
	{
		id: 'preview-not-loading',
		category: 'Preview',
		title: 'Preview not loading',
		description: 'The preview panel can\'t connect to your development server. The server may not be running.',
		steps: [
			'Start your dev server in the terminal first (pnpm dev).',
			'Wait for the server to fully start — some frameworks take a moment to compile.',
			'Click the Refresh button in the preview panel toolbar to retry the connection.',
			'Check the terminal output for errors if the server fails to start.'
		],
		actions: [{ label: 'Open Terminal', handler: 'openTerminal' }]
	},
	{
		id: 'test-failure',
		category: 'Tests',
		title: 'Task tests keep failing',
		description: 'Your code isn\'t passing the automated tests for a task. Each test validates specific acceptance criteria from the task\'s requirements.',
		steps: [
			'Read the test failure output in the results modal — it shows exactly which criteria failed and why.',
			'Re-read the task\'s acceptance criteria in the board panel to make sure you haven\'t missed any requirements.',
			'Open the crash course section for this task — it teaches the concepts needed to pass the tests.',
			'Make sure your code handles edge cases (empty inputs, invalid data, error states).',
			'Click the Beaker test button in the workspace header to re-run tests after fixing your code.'
		],
		actions: [{ label: 'Open Crash Course', handler: 'openCrashCourse' }]
	},
	{
		id: 'task-order-blocked',
		category: 'Task Ordering',
		title: 'Can\'t move a task forward',
		description: 'The task board enforces sequential completion. You must finish earlier tasks before moving later ones.',
		steps: [
			'Complete all tasks that appear before this one in the task board.',
			'Look for the blocking task number in the warning — that task must be moved to Done first.',
			'If a task requires the crash course, complete the learning content before proceeding.'
		]
	},
	{
		id: 'task-regression',
		category: 'Task Ordering',
		title: 'Previously completed task now failing',
		description: 'Changes to your code caused a previously passing task to fail. This is called a regression.',
		steps: [
			'Review the regression error details in the modal — it shows which task is affected.',
			'Look at the files you recently changed — those are the likely cause.',
			'Fix the regression before submitting your sprint — all tasks must pass together.'
		]
	},
	{
		id: 'submit-reflection-short',
		category: 'Submit Sprint',
		title: 'Reflection is too short',
		description: 'Your mastery reflection needs to be at least 80 characters to demonstrate understanding of the work you did.',
		steps: [
			'Describe what you built and the technical decisions you made.',
			'Explain any challenges you faced and how you solved them.',
			'Mention specific files or components you worked on.',
			'The reflection helps verify your mastery — be specific and technical.'
		]
	},
	{
		id: 'submit-mastery-not-met',
		category: 'Submit Sprint',
		title: 'Mastery checkpoint not met',
		description: 'The AI mastery verification determined that your work doesn\'t yet meet the level\'s learning objectives.',
		steps: [
			'Review the gap details shown in the submission modal — they tell you what\'s missing.',
			'Re-visit the crash course sections for concepts you haven\'t demonstrated yet.',
			'Make sure your code demonstrates the skills taught in this level.',
			'Run all tests before submitting — failing tests block mastery verification.'
		],
		actions: [{ label: 'Open Crash Course', handler: 'openCrashCourse' }]
	},
	{
		id: 'submit-workspace-missing',
		category: 'Submit Sprint',
		title: 'Workspace record not found',
		description: 'The workspace couldn\'t locate your session when trying to submit. This usually means the session state is stale.',
		steps: [
			'Refresh the page to re-sync your workspace session with the server.',
			'If the problem persists, go back to the dashboard and re-enter the workspace.',
			'This error is rare — if it keeps happening, send a help request.'
		]
	},
	{
		id: 'ai-insufficient-credits',
		category: 'AI / SAZ',
		title: 'Not enough AI help credits',
		description: 'You\'ve run out of AI help credits. Credits are used for quick hints and chat messages with SAZ.',
		steps: [
			'Exchange coins for AI help credits — the conversion rate is shown in the AI panel.',
			'You earn coins by completing levels, daily login rewards, and the Learner\'s Pass.',
			'Check the rewards section to see when your next coin reward is available.'
		]
	},
	{
		id: 'ai-code-blocked',
		category: 'AI / SAZ',
		title: 'SAZ won\'t give code solutions',
		description: 'SAZ is designed to provide hints and guidance, not complete code solutions. This helps you learn by doing.',
		steps: [
			'Rephrase your question to ask for a hint or explanation instead of code.',
			'Ask about the concept or approach rather than the implementation.',
			'Read the crash course section — it covers the concepts you need for the task.'
		],
		actions: [{ label: 'Open Crash Course', handler: 'openCrashCourse' }]
	},
	{
		id: 'download-failure',
		category: 'Download',
		title: 'Project download failed',
		description: 'The project zip download couldn\'t be generated. This may be due to workspace disk space or a large project size.',
		steps: [
			'Clear unnecessary files and cache folders to reduce project size.',
			'Try downloading again — transient errors sometimes resolve on retry.',
			'If the project is very large, consider downloading individual files instead.'
		]
	}
];

export const errorCategoryOrder = [
	'File System',
	'Terminal',
	'Preview',
	'Tests',
	'Task Ordering',
	'Submit Sprint',
	'AI / SAZ',
	'Download'
];

export function searchErrors(query: string): HelpEntry[] {
	const q = query.toLowerCase().trim();
	if (!q) return errorCatalog;
	return errorCatalog.filter(
		(e) =>
			e.title.toLowerCase().includes(q) ||
			e.description.toLowerCase().includes(q) ||
			e.category.toLowerCase().includes(q)
	);
}

export function getErrorsByCategory(category: string): HelpEntry[] {
	return errorCatalog.filter((e) => e.category === category);
}
