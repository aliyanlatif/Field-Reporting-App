import { View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppText, Button, Screen } from '../../components';
import { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme';
import { styles } from './styles';

type Props = NativeStackScreenProps<RootStackParamList, 'ReportsList'>;

export function ReportsListScreen({ navigation }: Props) {
  return (
    <Screen>
      <View style={styles.empty}>
        <AppText variant="heading">No reports yet</AppText>
        <AppText color={colors.textSecondary}>
          Reports you file will appear here.
        </AppText>
      </View>
      <Button
        label="New report"
        onPress={() => navigation.navigate('ComposeReport')}
      />
    </Screen>
  );
}
