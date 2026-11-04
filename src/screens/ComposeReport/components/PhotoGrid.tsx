import { useEffect, useRef } from 'react';
import { Animated, Image, View } from 'react-native';
import { AppText, Icon, PressableScale } from '../../../components';
import { MAX_IMAGES_PER_REPORT } from '../../../config';
import { useLoop, useReducedMotion } from '../../../hooks';
import { colors, easeOutBack } from '../../../theme';
import { describeShrink } from '../../../utils/formatBytes';
import { runTiming } from '../../../utils/motion';
import { DraftImage } from '../hooks/useComposeDraft';
import { photoGridStyles as styles } from './photoGridStyles';

interface PhotoGridProps {
  images: DraftImage[];
  onAdd: () => void;
  onRemove: (key: string) => void;
}

function FilledTile({
  entry,
  index,
  onRemove,
}: {
  entry: DraftImage;
  index: number;
  onRemove: (key: string) => void;
}) {
  const reduced = useReducedMotion();
  const pop = useRef(new Animated.Value(0)).current;
  const breath = useLoop(entry.status === 'processing', {
    duration: 600,
    reverse: true,
  });

  useEffect(() => {
    runTiming(pop, 1, { duration: 450, easing: easeOutBack, reduced }).start();
  }, [pop, reduced]);

  return (
    <Animated.View
      style={[
        styles.slot,
        entry.status === 'error' && styles.errorSlot,
        {
          opacity: pop,
          transform: [
            {
              scale: pop.interpolate({
                inputRange: [0, 1],
                outputRange: [0.7, 1],
              }),
            },
          ],
        },
      ]}
    >
      {entry.status === 'ready' && (
        <>
          <Image
            source={{ uri: entry.image.localUri }}
            style={styles.image}
            accessibilityLabel={`Photo ${index + 1}`}
          />
          <View style={styles.sizeChip}>
            <AppText
              variant="captionStrong"
              color={colors.white}
              numberOfLines={1}
            >
              {describeShrink(
                entry.image.originalSizeBytes,
                entry.image.sizeBytes,
              )}
            </AppText>
          </View>
        </>
      )}
      {entry.status === 'processing' && (
        <Animated.View
          style={[
            styles.busy,
            {
              opacity: breath.interpolate({
                inputRange: [0, 1],
                outputRange: [0.75, 1],
              }),
            },
          ]}
        >
          <AppText variant="captionStrong" color={colors.white}>
            Processing…
          </AppText>
        </Animated.View>
      )}
      {entry.status === 'error' && (
        <View style={styles.centered}>
          <AppText
            variant="captionStrong"
            color={colors.danger}
            style={styles.errorText}
          >
            {entry.message}
          </AppText>
        </View>
      )}
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={`Remove photo ${index + 1}`}
        hitSlop={12}
        onPress={() => onRemove(entry.key)}
        scaleTo={0.85}
        style={styles.remove}
      >
        <Icon name="close" size={16} color={colors.white} />
      </PressableScale>
    </Animated.View>
  );
}

/** Five photo slots and a counter. Empty slots open the add-photo sheet. */
export function PhotoGrid({ images, onAdd, onRemove }: PhotoGridProps) {
  const emptySlots = Math.max(0, MAX_IMAGES_PER_REPORT - images.length);

  return (
    <View style={styles.grid}>
      {images.map((entry, index) => (
        <View key={entry.key} style={styles.cell}>
          <FilledTile entry={entry} index={index} onRemove={onRemove} />
        </View>
      ))}
      {Array.from({ length: emptySlots }, (_, offset) => (
        <View key={`empty-${offset}`} style={styles.cell}>
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel={`Add photo ${images.length + offset + 1}`}
            onPress={onAdd}
            scaleTo={0.94}
            style={[styles.slot, styles.empty]}
          >
            <Icon name="plus" size={26} color={colors.textSecondary} />
          </PressableScale>
        </View>
      ))}
      <View style={styles.cell}>
        <View
          style={styles.counter}
          accessible
          accessibilityLabel={`${images.length} of ${MAX_IMAGES_PER_REPORT} photos`}
        >
          <AppText variant="title" style={styles.counterValue}>
            {images.length}/{MAX_IMAGES_PER_REPORT}
          </AppText>
          <AppText variant="captionStrong" color={colors.textSecondary}>
            photos
          </AppText>
        </View>
      </View>
    </View>
  );
}
