import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getCheatsheet, getScenarioProgress } from '$lib/data/cheatsheets';

export const load: PageServerLoad = async ({ params }) => {
	const stack = getCheatsheet(params.stack);

	if (!stack) {
		throw error(404, 'Unknown tech stack');
	}

	return {
		stack: {
			name: stack.name,
			label: stack.label,
			description: stack.description
		},
		scenarios: stack.scenarios.map((scenario) => ({
			ref: scenario.ref,
			folder: scenario.folder,
			name: scenario.name,
			description: scenario.description,
			levels: scenario.levels.map((level) => ({ order: level.order, title: level.title })),
			progress: getScenarioProgress(scenario)
		}))
	};
};
