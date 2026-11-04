import { StyleSheet } from 'react-native';
import { colors, radius, shadows, spacing } from '../../theme';
import { designPx } from '../../utils/responsiveUtils';

export const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designPx(14),
    padding: spacing.md,
    borderRadius: radius.xl - designPx(4),
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  iconTile: {
    width: designPx(48),
    height: designPx(48),
    borderRadius: designPx(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, gap: designPx(3) },
  title: {
    fontSize: designPx(16),
    lineHeight: designPx(20),
    letterSpacing: -0.16,
  },
});
