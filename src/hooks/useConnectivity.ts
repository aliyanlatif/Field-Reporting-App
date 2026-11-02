import { useEffect, useState } from 'react';
import { subscribeToConnectivity } from '../services/network';

/** True until the network is reported down, so the offline banner never flashes at launch. */
export function useConnectivity() {
  const [online, setOnline] = useState(true);
  useEffect(() => subscribeToConnectivity(setOnline), []);
  return online;
}
