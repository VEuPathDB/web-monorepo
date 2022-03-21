import { DatasetUploadPageConfig } from './types';

export function isDirectUploadAvailable(
  availableUploadTypes?: string[]
): DatasetUploadPageConfig {
  return availableUploadTypes == null || availableUploadTypes.length === 0
    ? { hasDirectUpload: false }
    : { hasDirectUpload: true, availableUploadTypes };
}
