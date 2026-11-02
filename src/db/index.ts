import { ReportRepository } from '../types';
import { getDatabase } from './database';
import { createReportRepository } from './reportRepository';

let repository: Promise<ReportRepository> | null = null;

export function getReportRepository() {
  repository ??= getDatabase().then(createReportRepository);
  return repository;
}
