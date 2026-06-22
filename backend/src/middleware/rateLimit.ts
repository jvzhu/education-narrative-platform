import express from 'express';

const requests = new Map<string, { count: number; windowStart: number }>();
const WINDOW_MS = 60_000;
const MAX_REQ = 120;

export function apiRateLimit(req: express.Request, res: express.Response, next: express.NextFunction) {
  const key = req.ip || 'unknown';
  const current = Date.now();
  const bucket = requests.get(key);

  if (!bucket || current - bucket.windowStart > WINDOW_MS) {
    requests.set(key, { count: 1, windowStart: current });
    return next();
  }

  if (bucket.count >= MAX_REQ) {
    return res.status(429).json({ message: 'Too many requests' });
  }

  bucket.count += 1;
  return next();
}
