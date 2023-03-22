import React, { Suspense, useMemo } from 'react';

import { useLocation } from 'react-router-dom';

import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { RouteEntry } from '@veupathdb/wdk-client/lib/Core/RouteEntry';

import { communitySite } from '@veupathdb/web-common/lib/config';
import ExternalContentController from '@veupathdb/web-common/lib/controllers/ExternalContentController';

import {
  uploadTypeConfig
} from '@veupathdb/user-datasets/lib/Utils/upload-config';

const UserDatasetRouter = React.lazy(() => import('./controllers/UserDatasetRouter'));

const availableUploadTypes = ['gene-list'];

const USER_DATASETS_HELP_PAGE = 'user_datasets_help.html';

export const userDatasetRoutes: RouteEntry[] = [
  {
    path: '/workspace/datasets',
    exact: false,
    component: function GenomicsUserDatasetRouter() {
      const location = useLocation();

      const helpTabContentUrl = useMemo(
        () => [
          communitySite,
          USER_DATASETS_HELP_PAGE,
          location.search,
          location.hash
        ].join(''),
        [location.search, location.hash]
      );

      return (
        <Suspense fallback={<Loading />}>
          <UserDatasetRouter
            availableUploadTypes={availableUploadTypes}
            detailsPageTitle="My Data Set"
            helpRoute="/workspace/datasets/help"
            workspaceTitle="My Data Sets"
            uploadTypeConfig={uploadTypeConfig}
            helpTabContents={
              <ExternalContentController
                url={helpTabContentUrl}
              />
            }
          />
        </Suspense>
      )
    },
  }
];
