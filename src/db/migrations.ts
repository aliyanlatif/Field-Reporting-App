import { NitroSQLiteConnection } from 'react-native-nitro-sqlite';

const migrations: string[][] = [
  [
    `CREATE TABLE reports (
      id TEXT PRIMARY KEY NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      next_attempt_at INTEGER,
      failure_reason TEXT
    )`,
    `CREATE TABLE images (
      id TEXT PRIMARY KEY NOT NULL,
      report_id TEXT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
      position INTEGER NOT NULL,
      local_path TEXT NOT NULL,
      size_bytes INTEGER NOT NULL,
      status TEXT NOT NULL
    )`,
    'CREATE INDEX idx_reports_queue ON reports (status, next_attempt_at)',
    'CREATE INDEX idx_images_report ON images (report_id, position)',
  ],
];

type MigrationTarget = Pick<NitroSQLiteConnection, 'executeAsync' | 'executeBatchAsync'>;

export async function runMigrations(db: MigrationTarget) {
  const result = await db.executeAsync<{ user_version: number }>('PRAGMA user_version');
  const current = result.rows._array[0]?.user_version ?? 0;

  for (let version = current; version < migrations.length; version++) {
    await db.executeBatchAsync(migrations[version].map(query => ({ query })));
    await db.executeAsync(`PRAGMA user_version = ${version + 1}`);
  }
}
