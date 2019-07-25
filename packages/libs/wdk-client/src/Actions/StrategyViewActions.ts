import { makeActionCreator, InferAction } from 'wdk-client/Utils/ActionCreatorUtils';

export const openStrategyView = makeActionCreator('strategy-view/open');

export const closeStrategyView = makeActionCreator('strategy-view/close');

export const setActiveStrategy = makeActionCreator(
  'strategy-view/setActiveStrategy',
  (activeStrategy: { strategyId: number, stepId?: number } | undefined) => ({ activeStrategy })
);

export const setOpenedStrategies = makeActionCreator(
  'strategy-view/setOpenedStrategies',
  (openedStrategies: number[]) => ({ openedStrategies })
);

export const setOpenedStrategiesVisibility = makeActionCreator(
  'strategy-view/setOpenedStrategiesVisibility',
  (isVisible: boolean) => ({ isVisible })
)

export type Action =
  | InferAction<typeof openStrategyView>
  | InferAction<typeof closeStrategyView>
  | InferAction<typeof setActiveStrategy>
  | InferAction<typeof setOpenedStrategies>
  | InferAction<typeof setOpenedStrategiesVisibility>
