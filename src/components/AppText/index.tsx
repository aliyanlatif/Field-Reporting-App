import { Text, TextProps } from 'react-native';
import { colors, TextVariant, typography } from '../../theme';

interface AppTextProps extends TextProps {
  variant?: TextVariant;
  color?: string;
}

export function AppText({
  variant = 'body',
  color = colors.textPrimary,
  style,
  ...rest
}: AppTextProps) {
  return <Text {...rest} style={[typography[variant], { color }, style]} />;
}
