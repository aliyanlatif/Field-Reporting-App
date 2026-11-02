import { StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';
import { designPx } from '../../utils/responsiveUtils';

export const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { gap: spacing.lg, paddingBottom: spacing.lg },
  field: { gap: spacing.sm },
  input: {
    ...typography.body,
    minHeight: designPx(120),
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
  },
  inputError: { borderColor: colors.danger },
  photosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  actions: { flexDirection: 'row', gap: spacing.sm },
  action: { flex: 1 },
  footer: { gap: spacing.sm, paddingTop: spacing.md },
  hint: { textAlign: 'center' },
});
