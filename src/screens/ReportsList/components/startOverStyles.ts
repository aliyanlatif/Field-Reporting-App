import { StyleSheet } from 'react-native';
import { spacing } from '../../../theme';
import { designPx } from '../../../utils/responsiveUtils';

export const startOverStyles = StyleSheet.create({
  title: { marginHorizontal: 2, marginBottom: spacing.xs },
  subtitle: { marginHorizontal: 2, marginBottom: spacing.md },
  options: { gap: designPx(10), marginBottom: spacing.sm - 2 },
  note: { textAlign: 'center', marginTop: designPx(10) },
});
