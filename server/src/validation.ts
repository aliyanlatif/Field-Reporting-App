import { config } from './config.js';
import { HttpError } from './httpError.js';

const ID_PATTERN = /^[A-Za-z0-9-]{8,64}$/;

export interface CreateReportInput {
  id: string;
  description: string;
  imageIds: string[];
  createdAt: string;
}

export function isValidId(value: unknown): value is string {
  return typeof value === 'string' && ID_PATTERN.test(value);
}

export function assertValidId(value: unknown, field: string): string {
  if (!isValidId(value)) {
    throw new HttpError(400, 'invalid_id', `${field} is not a valid id`);
  }
  return value;
}

export function parseCreateReport(body: unknown): CreateReportInput {
  const input = (body ?? {}) as Record<string, unknown>;
  const id = assertValidId(input.id, 'id');

  if (typeof input.description !== 'string' || !input.description.trim()) {
    throw new HttpError(400, 'invalid_description', 'Description is required');
  }

  const { imageIds } = input;
  if (
    !Array.isArray(imageIds) ||
    imageIds.length < 1 ||
    imageIds.length > config.maxImagesPerReport ||
    !imageIds.every(isValidId) ||
    new Set(imageIds).size !== imageIds.length
  ) {
    throw new HttpError(
      400,
      'invalid_images',
      `A report needs 1 to ${config.maxImagesPerReport} distinct image ids`,
    );
  }

  const createdAt =
    typeof input.createdAt === 'string' && !Number.isNaN(Date.parse(input.createdAt))
      ? new Date(input.createdAt).toISOString()
      : new Date().toISOString();

  return { id, description: input.description.trim(), imageIds, createdAt };
}
