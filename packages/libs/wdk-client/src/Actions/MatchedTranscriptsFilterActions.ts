import { makeActionCreator, InferAction } from '../Utils/ActionCreatorUtils';
import { Step } from '../Utils/WdkUser';

export type FilterSummary = Record<string, number>;

export type FilterSelection = Array<keyof FilterSummary>;

export const openMatchedTranscriptsFilter = makeActionCreator(
  'matchedTranscriptsFilter/open',
  (step: Step, filterKey: string) => ({ step, filterKey })
);

export const closeMatchedTranscriptsFilter = makeActionCreator(
  'matchedTranscriptsFilter/close',
  (stepId: number) => ({ stepId })
);

export const requestMatchedTransFilterExpandedPref = makeActionCreator(
  'matchedTranscriptsFilter/requestExpandedPreference'
);

export const requestMatchedTransFilterExpandedUpdate = makeActionCreator(
  'matchedTranscriptsFilter/requestExpandedUpdate',
  (expanded: boolean) => ({ expanded })
);

export const fulfillMatchedTransFilterExpanded = makeActionCreator(
  'matchedTranscriptsFilter/fulfillExpanded',
  (expanded: boolean) => ({ expanded })
);

export const setDisplayedSelection = makeActionCreator(
  'matchedTranscriptsFilter/setDisplayedSelection',
  (selection: FilterSelection) => ({ selection })
);

export const requestMatchedTransFilterSummary = makeActionCreator(
  'matchedTranscriptsFilter/requestSummary',
  (stepId: number) => ({ stepId })
);

export const fulfillMatchedTransFilterSummary = makeActionCreator(
  'matchedTranscriptsFilter/fulfillSummary',
  (stepId: number, summary: FilterSummary) => ({ stepId, summary })
);

export const requestMatchedTransFilterUpdate = makeActionCreator(
  'matchedTranscriptsFilter/requestMatchedTransFilterUpdate',
  (selection: FilterSelection) => ({ selection })
);

export type Action =
  | InferAction<typeof openMatchedTranscriptsFilter>
  | InferAction<typeof closeMatchedTranscriptsFilter>
  | InferAction<typeof requestMatchedTransFilterExpandedPref>
  | InferAction<typeof requestMatchedTransFilterExpandedUpdate>
  | InferAction<typeof fulfillMatchedTransFilterExpanded>
  | InferAction<typeof setDisplayedSelection>
  | InferAction<typeof requestMatchedTransFilterSummary>
  | InferAction<typeof fulfillMatchedTransFilterSummary>
  | InferAction<typeof requestMatchedTransFilterUpdate>;
