import React, { Suspense, useMemo } from 'react';

import { useLocation } from 'react-router-dom';

import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { RouteEntry } from '@veupathdb/wdk-client/lib/Core/RouteEntry';

import { makeEdaRoute, makeMapRoute } from '@veupathdb/web-common/lib/routes';
import { diyUserDatasetIdToWdkRecordId } from '@veupathdb/user-datasets/lib/Utils/diyDatasets';

import { UserDatasetDetailProps } from '@veupathdb/user-datasets/lib/Controllers/UserDatasetDetailController';

import { uploadTypeConfig } from '@veupathdb/web-common/lib/user-dataset-upload-config';

import {
  communityDatasetsEnabled,
  communitySite,
  edaServiceUrl,
  projectId,
  showExtraMetadata,
} from '@veupathdb/web-common/lib/config';

import ExternalContentController from '@veupathdb/web-common/lib/controllers/ExternalContentController';

import { useConfiguredSubsettingClient } from '@veupathdb/eda/lib/core/hooks/client';
import { useStudyMetadata } from '@veupathdb/eda/lib/core/hooks/study';

const EdaDatasetDetail = React.lazy(
  () =>
    import('@veupathdb/user-datasets/lib/Components/Detail/EdaDatasetDetail')
);

const UserDatasetRouter = React.lazy(
  () => import('../controllers/UserDatasetRouter')
);

const availableUploadTypes = ['isasimple'];

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
          isasimple: function ClinEpiEdaDatasetDetail(
            props: UserDatasetDetailProps
          ) {
            const wdkDatasetId = diyUserDatasetIdToWdkRecordId(
              props.userDataset.id
            );
            const edaStudyMetadata = useEdaStudyMetadata(wdkDatasetId);
            return (
              <EdaDatasetDetail
                {...props}
                edaWorkspaceUrl={`${makeEdaRoute(wdkDatasetId)}/new`}
                edaMapUrl={
                  edaStudyMetadata?.hasMap
                    ? `${makeMapRoute(wdkDatasetId)}/new`
                    : undefined
                }
              />
            );
          },
        }),
        []
      );

      return (
        <Suspense fallback={<Loading />}>
          <UserDatasetRouter
            availableUploadTypes={availableUploadTypes}
            detailsPageTitle="My Study"
            helpRoute="/workspace/datasets/help"
            workspaceTitle="My Studies"
            uploadTypeConfig={uploadTypeConfig}
            detailComponentsByTypeName={detailComponentsByTypeName}
            helpTabContents={
              <ExternalContentController url={helpTabContentUrl} />
            }
            dataNoun={{ singular: 'Study', plural: 'Studies' }}
            enablePublicUserDatasets={!!communityDatasetsEnabled}
            showExtraMetadata={!!showExtraMetadata}
          />
        </Suspense>
      );
    },
  },
];

function useEdaStudyMetadata(wdkDatasetId: string) {
  try {
    const subsettingClient = useConfiguredSubsettingClient(edaServiceUrl);
    return useStudyMetadata(wdkDatasetId, subsettingClient).value;
  } catch (error) {
    console.error(error);
    return undefined;
  }
}
