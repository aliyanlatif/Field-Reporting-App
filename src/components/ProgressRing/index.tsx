import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../../theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const STROKE = 4;

const styles = StyleSheet.create({ ring: { position: 'absolute' } });

interface ProgressRingProps {
  size: number;
  /** 0 to 1 */
  progress: number;
}

/** A ring that fills as a report's photos are sent. Eases between updates so it never jumps. */
export function ProgressRing({ size, progress }: ProgressRingProps) {
  const radius = (size - STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = useRef(new Animated.Value(progress)).current;

  useEffect(() => {
    Animated.timing(filled, {
      toValue: progress,
      duration: 250,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, [filled, progress]);

  return (
    <Svg
      width={size}
      height={size}
      style={styles.ring}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={colors.border}
        strokeWidth={STROKE}
        fill="none"
      />
      <AnimatedCircle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={colors.primary}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={filled.interpolate({
          inputRange: [0, 1],
          outputRange: [circumference, 0],
        })}
        fill="none"
        rotation={-90}
        origin={`${size / 2}, ${size / 2}`}
      />
    </Svg>
  );
}
