import { StyleSheet } from 'react-native';
import { colors, radius, shadows, spacing } from '../../theme';
import { designPx } from '../../utils/responsiveUtils';

export const THUMB_SIZE = designPx(76);
const COUNT = designPx(24);

export const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: designPx(12),
    paddingVertical: designPx(10),
    paddingLeft: spacing.sm,
    paddingRight: designPx(14),
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  thumb: { width: THUMB_SIZE, height: THUMB_SIZE, alignSelf: 'center' },
  tile: {
    position: 'absolute',
    top: designPx(10),
    left: designPx(10),
    right: designPx(10),
    bottom: designPx(10),
    borderRadius: designPx(14),
    overflow: 'hidden',
    backgroundColor: colors.borderStrong,
  },
  front: {},
  back: {
    opacity: 0.7,
    transform: [{ translateX: 6 }, { translateY: -5 }, { rotate: '8deg' }],
  },
  fill: { width: '100%', height: '100%' },
  count: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    minWidth: COUNT,
    height: COUNT,
    paddingHorizontal: 6,
    borderRadius: COUNT / 2,
    borderWidth: 2,
    borderColor: colors.surface,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    minWidth: 0,
    gap: 6,
    justifyContent: 'center',
    paddingTop: spacing.xs,
  },
});
