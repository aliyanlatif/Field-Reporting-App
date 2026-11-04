import { StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../../theme';
import { designPx } from '../../utils/responsiveUtils';

export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: designPx(10),
  },
  fill: { flex: 1, padding: spacing.lg },
  compact: { paddingVertical: spacing.lg, paddingHorizontal: spacing.md },
  iconTile: {
    width: designPx(72),
    height: designPx(72),
    borderRadius: radius.xl - designPx(4),
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { textAlign: 'center' },
  action: { alignSelf: 'stretch', marginTop: spacing.sm },
});
