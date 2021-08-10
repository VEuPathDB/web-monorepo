import './globals';
import { endpoint, rootElement, rootUrl } from './constants';
import React, { useEffect } from 'react';
import reportWebVitals from './reportWebVitals';

import { initialize } from '@veupathdb/web-common/lib/bootstrap';
import { Link } from '@veupathdb/wdk-client/lib/Components';
import { RouteEntry } from '@veupathdb/wdk-client/lib/Core/RouteEntry';
import '@veupathdb/wdk-client/lib/Core/Style/index.scss';
import '@veupathdb/web-common/lib/styles/client.scss';

import { Props } from '@veupathdb/wdk-client/lib/Components/Layout/Page';

import { DataRestrictionDaemon } from '@veupathdb/web-common/lib/App/DataRestriction';
import {
  disableRestriction,
  enableRestriction,
  reduxMiddleware,
} from '@veupathdb/web-common/lib/App/DataRestriction/DataRestrictionUtils';
import { useAttemptActionClickHandler } from '@veupathdb/web-common/lib/hooks/dataRestriction';

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
            <li>
              <Link to="/eda/studies">All studies</Link>
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
    Page: (DefaultComponent: React.ComponentType<Props>) => {
      return function ClinEpiPage(props: Props) {
        useEffect(() => {
          if (process.env.REACT_APP_DISABLE_DATA_RESTRICTIONS === 'true') {
            disableRestriction();
          } else {
            enableRestriction();
          }
        }, []);

        useAttemptActionClickHandler();

        return (
          <>
            <DataRestrictionDaemon />
            <DefaultComponent {...props} />
          </>
        );
      };
    },
  },
  endpoint,
  additionalMiddleware: [reduxMiddleware],
} as any);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
