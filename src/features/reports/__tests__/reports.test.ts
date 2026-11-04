import { LocalReport, RemoteReport } from '../../../types';
import { deriveBanner } from '../banner';
import { describePhoto } from '../photoStatus';
import { buildTimeline } from '../timeline';
import { buildReportSections, ReportPhoto } from '../reportItems';
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
  test('a new report is saved on the phone, never "on server"', () => {
    expect(describeLocalReport(local())).toEqual({
      tone: 'amber',
      label: 'Saved on phone',
    });
  });

  test('shows upload progress by confirmed images', () => {
    const report = local({ status: 'uploading' });
    report.images[0].status = 'uploaded';

    expect(describeLocalReport(report)).toEqual({
      tone: 'send',
      label: 'Sending · 1 of 2 photos',
    });
  });

  test('a report that failed an attempt says it will retry and why', () => {
    expect(
      describeLocalReport(
        local({ attempts: 2, failureReason: "Couldn't reach the server" }),
      ),
    ).toEqual({
      tone: 'wait',
      label: 'Waiting to retry',
      detail: "Couldn't reach the server",
    });
  });

  test('a refused photo needs the user', () => {
    const report = local({
      status: 'failed_permanent',
      failureReason: 'HTTP 403',
    });
    report.images[1].status = 'failed';

    expect(describeLocalReport(report)).toEqual({
      tone: 'bad',
      label: 'Needs you · photo refused',
    });
  });

  test('another permanent failure shows its reason', () => {
    expect(
      describeLocalReport(
        local({ status: 'failed_permanent', failureReason: 'HTTP 400' }),
      ),
    ).toEqual({ tone: 'bad', label: 'Needs you', detail: 'HTTP 400' });
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
    expect(sections.onServer[0].badge.label).toBe('On server');
  });

  test('a delivered report the server list does not show yet stays visible as on the server', () => {
    const sections = buildReportSections(
      [local({ id: 'a', status: 'uploaded' })],
      [],
    );

    expect(sections.onDevice).toEqual([]);
    expect(sections.onServer.map(item => item.badge.label)).toEqual([
      'On server',
    ]);
  });

  test('flags failed reports and names the refused photo', () => {
    const report = local({ status: 'failed_permanent' });
    report.images[0].status = 'failed';
    const sections = buildReportSections([report], []);

    expect(sections.onDevice[0].failed).toBe(true);
    expect(sections.onDevice[0].refusedImageId).toBe('i1');
  });
});

describe('buildTimeline', () => {
  const itemFor = (report: LocalReport) =>
    buildReportSections([report], []).onDevice[0];

  test('a delivered report is done at every step', () => {
    const [item] = buildReportSections(
      [],
      [remote('a', '2026-01-01T00:00:00Z')],
    ).onServer;

    expect(buildTimeline(item).map(step => step.state)).toEqual([
      'done',
      'done',
      'done',
    ]);
  });

  test('a refused photo turns the sending step red', () => {
    const report = local({ status: 'failed_permanent' });
    report.images[0].status = 'failed';

    expect(buildTimeline(itemFor(report))[1]).toMatchObject({
      state: 'bad',
      detail: 'One photo was refused',
    });
  });

  test('a report that has not started only has its first step done', () => {
    expect(buildTimeline(itemFor(local())).map(step => step.state)).toEqual([
      'done',
      'todo',
      'todo',
    ]);
  });
});

describe('deriveBanner', () => {
  test('is hidden while online', () => {
    expect(deriveBanner(true)).toBeNull();
  });

  test('offline reassures that nothing is lost', () => {
    expect(deriveBanner(false)).toEqual({
      tone: 'offline',
      message: "You're offline. Everything is saved.",
    });
  });
});

describe('describePhoto', () => {
  const photo = (status: ReportPhoto['status']): ReportPhoto => ({
    id: 'p',
    uri: 'file:///p.jpg',
    status,
  });

  test('says how far a photo in flight has got', () => {
    expect(describePhoto(photo('uploading'), 0.634)).toEqual({
      tone: 'send',
      label: 'Sending 63%',
    });
  });

  test('a refused photo says so', () => {
    expect(describePhoto(photo('failed'), 0).tone).toBe('bad');
  });

  test('photos the server holds count as uploaded', () => {
    expect(describePhoto(photo(null), 0).label).toBe('Uploaded');
  });

  test('a photo not yet sent is queued', () => {
    expect(describePhoto(photo('pending'), 0).label).toBe('Queued');
  });
});
