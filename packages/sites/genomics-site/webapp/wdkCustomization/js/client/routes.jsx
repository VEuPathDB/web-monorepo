import { cloneElement, Children } from 'react';
import { Route, IndexRoute } from 'react-router';
import { projectId } from './config';
// load api-specific page controllers
import FastaConfigController from './components/controllers/FastaConfigController';
import QueryGridController from './components/controllers/QueryGridController';
import GalaxyTermsController from './components/controllers/GalaxyTermsController';
import GalaxyTerms from './components/GalaxyTerms';
import GalaxySignUp from './components/GalaxySignUp';
import SampleForm from './components/samples/SampleForm';

const apidbRoutes = (
  <Route path="/">
    <Route path="fasta-tool" component={FastaConfigController}/>
    <Route path="query-grid" component={QueryGridController}/>
    <Route path="galaxy-orientation" component={GalaxyTermsController}>
      <IndexRoute component={GalaxyTerms}/>
      <Route path="sign-up" component={GalaxySignUp}/>
    </Route>

    {/* test/demonstration pages */}
    <Route path="sample-form" component={SampleForm}/>
  </Route>
);

/**
 * Wrap WDK Routes Element
 */
export function wrapRoutes(rootRoute) {
  let mappedChildren = Children.map(rootRoute.props.children, mapRoute);
  return cloneElement(rootRoute, {}, apidbRoutes, mappedChildren);
}

/**
 * Add the hideProjectId `onEnter` prop to routes that expect a primary key.
 * The current assumption is any route which begins with 'record/:recordClass'
 * is such a route.
 */
function mapRoute(route) {
  let { path } = route.props;
  return path && path.startsWith('record/:recordClass')
    ? cloneElement(route, { onEnter: hideProjectId })
    : route;
}


let projectRegExp = new RegExp('/' + projectId + '$');

/**
 * Remove projectId from the url. This is like a redirect.
 */
function hideProjectId(nextState, replace) {
  if (projectRegExp.test(nextState.location.pathname)) {
    replace(nextState.location.pathname.replace(projectRegExp, ''));
  }
}
