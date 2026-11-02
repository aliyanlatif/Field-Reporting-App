import {
  Asset,
  ImagePickerResponse,
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';

export type PickResult =
  | { status: 'picked'; uris: string[] }
  | { status: 'cancelled' }
  | {
      status: 'error';
      reason: 'camera_unavailable' | 'permission' | 'unknown';
      message: string;
    };

const hasUri = (asset: Asset): asset is Asset & { uri: string } =>
  typeof asset.uri === 'string';

function toResult(response: ImagePickerResponse): PickResult {
  if (response.didCancel) {
    return { status: 'cancelled' };
  }
  if (response.errorCode) {
    return {
      status: 'error',
      reason: response.errorCode === 'others' ? 'unknown' : response.errorCode,
      message: response.errorMessage ?? 'Could not open the picker',
    };
  }
  return {
    status: 'picked',
    uris: (response.assets ?? []).filter(hasUri).map(asset => asset.uri),
  };
}

export const takePhoto = async () =>
  toResult(
    await launchCamera({
      mediaType: 'photo',
      cameraType: 'back',
      saveToPhotos: false,
    }),
  );

export const chooseFromGallery = async (limit: number) =>
  toResult(
    await launchImageLibrary({ mediaType: 'photo', selectionLimit: limit }),
  );
