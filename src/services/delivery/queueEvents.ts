type Listener = () => void;

const listeners = new Set<Listener>();

export const notifyQueueChanged = () =>
  listeners.forEach(listener => listener());

export function subscribeToQueueChanges(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
