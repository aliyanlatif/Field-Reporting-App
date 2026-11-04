import { StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../../../theme';
import { designPx } from '../../../utils/responsiveUtils';

export const cameraNoticeStyles = StyleSheet.create({
  container: {
    gap: designPx(10),
    marginTop: spacing.sm + designPx(4),
    padding: designPx(14),
    borderRadius: radius.lg - 2,
    backgroundColor: colors.warningSurface,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: designPx(12) },
  text: { flex: 1, gap: 2 },
});
