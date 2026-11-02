import { NitroSQLiteConnection, open } from 'react-native-nitro-sqlite';
import { runMigrations } from './migrations';

const DATABASE_NAME = 'field_reports.sqlite';

let connection: Promise<NitroSQLiteConnection> | null = null;

async function openDatabase() {
  const db = open({ name: DATABASE_NAME });
  await db.executeAsync('PRAGMA foreign_keys = ON');
  await runMigrations(db);
  return db;
}

export function getDatabase() {
  connection ??= openDatabase();
  return connection;
}
