import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { QueueSummary } from '../../features/reports';
import { useLoop } from '../../hooks/useLoop';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { colors, easeOutBack, Tone, tones } from '../../theme';
import { runTiming } from '../../utils/motion';
import { AppText } from '../AppText';
import { Icon, IconName } from '../Icon';
import { styles } from './styles';

const toneIcon: Record<Tone, IconName> = {
  ok: 'check',
  send: 'arrowUp',
  wait: 'clock',
  amber: 'phone',
  bad: 'warning',
};

/** The one-glance answer at the top of the list: is my work safe? */
export function StatusCard({ tone, title, subtitle }: QueueSummary) {
  const palette = tones[tone];
  const reduced = useReducedMotion();
  const bob = useLoop(tone === 'send', { duration: 550, reverse: true });
  const pop = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    pop.setValue(0.6);
    runTiming(pop, 1, {
      duration: 500,
      easing: easeOutBack,
      reduced,
    }).start();
  }, [pop, reduced, tone]);

  return (
    <View style={styles.card}>
      <View style={[styles.iconTile, { backgroundColor: palette.background }]}>
        <Animated.View
          style={{
            opacity: pop.interpolate({
              inputRange: [0.6, 1],
              outputRange: [0.2, 1],
            }),
            transform: [
              { scale: pop },
              {
                translateY: bob.interpolate({
                  inputRange: [0, 1],
                  outputRange: [2, -3],
                }),
              },
            ],
          }}
        >
          <Icon name={toneIcon[tone]} color={palette.foreground} />
        </Animated.View>
      </View>
      <View style={styles.text}>
        <AppText
          variant="bodyStrong"
          accessibilityRole="header"
          accessibilityLiveRegion="polite"
          style={styles.title}
        >
          {title}
        </AppText>
        <AppText variant="caption" color={colors.textSecondary}>
          {subtitle}
        </AppText>
      </View>
    </View>
  );
}
