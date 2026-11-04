import { StyleSheet } from 'react-native';
import { colors } from '../../theme';
import { designPx } from '../../utils/responsiveUtils';

export const styles = StyleSheet.create({
  root: { flex: 1 },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: colors.ink },
  fill: { width: '100%', height: '100%' },
  centered: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: designPx(10),
  },
  chrome: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: designPx(14),
  },
  round: {
    width: designPx(44),
    height: designPx(44),
    borderRadius: designPx(22),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  counter: {
    paddingVertical: designPx(8),
    paddingHorizontal: designPx(14),
    borderRadius: designPx(18),
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  spacer: { width: designPx(44) },
});
