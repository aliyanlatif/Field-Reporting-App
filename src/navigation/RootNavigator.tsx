import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ComposeReportScreen } from '../screens/ComposeReport';
import { ReportDetailScreen } from '../screens/ReportDetail';
import { ReportsListScreen } from '../screens/ReportsList';
import { useReportsSync, useReportToasts } from '../hooks';
import { colors } from '../theme';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  useReportsSync();
  useReportToasts();

  return (
    <Stack.Navigator
      initialRouteName="ReportsList"
      screenOptions={{
        // Every screen draws its own top bar, as in the design.
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
        animationDuration: 380,
      }}
    >
      <Stack.Screen name="ReportsList" component={ReportsListScreen} />
      <Stack.Screen
        name="ComposeReport"
        component={ComposeReportScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="ReportDetail" component={ReportDetailScreen} />
    </Stack.Navigator>
  );
}
