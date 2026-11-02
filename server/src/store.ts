import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { config } from './config.js';
import type { ReportRecord } from './types.js';

const reports = new Map<string, ReportRecord>();
const uploadedImages = new Set<string>();

const imageDir = () => path.join(config.dataDir, 'images');
const imagePath = (reportId: string, imageId: string) =>
  path.join(imageDir(), `${reportId}_${imageId}.jpg`);
const imageKey = (reportId: string, imageId: string) => `${reportId}/${imageId}`;

export const store = {
  getReport: (id: string) => reports.get(id),

  listCompleted: () =>
    [...reports.values()]
      .filter(report => report.completedAt !== null)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),

  saveReport: (report: ReportRecord) => {
    reports.set(report.id, report);
  },

  hasImage: (reportId: string, imageId: string) =>
    uploadedImages.has(imageKey(reportId, imageId)),

  async saveImage(reportId: string, imageId: string, bytes: Buffer) {
    await mkdir(imageDir(), { recursive: true });
    await writeFile(imagePath(reportId, imageId), bytes);
    uploadedImages.add(imageKey(reportId, imageId));
  },

  readImage: (reportId: string, imageId: string) =>
    readFile(imagePath(reportId, imageId)),

  async clear() {
    reports.clear();
    uploadedImages.clear();
    await rm(config.dataDir, { recursive: true, force: true });
  },
};
