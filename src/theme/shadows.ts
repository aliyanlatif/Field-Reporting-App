import { Platform, ViewStyle } from 'react-native';

/**
 * iOS draws the design's soft shadow directly. Android only has `elevation`,
 * which is a fixed tone, so the values are picked to feel as close as possible.
 */
const shadow = (
  elevation: number,
  opacity: number,
  radius: number,
  offsetY: number,
): ViewStyle =>
  Platform.select<ViewStyle>({
    android: { elevation, shadowColor: '#16212C' },
    default: {
      shadowColor: '#16212C',
      shadowOpacity: opacity,
      shadowRadius: radius,
      shadowOffset: { width: 0, height: offsetY },
    },
  }) as ViewStyle;

export const shadows = {
  card: shadow(2, 0.1, 10, 4),
  raised: shadow(4, 0.14, 14, 7),
  floating: shadow(10, 0.3, 16, 9),
} as const;
