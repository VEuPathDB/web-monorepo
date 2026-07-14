import { projectId } from '../../config';

import { PartialDatasetDetails } from './request-types';
import { ValidationErrors } from './response-decoders';

export function defaultDatasetDetails(): PartialDatasetDetails {
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
