import { View } from 'react-native';
import { colors } from '../../theme';
import { AppText } from '../AppText';
import { styles } from './styles';

interface SectionHeaderProps {
  title: string;
  count?: number;
}

export function SectionHeader({ title, count }: SectionHeaderProps) {
  return (
    <View style={styles.row} accessible accessibilityRole="header">
      <AppText variant="label" color={colors.textSecondary}>
        {title}
      </AppText>
      {count !== undefined && (
        <View style={styles.count}>
          <AppText variant="captionStrong" color={colors.textSecondary}>
            {count}
          </AppText>
        </View>
      )}
    </View>
  );
}
