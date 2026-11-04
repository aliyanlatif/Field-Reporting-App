import { Animated, StyleProp, ViewStyle } from 'react-native';
import { useLoop } from '../../hooks/useLoop';
import { styles } from './styles';

interface SkeletonProps {
  style?: StyleProp<ViewStyle>;
}

/** A placeholder block that breathes while content loads. */
export function Skeleton({ style }: SkeletonProps) {
  const breath = useLoop(true, { duration: 650, reverse: true });

  return (
    <Animated.View
      style={[
        styles.block,
        style,
        {
          opacity: breath.interpolate({
            inputRange: [0, 1],
            outputRange: [0.55, 1],
          }),
        },
      ]}
    />
  );
}
