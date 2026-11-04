import { LocalReport } from '../../types';
import { countSent, findRefusedImage, StatusTone } from './reportStatus';

export interface QueueSummary {
  tone: StatusTone;
  title: string;
  subtitle: string;
}

export interface SummaryInput {
  online: boolean;
  local: LocalReport[];
  serverCount: number;
  checkingServer: boolean;
}

const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? '' : 's'}`;

/** The one-glance answer to "is my work safe?", shown at the top of the list. */
export function summarizeQueue({
  online,
  local,
  serverCount,
  checkingServer,
}: SummaryInput): QueueSummary {
  const unsent = local.filter(report => report.status !== 'uploaded');
  const needsYou = unsent.filter(
    report => report.status === 'failed_permanent',
  );

  if (unsent.length === 0) {
    return {
      tone: 'ok',
      title: serverCount
        ? `All ${plural(serverCount, 'report')} safe on the server`
        : 'Nothing waiting to send',
      subtitle: checkingServer
        ? 'Checking the server…'
        : 'Everything you filed has arrived.',
    };
  }
  if (needsYou.length > 0) {
    const refused = needsYou.some(report => findRefusedImage(report));
    return {
      tone: 'bad',
      title: `${plural(needsYou.length, 'report')} ${
        needsYou.length === 1 ? 'needs' : 'need'
      } you`,
      subtitle: refused
        ? 'A photo was refused. Replace it to finish sending.'
        : 'Open it to see what went wrong and try again.',
    };
  }
  if (!online) {
    return {
      tone: 'wait',
      title: `${unsent.length} saved on phone · waiting for network`,
      subtitle: 'Nothing is lost. Sending resumes on its own.',
    };
  }
  if (unsent.some(report => report.status === 'uploading')) {
    const total = unsent.reduce((sum, report) => sum + report.images.length, 0);
    const sent = unsent.reduce((sum, report) => sum + countSent(report), 0);
    return {
      tone: 'send',
      title: `Sending ${plural(unsent.length, 'report')}`,
      subtitle: `${sent} of ${total} photos sent`,
    };
  }
  if (unsent.some(report => report.attempts > 0)) {
    return {
      tone: 'wait',
      title: `${unsent.length} saved on phone · waiting to retry`,
      subtitle: "Can't reach the server. Trying again on its own.",
    };
  }
  return {
    tone: 'amber',
    title: `${unsent.length} saved on phone`,
    subtitle: 'Sending starts automatically.',
  };
}
