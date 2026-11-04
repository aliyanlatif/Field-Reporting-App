import { LocalImage, NewImage, NewReport, ReportRepository } from '../../types';

export type Revision =
  | { kind: 'remove'; imageId: string }
  | { kind: 'replace'; imageId: string; image: NewImage };

interface ReviseDeps {
  repository: Pick<ReportRepository, 'get' | 'replace'>;
  deleteFiles: (uris: string[]) => Promise<void>;
  newId: () => string;
}

const toNewImage = ({ id, localUri, sizeBytes }: LocalImage): NewImage => ({
  id,
  localUri,
  sizeBytes,
});

/**
 * Fixes a report whose photo the server refused. The server fixes a report's image list when it first
 * sees the id, so the fixed report is queued under a new id; the old, never completed one stays invisible.
 * Returns the new id.
 */
export async function reviseFailedReport(
  { repository, deleteFiles, newId }: ReviseDeps,
  reportId: string,
  revision: Revision,
) {
  const report = await repository.get(reportId);
  if (!report || report.status !== 'failed_permanent') {
    throw new Error('Only a report that failed can be changed');
  }
  const target = report.images.find(image => image.id === revision.imageId);
  if (!target) {
    throw new Error('That photo is not part of this report');
  }
  if (revision.kind === 'remove' && report.images.length < 2) {
    throw new Error('A report needs at least one photo');
  }

  const images = report.images.flatMap(image => {
    if (image.id !== target.id) {
      return [toNewImage(image)];
    }
    return revision.kind === 'replace' ? [revision.image] : [];
  });
  const revised: NewReport = {
    id: newId(),
    description: report.description,
    createdAt: report.createdAt,
    images,
  };

  await repository.replace(report.id, revised);
  await deleteFiles([target.localUri]).catch(() => undefined);
  return revised.id;
}
