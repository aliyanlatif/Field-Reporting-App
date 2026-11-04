import { NewImage, ReportRepository } from '../../../types';
import { InvalidDraftError, submitReport } from '../submitReport';
import { validateDraft } from '../validateDraft';

const image = (id: string): NewImage => ({
  id,
  localUri: `file:///${id}.jpg`,
  sizeBytes: 1000,
});

describe('validateDraft', () => {
  test('accepts a description with one to five photos', () => {
    for (let imageCount = 1; imageCount <= 5; imageCount++) {
      expect(
        validateDraft({ description: 'Cracked pipe', imageCount }),
      ).toEqual({});
    }
  });

  test.each(['', '   ', '\n\t '])(
    'rejects a blank description: %j',
    description => {
      expect(
        validateDraft({ description, imageCount: 1 }).description,
      ).toBeDefined();
    },
  );

  test('allows exactly 500 characters and rejects one more', () => {
    expect(
      validateDraft({ description: 'a'.repeat(500), imageCount: 1 }),
    ).toEqual({});
    expect(
      validateDraft({ description: 'a'.repeat(501), imageCount: 1 })
        .description,
    ).toBeDefined();
  });

  test('rejects zero photos', () => {
    expect(
      validateDraft({ description: 'ok', imageCount: 0 }).images,
    ).toBeDefined();
  });

  test('rejects a sixth photo', () => {
    expect(
      validateDraft({ description: 'ok', imageCount: 6 }).images,
    ).toBeDefined();
  });
});

describe('submitReport', () => {
  const setup = () => {
    const repository = { create: jest.fn().mockResolvedValue(undefined) };
    const startDelivery = jest.fn().mockResolvedValue(undefined);
    const deps = {
      repository: repository as unknown as ReportRepository,
      startDelivery,
      newId: () => 'report-1',
      now: () => 1234,
    };
    return { repository, startDelivery, deps };
  };

  test('stores the trimmed report on the device, then starts delivery', async () => {
    const { repository, startDelivery, deps } = setup();

    const id = await submitReport(
      { description: '  Leak  ', images: [image('a'), image('b')] },
      deps,
    );

    expect(id).toBe('report-1');
    expect(repository.create).toHaveBeenCalledWith({
      id: 'report-1',
      description: 'Leak',
      createdAt: 1234,
      images: [image('a'), image('b')],
    });
    expect(startDelivery).toHaveBeenCalledTimes(1);
    expect(repository.create.mock.invocationCallOrder[0]).toBeLessThan(
      startDelivery.mock.invocationCallOrder[0],
    );
  });

  test.each([
    ['blank description', { description: ' ', images: [image('a')] }],
    ['no photos', { description: 'ok', images: [] }],
    [
      'six photos',
      {
        description: 'ok',
        images: [1, 2, 3, 4, 5, 6].map(n => image(`i${n}`)),
      },
    ],
  ])('refuses %s without storing or sending anything', async (_name, draft) => {
    const { repository, startDelivery, deps } = setup();

    await expect(submitReport(draft, deps)).rejects.toBeInstanceOf(
      InvalidDraftError,
    );

    expect(repository.create).not.toHaveBeenCalled();
    expect(startDelivery).not.toHaveBeenCalled();
  });

  test('a failure to start delivery does not undo or fail the save', async () => {
    const { startDelivery, deps } = setup();
    startDelivery.mockRejectedValue(new Error('offline'));

    await expect(
      submitReport({ description: 'ok', images: [image('a')] }, deps),
    ).resolves.toBe('report-1');
  });

  test('a failed save is reported and delivery is not started', async () => {
    const { repository, startDelivery, deps } = setup();
    repository.create.mockRejectedValue(new Error('disk full'));

    await expect(
      submitReport({ description: 'ok', images: [image('a')] }, deps),
    ).rejects.toThrow('disk full');
    expect(startDelivery).not.toHaveBeenCalled();
  });
});
