import React, { Suspense } from 'react';

import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { RouteEntry } from '@veupathdb/wdk-client/lib/Core/RouteEntry';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';

import {
  quotaSize
} from '@veupathdb/user-datasets/lib/Components/UserDatasetUtils';
import {
  uploadTypeConfig
} from '@veupathdb/user-datasets/lib/Utils/upload-config';

const UserDatasetHelp = React.lazy(() => import('@veupathdb/user-datasets/lib/Components/UserDatasetHelp'));
const UserDatasetRouter = React.lazy(() => import('../controllers/UserDatasetRouter'));

const availableUploadTypes = ['biom'];

export const userDatasetRoutes: RouteEntry[] = [
  {
    path: '/workspace/datasets',
    exact: false,
    component: function MicrobiomeUserDatasetRouter() {
      const projectName = useWdkService(
        async wdkService => (await wdkService.getConfig()).displayName,
        []
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
              projectName == null
                ? <Loading />
                : <UserDatasetHelp
                    hasDirectUpload={availableUploadTypes.length > 0}
                    projectName={projectName}
                    quotaSize={quotaSize}
                    workspaceTitle="My Data Sets"
                  />
            }
          />
        </Suspense>
      );
    }
  }
];
