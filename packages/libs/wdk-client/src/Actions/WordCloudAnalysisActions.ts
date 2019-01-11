import { makeActionCreator, InferAction } from "wdk-client/Utils/ActionCreatorUtils";

export type RankRange = {
  min: number;
  max: number;
}

export type Sort = 'rank' | 'alpha';

export const openView = makeActionCreator(
  'wordCloud-analysis/open-view',
  (reporterName: string, stepId: number) => ({ reporterName, stepId })
)

export const closeView = makeActionCreator(
  'wordCloud-analysis/close-view',
  (reporterName: string, stepId: number) => ({ reporterName, stepId })
)

export const changeRankRange = makeActionCreator(
  'wordCloud-analysis/change-rank-range',
  (rankRange: RankRange) => ({rankRange})
)

export const changeSort = makeActionCreator(
  'wordCloud-analysis/change-sort',
  (sort: string) => ({sort})
)

export type Action =
  | InferAction<typeof openView>
  | InferAction<typeof closeView>
  | InferAction<typeof changeRankRange>
  | InferAction<typeof changeSort>
