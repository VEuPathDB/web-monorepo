import React, { Suspense, useMemo } from 'react';

import { useLocation } from 'react-router-dom';

import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { RouteEntry } from '@veupathdb/wdk-client/lib/Core/RouteEntry';

import {
  communityDatasetsEnabled,
  communitySite,
} from '@veupathdb/web-common/lib/config';

import ExternalContentController from '@veupathdb/web-common/lib/controllers/ExternalContentController';

import { UserDatasetWorkspaceConfig } from '@veupathdb/web-common/src/user-dataset-upload-config';

const UserDatasetRouter = React.lazy(
  () => import('../controllers/UserDatasetRouter')
);

const USER_DATASETS_HELP_PAGE = `dataExplorer/user_datasets_help.html`;

export const userDatasetRoutes: RouteEntry[] = [
  {
    path: '/workspace/datasets',
    exact: false,
    component: function ClinEpiUserDatasetRouter() {
      const location = useLocation();

      const helpTabContentUrl = useMemo(
        () =>
          [
            communitySite,
            USER_DATASETS_HELP_PAGE,
            location.search,
            location.hash,
          ].join(''),
        [location.search, location.hash]
      );

      return (
        <Suspense fallback={<Loading />}>
          <UserDatasetRouter
            workspaceConfig={UserDatasetWorkspaceConfig}
            detailsPageTitle="My Dataset"
            helpRoute="/workspace/datasets/help"
            workspaceTitle="My Datasets"
            helpTabContents={
              <ExternalContentController url={helpTabContentUrl} />
            }
            dataNoun={{ singular: 'Dataset', plural: 'Datasets' }}
            enablePublicUserDatasets={!!communityDatasetsEnabled}
          />
        </Suspense>
      );
    },
  },
];
