import { JobRow } from '../components/BlastWorkspaceAll';

import { ShortJobResponse } from './ServiceTypes';

export function shouldIncludeInJobsTable(
  jobEntity: ShortJobResponse,
  projectId: string
) {
  return (
    !isJobExpired(jobEntity) &&
    isJobPrimary(jobEntity) &&
    isJobFromSite(jobEntity, projectId)
  );
}

function isJobExpired(jobEntity: ShortJobResponse) {
  return new Date() > new Date(jobEntity.expires);
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
