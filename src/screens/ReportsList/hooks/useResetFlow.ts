import { useCallback, useState } from 'react';
import { describeFailure, ResetScope } from '../../../features/delivery';
import { resetDeviceData } from '../../../services/delivery';
import { useReportsStore } from '../../../stores/reportsStore';
import { showToast } from '../../../stores/toastStore';

const DONE_MESSAGE: Record<ResetScope, string> = {
  unsent: 'Unsent reports cleared. The server was not touched.',
  everything: 'Cleared this phone and the server.',
};

export function useResetFlow(onDone: () => void) {
  const [scope, setScope] = useState<ResetScope>('unsent');
  const [busy, setBusy] = useState(false);
  const unsentCount = useReportsStore(
    state => state.local.filter(report => report.status !== 'uploaded').length,
  );

  const run = useCallback(async () => {
    setBusy(true);
    try {
      await resetDeviceData(scope);
      const { clear, refreshLocal, refreshRemote } = useReportsStore.getState();
      if (scope === 'everything') {
        clear();
      }
      await Promise.all([refreshLocal(), refreshRemote()]);
      showToast(DONE_MESSAGE[scope], 'ok');
      onDone();
    } catch (error) {
      showToast(
        scope === 'everything'
          ? `${describeFailure(error)}. Nothing was deleted.`
          : 'Could not clear this phone. Try again.',
        'bad',
      );
    } finally {
      setBusy(false);
    }
  }, [onDone, scope]);

  const reset = useCallback(() => setScope('unsent'), []);

  return { scope, setScope, busy, unsentCount, run, reset };
}
