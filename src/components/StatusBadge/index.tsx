import { Animated, View } from 'react-native';
import { ReportBadge } from '../../features/reports';
import { useLoop } from '../../hooks/useLoop';
import { colors, tones } from '../../theme';
import { AppText } from '../AppText';
import { styles } from './styles';

interface StatusBadgeProps {
  badge: ReportBadge;
  /** Hide the failure reason. Cards show it on their own line. */
  compact?: boolean;
}

/** A status chip: a dot (pulsing while sending) and the label, in the tone's colors. */
export function StatusBadge({ badge, compact }: StatusBadgeProps) {
  const tone = tones[badge.tone];
  const pulse = useLoop(badge.tone === 'send', { duration: 1200 });

  return (
    <View style={styles.container}>
      <View style={[styles.chip, { backgroundColor: tone.background }]}>
        <View style={styles.dotBox}>
          <Animated.View
            style={[
              styles.halo,
              {
                backgroundColor: tone.dot,
                opacity: pulse.interpolate({
                  inputRange: [0, 1],
                  outputRange: [badge.tone === 'send' ? 0.5 : 0, 0],
                }),
                transform: [
                  {
                    scale: pulse.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 2.6],
                    }),
                  },
                ],
              },
            ]}
          />
          <View style={[styles.dot, { backgroundColor: tone.dot }]} />
        </View>
        <AppText
          variant="captionStrong"
          color={tone.foreground}
          numberOfLines={1}
          style={styles.label}
        >
          {badge.label}
        </AppText>
      </View>
      {!compact && badge.detail && (
        <AppText variant="caption" color={colors.textSecondary}>
          {badge.detail}
        </AppText>
      )}
    </View>
  );
}
