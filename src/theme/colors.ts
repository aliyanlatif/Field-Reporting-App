/** Soft UI palette. Values are taken from the approved design. */
export const colors = {
  background: '#F3F5F4',
  surface: '#FFFFFF',
  surfaceMuted: '#EEF2F0',
  border: '#E1E6E4',
  borderStrong: '#D3DBD8',
  borderDashed: '#B3BFBB',

  ink: '#16212C',
  textPrimary: '#16212C',
  textSecondary: '#566574',
  textTertiary: '#4D5C69',
  textOnPrimary: '#FFFFFF',

  primary: '#2E7BD6',
  primaryStrong: '#1B5CA8',
  primaryPressed: '#1B5CA8',
  focusRing: 'rgba(46, 123, 214, 0.16)',

  success: '#1B6B42',
  successSurface: '#E4F3EB',
  warning: '#8A4A06',
  warningSurface: '#FBEFDF',
  danger: '#A32D27',
  dangerSurface: '#FAE8E7',
  dangerFill: '#F0A8A3',
  dangerDeep: '#6E1814',

  disabled: '#C9D2CF',
  disabledText: '#3F4E5B',
  grabber: '#C9D2CF',

  scrim: 'rgba(22, 33, 44, 0.44)',
  overlayDark: 'rgba(22, 33, 44, 0.7)',
  white: '#FFFFFF',
} as const;

/** The five visual tones a status can take: chip, status card icon and timeline dot. */
export type Tone = 'ok' | 'send' | 'wait' | 'amber' | 'bad';

interface ToneColors {
  background: string;
  foreground: string;
  dot: string;
}

export const tones: Record<Tone, ToneColors> = {
  ok: { background: '#E4F3EB', foreground: '#1B6B42', dot: '#2F9160' },
  send: { background: '#E7F0FB', foreground: '#1B5CA8', dot: '#2E7BD6' },
  wait: { background: '#E6EBF0', foreground: '#435466', dot: '#7A8B9C' },
  amber: { background: '#FBEFDF', foreground: '#8A4A06', dot: '#E08A34' },
  bad: { background: '#FAE8E7', foreground: '#A32D27', dot: '#C4453D' },
};
