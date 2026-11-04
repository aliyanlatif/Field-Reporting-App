import { colors } from '../../theme';
import { Icon, IconName } from '../Icon';
import { PressableScale } from '../PressableScale';
import { styles } from './styles';

interface IconButtonProps {
  icon: IconName;
  label: string;
  onPress: () => void;
  color?: string;
  disabled?: boolean;
}

export function IconButton({
  icon,
  label,
  onPress,
  color = colors.ink,
  disabled,
}: IconButtonProps) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      scaleTo={0.9}
      android_ripple={{ color: colors.border, borderless: true, radius: 26 }}
      style={styles.button}
    >
      <Icon name={icon} color={color} />
    </PressableScale>
  );
}
