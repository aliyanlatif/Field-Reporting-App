import { ActivityIndicator, Pressable } from 'react-native';
import { AppText } from '../AppText';
import { colors } from '../../theme';
import { styles } from './styles';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
}

const labelColor: Record<ButtonVariant, string> = {
  primary: colors.textOnPrimary,
  secondary: colors.primary,
  danger: colors.textOnPrimary,
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
}: ButtonProps) {
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={labelColor[variant]} />
      ) : (
        <AppText variant="button" color={labelColor[variant]}>
          {label}
        </AppText>
      )}
    </Pressable>
  );
}
