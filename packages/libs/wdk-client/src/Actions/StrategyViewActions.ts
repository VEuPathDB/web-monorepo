import { uniqueId } from 'lodash';
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

export const addNotification = makeActionCreator(
  'strategy-view/addNotification',
  (message: string) => ({ message, id: uniqueId('strategy-view-notification-') })
);

export const removeNotification = makeActionCreator(
  'strategy-view/removeNotification',
  (id: string) => ({ id })
);

export type Action =
  | InferAction<typeof openStrategyView>
  | InferAction<typeof closeStrategyView>
  | InferAction<typeof setActiveStrategy>
  | InferAction<typeof setOpenedStrategies>
  | InferAction<typeof setOpenedStrategiesVisibility>
  | InferAction<typeof addNotification>
  | InferAction<typeof removeNotification>
