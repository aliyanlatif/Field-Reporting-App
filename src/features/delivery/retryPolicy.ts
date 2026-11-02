import { ApiError } from '../../types';

const BASE_DELAY_MS = 2_000;
const MAX_DELAY_MS = 5 * 60_000;

const RETRYABLE_STATUSES = new Set([408, 429]);
const RECOVERABLE_CODES = new Set(['images_missing', 'report_not_found']);

export function isRetryable(error: unknown) {
  if (!(error instanceof ApiError)) {
    return true;
  }
  if (error.kind !== 'http') {
    return true;
  }
  const status = error.status ?? 0;
  return (
    status >= 500 ||
    RETRYABLE_STATUSES.has(status) ||
    (error.code !== undefined && RECOVERABLE_CODES.has(error.code))
  );
}

/** Exponential backoff with half jitter, never shorter than a server's Retry-After. */
export function backoffDelayMs(
  attempt: number,
  error?: unknown,
  random = Math.random,
) {
  const ceiling = Math.min(
    MAX_DELAY_MS,
    BASE_DELAY_MS * 2 ** Math.max(0, attempt - 1),
  );
  const jittered = ceiling / 2 + random() * (ceiling / 2);
  const retryAfter = error instanceof ApiError ? error.retryAfterMs ?? 0 : 0;
  return Math.max(jittered, retryAfter);
}

export function describeFailure(error: unknown) {
  if (!(error instanceof ApiError)) {
    return 'Unexpected error';
  }
  if (error.kind === 'network') {
    return 'No connection';
  }
  if (error.kind === 'timeout') {
    return 'Server did not respond';
  }
  return error.message;
}
