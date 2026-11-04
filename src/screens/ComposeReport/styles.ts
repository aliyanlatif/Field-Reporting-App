import { StyleSheet } from 'react-native';
import { colors, spacing } from '../../theme';
import { designPx } from '../../utils/responsiveUtils';

export const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    paddingLeft: spacing.lg - designPx(4),
    paddingRight: designPx(10),
  },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: spacing.lg - designPx(4),
    paddingBottom: spacing.md,
  },
  label: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: designPx(14),
    marginBottom: spacing.sm,
    marginHorizontal: 2,
  },
  note: { marginTop: designPx(12), marginHorizontal: 2 },
  footer: {
    paddingHorizontal: spacing.lg - designPx(4),
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
  },
  hint: {
    textAlign: 'center',
    marginBottom: designPx(12),
    minHeight: designPx(18),
  },
});
