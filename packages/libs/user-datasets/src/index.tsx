import './globals';

import { RouteComponentProps } from 'react-router';

import { mapValues } from 'lodash';

import { initialize } from '@veupathdb/web-common/lib/bootstrap';
import { WdkService } from '@veupathdb/wdk-client/lib/Core';
import { RouteEntry } from '@veupathdb/wdk-client/lib/Core/RouteEntry';
import Header from './Header';
import Home from './Home';
import { endpoint, rootElement, rootUrl } from './constants';
import reportWebVitals from './reportWebVitals';

import { UserDatasetRouter } from './lib/Controllers/UserDatasetRouter';

import { userDatasetsServiceWrappers } from './lib/Service/UserDatasetWrappers';
import { userDatasetUploadServiceWrappers } from './lib/Service/UserDatasetUploadWrappers';

import * as userDatasetDetail from './lib/StoreModules/UserDatasetDetailStoreModule';
import * as userDatasetList from './lib/StoreModules/UserDatasetListStoreModule';
import * as userDatasetUpload from './lib/StoreModules/UserDatasetUploadStoreModule';

import '@veupathdb/wdk-client/lib/Core/Style/index.scss';
import '@veupathdb/web-common/lib/styles/client.scss';

type WdkStoreModules = typeof import('@veupathdb/wdk-client/lib/StoreModules').default;

const hasDirectUpload = process.env.REACT_APP_HAS_DIRECT_UPLOAD === 'true';

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
      component: () => <UserDatasetRouter hasDirectUpload={hasDirectUpload} />,
    },
    ...routes,
  ],
  componentWrappers: {
    SiteHeader: () => Header,
  },
  endpoint,
  wrapStoreModules: (storeModules: WdkStoreModules) => ({
    ...storeModules,
    userDatasetDetail,
    userDatasetList,
    userDatasetUpload,
  }),
  wrapWdkService: (wdkService: WdkService) => ({
    ...wdkService,
    ...mapValues(
      {
        ...userDatasetsServiceWrappers,
        ...userDatasetUploadServiceWrappers,
      },
      (wdkServiceWrapper) => wdkServiceWrapper(wdkService)
    ),
  }),
} as any);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
