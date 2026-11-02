import { ImageStatus, LocalImage, LocalReport, ReportStatus } from '../types';

export interface ReportRow {
  id: string;
  description: string;
  status: ReportStatus;
  created_at: number;
  attempts: number;
  next_attempt_at: number | null;
  failure_reason: string | null;
  [column: string]: string | number | null;
}

export interface ImageRow {
  id: string;
  report_id: string;
  position: number;
  local_path: string;
  size_bytes: number;
  status: ImageStatus;
  [column: string]: string | number | null;
}

export const toLocalImage = (row: ImageRow): LocalImage => ({
  id: row.id,
  reportId: row.report_id,
  position: row.position,
  localPath: row.local_path,
  sizeBytes: row.size_bytes,
  status: row.status,
});

export const toLocalReport = (row: ReportRow, images: LocalImage[]): LocalReport => ({
  id: row.id,
  description: row.description,
  status: row.status,
  createdAt: row.created_at,
  attempts: row.attempts,
  nextAttemptAt: row.next_attempt_at,
  failureReason: row.failure_reason,
  images,
});
