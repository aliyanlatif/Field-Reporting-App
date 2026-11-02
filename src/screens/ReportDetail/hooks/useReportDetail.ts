import { findReportItem } from '../../../features/reports';
import { useReportSections } from '../../../hooks';

export const useReportDetail = (reportId: string) =>
  findReportItem(useReportSections(), reportId);
