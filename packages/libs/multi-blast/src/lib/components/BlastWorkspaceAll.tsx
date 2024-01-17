import { useMemo, useState } from 'react';

import { Loading } from '@veupathdb/wdk-client/lib/Components';
import Mesa, { MesaState } from '@veupathdb/coreui/lib/components/Mesa';
import { MesaSortObject } from '@veupathdb/coreui/lib/components/Mesa/types';

import {
  useAllJobsColumns,
  useMesaEventHandlers,
  useMesaOptions,
  useMesaUiState,
  useRawJobRows,
  useSortedJobRows,
} from '../hooks/allJobs';
import { useBlastApi } from '../hooks/api';

import { BlastRequestError } from './BlastRequestError';

import './BlastWorkspaceAll.scss';

export interface JobRow {
  jobId: string;
  description: string | null;
  created: string;
  status: 'queued' | 'running' | 'finished' | 'expired' | 'errored';
}

export function BlastWorkspaceAll() {
  const blastApi = useBlastApi();
  const jobRows = useRawJobRows(blastApi);

  return (
    <div className="BlastWorkspaceAll">
      {jobRows == null ? (
        <Loading />
      ) : jobRows.status === 'error' ? (
        <BlastRequestError errorDetails={jobRows.details} />
      ) : (
        <AllJobsTable jobRows={jobRows.value} />
      )}
    </div>
  );
}

interface AllJobsTableProps {
  jobRows: JobRow[];
}

export function AllJobsTable(props: AllJobsTableProps) {
  const allJobsColumns = useAllJobsColumns();

  const [sort, setSort] = useState<MesaSortObject>({
    columnKey: 'created',
    direction: 'desc',
  });

  const sortedRows = useSortedJobRows(props.jobRows, sort);

  const uiState = useMesaUiState(sort);

  const eventHandlers = useMesaEventHandlers(setSort);

  const options = useMesaOptions();

  const mesaState = useMemo(
    () =>
      MesaState.create({
        rows: sortedRows,
        columns: allJobsColumns,
        eventHandlers,
        options,
        uiState,
      }),
    [allJobsColumns, eventHandlers, options, sortedRows, uiState]
  );

  return <Mesa state={mesaState} />;
}
