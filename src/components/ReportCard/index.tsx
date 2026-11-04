import { useEffect, useRef } from 'react';
import { Animated, Image, View } from 'react-native';
import { ReportListItem } from '../../features/reports';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useReportProgress } from '../../hooks/useReportProgress';
import { colors, duration, easeOutBack } from '../../theme';
import { formatTimestamp } from '../../utils/formatDate';
import { runTiming } from '../../utils/motion';
import { AppText } from '../AppText';
import { PressableScale } from '../PressableScale';
import { ProgressRing } from '../ProgressRing';
import { StatusBadge } from '../StatusBadge';
import { styles, THUMB_SIZE } from './styles';

/** A report filed within this long ago slides in; older ones are simply there. */
const FRESH_WINDOW_MS = 4000;

interface ReportCardProps {
  item: ReportListItem;
  onPress: () => void;
}

const plural = (count: number) => (count === 1 ? '1 photo' : `${count} photos`);

export function ReportCard({ item, onPress }: ReportCardProps) {
  const reduced = useReducedMotion();
  const progress = useReportProgress(item);
  const entrance = useRef(
    new Animated.Value(Date.now() - item.createdAt < FRESH_WINDOW_MS ? 0 : 1),
  ).current;

  useEffect(() => {
    runTiming(entrance, 1, {
      duration: duration.enter,
      easing: easeOutBack,
      reduced,
    }).start();
  }, [entrance, reduced]);

  const when =
    item.stage === 'delivered' && item.completedAt
      ? `sent ${formatTimestamp(item.completedAt)}`
      : `saved ${formatTimestamp(item.createdAt)}`;

  return (
    <Animated.View
      style={{
        opacity: entrance.interpolate({
          inputRange: [0, 0.4, 1],
          outputRange: [0, 1, 1],
        }),
        transform: [
          {
            translateY: entrance.interpolate({
              inputRange: [0, 1],
              outputRange: [-40, 0],
            }),
          },
          {
            scale: entrance.interpolate({
              inputRange: [0, 1],
              outputRange: [0.94, 1],
            }),
          },
        ],
      }}
    >
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={`${item.description}. ${item.badge.label}. ${plural(
          item.imageCount,
        )}`}
        onPress={onPress}
        scaleTo={0.985}
        style={styles.card}
      >
        <View style={styles.thumb}>
          {item.imageCount > 1 && (
            <View style={[styles.tile, styles.back]}>
              <Image source={{ uri: item.imageUris[1] }} style={styles.fill} />
            </View>
          )}
          <View style={[styles.tile, styles.front]}>
            {item.imageUris[0] && (
              <Image source={{ uri: item.imageUris[0] }} style={styles.fill} />
            )}
          </View>
          {item.stage === 'sending' && (
            <ProgressRing size={THUMB_SIZE} progress={progress} />
          )}
          <View style={styles.count}>
            <AppText variant="captionStrong" color={colors.white}>
              {item.imageCount}
            </AppText>
          </View>
        </View>
        <View style={styles.body}>
          <AppText variant="bodyStrong" numberOfLines={2}>
            {item.description}
          </AppText>
          <StatusBadge badge={item.badge} />
          <AppText variant="caption" color={colors.textSecondary}>
            {plural(item.imageCount)} · {when}
          </AppText>
        </View>
      </PressableScale>
    </Animated.View>
  );
}
