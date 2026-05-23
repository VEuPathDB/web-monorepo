import React, { Suspense, useMemo } from 'react';

import { useLocation } from 'react-router-dom';

import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { RouteEntry } from '@veupathdb/wdk-client/lib/Core/RouteEntry';

import { makeEdaRoute } from '@veupathdb/web-common/lib/routes';
import { diyUserDatasetIdToWdkRecordId } from '@veupathdb/user-datasets/lib/Utils/diyDatasets';

import { DetailViewProps } from '@veupathdb/user-datasets/lib/Components/Detail/UserDatasetDetail';

import {
  uploadFormConfigurators,
  userDatasetTypeConfigs,
} from '@veupathdb/web-common/lib/user-dataset-upload-config';

import {
  communityDatasetsEnabled,
  communitySite,
  projectId,
} from '@veupathdb/web-common/lib/config';

import ExternalContentController from '@veupathdb/web-common/lib/controllers/ExternalContentController';

const EdaDatasetDetail = React.lazy(
  () =>
    import('@veupathdb/user-datasets/lib/Components/Detail/EdaDatasetDetail')
);

const UserDatasetRouter = React.lazy(
  () => import('../controllers/UserDatasetRouter')
);

const USER_DATASETS_HELP_PAGE = `${projectId}/user_datasets_help.html`;

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

      const detailComponentsByTypeName = useMemo(
        () => ({
          biom: function MbioEdaDatasetDetail(props: DetailViewProps) {
            const wdkDatasetId = diyUserDatasetIdToWdkRecordId(
              props.userDataset.datasetId
            );

            return (
              <EdaDatasetDetail
                {...props}
                edaWorkspaceUrl={`${makeEdaRoute(wdkDatasetId)}/new`}
              />
            );
          },
        }),
        []
      );

      return (
        <Suspense fallback={<Loading />}>
          <UserDatasetRouter
            uploadFormConfigurators={uploadFormConfigurators}
            detailsPageTitle="My Study"
            helpRoute="/workspace/datasets/help"
            workspaceTitle="My Studies"
            datasetTypeConfigs={userDatasetTypeConfigs}
            detailComponentsByTypeName={detailComponentsByTypeName}
            helpTabContents={
              <ExternalContentController url={helpTabContentUrl} />
            }
            dataNoun={{ singular: 'Study', plural: 'Studies' }}
            enablePublicUserDatasets={!!communityDatasetsEnabled}
          />
        </Suspense>
      );
    },
  },
];
