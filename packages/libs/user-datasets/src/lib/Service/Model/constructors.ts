import { projectId } from '../../config';

import { DatasetPostDetails } from './request-types';
import { ValidationErrors } from './response-decoders';

export function defaultDatasetDetails(): DatasetPostDetails {
  return {
    origin: 'direct-upload',
    visibility: 'private',
    installTargets: [projectId],
  };
}

export function createValidationError(
  errors: Record<string, string[]>
): ValidationErrors {
  return {
    general: [],
    byKey: errors,
  };
}
