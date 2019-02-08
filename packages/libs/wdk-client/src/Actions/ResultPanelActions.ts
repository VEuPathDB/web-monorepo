import { makeActionCreator, InferAction } from 'wdk-client/Utils/ActionCreatorUtils';

export const openTabListing = makeActionCreator(
  'result-panel/open-tab-listing',
  (stepId: number) => ({ stepId })
);

export const selectSummaryView = makeActionCreator(
  'result-panel/select-summary-view',
  (summaryView: string | null) => ({ summaryView })
);

export type Action = InferAction<typeof openTabListing> | InferAction<typeof selectSummaryView>;
