import React, { Suspense, useMemo } from 'react';

import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { RouteEntry } from '@veupathdb/wdk-client/lib/Core/RouteEntry';

import { makeEdaRoute } from '@veupathdb/web-common/lib/routes';
import { diyUserDatasetIdToWdkRecordId } from '@veupathdb/web-common/lib/util/diyDatasets';

import IsaDatasetDetail from '@veupathdb/user-datasets/lib/Components/Detail/IsaDatasetDetail';

import {
  UserDatasetDetailProps
} from '@veupathdb/user-datasets/lib/Controllers/UserDatasetDetailController';

import {
  uploadTypeConfig
} from '@veupathdb/user-datasets/lib/Utils/upload-config';

const UserDatasetRouter = React.lazy(() => import('../controllers/UserDatasetRouter'));

const availableUploadTypes = ['isasimple'];

export const userDatasetRoutes: RouteEntry[] = [
  {
    path: '/workspace/datasets',
    exact: false,
    component: function ClinEpiUserDatasetRouter() {
      const detailComponentsByTypeName = useMemo(() => ({
        ISA: function ClinEpiIsaDatasetDetail(props: UserDatasetDetailProps) {
          const wdkDatasetId = diyUserDatasetIdToWdkRecordId(props.userDataset.id);

          return (
            <IsaDatasetDetail
              {...props}
              edaWorkspaceUrl={`${makeEdaRoute(wdkDatasetId)}/new`}
            />
          )
        }
      }), []);

      return (
        <Suspense fallback={<Loading />}>
          <UserDatasetRouter
            availableUploadTypes={availableUploadTypes}
            detailsPageTitle="My User Study"
            helpRoute="/workspace/datasets/help"
            workspaceTitle="My User Studies"
            uploadTypeConfig={uploadTypeConfig}
            detailComponentsByTypeName={detailComponentsByTypeName}
          />
        </Suspense>
      );
    },
  }
];
