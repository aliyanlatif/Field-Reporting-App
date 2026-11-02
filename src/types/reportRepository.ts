import {
  ImageStatus,
  LocalReport,
  NewReport,
  RetrySchedule,
} from './report';

export interface ReportRepository {
  create(report: NewReport): Promise<void>;
  get(id: string): Promise<LocalReport | null>;
  list(): Promise<LocalReport[]>;
  findDue(now: number): Promise<LocalReport[]>;
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
