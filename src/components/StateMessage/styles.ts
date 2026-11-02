import { StyleSheet } from 'react-native';
import { spacing } from '../../theme';

export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  fill: { flex: 1, padding: spacing.lg },
  compact: { paddingVertical: spacing.lg },
  text: { textAlign: 'center' },
  action: { alignSelf: 'stretch', marginTop: spacing.sm },
});
