import './globals'; // Don't move this. There is a brittle dependency that relies on this being first.

// eslint-disable-next-line import/no-webpack-loader-syntax
import '!!script-loader!@veupathdb/wdk-client/vendored/jquery';
// eslint-disable-next-line import/no-webpack-loader-syntax
import '!!script-loader!@veupathdb/wdk-client/vendored/jquery-migrate-1.2.1';
// eslint-disable-next-line import/no-webpack-loader-syntax
import '!!script-loader!@veupathdb/wdk-client/vendored/jquery-ui';
// eslint-disable-next-line import/no-webpack-loader-syntax
import '!!script-loader!@veupathdb/wdk-client/vendored/jquery.qtip.min';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { partial } from 'lodash';
import {
  createTheme as createMUITheme,
  ThemeProvider as MUIThemeProvider,
} from '@material-ui/core';

import {
  initialize,
  wrapComponents,
} from '@veupathdb/wdk-client/lib/Core/main';
import { Link } from '@veupathdb/wdk-client/lib/Components';
import { RouteEntry } from '@veupathdb/wdk-client/lib/Core/RouteEntry';
import '@veupathdb/wdk-client/lib/Core/Style/index.scss';
import { Props } from '@veupathdb/wdk-client/lib/Components/Layout/Page';

import { DataRestrictionDaemon } from '@veupathdb/study-data-access/lib/data-restriction';
import dataRestrictionReducer from '@veupathdb/study-data-access/lib/data-restriction/DataRestrictionReducer';
import { wrapWdkDependencies } from '@veupathdb/study-data-access/lib/shared/wrapWdkDependencies';
import {
  disableRestriction,
  enableRestriction,
  reduxMiddleware,
} from '@veupathdb/study-data-access/lib/data-restriction/DataRestrictionUtils';

import { edaEndpoint, wdkEndpoint, rootElement, rootUrl } from './constants';
import reportWebVitals from './reportWebVitals';
import Header from './Header';
import MapApp from './lib/map';
import WorkspaceApp from './lib/workspace';
import CoreUIThemeProvider from '@veupathdb/coreui/dist/components/theming/UIThemeProvider';
import { workspaceThemeOptions as MUIThemeOptions } from './lib/workspaceTheme';

// Hooks
import { useAttemptActionClickHandler } from '@veupathdb/study-data-access/lib/data-restriction/dataRestrictionHooks';
import { useCoreUIFonts } from '@veupathdb/coreui/dist/hooks';

// Definitions
import { colors, H3 } from '@veupathdb/coreui';

import './index.css';

// snackbar
import makeSnackbarProvider from '@veupathdb/coreui/dist/components/notifications/SnackbarProvider';

// Set singleAppMode to the name of one app, if the eda should use one instance of one app only.
// Otherwise, let singleAppMode remain undefined or set it to '' to allow multiple app instances.
const singleAppMode = process.env.REACT_APP_SINGLE_APP_MODE;

const showUnreleasedData =
  process.env.REACT_APP_SHOW_UNRELEASED_DATA === 'true';

const enableFullScreenApps =
  process.env.REACT_APP_ENABLE_FULL_SCREEN_APPS === 'true';

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

const SnackbarProvider = makeSnackbarProvider();
const MUITheme = createMUITheme(MUIThemeOptions);

wrapComponents({
  Header: () => Header,
  Footer: () => () => null,
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
        <MUIThemeProvider theme={MUITheme}>
          <DevLoginFormContext.Provider value={loginFormContext}>
            <DataRestrictionDaemon
              makeStudyPageRoute={(id: string) => `/eda/${id}`}
            />
            <CoreUIThemeProvider
              theme={{
                palette: {
                  primary: { hue: colors.mutedCyan, level: 600 },
                  secondary: { hue: colors.mutedRed, level: 500 },
                },
              }}
            >
              <SnackbarProvider styleProps={{}}>
                <DefaultComponent {...props} />
              </SnackbarProvider>
            </CoreUIThemeProvider>
          </DevLoginFormContext.Provider>
        </MUIThemeProvider>
      );
    };
  },
});

initialize({
  rootUrl,
  rootElement,
  wrapRoutes: (routes: any): RouteEntry[] => [
    {
      path: '/',
      component: () => (
        <div>
          <H3>EDA Links</H3>
          <ul>
            <li>
              <Link to="/eda">My analyses</Link>
            </li>
            <li>
              <Link to="/eda/public">Public analyses</Link>
            </li>
            <li>
              <Link to="/eda/studies">All studies</Link>
            </li>
          </ul>
          <H3>MapVEu Links</H3>
          <ul>
            <li>
              <Link to="/mapveu">Mapveu</Link>
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
          <WorkspaceApp
            edaServiceUrl={edaEndpoint}
            exampleAnalysesAuthor={exampleAnalysesAuthor}
            sharingUrlPrefix={window.location.href}
            showLoginForm={showLoginForm}
            singleAppMode={singleAppMode}
            showUnreleasedData={showUnreleasedData}
            enableFullScreenApps={enableFullScreenApps}
          />
        );
      },
    },
    {
      path: '/mapveu',
      component: () => (
        <MapApp
          siteInformationProps={{
            siteHomeUrl: 'https://veupathdb.org',
            siteLogoSrc:
              'https://veupathdb.org/veupathdb/images/VEuPathDB/icons-footer/vectorbase.png',
            siteName: 'VectorBase',
            loginUrl: '/user/login',
          }}
          singleAppMode={singleAppMode}
          edaServiceUrl={edaEndpoint}
          sharingUrl={window.location.href}
        />
      ),
      exact: false,
      rootClassNameModifier: 'MapVEu',
      isFullscreen: true,
    },
    ...routes,
  ],
  wrapWdkDependencies: partial(wrapWdkDependencies, edaEndpoint),
  wrapStoreModules: (storeModules: any) => ({
    ...storeModules,
    dataRestriction: {
      key: 'dataRestriction',
      reduce: dataRestrictionReducer,
    },
  }),
  endpoint: wdkEndpoint,
  additionalMiddleware: [reduxMiddleware],
} as any);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
