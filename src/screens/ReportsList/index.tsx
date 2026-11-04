import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, SectionList, View } from 'react-native';
import {
  AppText,
  FloatingActionButton,
  IconButton,
  ReportCard,
  Screen,
  SectionHeader,
  StateMessage,
} from '../../components';
import { ReportListItem } from '../../features/reports';
import { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme';
import { ServerSectionFooter } from './components/ServerSectionFooter';
import { StartOverSheet } from './components/StartOverSheet';
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
  const [startOverOpen, setStartOverOpen] = useState(false);
  const closeStartOver = useCallback(() => setStartOverOpen(false), []);

  const refreshControl = (
    <RefreshControl
      refreshing={list.pulling}
      onRefresh={list.refresh}
      colors={[colors.primary]}
      progressBackgroundColor={colors.surface}
    />
  );

  const sections: ListSection[] = [
    { key: 'device', title: 'Waiting to send', data: list.onDevice },
    { key: 'server', title: 'On server', data: list.onServer },
  ].filter(
    (section): section is ListSection =>
      section.key === 'server' || section.data.length > 0,
  );

  return (
    <Screen>
      <View style={styles.topBar}>
        <AppText variant="display" accessibilityRole="header">
          Reports
        </AppText>
        <View style={styles.actions}>
          <IconButton
            icon="refresh"
            label="Refresh from server"
            onPress={list.refresh}
          />
          <IconButton
            icon="settings"
            label="Settings and start over"
            onPress={() => setStartOverOpen(true)}
          />
        </View>
      </View>

      {list.isEmpty && !list.remoteError ? (
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.emptyContent}
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}
        >
          <StateMessage
            icon="camera"
            title="No reports yet"
            message="File your first one. It is saved on this phone straight away, then sent when there is signal."
          />
        </ScrollView>
      ) : (
        <SectionList
          style={styles.list}
          contentContainerStyle={styles.content}
          sections={sections}
          keyExtractor={item => item.id}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}
          renderSectionHeader={({ section }) => (
            <SectionHeader title={section.title} count={section.data.length} />
          )}
          renderItem={({ item }) => (
            <ReportCard
              item={item}
              onPress={() =>
                navigation.navigate('ReportDetail', { reportId: item.id })
              }
            />
          )}
          ItemSeparatorComponent={ItemSeparator}
          renderSectionFooter={({ section }) =>
            section.key === 'server' ? (
              <ServerSectionFooter
                loadingFirstTime={list.loadingFirstTime}
                loaded={list.remoteLoaded}
                error={list.remoteError}
                onRetry={list.retryRemote}
              />
            ) : (
              <View style={styles.sectionGap} />
            )
          }
        />
      )}

      <FloatingActionButton
        label="New report"
        icon="plus"
        onPress={() => navigation.navigate('ComposeReport')}
      />
      <StartOverSheet visible={startOverOpen} onClose={closeStartOver} />
    </Screen>
  );
}
