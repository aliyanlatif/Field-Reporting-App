import { LocalReport } from '../../types';

export type BadgeTone =
  | 'neutral'
  | 'progress'
  | 'warning'
  | 'success'
  | 'danger';

export interface ReportBadge {
  tone: BadgeTone;
  label: string;
  detail?: string;
}

export const UPLOADED_BADGE: ReportBadge = {
  tone: 'success',
  label: 'Uploaded',
};

export function describeLocalReport(report: LocalReport): ReportBadge {
  switch (report.status) {
    case 'uploading': {
      const done = report.images.filter(
        image => image.status === 'uploaded',
      ).length;
      return {
        tone: 'progress',
        label: `Uploading ${done} of ${report.images.length}`,
      };
    }
    case 'failed_permanent':
      return {
        tone: 'danger',
        label: 'Failed',
        detail: report.failureReason ?? undefined,
      };
    case 'uploaded':
      return UPLOADED_BADGE;
    case 'queued':
      return report.attempts > 0
        ? {
            tone: 'warning',
            label: 'Waiting to retry',
            detail: report.failureReason ?? undefined,
          }
        : { tone: 'neutral', label: 'Saved on device' };
  }
}
