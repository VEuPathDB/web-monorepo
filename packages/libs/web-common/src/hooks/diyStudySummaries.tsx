import React, { useMemo } from 'react';
import { Column } from 'react-table';

import { Link } from '@veupathdb/wdk-client/lib/Components';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';

import { EnrichedUserDataset, useDiyDatasets } from './diyDatasets';
import { User } from '@veupathdb/wdk-client/lib/Utils/WdkUser';
import { UserDatasetVDI } from '@veupathdb/user-datasets/lib/Utils/types';

interface UserStudySummaryRow {
  name: string;
  userDatasetWorkspaceUrl: string;
  edaWorkspaceUrl: string;
  summary: string;
  owner: string;
  sharedWith: string;
}

interface UserStudyColumnOptions {
  linkToUserDatasets?: boolean;
}

export function useDiyStudySummaryColumns(
  options: UserStudyColumnOptions = {}
): Column<UserStudySummaryRow>[] {
  const { linkToUserDatasets = false } = options;
  return useMemo(
    () => [
      linkToUserDatasets
        ? {
            accessor: 'userDatasetWorkspaceUrl',
            Header: 'Name',
            Cell: function ({ value, row }) {
              return <Link to={value}>{row.original.name}</Link>;
            },
          }
        : {
            accessor: 'name',
            Header: 'Name',
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

export function useDiyStudySummaryRows(): {
  userStudySummaryRows?: UserStudySummaryRow[];
  communityStudySummaryRows?: UserStudySummaryRow[];
} {
  const currentUser = useWdkService(
    (wdkService) => wdkService.getCurrentUser(),
    []
  );

  const { diyDatasets, communityDatasets } = useDiyDatasets();

  const userStudySummaryRows = formatDatasets(currentUser, diyDatasets);
  const communityStudySummaryRows = formatDatasets(
    currentUser,
    communityDatasets
  );

  return { userStudySummaryRows, communityStudySummaryRows };
}

function formatDatasets(
  currentUser: User | undefined,
  userDatasets: EnrichedUserDataset[] | undefined
) {
  return useMemo(() => {
    if (currentUser == null || userDatasets == null) {
      return undefined;
    }

    return userDatasets.flatMap((userDataset) => {
      return [
        {
          name: userDataset.name,
          userDatasetWorkspaceUrl: userDataset.userDatasetsRoute,
          edaWorkspaceUrl: `${userDataset.baseEdaRoute}/new`,
          summary: userDataset.description ?? '',
          owner:
            userDataset.owner.userId === currentUser.id
              ? 'Me'
              : formatUser(userDataset.owner),
          sharedWith: userDataset.shares?.map(formatUser)?.join(', ') ?? '',
        },
      ];
    });
  }, [currentUser, userDatasets]);
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
