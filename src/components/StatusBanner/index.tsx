import { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { deriveBanner } from '../../features/reports';
import { useConnectivity } from '../../hooks/useConnectivity';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { colors, easeOutSoft } from '../../theme';
import { runTiming } from '../../utils/motion';
import { AppText } from '../AppText';
import { Icon } from '../Icon';
import { styles } from './styles';

const BACK_ONLINE_MS = 3000;

type Shown = { kind: 'offline' | 'back'; message: string };

/** Slides in from the top when the connection drops, and says so again briefly when it returns. */
export function StatusBanner() {
  const online = useConnectivity();
  const { top } = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const slide = useRef(new Animated.Value(0)).current;
  const wasOffline = useRef(false);
  const [shown, setShown] = useState<Shown | null>(null);

  useEffect(() => {
    const banner = deriveBanner(online);
    let hideTimer: ReturnType<typeof setTimeout> | undefined;

    if (banner) {
      wasOffline.current = true;
      setShown({ kind: 'offline', message: banner.message });
    } else if (wasOffline.current) {
      wasOffline.current = false;
      setShown({ kind: 'back', message: 'Back online.' });
      hideTimer = setTimeout(() => setShown(null), BACK_ONLINE_MS);
    }
    return () => {
      if (hideTimer) {
        clearTimeout(hideTimer);
      }
    };
  }, [online]);

  useEffect(() => {
    runTiming(slide, shown ? 1 : 0, {
      duration: 500,
      easing: easeOutSoft,
      reduced,
    }).start();
  }, [reduced, shown, slide]);

  const last = useRef<Shown | null>(null);
  if (shown) {
    last.current = shown;
  }
  const content = shown ?? last.current;
  if (!content) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="none"
      accessibilityLiveRegion="polite"
      style={[
        styles.banner,
        {
          top: top + 14,
          backgroundColor:
            content.kind === 'offline' ? colors.ink : colors.success,
          transform: [
            {
              translateY: slide.interpolate({
                inputRange: [0, 1],
                outputRange: [-160, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Icon
        name={content.kind === 'offline' ? 'offline' : 'check'}
        color={colors.white}
      />
      <AppText variant="bodyStrong" color={colors.white} style={styles.message}>
        {content.message}
      </AppText>
    </Animated.View>
  );
}
