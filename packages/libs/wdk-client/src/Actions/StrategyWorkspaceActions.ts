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

export const addToOpenedStrategies = makeActionCreator(
  'strategy-view/addToOpenedStrategies',
  (ids: number[]) => ({ ids })
);

export const removeFromOpenedStrategies = makeActionCreator(
  'strategy-view/removeFromOpenedStrategies',
  (ids: number[]) => ({ ids })
);

export const setOpenedStrategiesVisibility = makeActionCreator(
  'strategy-view/setOpenedStrategiesVisibility',
  (isVisible: boolean) => ({ isVisible })
)

export const setActiveModal = makeActionCreator(
  'strategyPanel/setActiveModal',
  (activeModal: {type: string, strategyId: number}) => activeModal
)

export const clearActiveModal = makeActionCreator(
  'strategyPanel/clearActiveModal',
)

export type Action =
  | InferAction<typeof openStrategyView>
  | InferAction<typeof closeStrategyView>
  | InferAction<typeof setActiveStrategy>
  | InferAction<typeof setOpenedStrategies>
  | InferAction<typeof addToOpenedStrategies>
  | InferAction<typeof removeFromOpenedStrategies>
  | InferAction<typeof setOpenedStrategiesVisibility>
  | InferAction<typeof setActiveModal>
  | InferAction<typeof clearActiveModal>
