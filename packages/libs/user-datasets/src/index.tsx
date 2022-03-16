import './globals';

import { RouteComponentProps } from 'react-router';

import { partial } from 'lodash';

import { initialize } from '@veupathdb/web-common/lib/bootstrap';
import { RouteEntry } from '@veupathdb/wdk-client/lib/Core/RouteEntry';
import Header from './Header';
import Home from './Home';
import { endpoint, rootElement, rootUrl } from './constants';
import reportWebVitals from './reportWebVitals';

import { UserDatasetRouter } from './lib/Controllers/UserDatasetRouter';
import { wrapWdkService } from './lib/Service';
import { wrapStoreModules } from './lib/StoreModules';

import '@veupathdb/wdk-client/lib/Core/Style/index.scss';
import '@veupathdb/web-common/lib/styles/client.scss';

const hasDirectUpload = process.env.REACT_APP_HAS_DIRECT_UPLOAD === 'true';

const datasetImportUrl = !hasDirectUpload ? undefined : '/dataset-import';

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
  wrapStoreModules,
  wrapWdkService: partial(wrapWdkService, datasetImportUrl),
} as any);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
