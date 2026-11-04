import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import {
  AddPhotoSheet,
  AppText,
  Button,
  IconButton,
  Screen,
  StateMessage,
  StatusBadge,
  Timeline,
} from '../../components';
import { buildTimeline } from '../../features/reports';
import { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme';
import { PhotoCarousel } from './components/PhotoCarousel';
import { useReportDetail } from './hooks/useReportDetail';
import { styles } from './styles';

type Props = NativeStackScreenProps<RootStackParamList, 'ReportDetail'>;

const noteFor = (stage: string, needsPhoto: boolean) => {
  if (stage === 'delivered') {
    return 'This is what the server holds.';
  }
  return needsPhoto
    ? 'The rest of your reports keep sending while you fix this one.'
    : 'Sending runs on its own. You can close the app.';
};

export function ReportDetailScreen({ navigation, route }: Props) {
  const { item, busy, retry, replacePhoto, removePhoto } = useReportDetail(
    route.params.reportId,
  );
  const [pickerOpen, setPickerOpen] = useState(false);

  if (!item) {
    return (
      <Screen>
        <StateMessage
          icon="warning"
          title="Report not found"
          message="It may have been removed."
          actionLabel="Back to reports"
          onAction={navigation.goBack}
        />
      </Screen>
    );
  }

  const needsPhoto = item.refusedImageId !== undefined;

  return (
    <Screen>
      <View style={styles.topBar}>
        <IconButton
          icon="back"
          label="Back to reports"
          onPress={navigation.goBack}
        />
        <AppText variant="heading" accessibilityRole="header">
          Report
        </AppText>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <PhotoCarousel item={item} />
        <AppText
          variant="caption"
          color={colors.textSecondary}
          style={styles.hint}
        >
          {item.imageCount === 1 ? '1 photo' : `${item.imageCount} photos`}
          {item.photos.length > 1 ? ' · swipe to see all' : ''}
        </AppText>

        <View style={styles.body}>
          <AppText selectable style={[styles.description]} variant="heading">
            {item.description}
          </AppText>
          <View style={styles.chip}>
            <StatusBadge badge={item.badge} />
          </View>

          <View style={styles.timeline}>
            <Timeline steps={buildTimeline(item)} />
          </View>

          <View style={styles.actions}>
            {needsPhoto ? (
              <>
                <Button
                  icon="camera"
                  label="Replace photo"
                  loading={busy}
                  onPress={() => setPickerOpen(true)}
                />
                {item.imageCount > 1 && (
                  <Button
                    variant="secondary"
                    icon="trash"
                    label="Remove photo"
                    disabled={busy}
                    onPress={removePhoto}
                  />
                )}
              </>
            ) : (
              (item.stage === 'retrying' || item.failed) && (
                <Button
                  icon="refresh"
                  label={item.failed ? 'Retry sending' : 'Retry now'}
                  onPress={retry}
                />
              )
            )}
          </View>
          <AppText
            variant="caption"
            color={colors.textTertiary}
            style={styles.note}
          >
            {noteFor(item.stage, needsPhoto)}
          </AppText>
        </View>
      </ScrollView>

      <AddPhotoSheet
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onCamera={() => replacePhoto('camera')}
        onGallery={() => replacePhoto('gallery')}
      />
    </Screen>
  );
}
