import { json } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { encode } from '@auth/core/jwt';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/client';

/**
 * GET /api/dev/login?email=foo@bar.com
 * DEV-ONLY bypass for Auth.js (Google OAuth) session.
 * Mints a valid Auth.js JWT session cookie for a DB user so automated
 * browser tooling (isolated profile, no Google login) can test authenticated flows.
 *
 * Guarded by `dev` (vite dev mode only). Returns 404 in production builds.
 */
export const GET: RequestHandler = async (event) => {
	if (!dev) {
		return json({ error: 'Not found' }, { status: 404 });
	}

	const secret = process.env.AUTH_SECRET;
	if (!secret) {
		return json({ error: 'AUTH_SECRET is not set' }, { status: 500 });
	}

	const emailParam = event.url.searchParams.get('email')?.trim().toLowerCase() || null;

	let dbUser = emailParam
		? await prisma.user.findUnique({ where: { email: emailParam } })
		: await prisma.user.findFirst({ orderBy: { created_at: 'asc' } });

	if (!dbUser) {
		if (emailParam) {
			return json({ error: `No user found for email: ${emailParam}` }, { status: 404 });
		}
		return json(
			{ error: 'No users in database. Sign in once via Google first, or seed the DB.' },
			{ status: 404 }
		);
	}

	const pretestScores = await prisma.assessment_topic_score.findMany({
		where: { user_id: dbUser.id, pre_score: { not: null } },
		take: 1
	});

	// Payload must satisfy Auth.js session flow:
	// - `sub` is required (getLoggedInUser checks payload.sub)
	// - `name`/`email`/`picture` feed the default session builder
	// - `id`/`username`/`image`/etc. feed our custom callbacks in src/auth.ts
	const token = {
		sub: dbUser.id,
		id: dbUser.id,
		name: dbUser.name,
		email: dbUser.email,
		picture: dbUser.image ?? undefined,
		image: dbUser.image ?? undefined,
		username: dbUser.username,
		fullName: dbUser.name,
		hasCompletedPretest: pretestScores.length > 0
	};

	const secure = event.url.protocol === 'https:';
	const cookieName = `${secure ? '__Secure-' : ''}authjs.session-token`;

	const jwt = await encode({
		token,
		secret,
		salt: cookieName,
		maxAge: 30 * 24 * 60 * 60 // 30 days, matches Auth.js default
	});

	event.cookies.set(cookieName, jwt, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure,
		maxAge: 30 * 24 * 60 * 60
	});

	return json({
		success: true,
		cookieName,
		user: {
			id: dbUser.id,
			email: dbUser.email,
			username: dbUser.username,
			name: dbUser.name
		}
	});
};
