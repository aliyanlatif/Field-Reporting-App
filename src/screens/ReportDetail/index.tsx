import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image, ScrollView, View } from 'react-native';
import {
  AppText,
  Button,
  Screen,
  StateMessage,
  StatusBadge,
} from '../../components';
import { RootStackParamList } from '../../navigation/types';
import { retryReport } from '../../services/delivery';
import { colors } from '../../theme';
import { formatTimestamp } from '../../utils/formatDate';
import { useReportDetail } from './hooks/useReportDetail';
import { styles } from './styles';

type Props = NativeStackScreenProps<RootStackParamList, 'ReportDetail'>;

export function ReportDetailScreen({ navigation, route }: Props) {
  const { reportId } = route.params;
  const item = useReportDetail(reportId);

  if (!item) {
    return (
      <Screen>
        <StateMessage
          title="Report not found"
          message="It may have been removed."
          actionLabel="Back to reports"
          onAction={navigation.goBack}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <StatusBadge badge={item.badge} />
        <AppText variant="caption" color={colors.textSecondary}>
          Filed {formatTimestamp(item.createdAt)}
        </AppText>
        <AppText selectable variant="heading" style={styles.description}>
          {item.description}
        </AppText>
        {item.failed && (
          <Button
            label="Retry sending"
            onPress={() => retryReport(reportId).catch(() => undefined)}
          />
        )}
        <View style={styles.photos}>
          {item.imageUris.map((uri, index) => (
            <Image
              key={uri}
              source={{ uri }}
              resizeMode="contain"
              accessibilityLabel={`Photo ${index + 1} of ${item.imageCount}`}
              style={styles.photo}
            />
          ))}
          {item.imageUris.length === 0 && (
            <AppText color={colors.textSecondary}>
              {item.imageCount === 1 ? '1 photo' : `${item.imageCount} photos`}{' '}
              on the server.
            </AppText>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}
