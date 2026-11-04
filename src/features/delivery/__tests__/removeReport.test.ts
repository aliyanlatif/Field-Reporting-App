import { resetAllDatabases } from 'react-native-nitro-sqlite/mock';
import { ReportRepository } from '../../../types';
import { createQueueWorker, QueueWorker } from '../queueWorker';
import { removeReport } from '../removeReport';
import {
  createTestRepository,
  FakeApi,
  networkError,
  newReport,
} from '../__support__/fakes';

let repository: ReportRepository;
let api: FakeApi;
let worker: QueueWorker;
let deletedFiles: string[];

const remove = (id: string) =>
  removeReport(
    {
      worker,
      api,
      repository,
      deleteFiles: async uris => {
        deletedFiles.push(...uris);
      },
    },
    id,
  );

beforeEach(async () => {
  repository = await createTestRepository();
  api = new FakeApi();
  deletedFiles = [];
  worker = createQueueWorker({
    repository,
    api,
    deleteFiles: async () => undefined,
    random: () => 1,
  });
});

afterEach(() => {
  worker.stop();
  resetAllDatabases();
});

test('deleting a delivered report removes it from the server and the phone', async () => {
  await repository.create(newReport('sent', 1, 1));
  await repository.create(newReport('other', 2, 1));
  await worker.processQueue();

  await remove('sent');

  expect([...api.reports.keys()]).toEqual(['other']);
  expect((await repository.list()).map(report => report.id)).toEqual(['other']);
});

test('a delivered report no longer known on this phone is still deleted from the server', async () => {
  await repository.create(newReport('sent', 1, 1));
  await worker.processQueue();
  await repository.delete('sent');

  await remove('sent');

  expect(api.reports.size).toBe(0);
  expect(api.calls).toContain('delete sent');
});

test('deleting a report that was never sent only touches this phone', async () => {
  await repository.create(newReport('waiting', 1, 2));
  api.calls.length = 0;

  await remove('waiting');

  expect(api.calls).toEqual([]);
  expect(await repository.list()).toEqual([]);
  expect(deletedFiles).toEqual([
    'file:///files/waiting-0.jpg',
    'file:///files/waiting-1.jpg',
  ]);
});

test('if the server cannot be reached, nothing is deleted', async () => {
  await repository.create(newReport('sent', 1, 1));
  await worker.processQueue();
  api.deleteReport = async () => {
    throw networkError();
  };

  await expect(remove('sent')).rejects.toMatchObject({ kind: 'network' });

  expect(await repository.list()).toHaveLength(1);
  expect(api.reports.size).toBe(1);
});

test('a report in the middle of sending finishes first, then is deleted everywhere', async () => {
  await repository.create(newReport('busy', 1, 1));
  const release = api.hold('uploadImage');
  const delivery = worker.processQueue();
  await new Promise<void>(resolve => setImmediate(resolve));

  const removing = remove('busy');
  await new Promise<void>(resolve => setImmediate(resolve));
  expect(await repository.list()).toHaveLength(1);

  release();
  await Promise.all([delivery, removing]);

  expect(api.reports.size).toBe(0);
  expect(await repository.list()).toEqual([]);
});

test('delivery carries on with the other reports afterwards', async () => {
  await repository.create(newReport('gone', 1, 1));
  await repository.create(newReport('stays', 2, 1));
  await remove('gone');

  await worker.processQueue();

  expect(api.completed.map(report => report.request.id)).toEqual(['stays']);
});
