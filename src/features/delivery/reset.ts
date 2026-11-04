import { ReportRepository } from '../../types';
import { QueueWorker } from './queueWorker';

/** `unsent` clears reports still waiting on this phone. `everything` also clears what was already sent. */
export type ResetScope = 'unsent' | 'everything';

interface ResetDeps {
  worker: QueueWorker;
  repository: Pick<ReportRepository, 'list' | 'delete' | 'clear'>;
  deleteFiles: (uris: string[]) => Promise<void>;
  removeLocalImages: () => Promise<void>;
}

/** Clears this device only. The server is never touched. Runs while no delivery is active, so nothing is sent mid-wipe. */
export const resetDevice = (
  { worker, repository, deleteFiles, removeLocalImages }: ResetDeps,
  scope: ResetScope,
) =>
  worker.runExclusive(async () => {
    if (scope === 'everything') {
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
