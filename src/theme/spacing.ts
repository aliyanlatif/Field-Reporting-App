import { designPx } from '../utils/responsiveUtils';

export const spacing = {
  xs: designPx(4),
  sm: designPx(8),
  md: designPx(16),
  lg: designPx(24),
  xl: designPx(32),
} as const;

export const radius = {
  sm: designPx(12),
  md: designPx(18),
  lg: designPx(22),
  xl: designPx(28),
  sheet: designPx(30),
  pill: designPx(999),
} as const;

/** Minimum size of anything tappable. */
export const touchTarget = designPx(52);
