import React, { Suspense } from 'react';

import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { RouteEntry } from '@veupathdb/wdk-client/lib/Core/RouteEntry';

import {
  uploadTypeConfig
} from '@veupathdb/user-datasets/lib/Utils/upload-config';

const UserDatasetRouter = React.lazy(() => import('../controllers/UserDatasetRouter'));

const availableUploadTypes = ['isasimple'];

export const userDatasetRoutes: RouteEntry[] = [
  {
    path: '/workspace/datasets',
    exact: false,
    component: () => (
      <Suspense fallback={<Loading />}>
        <UserDatasetRouter
          availableUploadTypes={availableUploadTypes}
          detailsPageTitle="My Data Set"
          helpRoute="/workspace/datasets/help"
          workspaceTitle="My Studies"
          uploadTypeConfig={uploadTypeConfig}
        />
      </Suspense>
    ),
  }
];
