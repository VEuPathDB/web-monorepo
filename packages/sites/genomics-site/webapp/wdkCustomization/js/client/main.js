// import CSS files
import 'site/wdkCustomization/css/client.css';

import { initialize } from 'ebrc-client/bootstrap';
import mainMenuItems from './mainMenuItems';
import smallMenuItems from './smallMenuItems';

// import apicomm wrappers and additional routes
import * as componentWrappers from './componentWrappers';
import pluginConfig from './pluginConfig';
import { wrapRoutes } from './routes';
import wrapStoreModules from './wrapStoreModules';

const quickSearches = [
  {
    name: 'GeneQuestions.GeneBySingleLocusTag',
    alternate: 'GeneQuestions.GeneByLocusTag',
    paramName: 'single_gene_id',
    displayName: 'Gene ID',
    help: `Use * as a wildcard in a gene ID. Click on 'Gene ID' to enter multiple Gene IDs.`,
  },
  {
    name: 'GeneQuestions.GenesByTextSearch',
    paramName: 'text_expression',
    displayName: 'Gene Text Search',
    help: `
      <b>Examples:</b>
      <ul>
        <li>chloroplast plastid</li>
        <li>"Histone H3"</li>
        <li>kinase</li>
        <li>kinas\*</li>
        <li>kin\*as\*</li>
      </ul>
    `
    // help: `Use * as a wildcard, as in *inase, kin*se, kinas*. Do not use AND, OR. Use quotation marks to find an exact phrase. Click on 'Gene Text Search' to access the advanced gene search page.`,
  }
];

// Initialize the application.
initialize({
  componentWrappers,
  quickSearches,
  wrapRoutes,
  wrapStoreModules,
  mainMenuItems,
  smallMenuItems,
  pluginConfig,
})
