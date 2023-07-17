import { get, negate, some } from 'lodash/fp';
import { ResultTableSummaryViewActions } from '@veupathdb/wdk-client/lib/Actions';

const REPRESENTATIVE_TRANSCRIPT_FILTER_NAME = 'representativeTranscriptOnly';
const TRANSCRIPT_RECORD_CLASS_NAME = 'transcript';

const isFilter = (filter) =>
  filter.name === REPRESENTATIVE_TRANSCRIPT_FILTER_NAME;
const isNotFilter = negate(isFilter);

// selector to determine if filter is enabled
export function isTranscripFilterEnabled(state, props) {
  const viewFilters = get(
    [
      'resultTableSummaryView',
      props.viewId,
      'globalViewFilters',
      TRANSCRIPT_RECORD_CLASS_NAME,
    ],
    state
  );
  return some(isFilter, viewFilters);
}

export function isInBasketFilterEnabled(state, props) {
  return get(
    ['resultTableSummaryView', props.viewId, 'inBasketFilterEnabled'],
    state
  );
}

// Add/remove representativeTranscriptOnly from global filters for record class
export function requestTranscriptFilterUpdate(
  viewId,
  currentViewFilters,
  enable
) {
  return [
    ResultTableSummaryViewActions.updateGlobalViewFilters(
      viewId,
      TRANSCRIPT_RECORD_CLASS_NAME,
      updateTranscriptFilterValue(currentViewFilters, enable)
    ),
    ResultTableSummaryViewActions.viewPageNumber(viewId, 1),
  ];
}

export function updateTranscriptFilterValue(currentViewFilters = [], enable) {
  const viewFilters = currentViewFilters.filter(isNotFilter);
  if (!enable) return viewFilters;
  return viewFilters.concat([
    { name: REPRESENTATIVE_TRANSCRIPT_FILTER_NAME, value: {} },
  ]);
}
