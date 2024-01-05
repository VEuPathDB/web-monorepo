import React, { useMemo } from 'react';

import { Column } from 'react-table';

import { keyBy } from 'lodash';

import { Link } from '@veupathdb/wdk-client/lib/Components';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
// import { assertIsVdiCompatibleWdkService } from '@veupathdb/user-datasets/lib/Service';
import { assertIsUserDatasetCompatibleWdkService } from '@veupathdb/user-datasets-legacy/lib/Service/UserDatasetWrappers';

import { useDiyDatasets } from './diyDatasets';

interface UserStudySummaryRow {
  name: string;
  userDatasetWorkspaceUrl: string;
  edaWorkspaceUrl: string;
  summary: string;
  owner: string;
  sharedWith: string;
}

export function useDiyStudySummaryColumns(): Column<UserStudySummaryRow>[] {
  return useMemo(
    () => [
      {
        accessor: 'userDatasetWorkspaceUrl',
        Header: 'Name',
        Cell: function ({ value, row }) {
          return <Link to={value}>{row.original.name}</Link>;
        },
      },
      {
        accessor: 'edaWorkspaceUrl',
        Header: 'Explore & analyze',
        Cell: function ({ value }) {
          return (
            <div style={{ textAlign: 'center' }}>
              <Link to={value} className="StudyMenuItem-RecordLink">
                <i
                  style={{ color: 'black', fontSize: '2em' }}
                  className="ebrc-icon-edaIcon"
                ></i>
              </Link>
            </div>
          );
        },
      },
      {
        accessor: 'summary',
        Header: 'Summary',
      },
      {
        accessor: 'owner',
        Header: 'Owner',
      },
      {
        accessor: 'sharedWith',
        Header: 'Shared with',
      },
    ],
    []
  );
}

export function useDiyStudySummaryRows(): UserStudySummaryRow[] | undefined {
  const currentUser = useWdkService(
    (wdkService) => wdkService.getCurrentUser(),
    []
  );

  const currentUserDatasets = useWdkService(
    async (wdkService) => {
      assertIsUserDatasetCompatibleWdkService(wdkService);
      if (currentUser == null) {
        return undefined;
      }

      if (currentUser.isGuest) {
        return [];
      }

      return wdkService.getCurrentUserDatasets();
    },
    [currentUser]
  );

  const { diyDatasets } = useDiyDatasets();

  const userStudySummaryRows = useMemo(() => {
    if (
      currentUser == null ||
      currentUserDatasets == null ||
      diyDatasets == null
    ) {
      return undefined;
    }

    const currentUserDatasetsById = keyBy(currentUserDatasets, ({ id }) => id);

    return diyDatasets.flatMap((diyDataset) => {
      const userDataset = currentUserDatasetsById[diyDataset.userDatasetId];

      if (userDataset == null) {
        return [];
      }

      return [
        {
          name: diyDataset.name,
          userDatasetWorkspaceUrl: diyDataset.userDatasetsRoute,
          edaWorkspaceUrl: `${diyDataset.baseEdaRoute}/new`,
          summary: userDataset.meta.summary ?? '',
          owner:
            userDataset.ownerUserId === currentUser.id
              ? 'Me'
              : userDataset.owner,
          sharedWith:
            userDataset.sharedWith
              ?.map(({ userDisplayName }) => userDisplayName)
              ?.join(', ') ?? '',
        },
      ];
    });
  }, [currentUser, currentUserDatasets, diyDatasets]);

  return userStudySummaryRows;
}
