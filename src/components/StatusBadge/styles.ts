import { StyleSheet } from 'react-native';
import { radius, spacing } from '../../theme';
import { designPx } from '../../utils/responsiveUtils';

const DOT = designPx(8);

export const styles = StyleSheet.create({
  container: { gap: spacing.xs, alignItems: 'flex-start' },
  chip: {
    maxWidth: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: designPx(7),
    paddingVertical: designPx(4),
    paddingLeft: designPx(8),
    paddingRight: designPx(10),
    borderRadius: radius.sm,
  },
  dotBox: { width: DOT, height: DOT },
  dot: { width: DOT, height: DOT, borderRadius: DOT / 2 },
  halo: {
    position: 'absolute',
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
  },
  // Never let the label shrink below its measured width: on Android a one-pixel rounding gap wraps it onto a hidden second line.
  label: { flexShrink: 0 },
});
