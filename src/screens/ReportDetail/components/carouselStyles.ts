import { StyleSheet } from 'react-native';
import { colors } from '../../../theme';
import { designPx } from '../../../utils/responsiveUtils';

export const TILE_WIDTH = designPx(310);
export const TILE_GAP = designPx(12);

export const carouselStyles = StyleSheet.create({
  content: { gap: TILE_GAP, paddingHorizontal: designPx(20) },
  tile: {
    width: TILE_WIDTH,
    height: designPx(290),
    borderRadius: designPx(28),
    overflow: 'hidden',
    backgroundColor: colors.borderStrong,
  },
  image: { width: '100%', height: '100%' },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: designPx(10),
    width: designPx(350),
  },
  badge: { position: 'absolute', top: designPx(14), left: designPx(14) },
  size: {
    position: 'absolute',
    left: designPx(14),
    bottom: designPx(16),
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(22, 33, 44, 0.62)',
  },
  barTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  barFill: { height: '100%', backgroundColor: colors.white },
});
