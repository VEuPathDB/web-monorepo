import './globals';
import { RouteComponentProps } from 'react-router';
import { initialize } from '@veupathdb/web-common/lib/bootstrap';
import {
  RouteEntry,
  parseQueryString,
} from '@veupathdb/wdk-client/lib/Core/RouteEntry';
import Header from './Header';
import Home from './Home';
import { endpoint, rootElement, rootUrl } from './constants';
import reportWebVitals from './reportWebVitals';

import UserDatasetDetailController from './lib/Controllers/UserDatasetDetailController';

import * as userDatasetDetail from './lib/StoreModules/UserDatasetDetailStoreModule';
import * as userDatasetList from './lib/StoreModules/UserDatasetListStoreModule';
import * as userDatasetUpload from './lib/StoreModules/UserDatasetUploadStoreModule';

import UserDatasetsWorkspace from './lib/Components/UserDatasetsWorkspace';

import '@veupathdb/wdk-client/lib/Core/Style/index.scss';
import '@veupathdb/web-common/lib/styles/client.scss';

type WdkStoreModules = typeof import('@veupathdb/wdk-client/lib/StoreModules').default;

initialize({
  rootUrl,
  rootElement,
  wrapRoutes: (routes: any): RouteEntry[] => [
    {
      path: '/',
      component: (props: RouteComponentProps<void>) => <Home />,
    },
    {
      path: '/workspace/datasets/:id(\\d+)',
      requiresLogin: true,
      component: (props: RouteComponentProps<{ id: string }>) => {
        // FIXME Remove this requirement from the component by updating action creators
        const rootUrl = window.location.origin;

        return (
          <UserDatasetDetailController
            {...props.match.params}
            rootUrl={rootUrl}
          />
        );
      },
    },
    {
      path: '/workspace/datasets',
      exact: false,
      requiresLogin: false, // uses custom guest views
      component: (props: RouteComponentProps<{}>) => (
        <UserDatasetsWorkspace
          rootPath={props.match.path}
          urlParams={parseQueryString(props)}
        />
      ),
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
} as any);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
