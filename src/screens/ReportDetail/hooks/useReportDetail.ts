import { useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { describeFailure } from '../../../features/delivery';
import { findReportItem } from '../../../features/reports';
import {
  useCameraPermission,
  useConnectivity,
  useReportSections,
} from '../../../hooks';
import {
  deleteReport,
  retryReport,
  reviseReport,
} from '../../../services/delivery';
import {
  chooseFromGallery,
  prepareImage,
  takePhoto,
} from '../../../services/images';
import { useReportsStore } from '../../../stores/reportsStore';
import { showToast } from '../../../stores/toastStore';

type PhotoSource = 'camera' | 'gallery';

export function useReportDetail(reportId: string) {
  const navigation = useNavigation();
  const online = useConnectivity();
  const camera = useCameraPermission();
  const item = findReportItem(useReportSections(), reportId);
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /** The revised report has a new id: wait until the list knows it, then follow it. */
  const followRevision = useCallback(
    async (newId: string) => {
      await useReportsStore.getState().refreshLocal();
      navigation.setParams({ reportId: newId } as never);
    },
    [navigation],
  );

  const retry = useCallback(async () => {
    if (!online) {
      showToast('Still offline. It keeps trying on its own.', 'amber');
      return;
    }
    await retryReport(reportId).catch(() => undefined);
  }, [online, reportId]);

  const replacePhoto = useCallback(
    async (source: PhotoSource) => {
      const imageId = item?.refusedImageId;
      if (!imageId) {
        return;
      }
      if (source === 'camera' && !(await camera.ensureGranted())) {
        showToast('Camera access is off. Allow it in Settings.', 'amber');
        return;
      }
      const picked =
        source === 'camera' ? await takePhoto() : await chooseFromGallery(1);
      if (picked.status !== 'picked' || picked.uris.length === 0) {
        return;
      }
      setBusy(true);
      try {
        const image = await prepareImage(picked.uris[0]);
        const newId = await reviseReport(reportId, {
          kind: 'replace',
          imageId,
          image,
        });
        showToast('New photo queued. Sending again.', 'amber');
        await followRevision(newId);
      } catch {
        showToast('Could not replace the photo. Try again.', 'bad');
      } finally {
        setBusy(false);
      }
    },
    [camera, followRevision, item?.refusedImageId, reportId],
  );

  const removePhoto = useCallback(async () => {
    const imageId = item?.refusedImageId;
    if (!imageId) {
      return;
    }
    setBusy(true);
    try {
      const newId = await reviseReport(reportId, { kind: 'remove', imageId });
      showToast('Photo removed. Sending the rest.', 'amber');
      await followRevision(newId);
    } catch {
      showToast('Could not remove the photo. Try again.', 'bad');
    } finally {
      setBusy(false);
    }
  }, [followRevision, item?.refusedImageId, reportId]);

  const runDelete = useCallback(async () => {
    setDeleting(true);
    try {
      await deleteReport(reportId);
      navigation.goBack();
      useReportsStore.getState().forget(reportId);
      showToast('Report deleted.', 'ok');
    } catch (error) {
      showToast(
        `${describeFailure(error)}. The report was not deleted.`,
        'bad',
      );
      setDeleting(false);
    }
  }, [navigation, reportId]);

  const confirmDelete = useCallback(() => {
    if (!item) {
      return;
    }
    Alert.alert('Are you sure you want to delete this report?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: runDelete },
    ]);
  }, [item, runDelete]);

  return {
    item,
    busy,
    deleting,
    retry,
    replacePhoto,
    removePhoto,
    confirmDelete,
  };
}
