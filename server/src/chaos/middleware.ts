import type { Request, RequestHandler } from 'express';
import { setTimeout as sleep } from 'node:timers/promises';
import { chaosSettings } from './settings.js';

const isImageUpload = (req: Request) => req.method === 'PUT' && req.path.includes('/images/');
const roll = (probability: number) => Math.random() < probability;

function dropUploadAfter(req: Request, limit: number) {
  let received = 0;
  req.on('data', (chunk: Buffer) => {
    received += chunk.length;
    if (received > limit) {
      req.socket.destroy();
    }
  });
}

function loseResponse(req: Request, res: Parameters<RequestHandler>[1]) {
  res.end = () => {
    req.socket.destroy();
    return res;
  };
}

export const chaosMiddleware: RequestHandler = async (req, res, next) => {
  const settings = chaosSettings.get();
  const upload = isImageUpload(req);

  if (upload && settings.dropUploadAfterBytes > 0) {
    dropUploadAfter(req, settings.dropUploadAfterBytes);
  }
  if (settings.latencyMs > 0) {
    await sleep(settings.latencyMs);
  }
  if (settings.hang) {
    return;
  }
  if (roll(settings.dropRate)) {
    req.socket.destroy();
    return;
  }
  if (roll(settings.errorRate)) {
    res.status(503).json({ error: 'chaos_unavailable', message: 'Injected server error' });
    return;
  }
  if (upload && settings.refuseUploads) {
    res.status(403).json({ error: 'chaos_refused', message: 'Uploads are refused' });
    return;
  }
  if (roll(settings.loseResponseRate)) {
    loseResponse(req, res);
  }
  next();
};
