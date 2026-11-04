import { StyleSheet } from 'react-native';
import { colors } from '../../../theme';
import { designPx } from '../../../utils/responsiveUtils';

const REMOVE = designPx(28);

export const photoGridStyles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5 },
  cell: { width: '33.333%', padding: 5 },
  slot: {
    aspectRatio: 1,
    borderRadius: designPx(20),
    overflow: 'hidden',
    backgroundColor: colors.borderStrong,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.borderDashed,
    backgroundColor: 'transparent',
  },
  errorSlot: { backgroundColor: colors.dangerSurface },
  image: { width: '100%', height: '100%' },
  sizeChip: {
    position: 'absolute',
    left: 6,
    right: 6,
    bottom: 6,
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: colors.overlayDark,
  },
  busy: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(22, 33, 44, 0.5)',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  errorText: { textAlign: 'center' },
  remove: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: REMOVE,
    height: REMOVE,
    borderRadius: REMOVE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.overlayDark,
  },
  counter: {
    aspectRatio: 1,
    borderRadius: designPx(20),
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  counterValue: { fontSize: designPx(26), letterSpacing: -0.5 },
});
