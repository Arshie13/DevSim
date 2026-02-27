import { getAllUserContainer } from '$lib/server/docker/user/get-user-container';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async (event) => {
  const session = await event.locals.auth();

  if (!session?.user) {
    throw redirect(303, '/');
  }

   const userContainerList = await getAllUserContainer(session.user.id);

  return {
    user: session.user,
    userContainerList
  };
};
