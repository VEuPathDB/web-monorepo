import React, { Suspense, useCallback } from 'react';

import { useDispatch } from 'react-redux';
import { Redirect } from 'react-router';

import { communitySite } from './config';

import TreeDataViewerController from './controllers/TreeDataViewerController';
import ContactUsController from './controllers/ContactUsController';
import GalaxyTermsController from './controllers/GalaxyTermsController';
import ExternalContentController from './controllers/ExternalContentController';
import { ResetSessionController } from './controllers/ResetSessionController';

import StudyAccessController from '@veupathdb/study-data-access/lib/study-access/components/StudyAccessController';

import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { showLoginForm as showLoginFormAction } from '@veupathdb/wdk-client/lib/Actions/UserSessionActions';

import {
  edaExampleAnalysesAuthors,
  edaServiceUrl,
  edaSingleAppMode,
  showUnreleasedData,
} from './config';
import { EdaMapController } from './controllers/EdaMapController';

export const STATIC_ROUTE_PATH = '/static-content';

export function makeEdaRoute(studyId) {
  return '/workspace/analyses' + (studyId ? `/${studyId}` : '');
}

export function makeMapRoute(studyId) {
  return '/workspace/maps' + (studyId ? `/${studyId}` : '');
}

const EdaWorkspace = React.lazy(() => import('@veupathdb/eda/lib/workspace'));

/**
 * Wrap WDK Routes
 * Jan 9 2019: routes here connect to a react component that is mostly shared across websites.
 * For example: the route '/about' is not here because the content (in About.jsx) is not shared.
 */
export const wrapRoutes = (wdkRoutes) => [
  // FIXME: Should this be a ClinEpi-level route?
  {
    path: '/study-access/:datasetId',
    component: (props) => <StudyAccessController {...props.match.params} />,
    requiresLogin: true,
  },

  {
    path: makeEdaRoute(),
    exact: false,
    component: function EdaRoute() {
      const dispatch = useDispatch();
      const showLoginForm = useCallback(() => {
        dispatch(showLoginFormAction());
      }, [dispatch]);

      return (
        <Suspense fallback={<Loading />}>
          <EdaWorkspace
            showUnreleasedData={showUnreleasedData}
            edaServiceUrl={edaServiceUrl}
            exampleAnalysesAuthors={edaExampleAnalysesAuthors}
            sharingUrlPrefix={window.location.origin}
            showLoginForm={showLoginForm}
            singleAppMode={edaSingleAppMode}
          />
        </Suspense>
      );
    },
  },

  {
    path: makeMapRoute(),
    exact: true,
    component: EdaMapController,
  },

  {
    path: makeMapRoute(),
    exact: false,
    isFullscreen: true,
    rootClassNameModifier: 'MapVEu',
    component: EdaMapController,
  },

  {
    path: '/maps',
    exact: false,
    isFullscreen: true,
    rootClassNameModifier: 'MapVEu',
    component: () => <Redirect to={makeMapRoute()} />,
  },

  {
    path: '/eda',
    exact: false,
    component: ({ location }) => (
      <Redirect
        to={{
          ...location,
          pathname: location.pathname.replace(/^\/eda/, makeEdaRoute()),
        }}
      />
    ),
  },

  {
    path: '/tree-data-view',
    component: () => <TreeDataViewerController />,
  },

  {
    path: '/galaxy-orientation',
    component: () => <GalaxyTermsController />,
  },

  {
    path: '/galaxy-orientation/sign-up',
    component: () => <GalaxyTermsController signUp />,
  },

  {
    path: '/contact-us',
    component: (props) => {
      const params = new URLSearchParams(props.location.search);
      return <ContactUsController context={params.get('ctx')} />;
    },
  },

  {
    path: `${STATIC_ROUTE_PATH}/:path*`,
    component: (props) => (
      <ExternalContentController
        url={
          communitySite +
          props.match.params.path +
          props.location.search +
          props.location.hash
        }
      />
    ),
  },

  {
    path: '/downloads/:path*',
    component: (props) => (
      <iframe
        src={`/common/downloads/${
          (props.match.params.path || '') +
          props.location.search +
          props.location.hash
        }`}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
        onLoad={(event) => {
          window.scrollTo(0, 0);
          const iframe = event.target;
          const pathname = iframe.contentWindow.location.pathname.replace(
            /^\/common/,
            ''
          );
          const { search, hash } = iframe.contentWindow.location;
          const href = props.history.createHref({
            ...props.location,
            pathname,
            search,
            hash,
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
    ),
  },

  {
    path: '/reset-session',
    component: ResetSessionController,
  },

  ...wdkRoutes,
];
