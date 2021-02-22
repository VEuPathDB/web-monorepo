import './globals';
import React from 'react';
import { Redirect, RouteComponentProps } from 'react-router';
import { initialize } from '@veupathdb/web-common/lib/bootstrap';
import { NotFoundController } from '@veupathdb/wdk-client/lib/Controllers';
import {
  BlastSummaryViewPlugin,
  GenomeSummaryViewPlugin,
  ResultTableSummaryViewPlugin,
} from '@veupathdb/wdk-client/lib/Plugins';
import { RouteEntry } from '@veupathdb/wdk-client/lib/Core/RouteEntry';
import { ClientPluginRegistryEntry } from '@veupathdb/wdk-client/lib/Utils/ClientPlugin';

import Header from './Header';
import Home from './Home';
import { endpoint, rootElement, rootUrl } from './constants';
import reportWebVitals from './reportWebVitals';

import { BlastForm } from './lib/components/BlastForm';
import { BlastWorkspace } from './lib/components/BlastWorkspace';
import { BlastWorkspaceResult } from './lib/components/BlastWorkspaceResult';
import { parseBlastResultSubpath } from './lib/utils/routes';
import { wrapWdkService } from './lib/utils/wdkServiceIntegration';

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
      path: '/workspace/blast/:tab(new|all|help)?',
      component: BlastWorkspace,
    },
    {
      path:
        '/workspace/blast/result/:jobId/:subPath(combined|individual/\\d+)?',
      component: (
        props: RouteComponentProps<{
          jobId: string;
          subPath: string | undefined;
        }>
      ) => {
        const selectedResult = parseBlastResultSubpath(
          props.match.params.subPath
        );

        return selectedResult != null && selectedResult.type === 'unknown' ? (
          <NotFoundController />
        ) : (
          <BlastWorkspaceResult
            jobId={props.match.params.jobId}
            selectedResult={selectedResult}
          />
        );
      },
    },
    {
      path: '/search/:recordClass/:searchName(.*MultiBlast)',
      component: (
        props: RouteComponentProps<{
          recordClass: string;
        }>
      ) => (
        <Redirect
          to={`/workspace/blast/new?recordType=${props.match.params.recordClass}`}
        />
      ),
    },
    ...routes,
  ],
  componentWrappers: {
    SiteHeader: () => Header,
  },
  pluginConfig: [
    {
      type: 'questionForm',
      test: ({ question }) => question?.urlSegment.endsWith('MultiBlast'),
      component: BlastForm,
    },
    {
      type: 'summaryView',
      name: '_default',
      component: ResultTableSummaryViewPlugin,
    },
    {
      type: 'summaryView',
      name: 'genomic-view',
      component: GenomeSummaryViewPlugin,
    },
    {
      type: 'summaryView',
      name: 'blast-view',
      component: BlastSummaryViewPlugin,
    },
  ] as ClientPluginRegistryEntry<any>[],
  wrapWdkService,
  endpoint,
} as any);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
