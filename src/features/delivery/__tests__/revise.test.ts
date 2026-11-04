import { resetAllDatabases } from 'react-native-nitro-sqlite/mock';
import { ReportRepository } from '../../../types';
import { reviseFailedReport } from '../revise';
import { createTestRepository, newReport } from '../__support__/fakes';

let repository: ReportRepository;
let deleted: string[];

const revise = (
  reportId: string,
  revision: Parameters<typeof reviseFailedReport>[2],
) =>
  reviseFailedReport(
    {
      repository,
      deleteFiles: async uris => {
        deleted.push(...uris);
      },
      newId: () => 'new-id',
    },
    reportId,
    revision,
  );

beforeEach(async () => {
  repository = await createTestRepository();
  deleted = [];
  await repository.create(newReport('r', 5, 3));
  await repository.markImage('r-i1', 'failed');
  await repository.markFailedPermanent('r', 'refused');
});

afterEach(() => resetAllDatabases());

test('removing the refused photo queues the rest under a new id and keeps the original time', async () => {
  const id = await revise('r', { kind: 'remove', imageId: 'r-i1' });

  expect(id).toBe('new-id');
  expect(await repository.get('r')).toBeNull();
  const revised = await repository.get('new-id');
  expect(revised).toMatchObject({
    status: 'queued',
    createdAt: 5,
    description: 'report r',
  });
  expect(revised?.images.map(image => image.id)).toEqual(['r-i0', 'r-i2']);
  expect(revised?.images.every(image => image.status === 'pending')).toBe(true);
  expect(deleted).toEqual(['file:///files/r-1.jpg']);
});

test('replacing keeps the photo in the same position', async () => {
  await revise('r', {
    kind: 'replace',
    imageId: 'r-i1',
    image: { id: 'fresh', localUri: 'file:///fresh.jpg', sizeBytes: 5 },
  });

  const revised = await repository.get('new-id');
  expect(revised?.images.map(image => image.id)).toEqual([
    'r-i0',
    'fresh',
    'r-i2',
  ]);
});

test('a report cannot lose its only photo', async () => {
  await repository.create(newReport('solo', 6, 1));
  await repository.markFailedPermanent('solo', 'refused');

  await expect(
    revise('solo', { kind: 'remove', imageId: 'solo-i0' }),
  ).rejects.toThrow('at least one photo');
  expect(await repository.get('solo')).not.toBeNull();
});

test('only a failed report can be changed', async () => {
  await repository.create(newReport('ok', 7, 2));

  await expect(
    revise('ok', { kind: 'remove', imageId: 'ok-i0' }),
  ).rejects.toThrow('failed');
});
