import { ImageBudget } from '../../../config';
import {
  CompressDeps,
  compressToBudget,
  ImageTooLargeError,
} from '../compressImage';

const budget: ImageBudget = {
  maxBytes: 500,
  targetBytes: 450,
  longestEdgesPx: [2000, 1000],
  jpegQualities: [0.8, 0.6],
};

function setup(sizeFor: (longestEdgePx: number, quality: number) => number) {
  const sizes = new Map<string, number>();
  const removed: string[] = [];
  const attempts: string[] = [];
  const deps: CompressDeps = {
    compress: async (_source, { longestEdgePx, quality }) => {
      const uri = `file:///out-${longestEdgePx}-${quality}.jpg`;
      attempts.push(uri);
      sizes.set(uri, sizeFor(longestEdgePx, quality));
      return uri;
    },
    fileSize: async uri => sizes.get(uri) ?? 0,
    remove: async uri => {
      removed.push(uri);
    },
  };
  return { deps, removed, attempts };
}

test('keeps the first attempt when it already fits, at full size and best quality', async () => {
  const { deps, attempts } = setup(() => 300);

  const result = await compressToBudget('file:///huge.jpg', deps, budget);

  expect(result).toEqual({ uri: 'file:///out-2000-0.8.jpg', sizeBytes: 300 });
  expect(attempts).toHaveLength(1);
});

test('lowers quality before lowering resolution, discarding rejected outputs', async () => {
  const { deps, removed } = setup((_edge, quality) =>
    quality === 0.8 ? 900 : 400,
  );

  const result = await compressToBudget('file:///huge.jpg', deps, budget);

  expect(result.uri).toBe('file:///out-2000-0.6.jpg');
  expect(removed).toEqual(['file:///out-2000-0.8.jpg']);
});

test('shrinks the resolution once quality alone is not enough', async () => {
  const { deps } = setup(edge => (edge === 2000 ? 900 : 400));

  const result = await compressToBudget('file:///huge.jpg', deps, budget);

  expect(result.uri).toBe('file:///out-1000-0.8.jpg');
});

test('fails instead of returning a file over the budget', async () => {
  const { deps, removed } = setup(() => 900);

  await expect(
    compressToBudget('file:///huge.jpg', deps, budget),
  ).rejects.toBeInstanceOf(ImageTooLargeError);
  expect(removed).toHaveLength(4);
});

test('never returns a file above the hard limit for the real budget', async () => {
  const { deps } = setup(() => 4_000_000);

  const result = await compressToBudget('file:///huge.jpg', deps);

  expect(result.sizeBytes).toBeLessThanOrEqual(5 * 1024 * 1024);
});
