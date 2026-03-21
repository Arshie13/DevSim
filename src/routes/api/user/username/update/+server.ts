import { json } from '@sveltejs/kit';
import prisma from '$lib/server/client';
import type { RequestHandler } from './$types';

export const PUT: RequestHandler = async ({ request, locals }) => {
  const session = await locals.auth();

  if (!session?.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { username } = await request.json();

  // Validate username format
  if (!/^[a-zA-Z0-9_-]{3,30}$/.test(username)) {
    return json({ error: 'Username must be 3-30 characters long and contain only letters, numbers, hyphens, or underscores' }, { status: 400 });
  }

  try {
    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser && existingUser.email !== session.user.email) {
      return json({ error: 'Username already taken' }, { status: 409 });
    }

    // Update user's username
    await prisma.user.update({
      where: { email: session.user.email! },
      data: { username }
    });

    return json({ success: true, message: 'Username updated successfully' });
  } catch (error) {
    console.error('Error updating username:', error);
    return json({ error: 'Failed to update username' }, { status: 500 });
  }
};
