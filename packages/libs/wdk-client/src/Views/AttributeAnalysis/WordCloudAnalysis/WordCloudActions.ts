import { makeActionCreator } from '../../../Utils/ActionCreatorUtils';

export type RankRange = {
  min: number;
  max: number;
}

export type Sort = 'rank' | 'alpha';

export const RankRangeChanged =
  makeActionCreator<RankRange, 'wordcloud/rank-range-updated'>('wordcloud/rank-range-updated');

export const WordCloudSorted =
  makeActionCreator<Sort, 'wordcloud/sort-updated'>('wordcloud/sort-updated');
