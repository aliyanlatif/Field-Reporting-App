import { ActivityIndicator, View } from 'react-native';
import { colors } from '../../theme';
import { AppText } from '../AppText';
import { Button } from '../Button';
import { styles } from './styles';

interface StateMessageProps {
  title: string;
  message?: string;
  loading?: boolean;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
}

export function StateMessage({
  title,
  message,
  loading,
  actionLabel,
  onAction,
  compact,
}: StateMessageProps) {
  return (
    <View style={[styles.container, compact ? styles.compact : styles.fill]}>
      {loading && <ActivityIndicator color={colors.primary} />}
      <AppText variant="heading" style={styles.text}>
        {title}
      </AppText>
      {message && (
        <AppText color={colors.textSecondary} style={styles.text}>
          {message}
        </AppText>
      )}
      {actionLabel && onAction && (
        <View style={styles.action}>
          <Button variant="secondary" label={actionLabel} onPress={onAction} />
        </View>
      )}
    </View>
  );
}
