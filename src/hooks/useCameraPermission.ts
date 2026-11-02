import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import {
  CameraPermission,
  checkCameraPermission,
  requestCameraPermission,
} from '../services/permissions';

/** Tracks camera permission and re-checks it whenever the app returns from Settings. */
export function useCameraPermission() {
  const [status, setStatus] = useState<CameraPermission | null>(null);

  const refresh = useCallback(
    async () => setStatus(await checkCameraPermission()),
    [],
  );

  useEffect(() => {
    refresh();
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        refresh();
      }
    });
    return () => subscription.remove();
  }, [refresh]);

  const ensureGranted = useCallback(async () => {
    const current = await checkCameraPermission();
    const next =
      current === 'granted' ? current : await requestCameraPermission();
    setStatus(next);
    return next === 'granted';
  }, []);

  return { status, ensureGranted };
}
