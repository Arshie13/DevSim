export interface HelpEntry {
	id: string;
	category: string;
	title: string;
	description: string;
	steps: string[];
	actions?: { label: string; handler: string }[];
	image?: string;
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
		actions: [{ label: 'Refresh Files', handler: 'refreshFiles' }],
		image: '/images/limitations/files/save/cantsave.png'
	},
	{
		id: 'file-create-failure',
		category: 'File System',
		title: 'Can\'t create files or folders',
		description: 'File or folder creation failed. This may be caused by path traversal attempts or workspace disk space limits.',
		steps: [
			'Path traversal (../) is not allowed — use relative paths within the workspace only.',
			'Clear unnecessary cache folders (node_modules, .next, dist) to free up space.',
			'Try refreshing the file tree to sync with the workspace filesystem.'
		],
		actions: [{ label: 'Refresh Files', handler: 'refreshFiles' }],
		image: '/images/limitations/files/create/file.png'
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
		actions: [{ label: 'Refresh Files', handler: 'refreshFiles' }],
		image: '/images/limitations/files/delete/fail.png'
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
		actions: [{ label: 'Open Terminal', handler: 'openTerminal' }],
		image: '/images/limitations/terminal/disconnected/disconnect.png'
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
		],
		image: '/images/limitations/terminal/start/connecting.png'
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
		actions: [{ label: 'Open Terminal', handler: 'openTerminal' }],
		image: '/images/limitations/preview/loading.png'
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
		actions: [{ label: 'Open Crash Course', handler: 'openCrashCourse' }],
		image: '/images/limitations/tests/testfail.png'
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
		],
		image: '/images/limitations/task/forward/blocker.png'
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
		],
		image: '/images/limitations/task/regression/failedtest.png'
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
		],
		image: '/images/limitations/submit/reflection.png'
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
		],
		image: '/images/limitations/ai_credits/not_enough_credits.png'
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
		actions: [{ label: 'Open Crash Course', handler: 'openCrashCourse' }],
		image: '/images/limitations/ai_credits/out_of_scope.png'
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
	},
	{
		id: 'docker-isolation',
		category: 'Docker Environment',
		title: 'Workspace runs its own Linux environment',
		description: 'Your workspace is an Alpine Linux container with Node.js, pnpm, bash, and PostgreSQL pre-installed — it does not have your host machine\'s OS, browsers, or GUI apps.',
		steps: [
			'This is expected behavior — the workspace runs its own OS image.',
			'Use the terminal to install additional packages inside the container (pnpm add for project dependencies).',
			'The project files live in the workspace folder and are separate from your local machine.'
		]
	},
	{
		id: 'docker-filesystem-scope',
		category: 'Docker Environment',
		title: 'Files only persist inside the workspace',
		description: 'Files you create live in the workspace volume, not on your local disk. They are preserved while the workspace exists, but to keep them outside DevSim you must download the project.',
		steps: [
			'Download your project files using the download button if you need them outside DevSim.',
			'Your files stay in the workspace volume and reappear when you return to the project.',
			'Use version control (git) inside the workspace to track changes if you plan to work long-term.'
		]
	},
	{
		id: 'docker-networking',
		category: 'Docker Environment',
		title: 'Networking is scoped to the workspace',
		description: 'Each workspace runs on its own Docker network. The preview panel forwards your dev server ports, and the database is reachable by hostname from inside the workspace.',
		steps: [
			'Use the preview panel to access your dev server — it forwards the container ports automatically.',
			'Use the database hostname from the workspace env (DATABASE_HOST, DATABASE_PORT) instead of localhost.',
			'Inside the container, localhost refers to the container itself, not your host machine.'
		]
	},
	{
		id: 'docker-gui-tools',
		category: 'Docker Environment',
		title: 'Native or GUI tools not working',
		description: 'Some native or GUI-dependent tools may not work inside the container environment.',
		steps: [
			'Use CLI alternatives instead of GUI tools (e.g., vim instead of VS Code GUI).',
			'Some desktop applications cannot run in a headless container.',
			'Check the crash course for CLI equivalents of common GUI workflows.'
		]
	},
	{
		id: 'docker-performance',
		category: 'Docker Environment',
		title: 'Performance and timing variations',
		description: 'Performance and timing can vary from a standard local development machine.',
		steps: [
			'Build times and test execution may be slower due to container overhead.',
			'Avoid tight timing assertions in your code — use more flexible thresholds.',
			'Close unused terminals and stop unnecessary processes to free resources.'
		]
	},
	{
		id: 'docker-hot-reload',
		category: 'Docker Environment',
		title: 'Hot reloading not detecting changes',
		description: 'Hot reloading and file watching may not detect changes reliably because the workspace project folder is a bind mount shared with the host filesystem.',
		steps: [
			'Try restarting your dev server if hot reload stops working.',
			'Use the Refresh button in the preview panel to manually reload.',
			'Save files explicitly (Ctrl+S) to ensure changes are written to the container.'
		]
	},
	{
		id: 'docker-auth',
		category: 'Docker Environment',
		title: 'Git credentials or SSH keys unavailable',
		description: 'Git credentials, SSH keys, and other host authentication are not available inside the container unless explicitly configured.',
		steps: [
			'Use HTTPS URLs with personal access tokens instead of SSH for git operations.',
			'Configure git credentials inside the container if needed.',
			'Download your code and work with local files when authentication is required.'
		]
	},
	{
		id: 'docker-disk-space',
		category: 'Docker Environment',
		title: 'Workspace disk space limited',
		description: 'Each workspace container is limited to 512MB of memory and the workspace volume can fill up with dependencies, caches, or build artifacts.',
		steps: [
			'Clear cache folders: rm -rf node_modules .next dist build .cache',
			'Remove unnecessary files and large dependencies.',
			'Download your project before cleaning to avoid losing work.'
		]
	},
	{
		id: 'docker-terminal-disconnect',
		category: 'Docker Environment',
		title: 'Terminal session disconnected',
		description: 'The terminal session may disconnect due to network fluctuations or page reloads, interrupting running processes.',
		steps: [
			'Click the Refresh button at the top of the terminal panel to re-establish the connection.',
			'If the terminal won\'t reconnect, close it and open a new terminal session.',
			'Long-running processes may have been interrupted — you\'ll need to restart them.'
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
	'Download',
	'Docker Environment'
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
