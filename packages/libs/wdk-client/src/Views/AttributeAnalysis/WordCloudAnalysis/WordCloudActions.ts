export type RankRange = {
  min: number;
  max: number;
}

export type Sort = 'rank' | 'alpha';

//==============================================================================

export const CHANGE_RANK_RANGE = 'wordCloud/change-rank-range';

export interface ChangeRankRangeAction {
  type: typeof CHANGE_RANK_RANGE;
  payload: {
    rankRange: RankRange
  };
}

export function changeRankRange(rankRange: RankRange): ChangeRankRangeAction {
  return {
    type: CHANGE_RANK_RANGE,
    payload: { rankRange }
  }
}

//==============================================================================

export const CHANGE_SORT = 'wordCloud/change-sort';

export interface ChangeSortAction {
  type: typeof CHANGE_SORT;
  payload: {
    sort: Sort;
  };
}

export function changeSort(sort: Sort): ChangeSortAction {
  return {
    type: CHANGE_SORT,
    payload: {
      sort
    }
  }
}

//==============================================================================
