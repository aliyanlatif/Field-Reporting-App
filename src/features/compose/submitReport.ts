import { NewImage, ReportRepository } from '../../types';
import { DraftErrors, validateDraft } from './validateDraft';

export interface ReportDraft {
  description: string;
  images: NewImage[];
}

export interface SubmitDeps {
  repository: ReportRepository;
  startDelivery: () => Promise<void>;
  newId: () => string;
  now?: () => number;
}

export class InvalidDraftError extends Error {
  constructor(readonly errors: DraftErrors) {
    super('Report is not ready to be saved');
    this.name = 'InvalidDraftError';
  }
}

/** Saves the report on the device first; delivery starts afterwards and never blocks the caller. */
export async function submitReport(
  { description, images }: ReportDraft,
  { repository, startDelivery, newId, now = Date.now }: SubmitDeps,
) {
  const errors = validateDraft({ description, imageCount: images.length });
  if (Object.keys(errors).length > 0) {
    throw new InvalidDraftError(errors);
  }

  const id = newId();
  await repository.create({
    id,
    description: description.trim(),
    createdAt: now(),
    images,
  });
  startDelivery().catch(() => undefined);
  return id;
}
