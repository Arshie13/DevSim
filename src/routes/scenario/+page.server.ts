import fs from 'node:fs/promises';
import path from 'node:path';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import prisma from '$lib/server/client';
import type { ScenarioMeta, StackSelection } from '$lib/types/techstack';

const BASE_DIR = path.resolve('submodules/projects/tech-stacks');

function parseProjectMd(content: string): { title: string; description: string } {
	const lines = content.split('\n');
	let title = '';
	for (const line of lines) {
		const m = line.match(/^#\s+(.+)/);
		if (m) {
			title = m[1].trim();
			break;
		}
	}
	const paragraphs = content
		.split(/\n{2,}/)
		.map((p) => p.trim())
		.filter((p) => p && !p.startsWith('#') && !p.startsWith('---') && !p.startsWith('`'));
	const description = paragraphs[0]?.replace(/\n/g, ' ') ?? '';
	return { title, description };
}

function parseLevelsMd(content: string): { levelCount: number; difficulty: string } {
	const levelNums = new Set<number>();
	for (const m of content.matchAll(/Level\s+(\d+)/gi)) {
		levelNums.add(parseInt(m[1], 10));
	}
	const levelCount = levelNums.size;

	const difficulties: string[] = [];
	for (const m of content.matchAll(/\*\*Difficulty[^:]*:\s*[⭐★]?\s*([A-Za-z]+)\*\*/g)) {
		difficulties.push(m[1].trim());
	}
	let difficulty = '';
	if (difficulties.length >= 2) {
		difficulty = `${difficulties[0]} → ${difficulties[difficulties.length - 1]}`;
	} else if (difficulties.length === 1) {
		difficulty = difficulties[0];
	}
	return { levelCount, difficulty };
}

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();

	if (!session?.user) {
		throw redirect(303, '/');
	}

	const dbUser = await prisma.user.findUnique({
		where: { id: session.user.id },
		select: { coins: true, image: true, hasCompletedOnboarding: true }
	});

	const user = { ...session.user, image: dbUser?.image ?? session.user.image };
	const userCoins = dbUser?.coins ?? 0;
	const hasCompletedOnboarding = dbUser?.hasCompletedOnboarding ?? false;

	const stackParam = event.url.searchParams.get('stack') ?? '';
	const selectionRaw = event.url.searchParams.get('selection') ?? '{}';

	const emptyReturn = (stackName = stackParam) => ({
		scenarios: [] as ScenarioMeta[],
		stackName,
		stackSummary: null as string | null,
		selection: { frontend: null, backend: null, database: null, services: null } as StackSelection,
		user,
		userCoins,
		hasCompletedOnboarding
	});

	// Strict validation: alphanumeric + hyphens only (prevents path traversal)
	if (!stackParam || !/^[a-z0-9-]+$/.test(stackParam)) {
		return emptyReturn();
	}

	// Resolve and verify path stays within base directory
	const stackDir = path.resolve(BASE_DIR, stackParam);
	if (!stackDir.startsWith(BASE_DIR + path.sep)) {
		return emptyReturn();
	}

	let selection: StackSelection = { frontend: null, backend: null, database: null, services: null };
	try {
		selection = JSON.parse(selectionRaw) as StackSelection;
	} catch {
		/* ignore malformed JSON */
	}

	try {
		await fs.access(stackDir);
	} catch {
		return { ...emptyReturn(), selection };
	}

	const entries = await fs.readdir(stackDir, { withFileTypes: true });
	const scenarioDirs = entries
		.filter((e) => e.isDirectory() && /^scenario-\d+$/.test(e.name))
		.sort((a, b) => {
			const numA = parseInt(a.name.replace('scenario-', ''), 10);
			const numB = parseInt(b.name.replace('scenario-', ''), 10);
			return numA - numB;
		});

	const scenarios: ScenarioMeta[] = [];

	for (const dir of scenarioDirs) {
		const scenarioPath = path.join(stackDir, dir.name);
		const subEntries = await fs.readdir(scenarioPath, { withFileTypes: true });

		// The project subfolder is the first (and typically only) directory in scenario-N/
		const projectEntry = subEntries.find((e) => e.isDirectory());
		if (!projectEntry) continue;

		const projectFolder = projectEntry.name;

		// project.md: check at scenario-N/ root first, then inside the project folder
		const projectMdAtRoot = path.join(scenarioPath, 'project.md');
		const projectMdInFolder = path.join(scenarioPath, projectFolder, 'project.md');

		let projectMdContent: string;
		try {
			projectMdContent = await fs.readFile(projectMdAtRoot, 'utf-8');
		} catch {
			try {
				projectMdContent = await fs.readFile(projectMdInFolder, 'utf-8');
			} catch {
				// project.md is required — skip this scenario if missing in both locations
				continue;
			}
		}

		const { title: mdTitle, description } = parseProjectMd(projectMdContent);

		// Derive title from folder name when project.md has no # heading
		const folderTitle = projectFolder
			.replace(/_/g, ' ')
			.replace(/-/g, ' ')
			.replace(/\b\w/g, (c) => c.toUpperCase());
		const title = mdTitle || folderTitle;

		// levels.md lives inside the project subfolder
		const levelsMdPath = path.join(scenarioPath, projectFolder, 'levels.md');
		let levelCount = 0;
		let difficulty = '';
		let hasLevels = false;

		try {
			const lvContent = await fs.readFile(levelsMdPath, 'utf-8');
			if (lvContent.trim()) {
				const parsed = parseLevelsMd(lvContent);
				levelCount = parsed.levelCount;
				difficulty = parsed.difficulty;
				hasLevels = true;
			}
		} catch {
			/* levels.md is optional */
		}

		// Fall back: derive difficulty from scenario number if not found in file
		if (!difficulty) {
			const num = parseInt(dir.name.replace('scenario-', ''), 10);
			difficulty = num === 1 ? 'Easy' : num === 2 ? 'Medium' : 'Hard';
		}

		const number = parseInt(dir.name.replace('scenario-', ''), 10);
		// Namespace the scenario id by stack to avoid collisions between different stacks
		// that both contain a "scenario-1" folder. Must match the seed's Scenario.id format.
		const id = `${stackParam}-${dir.name}`;
		scenarios.push({ id, folder: dir.name, number, title, description, difficulty, levelCount, projectFolder, hasLevels });
	}

	let stackSummary: string | null = null;
	try {
		stackSummary = await fs.readFile(path.join(stackDir, 'summary.md'), 'utf-8');
	} catch {
		/* summary.md is optional */
	}

	return { scenarios, stackName: stackParam, stackSummary, selection, user, userCoins, hasCompletedOnboarding };
};
