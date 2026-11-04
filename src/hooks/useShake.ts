import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { duration } from '../theme';
import { useReducedMotion } from './useReducedMotion';

/** Shakes sideways each time `trigger` changes, to say "not yet" without a dialog. */
export function useShake(trigger: number) {
  const offset = useRef(new Animated.Value(0)).current;
  const reduced = useReducedMotion();

  useEffect(() => {
    if (trigger === 0 || reduced) {
      return;
    }
    const step = (toValue: number, ms: number) =>
      Animated.timing(offset, { toValue, duration: ms, useNativeDriver: true });
    const unit = duration.shake / 5;
    Animated.sequence([
      step(-7, unit),
      step(7, unit),
      step(-4, unit),
      step(4, unit),
      step(0, unit),
    ]).start();
  }, [offset, reduced, trigger]);

  return { transform: [{ translateX: offset }] };
}
