import React, { Suspense } from 'react';

import { communitySite } from 'ebrc-client/config';

import TreeDataViewerController from './controllers/TreeDataViewerController';
import ContactUsController from './controllers/ContactUsController';
import GalaxyTermsController from './controllers/GalaxyTermsController';
import ExternalContentController from 'ebrc-client/controllers/ExternalContentController';
import { ResetSessionController } from 'ebrc-client/controllers/ResetSessionController';
import StudyAccessController from './controllers/StudyAccessController';
import { Loading } from '@veupathdb/wdk-client/lib/Components';


export const STATIC_ROUTE_PATH = '/static-content';

export function makeEdaRoute(studyId) {
  return '/workspace/analyses' + (studyId ? `/${studyId}` : '');
}

const edaServiceUrl = '/eda-data';

const WorkspaceRouter = React.lazy(() => import('./WorkspaceRouter'));


/**
 * Wrap WDK Routes
 * Jan 9 2019: routes here connect to a react component that is mostly shared across websites.
 * For example: the route '/about' is not here because the content (in About.jsx) is not shared.
 */
export const wrapRoutes = wdkRoutes => [

  // FIXME: Should this be a ClinEpi-level route?
  { 
    path: '/study-access/:datasetId',
    component: props => <StudyAccessController {...props.match.params}/>,
    requiresLogin: true
  },

  {
    path: makeEdaRoute(),
    exact: false,
    component: () => (
      <Suspense fallback={<Loading/>}>
        <WorkspaceRouter
          dataServiceUrl={edaServiceUrl}
          subsettingServiceUrl={edaServiceUrl}
          userServiceUrl={edaServiceUrl}
        />
      </Suspense>
    )
  },

  {
    path: '/eda',
    exact: false,
    component: () => (
      <Suspense fallback={<Loading/>}>
        <WorkspaceRouter
          dataServiceUrl={edaServiceUrl}
          subsettingServiceUrl={edaServiceUrl}
          userServiceUrl={edaServiceUrl}
        />
      </Suspense>
    )
  },


  {
    path: '/tree-data-view',
    component: () => <TreeDataViewerController/>
  },

  {
    path: '/galaxy-orientation',
    component: () => <GalaxyTermsController/>
  },

  {
    path: '/galaxy-orientation/sign-up',
    component: () => <GalaxyTermsController signUp />
  },

  {
    path: '/contact-us',
    component: (props) => {
      const params = new URLSearchParams(props.location.search);
      return <ContactUsController context={params.get('ctx')}/>
    }
  },

  {
    path: `${STATIC_ROUTE_PATH}/:path*`,
    component: props =>
      <ExternalContentController
        url={communitySite + props.match.params.path + props.location.search + props.location.hash}
      />
  },

  {
    path: '/downloads/:path*',
    component: props =>
      <iframe
        src={`/common/downloads/${(props.match.params.path || '') + props.location.search + props.location.hash}`}
        style={{
          width: '100%',
          height: '100%',
          border: 'none'
        }}
        onLoad={event => {
          window.scrollTo(0, 0);
          const iframe = event.target;
          const pathname = iframe.contentWindow.location.pathname.replace(/^\/common/, '');
          const { search, hash } = iframe.contentWindow.location;
          const href = props.history.createHref({
            ...props.location,
            pathname,
            search,
            hash
          });
          window.history.replaceState({}, '', href);
          iframe.style.height = iframe.contentDocument.body.scrollHeight + 'px';

          if (pathname == '/downloads/') {
            // remove Parent Directory link
            const img = iframe.contentDocument.body.querySelector('hr + img');
            if (img == null) return;
            for (let i = 0; i < 3; i++) {
              img.nextSibling.remove();
            }
            img.remove();
          }
        }}
      />
  },

  {
    path: '/reset-session',
    component: ResetSessionController
  },

  ...wdkRoutes
];
