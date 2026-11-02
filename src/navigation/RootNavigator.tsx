import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ComposeReportScreen } from '../screens/ComposeReport';
import { ReportDetailScreen } from '../screens/ReportDetail';
import { ReportsListScreen } from '../screens/ReportsList';
import { useReportsSync } from '../hooks';
import { colors } from '../theme';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  useReportsSync();

  return (
    <Stack.Navigator
      initialRouteName="ReportsList"
      screenOptions={{
        headerTintColor: colors.textPrimary,
        headerStyle: { backgroundColor: colors.surface },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="ReportsList"
        component={ReportsListScreen}
        options={{ title: 'Field reports' }}
      />
      <Stack.Screen
        name="ComposeReport"
        component={ComposeReportScreen}
        options={{ title: 'New report' }}
      />
      <Stack.Screen
        name="ReportDetail"
        component={ReportDetailScreen}
        options={{ title: 'Report' }}
      />
    </Stack.Navigator>
  );
}
