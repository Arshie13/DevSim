import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import prisma from '$lib/server/client';
import { isAdminRole, isSuperAdmin } from '$lib/utils/roles';

export const load: LayoutServerLoad = async ({ locals }) => {
  const session = await locals.auth();
  
  if (!session?.user) {
    throw redirect(303, '/login');
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });

  if (!dbUser || !isAdminRole(dbUser.role)) {
    throw redirect(303, '/');
  }

  return {
    user: session.user,
    isSuperAdmin: isSuperAdmin(dbUser.role)
  };
};
