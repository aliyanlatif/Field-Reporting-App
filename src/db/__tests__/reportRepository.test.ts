import { open, resetAllDatabases } from 'react-native-nitro-sqlite/mock';
import { NewReport, ReportRepository } from '../../types';
import { runMigrations } from '../migrations';
import { createReportRepository, Database } from '../reportRepository';

let db: Database;
let repository: ReportRepository;

const newReport = (id: string, createdAt: number, imageCount = 2): NewReport => ({
  id,
  description: `report ${id}`,
  createdAt,
  images: Array.from({ length: imageCount }, (_, index) => ({
    id: `${id}-image-${index}`,
    localPath: `/files/${id}-${index}.jpg`,
    sizeBytes: 1000 + index,
  })),
});

beforeEach(async () => {
  db = open({ name: 'test.sqlite' }) as Database;
  await db.executeAsync('PRAGMA foreign_keys = ON');
  await runMigrations(db);
  repository = createReportRepository(db);
});

afterEach(() => {
  resetAllDatabases();
});

test('stores a report with its images as queued and pending', async () => {
  await repository.create(newReport('a', 100));

  const report = await repository.get('a');

  expect(report?.status).toBe('queued');
  expect(report?.images.map(image => image.status)).toEqual(['pending', 'pending']);
  expect(report?.images.map(image => image.position)).toEqual([0, 1]);
});

test('rejects a duplicate report id without writing a second copy', async () => {
  await repository.create(newReport('a', 100));

  await expect(repository.create(newReport('a', 200))).rejects.toThrow();

  expect(await repository.list()).toHaveLength(1);
});

test('rolls back the report when an image row fails', async () => {
  const report = newReport('a', 100);
  report.images[1].id = report.images[0].id;

  await expect(repository.create(report)).rejects.toThrow();

  expect(await repository.get('a')).toBeNull();
});

test('findDue returns queued reports whose retry time has passed, oldest first', async () => {
  await repository.create(newReport('late', 300));
  await repository.create(newReport('early', 100));
  await repository.create(newReport('waiting', 200));
  await repository.scheduleRetry('waiting', { attempts: 1, nextAttemptAt: 5000, reason: 'timeout' });

  const due = await repository.findDue(1000);

  expect(due.map(report => report.id)).toEqual(['early', 'late']);
});

test('scheduleRetry keeps the report queued and records the reason', async () => {
  await repository.create(newReport('a', 100));
  await repository.scheduleRetry('a', { attempts: 2, nextAttemptAt: 9000, reason: 'HTTP 503' });

  const report = await repository.get('a');

  expect(report).toMatchObject({
    status: 'queued',
    attempts: 2,
    nextAttemptAt: 9000,
    failureReason: 'HTTP 503',
  });
});

test('recoverInterrupted returns uploading reports and images to the queue', async () => {
  await repository.create(newReport('a', 100));
  await repository.markUploading('a');
  await repository.markImage('a-image-0', 'uploaded');
  await repository.markImage('a-image-1', 'uploading');

  await repository.recoverInterrupted();

  const report = await repository.get('a');
  expect(report?.status).toBe('queued');
  expect(report?.images.map(image => image.status)).toEqual(['uploaded', 'pending']);
});

test('requeue resets a permanently failed report and its failed images', async () => {
  await repository.create(newReport('a', 100));
  await repository.markImage('a-image-0', 'uploaded');
  await repository.markImage('a-image-1', 'failed');
  await repository.markFailedPermanent('a', 'HTTP 403');

  await repository.requeue('a');

  const report = await repository.get('a');
  expect(report).toMatchObject({ status: 'queued', attempts: 0, failureReason: null });
  expect(report?.images.map(image => image.status)).toEqual(['uploaded', 'pending']);
});

test('delete and clear remove reports together with their images', async () => {
  await repository.create(newReport('a', 100));
  await repository.create(newReport('b', 200));

  await repository.delete('a');
  expect(await repository.list()).toHaveLength(1);

  await repository.clear();
  expect(await repository.list()).toHaveLength(0);
  const images = await db.executeAsync('SELECT * FROM images');
  expect(images.rows.length).toBe(0);
});

test('migrations are safe to run again', async () => {
  await repository.create(newReport('a', 100));

  await runMigrations(db);

  expect(await repository.list()).toHaveLength(1);
});
