import { JobRow } from '../components/BlastWorkspaceAll';

import { ShortJobResponse } from './ServiceTypes';

export function shouldIncludeInJobsTable(jobEntity: ShortJobResponse) {
  // FIXME: Also need to filter out jobs created on other sites
  return !isJobExpired(jobEntity) && isJobPrimary(jobEntity);
}

function isJobExpired(jobEntity: ShortJobResponse) {
  return new Date() > new Date(jobEntity.expires);
}

function isJobPrimary(jobEntity: ShortJobResponse) {
  return jobEntity.isPrimary;
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
