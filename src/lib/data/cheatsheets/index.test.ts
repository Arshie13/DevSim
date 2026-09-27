import fs from 'node:fs';
import path from 'node:path';
import { getStackProgress, listCheatsheetStacks } from './index';
import type { CheatsheetScenario, CheatsheetTask } from '$types/cheatsheets';

const REPO_ROOT = process.cwd();
const SOLUTIONS_DIR = path.join(REPO_ROOT, 'cheatsheet-solutions');

/**
 * NOTE: `solutions.ts` is deliberately not imported here — it uses
 * `import.meta.glob`, which jest cannot parse. File-backed solutions are
 * verified against the filesystem instead, which is the stronger check anyway.
 */

interface AuthoredTask {
	stack: string;
	scenario: CheatsheetScenario;
	task: CheatsheetTask;
}

/** Every task that has content authored so far, with its owning stack/scenario. */
function authoredTasks(): AuthoredTask[] {
	return listCheatsheetStacks().flatMap((stack) =>
		stack.scenarios.flatMap((scenario) =>
			scenario.levels.flatMap((level) =>
				level.tasks.map((task) => ({ stack: stack.name, scenario, task }))
			)
		)
	);
}

describe('cheatsheet data integrity', () => {
	it('registers at least one stack', () => {
		expect(listCheatsheetStacks().length).toBeGreaterThan(0);
	});

	it('points every authored task at a test file that exists on disk', () => {
		const tasks = authoredTasks();
		expect(tasks.length).toBeGreaterThan(0);

		const missing = tasks
			.map(({ task }) => task.testPath)
			.filter((testPath) => !fs.existsSync(path.join(REPO_ROOT, testPath)));

		expect(missing).toEqual([]);
	});

	it('keeps level/task numbering aligned with the on-disk test layout', () => {
		for (const { task } of authoredTasks()) {
			expect(task.testPath).toContain(`level-${task.level}/task-${task.task}/`);
		}
	});

	it('gives every task something to copy-paste', () => {
		for (const { stack, scenario, task } of authoredTasks()) {
			const label = `${stack}/${scenario.ref}/L${task.level}T${task.task}`;
			const hasInline = task.snippets.length > 0;
			const hasFiles = (task.solutionFiles?.length ?? 0) > 0;

			expect(`${label}: ${hasInline || hasFiles}`).toBe(`${label}: true`);

			for (const snippet of task.snippets) {
				expect(snippet.label.trim().length).toBeGreaterThan(0);
				expect(snippet.code.trim().length).toBeGreaterThan(0);
			}
		}
	});

	it('resolves every file-backed solution to a real file', () => {
		const missing: string[] = [];

		for (const { stack, scenario, task } of authoredTasks()) {
			for (const solution of task.solutionFiles ?? []) {
				const onDisk = path.join(SOLUTIONS_DIR, stack, scenario.ref, solution.path);
				if (!fs.existsSync(onDisk)) {
					missing.push(`${stack}/${scenario.ref}/${solution.path}`);
				}
			}
		}

		expect(missing).toEqual([]);
	});

	it('reports authored-vs-total coverage without requiring full backfill', () => {
		const stacks = listCheatsheetStacks();
		const totalTasks = stacks.reduce(
			(sum, stack) => sum + getStackProgress(stack).total,
			0
		);
		const authored = authoredTasks().length;

		// nextjs-postgres-prisma: 3 scenarios x 10 + tutorial 2 = 32
		// nextjs-shadcn-ui: 3 scenarios x 10 = 30
		expect(totalTasks).toBe(62);
		expect(authored).toBeGreaterThan(0);
		expect(authored).toBeLessThanOrEqual(totalTasks);

		const report = stacks
			.map((stack) => {
				const { authored: done, total } = getStackProgress(stack);
				return `${stack.name} ${done}/${total}`;
			})
			.join(', ');

		console.log(`Cheatsheet coverage — ${report}`);
	});
});
