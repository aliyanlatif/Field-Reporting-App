export const formatTimestamp = (millis: number) =>
  new Date(millis).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
