import { LocalReport, ReportRepository, ReportsApi } from '../../types';
import { recoverQueue } from './recovery';
import { backoffDelayMs, describeFailure, isRetryable } from './retryPolicy';
import { deliverReport } from './uploader';

const FALLBACK_RETRY_MS = 30_000;

export interface QueueWorkerDeps {
  repository: ReportRepository;
  api: ReportsApi;
  deleteFiles: (uris: string[]) => Promise<void>;
  notify?: () => void;
  onProgress?: (imageId: string, fraction: number) => void;
  now?: () => number;
  random?: () => number;
}

export interface ProcessOptions {
  ignoreBackoff?: boolean;
}

export interface QueueWorker {
  start(): Promise<void>;
  processQueue(options?: ProcessOptions): Promise<void>;
  runExclusive<T>(task: () => Promise<T>): Promise<T>;
  stop(): void;
}

export function createQueueWorker({
  repository,
  api,
  deleteFiles,
  notify = () => undefined,
  onProgress,
  now = Date.now,
  random = Math.random,
}: QueueWorkerDeps): QueueWorker {
  let inFlight: Promise<void> | null = null;
  let rerunRequested = false;
  let rerunIgnoresBackoff = false;
  let paused = false;
  let wakeTimer: ReturnType<typeof setTimeout> | null = null;

  const clearWake = () => {
    if (wakeTimer) {
      clearTimeout(wakeTimer);
      wakeTimer = null;
    }
  };

  const wakeIn = (delayMs: number) => {
    clearWake();
    wakeTimer = setTimeout(() => {
      wakeTimer = null;
      processQueue();
    }, delayMs);
  };

  async function settle(report: LocalReport) {
    await repository.markUploaded(report.id);
    notify();
    await deleteFiles(report.images.map(image => image.localUri)).catch(
      () => undefined,
    );
  }

  async function handleFailure(report: LocalReport, error: unknown) {
    const reason = describeFailure(error);
    if (isRetryable(error)) {
      const attempts = report.attempts + 1;
      await repository.scheduleRetry(report.id, {
        attempts,
        nextAttemptAt: now() + backoffDelayMs(attempts, error, random),
        reason,
      });
    } else {
      await repository.markFailedPermanent(report.id, reason);
    }
    notify();
  }

  async function attempt(report: LocalReport) {
    try {
      await deliverReport(report, { repository, api, notify, onProgress });
    } catch (error) {
      await handleFailure(report, error);
      return;
    }
    await settle(report);
  }

  async function drain(ignoreBackoff: boolean) {
    const attempted = new Set<string>();
    for (;;) {
      if (paused) {
        return;
      }
      const due = await repository.findDue(
        ignoreBackoff ? Number.MAX_SAFE_INTEGER : now(),
      );
      const next = due.find(report => !attempted.has(report.id));
      if (!next) {
        return;
      }
      attempted.add(next.id);
      await attempt(next);
    }
  }

  async function runPasses(ignoreBackoff: boolean) {
    clearWake();
    let force = ignoreBackoff;
    try {
      do {
        rerunRequested = false;
        await drain(force);
        force = rerunIgnoresBackoff;
        rerunIgnoresBackoff = false;
        if (!rerunRequested) {
          await scheduleWake();
        }
      } while (rerunRequested);
    } catch {
      wakeIn(FALLBACK_RETRY_MS);
    } finally {
      inFlight = null;
    }
  }

  async function scheduleWake() {
    const nextAttemptAt = await repository.nextAttemptAt();
    if (nextAttemptAt !== null) {
      wakeIn(Math.max(0, nextAttemptAt - now()));
    }
  }

  function processQueue({ ignoreBackoff = false }: ProcessOptions = {}) {
    if (paused) {
      return Promise.resolve();
    }
    if (inFlight) {
      rerunRequested = true;
      rerunIgnoresBackoff ||= ignoreBackoff;
      return inFlight;
    }
    inFlight = runPasses(ignoreBackoff);
    return inFlight;
  }

  return {
    async start() {
      await recoverQueue({ repository, deleteFiles });
      await processQueue();
    },
    processQueue,
    stop: clearWake,

    /** Runs a task while no delivery is active or can start, then lets delivery resume. */
    async runExclusive(task) {
      paused = true;
      clearWake();
      try {
        await inFlight;
        return await task();
      } finally {
        paused = false;
        processQueue();
      }
    },
  };
}
