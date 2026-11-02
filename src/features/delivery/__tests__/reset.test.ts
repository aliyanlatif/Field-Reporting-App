import { resetAllDatabases } from 'react-native-nitro-sqlite/mock';
import { ReportRepository } from '../../../types';
import { createQueueWorker, QueueWorker } from '../queueWorker';
import { resetEverything } from '../reset';
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

const reset = () =>
  resetEverything({
    worker,
    api,
    repository,
    removeLocalImages: async () => {
      removedImages++;
    },
  });

beforeEach(async () => {
  repository = await createTestRepository();
  api = new FakeApi();
  removedImages = 0;
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

test('wipes the server, the local queue and the local images', async () => {
  await repository.create(newReport('delivered'));
  await worker.processQueue();
  await repository.create(newReport('waiting'));

  await reset();

  expect(api.reports.size).toBe(0);
  expect(await repository.list()).toEqual([]);
  expect(removedImages).toBe(1);
});

test('nothing is sent again after a reset', async () => {
  await repository.create(newReport('waiting'));
  await reset();
  api.calls.length = 0;

  await worker.processQueue({ ignoreBackoff: true });

  expect(api.calls).toEqual([]);
});

test('if the server cannot be reached, nothing local is deleted and delivery carries on afterwards', async () => {
  await repository.create(newReport('waiting'));
  api.deleteAllReports = async () => {
    throw networkError();
  };

  await expect(reset()).rejects.toMatchObject({ kind: 'network' });

  expect(await repository.list()).toHaveLength(1);
  expect(removedImages).toBe(0);
  await worker.processQueue({ ignoreBackoff: true });
  expect(api.completed).toHaveLength(1);
});

test('waits for a delivery in progress so the report cannot reappear on the server', async () => {
  await repository.create(newReport('a', 1, 1));
  const releaseUpload = api.hold('uploadImage');
  const delivery = worker.processQueue();
  await nextTick();

  const resetting = reset();
  await nextTick();
  expect(removedImages).toBe(0);

  releaseUpload();
  await Promise.all([delivery, resetting]);

  expect(api.reports.size).toBe(0);
  expect(await repository.list()).toEqual([]);
});

test('a trigger that arrives during a reset starts no work', async () => {
  await repository.create(newReport('a', 1, 1));
  let attemptedDuringReset = false;
  api.deleteAllReports = async () => {
    await worker.processQueue({ ignoreBackoff: true });
    attemptedDuringReset = api.calls.length > 0;
    api.reports.clear();
  };

  await reset();

  expect(attemptedDuringReset).toBe(false);
});
