import { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  GestureResponderEvent,
  NativeTouchEvent,
  PanResponder,
  PanResponderGestureState,
} from 'react-native';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { duration, easeOutSoft } from '../../theme';
import {
  clampOffset,
  clampScale,
  DOUBLE_TAP_SCALE,
  offsetAfterZoom,
  ZOOMED_ABOVE,
} from './zoomMath';

interface Options {
  width: number;
  height: number;
  onZoomChange: (zoomed: boolean) => void;
}

interface Transform {
  scale: number;
  x: number;
  y: number;
}

interface Anchor extends Transform {
  touches: number;
  distance: number;
  focalX: number;
  focalY: number;
  dx: number;
  dy: number;
}

type Touches = readonly NativeTouchEvent[];

const distanceBetween = (touches: Touches) =>
  Math.hypot(
    touches[0].pageX - touches[1].pageX,
    touches[0].pageY - touches[1].pageY,
  );

/** Pinch, drag and double-tap zoom for one photo, using only Animated values so it runs on the UI thread. */
export function useZoomGestures({ width, height, onZoomChange }: Options) {
  const reduced = useReducedMotion();
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const current = useRef<Transform>({ scale: 1, x: 0, y: 0 });
  const anchor = useRef<Anchor | null>(null);
  const zoomed = useRef(false);
  const onZoomChangeRef = useRef(onZoomChange);
  onZoomChangeRef.current = onZoomChange;

  const show = (next: Transform) => {
    current.current = next;
    scale.setValue(next.scale);
    translateX.setValue(next.x);
    translateY.setValue(next.y);
    const isZoomed = next.scale > ZOOMED_ABOVE;
    if (isZoomed !== zoomed.current) {
      zoomed.current = isZoomed;
      onZoomChangeRef.current(isZoomed);
    }
  };

  const animateTo = (next: Transform) => {
    current.current = next;
    const isZoomed = next.scale > ZOOMED_ABOVE;
    if (isZoomed !== zoomed.current) {
      zoomed.current = isZoomed;
      onZoomChangeRef.current(isZoomed);
    }
    const config = {
      duration: reduced ? 0 : duration.fast + 60,
      easing: easeOutSoft,
      useNativeDriver: true,
    };
    Animated.parallel([
      Animated.timing(scale, { ...config, toValue: next.scale }),
      Animated.timing(translateX, { ...config, toValue: next.x }),
      Animated.timing(translateY, { ...config, toValue: next.y }),
    ]).start();
  };

  const settle = (next: Transform): Transform => {
    const nextScale = next.scale < ZOOMED_ABOVE ? 1 : next.scale;
    return {
      scale: nextScale,
      x: clampOffset(next.x, nextScale, width),
      y: clampOffset(next.y, nextScale, height),
    };
  };

  const move = (touches: Touches, gesture: PanResponderGestureState) => {
    const pinching = touches.length >= 2;
    const focalX = pinching
      ? (touches[0].pageX + touches[1].pageX) / 2 - width / 2
      : 0;
    const focalY = pinching
      ? (touches[0].pageY + touches[1].pageY) / 2 - height / 2
      : 0;

    if (!anchor.current || anchor.current.touches !== touches.length) {
      anchor.current = {
        ...current.current,
        touches: touches.length,
        distance: pinching ? distanceBetween(touches) : 0,
        focalX,
        focalY,
        dx: gesture.dx,
        dy: gesture.dy,
      };
    }
    const start = anchor.current;

    if (pinching) {
      const nextScale = clampScale(
        (start.scale * distanceBetween(touches)) / start.distance,
      );
      show({
        scale: nextScale,
        x:
          offsetAfterZoom(start.x, start.focalX, start.scale, nextScale) +
          (focalX - start.focalX),
        y:
          offsetAfterZoom(start.y, start.focalY, start.scale, nextScale) +
          (focalY - start.focalY),
      });
    } else if (start.scale > ZOOMED_ABOVE) {
      show({
        scale: start.scale,
        x: clampOffset(start.x + gesture.dx - start.dx, start.scale, width),
        y: clampOffset(start.y + gesture.dy - start.dy, start.scale, height),
      });
    }
  };

  const finish = () => {
    anchor.current = null;
    animateTo(settle(current.current));
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponderCapture: (event: GestureResponderEvent) =>
          event.nativeEvent.touches.length >= 2,
        onMoveShouldSetPanResponderCapture: (event: GestureResponderEvent) =>
          event.nativeEvent.touches.length >= 2 ||
          current.current.scale > ZOOMED_ABOVE,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: () => {
          anchor.current = null;
        },
        onPanResponderMove: (event, gesture) =>
          move(event.nativeEvent.touches, gesture),
        onPanResponderRelease: finish,
        onPanResponderTerminate: finish,
      }),
    // The handlers only read refs and the latest size, so they are rebuilt just when the size changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [width, height, reduced],
  );

  /** Zooms in around a tapped point, or back out when already zoomed. `pageX`/`pageY` are screen coordinates. */
  const toggleZoom = (pageX: number, pageY: number) => {
    if (current.current.scale > ZOOMED_ABOVE) {
      animateTo({ scale: 1, x: 0, y: 0 });
      return;
    }
    const focalX = pageX - width / 2;
    const focalY = pageY - height / 2;
    animateTo(
      settle({
        scale: DOUBLE_TAP_SCALE,
        x: offsetAfterZoom(0, focalX, 1, DOUBLE_TAP_SCALE),
        y: offsetAfterZoom(0, focalY, 1, DOUBLE_TAP_SCALE),
      }),
    );
  };

  useEffect(
    () => () => {
      scale.stopAnimation();
      translateX.stopAnimation();
      translateY.stopAnimation();
    },
    [scale, translateX, translateY],
  );

  return {
    panHandlers: panResponder.panHandlers,
    transform: [{ translateX }, { translateY }, { scale }],
    toggleZoom,
  };
}
