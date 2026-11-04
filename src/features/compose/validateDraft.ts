import { MAX_DESCRIPTION_LENGTH, MAX_IMAGES_PER_REPORT } from '../../config';

export interface DraftInput {
  description: string;
  imageCount: number;
}

export interface DraftErrors {
  description?: string;
  images?: string;
}

export function validateDraft({
  description,
  imageCount,
}: DraftInput): DraftErrors {
  const errors: DraftErrors = {};
  if (!description.trim()) {
    errors.description = 'Describe what you found';
  } else if (description.trim().length > MAX_DESCRIPTION_LENGTH) {
    errors.description = `Keep the description under ${MAX_DESCRIPTION_LENGTH} characters`;
  }
  if (imageCount < 1) {
    errors.images = 'Add at least one photo';
  } else if (imageCount > MAX_IMAGES_PER_REPORT) {
    errors.images = `Add no more than ${MAX_IMAGES_PER_REPORT} photos`;
  }
  return errors;
}

export const isDraftValid = (input: DraftInput) =>
  Object.keys(validateDraft(input)).length === 0;
