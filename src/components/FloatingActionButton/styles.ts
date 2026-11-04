import { StyleSheet } from 'react-native';
import { colors, radius, shadows, spacing } from '../../theme';
import { designPx } from '../../utils/responsiveUtils';

export const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    left: spacing.lg - designPx(4),
    right: spacing.lg - designPx(4),
    bottom: spacing.lg,
    height: designPx(58),
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: designPx(10),
    ...shadows.floating,
  },
});
