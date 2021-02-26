import { useMemo, useState } from 'react';

import { Loading } from '@veupathdb/wdk-client/lib/Components';
import Mesa, { MesaState } from '@veupathdb/wdk-client/lib/Components/Mesa';
import { MesaSortObject } from '@veupathdb/wdk-client/lib/Core/CommonTypes';

import {
  useAllJobsColumns,
  useMesaEventHandlers,
  useMesaOptions,
  useMesaUiState,
  useRawJobRows,
  useSortedJobRows,
} from '../hooks/allJobs';
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

  const [sort, setSort] = useState<MesaSortObject>({
    columnKey: 'created',
    direction: 'desc',
  });

  const sortedRows = useSortedJobRows(jobRows, sort);

  const uiState = useMesaUiState(sort);

  const eventHandlers = useMesaEventHandlers(setSort);

  const options = useMesaOptions();

  const mesaState = useMemo(
    () =>
      sortedRows &&
      MesaState.create({
        rows: sortedRows,
        columns: allJobsColumns,
        eventHandlers,
        options,
        uiState,
      }),
    [allJobsColumns, eventHandlers, options, sortedRows, uiState]
  );

  return (
    <div className="BlastWorkspaceAll">
      {mesaState == null ? <Loading /> : <Mesa state={mesaState} />}
    </div>
  );
}
