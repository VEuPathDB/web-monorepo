import './globals';
import { endpoint, rootElement, rootUrl } from './constants';
import React from 'react';
// import './index.css';
import reportWebVitals from './reportWebVitals';
// import { initialize } from '@veupathdb/wdk-client/lib/Core';
import { initialize } from '@veupathdb/web-common/lib/bootstrap';
import { RouteEntry } from '@veupathdb/wdk-client/lib/Core/RouteEntry';
import { Redirect, RouteComponentProps } from 'react-router';
import { EDAAnalysisList, EDAWorkspace } from './lib';

import '@veupathdb/wdk-client/lib/Core/Style/index.scss';
import '@veupathdb/web-common/lib/styles/client.scss';
import Header from './Header';

initialize({
  rootUrl,
  rootElement,
  wrapRoutes: (routes: any): RouteEntry[] => [
    {
      path: '/',
      component: () => <Redirect to="/eda/DS_841a9f5259" />,
    },
    {
      path: '/eda/:studyId/:analysisId',
      exact: false,
      component: (
        props: RouteComponentProps<{ studyId: string; analysisId: string }>
      ) => (
        <EDAWorkspace {...props.match.params} edaServiceUrl="/eda-service" />
      ),
    },
    {
      path: '/eda/:studyId',
      component: (props: RouteComponentProps<{ studyId: string }>) => (
        <EDAAnalysisList studyId={props.match.params.studyId} />
      ),
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
