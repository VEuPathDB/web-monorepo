import { makeActionCreator, InferAction } from 'wdk-client/Utils/ActionCreatorUtils';
import { StrategySummary } from 'wdk-client/Utils/WdkUser';

export const openStrategiesListView = makeActionCreator(
    'strategiesList/open',
    (viewId: string) => ({ viewId })
  );
  
export const closeStrategiesListView = makeActionCreator(
    'strategiesList/close',
    (viewId: string) => ({ viewId })
  );
  
export const requestStrategiesList = makeActionCreator(
    'strategiesList/requestStrategiesList',
    (viewId: string) => ({ viewId })
  );
  
export const fulfillStrategiesList = makeActionCreator(
    'strategiesList/fulfillStrategiesList',
    (viewId: string, strategies: StrategySummary[]) => ({ strategies, viewId })
  );
  
export const selectStrategies = makeActionCreator(
    'strategiesList/selectStrategies',
    (viewId: string, strategyIds: number[]) => ({ strategyIds, viewId })
  );
  
  export const unselectStrategies = makeActionCreator(
    'strategiesList/unselectStrategies',
    (viewId: string, strategyIds: number[]) => ({ strategyIds, viewId })
  );

export type Action =
  | InferAction<typeof openStrategiesListView>
  | InferAction<typeof closeStrategiesListView>
  | InferAction<typeof requestStrategiesList>
  | InferAction<typeof fulfillStrategiesList>
  | InferAction<typeof selectStrategies> 
  | InferAction<typeof unselectStrategies>
  