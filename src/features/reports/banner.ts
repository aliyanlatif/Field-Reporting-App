export interface BannerState {
  tone: 'offline';
  message: string;
}

/** Connection news only. What is happening to each report is shown by the status card and the report's own chip. */
export const deriveBanner = (online: boolean): BannerState | null =>
  online
    ? null
    : { tone: 'offline', message: "You're offline. Everything is saved." };
