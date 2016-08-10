/* global wdk */
import { Redirect, Route } from 'react-router';
// load api-specific page controllers
import FastaConfigController from './components/controllers/FastaConfigController';
import QueryGridController from './components/controllers/QueryGridController';
import GalaxyTermsController from './components/controllers/GalaxyTermsContoller';
import SampleForm from './components/samples/SampleForm';

// define routes to api-specific pages and overrides to WDK routes
export let routes = (
  <Route path="/">

    {/* Make project id option for routes. If present, redirect to route path without project id. */}
    <Redirect from={'record/:recordClass/*/' + wdk.MODEL_NAME} to="record/:recordClass/:splat"/>

    <Route path="fasta-tool" component={FastaConfigController}/>
    <Route path="query-grid" component={QueryGridController}/>
    <Route path="galaxy-orientation" component={GalaxyTermsController}/>

    {/* test/demonstration pages */}
    <Route path="sample-form" component={SampleForm}/>
  </Route>
);
