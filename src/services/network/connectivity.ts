import NetInfo from '@react-native-community/netinfo';

export const readConnectivity = async () =>
  (await NetInfo.fetch()).isConnected === true;

export const subscribeToConnectivity = (listener: (online: boolean) => void) =>
  NetInfo.addEventListener(state => listener(state.isConnected === true));
