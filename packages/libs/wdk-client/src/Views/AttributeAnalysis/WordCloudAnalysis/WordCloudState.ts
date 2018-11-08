import { makeReduce, State as BaseState, observe } from 'wdk-client/Views/AttributeAnalysis/BaseAttributeAnalysis';
import { EndAttributeReportRequestSuccessAction, END_ATTRIBUTE_REPORT_REQUEST_SUCCESS } from 'wdk-client/Actions/AttributeAnalysisActions';
import {
  RankRange,
  Sort,
  ChangeRankRangeAction,
  ChangeSortAction,
  CHANGE_RANK_RANGE,
  CHANGE_SORT
} from 'wdk-client/Views/AttributeAnalysis/WordCloudAnalysis/WordCloudActions';

type VisualizationAction =
  | EndAttributeReportRequestSuccessAction
  | ChangeRankRangeAction
  | ChangeSortAction

type VisualizationState = {
  rankRange: RankRange;
  wordCloudSort: Sort;
}

export type State = BaseState<'word' | 'count', VisualizationState>;

export const icon = 'bar-chart-o';

const MAX_RANGE_MAX = 50;

const initialState: VisualizationState = {
  rankRange: {
    min: 0,
    max: MAX_RANGE_MAX
  },
  wordCloudSort: 'rank'
}

function reduceVisualization(state: VisualizationState = initialState, action: VisualizationAction): VisualizationState {
  switch (action.type) {
    case END_ATTRIBUTE_REPORT_REQUEST_SUCCESS:
      return {
        rankRange: {
          min: 1,
          max: Math.min(action.payload.report.tags.length, MAX_RANGE_MAX)
        },
        wordCloudSort: 'rank'
      };

    case CHANGE_RANK_RANGE:
      return { ...state, rankRange: action.payload.rankRange };

    case CHANGE_SORT:
      return { ...state, wordCloudSort: action.payload.sort };

    default:
      return state;
  }
}

export const reduce = makeReduce<
  'word' | 'count',
  VisualizationState,
  VisualizationAction
>('word', reduceVisualization);

export { observe };