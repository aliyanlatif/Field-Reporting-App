import {
  CachesDirectoryPath,
  DocumentDirectoryPath,
  exists,
  mkdir,
  moveFile,
  readDir,
  stat,
  unlink,
} from '@dr.pogodin/react-native-fs';

const IMAGES_DIR = `${DocumentDirectoryPath}/report-images`;

const toPath = (uri: string) => uri.replace(/^file:\/\//, '');
const toUri = (path: string) => `file://${path}`;

export async function fileSize(uri: string) {
  return Number((await stat(toPath(uri))).size);
}

export async function moveIntoStorage(uri: string, imageId: string) {
  await mkdir(IMAGES_DIR);
  const target = `${IMAGES_DIR}/${imageId}.jpg`;
  await moveFile(toPath(uri), target);
  return toUri(target);
}

export async function removeFile(uri: string) {
  const path = toPath(uri);
  if (await exists(path)) {
    await unlink(path);
  }
}

export const deleteFiles = (uris: string[]) =>
  Promise.all(uris.map(removeFile)).then(() => undefined);

/** Picker output lives in the cache; delete it once the compressed copy is safely stored. */
export async function removeCachedOriginal(uri: string) {
  if (toPath(uri).startsWith(CachesDirectoryPath)) {
    await removeFile(uri).catch(() => undefined);
  }
}

export async function removeOrphanedFiles(referencedUris: string[]) {
  if (!(await exists(IMAGES_DIR))) {
    return;
  }
  const referenced = new Set(referencedUris.map(toPath));
  const stored = await readDir(IMAGES_DIR);
  await Promise.all(
    stored
      .filter(file => !referenced.has(file.path))
      .map(file => unlink(file.path)),
  );
}

export async function removeAllImages() {
  await removeFile(toUri(IMAGES_DIR));
}
