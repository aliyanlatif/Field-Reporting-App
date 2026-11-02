import { LocalReport, RemoteReport } from '../../../types';
import { deriveBanner } from '../banner';
import { buildReportSections } from '../reportItems';
import { describeLocalReport } from '../reportStatus';

const local = (overrides: Partial<LocalReport> = {}): LocalReport => ({
  id: 'r1',
  description: 'Leak',
  status: 'queued',
  createdAt: 1000,
  attempts: 0,
  nextAttemptAt: null,
  failureReason: null,
  images: [
    {
      id: 'i1',
      reportId: 'r1',
      position: 0,
      localUri: 'file:///1.jpg',
      sizeBytes: 1,
      status: 'pending',
    },
    {
      id: 'i2',
      reportId: 'r1',
      position: 1,
      localUri: 'file:///2.jpg',
      sizeBytes: 1,
      status: 'pending',
    },
  ],
  ...overrides,
});

const remote = (id: string, createdAt: string): RemoteReport => ({
  id,
  description: `server ${id}`,
  createdAt,
  completedAt: createdAt,
  images: [{ id: 'x', url: `http://server/${id}.jpg` }],
});

describe('describeLocalReport', () => {
  test('a new report is saved on the device, never "uploaded"', () => {
    expect(describeLocalReport(local())).toEqual({
      tone: 'neutral',
      label: 'Saved on device',
    });
  });

  test('shows upload progress by confirmed images', () => {
    const report = local({ status: 'uploading' });
    report.images[0].status = 'uploaded';

    expect(describeLocalReport(report).label).toBe('Uploading 1 of 2');
  });

  test('a report that failed an attempt says it will retry and why', () => {
    expect(
      describeLocalReport(
        local({ attempts: 2, failureReason: 'No connection' }),
      ),
    ).toEqual({
      tone: 'warning',
      label: 'Waiting to retry',
      detail: 'No connection',
    });
  });

  test('a refused report is a failure with its reason', () => {
    expect(
      describeLocalReport(
        local({ status: 'failed_permanent', failureReason: 'HTTP 403' }),
      ),
    ).toEqual({
      tone: 'danger',
      label: 'Failed',
      detail: 'HTTP 403',
    });
  });
});

describe('buildReportSections', () => {
  test('puts unfinished local reports on the device and server reports on the server, newest first', () => {
    const sections = buildReportSections(
      [local({ id: 'old', createdAt: 1 }), local({ id: 'new', createdAt: 2 })],
      [
        remote('a', '2026-01-01T00:00:00Z'),
        remote('b', '2026-02-01T00:00:00Z'),
      ],
    );

    expect(sections.onDevice.map(item => item.id)).toEqual(['new', 'old']);
    expect(sections.onServer.map(item => item.id)).toEqual(['b', 'a']);
  });

  test('a report the server holds is shown once, from the server', () => {
    const sections = buildReportSections(
      [local({ id: 'a', status: 'uploading' })],
      [remote('a', '2026-01-01T00:00:00Z')],
    );

    expect(sections.onDevice).toEqual([]);
    expect(sections.onServer).toHaveLength(1);
    expect(sections.onServer[0].description).toBe('server a');
    expect(sections.onServer[0].badge.label).toBe('Uploaded');
  });

  test('a delivered report the server list does not show yet stays visible as uploaded', () => {
    const sections = buildReportSections(
      [local({ id: 'a', status: 'uploaded' })],
      [],
    );

    expect(sections.onDevice).toEqual([]);
    expect(sections.onServer.map(item => item.badge.label)).toEqual([
      'Uploaded',
    ]);
  });

  test('flags failed reports so the screen can offer a retry', () => {
    const sections = buildReportSections(
      [local({ status: 'failed_permanent' })],
      [],
    );

    expect(sections.onDevice[0].failed).toBe(true);
  });
});

describe('deriveBanner', () => {
  test('is hidden when online with nothing pending', () => {
    expect(deriveBanner(true, [local({ status: 'uploaded' })])).toBeNull();
  });

  test('online with only failed reports asks the user to open one', () => {
    expect(deriveBanner(true, [local({ status: 'failed_permanent' })])).toEqual(
      {
        tone: 'warning',
        message: '1 report could not be sent. Open it to retry',
      },
    );
  });

  test('offline with nothing pending only says so', () => {
    expect(deriveBanner(false, [])?.message).toBe("You're offline");
  });

  test('offline with pending reports counts them without claiming they are uploaded', () => {
    const message =
      deriveBanner(false, [local(), local({ id: 'r2' })])?.message ?? '';

    expect(message).toContain('2 reports waiting on this device');
    expect(message.toLowerCase()).not.toContain('uploaded');
  });

  test('online and sending shows progress', () => {
    expect(deriveBanner(true, [local({ status: 'uploading' })])).toEqual({
      tone: 'progress',
      message: 'Sending 1 report',
    });
  });

  test('online but failing to reach the server says so', () => {
    expect(deriveBanner(true, [local({ attempts: 1 })])?.tone).toBe('warning');
  });
});
