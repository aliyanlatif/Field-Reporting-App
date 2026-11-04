import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { useReducedMotion } from './useReducedMotion';

interface LoopOptions {
  duration: number;
  /** Ping-pong between 0 and 1 instead of restarting at 0. */
  reverse?: boolean;
}

/** A 0 to 1 value that loops while `active`. Stays at rest when the user asked for reduced motion. */
export function useLoop(
  active: boolean,
  { duration, reverse = false }: LoopOptions,
) {
  const value = useRef(new Animated.Value(0)).current;
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!active || reduced) {
      value.setValue(0);
      return;
    }
    const step = Animated.timing(value, {
      toValue: 1,
      duration,
      easing: reverse ? Easing.inOut(Easing.ease) : Easing.out(Easing.quad),
      useNativeDriver: true,
    });
    const back = Animated.timing(value, {
      toValue: 0,
      duration,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    });
    const loop = Animated.loop(
      reverse
        ? Animated.sequence([step, back])
        : Animated.sequence([
            Animated.timing(value, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
            step,
          ]),
    );
    loop.start();
    return () => loop.stop();
  }, [active, duration, reduced, reverse, value]);

  return value;
}
