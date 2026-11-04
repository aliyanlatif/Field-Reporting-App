import { StyleSheet } from 'react-native';
import { spacing } from '../../theme';
import { designPx } from '../../utils/responsiveUtils';

export const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: spacing.sm,
    paddingLeft: designPx(8),
    paddingRight: spacing.md,
  },
  title: { flex: 1 },
  deleting: {
    width: designPx(52),
    height: designPx(52),
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { paddingBottom: designPx(40) },
  body: { paddingHorizontal: spacing.md, gap: designPx(10) },
  hint: { marginTop: spacing.sm, marginHorizontal: designPx(20) + 2 },
  description: {
    marginTop: designPx(4),
    marginHorizontal: 2,
    letterSpacing: -0.19,
  },
  chip: { marginHorizontal: 2 },
  timeline: { marginVertical: spacing.sm },
  actions: { gap: designPx(10) },
  note: {
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
});
