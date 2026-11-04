import { useCallback, useState } from 'react';
import { describeFailure, ResetScope } from '../../../features/delivery';
import { resetDeviceData } from '../../../services/delivery';
import { useReportsStore } from '../../../stores/reportsStore';
import { showToast } from '../../../stores/toastStore';

const DONE_MESSAGE: Record<ResetScope, string> = {
  unsent: 'Unsent reports cleared. The server was not touched.',
  everything: 'Cleared this phone and the server.',
};

const NOTHING_TO_CLEAR: Record<ResetScope, string> = {
  unsent: 'There are no unsent reports to clear.',
  everything: 'There are no reports to clear.',
};

export function useResetFlow(onDone: () => void) {
  const [scope, setScope] = useState<ResetScope>('unsent');
  const [busy, setBusy] = useState(false);
  const unsentCount = useReportsStore(
    state => state.local.filter(report => report.status !== 'uploaded').length,
  );
  const nothingOnDevice = useReportsStore(state => state.local.length === 0);
  const nothingOnServer = useReportsStore(
    state => state.remoteLoaded && state.remote.length === 0,
  );
  const nothingToClear =
    scope === 'unsent' ? unsentCount === 0 : nothingOnDevice && nothingOnServer;

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

  const explainNothingToClear = useCallback(() => {
    showToast(NOTHING_TO_CLEAR[scope], 'neutral');
    onDone();
  }, [onDone, scope]);

  const reset = useCallback(() => setScope('unsent'), []);

  return {
    scope,
    setScope,
    busy,
    unsentCount,
    nothingToClear,
    explainNothingToClear,
    run,
    reset,
  };
}
