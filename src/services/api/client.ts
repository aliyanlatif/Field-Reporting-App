import { REQUEST_TIMEOUT_MS, uploadTimeoutMs } from '../../config';
import {
  ApiError,
  CreateReportRequest,
  ImageUpload,
  LocalFileError,
  RemoteReport,
  ReportsApi,
} from '../../types';

export interface ApiClientOptions {
  baseUrl: string;
  fetchImpl?: typeof fetch;
  readImage?: (uri: string) => Promise<Blob>;
  requestTimeoutMs?: number;
  uploadTimeout?: (sizeBytes: number) => number;
}

interface ErrorBody {
  error?: string;
  message?: string;
  missing?: string[];
}

const readLocalFile = async (uri: string) => (await fetch(uri)).blob();

const parseRetryAfterMs = (header: string | null) => {
  const seconds = header === null ? NaN : Number(header);
  return Number.isFinite(seconds) ? seconds * 1000 : undefined;
};

async function toHttpError(response: Response) {
  const body: ErrorBody = await response.json().catch(() => ({}));
  return new ApiError({
    kind: 'http',
    status: response.status,
    code: body.error,
    message: body.message ?? `HTTP ${response.status}`,
    retryAfterMs: parseRetryAfterMs(response.headers.get('retry-after')),
    missingImageIds: body.missing,
  });
}

export function createApiClient({
  baseUrl,
  fetchImpl = fetch,
  readImage = readLocalFile,
  requestTimeoutMs = REQUEST_TIMEOUT_MS,
  uploadTimeout = uploadTimeoutMs,
}: ApiClientOptions): ReportsApi {
  async function request<T>(
    path: string,
    init: RequestInit = {},
    timeoutMs = requestTimeoutMs,
  ): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetchImpl(`${baseUrl}${path}`, {
        ...init,
        signal: controller.signal,
      });
      if (!response.ok) {
        throw await toHttpError(response);
      }
      const text = await response.text();
      return (text ? JSON.parse(text) : undefined) as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw controller.signal.aborted
        ? new ApiError({
            kind: 'timeout',
            message: `No response within ${timeoutMs} ms`,
          })
        : new ApiError({ kind: 'network', message: 'Network request failed' });
    } finally {
      clearTimeout(timer);
    }
  }

  const post = (path: string, body?: unknown) =>
    request<void>(path, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

  return {
    createReport: (report: CreateReportRequest) => post('/reports', report),

    async uploadImage(reportId: string, image: ImageUpload) {
      const body = await readImage(image.uri).catch(() => {
        throw new LocalFileError(image.uri);
      });
      await request<void>(
        `/reports/${reportId}/images/${image.id}`,
        { method: 'PUT', headers: { 'content-type': 'image/jpeg' }, body },
        uploadTimeout(image.sizeBytes),
      );
    },

    completeReport: reportId => post(`/reports/${reportId}/complete`),

    async listReports() {
      const { reports } = await request<{ reports: RemoteReport[] }>(
        '/reports',
      );
      return reports;
    },

    getReport: reportId => request<RemoteReport>(`/reports/${reportId}`),

    deleteAllReports: () => request<void>('/reports', { method: 'DELETE' }),
  };
}
