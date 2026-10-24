import express from 'express';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { generateRouter } from './routes/generate.js';
import { storesRouter } from './routes/stores.js';
import { errorHandler, HttpError } from './errors.js';
import { activeEngine, generateStore } from './ai/pipeline.js';

/**
 * @param {{ db: ReturnType<import('./db.js').openDb>, generator?: typeof generateStore, clientDist?: string }} deps
 */
export function createApp({ db, generator = generateStore, clientDist }) {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '100kb' }));
  app.use((_req, res, next) => {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  app.get('/api/health', (_req, res) => res.json({ ok: true, aiEngine: activeEngine() }));
  app.use('/api', generateRouter({ generator }));
  app.use('/api', storesRouter({ db }));
  app.use('/api', (_req, _res, next) => next(new HttpError(404, 'NOT_FOUND', 'Unknown API route.')));

  // Production: serve the built React app, with SPA fallback for client routes.
  if (clientDist && existsSync(join(clientDist, 'index.html'))) {
    app.use(express.static(clientDist, { maxAge: '1h', index: false }));
    app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(join(clientDist, 'index.html')));
  }

  app.use(errorHandler);
  return app;
}
