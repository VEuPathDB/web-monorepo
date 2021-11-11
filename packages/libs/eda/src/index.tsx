import './globals'; // Don't move this. There is a brittle dependency that relies on this being first.
import React, { useEffect } from 'react';

import { initialize } from '@veupathdb/web-common/lib/bootstrap';
import { Link } from '@veupathdb/wdk-client/lib/Components';
import { RouteEntry } from '@veupathdb/wdk-client/lib/Core/RouteEntry';
import '@veupathdb/wdk-client/lib/Core/Style/index.scss';
import '@veupathdb/web-common/lib/styles/client.scss';
import { Props } from '@veupathdb/wdk-client/lib/Components/Layout/Page';

import { DataRestrictionDaemon } from '@veupathdb/study-data-access/lib/data-restriction';
import {
  disableRestriction,
  enableRestriction,
  reduxMiddleware,
} from '@veupathdb/study-data-access/lib/data-restriction/DataRestrictionUtils';

import { endpoint, rootElement, rootUrl } from './constants';
import reportWebVitals from './reportWebVitals';
import Header from './Header';
import { MapVeuContainer } from './lib/mapveu';
import { WorkspaceRouter } from './lib/workspace/WorkspaceRouter';

// Hooks
import { useAttemptActionClickHandler } from '@veupathdb/study-data-access/lib/data-restriction/dataRestrictionHooks';
import { useCoreUIFonts } from '@veupathdb/core-components/dist/hooks';

const subsettingServiceUrl = '/eda-subsetting-service';
const dataServiceUrl = '/eda-data-service';
const userServiceUrl = '/eda-user-service';

const exampleAnalysesAuthor = process.env.REACT_APP_EXAMPLE_ANALYSES_AUTHOR
  ? Number(process.env.REACT_APP_EXAMPLE_ANALYSES_AUTHOR)
  : undefined;

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
              <li>
                <Link to="/eda/public">Public analyses</Link>
              </li>
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
          userServiceUrl={userServiceUrl}
          exampleAnalysesAuthor={exampleAnalysesAuthor}
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
        console.log('TEST 2');
        useCoreUIFonts();

        return (
          <>
            <DataRestrictionDaemon
              makeStudyPageRoute={(id: string) => `/eda/${id}/details`}
            />
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
