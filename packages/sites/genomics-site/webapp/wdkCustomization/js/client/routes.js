
// load api-specific page controllers
import FastaConfigController from './components/controllers/FastaConfigController';
import SampleForm from './components/samples/SampleForm';

// define routes to api-specific pages
export let routes = [

  { path: "fasta-tool", component: FastaConfigController },

  // test/demonstration pages
  { path: "sample-form", component: SampleForm }

];
