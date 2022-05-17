import './globals';

import { RouteComponentProps } from 'react-router-dom';

import { partial } from 'lodash';

import { initialize } from '@veupathdb/web-common/lib/bootstrap';
import { RouteEntry } from '@veupathdb/wdk-client/lib/Core/RouteEntry';
import Header from './Header';
import Home from './Home';
import { endpoint, rootElement, rootUrl } from './constants';
import reportWebVitals from './reportWebVitals';

import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';

import UserDatasetHelp from './lib/Components/UserDatasetHelp';
import { quotaSize } from './lib/Components/UserDatasetUtils';
import { UserDatasetRouter } from './lib/Controllers/UserDatasetRouter';
import { wrapWdkService } from './lib/Service';
import { wrapStoreModules } from './lib/StoreModules';
import {
  makeDatasetUploadPageConfig,
  uploadTypeConfig,
} from './lib/Utils/upload-config';

import '@veupathdb/wdk-client/lib/Core/Style/index.scss';
import '@veupathdb/web-common/lib/styles/client.scss';

const availableUploadTypes = process.env.REACT_APP_AVAILABLE_UPLOAD_TYPES?.trim().split(
  /\s*,\s*/g
);

const hasDirectUpload = makeDatasetUploadPageConfig(
  availableUploadTypes,
  uploadTypeConfig
).hasDirectUpload;

const datasetImportUrl = hasDirectUpload ? '/dataset-import' : undefined;

initialize({
  rootUrl,
  rootElement,
  wrapRoutes: (routes: any): RouteEntry[] => [
    {
      path: '/',
      component: (props: RouteComponentProps<void>) => <Home />,
    },
    {
      path: '/user-datasets',
      exact: false,
      component: () => (
        <UserDatasetRouter
          availableUploadTypes={availableUploadTypes}
          detailsPageTitle="My Data Set"
          helpRoute="/help"
          workspaceTitle="My Data Sets"
          uploadTypeConfig={uploadTypeConfig}
        />
      ),
    },
    {
      path: '/help',
      exact: true,
      component: function DevHelp() {
        const projectName = useWdkService(
          async (wdkService) => (await wdkService.getConfig()).displayName,
          []
        );

        return projectName == null ? (
          <Loading />
        ) : (
          <UserDatasetHelp
            hasDirectUpload={hasDirectUpload}
            projectName={projectName}
            quotaSize={quotaSize}
            workspaceTitle="My Data Sets"
          />
        );
      },
    },
    ...routes,
  ],
  componentWrappers: {
    SiteHeader: () => Header,
  },
  endpoint,
  wrapStoreModules,
  wrapWdkService: partial(
    wrapWdkService,
    datasetImportUrl == null || process.env.REACT_APP_WDK_SERVICE_URL == null
      ? undefined
      : {
          datasetImportUrl,
          fullWdkServiceUrl: process.env.REACT_APP_WDK_SERVICE_URL,
        }
  ),
} as any);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
