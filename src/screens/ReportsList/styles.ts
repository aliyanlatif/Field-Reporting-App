import { StyleSheet } from 'react-native';
import { spacing } from '../../theme';
import { designPx } from '../../utils/responsiveUtils';

export const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    paddingLeft: spacing.lg - designPx(4),
    paddingRight: designPx(10),
  },
  actions: { flexDirection: 'row' },
  list: { flex: 1 },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: designPx(120),
  },
  separator: { height: designPx(10) },
  sectionGap: { height: designPx(10) },
});
