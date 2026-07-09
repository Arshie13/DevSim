import { writable } from 'svelte/store';

export interface HelpTriggerPayload {
	category: string;
	description: string;
	timestamp: number;
}

function createHelpTriggerStore() {
	const { subscribe, set } = writable<HelpTriggerPayload | null>(null);

	function trigger(category: string, description: string) {
		set({ category, description, timestamp: Date.now() });
	}

	function clear() {
		set(null);
	}

	return { subscribe, trigger, clear };
}

export const helpTrigger = createHelpTriggerStore();
