import { AppState } from 'react-native';

export function subscribeToForeground(listener: () => void) {
  const subscription = AppState.addEventListener('change', state => {
    if (state === 'active') {
      listener();
    }
  });
  return () => subscription.remove();
}
