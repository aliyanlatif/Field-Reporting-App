import { ActivityIndicator, Image, Pressable, View } from 'react-native';
import { AppText } from '../../../components';
import { colors } from '../../../theme';
import { DraftImage } from '../hooks/useComposeDraft';
import { photoGridStyles as styles } from './photoGridStyles';

interface PhotoGridProps {
  images: DraftImage[];
  onRemove: (key: string) => void;
}

export function PhotoGrid({ images, onRemove }: PhotoGridProps) {
  return (
    <View style={styles.grid}>
      {images.map((entry, index) => (
        <View
          key={entry.key}
          style={[styles.tile, entry.status === 'error' && styles.errorTile]}
        >
          {entry.status === 'ready' && (
            <Image
              source={{ uri: entry.image.localUri }}
              style={styles.image}
              accessibilityLabel={`Photo ${index + 1}`}
            />
          )}
          {entry.status === 'processing' && (
            <View style={styles.centered}>
              <ActivityIndicator color={colors.primary} />
              <AppText variant="caption" color={colors.textSecondary}>
                Processing
              </AppText>
            </View>
          )}
          {entry.status === 'error' && (
            <View style={styles.centered}>
              <AppText
                variant="caption"
                color={colors.danger}
                style={styles.errorText}
              >
                {entry.message}
              </AppText>
            </View>
          )}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Remove photo ${index + 1}`}
            hitSlop={8}
            onPress={() => onRemove(entry.key)}
            style={styles.remove}
          >
            <AppText variant="button" color={colors.textOnPrimary}>
              ×
            </AppText>
          </Pressable>
        </View>
      ))}
    </View>
  );
}
