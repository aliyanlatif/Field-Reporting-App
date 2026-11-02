import { Linking, PermissionsAndroid, Platform } from 'react-native';

export type CameraPermission = 'granted' | 'denied' | 'blocked';

const CAMERA = PermissionsAndroid.PERMISSIONS.CAMERA;

// Android only reports "never ask again" in answer to a request, so remember it until a grant is seen.
let knownBlocked = false;

export async function checkCameraPermission(): Promise<CameraPermission> {
  if (Platform.OS !== 'android' || (await PermissionsAndroid.check(CAMERA))) {
    knownBlocked = false;
    return 'granted';
  }
  return knownBlocked ? 'blocked' : 'denied';
}

export async function requestCameraPermission(): Promise<CameraPermission> {
  const result = await PermissionsAndroid.request(CAMERA);
  if (result === PermissionsAndroid.RESULTS.GRANTED) {
    knownBlocked = false;
    return 'granted';
  }
  knownBlocked = result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN;
  return knownBlocked ? 'blocked' : 'denied';
}

export const openAppSettings = () => Linking.openSettings();
