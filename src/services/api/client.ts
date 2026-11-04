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

function buildHttpError(
  status: number,
  bodyText: string,
  retryAfter: string | null,
) {
  let body: ErrorBody = {};
  try {
    body = JSON.parse(bodyText) as ErrorBody;
  } catch {
    // The body is optional; the status alone is enough to classify the error.
  }
  return new ApiError({
    kind: 'http',
    status,
    code: body.error,
    message: body.message ?? `HTTP ${status}`,
    retryAfterMs: parseRetryAfterMs(retryAfter),
    missingImageIds: body.missing,
  });
}

const toHttpError = async (response: Response) =>
  buildHttpError(
    response.status,
    await response.text().catch(() => ''),
    response.headers.get('retry-after'),
  );

interface ProgressUpload {
  url: string;
  body: Blob;
  timeoutMs: number;
  onProgress: (fraction: number) => void;
}

/** fetch cannot report upload progress, XMLHttpRequest can. Used only when a caller wants progress. */
const uploadWithProgress = ({
  url,
  body,
  timeoutMs,
  onProgress,
}: ProgressUpload) =>
  new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);
    xhr.setRequestHeader('content-type', 'image/jpeg');
    xhr.timeout = timeoutMs;
    xhr.upload.onprogress = event => {
      if (event.lengthComputable && event.total > 0) {
        onProgress(Math.min(1, event.loaded / event.total));
      }
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(
            buildHttpError(
              xhr.status,
              xhr.responseText,
              xhr.getResponseHeader('retry-after'),
            ),
          );
    xhr.onerror = () =>
      reject(
        new ApiError({ kind: 'network', message: 'Network request failed' }),
      );
    xhr.ontimeout = () =>
      reject(
        new ApiError({
          kind: 'timeout',
          message: `No response within ${timeoutMs} ms`,
        }),
      );
    xhr.send(body);
  });

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

    async uploadImage(reportId: string, image: ImageUpload, onProgress) {
      const body = await readImage(image.uri).catch(() => {
        throw new LocalFileError(image.uri);
      });
      const path = `/reports/${reportId}/images/${image.id}`;
      const timeoutMs = uploadTimeout(image.sizeBytes);
      if (onProgress) {
        await uploadWithProgress({
          url: `${baseUrl}${path}`,
          body,
          timeoutMs,
          onProgress,
        });
        return;
      }
      await request<void>(
        path,
        { method: 'PUT', headers: { 'content-type': 'image/jpeg' }, body },
        timeoutMs,
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

    deleteReport: reportId =>
      request<void>(`/reports/${reportId}`, { method: 'DELETE' }),

    deleteAllReports: () => request<void>('/reports', { method: 'DELETE' }),
  };
}
