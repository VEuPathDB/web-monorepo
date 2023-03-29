import { get } from 'lodash';
import { Action } from '../Actions';
import {
  nestStrategy,
  openStrategyPanel,
  setDeleteStepDialogVisibilty,
  setInsertStepWizardVisibility,
  setStrategyPanelHeightOverride,
  unnestStrategy,
  setReviseFormVisibility,
  closeStrategyPanel,
} from '../Actions/StrategyPanelActions';
import { indexByActionProperty, IndexedState } from '../Utils/ReducerUtils';
import {
  fulfillPutStrategy,
  fulfillStrategy,
} from '../Actions/StrategyActions';
import { AddType } from '../Views/Strategy/Types';
import { takeEpicInWindow } from '../Utils/ActionCreatorUtils';
import { combineEpics, ActionsObservable } from 'redux-observable';
import { Observable } from 'rxjs';
import { filter, map, mergeMap, mapTo } from 'rxjs/operators';

/*
 * So far, this store module does not handle opening and closing the strategy panel.  it is just
 * the panel itself.  Opening and closing it might be controlled here or above in the workspace
 */
export const key = 'strategyPanel';
export type State = IndexedState<ViewState>;

type ViewState = {
  strategyPanelIsVisible: boolean;
  strategyPanelHeightOverride?: number; // user's choice of height
  visibleInsertStepWizard?: AddType; // AddType or none if not shown
  visibleReviseForm?: number; // stepId or none if not shown
  visibleDeleteStepDialog?: number; // stepId or none if not shown
  nestedStrategyBranchIds: number[]; // step ids
};

const initialViewState: ViewState = {
  strategyPanelIsVisible: false, // the default for this should come from client init file,
  nestedStrategyBranchIds: [],
};

export const reduce = indexByActionProperty(reduceView, (action: Action) =>
  get(action, ['payload', 'viewId'])
);

function reduceView(
  state: ViewState = initialViewState,
  action: Action
): ViewState {
  switch (action.type) {
    case openStrategyPanel.type:
    case closeStrategyPanel.type:
      return initialViewState;

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
      return {
        ...state,
        strategyPanelHeightOverride: action.payload.heightOverride,
      };
    }

    case nestStrategy.type: {
      return {
        ...state,
        nestedStrategyBranchIds: [
          ...state.nestedStrategyBranchIds,
          action.payload.branchStepId,
        ],
      };
    }

    case unnestStrategy.type: {
      return {
        ...state,
        nestedStrategyBranchIds: state.nestedStrategyBranchIds.filter(
          (id) => id !== action.payload.branchStepId
        ),
      };
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
    endActionCreator: closeStrategyPanel,
  },
  combineEpics(closeReviseForm)
);

function closeReviseForm(
  action$: ActionsObservable<Action>
): Observable<Action> {
  return action$.pipe(
    filter(setReviseFormVisibility.isOfType),
    map((action) => action.payload),
    filter(
      (payload): payload is { stepId: number; viewId: string } =>
        payload.stepId != null
    ),
    mergeMap(({ stepId, viewId }) =>
      action$.pipe(
        filter(fulfillStrategy.isOfType),
        filter((action) => action.payload.strategy.steps[stepId] != null),
        mapTo(setReviseFormVisibility(viewId, undefined))
      )
    )
  );
}
