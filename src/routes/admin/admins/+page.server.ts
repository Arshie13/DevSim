import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import prisma from '$lib/server/client';
import { ROLES, isAdminRole, isSuperAdmin } from '$lib/utils/roles';

/**
 * Resolves the signed-in user and asserts they hold the SUPERADMIN role.
 * Redirects weaker users out of the admin panel; returns the actor's id.
 */
async function requireSuperAdmin(locals: App.Locals): Promise<string> {
  const session = await locals.auth();

  if (!session?.user) {
    throw redirect(303, '/login');
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!dbUser || !isSuperAdmin(dbUser.role)) {
    throw redirect(303, '/admin');
  }

  return session.user.id;
}

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  username: true,
  image: true,
  created_at: true,
} as const;

export const load: PageServerLoad = async ({ locals, url }) => {
  await requireSuperAdmin(locals);

  const q = (url.searchParams.get('q') ?? '').trim();

  const admins = await prisma.user.findMany({
    where: { role: { in: [ROLES.ADMIN, ROLES.SUPERADMIN] } },
    select: { ...USER_SELECT, role: true },
    orderBy: [{ role: 'desc' }, { name: 'asc' }],
  });

  // Only search once the query is long enough to be meaningful.
  const candidates =
    q.length >= 2
      ? await prisma.user.findMany({
          where: {
            role: { notIn: [ROLES.ADMIN, ROLES.SUPERADMIN] },
            OR: [
              { email: { contains: q, mode: 'insensitive' } },
              { username: { contains: q, mode: 'insensitive' } },
              { name: { contains: q, mode: 'insensitive' } },
            ],
          },
          select: USER_SELECT,
          orderBy: { name: 'asc' },
          take: 25,
        })
      : [];

  return { admins, candidates, q };
};

export const actions: Actions = {
  promote: async ({ locals, request }) => {
    await requireSuperAdmin(locals);

    const formData = await request.formData();
    const userId = formData.get('userId');

    if (typeof userId !== 'string' || !userId) {
      return fail(400, { success: false, message: 'Missing user id.' });
    }

    const target = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, username: true, role: true },
    });

    if (!target) {
      return fail(404, { success: false, message: 'User not found.' });
    }

    if (isAdminRole(target.role)) {
      return fail(400, { success: false, message: 'That user is already an admin.' });
    }

    await prisma.user.update({
      where: { id: target.id },
      data: { role: ROLES.ADMIN },
    });

    return {
      success: true,
      message: `${target.name || target.username} is now an admin.`,
    };
  },

  revoke: async ({ locals, request }) => {
    await requireSuperAdmin(locals);

    const formData = await request.formData();
    const userId = formData.get('userId');

    if (typeof userId !== 'string' || !userId) {
      return fail(400, { success: false, message: 'Missing user id.' });
    }

    const target = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, username: true, role: true },
    });

    if (!target) {
      return fail(404, { success: false, message: 'User not found.' });
    }

    // SUPERADMIN accounts can never be demoted from this page.
    if (isSuperAdmin(target.role)) {
      return fail(403, { success: false, message: 'Superadmins cannot be revoked.' });
    }

    if (target.role !== ROLES.ADMIN) {
      return fail(400, { success: false, message: 'That user is not an admin.' });
    }

    await prisma.user.update({
      where: { id: target.id },
      data: { role: ROLES.USER },
    });

    return {
      success: true,
      message: `${target.name || target.username} is no longer an admin.`,
    };
  },
};
