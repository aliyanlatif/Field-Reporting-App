import { StyleSheet } from 'react-native';
import { colors, fontFamily, radius, spacing } from '../../theme';
import { designPx } from '../../utils/responsiveUtils';

const NODE = designPx(18);

export const styles = StyleSheet.create({
  card: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.xl - designPx(4),
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  step: { flexDirection: 'row', gap: designPx(14) },
  rail: { width: designPx(20), alignItems: 'center', paddingTop: spacing.md },
  nodeBox: {
    width: NODE,
    height: NODE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  node: {
    width: NODE,
    height: NODE,
    borderRadius: NODE / 2,
    borderWidth: 2.5,
  },
  halo: {
    position: 'absolute',
    width: NODE,
    height: NODE,
    borderRadius: NODE / 2,
  },
  line: {
    flex: 1,
    width: 2.5,
    minHeight: designPx(22),
    marginTop: spacing.xs,
    backgroundColor: colors.borderStrong,
  },
  lineDone: { backgroundColor: '#2F9160' },
  text: {
    flex: 1,
    gap: 2,
    paddingTop: designPx(12),
    paddingBottom: designPx(14),
  },
  label: { fontFamily: fontFamily.extraBold, fontSize: designPx(15) },
  time: {
    maxWidth: designPx(96),
    paddingTop: designPx(14),
    textAlign: 'right',
  },
});
