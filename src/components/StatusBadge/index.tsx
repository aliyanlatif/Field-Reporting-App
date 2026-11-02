import { View } from 'react-native';
import { BadgeTone, ReportBadge } from '../../features/reports';
import { colors } from '../../theme';
import { AppText } from '../AppText';
import { styles } from './styles';

const palette: Record<BadgeTone, { background: string; text: string }> = {
  neutral: { background: colors.border, text: colors.textPrimary },
  progress: { background: colors.primary, text: colors.textOnPrimary },
  warning: { background: colors.warningSurface, text: colors.warning },
  success: { background: colors.successSurface, text: colors.success },
  danger: { background: colors.dangerSurface, text: colors.danger },
};

export function StatusBadge({ badge }: { badge: ReportBadge }) {
  const { background, text } = palette[badge.tone];

  return (
    <View style={styles.container}>
      <View style={[styles.pill, { backgroundColor: background }]}>
        <AppText variant="caption" color={text} style={styles.label}>
          {badge.label}
        </AppText>
      </View>
      {badge.detail && (
        <AppText variant="caption" color={colors.textSecondary}>
          {badge.detail}
        </AppText>
      )}
    </View>
  );
}
