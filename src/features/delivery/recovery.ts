import { ReportRepository } from '../../types';

interface RecoveryDeps {
  repository: ReportRepository;
  deleteFiles: (uris: string[]) => Promise<void>;
}

/** Undoes what an interrupted run left behind: stuck uploads and files of already delivered reports. */
export async function recoverQueue({ repository, deleteFiles }: RecoveryDeps) {
  await repository.recoverInterrupted();

  const leftovers = (await repository.list())
    .filter(report => report.status === 'uploaded')
    .flatMap(report => report.images.map(image => image.localUri));
  if (leftovers.length > 0) {
    await deleteFiles(leftovers).catch(() => undefined);
  }
}
