import { ImageStatus, LocalReport, NewReport, RetrySchedule } from './report';

export interface ReportRepository {
  create(report: NewReport): Promise<void>;
  /** Atomically swaps a report for a revised one: the old report and its images go, the new one is queued. */
  replace(oldId: string, report: NewReport): Promise<void>;
  get(id: string): Promise<LocalReport | null>;
  list(): Promise<LocalReport[]>;
  findDue(now: number): Promise<LocalReport[]>;
  nextAttemptAt(): Promise<number | null>;
  markUploading(id: string): Promise<void>;
  markImage(imageId: string, status: ImageStatus): Promise<void>;
  scheduleRetry(id: string, retry: RetrySchedule): Promise<void>;
  markFailedPermanent(id: string, reason: string): Promise<void>;
  markUploaded(id: string): Promise<void>;
  requeue(id: string): Promise<void>;
  recoverInterrupted(): Promise<void>;
  delete(id: string): Promise<void>;
  clear(): Promise<void>;
}
