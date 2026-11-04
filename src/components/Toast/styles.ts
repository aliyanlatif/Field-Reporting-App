import { StyleSheet } from 'react-native';
import { radius, shadows, spacing } from '../../theme';
import { designPx } from '../../utils/responsiveUtils';

export const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-start',
    paddingHorizontal: spacing.lg - designPx(4),
  },
  toast: {
    paddingVertical: designPx(13),
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    ...shadows.raised,
  },
});
