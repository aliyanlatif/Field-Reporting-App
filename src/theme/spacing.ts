import { designPx } from '../utils/responsiveUtils';

export const spacing = {
  xs: designPx(4),
  sm: designPx(8),
  md: designPx(16),
  lg: designPx(24),
  xl: designPx(32),
} as const;

export const radius = {
  sm: designPx(8),
  md: designPx(12),
  pill: designPx(999),
} as const;

export const touchTarget = designPx(52);
