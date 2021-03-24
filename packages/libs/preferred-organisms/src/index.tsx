import './globals';
import { Suspense } from 'react';
import { RouteComponentProps } from 'react-router';
import { initialize } from '@veupathdb/web-common/lib/bootstrap';
import { WdkService } from '@veupathdb/wdk-client/lib/Core';
import { RouteEntry } from '@veupathdb/wdk-client/lib/Core/RouteEntry';
import Header from './Header';
import Home from './Home';
import { endpoint, rootElement, rootUrl } from './constants';
import reportWebVitals from './reportWebVitals';

import { PreferredOrganismsConfigController } from './PreferredOrganismsConfigController';

import { RecoilRoot } from 'recoil';

import '@veupathdb/wdk-client/lib/Core/Style/index.scss';
import '@veupathdb/web-common/lib/styles/client.scss';

import { makePreferredOrganismsRecoilState } from './lib/recoil-state/preferredOrganisms';

const { wdkService }: { wdkService: WdkService } = initialize({
  rootUrl,
  rootElement,
  wrapRoutes: (routes: any): RouteEntry[] => [
    {
      path: '/',
      component: (props: RouteComponentProps<void>) => (
        <Suspense fallback={null}>
          <Home />
        </Suspense>
      ),
    },
    {
      path: '/preferred-organisms',
      component: () => (
        <Suspense fallback={null}>
          <PreferredOrganismsConfigController />
        </Suspense>
      ),
    },
    ...routes,
  ],
  componentWrappers: {
    SiteHeader: () => Header,
    Page: (DefaultComponent: React.ComponentType) => (props: any) => (
      <RecoilRoot>
        <DefaultComponent {...props} />
      </RecoilRoot>
    ),
  },
  endpoint,
} as any);

export const {
  availableOrganisms,
  preferredOrganisms,
  projectId,
  organismTree,
} = makePreferredOrganismsRecoilState(wdkService);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
