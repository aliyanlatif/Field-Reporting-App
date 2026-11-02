import { ReportRepository, ReportsApi } from '../../types';
import { QueueWorker } from './queueWorker';

interface ResetDeps {
  worker: QueueWorker;
  api: Pick<ReportsApi, 'deleteAllReports'>;
  repository: Pick<ReportRepository, 'clear'>;
  removeLocalImages: () => Promise<void>;
}

/** Server first: if it cannot be reached nothing local is touched, and no delivery can undo the wipe. */
export const resetEverything = ({
  worker,
  api,
  repository,
  removeLocalImages,
}: ResetDeps) =>
  worker.runExclusive(async () => {
    await api.deleteAllReports();
    await repository.clear();
    await removeLocalImages();
  });
