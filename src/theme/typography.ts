import { TextStyle } from 'react-native';
import { designPx } from '../utils/responsiveUtils';

/**
 * Manrope is bundled as static files, one per weight. Android picks the file by
 * family name, so the weight is part of the name and `fontWeight` is not set.
 */
export const fontFamily = {
  regular: 'Manrope-Regular',
  medium: 'Manrope-Medium',
  semiBold: 'Manrope-SemiBold',
  bold: 'Manrope-Bold',
  extraBold: 'Manrope-ExtraBold',
} as const;

export type TextVariant =
  | 'display'
  | 'title'
  | 'heading'
  | 'body'
  | 'bodyStrong'
  | 'caption'
  | 'captionStrong'
  | 'label'
  | 'button';

export const typography: Record<TextVariant, TextStyle> = {
  // Screen title ("Reports")
  display: {
    fontFamily: fontFamily.extraBold,
    fontSize: designPx(32),
    letterSpacing: -0.96,
  },
  // Sheet titles
  title: {
    fontFamily: fontFamily.extraBold,
    fontSize: designPx(24),
    letterSpacing: -0.48,
  },
  heading: {
    fontFamily: fontFamily.extraBold,
    fontSize: designPx(18),
    lineHeight: designPx(24),
  },
  body: {
    fontFamily: fontFamily.medium,
    fontSize: designPx(15),
    lineHeight: designPx(22),
  },
  bodyStrong: {
    fontFamily: fontFamily.bold,
    fontSize: designPx(14.5),
    lineHeight: designPx(20),
  },
  caption: {
    fontFamily: fontFamily.medium,
    fontSize: designPx(12.5),
    lineHeight: designPx(17),
  },
  captionStrong: {
    fontFamily: fontFamily.extraBold,
    fontSize: designPx(12),
    lineHeight: designPx(16),
  },
  // Uppercase section titles ("WAITING TO SEND")
  label: {
    fontFamily: fontFamily.extraBold,
    fontSize: designPx(12.5),
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  button: {
    fontFamily: fontFamily.extraBold,
    fontSize: designPx(16),
  },
};
