import { colors } from '../../theme';
import { AppText } from '../AppText';
import { Icon, IconName } from '../Icon';
import { PressableScale } from '../PressableScale';
import { styles } from './styles';

interface FloatingActionButtonProps {
  label: string;
  icon: IconName;
  onPress: () => void;
}

/** The screen's main action, pinned above the list. */
export function FloatingActionButton({
  label,
  icon,
  onPress,
}: FloatingActionButtonProps) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={styles.button}
    >
      <Icon name={icon} color={colors.white} />
      <AppText variant="button" color={colors.white}>
        {label}
      </AppText>
    </PressableScale>
  );
}
