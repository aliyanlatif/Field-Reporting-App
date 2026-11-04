import { StyleSheet } from 'react-native';
import { colors, radius, typography } from '../../theme';
import { designPx } from '../../utils/responsiveUtils';

export const styles = StyleSheet.create({
  field: {
    ...typography.body,
    height: designPx(104),
    paddingVertical: designPx(14),
    paddingHorizontal: designPx(16),
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    color: colors.ink,
  },
  focused: { borderColor: colors.primary },
});
