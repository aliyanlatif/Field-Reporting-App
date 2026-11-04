import { StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../../theme';
import { designPx } from '../../utils/responsiveUtils';

export const styles = StyleSheet.create({
  button: {
    height: designPx(58),
    borderRadius: radius.pill,
    overflow: 'hidden',
    justifyContent: 'center',
    backgroundColor: colors.dangerSurface,
  },
  fill: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.dangerFill,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
});
