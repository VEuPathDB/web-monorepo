import { get, union, difference } from 'lodash';
import { Action } from 'wdk-client/Actions';
import { combineEpics, StateObservable } from 'redux-observable';
import { RootState } from 'wdk-client/Core/State/Types';
import { EpicDependencies } from 'wdk-client/Core/Store';
import {
    openStrategiesListView,
    closeStrategiesListView,
    requestStrategiesList,
    fulfillStrategiesList,
    selectStrategies,
    unselectStrategies
} from 'wdk-client/Actions/StrategyListActions';
import {
    fulfillCreateStrategy,
    fulfillDeleteStrategy,
    fulfillStrategy,
    fulfillDeleteOrRestoreStrategies,
  } from 'wdk-client/Actions/StrategyActions';
import { indexByActionProperty, IndexedState } from 'wdk-client/Utils/ReducerUtils';
import { StrategySummary } from 'wdk-client/Utils/WdkUser';
import {
  InferAction,
  switchMapRequestActionsToEpic as smrate,
  takeEpicInWindow
} from 'wdk-client/Utils/ActionCreatorUtils';

/*
* So far, this store module does not handle opening and closing the strategy panel.  it is just
* the panel itself.  Opening and closing it might be controlled here or above in the workspace
*/
export const key = 'strategyList';
export type State = IndexedState<ViewState>;

type ViewState = {
    strategySummaries?: StrategySummary[],
    selectedStrategyIds: number[]
  };
  
const initialViewState: ViewState = {
    selectedStrategyIds: []  
  };
  
export const reduce = indexByActionProperty(
    reduceView,
    (action: Action) => get(action, [ 'payload', 'viewId'])
  );

function reduceView(state: ViewState = initialViewState, action: Action): ViewState {
    switch (action.type) {

      case fulfillStrategiesList.type: {
        return { ...state, strategySummaries: action.payload.strategies  };
      }
  
      case selectStrategies.type: {
        return { ...state, selectedStrategyIds: union(state.selectedStrategyIds, action.payload.strategyIds) };
      }
  
      case unselectStrategies.type: {
        return { ...state, selectedStrategyIds: difference(state.selectedStrategyIds, action.payload.strategyIds) };
      }

      default: {
        return state;
      }
    }
} 

const openSLV = openStrategiesListView;

async function getRequestStrategiesList(
    [openSLVAction, doesnotmatter]: [InferAction<typeof openSLV>, any],
    state$: StateObservable<RootState>,
    { wdkService }: EpicDependencies
  ): Promise<InferAction<typeof requestStrategiesList>> {
    return requestStrategiesList(openSLVAction.payload.viewId);
  }
  
  async function getRequestStrategiesList1(
    [openSLVAction]: [InferAction<typeof openSLV>],
    state$: StateObservable<RootState>,
    { wdkService }: EpicDependencies
  ): Promise<InferAction<typeof requestStrategiesList>> {
    return requestStrategiesList(openSLVAction.payload.viewId);
  }
  
  async function getFulfillStrategiesList(
    [openSLVAction, requestStrategiesListAction]: [InferAction<typeof openSLV>, InferAction<typeof requestStrategiesList>],
    state$: StateObservable<RootState>,
    { wdkService }: EpicDependencies
  ): Promise<InferAction<typeof fulfillStrategiesList>> {
    return fulfillStrategiesList(requestStrategiesListAction.payload.viewId, await wdkService.getStrategies());
  }

export const observe = takeEpicInWindow(
    {
        startActionCreator: openStrategiesListView,
        endActionCreator: closeStrategiesListView,
        compareStartAndEndActions: (
        start: InferAction<typeof openStrategiesListView>,
        end: InferAction<typeof closeStrategiesListView>
        ) => start.payload.viewId === end.payload.viewId
    },
    combineEpics(
        smrate([openSLV], getRequestStrategiesList1),
        smrate([openSLV, requestStrategiesList], getFulfillStrategiesList),
        smrate([openSLV, fulfillCreateStrategy], getRequestStrategiesList),
        smrate([openSLV, fulfillDeleteStrategy], getRequestStrategiesList),
        smrate([openSLV, fulfillDeleteOrRestoreStrategies], getRequestStrategiesList),
        smrate([openSLV, fulfillStrategy], getRequestStrategiesList),
    )
    );

    /*
    | InferAction<typeof requestCreateStrategy>
| InferAction<typeof fulfillCreateStrategy>
| InferAction<typeof requestDeleteStrategy>
| InferAction<typeof fulfillDeleteStrategy>
| InferAction<typeof requestDeleteOrRestoreStrategies>
| InferAction<typeof fulfillDeleteOrRestoreStrategies>
| InferAction<typeof requestDuplicateStrategy>
| InferAction<typeof fulfillDuplicateStrategy>
| InferAction<typeof requestStrategy>
| InferAction<typeof fulfillStrategy>
| InferAction<typeof requestPatchStrategyProperties>
| InferAction<typeof requestPutStrategyStepTree>
| InferAction<typeof requestGetDuplicatedStrategyStepTree>
| InferAction<typeof fulfillGetDuplicatedStrategyStepTree>
| InferAction<typeof requestUpdateStepProperties>
| InferAction<typeof requestCreateStep>
| InferAction<typeof fulfillCreateStep>
| InferAction<typeof requestStepCustomReport>
| InferAction<typeof fulfillStepCustomReport>
| InferAction<typeof requestStepStandardReport>
| InferAction<typeof fulfillStepStandardReport>
| InferAction<typeof requestUpdateStepSearchConfig>
| InferAction<typeof requestDeleteStep>
| InferAction<typeof openStrategy>
| InferAction<typeof closeStrategy>*/


