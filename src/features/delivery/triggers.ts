import { QueueWorker } from './queueWorker';

type Unsubscribe = () => void;

export interface TriggerSources {
  onForeground(listener: () => void): Unsubscribe;
  onConnectivity(listener: (online: boolean) => void): Unsubscribe;
}

/** Starts the worker and re-runs it when the app returns to the foreground or the network comes back. */
export function startTriggers(
  worker: QueueWorker,
  sources: TriggerSources,
): Unsubscribe {
  const retryNow = () => {
    worker.processQueue({ ignoreBackoff: true }).catch(() => undefined);
  };

  worker.start().catch(() => undefined);

  let wasOnline = false;
  const stopConnectivity = sources.onConnectivity(online => {
    if (online && !wasOnline) {
      retryNow();
    }
    wasOnline = online;
  });
  const stopForeground = sources.onForeground(retryNow);

  return () => {
    stopConnectivity();
    stopForeground();
    worker.stop();
  };
}
