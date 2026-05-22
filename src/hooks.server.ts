import { sequence } from '@sveltejs/kit/hooks';
import { handle as authHandle } from './auth';
import type { Handle } from '@sveltejs/kit';
import { cleanupRatelimiter } from '$lib/server/ratelimit';

// Start rate limiter cleanup (removes expired rate limit entries)
if (process.env.NODE_ENV !== 'test') {
  cleanupRatelimiter(60_000); // cleanup every minute
}

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

// Combine auth handle with custom subdomain handler
export const handle = sequence(authHandle, subdomainHandler);
