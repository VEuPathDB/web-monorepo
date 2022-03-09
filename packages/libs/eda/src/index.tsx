import './globals'; // Don't move this. There is a brittle dependency that relies on this being first.
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { partial } from 'lodash';

import { initialize } from '@veupathdb/web-common/lib/bootstrap';
import { Link } from '@veupathdb/wdk-client/lib/Components';
import { RouteEntry } from '@veupathdb/wdk-client/lib/Core/RouteEntry';
import '@veupathdb/wdk-client/lib/Core/Style/index.scss';
import '@veupathdb/web-common/lib/styles/client.scss';
import { Props } from '@veupathdb/wdk-client/lib/Components/Layout/Page';

import { DataRestrictionDaemon } from '@veupathdb/study-data-access/lib/data-restriction';
import { wrapWdkDependencies } from '@veupathdb/study-data-access/lib/shared/wrapWdkDependencies';
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
import UIThemeProvider from '@veupathdb/coreui/dist/components/theming/UIThemeProvider';

// Hooks
import { useAttemptActionClickHandler } from '@veupathdb/study-data-access/lib/data-restriction/dataRestrictionHooks';
import { useCoreUIFonts } from '@veupathdb/coreui/dist/hooks';

// Definitions
import { colors } from '@veupathdb/coreui';

import './index.css';

const subsettingServiceUrl = '/eda-subsetting-service';
const dataServiceUrl = '/eda-data-service';
const userServiceUrl = '/eda-user-service';
const downloadServiceUrl = '/eda-user-service';

// Ann dev
const singleAppMode = 'pass';

const exampleAnalysesAuthor = process.env.REACT_APP_EXAMPLE_ANALYSES_AUTHOR
  ? Number(process.env.REACT_APP_EXAMPLE_ANALYSES_AUTHOR)
  : undefined;

interface DevLoginFormState {
  loginFormVisible: boolean;
  setLoginFormVisible: (visible: boolean) => void;
}

export const DevLoginFormContext = createContext<DevLoginFormState>({
  loginFormVisible: false,
  setLoginFormVisible: () => {},
});

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
            </li>
            <li>
              <Link to="/eda/public">Public analyses</Link>
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
      component: function DevWorkspaceRouter() {
        const { setLoginFormVisible } = useContext(DevLoginFormContext);

        const showLoginForm = useCallback(() => {
          setLoginFormVisible(true);
        }, [setLoginFormVisible]);

        return (
          <WorkspaceRouter
            subsettingServiceUrl={subsettingServiceUrl}
            dataServiceUrl={dataServiceUrl}
            userServiceUrl={userServiceUrl}
            downloadServiceUrl={downloadServiceUrl}
            exampleAnalysesAuthor={exampleAnalysesAuthor}
            sharingUrlPrefix={window.location.href}
            showLoginForm={showLoginForm}
            singleAppMode={singleAppMode}
          />
        );
      },
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
        const [loginFormVisible, setLoginFormVisible] = useState(false);
        const loginFormContext = useMemo(
          () => ({
            loginFormVisible,
            setLoginFormVisible,
          }),
          [loginFormVisible]
        );

        useEffect(() => {
          if (process.env.REACT_APP_DISABLE_DATA_RESTRICTIONS === 'true') {
            disableRestriction();
          } else {
            enableRestriction();
          }
        }, []);

        useAttemptActionClickHandler();
        useCoreUIFonts();

        return (
          <DevLoginFormContext.Provider value={loginFormContext}>
            <DataRestrictionDaemon
              makeStudyPageRoute={(id: string) => `/eda/${id}`}
            />
            <UIThemeProvider
              theme={{
                palette: {
                  primary: { hue: colors.mutedCyan, level: 600 },
                  secondary: { hue: colors.mutedRed, level: 500 },
                },
              }}
            >
              <DefaultComponent {...props} />
            </UIThemeProvider>
          </DevLoginFormContext.Provider>
        );
      };
    },
  },
  wrapWdkDependencies: partial(wrapWdkDependencies, '/eda-dataset-access'),
  endpoint,
  additionalMiddleware: [reduxMiddleware],
} as any);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
