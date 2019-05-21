import { makeActionCreator, InferAction } from 'wdk-client/Utils/ActionCreatorUtils';

export const openTabListing = makeActionCreator(
  'result-panel/open-tab-listing',
  (viewId: string, stepId: number, strategyId: number, initialTab?: string) =>
    ({ viewId, stepId, strategyId, initialTab })
);

export const selectSummaryView = makeActionCreator(
  'result-panel/select-summary-view',
  (viewId: string, stepId: number, strategyId: number, summaryView: string | null) => ({ viewId, stepId, strategyId, summaryView })
);

export type Action = InferAction<typeof openTabListing> | InferAction<typeof selectSummaryView>;
