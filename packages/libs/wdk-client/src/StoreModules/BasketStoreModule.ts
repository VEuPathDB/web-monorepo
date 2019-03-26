import { StateObservable } from 'redux-observable';
import {
  requestUpdateBasket,
  fulfillUpdateBasket,
  requestAddStepToBasket,
  fulfillAddStepToBasket,
} from 'wdk-client/Actions/BasketActions';
import { InferAction } from 'wdk-client/Utils/ActionCreatorUtils';

import { Action } from 'wdk-client/Actions';
import { EpicDependencies } from 'wdk-client/Core/Store';

import {
  concatMapRequestActionsToEpic as crate
} from 'wdk-client/Utils/ActionCreatorUtils';
import { combineEpics } from 'redux-observable';
import { RootState } from 'wdk-client/Core/State/Types';

export const key = 'basket';

export type State = {};

const initialState: State = {};

export function reduce(state: State = initialState, action: Action): State {
  return state;
}

async function getFulfillUpdateBasket(
  [requestAction]: [InferAction<typeof requestUpdateBasket>],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<InferAction<typeof fulfillUpdateBasket>> {
  let payload = requestAction.payload;
  await wdkService.updateBasketStatus(
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

async function getFulfillAddStepToBasket(
  [requestAction]: [InferAction<typeof requestAddStepToBasket>],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
) {
  const step = await wdkService.findStep(requestAction.payload.stepId);
  await wdkService.updateBasketStatus(
    'addFromStepId',
    step.recordClassName,
    step.id
  );
  return fulfillAddStepToBasket(step.id);
}

export const observe = combineEpics(
  crate([requestUpdateBasket], getFulfillUpdateBasket,
    // Always request basket update requests
    { areActionsNew: () => true }),
  crate([requestAddStepToBasket], getFulfillAddStepToBasket,
    { areActionsNew: () => true })
);
