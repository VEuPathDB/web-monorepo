import './globals';
import { endpoint, rootElement, rootUrl } from './constants';
import React from 'react';
// import './index.css';
import reportWebVitals from './reportWebVitals';
// import { initialize } from '@veupathdb/wdk-client/lib/Core';
import { initialize } from '@veupathdb/web-common/lib/bootstrap';
import { RouteEntry } from '@veupathdb/wdk-client/lib/Core/RouteEntry';
import { RouteComponentProps } from 'react-router';
import { EDASessionList, EDAWorkspace } from './lib/workspace';

import '@veupathdb/wdk-client/lib/Core/Style/index.scss';
import '@veupathdb/web-common/lib/styles/client.scss';
import Header from './Header';
import { MapVeuContainer } from './lib/mapveu';
import { WorkspaceContainer } from './lib/workspace/WorkspaceContainer';
import { Link } from '@veupathdb/wdk-client/lib/Components';
import { StudyList } from './lib/workspace/StudyList';
import { WorkspaceRouter } from './lib/workspace/WorkspaceRouter';

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
              <Link to="/eda/DS_841a9f5259">Variables interface</Link>
            </li>
            <li>
              <Link to="/eda-session/DS_841a9f5259">New Layout</Link>
            </li>
          </ul>
        </div>
      ),
    },
    {
      path: '/eda/:studyId/:sessionId',
      exact: false,
      component: (
        props: RouteComponentProps<{ studyId: string; sessionId: string }>
      ) => (
        <EDAWorkspace
          {...props.match.params}
          edaServiceUrl="/eda-service"
          dataServiceUrl="/eda-data-service"
        />
      ),
    },
    {
      path: '/eda/:studyId',
      component: (props: RouteComponentProps<{ studyId: string }>) => (
        <EDASessionList
          {...props.match.params}
          edaServiceUrl="/eda-service"
          dataServiceUrl="/eda-data-service"
        />
      ),
    },
    {
      path: '/eda-session',
      exact: false,
      component: WorkspaceRouter,
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
