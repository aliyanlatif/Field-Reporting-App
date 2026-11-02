import { useMemo } from 'react';
import { buildReportSections } from '../features/reports';
import { useReportsStore } from '../stores/reportsStore';

export function useReportSections() {
  const local = useReportsStore(state => state.local);
  const remote = useReportsStore(state => state.remote);
  return useMemo(() => buildReportSections(local, remote), [local, remote]);
}
