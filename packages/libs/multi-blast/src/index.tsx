import './globals';
import React from 'react';
import { Redirect, RouteComponentProps } from 'react-router';
import { initialize } from '@veupathdb/web-common/lib/bootstrap';
import { RouteEntry } from '@veupathdb/wdk-client/lib/Core/RouteEntry';
import { ClientPluginRegistryEntry } from '@veupathdb/wdk-client/lib/Utils/ClientPlugin';

import Header from './Header';
import Home from './Home';
import { endpoint, rootElement, rootUrl } from './constants';
import reportWebVitals from './reportWebVitals';

import { BlastForm } from './lib/components/BlastForm';
import { BlastWorkspace } from './lib/components/BlastWorkspace';
import { BlastWorkspaceResult } from './lib/components/BlastWorkspaceResult';

import '@veupathdb/wdk-client/lib/Core/Style/index.scss';
import '@veupathdb/web-common/lib/styles/client.scss';

import './index.css';

initialize({
  rootUrl,
  rootElement,
  wrapRoutes: (routes: any): RouteEntry[] => [
    {
      path: '/',
      component: (props: RouteComponentProps<void>) => <Home />,
    },
    {
      path: '/workspace/blast/result/:jobId/:subPath*',
      component: (
        props: RouteComponentProps<{ jobId: string; subPath: string }>
      ) => (
        <BlastWorkspaceResult
          jobId={props.match.params.jobId}
          subPath={props.match.params.subPath}
        />
      ),
    },
    {
      path: '/workspace/blast',
      exact: false,
      component: BlastWorkspace,
    },
    {
      path: '/search/transcript/GenesByMultiBlast',
      component: () => <Redirect to="/workspace/blast" />,
    },
    ...routes,
  ],
  componentWrappers: {
    SiteHeader: () => Header,
  },
  pluginConfig: [
    {
      type: 'questionForm',
      name: 'GenesByMultiBlast',
      component: BlastForm,
    },
  ] as ClientPluginRegistryEntry<any>[],
  endpoint,
} as any);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
