import { Image, Pressable, View } from 'react-native';
import { ReportListItem } from '../../features/reports';
import { colors } from '../../theme';
import { formatTimestamp } from '../../utils/formatDate';
import { AppText } from '../AppText';
import { Button } from '../Button';
import { StatusBadge } from '../StatusBadge';
import { styles } from './styles';

interface ReportCardProps {
  item: ReportListItem;
  onPress: () => void;
  onRetry: () => void;
}

export function ReportCard({ item, onPress, onRetry }: ReportCardProps) {
  const photos = item.imageCount;

  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${item.description}. ${item.badge.label}`}
        onPress={onPress}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      >
        {item.imageUris[0] ? (
          <Image source={{ uri: item.imageUris[0] }} style={styles.thumbnail} />
        ) : (
          <View style={styles.thumbnail} />
        )}
        <View style={styles.body}>
          <AppText numberOfLines={2}>{item.description}</AppText>
          <AppText variant="caption" color={colors.textSecondary}>
            {photos === 1 ? '1 photo' : `${photos} photos`} ·{' '}
            {formatTimestamp(item.createdAt)}
          </AppText>
          <StatusBadge badge={item.badge} />
        </View>
      </Pressable>
      {item.failed && (
        <Button variant="secondary" label="Retry sending" onPress={onRetry} />
      )}
    </View>
  );
}
