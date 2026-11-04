import { StyleSheet } from 'react-native';
import { radius, shadows, spacing } from '../../theme';
import { designPx } from '../../utils/responsiveUtils';

export const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    left: designPx(14),
    right: designPx(14),
    flexDirection: 'row',
    alignItems: 'center',
    gap: designPx(10),
    paddingVertical: designPx(12),
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    ...shadows.raised,
  },
  message: { flex: 1 },
});
