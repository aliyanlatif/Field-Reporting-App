// 10.0.2.2 reaches the host machine from the Android emulator; use the laptop's LAN IP on a phone.
export const API_BASE_URL = 'http://10.0.2.2:4000';

export const REQUEST_TIMEOUT_MS = 15_000;

const UPLOAD_BASE_TIMEOUT_MS = 30_000;
const UPLOAD_MIN_BYTES_PER_SECOND = 15 * 1024;

export const uploadTimeoutMs = (sizeBytes: number) =>
  UPLOAD_BASE_TIMEOUT_MS + (sizeBytes / UPLOAD_MIN_BYTES_PER_SECOND) * 1000;
