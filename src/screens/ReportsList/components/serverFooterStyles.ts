import { StyleSheet } from 'react-native';
import { colors, radius } from '../../../theme';
import { designPx } from '../../../utils/responsiveUtils';

export const serverFooterStyles = StyleSheet.create({
  skeletons: { gap: designPx(10) },
  skeletonCard: {
    flexDirection: 'row',
    gap: designPx(12),
    padding: designPx(10),
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  skeletonThumb: {
    width: designPx(56),
    height: designPx(56),
    margin: designPx(10),
  },
  skeletonBody: { flex: 1, gap: designPx(8), justifyContent: 'center' },
  lineLong: { width: '92%', height: 12, borderRadius: 6 },
  lineShort: { width: '60%', height: 12, borderRadius: 6 },
  chip: { width: '36%', height: 22, borderRadius: 11 },
});
