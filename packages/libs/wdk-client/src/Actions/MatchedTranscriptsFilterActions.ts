import { makeActionCreator, InferAction } from 'wdk-client/Utils/ActionCreatorUtils';

export const openMatchedTranscriptsFilter = makeActionCreator(
    'matchedTranscriptsFilter/open',
    (stepId: number) => ({ stepId })
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
    (didMeetCriteria: boolean, didNotMeetCriteria: boolean) => ({ didMeetCriteria, didNotMeetCriteria })
);

export const requestMatchedTransFilterSummary = makeActionCreator(
    'matchedTranscriptsFilter/requestSummary',
    (stepId: number) => ({ stepId })
);

export const fulfillMatchedTransFilterSummary = makeActionCreator(
    'matchedTranscriptsFilter/fulfillSummary',
    (stepId: number, didMeetCount: number, didNotMeetCount: number) => ({ stepId, didMeetCount, didNotMeetCount })
);

export const requestMatchedTransFilterUpdate = makeActionCreator(
  'matchedTranscriptsFilter/requestMatchedTransFilterUpdate',
  (didMeetCriteria: boolean, didNotMeetCriteria: boolean) =>
    ({ didMeetCriteria, didNotMeetCriteria })
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
    | InferAction<typeof requestMatchedTransFilterUpdate>
