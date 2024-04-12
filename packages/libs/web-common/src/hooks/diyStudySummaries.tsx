import React, { useMemo } from 'react';

import { Column } from 'react-table';

import { keyBy } from 'lodash';

import { Link } from '@veupathdb/wdk-client/lib/Components';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { assertIsVdiCompatibleWdkService } from '@veupathdb/user-datasets/lib/Service';

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
      assertIsVdiCompatibleWdkService(wdkService);
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

    const currentUserDatasetsById = keyBy(
      currentUserDatasets,
      (ud) => ud.datasetId
    );

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
          summary: userDataset.summary ?? '',
          owner:
            userDataset.owner.userId === currentUser.id
              ? 'Me'
              : formatUser(userDataset.owner),
          sharedWith: userDataset.shares?.map(formatUser)?.join(', ') ?? '',
        },
      ];
    });
  }, [currentUser, currentUserDatasets, diyDatasets]);

  return userStudySummaryRows;
}

function formatUser(user: {
  firstName?: string;
  lastName?: string;
  organization?: string;
}) {
  const { firstName, lastName, organization } = user;
  const name =
    firstName == null && lastName == null
      ? 'Unknown user'
      : `${firstName} ${lastName}`;
  return name + (organization ? `(${organization})` : '');
}
