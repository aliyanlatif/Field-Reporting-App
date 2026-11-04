import { resetAllDatabases } from 'react-native-nitro-sqlite/mock';
import { ReportRepository } from '../../../types';
import { createQueueWorker, QueueWorker } from '../queueWorker';
import { resetDevice, ResetScope } from '../reset';
import {
  createTestRepository,
  FakeApi,
  networkError,
  newReport,
} from '../__support__/fakes';

const nextTick = () => new Promise<void>(resolve => setImmediate(resolve));

let repository: ReportRepository;
let api: FakeApi;
let worker: QueueWorker;
let removedImages: number;
let deletedFiles: string[];

const reset = (scope: ResetScope) =>
  resetDevice(
    {
      worker,
      api,
      repository,
      deleteFiles: async uris => {
        deletedFiles.push(...uris);
      },
      removeLocalImages: async () => {
        removedImages++;
      },
    },
    scope,
  );

beforeEach(async () => {
  repository = await createTestRepository();
  api = new FakeApi();
  removedImages = 0;
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

test('clearing unsent reports removes only what is still waiting, and its photos', async () => {
  await repository.create(newReport('delivered', 1, 1));
  await worker.processQueue();
  await repository.create(newReport('waiting', 2, 2));

  await reset('unsent');

  expect((await repository.list()).map(report => report.id)).toEqual([
    'delivered',
  ]);
  expect(deletedFiles).toEqual([
    'file:///files/waiting-0.jpg',
    'file:///files/waiting-1.jpg',
  ]);
  expect(removedImages).toBe(0);
});

test('clearing everything wipes the server, the local queue and every stored photo', async () => {
  await repository.create(newReport('delivered'));
  await worker.processQueue();
  await repository.create(newReport('waiting'));
  expect(api.completed).toHaveLength(1);

  await reset('everything');

  expect(api.reports.size).toBe(0);
  expect(await repository.list()).toEqual([]);
  expect(removedImages).toBe(1);
});

test('clearing only unsent reports never touches the server', async () => {
  await repository.create(newReport('delivered'));
  await worker.processQueue();
  await repository.create(newReport('waiting'));
  api.calls.length = 0;

  await reset('unsent');

  expect(api.calls).toEqual([]);
  expect(api.completed).toHaveLength(1);
});

test('if the server cannot be reached, clearing everything deletes nothing local', async () => {
  await repository.create(newReport('waiting'));
  api.deleteAllReports = async () => {
    throw networkError();
  };

  await expect(reset('everything')).rejects.toMatchObject({ kind: 'network' });

  expect(await repository.list()).toHaveLength(1);
  expect(removedImages).toBe(0);
  await worker.processQueue({ ignoreBackoff: true });
  expect(api.completed).toHaveLength(1);
});

test('nothing is sent again after a reset', async () => {
  await repository.create(newReport('waiting'));
  await reset('unsent');
  api.calls.length = 0;

  await worker.processQueue({ ignoreBackoff: true });

  expect(api.calls).toEqual([]);
});

test('waits for a delivery in progress so nothing is sent mid-wipe', async () => {
  await repository.create(newReport('a', 1, 1));
  const releaseUpload = api.hold('uploadImage');
  const delivery = worker.processQueue();
  await nextTick();

  const resetting = reset('everything');
  await nextTick();
  expect(removedImages).toBe(0);

  releaseUpload();
  await Promise.all([delivery, resetting]);

  expect(await repository.list()).toEqual([]);
});
