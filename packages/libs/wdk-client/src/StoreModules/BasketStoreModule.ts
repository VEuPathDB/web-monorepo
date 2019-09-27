import { StateObservable } from 'redux-observable';
import { confirm } from 'wdk-client/Utils/Platform';
import {
  requestUpdateBasket,
  fulfillUpdateBasket,
  requestClearBasket,
  fulfillClearBasket,
  requestAddStepToBasket,
  fulfillAddStepToBasket,
  fulfillBasketCounts,
  requestBasketCounts,
  cancelRequestUpdateBasket,
  cancelRequestClearBasket,
  saveBasketToStrategy,
} from 'wdk-client/Actions/BasketActions';
import { InferAction } from 'wdk-client/Utils/ActionCreatorUtils';

import { Action } from 'wdk-client/Actions';
import { EpicDependencies } from 'wdk-client/Core/Store';

import {
  concatMapRequestActionsToEpic as crate,
  switchMapRequestActionsToEpic as srate,
} from 'wdk-client/Utils/ActionCreatorUtils';
import { combineEpics } from 'redux-observable';
import { RootState } from 'wdk-client/Core/State/Types';
import {transitionToInternalPage} from 'wdk-client/Actions/RouterActions';
import {SearchConfig} from 'wdk-client/Utils/WdkModel';
import {DEFAULT_STRATEGY_NAME} from 'wdk-client/StoreModules/QuestionStoreModule';

export const key = 'basket';

export type State = {
  counts?: Record<string, number>;
};

const initialState: State = {};

export function reduce(state: State = initialState, action: Action): State {
  switch(action.type) {
    case fulfillBasketCounts.type:
      return { counts: action.payload.counts };
    default:
      return state;
  }
}

async function getFulfillUpdateBasket(
  [requestAction]: [InferAction<typeof requestUpdateBasket>],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<InferAction<typeof fulfillUpdateBasket | typeof cancelRequestUpdateBasket>> {
  let payload = requestAction.payload;
  await wdkService.updateRecordsBasketStatus(
    payload.operation,
    payload.recordClassName,
    payload.primaryKeys
  );
  return fulfillUpdateBasket(
    payload.operation,
    payload.recordClassName,
    payload.primaryKeys
  );
}

async function getFulfillClearBasket(
  [requestAction]: [InferAction<typeof requestClearBasket>],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<InferAction<typeof fulfillClearBasket | typeof cancelRequestClearBasket>> {
  let payload = requestAction.payload;
  const proceed = await confirm(
    'Empty basket',
    'Are you sure you want to empty this basket? This operation cannot be undone.'
  );
  if (!proceed) return cancelRequestClearBasket();
  await wdkService.clearBasket(payload.recordClassName);
  return fulfillClearBasket(payload.recordClassName);
}

async function getFulfillAddStepToBasket(
  [requestAction]: [InferAction<typeof requestAddStepToBasket>],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
) {
  const step = await wdkService.findStep(requestAction.payload.stepId);
  await wdkService.addStepToBasket(
    step.recordClassName,
    step.id
  );
  return fulfillAddStepToBasket(step.id);
}

async function getFulfillBasketCounts(
  _: unknown,
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<InferAction<typeof fulfillBasketCounts>> {
  const counts = await wdkService.getBasketCounts();
  return fulfillBasketCounts(counts);
}

async function getBasketStrategy(
  [action]: [InferAction<typeof saveBasketToStrategy>],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<InferAction<typeof transitionToInternalPage>> {
  const { basketName } = action.payload;
  const recordClass = await wdkService.findRecordClass(rc => rc.urlSegment === basketName);
  const datasetId = await wdkService.createDataset({
    sourceType: 'basket',
    sourceContent: { basketName }
  });
  const prefix = recordClass.fullName.replace('.', '_');
  const searchName = prefix + 'BySnapshotBasket';
  const paramName = prefix + 'Dataset';
  const searchConfig: SearchConfig = {
    parameters: {
      [paramName]: String(datasetId)
    }
  };
  const { id: stepId } = await wdkService.createStep({ searchName, searchConfig, customName: 'Copy of Basket' });
  const stepTree = { stepId };
  const { id: strategyId } = await wdkService.createStrategy({ name: DEFAULT_STRATEGY_NAME, isPublic: false, isSaved: false, stepTree })
  return transitionToInternalPage(`/workspace/strategies/${strategyId}/${stepId}`);
}

export const observe = combineEpics(
  crate([requestUpdateBasket], getFulfillUpdateBasket,
    { areActionsNew: () => true }),
  crate([requestClearBasket], getFulfillClearBasket,
    { areActionsNew: () => true }),
  crate([requestAddStepToBasket], getFulfillAddStepToBasket,
    { areActionsNew: () => true }),

  srate([fulfillUpdateBasket], getFulfillBasketCounts,
    { areActionsNew: () => true }),
  srate([fulfillClearBasket], getFulfillBasketCounts,
    { areActionsNew: () => true }),
  srate([fulfillAddStepToBasket], getFulfillBasketCounts,
    { areActionsNew: () => true }),
  srate([requestBasketCounts], getFulfillBasketCounts,
    { areActionsNew: () => true }),
  srate([saveBasketToStrategy], getBasketStrategy,
    { areActionsNew: () => true })
);
