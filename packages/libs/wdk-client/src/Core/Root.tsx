import { History, Location } from 'history';
import PropTypes from 'prop-types';
import * as React from 'react';
import { Router, Switch, matchPath } from 'react-router';

import {
  ClientPluginRegistryEntry,
  PluginContext,
  makeCompositePluginComponent,
} from '../Utils/ClientPlugin';
import ErrorBoundary from '../Core/Controllers/ErrorBoundary';
import LoginFormController from '../Controllers/LoginFormController';
import Page from '../Components/Layout/Page';

import { Store } from 'redux';
import { Provider } from 'react-redux';
import { RouteEntry } from '../Core/RouteEntry';
import WdkRoute from '../Core/WdkRoute';
import { safeHtml } from '../Utils/ComponentUtils';
import UnhandledErrorsController from '../Controllers/UnhandledErrorsController';
import {
  WdkDependencies,
  WdkDependenciesContext,
} from '../Hooks/WdkDependenciesEffect';

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
}

const REACT_ROUTER_LINK_CLASSNAME = 'wdk-ReactRouterLink';
const GLOBAL_CLICK_HANDLER_SELECTOR = `a:not(.${REACT_ROUTER_LINK_CLASSNAME})`;
const RELATIVE_LINK_REGEXP = new RegExp(
  '^((' + location.protocol + ')?//)?' + location.host
);

/** WDK Application Root */
export default class Root extends React.Component<Props, State> {
  static propTypes = {
    rootUrl: PropTypes.string,
    routes: PropTypes.array.isRequired,
    onLocationChange: PropTypes.func,
    staticContent: PropTypes.string,
  };

  static defaultProps = {
    rootUrl: '/',
    onLocationChange: () => {}, // noop
  };

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
      isRouterLink
    )
      return;

    this.props.history.push(href.slice(this.props.rootUrl.length));
    event.preventDefault();
  }

  componentDidMount() {
    /** install global click handler */
    document.addEventListener('click', this.handleGlobalClick);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleGlobalClick);
    this.removeHistoryListener();
  }

  render() {
    const { routes, staticContent } = this.props;
    const { location } = this.state;
    const activeRoute = routes.find(({ path, exact = true }) =>
      matchPath(location.pathname, { path, exact })
    );
    const rootClassNameModifier = activeRoute?.rootClassNameModifier;
    const isFullscreen = activeRoute?.isFullscreen;
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
                <Page
                  classNameModifier={rootClassNameModifier}
                  requireLogin={this.props.requireLogin}
                  isFullScreen={isFullscreen}
                >
                  {staticContent ? (
                    safeHtml(staticContent, null, 'div')
                  ) : (
                    <Switch>
                      {this.props.routes.map(
                        ({
                          path,
                          exact = true,
                          component,
                          requiresLogin = false,
                        }) => (
                          <WdkRoute
                            key={path}
                            exact={exact == null ? false : exact}
                            path={path}
                            component={component}
                            requiresLogin={requiresLogin}
                          />
                        )
                      )}
                    </Switch>
                  )}
                </Page>
              </PluginContext.Provider>
            </WdkDependenciesContext.Provider>
          </Router>
        </ErrorBoundary>
      </Provider>
    );
  }
}
