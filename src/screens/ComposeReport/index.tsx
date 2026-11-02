import { ScrollView, TextInput, View } from 'react-native';
import { AppText, Button, Screen } from '../../components';
import { MAX_IMAGES_PER_REPORT } from '../../config';
import { openAppSettings } from '../../services/permissions';
import { colors } from '../../theme';
import { CameraNotice } from './components/CameraNotice';
import { PhotoGrid } from './components/PhotoGrid';
import { useComposeDraft } from './hooks/useComposeDraft';
import { styles } from './styles';

export function ComposeReportScreen() {
  const draft = useComposeDraft();
  const slotsLeft = draft.imageSlotsLeft;

  return (
    <Screen>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.field}>
          <AppText variant="heading">What did you find?</AppText>
          <TextInput
            value={draft.description}
            onChangeText={draft.setDescription}
            onBlur={draft.touchDescription}
            placeholder="Describe the issue"
            placeholderTextColor={colors.textSecondary}
            multiline
            maxLength={2000}
            textAlignVertical="top"
            accessibilityLabel="Description"
            style={[
              styles.input,
              draft.descriptionError ? styles.inputError : null,
            ]}
          />
          {draft.descriptionError && (
            <AppText variant="caption" color={colors.danger}>
              {draft.descriptionError}
            </AppText>
          )}
        </View>

        <View style={styles.field}>
          <View style={styles.photosHeader}>
            <AppText variant="heading">Photos</AppText>
            <AppText color={colors.textSecondary}>
              {draft.images.length} of {MAX_IMAGES_PER_REPORT}
            </AppText>
          </View>
          <View style={styles.actions}>
            <View style={styles.action}>
              <Button
                variant="secondary"
                label="Take photo"
                disabled={slotsLeft <= 0}
                onPress={draft.addFromCamera}
              />
            </View>
            <View style={styles.action}>
              <Button
                variant="secondary"
                label="Gallery"
                disabled={slotsLeft <= 0}
                onPress={draft.addFromGallery}
              />
            </View>
          </View>
          {slotsLeft <= 0 && (
            <AppText variant="caption" color={colors.textSecondary}>
              That is the maximum. Remove a photo to add another.
            </AppText>
          )}
          {draft.cameraStatus && draft.cameraStatus !== 'granted' && (
            <CameraNotice
              status={draft.cameraStatus}
              onAllow={draft.addFromCamera}
              onOpenSettings={openAppSettings}
            />
          )}
          {draft.pickerError && (
            <AppText variant="caption" color={colors.danger}>
              {draft.pickerError}
            </AppText>
          )}
          <PhotoGrid images={draft.images} onRemove={draft.removeImage} />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {draft.submitError && (
          <AppText variant="caption" color={colors.danger}>
            {draft.submitError}
          </AppText>
        )}
        {!draft.canSubmit && !draft.submitting && draft.missing.length > 0 && (
          <AppText variant="caption" color={colors.textSecondary}>
            {draft.missing.join(' · ')}
          </AppText>
        )}
        <Button
          label="Save report"
          onPress={draft.submit}
          disabled={!draft.canSubmit}
          loading={draft.submitting}
        />
        <AppText
          variant="caption"
          color={colors.textSecondary}
          style={styles.hint}
        >
          Saved on this device first, then sent automatically.
        </AppText>
      </View>
    </Screen>
  );
}
