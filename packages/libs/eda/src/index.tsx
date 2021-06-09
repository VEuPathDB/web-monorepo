import './globals';
import { endpoint, rootElement, rootUrl } from './constants';
import React from 'react';
import reportWebVitals from './reportWebVitals';

import { initialize } from '@veupathdb/web-common/lib/bootstrap';
import { Link } from '@veupathdb/wdk-client/lib/Components';
import { RouteEntry } from '@veupathdb/wdk-client/lib/Core/RouteEntry';
import '@veupathdb/wdk-client/lib/Core/Style/index.scss';
import '@veupathdb/web-common/lib/styles/client.scss';

import Header from './Header';
import { MapVeuContainer } from './lib/mapveu';
import { WorkspaceRouter } from './lib/workspace/WorkspaceRouter';

import './index.css';

const subsettingServiceUrl = '/eda-subsetting-service';
const dataServiceUrl = '/eda-data-service';

initialize({
  rootUrl,
  rootElement,
  wrapRoutes: (routes: any): RouteEntry[] => [
    {
      path: '/',
      component: () => (
        <div>
          <h1>EDA Links</h1>
          <ul>
            <li>
              <Link to="/eda">EDA Workspace</Link>
            </li>
          </ul>
        </div>
      ),
    },
    {
      path: '/eda',
      exact: false,
      component: () => (
        <WorkspaceRouter
          subsettingServiceUrl={subsettingServiceUrl}
          dataServiceUrl={dataServiceUrl}
        />
      ),
    },
    {
      path: '/mapveu',
      component: MapVeuContainer,
      exact: false,
    },
    ...routes,
  ],
  componentWrappers: {
    SiteHeader: () => Header,
  },
  endpoint,
} as any);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
