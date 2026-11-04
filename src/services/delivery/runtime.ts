import { getReportRepository } from '../../db';
import {
  createQueueWorker,
  QueueWorker,
  resetDevice,
  ResetScope,
  reviseFailedReport,
  Revision,
  startTriggers,
} from '../../features/delivery';
import { api } from '../api';
import { subscribeToForeground } from '../appLifecycle';
import { deleteFiles, removeAllImages, removeOrphanedFiles } from '../images';
import { createId } from '../../utils/id';
import { subscribeToConnectivity } from '../network';
import { useUploadProgressStore } from '../../stores/uploadProgressStore';
import { notifyQueueChanged } from './queueEvents';

let worker: Promise<QueueWorker> | null = null;

function getWorker() {
  worker ??= getReportRepository().then(repository =>
    createQueueWorker({
      repository,
      api,
      deleteFiles,
      notify: notifyQueueChanged,
      onProgress: useUploadProgressStore.getState().report,
    }),
  );
  return worker;
}

async function sweepOrphanedFiles() {
  const reports = await (await getReportRepository()).list();
  const referenced = reports.flatMap(report =>
    report.images.map(image => image.localUri),
  );
  await removeOrphanedFiles(referenced);
}

/** Starts unattended delivery and returns a function that stops it. */
export async function startDelivery() {
  await sweepOrphanedFiles().catch(() => undefined);
  return startTriggers(await getWorker(), {
    onForeground: subscribeToForeground,
    onConnectivity: subscribeToConnectivity,
  });
}

export async function triggerDelivery() {
  await (await getWorker()).processQueue({ ignoreBackoff: true });
}

export async function retryReport(reportId: string) {
  await (await getReportRepository()).requeue(reportId);
  notifyQueueChanged();
  await triggerDelivery();
}

/** `unsent` clears this phone only; `everything` also deletes every report on the server. */
export async function resetDeviceData(scope: ResetScope) {
  await resetDevice(
    {
      worker: await getWorker(),
      api,
      repository: await getReportRepository(),
      deleteFiles,
      removeLocalImages: removeAllImages,
    },
    scope,
  );
  useUploadProgressStore.getState().clear();
  notifyQueueChanged();
}

/** Replaces or removes the photo the server refused, then sends the report again. Returns the report's new id. */
export async function reviseReport(reportId: string, revision: Revision) {
  const newId = await reviseFailedReport(
    {
      repository: await getReportRepository(),
      deleteFiles,
      newId: createId,
    },
    reportId,
    revision,
  );
  notifyQueueChanged();
  await triggerDelivery();
  return newId;
}
