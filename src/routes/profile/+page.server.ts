// sample page protection
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async (event) => {
  const session = await event.locals.auth();

  if (!session?.user) {
    throw redirect(303, '/'); // Redirect to home or login page
  }

  // Return any data needed for the page
  return {
    user: session.user
  };
};
