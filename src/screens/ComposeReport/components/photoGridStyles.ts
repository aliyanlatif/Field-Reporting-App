import { StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../../../theme';
import { designPx } from '../../../utils/responsiveUtils';

const REMOVE_SIZE = designPx(40);

export const photoGridStyles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tile: {
    width: '31.5%',
    aspectRatio: 1,
    borderRadius: radius.md,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  errorTile: { backgroundColor: colors.dangerSurface },
  image: { width: '100%', height: '100%' },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xs,
    gap: spacing.xs,
  },
  errorText: { textAlign: 'center' },
  remove: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: REMOVE_SIZE,
    height: REMOVE_SIZE,
    borderRadius: REMOVE_SIZE / 2,
    backgroundColor: 'rgba(20, 32, 43, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
