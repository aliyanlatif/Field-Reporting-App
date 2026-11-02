import { ActivityIndicator, Modal, Pressable, View } from 'react-native';
import { AppText } from '../../../components';
import { colors } from '../../../theme';
import { useResetFlow } from '../hooks/useResetFlow';
import { startOverStyles as styles } from './startOverStyles';

export function StartOverButton() {
  const { busy, confirm } = useResetFlow();

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Start over"
        disabled={busy}
        onPress={confirm}
        style={styles.button}
      >
        <AppText variant="button" color={colors.danger}>
          Start over
        </AppText>
      </Pressable>
      <Modal
        transparent
        visible={busy}
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.backdrop}>
          <View style={styles.card}>
            <ActivityIndicator color={colors.primary} />
            <AppText>Starting over</AppText>
          </View>
        </View>
      </Modal>
    </>
  );
}
