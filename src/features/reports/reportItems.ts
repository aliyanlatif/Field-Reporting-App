import { LocalReport, RemoteReport } from '../../types';
import {
  describeLocalReport,
  ReportBadge,
  UPLOADED_BADGE,
} from './reportStatus';

export interface ReportListItem {
  id: string;
  description: string;
  createdAt: number;
  imageCount: number;
  imageUris: string[];
  badge: ReportBadge;
  failed: boolean;
}

export interface ReportSections {
  onDevice: ReportListItem[];
  onServer: ReportListItem[];
}

const newestFirst = (a: ReportListItem, b: ReportListItem) =>
  b.createdAt - a.createdAt;

const fromLocal = (report: LocalReport): ReportListItem => ({
  id: report.id,
  description: report.description,
  createdAt: report.createdAt,
  imageCount: report.images.length,
  imageUris:
    report.status === 'uploaded'
      ? []
      : report.images.map(image => image.localUri),
  badge: describeLocalReport(report),
  failed: report.status === 'failed_permanent',
});

const fromRemote = (report: RemoteReport): ReportListItem => ({
  id: report.id,
  description: report.description,
  createdAt: Date.parse(report.createdAt),
  imageCount: report.images.length,
  imageUris: report.images.map(image => image.url),
  badge: UPLOADED_BADGE,
  failed: false,
});

/** The server's copy always wins; local reports it does not hold yet stay visible until it does. */
export function buildReportSections(
  local: LocalReport[],
  remote: RemoteReport[],
): ReportSections {
  const onServerIds = new Set(remote.map(report => report.id));
  const pending = local.filter(report => !onServerIds.has(report.id));

  const onDevice = pending
    .filter(report => report.status !== 'uploaded')
    .map(fromLocal);
  const deliveredNotListed = pending
    .filter(report => report.status === 'uploaded')
    .map(fromLocal);

  return {
    onDevice: onDevice.sort(newestFirst),
    onServer: [...remote.map(fromRemote), ...deliveredNotListed].sort(
      newestFirst,
    ),
  };
}

export const findReportItem = (
  { onDevice, onServer }: ReportSections,
  id: string,
) => [...onDevice, ...onServer].find(item => item.id === id);
