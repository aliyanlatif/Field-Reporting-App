import { Easing } from 'react-native';

/** Durations in ms, matched to the design's transitions. */
export const duration = {
  press: 150,
  fast: 200,
  base: 350,
  sheet: 500,
  screen: 450,
  enter: 800,
  shake: 400,
} as const;

/** The design's cubic-bezier(.2,.85,.25,1): quick start, long soft landing. */
export const easeOutSoft = Easing.bezier(0.2, 0.85, 0.25, 1);

/** The design's cubic-bezier(.2,.9,.25,1.2): lands with a small overshoot. */
export const easeOutBack = Easing.bezier(0.2, 0.9, 0.25, 1.2);
