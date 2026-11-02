import { Dimensions, PixelRatio } from 'react-native';

const DESIGN_FRAME_WIDTH = 390;
const TABLET_MIN_WIDTH = 600;
const SMALL_DEVICE_MAX_HEIGHT = 700;

const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

// The app is portrait-only, so the short edge is always the width.
const frameWidth = Math.min(windowWidth, windowHeight);
const frameHeight = Math.max(windowWidth, windowHeight);

const toNumber = (percent: number | string) =>
  typeof percent === 'string' ? parseFloat(percent) : percent;

const snap = (value: number) => PixelRatio.roundToNearestPixel(value);

export const isTablet = frameWidth >= TABLET_MIN_WIDTH;
export const isSmallDevice = frameHeight < SMALL_DEVICE_MAX_HEIGHT;

export const width = (percent: number | string) =>
  snap((frameWidth * toNumber(percent)) / 100);

export const height = (percent: number | string) =>
  snap((frameHeight * toNumber(percent)) / 100);

// Scales a size designed at 390 px wide to the current screen width.
export const designPx = (px: number) => width((px / DESIGN_FRAME_WIDTH) * 100);

// Percentage of the screen diagonal, so text grows with both dimensions.
export const ResponsiveScaling = (percent: number) =>
  Math.hypot(frameWidth, frameHeight) * (percent / 100);
