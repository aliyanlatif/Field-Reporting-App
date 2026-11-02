export type ApiErrorKind = 'network' | 'timeout' | 'http';

interface ApiErrorInit {
  kind: ApiErrorKind;
  message: string;
  status?: number;
  code?: string;
  retryAfterMs?: number;
  missingImageIds?: string[];
}

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;
  readonly code?: string;
  readonly retryAfterMs?: number;
  readonly missingImageIds?: string[];

  constructor({
    kind,
    message,
    status,
    code,
    retryAfterMs,
    missingImageIds,
  }: ApiErrorInit) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
    this.code = code;
    this.retryAfterMs = retryAfterMs;
    this.missingImageIds = missingImageIds;
  }
}
