import { combineEpics, StateObservable } from 'redux-observable';
import { get } from 'lodash';
import { Action } from 'wdk-client/Actions';
import {
requestStrategyPanelVisibilityUpdate,
fulfillStrategyPanelVisibility,
setStepDetailsVisibility,
setInsertStepWizardVisibility,
setDeleteStepDialogVisibilty,
setDeleteStrategyDialogVisibilty,
setStrategyPanelHeightOverride,
openStrategyPanel
} from 'wdk-client/Actions/StrategyPanelActions';
import { RootState } from 'wdk-client/Core/State/Types';
import { EpicDependencies } from 'wdk-client/Core/Store';
import {
  InferAction,
  mergeMapRequestActionsToEpic as mrate,
  takeEpicInWindow
} from 'wdk-client/Utils/ActionCreatorUtils';
import { indexByActionProperty, IndexedState } from 'wdk-client/Utils/ReducerUtils';

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
      case fulfillStrategyPanelVisibility.type: {
        return { ...state, strategyPanelIsVisible: action.payload.isVisible };
      }
  
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

  /*
    open -> reqPanelOpen
    reqPanelOpen -> fulfillPanelOpen
    reqPanelUpdate -> fulfillPanelOpen
  */
  