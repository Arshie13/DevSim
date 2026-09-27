import type {
	CheatsheetProgress,
	CheatsheetScenario,
	CheatsheetStack
} from '$types/cheatsheets';
import { nextjsPostgresPrismaCheatsheet } from './nextjs-postgres-prisma';
import { nextjsShadcnUiCheatsheet } from './nextjs-shadcn-ui';

/**
 * Registry of tech stacks that have cheatsheet content.
 *
 * Adding a stack is a one-line registration plus its data module. Unknown
 * stacks resolve to `null` so routes can 404 instead of rendering an empty page.
 */
const REGISTRY: Record<string, CheatsheetStack> = {
	[nextjsPostgresPrismaCheatsheet.name]: nextjsPostgresPrismaCheatsheet,
	[nextjsShadcnUiCheatsheet.name]: nextjsShadcnUiCheatsheet
};

/** All registered stacks, sorted by display label. */
export function listCheatsheetStacks(): CheatsheetStack[] {
	return Object.values(REGISTRY).sort((a, b) => a.label.localeCompare(b.label));
}

/** Resolve a stack by its folder slug, or `null` when it has no cheatsheet. */
export function getCheatsheet(stack: string): CheatsheetStack | null {
	return REGISTRY[stack] ?? null;
}

/** Resolve a scenario inside a stack by its folder ref, or `null`. */
export function getCheatsheetScenario(
	stack: string,
	ref: string
): { stack: CheatsheetStack; scenario: CheatsheetScenario } | null {
	const entry = getCheatsheet(stack);
	const scenario = entry?.scenarios.find((s) => s.ref === ref);
	if (!entry || !scenario) return null;
	return { stack: entry, scenario };
}

/** Number of tasks that have authored content. */
export function countAuthoredTasks(scenario: CheatsheetScenario): number {
	return scenario.levels.reduce((sum, level) => sum + level.tasks.length, 0);
}

/** Authored-vs-total progress for one scenario. */
export function getScenarioProgress(scenario: CheatsheetScenario): CheatsheetProgress {
	return { authored: countAuthoredTasks(scenario), total: scenario.totalTasks };
}

/** Authored-vs-total progress across every scenario in a stack. */
export function getStackProgress(stack: CheatsheetStack): CheatsheetProgress {
	return stack.scenarios.reduce<CheatsheetProgress>(
		(acc, scenario) => {
			const tasks = countAuthoredTasks(scenario);
			return { authored: acc.authored + tasks, total: acc.total + scenario.totalTasks };
		},
		{ authored: 0, total: 0 }
	);
}
