import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import prisma from '$lib/server/client';

/**
 * Cheatsheets are a grading aid, so they are admin-only for now. The gate
 * mirrors `src/routes/admin/+layout.server.ts`.
 */
export const load: LayoutServerLoad = async ({ locals }) => {
	const session = await locals.auth();

	if (!session?.user) {
		throw redirect(303, '/login');
	}

	const dbUser = await prisma.user.findUnique({
		where: { id: session.user.id },
		select: { role: true, coins: true, image: true }
	});

	if (!dbUser || dbUser.role !== 'ADMIN') {
		throw redirect(303, '/');
	}

	return {
		user: { ...session.user, image: dbUser.image ?? session.user.image },
		userCoins: dbUser.coins ?? 0,
		isAdmin: true
	};
};
