import { makeActionCreator, InferAction } from 'wdk-client/Utils/ActionCreatorUtils';

export const openStrategyView = makeActionCreator('strategy-view/open');
export const closeStrategyView = makeActionCreator('strategy-view/close');

export type Action =
  | InferAction<typeof openStrategyView>
  | InferAction<typeof closeStrategyView>
