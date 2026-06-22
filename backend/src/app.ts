import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import narrativeRoutes from './routes/narratives';
import commentRoutes from './routes/comments';
import ratingRoutes from './routes/ratings';
import fileRoutes from './routes/files';
import collaborationRoutes from './routes/collaboration';
import analyticsRoutes from './routes/analytics';

function securityHeaders(req: express.Request, res: express.Response, next: express.NextFunction) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
}

const requests = new Map<string, { count: number; windowStart: number }>();
const WINDOW_MS = 60_000;
const MAX_REQ = 120;

function rateLimit(req: express.Request, res: express.Response, next: express.NextFunction) {
  const key = req.ip || 'unknown';
  const now = Date.now();
  const bucket = requests.get(key);

  if (!bucket || now - bucket.windowStart > WINDOW_MS) {
    requests.set(key, { count: 1, windowStart: now });
    return next();
  }

  if (bucket.count >= MAX_REQ) {
    return res.status(429).json({ message: 'Too many requests' });
  }

  bucket.count += 1;
  return next();
}

export function createApp() {
  const app = express();
  app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
  app.use(express.json({ limit: '1mb' }));
  app.use(securityHeaders);
  app.use(rateLimit);

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/narratives', narrativeRoutes);
  app.use('/api/stories', narrativeRoutes);
  app.use('/api/comments', commentRoutes);
  app.use('/api/ratings', ratingRoutes);
  app.use('/api/files', fileRoutes);
  app.use('/api/collaboration', collaborationRoutes);
  app.use('/api/analytics', analyticsRoutes);

  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(500).json({ message: err.message });
  });

  return app;
}
