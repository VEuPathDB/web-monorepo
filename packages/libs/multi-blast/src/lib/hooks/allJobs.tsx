import { useMemo } from 'react';

import { orderBy } from 'lodash';

import { Link } from '@veupathdb/wdk-client/lib/Components';
import {
  MesaColumn,
  MesaSortObject,
} from '@veupathdb/wdk-client/lib/Core/CommonTypes';
import { usePromise } from '@veupathdb/wdk-client/lib/Hooks/PromiseHook';

import { JobRow } from '../components/BlastWorkspaceAll';
import {
  entityStatusToReadableStatus,
  shouldIncludeInJobsTable,
} from '../utils/allJobs';
import { BlastApi } from '../utils/api';

export function useAllJobsColumns(): MesaColumn<keyof JobRow>[] {
  return useMemo(
    () => [
      {
        key: 'jobId',
        name: 'Job Id',
        renderCell: ({ row }: { row: JobRow }) => (
          <Link to={`/workspace/blast/result/${row.jobId}`}>{row.jobId}</Link>
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
        sortable: true,
      },
      {
        key: 'status',
        name: 'Status',
        sortable: true,
      },
      {
        key: 'expires',
        name: 'Expiration Date',
        sortable: true,
      },
    ],
    []
  );
}

export function useRawJobRows(blastApi: BlastApi): JobRow[] | undefined {
  const result = usePromise(async () => {
    const jobEntities = await blastApi.fetchJobEntities();

    return jobEntities?.filter(shouldIncludeInJobsTable).map((jobEntity) => ({
      jobId: jobEntity.id,
      description: jobEntity.description ?? null,
      created: new Date(jobEntity.created).toLocaleDateString(),
      expires: new Date(jobEntity.expires).toLocaleDateString(),
      status: entityStatusToReadableStatus(jobEntity.status),
    }));
  }, []);

  return result.value;
}

export function useSortedJobRows(
  unsortedRows: JobRow[] | undefined,
  sort: MesaSortObject
) {
  return useMemo(
    () =>
      unsortedRows && orderBy(unsortedRows, [sort.columnKey], [sort.direction]),
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
