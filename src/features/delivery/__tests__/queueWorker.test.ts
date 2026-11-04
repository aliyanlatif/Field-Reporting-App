import { resetAllDatabases } from 'react-native-nitro-sqlite/mock';
import { LocalFileError, ReportRepository } from '../../../types';
import { createQueueWorker, QueueWorker } from '../queueWorker';
import {
  createTestRepository,
  FakeApi,
  httpError,
  networkError,
  newReport,
} from '../__support__/fakes';

let repository: ReportRepository;
let api: FakeApi;
let worker: QueueWorker;
let deletedUris: string[];
let clock: number;

beforeEach(async () => {
  repository = await createTestRepository();
  api = new FakeApi();
  deletedUris = [];
  clock = 1_000_000;
  worker = createQueueWorker({
    repository,
    api,
    deleteFiles: async uris => {
      deletedUris.push(...uris);
    },
    now: () => clock,
    random: () => 1,
  });
});

afterEach(() => {
  worker.stop();
  resetAllDatabases();
});

test('delivers a queued report: create, every image, complete, then frees local files', async () => {
  await repository.create(newReport('a'));

  await worker.processQueue();

  expect(api.calls).toEqual(['create a', 'put a-i0', 'put a-i1', 'complete a']);
  expect((await repository.get('a'))?.status).toBe('uploaded');
  expect(deletedUris).toEqual([
    'file:///files/a-0.jpg',
    'file:///files/a-1.jpg',
  ]);
});

test('delivers several reports in the order they were filed', async () => {
  await repository.create(newReport('second', 2, 1));
  await repository.create(newReport('first', 1, 1));

  await worker.processQueue();

  expect(api.calls.filter(call => call.startsWith('create'))).toEqual([
    'create first',
    'create second',
  ]);
});

test('a lost create response is retried without duplicating the report on the server', async () => {
  await repository.create(newReport('a'));
  api.script('createReport', 'lose-response');

  await worker.processQueue();
  expect((await repository.get('a'))?.status).toBe('queued');

  await worker.processQueue({ ignoreBackoff: true });

  expect(api.reports.size).toBe(1);
  expect(api.completed).toHaveLength(1);
  expect((await repository.get('a'))?.status).toBe('uploaded');
});

test('a lost complete response never lands the report twice', async () => {
  await repository.create(newReport('a'));
  api.script('completeReport', 'lose-response');

  await worker.processQueue();
  await worker.processQueue({ ignoreBackoff: true });

  expect(api.completed).toHaveLength(1);
  expect((await repository.get('a'))?.status).toBe('uploaded');
});

test('a dropped connection mid-upload keeps finished images and resends only the rest', async () => {
  await repository.create(newReport('a', 1, 3));
  api.script('uploadImage', undefined as never, networkError());

  await worker.processQueue();

  const interrupted = await repository.get('a');
  expect(interrupted?.status).toBe('queued');
  expect(interrupted?.attempts).toBe(1);
  expect(interrupted?.images.map(image => image.status)).toEqual([
    'uploaded',
    'pending',
    'pending',
  ]);
  expect(deletedUris).toEqual([]);

  api.calls.length = 0;
  await worker.processQueue({ ignoreBackoff: true });

  expect(api.calls).toEqual(['create a', 'put a-i1', 'put a-i2', 'complete a']);
  expect(api.completed).toHaveLength(1);
});

test('retries a 503 after the backoff delay, not before', async () => {
  await repository.create(newReport('a'));
  api.script('createReport', httpError(503));

  await worker.processQueue();
  const callsAfterFailure = api.calls.length;

  await worker.processQueue();
  expect(api.calls).toHaveLength(callsAfterFailure);

  clock += 10_000;
  await worker.processQueue();
  expect((await repository.get('a'))?.status).toBe('uploaded');
});

test('a refused upload is marked failed with its reason and never retried on its own', async () => {
  await repository.create(newReport('a'));
  api.script('uploadImage', httpError(403, 'chaos_refused'));

  await worker.processQueue();

  const report = await repository.get('a');
  expect(report).toMatchObject({
    status: 'failed_permanent',
    failureReason: 'HTTP 403',
  });
  expect(report?.images[0].status).toBe('failed');
  expect(deletedUris).toEqual([]);

  const callsAfterFailure = api.calls.length;
  clock += 3_600_000;
  await worker.processQueue({ ignoreBackoff: true });
  expect(api.calls).toHaveLength(callsAfterFailure);
});

test('a photo missing from the device fails the report instead of retrying forever', async () => {
  await repository.create(newReport('a'));
  api.script('uploadImage', new LocalFileError('file:///files/a-0.jpg'));

  await worker.processQueue();

  const report = await repository.get('a');
  expect(report).toMatchObject({
    status: 'failed_permanent',
    failureReason: 'Photo file is missing on this device',
  });
  expect(report?.images[0].status).toBe('failed');
});

test('a manual retry of a failed report delivers it once the server accepts', async () => {
  await repository.create(newReport('a'));
  api.script('createReport', httpError(400, 'invalid_description'));
  await worker.processQueue();

  await repository.requeue('a');
  await worker.processQueue();

  expect(api.completed).toHaveLength(1);
  expect((await repository.get('a'))?.status).toBe('uploaded');
});

