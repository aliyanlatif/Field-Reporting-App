import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppText, Screen } from '../../components';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ReportDetail'>;

export function ReportDetailScreen({ route }: Props) {
  return (
    <Screen>
      <AppText variant="heading">{route.params.reportId}</AppText>
    </Screen>
  );
}
