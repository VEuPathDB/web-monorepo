import { get } from 'lodash';
import { Action } from 'wdk-client/Actions';
import { nestStrategy, openStrategyPanel, setDeleteStepDialogVisibilty, setInsertStepWizardVisibility, setStepDetailsVisibility, setStrategyPanelHeightOverride, unnestStrategy, setReviseFormVisibility, closeStrategyPanel } from 'wdk-client/Actions/StrategyPanelActions';
import { indexByActionProperty, IndexedState } from 'wdk-client/Utils/ReducerUtils';
import { fulfillPutStrategy, fulfillStrategy } from 'wdk-client/Actions/StrategyActions';
import { AddType } from 'wdk-client/Views/Strategy/Types';
import {takeEpicInWindow, mergeMapRequestActionsToEpic, InferAction} from 'wdk-client/Utils/ActionCreatorUtils';
import {combineEpics} from 'redux-observable';

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
    visibleInsertStepWizard?: AddType  // AddType or none if not shown
    visibleReviseForm?: number  // stepId or none if not shown
    visibleDeleteStepDialog?: number  // stepId or none if not shown
    nestedStrategyBranchIds: number[]; // step ids
  };

  const initialViewState: ViewState = {
    strategyPanelIsVisible: false,  // the default for this should come from client init file,
    nestedStrategyBranchIds: []
  };
  
  export const reduce = indexByActionProperty(
    reduceView,
    (action: Action) => get(action, [ 'payload', 'viewId'])
  );

  function reduceView(state: ViewState = initialViewState, action: Action): ViewState {
    switch (action.type) {

      case openStrategyPanel.type: {
        return initialViewState;
      }

      case setStepDetailsVisibility.type: {
        return { ...state, visibleStepDetails: action.payload.stepId };
      }
  
      case setInsertStepWizardVisibility.type: {
        return { ...state, visibleInsertStepWizard: action.payload.addType };
      }

      case setReviseFormVisibility.type: {
        return { ...state, visibleReviseForm: action.payload.stepId };
      }
  
      case setDeleteStepDialogVisibilty.type: {
        return { ...state, visibleDeleteStepDialog: action.payload.stepId };
      }

      case setStrategyPanelHeightOverride.type: {
        return { ...state, strategyPanelHeightOverride: action.payload.heightOverride };
      }

      case nestStrategy.type: {
        return { ...state, nestedStrategyBranchIds: [ ...state.nestedStrategyBranchIds, action.payload.branchStepId ]};
      }

      case unnestStrategy.type: {
        return { ...state, nestedStrategyBranchIds: state.nestedStrategyBranchIds.filter(id => id !== action.payload.branchStepId)};
      }
  
      case fulfillPutStrategy.type: {
        return { ...state, visibleInsertStepWizard: undefined };
      }

      default: {
        return state;
      }
    }
  }

export const observe = takeEpicInWindow(
  {
    startActionCreator: openStrategyPanel,
    endActionCreator: closeStrategyPanel
  },
  combineEpics(
    mergeMapRequestActionsToEpic([openStrategyPanel, setReviseFormVisibility, fulfillStrategy], getCloseReviseForm,
      { areActionsCoherent: areCloseReviseFormActionsCoherent })
  )
);


type CloseReviseFormActions = [InferAction<typeof openStrategyPanel>, InferAction<typeof setReviseFormVisibility>, InferAction<typeof fulfillStrategy>];

async function getCloseReviseForm([openAction]: CloseReviseFormActions) {
  return setReviseFormVisibility(openAction.payload.viewId, undefined);
}

function areCloseReviseFormActionsCoherent([openAction, reviseAction, fulfilStrategy]: CloseReviseFormActions): boolean {
  return reviseAction.payload.stepId != null && (
    openAction.payload.viewId === reviseAction.payload.viewId &&
    fulfilStrategy.payload.strategy.steps[reviseAction.payload.stepId] != null
  );
}
