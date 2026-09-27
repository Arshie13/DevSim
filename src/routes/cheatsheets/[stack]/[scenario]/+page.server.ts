import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getCheatsheetScenario, getScenarioProgress } from '$lib/data/cheatsheets';
import { loadSolutionFiles } from '$lib/data/cheatsheets/solutions';
import type { CheatsheetLevelView } from '$types/cheatsheets';

export const load: PageServerLoad = async ({ params }) => {
	const found = getCheatsheetScenario(params.stack, params.scenario);

	if (!found) {
		throw error(404, 'Unknown scenario');
	}

	const { stack, scenario } = found;

	// Resolve file-backed solutions here so the page receives plain strings.
	const levels: CheatsheetLevelView[] = scenario.levels.map((level) => ({
		order: level.order,
		title: level.title,
		tasks: level.tasks.map((task) => ({
			...task,
			resolvedFiles: loadSolutionFiles(stack.name, scenario.ref, task.solutionFiles)
		}))
	}));

	return {
		stack: { name: stack.name, label: stack.label },
		scenario: {
			ref: scenario.ref,
			folder: scenario.folder,
			name: scenario.name,
			description: scenario.description
		},
		levels,
		progress: getScenarioProgress(scenario)
	};
};
