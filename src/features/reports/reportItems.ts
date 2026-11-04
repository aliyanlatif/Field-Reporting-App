import { ImageStatus, LocalReport, RemoteReport } from '../../types';
import {
  countSent,
  describeLocalReport,
  findRefusedImage,
  ReportBadge,
  ReportStage,
  stageOf,
  UPLOADED_BADGE,
} from './reportStatus';

export interface ReportPhoto {
  id: string;
  uri: string;
  /** `null` for photos the server holds: they carry no local state. */
  status: ImageStatus | null;
  sizeBytes?: number;
}

export interface ReportListItem {
  id: string;
  description: string;
  createdAt: number;
  /** When the server confirmed the report. Only known for reports the server holds. */
  completedAt?: number;
  imageCount: number;
  imageUris: string[];
  photos: ReportPhoto[];
  badge: ReportBadge;
  stage: ReportStage;
  sentCount: number;
  failureReason?: string;
  /** Set when the server refused a photo: the one to replace or remove. */
  refusedImageId?: string;
  failed: boolean;
}

export interface ReportSections {
  onDevice: ReportListItem[];
  onServer: ReportListItem[];
}

const newestFirst = (a: ReportListItem, b: ReportListItem) =>
  b.createdAt - a.createdAt;

const fromLocal = (report: LocalReport): ReportListItem => {
  const delivered = report.status === 'uploaded';
  const photos = report.images.map(
    (image): ReportPhoto => ({
      id: image.id,
      uri: image.localUri,
      status: image.status,
      sizeBytes: image.sizeBytes,
    }),
  );
  return {
    id: report.id,
    description: report.description,
    createdAt: report.createdAt,
    imageCount: report.images.length,
    imageUris: delivered ? [] : photos.map(photo => photo.uri),
    photos: delivered ? [] : photos,
    badge: describeLocalReport(report),
    stage: stageOf(report),
    sentCount: countSent(report),
    failureReason: report.failureReason ?? undefined,
    refusedImageId: findRefusedImage(report)?.id,
    failed: report.status === 'failed_permanent',
  };
};

const fromRemote = (report: RemoteReport): ReportListItem => ({
  id: report.id,
  description: report.description,
  createdAt: Date.parse(report.createdAt),
  completedAt: Date.parse(report.completedAt),
  imageCount: report.images.length,
  imageUris: report.images.map(image => image.url),
  photos: report.images.map(image => ({
    id: image.id,
    uri: image.url,
    status: null,
  })),
  badge: UPLOADED_BADGE,
  stage: 'delivered',
  sentCount: report.images.length,
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
