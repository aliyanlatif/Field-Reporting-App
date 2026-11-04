import { Animated, Easing } from 'react-native';

interface TimingOptions {
  duration: number;
  easing?: (value: number) => number;
  delay?: number;
  /** Skips the animation when the user asked for reduced motion. */
  reduced?: boolean;
  /** Only transform and opacity can use the native driver. */
  native?: boolean;
}

/** One place that decides how the app animates, so reduced motion is honored everywhere. */
export const runTiming = (
  value: Animated.Value,
  toValue: number,
  {
    duration,
    easing = Easing.out(Easing.cubic),
    delay = 0,
    reduced = false,
    native = true,
  }: TimingOptions,
) =>
  Animated.timing(value, {
    toValue,
    duration: reduced ? 0 : duration,
    delay: reduced ? 0 : delay,
    easing,
    useNativeDriver: native,
  });
