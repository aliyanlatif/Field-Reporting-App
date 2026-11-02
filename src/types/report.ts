export type ReportStatus = 'queued' | 'uploading' | 'uploaded' | 'failed_permanent';

export type ImageStatus = 'pending' | 'uploading' | 'uploaded' | 'failed';

export interface LocalImage {
  id: string;
  reportId: string;
  position: number;
  localPath: string;
  sizeBytes: number;
  status: ImageStatus;
}

export interface LocalReport {
  id: string;
  description: string;
  status: ReportStatus;
  createdAt: number;
  attempts: number;
  nextAttemptAt: number | null;
  failureReason: string | null;
  images: LocalImage[];
}

export interface NewImage {
  id: string;
  localPath: string;
  sizeBytes: number;
}

export interface NewReport {
  id: string;
  description: string;
  createdAt: number;
  images: NewImage[];
}

export interface RetrySchedule {
  attempts: number;
  nextAttemptAt: number;
  reason: string;
}
