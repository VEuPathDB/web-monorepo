import { History, Location } from 'history';
import PropTypes from 'prop-types';
import * as React from 'react';
import { Route, RouteComponentProps, Router, Switch } from 'react-router';

import { LocatePlugin, RouteSpec } from 'wdk-client/Core/CommonTypes';
import ErrorBoundary from 'wdk-client/Core/Controllers/ErrorBoundary';
import LoginFormController from 'wdk-client/Views/User/LoginForm/LoginFormController';

import { Store } from 'redux';
import { Provider } from 'react-redux';

type Props = {
  rootUrl: string,
  routes: RouteSpec[],
  onLocationChange: (location: Location) => void;
  history: History;
  locatePlugin: LocatePlugin;
  store: Store;
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
    this.renderRoute = this.renderRoute.bind(this);
    this.handleGlobalClick = this.handleGlobalClick.bind(this);
    this.removeHistoryListener = this.props.history.listen(location => this.props.onLocationChange(location));
    this.props.onLocationChange(this.props.history.location);
  }

  renderRoute(RouteComponent: React.ComponentType<any>) {
    // Used to inject wdk content as props of Route Component
    return (routerProps: RouteComponentProps<any>) => {
      let { locatePlugin } = this.props;
      return (
        <RouteComponent {...routerProps} locatePlugin={locatePlugin} />
      );
    };
  }

  handleGlobalClick(event: MouseEvent) {
    const target = event.target;
    if (!target || !(target instanceof HTMLAnchorElement)) return;

    let hasModifiers = event.metaKey || event.altKey || event.shiftKey || event.ctrlKey || event.button !== 0;
    let href = (target.getAttribute('href') || '').replace(RELATIVE_LINK_REGEXP, '');
    if (!hasModifiers && href.startsWith(this.props.rootUrl)) {
      this.props.history.push(href.slice(this.props.rootUrl.length));
      event.preventDefault();
    }
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
            <React.Fragment>
              <Switch>
                {this.props.routes.map(route => (
                  <Route key={route.path} exact path={route.path} render={this.renderRoute(route.component)} />
                ))}
              </Switch>
              <LoginFormController
                locatePlugin={this.props.locatePlugin}
              />
            </React.Fragment>
          </Router>
        </ErrorBoundary>
      </Provider>
    );
  }
}
