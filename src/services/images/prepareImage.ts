import { Image as Compressor } from 'react-native-compressor';
import { NewImage } from '../../types';
import { createId } from '../../utils/id';
import { compressToBudget } from './compressImage';
import {
  fileSize,
  moveIntoStorage,
  removeCachedOriginal,
  removeFile,
} from './fileStorage';

const compress = (
  sourceUri: string,
  { longestEdgePx, quality }: { longestEdgePx: number; quality: number },
) =>
  Compressor.compress(sourceUri, {
    compressionMethod: 'manual',
    maxWidth: longestEdgePx,
    maxHeight: longestEdgePx,
    quality,
    output: 'jpg',
  });

/** Turns a picked photo into a stored upload-ready copy. Compression runs natively, off the JS thread. */
export async function prepareImage(sourceUri: string): Promise<NewImage> {
  const compressed = await compressToBudget(sourceUri, {
    compress,
    fileSize,
    remove: removeFile,
  });
  const id = createId();
  const localUri = await moveIntoStorage(compressed.uri, id);
  await removeCachedOriginal(sourceUri);
  return { id, localUri, sizeBytes: compressed.sizeBytes };
}
