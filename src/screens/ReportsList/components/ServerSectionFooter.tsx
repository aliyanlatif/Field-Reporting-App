import { View } from 'react-native';
import {
  AppText,
  PressableScale,
  Skeleton,
  StateMessage,
} from '../../../components';
import { colors } from '../../../theme';
import { serverFooterStyles as styles } from './serverFooterStyles';

interface ServerSectionFooterProps {
  loadingFirstTime: boolean;
  loaded: boolean;
  error: string | null;
  onRetry: () => void;
}

const SKELETON_ROWS = [0, 1, 2];

export function ServerSectionFooter({
  loadingFirstTime,
  loaded,
  error,
  onRetry,
}: ServerSectionFooterProps) {
  if (loadingFirstTime) {
    return (
      <View
        accessibilityLabel="Loading reports"
        accessibilityLiveRegion="polite"
        style={styles.skeletons}
      >
        {SKELETON_ROWS.map(row => (
          <View key={row} style={styles.skeletonCard}>
            <Skeleton style={styles.skeletonThumb} />
            <View style={styles.skeletonBody}>
              <Skeleton style={styles.lineLong} />
              <Skeleton style={styles.lineShort} />
              <Skeleton style={styles.chip} />
            </View>
          </View>
        ))}
      </View>
    );
  }
  if (!loaded && error) {
    return (
      <StateMessage
        compact
        icon="offline"
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
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Try again"
          onPress={onRetry}
          style={styles.retry}
        >
          <AppText variant="captionStrong" color={colors.primaryStrong}>
            Try again
          </AppText>
        </PressableScale>
      </View>
    );
  }
  return null;
}
