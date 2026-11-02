import { AppText, StateMessage } from '../../../components';

interface ServerSectionFooterProps {
  loadingFirstTime: boolean;
  loaded: boolean;
  error: string | null;
  isEmpty: boolean;
  onRetry: () => void;
}

export function ServerSectionFooter({
  loadingFirstTime,
  loaded,
  error,
  isEmpty,
  onRetry,
}: ServerSectionFooterProps) {
  if (loadingFirstTime) {
    return <StateMessage compact loading title="Loading reports" />;
  }
  if (!loaded && error) {
    return (
      <StateMessage
        compact
        title="Could not load reports from the server"
        message={error}
        actionLabel="Try again"
        onAction={onRetry}
      />
    );
  }
  if (loaded && error) {
    return (
      <StateMessage
        compact
        title="Could not refresh"
        message={`${error}. Showing the last list from the server.`}
        actionLabel="Try again"
        onAction={onRetry}
      />
    );
  }
  return loaded && isEmpty ? (
    <AppText>Nothing on the server yet.</AppText>
  ) : null;
}
