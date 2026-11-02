import { TextStyle } from 'react-native';
import { ResponsiveScaling } from '../utils/responsiveUtils';

export type TextVariant = 'title' | 'heading' | 'body' | 'caption' | 'button';

export const typography: Record<TextVariant, TextStyle> = {
  title: { fontSize: ResponsiveScaling(1.7), fontWeight: '700' },
  heading: { fontSize: ResponsiveScaling(1.35), fontWeight: '600' },
  body: { fontSize: ResponsiveScaling(1.1), fontWeight: '400' },
  caption: { fontSize: ResponsiveScaling(0.9), fontWeight: '400' },
  button: { fontSize: ResponsiveScaling(1.15), fontWeight: '600' },
};
