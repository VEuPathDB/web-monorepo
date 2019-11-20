import {
  RankRange,
  Sort,
  changeRankRange,
  changeSort,
  openView,
  closeView
} from 'wdk-client/Actions/WordCloudAnalysisActions';
import { Action } from 'wdk-client/Actions';
import { InferAction, takeEpicInWindow, switchMapRequestActionsToEpic } from 'wdk-client/Utils/ActionCreatorUtils';
import { requestAttributeReport } from 'wdk-client/Actions/AttributeAnalysisActions';

export type State = {
  rankRange?: RankRange;
  wordCloudSort?: Sort;
};

export const key = 'wordCloudAnalysis';

export const icon = 'bar-chart-o';

const initialState: State = {};

export function reduce(
  state: State = initialState,
  action: Action
): State {
  switch (action.type) {
    case openView.type:
      return initialState;

    case changeRankRange.type:
      return { ...state, rankRange: action.payload.rankRange };

    case changeSort.type:
      switch (action.payload.sort) {
        case 'rank':
        case 'alpha':
          return { ...state, wordCloudSort: action.payload.sort };
        default:
          return state;
      }

    default:
      return state;
  }
}

async function getReport([{ payload: { reporterName, resultType }}]: [InferAction<typeof openView>]) {
  return requestAttributeReport(reporterName, resultType, {});
}

export const observe = takeEpicInWindow(
  { startActionCreator: openView, endActionCreator: closeView },
  switchMapRequestActionsToEpic([openView], getReport)
)
