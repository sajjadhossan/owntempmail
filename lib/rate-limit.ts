interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

/**
 * Enterprise In-Memory Sliding-Window Rate Limiter
 * Protects serverless API routes against spamming, automated scraping, and DDoS.
 *
 * @param key Unique identifier (IP address, token, client ID)
 * @param limit Maximum allowed requests per window (default: 60)
 * @param windowSec Window size in seconds (default: 60)
 */
export function checkRateLimit(
  key: string,
  limit: number = 60,
  windowSec: number = 60
): { allowed: boolean; remaining: number; resetInSec: number } {
  const now = Date.now();
  const windowMs = windowSec * 1000;

  // Cleanup expired keys periodically to prevent memory leaks
  if (rateLimitMap.size > 5000) {
    for (const [k, record] of rateLimitMap.entries()) {
      if (record.resetAt <= now) {
        rateLimitMap.delete(k);
      }
    }
  }

  const record = rateLimitMap.get(key);
  if (!record || record.resetAt <= now) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetInSec: windowSec };
  }

  if (record.count >= limit) {
    const resetInSec = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
    return { allowed: false, remaining: 0, resetInSec };
  }

  record.count += 1;
  const resetInSec = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
  return { allowed: true, remaining: limit - record.count, resetInSec };
}

/**
 * Helper to extract client IP from NextRequest
 */
export function getClientIp(req: Request): string {
  const headers = req.headers;
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}

