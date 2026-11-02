import { ApiError } from '../../../types';
import { createApiClient } from '../client';

const jsonResponse = (status: number, body?: unknown, headers: Record<string, string> = {}) =>
  new Response(body === undefined ? null : JSON.stringify(body), { status, headers });

const imageBlob = {} as Blob;

function setup(fetchImpl: typeof fetch, options = {}) {
  return createApiClient({
    baseUrl: 'http://server',
    fetchImpl,
    readImage: async () => imageBlob,
    ...options,
  });
}

test('creates a report with a JSON body', async () => {
  const fetchImpl = jest.fn().mockResolvedValue(jsonResponse(201, { id: 'r1' }));
  const request = { id: 'r1', description: 'd', imageIds: ['i1'], createdAt: '2026-01-01T00:00:00Z' };

  await setup(fetchImpl).createReport(request);

  const [url, init] = fetchImpl.mock.calls[0];
  expect(url).toBe('http://server/reports');
  expect(init.method).toBe('POST');
  expect(JSON.parse(init.body)).toEqual(request);
});

test('uploads image bytes to the image route', async () => {
  const fetchImpl = jest.fn().mockResolvedValue(jsonResponse(201, { id: 'i1' }));

  await setup(fetchImpl).uploadImage('r1', { id: 'i1', uri: 'file:///a.jpg', sizeBytes: 10 });

  const [url, init] = fetchImpl.mock.calls[0];
  expect(url).toBe('http://server/reports/r1/images/i1');
  expect(init.method).toBe('PUT');
  expect(init.body).toBe(imageBlob);
});

test('returns reports from the list response', async () => {
  const reports = [{ id: 'r1', description: 'd', createdAt: 'a', completedAt: 'b', images: [] }];
  const fetchImpl = jest.fn().mockResolvedValue(jsonResponse(200, { reports }));

  expect(await setup(fetchImpl).listReports()).toEqual(reports);
});

test('maps an HTTP failure to an ApiError with status, code and Retry-After', async () => {
  const fetchImpl = jest
    .fn()
    .mockResolvedValue(jsonResponse(503, { error: 'busy', message: 'try later' }, { 'retry-after': '7' }));

  const error = await setup(fetchImpl)
    .completeReport('r1')
    .catch(e => e);

  expect(error).toBeInstanceOf(ApiError);
  expect(error).toMatchObject({ kind: 'http', status: 503, code: 'busy', retryAfterMs: 7000 });
});

test('exposes the images the server reports as missing', async () => {
  const fetchImpl = jest
    .fn()
    .mockResolvedValue(jsonResponse(409, { error: 'images_missing', missing: ['i2'] }));

  const error = await setup(fetchImpl)
    .completeReport('r1')
    .catch(e => e);

  expect(error.missingImageIds).toEqual(['i2']);
});

test('maps a failed fetch to a network error', async () => {
  const fetchImpl = jest.fn().mockRejectedValue(new TypeError('Network request failed'));

  await expect(setup(fetchImpl).createReport({} as never)).rejects.toMatchObject({
    kind: 'network',
  });
});

test('gives up on a server that never answers', async () => {
  jest.useFakeTimers();
  const hangingFetch = ((_url: string, init: RequestInit) =>
    new Promise((_resolve, reject) => {
      init.signal?.addEventListener('abort', () => reject(new Error('aborted')));
    })) as unknown as typeof fetch;

  const result = setup(hangingFetch, { requestTimeoutMs: 5000 })
    .listReports()
    .catch(e => e);
  await jest.advanceTimersByTimeAsync(5000);

  expect(await result).toMatchObject({ kind: 'timeout' });
  jest.useRealTimers();
});

test('allows uploads more time in proportion to their size', async () => {
  jest.useFakeTimers();
  const slowFetch = jest.fn(
    (_url: string, init: RequestInit) =>
      new Promise((_resolve, reject) => {
        init.signal?.addEventListener('abort', () => reject(new Error('aborted')));
      }),
  ) as unknown as typeof fetch;
  const api = setup(slowFetch, { requestTimeoutMs: 1000, uploadTimeout: () => 60_000 });

  const result = api.uploadImage('r1', { id: 'i1', uri: 'file:///a', sizeBytes: 1 }).catch(e => e);
  await jest.advanceTimersByTimeAsync(30_000);
  let settled = false;
  result.then(() => (settled = true));
  await jest.advanceTimersByTimeAsync(0);
  expect(settled).toBe(false);

  await jest.advanceTimersByTimeAsync(30_000);
  expect(await result).toMatchObject({ kind: 'timeout' });
  jest.useRealTimers();
});
