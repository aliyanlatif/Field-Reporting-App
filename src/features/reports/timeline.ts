import { ReportListItem } from './reportItems';

export type StepState = 'done' | 'active' | 'todo' | 'bad';

export interface TimelineStep {
  key: 'saved' | 'sending' | 'server';
  label: string;
  detail: string;
  state: StepState;
  /** When the step happened, if the app knows. */
  at?: number;
}

/** Saved, Sending, On server: where the report is and what each step means. */
export function buildTimeline(item: ReportListItem): TimelineStep[] {
  const total = item.imageCount;
  const delivered = item.stage === 'delivered';

  const sending: Pick<TimelineStep, 'state' | 'detail'> = (() => {
    switch (item.stage) {
      case 'delivered':
        return { state: 'done', detail: `${total} of ${total} photos sent` };
      case 'needs-you':
        return {
          state: 'bad',
          detail: item.refusedImageId
            ? 'One photo was refused'
            : item.failureReason ?? 'Sending stopped',
        };
      case 'retrying':
        return { state: 'active', detail: 'Paused. Trying again soon.' };
      case 'sending':
        return {
          state: 'active',
          detail: `${item.sentCount} of ${total} photos sent`,
        };
      case 'saved':
        return { state: 'todo', detail: 'Waiting its turn' };
    }
  })();

  return [
    {
      key: 'saved',
      label: 'Saved on phone',
      detail: 'Safe on this device',
      state: 'done',
      at: item.createdAt,
    },
    { key: 'sending', label: 'Sending', ...sending },
    {
      key: 'server',
      label: 'On server',
      detail: delivered
        ? 'Confirmed by the server'
        : 'Not yet. It only counts once confirmed.',
      state: delivered ? 'done' : 'todo',
      at: item.completedAt,
    },
  ];
}
