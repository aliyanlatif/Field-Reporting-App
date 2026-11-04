import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { AppText, PressableScale } from '../../../components';
import { useReducedMotion } from '../../../hooks';
import { colors, duration, easeOutBack } from '../../../theme';
import { runTiming } from '../../../utils/motion';
import { radioStyles as styles } from './radioOptionStyles';

interface RadioOptionProps {
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}

export function RadioOption({
  title,
  description,
  selected,
  onPress,
}: RadioOptionProps) {
  const reduced = useReducedMotion();
  const dot = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    runTiming(dot, selected ? 1 : 0, {
      duration: duration.fast,
      easing: easeOutBack,
      reduced,
    }).start();
  }, [dot, reduced, selected]);

  return (
    <PressableScale
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      scaleTo={0.985}
      style={[styles.option, selected && styles.selected]}
    >
      <View style={[styles.radio, selected && styles.radioSelected]}>
        <Animated.View
          style={[styles.dot, { opacity: dot, transform: [{ scale: dot }] }]}
        />
      </View>
      <View style={styles.text}>
        <AppText variant="bodyStrong" color={colors.ink}>
          {title}
        </AppText>
        <AppText variant="caption" color={colors.textTertiary}>
          {description}
        </AppText>
      </View>
    </PressableScale>
  );
}
