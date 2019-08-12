import { makeActionCreator, InferAction } from 'wdk-client/Utils/ActionCreatorUtils';
import { StrategySummary } from 'wdk-client/Utils/WdkUser';
import { MesaSortObject } from 'wdk-client/Core/CommonTypes';

export const openStrategiesListView = makeActionCreator(
  'strategiesList/open',
);

export const closeStrategiesListView = makeActionCreator(
  'strategiesList/close',
);

export const requestStrategiesList = makeActionCreator(
  'strategiesList/requestStrategiesList',
);

export const fulfillStrategiesList = makeActionCreator(
  'strategiesList/fulfillStrategiesList',
  (strategies: StrategySummary[]) => ({ strategies })
);

export const setActiveTab = makeActionCreator(
  'strategiesList/setActiveTab',
  (tabId: string) => ({ tabId })
)

export const setSearchTerm = makeActionCreator(
  'strategiesList/setSearchTerm',
  (tableId: string, searchTerm: string) => ({ tableId, searchTerm })
);

export const addToStrategyListSelection = makeActionCreator(
  'strategiesList/addToSelection',
  (tableId: string, strategyIds: number[]) => ({ tableId, strategyIds })
);

export const removeFromStrategyListSelection = makeActionCreator(
  'strategiesList/removeFromSelection',
  (tableId: string, strategyIds: number[]) => ({ tableId, strategyIds })
);

export const setStrategyListSort = makeActionCreator(
  'strategiesList/setStrategyListSort',
  (tableId: string, sort: MesaSortObject) => ({ tableId, sort })
)

export type Action =
  | InferAction<typeof openStrategiesListView>
  | InferAction<typeof closeStrategiesListView>
  | InferAction<typeof requestStrategiesList>
  | InferAction<typeof fulfillStrategiesList>
  | InferAction<typeof setActiveTab>
  | InferAction<typeof setSearchTerm>
  | InferAction<typeof addToStrategyListSelection>
  | InferAction<typeof removeFromStrategyListSelection>
  | InferAction<typeof setStrategyListSort>
