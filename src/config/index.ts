// The dev server forwards this port to every adb-connected device, so one address works on emulators and phones.
export const API_BASE_URL = 'http://localhost:4000';

export const REQUEST_TIMEOUT_MS = 15_000;

const UPLOAD_BASE_TIMEOUT_MS = 30_000;
const UPLOAD_MIN_BYTES_PER_SECOND = 15 * 1024;

export const uploadTimeoutMs = (sizeBytes: number) =>
  UPLOAD_BASE_TIMEOUT_MS + (sizeBytes / UPLOAD_MIN_BYTES_PER_SECOND) * 1000;

export const MAX_IMAGES_PER_REPORT = 5;

export interface ImageBudget {
  maxBytes: number;
  targetBytes: number;
  longestEdgesPx: readonly number[];
  jpegQualities: readonly number[];
}

export const IMAGE_BUDGET: ImageBudget = {
  maxBytes: 5 * 1024 * 1024,
  targetBytes: 4.5 * 1024 * 1024,
  longestEdgesPx: [2048, 1600, 1280],
  jpegQualities: [0.85, 0.75, 0.65, 0.55, 0.45],
};
