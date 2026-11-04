import { View } from 'react-native';
import { Skeleton, StateMessage } from '../../../components';
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
  return null;
}
