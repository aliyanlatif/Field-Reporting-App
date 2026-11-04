import { ReportListItem } from '../features/reports';
import { useUploadProgressStore } from '../stores/uploadProgressStore';

/** How much of a photo is sent, 0 to 1, while it is on its way. */
export const usePhotoProgress = (photoId: string | undefined) =>
  useUploadProgressStore(state =>
    photoId ? state.fractions[photoId] ?? 0 : 0,
  );

/** How much of the whole report is sent, 0 to 1: finished photos plus the one in flight. */
export function useReportProgress(item: ReportListItem) {
  const inFlight = item.photos.find(photo => photo.status === 'uploading');
  const fraction = usePhotoProgress(inFlight?.id);
  return item.imageCount === 0
    ? 0
    : Math.min(1, (item.sentCount + fraction) / item.imageCount);
}
