import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  PanResponder,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { colors, duration, easeOutSoft } from '../../theme';
import { runTiming } from '../../utils/motion';
import { AppText } from '../AppText';
import { Icon } from '../Icon';
import { PressableScale } from '../PressableScale';
import { styles } from './styles';
import { ZoomableImage } from './ZoomableImage';

const DISMISS_DISTANCE = 110;
const DISMISS_VELOCITY = 1;

export interface ViewerPhoto {
  id: string;
  uri: string;
}

interface PhotoViewerProps {
  visible: boolean;
  photos: ViewerPhoto[];
  initialIndex: number;
  onClose: () => void;
}

/** Full-screen photos on a dark background: swipe between them, pinch or double-tap to zoom, swipe down to close. */
export function PhotoViewer({
  visible,
  photos,
  initialIndex,
  onClose,
}: PhotoViewerProps) {
  const { width, height } = useWindowDimensions();
  const { top } = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(visible);
  const [index, setIndex] = useState(initialIndex);
  const [zoomed, setZoomed] = useState(false);
  const [showChrome, setShowChrome] = useState(true);
  const progress = useRef(new Animated.Value(0)).current;
  const drag = useRef(new Animated.Value(0)).current;
  const chrome = useRef(new Animated.Value(1)).current;
  const zoomedRef = useRef(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  zoomedRef.current = zoomed;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      setIndex(initialIndex);
      setZoomed(false);
      setShowChrome(true);
      drag.setValue(0);
      chrome.setValue(1);
      runTiming(progress, 1, {
        duration: duration.base,
        easing: easeOutSoft,
        reduced,
      }).start();
    } else if (mounted) {
      runTiming(progress, 0, { duration: duration.fast, reduced }).start(
        ({ finished }) => finished && setMounted(false),
      );
    }
  }, [chrome, drag, initialIndex, mounted, progress, reduced, visible]);

  useEffect(() => {
    runTiming(chrome, showChrome ? 1 : 0, {
      duration: duration.fast,
      reduced,
    }).start();
  }, [chrome, reduced, showChrome]);

  const pullDown = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, { dx, dy }) =>
          !zoomedRef.current &&
          Math.abs(dy) > 10 &&
          Math.abs(dy) > Math.abs(dx) * 1.6,
        onPanResponderMove: (_, { dy }) => drag.setValue(dy),
        onPanResponderRelease: (_, { dy, vy }) => {
          if (
            Math.abs(dy) > DISMISS_DISTANCE ||
            Math.abs(vy) > DISMISS_VELOCITY
          ) {
            onCloseRef.current();
          } else {
            Animated.spring(drag, {
              toValue: 0,
              useNativeDriver: true,
              bounciness: 4,
            }).start();
          }
        },
        onPanResponderTerminate: () => {
          Animated.spring(drag, { toValue: 0, useNativeDriver: true }).start();
        },
      }),
    [drag],
  );

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(event.nativeEvent.contentOffset.x / width));
  };

  const backdropOpacity = Animated.multiply(
    progress,
    drag.interpolate({
      inputRange: [-height / 2, 0, height / 2],
      outputRange: [0.25, 1, 0.25],
      extrapolate: 'clamp',
    }),
  );

  return (
    <Modal
      transparent
      visible={mounted}
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.root} accessibilityViewIsModal>
        <Animated.View
          style={[styles.backdrop, { opacity: backdropOpacity }]}
        />
        <Animated.View
          {...pullDown.panHandlers}
          style={[
            styles.root,
            {
              opacity: progress,
              transform: [
                { translateY: drag },
                {
                  scale: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.94, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <FlatList
            data={photos}
            horizontal
            pagingEnabled
            scrollEnabled={!zoomed}
            showsHorizontalScrollIndicator={false}
            keyExtractor={photo => photo.id}
            initialScrollIndex={initialIndex}
            initialNumToRender={1}
            windowSize={3}
            getItemLayout={(_, position) => ({
              length: width,
              offset: width * position,
              index: position,
            })}
            onMomentumScrollEnd={handleScrollEnd}
            renderItem={({ item, index: position }) => (
              <ZoomableImage
                uri={item.uri}
                label={`Photo ${position + 1} of ${photos.length}`}
                width={width}
                height={height}
                onTap={() => setShowChrome(visibleNow => !visibleNow)}
                onZoomChange={setZoomed}
              />
            )}
          />
        </Animated.View>

        <Animated.View
          pointerEvents={showChrome ? 'box-none' : 'none'}
          style={[styles.chrome, { paddingTop: top + 10, opacity: chrome }]}
        >
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel="Close photo"
            onPress={onClose}
            scaleTo={0.9}
            style={styles.round}
          >
            <Icon name="close" color={colors.white} />
          </PressableScale>
          {photos.length > 1 && (
            <View style={styles.counter} accessibilityLiveRegion="polite">
              <AppText variant="captionStrong" color={colors.white}>
                {index + 1} of {photos.length}
              </AppText>
            </View>
          )}
          <View style={styles.spacer} />
        </Animated.View>
      </View>
    </Modal>
  );
}
