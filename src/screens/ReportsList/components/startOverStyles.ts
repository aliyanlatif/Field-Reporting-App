import { StyleSheet } from 'react-native';
import { colors, radius, spacing, touchTarget } from '../../../theme';

export const startOverStyles = StyleSheet.create({
  button: {
    minHeight: touchTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(20, 32, 43, 0.5)',
  },
  card: {
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
});
