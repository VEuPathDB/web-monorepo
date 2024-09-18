import { useMemo } from 'react';

import { orderBy } from 'lodash';

import { Link } from '@veupathdb/wdk-client/lib/Components';
import {
  MesaColumn,
  MesaSortObject,
} from '@veupathdb/coreui/lib/components/Mesa/types';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';

import { JobRow } from '../components/BlastWorkspaceAll';
import { ApiResult, ErrorDetails } from '../utils/ServiceTypes';
import {
  entityStatusToReadableStatus,
  shouldIncludeInJobsTable,
} from '../utils/allJobs';
import { BlastApi } from '../utils/api';

export function useAllJobsColumns(): MesaColumn<JobRow>[] {
  return useMemo(
    () => [
      {
        key: 'jobId',
        name: 'Job Id',
        renderCell: ({ row }: { row: JobRow }) => (
          <Link to={`./result/${row.jobId}`}>{row.jobId}</Link>
        ),
        sortable: true,
      },
      {
        key: 'description',
        name: 'Description',
        renderCell: ({ row }: { row: JobRow }) => row.description ?? 'Untitled',
        sortable: true,
      },
      {
        key: 'created',
        name: 'Submission Date',
        renderCell: ({ row }: { row: JobRow }) =>
          new Date(row.created).toLocaleDateString(),
        sortable: true,
      },
      {
        key: 'status',
        name: 'Status',
        sortable: true,
        renderCell: ({ row }: { row: JobRow }) => (
          <div>
            {row.status}
            {row.status === 'expired' && (
              <>
                {' '}
                (<Link to={`./result/${row.jobId}`}>rerun</Link>)
              </>
            )}
          </div>
        ),
      },
    ],
    []
  );
}

export function useRawJobRows(
  blastApi: BlastApi
): ApiResult<JobRow[], ErrorDetails> | undefined {
  return useWdkService(async (wdkService) => {
    const jobEntities = await blastApi.fetchJobEntities();
    const { projectId } = await wdkService.getConfig();

    return jobEntities == null
      ? undefined
      : jobEntities.status === 'error'
      ? jobEntities
      : {
          status: 'ok',
          value: jobEntities.value
            .filter((jobEntity) =>
              shouldIncludeInJobsTable(jobEntity, projectId)
            )
            .map((jobEntity) => ({
              jobId: jobEntity.id,
              description: jobEntity.description ?? null,
              created: jobEntity.created,
              status: entityStatusToReadableStatus(jobEntity.status),
            })),
        };
  }, []);
}

export function useSortedJobRows(unsortedRows: JobRow[], sort: MesaSortObject) {
  return useMemo(
    () => orderBy(unsortedRows, [sort.columnKey], [sort.direction]),
    [unsortedRows, sort]
  );
}

export function useMesaUiState(sort: MesaSortObject) {
  return useMemo(() => ({ sort }), [sort]);
}

export function useMesaEventHandlers(
  setSort: (newSort: MesaSortObject) => void
) {
  return useMemo(
    () => ({
      onSort: (
        { key: columnKey }: { key: keyof JobRow },
        direction: MesaSortObject['direction']
      ) => {
        setSort({ columnKey, direction });
      },
    }),
    [setSort]
  );
}

export function useMesaOptions() {
  return useMemo(
    () => ({
      useStickyHeader: true,
      tableBodyMaxHeight: '60vh',
      renderEmptyState: () => (
        <div className="EmptyState">
          <div className="EmptyState-BodyWrapper">
            <p>You do not have any BLAST jobs</p>
            <p>
              Please run a <Link to="./new">new job</Link>{' '}
            </p>
          </div>
        </div>
      ),
    }),
    []
  );
}
