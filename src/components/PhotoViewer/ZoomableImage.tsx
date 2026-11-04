import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  GestureResponderEvent,
  Image,
  Pressable,
  View,
} from 'react-native';
import { colors } from '../../theme';
import { AppText } from '../AppText';
import { Icon } from '../Icon';
import { styles } from './styles';
import { useZoomGestures } from './useZoomGestures';

const DOUBLE_TAP_MS = 280;

interface ZoomableImageProps {
  uri: string;
  label: string;
  width: number;
  height: number;
  onTap: () => void;
  onZoomChange: (zoomed: boolean) => void;
}

/** One full-screen photo: pinch or double-tap to zoom, drag to look around, single tap for `onTap`. */
export function ZoomableImage({
  uri,
  label,
  width,
  height,
  onTap,
  onZoomChange,
}: ZoomableImageProps) {
  const { panHandlers, transform, toggleZoom } = useZoomGestures({
    width,
    height,
    onZoomChange,
  });
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>(
    'loading',
  );
  const lastTap = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(tapTimer.current), []);

  const handlePress = (event: GestureResponderEvent) => {
    const now = Date.now();
    if (now - lastTap.current < DOUBLE_TAP_MS) {
      lastTap.current = 0;
      clearTimeout(tapTimer.current);
      toggleZoom(event.nativeEvent.pageX, event.nativeEvent.pageY);
      return;
    }
    lastTap.current = now;
    tapTimer.current = setTimeout(onTap, DOUBLE_TAP_MS);
  };

  return (
    <View {...panHandlers} style={{ width, height }}>
      <Pressable
        accessibilityRole="imagebutton"
        accessibilityLabel={label}
        accessibilityHint="Double tap to zoom"
        onPress={handlePress}
        style={styles.fill}
      >
        <Animated.View style={[styles.fill, { transform }]}>
          <Image
            source={{ uri }}
            resizeMode="contain"
            style={styles.fill}
            onLoad={() => setStatus('ready')}
            onError={() => setStatus('failed')}
          />
        </Animated.View>
        {status === 'loading' && (
          <View pointerEvents="none" style={styles.centered}>
            <ActivityIndicator color={colors.white} />
          </View>
        )}
        {status === 'failed' && (
          <View pointerEvents="none" style={styles.centered}>
            <Icon name="warning" size={30} color={colors.white} />
            <AppText variant="bodyStrong" color={colors.white}>
              This photo could not be loaded
            </AppText>
          </View>
        )}
      </Pressable>
    </View>
  );
}
