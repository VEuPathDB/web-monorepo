
// load api-specific page controllers
import FastaConfigController from './components/controllers/FastaConfigController';
import SampleForm from './components/samples/SampleForm';

// define routes to api-specific pages
export let routes = [

  { name: "fasta-tool", handler: FastaConfigController },

  // test/demonstration pages
  { name: "sample-form", handler: SampleForm }

];
