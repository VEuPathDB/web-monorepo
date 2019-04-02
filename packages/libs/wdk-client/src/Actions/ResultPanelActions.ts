import { makeActionCreator, InferAction } from 'wdk-client/Utils/ActionCreatorUtils';

export const openTabListing = makeActionCreator(
  'result-panel/open-tab-listing',
  (viewId: string, stepId: number) => ({ viewId, stepId })
);

export const selectSummaryView = makeActionCreator(
  'result-panel/select-summary-view',
  (viewId: string, stepId: number, summaryView: string | null) => ({ viewId, stepId, summaryView })
);

export type Action = InferAction<typeof openTabListing> | InferAction<typeof selectSummaryView>;
