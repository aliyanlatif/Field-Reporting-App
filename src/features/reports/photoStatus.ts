import { ReportPhoto } from './reportItems';
import { StatusTone } from './reportStatus';

export interface PhotoBadge {
  tone: StatusTone;
  label: string;
}

/** What to say about one photo of a report. `fraction` is how much of it is sent, 0 to 1. */
export function describePhoto(
  photo: ReportPhoto,
  fraction: number,
): PhotoBadge {
  switch (photo.status) {
    case 'failed':
      return { tone: 'bad', label: 'Server refused this' };
    case 'uploading':
      return { tone: 'send', label: `Sending ${Math.round(fraction * 100)}%` };
    case 'pending':
      return { tone: 'amber', label: 'Queued' };
    case 'uploaded':
    case null:
      return { tone: 'ok', label: 'Uploaded' };
  }
}
