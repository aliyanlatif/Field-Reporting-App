import { useEffect } from 'react';
import { findRefusedImage } from '../features/reports/reportStatus';
import { useReportsStore } from '../stores/reportsStore';
import { showToast } from '../stores/toastStore';
import { LocalReport } from '../types';

/** Tells the user, once, when a report they filed arrives or gets stuck. Reports already known at launch stay quiet. */
export function useReportToasts() {
  useEffect(() => {
    let known = new Map<string, LocalReport['status']>();

    return useReportsStore.subscribe(({ local }) => {
      for (const report of local) {
        const before = known.get(report.id);
        if (before === undefined || before === report.status) {
          continue;
        }
        if (report.status === 'uploaded') {
          showToast('Report uploaded successfully.', 'ok');
        } else if (report.status === 'failed_permanent') {
          showToast(
            findRefusedImage(report)
              ? 'The server refused a photo. Open the report to fix it.'
              : 'A report could not be sent. Open it to see why.',
            'bad',
          );
        }
      }
      known = new Map(local.map(report => [report.id, report.status]));
    });
  }, []);
}
