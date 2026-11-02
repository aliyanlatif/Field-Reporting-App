import { getReportRepository } from '../../db';
import {
  createQueueWorker,
  QueueWorker,
  startTriggers,
} from '../../features/delivery';
import { api } from '../api';
import { subscribeToForeground } from '../appLifecycle';
import { deleteFiles, removeOrphanedFiles } from '../images';
import { subscribeToConnectivity } from '../network';
import { notifyQueueChanged } from './queueEvents';

let worker: Promise<QueueWorker> | null = null;

function getWorker() {
  worker ??= getReportRepository().then(repository =>
    createQueueWorker({
      repository,
      api,
      deleteFiles,
      notify: notifyQueueChanged,
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
