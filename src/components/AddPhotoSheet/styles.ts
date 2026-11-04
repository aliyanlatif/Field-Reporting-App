import { StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../../theme';
import { designPx } from '../../utils/responsiveUtils';

export const styles = StyleSheet.create({
  title: { marginLeft: spacing.xs, marginBottom: designPx(12) },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designPx(14),
    height: designPx(60),
    paddingHorizontal: designPx(18),
    marginBottom: spacing.sm,
    borderRadius: radius.lg - 2,
    backgroundColor: colors.surface,
  },
  rowLabel: { fontSize: designPx(16) },
  cancel: {
    height: designPx(60),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
