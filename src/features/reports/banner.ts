import { LocalReport } from '../../types';

export interface BannerState {
  tone: 'neutral' | 'progress' | 'warning';
  message: string;
}

const plural = (count: number) =>
  count === 1 ? '1 report' : `${count} reports`;

export function deriveBanner(
  online: boolean,
  local: LocalReport[],
): BannerState | null {
  const pending = local.filter(
    report => report.status === 'queued' || report.status === 'uploading',
  );
  const uploading = pending.some(report => report.status === 'uploading');
  const retrying = pending.some(report => report.attempts > 0);

  if (!online) {
    return pending.length === 0
      ? { tone: 'warning', message: "You're offline" }
      : {
          tone: 'warning',
          message: `Offline. ${plural(
            pending.length,
          )} waiting on this device, sending when you're back online`,
        };
  }
  if (pending.length === 0) {
    return null;
  }
  if (!uploading && retrying) {
    return {
      tone: 'warning',
      message: `Can't reach the server. Trying again with ${plural(
        pending.length,
      )}`,
    };
  }
  return { tone: 'progress', message: `Sending ${plural(pending.length)}` };
}
