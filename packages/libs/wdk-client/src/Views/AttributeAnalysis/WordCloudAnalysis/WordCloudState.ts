import { matchAction, Reducer } from 'wdk-client/Utils/ReducerUtils';

import { makeReduce, State as BaseState, observe } from 'wdk-client/Views/AttributeAnalysis/BaseAttributeAnalysis';
import { AttributeReportReceived } from 'wdk-client/Views/AttributeAnalysis/BaseAttributeAnalysis/BaseAttributeAnalysisActions';
import { RankRange, RankRangeChanged, Sort, WordCloudSorted } from 'wdk-client/Views/AttributeAnalysis/WordCloudAnalysis/WordCloudActions';

type VisualizationState = {
  rankRange: RankRange;
  wordCloudSort: Sort;
}

export type State = BaseState<'word' | 'count', VisualizationState>;

export const icon = 'bar-chart-o';

const MAX_RANGE_MAX = 50;

const reduceVisualization = matchAction({} as VisualizationState,
  [AttributeReportReceived, (state, { report }): VisualizationState => ({
    rankRange: {
      min: 1,
      max: Math.min(report.tags.length, MAX_RANGE_MAX)
    },
    wordCloudSort: 'rank'
  })],
  [RankRangeChanged, (state, rankRange): VisualizationState => ({ ...state, rankRange })],
  [WordCloudSorted, (state, wordCloudSort): VisualizationState => ({ ...state, wordCloudSort })],
);

export const reduce: Reducer<State> =
  makeReduce<'word' | 'count', VisualizationState>('word', reduceVisualization);

export { observe };