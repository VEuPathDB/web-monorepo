import { compose, get, negate, some } from "lodash/fp";
import { ResultTableSummaryViewActions } from "wdk-client/Actions";

const REPRESENTATIVE_TRANSCRIPT_FILTER_NAME =
  "representativeTranscriptOnly";
const TRANSCRIPT_RECORD_CLASS_NAME =
  "TranscriptRecordClasses.TranscriptRecordClass";

const isFilter = filter =>
  filter.name === REPRESENTATIVE_TRANSCRIPT_FILTER_NAME;
const isNotFilter = negate(isFilter);

// selector to determine if filter is enabled
export const isTranscripFilterEnabled = compose(
  some(isFilter),
  get([
    "resultTableSummaryView",
    "globalViewFilters",
    TRANSCRIPT_RECORD_CLASS_NAME
  ])
);

// Add/remove representativeTranscriptOnly from global filters for record class
export function requestTranscriptFilterUpdate(currentViewFilters, enable) {
  return ResultTableSummaryViewActions.updateGlobalViewFilters(
    TRANSCRIPT_RECORD_CLASS_NAME,
    updateTranscriptFilterValue(currentViewFilters, enable)
  );
}

export function updateTranscriptFilterValue(currentViewFilters = [], enable) {
  const viewFilters = currentViewFilters.filter(isNotFilter);
  if (!enable) return viewFilters;
  return viewFilters.concat([
    { name: REPRESENTATIVE_TRANSCRIPT_FILTER_NAME, value: {} }
  ]);
}
