import { sequence } from '@sveltejs/kit/hooks';
import { handle as authHandle } from './auth';
import type { Handle } from '@sveltejs/kit';
import { cleanupRatelimiter } from '$lib/server/ratelimit';
import prisma from '$lib/server/client';

// Start rate limiter cleanup (removes expired rate limit entries)
if (process.env.NODE_ENV !== 'test') {
  cleanupRatelimiter(60_000); // cleanup every minute
}

// Validate that the session user actually exists in the database.
// This catches stale JWTs after a database reset or user deletion.
const sessionValidationHandler: Handle = async ({ event, resolve }) => {
  const pathname = event.url.pathname;

  // Only validate API routes (not auth callbacks, not static assets)
  if (
    pathname.startsWith('/api/') &&
    !pathname.startsWith('/api/auth/') &&
    !pathname.startsWith('/api/user/verify')
  ) {
    const session = await event.locals.auth();
    if (session?.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true },
      });
      if (!user) {
        return new Response(
          JSON.stringify({ error: 'Session expired. Please log in again.' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
  }

  return resolve(event);
};

// Custom middleware to extract username from subdomain
const subdomainHandler: Handle = async ({ event, resolve }) => {
  const host = event.request.headers.get('host');

  if (host) {
    // Extract username from subdomain (e.g., <username>.devsim.dev)
    const match = host.match(/^([^\.]+)\.devsim\.dev$/);
    if (match) {
      const username = match[1];

      // Add username to locals for use in routes
      event.locals.username = username;

      // You could also validate that the username exists in the database here
    }
  }

  return resolve(event);
};

// Combine auth handle with custom handlers
export const handle = sequence(authHandle, sessionValidationHandler, subdomainHandler);
