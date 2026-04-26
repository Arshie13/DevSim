// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

/// <reference types="@sveltejs/kit" />
/// <reference types="@auth/sveltekit" />

declare global {
	namespace App {
		// interface Error {}
	interface Locals {
		auth(): Promise<import("@auth/core/types").Session | null>;
		username?: string;
	}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

// Extend the Session type from @auth/sveltekit
declare module "@auth/sveltekit" {
	interface Session {
		user: {
			id: string;
			name?: string | null;
			email?: string | null;
			image?: string | null;
			fullName?: string | null;
			givenName?: string | null;
			username?: string | null;
			hasCompletedPretest?: boolean;
		};
	}
}

export {};
