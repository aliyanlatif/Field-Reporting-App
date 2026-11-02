import { View } from 'react-native';
import { deriveBanner } from '../../features/reports';
import { useConnectivity } from '../../hooks/useConnectivity';
import { useReportsStore } from '../../stores/reportsStore';
import { colors } from '../../theme';
import { AppText } from '../AppText';
import { styles } from './styles';

const palette = {
  neutral: { background: colors.border, text: colors.textPrimary },
  progress: { background: colors.primary, text: colors.textOnPrimary },
  warning: { background: colors.warningSurface, text: colors.warning },
};

export function StatusBanner() {
  const online = useConnectivity();
  const local = useReportsStore(state => state.local);
  const banner = deriveBanner(online, local);

  if (!banner) {
    return null;
  }
  const { background, text } = palette[banner.tone];

  return (
    <View
      accessibilityLiveRegion="polite"
      style={[styles.container, { backgroundColor: background }]}
    >
      <AppText variant="caption" color={text} style={styles.message}>
        {banner.message}
      </AppText>
    </View>
  );
}
