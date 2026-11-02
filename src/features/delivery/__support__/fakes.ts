import { open } from 'react-native-nitro-sqlite/mock';
import { createReportRepository, Database } from '../../../db/reportRepository';
import { runMigrations } from '../../../db/migrations';
import {
  ApiError,
  CreateReportRequest,
  ImageUpload,
  NewReport,
  RemoteReport,
  ReportsApi,
} from '../../../types';

export async function createTestRepository() {
  const db = open({ name: 'delivery.sqlite' }) as Database;
  await db.executeAsync('PRAGMA foreign_keys = ON');
  await runMigrations(db);
  return createReportRepository(db);
}

export const newReport = (
  id: string,
  createdAt = 1,
  imageCount = 2,
): NewReport => ({
  id,
  description: `report ${id}`,
  createdAt,
  images: Array.from({ length: imageCount }, (_, index) => ({
    id: `${id}-i${index}`,
    localUri: `file:///files/${id}-${index}.jpg`,
    sizeBytes: 1000,
  })),
});

export const httpError = (status: number, code?: string) =>
  new ApiError({ kind: 'http', status, code, message: `HTTP ${status}` });

export const networkError = () =>
  new ApiError({ kind: 'network', message: 'down' });

type Method = 'createReport' | 'uploadImage' | 'completeReport';
type Outcome = ApiError | 'lose-response';

/** In-memory server with the real idempotency rules, plus scripted failures per call. */
export class FakeApi implements ReportsApi {
  readonly calls: string[] = [];
  readonly reports = new Map<
    string,
    { request: CreateReportRequest; images: Set<string>; complete: boolean }
  >();
  private readonly scripted: Record<Method, Outcome[]> = {
    createReport: [],
    uploadImage: [],
    completeReport: [],
  };

  script(method: Method, ...outcomes: Outcome[]) {
    this.scripted[method].push(...outcomes);
  }

  get completed() {
    return [...this.reports.values()].filter(report => report.complete);
  }

  private async run(method: Method, label: string, apply: () => void) {
    this.calls.push(label);
    const outcome = this.scripted[method].shift();
    if (outcome instanceof ApiError) {
      throw outcome;
    }
    apply();
    if (outcome === 'lose-response') {
      throw networkError();
    }
  }

  createReport(request: CreateReportRequest) {
    return this.run('createReport', `create ${request.id}`, () => {
      if (!this.reports.has(request.id)) {
        this.reports.set(request.id, {
          request,
          images: new Set(),
          complete: false,
        });
      }
    });
  }

  uploadImage(reportId: string, image: ImageUpload) {
    return this.run('uploadImage', `put ${image.id}`, () => {
      this.reports.get(reportId)?.images.add(image.id);
    });
  }

  completeReport(reportId: string) {
    return this.run('completeReport', `complete ${reportId}`, () => {
      const report = this.reports.get(reportId);
      const missing =
        report?.request.imageIds.filter(id => !report.images.has(id)) ?? [];
      if (missing.length > 0) {
        throw new ApiError({
          kind: 'http',
          status: 409,
          code: 'images_missing',
          message: 'missing',
          missingImageIds: missing,
        });
      }
      if (report) {
        report.complete = true;
      }
    });
  }

  listReports = async (): Promise<RemoteReport[]> => [];
  getReport = async (): Promise<RemoteReport> => {
    throw httpError(404);
  };
  deleteAllReports = async () => {
    this.reports.clear();
  };
}
