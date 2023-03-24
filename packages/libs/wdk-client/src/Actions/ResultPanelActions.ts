import { makeActionCreator, InferAction } from '../Utils/ActionCreatorUtils';
import { ResultType, ResultTypeDetails } from '../Utils/WdkResult';

export const openTabListing = makeActionCreator(
  'result-panel/open-tab-listing',
  (viewId: string, resultType: ResultType, initialTab?: string) => ({
    viewId,
    resultType,
    initialTab,
  })
);

export const setResultTypeDetails = makeActionCreator(
  'result-panel/set-resultTypeDetails',
  (viewId: string, resultTypeDetails: ResultTypeDetails) => ({
    viewId,
    resultTypeDetails,
  })
);

export const selectSummaryView = makeActionCreator(
  'result-panel/select-summary-view',
  (viewId: string, resultType: ResultType, summaryView: string | null) => ({
    viewId,
    resultType,
    summaryView,
  })
);

export type Action = InferAction<
  typeof openTabListing | typeof selectSummaryView | typeof setResultTypeDetails
>;
