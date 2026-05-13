import { DatasetPostDetails } from './request-types';
import { projectId } from '@veupathdb/web-common/lib/config';

export function defaultDatasetDetails(): DatasetPostDetails {
  return {
    origin: 'direct-upload',
    visibility: 'private',
    installTargets: [projectId],
  };
}
