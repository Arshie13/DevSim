/**
 * Cheatsheet Types
 *
 * Hand-authored, copy-pasteable snippets that help a learner pass the graded
 * tests for a scenario. Content is authored per tech stack in
 * `src/lib/data/cheatsheets/<stack>.ts`.
 *
 * A cheatsheet mirrors the on-disk test layout exactly:
 *   tests/[client|server/]level-N/task-M/*.test.ts(x)
 * so a task entry always points back at the test that grades it.
 */

export type CheatsheetSnippetLanguage =
	| 'ts'
	| 'tsx'
	| 'js'
	| 'jsx'
	| 'bash'
	| 'prisma'
	| 'json'
	| 'env'
	| 'text';

/** A single copy-pasteable block. */
export interface CheatsheetSnippet {
	/** Short label describing what the block does, shown on the snippet header. */
	label: string;
	/** Syntax hint for the code surface. */
	language: CheatsheetSnippetLanguage;
	/** File the snippet belongs in, e.g. `src/lib/format.ts`. */
	filename?: string;
	/** The copy-pasteable body. */
	code: string;
	/** Optional caveat or follow-up shown beneath the block. */
	note?: string;
}

/** One graded task: the file(s) to touch, the steps, and the snippet(s). */
export interface CheatsheetTask {
	/** 1-based level order, matching `level-N` on disk. */
	level: number;
	/** 1-based task order within the level, matching `task-M` on disk. */
	task: number;
	/** Human title, e.g. "Add Peso Formatting Helper". */
	title: string;
	/** One-line description of what the task requires. */
	summary: string;
	/** File(s) the learner creates or edits. */
	targetFiles: string[];
	/** Ordered actions to perform (commands, env changes) before/alongside the code. */
	steps?: string[];
	/** Inline copy-pasteable blocks. Used when the solution is small or standalone. */
	snippets: CheatsheetSnippet[];
	/**
	 * File-backed solution files. Used when the solution is a whole application
	 * file, so the code lives as a real file under `cheatsheet-solutions/` rather
	 * than being embedded in this module.
	 */
	solutionFiles?: CheatsheetSolutionFile[];
	/** Gotchas the learner must know to pass the test. */
	notes?: string[];
	/** The test's `describe` label, e.g. "L2T1: getStockStatusForProduct (server action)". */
	testLabel: string;
	/** Repo-relative path to the test that grades this task. */
	testPath: string;
}

/**
 * A solution file stored under `cheatsheet-solutions/<stack>/<scenario>/<path>`.
 *
 * The path mirrors the scenario folder exactly, so a file destined for
 * `library-management/src/lib/dateUtils.ts` is stored under
 * `library-management/src/lib/dateUtils.ts`.
 */
export interface CheatsheetSolutionFile {
	/** Path relative to the scenario folder. */
	path: string;
	/** Whether the learner creates the file or edits an existing one. */
	action: 'create' | 'edit';
	/** Optional explanation of what to change (most useful for `edit`). */
	note?: string;
}

/** A solution file with its source loaded, ready to render. */
export interface ResolvedSolutionFile extends CheatsheetSolutionFile {
	/** Basename of `path`, shown as the snippet title. */
	filename: string;
	/** Syntax hint derived from the file extension. */
	language: CheatsheetSnippetLanguage;
	/** The file contents. */
	code: string;
}

/** A level groups its tasks and carries the title used by the learning track. */
export interface CheatsheetLevel {
	/** 1-based level order. */
	order: number;
	/** Human title, e.g. "Inventory Quality". */
	title: string;
	/** Tasks authored for this level. Empty until backfilled. */
	tasks: CheatsheetTask[];
}

/** A scenario folder inside a tech stack. */
export interface CheatsheetScenario {
	/** Folder name on disk, e.g. `scenario-1`. */
	ref: string;
	/** App folder inside the scenario, e.g. `pos-system`. */
	folder: string;
	/** Human scenario name, e.g. "POS System". */
	name: string;
	/** Short role-play description shown on the scenario index. */
	description: string;
	/** Total graded tasks in this scenario (authored + still to backfill). */
	totalTasks: number;
	levels: CheatsheetLevel[];
}

/** A tech stack, matching a folder under `submodules/projects/tech-stacks`. */
export interface CheatsheetStack {
	/** Stack slug, matching the folder name, e.g. `nextjs-postgres-prisma`. */
	name: string;
	/** Display name, e.g. "Next.js + PostgreSQL + Prisma". */
	label: string;
	/** Short description shown on the stack index. */
	description: string;
	scenarios: CheatsheetScenario[];
}

/** A task with its file-backed solutions loaded, ready to render. */
export interface CheatsheetTaskView extends CheatsheetTask {
	resolvedFiles: ResolvedSolutionFile[];
}

/** A level whose tasks carry resolved solution files. */
export interface CheatsheetLevelView {
	order: number;
	title: string;
	tasks: CheatsheetTaskView[];
}

/** Authored-vs-total progress for a scenario or an entire stack. */
export interface CheatsheetProgress {
	authored: number;
	total: number;
}
