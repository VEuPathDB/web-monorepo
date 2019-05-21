import { get } from 'lodash';
import { Action } from 'wdk-client/Actions';
import {
setStepDetailsVisibility,
setInsertStepWizardVisibility,
setDeleteStepDialogVisibilty,
setDeleteStrategyDialogVisibilty,
setStrategyPanelHeightOverride,
} from 'wdk-client/Actions/StrategyPanelActions';
import { indexByActionProperty, IndexedState } from 'wdk-client/Utils/ReducerUtils';

/*
* So far, this store module does not handle opening and closing the strategy panel.  it is just
* the panel itself.  Opening and closing it might be controlled here or above in the workspace
*/
export const key = 'strategyPanel';
export type State = IndexedState<ViewState>;

type ViewState = {
    strategyPanelIsVisible: boolean,
    strategyPanelHeightOverride?: number,  // user's choice of height
    visibleStepDetails?: number,  // stepId or none if not shown
    visibleInsertStepWizard?: number  // stepId or none if not shown
    visibleDeleteStepDialog?: number  // stepId or none if not shown
    visibleDeleteStrategyDialog?: number  // strategyId or none if not shown
  };
  
  const initialViewState: ViewState = {
    strategyPanelIsVisible: false  // the default for this should come from client init file
  };
  
  export const reduce = indexByActionProperty(
    reduceView,
    (action: Action) => get(action, [ 'payload', 'viewId'])
  );

  function reduceView(state: ViewState = initialViewState, action: Action): ViewState {
    switch (action.type) {

      case setStepDetailsVisibility.type: {
        return { ...state, visibleStepDetails: action.payload.stepId };
      }
  
      case setInsertStepWizardVisibility.type: {
        return { ...state, visibleInsertStepWizard: action.payload.stepId };
      }
  
      case setDeleteStepDialogVisibilty.type: {
        return { ...state, visibleDeleteStepDialog: action.payload.stepId };
      }
  
      case setDeleteStrategyDialogVisibilty.type: {
        return { ...state, visibleDeleteStrategyDialog: action.payload.strategyId };
      }
  
      case setStrategyPanelHeightOverride.type: {
        return { ...state, strategyPanelHeightOverride: action.payload.heightOverride };
      }
  
      default: {
        return state;
      }
    }
  }
