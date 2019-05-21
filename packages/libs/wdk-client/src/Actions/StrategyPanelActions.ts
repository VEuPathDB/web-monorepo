import { makeActionCreator, InferAction } from 'wdk-client/Utils/ActionCreatorUtils';

export const openStrategyPanel = makeActionCreator(
    'strategyPanel/open',
    (viewId: string) => ({ viewId })
  );
  
export const closeStrategyPanel = makeActionCreator(
    'strategyPanel/close',
    (viewId: string) => ({ viewId })
  );
  
export const requestStrategyPanelVisibilityPreference = makeActionCreator(
    'strategyPanel/requestStrategyPanelVisibilityPreference',
    (viewId: string, isVisible: boolean) => ({ isVisible, viewId })
  );
  
export const requestStrategyPanelVisibilityChange = makeActionCreator(
    'strategyPanel/requestStrategyPanelVisibilityChange',
    (viewId: string, isVisible: boolean) => ({ isVisible, viewId })
 );
  
export const fulfillStrategyPanelVisibility = makeActionCreator(
    'strategyPanel/fulfillStrategyPanelVisibility',
    (viewId: string, isVisible: boolean) => ({ isVisible, viewId })
    );
  
export const setStepDetailsVisibility = makeActionCreator(
    'strategyPanel/setStepDetailsVisibility',
    (viewId: string, stepId: number | undefined) => ({ stepId, viewId })
    );

export const setInsertStepWizardVisibility = makeActionCreator(
    'strategyPanel/setInsertStepWizardVisibility',
    (viewId: string, stepId: number | undefined) => ({ stepId, viewId })
    );

export const setDeleteStepDialogVisibilty = makeActionCreator(
    'strategyPanel/setDeleteStepDialogVisibilty',
    (viewId: string, stepId: number | undefined) => ({ stepId, viewId })
    );

export const setDeleteStrategyDialogVisibilty = makeActionCreator(
    'strategyPanel/setDeleteStrategyDialogVisibilty',
    (viewId: string, strategyId: number | undefined) => ({ strategyId, viewId })
    );

export const setStrategyPanelHeightOverride = makeActionCreator(
    'strategyPanel/setStrategyPanelHeightOverride',
    (viewId: string, heightOverride: number) => ({ heightOverride, viewId })
    );
    
/*
setDidYouKnowVisibility
nextDidYouKnow
neverShowDidYouKnow
*/

export type Action =
  | InferAction<typeof requestStrategyPanelVisibilityPreference>
  | InferAction<typeof openStrategyPanel>
  | InferAction<typeof closeStrategyPanel>
  | InferAction<typeof requestStrategyPanelVisibilityChange>
  | InferAction<typeof fulfillStrategyPanelVisibility> 
  | InferAction<typeof setStepDetailsVisibility>
  | InferAction<typeof setInsertStepWizardVisibility>
  | InferAction<typeof setDeleteStepDialogVisibilty> 
  | InferAction<typeof setDeleteStrategyDialogVisibilty>
  | InferAction<typeof setStrategyPanelHeightOverride>
