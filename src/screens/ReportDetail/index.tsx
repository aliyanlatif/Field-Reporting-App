import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
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

export function ReportDetailScreen({ navigation, route }: Props) {
  const {
    item,
    busy,
    deleting,
    retry,
    replacePhoto,
    removePhoto,
    confirmDelete,
  } = useReportDetail(route.params.reportId);
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
        <AppText
          variant="heading"
          accessibilityRole="header"
          style={styles.title}
        >
          Report
        </AppText>
        {deleting ? (
          <View style={styles.deleting}>
            <ActivityIndicator color={colors.danger} />
          </View>
        ) : (
          <IconButton
            icon="trash"
            label="Delete report"
            color={colors.danger}
            onPress={confirmDelete}
          />
        )}
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
