import { ActivityIndicator } from 'react-native';
import { colors } from '../../theme';
import { AppText } from '../AppText';
import { Icon, IconName } from '../Icon';
import { PressableScale } from '../PressableScale';
import { styles } from './styles';

type ButtonVariant = 'primary' | 'secondary' | 'warning';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: IconName;
  /** Not tappable and greyed out. */
  disabled?: boolean;
  /** Greyed out but still tappable, so a tap can explain what is missing. */
  dimmed?: boolean;
  loading?: boolean;
}

const labelColor: Record<ButtonVariant, string> = {
  primary: colors.textOnPrimary,
  secondary: colors.ink,
  warning: colors.textOnPrimary,
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
  dimmed = false,
  loading = false,
}: ButtonProps) {
  const inactive = disabled || loading;
  const greyed = disabled || dimmed;
  const color = greyed ? colors.disabledText : labelColor[variant];

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive || dimmed, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      style={[styles.base, styles[variant], greyed && styles.greyed]}
    >
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <>
          {icon && <Icon name={icon} color={color} />}
          <AppText
            variant="button"
            color={color}
            style={variant === 'warning' ? styles.smallLabel : undefined}
          >
            {label}
          </AppText>
        </>
      )}
    </PressableScale>
  );
}
