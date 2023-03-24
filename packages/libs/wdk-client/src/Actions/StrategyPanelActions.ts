import { makeActionCreator, InferAction } from '../Utils/ActionCreatorUtils';
import { AddType } from '../Views/Strategy/Types';

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

export const setInsertStepWizardVisibility = makeActionCreator(
  'strategyPanel/setInsertStepWizardVisibility',
  (viewId: string, addType: AddType | undefined) => ({ addType, viewId })
);

export const setReviseFormVisibility = makeActionCreator(
  'strategyPanel/setReviseFormVisibility',
  (viewId: string, stepId: number | undefined) => ({ stepId, viewId })
);

export const setDeleteStepDialogVisibilty = makeActionCreator(
  'strategyPanel/setDeleteStepDialogVisibilty',
  (viewId: string, stepId: number | undefined) => ({ stepId, viewId })
);

export const setStrategyPanelHeightOverride = makeActionCreator(
  'strategyPanel/setStrategyPanelHeightOverride',
  (viewId: string, heightOverride: number) => ({ heightOverride, viewId })
);

export const nestStrategy = makeActionCreator(
  'strategyPanel/nestStrategy',
  (viewId: string, branchStepId: number) => ({ viewId, branchStepId })
);

export const unnestStrategy = makeActionCreator(
  'strategyPanel/unnestStrategy',
  (viewId: string, branchStepId: number) => ({ viewId, branchStepId })
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
  | InferAction<typeof setInsertStepWizardVisibility>
  | InferAction<typeof setReviseFormVisibility>
  | InferAction<typeof setDeleteStepDialogVisibilty>
  | InferAction<typeof setStrategyPanelHeightOverride>
  | InferAction<typeof nestStrategy>
  | InferAction<typeof unnestStrategy>;
