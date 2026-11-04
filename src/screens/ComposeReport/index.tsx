import { useState } from 'react';
import { Animated, ScrollView, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  AddPhotoSheet,
  AppText,
  Button,
  IconButton,
  Screen,
  TextArea,
} from '../../components';
import { MAX_IMAGES_PER_REPORT } from '../../config';
import { useShake } from '../../hooks';
import { openAppSettings } from '../../services/permissions';
import { colors } from '../../theme';
import { CameraNotice } from './components/CameraNotice';
import { PhotoGrid } from './components/PhotoGrid';
import { useComposeDraft } from './hooks/useComposeDraft';
import { styles } from './styles';

export function ComposeReportScreen() {
  const navigation = useNavigation();
  const draft = useComposeDraft();
  const [pickerOpen, setPickerOpen] = useState(false);
  const shake = useShake(draft.rejectedTaps);

  const hint =
    draft.submitError ??
    draft.problem ??
    'It will send by itself when there is a connection.';
  const hintIsError = Boolean(draft.submitError ?? draft.problem);

  return (
    <Screen>
      <View style={styles.header}>
        <AppText variant="title" accessibilityRole="header">
          New report
        </AppText>
        <IconButton icon="close" label="Close" onPress={navigation.goBack} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AppText
          variant="bodyStrong"
          color={colors.textSecondary}
          style={styles.label}
        >
          Description
        </AppText>
        <TextArea
          value={draft.description}
          onChangeText={draft.setDescription}
          placeholder="What did you inspect? What did you find?"
          maxLength={2000}
          accessibilityLabel="Description"
        />

        <View style={styles.label}>
          <AppText variant="bodyStrong" color={colors.textSecondary}>
            Photos
          </AppText>
          <AppText variant="bodyStrong" color={colors.textSecondary}>
            {draft.images.length} of {MAX_IMAGES_PER_REPORT}
          </AppText>
        </View>
        <PhotoGrid
          images={draft.images}
          onAdd={() => setPickerOpen(true)}
          onRemove={draft.removeImage}
        />

        {draft.cameraStatus && draft.cameraStatus !== 'granted' && (
          <CameraNotice
            status={draft.cameraStatus}
            onAllow={draft.addFromCamera}
            onOpenSettings={openAppSettings}
          />
        )}
        {draft.pickerError && (
          <AppText variant="caption" color={colors.danger} style={styles.note}>
            {draft.pickerError}
          </AppText>
        )}
        <AppText
          variant="caption"
          color={colors.textSecondary}
          style={styles.note}
        >
          Big photos are shrunk on your phone to stay under 5 MB. They stay
          sharp.
        </AppText>
      </ScrollView>

      <Animated.View style={[styles.footer, shake]}>
        <AppText
          variant={hintIsError ? 'bodyStrong' : 'caption'}
          color={hintIsError ? colors.danger : colors.textSecondary}
          accessibilityLiveRegion="polite"
          style={styles.hint}
        >
          {hint}
        </AppText>
        <Button
          label="Save report"
          onPress={draft.submit}
          dimmed={!draft.canSubmit}
          loading={draft.submitting}
        />
      </Animated.View>

      <AddPhotoSheet
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onCamera={draft.addFromCamera}
        onGallery={draft.addFromGallery}
      />
    </Screen>
  );
}
