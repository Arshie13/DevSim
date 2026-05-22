/**
 * Simple in-memory rate limiter.
 *
 * For production, consider using Redis or a distributed store.
 */

interface RateLimitBucket {
  count: number;
  resetAt: number; // timestamp in ms
}

const buckets: Map<string, RateLimitBucket> = new Map();

/**
 * Returns true if the request is within the rate limit.
 * If limit is exceeded, returns false and resets the bucket if TTL expired.
 */
export function checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket) {
    // Create new bucket
    buckets.set(key, {
      count: 1,
      resetAt: now + windowMs
    });
    return true;
  }

  if (now > bucket.resetAt) {
    // Reset bucket (TTL expired)
    buckets.set(key, {
      count: 1,
      resetAt: now + windowMs
    });
    return true;
  }

  if (bucket.count >= maxRequests) {
    // Rate limit exceeded
    return false;
  }

  // Increment and allow
  bucket.count++;
  return true;
}

/**
 * Get remaining attempts for a key before reset.
 */
export function getRateLimitInfo(key: string, maxRequests: number, windowMs: number): {
  remaining: number;
  resetAt: number | null;
  resetInMs: number;
} {
  const bucket = buckets.get(key);
  const now = Date.now();

  if (!bucket) {
    return { remaining: maxRequests, resetAt: null, resetInMs: windowMs };
  }

  if (now > bucket.resetAt) {
    return { remaining: maxRequests, resetAt: null, resetInMs: windowMs };
  }

  const remaining = Math.max(0, maxRequests - bucket.count);
  return {
    remaining,
    resetAt: bucket.resetAt,
    resetInMs: bucket.resetAt - now
  };
}

/**
 * Clean up expired buckets periodically (optional maintenance).
 */
export function cleanupRatelimiter(intervalMs: number = 60_000): NodeJS.Timeout {
  return setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets.entries()) {
      if (now > bucket.resetAt) {
        buckets.delete(key);
      }
    }
  }, intervalMs);
}
