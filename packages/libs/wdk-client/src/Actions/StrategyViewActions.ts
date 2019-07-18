import { makeActionCreator, InferAction } from 'wdk-client/Utils/ActionCreatorUtils';

export const openStrategyView = makeActionCreator('strategy-view/open');
export const closeStrategyView = makeActionCreator('strategy-view/close');
export const setOpenedStrategiesVisibility = makeActionCreator(
  'strategy-view/setOpenedStrategiesVisibilty',
  (isVisible: boolean) => ({ isVisible })
);

export type Action =
  | InferAction<typeof openStrategyView>
  | InferAction<typeof closeStrategyView>
  | InferAction<typeof setOpenedStrategiesVisibility>
