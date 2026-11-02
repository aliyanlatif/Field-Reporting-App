import express from 'express';
import type { ErrorRequestHandler } from 'express';
import { chaosMiddleware } from './chaos/middleware.js';
import { HttpError } from './httpError.js';
import { chaosRouter } from './routes/chaos.js';
import { reportsRouter } from './routes/reports.js';

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.code, message: err.message, ...err.details });
    return;
  }
  if (err?.type === 'entity.too.large') {
    res.status(413).json({ error: 'image_too_large', message: 'Image exceeds the 5 MB limit' });
    return;
  }
  if (err?.type === 'entity.parse.failed') {
    res.status(400).json({ error: 'invalid_json', message: 'Body is not valid JSON' });
    return;
  }
  console.error(err);
  res.status(500).json({ error: 'internal_error', message: 'Unexpected server error' });
};

export function createApp() {
  const app = express();

  app.use(express.json({ limit: '100kb' }));
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });
  app.use('/chaos', chaosRouter);
  app.use('/reports', chaosMiddleware, reportsRouter);
  app.use(errorHandler);

  return app;
}
