import { makeActionCreator, InferAction } from 'wdk-client/Utils/ActionCreatorUtils';

export const openTabListing = makeActionCreator(
  'result-panel/open-tab-listing',
  (viewId: string, stepId: number) => ({ viewId, stepId })
);

export const selectSummaryView = makeActionCreator(
  'result-panel/select-summary-view',
  (viewId: string, summaryView: string | null) => ({ viewId, summaryView })
);

export type Action = InferAction<typeof openTabListing> | InferAction<typeof selectSummaryView>;