test('images the server reports missing on complete are sent again', async () => {
  await repository.create(newReport('a'));
  await worker.processQueue();
  api.reports.get('a')?.images.delete('a-i1');
  api.reports.get('a')!.complete = false;
  await repository.requeue('a');
  await repository.markImage('a-i0', 'uploaded');
  await repository.markImage('a-i1', 'uploaded');

  await worker.processQueue();
  expect((await repository.get('a'))?.status).toBe('queued');
  expect(
    (await repository.get('a'))?.images.map(image => image.status),
  ).toEqual(['uploaded', 'pending']);

  await worker.processQueue({ ignoreBackoff: true });
  expect(api.completed).toHaveLength(1);
});

test('start recovers a report stuck in uploading after a force quit and delivers it', async () => {
  await repository.create(newReport('a'));
  await repository.markUploading('a');
  await repository.markImage('a-i0', 'uploaded');
  await repository.markImage('a-i1', 'uploading');
  await api.createReport({
    id: 'a',
    description: 'report a',
    imageIds: ['a-i0', 'a-i1'],
    createdAt: '',
  });
  await api.uploadImage('a', { id: 'a-i0', uri: '', sizeBytes: 1 });
  api.calls.length = 0;

  await worker.start();

  expect(api.calls).toEqual(['create a', 'put a-i1', 'complete a']);
  expect((await repository.get('a'))?.status).toBe('uploaded');
});

test('start frees files left behind by a delivered report', async () => {
  await repository.create(newReport('a', 1, 1));
  await repository.markUploaded('a');

  await worker.start();

  expect(deletedUris).toEqual(['file:///files/a-0.jpg']);
});

test('two triggers at once share one run and send each request once', async () => {
  await repository.create(newReport('a', 1, 1));

  await Promise.all([
    worker.processQueue(),
    worker.processQueue(),
    worker.processQueue(),
  ]);

  expect(api.calls).toEqual(['create a', 'put a-i0', 'complete a']);
});

test('a report filed while the queue is running is picked up by the same run', async () => {
  await repository.create(newReport('a', 1, 1));
  const run = worker.processQueue();
  await repository.create(newReport('b', 2, 1));
  const second = worker.processQueue();

  await Promise.all([run, second]);

  expect(api.completed.map(report => report.request.id)).toEqual(['a', 'b']);
});

test('wakes itself when the backoff for a failed report expires', async () => {
  jest.useFakeTimers();
  await repository.create(newReport('a', 1, 1));
  api.script('createReport', networkError());

  await worker.processQueue();
  expect((await repository.get('a'))?.status).toBe('queued');

  clock += 10_000;
  await jest.advanceTimersByTimeAsync(10_000);
  jest.useRealTimers();
  await worker.processQueue();

  expect((await repository.get('a'))?.status).toBe('uploaded');
});

test('notifies after each persisted change', async () => {
  const notify = jest.fn();
  const notifying = createQueueWorker({
    repository,
    api,
    deleteFiles: async () => undefined,
    notify,
    now: () => clock,
  });
  await repository.create(newReport('a', 1, 1));

  await notifying.processQueue();

  expect(notify.mock.calls.length).toBeGreaterThanOrEqual(4);
});

test('reports how much of each photo was sent', async () => {
  const progress: Array<[string, number]> = [];
  const reporting = createQueueWorker({
    repository,
    api,
    deleteFiles: async () => undefined,
    onProgress: (imageId, fraction) => progress.push([imageId, fraction]),
  });
  await repository.create(newReport('p', 1, 1));

  await reporting.processQueue();

  expect(progress).toEqual([
    ['p-i0', 0.5],
    ['p-i0', 1],
  ]);
});

describe('while the phone is offline', () => {
  const offlineWorker = (online: { value: boolean }) =>
    createQueueWorker({
      repository,
      api,
      deleteFiles: async () => undefined,
      isOnline: () => online.value,
      now: () => clock,
      random: () => 1,
    });

  test('nothing is attempted and nothing changes until the connection returns', async () => {
    const online = { value: false };
    const offline = offlineWorker(online);
    await repository.create(newReport('a', 1, 1));

    await offline.processQueue();
    clock += 3_600_000;
    await offline.processQueue({ ignoreBackoff: true });

    expect(api.calls).toEqual([]);
    expect(await repository.get('a')).toMatchObject({
      status: 'queued',
      attempts: 0,
    });

    online.value = true;
    await offline.processQueue({ ignoreBackoff: true });

    expect(api.completed).toHaveLength(1);
    expect((await repository.get('a'))?.status).toBe('uploaded');
    offline.stop();
  });

  test('does not spin a retry timer while offline', async () => {
    jest.useFakeTimers();
    const online = { value: true };
    const offline = offlineWorker(online);
    await repository.create(newReport('a', 1, 1));
    api.script('createReport', networkError());
    await offline.processQueue();

    online.value = false;
    clock += 10_000;
    await jest.advanceTimersByTimeAsync(120_000);
    jest.useRealTimers();

    expect(api.calls).toEqual(['create a']);
    offline.stop();
  });
});
