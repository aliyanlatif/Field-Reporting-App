import express, { Router } from 'express';
import type { Request } from 'express';
import { config } from '../config.js';
import { HttpError } from '../httpError.js';
import { store } from '../store.js';
import type { ReportRecord, ReportView } from '../types.js';
import { assertValidId, parseCreateReport } from '../validation.js';

const imageBody = express.raw({ type: () => true, limit: config.maxImageBytes });

const toView = (report: ReportRecord, baseUrl: string): ReportView => ({
  id: report.id,
  description: report.description,
  createdAt: report.createdAt,
  completedAt: report.completedAt ?? report.createdAt,
  images: report.imageIds.map(imageId => ({
    id: imageId,
    url: `${baseUrl}/reports/${report.id}/images/${imageId}`,
  })),
});

const baseUrlOf = (req: Request) => `${req.protocol}://${req.get('host')}`;

function requireReport(id: unknown): ReportRecord {
  const report = store.getReport(assertValidId(id, 'report id'));
  if (!report) {
    throw new HttpError(404, 'report_not_found', 'Report not found');
  }
  return report;
}

export const reportsRouter = Router();

reportsRouter.post('/', (req, res) => {
  const input = parseCreateReport(req.body);
  const existing = store.getReport(input.id);

  if (existing) {
    const sameShape =
      existing.description === input.description &&
      existing.imageIds.join() === input.imageIds.join();
    if (!sameShape) {
      throw new HttpError(409, 'id_conflict', 'Report id already used with different content');
    }
    res.status(200).json({ id: existing.id, completed: existing.completedAt !== null });
    return;
  }

  store.saveReport({ ...input, completedAt: null });
  res.status(201).json({ id: input.id, completed: false });
});

reportsRouter.put('/:id/images/:imageId', imageBody, async (req, res) => {
  const report = requireReport(req.params.id);
  const imageId = assertValidId(req.params.imageId, 'image id');

  if (!report.imageIds.includes(imageId)) {
    throw new HttpError(404, 'image_not_declared', 'Image is not part of this report');
  }
  if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
    throw new HttpError(400, 'empty_image', 'Image body is empty');
  }

  const alreadyStored = store.hasImage(report.id, imageId);
  if (!alreadyStored) {
    await store.saveImage(report.id, imageId, req.body);
  }
  res.status(alreadyStored ? 200 : 201).json({ id: imageId, bytes: req.body.length });
});

reportsRouter.post('/:id/complete', (req, res) => {
  const report = requireReport(req.params.id);
  const missing = report.imageIds.filter(imageId => !store.hasImage(report.id, imageId));

  if (missing.length > 0) {
    throw new HttpError(409, 'images_missing', 'Some images have not arrived', { missing });
  }
  if (!report.completedAt) {
    store.saveReport({ ...report, completedAt: new Date().toISOString() });
  }
  res.status(200).json({ id: report.id, completed: true });
});

reportsRouter.get('/', (req, res) => {
  const baseUrl = baseUrlOf(req);
  res.json({ reports: store.listCompleted().map(report => toView(report, baseUrl)) });
});

reportsRouter.get('/:id', (req, res) => {
  const report = requireReport(req.params.id);
  if (!report.completedAt) {
    throw new HttpError(404, 'report_not_found', 'Report not found');
  }
  res.json(toView(report, baseUrlOf(req)));
});

reportsRouter.get('/:id/images/:imageId', async (req, res) => {
  const report = requireReport(req.params.id);
  const imageId = assertValidId(req.params.imageId, 'image id');
  if (!store.hasImage(report.id, imageId)) {
    throw new HttpError(404, 'image_not_found', 'Image not found');
  }
  res.type('image/jpeg').send(await store.readImage(report.id, imageId));
});

reportsRouter.delete('/', async (_req, res) => {
  await store.clear();
  res.status(204).end();
});
