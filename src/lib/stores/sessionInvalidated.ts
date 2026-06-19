import { writable } from 'svelte/store';

/**
 * Global store that signals the user's session is invalid/expired.
 * When true, the app should show a forced "Session Expired" modal
 * and redirect the user to login.
 */
export const sessionInvalidated = writable(false);
