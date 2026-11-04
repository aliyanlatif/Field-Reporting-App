import { StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../../theme';
import { designPx } from '../../utils/responsiveUtils';

export const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  primary: {
    minHeight: designPx(56),
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
  },
  secondary: {
    minHeight: designPx(52),
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
  },
  warning: {
    minHeight: designPx(52),
    borderRadius: radius.sm,
    backgroundColor: colors.warning,
  },
  smallLabel: { fontSize: designPx(14) },
  greyed: { backgroundColor: colors.disabled, borderColor: colors.disabled },
});
