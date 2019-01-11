import { requestUpdateBasket, fulfillUpdateBasket} from 'wdk-client/Actions/BasketActions';
import { InferAction } from 'wdk-client/Utils/ActionCreatorUtils';

import { Action } from 'wdk-client/Actions';
import { EpicDependencies } from 'wdk-client/Core/Store';

import { Observable } from 'rxjs';
import {mapRequestActionsToEpic} from 'wdk-client/Utils/ActionCreatorUtils';
import { combineEpics} from 'redux-observable';

export const key = 'basket';

export type State = {
};

const initialState: State = {
};

export function reduce(state: State = initialState, action: Action): State {
    return state;
}

async function getFulfillUpdateBasket([requestAction]:  [InferAction<typeof requestUpdateBasket>], state$: Observable<State>, { wdkService }: EpicDependencies) : Promise<InferAction<typeof fulfillUpdateBasket>> {
    let payload = requestAction.payload;
    await wdkService.updateBasketStatus(payload.operation, payload.recordClassName, payload.primaryKeys);
    return fulfillUpdateBasket(payload.operation, payload.recordClassName, payload.primaryKeys);
}

export const observe =
     combineEpics(
         mapRequestActionsToEpic([requestUpdateBasket], getFulfillUpdateBasket)
     );
