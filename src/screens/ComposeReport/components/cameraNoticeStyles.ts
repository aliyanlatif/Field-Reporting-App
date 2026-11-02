import { StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../../../theme';

export const cameraNoticeStyles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.warningSurface,
  },
});
