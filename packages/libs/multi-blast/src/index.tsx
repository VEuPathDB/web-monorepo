import './globals';
import React, { Suspense } from 'react';
import { Redirect, RouteComponentProps } from 'react-router';
import { RecoilRoot } from 'recoil';
import { initialize } from '@veupathdb/web-common/lib/bootstrap';
import {
  BlastSummaryViewPlugin,
  GenomeSummaryViewPlugin,
  ResultTableSummaryViewPlugin,
} from '@veupathdb/wdk-client/lib/Plugins';
import { RouteEntry } from '@veupathdb/wdk-client/lib/Core/RouteEntry';
import { ClientPluginRegistryEntry } from '@veupathdb/wdk-client/lib/Utils/ClientPlugin';

import {
  OrganismParam,
  isOrganismParam,
} from '@veupathdb/preferred-organisms/lib/components/OrganismParam';
import { PreferredOrganismsConfigController } from '@veupathdb/preferred-organisms/lib/controllers/PreferredOrganismsConfigController';

import Header from './Header';
import Home from './Home';
import { endpoint, rootElement, rootUrl } from './constants';
import reportWebVitals from './reportWebVitals';

import { BlastForm } from './lib/components/BlastForm';
import { BlastQuestionController } from './lib/controllers/BlastQuestionController';
import { BlastWorkspaceRouter } from './lib/controllers/BlastWorkspaceRouter';
import { isMultiBlastQuestion } from './lib/utils/pluginConfig';
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
      path: '/workspace/blast',
      exact: false,
      component: BlastWorkspaceRouter,
    },
    {
      path: '/preferred-organisms',
      component: () => (
        <Suspense fallback={null}>
          <PreferredOrganismsConfigController />
        </Suspense>
      ),
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
    Page: (DefaultComponent: React.ComponentType) => (props: any) =>
      (
        <RecoilRoot>
          <DefaultComponent {...props} />
        </RecoilRoot>
      ),
  },
  pluginConfig: [
    {
      type: 'questionController',
      test: isMultiBlastQuestion,
      component: BlastQuestionController,
    },
    {
      type: 'questionForm',
      test: isMultiBlastQuestion,
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
    {
      type: 'questionFormParameter',
      test: ({ parameter }) => parameter != null && isOrganismParam(parameter),
      component: OrganismParam,
    },
  ] as ClientPluginRegistryEntry<any>[],
  wrapWdkService,
  endpoint,
} as any);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
