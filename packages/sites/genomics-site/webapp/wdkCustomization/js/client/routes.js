
// load api-specific page controllers
import FastaConfigController from './components/controllers/FastaConfigController';

// define routes to api-specific pages
export let routes = [

  { name: "fasta-tool", handler: FastaConfigController }

];
