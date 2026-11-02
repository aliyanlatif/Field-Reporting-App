import { IMAGE_BUDGET, ImageBudget } from '../../config';

export interface CompressionAttempt {
  longestEdgePx: number;
  quality: number;
}

export interface CompressDeps {
  compress(sourceUri: string, attempt: CompressionAttempt): Promise<string>;
  fileSize(uri: string): Promise<number>;
  remove(uri: string): Promise<void>;
}

export interface CompressedImage {
  uri: string;
  sizeBytes: number;
}

export class ImageTooLargeError extends Error {
  constructor() {
    super('Photo could not be reduced below the upload limit');
    this.name = 'ImageTooLargeError';
  }
}

/** Tries the largest, best-looking settings first and only steps down until the file fits the budget. */
export async function compressToBudget(
  sourceUri: string,
  { compress, fileSize, remove }: CompressDeps,
  budget: ImageBudget = IMAGE_BUDGET,
): Promise<CompressedImage> {
  for (const longestEdgePx of budget.longestEdgesPx) {
    for (const quality of budget.jpegQualities) {
      const uri = await compress(sourceUri, { longestEdgePx, quality });
      const sizeBytes = await fileSize(uri);
      if (sizeBytes <= budget.targetBytes) {
        return { uri, sizeBytes };
      }
      await remove(uri);
    }
  }
  throw new ImageTooLargeError();
}
