import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import prisma from '$lib/server/client';

export const load: PageServerLoad = async ({ locals }) => {
  const session = await locals.auth();

  if (!session?.user) {
    throw redirect(303, '/login');
  }

  const sandboxSetting = await prisma.app_setting.findUnique({
    where: { key: 'sandbox_enabled' }
  });
  const sandboxEnabled = sandboxSetting?.value === 'true';

  if (!sandboxEnabled) {
    return { sandboxEnabled: false, purchased: false };
  }

  const access = await prisma.sandbox_access.findUnique({
    where: { user_id: session.user.id }
  });
  const purchased = !!access && access.expires_at > new Date();

  let existingSandbox: { id: string; createdAt: Date } | null = null;
  if (purchased) {
    const existing = await prisma.workspace.findFirst({
      where: { user_id: session.user.id, status: "sandbox", is_archived: false },
      select: { id: true, created_at: true }
    });
    if (existing) {
      existingSandbox = { id: existing.id, createdAt: existing.created_at };
    }
  }

  return {
    sandboxEnabled,
    purchased,
    existingSandbox,
  };
};
