import { getReportRepository } from '../../db';
import {
  createQueueWorker,
  QueueWorker,
  removeReport,
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
import { readConnectivity, subscribeToConnectivity } from '../network';
import { useUploadProgressStore } from '../../stores/uploadProgressStore';
import { notifyQueueChanged } from './queueEvents';

let worker: Promise<QueueWorker> | null = null;

/** What the phone last said about its connection. Delivery waits while it is false. */
let online = true;

function getWorker() {
  worker ??= getReportRepository().then(repository =>
    createQueueWorker({
      repository,
      api,
      deleteFiles,
      notify: notifyQueueChanged,
      onProgress: useUploadProgressStore.getState().report,
      isOnline: () => online,
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
  online = await readConnectivity().catch(() => true);
  return startTriggers(await getWorker(), {
    onForeground: subscribeToForeground,
    onConnectivity: listener =>
      subscribeToConnectivity(isOnline => {
        online = isOnline;
        listener(isOnline);
      }),
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

/** Deletes one report from the server and this phone, or from this phone only if it never reached the server. */
export async function deleteReport(reportId: string) {
  await removeReport(
    {
      worker: await getWorker(),
      api,
      repository: await getReportRepository(),
      deleteFiles,
    },
    reportId,
  );
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
