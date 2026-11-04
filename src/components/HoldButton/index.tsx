import { useRef, useState } from 'react';
import { Animated, Easing, LayoutChangeEvent, View } from 'react-native';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { colors } from '../../theme';
import { AppText } from '../AppText';
import { Icon, IconName } from '../Icon';
import { PressableScale } from '../PressableScale';
import { styles } from './styles';

interface HoldButtonProps {
  label: string;
  holdingLabel: string;
  icon: IconName;
  onComplete: () => void;
  holdMs?: number;
  disabled?: boolean;
  /** Greyed out but still pressable: a press calls `onBlocked` to explain why nothing happens. */
  dimmed?: boolean;
  onBlocked?: () => void;
}

/** A destructive action that only fires after the finger stays down, so it can never happen by accident. */
export function HoldButton({
  label,
  holdingLabel,
  icon,
  onComplete,
  holdMs = 1000,
  disabled = false,
  dimmed = false,
  onBlocked,
}: HoldButtonProps) {
  const reduced = useReducedMotion();
  const fill = useRef(new Animated.Value(0)).current;
  const [width, setWidth] = useState(0);
  const [holding, setHolding] = useState(false);

  const start = () => {
    if (disabled) {
      return;
    }
    if (dimmed) {
      onBlocked?.();
      return;
    }
    setHolding(true);
    Animated.timing(fill, {
      toValue: 1,
      duration: reduced ? Math.min(holdMs, 400) : holdMs,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setHolding(false);
        fill.setValue(0);
        onComplete();
      }
    });
  };

  const cancel = () => {
    setHolding(false);
    Animated.timing(fill, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  };

  const contentColor = dimmed ? colors.disabledText : colors.dangerDeep;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint="Press and hold to confirm"
      accessibilityActions={[{ name: 'activate', label }]}
      onAccessibilityAction={dimmed ? onBlocked : onComplete}
      accessibilityState={{ disabled: disabled || dimmed }}
      onPressIn={start}
      onPressOut={cancel}
      scaleTo={0.985}
      onLayout={(event: LayoutChangeEvent) =>
        setWidth(event.nativeEvent.layout.width)
      }
      style={[styles.button, dimmed && styles.dimmed]}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.fill,
          {
            transform: [
              {
                translateX: fill.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-width, 0],
                }),
              },
            ],
          },
        ]}
      />
      <View style={styles.content}>
        <Icon name={icon} color={contentColor} />
        <AppText variant="button" color={contentColor}>
          {holding ? holdingLabel : label}
        </AppText>
      </View>
    </PressableScale>
  );
}
