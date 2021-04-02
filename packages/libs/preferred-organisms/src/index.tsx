import './globals';
import { Suspense } from 'react';
import { initialize } from '@veupathdb/web-common/lib/bootstrap';
import { RouteEntry } from '@veupathdb/wdk-client/lib/Core/RouteEntry';
import Header from './Header';
import Home from './Home';
import { endpoint, rootElement, rootUrl } from './constants';
import reportWebVitals from './reportWebVitals';

import { PreferredOrganismsConfigController } from './lib/controllers/PreferredOrganismsConfigController';

import { RecoilRoot } from 'recoil';

import '@veupathdb/wdk-client/lib/Core/Style/index.scss';
import '@veupathdb/web-common/lib/styles/client.scss';

import '../src/lib/components/ReferenceStrains.scss';

initialize({
  rootUrl,
  rootElement,
  wrapRoutes: (routes: any): RouteEntry[] => [
    {
      path: '/',
      component: () => (
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

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
