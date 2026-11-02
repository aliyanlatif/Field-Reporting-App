import { StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../../theme';
import { designPx } from '../../utils/responsiveUtils';

export const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  row: { flexDirection: 'row', gap: spacing.md, minHeight: designPx(84) },
  pressed: { opacity: 0.85 },
  thumbnail: {
    width: designPx(84),
    height: designPx(84),
    borderRadius: radius.sm,
    backgroundColor: colors.border,
  },
  body: { flex: 1, gap: spacing.xs, justifyContent: 'center' },
});
