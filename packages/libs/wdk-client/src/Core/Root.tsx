import { History, Location } from 'history';
import PropTypes from 'prop-types';
import * as React from 'react';
import { Route, Router, Switch } from 'react-router';

import { ClientPluginRegistryEntry, PluginContext, makeCompositePluginComponent } from 'wdk-client/Utils/ClientPlugin';
import ErrorBoundary from 'wdk-client/Core/Controllers/ErrorBoundary';
import LoginFormController from 'wdk-client/Controllers/LoginFormController';
import Page from 'wdk-client/Components/Layout/Page';

import { Store } from 'redux';
import { Provider } from 'react-redux';
import { RouteEntry } from 'wdk-client/Core/RouteEntry';
import WdkService, { WdkServiceContext } from 'wdk-client/Service/WdkService';
import LoginRequiredDisclaimer from 'wdk-client/Views/User/LoginRequiredDisclaimer';

type Props = {
  rootUrl: string,
  routes: RouteEntry[],
  pluginConfig: ClientPluginRegistryEntry<any>[],
  onLocationChange: (location: Location) => void,
  history: History,
  store: Store,
  wdkService: WdkService
};

const REACT_ROUTER_LINK_CLASSNAME = 'wdk-ReactRouterLink';
const GLOBAL_CLICK_HANDLER_SELECTOR = `a:not(.${REACT_ROUTER_LINK_CLASSNAME})`;
const RELATIVE_LINK_REGEXP = new RegExp('^((' + location.protocol + ')?//)?' + location.host);

/** WDK Application Root */
export default class Root extends React.Component<Props> {

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
    this.removeHistoryListener = this.props.history.listen(location => this.props.onLocationChange(location));
    this.props.onLocationChange(this.props.history.location);
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
    return (
      <Provider store={this.props.store}>
        <ErrorBoundary>
          <Router history={this.props.history}>
            <WdkServiceContext.Provider value={this.props.wdkService}>
              <PluginContext.Provider value={makeCompositePluginComponent(this.props.pluginConfig)}>
                <Page>
                  <React.Fragment>
                    <Switch>
                      {this.props.routes.map(({ path, exact = true, component: RouteComponent, requiresLogin }) => (
                        <Route
                          key={path}
                          exact={exact == null ? false: exact}
                          path={path}
                          render={props => {
                            if (RouteComponent == null) return null;
                            if (requiresLogin) return <LoginRequiredDisclaimer><RouteComponent {...props}/></LoginRequiredDisclaimer>
                            return <RouteComponent {...props}/>
                            }
                          }
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
