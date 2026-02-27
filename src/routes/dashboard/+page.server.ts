import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";
import { getAllUserContainer } from "$lib/server/docker/user/get-user-container";

export const load: PageServerLoad = async (event) => {
  const session = await event.locals.auth();
  const userData = session?.user;
  console.log("User: " + userData?.name);
  console.log("Email:" + userData?.email);
  console.log("Avatar: " + userData?.image);

  if (!session?.user) {
    throw redirect(303, '/')
  }

  const userContainerList = await getAllUserContainer(session.user.id);

  // console.log("container list: ", userContainerList);

  return {
    user: session.user,
    userContainerList
  };
  
}
