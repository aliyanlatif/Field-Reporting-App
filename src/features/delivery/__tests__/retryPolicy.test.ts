import { ApiError } from '../../../types';
import { backoffDelayMs, isRetryable } from '../retryPolicy';

const http = (status: number, code?: string, retryAfterMs?: number) =>
  new ApiError({
    kind: 'http',
    status,
    code,
    message: `HTTP ${status}`,
    retryAfterMs,
  });

describe('isRetryable', () => {
  test.each([
    ['network failure', new ApiError({ kind: 'network', message: 'down' })],
    ['timeout', new ApiError({ kind: 'timeout', message: 'slow' })],
    ['500', http(500)],
    ['503', http(503)],
    ['429', http(429)],
    ['408', http(408)],
    ['missing images on complete', http(409, 'images_missing')],
    ['report not found on server', http(404, 'report_not_found')],
    ['unknown error type', new Error('boom')],
  ])('retries %s', (_name, error) => {
    expect(isRetryable(error)).toBe(true);
  });

  test.each([
    ['400', http(400, 'invalid_description')],
    ['403 refusal', http(403, 'chaos_refused')],
    ['404 unknown route', http(404)],
    ['409 id conflict', http(409, 'id_conflict')],
    ['413 image too large', http(413, 'image_too_large')],
  ])('does not retry %s', (_name, error) => {
    expect(isRetryable(error)).toBe(false);
  });
});

describe('backoffDelayMs', () => {
  test('grows exponentially between half and the full ceiling', () => {
    expect(backoffDelayMs(1, undefined, () => 0)).toBe(1_000);
    expect(backoffDelayMs(1, undefined, () => 1)).toBe(2_000);
    expect(backoffDelayMs(3, undefined, () => 1)).toBe(8_000);
  });

  test('is capped at five minutes', () => {
    expect(backoffDelayMs(50, undefined, () => 1)).toBe(300_000);
    expect(backoffDelayMs(50, undefined, () => 0)).toBe(150_000);
  });

  test('stays within bounds for any random value', () => {
    for (let attempt = 1; attempt <= 12; attempt++) {
      const delay = backoffDelayMs(attempt);
      expect(delay).toBeGreaterThanOrEqual(1_000);
      expect(delay).toBeLessThanOrEqual(300_000);
    }
  });

  test('honours a longer Retry-After from the server', () => {
    expect(backoffDelayMs(1, http(429, undefined, 60_000), () => 1)).toBe(
      60_000,
    );
  });
});
