import { redirect } from '@sveltejs/kit';
import prisma from '$lib/server/client';
import { isAdminRole } from '$lib/utils/roles';

export async function requireAdmin(locals: App.Locals) {
  const session = await locals.auth();

  if (!session?.user?.id) {
    throw redirect(303, '/login');
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true }
  });

  if (!dbUser || !isAdminRole(dbUser.role)) {
    throw redirect(303, '/');
  }

  return { session, user: dbUser };
}
