import type { PageServerLoad } from './$types';
import { getStackProgress, listCheatsheetStacks } from '$lib/data/cheatsheets';

export const load: PageServerLoad = async () => {
	// Only ship the index metadata to the client — the snippet bodies load on the
	// scenario page so they stay out of every other bundle.
	const stacks = listCheatsheetStacks().map((stack) => ({
		name: stack.name,
		label: stack.label,
		description: stack.description,
		scenarioCount: stack.scenarios.length,
		progress: getStackProgress(stack)
	}));

	return { stacks };
};
