import { useEffect, useRef, useState } from 'react';
import { Animated, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { colors, duration, easeOutBack } from '../../theme';
import { ToastMessage, useToastStore } from '../../stores/toastStore';
import { runTiming } from '../../utils/motion';
import { designPx } from '../../utils/responsiveUtils';
import { AppText } from '../AppText';
import { styles } from './styles';

const VISIBLE_MS = 3200;
const VISIBLE_ERROR_MS = 5000;

const background = {
  ok: colors.success,
  bad: colors.danger,
  amber: colors.warning,
  neutral: colors.ink,
} as const;

/** Mount once, near the app root. Shows whatever `showToast` was last called with. */
export function ToastHost() {
  const incoming = useToastStore(state => state.toast);
  const hide = useToastStore(state => state.hide);
  const reduced = useReducedMotion();
  const { top } = useSafeAreaInsets();
  const [shown, setShown] = useState<ToastMessage | null>(null);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!incoming) {
      return;
    }
    setShown(incoming);
    progress.setValue(0);
    runTiming(progress, 1, {
      duration: 400,
      easing: easeOutBack,
      reduced,
    }).start();
    const timer = setTimeout(
      () => {
        runTiming(progress, 0, { duration: duration.base, reduced }).start(
          ({ finished }) => finished && hide(),
        );
      },
      incoming.kind === 'bad' ? VISIBLE_ERROR_MS : VISIBLE_MS,
    );
    return () => clearTimeout(timer);
  }, [hide, incoming, progress, reduced]);

  if (!shown) {
    return null;
  }

  return (
    <View
      pointerEvents="none"
      style={[styles.layer, { paddingTop: top + designPx(12) }]}
    >
      <Animated.View
        accessibilityLiveRegion="polite"
        style={[
          styles.toast,
          {
            backgroundColor: background[shown.kind],
            opacity: progress,
            transform: [
              {
                translateY: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-16, 0],
                }),
              },
              {
                scale: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.97, 1],
                }),
              },
            ],
          },
        ]}
      >
        <AppText variant="bodyStrong" color={colors.white}>
          {shown.text}
        </AppText>
      </Animated.View>
    </View>
  );
}
