import { cloneElement, Children } from 'react';
import { Route } from 'react-router';
import { projectId } from './config';
// load api-specific page controllers
import FastaConfigController from './components/controllers/FastaConfigController';
import QueryGridController from './components/controllers/QueryGridController';
import GalaxyTermsController from './components/controllers/GalaxyTermsContoller';
import SampleForm from './components/samples/SampleForm';

/**
 * Wrap WDK Routes Element
 */
export function wrapRoutes(rootRoute) {
  let mappedChildren = Children.map(rootRoute.props.children, mapRoute);
  return cloneElement(rootRoute, {}, (
    <Route path="/">
      <Route path="fasta-tool" component={FastaConfigController}/>
      <Route path="query-grid" component={QueryGridController}/>
      <Route path="galaxy-orientation" component={GalaxyTermsController}/>

      {/* test/demonstration pages */}
      <Route path="sample-form" component={SampleForm}/>
    </Route>
  ), mappedChildren);
}

function mapRoute(route) {
  let { path } = route.props;
  return path && path.startsWith('record/:recordClass')
    ? cloneElement(route, { onEnter: hideProjectId })
    : route;
}


let projectRegExp = new RegExp('/' + projectId + '$');
function hideProjectId(nextState, replace) {
  if (projectRegExp.test(nextState.location.pathname)) {
    replace(nextState.location.pathname.replace(projectRegExp, ''));
  }
}
