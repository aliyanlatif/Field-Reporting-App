export type ReportStatus =
  | 'queued'
  | 'uploading'
  | 'uploaded'
  | 'failed_permanent';

export type ImageStatus = 'pending' | 'uploading' | 'uploaded' | 'failed';

export interface LocalImage {
  id: string;
  reportId: string;
  position: number;
  localUri: string;
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
  localUri: string;
  sizeBytes: number;
}

/** A photo ready to queue, plus how big it was before it was shrunk (for display only, never stored). */
export interface PreparedImage extends NewImage {
  originalSizeBytes: number;
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
