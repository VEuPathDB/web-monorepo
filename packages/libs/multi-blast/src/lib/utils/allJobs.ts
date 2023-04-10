import { JobRow } from '../components/BlastWorkspaceAll';

import { IOJobStatus } from './api/query/types/common';

export function entityStatusToReadableStatus(
  entityStatus: IOJobStatus
): JobRow['status'] {
  switch (entityStatus) {
    case 'queued':
      return 'queued';
    case 'in-progress':
      return 'running';
    case 'complete':
      return 'finished';
    case 'failed':
      return 'errored';
    case 'expired':
      return 'expired';
    default:
      throw new Error(`Unexpected job status value: ${entityStatus}.`);
  }
}
