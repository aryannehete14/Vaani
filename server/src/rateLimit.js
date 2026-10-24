import { HttpError } from './errors.js';

/** Minimal fixed-window, in-memory rate limiter keyed by client IP. */
export function rateLimit({ windowMs, max }) {
  const hits = new Map();
  return (req, _res, next) => {
    if (process.env.NODE_ENV === 'test') return next();
    const now = Date.now();
    const key = req.ip;
    const entry = hits.get(key);
    if (!entry || now - entry.start > windowMs) {
      hits.set(key, { start: now, count: 1 });
      if (hits.size > 10_000) hits.clear();
      return next();
    }
    if (++entry.count > max) {
      return next(new HttpError(429, 'RATE_LIMITED', 'Too many requests. Please wait a minute and try again.'));
    }
    next();
  };
}
