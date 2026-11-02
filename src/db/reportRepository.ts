import { NitroSQLiteConnection } from 'react-native-nitro-sqlite';
import { ReportRepository } from '../types';
import { ImageRow, ReportRow, toLocalImage, toLocalReport } from './rowMapping';

export type Database = Pick<NitroSQLiteConnection, 'executeAsync' | 'executeBatchAsync'>;

export function createReportRepository(db: Database): ReportRepository {
  async function load(where = '', params: (string | number)[] = []) {
    const reports = (
      await db.executeAsync<ReportRow>(
        `SELECT * FROM reports ${where} ORDER BY created_at ASC, id ASC`,
        params,
      )
    ).rows._array;
    if (reports.length === 0) {
      return [];
    }

    const placeholders = reports.map(() => '?').join(',');
    const images = (
      await db.executeAsync<ImageRow>(
        `SELECT * FROM images WHERE report_id IN (${placeholders}) ORDER BY position ASC`,
        reports.map(report => report.id),
      )
    ).rows._array;

    return reports.map(report =>
      toLocalReport(
        report,
        images.filter(image => image.report_id === report.id).map(toLocalImage),
      ),
    );
  }

  const run = (query: string, params: (string | number | null)[]) =>
    db.executeAsync(query, params).then(() => undefined);

  return {
    async create({ id, description, createdAt, images }) {
      await db.executeBatchAsync([
        {
          query:
            "INSERT INTO reports (id, description, status, created_at) VALUES (?, ?, 'queued', ?)",
          params: [id, description, createdAt],
        },
        {
          query:
            "INSERT INTO images (id, report_id, position, local_path, size_bytes, status) VALUES (?, ?, ?, ?, ?, 'pending')",
          params: images.map((image, position) => [
            image.id,
            id,
            position,
            image.localPath,
            image.sizeBytes,
          ]),
        },
      ]);
    },

    async get(id) {
      return (await load('WHERE id = ?', [id]))[0] ?? null;
    },

    list: () => load(),

    findDue: now =>
      load("WHERE status = 'queued' AND (next_attempt_at IS NULL OR next_attempt_at <= ?)", [now]),

    markUploading: id => run("UPDATE reports SET status = 'uploading' WHERE id = ?", [id]),

    markImage: (imageId, status) =>
      run('UPDATE images SET status = ? WHERE id = ?', [status, imageId]),

    scheduleRetry: (id, { attempts, nextAttemptAt, reason }) =>
      run(
        "UPDATE reports SET status = 'queued', attempts = ?, next_attempt_at = ?, failure_reason = ? WHERE id = ?",
        [attempts, nextAttemptAt, reason, id],
      ),

    markFailedPermanent: (id, reason) =>
      run("UPDATE reports SET status = 'failed_permanent', failure_reason = ? WHERE id = ?", [
        reason,
        id,
      ]),

    markUploaded: id =>
      run(
        "UPDATE reports SET status = 'uploaded', next_attempt_at = NULL, failure_reason = NULL WHERE id = ?",
        [id],
      ),

    async requeue(id) {
      await db.executeBatchAsync([
        {
          query:
            "UPDATE reports SET status = 'queued', attempts = 0, next_attempt_at = NULL, failure_reason = NULL WHERE id = ?",
          params: [id],
        },
        {
          query: "UPDATE images SET status = 'pending' WHERE report_id = ? AND status = 'failed'",
          params: [id],
        },
      ]);
    },

    async recoverInterrupted() {
      await db.executeBatchAsync([
        { query: "UPDATE images SET status = 'pending' WHERE status = 'uploading'" },
        { query: "UPDATE reports SET status = 'queued' WHERE status = 'uploading'" },
      ]);
    },

    delete: id => run('DELETE FROM reports WHERE id = ?', [id]),

    clear: () => run('DELETE FROM reports', []),
  };
}
