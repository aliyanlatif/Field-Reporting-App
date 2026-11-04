import { ReportRepository, ReportsApi } from '../../types';
import { QueueWorker } from './queueWorker';

interface RemoveDeps {
  worker: QueueWorker;
  api: Pick<ReportsApi, 'deleteReport'>;
  repository: Pick<ReportRepository, 'get' | 'delete'>;
  deleteFiles: (uris: string[]) => Promise<void>;
}

/**
 * Deletes one report. A report the server holds is deleted there first, so if the server cannot be reached nothing
 * changes. A report that never reached the server is only removed from this phone. Runs while no delivery is
 * active, so a report mid-upload finishes first and is then deleted, never half-sent.
 */
export const removeReport = (
  { worker, api, repository, deleteFiles }: RemoveDeps,
  reportId: string,
) =>
  worker.runExclusive(async () => {
    const local = await repository.get(reportId);
    const onServer = !local || local.status === 'uploaded';

    if (onServer) {
      await api.deleteReport(reportId);
    }
    if (local) {
      await repository.delete(reportId);
      await deleteFiles(local.images.map(image => image.localUri)).catch(
        () => undefined,
      );
    }
  });
