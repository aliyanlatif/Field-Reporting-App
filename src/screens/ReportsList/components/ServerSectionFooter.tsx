import { Pressable, View } from 'react-native';
import { AppText, StateMessage } from '../../../components';
import { colors } from '../../../theme';
import { serverFooterStyles as styles } from './serverFooterStyles';

interface ServerSectionFooterProps {
  loadingFirstTime: boolean;
  loaded: boolean;
  error: string | null;
  isEmpty: boolean;
  onRetry: () => void;
}

export function ServerSectionFooter({
  loadingFirstTime,
  loaded,
  error,
  isEmpty,
  onRetry,
}: ServerSectionFooterProps) {
  if (loadingFirstTime) {
    return <StateMessage compact loading title="Loading reports" />;
  }
  if (!loaded && error) {
    return (
      <StateMessage
        compact
        title="Could not load reports from the server"
        message={error}
        actionLabel="Try again"
        onAction={onRetry}
      />
    );
  }
  if (loaded && error) {
    return (
      <View style={styles.staleRow}>
        <AppText
          variant="caption"
          color={colors.textSecondary}
          style={styles.staleText}
        >
          {error}. Showing the last list from the server.
        </AppText>
        <Pressable
          accessibilityRole="button"
          onPress={onRetry}
          style={styles.retry}
        >
          <AppText
            variant="caption"
            color={colors.primary}
            style={styles.retryLabel}
          >
            Try again
          </AppText>
        </Pressable>
      </View>
    );
  }
  return loaded && isEmpty ? (
    <AppText>Nothing on the server yet.</AppText>
  ) : null;
}
