import { useCallback, useMemo } from 'react';
import { summarizeQueue } from '../../../features/reports';
import { useConnectivity, useReportSections } from '../../../hooks';
import { useReportsStore } from '../../../stores/reportsStore';

export function useReportsList() {
  const online = useConnectivity();
  const { onDevice, onServer } = useReportSections();
  const local = useReportsStore(state => state.local);
  const remoteLoaded = useReportsStore(state => state.remoteLoaded);
  const remoteLoading = useReportsStore(state => state.remoteLoading);
  const remoteError = useReportsStore(state => state.remoteError);
  const refreshLocal = useReportsStore(state => state.refreshLocal);
  const refreshRemote = useReportsStore(state => state.refreshRemote);

  const refresh = useCallback(async () => {
    await Promise.all([refreshLocal(), refreshRemote()]);
  }, [refreshLocal, refreshRemote]);

  const loadingFirstTime = remoteLoading && !remoteLoaded;
  const summary = useMemo(
    () =>
      summarizeQueue({
        online,
        local,
        serverCount: onServer.length,
        checkingServer: loadingFirstTime,
      }),
    [online, local, onServer.length, loadingFirstTime],
  );

  return {
    summary,
    onDevice,
    onServer,
    remoteLoaded,
    remoteError,
    pulling: remoteLoading && remoteLoaded,
    loadingFirstTime,
    isEmpty: remoteLoaded && onDevice.length === 0 && onServer.length === 0,
    refresh,
    retryRemote: refreshRemote,
  };
}
