import { JobRow } from '../components/BlastWorkspaceAll';

import { ShortJobResponse } from './ServiceTypes';

export function shouldIncludeInJobsTable(
  jobEntity: ShortJobResponse,
  projectId: string
) {
  return isJobPrimary(jobEntity) && isJobFromSite(jobEntity, projectId);
}

function isJobPrimary(jobEntity: ShortJobResponse) {
  return jobEntity.isPrimary;
}

function isJobFromSite(jobEntity: ShortJobResponse, projectId: string) {
  return jobEntity.site === projectId;
}

export function entityStatusToReadableStatus(
  entityStatus: ShortJobResponse['status']
): JobRow['status'] {
  return entityStatus === 'completed'
    ? 'finished'
    : entityStatus === 'in-progress'
    ? 'running'
    : entityStatus;
}
