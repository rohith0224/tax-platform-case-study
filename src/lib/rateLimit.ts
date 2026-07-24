import { NextRequest } from 'next/server';

/**
 * Simple in-memory fixed-window rate limiter, keyed by client IP, shared
 * across all AI routes. Good enough to stop casual abuse of a Groq API key
 * on a demo deployment. Caveat (worth knowing, not worth solving here): this
 * resets whenever a serverless instance cold-starts and isn't shared across
 * concurrent instances — a production system would back this with Redis
 * (e.g. Upstash) instead of process memory.
 */
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 20;

const hits = new Map<string, { count: number; windowStart: number }>();

function clientKey(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown';
}

export function checkRateLimit(req: NextRequest): { allowed: boolean; retryAfterSeconds?: number } {
  const key = clientKey(req);
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    hits.set(key, { count: 1, windowStart: now });
    return { allowed: true };
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, retryAfterSeconds: Math.ceil((entry.windowStart + WINDOW_MS - now) / 1000) };
  }

  entry.count += 1;
  return { allowed: true };
}
