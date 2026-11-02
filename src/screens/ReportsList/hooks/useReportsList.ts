import { useCallback } from 'react';
import { useReportSections } from '../../../hooks';
import { useReportsStore } from '../../../stores/reportsStore';

export function useReportsList() {
  const { onDevice, onServer } = useReportSections();
  const remoteLoaded = useReportsStore(state => state.remoteLoaded);
  const remoteLoading = useReportsStore(state => state.remoteLoading);
  const remoteError = useReportsStore(state => state.remoteError);
  const refreshLocal = useReportsStore(state => state.refreshLocal);
  const refreshRemote = useReportsStore(state => state.refreshRemote);

  const refresh = useCallback(async () => {
    await Promise.all([refreshLocal(), refreshRemote()]);
  }, [refreshLocal, refreshRemote]);

  return {
    onDevice,
    onServer,
    remoteLoaded,
    remoteError,
    pulling: remoteLoading && remoteLoaded,
    loadingFirstTime: remoteLoading && !remoteLoaded,
    isEmpty: remoteLoaded && onDevice.length === 0 && onServer.length === 0,
    refresh,
    retryRemote: refreshRemote,
  };
}
