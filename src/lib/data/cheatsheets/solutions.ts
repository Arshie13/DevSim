import type {
	CheatsheetSolutionFile,
	CheatsheetSnippetLanguage,
	ResolvedSolutionFile
} from '$types/cheatsheets';

/**
 * Solution files are stored outside `src/` on purpose: the root `tsconfig.json`
 * includes `src/**` and `scripts/check-design.ts` walks `src/`, so Next.js app
 * code kept there would be type-checked and counted by the design ratchet.
 *
 * They are inlined as raw strings at build time, so they work in SSR and in the
 * client bundle without any filesystem access at runtime.
 */
const RAW_SOLUTIONS = import.meta.glob('/cheatsheet-solutions/**/*', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

/** Maps a file extension onto a syntax hint. */
function languageFor(filePath: string): CheatsheetSnippetLanguage {
	const extension = filePath.slice(filePath.lastIndexOf('.')).toLowerCase();

	switch (extension) {
		case '.tsx':
			return 'tsx';
		case '.ts':
			return 'ts';
		case '.jsx':
			return 'jsx';
		case '.js':
			return 'js';
		case '.json':
			return 'json';
		case '.prisma':
			return 'prisma';
		case '.md':
			return 'text';
		case '.sh':
			return 'bash';
		default:
			return 'text';
	}
}

/** Basename of a solution path, used as the snippet title. */
function filenameOf(solutionPath: string): string {
	return solutionPath.slice(solutionPath.lastIndexOf('/') + 1);
}

/**
 * Loads one solution file's contents.
 *
 * Returns `null` when the file is missing, which the data-integrity test treats
 * as a hard failure.
 */
export function loadSolutionFile(
	stack: string,
	scenarioRef: string,
	solution: CheatsheetSolutionFile
): ResolvedSolutionFile | null {
	const key = `/cheatsheet-solutions/${stack}/${scenarioRef}/${solution.path}`;
	const code = RAW_SOLUTIONS[key];

	if (code === undefined) return null;

	return {
		...solution,
		filename: filenameOf(solution.path),
		language: languageFor(solution.path),
		code
	};
}

/** Loads every solution file for a task, dropping any that are missing. */
export function loadSolutionFiles(
	stack: string,
	scenarioRef: string,
	solutions: CheatsheetSolutionFile[] | undefined
): ResolvedSolutionFile[] {
	if (!solutions?.length) return [];

	return solutions
		.map((solution) => loadSolutionFile(stack, scenarioRef, solution))
		.filter((file): file is ResolvedSolutionFile => file !== null);
}

/** True when the given solution reference resolves to a real file. */
export function solutionFileExists(
	stack: string,
	scenarioRef: string,
	solution: CheatsheetSolutionFile
): boolean {
	return `/cheatsheet-solutions/${stack}/${scenarioRef}/${solution.path}` in RAW_SOLUTIONS;
}
