import { useEffect } from 'react';
import { subscribeToForeground } from '../services/appLifecycle';
import { subscribeToQueueChanges } from '../services/delivery';
import { subscribeToConnectivity } from '../services/network';
import { useReportsStore } from '../stores/reportsStore';

/** Keeps the reports store current: on launch, on queue changes, on foreground and when the network returns. */
export function useReportsSync() {
  useEffect(() => {
    const { refreshLocal, refreshRemote, handleQueueChange } =
      useReportsStore.getState();
    refreshLocal();
    refreshRemote();

    let wasOnline = false;
    const unsubscribers = [
      subscribeToQueueChanges(handleQueueChange),
      subscribeToForeground(() => {
        refreshLocal();
        refreshRemote();
      }),
      subscribeToConnectivity(online => {
        if (online && !wasOnline) {
          refreshRemote();
        }
        wasOnline = online;
      }),
    ];
    return () => unsubscribers.forEach(unsubscribe => unsubscribe());
  }, []);
}
