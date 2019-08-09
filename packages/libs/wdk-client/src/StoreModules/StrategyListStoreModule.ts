import { union, difference } from 'lodash';
import { combineEpics, StateObservable, ActionsObservable } from 'redux-observable';
import { Action } from 'wdk-client/Actions';
import { RootState } from 'wdk-client/Core/State/Types';
import { EpicDependencies } from 'wdk-client/Core/Store';
import {
  openStrategiesListView,
  closeStrategiesListView,
  requestStrategiesList,
  fulfillStrategiesList,
  setActiveTab,
  addToStrategyListSelection,
  removeFromStrategyListSelection,
  setStrategyListSort,
} from 'wdk-client/Actions/StrategyListActions';
import {
  fulfillCreateStrategy,
  fulfillDeleteStrategy,
  fulfillStrategy,
  fulfillDeleteOrRestoreStrategies,
  requestPatchStrategyProperties,
  fulfillPatchStrategyProperties,
} from 'wdk-client/Actions/StrategyActions';
import { StrategySummary } from 'wdk-client/Utils/WdkUser';
import {
  InferAction,
  switchMapRequestActionsToEpic as smrate,
  takeEpicInWindow
} from 'wdk-client/Utils/ActionCreatorUtils';
import { MesaSortObject } from 'wdk-client/Core/CommonTypes';
import { addToOpenedStrategies } from 'wdk-client/Actions/StrategyViewActions';
import { Observable, empty } from 'rxjs';
import { filter, tap, mergeMapTo } from 'rxjs/operators';

/*
* So far, this store module does not handle opening and closing the strategy panel.  it is just
* the panel itself.  Opening and closing it might be controlled here or above in the workspace
*/
export const key = 'strategyList';

type State = {
  strategySummaries?: StrategySummary[];
  selectedStrategyIds: number[];
  activeTab?: string;
  selectedStrategiesByTableId: Record<string, number[] | undefined>;
  sortByTableId: Record<string, MesaSortObject>;
};

const initialViewState: State = {
  selectedStrategyIds: [],
  selectedStrategiesByTableId: {},
  sortByTableId: {}
};

export function reduce(state: State = initialViewState, action: Action): State {
  switch (action.type) {
    case fulfillStrategiesList.type:
      return { ...state, strategySummaries: action.payload.strategies };
    case setActiveTab.type:
      return { ...state, activeTab: action.payload.tabId };
    case addToStrategyListSelection.type:
      return {
        ...state,
        selectedStrategiesByTableId: {
          ...state.selectedStrategiesByTableId,
          [action.payload.tableId]: union(state.selectedStrategiesByTableId[action.payload.tableId], action.payload.strategyIds)
        }
      }
    case removeFromStrategyListSelection.type:
      return {
        ...state,
        selectedStrategiesByTableId: {
          ...state.selectedStrategiesByTableId,
          [action.payload.tableId]: difference(state.selectedStrategiesByTableId[action.payload.tableId], action.payload.strategyIds)
        }
      }
    case setStrategyListSort.type:
      return {
        ...state,
        sortByTableId: {
          ...state.sortByTableId,
          [action.payload.tableId]: action.payload.sort
        }
      }
    default:
      return state;
  }
}

const openSLV = openStrategiesListView;

async function getRequestStrategiesList(
  [openSLVAction, doesnotmatter]: [InferAction<typeof openSLV>] | [InferAction<typeof openSLV>, unknown],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<InferAction<typeof requestStrategiesList>> {
  return requestStrategiesList();
}

async function getFulfillStrategiesList(
  [openSLVAction, requestStrategiesListAction]: [InferAction<typeof openSLV>, InferAction<typeof requestStrategiesList>],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<InferAction<typeof fulfillStrategiesList>> {
  return fulfillStrategiesList(await wdkService.getStrategies());
}

export const observe = takeEpicInWindow(
  {
    startActionCreator: openStrategiesListView,
    endActionCreator: closeStrategiesListView
  },
  combineEpics(
    smrate([ openSLV                                   ], getRequestStrategiesList),
    smrate([ openSLV, fulfillCreateStrategy            ], getRequestStrategiesList),
    smrate([ openSLV, fulfillDeleteStrategy            ], getRequestStrategiesList),
    smrate([ openSLV, fulfillDeleteOrRestoreStrategies ], getRequestStrategiesList),
    smrate([ openSLV, fulfillStrategy                  ], getRequestStrategiesList),
    smrate([ openSLV, fulfillPatchStrategyProperties   ], getRequestStrategiesList),
    smrate([ openSLV, requestStrategiesList            ], getFulfillStrategiesList,
      { areActionsNew: () => true}),
  )
);
