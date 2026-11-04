import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { MAX_IMAGES_PER_REPORT } from '../../../config';
import { submitReport, validateDraft } from '../../../features/compose';
import { useCameraPermission } from '../../../hooks/useCameraPermission';
import { useConnectivity } from '../../../hooks/useConnectivity';
import { getReportRepository } from '../../../db';
import { triggerDelivery } from '../../../services/delivery';
import {
  chooseFromGallery,
  deleteFiles,
  ImageTooLargeError,
  PickResult,
  prepareImage,
  takePhoto,
} from '../../../services/images';
import { showToast } from '../../../stores/toastStore';
import { PreparedImage } from '../../../types';
import { createId } from '../../../utils/id';

export type DraftImage = { key: string } & (
  | { status: 'processing' }
  | { status: 'ready'; image: PreparedImage }
  | { status: 'error'; message: string }
);

const processingFailure = (error: unknown) =>
  error instanceof ImageTooLargeError
    ? 'This photo is too large to send'
    : 'This photo could not be processed';

export function useComposeDraft() {
  const navigation = useNavigation();
  const camera = useCameraPermission();
  const [description, setDescription] = useState('');
  const [triedSubmit, setTriedSubmit] = useState(false);
  const [rejectedTaps, setRejectedTaps] = useState(0);
  const [images, setImages] = useState<DraftImage[]>([]);
  const [pickerError, setPickerError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cameraRequested, setCameraRequested] = useState(false);

  const online = useConnectivity();
  const onlineRef = useRef(online);
  onlineRef.current = online;
  const imagesRef = useRef(images);
  imagesRef.current = images;
  const mounted = useRef(true);
  const submitted = useRef(false);

  const readyImages = images.flatMap(entry =>
    entry.status === 'ready' ? [entry.image] : [],
  );
  const processing = images.some(entry => entry.status === 'processing');
  const errors = validateDraft({ description, imageCount: readyImages.length });
  const hasErrors = Object.keys(errors).length > 0;
  const dirty = description.trim().length > 0 || images.length > 0;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (!submitted.current) {
        deleteFiles(
          imagesRef.current.flatMap(entry =>
            entry.status === 'ready' ? [entry.image.localUri] : [],
          ),
        ).catch(() => undefined);
      }
    };
  }, []);

  useEffect(
    () =>
      navigation.addListener('beforeRemove', event => {
        if (submitted.current || !dirty) {
          return;
        }
        event.preventDefault();
        Alert.alert(
          'Discard this report?',
          'The description and photos will be lost.',
          [
            { text: 'Keep editing', style: 'cancel' },
            {
              text: 'Discard',
              style: 'destructive',
              onPress: () => navigation.dispatch(event.data.action),
            },
          ],
        );
      }),
    [navigation, dirty],
  );

  const settle = useCallback(async (key: string, outcome: DraftImage) => {
    const stillWanted = imagesRef.current.some(entry => entry.key === key);
    if (!stillWanted || !mounted.current) {
      if (outcome.status === 'ready') {
        await deleteFiles([outcome.image.localUri]).catch(() => undefined);
      }
      return;
    }
    setImages(current =>
      current.map(entry => (entry.key === key ? outcome : entry)),
    );
  }, []);

  const addPhotos = useCallback(
    async (uris: string[]) => {
      const room = MAX_IMAGES_PER_REPORT - imagesRef.current.length;
      const added = uris
        .slice(0, Math.max(room, 0))
        .map(uri => ({ key: createId(), uri }));
      setImages(current => [
        ...current,
        ...added.map(({ key }): DraftImage => ({ key, status: 'processing' })),
      ]);
      for (const { key, uri } of added) {
        try {
          await settle(key, {
            key,
            status: 'ready',
            image: await prepareImage(uri),
          });
        } catch (error) {
          await settle(key, {
            key,
            status: 'error',
            message: processingFailure(error),
          });
        }
      }
    },
    [settle],
  );

  const handlePick = useCallback(
    async (result: PickResult) => {
      if (result.status === 'picked') {
        await addPhotos(result.uris);
      } else if (result.status === 'error') {
        setPickerError(result.message);
      }
    },
    [addPhotos],
  );

  const addFromCamera = useCallback(async () => {
    setPickerError(null);
    const granted = await camera.ensureGranted();
    setCameraRequested(true);
    if (granted) {
      await handlePick(await takePhoto());
    }
  }, [camera, handlePick]);

  const addFromGallery = useCallback(async () => {
    setPickerError(null);
    const room = MAX_IMAGES_PER_REPORT - imagesRef.current.length;
    await handlePick(await chooseFromGallery(room));
  }, [handlePick]);

  const removeImage = useCallback((key: string) => {
    const entry = imagesRef.current.find(candidate => candidate.key === key);
    if (entry?.status === 'ready') {
      deleteFiles([entry.image.localUri]).catch(() => undefined);
    }
    setImages(current => current.filter(candidate => candidate.key !== key));
  }, []);

  const submit = useCallback(async () => {
    if (hasErrors || processing || submitting) {
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const repository = await getReportRepository();
      await submitReport(
        { description, images: readyImages },
        { repository, startDelivery: triggerDelivery, newId: createId },
      );
      submitted.current = true;
      navigation.goBack();
      if (onlineRef.current) {
        showToast('Uploading to server...', 'neutral');
      } else {
        showToast('No internet connection. Waiting for network...', 'amber');
      }
    } catch {
      setSubmitError('Could not save the report on this device. Try again.');
      setSubmitting(false);
    }
  }, [description, hasErrors, navigation, processing, readyImages, submitting]);

  const canSubmit = !hasErrors && !processing && !submitting;

  /** Saves when ready. Otherwise it explains what is missing and asks the screen to shake. */
  const attemptSubmit = useCallback(() => {
    if (canSubmit) {
      return submit();
    }
    setTriedSubmit(true);
    setRejectedTaps(count => count + 1);
  }, [canSubmit, submit]);

  const problem =
    errors.description ??
    errors.images ??
    (processing ? 'Hang on, a photo is still being prepared.' : undefined);

  return {
    description,
    setDescription,
    images,
    imageSlotsLeft: MAX_IMAGES_PER_REPORT - images.length,
    canSubmit,
    submitting,
    submitError,
    /** Only shown after the user tried to save, so the form never nags before then. */
    problem: triedSubmit ? problem : undefined,
    rejectedTaps,
    pickerError,
    cameraStatus: cameraRequested ? camera.status : null,
    addFromCamera,
    addFromGallery,
    removeImage,
    submit: attemptSubmit,
  };
}
