import * as React from 'react';
import { Store } from 'redux';
import { Provider } from 'react-redux';
import { Link, Router, Switch, matchPath } from 'react-router-dom';
import { History, Location } from 'history';
import PropTypes from 'prop-types';
import { noop } from 'lodash';

import {
  ClientPluginRegistryEntry,
  PluginContext,
  makeCompositePluginComponent,
} from '../Utils/ClientPlugin';
import ErrorBoundary from '../Core/Controllers/ErrorBoundary';
import LoginFormController from '../Controllers/LoginFormController';
import Page from '../Components/Layout/Page';

import { RouteEntry } from '../Core/RouteEntry';
import WdkRoute from '../Core/WdkRoute';
import { safeHtml } from '../Utils/ComponentUtils';
import UnhandledErrorsController from '../Controllers/UnhandledErrorsController';
import {
  WdkDependencies,
  WdkDependenciesContext,
} from '../Hooks/WdkDependenciesEffect';
import { Modal } from '@veupathdb/coreui';
import Banner from '@veupathdb/coreui/lib/components/banners/Banner';

import './Style/wdk-Button.scss';
import { IndexController, NotFoundController } from '../Controllers';

type Props = {
  requireLogin: boolean;
  rootUrl: string;
  routes: RouteEntry[];
  pluginConfig: ClientPluginRegistryEntry<any>[];
  onLocationChange: (location: Location) => void;
  history: History;
  store: Store;
  wdkDependencies: WdkDependencies;
  staticContent?: string;
};

interface State {
  location: Location;
  userIsGuest?: boolean;
}

const REACT_ROUTER_LINK_CLASSNAME = 'wdk-ReactRouterLink';
const GLOBAL_CLICK_HANDLER_SELECTOR = `a:not(.${REACT_ROUTER_LINK_CLASSNAME})`;
const RELATIVE_LINK_REGEXP = new RegExp(
  '^((' + location.protocol + ')?//)?' + location.host
);

/** WDK Application Root */
export default class Root extends React.Component<Props, State> {
  removeHistoryListener: () => void;

  constructor(props: Props) {
    super(props);
    this.handleGlobalClick = this.handleGlobalClick.bind(this);
    this.removeHistoryListener = this.props.history.listen((location) => {
      this.props.onLocationChange(location);
      this.setState({ location });
    });
    this.props.onLocationChange(this.props.history.location);
    this.state = {
      location: this.props.history.location,
    };
  }

  handleGlobalClick(event: MouseEvent) {
    const target = event.target;
    if (!target || !(target instanceof HTMLAnchorElement)) return;

    let isDefaultPrevented = event.defaultPrevented;
    let isHashChange = target.getAttribute('href')?.startsWith('#');
    let hasModifiers =
      event.metaKey ||
      event.altKey ||
      event.shiftKey ||
      event.ctrlKey ||
      event.button !== 0;
    let hasTarget = target.getAttribute('target') != null;
    let href = (target.href || '').replace(RELATIVE_LINK_REGEXP, '');
    let isRouterLink = target.classList.contains(REACT_ROUTER_LINK_CLASSNAME);

    if (
      isDefaultPrevented ||
      hasModifiers ||
      hasTarget ||
      !href.startsWith(this.props.rootUrl) ||
      isHashChange ||
      isRouterLink
    )
      return;

    this.props.history.push(href.slice(this.props.rootUrl.length));
    event.preventDefault();
  }

  getActiveRoute() {
    const { location } = this.state;
    return this.props.routes.find(({ path, exact = true }) =>
      matchPath(location.pathname, { path, exact })
    );
  }

  loadUser() {
    this.setState({ userIsGuest: isUserGuest() });
  }

  componentDidMount() {
    /** install global click handler */
    document.addEventListener('click', this.handleGlobalClick);
    this.loadUser();
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleGlobalClick);
    this.removeHistoryListener();
  }

  render() {
    const { staticContent, routes } = this.props;
    const { userIsGuest } = this.state;
    const activeRoute = this.getActiveRoute();
    const rootClassNameModifier = activeRoute?.rootClassNameModifier;
    const isFullscreen = activeRoute?.isFullscreen;

    if (userIsGuest == null) return 'Loading...';

    // allow some pages non-login access
    const requireLogin =
      activeRoute?.requiresLogin === false ? false : this.props.requireLogin;
    const accessDenied = requireLogin ? userIsGuest : false;
    const activeRouteContent = (
      <Switch>
        {accessDenied ? (
          <WdkRoute
            key="/"
            path="*"
            component={IndexController}
            requiresLogin={false}
          />
        ) : (
          routes.map((route) => (
            <WdkRoute
              key={route.path}
              path={route.path}
              component={route.component}
              exact={route.exact ?? true}
              requiresLogin={route.requiresLogin ?? false}
            />
          ))
        )}
      </Switch>
    );
    return (
      <Provider store={this.props.store}>
        <ErrorBoundary>
          <Router history={this.props.history}>
            <WdkDependenciesContext.Provider value={this.props.wdkDependencies}>
              <PluginContext.Provider
                value={makeCompositePluginComponent(this.props.pluginConfig)}
              >
                <UnhandledErrorsController />
                <LoginFormController />
                <Modal
                  visible={accessDenied}
                  toggleVisible={noop}
                  styleOverrides={{
                    position: {
                      top: '20vh',
                    },
                  }}
                >
                  <div
                    style={{ width: '80vw', maxWidth: '35em', padding: '2em' }}
                  >
                    <h1
                      style={{
                        fontSize: '2em',
                        fontWeight: 500,
                        textAlign: 'center',
                        paddingTop: 0,
                      }}
                    >
                      Please log in to access this page
                    </h1>
                    <Banner
                      banner={{
                        type: 'info',
                        hideIcon: true,
                        message: (
                          <>
                            VEuPathDB is evolving under a new organizational
                            structure. In order to use VEuPathDB resources, you
                            will now need to log into your free account. This
                            helps us collect accurate user metrics to guide
                            future development.
                          </>
                        ),
                      }}
                    />
                    <div
                      style={{
                        fontSize: '1.3em',
                        marginTop: '2em',
                        display: 'flex',
                        justifyContent: 'center',
                      }}
                    >
                      <Link
                        className="login-button"
                        to={{
                          pathname: '/user/login',
                          search:
                            '?destination=' +
                            encodeURIComponent(window.location.toString()),
                        }}
                      >
                        Log in
                      </Link>
                      <Link
                        className="register-button"
                        target="_blank"
                        to="/user/registration"
                      >
                        Register
                      </Link>
                      .
                    </div>
                  </div>
                </Modal>
                <Page
                  classNameModifier={rootClassNameModifier}
                  isFullScreen={isFullscreen}
                  isAccessDenied={accessDenied}
                >
                  {staticContent
                    ? safeHtml(staticContent, null, 'div')
                    : activeRouteContent}
                </Page>
              </PluginContext.Provider>
            </WdkDependenciesContext.Provider>
          </Router>
        </ErrorBoundary>
      </Provider>
    );
  }
}

function isUserGuest() {
  try {
    return !!JSON.parse(
      atob(
        document.cookie
          .match(/(^| )Authorization=([^;]+)/)?.[2]
          .split('.')[1] ?? ''
      )
    ).is_guest;
  } catch {
    return true;
  }
}
