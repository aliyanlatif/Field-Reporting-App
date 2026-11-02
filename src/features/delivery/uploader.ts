import {
  ApiError,
  LocalReport,
  ReportRepository,
  ReportsApi,
} from '../../types';
import { isRetryable } from './retryPolicy';

export interface UploaderDeps {
  repository: ReportRepository;
  api: ReportsApi;
  notify: () => void;
}

/** Sends one report: every step is idempotent and persisted, so a retry resumes where it stopped. */
export async function deliverReport(
  report: LocalReport,
  { repository, api, notify }: UploaderDeps,
) {
  await repository.markUploading(report.id);
  notify();

  await api.createReport({
    id: report.id,
    description: report.description,
    imageIds: report.images.map(image => image.id),
    createdAt: new Date(report.createdAt).toISOString(),
  });

  for (const image of report.images) {
    if (image.status === 'uploaded') {
      continue;
    }
    await repository.markImage(image.id, 'uploading');
    notify();
    try {
      await api.uploadImage(report.id, {
        id: image.id,
        uri: image.localUri,
        sizeBytes: image.sizeBytes,
      });
    } catch (error) {
      await repository.markImage(
        image.id,
        isRetryable(error) ? 'pending' : 'failed',
      );
      notify();
      throw error;
    }
    await repository.markImage(image.id, 'uploaded');
    notify();
  }

  try {
    await api.completeReport(report.id);
  } catch (error) {
    if (error instanceof ApiError) {
      for (const imageId of error.missingImageIds ?? []) {
        await repository.markImage(imageId, 'pending');
      }
    }
    throw error;
  }
}
