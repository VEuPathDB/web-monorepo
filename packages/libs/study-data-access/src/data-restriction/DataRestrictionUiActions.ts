// Data stuff =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// per https://docs.google.com/presentation/d/1Cmf2GcmGuKbSTcH4wdeTEvRHTi9DDoh5-MnPm1MkcEA/edit?pli=1#slide=id.g3d955ef9d5_3_2

import { ActionAuthorization } from '../study-access/EntityTypes';

// Actions
// -------
export const Action = {
  // Access Search page
  search: 'search',
  // Use a step or column analysis tool
  analysis: 'analysis',
  // Run a strategy
  results: 'results',
  // View beyond first 20 records
  paginate: 'paginate',
  // Click record page link in results page
  record: 'record',
  // Access a record page
  recordPage: 'recordPage',
  // Access download page
  downloadPage: 'downloadPage',
  // Click download link in results page or homepage
  download: 'download',
  // Use the basket
  basket: 'basket',
} as const;

type ValueOf<T> = T[keyof T];

export type Action = ValueOf<typeof Action>;

// strictActions will popup: "go home" (this is a forbidden page)
// non strict actions (clicked on link to do something) will popup: "dismiss" (you may stay in this page)
export const strictActions = new Set([
  Action.search,
  Action.analysis,
  Action.results,
  Action.recordPage,
  Action.downloadPage
]);

export const actionCategories: Record<Action, keyof ActionAuthorization> = {
  [Action.search]: 'subsetting',
  [Action.analysis]: 'subsetting',
  [Action.results]: 'visualizations',
  [Action.paginate]: 'resultsAll',
  [Action.record]: 'resultsAll',
  [Action.recordPage]: 'resultsAll',
  [Action.downloadPage]: 'resultsAll',
  [Action.download]: 'resultsAll',
  [Action.basket]: 'resultsAll',
};
