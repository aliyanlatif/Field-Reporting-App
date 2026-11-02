import { StyleSheet } from 'react-native';
import { spacing, touchTarget } from '../../../theme';

export const serverFooterStyles = StyleSheet.create({
  staleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  staleText: { flex: 1 },
  retry: {
    minHeight: touchTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  retryLabel: { fontWeight: '600' },
});
