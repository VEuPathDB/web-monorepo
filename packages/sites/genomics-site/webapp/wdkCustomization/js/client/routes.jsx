// load api-specific page controllers
import FastaConfigController from './components/controllers/FastaConfigController';
import QueryGridController from './components/controllers/QueryGridController';
import GalaxyTermsController from './components/controllers/GalaxyTermsController';
import SampleForm from './components/samples/SampleForm';

/**
 * Wrap WDK Routes
 */
export const wrapRoutes = wdkRoutes => [
  { path: '/fasta-tool', component: FastaConfigController },
  { path: '/query-grid', component: QueryGridController },
  { path: '/galaxy-orientation', component: GalaxyTermsController },
  { path: '/galaxy-orientation/sign-up', component: GalaxyTermsController },
  { path: '/sample-form', component: SampleForm },
  ...wdkRoutes
]
