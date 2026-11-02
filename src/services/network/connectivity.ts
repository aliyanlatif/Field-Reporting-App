import NetInfo from '@react-native-community/netinfo';

export const subscribeToConnectivity = (listener: (online: boolean) => void) =>
  NetInfo.addEventListener(state => listener(state.isConnected === true));
