import { QueueWorker } from '../queueWorker';
import { startTriggers, TriggerSources } from '../triggers';

function setup() {
  const worker: jest.Mocked<QueueWorker> = {
    start: jest.fn().mockResolvedValue(undefined),
    processQueue: jest.fn().mockResolvedValue(undefined),
    stop: jest.fn(),
  };
  let foreground = () => {};
  let connectivity = (_online: boolean) => {};
  const unsubscribeForeground = jest.fn();
  const unsubscribeConnectivity = jest.fn();
  const sources: TriggerSources = {
    onForeground: listener => {
      foreground = listener;
      return unsubscribeForeground;
    },
    onConnectivity: listener => {
      connectivity = listener;
      return unsubscribeConnectivity;
    },
  };
  const stop = startTriggers(worker, sources);

  return {
    worker,
    stop,
    unsubscribeForeground,
    unsubscribeConnectivity,
    goForeground: () => foreground(),
    setOnline: (online: boolean) => connectivity(online),
  };
}

test('starts the worker as soon as triggers are attached', () => {
  const { worker } = setup();

  expect(worker.start).toHaveBeenCalledTimes(1);
});

test('returning to the foreground retries immediately, ignoring backoff', () => {
  const { worker, goForeground } = setup();

  goForeground();

  expect(worker.processQueue).toHaveBeenCalledWith({ ignoreBackoff: true });
});

test('regaining the network retries immediately, ignoring backoff', () => {
  const { worker, setOnline } = setup();

  setOnline(false);
  setOnline(true);

  expect(worker.processQueue).toHaveBeenCalledTimes(1);
  expect(worker.processQueue).toHaveBeenCalledWith({ ignoreBackoff: true });
});

test('losing the network and repeated online reports do not trigger extra runs', () => {
  const { worker, setOnline } = setup();

  setOnline(true);
  worker.processQueue.mockClear();
  setOnline(true);
  setOnline(false);

  expect(worker.processQueue).not.toHaveBeenCalled();
});

test('stopping unsubscribes from every source and stops the worker', () => {
  const { worker, stop, unsubscribeForeground, unsubscribeConnectivity } =
    setup();

  stop();

  expect(unsubscribeForeground).toHaveBeenCalled();
  expect(unsubscribeConnectivity).toHaveBeenCalled();
  expect(worker.stop).toHaveBeenCalled();
});
