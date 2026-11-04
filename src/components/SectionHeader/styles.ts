import { StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../../theme';
import { designPx } from '../../utils/responsiveUtils';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.xs,
    marginTop: spacing.xs,
    marginBottom: designPx(10),
  },
  count: {
    paddingHorizontal: designPx(8),
    paddingVertical: 1,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
});
