import { Router } from 'express';
import { HttpError } from '../httpError.js';
import { chaosSettings } from '../chaos/settings.js';

export const chaosRouter = Router();

chaosRouter.get('/', (_req, res) => {
  res.json(chaosSettings.get());
});

chaosRouter.post('/', (req, res) => {
  const invalid = chaosSettings.update(req.body ?? {});
  if (invalid.length > 0) {
    throw new HttpError(400, 'invalid_chaos_settings', 'Invalid chaos settings', { invalid });
  }
  res.json(chaosSettings.get());
});

chaosRouter.delete('/', (_req, res) => {
  chaosSettings.reset();
  res.json(chaosSettings.get());
});
