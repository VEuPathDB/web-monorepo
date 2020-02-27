import { History, Location } from 'history';
import PropTypes from 'prop-types';
import * as React from 'react';
import { Router, Switch, matchPath } from 'react-router';

import { ClientPluginRegistryEntry, PluginContext, makeCompositePluginComponent } from 'wdk-client/Utils/ClientPlugin';
import ErrorBoundary from 'wdk-client/Core/Controllers/ErrorBoundary';
import LoginFormController from 'wdk-client/Controllers/LoginFormController';
import Page from 'wdk-client/Components/Layout/Page';

import { Store } from 'redux';
import { Provider } from 'react-redux';
import { RouteEntry } from 'wdk-client/Core/RouteEntry';
import WdkService, { WdkServiceContext } from 'wdk-client/Service/WdkService';
import WdkRoute from 'wdk-client/Core/WdkRoute';

type Props = {
  rootUrl: string,
  routes: RouteEntry[],
  pluginConfig: ClientPluginRegistryEntry<any>[],
  onLocationChange: (location: Location) => void,
  history: History,
  store: Store,
  wdkService: WdkService
};

interface State {
  location: Location;
}

const REACT_ROUTER_LINK_CLASSNAME = 'wdk-ReactRouterLink';
const GLOBAL_CLICK_HANDLER_SELECTOR = `a:not(.${REACT_ROUTER_LINK_CLASSNAME})`;
const RELATIVE_LINK_REGEXP = new RegExp('^((' + location.protocol + ')?//)?' + location.host);

/** WDK Application Root */
export default class Root extends React.Component<Props, State> {

  static propTypes = {
    rootUrl: PropTypes.string,
    routes: PropTypes.array.isRequired,
    onLocationChange: PropTypes.func
  };

  static defaultProps = {
    rootUrl: '/',
    onLocationChange: () => {}    // noop
  };

  removeHistoryListener: () => void;

  constructor(props: Props) {
    super(props);
    this.handleGlobalClick = this.handleGlobalClick.bind(this);
    this.removeHistoryListener = this.props.history.listen(location => {
      this.props.onLocationChange(location);
      this.setState({ location });
    });
    this.props.onLocationChange(this.props.history.location);
    this.state = {
      location: this.props.history.location
    };
  }

  handleGlobalClick(event: MouseEvent) {
    const target = event.target;
    if (!target || !(target instanceof HTMLAnchorElement)) return;

    let isDefaultPrevented = event.defaultPrevented;
    let hasModifiers = event.metaKey || event.altKey || event.shiftKey || event.ctrlKey || event.button !== 0;
    let hasTarget = target.getAttribute('target') != null;
    let href = (target.getAttribute('href') || '').replace(RELATIVE_LINK_REGEXP, '');
    let isRouterLink = target.classList.contains(REACT_ROUTER_LINK_CLASSNAME);

    if (
      isDefaultPrevented ||
      hasModifiers ||
      hasTarget ||
      !href.startsWith(this.props.rootUrl) ||
      isRouterLink
    ) return;

    this.props.history.push(href.slice(this.props.rootUrl.length));
    event.preventDefault();
  }

  componentDidMount() {
    /** install global click handler */
    document.addEventListener('click', this.handleGlobalClick)
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleGlobalClick)
    this.removeHistoryListener();
  }

  render() {
    const { routes } = this.props;
    const { location } = this.state;
    const activeRoute = routes.find(({ path, exact = true }) => matchPath(location.pathname, { path, exact }));
    const rootClassNameModifier = activeRoute && activeRoute.rootClassNameModifier;
    return (
      <Provider store={this.props.store}>
        <ErrorBoundary>
          <Router history={this.props.history}>
            <WdkServiceContext.Provider value={this.props.wdkService}>
              <PluginContext.Provider value={makeCompositePluginComponent(this.props.pluginConfig)}>
                <Page classNameModifier={rootClassNameModifier}>
                  <React.Fragment>
                    <Switch>
                      {this.props.routes.map(({ path, exact = true, component, requiresLogin = false }) => (
                        <WdkRoute
                          key={path}
                          exact={exact == null ? false: exact}
                          path={path}
                          component={component}
                          requiresLogin={requiresLogin}
                        />
                      ))}
                    </Switch>
                    <LoginFormController />
                  </React.Fragment>
                </Page>
              </PluginContext.Provider>
            </WdkServiceContext.Provider>
          </Router>
        </ErrorBoundary>
      </Provider>
    );
  }
}
