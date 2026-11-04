import { LocalReport } from '../../types';

/** How a status looks: the UI maps each tone to its colors. */
export type StatusTone = 'ok' | 'send' | 'wait' | 'amber' | 'bad';

/** Where a report is on its way to the server. */
export type ReportStage =
  | 'saved'
  | 'sending'
  | 'retrying'
  | 'needs-you'
  | 'delivered';

export interface ReportBadge {
  tone: StatusTone;
  label: string;
  detail?: string;
}

export const UPLOADED_BADGE: ReportBadge = { tone: 'ok', label: 'Uploaded' };

export const stageOf = (report: LocalReport): ReportStage => {
  switch (report.status) {
    case 'uploading':
      return 'sending';
    case 'failed_permanent':
      return 'needs-you';
    case 'uploaded':
      return 'delivered';
    case 'queued':
      return report.attempts > 0 ? 'retrying' : 'saved';
  }
};

export const countSent = (report: LocalReport) =>
  report.images.filter(image => image.status === 'uploaded').length;

/** The photo the server refused, if that is why the report stopped. */
export const findRefusedImage = (report: LocalReport) =>
  report.status === 'failed_permanent'
    ? report.images.find(image => image.status === 'failed')
    : undefined;

export function describeLocalReport(report: LocalReport): ReportBadge {
  switch (stageOf(report)) {
    case 'sending':
      return {
        tone: 'send',
        label: `Sending · ${countSent(report)} of ${
          report.images.length
        } photos`,
      };
    case 'needs-you':
      return findRefusedImage(report)
        ? { tone: 'bad', label: 'Needs you · photo refused' }
        : {
            tone: 'bad',
            label: 'Needs you',
            detail: report.failureReason ?? undefined,
          };
    case 'delivered':
      return UPLOADED_BADGE;
    case 'retrying':
      return {
        tone: 'wait',
        label: 'Waiting to retry',
        detail: report.failureReason ?? undefined,
      };
    case 'saved':
      return { tone: 'amber', label: 'Waiting for network' };
  }
}
