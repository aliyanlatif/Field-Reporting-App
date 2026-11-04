import { ReactNode, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { colors, duration, easeOutSoft } from '../../theme';
import { runTiming } from '../../utils/motion';
import { styles } from './styles';

const DISMISS_DISTANCE = 90;
const DISMISS_VELOCITY = 0.9;

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  /** Spoken by screen readers when the sheet opens. */
  label: string;
  children: ReactNode;
}

/** Slides up over a dimmed screen. Closes by tapping outside, pulling down, or the back button. */
export function BottomSheet({
  visible,
  onClose,
  label,
  children,
}: BottomSheetProps) {
  const [mounted, setMounted] = useState(visible);
  const reduced = useReducedMotion();
  const { height: screenHeight } = useWindowDimensions();
  const { bottom } = useSafeAreaInsets();
  const progress = useRef(new Animated.Value(0)).current;
  const drag = useRef(new Animated.Value(0)).current;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      drag.setValue(0);
      runTiming(progress, 1, {
        duration: duration.sheet,
        easing: easeOutSoft,
        reduced,
      }).start();
    } else if (mounted) {
      runTiming(progress, 0, { duration: duration.base, reduced }).start(
        ({ finished }) => finished && setMounted(false),
      );
    }
  }, [drag, mounted, progress, reduced, visible]);

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, { dy }) => drag.setValue(Math.max(0, dy)),
      onPanResponderRelease: (_, { dy, vy }) => {
        if (dy > DISMISS_DISTANCE || vy > DISMISS_VELOCITY) {
          onCloseRef.current();
        } else {
          Animated.spring(drag, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
        }
      },
    }),
  ).current;

  return (
    <Modal
      transparent
      visible={mounted}
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={StyleSheet.absoluteFill}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: colors.scrim, opacity: progress },
          ]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            style={StyleSheet.absoluteFill}
            onPress={onClose}
          />
        </Animated.View>
        <Animated.View
          accessibilityViewIsModal
          accessibilityLabel={label}
          style={[
            styles.sheet,
            { paddingBottom: styles.sheet.paddingBottom + bottom },
            {
              transform: [
                {
                  translateY: Animated.add(
                    progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [screenHeight, 0],
                    }),
                    drag,
                  ),
                },
              ],
            },
          ]}
        >
          <View {...pan.panHandlers} style={styles.grabArea}>
            <View style={styles.grab} />
          </View>
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}
