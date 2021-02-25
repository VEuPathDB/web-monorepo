import { useMemo } from 'react';

import Mesa, { MesaState } from '@veupathdb/wdk-client/lib/Components/Mesa';

import { useAllJobsColumns, useRawJobRows } from '../hooks/allJobs';
import { BlastApi } from '../utils/api';

import { withBlastApi } from './withBlastApi';

import './BlastWorkspaceAll.scss';

export interface Props {}

export interface JobRow {
  jobId: string;
  description: string | null;
  created: string;
  status: 'queued' | 'running' | 'finished' | 'errored';
  expires: string;
}

export const BlastWorkspaceAll = withBlastApi(BlastWorkspaceAllWithLoadedApi);

interface BlastWorkspaceAllWithLoadedApiProps extends Props {
  blastApi: BlastApi;
}

function BlastWorkspaceAllWithLoadedApi({
  blastApi,
}: BlastWorkspaceAllWithLoadedApiProps) {
  const allJobsColumns = useAllJobsColumns();

  const jobRows = useRawJobRows(blastApi);

  const mesaState = useMemo(
    () => MesaState.create({ rows: jobRows, columns: allJobsColumns }),
    [allJobsColumns, jobRows]
  );

  return (
    <div className="BlastWorkspaceAll">
      <Mesa state={mesaState} />
    </div>
  );
}
