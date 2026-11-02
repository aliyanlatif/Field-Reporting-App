import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RefreshControl, SectionList, View } from 'react-native';
import {
  AppText,
  Button,
  ReportCard,
  Screen,
  StateMessage,
} from '../../components';
import { ReportListItem } from '../../features/reports';
import { RootStackParamList } from '../../navigation/types';
import { retryReport } from '../../services/delivery';
import { colors } from '../../theme';
import { ServerSectionFooter } from './components/ServerSectionFooter';
import { useReportsList } from './hooks/useReportsList';
import { styles } from './styles';

type Props = NativeStackScreenProps<RootStackParamList, 'ReportsList'>;

interface ListSection {
  key: 'device' | 'server';
  title: string;
  data: ReportListItem[];
}

const ItemSeparator = () => <View style={styles.separator} />;

export function ReportsListScreen({ navigation }: Props) {
  const list = useReportsList();

  const sections: ListSection[] = [
    { key: 'device', title: 'On this device', data: list.onDevice },
    { key: 'server', title: 'On the server', data: list.onServer },
  ].filter(
    (section): section is ListSection =>
      section.key === 'server' || section.data.length > 0,
  );

  return (
    <Screen>
      {list.isEmpty ? (
        <StateMessage
          title="No reports yet"
          message="Reports you file will appear here."
        />
      ) : (
        <SectionList
          style={styles.list}
          contentContainerStyle={styles.content}
          sections={sections}
          keyExtractor={item => item.id}
          stickySectionHeadersEnabled={false}
          refreshControl={
            <RefreshControl
              refreshing={list.pulling}
              onRefresh={list.refresh}
            />
          }
          renderSectionHeader={({ section }) => (
            <AppText
              variant="heading"
              color={colors.textSecondary}
              style={styles.sectionTitle}
            >
              {section.title}
            </AppText>
          )}
          renderItem={({ item }) => (
            <ReportCard
              item={item}
              onPress={() =>
                navigation.navigate('ReportDetail', { reportId: item.id })
              }
              onRetry={() => retryReport(item.id).catch(() => undefined)}
            />
          )}
          ItemSeparatorComponent={ItemSeparator}
          renderSectionFooter={({ section }) =>
            section.key === 'server' ? (
              <ServerSectionFooter
                loadingFirstTime={list.loadingFirstTime}
                loaded={list.remoteLoaded}
                error={list.remoteError}
                isEmpty={list.onServer.length === 0}
                onRetry={list.retryRemote}
              />
            ) : (
              <View style={styles.sectionGap} />
            )
          }
        />
      )}
      <Button
        label="New report"
        onPress={() => navigation.navigate('ComposeReport')}
      />
    </Screen>
  );
}
