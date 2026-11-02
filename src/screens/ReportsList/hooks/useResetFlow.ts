import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { describeFailure } from '../../../features/delivery';
import { resetAll } from '../../../services/delivery';
import { useReportsStore } from '../../../stores/reportsStore';

export function useResetFlow() {
  const [busy, setBusy] = useState(false);

  const run = useCallback(async () => {
    setBusy(true);
    try {
      await resetAll();
      const { clear, refreshLocal, refreshRemote } = useReportsStore.getState();
      clear();
      await Promise.all([refreshLocal(), refreshRemote()]);
    } catch (error) {
      Alert.alert(
        'Could not start over',
        `${describeFailure(error)}. Try again when the connection is back.`,
      );
    } finally {
      setBusy(false);
    }
  }, []);

  const confirm = useCallback(() => {
    Alert.alert(
      'Start over?',
      "This deletes every report from this device and from the server, including reports that haven't been sent yet. It can't be undone.",
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete everything', style: 'destructive', onPress: run },
      ],
    );
  }, [run]);

  return { busy, confirm };
}
