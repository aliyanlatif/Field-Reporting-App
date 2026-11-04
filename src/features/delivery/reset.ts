import { ReportRepository, ReportsApi } from '../../types';
import { QueueWorker } from './queueWorker';

/** `unsent` clears reports still waiting on this phone. `everything` also deletes every report on the server. */
export type ResetScope = 'unsent' | 'everything';

interface ResetDeps {
  worker: QueueWorker;
  api: Pick<ReportsApi, 'deleteAllReports'>;
  repository: Pick<ReportRepository, 'list' | 'delete' | 'clear'>;
  deleteFiles: (uris: string[]) => Promise<void>;
  removeLocalImages: () => Promise<void>;
}

/**
 * `everything` wipes the server first: if it cannot be reached nothing local is touched, so the two never end up
 * half reset. Runs while no delivery is active, so nothing is sent mid-wipe.
 */
export const resetDevice = (
  { worker, api, repository, deleteFiles, removeLocalImages }: ResetDeps,
  scope: ResetScope,
) =>
  worker.runExclusive(async () => {
    if (scope === 'everything') {
      await api.deleteAllReports();
      await repository.clear();
      await removeLocalImages();
      return;
    }
    const unsent = (await repository.list()).filter(
      report => report.status !== 'uploaded',
    );
    for (const report of unsent) {
      await repository.delete(report.id);
    }
    await deleteFiles(
      unsent.flatMap(report => report.images.map(image => image.localUri)),
    );
  });
