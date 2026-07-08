import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/client';
import { checkRateLimit } from '$lib/server/ratelimit';
import { sendHelpEmail } from '$lib/server/mailer';

export const POST: RequestHandler = async (event) => {
	const session = await event.locals.auth();
	if (!session?.user?.id) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const body = await event.request.json().catch(() => null);
	if (!body) {
		return json({ error: 'Invalid request body' }, { status: 400 });
	}

	const { category, subject, description, context } = body as {
		category?: string;
		subject?: string;
		description?: string;
		context?: unknown;
	};

	if (!subject?.trim() || !description?.trim()) {
		return json({ error: 'Subject and description are required' }, { status: 400 });
	}

	const rateLimitKey = `help-request:${session.user.id}`;
	if (!checkRateLimit(rateLimitKey, 3, 60 * 60 * 1000)) {
		return json({ error: 'Too many help requests. Please try again later.' }, { status: 429 });
	}

	try {
		const helpRequest = await prisma.helpRequest.create({
			data: {
				userId: session.user.id,
				category: category ?? null,
				subject: subject.trim(),
				description: description.trim(),
				context: context ?? {}
			}
		});

		let emailSent = false;
		try {
			emailSent = await sendHelpEmail({
				userEmail: session.user.email ?? 'unknown',
				category: category ?? null,
				subject: subject.trim(),
				description: description.trim(),
				context: context ?? {}
			});
		} catch (err: any) {
			console.error('[help/request] Email delivery failed (request saved):', err.message);
		}

		return json({ success: true, id: helpRequest.id, emailSent });
	} catch (err) {
		console.error('[help/request] Failed to create help request:', err);
		return json({ error: 'Failed to submit help request' }, { status: 500 });
	}
};
