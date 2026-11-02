import { StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../../theme';

export const styles = StyleSheet.create({
  content: { gap: spacing.md, paddingBottom: spacing.lg },
  description: { marginTop: spacing.xs },
  photos: { gap: spacing.md },
  photo: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: radius.md,
    backgroundColor: colors.border,
  },
});
